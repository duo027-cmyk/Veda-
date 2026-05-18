import { MineralLatticeComputeArray, LatticeJob } from "../lattice";
import { StrategicLayer } from "./StrategicLayer";
import { KnowledgeManifest } from "./KnowledgeManifest";
import { GoogleGenAI } from "@google/genai";
import crypto from "crypto";

export class LatticeExecutionManager {
  constructor(
    private latticeComputeArray: MineralLatticeComputeArray,
    private strategic: StrategicLayer,
    private manifest: KnowledgeManifest,
    private ai: any,
    private callbacks: {
      neuralLog: (type: string, msg: string, data?: any) => void;
      triggerResonance: (intensity: number) => void;
      saveState: () => Promise<void>;
      updateState: (state: number[]) => void;
      getState: () => number[];
      getGlobalCoherence: () => number;
    }
  ) {}

  public async processLatticeJobs() {
    const activeJobs = this.latticeComputeArray.getActiveJobs();
    
    if (activeJobs.length === 0) {
      await this.recoverStalledReports(activeJobs);
    }

    for (const job of activeJobs) {
      if (job.status === 'PENDING' && this.latticeComputeArray.canExecute()) {
        this.latticeComputeArray.setExecuting(job.id);
        this.executeLatticeTask(job).catch((err) => {
          this.callbacks.neuralLog('LATTICE_FAULT', `Task ${job.id} failed: ${err.message}`);
          this.latticeComputeArray.updateJob(job.id, { status: 'FAILED' });
        });
      }
    }
  }

  private async recoverStalledReports(activeJobs: any[]) {
    for (const report of this.strategic.getReports()) {
      if (report.status === 'SYNTHESIZING') {
        const nextPending = report.outline.find(s => 
          s.status === 'PENDING' || 
          (s.status === 'GENERATING' && !activeJobs.some(j => j.type === 'REPORT_SECTION_SYNTHESIS' && j.payload.sectionId === s.id))
        );
        
        if (nextPending) {
          this.callbacks.neuralLog("SYSTEM_RECOVERY", `偵測到掛起的報告或空轉章節 [${report.id} / ${nextPending.id}]，正在重啟合成序列...`);
          // This should ideally trigger an action, for now we let it be handled by the next tick or manual trigger
        } else if (report.outline.every(s => s.status === 'DONE')) {
          report.status = 'COMPLETED';
          report.progress = 100;
          this.callbacks.neuralLog("SYSTEM", `報告 [${report.id}] 已自動標記為完成。`);
        }
      }
    }
  }

  private async executeLatticeTask(job: LatticeJob): Promise<void> {
    this.callbacks.neuralLog('LATTICE_COMPUTE', `晶格任務執行引爆：[${job.type}] ID: ${job.id}`);

    const isDegraded = !this.ai || (this.ai.apiKey === "DISABLED_KEY");

    try {
      if (['STRATEGIC_OUTLINE', 'REPORT_SECTION_SYNTHESIS', 'CAUSAL_EVOLUTION_REPORT'].includes(job.type)) {
        if (isDegraded) {
          return this.executeAutonomousFallback(job);
        }

        const prompt = job.type === 'CAUSAL_EVOLUTION_REPORT' && !job.payload.prompt 
          ? this.generateEvolutionPrompt(job.payload) 
          : job.payload.prompt;

        const result = await this.ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt
        });
        const content = result.text || "";
        
        let parsedResult = content;
        if (job.type === 'STRATEGIC_OUTLINE') {
          parsedResult = this.extractJsonFromResponse(content);
        }

        await this.solidifyLatticeJob({ jobId: job.id, result: parsedResult, coherence: 0.98 });
      }
    } catch (err: any) {
      this.callbacks.neuralLog('LATTICE_FAULT', `Lattice execution error: ${err.message}`);
      this.latticeComputeArray.updateJob(job.id, { status: 'FAILED' });
    }
  }

  private extractJsonFromResponse(content: string): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : content;
    } catch (e) {
      return content;
    }
  }

  private generateEvolutionPrompt(payload: any): string {
    return `你是一個高級戰略分析師與認識論專家。
    正在對 VEDA 系統的一次演化事件進行「深度研判」。
    事件描述：${payload.event}
    系統版本：v${payload.version}
    演化數據：${JSON.stringify(payload.snapshot)}
    要求：1. 撰寫深度學術風格報告。2. 分析長期影響。3. 500-1000 字。`;
  }

  public async solidifyLatticeJob(params: { jobId: string, result: any, coherence?: number }) {
    const { jobId, result, coherence = 0.95 } = params;
    const job = this.latticeComputeArray.getJob(jobId);
    if (!job) throw new Error("JOB_NOT_FOUND");

    this.callbacks.neuralLog("LATTICE_SOLIDIFIED", `收悉晶格固化回傳：${jobId}`);

    await this.calculateCausalBackpropagation(jobId, result, coherence);

    if (job.type === "STRATEGIC_OUTLINE") {
       const { reportId, title } = job.payload;
       const report = this.strategic.getReports().find(r => r.id === reportId || r.title === title);
       if (report) {
         report.outline = (result.outline || []).map((s: any, i: number) => ({
           id: `SEC_${crypto.randomBytes(2).toString('hex').toUpperCase()}_${i}`,
           title: s.title || "Untitled Section",
           guideline: s.guideline || "",
           content: "",
           status: 'PENDING'
         }));
         report.axioms = result.axioms || [];
         report.status = 'READY';
         report.updatedAt = Date.now();
         await this.callbacks.saveState();
       }
    } else if (job.type === "REPORT_SECTION_SYNTHESIS") {
       const { reportId, sectionId } = job.payload;
       const report = this.strategic.getReportById(reportId);
       if (report) {
         const section = report.outline.find(s => s.id === sectionId);
         if (section) {
           section.content = result;
           section.status = 'DONE';
           const doneSections = report.outline.filter(s => s.status === 'DONE').length;
           report.progress = (doneSections / report.outline.length) * 100;
           if (report.progress >= 100) {
             report.status = 'COMPLETED';
           }
           report.updatedAt = Date.now();
           await this.callbacks.saveState();
         }
       }
    }

    this.latticeComputeArray.updateJob(jobId, { 
      status: 'SOLIDIFIED', 
      result, 
      coherence 
    });

    return { success: true, jobId };
  }

  private async calculateCausalBackpropagation(jobId: string, result: any, coherence: number): Promise<void> {
    const state = this.callbacks.getState();
    if (coherence < 0.6) {
      const logicDrift = (0.6 - coherence) * 2;
      state[2] = Math.min(1.0, state[2] + logicDrift * 0.5);
      state[1] = Math.max(0, state[1] - logicDrift * 0.3);
      this.callbacks.updateState(state);
    }
    this.manifest.updateEpistemic(coherence);
  }

  private async executeAutonomousFallback(job: LatticeJob): Promise<void> {
    const coherence = this.callbacks.getGlobalCoherence();
    let result: any = "[VEDA_CAUSAL_ERROR]: 偵測到外部認識論鏈路斷開。";
    if (job.type === 'STRATEGIC_OUTLINE') {
      result = { title: "FALLBACK", summary: result, outline: [], status: 'FAILED' };
    }
    await this.solidifyLatticeJob({ jobId: job.id, result, coherence: coherence * 0.5 });
  }
}
