/**
 * SelfCorrectionEngine (自體相干閉環微調引擎)
 * Handles automatic closed-loop optimization of 'vector_intent' metrics
 * (COH, ENT, BIAS, RES, PHI, FREQ) by analyzing the user's latest chat 
 * patterns, typing speed, and structural complexity of the last 5 minutes.
 * Runs completely serverless (on-client) to avoid unnecessary server round-trips.
 */

import { vedaService } from "./vedaService";

export interface ChatInteraction {
  role: "user" | "assistant" | "system";
  text: string;
  timestamp: number;
}

export interface SelfCorrectionMetrics {
  coherenceDelta: number;
  entropyDelta: number;
  biasDelta: number;
  resonanceDelta: number;
  phiDelta: number;
  frequencyDelta: number;
  reason: string;
}

class SelfCorrectionEngineService {
  private isAutoEnabled = true;

  public setEnabled(enabled: boolean) {
    this.isAutoEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.isAutoEnabled;
  }

  /**
   * Analyzes list of recent chat interactions within the last 5 minutes (300,000 ms)
   * and computes adjustment delta vectors to optimize response alignment.
   */
  public analyzeChatActivity(messages: ChatInteraction[]): SelfCorrectionMetrics {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    
    // Filter to last 5 minutes
    const recent = messages.filter(m => m.timestamp >= fiveMinutesAgo || (m as any).ts >= fiveMinutesAgo);
    
    if (recent.length === 0) {
      return {
        coherenceDelta: 0,
        entropyDelta: 0,
        biasDelta: 0,
        resonanceDelta: 0,
        phiDelta: 0,
        frequencyDelta: 0,
        reason: "NO_ACTIVE_TRANSMISSIONS"
      };
    }

    const userMsgs = recent.filter(m => m.role === "user");
    const assistantMsgs = recent.filter(m => m.role === "assistant");

    // Dimensions: COH, ENT, BIAS, RES, PHI, FREQ (default is 0)
    let coh = 0;
    let ent = 0;
    let bias = 0;
    let res = 0;
    let phi = 0;
    let freq = 0;
    let reasons: string[] = [];

    // Analyze frequency (interactions pace)
    const totalTurns = userMsgs.length;
    if (totalTurns > 4) {
      freq += 0.45;
      res += 0.35;
      reasons.push("HIGH_CONVERSATION_CADENCE");
    } else if (totalTurns > 1) {
      freq += 0.15;
      res += 0.1;
      reasons.push("STABLE_INTERACTION");
    } else {
      freq -= 0.1;
      reasons.push("QUIET_INTELLIGENCE");
    }

    // Analyze message lengths & complexity
    const avgUserLength = userMsgs.length > 0 
      ? userMsgs.reduce((acc, m) => acc + (m.text?.length || 0), 0) / userMsgs.length 
      : 0;

    if (avgUserLength > 150) {
      // Long complex prompts demand high complexity and logical capacity
      phi += 0.55;
      coh += 0.4;
      ent += 0.25; // allow exploration for complex needs
      reasons.push("COMPLEX_EPISTEMIC_FOREGROUNDING");
    } else if (avgUserLength > 40) {
      phi += 0.2;
      coh += 0.15;
    } else if (avgUserLength > 0) {
      // Short queries should lower complexity baseline
      phi -= 0.25;
      coh += 0.1; // maintain fast, coherent results
      reasons.push("COMPACT_TELEOLOGICAL_INPUT");
    }

    // Keyword & semantic vector analysis
    let hasCode = false;
    let hasExploration = false;
    let hasNegativeFriction = false;
    let hasMathOrFormal = false;

    const exploreKeywords = ["探索", "探索性", "隨機", "創造", "什麼", "如何", "假如", "理論", "類比", "explore", "what if", "analogy", "create", "theory", "dream", "holographic"];
    const strictKeywords = ["錯誤", "重新", "不對", "修改", "修復", "修", "bug", "error", "wrong", "incorrect", "fix", "failed", "timeout", "重試"];
    const formalKeywords = ["公式", "數學", "proof", "theorem", "lemma", "equation", "matrix", "quaternion", "tensor", "晶格", "lattice", "coherence"];

    userMsgs.forEach(m => {
      if (!m || typeof m.text !== 'string') return;
      const txt = m.text.toLowerCase();
      if (txt.includes("```") || txt.includes("function") || txt.includes("const ") || txt.includes("impl ")) {
        hasCode = true;
      }
      if (exploreKeywords.some(kw => txt.includes(kw))) {
        hasExploration = true;
      }
      if (strictKeywords.some(kw => txt.includes(kw))) {
        hasNegativeFriction = true;
      }
      if (formalKeywords.some(kw => txt.includes(kw))) {
        hasMathOrFormal = true;
      }
    });

    if (hasCode) {
      phi += 0.45;
      coh += 0.3;
      ent -= 0.2; // restrict wild random creations for stable code structures
      reasons.push("STRUCTURAL_SYNTACTIC_FLOW");
    }

    if (hasExploration) {
      ent += 0.6;
      res += 0.25;
      reasons.push("CREATIVE_LATENT_EXPLORATION");
    } else {
      // If no exploration keyword is found and user is direct, slowly reduce high entropy
      ent -= 0.15;
    }

    if (hasNegativeFriction) {
      // User is encountering bugs, friction, or correcting the AI.
      // Boost logical coherence and decrease bias/noise so weights auto-align to strict standards
      coh += 0.7;
      bias += 0.35; // direct corrective bias
      ent -= 0.3; // minimize random drift
      reasons.push("CORRECTIVE_ALIGNMENT_FEEDBACK");
    }

    if (hasMathOrFormal) {
      coh += 0.5;
      phi += 0.5;
      reasons.push("FORMAL_COGNITIVE_STRUCTURING");
    }

    // Cap maximum deltas for safe incremental tracking
    const clamp = (val: number) => Math.max(-1.5, Math.min(1.5, val));

    return {
      coherenceDelta: clamp(coh),
      entropyDelta: clamp(ent),
      biasDelta: clamp(bias),
      resonanceDelta: clamp(res),
      phiDelta: clamp(phi),
      frequencyDelta: clamp(freq),
      reason: reasons.join(" | ") || "STEADY_QUOTIDIAN_CADENCE"
    };
  }

