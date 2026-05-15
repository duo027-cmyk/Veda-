import React from 'react';
import { Layout, Plus, Send, Loader2, Film, Trash2, Layers, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { LongVideoProject } from '../../types';

interface ProjectSidebarProps {
  projects: LongVideoProject[];
  selectedProjectId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  isCreating: boolean;
  setIsCreating: (v: boolean) => void;
  newPrompt: string;
  setNewPrompt: (v: string) => void;
  isPlanning: boolean;
  onInitiate: () => void;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projects,
  selectedProjectId,
  onSelect,
  onDelete,
  isCreating,
  setIsCreating,
  newPrompt,
  setNewPrompt,
  isPlanning,
  onInitiate
}) => {
  return (
    <aside className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
      <AnimatePresence mode="popLayout">
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-blue-500/30 p-4 rounded-xl shadow-xl"
          >
            <h3 className="text-sm font-medium text-blue-300 mb-3 flex items-center gap-2">
              <Layout className="w-4 h-4" /> 專案規劃
            </h3>
            <textarea 
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              placeholder="輸入電影構思，VEDA 將自動執行 30 分鐘因果拆解..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm h-32 focus:border-blue-500 outline-none transition-colors text-white"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setIsCreating(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">取消</button>
              <button 
                disabled={isPlanning || !newPrompt.trim()}
                onClick={onInitiate}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-1.5 rounded-lg text-sm flex items-center gap-2 font-medium text-white"
              >
                {isPlanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                規劃分鏡
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {projects.length === 0 && !isCreating && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
          <Film className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-sm italic">等待核心指令序列 / NO_DATA</p>
        </div>
      )}

      {projects.map(project => (
        <div 
          key={project.id}
          onClick={() => onSelect(project.id)}
          className={cn(
            "p-5 rounded-xl border transition-all cursor-pointer group relative",
            selectedProjectId === project.id 
              ? "bg-blue-900/10 border-blue-500/50" 
              : "bg-white/[0.02] border-white/5 hover:border-white/10"
          )}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-white group-hover:text-blue-300 transition-colors uppercase tracking-tight">
              {project.title}
            </h3>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <p className="text-[10px] text-white/40 line-clamp-2 mb-4 font-serif italic">
            {project.description}
          </p>
          <div className="flex items-center gap-4 text-[9px] font-mono text-white/20">
            <span className="flex items-center gap-1"><Layers size={10} /> {project.scenes.length} SCENES</span>
            <span className="flex items-center gap-1"><Clock size={10} /> {Math.ceil(project.scenes.reduce((acc, s) => acc + s.duration, 0) / 60)} MIN</span>
            <span className={cn(
              "ml-auto px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold",
              project.status === 'COMPLETED' ? "bg-green-500/10 text-green-400" : "bg-blue-500/10 text-blue-400"
            )}>
              {project.status}
            </span>
          </div>
          {selectedProjectId === project.id && (
            <motion.div layoutId="project-active" className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-blue-500" />
          )}
        </div>
      ))}
    </aside>
  );
};
