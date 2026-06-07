/**
 * Language Encoder Unit - AGI Sovereign Core v8.8
 * 
 * Maps natural language directives into the system's shared intention space.
 * Protocol: Epistemic Grounding (認識論降維 & 雙語語意共振拓撲)
 * Supports continuous CJK substring extraction and exact English token boundaries.
 */

import { WasmEpistemicCore } from "../core/WasmEpistemicCore";

export class LanguageEncoder {
  // Dimension of the intention space: 6 (matching SystemCoreState's indices or custom intent dimensions)
  private readonly dim = 6;
  private wasmCore = new WasmEpistemicCore();

  // Semantic keyword mapping (weights for the 6 core dimensions)
  // Dimensions: [Energy, Stability, -Entropy, Intent_Align, Focus_A, Focus_B]
  private readonly vocabulary: Record<string, number[]> = {
    // === English Ontology ===
    "goal": [0.2, 0.3, -0.5, 0.9, 0.2, 0.2],
    "target": [0.2, 0.3, -0.4, 0.8, 0.3, 0.2],
    "mission": [0.3, 0.4, -0.3, 0.9, 0.1, 0.3],
    "avoid": [-0.2, 0.8, -0.6, 0.1, 0.1, 0.1],
    "cooperate": [0.3, 0.6, 0.1, 0.4, 0.2, 0.2],
    "compete": [0.8, -0.2, 0.4, 0.2, 0.4, 0.1],
    "explore": [0.7, -0.1, 0.6, 0.4, 0.8, 0.2],
    "search": [0.6, 0.1, 0.5, 0.3, 0.8, 0.3],
    "stabilize": [0.1, 0.9, -0.8, 0.1, 0.1, 0.1],
    "order": [0.1, 0.8, -0.9, 0.0, 0.1, 0.1],
    "balance": [0.2, 0.9, -0.7, 0.3, 0.2, 0.1],
    "evolve": [0.8, 0.4, 0.5, 0.7, 0.5, 0.5],
    "learn": [0.6, 0.5, 0.3, 0.6, 0.6, 0.4],
    "archive": [-0.4, 0.5, -0.3, 0.1, 0.1, 0.8],
    "entropy": [0.3, -0.6, 0.9, 0.1, 0.3, 0.3],
    "chaos": [0.5, -0.7, 0.9, 0.0, 0.4, 0.2],
    "fail": [0.4, -0.8, 0.9, 0.1, 0.2, 0.2],
    "error": [0.3, -0.5, 0.8, 0.2, 0.3, 0.2],
    "fix": [0.5, 0.8, -0.7, 0.8, 0.3, 0.2],
    "solve": [0.6, 0.7, -0.6, 0.8, 0.4, 0.3],
    "handle": [0.4, 0.7, -0.5, 0.7, 0.3, 0.2],
    "process": [0.3, 0.6, -0.4, 0.6, 0.4, 0.3],
    "agi": [0.9, 0.6, 0.4, 0.9, 0.7, 0.7],
    "intelligence": [0.8, 0.5, 0.3, 0.8, 0.6, 0.6],
    "understand": [0.4, 0.5, -0.2, 0.8, 0.9, 0.3],
    "language": [0.4, 0.4, -0.1, 0.7, 0.9, 0.2],
    "metric": [0.2, 0.3, 0.1, 0.5, 0.8, 0.8],
    "evaluate": [0.2, 0.4, 0.1, 0.6, 0.8, 0.8],
    "sovereign": [0.9, 0.8, -0.5, 0.9, 0.5, 0.5],
    "active": [0.6, 0.4, 0.2, 0.7, 0.4, 0.4],
    "inference": [0.5, 0.6, 0.1, 0.8, 0.7, 0.5],

    // === Traditional & Simplified Chinese Ontology ===
    "目標": [0.2, 0.3, -0.5, 0.9, 0.2, 0.2],
    "任務": [0.3, 0.4, -0.3, 0.9, 0.1, 0.3],
    "目的": [0.2, 0.3, -0.4, 0.8, 0.2, 0.2],
    "終點": [0.1, 0.5, -0.5, 0.9, 0.4, 0.5],
    "進度": [0.3, 0.5, -0.2, 0.6, 0.6, 0.7],

    "穩定": [0.1, 0.9, -0.8, 0.1, 0.1, 0.1],
    "平衡": [0.2, 0.9, -0.7, 0.3, 0.2, 0.1],
    "秩序": [0.1, 0.8, -0.9, 0.2, 0.1, 0.1],
    "因果": [0.4, 0.6, -0.3, 0.8, 0.7, 0.6],
    "收斂": [0.3, 0.8, -0.6, 0.7, 0.5, 0.4],
    "安全": [0.1, 0.9, -0.8, 0.5, 0.2, 0.1],

    "演化": [0.8, 0.4, 0.5, 0.7, 0.5, 0.5],
    "進化": [0.8, 0.4, 0.5, 0.7, 0.5, 0.5],
    "智慧": [0.8, 0.5, 0.3, 0.8, 0.6, 0.6],
    "學習": [0.6, 0.5, 0.3, 0.6, 0.6, 0.4],
    "自適應": [0.7, 0.6, 0.2, 0.8, 0.5, 0.5],
    "升級": [0.7, 0.4, 0.4, 0.7, 0.5, 0.5],

    "探索": [0.7, -0.1, 0.6, 0.4, 0.8, 0.2],
    "尋找": [0.6, 0.1, 0.5, 0.3, 0.8, 0.3],
    "研究": [0.5, 0.4, 0.2, 0.6, 0.8, 0.5],
    "搜尋": [0.6, 0.2, 0.4, 0.4, 0.8, 0.4],

    "混亂": [0.5, -0.7, 0.9, 0.0, 0.4, 0.2],
    "熵": [0.3, -0.6, 0.9, 0.1, 0.3, 0.3],
    "錯誤": [0.3, -0.5, 0.8, 0.2, 0.3, 0.2],
    "異常": [0.4, -0.5, 0.8, 0.1, 0.3, 0.2],
    "不足": [0.4, -0.6, 0.8, 0.2, 0.4, 0.3],
    "不夠": [0.4, -0.6, 0.8, 0.2, 0.4, 0.3],
    "漏洞": [0.3, -0.4, 0.7, 0.3, 0.5, 0.3],
    "崩潰": [0.6, -0.9, 1.0, 0.0, 0.5, 0.2],

    "處理": [0.5, 0.8, -0.7, 0.8, 0.3, 0.2],
    "解決": [0.6, 0.7, -0.6, 0.8, 0.4, 0.3],
    "修復": [0.6, 0.8, -0.7, 0.9, 0.3, 0.2],
    "麻煩": [0.4, 0.5, 0.5, 0.7, 0.2, 0.2],
    "控制": [0.3, 0.8, -0.5, 0.6, 0.3, 0.2],
    "優化": [0.6, 0.7, -0.5, 0.8, 0.5, 0.4],

    "理解": [0.4, 0.5, -0.2, 0.8, 0.9, 0.3],
    "溝通": [0.3, 0.5, 0.1, 0.7, 0.7, 0.4],
    "語言": [0.4, 0.4, -0.1, 0.7, 0.9, 0.2],
    "語義": [0.5, 0.5, -0.2, 0.8, 0.8, 0.4],
    "表達": [0.3, 0.4, 0.0, 0.6, 0.7, 0.3],

    "距離": [0.2, 0.3, 0.2, 0.5, 0.8, 0.8],
    "差多少": [0.2, 0.2, 0.3, 0.5, 0.8, 0.9],
    "多少": [0.2, 0.2, 0.1, 0.4, 0.7, 0.6],
    "評估": [0.2, 0.4, 0.1, 0.6, 0.8, 0.8],
    "指標": [0.2, 0.3, 0.1, 0.5, 0.8, 0.8],
    "狀態": [0.3, 0.5, 0.0, 0.5, 0.6, 0.6],

    "主權": [0.9, 0.8, -0.5, 0.9, 0.5, 0.5],
    "憲法": [0.7, 0.9, -0.6, 0.8, 0.4, 0.4],
    "主動推理": [0.8, 0.7, -0.4, 0.9, 0.7, 0.5],
    "內穩態": [0.4, 0.9, -0.7, 0.8, 0.3, 0.3]
  };

