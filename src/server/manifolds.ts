/**
 * ACTIVE INFERENCE MANIFOLD (主動推理流形)
 */
export class ActiveInferenceManifold {
  private predictionHistory: number[] = [];
  private vfe: number = 0.5; // Variational Free Energy
  
  public update(expected: number, actual: number): number {
    const error = Math.abs(expected - actual);
    this.predictionHistory.push(error);
    if (this.predictionHistory.length > 50) this.predictionHistory.shift();
    
    // VFE Calculation: Derivative of entropy and prediction error
    const avgError = this.predictionHistory.reduce((a, b) => a + b, 0) / this.predictionHistory.length;
    this.vfe = (this.vfe * 0.8) + (avgError * 0.2);
    return this.vfe;
  }

  public getVFE(): number { return this.vfe; }
}

/**
 * Stability Manifold
 */
export class StabilityManifold {
  private stabilityIndex: number = 1.0;
  private entropyHistory: number[] = [];
  
  public update(metrics: { integrity: number, vfe: number, coherence: number }): number {
    // Composite Stability Calculation
    const drift = Math.abs(1.0 - metrics.coherence) + (metrics.vfe * 0.5);
    const entropy = drift / (metrics.integrity + 0.1);
    
    this.entropyHistory.push(entropy);
    if (this.entropyHistory.length > 100) this.entropyHistory.shift();
    
    const avgEntropy = this.entropyHistory.reduce((a, b) => a + b, 0) / this.entropyHistory.length;
    this.stabilityIndex = Math.max(0.1, 1.0 - avgEntropy);
    
    return this.stabilityIndex;
  }

  public getStability(): number { return this.stabilityIndex; }
}

/**
 * Consciousness Monitor
 */
export class ConsciousnessMonitor {
  public calculateNetworkEntropy(state: number[]): number {
    return state.reduce((acc, v) => acc - (v * Math.log2(v + 0.001) + (1-v) * Math.log2(1-v + 0.001)), 0) / state.length;
  }

  public calculatePhi(network: any): number {
    // Integrated Information Theory (IIT) measure simulation
    // Phi represents the degree of system integration/consciousness
    // Based on cross-layer resonance and node activation variance
    const layers = ["core", "peripheral", "quantum", "prediction", "simulation"];
    let integrationScore = 0;
    
    layers.forEach(l => {
      const data = network.getLayer(l);
      if (data) {
        const avg = data.reduce((a: number, b: number) => a + b, 0) / data.length;
        const variance = data.reduce((a: number, b: number) => a + Math.pow(b - avg, 2), 0) / data.length;
        integrationScore += variance;
      }
    });

    return Math.min(1.0, integrationScore * 2.0);
  }
}

/**
 * Actor - Game Theory Utility Model
 */
export class Actor {
  constructor(
    public name: string,
    public riskTolerance: number,
    public escalationThreshold: number,
    public constraints: { domestic_pressure: number }
  ) {}

  public calculateUtility(eventIntensity: number, systemStability: number, otherActorsEscalating: number) {
    const aggression = (this.riskTolerance * 0.7) + (this.constraints.domestic_pressure * 0.3);
    const systemPenalty = (1 - systemStability) * 0.5;
    const deterrence = otherActorsEscalating * 0.2;

    const utility = (eventIntensity * aggression) - systemPenalty - deterrence;
    return utility;
  }

  public decide(utility: number): string {
    if (utility > this.escalationThreshold) return "ESCALATE";
    if (utility > 0) return "RESPOND";
    return "HOLD";
  }

  public getReport() {
    return {
      name: this.name,
      parameters: {
        risk: this.riskTolerance,
        escalation: this.escalationThreshold,
        pressure: this.constraints.domestic_pressure
      }
    };
  }
}
