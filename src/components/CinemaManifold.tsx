import React, { useState } from 'react';
import { Film, Play, Plus, Clock, Layers, Loader2, Brain, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { BrainData, LongVideoProject, Scene } from '../types';
import { vedaService } from '../services/vedaService';
import { ProjectSidebar } from './cinema/ProjectSidebar';
import { SceneCard } from './cinema/SceneCard';
import { cn } from '../lib/utils';

interface CinemaManifoldProps {
  data: BrainData;
  onUpdate: () => void;
}

export const CinemaManifold: React.FC<CinemaManifoldProps> = ({ data, onUpdate }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(true);

  React.useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkApiKey();
  }, []);

  const handleOpenSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const projects = data.long_video_projects || [];
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleInitiate = async () => {
    if (!newPrompt.trim()) return;
    setIsPlanning(true);
    try {
      await vedaService.initiateCinemaProject(newPrompt);
      setNewPrompt('');
      setIsCreating(false);
      onUpdate();
    } catch (error) {
      console.error("Failed to initiate project", error);
    } finally {
      setIsPlanning(false);
    }
  };

  const handleSynthesizeScene = async (projectId: string, scene: Scene) => {
    if (!selectedProject) return;
    try {
      await vedaService.synthesizeScene(projectId, scene.id, selectedProject);
      onUpdate();
    } catch (error) {
      console.error("Scene synthesis failed", error);
    }
  };

  const [isDistilling, setIsDistilling] = useState(false);

  const handleDistill = async () => {
    if (!selectedProject) return;
    setIsDistilling(true);
    try {
      await vedaService.distillProjectContext(selectedProject);
      onUpdate();
    } catch (error) {
      console.error("Distillation failed", error);
    } finally {
      setIsDistilling(false);
    }
  };

  const handleSynthesizeAll = async (project: LongVideoProject) => {
    const pendingScenes = project.scenes.filter(s => s.status === 'PENDING' || s.status === 'FAILED');
    let countSinceDistill = 0;

    for (const scene of pendingScenes) {
      await vedaService.synthesizeScene(project.id, scene.id, project);
      onUpdate();
      countSinceDistill++;

      // Auto-distill every 4 scenes to refresh long-term causal manifold
      if (countSinceDistill >= 4) {
        await vedaService.distillProjectContext(project);
        onUpdate();
        countSinceDistill = 0;
      }

      await new Promise(r => setTimeout(r, 2000)); 
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("ARCHITECT_CONFIRM: 是否永久移除此因果影視流形？")) {
      await vedaService.pruneCinemaProject(id);
      if (selectedProjectId === id) setSelectedProjectId(null);
      onUpdate();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] text-zinc-300 font-sans p-6 overflow-hidden">
      {data.baseline && (
        <div className="flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 mb-4 rounded-lg">
          <ShieldCheck size={14} className="text-cyan-400" />
          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-[0.2em]">Ontological Baseline Active: {data.baseline.version} | SNAPSHOT_LOCKED</span>
          <div className="ml-auto flex gap-4">
            <span className="text-[9px] text-cyan-400/60 font-mono">AXIOMS: {data.baseline.axioms.length}</span>
            <span className="text-[9px] text-cyan-400/60 font-mono">ANCHORS: {data.baseline.anchors.length}</span>
          </div>
        </div>
      )}
      <header className="flex justify-between items-center mb-10 mt-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
             <Film className="w-6 h-6 text-blue-400" />
          </div>
          <div>
             <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-3 font-mono uppercase">
               Cinema Engine
               <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono border border-blue-500/20">v2.1_CORE</span>
             </h2>
             <p className="text-white/30 text-[11px] mt-1 font-serif italic tracking-wide">
               30分鐘長時序演化模型 | 視覺錨點同步。
             </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!hasApiKey && (
            <button 
              onClick={handleOpenSelectKey}
              className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-amber-500/20 font-mono text-[10px] font-bold transition-all"
            >
              <ShieldCheck size={14} /> ACTIVATE_VIDEO_KEY
            </button>
          )}
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-white text-black px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 font-mono text-[10px] font-bold transition-all"
          >
            <Plus size={16} /> NEW_PROJECT
          </button>
        </div>
      </header>

      <div className="flex gap-8 h-full overflow-hidden">
        <ProjectSidebar 
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelect={setSelectedProjectId}
          onDelete={handleDelete}
          isCreating={isCreating}
          setIsCreating={setIsCreating}
          newPrompt={newPrompt}
          setNewPrompt={setNewPrompt}
          isPlanning={isPlanning}
          onInitiate={handleInitiate}
        />

        <main className="flex-1 overflow-hidden flex flex-col">
          {selectedProject ? (
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="h-full flex flex-col"
            >
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 mb-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3 font-mono flex items-center gap-4">
                       {selectedProject.title}
                       {selectedProject.baseline_ref && (
                         <span className="text-[9px] px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded font-mono">BASELINE_v{selectedProject.baseline_ref}</span>
                       )}
                    </h3>
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-3 text-xs text-white/40 font-mono">
                         <div className="w-2 h-2 rounded-full bg-blue-500" />
                         PROGRESS: {selectedProject.scenes.filter(s => s.status === 'COMPLETED').length} / {selectedProject.scenes.length}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/40 font-mono">
                         <div className="w-2 h-2 rounded-full bg-purple-500" />
                         CAUSAL_VERSION: v{selectedProject.causal_version || 1}
                      </div>
                      {selectedProject.worldModel && (
                        <div className="flex items-center gap-3 text-xs text-emerald-400 font-mono">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                           WORLD_STABILITY: {(selectedProject.worldModel.snapshot.physics_constancy * 100).toFixed(1)}%
                        </div>
                      )}
                      {selectedProject.scenes.some(s => s.causal_integrity !== undefined) && (
                        <div className="flex items-center gap-3 text-xs text-blue-400/60 font-mono">
                           <ShieldCheck size={12} />
                           INTEGRITY: {(selectedProject.scenes.reduce((acc, s) => acc + (s.causal_integrity || 0), 0) / (selectedProject.scenes.filter(s => s.causal_integrity !== undefined).length || 1) * 100).toFixed(1)}%
                        </div>
                      )}
                      {selectedProject.metadata && (
                        <div className="flex items-center gap-3 text-xs text-white/20 font-mono">
                           ENGINE: {selectedProject.metadata.engine_ver}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={handleDistill}
                      disabled={isDistilling || selectedProject.scenes.filter(s => s.status === 'COMPLETED').length === 0}
                      className="bg-white/5 hover:bg-white/10 text-white/60 px-6 py-3 rounded-xl font-bold flex items-center gap-3 disabled:opacity-30 font-mono text-[10px] transition-all border border-white/5"
                    >
                      {isDistilling ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
                      DISTILL_CAUSAL_CONTEXT
                    </button>
                    <button 
                      onClick={() => handleSynthesizeAll(selectedProject)}
                      disabled={selectedProject.scenes.every(s => s.status === 'COMPLETED')}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-3 disabled:opacity-30 font-mono text-[10px] transition-all"
                    >
                      <Play size={16} fill="currentColor" />
                      EXECUTE_SYNTHESIS
                    </button>
                  </div>
                </div>

                {selectedProject.worldModel && (
                  <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                      <div className="text-[10px] text-white/30 uppercase mb-2 font-mono">Environment</div>
                      <div className="text-xs text-white flex flex-col gap-1">
                        <div className="flex justify-between"><span>Location:</span> <span className="text-blue-400">{selectedProject.worldModel.snapshot.environment.location}</span></div>
                        <div className="flex justify-between"><span>Time:</span> <span className="text-blue-400">{selectedProject.worldModel.snapshot.environment.time}</span></div>
                        <div className="flex justify-between"><span>Weather:</span> <span className="text-blue-400">{selectedProject.worldModel.snapshot.environment.weather}</span></div>
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl col-span-2">
                       <div className="text-[10px] text-white/30 uppercase mb-2 font-mono">Character Manifest</div>
                       <div className="flex gap-2 flex-wrap">
                         {selectedProject.worldModel.snapshot.characters.map((c, i) => (
                           <div key={`char-${c.id || i}`} className="bg-white/5 border border-white/5 px-2 py-1 rounded text-[9px] flex items-center gap-2">
                              <span className="text-white/40">{c.id}</span>
                              <span className="text-purple-400 font-bold">{c.state}</span>
                              <span className="text-[7px] text-white/20 italic">({c.emotion})</span>
                           </div>
                         ))}
                       </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                      <div className="text-[10px] text-white/30 uppercase mb-2 font-mono">Causal Entropy</div>
                      <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]" style={{ width: `${selectedProject.worldModel.snapshot.causal_entropy * 100}%` }} />
                      </div>
                      <div className="text-[8px] text-right mt-1 text-white/40 font-mono">{(selectedProject.worldModel.snapshot.causal_entropy * 100).toFixed(1)}% ENTROPY</div>
                    </div>
                  </div>
                )}

                {selectedProject.distilled_context && (
                  <div className="mb-8 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                       <ShieldCheck size={12} className="text-blue-400" />
                       <span className="text-[9px] uppercase tracking-widest text-blue-400 font-bold font-mono">Causal Manifold / 因果流形摘要</span>
                       <span className="ml-auto text-[8px] text-white/20 font-mono">REFRESHED: {new Date(selectedProject.last_distillation_ts || 0).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[10px] text-white/60 leading-relaxed font-serif italic">
                      {selectedProject.distilled_context}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
                   <div className="flex flex-col gap-3">
                      <span className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-bold font-mono">World Axioms</span>
                      <div className="flex flex-wrap gap-2">
                         {selectedProject.worldAxioms.map((axiom, i) => {
                           const isBaseline = data.baseline?.axioms.includes(axiom);
                           return (
                             <span key={`axiom-${i}-${axiom.substring(0, 10)}`} className={cn(
                               "text-[10px] px-4 py-1.5 rounded-full border font-serif italic",
                               isBaseline ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-white/5 text-white/60 border-white/10"
                             )}>
                               {isBaseline && <ShieldCheck size={10} className="inline mr-1 mb-0.5" />}
                               {axiom}
                             </span>
                           );
                         })}
                      </div>
                   </div>
                   <div className="flex flex-col gap-3">
                      <span className="text-[10px] uppercase tracking-[0.3em] text-purple-400 font-bold font-mono">Visual Anchors</span>
                      <div className="flex flex-wrap gap-2">
                         {selectedProject.visualAnchors.map((anchor) => {
                           const isBaseline = data.baseline?.anchors.some(a => a.id === anchor.id);
                           return (
                             <div key={`anchor-${anchor.id}`} className={cn(
                               "group relative px-4 py-1.5 rounded-full border cursor-help transition-all",
                               isBaseline ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20" : "bg-purple-500/5 text-purple-300/60 border-purple-500/20 hover:bg-purple-500/10"
                             )}>
                               <span className="text-[10px] font-mono font-bold">
                                 {isBaseline && <ShieldCheck size={10} className="inline mr-1 mb-0.5" />}
                                 {anchor.label}
                               </span>
                               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-zinc-900 border border-white/10 rounded-xl text-[10px] text-white/80 hidden group-hover:block z-50">
                                  <div className="font-bold mb-1 text-cyan-400 uppercase tracking-widest text-[8px]">{isBaseline ? 'Baseline Protected' : 'Dynamic Anchor'}</div>
                                  {anchor.description}
                               </div>
                             </div>
                           );
                         })}
                      </div>
                   </div>
                </div>

                <div className="w-full h-[1px] bg-white/5 rounded-full overflow-hidden mt-8">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(selectedProject.scenes.filter(s => s.status === 'COMPLETED').length / selectedProject.scenes.length) * 100}%` }}
                    className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
                {selectedProject.scenes.map((scene, idx) => (
                  <SceneCard 
                    key={scene.id} 
                    scene={scene} 
                    index={idx} 
                    onSynthesize={() => handleSynthesizeScene(selectedProject.id, scene)} 
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-white/5 bg-white/[0.01] rounded-[2rem] border border-dashed border-white/5 m-4">
              <Layers size={80} className="mb-4 opacity-10" />
              <p className="text-[10px] font-mono tracking-[0.5em] uppercase">SYSTEM_IDLE</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
