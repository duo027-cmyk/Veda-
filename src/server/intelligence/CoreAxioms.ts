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
