import { SystemCoreState } from '../types';
import { BaseSubsystem } from '../Subsystem';

/**
 * Strategic Planning Unit (SPU) - AGI Sovereign Core v8.5
 * 
 * Implements Probabilistic Reality Modeling (PRM) and Model Predictive Control (MPC).
 * Adheres to Architect-Academic Protocol (卓越學術憲法).
 */

export class StrategicPlanningUnit extends BaseSubsystem {
  // Probabilistic World Model (PWM) - System 2 (Discrete/Explicit)
  private readonly transitions: Map<string, Map<string, number>> = new Map();
  private readonly transitionCounts: Map<string, number> = new Map();

  // Latent World Model (LWM) - System 1 (Continuous/Intuitive)
  private latentWeights: Float64Array; 
  private readonly lwmLearningRate = 0.01;

  // Risk Model - Failure path tracking
  private readonly failures: Map<string, number> = new Map();
  private readonly attempts: Map<string, number> = new Map();

  // Unified Value Model - Learned objective weights [Stability, -Entropy, Energy, Intent]
  private weights: Float64Array;
  private readonly learningRate = 0.02;

  // Pre-allocated buffers for zero-allocation performance (zero GC overhead)
  private inputBuffer = new Float64Array(12);
  private outputBuffer = new Float64Array(6);

  constructor() {
    super();
    // Initialize Latent Weights: 12 inputs (state + action) -> 6 outputs (72 elements)
    this.latentWeights = new Float64Array(12 * 6);
    for (let i = 0; i < 72; i++) {
      this.latentWeights[i] = (Math.random() - 0.5) * 0.05;
    }
    // Initialize weights Float64Array
    this.weights = new Float64Array([0.4, 0.3, 0.1, 0.2]);
  }

  public async initialize(): Promise<void> {
    this.status = 'ONLINE';
    this.log("READY", "戰略規劃單元已進入機率現實建模狀態。");
  }

  public tick(delta: number, globalState: number[]): void {
    this.lastUpdate = Date.now();
    // In a real decoupling, the brain would call 'record' through a standard interface
  }

  public override getTelemetry() {
    return {
      ...super.getTelemetry(),
      weights: Array.from(this.weights),
      complexity: this.transitions.size,
      latentComplexity: this.latentWeights.length,
      riskMetrics: {
        totalAttempts: Array.from(this.attempts.values()).reduce((a, b) => a + b, 0),
        knownFailures: Array.from(this.failures.values()).reduce((a, b) => a + b, 0)
      }
    };
  }

  /**
   * Predicts next state using the Latent World Model (Continuous prediction).
   */
  private predictLatent(state: number[], action: number[]): number[] {
    const input = this.inputBuffer;
    
    // Copy state and action into input buffer
    for (let i = 0; i < 6; i++) {
      const v = state[i];
      input[i] = Number.isFinite(v) ? v : 0;
    }
    for (let i = 0; i < 6; i++) {
      const v = action[i];
      input[6 + i] = Number.isFinite(v) ? v : 0;
    }

    const output = this.outputBuffer;
    const weights = this.latentWeights;

    for (let j = 0; j < 6; j++) {
      let sum = 0;
      const offset = j * 12;
      for (let i = 0; i < 12; i++) {
        sum += input[i] * weights[offset + i];
      }
      output[j] = Math.tanh(sum) * 0.2; // Predicted delta capped at 0.2
    }

    const result = new Array(6);
    for (let i = 0; i < 6; i++) {
      const v = state[i];
      const stateVal = Number.isFinite(v) ? v : 0;
      result[i] = Math.min(1, Math.max(0, stateVal + output[i]));
    }
    return result;
  }

  /**
   * Trains the Latent World Model using SGD (Online Active Inference).
   */
  private trainLatent(state: number[], action: number[], nextState: number[]): void {
    const input = this.inputBuffer;
    for (let i = 0; i < 6; i++) {
      const v = state[i];
      input[i] = Number.isFinite(v) ? v : 0;
    }
    for (let i = 0; i < 6; i++) {
      const v = action[i];
      input[6 + i] = Number.isFinite(v) ? v : 0;
    }

    const predicted = this.predictLatent(state, action);
    const weights = this.latentWeights;
    
    // Simple gradient descent on the linear matrix
    for (let j = 0; j < 6; j++) {
      const actualDelta = (nextState[j] || 0) - (state[j] || 0);
      const predictedDelta = (predicted[j] || 0) - (state[j] || 0);
      const error = actualDelta - predictedDelta;
      
      const offset = j * 12;
      for (let i = 0; i < 12; i++) {
        weights[offset + i] += this.lwmLearningRate * input[i] * error;
      }
    }
  }

