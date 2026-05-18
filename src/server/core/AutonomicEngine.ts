import { NetworkManager } from "../network";
import { GeneticOptimizer, TrendPredictor, EpistemicForagingUnit } from "../intelligence";
import { CONFIG } from "../constants";
import { NeuralCache } from "../network";

/**
 * AutonomicEngine - 自主運行引擎
 * Manages high-level brain cycles: evolution, arbitration, and self-healing.
 */
export class AutonomicEngine {
  private network: NetworkManager;
  private geneticOptimizer: GeneticOptimizer;
  private trendPredictor: TrendPredictor;
  private neuralCache: NeuralCache;
  private epistemicForaging: EpistemicForagingUnit;

  constructor(
    network: NetworkManager,
    geneticOptimizer: GeneticOptimizer,
    trendPredictor: TrendPredictor,
    neuralCache: NeuralCache,
    epistemicForaging: EpistemicForagingUnit
  ) {
    this.network = network;
    this.geneticOptimizer = geneticOptimizer;
    this.trendPredictor = trendPredictor;
    this.neuralCache = neuralCache;
    this.epistemicForaging = epistemicForaging;
  }

  public arbitrateGlobalWorkspace(layers: string[]): { attention: string; priority: number; focus: string[] } {
    let bestLayer = "core";
    let maxCoh = -1;

    layers.forEach(id => {
      const coh = this.network.calculateCoherence(id);
      if (coh > maxCoh) {
        maxCoh = coh;
        bestLayer = id;
      }
    });

    return {
      attention: bestLayer.toUpperCase(),
      priority: Math.floor(maxCoh * 100),
      focus: layers.filter(id => this.network.calculateCoherence(id) > 0.4)
    };
  }

  public evolve(evolutionPoints: number, predictFn: (state: number[]) => number): { success: boolean; newState?: number[] } {
    if (evolutionPoints < 5) return { success: false };
    
    this.geneticOptimizer.evaluate((genome) => {
      const testState = Array.from(genome).slice(0, 6);
      const coh = predictFn(testState);
      const entropy = testState[2] || 0.5;
      return coh * 0.7 + (1 - entropy) * 0.3;
    });

    this.geneticOptimizer.evolve();
    
    if (Math.random() > 0.95) {
      const best = this.geneticOptimizer.getBest();
      return { success: true, newState: Array.from(best) };
    }
    return { success: false };
  }

  public semanticStep(globalCoherence: number): { trend: number; state: string; pointsDelta: number } {
    const result = this.trendPredictor.predict(globalCoherence);
    let pointsDelta = 0;
    
    if (result.state === "上升") {
      pointsDelta = 1;
    }
    
    return { ...result, pointsDelta };
  }
}
