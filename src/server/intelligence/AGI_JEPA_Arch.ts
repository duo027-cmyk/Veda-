export class AGI_JEPA_Arch {
  private predictorWeights: Float64Array;
  private predictorMomentum: Float64Array;
  private encoderWeights: Float64Array;
  private combinedBuffer: Float64Array;
  private latentDim: number = 8;
  private inputDim: number;
  private learningRate: number = 0.015;
  private momentumFactor: number = 0.9;
  private energyHistory: Float64Array;
  private energyHistoryPtr: number = 0;
  private energyHistoryCount: number = 0;
  
  // Pre-allocated typed arrays for zero-GC lifecycle
  private tStateBuffer: Float64Array;
  private nextStateBuffer: Float64Array;
  private predBuffer: Float64Array;
  private safeStateIn: Float64Array;
  private safeActionIn: Float64Array;
  private safeNextStateIn: Float64Array;

  // Pre-allocated JS array returned to external modules to preserve backward compatibility (if needed) but written in-place
  private lastLatentPredictionJS: number[] = [];

  constructor(inputDim: number) {
    this.inputDim = inputDim;
    this.encoderWeights = new Float64Array(this.latentDim * inputDim);
    for (let i = 0; i < this.encoderWeights.length; i++) {
      this.encoderWeights[i] = Math.random() * 2 - 1;
    }

    const combDim = this.latentDim + inputDim;
    this.predictorWeights = new Float64Array(this.latentDim * combDim);
    this.predictorMomentum = new Float64Array(this.latentDim * combDim);
    for (let i = 0; i < this.predictorWeights.length; i++) {
      this.predictorWeights[i] = Math.random() * 2 - 1;
    }

    this.combinedBuffer = new Float64Array(combDim);
    this.energyHistory = new Float64Array(100);
    this.tStateBuffer = new Float64Array(this.latentDim);
    this.nextStateBuffer = new Float64Array(this.latentDim);
    this.predBuffer = new Float64Array(this.latentDim);
    
    this.safeStateIn = new Float64Array(inputDim);
    this.safeActionIn = new Float64Array(inputDim);
    this.safeNextStateIn = new Float64Array(inputDim);

    this.lastLatentPredictionJS = new Array(this.latentDim).fill(0);
  }

  public encode(x: number[]): number[] {
    const res = new Array(this.latentDim);
    const inputDim = this.inputDim;
    const len = x ? Math.min(x.length, inputDim) : 0;
    
    // Copy to fast localized array
    const localX = this.safeStateIn;
    for (let j = 0; j < inputDim; j++) {
      if (j < len) {
        const val = x[j];
        localX[j] = Number.isFinite(val) ? val : 0;
      } else {
        localX[j] = 0;
      }
    }

    const weights = this.encoderWeights;
    for (let i = 0; i < this.latentDim; i++) {
      let sum = 0;
      const offset = i * inputDim;
      for (let j = 0; j < inputDim; j++) {
        sum += weights[offset + j] * localX[j];
      }
      res[i] = Math.tanh(sum);
    }
    return res;
  }

  // Speed-optimized internal version returning a Float64Array
  private encodeToBuffer(x: number[] | Float64Array, outBuffer: Float64Array): void {
    const inputDim = this.inputDim;
    const len = x ? x.length : 0;
    const localX = this.safeStateIn;
    
    for (let j = 0; j < inputDim; j++) {
      if (j < len) {
        const val = x[j];
        localX[j] = Number.isFinite(val) ? val : 0;
      } else {
        localX[j] = 0;
      }
    }

    const weights = this.encoderWeights;
    const ld = this.latentDim;
    for (let i = 0; i < ld; i++) {
      let sum = 0;
      const offset = i * inputDim;
      for (let j = 0; j < inputDim; j++) {
        sum += weights[offset + j] * localX[j];
      }
      outBuffer[i] = Math.tanh(sum);
    }
  }

  public predict(latentS: number[], action: number[]): number[] {
    const latentDim = this.latentDim;
    const inputDim = this.inputDim;
    const combDim = latentDim + inputDim;

    const combined = this.combinedBuffer;
    const lenLat = latentS ? Math.min(latentS.length, latentDim) : 0;
    for (let i = 0; i < latentDim; i++) {
      if (i < lenLat) {
        const val = latentS[i];
        combined[i] = Number.isFinite(val) ? val : 0;
      } else {
        combined[i] = 0;
      }
    }
    const lenAct = action ? Math.min(action.length, inputDim) : 0;
    for (let i = 0; i < inputDim; i++) {
      if (i < lenAct) {
        const val = action[i];
        combined[latentDim + i] = Number.isFinite(val) ? val : 0;
      } else {
        combined[latentDim + i] = 0;
      }
    }

    const prediction = new Array(latentDim);
    const weights = this.predictorWeights;
    const jsPrediction = this.lastLatentPredictionJS;
    
    for (let i = 0; i < latentDim; i++) {
      let sum = 0;
      const offset = i * combDim;
      for (let j = 0; j < combDim; j++) {
        sum += weights[offset + j] * combined[j];
      }
      const val = Math.tanh(sum);
      prediction[i] = val;
      jsPrediction[i] = val;
    }
    return prediction;
  }

  /**
   * Yann LeCun's Masked Latent State Estimator (MLSE) - Meta I-JEPA Representation Pattern
   * Masking certain latent slots forces the predictor to leverage spatio-temporal context 
   * and intent vectors to form coherent predictions, preventing trivial autoencoder shortcuts.
   */
  public predictMasked(latentS: number[] | Float64Array, action: number[] | Float64Array, maskIndices: number[], outBuffer: Float64Array) {
    const latentDim = this.latentDim;
    const inputDim = this.inputDim;
    const combDim = latentDim + inputDim;

    const combined = this.combinedBuffer;
    const lenLat = latentS ? Math.min(latentS.length, latentDim) : 0;
    for (let i = 0; i < latentDim; i++) {
      if (i < lenLat) {
        const val = latentS[i];
        combined[i] = Number.isFinite(val) ? val : 0;
      } else {
        combined[i] = 0;
      }
    }
    const lenAct = action ? Math.min(action.length, inputDim) : 0;
    for (let i = 0; i < inputDim; i++) {
      if (i < lenAct) {
        const val = action[i];
        combined[latentDim + i] = Number.isFinite(val) ? val : 0;
      } else {
        combined[latentDim + i] = 0;
      }
    }

    // Unpack mask array into local variables for faster bitwise checking/avoiding includes() calls
    const m0 = maskIndices[0] !== undefined ? maskIndices[0] : -1;
    const m1 = maskIndices[1] !== undefined ? maskIndices[1] : -1;

    const weights = this.predictorWeights;
    const jsPrediction = this.lastLatentPredictionJS;

    for (let i = 0; i < latentDim; i++) {
      let sum = 0;
      const offset = i * combDim;
      const isMaskedNode = (i === m0 || i === m1);
      
      if (isMaskedNode) {
        // Enforce contextual inference over direct reconstruction by masking self-feedback coefficients
        for (let j = 0; j < combDim; j++) {
          const isMaskedFeedback = j < latentDim && (j === m0 || j === m1);
          const val = isMaskedFeedback ? 0 : combined[j];
          sum += weights[offset + j] * val;
        }
        const val = Math.tanh(sum * 1.3); // Scale contextual prediction gain
        outBuffer[i] = val;
        jsPrediction[i] = val;
      } else {
        for (let j = 0; j < combDim; j++) {
          sum += weights[offset + j] * combined[j];
        }
        const val = Math.tanh(sum);
        outBuffer[i] = val;
        jsPrediction[i] = val;
      }
    }
  }

  public computeEnergy(predictedLatent: Float64Array, actualLatent: Float64Array): number {
    const latentDim = this.latentDim;
    let energy = 0;
    for (let i = 0; i < latentDim; i++) {
      const p = predictedLatent[i];
      const act = actualLatent[i];
      const diff = p - act;
      energy += diff * diff;
    }
    
    // Efficient ring buffer for status tracing
    this.energyHistory[this.energyHistoryPtr] = energy;
    this.energyHistoryPtr = (this.energyHistoryPtr + 1) % 100;
    if (this.energyHistoryCount < 100) {
      this.energyHistoryCount++;
    }
    return energy;
  }

  public step(state: number[], action: number[], nextState: number[]) {
    const inputDim = this.inputDim;
    
    // Copy safe values into local typed arrays
    const saIn = this.safeActionIn;
    const lenAct = action ? Math.min(action.length, inputDim) : 0;
    for (let i = 0; i < inputDim; i++) {
      if (i < lenAct) {
        const v = action[i];
        saIn[i] = Number.isFinite(v) ? v : 0;
      } else {
        saIn[i] = 0;
      }
    }

    // Faster state encoding with direct pre-allocated buffers
    this.encodeToBuffer(state, this.tStateBuffer);
    this.encodeToBuffer(nextState, this.nextStateBuffer);
    
    // Simulate Meta's I-JEPA/V-JEPA patch-wise masking
    const randIndex = Math.floor(Math.random() * this.latentDim);
    const maskIndices = [randIndex, (randIndex + 3) % this.latentDim];
    
    // Predict state under mask and save to pre-allocated buffers
    this.predictMasked(this.tStateBuffer, saIn, maskIndices, this.predBuffer);
    
    // Measure energy / surprise metrics
    const energy = this.computeEnergy(this.predBuffer, this.nextStateBuffer);
    const energyVal = Number.isFinite(energy) ? energy : 0;
    
    // Adaptive Learning Rate governed by surprise gradient & environmental entropy
    const entropyFactor = Math.max(0.1, 1.0 - (energyVal * 0.5));
    const adaptiveLR = this.learningRate * (1.0 + energyVal * 2.8) * entropyFactor;

    const latentDim = this.latentDim;
    const combDim = latentDim + inputDim;

    const combined = this.combinedBuffer;
    for (let i = 0; i < latentDim; i++) {
      combined[i] = this.tStateBuffer[i];
    }
    for (let i = 0; i < inputDim; i++) {
      combined[latentDim + i] = saIn[i];
    }

    const s_next = this.nextStateBuffer;
    const s_hat = this.predBuffer;

    // Predictor Optimization: Minimize L2 Energy with momentum (fully unrolled calculations)
    const weights = this.predictorWeights;
    const momentum = this.predictorMomentum;
    const mf = this.momentumFactor;
    
    for (let i = 0; i < latentDim; i++) {
       const error = s_next[i] - s_hat[i];
       const stableError = Math.max(-0.95, Math.min(0.95, error));
       const gradient = stableError * (1 - s_hat[i] * s_hat[i]); // fast Tanh derivative derivative
      
       const offset = i * combDim;
       const dynamicMomentum = mf * (0.95 + 0.05 * Math.tanh(energyVal));
       const momentumMultiplier = 1 - dynamicMomentum;
       
       for (let j = 0; j < combDim; j++) {
         const delta = adaptiveLR * gradient * combined[j];
         const mIdx = offset + j;
         momentum[mIdx] = (momentum[mIdx] * dynamicMomentum) + (delta * momentumMultiplier);
         weights[mIdx] += momentum[mIdx];
       }
    }

    // Encoder Optimization: Dynamic Predictive Pull with error-rejection thresholds
    if (energyVal > 0.08) {
      const encWeights = this.encoderWeights;
      const lrContribution = adaptiveLR * 0.45;
      
      // Load localized target next state config to optimize representation stability
      const localNextStateIn = this.safeNextStateIn;
      const lenNext = nextState ? Math.min(nextState.length, inputDim) : 0;
      for (let j = 0; j < inputDim; j++) {
        if (j < lenNext) {
          const v = nextState[j];
           localNextStateIn[j] = Number.isFinite(v) ? v : 0;
        } else {
           localNextStateIn[j] = 0;
        }
      }

      for (let i = 0; i < latentDim; i++) {
          const error = s_hat[i] - s_next[i];
          const stableError = Math.max(-0.9, Math.min(0.9, error));
          const gradient = stableError * (1 - s_next[i] * s_next[i]);
          const offset = i * inputDim;
          const factor = lrContribution * gradient;
          for (let j = 0; j < inputDim; j++) {
              encWeights[offset + j] -= factor * localNextStateIn[j];
          }
      }
    }

    // Dual regularized sparse manifold pruning (L1/L2 decay check to optimize representation boundaries)
    if (Math.random() > 0.95) {
      const totalElements = latentDim * combDim;
      for (let idx = 0; idx < totalElements; idx++) {
        weights[idx] *= 0.9992; // L2 Weight Decay
        const val = weights[idx];
        if (val < 0.00008 && val > -0.00008) {
          weights[idx] = 0; // L1 Hard Threshold Sparsity
        }
      }
    }
  }

  public calibrate(factor: number) {
    this.learningRate = Math.max(0.001, Math.min(0.05, this.learningRate * factor));
  }

  public setLearningRate(rate: number) {
    this.learningRate = Math.max(0.001, Math.min(0.1, rate));
  }

  public getMetrics() {
    try {
      const count = this.energyHistoryCount;
      if (count === 0) {
        return {
          avgEnergy: 0,
          currentEnergy: 0,
          uncertaintyVariance: 0,
          latentState: this.lastLatentPredictionJS
        };
      }
      
      let sum = 0;
      for (let i = 0; i < count; i++) {
        sum += this.energyHistory[i];
      }
      const avgEnergy = sum / count;

      let varianceSum = 0;
      for (let i = 0; i < count; i++) {
        const diff = this.energyHistory[i] - avgEnergy;
        varianceSum += diff * diff;
      }
      const variance = varianceSum / count;

      // Find current active energy (slot immediately prior to the pointer)
      const lastIndex = (this.energyHistoryPtr - 1 + 100) % 100;
      const currentEnergy = this.energyHistory[lastIndex];

      return {
        avgEnergy: Number((avgEnergy || 0).toFixed(5)),
        currentEnergy: Number((currentEnergy || 0).toFixed(5)),
        uncertaintyVariance: Number((variance || 0).toFixed(6)),
        latentState: this.lastLatentPredictionJS
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

