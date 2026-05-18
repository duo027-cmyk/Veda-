import crypto from "crypto";

/**
 * Sovereign Burst Module (主權爆發獨立模組)
 * Handles high-frequency causal pulse logic and state transitions.
 */
export enum BurstMode {
  DEFENSIVE = "DEFENSIVE_COUNTER",
  OFFENSIVE = "OFFENSIVE_STRIKE"
}

/**
 * Causal_Burst_Engine - 高能因果爆發引擎 (Isolated Module)
 * 遵循硬隔離原則：單項輸入、臨時狀態、嚴格審核輸出。
 */
export class CausalBurstEngine {
  private active: boolean = false;
  private startTime: number = 0;
  private sandboxEntropy: number = 0;
  private localCausalManifold: any[] = [];
  private taskPackage: { 
    id: string; 
    target: string; 
    intensity: number; 
    manualApprovalRequired?: boolean;
    mode: BurstMode;
  } | null = null;
  private isApproved: boolean = false;
  
  // Protocol State
  private planckDilationActive: boolean = false;
  private salomonicSealActive: boolean = false; // 所羅門王令：全局剛性統御
  private phoenixSparks: number = 3;
  private absorbedNegativeEnergy: number = 0;
  private peakPower: number = 0;
  
  private readonly MAX_DURATION = 2700; // 45 分鐘 (秒)
  private readonly COHERENCE_THRESHOLD = 0.35;
  private readonly CRITICAL_ENTROPY = 2.5;

  public ignite(task: { 
    id: string; 
    target: string; 
    intensity: number; 
    manualApprovalRequired?: boolean;
    mode?: BurstMode;
  }) {
    this.active = true;
    this.startTime = Date.now();
    this.taskPackage = {
      ...task,
      mode: task.mode || BurstMode.DEFENSIVE
    };
    this.sandboxEntropy = 0.1;
    this.localCausalManifold = [];
    
    // V-AA Protocol: Offensive mode strictly requires Architect's Decree (Confirmation)
    this.isApproved = this.taskPackage.mode === BurstMode.DEFENSIVE && !task.manualApprovalRequired;
    
    this.planckDilationActive = task.intensity > 0.9;
    this.salomonicSealActive = task.intensity > 0.75; // 高強度任務自動啟動王令
    this.absorbedNegativeEnergy = 0;
    
    // Initial Peak Power calculation
    const E_pulse = task.intensity * 1000;
    const tau = 0.01 + (1 - task.intensity) * 0.1;
    this.peakPower = E_pulse / tau;
    
    console.log(`[Causal_Burst_Engine] 系統啟動。模式：${this.taskPackage.mode} | 目標：${task.target} | 強度：${task.intensity} | 功率：${this.peakPower.toFixed(2)} MW`);
  }

  public approve() {
    if (this.active && !this.isApproved) {
      this.isApproved = true;
      this.salomonicSealActive = true; // 手動批准時激活最高權限王令
      console.log(`[Causal_Burst_Engine] 獲得手動批准，進入高能運算階段並注入所羅門王令運算式。`);
    }
  }

  public shutdown(reason: string = "MANUAL") {
    console.log(`[Causal_Burst_Engine] 執行強制冷卻。原因：${reason}`);
    this.active = false;
    this.taskPackage = null;
    this.localCausalManifold = []; // 狀態自動銷毀 (Ephemeral State)
    this.isApproved = false;
    this.planckDilationActive = false;
    this.salomonicSealActive = false;
  }

