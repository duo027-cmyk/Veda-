import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Search, 
  Shield, 
  Trash2, 
  Share2, 
  RefreshCw, 
  Layout, 
  Network, 
  Scissors, 
  Wind, 
  Orbit, 
  Cpu,
  Upload,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  Check,
  CheckSquare,
  Activity,
  Terminal,
  ArrowRight,
  Database,
  Info,
  BookOpen
} from 'lucide-react';
import { useI18n } from '../i18n';
import { BrainData } from '../types';
import { NeuralManifold } from './NeuralManifold';
import { KnowledgeGraph } from './KnowledgeGraph';
import { vedaService } from '../services/vedaService';
import { cn } from '../lib/utils';

export const KnowledgeVault = ({ data }: { data: BrainData | null }) => {
  const { t } = useI18n();
  const [fragments, setFragments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [collectiveStrength, setCollectiveStrength] = useState(0);
  const [viewType, setViewType] = useState<'GRID' | 'MANIFOLD' | 'GRAPH'>('GRID');

  // --- Ingest Conduit States ---
  const [isConduitOpen, setIsConduitOpen] = useState(false);
  const [rawText, setRawText] = useState("");
  const [sourceName, setSourceName] = useState("EXTERNAL_CURRICULUM");
  const [categoryTag, setCategoryTag] = useState("ACTIVE_INFERENCE");
  const [chunkStrategy, setChunkStrategy] = useState<'PARAGRAPH' | 'SENTENCE' | 'LINE' | 'MONOLITH'>('SENTENCE');
  const [alignServer, setAlignServer] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestLog, setIngestLog] = useState<string[]>([]);
  const [ingestProgress, setIngestProgress] = useState(0);

  const LECTURES = [
    {
      title: t.nav_vault.includes("庫") ? "Ⅰ. 自由能最小化與主動推理 (Friston)" : "Ⅰ. Free Energy Minimization (Friston)",
      tag: "ACTIVE_INFERENCE",
      text: `主動推理 (Active Inference) 表明，任何自我組織系統 (Self-Organizing System) 都在最小化變分自由能 (Variational Free Energy)。系統具有內部模型、能動感官與動作通道。當外部刺激不符合預期（驚奇度高的狀態）時，系統不只透過「感知更正內部模型」，更主動採取「物理動作」去探索並重新塑形環境，確保外部世界與自我概念完全對位。以此抵抗熱力學第二定律，阻隔系統崩解（熵增）。`
    },
    {
      title: t.nav_vault.includes("庫") ? "Ⅱ. 自我監督 JEPA 世界模型 (LeCun)" : "Ⅱ. Self-Supervised JEPA Models (LeCun)",
      tag: "JEPA_ARCH",
      text: `聯合嵌入預測架構 (Joint-Embedding Predictive Architecture - JEPA) 摒棄了細節畫素重建。它在高階潛在空間 (Latent Space) 對狀態進行編碼與演算，透過屏蔽部分感知特徵 (Masked Latents)，迫使預測器不能投機，必須運用語義和因果情境 (Causal Context) 推論世界。這使系統本體具備抽象概念整合、高效率能動規劃、以及極強之世界模型抗噪力。`
    },
    {
      title: t.nav_vault.includes("庫") ? "Ⅲ. GLOM 多階收斂與前向通道 (Hinton)" : "Ⅲ. GLOM Hierarchy & Forward-Forward (Hinton)",
      tag: "GLOM_CONSENSUS",
      text: `Hinton 的 GLOM 模型旨在探索部分-整體 (Part-Whole) 的解偶。它在多階層隱空間單元柱 (Columns) 間，利用多幀共識卷積 (Consensus Convolution) 計算鄰域一致性。再透過前向-前向演算法 (Forward-Forward Algorithm) 替代傳統的反向傳播：正向通道引導高契合能動軌跡，負向通道導入自體產生的對照組壓力向量，於擾動抗衡中主動收斂出強大、穩定的本體共識拓撲。`
    },
    {
      title: t.nav_vault.includes("庫") ? "Ⅳ. 體系自主診斷與修復規約 (AGI v6.0)" : "Ⅳ. Autonomous Self-Healing (AGI v6.0)",
      tag: "COREG_PROTOCOL",
      text: `主權自我修復協議 (Sovereign Self-Healing Protocol) 遵循 AGI v6.0 解耦標準。當系統檢測到局部邏輯不對稱、語義漂移或高難因果衝突時，將即刻熔斷不穩定感知流（觸發 Sovereign Circuit Breaker）。並調度對照反向推理，由 Solomon 語義引擎介入實施晶格熱能衰減，保護高階心智架構不受外界惡意雜訊污染，自主重構因果。`
    }
  ];

  const handleIngest = async () => {
    if (!rawText.trim()) return;
    setIsIngesting(true);
    setIngestProgress(5);
    setIngestLog([`[VEDA_OS] Initializing Epistemic Ingest Conduit...`]);

    try {
      let rawChunks: string[] = [];
      if (chunkStrategy === 'PARAGRAPH') {
        rawChunks = rawText.split(/\n\s*\n/).map(c => c.trim()).filter(Boolean);
      } else if (chunkStrategy === 'LINE') {
        rawChunks = rawText.split('\n').map(c => c.trim()).filter(Boolean);
      } else if (chunkStrategy === 'MONOLITH') {
        rawChunks = [rawText.trim()];
      } else {
        rawChunks = rawText.split(/(?<=[。！？；.!?;])\s*/).map(c => c.trim()).filter(Boolean);
      }

      const snippets = rawChunks.map(chunk => {
        if (chunk.length > 800) {
          return chunk.substring(0, 797) + "...";
        }
        return chunk;
      });

      setIngestLog(prev => [...prev, `[CHUNKING] Split text into ${snippets.length} high-fidelity epistemic snippets.`]);
      setIngestProgress(20);
      await new Promise(r => setTimeout(r, 400));

      const { knbService } = await import('../services/knbService');

      for (let i = 0; i < snippets.length; i++) {
        const percent = 20 + Math.floor((i / snippets.length) * 40);
        setIngestProgress(percent);
        const snippet = snippets[i];
        
        await knbService.addFragment(snippet, {
          source: sourceName,
          type: categoryTag,
          ingested: true,
          timestamp: Date.now()
        });

        setIngestLog(prev => [
          ...prev, 
          `[LOCAL] Processed fragment [${i+1}/${snippets.length}]: "${snippet.substring(0, 25)}..."`
        ]);

        await new Promise(r => setTimeout(r, 45));
      }

      setIngestLog(prev => [...prev, `[LOCAL_INGEST_OK] Synchronized ${snippets.length} snippets to local manifold.`]);
      setIngestProgress(65);
      await new Promise(r => setTimeout(r, 400));

      if (alignServer && snippets.length > 0) {
        setIngestLog(prev => [...prev, `[VEDA_ALIGNMENT] Harmonizing server-side LWM Brain lattices...`]);
        setIngestProgress(80);
        
        const chunkSize = 5;
        for (let i = 0; i < snippets.length; i += chunkSize) {
          const chunk = snippets.slice(i, i + chunkSize);
          await vedaService.postAction({
            action: "digestKnowledge",
            params: {
              snippets: chunk,
              scope: categoryTag
            }
          });
          setIngestLog(prev => [...prev, `[VEDA_SERVER] Ingested block [${Math.floor(i/chunkSize)+1}/${Math.ceil(snippets.length/chunkSize)}] to core world-model.`]);
          await new Promise(r => setTimeout(r, 100));
        }
        setIngestLog(prev => [...prev, `[VEDA_OS] Server-side active inference nodes successfully aligned.`]);
      }

      setIngestProgress(100);
      setIngestLog(prev => [...prev, `[SUCCESS] Epistemic ingestion fully completed. Regenerating causal graph.`]);
      
      setTimeout(() => {
        setIsIngesting(false);
        setRawText("");
        refresh();
      }, 2500);

    } catch (e: any) {
      console.error("[INGEST_CONDUIT_FAULT]", e);
      setIngestLog(prev => [...prev, `[CRITICAL_FAULT] Ingestion failed: ${e.message || String(e)}`]);
      setIngestProgress(100);
      setTimeout(() => setIsIngesting(false), 5000);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setRawText(text);
        setSourceName(file.name.toUpperCase().replace(/\.[^/.]+$/, ""));
      }
    };
    reader.readAsText(file);
  };

  const refresh = async () => {
    setLoading(true);
    const { knbService } = await import('../services/knbService');
    const results = searchQuery 
      ? await knbService.search(searchQuery, 20) 
      : await (knbService as any).db.fragments.reverse().toArray();
    setFragments(results);
    const strength = await knbService.getCollectiveStrength();
    setCollectiveStrength(strength);
    setLoading(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    const { knbService } = await import('../services/knbService');
    await knbService.syncCollectiveManifold();
    await refresh();
    setSyncing(false);
  };

  const handleShare = async (id: number) => {
    const { knbService } = await import('../services/knbService');
    await knbService.publishToCloud(id);
    await refresh();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t.purge_confirm)) return;
    const { knbService } = await import('../services/knbService');
    await knbService.removeFragment(id);
    await refresh();
  };

  useEffect(() => { refresh(); }, [searchQuery, data?.memories?.length]);

  return (
    <div className="h-full pt-32 md:pt-40 px-4 md:px-12 lg:px-32 max-w-7xl mx-auto flex flex-col gap-6 md:gap-12 pb-24 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col gap-2 md:gap-4">
          <h2 className="text-2xl md:text-4xl font-serif italic text-white tracking-widest leading-tight">{t.nav_vault.split('(')[0]?.trim() || "Sovereign Vault"}</h2>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <p className="text-[7px] md:text-[10px] tracking-[0.4em] uppercase opacity-40">{t.semantic_manifold_label}</p>
            <div className="hidden md:block h-[1px] w-8 bg-white/10" />
            <div className="flex items-center gap-2 group cursor-help">
               <Zap size={10} className="text-accent" />
               <span className="text-[8px] md:text-[10px] tracking-[0.2em] font-mono text-accent opacity-60 group-hover:opacity-100 transition-opacity">{t.burst_monitor.split('/')[0]?.trim() || "Strength"}: {collectiveStrength}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex ghibli-glass mano-border p-1">
            <button 
              onClick={() => setViewType('GRID')}
              className={cn("p-1.5 md:p-2 transition-all", viewType === 'GRID' ? 'bg-accent text-white' : 'text-white/20 hover:text-white/60')}
            >
              <Layout size={12} className="md:w-3.5 md:h-3.5" />
            </button>
            <button 
              onClick={() => setViewType('MANIFOLD')}
              className={cn("p-1.5 md:p-2 transition-all", viewType === 'MANIFOLD' ? 'bg-accent text-white' : 'text-white/20 hover:text-white/60')}
            >
              <Network size={12} className="md:w-3.5 md:h-3.5" />
            </button>
            <button 
              onClick={() => setViewType('GRAPH')}
              className={cn("p-1.5 md:p-2 transition-all", viewType === 'GRAPH' ? 'bg-accent text-white' : 'text-white/20 hover:text-white/60')}
            >
              <Orbit size={12} className="md:w-3.5 md:h-3.5" />
            </button>
          </div>

          <button 
            onClick={handleSync}
            disabled={syncing}
            className="flex-1 md:flex-none px-4 md:px-8 py-2 md:py-3 ghibli-glass mano-border text-[8px] md:text-[10px] tracking-[0.4em] uppercase text-accent hover:bg-white/5 transition-all flex items-center justify-center gap-2 md:gap-4"
          >
            {syncing ? <RefreshCw size={12} className="animate-spin md:w-3.5 md:h-3.5" /> : <Shield size={12} className="md:w-3.5 md:h-3.5" />}
            <span>{syncing ? t.syncing_label : t.sync_collective}</span>
          </button>
        </div>
      </div>

      {/* ✦ Epistemic Ingest Conduit || 大宗主權語義注入導管 */}
      <div className="ghibli-glass mano-border border-white/5 p-4 md:p-6 rounded-none flex flex-col gap-4">
        <button 
          onClick={() => setIsConduitOpen(!isConduitOpen)}
          className="flex justify-between items-center w-full text-left text-xs md:text-sm tracking-[0.3em] font-mono text-white/50 hover:text-white/90 transition-colors uppercase"
        >
          <div className="flex items-center gap-3">
            <span className="text-pink-400">✦</span>
            <span>Epistemic Ingest Conduit</span>
            <span className="hidden md:inline text-white/20">|</span>
            <span className="hidden md:inline font-sans font-light italic text-white/30 text-[10px]">大宗主權語義與文獻灌注</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-accent/60">
            <span>{isConduitOpen ? "COLLAPSE" : "EXPAND CONSOLE"}</span>
            {isConduitOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </div>
        </button>

        <AnimatePresence>
          {isConduitOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden flex flex-col gap-6 pt-4 border-t border-white/5"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Side Inputs & Controls (7 Cols) */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  
                  {/* Textarea or Drag-Drop Box */}
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      "relative border border-dashed rounded-none p-4 min-h-[220px] flex flex-col transition-all bg-black/10",
                      isDragOver ? "border-accent bg-accent/5 scale-[0.99]" : "border-white/10 hover:border-white/20"
                    )}
                  >
                    <textarea
                      placeholder="請貼上欲灌注之大宗知識文本、學術文獻、因果法規、或拉拽 .txt / .md / .json 檔案至此..."
                      className="w-full flex-grow bg-transparent text-[11px] tracking-[0.1em] text-white/80 placeholder:text-white/20 focus:outline-[#1e1e1e] resize-none font-sans leading-relaxed min-h-[160px]"
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                    />
                    
                    <div className="flex justify-between items-end mt-2 pt-2 border-t border-white/5">
                      <div className="text-[8px] font-mono text-white/30 tracking-widest">
                        {rawText.length.toLocaleString()} CHARS | CURRENT CORPUS
                      </div>
                      
                      <label className="cursor-pointer text-[8px] font-mono tracking-widest text-accent hover:text-white transition-colors bg-white/5 border border-white/10 px-3 py-1.5 flex items-center gap-1.5 uppercase">
                        <Upload size={10} />
                        Choose File
                        <input 
                          type="file" 
                          accept=".txt,.md,.json" 
                          className="hidden" 
                          onChange={handleFileChange} 
                        />
                      </label>
                    </div>
                  </div>

                  {/* Metadata & Core Mapping Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[7px] tracking-[0.3em] font-mono text-white/30 uppercase">Corpus Source / 文本來源</label>
                      <input 
                        type="text" 
                        value={sourceName}
                        onChange={(e) => setSourceName(e.target.value.toUpperCase())}
                        className="w-full bg-white/5 border border-white/10 p-2 text-[10px] tracking-wider font-mono text-white focus:outline-none focus:border-accent/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[7px] tracking-[0.3em] font-mono text-white/30 uppercase">Axiom Category / 系統範疇</label>
                      <select
                        value={categoryTag}
                        onChange={(e) => setCategoryTag(e.target.value)}
                        className="w-full bg-[#141414] border border-white/10 p-2 text-[10px] tracking-wider font-mono text-white focus:outline-none focus:border-accent/40"
                      >
                        <option value="ACTIVE_INFERENCE">ACTIVE_INFERENCE (主動推理)</option>
                        <option value="JEPA_WORLD_MODEL">JEPA_WORLD_MODEL (世界模型)</option>
                        <option value="GLOM_CONVERGENCE">GLOM_CONVERGENCE (部分與整體)</option>
                        <option value="CYBERNETIC_COHERENCE">CYBERNETIC (控制論對齊)</option>
                        <option value="EXTERNAL_INTELLIGENCE">INTELLIGENCE (外部智識)</option>
                      </select>
                    </div>
                  </div>

                  {/* Fragmentation & Server Sync Control */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 bg-white/[0.02] border border-white/5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-mono text-white/40 tracking-wider">FRAGMENTATION PROTOCOL / 文本切割方案</span>
                      <div className="flex items-center gap-2 mt-1">
                        {(['SENTENCE', 'PARAGRAPH', 'LINE', 'MONOLITH'] as const).map(strat => (
                          <button
                            key={strat}
                            type="button"
                            onClick={() => setChunkStrategy(strat)}
                            className={cn(
                              "text-[8px] font-mono tracking-wider px-2 py-1 border transition-all",
                              chunkStrategy === strat 
                                ? "bg-accent border-accent text-white" 
                                : "border-white/10 text-white/40 hover:text-white"
                            )}
                          >
                            {strat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-full w-[1px] bg-white/5 hidden md:block" />

                    <button
                      type="button"
                      onClick={() => setAlignServer(!alignServer)}
                      className="flex items-center gap-2 text-left self-start md:self-center"
                    >
                      <div className={cn(
                        "w-3.5 h-3.5 border flex items-center justify-center transition-all",
                        alignServer ? "border-accent bg-accent/20 text-accent" : "border-white/20"
                      )}>
                        {alignServer && <Check size={10} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-mono tracking-widest text-white/60">ALIGN CORE SERVER BRAIN</span>
                        <span className="text-[6px] text-white/30 tracking-tight">同步至 VEDA 伺服端 LWM 主動推理內核</span>
                      </div>
                    </button>
                  </div>

                  {/* Core Ingest Trigger Button */}
                  <button
                    type="button"
                    onClick={handleIngest}
                    disabled={isIngesting || !rawText.trim()}
                    className={cn(
                      "w-full py-3 text-[9px] md:text-[10px] tracking-[0.4rem] uppercase font-mono transition-all flex items-center justify-center gap-3",
                      isIngesting 
                        ? "bg-accent/40 text-white/40 cursor-wait border border-accent/20" 
                        : rawText.trim()
                          ? "bg-pink-500 hover:bg-pink-600 border border-pink-500/30 text-white shadow-lg shadow-pink-500/10 active:scale-[0.99]"
                          : "bg-white/5 border border-white/10 text-white/20 cursor-not-allowed"
                    )}
                  >
                    {isIngesting ? (
                      <>
                        <RefreshCw size={12} className="animate-spin text-white" />
                        <span>INGESTION_OPERATION_IN_PROGRESS</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} />
                        <span>ENGAGE SOVEREIGN EPISTEMIC INGESTION</span>
                      </>
                    )}
                  </button>

                </div>

                {/* Right Side Curriculum Presets & Feed Log (5 Cols) */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  
                  {/* Curriculums Presets (學術教案) */}
                  <div className="space-y-2">
                    <div className="text-[7px] tracking-[0.3em] font-mono text-white/30 uppercase flex items-center gap-1.5">
                      <BookOpen size={9} />
                      Standard Curriculums / 學術經典快速注入
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {LECTURES.map((lecture, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if (isIngesting) return;
                            setRawText(lecture.text);
                            setSourceName(lecture.tag);
                            if (lecture.tag === "ACTIVE_INFERENCE") setCategoryTag("ACTIVE_INFERENCE");
                            if (lecture.tag === "JEPA_ARCH") setCategoryTag("JEPA_WORLD_MODEL");
                            if (lecture.tag === "GLOM_CONSENSUS") setCategoryTag("GLOM_CONVERGENCE");
                            if (lecture.tag === "COREG_PROTOCOL") setCategoryTag("CYBERNETIC_COHERENCE");
                          }}
                          disabled={isIngesting}
                          className="w-full text-left bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 p-2 px-3 transition-colors flex justify-between items-center group"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-mono tracking-wider font-semibold text-white/80 group-hover:text-white transition-colors">{lecture.title}</span>
                            <span className="text-[7px] text-white/30 tracking-tight font-mono">Tag: {lecture.tag}</span>
                          </div>
                          <ArrowRight size={10} className="text-white/20 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Feed Terminal Log Display */}
                  <div className="flex-grow flex flex-col gap-1.5 min-h-[160px] lg:min-h-0 bg-black/40 border border-white/5 p-3 rounded font-mono text-[7px] md:text-[8px]">
                    <div className="flex justify-between items-center border-b border-white/5 pb-1 mb-1">
                      <div className="flex items-center gap-1.5 text-white/40 uppercase">
                        <Terminal size={10} className="text-pink-400" />
                        Conduit telemetry feed
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping" />
                        <span className="text-[6px] text-white/20 uppercase">CHANNEL ACTIVE</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {isIngesting && (
                      <div className="mb-2 space-y-1">
                        <div className="flex justify-between text-[6px] text-accent/80 font-bold uppercase tracking-wider">
                          <span>INGESTION PROGRESS</span>
                          <span>{ingestProgress}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-[3px] overflow-hidden">
                          <motion.div 
                            className="bg-pink-500 h-full"
                            style={{ width: `${ingestProgress}%` }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex-grow overflow-y-auto max-h-[120px] lg:max-h-[140px] space-y-1 custom-scrollbar text-white/50 leading-tight">
                      {ingestLog.length === 0 ? (
                        <div className="h-full flex items-center justify-center opacity-10 uppercase tracking-[0.2em] italic text-center py-8">
                          SYSTEM STANDBY REGISTRY EMPTY
                        </div>
                      ) : (
                        ingestLog.map((logLine, idx) => (
                          <div key={idx} className={cn(
                            "flex gap-1 items-start text-left whitespace-pre-wrap",
                            logLine.includes("[SUCCESS]") && "text-emerald-400 font-bold",
                            logLine.includes("[CRITICAL") && "text-rose-400 font-bold",
                            logLine.includes("[LOCAL_INGEST") && "text-yellow-400",
                            logLine.includes("[VEDA_SERVER") && "text-pink-400"
                          )}>
                            <span className="text-white/20">›</span>
                            <span>{logLine}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {viewType === 'GRID' ? (
        <>
          <div className="relative group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-accent/40 group-focus-within:text-accent">
              <Search size={18} />
            </div>
            <input 
              type="text"
              placeholder={t.semantic_search_placeholder}
              className="w-full bg-white/5 border border-white/10 rounded-none p-6 pl-16 text-[11px] tracking-[0.3em] font-mono focus:outline-none focus:border-accent/40 transition-all uppercase"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {fragments.map((f, i) => (
              <motion.div 
                key={`fragment-${f.id || i}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "ghibli-glass mano-border p-6 md:p-8 py-8 md:py-10 flex flex-col gap-4 md:gap-6 relative group overflow-hidden transition-all",
                  f.metadata?.source === 'COLLECTIVE' && "border-gold/20 bg-gold/5"
                )}
              >
                <div className="absolute top-0 right-0 p-3 md:p-4 opacity-10 font-mono text-[7px] md:text-[8px]">#{f.id}</div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className={cn("w-1 h-1 md:w-1.5 md:h-1.5 rounded-full", f.metadata?.source === 'COLLECTIVE' ? 'bg-accent animate-pulse' : 'bg-gold')} />
                  <span className="text-[7px] md:text-[9px] tracking-[0.4em] uppercase opacity-40">
                    [{f.metadata?.source || 'LOCAL'}]
                  </span>
                </div>
                <p className="text-xs md:text-sm leading-relaxed text-ink/80 font-serif italic line-clamp-4 md:line-clamp-none">{f.content}</p>
                
                <div className="mt-auto pt-4 md:pt-6 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[7px] md:text-[8px] font-mono text-white/20">{new Date(f.timestamp).toLocaleDateString()}</span>
                  
                  <div className="flex items-center gap-3 md:gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                      {!f.isShared && f.metadata?.source !== 'COLLECTIVE' && (
                        <button 
                          onClick={() => handleShare(f.id)}
                          className="text-[7px] md:text-[8px] tracking-[0.2em] uppercase text-accent hover:text-white transition-colors flex items-center gap-1"
                        >
                          <Share2 size={8} className="md:w-2.5 md:h-2.5" /> {t.market_resonance.includes('Reso') ? "Share" : "分享"}
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(f.id)}
                        className="text-[7px] md:text-[8px] tracking-[0.2em] uppercase text-red-500/40 hover:text-red-400 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={8} className="md:w-2.5 md:h-2.5" /> {t.purge_label}
                      </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {!loading && fragments.length === 0 && (
              <div className="col-span-full py-20 text-center opacity-20 text-[10px] tracking-[0.5em] uppercase">{t.no_fragments}</div>
            )}
          </div>
        </>
      ) : viewType === 'MANIFOLD' ? (
        <div className="h-[600px] ghibli-glass mano-border border-white/5 overflow-hidden">
           <NeuralManifold onSync={refresh} />
        </div>
      ) : (
        <div className="h-[700px] ghibli-glass border-white/5 overflow-hidden">
           <KnowledgeGraph />
        </div>
      )}
    </div>
  );
};
