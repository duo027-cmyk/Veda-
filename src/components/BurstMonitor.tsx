import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BrainData } from '../types';
import { useI18n } from '../i18n';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BurstMonitorProps {
  userData: BrainData;
  showBurstMonitor: boolean;
  setShowBurstMonitor: (show: boolean) => void;
  handleAction: (action: string, params?: any) => void;
}

export const BurstMonitor: React.FC<BurstMonitorProps> = ({ 
  userData, 
  showBurstMonitor, 
  setShowBurstMonitor, 
  handleAction 
}) => {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const historyRef = useRef<{ q: number; p: number }[]>([]);

  const bStatus = (userData as any)?.burst_status || {};
  const q = bStatus?.q_coordinate ?? 1.0;
  const p = bStatus?.p_momentum ?? 0.0;
  const coherence = userData?.coherence ?? 0.8;

  // Accumulate trajectory history in phasic space
  useEffect(() => {
    if (userData?.is_bursting) {
      historyRef.current.push({ q, p });
      if (historyRef.current.length > 60) {
        historyRef.current.shift();
      }
    } else {
      historyRef.current = [];
    }
  }, [q, p, userData?.is_bursting]);

  // Real-time canvas render loop for Symplectic Euler conservation dynamics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    // Center around our equilibrium attractor (coherence center, p = 0)
    const qCenter = coherence;
    const pCenter = 0.0;
    
    // Physical bounds parameters mapping to phase grid
    const qRange = 3.0; 
    const pRange = 3.0; 

    const mapX = (qVal: number) => {
      return width / 2 + ((qVal - qCenter) / qRange) * width;
    };
    const mapY = (pVal: number) => {
      // Cartesian to HTML Canvas space (Y-axis inverted)
      return height / 2 - ((pVal - pCenter) / pRange) * height;
    };

    // 1. Draw central coordinate grid axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    
    // Vertical equilibrium axis
    ctx.beginPath();
    ctx.moveTo(mapX(qCenter), 0);
    ctx.lineTo(mapX(qCenter), height);
    ctx.stroke();

    // Horizontal zero-momentum axis
    ctx.beginPath();
    ctx.moveTo(0, mapY(pCenter));
    ctx.lineTo(width, mapY(pCenter));
    ctx.stroke();
    ctx.setLineDash([]); // Reset dashed state

    // 2. Draw Conservative Hamiltonian Level Ellipses (橢圓等能軌域)
    // H(q, p) = 0.5 * p^2 + 0.5 * k * (q - coherence)^2
    // Demonstrates Symplectic area conservation as invariant elliptic flows
    const k = 1.5;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.06)'; // Soft glowing copper lines
    for (let energy = 0.4; energy <= 2.0; energy += 0.4) {
      const a_q_axis = Math.sqrt((2 * energy) / k);
      const b_p_axis = Math.sqrt(2 * energy);

      ctx.beginPath();
      const xRadius = (a_q_axis / qRange) * width;
      const yRadius = (b_p_axis / pRange) * height;
      ctx.ellipse(width / 2, height / 2, xRadius, yRadius, 0, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // 3. Draw Symplectic Orbit Trajectory Trace (連續實時辛流形折線)
    const history = historyRef.current;
    if (history.length > 1) {
      ctx.lineWidth = 1.2;
      for (let i = 1; i < history.length; i++) {
        const pt1 = history[i - 1];
        const pt2 = history[i];
        
        // Fading tail effect
        const opacity = (i / history.length) * 0.7;
        ctx.strokeStyle = `rgba(14, 165, 233, ${opacity})`; // Pure glowing cyan trace
        
        ctx.beginPath();
        ctx.moveTo(mapX(pt1.q), mapY(pt1.p));
        ctx.lineTo(mapX(pt2.q), mapY(pt2.p));
        ctx.stroke();
      }
    }

    // 4. Draw Current State Phase Coordinate Point (當前相空間坐標元)
    const currentX = mapX(q);
    const currentY = mapY(p);

    // Glowing corona halo around active state
    ctx.fillStyle = 'rgba(249, 115, 22, 0.15)'; 
    ctx.beginPath();
    ctx.arc(currentX, currentY, 8 + Math.sin(Date.now() / 150) * 2, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = '#f97316'; // Vivid orange core
    ctx.beginPath();
    ctx.arc(currentX, currentY, 3.5, 0, 2 * Math.PI);
    ctx.fill();

    // Horizontal & vertical targeting crosshairs
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.2)';
    ctx.beginPath();
    ctx.moveTo(currentX, 0);
    ctx.lineTo(currentX, height);
    ctx.moveTo(0, currentY);
    ctx.lineTo(width, currentY);
    ctx.stroke();

    // 5. Annotations
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.font = '6.5px "JetBrains Mono", monospace';
    ctx.fillText(`attractor: q=${qCenter.toFixed(2)}`, mapX(qCenter) + 5, height - 6);
    ctx.fillText('p=0', 4, mapY(pCenter) - 4);
  }, [q, p, coherence, userData?.is_bursting]);

  if (!userData?.is_bursting || !showBurstMonitor) return null;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.08, 0.03, 0.12, 0.05] }}
        transition={{ duration: 0.15, repeat: Infinity }}
        className="fixed inset-0 pointer-events-none z-[999] bg-orange-600/10 mix-blend-overlay"
      />
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="ff-panel border-orange-500/40 p-4 md:p-6 bg-black/80 backdrop-blur-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex justify-between items-center mb-6">
             <div>
                <h3 className="text-[10px] md:text-xs font-bold tracking-[0.4em] text-orange-500 uppercase ff-font">{t.burst_monitor}</h3>
                <p className="text-[7px] text-white/30 uppercase tracking-[0.2em] ff-font mt-1">{t.peak_power}</p>
             </div>
             <div className="flex items-center gap-3">
                <div className="animate-pulse bg-orange-500/20 px-3 py-1 border border-orange-500/40 hidden sm:block">
                   <span className="text-[8px] text-orange-500 font-bold ff-font">ACTIVE</span>
                </div>
                <button 
                  onClick={() => setShowBurstMonitor(false)}
                  className="p-1 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                 <label className="text-[7px] text-white/20 tracking-widest uppercase ff-font block mb-1">Target</label>
                 <div className="text-[10px] md:text-sm text-white font-mono truncate ff-font">{bStatus?.target}</div>
              </div>
              <div className="text-right">
                 <label className="text-[7px] text-white/20 tracking-widest uppercase ff-font block mb-1">Peak Power Output</label>
                 <div className="text-lg md:text-xl text-orange-400 font-display ff-font">{(bStatus?.peakPower || 0).toFixed(2)} <span className="text-[10px] opacity-40 italic">MW</span></div>
              </div>
           </div>

           {/* Active Inference & Symplectic Phase Telemetry Grid */}
           <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4 p-3 bg-white/[0.02] border border-white/5 font-mono text-[8px] md:text-[9px] text-white/60">
              <div>
                 <span className="text-white/30 block tracking-wider uppercase text-[6.5px]">Variational Free Energy (VFE)</span>
                 <span className="text-orange-400 font-bold">{(bStatus?.vfe ?? 0).toFixed(4)} <span className="text-[7px] font-normal text-white/30">nats</span></span>
              </div>
              <div className="text-right">
                 <span className="text-white/30 block tracking-wider uppercase text-[6.5px]">Symplectic Phase (q, p)</span>
                 <span>
                    q: <span className="text-amber-400 font-bold">{(q).toFixed(2)}</span> | p: <span className="text-cyan-400 font-bold">{(p).toFixed(2)}</span>
                 </span>
               </div>
               <div>
                  <span className="text-white/30 block tracking-wider uppercase text-[6.5px]">Planck Causal Action (∫L dt)</span>
                  <span className="text-emerald-400 font-bold">{(bStatus?.totalAction ?? 0).toFixed(4)} <span className="text-[7px] font-normal text-white/30">J·s</span></span>
               </div>
               <div className="text-right">
                  <span className="text-white/30 block tracking-wider uppercase text-[6.5px]">Quantum Zeno Stability</span>
                  <span className="text-orange-300 font-bold">{((bStatus?.zenoCoeff ?? 1.0) * 100).toFixed(1)}% <span className="text-[7px] font-normal text-white/30">decay</span></span>
               </div>
            </div>

            {/* Axiomatic System Resource Overrides */}
            <div className="mb-4">
               <div className="text-[7.5px] text-orange-500 font-bold uppercase tracking-widest ff-font mb-2">
                  ⚡ ACTIVE RESOURCE SYNCHRONIZER OVERRIDES
               </div>
               <div className="grid grid-cols-2 gap-2 p-3 bg-white/[0.01] border border-white/5 font-mono text-[8px] text-white/70">
                  <div>
                     <span className="text-white/30 block tracking-wider uppercase text-[6px]">COMPILER LATENCY TARGET</span>
                     <span className="text-amber-400 font-bold">{(bStatus?.overrides?.latencyTargetNs ?? 850)} ns</span>
                  </div>
                  <div>
                     <span className="text-white/30 block tracking-wider uppercase text-[6px]">EXECUTION SCHEDULING</span>
                     <span className="text-amber-400 font-extrabold">{bStatus?.overrides?.threadPriority ?? "SCHED_OTHER"}</span>
                  </div>
                  <div>
                     <span className="text-white/30 block tracking-wider uppercase text-[6px]">GPU QUANT COMPACT REG</span>
                     <span className="text-cyan-400 font-bold">{bStatus?.overrides?.quantizationTarget ?? "FP32"}</span>
                  </div>
                  <div>
                     <span className="text-white/30 block tracking-wider uppercase text-[6px]">INGESTION MULTIPLIER</span>
                     <span className="text-emerald-400 font-bold">{(bStatus?.overrides?.batchSizeMultiplier ?? 1.0).toFixed(1)}x Batch</span>
                  </div>
                  <div className="col-span-2">
                     <span className="text-white/30 block tracking-wider uppercase text-[6px]">ACTIVE KV-CACHE COMPRESSION</span>
                     <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-pink-400 font-bold">{((1 - (bStatus?.overrides?.kvCacheCompression ?? 1.0)) * 100).toFixed(1)}% Reclaimed</span>
                        <div className="flex-1 h-1 bg-white/5 overflow-hidden">
                           <div 
                              className="h-full bg-pink-500" 
                              style={{ width: `${(1 - (bStatus?.overrides?.kvCacheCompression ?? 1.0)) * 100}%` }}
                           />
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Symplectic Phase Space Portrait Visualizer */}
            <div className="mb-4">
               <div className="flex justify-between items-center text-[7.5px] text-white/30 uppercase tracking-widest ff-font mb-2">
                  <span>Symplectic Phase Space Portrait (哈密頓相空间共軛流形)</span>
                  <span className="text-cyan-400">det(J) = 1.0000 (Area-Preserved)</span>
               </div>
               <div className="relative h-28 w-full bg-black/40 border border-white/5 overflow-hidden">
                  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
                  <div className="absolute right-2 bottom-2 font-mono text-[5.5px] text-white/15 select-none uppercase tracking-wider">
                     H(q,p) = T(p) + V(q) | Symplectic Euler
                  </div>
               </div>
            </div>

            <div className="space-y-2 mb-6">
               <div className="flex justify-between items-center text-[7px] text-white/40 uppercase tracking-widest ff-font">
                  <span>{t.causal_entropy}</span>
                  <span className={cn(
                    bStatus?.entropy! > 2.0 ? "text-red-500" : "text-orange-400"
                  )}>{((bStatus?.entropy || 0) * 100).toFixed(1)}%</span>
               </div>
               <div className="h-1 bg-white/5 w-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((bStatus?.entropy || 0) / 2.5) * 100)}%` }}
                    transition={{ type: 'spring', damping: 20 }}
                  />
               </div>
            </div>
          
          <div className="flex gap-2">
             {!userData.is_user_burst && (
                <button 
                  onClick={() => handleAction('approveBurst')}
                  className="flex-1 py-2 bg-orange-500 text-black text-[9px] font-bold ff-font hover:bg-white transition-all uppercase tracking-widest"
                >
                  {t.approve_label}
                </button>
             )}
             <button 
                onClick={() => setShowBurstMonitor(false)}
                className="flex-1 py-2 bg-white/10 text-white/60 text-[9px] ff-font hover:bg-white/20 transition-all uppercase tracking-widest"
              >
                {t.hide_label}
              </button>
              <button 
                onClick={() => handleAction('deactivateBurst', { reason: 'MANUAL' })}
                className="flex-1 py-2 bg-red-900/40 border border-red-500/20 text-red-100 text-[9px] ff-font hover:bg-red-600 transition-all uppercase tracking-widest"
              >
                {t.shutdown_label}
              </button>
           </div>
          
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-[40px] pointer-events-none ff-font font-bold">
             P = E / τ
          </div>
        </motion.div>
      </div>
    </>
  );
};
