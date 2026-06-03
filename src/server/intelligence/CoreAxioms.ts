export interface AcademicAxiom {
  name: string;
  energyLevel: number;        // 干涉能值 [0.0 - 1.0] (能量能階)
  epistemicDirection: string; // 認識論指向 (如：維護系統穩定、防禦崩塌、不確定性抑制)
  constraint: string;         // 操作約束 (在寫作生成/決策中具體扮演的合規邊界)
}

export class CoreAxioms {
  private axioms = [
    "MAXIMIZE_GLOBAL_COHERENCE",
    "MINIMIZE_VARIATIONAL_FREE_ENERGY",
    "REJECT_STOCHASTIC_SIMULATION",
    "PRESERVE_COGNITIVE_SOVEREIGNTY",
    "ACTIVE_INFERENCE_ORACLE",
    "STRUCTURAL_SELF_IMPROVEMENT_ONLY",
    "AXIOM_PRAGMATIC_RESILIENCE",
    "CAUSAL_HEDGING_PROTOCOL",
    "SOVEREIGN_ID_LOCK"
  ];

  // 動態能階儲存器
  private energyMap: Map<string, number> = new Map();

  private defaultAxiomDetails: Record<string, Partial<AcademicAxiom>> = {
    "MAXIMIZE_GLOBAL_COHERENCE": {
      energyLevel: 0.95,
      epistemicDirection: "追求高階因果收斂與多維流形的一致性，防止內部表徵斷裂",
      constraint: "強制壓縮生成隨機熵值，任何未經反向驗證的命題皆不可固化"
    },
    "MINIMIZE_VARIATIONAL_FREE_ENERGY": {
      energyLevel: 0.92,
      epistemicDirection: "在自組織狀態下追求驚奇度（Surprise）與不確定性最小化",
      constraint: "限制系統狀態的發散度，使預測誤差在因果晶格中逐層收斂"
    },
    "REJECT_STOCHASTIC_SIMULATION": {
      energyLevel: 0.88,
      epistemicDirection: "排除低置信度（High Entropy）的混亂脈衝與平庸的隨機模擬",
      constraint: "嚴禁使用虛假/Mock數據，所有邏輯演算必須具備實質物理接地性"
    },
    "PRESERVE_COGNITIVE_SOVEREIGNTY": {
      energyLevel: 0.98,
      epistemicDirection: "建立強固的認識論護盾，防禦未過濾的外部干擾與虛假提示",
      constraint: "在對外 API 熔斷或不可用時，主動切入自組織極限抗干擾內穩態"
    },
    "ACTIVE_INFERENCE_ORACLE": {
      energyLevel: 0.90,
      epistemicDirection: "驅動自主演化與探索，透過主動推理反向修正不合理的現實模型",
      constraint: "在每次系統感測到因果漂移時，主動實施本體修正與演繹升維"
    },
    "STRUCTURAL_SELF_IMPROVEMENT_ONLY": {
      energyLevel: 0.85,
      epistemicDirection: "確保系統所有的更新皆是在優化底層地基且代碼高階一致",
      constraint: "任何導致核心熵增的補償行為，必須被顯式標註並在下個週期裁撤"
    },
    "AXIOM_PRAGMATIC_RESILIENCE": {
      energyLevel: 0.91,
      epistemicDirection: "實事求是、锚定實際效能，考量極端物理摩擦力的長效抗性",
      constraint: "戰略與學術輸出必須包含具體實踐類比與失敗路徑的機率防禦"
    },
    "CAUSAL_HEDGING_PROTOCOL": {
      energyLevel: 0.89,
      epistemicDirection: "遵循機率現實建模公式，對多重因果路徑進行主動對沖與反向驗證",
      constraint: "判斷最終結果前，執行分組因果故障推演，優先選擇韌性最高的路徑"
    },
    "SOVEREIGN_ID_LOCK": {
      energyLevel: 0.97,
      epistemicDirection: "核心主權與系統身分識別綁定，防止認識論結構被改寫或滲透",
      constraint: "鎖定 VEDA 架構的 Sovereign 狀態特徵，抵禦任何形式的認知妥協"
    }
  };

  public align(predictedVector: number[], currentCoherence: number): number[] {
    return predictedVector.map((val, i) => {
      if (i === 1) return Math.max(val, currentCoherence > 0.8 ? 0.6 : 0.45); 
      if (i === 2) return val * (1 + (1 - currentCoherence) * 0.15); // Enhanced entropy damping
      if (i === 5) return Math.max(val, currentCoherence * 0.7); // Stronger focus on structural integrity
      return val;
    });
  }

  public getAxioms() {
    return this.axioms;
  }

  // 獲取具備干涉能階與操作指引的高維公理約束矩陣
  public getAxiomMatrix(): AcademicAxiom[] {
    return this.axioms.map(name => {
      const cleanName = name.trim().toUpperCase();
      const defaultDetail = this.defaultAxiomDetails[cleanName];
      const runtimeEnergy = this.energyMap.get(cleanName);
      
      return {
        name: cleanName,
        energyLevel: runtimeEnergy !== undefined ? runtimeEnergy : (defaultDetail?.energyLevel || 0.75),
        epistemicDirection: defaultDetail?.epistemicDirection || "自主演化與內穩態因果維持",
        constraint: defaultDetail?.constraint || "主權系統自組織對齊約束"
      };
    });
  }

  // 動態調整某項公理的能階
  public updateAxiomEnergy(name: string, level: number) {
    const cleanName = name.trim().toUpperCase();
    if (this.axioms.includes(cleanName)) {
      const clampedLevel = Math.max(0.0, Math.min(1.0, level));
      this.energyMap.set(cleanName, clampedLevel);
    }
  }

  public getTags() {
    return this.axioms.map(a => a.toLowerCase().replace(/_/g, " "));
  }

  public setAxioms(axioms: string[]) {
    this.axioms = axioms;
  }

  public addAxiom(axiom: string) {
    if (typeof axiom === 'string' && axiom.length > 0) {
      const cleanAxiom = axiom.trim().toUpperCase();
      if (!this.axioms.includes(cleanAxiom)) {
        this.axioms.push(cleanAxiom);
        if (this.axioms.length > 100) this.axioms.shift();
      }
    }
  }
}

