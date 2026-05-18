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
    this.hypotheses.push({ id, description, indicator, threshold, operator, status: "ACTIVE" });
  }

  public proposeHypothesis(h: { id?: string; description: string; indicator: string; threshold: number; operator: "<" | ">" }) {
    const id = h.id || `HYP_${crypto.randomBytes(2).toString('hex')}`;
    this.hypotheses.push({ id, ...h, status: "ACTIVE" });
  }

  public evaluate(metrics: Record<string, number>): { id: string; result: string }[] {
    const results: { id: string; result: string }[] = [];
    for (const h of this.hypotheses) {
      if (h.status !== "ACTIVE") continue;
      const val = metrics[h.indicator];
      if (val !== undefined) {
        let failed = false;
        if (h.operator === "<" && val < h.threshold) failed = true;
        if (h.operator === ">" && val > h.threshold) failed = true;

        if (failed) {
          h.status = "FALSIFIED";
          results.push({ id: h.id, result: `證偽觸發：${h.description} 已失效。指標 ${h.indicator}(${val.toFixed(4)}) ${h.operator} ${h.threshold}` });
        }
      }
    }
    return results;
  }

  public getActiveChains() {
    return this.hypotheses.filter(h => h.status === "ACTIVE");
  }
}
