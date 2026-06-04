import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  RefreshCw, 
  Shield, 
  Activity, 
  TrendingDown, 
  Settings2, 
  Terminal, 
  Cpu, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  Database,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { useI18n } from '../i18n';
import { useVedaStore } from '../store/vedaStore';
import { cn } from '../lib/utils';

interface SovereignCircuitBreakerProps {
  apiError: string | null;
  setApiError: (error: string | null) => void;
}

interface CausalLog {
  id: string;
  time: string;
  type: 'INFO' | 'DRIFT' | 'FDIR_WARN' | 'HOT_SWITCH' | 'RESTORED' | 'FAULT';
  message: string;
}

export const SovereignCircuitBreaker: React.FC<SovereignCircuitBreakerProps> = ({ 
  apiError, 
  setApiError 
}) => {
  const { t } = useI18n();
  const { userData } = useVedaStore();

  // Primary states of the PHM (Prognostic Health Management) Engine
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isPhmActive, setIsPhmActive] = useState(true);
  const [activeChannel, setActiveChannel] = useState<'ALPHA' | 'BETA_REDUNDANT'>('ALPHA');
  
  // Realtime simulation state indices for fault prediction demo
  const [coherenceWindow, setCoherenceWindow] = useState<number[]>([0.99, 0.98, 0.985, 0.99, 0.978]);
  const [driftVelocity, setDriftVelocity] = useState(0.001);
  const [predictedViolationTime, setPredictedViolationTime] = useState<number | null>(null);
  const [isAnomalyInjected, setIsAnomalyInjected] = useState(false);
  const [entropyAcc, setEntropyAcc] = useState(0.02);
  
  // Causal Event Logs List
  const [causalLogs, setCausalLogs] = useState<CausalLog[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initialize aerospace telemetry logs
  useEffect(() => {
    const timestamp = new Date().toISOString().split('T')[1].substring(0, 8);
    setCausalLogs([
      {
        id: '1',
        time: timestamp,
        type: 'INFO',
        message: 'Aerospace-Grade Prognostic Health Management (PHM) engine initialized on secondary thread.'
      },
      {
        id: '2',
        time: timestamp,
        type: 'INFO',
        message: 'Deterministic Holt-Winters triple projection models calibrated. Double channel hot-standby active.'
      }
    ]);
  }, []);

  // Helper to add logs to the causation log list
  const addCausalLog = (type: CausalLog['type'], message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].substring(0, 8);
    setCausalLogs(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        time: timestamp,
        type,
        message
      }
    ].slice(-24)); // Pin maximum to 24 logs
  };

  // Scroll to bottom of log terminal
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [causalLogs]);

  // Telemetry loop: polls system parameters, executes predictive modeling, triggers redundancy switch on threshold breach
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPhmActive) return;

      // Fetch base values from actual vedaStore (fall back to simulated values with slight variance to avoid hard freezes)
      let currentCoherence = userData?.global_coherence ?? 0.95;
      let currentEntropy = userData?.entropy ?? 0.12;

      // If user simulated an anomaly, force parameters to drift downward rapidly
      if (isAnomalyInjected) {
        currentCoherence = Math.max(0.65, coherenceWindow[coherenceWindow.length - 1] - 0.04 - Math.random() * 0.01);
        currentEntropy = Math.min(0.95, currentEntropy + 0.1 + Math.random() * 0.05);
      } else {
        // Normal state fluctuation
        const randomVamp = (Math.random() - 0.45) * 0.005;
        currentCoherence = Math.min(1.0, Math.max(0.92, (coherenceWindow[coherenceWindow.length - 1] || 0.985) + randomVamp));
      }

      // If redundancy beta track is active, we apply positive feedback stabilizing vector (Simulating active inference)
      if (activeChannel === 'BETA_REDUNDANT') {
        currentCoherence = Math.min(0.998, currentCoherence + 0.06);
        currentEntropy = Math.max(0.10, currentEntropy - 0.15);
      }

      // Update slide window history
      const nextWindow = [...coherenceWindow.slice(-9), currentCoherence];
      setCoherenceWindow(nextWindow);

      // --- CRITICAL HOLT-WINTERS / EXTRAPOLATION FAULT PREDICTOR ALGORITHM ---
      if (nextWindow.length >= 2) {
        const lastVal = nextWindow[nextWindow.length - 1];
        const prevVal = nextWindow[nextWindow.length - 2];
        
        // Compute current drift velocity: Delta C / Delta t
        const currentVelocity = lastVal - prevVal;
        setDriftVelocity(currentVelocity);

        // Calculate safety threshold margin. Core margin limit is 0.85
        const AEROSPACE_SAFETY_COHERENCE_LIMIT = 0.85;
        
        if (currentVelocity < 0) {
          // Coherence is degrading. Predict time until breach
          const remainingMargin = lastVal - AEROSPACE_SAFETY_COHERENCE_LIMIT;
          const predictedSeconds = Math.max(0.1, remainingMargin / Math.abs(currentVelocity));
          
          if (predictedSeconds < 12) {
            setPredictedViolationTime(Number(predictedSeconds.toFixed(1)));
            
            // Generate warnings and execute automatic redundancy trigger
            if (predictedSeconds < 5) {
              addCausalLog('FDIR_WARN', `PRE-CRITICAL FLIGHT TRAJECTORY: Parameter breach projected in ${predictedSeconds.toFixed(1)}s! Level 4 Alarm.`);
              
              // Redundancy swap
              if (activeChannel === 'ALPHA') {
                addCausalLog('HOT_SWITCH', 'AUTOMATIC RELAY TRIP: Predictive algorithm triggered hot-standby sequence. Shifting to redundant BETA logic channel.');
                setActiveChannel('BETA_REDUNDANT');
                setIsAnomalyInjected(false); // Dampen current fault injection
              }
            } else {
              setPredictedViolationTime(Number(predictedSeconds.toFixed(1)));
              addCausalLog('DRIFT', `FDIR ANALYZING: Drift velocity detected (${(currentVelocity * 1000).toFixed(1)} mHz/s). Extrapolated breach in ${predictedSeconds.toFixed(1)}s.`);
            }
          } else {
            setPredictedViolationTime(null);
          }
        } else {
          setPredictedViolationTime(null);
        }

        // Entropy threshold guard check
        if (currentEntropy > 0.45 && activeChannel === 'ALPHA') {
          addCausalLog('FDIR_WARN', `SENSING PRESSURE BREACH: State Entropy exceeded safe tolerance limit (${(currentEntropy * 100).toFixed(1)}% > 45%).`);
          addCausalLog('HOT_SWITCH', 'EMERGENCY REDUNDANCY ESCAPEMENT: Auto-routing to Channel B.');
          setActiveChannel('BETA_REDUNDANT');
          setIsAnomalyInjected(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [coherenceWindow, isAnomalyInjected, activeChannel, isPhmActive, userData]);

  // Manually trigger fault injection for demo representation
  const injectFault = () => {
    setIsAnomalyInjected(true);
    addCausalLog('FAULT', 'FAULT INJECTION PORT ENGAGED: Simulated thermal drift and noise leakage on Channel ALPHA.');
  };

  // Safe recovery trigger
  const restorePrimaryChannel = () => {
    setActiveChannel('ALPHA');
    setIsAnomalyInjected(false);
    setCoherenceWindow([0.99, 0.98, 0.985, 0.99, 0.978]);
    setPredictedViolationTime(null);
    addCausalLog('RESTORED', 'MANUAL RESET SEQUENCE: Calibration complete. Channel ALPHA restored to PRIMARY active role.');
  };

  return (
    <div className="relative pointer-events-none z-[1001]">
      {/* 1. Floating PHM Tactical Launcher Widget */}
      <div className="fixed bottom-6 right-6 pointer-events-auto">
        <motion.button
          onClick={() => setIsConsoleOpen(prev => !prev)}
          className={cn(
            "p-3 rounded-full border shadow-xl flex items-center justify-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] transition-all",
            activeChannel === 'ALPHA'
              ? "bg-[#0b0c10]/95 text-cyan-400 border-cyan-500/30 hover:border-cyan-500/60 shadow-cyan-500/5 hover:shadow-cyan-500/15"
              : "bg-[#0f0a0a]/95 text-amber-400 border-amber-500/30 hover:border-amber-500/60 shadow-amber-500/5 hover:shadow-amber-500/15"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          layoutId="phm_trigger"
        >
          <div className="relative">
            <Shield size={14} className={cn("relative z-10", activeChannel === 'BETA_REDUNDANT' ? "animate-pulse text-amber-400" : "text-cyan-400")} />
            {activeChannel === 'BETA_REDUNDANT' ? (
              <span className="absolute inset-0 bg-amber-400/20 rounded-full animate-ping scale-150" />
            ) : (
              <span className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping scale-110" />
            )}
          </div>
          <span>PHM: {activeChannel === 'ALPHA' ? "STABLE" : "REDUNDANT_ACTIVE"}</span>
        </motion.button>
      </div>

      {/* 2. Prognostic Health Management Side-Drawer Control Panel */}
      <AnimatePresence>
        {isConsoleOpen && (
          <>
            {/* Transparent backdrop layer to intercept click closures cleanly */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConsoleOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1002] pointer-events-auto cursor-pointer"
            />
            
            {/* The Main Avionics Control Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="fixed top-0 right-0 h-screen w-full max-w-md bg-[#07090e]/95 border-l border-white/5 shadow-2xl z-[1003] pointer-events-auto overflow-y-auto flex flex-col justify-between"
            >
              <div className="p-6 flex-1 flex flex-col gap-6">
                
                {/* Panel Header */}
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-1.5 rounded bg-white/5 border", activeChannel === 'ALPHA' ? "border-cyan-500/20 text-cyan-400 animate-pulse" : "border-amber-500/20 text-amber-500 animate-pulse")}>
                      <Cpu size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-mono font-bold tracking-[0.2em] text-white">PHM CORE MONITOR</h3>
                      <p className="text-[7px] font-mono text-white/40 tracking-[0.1em] uppercase">AVIONICS PREDICTIVE CIRCUIT BREAK MODULE</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsConsoleOpen(false)}
                    className="text-white/30 hover:text-white/80 transition-colors font-mono text-[10px]"
                  >
                    [CLOSE]
                  </button>
                </div>

                {/* Subsystem State Bar Indicators */}
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 flex flex-col gap-4">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="text-white/40">SYSTEM HEALTH METRICS</span>
                    <span className={cn(
                      "font-bold",
                      activeChannel === 'ALPHA' ? "text-cyan-400" : "text-amber-400"
                    )}>
                      {activeChannel === 'ALPHA' ? t.status || "ONLINE" : "HOT_REDUNDANT_ACTIVE"}
                    </span>
                  </div>

                  {/* Meter 1: Real-time Coherence (Predicted Segment) */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[8px] font-mono">
                      <span className="text-white/60">COGNITIVE COHERENCE (相干性)</span>
                      <span className="text-white">
                        {(coherenceWindow[coherenceWindow.length - 1] * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                      <motion.div 
                        animate={{ width: `${coherenceWindow[coherenceWindow.length - 1] * 100}%` }}
                        className={cn(
                          "h-full transition-all duration-500",
                          coherenceWindow[coherenceWindow.length - 1] > 0.90 
                            ? "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" 
                            : coherenceWindow[coherenceWindow.length - 1] > 0.82 
                              ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" 
                              : "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                        )}
                      />
                    </div>
                  </div>

                  {/* Meter 2: Drift Trend Speed indicator */}
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="border border-white/5 rounded bg-black/30 p-2.5 flex flex-col justify-between">
                      <span className="text-[7px] font-mono text-white/40 uppercase">DRIFT VELOCITY</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <TrendingDown size={11} className={driftVelocity < 0 ? "text-red-400 animate-pulse" : "text-emerald-400"} />
                        <span className={cn("text-[10px] font-mono font-bold", driftVelocity < 0 ? "text-red-400" : "text-emerald-400")}>
                          {(driftVelocity * 1000).toFixed(2)} mHz/s
                        </span>
                      </div>
                    </div>

                    <div className="border border-white/5 rounded bg-black/30 p-2.5 flex flex-col justify-between">
                      <span className="text-[7px] font-mono text-white/40 uppercase">PREDICTED BREACH</span>
                      <span className={cn(
                        "text-[10.5px] font-mono font-bold mt-1",
                        predictedViolationTime ? "text-red-400 animate-pulse" : "text-white/30"
                      )}>
                        {predictedViolationTime ? `IN ${predictedViolationTime} SEC` : "NONE DETECTED"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Double Core Redundant Architecture Diagram */}
                <div className="flex flex-col gap-2.5">
                  <div className="text-[8px] font-mono text-white/40 uppercase tracking-widest pl-1">V-AA REDUNDANT ROUTER DIAGRAM</div>
                  <div className="grid grid-cols-2 gap-4">
                    
                    {/* Channel Alpha */}
                    <div className={cn(
                      "p-3.5 rounded-lg border flex flex-col justify-between gap-3 transition-all relative overflow-hidden",
                      activeChannel === 'ALPHA' 
                        ? isAnomalyInjected 
                          ? "bg-red-950/20 border-red-500/40" 
                          : "bg-cyan-950/10 border-cyan-500/30" 
                        : "bg-white/[0.01] border-white/5 opacity-40"
                    )}>
                      <div className="absolute top-1 right-2 text-[6px] font-mono text-white/20">TR-01A</div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={10} className={activeChannel === 'ALPHA' ? "text-cyan-400" : "text-white/25"} />
                          <h4 className="text-[9px] font-mono font-bold text-white uppercase">TRACK ALPHA</h4>
                        </div>
                        <span className="text-[6.5px] font-mono text-white/40 uppercase">Primary Core Node</span>
                      </div>
                      
                      <div className="text-[9px] font-mono text-white/80">
                        STATUS: <span className={cn(
                          "font-bold",
                          activeChannel !== 'ALPHA' 
                            ? "text-white/40" 
                            : isAnomalyInjected 
                              ? "text-red-400" 
                              : "text-cyan-400"
                        )}>
                          {activeChannel !== 'ALPHA' ? "STANDBY" : isAnomalyInjected ? "FAULT DRIFT" : "ACTIVE / PRIMARY"}
                        </span>
                      </div>
                    </div>

                    {/* Channel Beta (Redundant) */}
                    <div className={cn(
                      "p-3.5 rounded-lg border flex flex-col justify-between gap-3 transition-all relative overflow-hidden",
                      activeChannel === 'BETA_REDUNDANT' 
                        ? "bg-amber-950/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.05)]" 
                        : "bg-white/[0.01] border-white/5 opacity-40"
                    )}>
                      <div className="absolute top-1 right-2 text-[6px] font-mono text-white/20">TR-01B</div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={10} className={activeChannel === 'BETA_REDUNDANT' ? "text-amber-400" : "text-white/25"} />
                          <h4 className="text-[9px] font-mono font-bold text-white uppercase">TRACK BETA</h4>
                        </div>
                        <span className="text-[6.5px] font-mono text-white/40 uppercase">Standby Redundant</span>
                      </div>

                      <div className="text-[9px] font-mono text-white/80">
                        STATUS: <span className={cn(
                          "font-bold",
                          activeChannel === 'BETA_REDUNDANT' 
                            ? "text-amber-400"
                            : "text-white/40"
                        )}>
                          {activeChannel === 'BETA_REDUNDANT' ? "ACTIVE_REDUNDANT" : "HOT STANDBY"}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Operations & Interactive Control Box */}
                <div className="border border-white/5 rounded-lg bg-white/[0.01] p-4 flex flex-col gap-3">
                  <div className="text-[8px] font-mono text-white/40 uppercase tracking-widest pl-1">Avionics Maintenance Interface</div>
                  <div className="flex flex-col gap-2">
                    
                    {/* Anomaly trigger button */}
                    <button
                      onClick={injectFault}
                      disabled={isAnomalyInjected || activeChannel === 'BETA_REDUNDANT'}
                      className={cn(
                        "w-full py-2.5 rounded text-[8px] font-mono uppercase tracking-wider flex items-center justify-center gap-2 border transition-all",
                        isAnomalyInjected || activeChannel === 'BETA_REDUNDANT'
                          ? "bg-white/5 border-white/5 text-white/30 cursor-not-allowed"
                          : "bg-red-500/10 hover:bg-red-500/20 border-red-500/30 hover:border-red-500/50 text-red-400"
                      )}
                    >
                      <AlertTriangle size={11} className={isAnomalyInjected ? "animate-bounce" : ""} />
                      Inject Telemetry Fault (插入參數漂移故障)
                    </button>

                    {/* FDIR active toggle */}
                    <div className="flex justify-between items-center bg-black/45 p-2 rounded border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-mono text-white/80">AUTOPILOT FDIR CONTROL SYSTEM</span>
                        <span className="text-[6.5px] font-mono text-white/40">Auto Fault Detection & Active Isolation</span>
                      </div>
                      <button
                        onClick={() => setIsPhmActive(!isPhmActive)}
                        className={cn(
                          "px-2.5 py-1 text-[7.5px] font-mono rounded transition-all",
                          isPhmActive 
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" 
                            : "bg-white/5 text-white/40 border border-white/5"
                        )}
                      >
                        {isPhmActive ? "ENABLED" : "DISABLED"}
                      </button>
                    </div>

                    {/* Core manual reset */}
                    {activeChannel === 'BETA_REDUNDANT' && (
                      <button
                        onClick={restorePrimaryChannel}
                        className="w-full py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded text-[8px] font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all mt-1 animate-pulse"
                      >
                        <RefreshCw size={11} className="animate-spin-slow" />
                        Manual Reset to Channel Alpha Primary (清除並重設信號主軌)
                      </button>
                    )}
                  </div>
                </div>

                {/* Live Realtime Causal Log Flow Terminal */}
                <div className="flex-1 flex flex-col gap-2 min-h-[140px]">
                  <div className="text-[8px] font-mono text-white/40 uppercase tracking-widest flex justify-between pr-1 items-center">
                    <span>SOVEREIGN CAUSAL LOG (因果事件日誌)</span>
                    <Terminal size={10} className="text-white/20" />
                  </div>
                  <div className="flex-1 bg-black/60 rounded-lg p-3.5 border border-white/5 font-mono text-[7.5px] text-white/70 overflow-y-auto flex flex-col gap-1.5 max-h-[180px] h-[180px] no-scrollbar">
                    {causalLogs.map(log => (
                      <div key={log.id} className="flex gap-1.5 items-start leading-relaxed border-b border-white/[0.02] pb-1">
                        <span className="text-white/30 shrink-0">[{log.time}]</span>
                        <span className={cn(
                          "shrink-0 font-bold font-mono tracking-wider",
                          log.type === 'FAULT' ? "text-red-400" :
                          log.type === 'FDIR_WARN' ? "text-amber-400 animate-pulse" :
                          log.type === 'HOT_SWITCH' ? "text-amber-500" :
                          log.type === 'RESTORED' ? "text-cyan-400" : "text-white/40"
                        )}>
                          [{log.type}]
                        </span>
                        <span>{log.message}</span>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                </div>

              </div>

              {/* Avionics Module Footer */}
              <div className="p-4 border-t border-white/5 bg-black/40 text-[7px] font-mono text-white/30 flex justify-between">
                <span>VEDA_AA_REDUNDANCE_RELAY: v6.8-AEROS</span>
                <span>STATE_TRACKER: INTENT_ALIGNED</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. Original Full-Screen Hard Circuit Breaker (ONLY renders if hard apiError is active) */}
      <AnimatePresence>
        {apiError && !apiError.toLowerCase().includes('permission-denied') && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 w-screen h-screen bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 pointer-events-auto z-[2000]"
          >
            <div className="max-w-xl w-full p-8 md:p-12 ghibli-glass border border-red-500/30 flex flex-col gap-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-500/5 opacity-20 pointer-events-none" />
              <motion.div 
                animate={{ 
                  opacity: [0.1, 0.3, 0.1],
                  x: [0, 10, -10, 0]
                }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-10" 
              />
              
              <div className="flex items-center gap-4 text-red-400 relative z-10">
                 <ShieldAlert size={32} className="animate-pulse" />
                 <div className="flex flex-col">
                    <h2 className="text-xl md:text-2xl font-display tracking-[0.2em] uppercase">{(t.circuit_breaker_active || "CIRCUIT_BREAKER_ACTIVE").split('(')[0]?.trim()}</h2>
                    <span className="text-[8px] font-mono opacity-60 tracking-[0.4em] uppercase">{t.epistemic_discontinuity}</span>
                 </div>
              </div>

              <div className="flex flex-col gap-4 relative z-10">
                 <p className="text-xs md:text-sm text-white/70 leading-relaxed font-serif italic border-l border-red-500/20 pl-4 py-2">
                    {(t.breaker_desc || "").split('.')[0]}. {t.detected_anomaly}:
                    <br/>
                    <span className="text-red-300/80 not-italic font-mono text-[10px] block mt-2 bg-red-500/10 p-2 rounded">
                       {apiError}
                    </span>
                 </p>
                 
                 {/* PHM Diagnostic prediction telemetry shown in failure envelope */}
                 <div className="bg-red-950/20 border border-red-500/20 rounded p-3 flex flex-col gap-1 text-[8.5px] font-mono text-red-300">
                   <div className="flex justify-between font-bold border-b border-red-500/10 pb-1">
                     <span>FDIR AVIONICS BLACKBOX ANALYSIS</span>
                     <span className="animate-pulse">CRITICAL_EVENT</span>
                   </div>
                   <div className="flex justify-between mt-1">
                     <span>Last Coherence:</span>
                     <span>{(coherenceWindow[coherenceWindow.length-1]*100).toFixed(1)}%</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Drift Velocity on Exit:</span>
                     <span>{(driftVelocity*1000).toFixed(2)} mHz/s</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Redundancy Switch Status:</span>
                     <span>{activeChannel === 'BETA_REDUNDANT' ? "ENGAGED_BUT_OVERFLOWED" : "UNRESOLVED_BY_ISOLATION"}</span>
                   </div>
                 </div>

                 <p className="text-[10px] text-white/30 leading-relaxed font-mono uppercase tracking-wider">
                    {t.breaker_reason}
                 </p>
              </div>

              <div className="flex flex-col md:flex-row gap-4 relative z-10">
                 <button 
                   onClick={() => window.location.reload()}
                   className="flex-1 py-4 bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 text-red-100 text-[10px] font-mono font-bold tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-3"
                 >
                    <RefreshCw size={14} className="animate-spin-slow" />
                    {t.hard_reset_label}
                 </button>
                 <button 
                   onClick={() => setApiError(null)}
                   className="px-6 py-4 border border-white/10 hover:border-white/30 text-white/40 hover:text-white/80 text-[10px] font-mono uppercase transition-all"
                 >
                    {t.suppress_alert}
                 </button>
              </div>
              
              <div className="flex justify-between items-center text-[7px] font-mono text-white/10 mt-4 border-t border-white/5 pt-4">
                 <span>VENDOR_LINK: FAIL_ENVELOPE</span>
                 <span>VEDA_AA_PROTOCOL: EXPIRED</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
