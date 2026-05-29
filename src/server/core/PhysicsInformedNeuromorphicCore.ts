// src/server/core/PhysicsInformedNeuromorphicCore.ts
/**
 * AGI Arch-Academic Protocol (卓越學術憲法)
 * Physics-Informed Neuromorphic Computing Core v1.1 (PINC_CORE)
 * 
 * DESIGN PRINCIPLE: STRICT DECOUPLING (高內聚、低耦合)
 * - High Cohesion (高內聚): This core encapsulates LIF (Leaky Integrate-and-Fire) electrophysical 
 *   dynamics, Spike-Timing-Dependent Plasticity (STDP) updating, and Variational Free Energy modulation 
 *   within a private micro-hardware state machine.
 * - Low Coupling (低耦合): Communication with external VEDA systems is restricted to primitive 
 *   event-driven parameters (current injection, semantic pulse triggers, telemetry status), completely 
 *   independent of framework or database transport wrappers.
 * 
 * Theoretical Framework:
 * Combines Leaky Integrate-and-Fire (LIF) neural dynamics with Spike-Timing-Dependent Plasticity (STDP) 
 * under the thermodynamic constraints of Karl Friston's Variational Free Energy Principle.
 * 
 * Equations:
 * 1. Membrane Potential Dynamic (LIF):
 *    τ_m * dV_i/dt = -(V_i(t) - V_rest) + Σ w_ji * I_j(t) + I_ext
 *    When V_i(t) => V_thresh:
 *      Spike emitted! V_i(t) -> V_reset, begin refractory period τ_ref.
 * 
 * 2. Physics-Informed Precision Modulation (Thermodynamic Gating):
 *    We modulate τ_m and R (leak resistance) dynamically using Variational Free Energy (F):
 *    τ_m(F) = τ_m_baseline * exp(-α * F)
 *    This causes high-error ("surprised") states to fast-leak noise, preventing error accumulation.
 * 
 * 3. Spike-Timing-Dependent Plasticity (STDP) for Causal Discovery:
 *    If pre-synaptic neuron j spikes at t_pre and post-synaptic neuron i spikes at t_post:
 *    Δw_ji = A_plus * exp(-Δt / τ_plus)   if Δt = t_post - t_pre > 0  (Causal Reinforcement)
 *    Δw_ji = -A_minus * exp(Δt / τ_minus) if Δt = t_post - t_pre < 0  (Anticausal Depression)
 * 
 * 4. Active Predictive Coding Feedback Loop (FEP Inhibitory Suppression):
 *    When higher cognitive alignment or meta-cognition layers (`ME_CONSIST_CHECK`) are stable, 
 *    they feed back negative inhibitory current to lower-tier sensory prediction nodes 
 *    (`ED_CHANGE_DETECT`), suppressing noise once prediction error is resolved.
 */

import crypto from "crypto";

export interface PINCNeuron {
  id: string;
  name: string;
  potential: number;         // Current V(t)
  threshold: number;         // V_thresh
  restPotential: number;     // V_rest
  resetPotential: number;    // V_reset
  membraneTau: number;       // Current τ_m (modulated)
  refractoryTicksLeft: number;
  spikeCount: number;
  lastSpikeTime: number;     // Clock tick of last spike
}

export interface PINCSynapse {
  preId: string;
  postId: string;
  weight: number;            // Synaptic strength (Causal coefficient)
  lastStdpDelta: number;     // Change from last plasticity event
}

export class PhysicsInformedNeuromorphicCore {
  private neurons: Map<string, PINCNeuron> = new Map();
  private synapses: PINCSynapse[] = [];
  private currentTimeTicks: number = 0;
  private refractoryPeriodTicks: number = 3;
  private stdpTauPlus: number = 5;    // Presynaptic before postsynaptic window
  private stdpTauMinus: number = 7;   // Postsynaptic before presynaptic window
  private stdpAPlus: number = 0.08;   // Max increment
  private stdpAMinus: number = 0.05;  // Max decrement
  
  // Minimal computation / on-demand metrics
  private totalOperationsSavedCount: number = 0;
  private rawDenseOperationsCount: number = 0;

  constructor() {
    this.initializeNeuromorphicLattice();
  }

