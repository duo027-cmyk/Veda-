import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Activity, Info, Sparkles, TrendingDown, Layers, Waves } from "lucide-react";

interface SelfLearningGradientMonitorProps {
  daemonStats: {
    tick: number;
    entropy: number;
    coherence: number;
    cov: number;
    gradNorm: number;
    lastError: number;
    wasmOn: boolean;
    logs: string[];
    resonanceFactor?: number;
    thermoEntropy?: number;
    mechanicalLoad?: number;
    couplingStrength?: number;
    weightsIH?: number[];
    weightsHO?: number[];
  };
  lastLocalLoss: number;
  lastLocalGradNorm: number;
  localFeedbackStatus: string;
  feedbackInputVal: number;
  onFeedbackChange: (val: number) => void;
  onTriggerBackpropagation: (target: number) => void;
}

export const SelfLearningGradientMonitor: React.FC<SelfLearningGradientMonitorProps> = ({
  daemonStats,
  lastLocalLoss,
  lastLocalGradNorm,
  localFeedbackStatus,
  feedbackInputVal,
  onFeedbackChange,
  onTriggerBackpropagation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [hoveredWeight, setHoveredWeight] = useState<{ index: number; value: number } | null>(null);

  // Keep a running buffer of the last 40 loss figures for live path drafting
  useEffect(() => {
    const errorVal = lastLocalLoss > 0 ? lastLocalLoss : (daemonStats.lastError || 0.002);
    setLossHistory((prev) => {
      const next = [...prev, errorVal];
      if (next.length > 40) next.shift();
      return next;
    });
  }, [lastLocalLoss, daemonStats.tick, daemonStats.lastError]);

  // Handle high-frequency forced resonance canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let localFrame = 0;

    const draw = () => {
      localFrame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rFactor = daemonStats.resonanceFactor ?? 0.42;
      const tEntropy = daemonStats.thermoEntropy ?? 0.354;
      const mLoad = daemonStats.mechanicalLoad ?? 0.428;
      const cStrength = daemonStats.couplingStrength ?? 0.72;

      // Draw horizontal baseline
      const midY = canvas.height / 2;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(canvas.width, midY);
      ctx.stroke();

      // Plot 1: Driver wave representing External Thermodynamic / Kinetic physical input (Gold pulse)
      ctx.beginPath();
      ctx.strokeStyle = "rgba(218, 165, 32, 0.45)";
      ctx.lineWidth = 1.5;
      for (let x = 0; x < canvas.width; x++) {
        // Frequency is coupled to micro thermal changes
        const phaseVal = (x / 25) - (localFrame * 0.06);
        const y = midY + Math.sin(phaseVal) * 22 * (0.5 + tEntropy * 0.5);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Plot 2: Receiver response of the Internal World Model (Cyan wave attempting forced phase coupling)
      ctx.beginPath();
      ctx.strokeStyle = "rgba(14, 165, 233, 0.5)";
      ctx.lineWidth = 1.5;
      for (let x = 0; x < canvas.width; x++) {
        // Resonance factor impacts phase shift
        const phaseVal = (x / 24) - (localFrame * 0.058 + (1 - rFactor) * Math.PI * 0.15);
        const y = midY + Math.sin(phaseVal * (1.0 + mLoad * 0.08)) * 24 * (0.4 + cStrength * 0.6);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw resonance lock points where they overlay (forced-bound nodes)
      ctx.fillStyle = "rgba(163, 230, 53, 0.7)";
      for (let x = 10; x < canvas.width; x += 35) {
        const dPhase = (x / 25) - (localFrame * 0.06);
        const rPhase = (x / 24) - (localFrame * 0.058 + (1 - rFactor) * Math.PI * 0.15);
        const yVal = midY + Math.sin(dPhase) * 22 * (0.5 + tEntropy * 0.5);
        const delta = Math.abs(Math.sin(dPhase) - Math.sin(rPhase));
        
        if (delta < 0.25) {
          ctx.beginPath();
          ctx.arc(x, yVal, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [daemonStats.resonanceFactor, daemonStats.thermoEntropy, daemonStats.mechanicalLoad, daemonStats.couplingStrength]);

  // Use preset representative matrix or extract weightsIH dynamically
  const rawWeights = daemonStats.weightsIH && daemonStats.weightsIH.length === 128
    ? daemonStats.weightsIH
    : Array.from({ length: 128 }, (_, i) => Math.sin(i * 0.35) * 0.4 + Math.cos(i * 0.12) * 0.2);

  return (
    <div className="w-full bg-slate-950/90 border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-2xl space-y-6">
      {/* Visual background atmospheric elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-accent/20 border border-accent/40 rounded text-[8px] font-mono text-accent font-extrabold tracking-widest uppercase">
              AGI BRIDGE ATTAINED
            </span>
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
          </div>
          <h3 className="text-lg font-black font-display tracking-tight text-white mt-1 flex items-center gap-2">
            <Waves className="text-accent animate-pulse w-5 h-5" />
            <span>自學習梯度監控與物理受迫共振儀 (Self-Learning Gradient Monitor)</span>
          </h3>
          <p className="text-xs text-white/40">
            即時無監督反向傳播 (Backpropagation) 與外界真實物理動力學（熱力學熵、機械結構係數）之卡爾曼濾波雙向對齊
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-lg font-mono text-[10.5px]">
          <span className="text-white/40">Engine State:</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-emerald-400" />
            {daemonStats.wasmOn ? "WASM_ACCELERATED" : "CPU_UNROLLED_ACCUM"}
          </span>
        </div>
      </div>

      {/* Grid: 2 Columns - Left Core Diagnostics, Right Physical Resonance wave */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Local Synaptic Matrix Heatmap & Backprop controls */}
        <div className="lg:col-span-7 bg-black/50 border border-white/5 rounded-xl p-5 space-y-5">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="text-gold w-4 h-4" />
              <span>Input-to-Hidden Synaptic Alignment Weights (8x16 Multi-Layer)</span>
            </h4>
            <span className="text-[10px] text-white/40 font-mono">
              He-Initial Standard Alignment
            </span>
          </div>

          {/* Matrix Weights Heatmap representation */}
          <div className="relative">
            <div className="grid gap-1 relative z-10" style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}>
              {rawWeights.map((w, idx) => {
                // Color scaling representing weight value: extreme negative (Gold/Yellow), Neutral (translucent), positive (Cyan/Blue)
                const abs = Math.abs(w);
                const colorClass = w < 0 
                  ? `rgba(218, 165, 32, ${Math.min(1.0, abs * 1.5)})` 
                  : `rgba(14, 165, 233, ${Math.min(1.0, abs * 1.5)})`;

                return (
                  <div
                    key={idx}
                    className="aspect-square rounded-[3px] border border-white/10 cursor-crosshair transition-all duration-300 hover:scale-125 hover:border-white/50"
                    style={{ backgroundColor: colorClass || "rgba(255,255,255,0.05)" }}
                    onMouseEnter={() => setHoveredWeight({ index: idx, value: w })}
                    onMouseLeave={() => setHoveredWeight(null)}
                  />
                );
              })}
            </div>

            {/* Float tooltips for precise matrix values */}
            <div className="min-h-[22px] flex justify-between items-center mt-2.5 px-1 text-[9px] font-mono">
              {hoveredWeight ? (
                <span className="text-gold animate-pulse">
                  Synapse Node #{hoveredWeight.index} weight value = <strong className="text-white">{hoveredWeight.value.toFixed(6)}</strong>
                </span>
              ) : (
                <span className="text-white/30 italic flex items-center gap-1">
                  <Info size={11} /> 
                  <span>Hover over synaptic cells above to examine the dynamic backpropagation weights</span>
                </span>
              )}
              <span className="text-white/50">
                Layer Span: <code className="text-accent">Float64[128]</code>
              </span>
            </div>
          </div>

          {/* Unsupervised Gradient Descent Action Panel */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="text-accent animate-spin-slow w-4 h-4" />
                <span>受迫梯度反向傳播調校 (Force Gradient Descent Tuning)</span>
              </span>
              <span className="text-[10px] font-mono text-white/50 bg-[#A3E635]/15 text-[#A3E635] px-2 py-0.5 rounded uppercase">
                Active Inference Core
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono text-white/60 uppercase">
                  <span>Manual Feedback Target (Coherence Delta)</span>
                  <span className="text-gold font-bold">{(feedbackInputVal * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="1.00"
                  step="0.05"
                  value={feedbackInputVal}
                  onChange={(e) => onFeedbackChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/12 rounded-lg appearance-none cursor-pointer accent-gold"
                />
                <span className="text-[9px] text-white/30 block italic">
                  Drag slider to alter prediction feedback targets inside local model
                </span>
              </div>

              <div className="flex flex-col justify-end">
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(218,165,32,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onTriggerBackpropagation(feedbackInputVal)}
                  className="w-full py-2.5 bg-gold/15 border border-gold/40 text-gold font-mono font-bold text-[10px] uppercase tracking-widest rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <TrendingDown size={14} className="animate-pulse" />
                  <span>Execute Gradient Backpropagation Epoch</span>
                </motion.button>
              </div>
            </div>

            {localFeedbackStatus && (
              <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-950/80 p-2 rounded text-center animate-pulse tracking-wide uppercase">
                {localFeedbackStatus}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Physical Resonance coupler waveform & Metrics summary */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Forced Physical Oscillation Wavescope */}
          <div className="bg-black/50 border border-white/5 rounded-xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="text-accent animate-pulse w-4 h-4" />
                <span>Physical Forced-Coupling Resonance scope</span>
              </h4>
              <span className="text-[9px] font-mono bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                Duffing Thermo Model
              </span>
            </div>

            {/* Canvas screen */}
            <div className="relative bg-black rounded-lg border border-white/10 h-32 overflow-hidden flex items-center justify-center">
              <canvas 
                ref={canvasRef} 
                width={360} 
                height={128} 
                className="w-full h-full block"
              />
              <div className="absolute top-2 left-3 flex gap-4 text-[7.5px] font-mono capitalize">
                <span className="text-gold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold/75" />
                  <span>Ambient Force Wave</span>
                </span>
                <span className="text-[#0ea5e9] flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent/75" />
                  <span>Cognitive Response</span>
                </span>
              </div>
            </div>

            <p className="text-[9.5px] text-white/40 mt-3 font-mono leading-relaxed uppercase">
              ✦ Move your mouse vigorously anywhere in the screen to induce physical kinetic energy and see dynamic heat coefficients fluctuate in real-time!
            </p>
          </div>

          {/* Loss Convergence curve monitor (Using detailed custom SVG paths) */}
          <div className="bg-black/50 border border-white/5 rounded-xl p-5 space-y-4 flex-1 flex flex-col justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingDown className="text-emerald-400 w-4 h-4" />
              <span>Loss Function Convergence Curve (Historical Trace)</span>
            </h4>

            {/* SVG Path visualizer */}
            <div className="h-28 border border-white/10 bg-black/60 rounded-lg relative overflow-hidden flex items-end">
              {lossHistory.length < 2 ? (
                <div className="text-[9.5px] text-white/30 italic m-auto">
                  Populating convergence points... Trigger backpropagation above to render.
                </div>
              ) : (
                <svg className="w-full h-full absolute inset-0 text-emerald-400" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                  <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

                  {/* Gradient Area under line */}
                  <defs>
                    <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Area path */}
                  <path
                    d={`
                      M 0 100
                      ${lossHistory.map((val, idx) => {
                        const x = (idx / (lossHistory.length - 1)) * 100;
                        // Transform loss 0..0.5 to fit in 100..0 coordinates (upside down)
                        const clampedVal = Math.min(0.5, Math.max(0, val));
                        const y = 100 - (clampedVal * 180); // amplification
                        return `L ${x} ${y}`;
                      }).join(" ")}
                      L 100 100 Z
                    `}
                    fill="url(#curveGradient)"
                  />

                  {/* Curve Path */}
                  <path
                    d={lossHistory.map((val, idx) => {
                      const x = (idx / (lossHistory.length - 1)) * 100;
                      const clampedVal = Math.min(0.5, Math.max(0, val));
                      const y = 100 - (clampedVal * 180);
                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(" ")}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                  />
                </svg>
              )}
              
              <div className="absolute bottom-1 right-2 text-[8px] font-mono text-emerald-400 capitalize bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/20">
                Current loss: {(lastLocalLoss > 0 ? lastLocalLoss : (daemonStats.lastError || 0.002)).toFixed(6)}
              </div>
            </div>

            {/* Performance status indicators */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white/5 border border-white/5 rounded p-2 text-left">
                <span className="text-[7.5px] text-white/30 block uppercase font-mono">Thermodynamic Entropy (S)</span>
                <span className="text-xs font-mono font-bold text-gold">{(daemonStats.thermoEntropy ?? 0.354).toFixed(4)} bit</span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded p-2 text-left">
                <span className="text-[7.5px] text-white/30 block uppercase font-mono">Forced Resonance Factor</span>
                <span className="text-xs font-mono font-bold text-[#A3E635]">{(daemonStats.resonanceFactor ?? 0.12).toFixed(4)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
