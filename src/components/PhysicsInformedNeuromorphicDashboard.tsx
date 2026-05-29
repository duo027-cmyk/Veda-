// src/components/PhysicsInformedNeuromorphicDashboard.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Zap, Activity, ShieldAlert, Award, Play } from 'lucide-react';
import { BrainData } from '../types';
import { vedaService } from '../services/vedaService';

interface PINCNeuron {
  id: string;
  name: string;
  potential: number;
  spikeCount: number;
  refractory: boolean;
  strengthIndex: number;
}

interface PINCSynapse {
  preId: string;
  postId: string;
  weight: number;
  delta: number;
}

export const PhysicsInformedNeuromorphicDashboard: React.FC<{ data: BrainData | null }> = ({ data }) => {
  const [pulsingNeuron, setPulsingNeuron] = useState<string | null>(null);

  if (!data || !data.pinc) {
    return (
      <div className="clean-card p-6 flex flex-col justify-center items-center text-center">
        <Cpu className="w-8 h-8 text-neutral-600 animate-pulse mb-2" />
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-500">
          Neuromorphic Lattice Core offline.
        </p>
      </div>
    );
  }

  const pinc = data.pinc;
  const neurons: PINCNeuron[] = pinc.neurons || [];
  const synapses: PINCSynapse[] = pinc.synapses || [];

  const handleStimulate = async (neuronId: string) => {
    setPulsingNeuron(neuronId);
    setTimeout(() => setPulsingNeuron(null), 500);

    try {
      // Somatosensory pulse current injection via direct VEDA actions
      await vedaService.postAction({
        action: 'injectSensoryData',
        params: {
          source: 'NEUROMORPHIC_HUD_STIMULATION',
          modulations: [],
          coherences: [0.99],
          physicsModulator: 0.85,
          neuronTarget: neuronId,
          stimulationAmplitude: 0.75
        }
      });
    } catch (err) {
      console.warn("Failed to inject soma current to unit: " + neuronId, err);
    }
  };

  return (
    <div className="ghibli-glass mano-border p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden rounded-2xl bg-neutral-950/40">
      {/* Decorative Matrix Background line */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />

      {/* Title & Metadata Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-display uppercase tracking-[0.3em] text-white/90">
              物理約束神經形態芯片 (PINC Array)
            </h3>
            <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 mt-1">
              Physics-Informed Neuromorphic Silicon Telemetry Core
            </p>
          </div>
        </div>

        {/* Real-time status tags */}
        <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-wider">
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
            <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping" />
            Active 60Hz Clock
          </span>
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            FEP-STDP Enabled
          </span>
        </div>
      </div>

      {/* Physics-informed Metabolic Dashboard Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-mono text-neutral-500 tracking-[0.1em] uppercase">Metabolic Compute Savings</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-display text-emerald-400 font-bold">
              {pinc.metabolicSavingsPercent}%
            </span>
            <span className="text-[8px] text-neutral-400 font-mono">ops/sec saved</span>
          </div>
          <div className="w-full h-1 bg-neutral-900 rounded-full mt-1 overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-400" 
              animate={{ width: `${pinc.metabolicSavingsPercent}%` }} 
              transition={{ type: 'spring' }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-mono text-neutral-500 tracking-[0.1em] uppercase">Variational FEP Regulator</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-display text-cyan-400 font-bold">
              {(1 / pinc.freeEnergyPrecisionModulation).toFixed(2)}x
            </span>
            <span className="text-[8px] text-neutral-400 font-mono">precision scale</span>
          </div>
          <div className="w-full h-1 bg-neutral-900 rounded-full mt-1 overflow-hidden">
            <motion.div 
              className="h-full bg-cyan-400" 
              animate={{ width: `${Math.min(100, (1 / (pinc.freeEnergyPrecisionModulation || 1)) * 50)}%` }} 
              transition={{ type: 'spring' }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-mono text-neutral-500 tracking-[0.1em] uppercase">Neural Spikes Count</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-display text-white/90">
              {pinc.totalSpikeCount.toLocaleString()}
            </span>
            <span className="text-[8px] text-neutral-400 font-mono">active spikes</span>
          </div>
          <div className="text-[8px] text-neutral-500 font-mono">Event-driven triggers only</div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-mono text-neutral-500 tracking-[0.1em] uppercase">Average Potential</span>
          <span className="text-xl font-display text-gold">
            {(pinc.averagePotential * 100).toFixed(1)}mV
          </span>
          <div className="text-[8px] text-gold/40 font-mono">Avg polarization polarization</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Silicon Node Array Matrix Grid */}
        <div className="lg:col-span-12 flex flex-col gap-3">
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-cyan-400" /> Silicon Neuron Polarization Gating Matrix
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {neurons.map((neuron) => {
              const isPulsing = pulsingNeuron === neuron.id || neuron.potential >= 0.8;
              let potentialColor = 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20';
              if (neuron.refractory) {
                potentialColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse';
              } else if (neuron.potential > 0.7) {
                potentialColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
              }

              return (
                <div 
                  key={neuron.id}
                  className={`p-4 bg-black/60 rounded-xl border transition-all duration-300 relative overflow-hidden group ${
                    isPulsing ? 'border-cyan-400 shadow-lg shadow-cyan-400/5' : 'border-white/5'
                  }`}
                >
                  {/* Realtime voltage indicator sweep line */}
                  <motion.div 
                    className="absolute inset-0 bg-cyan-400/5 pointer-events-none" 
                    animate={{ x: isPulsing ? ['-100%', '100%'] : '100%' }}
                    transition={{ duration: 0.5 }}
                  />

                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] font-mono text-neutral-500">{neuron.id}</span>
                    <button
                      onClick={() => handleStimulate(neuron.id)}
                      className="px-2 py-0.5 bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-500/20 text-cyan-400 text-[8px] font-mono uppercase rounded transition-all flex items-center gap-1"
                      title="Inject external sensory charge"
                    >
                      <Play className="w-2 h-2 fill-cyan-400" />
                      Stim
                    </button>
                  </div>

                  <p className="text-xs font-display font-medium text-white/90 line-clamp-1 truncate mb-2">
                    {neuron.name}
                  </p>

                  <div className="space-y-2 mt-4">
                    {/* Voltage Potential Progress Bar */}
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-neutral-500">Membrane V:</span>
                      <span className={neuron.refractory ? 'text-rose-400' : 'text-cyan-300'}>
                        {neuron.refractory ? 'REFRACTORY' : `${(neuron.potential * 100).toFixed(0)} / 100 mV`}
                      </span>
                    </div>

                    <div className="h-1 bg-neutral-900 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full ${neuron.refractory ? 'bg-rose-400' : 'bg-gradient-to-r from-cyan-400 to-amber-400'}`}
                        animate={{ width: neuron.refractory ? '100%' : `${neuron.potential * 100}%` }}
                        transition={{ type: 'spring', damping: 25 }}
                      />
                    </div>

                    <div className="flex justify-between text-[8px] font-mono text-neutral-500">
                      <span>Spikes: {neuron.spikeCount}</span>
                      <span>Decay Scale: {neuron.strengthIndex.toFixed(2)}x</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Synaptic Pathway Weights (STDP) */}
        {synapses.length > 0 && (
          <div className="lg:col-span-12 flex flex-col gap-3 pt-4 border-t border-white/5">
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-gold" /> Temporal Link Plasticity (STDP Learning Map)
            </span>
            <div className="max-h-60 overflow-y-auto w-full rounded-xl border border-white/5 scrollbar-none">
              <table className="w-full text-left border-collapse text-[9px] font-mono">
                <thead>
                  <tr className="bg-white/5 text-neutral-500 uppercase tracking-widest border-b border-white/5">
                    <th className="py-2.5 px-4 font-normal">Pre-Synapse Neuron</th>
                    <th className="py-2.5 px-4 font-normal">POST-Synapse Neuron</th>
                    <th className="py-2.5 px-4 font-normal">Synaptic Coupling Weight</th>
                    <th className="py-2.5 px-4 font-normal">Last STDP delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-black/30">
                  {synapses.map((syn, idx) => (
                    <tr key={`${syn.preId}-${syn.postId}-${idx}`} className="hover:bg-white/5 transition-all">
                      <td className="py-2 px-4 text-cyan-300 font-bold">{syn.preId}</td>
                      <td className="py-2 px-4 text-amber-400 font-bold">{syn.postId}</td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white/80 font-semibold">{(syn.weight).toFixed(4)}</span>
                          <div className="w-16 h-1 bg-neutral-900 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-400" style={{ width: `${Math.min(100, (syn.weight / 1.5) * 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className={`py-2 px-4 font-bold ${syn.delta > 0 ? 'text-emerald-400' : syn.delta < 0 ? 'text-rose-400 font-light' : 'text-neutral-600'}`}>
                        {syn.delta !== 0 ? (syn.delta > 0 ? '+' : '') + syn.delta.toFixed(5) : '0.00000'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 text-neutral-400 text-[10px] bg-red-600/5 p-4 rounded-xl border border-red-500/10 font-mono mt-4 leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
        <p>
          <strong className="text-white">AGI v6.0 Decoupling Constraint Check:</strong> This interface displays a direct micro-hardware trace of our server-authoritative cognitive substrate. STDP pathways adapt in real-time strictly through pre/post firing dynamics.
        </p>
      </div>
    </div>
  );
};