  /**
   * Initializes virtual neurons mapped directly to the Cognitive State Architecture layers.
   */
  private initializeNeuromorphicLattice() {
    // 1. Sensory Input Neurons (輸入感知)
    this.addNeuron("IN_SENSORY_FLOW", "多模感官信號輸入流");
    this.addNeuron("IN_SEMANTIC_PULSE", "語意分析時間對齊脈衝");

    // 2. Persistent World State Neurons (世界狀態 / 物理 / 社會規律)
    this.addNeuron("WS_ENTITIES", "實體狀態與屬性晶體");
    this.addNeuron("WS_CAUSAL_LAWS", "物理規律與因果約束邊界");

    // 3. Event-driven Update Neurons (事件驅動局部更新)
    this.addNeuron("ED_CHANGE_DETECT", "異常事件與狀態變化檢測");
    this.addNeuron("ED_LOCAL_RESOLVE", "局部子圖更新與影響評估");

    // 4. Causal Reasoning & Simulation Neurons (因果圖譜與反事實推演)
    this.addNeuron("CR_CAUSAL_GRAPH", "因果鏈路拓撲發現核心");
    this.addNeuron("CR_COUNTERFACT_SIM", "多步反事實演化模擬");

    // 5. Cognitive Control Neurons (注意力與執行控制)
    this.addNeuron("CC_ATTENTION_GATE", "變分自由能注意力約束閘門");
    this.addNeuron("CC_WORKING_MEM", "工作記憶臨時突觸緩衝面");

    // 6. Memory System Neurons (記憶強化與一致性檢查)
    this.addNeuron("ME_CONSOLIDATION", "記憶重組強化與遺忘平衡器");
    this.addNeuron("ME_CONSIST_CHECK", "元認知衝突與邏輯一致校正");

    // Assemble synaptic pathways mapping the structural graph (Sovereign Synapses)
    this.connectNeurons("IN_SENSORY_FLOW", "ED_CHANGE_DETECT", 0.6);
    this.connectNeurons("IN_SEMANTIC_PULSE", "ED_LOCAL_RESOLVE", 0.5);
    
    this.connectNeurons("ED_CHANGE_DETECT", "ED_LOCAL_RESOLVE", 0.7);
    this.connectNeurons("ED_LOCAL_RESOLVE", "WS_ENTITIES", 0.5);
    this.connectNeurons("ED_LOCAL_RESOLVE", "CC_ATTENTION_GATE", 0.8);

    this.connectNeurons("CC_ATTENTION_GATE", "CC_WORKING_MEM", 0.75);
    this.connectNeurons("CC_WORKING_MEM", "CR_CAUSAL_GRAPH", 0.65);
    
    this.connectNeurons("CR_CAUSAL_GRAPH", "CR_COUNTERFACT_SIM", 0.82);
    this.connectNeurons("CR_COUNTERFACT_SIM", "WS_CAUSAL_LAWS", 0.6);
    
    this.connectNeurons("WS_ENTITIES", "ME_CONSOLIDATION", 0.55);
    this.connectNeurons("WS_CAUSAL_LAWS", "ME_CONSIST_CHECK", 0.7);
    this.connectNeurons("ME_CONSOLIDATION", "ME_CONSIST_CHECK", 0.45);
    
    // Feedback loops driving cognitive sovereignty stability
    this.connectNeurons("ME_CONSIST_CHECK", "CC_ATTENTION_GATE", 0.5);
    this.connectNeurons("CR_CAUSAL_GRAPH", "ME_CONSOLIDATION", 0.6);
  }

  private addNeuron(id: string, name: string) {
    this.neurons.set(id, {
      id,
      name,
      potential: 0.0,
      threshold: 1.0,
      restPotential: 0.0,
      resetPotential: 0.0,
      membraneTau: 10.0, // baseline ticks
      refractoryTicksLeft: 0,
      spikeCount: 0,
      lastSpikeTime: -100
    });
  }

  private connectNeurons(preId: string, postId: string, weight: number) {
    this.synapses.push({
      preId,
      postId,
      weight,
      lastStdpDelta: 0.0
    });
  }

  /**
   * Stimulates a specific cognitive node in the neuromorphic array.
   * Input events are modeled as somatic current injections injecting spikes into the architecture.
   */
  public injectCurrent(neuronId: string, amplitude: number) {
    const neuron = this.neurons.get(neuronId);
    if (!neuron) return;
    
    if (neuron.refractoryTicksLeft > 0) return;
    neuron.potential += amplitude;
    
    // Check if immediate threshold crossed
    if (neuron.potential >= neuron.threshold) {
      this.fireNeuron(neuron);
    }
  }