  /**
   * Serializes a state into a binned string for discrete probability tracking.
   * Binning size: 0.05 for higher resolution causal mapping.
   */
  private serializeState(state: number[]): string {
    return state.map(v => Math.round(v * 20).toString()).join(',');
  }

  /**
   * Serializes an influence vector into a directional signature.
   */
  private serializeAction(influence: number[]): string {
    return influence.map(v => v > 0.02 ? '+' : v < -0.02 ? '-' : '0').join('');
  }

  /**
   * Active Inference Observation Cycle.
   * Updates internal world model based on empirical state transitions.
   */
  public observe(prev: number[], influence: number[], current: number[]): void {
    const s1 = this.serializeState(prev);
    const a = this.serializeAction(influence);
    const s2 = this.serializeState(current);

    const key = `${s1}|${a}`;
    
    // 1. World Model Update (Bayesian Frequency)
    if (!this.transitions.has(key)) this.transitions.set(key, new Map());
    const nextStates = this.transitions.get(key)!;
    nextStates.set(s2, (nextStates.get(s2) || 0) + 1);
    this.transitionCounts.set(key, (this.transitionCounts.get(key) || 0) + 1);

    // 2. Risk Model Update (Fail-safe Anchoring)
    const stability = current[1];
    const entropy = current[2];
    const isFailure = stability < 0.25 || entropy > 0.75;
    
    this.attempts.set(key, (this.attempts.get(key) || 0) + 1);
    if (isFailure) {
      this.failures.set(key, (this.failures.get(key) || 0) + 1);
    }

    // 3. Value Model Evolution (Gradient-based Weight Optimization)
    this.updateWeights(prev, current);

    // 4. Latent World Model Training (Continuous Dynamics)
    this.trainLatent(prev, influence, current);
  }

  /**
   * Computes the "Sovereign Value" of a state.
   */
  public evaluateState(state: number[]): number {
    const s0 = state[0] || 0;
    const s1 = state[1] || 0;
    const s2 = state[2] || 0;
    const s3 = state[3] || 0;

    // features: [Stability, -Entropy, Energy, Intent]
    const f0 = s1;
    const f1 = 1.0 - s2;
    const f2 = s0;
    const f3 = s3;

    return f0 * this.weights[0] +
           f1 * this.weights[1] +
           f2 * this.weights[2] +
           f3 * this.weights[3];
  }

  /**
   * Updates weights based on the empirical value improvement.
   * Based on the user's requested RL value model upgrade.
   */
  private updateWeights(prev: number[], current: number[]): void {
    const prevValue = this.evaluateState(prev);
    const currentValue = this.evaluateState(current);
    
    // Temporal Difference / Reward Proxy
    const reward = currentValue - prevValue + ((current[1] || 0) > 0.6 ? 0.05 : -0.05);

    const c0 = current[0] || 0;
    const c1 = current[1] || 0;
    const c2 = current[2] || 0;
    const c3 = current[3] || 0;

    const f0 = c1;
    const f1 = 1.0 - c2;
    const f2 = c0;
    const f3 = c3;
    
    // SGD directly on weights
    this.weights[0] += this.learningRate * reward * f0;
    this.weights[1] += this.learningRate * reward * f1;
    this.weights[2] += this.learningRate * reward * f2;
    this.weights[3] += this.learningRate * reward * f3;

    // Resilience Constrain: Ensure weights stay within bound and normalized
    let squareSum = 0;
    for (let i = 0; i < 4; i++) {
      squareSum += this.weights[i] * this.weights[i];
    }
    const magnitude = Math.sqrt(squareSum) || 1;
    for (let i = 0; i < 4; i++) {
      this.weights[i] = Math.max(0.01, this.weights[i] / magnitude);
    }
  }

