import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Check, 
  Activity, 
  X,
  Sparkles
} from 'lucide-react';
import { useSovereignStore } from '../store/sovereignStore';

export const WorkspaceSelector = () => {
  const { 
    activeWorkspace, 
    workspaces, 
    setActiveWorkspace, 
    addWorkspace, 
    deleteWorkspace,
    userData
  } = useSovereignStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCreateForm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    addWorkspace(newWorkspaceName.trim());
    setNewWorkspaceName('');
    setShowCreateForm(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this workspace and ALL associated causal histories?")) {
      deleteWorkspace(id);
    }
  };

  return (
    <div ref={dropdownRef} className="relative z-[150] pointer-events-auto">
      {/* Active Workspace Pill */}
      <motion.button
        whileHover={{ scale: 1.02, borderColor: 'rgba(218, 165, 32, 0.3)' }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-2 bg-black/65 border border-white/5 rounded-full ghibli-glass text-ink/80 transition-all shadow-xl font-mono text-[9px] md:text-[11px] tracking-widest text-left uppercase max-w-[200px] md:max-w-[280px]"
      >
        <div className="relative flex items-center justify-center">
          <Briefcase size={12} className="text-gold opacity-70" />
          <span className="absolute -top-1 -right-1 flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-[7px] text-gold/50 tracking-[0.3em] uppercase leading-none mb-0.5">Workspace</div>
          <div className="truncate font-bold text-ink">{activeWorkspace?.name || 'Global Matrix'}</div>
        </div>

        <ChevronDown 
          size={12} 
          className={`text-gold/60 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </motion.button>

      {/* Floating Dropdown Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-14 left-0 w-64 md:w-80 bg-black/85 border border-white/10 rounded-2xl ghibli-glass shadow-2xl p-4 overflow-hidden"
          >
            {/* Background Atmosphere */}
            <div className="absolute inset-x-0 -top-12 h-24 bg-accent/5 blur-3xl rounded-full pointer-events-none" />

            {!showCreateForm ? (
              <>
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2.5">
                  <span className="text-[8px] font-mono tracking-[0.3em] uppercase text-gold/60">Select Workspace</span>
                  <motion.button
                    whileHover={{ scale: 1.1, color: '#ffc107' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-1 text-[8px] font-mono tracking-widest text-ink/70 uppercase"
                  >
                    <Plus size={10} />
                    <span>Create</span>
                  </motion.button>
                </div>

                {/* Workspace list */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                  {workspaces.map((ws) => {
                    const isActive = ws.id === activeWorkspace.id;
                    return (
                      <motion.div
                        key={ws.id}
                        whileHover={{ x: 2, backgroundColor: 'rgba(255,255,255,0.03)' }}
                        onClick={() => {
                          setActiveWorkspace(ws.id);
                          setIsOpen(false);
                        }}
                        className={`group flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                          isActive 
                            ? 'border-accent/40 bg-accent-soft text-accent' 
                            : 'border-transparent text-ink/85 hover:border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isActive ? (
                            <Check size={12} className="text-accent shrink-0 animate-pulse" />
                          ) : (
                            <Activity size={12} className="text-muted/40 shrink-0 group-hover:text-gold transition-colors" />
                          )}
                          <span className="font-mono text-[9px] md:text-[10px] truncate uppercase tracking-widest">{ws.name}</span>
                        </div>

                        {ws.id !== 'default' && (
                          <motion.button
                            whileHover={{ scale: 1.1, color: '#f87171' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleDelete(ws.id, e)}
                            className="text-muted/40 opacity-0 group-hover:opacity-100 p-1 hover:bg-white/5 rounded transition-all shrink-0"
                            title="Prune Workspace"
                          >
                            <Trash2 size={10} />
                          </motion.button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Cognitive footprint details */}
                <div className="border-t border-white/5 pt-2.5 mt-2.5 flex justify-between text-[7px] font-mono uppercase tracking-[0.2em] text-gold/40">
                  <span>Coherence: {((userData?.global_coherence || 0.85)*100).toFixed(1)}%</span>
                  <span>Entropy: {userData?.entropy ? userData.entropy.toFixed(3) : '0.000'}</span>
                </div>
              </>
            ) : (
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[8px] font-mono tracking-[0.3em] uppercase text-gold/60 flex items-center gap-1">
                    <Sparkles size={10} className="text-accent" />
                    <span>New Matrix Node</span>
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setShowCreateForm(false)} 
                    className="text-muted/50 hover:text-ink transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[7px] font-mono tracking-widest text-muted/60 uppercase">Domain Name</label>
                  <input
                    type="text"
                    required
                    maxLength={32}
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="e.g. Bio-Inference Core"
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-[9px] font-mono tracking-widest uppercase focus:outline-none focus:border-accent text-ink"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 py-1.5 border border-white/5 rounded-lg text-[8px] font-mono tracking-widest uppercase text-ink/70 hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(218,165,32,0.2)' }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-1.5 bg-accent/15 border border-accent/30 rounded-lg text-[8px] font-mono tracking-widest uppercase text-accent font-bold transition-all"
                  >
                    Instantiate
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
