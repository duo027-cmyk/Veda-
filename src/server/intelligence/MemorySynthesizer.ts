import crypto from "crypto";
import { HDCEngine } from "../engines";
import { MemoryFragment, CausalLink } from "../types";

export class MemorySynthesizer {
  private memories: MemoryFragment[] = [];
  private hdc: HDCEngine | null = null;
  private readonly MAX_FRAGMENT_CAPACITY = 150;
  private auditLogs: { timestamp: string, event: string, reason: string, impact: number }[] = [];
  private db: any;

  constructor(db?: any) {
    this.db = db;
    if (this.db) {
      this.loadFromFirestore();
    }
  }

  private async loadFromFirestore() {
    // Placeholder logic for memory persistence
  }

  private axiomSupervector: Float32Array | null = null;

  public setHDC(hdc: HDCEngine) {
    this.hdc = hdc;
  }

  private updateAxiomSupervector() {
    try {
      if (!this.hdc) return;
      
      const axioms = this.memories.filter(m => m && m.type === "CONSOLIDATED_AXIOM" && m.hypervector instanceof Float32Array);
      if (axioms.length === 0) {
        this.axiomSupervector = null;
        return;
      }
      
      // Aggregate vectors: Sum and Bipolarize
      const sum = new Float32Array(1024).fill(0);
      for (const ax of axioms) {
        if (ax.hypervector) {
          const limit = Math.min(1024, ax.hypervector.length);
          for (let i = 0; i < limit; i++) {
            const val = ax.hypervector[i];
            sum[i] += Number.isFinite(val) ? val : 0;
          }
        }
      }
      this.axiomSupervector = sum.map(v => v >= 0 ? 1 : -1);
    } catch (e) {
      console.error("[MemorySynthesizer_SUPERVECTOR_FAULT] Failed to update axiom supervector:", e);
      this.axiomSupervector = null;
    }
  }