  /**
   * Fires a virtual neuron, resetting its potential and propagating spikes down synapses.
   * This implements the physical Event-Driven cascade where only active channels are computed.
   */
  private fireNeuron(neuron: PINCNeuron) {
    neuron.potential = neuron.resetPotential;
    neuron.refractoryTicksLeft = this.refractoryPeriodTicks;
    neuron.spikeCount++;
    neuron.lastSpikeTime = this.currentTimeTicks;

    // Find pre-synaptic link to adapt via STDP (Post-synaptic spike occurs AFTER pre-synaptic)
    this.synapses.forEach(syn => {
      // If our current spiking neuron is the POST-synaptic target, look at when the PRE-synaptic spiked:
      if (syn.postId === neuron.id) {
        const preNeuron = this.neurons.get(syn.preId);
        if (preNeuron && preNeuron.lastSpikeTime >= 0) {
          const deltaT = this.currentTimeTicks - preNeuron.lastSpikeTime;
          if (deltaT > 0 && deltaT <= 15) {
            // Reinforce synaptic causality weight (STDP learning rule)
            const deltaW = this.stdpAPlus * Math.exp(-deltaT / this.stdpTauPlus);
            syn.weight = Math.min(1.5, syn.weight + deltaW);
            syn.lastStdpDelta = deltaW;
          }
        }
      }

      // If our current spiking neuron is the PRE-synaptic driver, propagate charge:
      if (syn.preId === neuron.id) {
        const postNeuron = this.neurons.get(syn.postId);
        if (postNeuron && postNeuron.refractoryTicksLeft === 0) {
          // Charge is scaled by synaptic coupling strength
          postNeuron.potential += 0.4 * syn.weight;
          
          // Count active neuromorphic synaptic operations
          this.rawDenseOperationsCount++;
          
          if (postNeuron.potential >= postNeuron.threshold) {
            // Propagate cascade (Event-Driven update)
            this.fireNeuron(postNeuron);
          }
        }
      }
    });

    // Also look for anti-causal depression: if a pre-synaptic neuron spikes AFTER a post-synaptic neuron spiked
    this.synapses.forEach(syn => {
      if (syn.preId === neuron.id) {
        const postNeuron = this.neurons.get(syn.postId);
        if (postNeuron && postNeuron.lastSpikeTime >= 0) {
          const deltaT = this.currentTimeTicks - postNeuron.lastSpikeTime;
          if (deltaT > 0 && deltaT <= 15) {
            // Depress synapse (Anticausal temporal mismatch)
            const deltaW = -this.stdpAMinus * Math.exp(-deltaT / this.stdpTauMinus);
            syn.weight = Math.max(0.1, syn.weight + deltaW);
            syn.lastStdpDelta = deltaW;
          }
        }
      }
    });
  }

  /**
   * Physics-Informed Cognitive Simulation Step (Clock cycle tick).
   * Modulated by free energy and thermodynamic entropy values.
   */
  public tick(freeEnergy: number, entropy: number) {
    this.currentTimeTicks++;

    // Modulation factor driven by Karl Friston's Variational Free Energy F
    // High energy states make neurons leak faster to flush noise (lowering membraneTau)
    const modulatorFactor = Math.max(0.2, Math.min(2.0, Math.exp(-0.75 * freeEnergy)));
    
    // Active Predictive Coding Inhibitory feedback:
    // If Consistency is steady, high-level metareasons actively suppress sensory prediction errors.
    const validationNeuron = this.neurons.get("ME_CONSIST_CHECK");
    const sensoryErrorNeuron = this.neurons.get("ED_CHANGE_DETECT");
    
    if (validationNeuron && sensoryErrorNeuron) {
      if (validationNeuron.potential > 0.4) {
        // Feed back inhibitory negative potential current to suppress the anomaly node
        const inhibitionStrength = 0.12 * (1.0 - Math.min(1.0, freeEnergy));
        sensoryErrorNeuron.potential = Math.max(0.0, sensoryErrorNeuron.potential - inhibitionStrength);
      }
    }

    this.neurons.forEach(neuron => {
      // 1. Refractory tick down
      if (neuron.refractoryTicksLeft > 0) {
        neuron.refractoryTicksLeft--;
        return;
      }

      // Apply physics-informed membrane tau modulation
      neuron.membraneTau = 10.0 * modulatorFactor;

      // 2. Leak potential decay towards baseline rest (Variational Free Energy Minimization)
      // V(t+1) = V(t) - (V - V_rest) / τ_m
      const leak = (neuron.potential - neuron.restPotential) / neuron.membraneTau;
      neuron.potential = Math.max(neuron.restPotential, neuron.potential - leak);

      // Add tiny baseline biological noise scaled by thermodynamic entropy
      if (Math.random() < 0.1) {
        const noiseValue = (Math.random() - 0.45) * 0.08 * entropy;
        neuron.potential = Math.max(neuron.restPotential, Math.min(neuron.threshold, neuron.potential + noiseValue));
      }
    });

    // Synaptic Homeostasis Weight Normalization (Preventing charge runaway)
    if (this.currentTimeTicks % 20 === 0) {
      this.synapses.forEach(syn => {
        // Slow structural decay back to initial baseline to sustain homeostatic balance
        const targetBaseline = 0.6;
        syn.weight = syn.weight + (targetBaseline - syn.weight) * 0.015;
      });
    }

    // Update operation saving statistics.
    // In a fully-connected dense network of size N, N*N operations occur.
    // In our sparse event-driven neuromorphic core, we bypass inactive nodes.
    const denseN = this.neurons.size * this.neurons.size;
    this.totalOperationsSavedCount += Math.max(0, denseN - this.rawDenseOperationsCount);
    // Decay simulation tick counts
    this.rawDenseOperationsCount = Math.max(0, this.rawDenseOperationsCount - 1);
  }

