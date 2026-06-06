import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  YAxis,
  XAxis,
  Tooltip
} from 'recharts';
import { 
  Activity, 
  Cpu, 
  RefreshCw, 
  Terminal, 
  TrendingUp, 
  Maximize2, 
  Layers, 
  Sparkles, 
  Zap, 
  ChevronDown, 
  Settings, 
  BarChart3, 
  Terminal as TerminalIcon, 
  Shield, 
  Brain,
  EyeOff,
  Plus,
  Filter,
  Moon,
  RotateCcw,
  Map,
  Grid,
  ChevronUp,
  X,
  Database,
  Download,
  CloudSun,
  Trash2,
  Save,
  Play,
  Pause,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { BrainData, LogEntry, EvolutionStatus } from '../types';

import { resonanceService } from '../services/resonanceService';
import { vedaService } from '../services/vedaService';
import { cn } from '../lib/utils';

interface ControlPanelProps {
  data: BrainData | null;
  intent: number[];
  loading: boolean;
  logs: LogEntry[];
  showControls: boolean;
  memories: any[];
  onIntentChange: (index: number, value: number) => void;
  onResetIntent: () => void;
  onEvolve: () => void;
  onSynthesize: () => void;
  onDistill?: () => void;
  onDream?: () => void;
  isDreaming?: boolean;
  onToggleNetwork?: () => void;
  onToggleNetworkDisplay?: () => void;
  showNetworkDisplay?: boolean;
  onClose?: () => void;
  weather?: {
    temp: number;
    condition: string;
    location: string;
    humidity: number;
    wind: number;
  } | null;
  isLocalMode?: boolean;
  onToggleLocalMode?: () => void;
  localStatus?: { available: boolean; version?: string; models?: string[] };
  onScanLocal?: () => void;
  axioms?: string[];
  onComputeModeChange?: (mode: 'throughput' | 'precision') => void;
}

const FlagIndicator = ({ active, label, color }: { active?: boolean, label: string, color: string }) => (
  <div className={cn(
    "flex-1 py-1 text-center text-[7px] font-black tracking-widest transition-all border",
    active ? `${color} text-black border-transparent shadow-[0_0_10px_rgba(255,255,255,0.1)]` : "bg-white/2 border-white/5 text-white/10"
  )}>
    {label}
  </div>
);

const NervePulse = ({ coherence }: { coherence: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; s: number; v: number; a: number }[] = [];
    
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const createParticles = () => {
      particles = [];
      const count = 40 + Math.floor(coherence * 100);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          s: Math.random() * 2 + 1,
          v: Math.random() * 0.5 + 0.1,
          a: Math.random() * Math.PI * 2
        });
      }
    };
    createParticles();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = `rgba(34, 211, 238, ${0.1 + coherence * 0.4})`;
      ctx.lineWidth = 0.5;

      particles.forEach((p, i) => {
        p.x += Math.cos(p.a) * p.v * (1 + coherence * 5);
        p.y += Math.sin(p.a) * p.v * (1 + coherence * 5);

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s * (0.5 + coherence), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${0.2 + coherence * 0.8})`;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 40 + coherence * 60) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [coherence]);

  return <canvas ref={canvasRef} className="w-full h-24 block opacity-60" />;
};

export const ControlPanel: React.FC<ControlPanelProps> = React.memo(({
  data,
  intent,
  loading,
  logs,
  showControls,
  memories,
  onIntentChange,
  onResetIntent,
  onEvolve,
  onSynthesize,
  onDistill,
  onDream,
  isDreaming,
  onToggleNetwork,
  onToggleNetworkDisplay,
  showNetworkDisplay,
  onClose,
  weather,
  isLocalMode = false,
  onToggleLocalMode,
  localStatus = { available: false },
  onScanLocal,
  axioms = [],
  onComputeModeChange
}) => {
  const [activeModule, setActiveModule] = useState<'ALL' | 'ANALYSIS' | 'INTENT' | 'SYSTEM' | 'MEMORIES' | 'FEDERATION'>('ALL');
  const [realTimeHistory, setRealTimeHistory] = useState<{ val: number; time: string }[]>([]);
  const [federationUrl, setFederationUrl] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [editingAxioms, setEditingAxioms] = useState<string[]>([]);
  const [isAxiomEditMode, setIsAxiomEditMode] = useState(false);
  const [localPausedList, setLocalPausedList] = useState<Record<string, boolean>>({});
  
  // Smart Purge parameters for automatic and manual queue purification
  const [purgeTimeoutMs, setPurgeTimeoutMs] = useState<number>(10000); // default 10 seconds
  const [autoPurgeEnabled, setAutoPurgeEnabled] = useState<boolean>(true); // default true for automated queue safety
  const [lastPurgedInfo, setLastPurgedInfo] = useState<string>('Inactive status: monitoring queue');

  const [recalibratingMode, setRecalibratingMode] = useState<'throughput' | 'precision' | null>(null);
  const prevComputeModeRef = useRef<string | undefined>(data?.compute_mode);

  // Automatic identifying and clearing of failed or stale workloads
  useEffect(() => {
    if (!autoPurgeEnabled || (data?.compute_mode || 'precision') !== 'throughput') return;

    const interval = setInterval(async () => {
      try {
        const result = await vedaService.smartPurgeLatticeJobs(purgeTimeoutMs);
        if (result && result.purgedCount > 0) {
          const timestamp = new Date().toLocaleTimeString();
          setLastPurgedInfo(`Auto-cleared ${result.purgedCount} stale/failed task(s) @ ${timestamp}`);
          
          if (result.purgedIds) {
            setLocalPausedList(prev => {
              const updated = { ...prev };
              result.purgedIds.forEach((id: string) => {
                delete updated[id];
              });
              return updated;
            });
          }
        }
      } catch (err) {
        console.error("Auto smart purge failed", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [autoPurgeEnabled, purgeTimeoutMs, data?.compute_mode]);

  useEffect(() => {
    if (data?.compute_mode && prevComputeModeRef.current !== undefined && prevComputeModeRef.current !== data.compute_mode) {
      setRecalibratingMode(data.compute_mode as 'throughput' | 'precision');
      const timer = setTimeout(() => {
        setRecalibratingMode(null);
      }, 1500);
      prevComputeModeRef.current = data.compute_mode;
      return () => clearTimeout(timer);
    }
    if (data?.compute_mode) {
      prevComputeModeRef.current = data.compute_mode;
    }
  }, [data?.compute_mode]);

  useEffect(() => {
    if (axioms.length > 0 && editingAxioms.length === 0) {
      setEditingAxioms(axioms);
    }
  }, [axioms]);

  const handleUpdateAxioms = async () => {
    try {
      await resonanceService.updateAxioms(editingAxioms);
      setIsAxiomEditMode(false);
    } catch (e) {
      console.error("Failed to update axioms", e);
    }
  };

  const handleJoinFederation = async () => {
    if (!federationUrl) return;
    setIsJoining(true);
    try {
      const response = await fetch('/api/v1/federation/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId: `NODE-${Math.random().toString(36).substr(2, 5).toUpperCase()}`, nodeUrl: federationUrl, coherence: 0.9 })
      });
      if (response.ok) {
        setFederationUrl('');
        // Optional notification logic
      }
    } catch (err) {
      console.error("Federation Handshake Failed", err);
    } finally {
      setIsJoining(false);
    }
  };

  useEffect(() => {
    if (data?.global_coherence !== undefined) {
      setRealTimeHistory(prev => {
        const next = [...prev, { val: data?.global_coherence ?? 0.5, time: new Date().toLocaleTimeString() }];
        if (next.length > 60) return next.slice(1);
        return next;
      });
    }
  }, [data?.global_coherence]);

  const chartData = useMemo(() => (data && data.labels && data.vectors) ? data.labels.map((label, i) => ({
    subject: label ?? `V_${i}`,
    A: data.vectors[i] ?? 0.5,
    fullMark: 1,
  })) : [], [data?.vectors, data?.labels]);

  const historyData = useMemo(() => data?.history?.map((val, i) => ({
    val,
    index: i
  })) || [], [data?.history]);

  const coherenceHistoryData = useMemo(() => data?.coherence_history?.map((val, i) => ({
    val,
    index: i
  })) || [], [data?.coherence_history]);

  // Intent Presets
  const INTENT_PRESETS = [
    { name: 'STABILIZE', vector: [0.3, 0.9, 0.1, 0.2, 0.5, 0.5], icon: <Shield size={12} /> },
    { name: 'EVOLVE', vector: [0.7, 0.5, 0.4, 0.8, 0.6, 0.4], icon: <Zap size={12} /> },
    { name: 'CHAOS', vector: [0.9, 0.2, 0.9, 0.9, 0.3, 0.7], icon: <Activity size={12} /> },
    { name: 'QUIET', vector: [0.1, 0.95, 0.05, 0.1, 0.2, 0.2], icon: <EyeOff size={12} /> },
    { name: 'TURBO', vector: [1.0, 0.1, 0.5, 1.0, 0.8, 0.2], icon: <Zap className="text-yellow-400 animate-pulse" size={12} /> },
  ];

  const handleApplyPreset = (vector: number[]) => {
    vector.forEach((val, i) => onIntentChange(i, val));
  };

  return (
    <AnimatePresence>
      {(showControls || window.innerWidth >= 1024) && (
        <motion.div 
          initial={window.innerWidth < 1024 ? { y: "100%" } : { x: "100%" }}
          animate={window.innerWidth < 1024 ? { y: 0 } : { x: 0 }}
          exit={window.innerWidth < 1024 ? { y: "100%" } : { x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 250 }}
          className="fixed lg:absolute bottom-0 right-0 top-auto lg:top-8 lg:bottom-8 w-full lg:w-96 z-[60] flex flex-col gap-0 pointer-events-auto ff-panel ff-panel-accent rounded-none p-0 max-h-[85vh] lg:max-h-none overflow-y-auto lg:overflow-visible shadow-[-20px_0_60px_rgba(0,0,0,0.8)]"
        >
          {/* Module Selector */}
          <div className="px-6 py-5 border-b border-white/5 bg-white/5 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-purple-400/60" strokeWidth={1} />
              <select 
                value={activeModule} 
                onChange={(e) => setActiveModule(e.target.value as any)}
                className="bg-transparent text-[10px] uppercase tracking-[0.3em] font-black text-white/80 outline-none cursor-pointer ff-font-serif hover:text-white transition-colors"
              >
                <option value="ALL" className="bg-[#020005]">SOVEREIGN CORE</option>
                <option value="FEDERATION" className="bg-[#020005]">SWARM ARRAY</option>
                <option value="ANALYSIS" className="bg-[#020005]">ANALYSIS</option>
                <option value="INTENT" className="bg-[#020005]">INTENT</option>
                <option value="MEMORIES" className="bg-[#020005]">MEMORIES</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `VEDA_SYSTEM_STATE_${Date.now()}.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                className="p-1.5 text-white/20 hover:text-white/60 transition-colors"
                title="DOWNLOAD SYSTEM STATE"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button 
                onClick={onClose}
                className="p-1.5 text-white/20 hover:text-red-400 transition-colors"
                title="CLOSE PANEL"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="text-[8px] opacity-20 font-bold ff-font tracking-[0.4em] uppercase hidden sm:block">
                VEDA_v24.4
              </div>
              {onClose && (
                <button 
                  onClick={onClose}
                  className="lg:hidden p-1 hover:bg-white/10 transition-colors"
                >
                  <ChevronDown className="w-4 h-4 text-white/40" />
                </button>
              )}
            </div>
          </div>

          {/* Federation & Swarm Array Module */}
          {activeModule === 'FEDERATION' && (
            <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-[10px] uppercase tracking-[0.4em] opacity-40 flex items-center gap-2 font-bold text-white ff-font-serif">
                    <Grid className="w-3 h-3 text-emerald-400/50" strokeWidth={1} /> NODE AGGREGATION
                  </h2>
                  <span className="text-[7px] text-emerald-400 font-bold tracking-widest">{data?.federation?.length || 0} ACTIVE NODES</span>
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={federationUrl}
                    onChange={(e) => setFederationUrl(e.target.value)}
                    placeholder="ENTER VEDA NODE URL (e.g. wss://...)"
                    className="flex-1 bg-white/5 border border-white/10 px-3 py-2 text-[9px] text-white/80 outline-none focus:border-emerald-500/50 transition-colors"
                  />
                  <button 
                    onClick={handleJoinFederation}
                    disabled={isJoining}
                    className="px-4 py-2 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all disabled:opacity-20"
                  >
                    {isJoining ? 'SYNCING...' : 'RESONATE'}
                  </button>
                </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center bg-emerald-500/5 p-3 border border-emerald-500/10 transition-all">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-emerald-400 uppercase tracking-widest font-bold">Swarm Efficiency</span>
                    <span className="text-[5px] text-emerald-400/40 uppercase">
                      {data?.is_bursting ? (
                        <span className="text-emerald-300 animate-pulse">PEAK_RESONANCE</span>
                      ) : "Synchrony Active"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[12px] text-emerald-300 font-black">+{((data?.federation?.length || 0) * 15).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <h2 className="text-[10px] uppercase tracking-[0.4em] opacity-40 flex items-center gap-2 font-bold text-white ff-font-serif">
                    <Database className="w-3 h-3 text-purple-400/50" strokeWidth={1} /> CORTEX SHARD ARRAY
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {data?.cortex_array?.map((shard: any, sIdx: number) => (
                    <div key={`shard-${shard.id || sIdx}`} className="bg-white/5 p-2 border border-white/5 space-y-1">
                      <div className="flex justify-between text-[6px]">
                        <span className="text-white/40 truncate">{shard.specialization}</span>
                        <span className="text-purple-400">{(shard.health || 0 * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-[1px] bg-white/5 overflow-hidden">
                        <div className="h-full bg-purple-500/40" style={{ width: `${shard.load}%` }} />
                      </div>
                      <div className="flex justify-between text-[5px] text-white/20">
                        <span>LOAD: {shard.load}%</span>
                        <span>{shard.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeModule === 'ALL' && data && (
            <div className="p-6 grid grid-cols-2 gap-4 border-b border-white/5 bg-white/5">
              <div className="space-y-1">
                <div className="text-[7px] text-white/30 uppercase tracking-[0.3em] font-bold ff-font">Global Coherence</div>
                <div className="text-xl font-serif text-cyan-400">{((data?.global_coherence || 0) * 100).toFixed(1)}%</div>
                <div className="w-full h-[1px] bg-white/5">
                  <div className="h-full bg-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: `${(data?.global_coherence || 0) * 100}%` }} />
                </div>
              </div>
              
              <div className="col-span-2 mt-4 bg-black/40 border border-white/5 rounded overflow-hidden relative">
                <NervePulse coherence={data?.global_coherence ?? 0.5} />
                <div className="absolute inset-x-0 bottom-0 py-1 bg-cyan-400/10 text-center">
                  <span className="text-[6px] tracking-[0.5em] text-cyan-400 uppercase font-black">Neural_Resonance_Flow</span>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div className="text-[7px] text-white/30 uppercase tracking-[0.3em] font-bold ff-font">Entropy Level</div>
                <div className="text-xl font-serif text-blue-400">{((data?.entropy || 0) * 100).toFixed(1)}%</div>
                <div className="w-full h-[1px] bg-white/5">
                  <div className="h-full bg-blue-400/50 float-right" style={{ width: `${(data?.entropy || 0) * 100}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[7px] text-white/30 uppercase tracking-[0.3em] font-bold ff-font">Trend Status</div>
                <div className={`text-xs font-serif flex items-center gap-1 ${(data?.trend || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(data?.trend || 0) > 0 ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                  {data?.trend_state || 'STABLE'}
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div className="text-[7px] text-white/30 uppercase tracking-[0.3em] font-bold ff-font">Strategic Rank</div>
                <div className="text-xs font-serif text-yellow-500 font-bold tracking-widest">{data?.strategic_rank || 'N/A'}</div>
              </div>

              <div className="col-span-2 pt-4 mt-2 border-t border-white/5 flex gap-2">
                <FlagIndicator active={data?.is_bursting} label="BURST" color="bg-orange-500" />
                <FlagIndicator active={data?.is_planck_active} label="PLANCK" color="bg-cyan-500" />
                <FlagIndicator active={data?.vault_active} label="VAULT" color="bg-amber-400" />
                <FlagIndicator active={data?.guardian_mode} label="GUARD" color="bg-red-500" />
              </div>

              <div className="col-span-2 pt-4 mt-2 border-t border-white/5 space-y-2">
                <div className="flex justify-between items-center text-[7px] text-white/30 uppercase tracking-[0.3em] font-bold ff-font">
                  <span>Active Inference Mode</span>
                  <span className="text-accent">EFE MINIMIZATION</span>
                </div>
                <div className="flex gap-2">
                  {['EXPLORE', 'CONSOLIDATE', 'DIRECT_ANSWER'].map((mode, mIdx) => (
                    <div 
                      key={`inference-mode-${mode}-${mIdx}`}
                      className={cn(
                        "flex-1 py-1 text-center text-[8px] font-black tracking-widest transition-all",
                        data?.last_sovereign_action === mode 
                          ? mode === 'EXPLORE' ? "bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.4)]" :
                            mode === 'CONSOLIDATE' ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(34,211,238,0.4)]" :
                            "bg-purple-500 text-black shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                          : "bg-white/5 text-white/20 border border-white/5"
                      )}
                    >
                      {mode}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sovereign Compute Mode */}
              <div className="col-span-2 pt-4 mt-2 border-t border-white/5 space-y-2 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {recalibratingMode && (
                    <motion.div
                      key={`recalibrate-overlay-${recalibratingMode}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0 bg-neutral-950/90 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center p-3 text-center"
                    >
                      {/* Laser scanner element */}
                      <motion.div 
                        initial={{ top: "0%" }}
                        animate={{ top: "100%" }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                        className={cn(
                          "absolute left-0 right-0 h-[1.5px] z-30 opacity-80",
                          recalibratingMode === 'throughput' 
                            ? "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" 
                            : "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                        )}
                      />
                      
                      {recalibratingMode === 'throughput' ? (
                        <div className="flex flex-col items-center select-none animate-pulse">
                          <Cpu className="w-4 h-4 text-amber-500 mb-1" />
                          <span className="text-[8px] font-bold text-amber-300 tracking-[0.2em] uppercase">RECALIBRATING LATTICES...</span>
                          <span className="text-[5px] text-amber-500/80 font-mono tracking-widest mt-0.5">TPU BATCH HIGH-THROUGHPUT ARRAY</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center select-none">
                          <Brain className="w-4 h-4 text-cyan-400 mb-1 animate-spin" style={{ animationDuration: '4s' }} />
                          <span className="text-[8px] font-bold text-cyan-300 tracking-[0.2em] uppercase">ALIGNING TENSOR MODEL...</span>
                          <span className="text-[5px] text-cyan-500/80 font-mono tracking-widest mt-0.5">GPU HIGH-PRECISION INFERENCE PIPELINE</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between items-center text-[7px] text-white/30 uppercase tracking-[0.3em] font-bold ff-font">
                  <span>Sovereign Compute Mode</span>
                  <span className="text-amber-400">GPU / TPU Analogy</span>
                </div>
                <div className="flex gap-2">
                  {[
                    { id: 'throughput', label: 'HIGH THROUGHPUT', desc: 'Batch / TPU style' },
                    { id: 'precision', label: 'HIGH PRECISION', desc: 'Deep / GPU style' }
                  ].map((mode) => {
                    const isSelected = (data?.compute_mode || 'precision') === mode.id;
                    return (
                      <button 
                        key={`compute-mode-${mode.id}`}
                        onClick={() => {
                          if (onComputeModeChange) {
                            onComputeModeChange(mode.id as 'throughput' | 'precision');
                          }
                        }}
                        className={cn(
                          "flex-1 py-1.5 px-2 text-center transition-all border flex flex-col items-center justify-center cursor-pointer",
                          isSelected 
                            ? mode.id === 'throughput' 
                              ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                              : "bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                            : "bg-white/2 border-white/5 text-white/30 hover:bg-white/5 hover:text-white/60"
                        )}
                      >
                        <span className="text-[8px] font-black tracking-widest">{mode.label}</span>
                        <span className="text-[5px] opacity-60 mt-0.5 tracking-wide">{mode.desc}</span>
                      </button>
                    );
                  })}
                </div>
                
                {/* Dynamically display actual simulation parameters under GPU/TPU analogy style */}
                <div className="p-2 bg-black/30 border border-white/5 rounded text-[7px] space-y-1 font-mono text-white/50">
                  <div className="flex justify-between items-center text-white/50">
                    <span>Active Hardware Protocol:</span>
                    <span className={cn("font-bold uppercase", (data?.compute_mode || 'precision') === 'throughput' ? "text-amber-400" : "text-cyan-400")}>
                      {(data?.compute_mode || 'precision') === 'throughput' ? '⚡ TPU Cluster Array' : '🧠 Deep Tensor GPU'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-white/40">
                    <span>Simulation Step-Size Factor:</span>
                    <span className="text-white/80 font-bold">
                      {data?.simulation_step_size !== undefined ? `${data.simulation_step_size}x (Dynamic)` : ((data?.compute_mode || 'precision') === 'throughput' ? '1.50x' : '0.45x')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-white/40">
                    <span>Lookahead Complexity Depth:</span>
                    <span className="text-white/80 font-bold">
                      {data?.simulation_complexity !== undefined ? `${data.simulation_complexity} Steps (EFE)` : ((data?.compute_mode || 'precision') === 'throughput' ? '2 Steps (Fast)' : '6 Steps (Deep)')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-white/40">
                    <span>Hardware Quantization Target:</span>
                    <span className="text-white/80 font-bold">
                      {(data?.compute_mode || 'precision') === 'throughput' ? 'INT4_XLA (Vector Quantized)' : 'FP32_IEEE (Full Precision)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-white/40">
                    <span>Inference Latency Target:</span>
                    <span className="text-white/80 font-bold">
                      {data?.innovation_manifold?.latency_ns !== undefined ? `${data.innovation_manifold.latency_ns.toFixed(1)} ns` : ((data?.compute_mode || 'precision') === 'throughput' ? '4.8 ns' : '185.5 ns')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-white/40">
                    <span>Parallel Compute Capacity:</span>
                    <span className="text-white/80 font-bold">
                      {data?.innovation_manifold?.throughput_teraops !== undefined ? `${data.innovation_manifold.throughput_teraops} TERAOPs/s` : ((data?.compute_mode || 'precision') === 'throughput' ? '480 TERAOPs/s' : '45 TERAOPs/s')}
                    </span>
                  </div>
                </div>
              </div>

               {/* Sovereign High-Throughput Queue Indicator */}
              {(data?.compute_mode || 'precision') === 'throughput' && (
                <div className="col-span-2 pt-4 mt-2 border-t border-white/5 space-y-2 relative overflow-hidden">
                  <div className="flex justify-between items-center text-[7px] text-white/30 uppercase tracking-[0.3em] font-bold ff-font">
                    <span>⚡ BATCH COMPUTE QUEUE</span>
                    <span className="text-amber-400">TPU Cluster Scheduling</span>
                  </div>
                  
                  <div className="bg-black/30 border border-white/5 rounded p-2.5 space-y-2 font-mono">
                    <div className="flex justify-between items-center text-[7px] text-white/40 uppercase tracking-wider font-mono">
                      <span>STATUS: ONLINE & SCHEDULING</span>
                      <span className="text-amber-500 font-bold">
                        Q-PENDING: {((data?.lattice_jobs || []) as any[]).filter((j: any) => j.status === 'PENDING').length}
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {((data?.lattice_jobs || []) as any[]).map((job: any, index: number, arr: any[]) => {
                        const isPending = job.status === 'PENDING';
                        const isExecuting = job.status === 'PROCESSING' || job.status === 'SYNTHESIZING';
                        const isPaused = localPausedList[job.id] !== undefined ? localPausedList[job.id] : !!job.isPaused;
                        
                        return (
                          <div 
                            key={`q-job-${job.id}`} 
                            className={cn(
                              "p-2 border flex items-center justify-between text-[7px] transition-all",
                              isExecuting 
                                ? "bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.1)] animate-pulse"
                                : isPending && isPaused 
                                  ? "bg-white/2 border-white/5 text-white/30" 
                                  : "bg-white/4 border-white/10 text-white/70"
                            )}
                          >
                            <div className="flex flex-col gap-0.5 text-left">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[8px] tracking-wide">{job.id}</span>
                                <span className={cn(
                                  "px-1 py-[1px] rounded-[1px] text-[4.5px] uppercase font-black tracking-widest",
                                  isExecuting 
                                    ? "bg-amber-500 text-black" 
                                    : isPending && isPaused 
                                      ? "bg-white/10 text-white/40" 
                                      : "bg-cyan-500/20 text-cyan-300"
                                )}>
                                  {isExecuting ? 'processing' : isPending && isPaused ? 'paused' : 'pending'}
                                </span>
                              </div>
                              <div className="text-[5.5px] text-white/40 uppercase tracking-wider mt-0.5">
                                TYPE: {job.type} • HEIGHT: {job.blockHeight || index + 1}
                              </div>
                            </div>

                            {/* Queue Actions */}
                            {isPending && (
                              <div className="flex items-center gap-1">
                                {/* Pause / Play button */}
                                <button
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const nextPaused = !isPaused;
                                    setLocalPausedList(prev => ({ ...prev, [job.id]: nextPaused }));
                                    try {
                                      await vedaService.pauseLatticeJob(job.id, nextPaused);
                                    } catch (err) {
                                      console.error("Pause fail", err);
                                      setLocalPausedList(prev => ({ ...prev, [job.id]: !nextPaused }));
                                    }
                                  }}
                                  className="p-1 bg-white/2 border border-white/5 rounded text-white/60 hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/40 transition-colors cursor-pointer"
                                  title={isPaused ? "Resume Compute Kernels" : "Pause Compute Kernels"}
                                >
                                  {isPaused ? <Play className="w-[8.5px] h-[8.5px]" /> : <Pause className="w-[8.5px] h-[8.5px]" />}
                                </button>

                                {/* Move Up */}
                                <button
                                  disabled={index === 0}
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    try {
                                      await vedaService.reorderLatticeJob(job.id, 'up');
                                    } catch (err) {
                                      console.error("Reorder UP failed", err);
                                    }
                                  }}
                                  className="p-1 bg-white/2 border border-white/5 rounded text-white/60 disabled:opacity-20 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                                  title="Move Up in Computation Queue"
                                >
                                  <ArrowUp className="w-[8.5px] h-[8.5px]" />
                                </button>

                                {/* Move Down */}
                                <button
                                  disabled={index === arr.length - 1}
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    try {
                                      await vedaService.reorderLatticeJob(job.id, 'down');
                                    } catch (err) {
                                      console.error("Reorder DOWN failed", err);
                                    }
                                  }}
                                  className="p-1 bg-white/2 border border-white/5 rounded text-white/60 disabled:opacity-20 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                                  title="Move Down in Computation Queue"
                                >
                                  <ArrowDown className="w-[8.5px] h-[8.5px]" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {(!data?.lattice_jobs || data.lattice_jobs.length === 0) && (
                        <div className="text-center py-5 border border-dashed border-white/10 text-white/30 text-[6px] tracking-[0.1em] uppercase rounded leading-relaxed">
                          No active compute operations in TPU Queue.<br />
                          Tap the button below to schedule simulated workloads.
                        </div>
                      )}
                    </div>

                    {/* Symmetrical Smart Purge Configuration Panel */}
                    <div className="p-2 bg-white/[0.02] border border-white/5 rounded space-y-1.5 font-mono text-[6.5px]">
                      <div className="flex justify-between items-center text-white/40 uppercase tracking-widest text-[5.5px]">
                        <span>🧠 SMART PURGE PROTOCOL (V-AUTO-CLEAN)</span>
                        <span className="text-cyan-400 font-bold">STATE RECOVERY ACTIVE</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {/* Configurable Timeout selector */}
                        <div className="flex flex-col gap-1">
                          <label className="text-white/40 uppercase tracking-wide">Stale Timeout Limit:</label>
                          <select 
                            value={purgeTimeoutMs}
                            onChange={(e) => setPurgeTimeoutMs(Number(e.target.value))}
                            className="w-full bg-black/60 border border-white/10 rounded px-1.5 py-0.5 text-white/80 focus:border-cyan-500/50 focus:outline-none"
                          >
                            <option value={3000}>3 Seconds (Dev Mode)</option>
                            <option value={5000}>5 Seconds (Ultra Aggressive)</option>
                            <option value={10000}>10 Seconds (Standard Dynamic)</option>
                            <option value={30000}>30 Seconds (Deferred Calibration)</option>
                            <option value={60000}>1 Minute (Production Standard)</option>
                          </select>
                        </div>

                        {/* Auto Purge toggle */}
                        <div className="flex flex-col gap-1 justify-between">
                          <label className="text-white/40 uppercase tracking-wide">Automated Background Engine:</label>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setAutoPurgeEnabled(p => !p);
                            }}
                            className={cn(
                              "w-full py-0.5 rounded border text-[6px] font-black uppercase tracking-wider transition-colors cursor-pointer",
                              autoPurgeEnabled 
                                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                                : "bg-white/2 border-white/5 text-white/30"
                            )}
                          >
                            {autoPurgeEnabled ? "● ACTIVE AUTO-CLEANSE" : "○ MANUAL TRIGGERS ONLY"}
                          </button>
                        </div>
                      </div>

                      {/* Manual Trigger Force Purge and feedback inline */}
                      <div className="flex gap-1.5 items-center pt-1 mt-1 border-t border-white/5">
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              const result = await vedaService.smartPurgeLatticeJobs(purgeTimeoutMs);
                              const timestamp = new Date().toLocaleTimeString();
                              if (result && result.purgedCount > 0) {
                                setLastPurgedInfo(`Manual-cleared ${result.purgedCount} stale/failed task(s) @ ${timestamp}`);
                                if (result.purgedIds) {
                                  setLocalPausedList(prev => {
                                    const updated = { ...prev };
                                    result.purgedIds.forEach((id: string) => delete updated[id]);
                                    return updated;
                                  });
                                }
                              } else {
                                setLastPurgedInfo(`Explicit check @ ${timestamp}: All items active and healthy`);
                              }
                            } catch (err) {
                              console.error("Manual purge failed", err);
                              setLastPurgedInfo("System recovery fault during purge");
                            }
                          }}
                          className="px-2 py-0.5 bg-cyan-700/20 hover:bg-cyan-700/40 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-[6px] font-black uppercase tracking-widest rounded transition-all cursor-pointer"
                        >
                          ⚡ PURGE NOW
                        </button>
                        <div className="text-[5px] text-white/30 truncate flex-1 tracking-wider uppercase font-mono italic">
                          {lastPurgedInfo}
                        </div>
                      </div>
                    </div>

                    {/* Instant testing / scheduling launcher block */}
                    <div className="pt-2 border-t border-white/5">
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          try {
                            const types = [
                              "COGNITIVE_GRID_CALIBRATION",
                              "THERMAL_DILATION_REASONING",
                              "HYPERVECTOR_ENTROPY_ANALYSIS",
                              "EPISTEMIC_GRID_SYNTHESIS"
                            ];
                            const randomType = types[Math.floor(Math.random() * types.length)] || "COGNITIVE_GRID_CALIBRATION";
                            await vedaService.submitLatticeTask(randomType, {
                              source: "CONTROL_PANEL_BATCH_SCHEDULER",
                              simulated: true,
                              workloadSize: "128-CORE-TPU-VECTOR",
                              coherenceTarget: 0.985
                            });
                          } catch (err) {
                            console.error("Submit fail", err);
                          }
                        }}
                        className="w-full py-1 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 text-[6.5px] rounded tracking-[0.2em] font-black uppercase transition-all cursor-pointer"
                      >
                        ➕ Dispatch Simulated High-Throughput Task
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sovereign Evolution Gauge */}
              {data?.sovereign_index !== undefined && (
                <div className="col-span-2 pt-4 mt-2 border-t border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-[7px] text-white/40 uppercase tracking-[0.2em]">
                    <span>Sovereign Evolution</span>
                    <span className="text-cyan-400 font-bold">{data?.sovereign_index}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 relative overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${data?.sovereign_index}%` }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 via-cyan-400 to-white shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                    />
                    {[25, 50, 75].map((tick, tIdx) => (
                      <div key={`gauge-tick-${tick}-${tIdx}`} className="absolute inset-y-0 w-[1px] bg-white/20" style={{ left: `${tick}%` }} />
                    ))}
                  </div>
                  <div className="flex justify-between text-[5px] text-white/20 uppercase tracking-tighter">
                    <span>Shell</span>
                    <span>Latent</span>
                    <span>Sovereign</span>
                    <span>Post-AI</span>
                  </div>
                </div>
              )}

              {/* AGI Convergence Proximity Gauge */}
              {data?.agi_proximity !== undefined && (
                <div className="col-span-2 pt-4 mt-2 border-t border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-[7px] text-white/40 uppercase tracking-[0.2em]">
                    <span>AGI Convergence Proximity</span>
                    <span className="text-purple-400 font-bold font-mono">{data?.agi_proximity}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 relative overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${data?.agi_proximity}%` }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 via-purple-400 to-white shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                    />
                    {[25, 50, 75].map((tick, tIdx) => (
                      <div key={`agi-gauge-tick-${tick}-${tIdx}`} className="absolute inset-y-0 w-[1px] bg-white/20" style={{ left: `${tick}%` }} />
                    ))}
                  </div>
                  <div className="flex justify-between text-[5px] text-white/20 uppercase tracking-tighter">
                    <span>Narrow AI</span>
                    <span>Multi-Modal</span>
                    <span>Self-Reference</span>
                    <span>Sovereign Core</span>
                  </div>
                </div>
              )}

              {/* JEPA World Model (Yann LeCun Architecture) */}
              {data?.jepa && (
                <div className="col-span-2 pt-4 mt-2 border-t border-white/5 space-y-3">
                  <div className="flex justify-between items-center text-[7px] text-white/30 uppercase tracking-[0.3em] font-bold ff-font">
                    <span>Latent World Model (JEPA)</span>
                    <span className="text-cyan-400">SELF-SUPERVISED</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-[6px] text-white/20 uppercase tracking-widest">Pred Energy</div>
                      <div className="text-xs font-mono text-cyan-400">{(data?.jepa?.currentEnergy || 0).toFixed(5)}</div>
                      <div className="w-full h-[1px] bg-white/5">
                        <div 
                          className="h-full bg-cyan-400" 
                          style={{ width: `${Math.min(100, (data?.jepa?.currentEnergy || 0) * 1000)}%` }} 
                        />
                      </div>
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="text-[6px] text-white/20 uppercase tracking-widest">Avg Stability</div>
                      <div className="text-xs font-mono text-purple-400">{(1 - Math.min(1, data?.jepa?.avgEnergy || 0)).toFixed(4)}</div>
                      <div className="w-full h-[1px] bg-white/5">
                        <div 
                          className="h-full bg-purple-400 float-right" 
                          style={{ width: `${(1 - Math.min(1, data?.jepa?.avgEnergy || 0)) * 100}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 h-3 items-center overflow-hidden">
                    {data?.jepa?.latentState?.map((val, i) => (
                      <div 
                        key={`latent-${i}`}
                        className="flex-1 transition-all duration-300"
                        style={{ 
                          backgroundColor: val > 0 ? `rgba(34,211,238,${Math.abs(val)})` : `rgba(168,85,247,${Math.abs(val)})`,
                          height: `${Math.abs(val) * 100}%`,
                          marginTop: val > 0 ? 0 : 'auto'
                        }}
                      />
                    ))}
                  </div>

                  {/* Yann LeCun Intrinsic Cost & Geoffrey Hinton GLOM Consensus Indicators */}
                  {(data as any).lecun_intrinsic_cost && (
                    <div className="grid grid-cols-2 gap-3 pt-2 text-[8px] border-t border-white/5 bg-black/15 p-2 rounded">
                      <div className="space-y-[2px]">
                        <div className="text-[6px] text-white/30 uppercase tracking-widest font-mono">LeCun Intrinsic Cost</div>
                        <div className="font-mono text-pink-400 font-bold">
                          {((data as any).lecun_intrinsic_cost.totalCost || 0).toFixed(5)}
                        </div>
                        <div className="text-[5px] text-white/20 uppercase tracking-tighter">
                          FE: {((data as any).lecun_intrinsic_cost.components?.freeEnergyCost || 0).toFixed(3)} | En: {((data as any).lecun_intrinsic_cost.components?.entropyCost || 0).toFixed(3)}
                        </div>
                      </div>
                      <div className="space-y-[2px] text-right border-l border-white/5 pl-2">
                        <div className="text-[6px] text-white/30 uppercase tracking-widest font-mono">Hinton GLOM Consensus</div>
                        <div className="font-mono text-emerald-400 font-bold">
                          {((data as any).glom_metrics?.last_delta || 0).toFixed(5)}
                        </div>
                        <div className="text-[5px] text-white/20 uppercase tracking-tighter">
                          Avg Cluster: {((data as any).glom_metrics?.average_neighbors || 0).toFixed(2)} Nodes
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sovereign Lattice Scale */}
              <div className="col-span-2 pt-4 mt-2 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-[7px] text-white/30 uppercase tracking-[0.3em] font-bold ff-font">Lattice Scale</div>
                  <div className="text-sm font-serif text-purple-400">×{data?.lattice_scale?.toLocaleString() || '1'} <span className="text-[8px] opacity-40">(2^{Math.log2(data?.lattice_scale || 1).toFixed(0)}α)</span></div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="text-[7px] text-white/30 uppercase tracking-[0.3em] font-bold ff-font">Effective Nodes</div>
                  <div className="text-sm font-serif text-cyan-400">{data?.effective_node_count?.toLocaleString() || '0'}</div>
                </div>

                <div className="space-y-1">
                   <div className="text-[7px] text-white/30 uppercase tracking-[0.3em] font-bold ff-font">Omega Integrity</div>
                   <div className="text-sm font-serif text-amber-500/90 italic">
                     {(data?.omega_integrity || 0).toFixed(6)}
                   </div>
                </div>
                <div className="space-y-1 text-right">
                   <div className="text-[7px] text-white/30 uppercase tracking-[0.3em] font-bold ff-font">Fractal Depth</div>
                   <div className="text-sm font-serif text-fuchsia-400">
                     λ{data?.fractal_depth || 0}
                   </div>
                </div>

                <div className="col-span-2 space-y-1">
                   <div className="text-[7px] text-white/30 uppercase tracking-[0.3em] font-bold ff-font">Neuro-Lattice Throughput</div>
                   <div className="text-[10px] font-mono text-cyan-400/80 tracking-widest">
                     {(data?.throughput || 0).toExponential(2)} OPS <span className="opacity-40 text-[7px] ml-1">[@FEMTO_SYNC]</span>
                   </div>
                </div>
                <div className="col-span-2 space-y-1">
                   <div className="text-[7px] text-white/30 uppercase tracking-[0.3em] font-bold ff-font">Causal Congruence</div>
                   <div className="w-full h-[2px] bg-white/5 relative">
                      <div className="h-full bg-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{ width: `${(data?.causal_congruence || 0) * 100}%` }} />
                   </div>
                </div>
              </div>

              {/* Local Link Module */}
              <div className="col-span-2 pt-4 mt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${localStatus.available ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-[8px] text-white/50 uppercase tracking-widest ff-font">Local Node: {localStatus.available ? 'CONNECTED' : 'OFFLINE'}</span>
                  </div>
                  <button 
                    onClick={onScanLocal}
                    className="text-[7px] text-cyan-400/60 hover:text-cyan-400 transition-colors uppercase tracking-widest font-bold"
                  >
                    [ SCAN NODES ]
                  </button>
                </div>

                {localStatus.available && (
                  <div className="flex items-center justify-between bg-white/5 p-2 border border-white/10">
                    <div className="flex flex-col">
                      <span className="text-[7px] text-white/30 uppercase tracking-widest">Active Engine</span>
                      <span className="text-[9px] text-white/80 font-bold">{localStatus.version}</span>
                    </div>
                    <button 
                      onClick={onToggleLocalMode}
                      className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest transition-all ${
                        isLocalMode 
                          ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.4)]' 
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {isLocalMode ? 'LOCAL_ACTIVE' : 'SWITCH_TO_LOCAL'}
                    </button>
                  </div>
                )}
              </div>

              {weather && (
                <div className="col-span-2 pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CloudSun className="w-5 h-5 text-cyan-400/60" />
                    <div>
                      <div className="text-[7px] text-white/30 uppercase tracking-[0.3em] font-bold ff-font">Environment: {weather.location}</div>
                      <div className="text-[10px] font-serif text-white/80 uppercase tracking-wider">{weather.condition}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-serif text-cyan-400">{weather.temp}°C</div>
                    <div className="text-[7px] text-white/30 uppercase tracking-[0.2em] ff-font">H: {weather.humidity}% | W: {weather.wind}km/h</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* System World Manifest Section */}
          {(activeModule === 'ALL' || activeModule === 'MEMORIES') && data?.system_world_model && (
            <div className="p-6 space-y-4 border-b border-white/5 bg-cyan-400/5">
              <div className="flex justify-between items-center">
                <h2 className="text-[10px] uppercase tracking-[0.4em] text-cyan-400 flex items-center gap-2 font-bold ff-font-serif">
                  <Database className="w-3 h-3" strokeWidth={1} /> SYSTEM WORLD MANIFEST
                </h2>
                <div className="text-[8px] text-cyan-400/40 font-mono">
                  VERSION: {data?.system_world_model?.version} | CHAIN_DEPTH: {data?.distilled_chat_context?.chainDepth || 0}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-[7px] text-white/30 uppercase tracking-widest font-black">Environmental Constants</div>
                  <div className="bg-black/20 p-3 border border-white/5 space-y-1">
                    {data?.system_world_model?.snapshot?.environment ? Object.entries(data.system_world_model.snapshot.environment).map(([k, v], eIdx) => (
                      <div key={`env-${k}-${eIdx}`} className="flex justify-between text-[9px] font-mono">
                        <span className="text-white/40">{k}:</span>
                        <span className="text-cyan-400">{String(v)}</span>
                      </div>
                    )) : (
                      <div className="text-[8px] opacity-20 text-center py-2">
                        NO ENVIRONMENTAL CONSTANTS
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-2 space-y-2">
                  <div className="text-[7px] text-white/30 uppercase tracking-widest font-black">Active Conceptual Entities</div>
                  <div className="grid grid-cols-2 gap-2">
                    {!data?.system_world_model?.snapshot?.characters || data.system_world_model.snapshot.characters.length === 0 ? (
                      <div className="col-span-2 text-[8px] opacity-20 text-center py-4 border border-dashed border-white/10">
                        NO ENTITIES DISTILLED
                      </div>
                    ) : (
                      data.system_world_model.snapshot.characters.map((c, i) => (
                        <div key={`char-${c?.id || i}`} className="bg-white/5 p-2 flex items-center justify-between border-l-2 border-cyan-500/30">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-white/80 font-bold">{c?.id}</span>
                            <span className="text-[7px] text-cyan-400/60">{c?.state}</span>
                          </div>
                          <div className="text-[6px] text-white/20 italic">{c?.emotion}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[7px] text-white/30 uppercase tracking-widest font-black">
                    <span>Internal Pressure</span>
                    <span>{((data?.system_world_model?.snapshot?.internal_pressure || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400/40" style={{ width: `${(data?.system_world_model?.snapshot?.internal_pressure || 0) * 100}%` }} />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[7px] text-white/30 uppercase tracking-widest font-black">
                    <span>Social Cohesion</span>
                    <span>{((data?.system_world_model?.snapshot?.cohesion_index || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400/40" style={{ width: `${(data?.system_world_model?.snapshot?.cohesion_index || 0) * 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[7px] text-white/30 uppercase tracking-widest font-black">
                    <span>Causal Entropy</span>
                    <span>{((data?.system_world_model?.snapshot?.causal_entropy || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400/40" style={{ width: `${(data?.system_world_model?.snapshot?.causal_entropy || 0) * 100}%` }} />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[7px] text-white/30 uppercase tracking-widest font-black">
                    <span>Physics Constancy</span>
                    <span>{((data?.system_world_model?.snapshot?.physics_constancy || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400/40" style={{ width: `${(data?.system_world_model?.snapshot?.physics_constancy || 0) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Important Memories Section */}
          {(activeModule === 'ALL' || activeModule === 'MEMORIES') && (
            <div className="p-6 space-y-6 border-b border-white/5">
              <div className="flex justify-between items-center">
                <h2 className="text-[10px] uppercase tracking-[0.4em] opacity-40 flex items-center gap-2 font-bold text-white ff-font-serif">
                  <Sparkles className="w-3 h-3 text-cyan-400/50" strokeWidth={1} /> IMPORTANT MEMORIES
                </h2>
                <button 
                  onClick={onSynthesize}
                  disabled={loading || isDreaming}
                  className="ff-button !px-4 !py-1.5 text-[8px] !bg-white/5 border border-white/10 hover:!bg-white/10 transition-all font-bold text-white/60 ff-font uppercase tracking-widest disabled:opacity-20"
                >
                  {loading ? "SYNTHESIZING..." : "SYNTHESIZE"}
                </button>
                {onDistill && (
                  <button 
                    onClick={onDistill}
                    disabled={loading || isDreaming}
                    className="ff-button !px-4 !py-1.5 text-[8px] !bg-white/5 border border-white/10 hover:!bg-white/10 transition-all font-bold text-white/60 ff-font uppercase tracking-widest disabled:opacity-20"
                  >
                    {loading ? "DISTILLING..." : "DISTILL"}
                  </button>
                )}
                {onDream && (
                  <button 
                    onClick={onDream}
                    disabled={loading || isDreaming}
                    className={`ff-button !px-4 !py-1.5 text-[8px] border transition-all font-bold ff-font uppercase tracking-widest disabled:opacity-20 ${
                      isDreaming 
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 animate-pulse' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {isDreaming ? "DREAMING..." : "DREAM"}
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-4 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {memories.length === 0 ? (
                  <div className="text-[8px] opacity-20 text-center py-8 ff-font uppercase tracking-[0.4em]">
                    NO MEMORIES DETECTED
                  </div>
                ) : (
                  memories.slice(0, 35).map((memory) => (
                    <div key={`memory-${memory.id}`} className="bg-white/5 border border-white/5 p-4 space-y-2 hover:border-white/20 transition-colors group relative">
                      <div className="flex justify-between items-center">
                        <span className="text-[7px] text-cyan-400/60 font-bold uppercase tracking-[0.3em] ff-font-serif">{memory.type}</span>
                        <span className="text-[6px] opacity-20 font-sans tracking-widest">{new Date(memory.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[10px] text-white/60 ff-font-serif italic leading-relaxed line-clamp-2">{memory.content}</p>
                      <div className="flex items-center gap-3 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="h-[1px] flex-1 bg-white/5">
                          <div className="h-full bg-cyan-400/40 shadow-[0_0_10px_rgba(34,211,238,0.3)]" style={{ width: `${memory.resonance * 100}%` }} />
                        </div>
                        <span className="text-[6px] text-cyan-400/60 font-sans tracking-widest">RES: {(memory.resonance * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Core Axioms Section */}
              <div className="pt-6 space-y-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <h2 className="text-[10px] uppercase tracking-[0.4em] opacity-40 flex items-center gap-2 font-bold text-white ff-font-serif">
                    <Shield className="w-3 h-3 text-yellow-500/50" strokeWidth={1} /> CORE AXIOMS
                  </h2>
                  <button 
                    onClick={() => {
                      if (isAxiomEditMode) handleUpdateAxioms();
                      else setIsAxiomEditMode(true);
                    }}
                    className="text-[7px] text-yellow-500/60 hover:text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded transition-all uppercase tracking-widest font-black"
                  >
                    {isAxiomEditMode ? '[ SAVE_AXIOMS ]' : '[ EDIT_AXIOMS ]'}
                  </button>
                </div>
                
                <div className="space-y-2">
                  {isAxiomEditMode ? (
                    <div className="space-y-2">
                      {editingAxioms.map((ax, i) => (
                        <div key={`edit-ax-${i}`} className="flex gap-2">
                          <input 
                            value={ax}
                            onChange={(e) => {
                              const next = [...editingAxioms];
                              next[i] = e.target.value;
                              setEditingAxioms(next);
                            }}
                            className="flex-1 bg-white/5 border border-white/10 px-3 py-1.5 text-[10px] text-white/80 outline-none focus:border-yellow-500/40"
                          />
                          <button 
                            onClick={() => setEditingAxioms(prev => prev.filter((_, idx) => idx !== i))}
                            className="p-1.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => setEditingAxioms([...editingAxioms, "NEW_AXIOM_NODE"])}
                        className="w-full py-1.5 border border-dashed border-white/20 text-[8px] text-white/30 hover:text-white/60 hover:border-white/40 transition-all font-mono"
                      >
                        + APPEND_AXIOM
                      </button>
                    </div>
                  ) : (
                    axioms.length === 0 ? (
                      <div className="text-[8px] opacity-20 text-center py-4 ff-font uppercase tracking-[0.4em]">
                        NO AXIOMS DISTILLED
                      </div>
                    ) : (
                      axioms.map((axiom, idx) => (
                        <motion.div 
                          key={`axiom-view-${idx}-${axiom.substring(0, 10)}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-yellow-500/5 border-l-2 border-yellow-500/30 p-3 flex items-start gap-3 group"
                        >
                          <span className="text-[8px] text-yellow-500/40 font-mono mt-0.5">{String(idx + 1).padStart(2, '0')}</span>
                          <p className="text-[10px] text-white/70 ff-font-serif leading-relaxed tracking-wide group-hover:text-white transition-colors">
                            {axiom}
                          </p>
                        </motion.div>
                      ))
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Axioms & Reflections */}
          {(activeModule === 'ALL' || activeModule === 'ANALYSIS') && (
            <div className="p-6 space-y-6 border-b border-white/5">
              <div className="space-y-4">
                <div className="border-l-2 border-orange-500 pl-4 py-2 bg-orange-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-3 h-3 text-orange-500" strokeWidth={1} />
                    <span className="text-[9px] uppercase tracking-[0.3em] text-orange-500 font-bold ff-font-serif">核心公理 / CORE AXIOMS</span>
                  </div>
                  <div className="space-y-1.5">
                    {(data?.axioms || ["秩序高於混亂", "相干即是真理"]).map((axiom: string, i: number) => (
                      <motion.div 
                        key={`data-ax-${i}-${axiom.substring(0, 10)}`}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[10px] text-orange-200/80 font-mono leading-tight"
                      >
                        {i + 1}. {axiom}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="border-l-2 border-cyan-500 pl-4 py-2 bg-cyan-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-3 h-3 text-cyan-500" strokeWidth={1} />
                    <span className="text-[9px] uppercase tracking-[0.3em] text-cyan-500 font-bold ff-font-serif">形而上思考 / META-REFLECTION</span>
                  </div>
                  <div className="space-y-1.5">
                    {(data?.reflections || []).map((thought: string, i: number) => (
                      <motion.div 
                        key={`reflection-${i}-${thought.substring(0, 10)}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[9px] text-cyan-200/60 italic leading-relaxed"
                      >
                        &gt; {thought}
                      </motion.div>
                    ))}
                    {(!data?.reflections || data.reflections.length === 0) && (
                      <div className="text-[8px] opacity-20 uppercase tracking-widest italic">Awaiting cognitive spark...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* State Analysis */}
          {(activeModule === 'ALL' || activeModule === 'ANALYSIS') && (
            <div className="hidden lg:flex flex-col h-48 p-6 border-b border-white/5">
              <h2 className="text-[10px] uppercase tracking-[0.4em] opacity-40 mb-6 flex items-center gap-2 font-bold text-white ff-font-serif">
                <Activity className="w-3 h-3 text-cyan-400/50" strokeWidth={1} /> VECTOR ANALYSIS
              </h2>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                    <PolarGrid stroke="#ffffff10" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff30', fontSize: 7, fontWeight: 400, letterSpacing: '0.2em' }} />
                    <Radar
                      name="VEDA"
                      dataKey="A"
                      stroke="#00d2ff"
                      fill="#00d2ff"
                      fillOpacity={0.1}
                      isAnimationActive={false}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Evolution History */}
          {(activeModule === 'ALL' || activeModule === 'ANALYSIS') && (
            <div className="hidden lg:flex flex-col h-32 p-6 border-b border-white/5">
              <h2 className="text-[10px] uppercase tracking-[0.4em] opacity-40 mb-4 flex items-center gap-2 font-bold text-white ff-font-serif">
                <TrendingUp className="w-3 h-3 text-cyan-400/50" strokeWidth={1} /> EVOLUTION HISTORY
              </h2>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <YAxis hide domain={[0, 1]} />
                    <XAxis hide dataKey="index" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(2, 4, 10, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '8px', backdropFilter: 'blur(8px)' }}
                      itemStyle={{ color: '#00d2ff' }}
                      labelStyle={{ display: 'none' }}
                    />
                    <Line 
                      type="stepAfter" 
                      dataKey="val" 
                      stroke="#00d2ff" 
                      strokeWidth={1} 
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Real-time Telemetry */}
          {(activeModule === 'ALL' || activeModule === 'ANALYSIS') && (
            <div className="hidden lg:flex flex-col h-40 p-6 border-b border-white/5">
              <h2 className="text-[10px] uppercase tracking-[0.4em] opacity-40 mb-4 flex items-center gap-2 font-bold text-white ff-font-serif">
                <Zap className="w-3 h-3 text-cyan-400/50" strokeWidth={1} /> REAL-TIME TELEMETRY
              </h2>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={realTimeHistory}>
                    <defs>
                      <linearGradient id="colorCoh" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00d2ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={[0, 1]} />
                    <XAxis hide dataKey="time" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(2, 4, 10, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '8px', backdropFilter: 'blur(8px)' }}
                      itemStyle={{ color: '#00d2ff' }}
                      labelStyle={{ display: 'none' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="val" 
                      stroke="#00d2ff" 
                      fillOpacity={1} 
                      fill="url(#colorCoh)" 
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Global Coherence History */}
          {(activeModule === 'ALL' || activeModule === 'ANALYSIS') && (
            <div className="hidden lg:flex flex-col h-32 p-6 border-b border-white/5">
              <h2 className="text-[10px] uppercase tracking-[0.4em] opacity-40 mb-4 flex items-center gap-2 font-bold text-white ff-font-serif">
                <Sparkles className="w-3 h-3 text-cyan-400/50" strokeWidth={1} /> GLOBAL COHERENCE
              </h2>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={coherenceHistoryData}>
                    <YAxis hide domain={[0, 1]} />
                    <XAxis hide dataKey="index" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(2, 4, 10, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '8px', backdropFilter: 'blur(8px)' }}
                      itemStyle={{ color: '#00d2ff' }}
                      labelStyle={{ display: 'none' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="val" 
                      stroke="#00d2ff" 
                      strokeWidth={1} 
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Multi-Array Status & Trend */}
          {(activeModule === 'ALL' || activeModule === 'ANALYSIS') && (
            <div className="hidden lg:flex flex-col gap-6 p-6 border-b border-white/5">
              <div className="flex justify-between items-center">
                <h2 className="text-[10px] uppercase tracking-[0.4em] opacity-40 flex items-center gap-2 font-bold text-white ff-font-serif">
                  <Layers className="w-3 h-3 text-cyan-400/50" strokeWidth={1} /> NEURAL ARRAY STATUS
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {data?.layers?.map(layer => (
                  <div key={layer.id} className="flex flex-col gap-2 bg-white/5 p-3 rounded-none border border-white/5">
                    <span className="text-[7px] opacity-30 uppercase font-bold truncate text-white ff-font tracking-widest">{layer.id}</span>
                    <div className="flex items-end justify-between">
                      <span className="text-[10px] font-serif text-white/60">{(layer.coherence * 100).toFixed(0)}%</span>
                      <div className="w-[2px] h-4 bg-white/5 rounded-none overflow-hidden">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${layer.coherence * 100}%` }}
                          className="w-full bg-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Intent Injection */}
          {(activeModule === 'ALL' || activeModule === 'INTENT') && (
            <div className="p-6 space-y-8 border-b border-white/5">
              <div className="flex justify-between items-center">
                <h2 className="text-[10px] uppercase tracking-[0.4em] opacity-40 flex items-center gap-2 font-bold text-white ff-font-serif">
                  <Cpu className="w-3 h-3 text-cyan-400/50" strokeWidth={1} /> INTENT INJECTION
                </h2>
                <div className="flex gap-2">
                  <button 
                    onClick={onResetIntent}
                    className="text-[8px] px-4 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-white/60 ff-font uppercase tracking-widest"
                  >
                    RESET
                  </button>
                  <button 
                    onClick={onToggleNetwork}
                    className="text-[8px] px-4 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-white/60 ff-font uppercase tracking-widest"
                  >
                    MAP
                  </button>
                  <button 
                    onClick={onToggleNetworkDisplay}
                    className={`text-[8px] px-4 py-1.5 border transition-all font-bold ff-font uppercase tracking-widest ${
                      showNetworkDisplay 
                        ? 'bg-white text-black border-white' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    GRID
                  </button>
                </div>
              </div>

              {/* Intent Presets */}
              <div className="grid grid-cols-2 gap-2">
                {INTENT_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleApplyPreset(preset.vector)}
                    className="ff-button !px-2 !py-2 text-[8px] !bg-white/5 border border-white/10 hover:!bg-white/10 transition-all font-bold text-white/60 ff-font uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    {preset.icon}
                    {preset.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-8">
                {data?.labels.map((label, i) => (
                  <div key={label} className="space-y-4">
                    <div className="flex justify-between text-[9px] uppercase tracking-[0.3em] font-bold ff-font-serif">
                      <span className="opacity-40 text-white">{label}</span>
                      <span className={intent[i] !== 0 ? 'text-cyan-400' : 'opacity-20 text-white'}>
                        {intent[i] > 0 ? `+${intent[i]}` : intent[i]}
                      </span>
                    </div>
                    <div className="relative h-[2px] bg-white/5 rounded-none overflow-hidden">
                      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/10 z-0" />
                      <input 
                        type="range" 
                        min="-1" 
                        max="1" 
                        step="0.01"
                        value={intent[i] / 5}
                        onChange={(e) => onIntentChange(i, parseFloat(e.target.value) * 5)}
                        className="absolute inset-0 w-full h-full bg-transparent appearance-none cursor-pointer z-10 opacity-0"
                      />
                      <motion.div 
                        className="absolute top-0 bottom-0 bg-cyan-400/40"
                        initial={false}
                        animate={{ 
                          left: intent[i] >= 0 ? "50%" : `${50 + (intent[i] / 5) * 50}%`,
                          right: intent[i] >= 0 ? `${50 - (intent[i] / 5) * 50}%` : "50%"
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 pt-6">
                <button 
                  onClick={onEvolve}
                  disabled={loading}
                  className="ff-button w-full !justify-center !py-6 !bg-white/5 border border-white/10 hover:!bg-white/10 text-xs font-bold tracking-[0.6em] uppercase text-white/80"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin opacity-40" strokeWidth={1} /> : "EXECUTE EVOLUTION"}
                </button>
              </div>
            </div>
          )}

          {/* System Monologue / Kernel Log */}
          <div className="flex flex-col h-48 overflow-hidden p-6">
            <h2 className="text-[10px] uppercase tracking-[0.3em] opacity-70 mb-4 flex items-center gap-2 font-black text-white ff-font">
              <TerminalIcon className="w-3 h-3" /> SYSTEM_MONOLOGUE
            </h2>
            <div className="flex-1 overflow-y-auto text-[8px] space-y-1.5 opacity-60 custom-scrollbar font-light text-white ff-text-body">
              {logs.slice(-60).map((log, i) => (
                <div key={`kernel-log-${i}-${log.time}`} className={
                  log.type === EvolutionStatus.SUCCESS ? 'text-cyan-400' : 
                  log.type === EvolutionStatus.CRITICAL_REJECTION ? 'text-red-400 font-bold' : 
                  log.type === EvolutionStatus.ULTIMATE_SANCTION ? 'text-purple-400 font-black animate-pulse' :
                  ''
                }>
                  <span className="opacity-50">[{log.time}]</span> <span className="text-white/80">{log.type}</span>: {log.msg}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