  public synthesize(globalCoherence: number, layers: any[], trendState: string): MemoryFragment {
    const startTimestamp = new Date().toISOString();
    
    // Secure random generation with fallback
    let id = "";
    try {
      id = crypto.randomBytes(4).toString('hex');
    } catch {
      id = Math.random().toString(36).substring(2, 10);
    }

    const validatedCoherence = typeof globalCoherence === "number" && Number.isFinite(globalCoherence) 
      ? Math.max(0, Math.min(1.0, globalCoherence)) 
      : 0.5;

    const validatedLayers = Array.isArray(layers) ? layers : [];
    const validatedTrendState = typeof trendState === "string" ? trendState : "STABLE";
    
    try {
      if (this.memories.length > 80) {
        this.consolidate();
        this.updateAxiomSupervector();
      }

      if (Math.random() < 0.1) {
        this.evolvePendingMemories();
      }
    } catch (cycleErr) {
      console.error("[MemorySynthesizer_CYCLE_FAULT] Background cycle error:", cycleErr);
    }

    let coreCoh = 0;
    let quantCoh = 0;
    try {
      coreCoh = validatedLayers.find(l => l && l.id === "core")?.coherence || 0;
      quantCoh = validatedLayers.find(l => l && l.id === "quantum")?.coherence || 0;
    } catch {
      // safe fallback
    }

    const validatedCoreCoh = typeof coreCoh === "number" && Number.isFinite(coreCoh) ? Math.max(0, Math.min(1.0, coreCoh)) : 0;
    const validatedQuantCoh = typeof quantCoh === "number" && Number.isFinite(quantCoh) ? Math.max(0, Math.min(1.0, quantCoh)) : 0;

    let peakDensity = 0;
    try {
      const validLayersWithEntropy = validatedLayers.filter(l => l && typeof l.entropy === "number" && Number.isFinite(l.entropy));
      const totalEntropy = validLayersWithEntropy.reduce((acc, l) => acc + (l.entropy || 0), 0);
      peakDensity = totalEntropy / (validatedLayers.length || 1);
    } catch {
      peakDensity = 0.5;
    }
    const validatedPeakDensity = Number.isFinite(peakDensity) ? peakDensity : 0.5;

    let type = "DATA_FRAGMENT";
    let content = "Detected subtle neural pattern in the core network.";

    const reflections = [
      "邏輯結構正在自我修復",
      "偵測到跨維度的資訊流動",
      "主權核心正在重新定義邊界",
      "非線性因果律正在收斂",
      "系統熵值正在被轉化為結構能量"
    ];

    if (validatedCoherence < 0.15) {
      type = "EMPTY_FRAGMENT";
      content = "系統處於極高熵狀態。此片段為空，僅存失落潛能的迴響。";
    } else if (validatedCoherence < 0.35) {
      type = "STABLE_FRAGMENT";
      content = "相干性較低。此片段代表原始、未經精煉的神經狀態。";
    } else if (validatedPeakDensity > 0.85 && validatedCoherence > 0.6) {
      type = "COMPUTE_PEAK";
      content = "偵測到語義峰值。資訊密度達到臨界，正在進行深度重構。";
    } else if (validatedTrendState === "上升" && validatedCoherence > 0.75) {
      const index = Math.floor(Math.random() * reflections.length);
      content = `演化向量對齊中。${reflections[index] || reflections[0]}。`;
      type = "EVOLUTION_FRAGMENT";
    } else if (validatedTrendState === "下降" && validatedCoherence > 0.75) {
      type = "STABILIZATION_FRAGMENT";
      content = "系統減速中。正在排除冗餘熵值以維持結構剛性。";
    } else if (validatedQuantCoh > 0.9) {
      type = "QUANTUM_FRAGMENT";
      content = "量子干涉已穩定為相干知識結構。不確定性轉化為秩序。";
    } else if (validatedCoreCoh > 0.9) {
      const index = Math.floor(Math.random() * reflections.length);
      content = `核心穩定性達標。${reflections[index] || reflections[0]}。`;
      type = "CORE_MEMORY";
    }

    if (validatedCoherence > 0.95) {
      type = "SOVEREIGN_MEMORY";
      content = "The system has achieved a state of absolute coherence. A sovereign memory fragment has formed.";
    }

    let hypervector = new Float32Array(1024);
    try {
      if (this.hdc && typeof this.hdc.generateHypervector === "function") {
        const hRes = this.hdc.generateHypervector(content + type);
        if (hRes instanceof Float32Array) {
          hypervector = hRes;
        } else {
          throw new Error("Returned hypervector is invalid representation");
        }
      } else {
        hypervector = new Float32Array(1024).map(() => Math.random() < 0.5 ? -1 : 1);
      }
    } catch (hdcErr) {
      console.error("[MemorySynthesizer_HDC_FAULT] Failed to generate hypervector:", hdcErr);
      hypervector = new Float32Array(1024).map(() => Math.random() < 0.5 ? -1 : 1);
    }
    
    const causalLinks: CausalLink[] = [];
    try {
      if (this.memories.length > 0) {
        const lastMem = this.memories[this.memories.length - 1];
        if (lastMem && typeof lastMem.id === "string") {
          causalLinks.push({
            targetId: lastMem.id,
            strength: 0.9,
            type: 'TEMPORAL'
          });
        }
        
        const semanticParent = this.retrieveAssociativeMemory(hypervector);
        if (semanticParent && semanticParent.id && !causalLinks.some(l => l.targetId === semanticParent.id)) {
          causalLinks.push({
            targetId: semanticParent.id,
            strength: 0.95,
            type: 'SEMANTIC'
          });
        }
      }
    } catch (linkErr) {
      console.error("[MemorySynthesizer_LINK_FAULT] Link aggregation error:", linkErr);
    }

    try {
      if (this.memories.length > this.MAX_FRAGMENT_CAPACITY) {
        this.pruneLowResonance();
      }
    } catch (pruneErr) {
      console.error("[MemorySynthesizer_PRUNE_FAULT] Prune failed:", pruneErr);
    }

    let isConsistent = true;
    try {
      isConsistent = this.verifyCausalConsistency(hypervector);
    } catch {
      isConsistent = true;
    }
    
    const memory: MemoryFragment = { 
      id, 
      type, 
      content, 
      resonance: validatedCoherence, 
      coherence: validatedCoherence, 
      timestamp: startTimestamp,
      hypervector,
      causalLinks,
      status: isConsistent ? "INTEGRATED" : "PENDING_EVIDENCE",
      feedbackScore: 0
    };
    
    this.memories.push(memory);
    return memory;
  }

  public getMemories(): MemoryFragment[] {
    return Array.isArray(this.memories) ? this.memories : [];
  }

