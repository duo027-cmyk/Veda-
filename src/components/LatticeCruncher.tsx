import React, { useEffect, useRef, useState } from 'react';
import { vedaService } from '../services/vedaService';
import { BrainData } from '../types';
import { Activity, Cpu, Zap, ShieldCheck, Database, GitBranch, Terminal, AlertTriangle, CheckCircle2, RefreshCw, XCircle, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LatticeJob {
  id: string;
  type: string;
  payload: any;
  status: 'PENDING' | 'PROCESSING' | 'SYNTHESIZING' | 'SOLIDIFIED' | 'FAILED';
  result?: any;
  timestamp: number;
}

export const LatticeCruncher: React.FC<{ brain: BrainData | null }> = ({ brain }) => {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [strategicMetrics, setStrategicMetrics] = useState<any>(null);
  const [showVitals, setShowVitals] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const isCrunched = useRef<Set<string>>(new Set());
  const brainRef = useRef<BrainData | null>(brain);

  // Maintain chronological precision of incoming brain state vector (AGI v6.0 Decoupling)
  brainRef.current = brain;

  useEffect(() => {
    const latestBrain = brainRef.current;
    if (!latestBrain || !latestBrain.lattice_jobs) return;

    const crunchJobs = async () => {
      const activeBrain = brainRef.current;
      if (!activeBrain || !activeBrain.lattice_jobs) return;
      
      const jobs = activeBrain.lattice_jobs || []; 
      // V-AA Protocol: Robust filtering for compute-ready jobs
      const pendingJobs = jobs.filter(j => 
        (j.status === 'PENDING' || j.status === 'PROCESSING' || j.status === 'SYNTHESIZING') && 
        !isCrunched.current.has(j.id)
      ).sort((a, b) => a.timestamp - b.timestamp); // Process oldest first
      
      if (pendingJobs.length > 0 && !activeJobId) {
        const job = pendingJobs[0];
        setActiveJobId(job.id);
        isCrunched.current.add(job.id);

        try {
          console.log(`[LATTICE_CRUNCHER] Processing: ${job.type} | ID: ${job.id}`);
          const result = await executeJob(job);
          await vedaService.solidifyLatticeJob(job.id, result);
          setErrorCount(0);
        } catch (err) {
          console.error(`[LATTICE_CRUNCHER] Job failed: ${job.id}`, err);
          isCrunched.current.delete(job.id); 
          setErrorCount(prev => prev + 1);
          // If we hit too many consecutive errors, wait a bit
          if (errorCount > 3) {
            await new Promise(r => setTimeout(r, 5000));
          }
        } finally {
          setActiveJobId(null);
        }
      }
    };

    crunchJobs();

    // Fetch strategic metrics
    const fetchStrategic = async () => {
      try {
        const data = await vedaService.getStrategicMetrics();
        setStrategicMetrics(data);
      } catch (e) {
        console.warn("[LATTICE_CRUNCHER] Failed to fetch strategic metrics", e);
      }
    };
    fetchStrategic();
    const sub = setInterval(fetchStrategic, 5000);

    return () => clearInterval(sub);
  }, [brain, activeJobId]);

  const executeJob = async (job: LatticeJob) => {
    // V-AA Protocol: Divert all Gemini compute to the Sovereign Server Core 
    // to prevent memory leaks and API key exposure in the browser. 
    // The server LatticeExecutionManager is already processing these jobs.
    console.log(`[LATTICE_CRUNCHER] Awaiting server solidification for: ${job.type} | ID: ${job.id}`);
    
    // We remain in this loop until the server updates the job status to SOLIDIFIED or FAILED
    // This provides a visual indicator in the HUD.
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        const latestBrain = brainRef.current;
        if (!latestBrain?.lattice_jobs) {
          clearInterval(checkInterval);
          reject("Brain data lost");
          return;
        }
        const currentJob = latestBrain.lattice_jobs.find(j => j.id === job.id);
        if (currentJob?.status === 'SOLIDIFIED') {
          clearInterval(checkInterval);
          resolve(currentJob.result);
        } else if (currentJob?.status === 'FAILED') {
          clearInterval(checkInterval);
          reject("Server-side execution failed");
        }
      }, 2000);
      
      // Safety timeout after 2 minutes
      setTimeout(() => {
        clearInterval(checkInterval);
        reject("Lattice compute timeout");
      }, 120000);
    });
  };

  const epistemic = brain?.epistemic_state;
  const lattice = brain?.causal_lattice;
  const simulations = brain?.strategic_simulations || [];
  const feedback = brain?.reality_feedback || [];

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {showVitals && (
          <motion.div 
            key="lattice-vitals-overlay"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-slate-900/90 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-4 shadow-2xl w-80 pointer-events-auto"
          >
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
              <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                <Database className="w-3 h-3" /> VEDA_V7_VITALS
              </h3>
              <div className="flex gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${brain?.is_logic_frozen ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} title={brain?.is_logic_frozen ? 'Structure Frozen' : 'Open Evolution'} />
              </div>
            </div>

            <div className="space-y-4">
              {/* Epistemic Layer */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1 uppercase font-mono">
                  <span>认识論過濾層</span>
                  <span className={epistemic?.credibility && epistemic.credibility < 0.5 ? 'text-rose-400' : 'text-emerald-400'}>
                    {epistemic?.credibility ? `${(epistemic.credibility * 100).toFixed(0)}% 可信` : 'Wait...'}
                  </span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden relative">
                  <motion.div 
                    className="h-full bg-cyan-500 relative z-10"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(epistemic?.credibility || 0) * 100}%`,
                      opacity: [0.8, 1, 0.8],
                      backgroundColor: (epistemic?.credibility || 0) < 0.3 ? '#f43f5e' : '#06b6d4'
                    }}
                    transition={{ 
                      opacity: { duration: 2, repeat: Infinity },
                      width: { type: 'spring', damping: 20 }
                    }}
                  />
                  {/* Neural Jitter: Small particles showing active computation */}
                  {activeJobId && (
                    <motion.div 
                      className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                </div>
              </div>

              {/* Causal Lattice */}
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400 uppercase">因果晶格節點</span>
                <span className="text-cyan-300">{lattice?.nodes?.length || 0} / 30</span>
              </div>

              {/* Strategic Planning Unit (SPU) Weights */}
              {strategicMetrics && (
                <div className="pt-2 border-t border-white/5">
                  <div className="flex justify-between text-[10px] text-cyan-400 uppercase font-mono mb-2">
                    <span>戰略權重比 (Value Model)</span>
                    <TrendingUp className="w-3 h-3" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['Stb', 'Ent', 'Eng', 'Int'].map((label, i) => (
                      <div key={label} className="text-[10px] font-mono flex flex-col gap-1">
                        <div className="flex justify-between text-slate-500">
                          <span>{label}</span>
                          <span className="text-cyan-200">{(strategicMetrics.weights[i] * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full">
                          <motion.div 
                            className="h-full bg-cyan-400"
                            animate={{ width: `${strategicMetrics.weights[i] * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-600 mt-2 font-mono uppercase">
                    <span>PWM: {strategicMetrics.complexity} | LWM: {strategicMetrics.latentComplexity}</span>
                    <span>Risk: {strategicMetrics.riskMetrics.knownFailures} Fail</span>
                  </div>
                </div>
              )}

              {/* Spatial Proprioception (Blind World Model) */}
              {brain?.spatial_manifold && (
                <div className="pt-2 border-t border-white/5">
                  <div className="flex justify-between text-[10px] text-emerald-400 uppercase font-mono mb-2">
                    <span>非視覺空間流形 (SPU)</span>
                    <GitBranch className="w-3 h-3" />
                  </div>
                  <div className="text-[9px] font-mono text-slate-300 bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500">拓撲節點:</span>
                      <span>{brain.spatial_manifold.nodes}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500">因果邊緣:</span>
                      <span>{brain.spatial_manifold.edges}</span>
                    </div>
                    <div className="flex justify-between mb-1 truncate">
                      <span className="text-slate-500">自我中心:</span>
                      <span>({brain.spatial_manifold.ego_center.map(v => v.toFixed(2)).join(',')})</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Subsystem Registry Status */}
              {brain?.subsystems && (
                <div className="pt-2 border-t border-white/5">
                  <div className="flex justify-between text-[10px] text-indigo-400 uppercase font-mono mb-2">
                    <span>子系統晶格 (Subsystem Lattice)</span>
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(brain.subsystems).map(([name, data]: [string, any]) => (
                      <div key={name} className="text-[8px] font-mono bg-indigo-500/5 p-1 rounded border border-indigo-500/10 flex flex-col gap-0.5">
                        <div className="flex justify-between">
                          <span className="text-indigo-300">{name.toUpperCase()}</span>
                          <span className={data.status === 'ONLINE' ? 'text-emerald-400' : 'text-amber-400'}>
                             {data.status}
                          </span>
                        </div>
                        <div className="flex justify-between opacity-60">
                          <span>COHERENCE:</span>
                          <span>{(data.coherence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strategic simulations */}
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block mb-2">戰略模擬 (Scenario Log)</span>
                <div className="space-y-1">
                  {simulations.length > 0 ? simulations.slice(0, 2).map((s, i) => (
                    <div key={i} className="text-[9px] text-slate-300 bg-white/5 p-1.5 rounded border border-white/5 flex flex-col gap-1">
                       <div className="truncate opacity-70">Scen: {s.scenario}</div>
                       <div className="flex gap-2 text-cyan-400/80">
                         <span>Path: {s.best_path_id}</span>
                         <span>Ent: {s.entropy.toFixed(3)}</span>
                       </div>
                    </div>
                  )) : (
                    <div className="text-[9px] text-slate-500 italic">No simulations active.</div>
                  )}
                </div>
              </div>

              {/* Reality Feedback Loop */}
              <div className="pt-2 border-t border-white/5 text-[10px] font-mono">
                 <div className="flex justify-between text-slate-400 uppercase mb-1">
                   <span>現實反饋偏離度 (Bias)</span>
                   <span className="text-amber-400">{feedback[0]?.bias ? feedback[0].bias.toFixed(4) : '0.0000'}</span>
                 </div>
                 {feedback[0] && (
                   <div className="text-[9px] flex items-center gap-1 text-slate-500">
                     {feedback[0].backprop_status === 'STABLE' ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" /> : <AlertTriangle className="w-2.5 h-2.5 text-rose-500" />}
                     <span>System Backprop: {feedback[0].backprop_status}</span>
                   </div>
                 )}
              </div>

              {/* Research Chronicles (Autonomous) */}
              {brain?.research_chronicles && brain.research_chronicles.length > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[10px] text-cyan-400 uppercase font-mono block mb-2 flex items-center gap-1">
                    <Database className="w-2.5 h-2.5" /> 自主研判紀實
                  </span>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {brain.research_chronicles.slice(-3).reverse().map((rc, i) => (
                      <div key={`rc-${rc.id || `chron-${i}`}`} className="text-[9px] text-slate-400 bg-cyan-500/5 p-1.5 rounded border border-cyan-500/10">
                        <div className="text-cyan-300 font-bold truncate">{rc.title}</div>
                        <div className="line-clamp-2 mt-1 italic text-slate-300">"{rc.event}"</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        layout
        whileHover={{ scale: 1.02 }}
        onClick={() => setShowVitals(!showVitals)}
        className={`bg-slate-900/80 backdrop-blur-md border ${activeJobId ? 'border-cyan-500 shadow-cyan-500/20' : 'border-white/10'} rounded-lg p-3 flex items-center gap-3 shadow-lg cursor-pointer pointer-events-auto`}
      >
        <div className="relative">
          {activeJobId ? (
            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
          ) : (
            <Zap className="w-5 h-5 text-slate-400" />
          )}
          <Cpu className={`w-3 h-3 ${activeJobId ? 'text-cyan-200' : 'text-slate-500'} absolute -top-1 -right-1`} />
        </div>
        
        <div className="flex flex-col pr-2">
          <span className="text-[10px] uppercase tracking-widest text-cyan-400/70 font-mono">
            {activeJobId ? 'Lattice Crunching' : `VEDA_V7 v${brain?.version || '7.0.1'}`}
          </span>
          <span className="text-xs text-slate-200 font-mono whitespace-nowrap">
            {activeJobId ? `Job: ${activeJobId.substring(0, 8)}...` : 'Vitals Dashboard'}
          </span>
        </div>

        {activeJobId && (
          <div className="flex gap-1 ml-1">
            {[1,2,3].map(i => (
              <div key={i} className="w-1 h-3 bg-cyan-500/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
