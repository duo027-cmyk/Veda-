import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MonitorPlay, Image as ImageIcon, Music, Video, 
  Share2, Download, Upload, Plus, Send, X, Loader2 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { BrainData } from '../types';

interface VisualAsset {
  type: 'IMAGE' | 'VIDEO' | 'AUDIO';
  url: string;
  prompt: string;
  timestamp: number;
}

export const VisualManifold = ({ 
  data, 
  onGenerate 
}: { 
  data: BrainData | null, 
  onGenerate: (type: 'IMAGE' | 'VIDEO' | 'AUDIO', prompt: string) => Promise<void> 
}) => {
  const stream = data?.visual_stream || [];
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenDialog, setShowGenDialog] = useState(false);
  const [genType, setGenType] = useState<'IMAGE' | 'VIDEO' | 'AUDIO'>('IMAGE');
  const [prompt, setPrompt] = useState('');

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTriggerGen = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      await onGenerate(genType, prompt);
      setPrompt('');
      setShowGenDialog(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full pt-32 px-4 md:px-12 lg:px-24 overflow-y-auto custom-scrollbar pb-24">
       <div className="flex flex-col gap-12 max-w-7xl mx-auto">
          
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
             <div className="flex flex-col gap-4">
                <h2 className="text-[10px] tracking-[0.8em] uppercase text-accent font-mono mb-2">視覺演化流 / VISUAL_EVOLUTION_STREAM</h2>
                <p className="text-white/40 text-sm max-w-xl font-serif italic">多模態感官映射軌跡：支援即時生成、上傳與資產下載。</p>
             </div>
             
             <div className="flex gap-3">
                <button 
                  onClick={() => setShowGenDialog(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-accent text-black text-[10px] font-bold font-mono rounded-full hover:bg-white transition-all shadow-[0_0_20px_rgba(255,244,191,0.2)]"
                >
                   <Plus size={14} /> NEW_SYNTHESIS
                </button>
                <div className="p-2 ghibli-glass border border-white/10 rounded-full hover:border-accent/40 cursor-pointer transition-all">
                   <Upload size={14} className="text-white/60" />
                </div>
             </div>
          </div>

          <AnimatePresence>
            {showGenDialog && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="ghibli-glass p-8 border border-accent/30 relative"
              >
                 <button onClick={() => setShowGenDialog(false)} className="absolute top-4 right-4 text-white/20 hover:text-white">
                    <X size={16} />
                 </button>
                 <div className="flex flex-col gap-6">
                    <div className="flex gap-4">
                       {(['IMAGE', 'VIDEO', 'AUDIO'] as const).map(t => (
                         <button 
                           key={t}
                           onClick={() => setGenType(t)}
                           className={cn(
                             "px-4 py-2 text-[9px] font-mono rounded border transition-all",
                             genType === t ? "bg-accent text-black border-accent" : "bg-white/5 text-white/40 border-white/10"
                           )}
                         >
                           {t}
                         </button>
                       ))}
                    </div>
                    <div className="relative">
                       <textarea 
                         value={prompt}
                         onChange={(e) => setPrompt(e.target.value)}
                         placeholder={`輸入 ${genType} 描述詞... (例如: "賽博龐克風格的京都夜晚")`}
                         className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/80 focus:border-accent outline-none font-serif italic h-32 resize-none"
                       />
                       <button 
                         onClick={handleTriggerGen}
                         disabled={isGenerating}
                         className="absolute bottom-4 right-4 p-3 bg-accent text-black rounded-xl hover:bg-white disabled:opacity-50 transition-all"
                       >
                         {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                       </button>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {stream.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center border border-white/5 bg-white/[0.02] rounded-3xl gap-6 italic text-white/5">
               <MonitorPlay size={64} className="opacity-10" />
               <p className="tracking-widest uppercase text-xs">No active visual signatures detected</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <AnimatePresence mode="popLayout">
                 {stream.map((asset, i) => (
                   <motion.div
                     key={`${asset.timestamp}-${i}`}
                     layout
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="group relative flex flex-col gap-4 p-4 ghibli-glass border border-white/5 hover:border-accent/30 transition-all duration-700"
                   >
                     <div className="relative aspect-square rounded-xl overflow-hidden bg-black/40 shadow-inner">
                        {asset.type === 'IMAGE' && (
                          <img src={asset.url} alt={asset.prompt} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
                        )}
                        {asset.type === 'VIDEO' && (
                          <div className="relative w-full h-full">
                            <video src={asset.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                            {/* VEDA Watermark */}
                            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-30 select-none pointer-events-none group-hover:opacity-60 transition-opacity duration-700">
                               <div className="w-3 h-3 border-r border-b border-accent" />
                               <div className="flex flex-col items-end gap-0.5">
                                 <span className="text-[6px] font-mono text-accent leading-none tracking-[0.2em]">VEDA_ARCHITECT</span>
                                 <span className="text-[5px] font-mono text-white/60 leading-none">CORE_PROTOCOL_V7.2</span>
                               </div>
                            </div>
                          </div>
                        )}
                        {asset.type === 'AUDIO' && (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-accent/5">
                             <Music size={48} className="text-accent/20 group-hover:text-accent transition-all duration-700" />
                             <audio src={asset.url} controls className="w-48 h-8 opacity-40 group-hover:opacity-100 transition-all" />
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 p-6 flex flex-col justify-end gap-3">
                           <span className="text-[8px] font-mono text-accent uppercase tracking-[0.3em] font-bold">{asset.type} SYNTHESIS</span>
                           <p className="text-[10px] text-white/90 line-clamp-3 leading-relaxed font-serif italic">{asset.prompt}</p>
                           <div className="flex gap-2 mt-2">
                             <button 
                               onClick={() => handleDownload(asset.url, `VEDA_SYNTHESIS_${asset.timestamp}.${asset.type === 'AUDIO' ? 'mp3' : asset.type === 'VIDEO' ? 'mp4' : 'png'}`)}
                               className="flex-1 py-1.5 bg-white text-black text-[8px] font-bold font-mono rounded hover:bg-accent transition-all flex items-center justify-center gap-2"
                             >
                               <Download size={10} /> DOWNLOAD
                             </button>
                             <button className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition-all">
                               <Share2 size={10} />
                             </button>
                           </div>
                        </div>
                     </div>
                     <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
                          {new Date(asset.timestamp).toLocaleTimeString()}
                        </span>
                        <div className="flex items-center gap-2">
                           <div className="w-1 h-1 rounded-full bg-accent/40" />
                           <span className="text-[8px] font-mono text-white/10">{asset.url.length > 20 ? 'LOCAL_BUFFER' : 'LINKED_REF'}</span>
                        </div>
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
            </div>
          )}
       </div>
    </div>
  );
};