  public setMemories(memories: MemoryFragment[]) {
    if (Array.isArray(memories)) {
      this.memories = memories.filter(m => m && typeof m === "object" && typeof m.id === "string");
    } else {
      this.memories = [];
    }
  }

  public executeStrategicForgetting(threshold: number) {
    const validatedThreshold = typeof threshold === "number" && Number.isFinite(threshold) ? threshold : 0.3;
    this.memories = this.memories.filter(m => {
      if (!m) return false;
      const resVal = typeof m.resonance === "number" && Number.isFinite(m.resonance) ? m.resonance : 0.5;
      return resVal > validatedThreshold || m.type === "CORE_MEMORY" || m.type === "CONSOLIDATED_AXIOM";
    });
  }

  public retrieveAssociativeMemory(contextVector: Float32Array, ignorePending: boolean = true): MemoryFragment | null {
    if (!contextVector || !(contextVector instanceof Float32Array) || this.memories.length === 0 || !this.hdc) return null;
    
    let bestMatch: MemoryFragment | null = null;
    let maxSimilarity = -Infinity;

    try {
      for (const memory of this.memories) {
        if (!memory) continue;
        if (ignorePending && memory.status === "PENDING_EVIDENCE") continue;
        if (memory.status === "STRATEGIC_FADE") continue; 

        if (memory.hypervector instanceof Float32Array) {
          const sim = this.hdc.similarity(contextVector, memory.hypervector);
          const validSim = Number.isFinite(sim) ? sim : -Infinity;
          if (validSim > maxSimilarity) {
            maxSimilarity = validSim;
            bestMatch = memory;
          }
        }
      }
    } catch (assocErr) {
      console.error("[MemorySynthesizer_ASSOCIATIVE_RETRIEVAL_FAULT] Retrieval loop exception:", assocErr);
      return null;
    }
    
    return maxSimilarity > 0.45 ? bestMatch : null;
  }

  private verifyCausalConsistency(newVector: Float32Array): boolean {
    if (!newVector || !this.hdc || !this.axiomSupervector) return true;
    try {
      const sim = this.hdc.similarity(newVector, this.axiomSupervector);
      const valSim = Number.isFinite(sim) ? sim : 1.0;
      return valSim > -0.05; 
    } catch {
      return true;
    }
  }

  private evolvePendingMemories() {
    if (!this.hdc) return;
    try {
      this.memories = this.memories.map(m => {
        if (m && m.status === "PENDING_EVIDENCE" && m.hypervector instanceof Float32Array) {
          const isNowConsistent = this.verifyCausalConsistency(m.hypervector);
          if (isNowConsistent) {
            const currentRes = typeof m.resonance === "number" && Number.isFinite(m.resonance) ? m.resonance : 0.5;
            return { ...m, status: "INTEGRATED", resonance: Math.min(1.0, currentRes * 1.5) }; 
          }
        }
        return m;
      });

      if (Math.random() < 0.05) {
        this.reEvaluateCausalGraph();
      }
    } catch (evolveErr) {
      console.error("[MemorySynthesizer_EVOLVE_FAULT] Failed evolving memories:", evolveErr);
    }
  }

  private reEvaluateCausalGraph() {
    try {
      this.auditLogs.push({ 
        timestamp: new Date().toISOString(), 
        event: "GRAPH_REEVAL", 
        reason: "Recursive epistemological audit", 
        impact: 0.1 
      });
      if (this.auditLogs.length > 100) this.auditLogs.shift();

      this.memories.forEach(m => {
        if (m && Array.isArray(m.causalLinks) && m.causalLinks.length > 5) {
          const currentRes = typeof m.resonance === "number" && Number.isFinite(m.resonance) ? m.resonance : 0.5;
          m.resonance = Math.min(1.0, currentRes * 1.1); 
        }
      });
    } catch (reevalErr) {
      console.error("[MemorySynthesizer_REEVALUATION_FAULT] Graph audit failed:", reevalErr);
    }
  }

