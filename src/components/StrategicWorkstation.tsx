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

  // V-AA Forensic Audit State & Tabs
  const [activeTab, setActiveTab] = useState<'document' | 'audit'>('document');
  const [isAuditing, setIsAuditing] = useState(false);
  const [appraisal, setAppraisal] = useState<any>(null);

  const reports = data?.strategic_reports || [];
  const selectedReport = reports.find(r => r.id === selectedReportId) || (reports.length > 0 ? reports[0] : null);

  useEffect(() => {
    if (!selectedReportId && reports.length > 0) {
      setSelectedReportId(reports[0].id);
    }
  }, [reports, selectedReportId]);

  // Load appraisal if pre-baked in the report
  useEffect(() => {
    if (selectedReport) {
      if (selectedReport.expertiseAssessment) {
        setAppraisal(selectedReport.expertiseAssessment);
      } else {
        setAppraisal(null);
      }
    }
  }, [selectedReportId, selectedReport]);

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

  // Run Forensic Audit action
  const runForensicAudit = async () => {
    if (!selectedReport) return;
    setIsAuditing(true);
    try {
      const res = await vedaService.appraiseStrategicReport(selectedReport.id);
      setAppraisal(res);
      onRefresh?.();
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuditing(false);
    }
  };

  // Modern L4 Expert Augmentation
  const enrichToL4Expert = async () => {
    if (!selectedReport) return;
    setIsProcessing(true);
    try {
      const res = await vedaService.enrichReportToL4(selectedReport.id);
      setAppraisal(res);
      onRefresh?.();
      setActiveTab('document'); // Jump back to show augmented content!
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Math for Radar Chart Coordinates
  const getRadarCoords = (metrics: any) => {
    if (!metrics) return [];
    
    const center = 110;
    const rMax = 80;
    const metricKeys = [
      metrics.informationQuality || 0,
      metrics.causalModel || 0,
      metrics.counterfactual || 0,
      metrics.variableWeighting || 0,
      metrics.uncertainty || 0,
      metrics.actionability || 0,
    ];

    return metricKeys.map((value, idx) => {
      const angle = (idx * 60 - 90) * (Math.PI / 180);
      const radius = (value / 5) * rMax;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle)
      };
    });
  };

  const getRadarIdealCoords = () => {
    const center = 110;
    const rMax = 80;
    const idealValues = [5, 5, 5, 4, 5, 5]; // Preseeded L4 blueprint
    return idealValues.map((value, idx) => {
      const angle = (idx * 60 - 90) * (Math.PI / 180);
      const radius = (value / 5) * rMax;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle)
      };
    });
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
             V-AA Protocol / 戰略文獻寫作與學術審計
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
          <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 h-[220px]">
            <h3 className="text-[10px] font-mono tracking-[0.4em] opacity-40 uppercase mb-2">History / 歷史存檔</h3>
            {reports.map((r, rIdx) => (
              <button
                key={`report-${r.id}-${rIdx}`}
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
                    <span className="text-[10px] font-mono text-accent">
                      {r.expertiseAssessment?.grade ? `[${r.expertiseAssessment.grade}] ` : ''}
                      {r.progress.toFixed(0)}%
                    </span>
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
                   {r.expertiseAssessment?.overallScore ? (
                      <span className="text-accent font-medium">Expertise: {r.expertiseAssessment.overallScore}/100</span>
                   ) : (
                      <span className="text-white/25">Awaiting Forensic Audit</span>
                   )}
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
                  key={`outline-sec-${sec.id}-${i}`}
                  className={`flex items-center justify-between p-3 border ${
                    sec.status === 'DONE' ? 'border-accent/20 bg-accent/5' : 'border-white/5 bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono opacity-30">{i + 1}</span>
                    <span className="text-[10px] tracking-widest uppercase truncate max-w-[140px] md:max-w-[180px]">{sec.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {sec.status === 'DONE' ? (
                       <CheckCircle2 size={12} className="text-accent" />
                    ) : sec.status === 'GENERATING' ? (
                       <Loader2 size={12} className="animate-spin text-accent" />
                    ) : (
                       <button 
                         onClick={() => synthesizeSection(selectedReport.id, sec.id)}
                         className="p-1 hover:text-accent transition-colors"
                         disabled={isProcessing}
                       >
                         <Zap size={12} />
                       </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right: Content Viewer / Forensic Audit */}
        <section className="bg-black/60 border border-white/5 flex flex-col overflow-hidden relative group">
          {selectedReport ? (
            <>
              {/* Header inside Viewer */}
              <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center bg-white/[0.02] gap-4">
                <div className="flex flex-col gap-2">
                   <h2 className="text-xl font-display tracking-[0.2em] uppercase text-accent">{selectedReport.title}</h2>
                   <div className="flex flex-wrap gap-2">
                      {selectedReport.axioms.map((a, i) => (
                        <span key={`rep-ax-${i}-${a.substring(0, 10)}`} className="text-[7px] font-mono text-white/40 tracking-[0.15em] border border-white/10 px-2 py-0.5 uppercase bg-white/[0.02]">
                          AXIOM_{i}: {a}
                        </span>
                      ))}
                   </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {/* View Mode Tabs */}
                  <div className="flex border border-white/10 bg-black/40 p-1">
                    <button 
                      onClick={() => setActiveTab('document')}
                      className={`px-4 py-1.5 text-[9px] font-bold tracking-widest uppercase transition-all ${
                        activeTab === 'document' ? 'bg-accent/15 text-accent border border-accent/25' : 'text-white/40 hover:text-white/80'
                      }`}
                    >
                      Document
                    </button>
                    <button 
                      onClick={() => {
                        setActiveTab('audit');
                        if (!appraisal && !isAuditing) {
                          runForensicAudit();
                        }
                      }}
                      className={`px-4 py-1.5 text-[9px] font-bold tracking-widest uppercase transition-all flex items-center gap-2 ${
                        activeTab === 'audit' ? 'bg-accent/15 text-accent border border-accent/25' : 'text-white/40 hover:text-white/80'
                      }`}
                    >
                      Audit {appraisal ? `[${appraisal.grade}]` : ''}
                    </button>
                  </div>

                  <button 
                    onClick={() => exportToPDF(selectedReport)}
                    className="flex items-center gap-2 px-5 py-2.5 border border-white/10 text-white/60 text-[9px] tracking-widest font-mono uppercase hover:border-white/30 hover:text-white/90 transition-all ml-auto md:ml-0"
                    disabled={selectedReport.progress < 10}
                  >
                    <Download size={12} />
                    PDF
                  </button>
                </div>
              </div>

              {/* Viewer Screen Render */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {activeTab === 'document' ? (
                  /* TAB 1: Markdown reading document module */
                  <div className="p-12 lg:p-20">
                    <div className="max-w-3xl mx-auto space-y-24">
                      {selectedReport.outline.map((sec, i) => (
                        <div key={`content-sec-${sec.id}-${i}`} className="relative group/sec">
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
                            <div className="h-64 border border-dashed border-white/10 flex items-center justify-center opacity-30 italic font-serif">
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
                ) : (
                  /* TAB 2: V-AA Forensic Audit scoreboard with interactive radar polygon & L4 enrichment launcher */
                  <div className="p-8 lg:p-16 max-w-5xl mx-auto">
                    {/* Header Score Display banner */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border border-white/5 bg-white/[0.01] p-8 mb-12 items-center">
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-accent/60">Forensic Audit Result</span>
                        <h4 className="text-lg font-display tracking-widest text-white/90">協議級認識論審計</h4>
                        <p className="text-xs text-white/40 leading-relaxed">評估報告在因果深度、反證批判及不確定區間標註上的真偽特徵。</p>
                      </div>

                      {/* Main overall Score */}
                      <div className="flex items-center justify-center py-4 bg-black/40 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-1 text-[7px] font-mono opacity-20 uppercase">Core Coherence</div>
                        <div className="text-center">
                          {isAuditing ? (
                            <Loader2 size={32} className="animate-spin text-accent mx-auto mb-2" />
                          ) : appraisal ? (
                            <>
                              <div className="text-5xl font-display font-medium text-accent tracking-tighter">
                                {appraisal.overallScore}<span className="text-xs text-white/30 font-sans">/100</span>
                              </div>
                              <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-accent/80 block mt-2">
                                Total Points: {appraisal.totalPoints}/30
                              </span>
                            </>
                          ) : (
                            <button 
                              onClick={runForensicAudit}
                              className="px-6 py-2 bg-accent/10 border border-accent/30 text-accent text-[9px] uppercase tracking-widest"
                            >
                              Run Audit
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Grade Badge */}
                      <div className="flex flex-col items-center justify-center py-4 bg-black/40 border border-white/5 relative">
                        <div className="absolute top-0 right-0 p-1 text-[7px] font-mono opacity-20">EP-GRADE</div>
                        <div className="text-center">
                          {isAuditing ? (
                            <span className="text-xs font-mono opacity-30 animate-pulse uppercase">Auditing...</span>
                          ) : appraisal ? (
                            <>
                              <div className={`text-4xl font-display font-bold tracking-widest ${
                                appraisal.grade === 'L4' ? 'text-accent shadow-[0_0_10px_rgba(255,244,191,0.2)]' : 'text-neutral-500'
                              }`}>
                                {appraisal.grade}
                              </div>
                              <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-white/40 block mt-2">
                                {appraisal.grade === 'L4' ? 'L4 主權專家型' : appraisal.grade === 'L3' ? 'L3 分析型' : 'L2~L1 搜尋/整理型'}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs font-mono opacity-20 uppercase">No assessment</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-12">
                      {/* Left side: Custom responsive Radar chart (SVG) */}
                      <div className="border border-white/5 bg-black/30 p-8 flex flex-col items-center gap-6">
                        <span className="text-[8px] font-mono tracking-[0.3em] uppercase text-white/40自決">
                          RADAR ONTOLOGY / 六維學術雷達
                        </span>

                        {appraisal ? (
                          <div className="relative w-[220px] h-[220px]">
                            {/* SVG responsive Radar canvas */}
                            <svg className="w-full h-full" viewBox="0 0 220 220">
                              <defs>
                                <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                                  <stop offset="0%" stopColor="#fff4bf" stopOpacity="0.02" />
                                  <stop offset="100%" stopColor="#fff4bf" stopOpacity="0.18" />
                                </radialGradient>
                              </defs>

                              {/* Concentration grid circles representing scale 1 to 5 */}
                              {[1, 2, 3, 4, 5].map((scale) => {
                                const radius = (scale / 5) * 80;
                                return (
                                  <circle 
                                    key={`radar-grid-${scale}`}
                                    cx="110" 
                                    cy="110" 
                                    r={radius} 
                                    fill="none" 
                                    stroke="white" 
                                    strokeOpacity="0.04" 
                                    strokeDasharray="2,3"
                                  />
                                );
                              })}

                              {/* Target Ideal L4 Polygon (Dashed outline) */}
                              <polygon 
                                points={getRadarIdealCoords().map(p => `${p.x},${p.y}`).join(' ')}
                                fill="none"
                                stroke="#fff4bf"
                                strokeOpacity="0.15"
                                strokeWidth="1"
                                strokeDasharray="3,3"
                              />

                              {/* Current Report Real Scores Polygon */}
                              <polygon 
                                points={getRadarCoords(appraisal.metrics).map(p => `${p.x},${p.y}`).join(' ')}
                                fill="url(#radarGradient)"
                                stroke="#fff4bf"
                                strokeWidth="2"
                                style={{ strokeLinejoin: "round" }}
                              />

                              {/* Axis connector lines */}
                              {[0, 1, 2, 3, 4, 5].map((axisIdx) => {
                                const angle = (axisIdx * 60 - 90) * (Math.PI / 180);
                                const outerX = 110 + 80 * Math.cos(angle);
                                const outerY = 110 + 80 * Math.sin(angle);
                                return (
                                  <line 
                                    key={`radar-axis-${axisIdx}`}
                                    x1="110" 
                                    y1="110" 
                                    x2={outerX} 
                                    y2={outerY} 
                                    stroke="white" 
                                    strokeOpacity="0.08" 
                                  />
                                );
                              })}

                              {/* Coords dots */}
                              {getRadarCoords(appraisal.metrics).map((pt, index) => (
                                <circle 
                                  key={`radar-pt-${index}`}
                                  cx={pt.x} 
                                  cy={pt.y} 
                                  r="4" 
                                  fill="#fff4bf" 
                                  stroke="#050505" 
                                  strokeWidth="1.5"
                                />
                              ))}
                            </svg>

                            {/* Outer metric labels overlay (Absolute positioning relative) */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-mono tracking-widest text-[#fff4bf] uppercase text-center bg-[#050505]/80 px-1 border border-white/5">
                              資訊品質
                            </div>
                            <div className="absolute top-[50px] -right-16 text-[8px] font-mono tracking-widest text-white/50 uppercase">
                              因果深度
                            </div>
                            <div className="absolute bottom-[22px] -right-16 text-[8px] font-mono tracking-widest text-white/50 uppercase">
                              反證批判
                            </div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[8px] font-mono tracking-widest text-white/50 uppercase text-center bg-[#050505]/80 px-1">
                              變量權重
                            </div>
                            <div className="absolute bottom-[22px] -left-16 text-[8px] font-mono tracking-widest text-white/50 uppercase">
                              不確定處理
                            </div>
                            <div className="absolute top-[50px] -left-16 text-[8px] font-mono tracking-widest text-white/50 uppercase">
                              具體行動
                            </div>
                          </div>
                        ) : (
                          <div className="h-[220px] flex items-center justify-center opacity-25 text-xs italic">
                            Run forensic audit to render coordinates
                          </div>
                        )}

                        <div className="text-[7.5px] font-mono text-white/30 space-y-1 w-full text-center uppercase">
                          <div>
                            <span className="inline-block w-2 h-2 bg-[#fff4bf] border border-[#050505] mr-2" />
                            Active Model Coverage
                          </div>
                          <div>
                            <span className="inline-block w-2 h-2 border border-dashed border-[#fff4bf] mr-2" />
                            Ideal Level 4 Target Blueprint
                          </div>
                        </div>
                      </div>

                      {/* Right side: Numerical score segments bars */}
                      <div className="flex flex-col gap-6">
                        <span className="text-[8px] font-mono tracking-[0.3em] uppercase text-white/40">
                          Metric Calibration Details / 十進制條形檢測
                        </span>

                        {appraisal ? (
                          <div className="space-y-4">
                            {[
                              { label: '資訊品質 / Information Quality', val: appraisal.metrics.informationQuality },
                              { label: '因果模型 / Causal Topology', val: appraisal.metrics.causalModel },
                              { label: '反證批判 / Counterfactual Stress', val: appraisal.metrics.counterfactual },
                              { label: '變量權重 / Variable Relevance Weight', val: appraisal.metrics.variableWeighting },
                              { label: '不確定處理 / Uncertainty Confidence', val: appraisal.metrics.uncertainty },
                              { label: '具體行動 / Desired Action Outcomes', val: appraisal.metrics.actionability }
                            ].map((mt, i) => (
                              <div key={`param-seg-${i}`} className="space-y-1">
                                <div className="flex justify-between text-[9px] font-mono text-white/50">
                                   <span>{mt.label}</span>
                                   <span className="text-accent font-bold">{mt.val} / 5</span>
                                </div>
                                <div className="grid grid-cols-5 gap-1.5 h-1.5">
                                  {[1,2,3,4,5].map((idx) => (
                                    <div 
                                      key={`seg-cell-${idx}`}
                                      className={`h-full border transition-all ${
                                        idx <= mt.val 
                                          ? 'bg-accent/40 border-accent/50 shadow-[0_0_4px_rgba(255,244,191,0.2)]' 
                                          : 'bg-white/[0.02] border-white/5'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-48 border border-dashed border-white/5 flex items-center justify-center opacity-30 text-xs italic">
                            Awaiting forensic appraisal evaluation
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section: Pros, Cons, Missing Expert Ability, Recommendations */}
                    {appraisal && (
                      <div className="space-y-8 mb-12">
                        {/* Summary lists */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Pros */}
                          <div className="border border-white/5 bg-white/[0.01] p-6">
                            <h5 className="text-[10px] font-mono tracking-[0.3em] uppercase text-accent mb-4">學術優勢 (Pros)</h5>
                            <ul className="space-y-2 list-none">
                              {appraisal.pros?.map((pro: string, idx: number) => (
                                <li key={`pro-${idx}`} className="text-xs text-white/70 leading-relaxed pl-4 border-l border-accent flex gap-2">
                                  <span>{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Cons */}
                          <div className="border border-white/5 bg-white/[0.01] p-6">
                            <h5 className="text-[10px] font-mono tracking-[0.3em] uppercase text-red-400 mb-4">認知局限 (Cons)</h5>
                            <ul className="space-y-2 list-none">
                              {appraisal.cons?.map((con: string, idx: number) => (
                                <li key={`con-${idx}`} className="text-xs text-white/50 leading-relaxed pl-4 border-l border-red-500/40">
                                  <span>{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Missing High end expert features (from DRAWING 2) */}
                        {appraisal.missingAbilities && appraisal.missingAbilities.length > 0 && (
                          <div className="border border-red-500/10 bg-red-950/5 p-6">
                            <h5 className="text-[10px] font-mono tracking-[0.3em] uppercase text-red-400 mb-4 flex items-center gap-2">
                              <AlertCircle size={12} />
                              缺少之 AGI 專家級相干特徵 (Missing Level 4 Pillars)
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {appraisal.missingAbilities.map((pillar: string, idx: number) => (
                                <div key={`pillar-${idx}`} className="p-3 bg-black/40 border border-red-500/10 text-[10px] font-mono text-red-300 tracking-wider uppercase flex items-center gap-3">
                                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-ping" />
                                  {pillar}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        <div className="border border-white/5 bg-white/[0.02] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="space-y-2">
                            <h5 className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#fff4bf]">提升戰略建議</h5>
                            {appraisal.recommendations?.map((rec: string, idx: number) => (
                              <p key={`rec-${idx}`} className="text-xs text-white/60 font-serif leading-relaxed italic pr-4">
                                {rec}
                              </p>
                            ))}
                          </div>

                          {/* Level Enrichment Trigger Button */}
                          {appraisal.grade !== 'L4' && (
                            <button 
                              onClick={enrichToL4Expert}
                              className="px-8 py-3 bg-accent hover:bg-[#ffe58f] text-neutral-950 text-[10px] font-bold tracking-[0.3em] uppercase flex items-center gap-3 shadow-[0_0_20px_rgba(255,244,191,0.3)] hover:scale-105 transition-all self-stretch md:self-auto text-center justify-center whitespace-nowrap"
                              disabled={isProcessing}
                            >
                              <Zap size={14} fill="currentColor" />
                              Enrich to L4 Expert
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
