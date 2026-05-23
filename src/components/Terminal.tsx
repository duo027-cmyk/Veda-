import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Send, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface TerminalProps {
  logs: { type: 'info' | 'success' | 'error' | 'task'; message: string }[];
  onCommand: (command: string) => void;
  isProcessing: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({ logs, onCommand, isProcessing }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input && input.trim() && !isProcessing) {
      onCommand(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full w-full ff-panel ff-panel-accent overflow-hidden shadow-2xl relative">
      <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between text-white/50 relative z-10">
        <div className="flex items-center gap-3">
          <TerminalIcon className="w-3.5 h-3.5 text-cyan-400/60" strokeWidth={1} />
          <span className="text-[10px] ff-font-serif uppercase tracking-[0.4em] font-bold text-white/80">SOVEREIGN TERMINAL</span>
        </div>
        <div className="text-[8px] opacity-20 font-bold ff-font tracking-[0.4em] uppercase">
          TERM_v4.4
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar ff-font-serif text-[11px]">
        {logs.map((log, i) => (
          <motion.div 
            key={`log-${i}-${log.type}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex gap-4 items-start border-l border-white/5 pl-4 py-2 transition-colors hover:bg-white/5 ${
              log.type === 'error' ? 'text-red-400/80' :
              log.type === 'success' ? 'text-cyan-400/80' :
              log.type === 'task' ? 'text-white font-bold' :
              'text-white/50'
            }`}
          >
            <span className="opacity-20 flex-shrink-0 font-sans text-[8px] mt-0.5">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
            <span className="break-all tracking-widest leading-relaxed uppercase">{log.message}</span>
          </motion.div>
        ))}
        {isProcessing && (
          <div className="flex gap-4 text-cyan-400/40 animate-pulse ff-font-serif text-[11px] border-l border-cyan-400/20 pl-4 py-2">
            <span className="opacity-20 flex-shrink-0 font-sans text-[8px] mt-0.5">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
            <span className="tracking-[0.3em] uppercase italic">PROCESSING MISSION DATA...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 bg-white/5 border-t border-white/5 flex items-center gap-4">
        <ChevronRight className="w-4 h-4 text-cyan-400/60" strokeWidth={1} />
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ENTER MISSION COMMAND..."
          className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/10 ff-font-serif text-[11px] tracking-[0.2em] font-bold uppercase"
          disabled={isProcessing}
        />
        <button 
          type="submit"
          disabled={isProcessing || !input || !input.trim()}
          className="ff-button !px-6 !py-2 text-[10px] !bg-white/5 border border-white/10 hover:!bg-white/10 text-white/60 disabled:opacity-20 transition-all"
        >
          <Send className="w-3.5 h-3.5" strokeWidth={1} />
        </button>
      </form>
    </div>
  );
};
