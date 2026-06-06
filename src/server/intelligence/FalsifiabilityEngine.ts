import crypto from "crypto";

/**
 * Falsifiability Module
 * Tracks causal hypotheses and their failure metrics.
 */
export class FalsifiabilityEngine {
  private hypotheses: Array<{
    id: string;
    description: string;
    indicator: string;
    threshold: number;
    operator: "<" | ">";
    status: "ACTIVE" | "FALSIFIED" | "RETIRED";
  }> = [];

  public propose(id: string, description: string, indicator: string, threshold: number, operator: "<" | ">") {
    const validatedId = typeof id === "string" ? id : `HYP_GEN_${Math.floor(Math.random() * 1000)}`;
    const validatedDesc = typeof description === "string" ? description : "Generic Hypothesis";
    const validatedInd = typeof indicator === "string" ? indicator : "entropy";
    const validatedThreshold = typeof threshold === "number" && Number.isFinite(threshold) ? threshold : 0.5;
    const validatedOp = operator === "<" || operator === ">" ? operator : "<";

    this.hypotheses.push({ 
      id: validatedId, 
      description: validatedDesc, 
      indicator: validatedInd, 
      threshold: validatedThreshold, 
      operator: validatedOp, 
      status: "ACTIVE" 
    });
  }

  public proposeHypothesis(h: { id?: string; description: string; indicator: string; threshold: number; operator: "<" | ">" }) {
    if (!h || typeof h !== "object") return;
    const id = h.id || `HYP_${crypto.randomBytes(2).toString('hex')}`;
    const validatedDesc = typeof h.description === "string" ? h.description : "Generic Structured Hypothesis";
    const validatedInd = typeof h.indicator === "string" ? h.indicator : "coherence";
    const validatedThreshold = typeof h.threshold === "number" && Number.isFinite(h.threshold) ? h.threshold : 0.5;
    const validatedOp = h.operator === "<" || h.operator === ">" ? h.operator : "<";

    this.hypotheses.push({ 
      id, 
      description: validatedDesc, 
      indicator: validatedInd, 
      threshold: validatedThreshold, 
      operator: validatedOp, 
      status: "ACTIVE" 
    });
  }

  public evaluate(metrics: Record<string, number>): { id: string; result: string }[] {
    const results: { id: string; result: string }[] = [];
    const safeMetrics = metrics && typeof metrics === "object" ? metrics : {};

    for (const h of this.hypotheses) {
      if (h.status !== "ACTIVE") continue;
      const rawVal = safeMetrics[h.indicator];
      const val = typeof rawVal === "number" && Number.isFinite(rawVal) ? rawVal : undefined;

      if (val !== undefined) {
        let failed = false;
        if (h.operator === "<" && val < h.threshold) failed = true;
        if (h.operator === ">" && val > h.threshold) failed = true;

        if (failed) {
          h.status = "FALSIFIED";
          results.push({ 
            id: h.id, 
            result: `證證偽觸發：[${h.description}] 已失效。指標 ${h.indicator}(${val.toFixed(4)}) ${h.operator} ${h.threshold}` 
          });
        }
      }
    }
    return results;
  }

  public getActiveChains() {
    return Array.isArray(this.hypotheses) ? this.hypotheses.filter(h => h && h.status === "ACTIVE") : [];
  }
}