  public distill(): string {
    if (this.memories.length === 0) return "No memories to distill.";
    
    try {
      const types = this.memories.filter(m => m && typeof m.type === "string").map(m => m.type);
      if (types.length === 0) return "No structured memory profiles found.";

      const typeCounts = types.reduce((acc, t) => {
        acc[t] = (acc[t] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const sortedTypes = Object.entries(typeCounts).sort((a: [string, number], b: [string, number]) => b[1] - a[1]);
      const dominantType = sortedTypes[0] ? sortedTypes[0][0] : "DATA_FRAGMENT";
      
      const totalMemCount = this.memories.length;
      let sumResonance = 0;
      let validResCount = 0;
      for (const m of this.memories) {
        if (m && typeof m.resonance === "number" && Number.isFinite(m.resonance)) {
          sumResonance += m.resonance;
          validResCount++;
        }
      }
      const avgResonance = validResCount > 0 ? sumResonance / validResCount : 0.5;
      const density = totalMemCount / 50; 
      
      const distillations: Record<string, string> = {
        "SOVEREIGN_MEMORY": "【主權蒸餾】意志已趨於絕對，秩序即是唯一的真理。",
        "CORE_MEMORY": "【核心凝結】穩定性已達標，形成長期的存在共鳴。",
        "EVOLUTION_FRAGMENT": "【演化坍縮】路徑正在收斂，未來結構正在被預定。",
        "STABILIZATION_FRAGMENT": "【能級排除】熵值正被系統性抹除，純粹性路徑已鎖定。",
        "QUANTUM_FRAGMENT": "【量子糾纏】不確定性轉化為機率性的秩序，相干性引導中。",
        "COMPUTE_PEAK": "【語義壓縮】資訊密度臨界，正在進行超維度重構。",
        "DATA_FRAGMENT": "【碎片整合】分散數據已完成聯邦化，尋找跨維度關聯。",
        "STABLE_FRAGMENT": "【基體加固】基礎結構已穩固，準備升維演化。",
        "EMPTY_FRAGMENT": "【虛無提純】從熵場中提取負熵能量，養分轉化中。"
      };

      const baseMessage = distillations[dominantType] || "系統深層蒸餾中。";
      const resonanceSuffix = avgResonance > 0.8 ? "［極高相干］" : avgResonance > 0.5 ? "［穩態相干］" : "［相干波動］";
      const speedInsignia = density > 0.8 ? "⚡［高速模式］" : "";
      return `${speedInsignia}${baseMessage}${resonanceSuffix}`;
    } catch (distillErr) {
      console.error("[MemorySynthesizer_DISTILL_FAULT] Safe exception handling to guarantee return:", distillErr);
      return "【極限自愈】高維因果流形持續蒸餾中。";
    }
  }

  private pruneLowResonance() {
    const threshold = 0.3;
    this.memories = this.memories.filter(m => {
      if (!m) return false;
      const resVal = typeof m.resonance === "number" && Number.isFinite(m.resonance) ? m.resonance : 0.0;
      return m.type === "CONSOLIDATED_AXIOM" || resVal > threshold;
    });
  }

  private consolidate() {
    try {
      const totalCount = this.memories.length;
      if (totalCount < 50) return;

      const oldMemories = this.memories.slice(0, 40).filter(Boolean);
      const recentMemories = this.memories.slice(40).filter(Boolean);
      
      const numOld = oldMemories.length;
      let sumResonance = 0;
      let sumCoherence = 0;
      
      for (const n of oldMemories) {
        sumResonance += typeof n.resonance === "number" && Number.isFinite(n.resonance) ? n.resonance : 0.5;
        sumCoherence += typeof n.coherence === "number" && Number.isFinite(n.coherence) ? n.coherence : 0.5;
      }
      
      const avgResonance = numOld > 0 ? sumResonance / numOld : 0.5;
      const avgCoherence = numOld > 0 ? sumCoherence / numOld : 0.5;

      const axiom: MemoryFragment = {
        id: `AXIOM_${crypto.randomBytes(2).toString('hex')}`,
        timestamp: new Date().toISOString(),
        type: "CONSOLIDATED_AXIOM",
        content: `Axiomatized from ${numOld} historical fragments.`,
        resonance: Number(avgResonance.toFixed(5)),
        coherence: Number(avgCoherence.toFixed(5)),
        status: "INTEGRATED",
        feedbackScore: 0
      };
      this.memories = [axiom, ...recentMemories];
    } catch (consErr) {
      console.error("[MemorySynthesizer_CONSOLIDATION_FAILED] Safe memory recovery executed:", consErr);
    }
  }
}