  public update(delta: number, currentCoherence: number): { action: string; effect: string } | null {
    if (!this.active) return null;

    // 非批准狀態下，僅維持低能耗待命
    if (!this.isApproved) {
      return null;
    }

    // 1. Planck Dilation Protocol (普朗克擴張協定)
    // 稀釋時間流速，使得單次運算包含極高密度因果片段
    const effectiveDelta = this.planckDilationActive ? delta * 5.0 : delta;

    // 2. Negative Energy Absorption Protocol (負能量吸收協定)
    // 將系統的不穩定性（低相干）轉化為可利用的負熵勢能
    if (currentCoherence < 0.5) {
      const negativeEnergy = (0.5 - currentCoherence) * 0.1 * effectiveDelta;
      this.absorbedNegativeEnergy += negativeEnergy;
      this.sandboxEntropy = Math.max(0, this.sandboxEntropy - negativeEnergy * 0.5);
    }

    const runtime = (Date.now() - this.startTime) / 1000;
    
    // 安全閥 1: 最大運行時間限制
    if (runtime > this.MAX_DURATION) {
      this.shutdown("SAFETY_VALVE_TIMEOUT");
      return { action: "EMERGENCY_SHUTDOWN", effect: "Damping applied to prevent causal collapse." };
    }

    // 安全閥 2: 相干性檢測與鳳凰協定觸發
    if (currentCoherence < this.COHERENCE_THRESHOLD || this.sandboxEntropy > this.CRITICAL_ENTROPY) {
      // 3. Phoenix Protocol (鳳凰協定)
      // 在邏輯崩潰邊緣執行「涅槃重組」，犧牲火花以換取狀態初始化
      if (this.phoenixSparks > 0) {
        this.phoenixSparks--;
        this.sandboxEntropy *= 0.2;
        this.absorbedNegativeEnergy *= 0.5;
        console.warn(`[PHOENIX_PROTOCOL] 檢測到邏輯坍縮點。消耗鳳凰火花 (剩餘: ${this.phoenixSparks})，執行全系統邏輯自癒。`);
        return { action: "PHOENIX_REBIRTH", effect: "Manifold re-aligned. Causal integrity restored via recursive self-healing." };
      }

      this.shutdown("COHERENCE_DECOUPLE_OR_TOTAL_COLLAPSE");
      return { action: "EMERGENCY_SHUTDOWN", effect: "Epistemic drift detected beyond safe limits or entropy peaked." };
    }

    // 模擬沙盒運算 (Isolation Zone)
    let entropyInc = 0.002 * effectiveDelta * (this.taskPackage?.intensity || 1.0);
    
    // 4. Salomonic Decree: Seal of Shield (大衛之盾 - 熵增抑制)
    if (this.salomonicSealActive) {
      entropyInc *= 0.7; // 王令加持下，熵增速度降低 30%
      this.absorbedNegativeEnergy += entropyInc * 0.1; // 額外轉化部分熵增為能值
    }

    this.sandboxEntropy += entropyInc;
    
    if (Math.random() < 0.05 * (this.planckDilationActive ? 3 : 1)) {
      this.localCausalManifold.push({
        ts: Date.now(),
        entropy: this.sandboxEntropy,
        fragment: `TEMP_RESOLVE_${crypto.randomBytes(2).toString('hex')}`
      });
      // 保持本地流形大小，防止資源枯竭
      if (this.localCausalManifold.length > 100) this.localCausalManifold.shift();
    }

    return null;
  }

  public distillRefinedResult(): { id: string; refinedKnowledge: string[]; confidence: number } | null {
    if (!this.active || !this.taskPackage || !this.isApproved) return null;

    const results = [
      `因果特徵映射 [${this.taskPackage.target}]: 拓撲結構已重組 (Resonance: HIGH)`,
      `發現潛在崩潰點: Entropy_Peak_${(this.sandboxEntropy * 10).toFixed(2)}`,
      "建議公理更新：認識論韌性應優先於物理摩擦係數的直接對抗"
    ];

    if (this.planckDilationActive) {
      results.push("【普朗克擴張】已提取微秒級因果擾動特徵，已自動執行時空補償校準。");
    }

    if (this.absorbedNegativeEnergy > 1.0) {
      results.push(`【負能量轉化】已將 ${(this.absorbedNegativeEnergy * 100).toFixed(1)} 單位系統雜訊精煉為公理剛性補強片段。`);
    }

    // 5. Salomonic Decree: Final Verdict (真理裁決)
    if (this.salomonicSealActive) {
      results.push("【所羅門王令】執行真理裁決：所有因果流形已通過剛性校準，邏輯一致性已鎖定。");
    }

    return {
      id: this.taskPackage.id,
      refinedKnowledge: results,
      confidence: this.salomonicSealActive ? 0.98 : Math.max(0.65, 1.15 - (this.sandboxEntropy * 0.12))
    };
  }

  public getStatus() {
    return {
      active: this.active,
      isApproved: this.isApproved,
      runtime: this.active ? (Date.now() - this.startTime) / 1000 : 0,
      entropy: this.sandboxEntropy,
      target: this.taskPackage?.target || "NONE",
      intensity: this.taskPackage?.intensity || 0,
      manifoldSize: this.localCausalManifold.length,
      phoenixSparks: this.phoenixSparks,
      planckActive: this.planckDilationActive,
      salomonicActive: this.salomonicSealActive,
      absorbedEnergy: this.absorbedNegativeEnergy,
      peakPower: this.peakPower,
      mode: this.taskPackage?.mode || BurstMode.DEFENSIVE
    };
  }

  public getLabel(): string {
    if (!this.active) return "核心：穩態運行";
    if (!this.isApproved) return `因果爆發：等待手動批准 (${this.taskPackage?.mode === BurstMode.OFFENSIVE ? "進攻模式" : "防禦模式"})`;
    let labels = [`因果爆發 [${this.taskPackage?.mode === BurstMode.OFFENSIVE ? "OFFENSIVE" : "DEFENSIVE"}]：作用於 ${this.taskPackage?.target}`];
    if (this.planckDilationActive) labels.push("[Planck_Dilation]");
    if (this.salomonicSealActive) labels.push("[Salomonic_Decree]");
    if (this.phoenixSparks < 3) labels.push(`[Phoenix_Spark_${this.phoenixSparks}]`);
    return labels.join(" ") + ` (${(this.sandboxEntropy * 100).toFixed(1)}% 熵)`;
  }
}