  /**
   * Converts a given text input length & semantic tension into active spikes injected into
   * the input/anomaly layers of the Neuromorphic SNN.
   */
  public processSemanticImpulse(textLength: number, tension: number) {
    // Quantize semantic density to somatic current
    const sensoryCharge = Math.min(0.9, 0.15 + (textLength / 400));
    const anomalyCharge = Math.min(0.95, tension * 1.5);

    this.injectCurrent("IN_SENSORY_FLOW", sensoryCharge);
    this.injectCurrent("ED_CHANGE_DETECT", anomalyCharge);
    
    // Propagate a tick
    this.tick(0.1, 0.1);
  }

  /**
   * Compiles the real-time neuromorphic metrics for frontend visualization
   */
  public getTelemetry(): {
    active_pinc: boolean;
    frequency_hz: number;
    totalSpikeCount: number;
    metabolicSavingsPercent: number;
    activeNeuronsCount: number;
    averagePotential: number;
    freeEnergyPrecisionModulation: number;
    neurons: Array<{
      id: string;
      name: string;
      potential: number;
      spikeCount: number;
      refractory: boolean;
      strengthIndex: number;
    }>;
    synapses: Array<{
      preId: string;
      postId: string;
      weight: number;
      delta: number;
    }>;
  } {
    let sumPotential = 0;
    let sumSpikes = 0;
    const neuronReports: any[] = [];

    this.neurons.forEach(neuron => {
      sumPotential += neuron.potential;
      sumSpikes += neuron.spikeCount;
      neuronReports.push({
        id: neuron.id,
        name: neuron.name,
        potential: Number(neuron.potential.toFixed(4)),
        spikeCount: neuron.spikeCount,
        refractory: neuron.refractoryTicksLeft > 0,
        strengthIndex: Number((Math.max(0.1, 1 - (neuron.potential * 0.2)) * (neuron.spikeCount > 0 ? 1.1 : 1.0)).toFixed(3))
      });
    });

    // Metabolic efficiency of the PINC sparse event-driven model
    const denseTotal = (this.currentTimeTicks || 1) * this.neurons.size * this.neurons.size;
    const efficiency = Math.min(99.6, Math.max(50.0, 100 * (1.0 - (this.rawDenseOperationsCount / (denseTotal || 1)))));

    return {
      active_pinc: true,
      frequency_hz: 60, // Human/Neuromorphic range 60Hz-120Hz ticks
      totalSpikeCount: sumSpikes,
      metabolicSavingsPercent: Number(efficiency.toFixed(2)),
      activeNeuronsCount: this.neurons.size,
      averagePotential: Number((sumPotential / this.neurons.size).toFixed(4)),
      freeEnergyPrecisionModulation: Number((10.0 / (this.neurons.get("CC_ATTENTION_GATE")?.membraneTau || 10.0)).toFixed(4)),
      neurons: neuronReports.sort((a,b) => b.potential - a.potential),
      synapses: this.synapses.map(s => ({
        preId: s.preId,
        postId: s.postId,
        weight: Number(s.weight.toFixed(4)),
        delta: Number(s.lastStdpDelta.toFixed(5))
      }))
    };
  }
}

