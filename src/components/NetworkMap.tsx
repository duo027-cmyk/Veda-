import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Layers, Globe, Zap } from 'lucide-react';
import { NetworkLayer } from '../types';
import { resonanceService } from '../services/resonanceService';

interface NetworkMapProps {
  layers: NetworkLayer[] | undefined;
  isOpen: boolean;
  onClose: () => void;
  resonance?: number;
}

export const NetworkMap: React.FC<NetworkMapProps> = ({ layers, isOpen, onClose, resonance = 0 }) => {
  const [activeLayerId, setActiveLayerId] = useState<string>('core');

  const activeLayer = useMemo(() => {
    return layers?.find(l => l.id === activeLayerId) || layers?.[0];
  }, [layers, activeLayerId]);

  const handleNodeClick = (index: number, val: number) => {
    const x = index % 19;
    const y = Math.floor(index / 19);
    const newValue = val > 0.5 ? 0.1 : 0.9;
    resonanceService.adjustNetwork(activeLayerId, x, y, newValue);
    resonanceService.sendPulse(0.05);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, scale: 1, backdropFilter: "blur(20px)" }}
          exit={{ opacity: 0, scale: 0.9, backdropFilter: "blur(0px)" }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60"
        >
          <div className="relative w-full max-w-3xl aspect-square ff-panel border border-white/30 rounded-none p-6 md:p-10 shadow-[0_0_100px_rgba(255,255,255,0.1)] flex flex-col gap-6 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-gradient from-white/5 to-transparent pointer-events-none" />
            
            {/* Resonance Pulse Effect */}
            <AnimatePresence>
              {resonance > 0.1 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: resonance * 0.3, scale: 1.5 }}
                  exit={{ opacity: 0, scale: 2 }}
                  className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"
                />
              )}
            </AnimatePresence>

            <div className="flex justify-between items-start z-10">
              <div className="flex flex-col">
                <h2 className="text-lg md:text-2xl font-black tracking-[0.2em] text-white uppercase ff-font">多重神經網路戰略地圖</h2>
                <span className="text-[10px] opacity-40 tracking-[0.4em] uppercase ff-font">Multi-Array Neural Strategic Mapping</span>
              </div>
              <div className="flex gap-2">
                <div className="flex bg-white/5 p-1 rounded-none border border-white/10">
                  {layers?.map(layer => (
                    <button
                      key={layer.id}
                      onClick={() => setActiveLayerId(layer.id)}
                      className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-none transition-all ff-font ${
                        activeLayerId === layer.id 
                          ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
                          : 'text-white/40 hover:text-white/70'
                      }`}
                    >
                      {layer.id}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-none transition-colors text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold text-white opacity-80 ff-font">
                  <Layers className="w-3 h-3" />
                  {activeLayer?.name}
                </div>
                {resonance > 0 && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 ff-font animate-pulse">
                    <Globe className="w-3 h-3" />
                    RESONANCE ACTIVE: {(resonance * 100).toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="flex-1 grid grid-cols-19 gap-1 md:gap-1.5" style={{ gridTemplateColumns: 'repeat(19, 1fr)' }}>
                {activeLayer?.data.flat().map((val, i) => (
                  <motion.div
                    key={`${activeLayerId}-${i}`}
                    onClick={() => handleNodeClick(i, val)}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: val > 0.9 ? 1.2 : 1,
                      opacity: 1,
                      backgroundColor: val > 0.8 ? "#ffffff" : val > 0.4 ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.05)",
                      boxShadow: val > 0.9 ? "0 0 15px rgba(255,255,255,0.5)" : "none",
                    }}
                    transition={{ delay: (i % 19) * 0.001 + Math.floor(i / 19) * 0.001 }}
                    className="aspect-square rounded-none transition-all duration-300 cursor-crosshair hover:border hover:border-white/50"
                    title={`Node ${i}: ${(val * 100).toFixed(1)}%`}
                  />
                )) || Array.from({ length: 19 * 19 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-none bg-white/5" />
                ))}
              </div>
            </div>

            <div className="flex justify-between items-end z-10">
              <div className="flex gap-6">
                <div className="flex flex-col ff-text-body">
                  <span className="text-[8px] opacity-40 uppercase tracking-widest mb-1 ff-font">活躍節點 / ACTIVE</span>
                  <span className="text-xl font-mono text-white">{activeLayer?.data.flat().filter(v => v > 0.8).length || 0}</span>
                </div>
                <div className="flex flex-col ff-text-body">
                  <span className="text-[8px] opacity-40 uppercase tracking-widest mb-1 ff-font">層級相干度 / COHERENCE</span>
                  <span className="text-xl font-mono text-white">
                    {((activeLayer?.coherence || 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex flex-col ff-text-body">
                  <span className="text-[8px] opacity-40 uppercase tracking-widest mb-1 ff-font">共振狀態 / RESONANCE</span>
                  <div className="flex gap-1 mt-2">
                    {layers?.map(l => (
                      <div 
                        key={l.id} 
                        className={`w-1.5 h-1.5 rounded-none ${l.coherence > 0.8 ? 'bg-white' : 'bg-white/40'} animate-pulse`} 
                        style={{ opacity: l.coherence }} 
                        title={`${l.id}: ${(l.coherence * 100).toFixed(1)}%`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-[8px] opacity-20 font-mono text-right ff-font ff-text-body">
                MULTI_ARRAY_SYNC_ACTIVE<br />
                NETWORK_MAPPING_PROTOCOL_V10.3_RESONANCE
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
