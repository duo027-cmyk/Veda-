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
  private latentWeights: number[][]; 
  private readonly lwmLearningRate = 0.01;

  // Risk Model - Failure path tracking
  private readonly failures: Map<string, number> = new Map();
  private readonly attempts: Map<string, number> = new Map();

  // Unified Value Model - Learned objective weights [Stability, -Entropy, Energy, Intent]
  private weights: number[] = [0.4, 0.3, 0.1, 0.2];
  private readonly learningRate = 0.02;

  constructor() {
    super();
    // Initialize Latent Weights: 12 inputs (state + action) -> 6 outputs
    this.latentWeights = Array.from({ length: 12 }, () => 
      Array.from({ length: 6 }, () => (Math.random() - 0.5) * 0.05)
    );
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
      weights: this.weights,
      complexity: this.transitions.size,
      latentComplexity: this.latentWeights.length * this.latentWeights[0].length,
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
    const input = [...state, ...action];
    const output = new Array(6).fill(0);

    for (let j = 0; j < 6; j++) {
      let sum = 0;
      for (let i = 0; i < input.length; i++) {
        sum += input[i] * this.latentWeights[i][j];
      }
      output[j] = Math.tanh(sum) * 0.2; // Predicted delta capped at 0.2
    }

    return state.map((v, i) => Math.min(1, Math.max(0, v + output[i])));
  }

  /**
   * Trains the Latent World Model using SGD (Online Active Inference).
   */
  private trainLatent(state: number[], action: number[], nextState: number[]): void {
    const input = [...state, ...action];
    const actualDelta = nextState.map((v, i) => v - state[i]);
    
    // Simple gradient descent on the linear matrix
    for (let i = 0; i < input.length; i++) {
      for (let j = 0; j < 6; j++) {
        // Here we assume a linear activation for the gradient update for simplicity
        const predictedDelta = this.predictLatent(state, action)[j] - state[j];
        const error = actualDelta[j] - predictedDelta[j];
        this.latentWeights[i][j] += this.lwmLearningRate * input[i] * error;
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
    const features = [
      state[1],           // Stability
      1.0 - state[2],     // Negative Entropy (Order)
      state[0],           // Energy
      state[3]            // Intent Alignment
    ];

    return features.reduce((acc, val, i) => acc + val * this.weights[i], 0);
  }

  /**
   * Updates weights based on the empirical value improvement.
   * Based on the user's requested RL value model upgrade.
   */
  private updateWeights(prev: number[], current: number[]): void {
    const prevValue = this.evaluateState(prev);
    const currentValue = this.evaluateState(current);
    
    // Temporal Difference / Reward Proxy
    const reward = currentValue - prevValue + (current[1] > 0.6 ? 0.05 : -0.05);

    const features = [current[1], 1.0 - current[2], current[0], current[3]];
    
    // Stochastic Gradient Descent on Weight Space
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i] += this.learningRate * reward * features[i];
    }

    // Resilience Constrain: Ensure weights stay within bound and normalized
    const magnitude = Math.sqrt(this.weights.reduce((a, b) => a + b * b, 0)) || 1;
    this.weights = this.weights.map(w => Math.max(0.01, w / magnitude));
  }

  /**
   * Plan optimal action using Model Predictive Control (MPC).
   */
  public plan(currentState: number[], candidates: number[][], depth: number = 3): number[] {
    let bestAction = candidates[0];
    let bestRolloutValue = -Infinity;

    for (const action of candidates) {
      const value = this.performRollout(currentState, action, depth);
      if (value > bestRolloutValue) {
        bestRolloutValue = value;
        bestAction = action;
      }
    }

    return bestAction;
  }

  /**
   * Multi-step lookahead rollout.
   */
  private performRollout(startState: number[], action: number[], depth: number): number {
    let current = [...startState];
    let accumulatedValue = 0;

    for (let i = 1; i <= depth; i++) {
      const key = `${this.serializeState(current)}|${this.serializeAction(action)}`;
      const keyAttempts = this.attempts.get(key) || 0;
      const keyFailures = this.failures.get(key) || 0;
      
      const risk = keyAttempts > 0 ? keyFailures / keyAttempts : 0.02;
      
      // Predicted next state: Blend LWM intuition with linear projection
      const lwmPrediction = this.predictLatent(current, action);
      const linearProjection = current.map((v, idx) => {
        const delta = (action[idx] || 0) * 0.1 / i;
        return Math.min(1, Math.max(0, v + delta));
      });

      // Gradually trust linear/LWM more depending on depth or state confidence
      const next = lwmPrediction.map((v, idx) => v * 0.7 + linearProjection[idx] * 0.3);

      const stepValue = this.evaluateState(next);
      const discount = Math.pow(0.9, i); // Temporal discounting
      
      // Penalize risk and state uncertainty
      accumulatedValue += (stepValue - risk * 1.5) * discount;
      current = next;
    }

    return accumulatedValue;
  }

  public getStatus(): any {
    return {
      weights: this.weights,
      complexity: this.transitions.size,
      latentComplexity: this.latentWeights.length * this.latentWeights[0].length,
      riskMetrics: {
        totalAttempts: Array.from(this.attempts.values()).reduce((a, b) => a + b, 0),
        knownFailures: Array.from(this.failures.values()).reduce((a, b) => a + b, 0)
      }
    };
  }
}