  /**
   * Refines current intent vector using computed action alignment delta and registers in persistence.
   */
  public async executeSelfCorrection(
    currentIntent: number[], 
    messages: ChatInteraction[]
  ): Promise<{
    newIntent: number[];
    metrics: SelfCorrectionMetrics;
    isUpdated: boolean;
  }> {
    const metrics = this.analyzeChatActivity(messages);
    
    if (!this.isAutoEnabled || metrics.reason === "NO_ACTIVE_TRANSMISSIONS") {
      return { newIntent: currentIntent, metrics, isUpdated: false };
    }

    // Blend: apply 15% incremental step size of calculated deltas to avoid sudden jitter
    const stepSize = 0.15;
    const baseIntent = currentIntent.length === 6 ? currentIntent : [0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
    
    const deltas = [
      metrics.coherenceDelta,
      metrics.entropyDelta,
      metrics.biasDelta,
      metrics.resonanceDelta,
      metrics.phiDelta,
      metrics.frequencyDelta
    ];

    const newIntent = baseIntent.map((val, idx) => {
      const newVal = val + deltas[idx] * stepSize;
      // Clamped to range [-5.0, 5.0] matching standard academic scale
      return Math.max(-5.0, Math.min(5.0, parseFloat(newVal.toFixed(4))));
    });

    // Check if any significant change occurred
    let hasDelta = false;
    for (let i = 0; i < 6; i++) {
      if (Math.abs(newIntent[i] - baseIntent[i]) > 0.005) {
        hasDelta = true;
        break;
      }
    }

    if (hasDelta) {
      await vedaService.updatePersistence({ settings: { vector_intent: newIntent } });
      return { newIntent, metrics, isUpdated: true };
    }

    return { newIntent, metrics, isUpdated: false };
  }
}

export const selfCorrectionEngine = new SelfCorrectionEngineService();
