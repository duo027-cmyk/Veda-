import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NetworkLayer } from '../types';
import { Layers, Activity, ChevronDown, Cpu, Zap, Box, TrendingUp, Terminal } from 'lucide-react';

interface NetworkDisplayProps {
  layers: NetworkLayer[] | undefined;
  onClose?: () => void;
  latticeScale?: number;
}

export const NetworkDisplay: React.FC<NetworkDisplayProps> = ({ layers, onClose, latticeScale = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeLayerId, setActiveLayerId] = useState<string>('core');
  const [selectedNode, setSelectedNode] = useState<{ i: number; j: number; x: number; y: number } | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; val: number; status: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [ripples, setRipples] = useState<{ x: number; y: number; startTime: number }[]>([]);

  const activeLayer = useMemo(() => {
    return layers?.find(l => l.id === activeLayerId) || layers?.[0];
  }, [layers, activeLayerId]);

  const grid = useMemo(() => activeLayer?.data || [], [activeLayer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !grid.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = grid.length;
    const hexSize = 12; // Slightly larger for better interaction
    const width = Math.sqrt(3) * hexSize;
    const height = 2 * hexSize;
    const horizontalSpacing = width;
    const verticalSpacing = (3 / 4) * height;

    canvas.width = size * horizontalSpacing + width / 2;
    canvas.height = size * verticalSpacing + height / 4;

    const getNeighbors = (i: number, j: number) => {
      const neighbors: { i: number; j: number }[] = [];
      const isEven = j % 2 === 0;
      
      // Standard hex neighbors
      const directions = isEven ? [
        { di: -1, dj: 0 }, { di: 1, dj: 0 },
        { di: -1, dj: -1 }, { di: 0, dj: -1 },
        { di: -1, dj: 1 }, { di: 0, dj: 1 }
      ] : [
        { di: -1, dj: 0 }, { di: 1, dj: 0 },
        { di: 0, dj: -1 }, { di: 1, dj: -1 },
        { di: 0, dj: 1 }, { di: 1, dj: 1 }
      ];

      directions.forEach(d => {
        const ni = i + d.di;
        const nj = j + d.dj;
        if (ni >= 0 && ni < size && nj >= 0 && nj < size) {
          neighbors.push({ i: ni, j: nj });
        }
      });
      return neighbors;
    };

    let animationFrameId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const nodes: { x: number; y: number; val: number; i: number; j: number }[] = [];
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const x = i * horizontalSpacing + (j % 2 === 0 ? 0 : width / 2) + width / 2;
          const y = j * verticalSpacing + height / 2;
          nodes.push({ x, y, val: grid[i]?.[j] ?? 0, i, j });
        }
      }

      // Draw Ripples
      const now = Date.now();
      ctx.save();
      ripples.forEach(ripple => {
        const elapsed = now - ripple.startTime;
        const duration = 1000;
        if (elapsed > duration) return;
        
        const progress = elapsed / duration;
        const radius = progress * 100;
        const alpha = (1 - progress) * 0.5;
        
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 210, 255, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      ctx.restore();

      const selectedNeighbors = selectedNode ? getNeighbors(selectedNode.i, selectedNode.j) : [];

      // Draw Connections
      ctx.lineWidth = 0.5;
      const time = Date.now() * 0.001;

      nodes.forEach(node => {
        if (node.val < 0.1) return;
        
        const neighbors = nodes.filter(n => {
          const dx = n.x - node.x;
          const dy = n.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          return dist > 0 && dist < horizontalSpacing * 1.2;
        });

        neighbors.forEach(n => {
          if (n.val < 0.1) return;
          if (node.i > n.i || (node.i === n.i && node.j > n.j)) return;

          const isSelectedPath = selectedNode && 
            ((node.i === selectedNode.i && node.j === selectedNode.j && selectedNeighbors.some(sn => sn.i === n.i && sn.j === n.j)) ||
             (n.i === selectedNode.i && n.j === selectedNode.j && selectedNeighbors.some(sn => sn.i === node.i && sn.j === node.j)));

          const alpha = isSelectedPath ? 0.8 : Math.min(node.val, n.val) * 0.3;
          const isHighActivity = node.val > 0.9 || n.val > 0.9;
          
          // Base connection line
          ctx.beginPath();
          if (isHighActivity) {
            ctx.strokeStyle = `rgba(255, 50, 50, ${alpha * 0.5})`;
          } else {
            ctx.strokeStyle = `rgba(0, 210, 255, ${alpha * 0.5})`;
          }
          ctx.lineWidth = isSelectedPath ? 2 : 0.5;
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();

          // Animated "Pulse" or "Flow" on active pathways
          if (node.val > 0.3 && n.val > 0.3) {
            const flowSpeed = 2 + (node.val + n.val) * 2;
            const flowOffset = (time * flowSpeed + (node.i + node.j)) % 1;
            
            const px = node.x + (n.x - node.x) * flowOffset;
            const py = node.y + (n.y - node.y) * flowOffset;
            
            ctx.beginPath();
            ctx.arc(px, py, isSelectedPath ? 2 : 1, 0, Math.PI * 2);
            ctx.fillStyle = isHighActivity ? `rgba(255, 100, 100, ${alpha + 0.2})` : `rgba(0, 255, 255, ${alpha + 0.2})`;
            if (isSelectedPath || isHighActivity) {
              ctx.shadowBlur = 10;
              ctx.shadowColor = isHighActivity ? '#ff3232' : '#00d2ff';
            }
            ctx.fill();
            ctx.shadowBlur = 0; // Reset shadow for next draws
          }
        });
      });

      // Draw Hexes
      nodes.forEach(node => {
        const isAnomaly = node.val > 0.95 || node.val < 0.05;
        const isSelected = selectedNode?.i === node.i && selectedNode?.j === node.j;
        const isNeighbor = selectedNeighbors.some(n => n.i === node.i && n.j === node.j);
        
        ctx.save();
        ctx.translate(node.x, node.y);
        
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const angle = (Math.PI / 3) * k + Math.PI / 6;
          const px = hexSize * Math.cos(angle);
          const py = hexSize * Math.sin(angle);
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        // Base background
        if (isSelected) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        } else if (isNeighbor) {
          ctx.fillStyle = 'rgba(0, 210, 255, 0.15)';
        } else if (isAnomaly && node.val > 0.5) {
          ctx.fillStyle = 'rgba(255, 50, 50, 0.1)';
        } else {
          ctx.fillStyle = node.val > 0.01 ? 'rgba(0, 210, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)';
        }
        ctx.fill();
        
        ctx.strokeStyle = isSelected ? '#fff' : (isNeighbor ? '#00d2ff' : (isAnomaly ? 'rgba(255, 50, 50, 0.3)' : (node.val > 0.01 ? 'rgba(0, 210, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)')));
        ctx.lineWidth = isSelected ? 2 : (isNeighbor ? 1.5 : (isAnomaly ? 1 : 0.5));
        ctx.stroke();

        if (node.val > 0.01 || isSelected || isNeighbor) {
          const pulse = Math.sin(Date.now() * 0.003 + (node.i + node.j) * 0.5) * 0.2 + 0.8;
          const alpha = Math.max(0.1, (isSelected || isNeighbor ? 0.8 : node.val * 0.6) * pulse);
          
          ctx.shadowBlur = (isSelected || isNeighbor ? 25 : (isAnomaly ? 20 : 15)) * (isSelected || isNeighbor ? 1 : node.val) * pulse;
          ctx.shadowColor = isSelected ? '#fff' : (isNeighbor ? '#00d2ff' : (isAnomaly ? 'rgba(255, 50, 50, 0.8)' : (node.val > 0.8 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 210, 255, 0.8)')));
          
          if (isSelected) {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          } else if (isNeighbor) {
            ctx.fillStyle = `rgba(0, 210, 255, ${alpha})`;
          } else if (isAnomaly) {
            ctx.fillStyle = `rgba(255, 50, 50, ${alpha})`;
          } else {
            ctx.fillStyle = node.val > 0.8 ? `rgba(255, 255, 255, ${alpha})` : `rgba(0, 210, 255, ${alpha})`;
          }
          ctx.fill();
          
          ctx.strokeStyle = isSelected ? '#fff' : (isNeighbor ? '#00d2ff' : (isAnomaly ? `rgba(255, 50, 50, 0.8)` : (node.val > 0.8 ? `rgba(255, 255, 255, 0.8)` : `rgba(0, 210, 255, 0.5)`)));
          ctx.lineWidth = isSelected ? 2.5 : (isNeighbor ? 2 : (isAnomaly ? 2 : 1.5));
          ctx.stroke();
        }
        
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [grid, selectedNode]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !grid.length) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const size = grid.length;
    const hexSize = 12;
    const width = Math.sqrt(3) * hexSize;
    const height = 2 * hexSize;
    const horizontalSpacing = width;
    const verticalSpacing = (3 / 4) * height;

    let closestNode = null;
    let minDist = Infinity;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const x = i * horizontalSpacing + (j % 2 === 0 ? 0 : width / 2) + width / 2;
        const y = j * verticalSpacing + height / 2;
        const dist = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2));
        
        if (dist < hexSize && dist < minDist) {
          minDist = dist;
          closestNode = { i, j, x, y };
        }
      }
    }

    if (closestNode) {
      const val = grid[closestNode.i]?.[closestNode.j] ?? 0;
      setSelectedNode({ i: closestNode.i, j: closestNode.j, x: closestNode.x, y: closestNode.y });
      setTooltip({
        x: e.clientX,
        y: e.clientY,
        val,
        status: val > 0.95 ? "CRITICAL" : val > 0.8 ? "OPTIMAL" : val > 0.4 ? "STABLE" : "DEGRADED"
      });
      
      setRipples(prev => [...prev.slice(-5), { x: closestNode!.x, y: closestNode!.y, startTime: Date.now() }]);
      
      // Trigger subtle resonance on node selection
      import('../services/resonanceService').then(m => m.resonanceService.sendPulse(0.04));
    } else {
      setSelectedNode(null);
      setTooltip(null);
    }
  };

  const handleLocalizedResonance = () => {
    if (!selectedNode) return;
    setRipples(prev => [...prev.slice(-5), { x: selectedNode.x, y: selectedNode.y, startTime: Date.now() }]);
    import('../services/resonanceService').then(m => m.resonanceService.sendPulse(0.15));
  };

  const handleNodeAdjustment = (delta: number) => {
    if (!selectedNode || !activeLayerId) return;
    setRipples(prev => [...prev.slice(-5), { x: selectedNode.x, y: selectedNode.y, startTime: Date.now() }]);
    const newVal = Math.max(0, Math.min(1, (tooltip?.val || 0) + delta));
    import('../services/resonanceService').then(m => 
      m.resonanceService.adjustNetwork(activeLayerId, selectedNode.i, selectedNode.j, newVal)
    );
    // Update local tooltip value immediately for feedback
    if (tooltip) setTooltip({ ...tooltip, val: newVal });
  };

  const getLayerIcon = (id: string) => {
    switch(id) {
      case 'core': return <Cpu className="w-3 h-3" />;
      case 'peripheral': return <Box className="w-3 h-3" />;
      case 'quantum': return <Zap className="w-3 h-3" />;
      case 'prediction': return <TrendingUp className="w-3 h-3" />;
      case 'simulation': return <Terminal className="w-3 h-3" />;
      default: return <Layers className="w-3 h-3" />;
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-black/80 p-8 rounded-none border border-white/10 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.9)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-bold text-white/40 tracking-[0.4em] uppercase">Neural Array Mapping</span>
          </div>
          <h3 className="text-xl font-black text-white tracking-[0.2em] uppercase ff-font-serif">{activeLayer?.name || 'Network Layer'}</h3>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
          <span className="text-[8px] text-white/30 uppercase tracking-[0.3em] font-bold ml-1">Select Layer Protocol</span>
          <div className="relative">
            {/* Desktop Tabs */}
            <div className="hidden sm:flex gap-1 bg-white/5 p-1 border border-white/10 backdrop-blur-md">
              {layers?.map(layer => (
                <button
                  key={layer.id}
                  onClick={() => {
                    setActiveLayerId(layer.id);
                    setSelectedNode(null);
                    setTooltip(null);
                    // Trigger resonance on layer switch
                    import('../services/resonanceService').then(m => m.resonanceService.sendPulse(0.05));
                  }}
                  className={`relative px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2 group ${
                    activeLayerId === layer.id 
                      ? 'text-black' 
                      : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  {activeLayerId === layer.id && (
                    <motion.div 
                      layoutId="activeLayer"
                      className="absolute inset-0 bg-white z-0"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {getLayerIcon(layer.id)}
                    {layer.id}
                  </span>
                </button>
              ))}
            </div>

            {/* Mobile/Compact Dropdown */}
            <div className="sm:hidden relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between px-4 py-2 bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
              >
                <div className="flex items-center gap-2">
                  {getLayerIcon(activeLayerId)}
                  {activeLayerId}
                </div>
                <ChevronDown className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 z-[210] mt-1 bg-black/90 border border-white/10 backdrop-blur-xl shadow-2xl"
                  >
                    {layers?.map(layer => (
                      <button
                        key={layer.id}
                        onClick={() => {
                          setActiveLayerId(layer.id);
                          setSelectedNode(null);
                          setTooltip(null);
                          setShowDropdown(false);
                          // Trigger resonance on layer switch
                          import('../services/resonanceService').then(m => m.resonanceService.sendPulse(0.05));
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all border-b border-white/5 last:border-0 ${
                          activeLayerId === layer.id 
                            ? 'bg-white text-black' 
                            : 'text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {getLayerIcon(layer.id)}
                        {layer.id}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex justify-center items-center bg-white/[0.02] border border-white/5 p-10 overflow-hidden group/canvas">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/20" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/20" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/20" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/20" />
        
        <canvas 
          ref={canvasRef} 
          onClick={handleCanvasClick}
          className="max-w-full h-auto cursor-crosshair transition-transform duration-700 group-hover/canvas:scale-[1.02]" 
        />
        
        <AnimatePresence>
          {tooltip && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="fixed z-[200] bg-black/95 border border-white/20 p-4 flex flex-col gap-3 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[200px]"
              style={{ left: tooltip.x + 20, top: tooltip.y + 20 }}
            >
              <div className="flex justify-between items-center gap-6 border-b border-white/10 pb-2">
                <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Node Activation</span>
                <span className="text-xs font-mono text-white font-bold">{(tooltip.val * 100).toFixed(1)}%</span>
              </div>
              
              <div className="flex justify-between items-center gap-6">
                <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Status</span>
                <span className={`text-[9px] font-black uppercase tracking-widest ${
                  tooltip.status === 'CRITICAL' ? 'text-red-400' : 
                  tooltip.status === 'OPTIMAL' ? 'text-green-400' :
                  tooltip.status === 'STABLE' ? 'text-cyan-400' : 'text-yellow-400'
                }`}>
                  {tooltip.status}
                </span>
              </div>

              <div className="h-1 w-full bg-white/5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${tooltip.val * 100}%` }}
                  className={`h-full ${tooltip.status === 'CRITICAL' ? 'bg-red-400' : 'bg-cyan-400'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button 
                  onClick={() => handleNodeAdjustment(0.1)}
                  className="px-2 py-2 bg-white/5 border border-white/10 text-[8px] font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-1"
                >
                  <Zap className="w-2 h-2" />
                  Inject
                </button>
                <button 
                  onClick={() => handleNodeAdjustment(-0.1)}
                  className="px-2 py-2 bg-white/5 border border-white/10 text-[8px] font-bold uppercase tracking-widest text-white hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-1"
                >
                  <Activity className="w-2 h-2" />
                  Drain
                </button>
                <button 
                  onClick={handleLocalizedResonance}
                  className="col-span-2 px-2 py-2 bg-cyan-400/20 border border-cyan-400/40 text-[8px] font-bold uppercase tracking-widest text-cyan-400 hover:bg-cyan-400 hover:text-black transition-colors flex items-center justify-center gap-1"
                >
                  <Activity className="w-2 h-2" />
                  Trigger Resonance
                </button>
              </div>

              <div className="text-[7px] text-white/20 font-mono uppercase tracking-widest mt-1 text-center">
                Neural Adjustment Protocol v2.1
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mt-4">
        <div className="flex flex-col gap-2">
          <div className="text-[9px] text-white/20 font-mono tracking-[0.3em] uppercase leading-relaxed">
            INTERACTIVE_NEURAL_GRID_v2.4<br />
            NODE_SELECTION_PROTOCOL_ACTIVE<br />
            COHERENCE_RATING: {(activeLayer?.coherence || 0).toFixed(4)}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {selectedNode && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 bg-cyan-400/10 border border-cyan-400/30 px-4 py-2"
            >
              <div className="w-2 h-2 bg-cyan-400 animate-ping rounded-full" />
              <div className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.2em]">
                Target Locked: [{selectedNode.i}, {selectedNode.j}]
              </div>
            </motion.div>
          )}
          
          {onClose && (
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-cyan-400 transition-colors"
            >
              Close Interface
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
