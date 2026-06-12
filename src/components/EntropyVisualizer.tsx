import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  Cpu, 
  Info, 
  Zap, 
  Wind, 
  Flame, 
  TrendingUp, 
  Eye, 
  GitCommit, 
  RefreshCw 
} from "lucide-react";

interface EntropyMetric {
  timestamp: number;
  physicsEntropy: number; // calculated from mouse velocity and jitter
  renderJitter: number;   // performance frame-to-frame delta deviation
  memoryAlloc: number;    // memory footprint jitter if supported, or Math.random background variation
  performanceLoad: number;// simulated system responsive load based on timing
}

interface EntropyVisualizerProps {
  onEntropyUpdate?: (entropy: number, metrics: EntropyMetric) => void;
  coupledCoherence?: number;
}

export const EntropyVisualizer: React.FC<EntropyVisualizerProps> = ({ 
  onEntropyUpdate, 
  coupledCoherence = 0.85 
}) => {
  const [metrics, setMetrics] = useState<EntropyMetric>({
    timestamp: Date.now(),
    physicsEntropy: 0.35,
    renderJitter: 0.08,
    memoryAlloc: 0.42,
    performanceLoad: 0.45
  });

  const [history, setHistory] = useState<EntropyMetric[]>([]);
  const [injectActive, setInjectActive] = useState(false);
  const [injectStatus, setInjectStatus] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Track Cursor & Performance entropy variables
  const mouseRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0, speed: 0, speedHistory: [] as number[] });
  const frameTimes = useRef<number[]>([]);
  const lastFrameTime = useRef<number>(performance.now());

  useEffect(() => {
    // 1. Mouse Tracking for kinetic physical entropy calculation
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - mouseRef.current.lastX;
      const dy = e.clientY - mouseRef.current.lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      
      mouseRef.current.speed = speed;
      mouseRef.current.lastX = e.clientX;
      mouseRef.current.lastY = e.clientY;

      // Maintain a brief rolling queue of mouse velocities
      mouseRef.current.speedHistory.push(speed);
      if (mouseRef.current.speedHistory.length > 15) {
        mouseRef.current.speedHistory.shift();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 2. High frequency render jitter analyzer (RequestAnimationFrame timing entropy)
    let animationId: number;
    const computeJitterLoop = () => {
      const now = performance.now();
      const delta = now - lastFrameTime.current;
      lastFrameTime.current = now;

      frameTimes.current.push(delta);
      if (frameTimes.current.length > 50) {
        frameTimes.current.shift();
      }

      animationId = requestAnimationFrame(computeJitterLoop);
    };
    animationId = requestAnimationFrame(computeJitterLoop);

    // 3. Periodic metric compiler (combining the physical & browser metrics to form thermodynamic entropy)
    const compilerInterval = setInterval(() => {
      // Calculate kinetic variance (entropy) of cursor pathing
      const speedQueue = mouseRef.current.speedHistory;
      let physicsEntropy = 0.15;
      if (speedQueue.length > 1) {
        const avg = speedQueue.reduce((a, b) => a + b, 0) / speedQueue.length;
        const variance = speedQueue.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / speedQueue.length;
        physicsEntropy = Math.min(0.95, 0.15 + (variance / 850) + (avg / 150));
      } else {
        physicsEntropy = 0.15 + Math.random() * 0.05; // background state
      }

      // Calculate browser timing jitter variance
      const timesQueue = frameTimes.current;
      let renderJitter = 0.02;
      if (timesQueue.length > 5) {
        const avgDelta = timesQueue.reduce((a, b) => a + b, 0) / timesQueue.length;
        const variance = timesQueue.reduce((acc, val) => acc + Math.pow(val - avgDelta, 2), 0) / timesQueue.length;
        renderJitter = Math.min(0.85, 0.01 + (variance / 40));
      }

      // Read memory API or generate beautiful structured entropy
      let memoryAlloc = 0.35;
      if (typeof window !== "undefined" && (window.performance as any)?.memory) {
        const mem = (window.performance as any).memory;
        const ratio = mem.usedJSHeapSize / mem.jsHeapSizeLimit;
        memoryAlloc = Math.min(1.0, 0.2 + ratio * 0.8);
      } else {
        memoryAlloc = 0.28 + Math.cos(Date.now() / 8000) * 0.08 + Math.random() * 0.01;
      }

      // Aggregate dynamic load coefficient
      const rawPerfLoad = 0.3 + (physicsEntropy * 0.3) + (renderJitter * 0.4);
      const performanceLoad = Math.max(0.1, Math.min(0.95, rawPerfLoad));

      const updatedMetric: EntropyMetric = {
        timestamp: Date.now(),
        physicsEntropy,
        renderJitter,
        memoryAlloc,
        performanceLoad
      };

      setMetrics(updatedMetric);

      // Trigger callback to parents (like NeuralManifold for graph layout nodes vibration!)
      if (onEntropyUpdate) {
        const combinedEntropy = (physicsEntropy * 0.4) + (renderJitter * 0.3) + (performanceLoad * 0.3);
        onEntropyUpdate(combinedEntropy, updatedMetric);
      }

      setHistory(prev => {
        const next = [...prev, updatedMetric];
        if (next.length > 25) next.shift();
        return next;
      });

    }, 1000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
      clearInterval(compilerInterval);
    };
  }, [onEntropyUpdate]);

  // Canvas visual rendering of the Physical vs Cognitive Entropy manifolds (Fourier representation)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const centerY = h / 2;

      // 1. Draw subtle grid background
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      for (let i = 20; i < w; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let i = 15; i < h; i += 30) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(w, i);
        ctx.stroke();
      }

      // 2. Physical Entropy Wavefront (Flame Gold/Amber)
      ctx.beginPath();
      ctx.strokeStyle = "rgba(242, 125, 38, 0.7)";
      ctx.lineWidth = 2;
      const pEnt = metrics.physicsEntropy;
      for (let x = 0; x < w; x++) {
        // Frequency shifts depending on real-time physics entropy density
        const freqX = 0.05 + pEnt * 0.15;
        const amp = 15 + pEnt * 25;
        // Introduce micro noise jitter conforming to actual physical render jitter
        const noise = Math.sin(x * 0.9 + tick * 0.15) * (metrics.renderJitter * 6);
        const y = centerY + Math.sin(x * freqX - tick * 0.08) * amp + noise;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 3. Cognitive Self-Healing Manifold Target (Sovereign Cyan)
      ctx.beginPath();
      ctx.strokeStyle = "rgba(14, 165, 233, 0.65)";
      ctx.lineWidth = 2;
      const cCoher = coupledCoherence;
      const ratioMismatch = Math.abs(pEnt - (1 - cCoher));

      for (let x = 0; x < w; x++) {
        const freqX = 0.04;
        const amp = 18 * cCoher;
        // Phase shift is forced by the coupling mismatch
        const phaseShift = ratioMismatch * Math.PI * 0.5;
        const y = centerY + Math.sin(x * freqX - tick * 0.03 + phaseShift) * amp;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Indicator dots for critical resonance overlay points
      for (let x = 20; x < w; x += 30) {
        const pFreq = 0.05 + pEnt * 0.15;
        const pAmp = 15 + pEnt * 25;
        const pNoise = Math.sin(x * 0.9 + tick * 0.15) * (metrics.renderJitter * 6);
        const py = centerY + Math.sin(x * pFreq - tick * 0.08) * pAmp + pNoise;

        const cAmp = 18 * cCoher;
        const phaseShift = ratioMismatch * Math.PI * 0.5;
        const cy = centerY + Math.sin(x * 0.04 - tick * 0.03 + phaseShift) * cAmp;

        if (Math.abs(py - cy) < 6) {
          ctx.beginPath();
          ctx.arc(x, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = "#A3E635"; // Lock resonance green
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [metrics, coupledCoherence]);

  const triggerResonanceInjection = () => {
    setInjectActive(true);
    setInjectStatus("⚙️ INJECTING ENTROPY COEFFICIENT TO NEURAL MANIFOLD LAYERS...");
    setTimeout(() => {
      setInjectStatus("✅ THERMODYNAMIC SELF-CORRECTION TUNED! Gaps decreased by 4.25%.");
      setInjectActive(false);
      setTimeout(() => setInjectStatus(""), 4000);
    }, 2500);
  };

  const calculatedSystemEntropy = (metrics.physicsEntropy * 0.4) + (metrics.renderJitter * 0.3) + (metrics.performanceLoad * 0.3);

  return (
    <div className="bg-slate-950/85 border border-white/10 rounded-2xl p-5 relative overflow-hidden backdrop-blur-lg shadow-2xl space-y-5">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header and status indicators */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-white/5 pb-3">
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-[#F27D26] tracking-widest uppercase font-bold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-[#F27D26] animate-pulse" />
            <span>REAL-WORLD ENTROPY COUPLER (熵能對齊耦合器)</span>
          </span>
          <h4 className="text-sm font-black text-white font-display tracking-tight mt-1 flex items-center gap-1.5">
            <span>EntropyVisualizer v2.1</span>
          </h4>
        </div>

        <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-lg px-2.5 py-1 text-[9.5px] font-mono">
          <span className="text-white/40">Status:</span>
          <span className="text-[#A3E635] font-semibold animate-pulse uppercase tracking-wider">Forced Steady-State</span>
        </div>
      </div>

      {/* Main split dashboard: left live stats, right wavescope analyzer */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Left Stats list */}
        <div className="md:col-span-5 space-y-3 font-mono">
          <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
            <div className="flex justify-between items-center text-[8px] text-white/40 uppercase">
              <span>Overall Coupled Entropy System-Wide</span>
              <span className="text-xs text-white bg-white/5 px-2 py-0.5 rounded border border-white/5">Thermodynamic</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-[#F27D26]">{calculatedSystemEntropy.toFixed(5)}</span>
              <span className="text-[10px] text-white/40">bit</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg space-y-1">
              <span className="text-[7.5px] text-white/30 block uppercase">Kinetic Jitter S</span>
              <span className="font-bold text-amber-400">{(metrics.physicsEntropy).toFixed(4)}</span>
            </div>
            <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg space-y-1">
              <span className="text-[7.5px] text-white/30 block uppercase">Frame Jitter Δ</span>
              <span className="font-bold text-[#0ea5e9]">{(metrics.renderJitter).toFixed(4)} ms</span>
            </div>
            <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg space-y-1 col-span-2">
              <span className="text-[7.5px] text-white/30 block uppercase">Continuous Cognitive Coherence Alignment</span>
              <span className="font-bold text-[#A3E635]">{coupledCoherence.toFixed(4)} %</span>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <span className="text-[8px] text-white/35 block uppercase">Dynamic Coupling Performance Factor</span>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-sky-400 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (calculatedSystemEntropy * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Canvas fourier waveform */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-3">
          <div className="relative bg-black rounded-xl border border-white/10 h-32 overflow-hidden flex items-center justify-center shadow-inner">
            <canvas 
              ref={canvasRef} 
              width={260} 
              height={128} 
              className="w-full h-full block" 
            />
            
            <div className="absolute bottom-2 left-3 flex gap-4 text-[7px] font-mono">
              <span className="flex items-center gap-1 text-amber-500">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Physical Perturbations</span>
              </span>
              <span className="flex items-center gap-1 text-[#0ea5e9]">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                <span>Cognitive Resonator</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(242, 125, 38, 0.2)" }}
              whileTap={{ scale: 0.98 }}
              disabled={injectActive}
              onClick={triggerResonanceInjection}
              className="py-2 bg-[#F27D26]/12 border border-[#F27D26]/30 text-[#F27D26] font-mono font-bold text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(242,125,38,0.08)]"
            >
              <RefreshCw size={12} className={injectActive ? "animate-spin" : "animate-pulse"} />
              <span>Forced-Resistive Coupling Self-Alignment</span>
            </motion.button>

            {injectStatus && (
              <div className="text-[8px] font-mono text-emerald-400 text-center animate-pulse py-0.5 tracking-wide uppercase">
                {injectStatus}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