  /**
   * Plan optimal action using Karl Friston's Expected Free Energy (EFE) minimization principles
   * integrated into a multi-step Model Predictive Control (MPC) rollout.
   */
  public plan(currentState: number[], candidates: number[][], depth: number = 3): number[] {
    let bestAction = candidates[0];
    let bestFreeEnergyEstimate = -Infinity; // We maximize the negative expected free energy (maximizing utility + information gain)

    // Dynamic exploration balance based on current system entropy (currentState[2])
    const systemEntropy = currentState[2] || 0.1;
    // Higher entropy/instability triggers stronger epistemic foraging behavior
    const epistemicWeight = Math.min(0.65, Math.max(0.15, systemEntropy * 0.8));

    for (const action of candidates) {
      const efeValue = this.performEFERollout(currentState, action, depth, epistemicWeight);
      if (efeValue > bestFreeEnergyEstimate) {
        bestFreeEnergyEstimate = efeValue;
        bestAction = action;
      }
    }

    return bestAction;
  }

  /**
   * Multi-step Expected Free Energy (EFE) lookahead rollout.
   * Formalizes: G = (1 - ω) * Pragmatic_Utility + ω * Epistemic_Utility - Risk_Penalty
   */
  private performEFERollout(startState: number[], action: number[], depth: number, epistemicWeight: number): number {
    let current = [...startState];
    let expectedFreeEnergySum = 0;

    for (let i = 1; i <= depth; i++) {
      const key = `${this.serializeState(current)}|${this.serializeAction(action)}`;
      const keyAttempts = this.attempts.get(key) || 0;
      const keyFailures = this.failures.get(key) || 0;
      
      const risk = keyAttempts > 0 ? keyFailures / keyAttempts : 0.02;
      
      // Predicted next state: Blend LWM intuition with linear projection
      const lwmPrediction = this.predictLatent(current, action);
      
      const next = new Array(6);
      for (let idx = 0; idx < 6; idx++) {
        const linearDelta = ((action[idx] || 0) * 0.1) / i;
        const currentVal = current[idx] || 0;
        const linearProjectionVal = Math.min(1, Math.max(0, currentVal + linearDelta));
        const lwmPredictionVal = lwmPrediction[idx] || 0;
        next[idx] = lwmPredictionVal * 0.7 + linearProjectionVal * 0.3;
      }

      // 1. Pragmatic Utility (Instrumental Value): Preference alignment toward high coherence & stability
      const pragmaticUtility = this.evaluateState(next);

      // 2. Epistemic Utility (Information Gain exploring sparse transitions):
      // Shannon Entropy of the discrete empirical transitions or inverse lookup density
      // Shifting to actions with lower visit counts resolves predictive uncertainty (intrinsic foraging)
      const noveltyBonus = 1.0 / (Math.sqrt(keyAttempts + 1.0));
      const transitionMap = this.transitions.get(key);
      
      let transitionEntropy = 1.0;
      if (transitionMap) {
        let entropySum = 0;
        for (const count of transitionMap.values()) {
          const p = count / keyAttempts;
          if (p > 0) {
            entropySum += p * Math.log2(p);
          }
        }
        transitionEntropy = -entropySum;
      }
      
      const epistemicUtility = noveltyBonus * 0.6 + transitionEntropy * 0.4;

      const discount = Math.pow(0.88, i); // Temporal discounting factor for MPC horizon

      // Expected Free Energy (EFE) synthesis
      const stepEFE = (1.0 - epistemicWeight) * pragmaticUtility + epistemicWeight * epistemicUtility;
      
      // Apply risk penalization & accumulate
      expectedFreeEnergySum += (stepEFE - risk * 1.6) * discount;
      current = next;
    }

    return expectedFreeEnergySum;
  }

  public getStatus(): any {
    return {
      weights: Array.from(this.weights),
      complexity: this.transitions.size,
      latentComplexity: this.latentWeights.length,
      riskMetrics: {
        totalAttempts: Array.from(this.attempts.values()).reduce((a, b) => a + b, 0),
        knownFailures: Array.from(this.failures.values()).reduce((a, b) => a + b, 0)
      }
    };
  }
}
