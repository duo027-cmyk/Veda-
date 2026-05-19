import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Loader2, 
  Download, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  BookOpen,
  Send,
  Zap,
  Trash2,
  Maximize2,
  Minimize2,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { vedaService } from '../services/vedaService';
import { BrainData, StrategicReport } from '../types';
import { useI18n } from '../i18n';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { exportReportToPDF } from '../lib/reportUtils';

interface StrategicWorkstationProps {
  data: BrainData | null;
  onRefresh?: () => void;
}

export const StrategicWorkstation: React.FC<StrategicWorkstationProps> = ({ data, onRefresh }) => {
  const { t } = useI18n();
  const [isCreating, setIsCreating] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [newIntent, setNewIntent] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fullScreenSecId, setFullScreenSecId] = useState<string | null>(null);

  const reports = data?.strategic_reports || [];
  const selectedReport = reports.find(r => r.id === selectedReportId) || (reports.length > 0 ? reports[0] : null);

  useEffect(() => {
    if (!selectedReportId && reports.length > 0) {
      setSelectedReportId(reports[0].id);
    }
  }, [reports, selectedReportId]);

  const handleCreate = async () => {
    if (!newTopic || !newIntent) return;
    setIsProcessing(true);
    try {
      const res = await vedaService.initiateStrategicReport(newTopic, newIntent);
      setSelectedReportId(res.id);
      setIsCreating(false);
      setNewTopic('');
      setNewIntent('');
      onRefresh?.();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const synthesizeSection = async (reportId: string, sectionId: string) => {
    setIsProcessing(true);
    try {
      await vedaService.synthesizeReportSection(reportId, sectionId);
      onRefresh?.();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const synthesizeAll = async (report: StrategicReport) => {
    setIsProcessing(true);
    try {
      for (const section of report.outline) {
        if (section.status !== 'DONE') {
          await vedaService.synthesizeReportSection(report.id, section.id);
          onRefresh?.();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const exportToPDF = async (report: StrategicReport) => {
    setIsProcessing(true);
    try {
      await exportReportToPDF(report);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col pt-32 pb-12 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
      <header className="flex justify-between items-end mb-12 border-b border-white/5 pb-8 relative group">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <BookOpen className="text-accent animate-pulse" size={32} />
            <h1 className="text-4xl font-display tracking-[0.3em] uppercase text-white/90">
              Strategic Synthesis Matrix
            </h1>
          </div>
          <p className="text-[10px] tracking-[0.5em] font-mono text-accent/60 uppercase">
             V-AA Protocol / 戰略文獻寫作矩陣
          </p>
        </div>
        
        <button 
          onClick={() => setIsCreating(true)}
          className="ff-button flex items-center gap-3 px-8 py-3 bg-accent/10 border border-accent/30 text-accent text-[10px] font-bold tracking-[0.3em] uppercase group-hover:bg-accent/20 transition-all"
        >
          <Plus size={16} />
          Initiate New Report
        </button>

        <div className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent w-full opacity-30" />
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-8 overflow-hidden">
        {/* Left: Report List & Outline */}
        <aside className="flex flex-col gap-6 overflow-hidden">
          <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
            <h3 className="text-[10px] font-mono tracking-[0.4em] opacity-40 uppercase mb-2">History / 歷史存檔</h3>
            {reports.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedReportId(r.id)}
                className={`p-4 text-left border transition-all relative overflow-hidden group ${
                  selectedReportId === r.id 
                    ? 'bg-accent/10 border-accent/50' 
                    : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold tracking-widest uppercase truncate max-w-[150px]">{r.title}</span>
                  <div className="flex items-center gap-2">
                    {r.status === 'SYNTHESIZING' && <Loader2 size={8} className="animate-spin text-accent" />}
                    <span className="text-[10px] font-mono text-accent">{r.progress.toFixed(2)}%</span>
                  </div>
                </div>
                <div className="w-full h-[1px] bg-white/5 relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${r.progress}%`,
                      opacity: r.status === 'SYNTHESIZING' ? [0.4, 1, 0.4] : 1
                    }}
                    transition={r.status === 'SYNTHESIZING' ? { duration: 2, repeat: Infinity } : {}}
                    className="absolute inset-y-0 left-0 bg-accent shadow-[0_0_8px_rgba(255,244,191,0.3)]"
                  />
                </div>
                <div className="mt-2 flex justify-between items-center text-[7px] font-mono opacity-30 uppercase tracking-tighter">
                   <span>Status: {r.status}</span>
                   {r.status === 'SYNTHESIZING' && <span className="animate-pulse">Neural Flux Active</span>}
                </div>
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col gap-4 bg-black/40 border border-white/5 p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-mono tracking-[0.4em] opacity-40 uppercase">Causal Skeleton / 報告骨幹</h3>
              {selectedReport && selectedReport.status !== 'COMPLETED' && (
                <button 
                  onClick={() => synthesizeAll(selectedReport)}
                  className="text-[8px] tracking-widest underline opacity-40 hover:opacity-100 uppercase"
                  disabled={isProcessing}
                >
                  Synthesize All
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
              {selectedReport?.status === 'PLANNING' && selectedReport.outline.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center gap-8 py-10 opacity-30">
                  <Loader2 size={24} className="animate-spin text-accent" />
                  <span className="text-[9px] tracking-[0.4em] uppercase font-mono">Building Causal Skeleton...</span>
                </div>
              )}
              {selectedReport?.outline.map((sec, i) => (
                <div 
                  key={sec.id}
                  className={`flex items-center justify-between p-3 border ${
                    sec.status === 'DONE' ? 'border-accent/20 bg-accent/5' : 'border-white/5 bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono opacity-30">{i + 1}</span>
                    <span className="text-[10px] tracking-widest uppercase truncate max-w-[180px]">{sec.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {sec.status === 'DONE' ? (
                       <CheckCircle2 size={14} className="text-accent" />
                    ) : sec.status === 'GENERATING' ? (
                       <Loader2 size={14} className="animate-spin text-accent" />
                    ) : (
                       <button 
                         onClick={() => synthesizeSection(selectedReport.id, sec.id)}
                         className="p-1 hover:text-accent transition-colors"
                         disabled={isProcessing}
                       >
                         <Zap size={14} />
                       </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right: Content Viewer */}
        <section className="bg-black/60 border border-white/5 flex flex-col overflow-hidden relative group">
          {selectedReport ? (
            <>
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="flex flex-col gap-2">
                   <h2 className="text-xl font-display tracking-[0.2em] uppercase text-accent">{selectedReport.title}</h2>
                   <div className="flex gap-4">
                      {selectedReport.axioms.map((a, i) => (
                        <span key={`rep-ax-${i}-${a.substring(0, 10)}`} className="text-[7px] font-mono text-white/20 tracking-[0.2em] border border-white/10 px-2 py-0.5 uppercase">
                          AXIOM_{i}: {a}
                        </span>
                      ))}
                   </div>
                </div>
                <button 
                  onClick={() => exportToPDF(selectedReport)}
                  className="flex items-center gap-3 px-6 py-2 border border-accent/40 text-accent text-[9px] tracking-[0.3em] font-bold uppercase hover:bg-accent/10 transition-all shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]"
                  disabled={selectedReport.progress < 10}
                >
                  <Download size={14} />
                  Download PDF (Strategic)
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-12 lg:p-20">
                <div className="max-w-3xl mx-auto space-y-24">
                  {selectedReport.outline.map((sec, i) => (
                    <div key={sec.id} className="relative group/sec">
                      <div className="absolute -left-12 top-0 opacity-10 group-hover/sec:opacity-30 transition-opacity">
                         <span className="text-[40px] font-display">0{i+1}</span>
                      </div>
                      <h3 className="text-2xl font-display tracking-[0.3em] uppercase mb-12 pb-4 border-b border-white/5">
                        {sec.title}
                      </h3>
                      
                      {sec.content ? (
                        <div className="markdown-body text-white/70 leading-relaxed font-serif text-lg tracking-wide space-y-6">
                           <ReactMarkdown remarkPlugins={[remarkGfm]}>{sec.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="h-64 border border-dashed border-white/10 flex flex-center items-center justify-center opacity-30 italic font-serif">
                          {sec.status === 'GENERATING' ? (
                            <div className="flex flex-col items-center gap-6">
                               <Loader2 size={40} className="animate-spin text-accent" />
                               <span className="text-[10px] tracking-[0.5em] uppercase not-italic">Epistemic Synthesis in Progress...</span>
                            </div>
                          ) : (
                            <span className="text-[10px] tracking-[0.3em] uppercase">Section Pending Synthesis / 章節待合成</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {selectedReport.outline.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center gap-8 py-40 opacity-20">
                       <BookOpen size={80} strokeWidth={0.5} />
                       <p className="text-[10px] tracking-[0.5em] uppercase">No Structure Detected / 尚未建立戰略結構</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-12 py-40">
               <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-150 animate-pulse" />
                  <BookOpen size={100} strokeWidth={0.3} className="text-white/10 relative z-10" />
               </div>
               <div className="text-center space-y-4">
                  <h2 className="text-[12px] tracking-[0.8em] uppercase text-white/40">Select a report to project into manifold</h2>
                  <p className="text-[10px] tracking-[0.4em] font-mono text-accent/30 uppercase">或啟動全新研究專案</p>
               </div>
            </div>
          )}
        </section>
      </div>

      {/* Creation Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <div className="max-w-2xl w-full ghibli-glass border border-accent/30 p-12 flex flex-col gap-10 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
               
               <div className="flex flex-col gap-4">
                  <h2 className="text-3xl font-display tracking-[0.3em] uppercase text-accent">Initiate Strategic Synthesis</h2>
                  <p className="text-xs font-serif italic text-white/40 tracking-wide leading-relaxed">
                    請定義研究主題與特定的戰略意圖。系統將根據 V-AA Protocol 啟動遞歸合成矩陣。
                  </p>
               </div>

               <div className="space-y-8">
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-mono tracking-[0.4em] uppercase text-accent/60">Research Topic / 研究主題</label>
                    <input 
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      placeholder="e.g. 2026 全球地緣政治與韌性架構分析"
                      className="bg-white/5 border border-white/10 p-4 text-lg text-white/90 focus:border-accent/40 outline-none transition-all font-serif"
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-mono tracking-[0.4em] uppercase text-accent/60">Strategic Intent / 戰略意圖</label>
                    <textarea 
                      value={newIntent}
                      onChange={(e) => setNewIntent(e.target.value)}
                      rows={4}
                      placeholder="e.g. 側重於能源供應鏈、去中心化防禦體系與 AI 主權的交匯點分析..."
                      className="bg-white/5 border border-white/10 p-4 text-sm text-white/80 focus:border-accent/40 outline-none transition-all font-serif leading-relaxed"
                    />
                  </div>
               </div>

               <div className="flex gap-4">
                  <button 
                    onClick={handleCreate}
                    disabled={isProcessing || !newTopic || !newIntent}
                    className="flex-1 py-4 bg-accent/20 hover:bg-accent/40 border border-accent/40 text-accent text-[10px] font-bold tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-4"
                  >
                    {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Authorize Initialization / 授權初始化
                  </button>
                  <button 
                    onClick={() => setIsCreating(false)}
                    className="px-8 py-4 border border-white/10 text-white/40 text-[10px] uppercase hover:text-white/80 transition-all font-mono"
                  >
                    Cancel
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .markdown-body h1, .markdown-body h2, .markdown-body h3 {
          font-family: inherit;
          letter-spacing: 0.1em;
          color: rgba(var(--accent-rgb), 0.9);
          margin-top: 2em;
          margin-bottom: 1em;
          text-transform: uppercase;
        }
        .markdown-body p {
          margin-bottom: 1.5em;
        }
        .markdown-body ul {
          list-style-type: disc;
          padding-left: 1.5em;
          margin-bottom: 1.5em;
        }
        .markdown-body li {
          margin-bottom: 0.5em;
        }
      `}} />
    </div>
  );
};
