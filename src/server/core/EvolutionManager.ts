import { 
  PredictiveCorrectionEngine, 
  CausalBurstEngine, 
  BurstImpactEvaluator, 
  FalsifiabilityEngine 
} from "../intelligence";
import { KnowledgeManifest } from "./KnowledgeManifest";

export interface EvolutionOps {
  triggerResonance: (intensity: number) => void;
  neuralLog: (type: string, msg: string, data?: any) => void;
}

export class EvolutionManager {
  constructor(
    private pecEngine: PredictiveCorrectionEngine,
    private burstEngine: CausalBurstEngine,
    private burstEvaluator: BurstImpactEvaluator,
    private falsifiability: FalsifiabilityEngine,
    private manifest: KnowledgeManifest,
    private ops: EvolutionOps
  ) {}

  public processPEC(state: number[], intent: number[], physicalOpsCount: number, globalCoherence: number): number[] {
    if (physicalOpsCount % 10 !== 0) return state;

    const pecResult = this.pecEngine.simulate(state, intent);
    const rawCredibility = globalCoherence * (1 - pecResult.divergence * 0.5);
    this.manifest.updateEpistemic(Number(rawCredibility.toFixed(4)));

    let newState = [...state];
    if (pecResult.divergence > 0.22) {
      this.ops.neuralLog("PEC_WARNING", `偵測到潛在因果發散 (Divergence: ${pecResult.divergence.toFixed(4)})，啟動抑制協議。`);
      const correction = this.pecEngine.getCorrectionVector(pecResult.divergence);
      newState = newState.map((v, i) => Math.max(0, Math.min(1, v + correction[i])));
    }

    // V-AA Protocol: Anti-Stagnation Trigger
    if (this.manifest.getEpistemic().credibility < 0.3 && physicalOpsCount % 100 === 0) {
      this.ops.neuralLog("SYSTEM_STAGNATION", "偵測到認識論瓶頸。執行強制共振脈衝...");
      this.ops.triggerResonance(0.15);
    }

    return newState;
  }

  public processBurst(delta: number, globalCoherence: number): void {
    const burstImpact = this.burstEngine.update(delta, globalCoherence);
    if (burstImpact) {
      this.ops.neuralLog("BURST_IMPACT", `Action: ${burstImpact.action} | Effect: ${burstImpact.effect}`);
      if (burstImpact.action === "EMERGENCY_SHUTDOWN") {
        this.ops.triggerResonance(0.9);
      }
    }
  }

  public processFalsifiability(physicalOpsCount: number, metrics: {
    coherence: number;
    entropy: number;
    stability: number;
    vfe: number;
  }): void {
    if (physicalOpsCount % 100 !== 0) return;

    const failures = this.falsifiability.evaluate(metrics);
    failures.forEach(f => {
      this.ops.neuralLog("FALSIFICATION_EVENT", f.result);
      this.ops.triggerResonance(0.5); 
    });
  }

  public calculateSovereignIndex(globalCoherence: number, researchCount: number): number {
    const researchWeight = Math.min(15, (researchCount / 20) * 15);
    let index = (globalCoherence * 85) + researchWeight + (Math.sin(Date.now() / 6000) * 2.5);
    return Math.max(0, Math.min(100, index));
  }
}
