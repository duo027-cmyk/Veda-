export class ConstraintEngine {
  public evaluate(scenario: { 
    has_real_path: boolean; 
    controllable: boolean; 
    global_risk: number;
    system_entropy: number; 
  }) {
    let score = 1.0;
    const issues: string[] = [];

    if (!scenario.has_real_path) {
      score -= 0.4;
      issues.push("PHYSICAL_PATH_BLOCKED");
    }
    if (!scenario.controllable) {
      score -= 0.3;
      issues.push("ESCALATION_OVERFLOW");
    }
    if (scenario.global_risk > 0.7) {
      score -= 0.3;
      issues.push("CATASTROPHIC_RISK");
    }
    if (scenario.system_entropy > 0.5) {
      score *= (1 - (scenario.system_entropy - 0.5));
      issues.push("COGNITIVE_FRICTION_HIGH");
    }

    return { score: Math.max(score, 0), issues };
  }
}
