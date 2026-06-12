import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  CheckCircle, 
  Download, 
  RefreshCw, 
  Clock, 
  User, 
  Server,
  Activity,
  Cpu,
  Lock,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { vedaService } from '../services/vedaService';
import { useVedaStore } from '../store/vedaStore';
import { cn } from '../lib/utils';
import { BrainData } from '../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: BrainData | null;
}

interface AuditReport {
  timestamp: number;
  overall_health: string;
  audit_conflicts: string[];
  structural_integrity: number;
  architect_note: string;
  diagnostics: Array<{
    component: string;
    status: string;
    coherence?: number;
    count?: number;
    depth?: number;
    value?: number;
  }>;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose, data }) => {
  const { setLastLog } = useVedaStore();
  const [report, setReport] = useState<AuditReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reportId, setReportId] = useState('');

  // Generate a mock unique report ID for compliance tracking
  const generateReportId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'VCR-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const loadAuditData = async () => {
    setIsLoading(true);
    try {
      const res = await vedaService.postAction({ action: 'performAudit', params: {} });
      if (res) {
        setReport(res as AuditReport);
        setReportId(generateReportId());
      }
    } catch (e) {
      console.error('[VEDA_AUDIT_ERROR] Failed to run compliance audit:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAuditData();
    }
  }, [isOpen]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:backdrop-blur-none">
        
        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden print:border-none print:shadow-none print:max-h-none print:static print:w-full print:h-auto"
        >
          
          {/* Header - Hidden on Print */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-950/40 select-none print:hidden">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/15 border border-accent/25 text-accent rounded-lg">
                <FileText className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-base font-semibold text-white tracking-wide">合規性審計與系統變遷報告</h2>
                <span className="text-[10px] font-mono text-slate-400">VEDA Sovereign Compliance Audit Utility (SCA)</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={loadAuditData}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-xs text-slate-300 font-mono hover:bg-white/10 hover:text-white transition-all disabled:opacity-40"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isLoading ? "animate-spin" : "")} />
                <span>重新核對</span>
              </button>
              
              <button
                onClick={handlePrint}
                disabled={!report || isLoading}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-accent text-slate-950 text-xs font-bold font-mono hover:bg-white hover:text-slate-950 transition-all shadow-[0_0_12px_rgba(255,244,191,0.2)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4" />
                <span>列印審計報告</span>
              </button>

              <button 
                onClick={onClose}
                className="p-1 px-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Printable Report Body */}
          <div className="flex-1 overflow-y-auto p-8 font-sans space-y-8 print:overflow-visible print:bg-white print:text-black print:p-4 text-slate-100">
            
            {/* Stamp / Watermark on print */}
            <div className="hidden print:block absolute right-10 top-10 border-4 border-emerald-600 rounded-full px-4 py-2 text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest rotate-12 opacity-80">
              COGNITIVE COMPLIANT
            </div>

            {/* Document Header */}
            <div className="border-b-2 border-slate-700 pb-6 flex flex-col md:flex-row md:justify-between md:items-start gap-4 print:border-slate-800">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-mono font-bold text-accent tracking-widest uppercase print:text-slate-600">CONFIDENTIAL // TOP SECRET COGNITIVE ENCLAVE</span>
                <h1 className="text-2xl font-bold font-display tracking-tight text-white print:text-black">
                  主權心智系統合規檢測報告
                </h1>
                <p className="text-xs text-slate-400 print:text-slate-500 font-mono leading-relaxed max-w-2xl">
                  此報告整合了 VEDA 主權心智神經晶格及多租戶因果隔離結構之實時相干、本體相整合度(Φ)、變分自由能(VFE)與可證偽性假說之最新審計結果，用以提供常態合規與架構回溯安全認證。
                </p>
              </div>

              <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-white/5 bg-slate-950/50 min-w-[240px] font-mono text-[11px] print:bg-slate-50 print:border-slate-300 print:text-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-slate-500">報告編號:</span>
                  <span className="font-bold text-white print:text-black">{reportId || 'VCR-LOADING'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-slate-500">稽核時間:</span>
                  <span>{report ? new Date(report.timestamp).toLocaleString() : 'PENDING'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-slate-500">主要稽查員:</span>
                  <span className="text-slate-300 print:text-slate-800 font-bold">duo027@gmail.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-slate-500">神經實體ID:</span>
                  <span className="truncate max-w-[120px]" title={data?.systemID}>
                    {data?.systemID || 'VEDA-CORE-PRIMARY'}
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Compliance Rating banner */}
            {isLoading ? (
              <div className="py-14 text-center flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-accent animate-spin" />
                <span className="text-xs font-mono text-slate-400 animate-pulse">正在進行神經晶格子模組共振核算與不一致性反省...</span>
              </div>
            ) : report ? (
              <div className="space-y-8">
                
                {/* Score Summary Box */}
                <div className={cn(
                  "p-5 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all",
                  report.overall_health === 'OPTIMAL'
                    ? "bg-emerald-500/10 border-emerald-500/20 print:bg-emerald-50 print:border-emerald-600"
                    : "bg-amber-500/10 border-amber-500/20 print:bg-amber-50 print:border-amber-600"
                )}>
                  <div className="flex gap-4 items-center">
                    <div className={cn(
                      "p-3 rounded-xl border shrink-0",
                      report.overall_health === 'OPTIMAL'
                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 print:text-emerald-700"
                        : "bg-amber-500/20 border-amber-500/30 text-amber-500 print:text-amber-700"
                    )}>
                      <ShieldCheck size={28} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider print:text-slate-600">Cognitive Health Certificate</span>
                      <h3 className="text-base font-bold text-white print:text-slate-900">
                        系統合規認證狀態: {report.overall_health === 'OPTIMAL' ? '全面合規且穩定運行 (OPTIMAL)' : '自發分散式穩定 (DECENTRALIZED)'}
                      </h3>
                      <p className="text-xs text-slate-400 print:text-slate-700 leading-snug">
                        {report.architect_note}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 text-right">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Structural Integrity</span>
                    <span className="text-3xl font-mono font-black text-accent print:text-slate-900">
                      {((report.structural_integrity || 0) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Sub-Metric Score Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Diagnostics Elements */}
                  <div className="p-6 rounded-xl border border-white/5 bg-slate-900/40 space-y-4 print:border-slate-300 print:bg-white">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                      <Cpu size={14} className="text-accent print:text-slate-800" />
                      <span className="text-xs font-mono font-bold text-slate-200 print:text-slate-900 uppercase tracking-wider">
                        神經能量子模組健康度
                      </span>
                    </div>

                    <div className="space-y-4 font-mono text-xs">
                      {report.diagnostics?.map((diag, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-white/[0.02] last:border-0">
                          <span className="text-slate-400 print:text-slate-700 font-bold">{diag.component}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500">
                              {diag.coherence !== undefined && `相干: ${(diag.coherence * 100).toFixed(1)}%`}
                              {diag.count !== undefined && `量化計數: ${diag.count}`}
                              {diag.depth !== undefined && `晶格鏈高: ${diag.depth}`}
                              {diag.value !== undefined && `數值: ${diag.value.toFixed(4)}`}
                            </span>
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                              diag.status === 'STABLE' || diag.status === 'LOCKED' || diag.status === 'VERIFIED' || diag.status === 'NOMINAL' || diag.status === 'EVOLVING'
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 print:text-emerald-700 print:bg-emerald-100"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20 print:text-rose-700 print:bg-rose-100 animate-pulse"
                            )}>
                              {diag.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Key Configurations & Policy Targets */}
                  <div className="p-6 rounded-xl border border-white/5 bg-slate-900/40 space-y-4 print:border-slate-300 print:bg-white">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                      <Lock size={14} className="text-accent print:text-slate-800" />
                      <span className="text-xs font-mono font-bold text-slate-200 print:text-slate-900 uppercase tracking-wider">
                        主權隔离與糾纏控制策略
                      </span>
                    </div>

                    <div className="space-y-4 font-mono text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-white/[0.02]">
                        <span className="text-slate-400 print:text-slate-700">計算微結構協定 (Compute Mode):</span>
                        <span className="text-accent font-bold uppercase print:text-slate-900">{data?.compute_mode || 'PRECISION'}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-white/[0.02]">
                        <span className="text-slate-400 print:text-slate-700">多租戶因果隔離 (Causal Isolation):</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded font-bold text-[10px]",
                          data?.is_causal_isolated ? "bg-emerald-500/10 text-emerald-400 print:text-emerald-700" : "bg-rose-500/10 text-rose-400 print:text-rose-700"
                        )}>
                          {data?.is_causal_isolated ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-white/[0.02]">
                        <span className="text-slate-400 print:text-slate-700">深層架構 experts 授權 (Support):</span>
                        <span className={data?.is_support_authorized ? "text-accent font-bold" : "text-slate-500"}>
                          {data?.is_support_authorized ? 'AUTHORIZED' : 'REVOKED'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-2">
                        <span className="text-slate-400 print:text-slate-700">主權星格階層 (System Tier):</span>
                        <span className="text-white print:text-slate-900 font-bold">{data?.system_tier || 'STANDARD'}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Live Hypothesis Audit Table section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Activity size={14} className="text-accent print:text-slate-800" />
                    <span className="text-[11px] font-mono uppercase tracking-[0.2em] font-semibold text-slate-300 print:text-slate-900">
                      Causal Falsifiability Master Ledger / 因果反省證偽主賬冊
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-900/20 print:border-slate-300">
                    <table className="w-full text-left font-mono text-[10px] border-collapse">
                      <thead>
                        <tr className="bg-slate-950/80 text-slate-400 uppercase border-b border-white/5 print:bg-slate-100 print:text-slate-800 print:border-slate-300">
                          <th className="p-3 font-semibold">HYP_ID / 假說編號</th>
                          <th className="p-3 font-semibold">INDICATOR / 檢測項</th>
                          <th className="p-3 font-semibold">DESCRIPTION / 因果假說詳細描述</th>
                          <th className="p-3 font-semibold text-right">STATUS / 現省狀態</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 print:divide-slate-200">
                        {data?.falsifiability_hypotheses && data.falsifiability_hypotheses.length > 0 ? (
                          data.falsifiability_hypotheses.map((h: any, hIdx: number) => {
                            const isFalsified = h.status === 'FALSIFIED';
                            return (
                              <tr key={hIdx} className="hover:bg-white/[0.01] print:text-slate-800 leading-snug">
                                <td className="p-3 text-emerald-400 font-bold font-mono print:text-emerald-700">{h.id}</td>
                                <td className="p-3 text-slate-400 print:text-slate-600">{h.indicator || 'entropy'} ({h.operator} {h.threshold})</td>
                                <td className="p-3 text-slate-200 print:text-slate-800">
                                  <div className="flex flex-col gap-0.5">
                                    <span className={cn(isFalsified ? "line-through opacity-50" : "")}>{h.description}</span>
                                    {isFalsified && (
                                      <span className="text-[8.5px] text-rose-400 font-mono italic print:text-rose-700">
                                        [已證偽: 高維空間投影中相似因果出現偏誤衰退]
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 text-right">
                                  <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[8.5px] font-bold",
                                    isFalsified ? "bg-rose-500/10 text-rose-400 print:bg-rose-100 print:text-rose-700" : "bg-emerald-500/10 text-emerald-400 print:bg-emerald-100 print:text-emerald-700"
                                  )}>
                                    {h.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-slate-500 italic">無相關證偽假說條款。</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sub-item: State Transitions & Safety Logs (Aggregates system changes) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Log Transitions */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <Clock size={13} className="text-accent print:text-slate-800" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 print:text-slate-700">
                        最近系統狀態躍遷日誌 (Recent Transitions)
                      </span>
                    </div>
                    
                    <div className="p-4 rounded-xl border border-white/5 bg-slate-900/30 max-h-56 overflow-y-auto custom-scrollbar space-y-2 font-mono text-[9.5px] text-slate-300 print:border-slate-300 print:bg-white print:text-slate-800">
                      {data?.logs && data.logs.length > 0 ? (
                        data.logs.slice(-8).reverse().map((log: any, idx: number) => (
                          <div key={idx} className="flex flex-col gap-1 pb-2 border-b border-white/[0.03] last:border-0">
                            <div className="flex justify-between text-[8px] text-slate-500">
                              <span className="font-bold text-accent uppercase">{log.type}</span>
                              <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="italic font-sans text-slate-200 print:text-slate-800">"{log.message}"</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-center italic py-4 opacity-50">無狀態變遷躍遷紀錄</p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Interventions audit list */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <AlertTriangle size={13} className="text-rose-400 print:text-rose-700" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 print:text-slate-700">
                        主動安全干涉警報紀錄 (Safety Alerts)
                      </span>
                    </div>

                    <div className="p-4 rounded-xl border border-white/5 bg-slate-900/30 max-h-56 overflow-y-auto custom-scrollbar space-y-2 font-mono text-[9.5px] text-slate-300 print:border-slate-300 print:bg-white print:text-slate-800">
                      {data?.safety_alerts && data.safety_alerts.length > 0 ? (
                        data.safety_alerts.slice(-8).reverse().map((alert: any, idx: number) => (
                          <div key={idx} className="flex flex-col gap-1 pb-2 border-b border-white/[0.03] last:border-0">
                            <div className="flex justify-between text-[8px]">
                              <span className="font-bold text-rose-400 uppercase">{alert.type}</span>
                              <span className="text-slate-500">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="italic font-sans text-slate-200 print:text-slate-800">"{alert.description}"</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-center italic py-4 opacity-50">未檢測到安全防禦安全干涉事件</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Sub-item: Signatures/Sign-off Blocks for Compliance */}
                <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-stretch gap-8 print:border-slate-400 print:pt-6">
                  
                  {/* Left: Certificate Signature Metas */}
                  <div className="flex flex-col gap-2 font-mono text-[10px] text-slate-400 print:text-slate-700 leading-relaxed max-w-md">
                    <div className="flex items-center gap-1.5 font-bold text-white print:text-slate-900 mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-accent print:text-slate-800" />
                      <span>COGNITIVE TRUST AUDITING ASSURANCE</span>
                    </div>
                    <p>
                      此合規性審計報告係根據 VEDA 核心認識論自律防護框架 V52 條款自動衍生與校核。
                      若任何認識論不協調或多租戶資訊溢出，主權心智系統將會即時記錄，
                      並通報本報告上載至特許高級架構師 duo027@gmail.com。
                    </p>
                  </div>

                  {/* Right: Signature Blocks for Printer PDF */}
                  <div className="flex gap-10 font-mono text-[9.5px] uppercase tracking-wider text-slate-400 print:text-slate-800 items-end shrink-0 select-none">
                    <div className="flex flex-col gap-12 items-center min-w-[140px] text-center">
                      <div className="border-b border-slate-600 print:border-slate-800 w-full pb-1 text-slate-300 font-display italic text-xs print:text-slate-900 font-medium">
                        duo027
                      </div>
                      <span className="text-[8.5px] text-slate-500">稽核負責人簽署</span>
                    </div>

                    <div className="flex flex-col gap-12 items-center min-w-[140px] text-center">
                      <div className="border-b border-slate-600 print:border-slate-800 w-full pb-1 text-emerald-400 font-mono text-[11px] print:text-emerald-700">
                        [ VERIFIED_SSA ]
                      </div>
                      <span className="text-[8.5px] text-slate-500">主權系統認證印鑑</span>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 italic">審計報告加載失敗。請點擊重新核對重試。</div>
            )}

          </div>

          {/* Footer controls - Hidden on Print */}
          <div className="p-4 border-t border-white/5 bg-slate-950/40 flex justify-end gap-3 select-none print:hidden">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              關閉窗口
            </button>
            <button
              onClick={handlePrint}
              disabled={!report || isLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-accent text-slate-950 text-xs font-bold font-mono hover:bg-white hover:text-slate-950 transition-all shadow-[0_0_12px_rgba(255,244,191,0.2)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4" />
              <span>列印 / 輸出 PDF</span>
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
