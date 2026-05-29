import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Plus, 
  Clock, 
  Search, 
  Filter as FilterIcon,
  Calendar,
  AlertCircle,
  FileText,
  Tag,
  X
} from 'lucide-react';
import { taskService } from '../services/taskService';
import { type Task } from '../lib/db';
import { cn } from '../lib/utils';

export const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Derive all unique tags
  const allAvailableTags = Array.from(new Set(tasks.flatMap(t => t.tags || []))).sort();

  useEffect(() => {
    const init = async () => {
      await taskService.syncFromFirestore();
      await loadTasks();
    };
    init();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const allTasks = await taskService.getAllTasks();
    setTasks(allTasks.sort((a, b) => b.createdAt - a.createdAt));
    setLoading(false);
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !newTags.includes(tag)) {
      setNewTags([...newTags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewTags(newTags.filter(t => t !== tagToRemove));
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await taskService.addTask(newTaskTitle, new Date().toISOString(), undefined, newTags);
    setNewTaskTitle('');
    setNewTags([]);
    setTagInput('');
    loadTasks();
  };

  const handleToggleTask = async (id: string) => {
    await taskService.toggleTask(id);
    loadTasks();
  };

  const handleDeleteTask = async (id: string) => {
    await taskService.deleteTask(id);
    loadTasks();
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filter === 'ACTIVE' ? !t.completed :
      filter === 'COMPLETED' ? t.completed : true;
    const matchesTag = selectedTag ? (t.tags || []).includes(selectedTag) : true;
    
    return matchesSearch && matchesFilter && matchesTag;
  });

  const getTagColor = (tag: string) => {
    const colors = [
      'text-blue-400 bg-blue-500/10 border-blue-500/20',
      'text-purple-400 bg-purple-500/10 border-purple-500/20',
      'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      'text-amber-400 bg-amber-500/10 border-amber-500/20',
      'text-rose-400 bg-rose-500/10 border-rose-500/20',
      'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    ];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="h-full pt-32 md:pt-40 px-4 md:px-12 lg:px-32 max-w-6xl mx-auto pb-24 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-ハンド-serif text-4xl md:text-5xl tracking-[0.2em] uppercase text-white/90 font-display">
              Sovereign Tasks
            </h1>
            <p className="mt-4 font-serif italic text-sm text-white/40 tracking-wider">
              Causal persistence achieved through local IndexedDB synchronization.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
              {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase transition-all font-mono",
                    filter === f ? "bg-accent text-black font-bold" : "text-white/40 hover:text-white/60"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="flex flex-col gap-4">
          <form onSubmit={handleAddTask} className="flex gap-3">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-accent/60 transition-colors">
                <Plus size={18} />
              </div>
              <input 
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Initiate a new causal objective..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-6 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 focus:bg-white/[0.08] transition-all font-mono"
              />
            </div>
            <button 
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="px-8 bg-accent text-black text-xs font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-white disabled:opacity-30 disabled:hover:bg-accent transition-all ff-font"
            >
              Sychronize
            </button>
          </form>

          {/* Tag Input */}
          <div className="flex flex-wrap items-center gap-3 px-1">
            <div className="flex items-center gap-2 min-w-[200px] bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus-within:border-accent/40 transition-all">
              <Tag size={12} className="text-white/20" />
              <input 
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add classification tags..."
                className="bg-transparent border-none text-[10px] text-white/60 focus:outline-none font-mono flex-1 uppercase tracking-widest"
              />
            </div>
            
            <AnimatePresence>
              {newTags.map(tag => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-2 border",
                    getTagColor(tag)
                  )}
                >
                  {tag}
                  <button 
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-white transition-colors"
                  >
                    <X size={10} />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Search & Stats */}
        <div className="flex flex-col gap-6 py-4 border-y border-white/5">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter objectives..."
                className="w-full bg-transparent border-none py-2 pl-10 pr-4 text-[11px] text-white/60 focus:outline-none font-mono"
              />
            </div>
            <div className="flex items-center gap-8 text-[10px] tracking-widest text-white/20 uppercase font-mono">
              <span>Total: {tasks.length}</span>
              <span>Pending: {tasks.filter(t => !t.completed).length}</span>
              <span>Achieved: {tasks.filter(t => t.completed).length}</span>
            </div>
          </div>

          {/* Global Tag Filter */}
          {allAvailableTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-[9px] text-white/20 uppercase tracking-[0.2em] ff-font mr-2">
                <FilterIcon size={12} />
                Lattice Filter:
              </div>
              <button
                onClick={() => setSelectedTag(null)}
                className={cn(
                  "px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all border",
                  selectedTag === null ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-white/5 text-white/20 hover:text-white/40"
                )}
              >
                Clear
              </button>
              {allAvailableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={cn(
                    "px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all border",
                    selectedTag === tag ? getTagColor(tag) : "bg-transparent border-white/5 text-white/20 hover:text-white/40"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4 text-white/20 animate-pulse">
              <Clock size={40} className="stroke-[0.5px]" />
              <span className="text-[10px] uppercase tracking-[0.5em]">Synchronizing Lattice...</span>
            </div>
          ) : filteredTasks.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "group relative overflow-hidden bento-card p-5 border transition-all duration-500",
                    task.completed ? "border-white/5 opacity-50" : "border-white/10 hover:border-white/20"
                  )}
                >
                  <div className="flex items-start gap-4 relative z-10">
                    <button 
                      onClick={() => handleToggleTask(task.id)}
                      className={cn(
                        "mt-1 p-0.5 rounded-full transition-all",
                        task.completed ? "text-accent" : "text-white/20 hover:text-white/40"
                      )}
                    >
                      {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-sm md:text-base font-serif tracking-wide transition-all",
                        task.completed ? "line-through text-white/30" : "text-white/80"
                      )}>
                        {task.title}
                      </div>

                      {/* Display Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {task.tags.map((tag, tIdx) => (
                            <button
                              key={`task-${task.id}-tag-${tag}-${tIdx}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTag(tag);
                              }}
                              className={cn(
                                "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-[0.15em] border transition-all hover:scale-105",
                                getTagColor(tag)
                              )}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-4">
                        <span className="text-[9px] text-white/20 uppercase tracking-widest font-mono flex items-center gap-1.5">
                          <Calendar size={10} />
                          {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[9px] text-white/20 uppercase tracking-widest font-mono flex items-center gap-1.5">
                          <Clock size={10} />
                          {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded text-white/40 font-mono">
                          {task.id}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Aesthetic Background Accents */}
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                    <FileText size={80} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="py-24 text-center border border-dashed border-white/5 rounded-2xl">
              <div className="text-white/10 flex justify-center mb-6">
                <AlertCircle size={60} className="stroke-[0.3px]" />
              </div>
              <p className="text-hand-serif text-2xl text-white/20 tracking-widest uppercase">
                No active objectives detected.
              </p>
              <p className="text-[10px] text-white/10 uppercase tracking-[0.3em] mt-4">
                Lattice is awaiting your creative intent.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
