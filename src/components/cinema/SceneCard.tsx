import React from 'react';
import { Video, Loader2, AlertCircle, Play, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Scene } from '../../types';

interface SceneCardProps {
  scene: Scene;
  index: number;
  onSynthesize: () => void;
}

export const SceneCard: React.FC<SceneCardProps> = ({ scene, index, onSynthesize }) => {
  return (
    <div 
      className={cn(
        "group bg-white/[0.02] border rounded-xl overflow-hidden flex flex-col h-64 transition-all duration-500",
        scene.status === 'COMPLETED' ? "border-green-500/20" : "border-white/5 hover:border-white/10"
      )}
    >
      <div className="h-32 bg-black/40 relative flex items-center justify-center">
        {scene.status === 'COMPLETED' && scene.url ? (
          <div className="relative w-full h-full">
            <video 
              src={scene.url} 
              className="w-full h-full object-cover" 
              autoPlay 
              loop 
              muted 
              playsInline 
            />
            {/* VEDA Watermark */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-20 select-none pointer-events-none group-hover:opacity-50 transition-opacity duration-500">
               <div className="w-2.5 h-2.5 border-r border-b border-blue-400" />
               <div className="flex flex-col items-end gap-0">
                 <span className="text-[5px] font-mono text-blue-400 leading-none tracking-[0.2em]">VEDA_CINEMA</span>
                 <span className="text-[4px] font-mono text-white/40 leading-none">SEQUENCE_AUTH_LOCKED</span>
               </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-20">
            {scene.status === 'GENERATING' ? (
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            ) : scene.status === 'FAILED' ? (
              <AlertCircle className="w-8 h-8 text-red-500" />
            ) : (
              <Video className="w-8 h-8" />
            )}
            <span className="text-[8px] font-mono tracking-[0.2em]">{scene.status}</span>
          </div>
        )}
        
        <div className="absolute top-2 left-2 bg-black/60 text-[9px] px-2 py-0.5 rounded border border-white/5 font-mono text-white/60">
          SEQ_{String(index + 1).padStart(3, '0')} | {scene.duration}S
        </div>

        {scene.status === 'PENDING' && (
          <button 
            onClick={onSynthesize}
            className="absolute inset-0 flex items-center justify-center bg-blue-500/0 group-hover:bg-blue-500/10 transition-all opacity-0 group-hover:opacity-100"
          >
            <div className="p-3 bg-white text-black rounded-full shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
               <Play size={16} fill="currentColor" />
            </div>
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <h4 className="text-[11px] font-bold text-white/90 line-clamp-1 font-mono tracking-tight uppercase">
          {scene.title}
        </h4>
        <p className="text-[10px] text-white/40 line-clamp-3 leading-relaxed italic font-serif">
          {scene.prompt}
        </p>
        
        <div className="mt-auto pt-3 border-t border-white/5 flex justify-between items-center">
          {scene.status === 'COMPLETED' ? (
            <div className="flex items-center gap-1.5">
               <CheckCircle2 size={10} className="text-green-400" />
               <span className="text-[9px] text-green-400/80 font-mono font-bold">SYNTHESIZED</span>
               {scene.causal_version && (
                 <span className="text-[8px] text-white/20 font-mono ml-1">({scene.causal_version})</span>
               )}
               {scene.causal_integrity !== undefined && (
                 <div className="ml-auto flex items-center gap-2">
                    <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-blue-400" 
                         style={{ width: `${scene.causal_integrity * 100}%` }} 
                       />
                    </div>
                    <span className="text-[8px] text-blue-400/60 font-mono">{(scene.causal_integrity * 100).toFixed(0)}%_STABILITY</span>
                 </div>
               )}
            </div>
          ) : (
            <span className="text-[8px] text-white/10 font-mono">WAITING_FOR_COMPUTE</span>
          )}
          <button className="text-white/20 hover:text-white transition-colors">
             <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
