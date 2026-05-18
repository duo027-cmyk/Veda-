export class AGI_JEPA_Arch {
  private predictorWeights: number[][];
  private predictorMomentum: number[][];
  private encoderWeights: number[][];
  private latentDim: number = 8;
  private inputDim: number;
  private learningRate: number = 0.015;
  private momentumFactor: number = 0.9;
  private energyHistory: number[] = [];
  private lastLatentPrediction: number[] = [];

  constructor(inputDim: number) {
    this.inputDim = inputDim;
    this.encoderWeights = Array.from({ length: this.latentDim }, () => 
      Array.from({ length: inputDim }, () => Math.random() * 2 - 1)
    );
    this.predictorWeights = Array.from({ length: this.latentDim }, () => 
      Array.from({ length: this.latentDim + inputDim }, () => Math.random() * 2 - 1)
    );
    this.predictorMomentum = Array.from({ length: this.latentDim }, () => 
      Array.from({ length: this.latentDim + inputDim }, () => 0)
    );
  }

  public encode(x: number[]): number[] {
    return this.encoderWeights.map(row => {
      const sum = row.reduce((acc, w, i) => acc + w * (x[i] || 0), 0);
      return Math.tanh(sum);
    });
  }

  public predict(latentS: number[], action: number[]): number[] {
    const combined = [...latentS, ...action];
    const prediction = this.predictorWeights.map(row => {
      const sum = row.reduce((acc, w, i) => acc + w * (combined[i] || 0), 0);
      return Math.tanh(sum);
    });
    this.lastLatentPrediction = prediction;
    return prediction;
  }

  public computeEnergy(predictedLatent: number[], actualLatent: number[]): number {
    const energy = predictedLatent.reduce((acc, p, i) => acc + Math.pow(p - actualLatent[i], 2), 0);
    this.energyHistory.push(energy);
    if (this.energyHistory.length > 100) this.energyHistory.shift();
    return energy;
  }

  public step(state: number[], action: number[], nextState: number[]) {
    const s_t = this.encode(state);
    const s_next = this.encode(nextState);
    const s_hat = this.predict(s_t, action);
    const energy = this.computeEnergy(s_hat, s_next);
    
    // Adaptive Learning Rate based on surprise gradient
    const adaptiveLR = this.learningRate * (1 + energy * 2);
    const combined = [...s_t, ...action];

    // Predictor Optimization: Minimize L2 Energy between s_hat and s_next
    for (let i = 0; i < this.latentDim; i++) {
      const error = s_next[i] - s_hat[i];
      const gradient = error * (1 - Math.pow(s_hat[i], 2)); // Tanh derivative
      for (let j = 0; j < combined.length; j++) {
        // Momentum-based update
        const delta = adaptiveLR * gradient * combined[j];
        this.predictorMomentum[i][j] = (this.predictorMomentum[i][j] * this.momentumFactor) + (delta * (1 - this.momentumFactor));
        this.predictorWeights[i][j] += this.predictorMomentum[i][j];
      }
    }

    // Encoder Optimization: Pull s_next towards a state that makes s_hat accurate
    // (Dual-track optimization for world-model consistency)
    if (energy > 0.1) {
      for (let i = 0; i < this.latentDim; i++) {
          const error = s_hat[i] - s_next[i];
          const gradient = error * (1 - Math.pow(s_next[i], 2));
          for (let j = 0; j < this.inputDim; j++) {
              this.encoderWeights[i][j] -= adaptiveLR * 0.5 * gradient * nextState[j];
          }
      }
    }

    // Optimization: Dynamic Manifold Pruning (L1 Regularization to enforce sparsity)
    if (Math.random() > 0.99) {
      for (let i = 0; i < this.latentDim; i++) {
        for (let j = 0; j < this.predictorWeights[i].length; j++) {
          this.predictorWeights[i][j] *= 0.999; // Weight decay
          if (Math.abs(this.predictorWeights[i][j]) < 0.0001) this.predictorWeights[i][j] = 0;
        }
      }
    }
  }

  public calibrate(factor: number) {
    // factor > 1 increases learning, factor < 1 stabilizes
    this.learningRate = Math.max(0.001, Math.min(0.05, this.learningRate * factor));
  }

  public setLearningRate(rate: number) {
    this.learningRate = Math.max(0.001, Math.min(0.1, rate));
  }

  public getMetrics() {
    try {
      const avgEnergy = this.energyHistory.length > 0 ? this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length : 0;
      const variance = this.energyHistory.length > 0 
        ? this.energyHistory.reduce((a, b) => a + Math.pow(b - avgEnergy, 2), 0) / this.energyHistory.length 
        : 0;

      return {
        avgEnergy: Number((avgEnergy || 0).toFixed(5)),
        currentEnergy: Number((this.energyHistory[this.energyHistory.length - 1] || 0).toFixed(5)),
        uncertaintyVariance: Number((variance || 0).toFixed(6)),
        latentState: this.lastLatentPrediction || new Array(this.latentDim).fill(0)
      };
    } catch (e) {
      console.error("[JEPA_METRICS_FAULT]", e);
      return {
        avgEnergy: 0,
        currentEnergy: 0,
        uncertaintyVariance: 0,
        latentState: new Array(this.latentDim).fill(0)
      };
    }
  }
}
