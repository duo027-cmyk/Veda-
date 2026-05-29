import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, 
  Download, 
  Activity, 
  ShieldCheck, 
  Zap, 
  User as UserIcon,
  ChevronRight,
  Upload,
  BookOpen,
  Copy,
  Check,
  Code
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useI18n } from '../i18n';
import { vedaService } from '../services/vedaService';
import { VedaCrystalLogo } from './VedaCrystalLogo';
import { ThoughtTrace } from './ThoughtTrace';
import { exportReportToPDF } from '../lib/reportUtils';
import { auth, db, isFirestoreQuotaExceeded, onQuotaChange } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ProfileManager } from './ProfileManager';
import { useVedaStore } from '../store/vedaStore';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';

const CodeBlock = ({ language, value }: { language: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 w-full">
      <div className="absolute right-2 top-2 z-10 flex gap-2">
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-2 py-1 bg-white/10 hover:bg-white/20 rounded-none border transition-all text-[10px] font-bold ${
            copied ? 'border-green-500/50 text-green-400' : 'border-white/20 text-white/50 hover:text-white'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              <span>COPIED</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>COPY</span>
            </>
          )}
        </button>
      </div>
      <div className="absolute left-4 top-2 z-10 flex items-center gap-2 opacity-40">
        <Code className="w-3 h-3 text-cyan-400" />
        <span className="text-[10px] uppercase tracking-widest font-mono text-cyan-400">{language || 'code'}</span>
      </div>
      <SyntaxHighlighter
        style={atomDark}
        language={language || 'text'}
        PreTag="div"
        className="rounded-none border border-white/10 !bg-black/40 !pt-10 !pb-4 !px-4 overflow-auto scrollbar-veda max-w-full text-xs"
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

interface Message {
  id?: string;
  ts?: number;
  role: 'user' | 'veda';
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  mode?: 'LOCAL' | 'HYBRID' | 'EXTERNAL';
  confidence?: number;
  trace?: any[];
  actions?: any[];
  isStreaming?: boolean;
}

export const ChatInterface = () => {
  const { t, lang, setLang } = useI18n();
  const { userData: data, fetchVedaData: onUpdateData, handleAction: onAction } = useVedaStore();
  const { isArchitect } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>(data?.chat_history || []);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(isFirestoreQuotaExceeded());
  const [userProfile, setUserProfile] = useState({ displayName: '', interests: '' });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return onQuotaChange((exceeded) => {
      setIsQuotaExceeded(exceeded);
    });
  }, []);

  // Fetch Profile Data from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user && !isQuotaExceeded) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfile({
              displayName: userData.displayName || userData.architectName || user.displayName || '',
              interests: userData.interests || ''
            });
          }
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
        }
      }
    };
    fetchProfile();
  }, [isQuotaExceeded]);

  const handleProfileUpdate = async () => {
    const user = auth.currentUser;
    if (user && !isQuotaExceeded) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile({
            displayName: userData.displayName || userData.architectName || user.displayName || '',
            interests: userData.interests || ''
          });
        }
      } catch (err) {
        console.error("Failed to sync profile after update:", err);
      }
    }
    await onUpdateData();
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input;
    setInput("");
    
    const userMsgObj: Message = { id: Math.random().toString(36).substring(7), role: 'user', text: userMsg, ts: Date.now() };
    const currentMessages = [...messages, userMsgObj];
    setMessages(currentMessages);
    setIsTyping(true);

    try {
      const history = currentMessages.map(m => ({
        role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model',
        text: m.text
      }));

      const assistantId = Math.random().toString(36).substring(7);
      setMessages(prev => [...prev, { 
        id: assistantId, 
        role: 'veda', 
        text: "", 
        ts: Date.now(), 
        isStreaming: true 
      }]);

      const stream = vedaService.chatStream(history, {
        global_coherence: data?.global_coherence,
        phi: data?.phi,
        status: data?.status
      }, { 
        name: userProfile.displayName || (isArchitect ? 'Architect' : 'User'), 
        interests: userProfile.interests 
      }, isArchitect);

      let fullText = "";
      for await (const chunk of stream) {
        if (chunk.text !== undefined || chunk.thought_trace) {
          if (chunk.text !== undefined) fullText = chunk.text;
          setMessages(prev => {
            return prev.map(m => {
              if (m.id === assistantId) {
                return {
                  ...m,
                  text: fullText,
                  imageUrl: chunk.imageUrl || m.imageUrl,
                  videoUrl: chunk.videoUrl || m.videoUrl,
                  audioUrl: chunk.audioUrl || m.audioUrl,
                  mode: chunk.reasoning_mode || m.mode,
                  confidence: chunk.sovereign_confidence !== undefined ? chunk.sovereign_confidence : m.confidence,
                  trace: chunk.thought_trace || m.trace,
                  actions: chunk.actions || m.actions
                };
              }
              return m;
            });
          });
        }
        if (chunk.isDone) {
          setMessages(prev => {
             return prev.map(m => m.id === assistantId ? { ...m, isStreaming: false } : m);
          });
        }
      }
      await onUpdateData();
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'veda', text: "ERROR: Epistemic link severed. 系統連結中斷。" }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (data?.chat_history && messages.length === 0) {
      setMessages(data.chat_history);
    }
  }, [data?.chat_history]);

  const clearMessages = async () => {
    try {
      await vedaService.postAction({ action: 'clearChatHistory', params: {} });
      setMessages([]);
      await onUpdateData();
    } catch (e) {
       console.error(e);
    }
  };

  const handleActionApproval = async (msgIdx: number, actions: any[]) => {
    try {
      await vedaService.postAction({ action: 'approveActions', params: { actions } });
      setMessages(prev => {
        const next = [...prev];
        next[msgIdx] = { ...next[msgIdx], actions: [{ type: 'ACTION_RESULTS' }] };
        return next;
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-full flex flex-col pt-24 md:pt-32 pb-24 md:pb-8 px-4 md:px-6 lg:px-32 max-w-6xl mx-auto relative">
      <div className="absolute top-8 right-8 z-[1001] flex gap-2">
         {auth.currentUser && (
           <button 
             onClick={() => setShowProfile(!showProfile)}
             className={cn(
               "px-3 py-1 flex items-center gap-2 text-[9px] font-mono border transition-all",
               showProfile ? "bg-accent/20 text-accent border-accent/40 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]" : "text-ink opacity-40 border-border-subtle hover:text-ink hover:opacity-100"
             )}
             title="USER PROFILE"
           >
             <UserIcon size={12} />
             <span className="hidden sm:inline">PROFILE</span>
           </button>
         )}
         <button 
           onClick={() => setLang('zh-TW')}
           className={cn(
             "px-2 py-1 text-[8px] font-mono border transition-all",
             lang === 'zh-TW' ? "bg-accent text-white border-accent" : "text-ink opacity-40 border-border-subtle hover:text-ink hover:opacity-100"
           )}
         >
           ZH-TW
         </button>
         <button 
           onClick={() => setLang('en-US')}
           className={cn(
             "px-2 py-1 text-[8px] font-mono border transition-all",
             lang === 'en-US' ? "bg-accent text-white border-accent" : "text-ink opacity-40 border-border-subtle hover:text-ink hover:opacity-100"
           )}
         >
           EN-US
         </button>
      </div>
      {messages.length > 0 && (
         <motion.button
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           onClick={clearMessages}
           className="absolute top-28 md:top-36 right-8 md:right-12 z-50 p-2 bg-red-500/5 border border-red-500/20 rounded-full text-red-500 opacity-60 hover:opacity-100 transition-all flex items-center gap-2 px-3 shadow-xl backdrop-blur-md group"
           title={t.purge_history}
         >
           <Trash2 size={12} className="group-hover:rotate-12 transition-transform" />
           <span className="text-[9px] font-mono tracking-widest hidden md:inline">{t.purge_history}</span>
         </motion.button>
      )}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-2 md:pr-4 space-y-8 scrollbar-none pb-20 chat-container"
      >
        <ProfileManager 
          isOpen={showProfile} 
          onClose={() => setShowProfile(false)} 
          onUpdate={handleProfileUpdate}
          architectName={userProfile.displayName}
        />

        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center gap-6 italic opacity-10 text-ink"
            >
               <VedaCrystalLogo size={60} className="translate-y-12" />
               <p className="tracking-[0.8em] font-serif uppercase text-[10px] mt-12">Neural Manifold Isolated</p>
            </motion.div>
          )}
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id || `${msg.role}-${msg.ts || idx}`}
              className={cn(
                "flex flex-col gap-2",
                msg.role === 'user' ? "items-end" : "items-start"
              )}
            >
               <div className={cn(
                 "message-bubble",
                 msg.role === 'user' ? "user-bubble" : "ai-bubble"
               )}>
                  <div className="markdown-body">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath, remarkGfm]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline ? (
                            <CodeBlock 
                              language={match ? match[1] : ''} 
                              value={String(children).replace(/\n$/, '')} 
                            />
                          ) : (
                            <code className={`${className} bg-white/10 px-1.5 py-0.5 rounded-none text-cyan-300 border border-white/5 font-mono text-[11px]`} {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {msg.text || ""}
                    </ReactMarkdown>
                    {msg.role === 'veda' && isTyping && idx === messages.length -1 && !msg.text && (
                       <motion.span 
                         animate={{ opacity: [0, 1, 0] }}
                         transition={{ duration: 1, repeat: Infinity }}
                         className="inline-block w-1.5 h-4 ml-1 bg-accent/40" 
                       />
                    )}
                  </div>
                  
                  {msg.imageUrl && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-4 rounded-lg overflow-hidden border border-border-subtle relative group"
                    >
                      <img src={msg.imageUrl} alt="VEDA Vision" className="w-full object-cover" referrerPolicy="no-referrer" />
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = msg.imageUrl!;
                          link.download = `VEDA_VISUAL_${Date.now()}.png`;
                          link.click();
                        }}
                        className="absolute top-2 right-2 p-2 bg-panel backdrop-blur-md text-ink rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent hover:text-white shadow-lg"
                      >
                         <Download size={14} />
                      </button>
                    </motion.div>
                  )}
                  
                  {msg.videoUrl && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-4 rounded-lg overflow-hidden border border-border-subtle relative group"
                    >
                      <div className="relative w-full">
                        <video src={msg.videoUrl} controls className="w-full" />
                        <div className="absolute bottom-12 right-4 flex items-center gap-1.5 opacity-30 select-none pointer-events-none group-hover:opacity-60 transition-opacity duration-700 z-10">
                           <div className="w-3 h-3 border-r border-b border-accent" />
                           <div className="flex flex-col items-end gap-0.5">
                             <span className="text-[6px] font-mono text-accent leading-none tracking-[0.2em]">VEDA_SYNTHESIS</span>
                             <span className="text-[5px] font-mono text-ink opacity-60 leading-none">NEURAL_BLOCK_SIGNED</span>
                           </div>
                        </div>
                      </div>
                      <button 
                         onClick={() => {
                           const link = document.createElement('a');
                           link.href = msg.videoUrl!;
                           link.download = `VEDA_VIDEO_${Date.now()}.mp4`;
                           link.click();
                         }}
                         className="absolute top-2 right-2 p-2 bg-panel backdrop-blur-md text-ink rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent hover:text-white z-10"
                      >
                         <Download size={14} />
                      </button>
                    </motion.div>
                  )}

                  {msg.audioUrl && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-accent/5 border border-accent/20 rounded-lg flex items-center gap-3 shadow-sm"
                    >
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white shadow-lg">
                        <Activity size={14} className="animate-pulse" />
                      </div>
                      <audio src={msg.audioUrl} controls className="flex-1 h-8 opacity-80" />
                    </motion.div>
                  )}

                  {/* Strategic Report Integration */}
                  {(msg.text?.includes("REPORT_") || msg.actions?.some(a => a.name === 'initiateStrategicReport' || a.name === 'ACTION_RESULTS')) && data?.strategic_reports && data.strategic_reports.length > 0 && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="mt-4 p-6 bg-accent-soft border border-accent/20 rounded-xl flex flex-col gap-4 shadow-xl"
                   >
                      <div className="flex items-center gap-3">
                         <BookOpen size={18} className="text-accent" />
                         <span className="text-xs font-display tracking-widest uppercase text-accent">Strategic Matrix Detected</span>
                      </div>
                      <div className="space-y-4">
                         {data.strategic_reports.slice(-1).map(report => (
                            <div key={report.id} className="flex flex-col gap-4">
                               <div className="flex justify-between items-end">
                                  <div className="flex flex-col">
                                     <span className="text-[10px] font-mono opacity-40 uppercase tracking-tighter text-ink">Document Title</span>
                                     <span className="text-sm font-bold tracking-wide text-ink">{report.title}</span>
                                  </div>
                                  <span className="text-[10px] font-mono text-accent">{report.progress.toFixed(0)}%</span>
                               </div>
                               <button 
                                 onClick={() => exportReportToPDF(report)}
                                 className="w-full py-3 bg-accent/10 border border-accent/30 text-accent text-[9px] font-bold tracking-[0.3em] uppercase hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-3 shadow-sm"
                               >
                                 <Download size={14} />
                                 Download Strategic PDF
                               </button>
                            </div>
                         ))}
                      </div>
                   </motion.div>
                )}
               </div>

               {msg.role === 'veda' && (
                 <div className="px-6 flex items-center gap-6 mt-1 opacity-40">
                    {msg.mode && (
                       <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-1 h-1 rounded-full",
                            msg.mode === 'LOCAL' ? "bg-gold shadow-[0_0_5px_#fbbf24]" : "bg-ink/20"
                          )} />
                          <span className="text-[7px] tracking-[0.3em] font-display text-ink uppercase">
                            {msg.mode} ENGINE
                          </span>
                       </div>
                    )}
                    {msg.confidence !== undefined && (
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-[2px] bg-ink/5 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${msg.confidence * 100}%` }}
                             className="h-full bg-accent/60"
                           />
                        </div>
                        <span className="text-[7px] font-mono tracking-widest text-ink italic">CON_LEVEL: {(msg.confidence * 100).toFixed(0)}%</span>
                      </div>
                    )}
                 </div>
               )}

               {msg.role === 'veda' && msg.actions?.map((action, actionIdx) => (
                  <div key={actionIdx} className="w-full max-w-lg px-6">
                     {action.type === 'CONSENT_REQUIRED' && (
                        <div className="mt-4 p-4 ghibli-glass border border-accent/20 rounded-xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                           <div className="flex items-center gap-3">
                              <ShieldCheck size={16} className="text-accent" />
                              <span className="text-[10px] font-mono text-accent uppercase tracking-widest">{t.auth_request}</span>
                           </div>
                           <div className="flex flex-col gap-2">
                              {action.actions.map((a: any, i: number) => (
                                 <div key={i} className="text-[9px] font-mono text-ink opacity-60 bg-ink/5 p-2 rounded">
                                    <span className="text-accent">{t.cmd}</span> {a.name}
                                 </div>
                              ))}
                           </div>
                           <div className="flex gap-4">
                              <button 
                                onClick={() => handleActionApproval(idx, action.actions)}
                                className="flex-1 py-1.5 bg-accent/20 border border-accent/40 text-accent text-[10px] font-mono hover:bg-accent hover:text-white transition-all uppercase tracking-widest"
                              >
                                APPROVE_PROCEED
                              </button>
                              <button 
                                onClick={() => {
                                  setMessages(prev => {
                                     const next = [...prev];
                                     next[idx] = { ...next[idx], actions: [] };
                                     return next;
                                  });
                                }}
                                className="px-4 py-1.5 border border-border-subtle text-ink opacity-40 text-[10px] font-mono hover:border-red-400 hover:text-red-400 transition-all uppercase"
                              >
                                REJECT
                              </button>
                           </div>
                        </div>
                     )}
                     {action.type === 'ACTION_RESULTS' && (
                        <div className="mt-4 p-3 bg-green-500/5 border border-green-500/20 rounded-lg flex items-center gap-3">
                           <Zap size={14} className="text-green-400" />
                           <span className="text-[9px] font-mono text-green-400/60 uppercase">{t.success_msg}</span>
                        </div>
                      )}
                   </div>
                ))}

              {msg.role === 'veda' && msg.trace && (idx === messages.length - 1 || msg.text) && (
                <ThoughtTrace trace={msg.trace} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

       <div className="mt-8 group relative max-w-4xl mx-auto w-full">
        {data?.reasoning_mode === 'LOCAL' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-8 left-6 flex items-center gap-2"
          >
             <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
             <span className="text-[9px] font-display text-gold uppercase tracking-[0.2em] italic">Extrapolating from Core Axioms...</span>
          </motion.div>
        )}
        <div className="ghibli-glass border border-border-subtle rounded-[2rem] p-2 shadow-2xl transition-all duration-1000 focus-within:border-accent/40 bg-panel">
            <div className="flex items-center px-4">
                 <label className="p-3 text-ink opacity-20 hover:text-accent hover:opacity-100 cursor-pointer transition-all">
                    <Upload size={20} strokeWidth={1.5} />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*,video/*,audio/*,text/*,application/pdf,.json,.md"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          const isImage = file.type.startsWith('image/');
                          const isVideo = file.type.startsWith('video/');
                          const isAudio = file.type.startsWith('audio/');
                          const isText = file.type.startsWith('text/') || 
                                         file.name.endsWith('.md') || 
                                         file.name.endsWith('.json') ||
                                         file.name.endsWith('.csv');
                          const isPDF = file.type === 'application/pdf';

                          reader.onload = async (event) => {
                            const result = event.target?.result as string;
                            if (isImage || isVideo || isAudio) {
                              const type = isImage ? 'IMAGE' : isVideo ? 'VIDEO' : 'AUDIO';
                              await onAction('registerVisualAsset', { type, url: result, prompt: `Manual upload: ${file.name}` });
                              setMessages(prev => [...prev, { role: 'veda', text: `[SYSTEM_SYNC] 已接收媒體資產：${file.name}。` }]);
                            } else if (isText) {
                              setIsTyping(true);
                              await onAction('learnFragment', { content: result, type: 'DOCUMENT' });
                              
                              // V-AA Core: Trigger actual analysis instead of static message
                              try {
                                const response = await vedaService.postAction({ 
                                  action: 'generateSovereignResponse', 
                                  params: { text: `[DOC_ANALYSIS_REQUEST]: 我剛剛上傳了一個文件「${file.name}」。請針對該文件的內容提供一個簡短的摘要與認識論研判。` } 
                                });
                                if (response.data?.response) {
                                  setMessages(prev => [...prev, { 
                                    role: 'veda', 
                                    text: response.data.response,
                                    mode: response.data.reasoning_mode,
                                    confidence: response.data.confidence
                                  }]);
                                }
                              } catch (err) {
                                console.error("Auto-analysis failed", err);
                                setMessages(prev => [...prev, { role: 'veda', text: `[EPISTEMIC_INGESTION] 已攝取數據片段：${file.name}。內容已整合至主權知識庫。` }]);
                              } finally {
                                setIsTyping(false);
                              }
                            } else if (isPDF) {
                              setMessages(prev => [...prev, { role: 'veda', text: `[PROTOCOL_RESTRICTION] 目前版本尚不支援直接解析 PDF 文本。請嘗試上傳 .txt 或 .md 格式的資料。` }]);
                            } else {
                              setMessages(prev => [...prev, { role: 'veda', text: `[PROTOCOL_ERROR] 不支援的文件格式：${file.name}。` }]);
                            }
                            await onUpdateData();
                          };

                          if (isImage || isVideo || isAudio) {
                            reader.readAsDataURL(file);
                          } else if (isText) {
                            reader.readAsText(file);
                          } else {
                            // For unsupported types, we still invoke reader to trigger onload handler for error msg
                            reader.readAsText(new Blob()); 
                          }
                        }
                      }}
                    />
                 </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Whisper to the core..."
                  className="flex-1 bg-transparent border-none p-4 text-base md:text-lg font-sans outline-none resize-none h-14 md:h-20 scrollbar-none placeholder:text-ink placeholder:opacity-20 text-ink opacity-90"
                />
                <button
                   onClick={sendMessage}
                   disabled={!input.trim() || isTyping}
                   className="p-4 text-accent/40 hover:text-accent transition-all disabled:opacity-0 active:scale-95"
                >
                   <ChevronRight size={28} strokeWidth={1} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