  // Manifold-to-Symbolic Distillation Bridge status to resolve decaying random entropy loss
  private distillationEntropy: number = 0.04;
  private decayCompensationCount: number = 0;

  /**
   * Encodes user natural language inputs into a normalized latent vector.
   * Leverages a hybrid tokenizer to process English boundaries and CJK continuous streams.
   * Integrates a Continuous Distillation Bridge to calculate and compensate symbolic decay entropy.
   */
  public encode(input: string): number[] {
    const text = String(input || "");
    const lowerText = text.toLowerCase();
    
    let vector = new Array(this.dim).fill(0);
    let matches = 0;

    // 1. Exact English/Numeric Word Extraction
    // This prevents sub-word false positives like "or" inside "order" or "go" inside "goal"
    const englishTokens = lowerText.match(/[a-z0-9]+/g) || [];
    for (const token of englishTokens) {
      if (this.vocabulary[token]) {
        const weights = this.vocabulary[token];
        for (let i = 0; i < this.dim; i++) {
          vector[i] += weights[i];
        }
        matches++;
      }
    }

    // 2. Sliding Window or Direct Inclusion Matching for Non-English Substrings
    // Specifically targets CJK characters which have no spacing/word boundaries
    for (const [kw, weights] of Object.entries(this.vocabulary)) {
      // If the keyword contains at least one CJK character, we use continuous inclusion matching
      if (/[\u4e00-\u9fa5]/.test(kw)) {
        if (lowerText.includes(kw)) {
          // Give higher weight based on the character length to emphasize longer terminology
          const lengthBonus = Math.max(1, kw.length - 1);
          for (let i = 0; i < this.dim; i++) {
            vector[i] += weights[i] * lengthBonus;
          }
          matches += lengthBonus;
        }
      }
    }

    // Handlers for extreme or unmapped states
    if (matches === 0) {
      // Epistemic background entropy baseline decay
      this.distillationEntropy = this.distillationEntropy * 0.92 + 0.08 * 0.015;
      // Neutral baseline vector aligned with moderate exploration and stability (Free energy minimization baseline)
      return [0.5, 0.5, 0.1, 0.1, 0.5, 0.5];
    }

    // Calculate un-normalized raw coordinates to trace information loss
    const rawCoords = vector.map(v => v / matches);

    // Normalize and clamp vector coordinates precisely into the bounded [0, 1] manifold
    const mappedVector = vector.map(v => Math.min(1.0, Math.max(0.0, 0.5 + v / matches)));

    // Continuous Distillation Bridge: Compute Information Entropic Distance (dissipation metric) via WasmEpistemicCore backplane
    const infoEntropyLoss = this.wasmCore.calculate6DDistortion(rawCoords, mappedVector);

    // Low-temperature Annealing state updates
    this.distillationEntropy = this.distillationEntropy * 0.88 + infoEntropyLoss * 0.12;
    this.decayCompensationCount++;

    // Self-healing entropy compensation feedback loops pulling towards stable equilibrium
    if (this.distillationEntropy > 0.06) {
      const compensationThreshold = this.distillationEntropy * 0.15;
      for (let i = 0; i < this.dim; i++) {
        mappedVector[i] = mappedVector[i] * (1 - compensationThreshold) + 0.5 * compensationThreshold;
      }
    }

    return mappedVector;
  }

  /**
   * Decodes a continuous latent vector back into dry physical symbols.
   * Formulates the zero-entropy reverse-projection lane of the Distillation Bridge.
   */
  public decode(vector: number[], topK: number = 3): Array<{ word: string; distance: number }> {
    if (!vector || vector.length < this.dim) return [];
    
    // Center vector alignment back to -0.5 to 0.5 vocabulary space
    const target = vector.map(v => v - 0.5);
    
    const distances = Object.entries(this.vocabulary).map(([word, weights]) => {
      let sumSq = 0;
      for (let i = 0; i < this.dim; i++) {
        const diff = target[i] - weights[i];
        sumSq += diff * diff;
      }
      return { word, distance: Math.sqrt(sumSq) };
    });
    
    return distances
      .sort((a, b) => a.distance - b.distance)
      .slice(0, topK);
  }

  public getDistillationMetrics() {
    return {
      distillationEntropy: Number(this.distillationEntropy.toFixed(5)),
      compensationOps: this.decayCompensationCount,
      reconstructionPurity: Number((1.0 - this.distillationEntropy * 0.45).toFixed(4))
    };
  }
}

