import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  X, 
  Terminal, 
  Brain, 
  Sparkles, 
  Globe, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  Paperclip, 
  Mic,
  MicOff,
  Image as ImageIcon, 
  Copy, 
  Check, 
  Code, 
  Bell, 
  Calendar,
  Trash2,
  CheckCircle2,
  Clock,
  Pin,
  PinOff,
  Download,
  Music,
  Zap,
  Shield,
  ShieldCheck,
  Plus,
  BrainCircuit,
  MessageSquare,
  Repeat
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { vedaService } from '../services/vedaService';
import { speechService } from '../services/speechService';
import { Reminder, GroundingSource } from '../types';
import { FFLabel } from './FFLabel';
import { cn } from '../lib/utils';
import { User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, isFirestoreQuotaExceeded, onQuotaChange, setFirestoreQuotaExceeded } from '../lib/firebase';

interface Message {
  id: string;
  role: 'user' | 'veda' | 'thought';
  text: string;
  timestamp: string;
  sources?: GroundingSource[];
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  userImage?: string;
  pinned?: boolean;
  suggestions?: string[];
  isStreaming?: boolean;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  rejectionCount: number;
  isFocusMode: boolean;
  isLocked: boolean;
  memory: string;
  reminders: Reminder[];
  sensorData: any;
  onMemoryUpdate: (newMemory: string) => void;
  onRemindersUpdate: (newReminders: Reminder[]) => void;
  onTriggerReject: () => void;
  layers?: { id: string; name: string; coherence: number }[];
  global_coherence?: number;
  user: User | null;
  isDreaming?: boolean;
  loading?: boolean;
  isLocalMode?: boolean;
  weather?: {
    temp: number;
    condition: string;
    location: string;
    humidity: number;
    wind: number;
  } | null;
}

const CodeBlock = ({ language, value }: { language: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      <div className="absolute right-2 top-2 z-10 flex gap-2">
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-2 py-1 bg-white/10 hover:bg-white/20 rounded-none border transition-all text-[10px] font-bold ff-font ${
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
        <Code className="w-3 h-3" />
        <span className="text-[10px] uppercase tracking-widest font-mono">{language || 'code'}</span>
      </div>
      <SyntaxHighlighter
        style={atomDark}
        language={language || 'text'}
        PreTag="div"
        className="rounded-none border border-white/10 !bg-black/40 !pt-10 !pb-4 !px-4 scrollbar-veda"
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

import { knbService } from '../services/knbService';

import { useI18n } from '../i18n';

export const ChatPanel: React.FC<ChatPanelProps> = React.memo(({ 
  isOpen, 
  onClose, 
  rejectionCount, 
  isFocusMode,
  isLocked,
  memory,
  reminders,
  sensorData,
  onMemoryUpdate,
  onRemindersUpdate,
  onTriggerReject,
  layers,
  global_coherence,
  user,
  isDreaming,
  loading,
  isLocalMode = false,
  weather
}) => {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(isFirestoreQuotaExceeded());
  const [input, setInput] = useState('');
  const [frictionWarning, setFrictionWarning] = useState<string | null>(null);
  const [isFrictionBypassed, setIsFrictionBypassed] = useState(false);
  const [architectName, setArchitectName] = useState('');
  const [interests, setInterests] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  // Subscribe to global quota changes
  useEffect(() => {
    return onQuotaChange((exceeded) => {
      setIsQuotaExceeded(exceeded);
    });
  }, []);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [useHighQualityVoice, setUseHighQualityVoice] = useState(true);
  const [usingSpeechFallback, setUsingSpeechFallback] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showReminders, setShowReminders] = useState(false);
  const [showPinned, setShowPinned] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLedger, setShowLedger] = useState(false);
  const [distillationHistory, setDistillationHistory] = useState<any[]>([]);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);
  const [reminderFilter, setReminderFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [reminderSort, setReminderSort] = useState<'DATE_ASC' | 'DATE_DESC'>('DATE_ASC');

  const suggestions = [
    t.suggestions_greeting + t.suggestions_what_can_you_do,
    t.suggestions_burst_node,
  ];

  const handlePin = useCallback((id: string) => {
    setMessages(prev => {
      const next = prev.map(msg => 
        msg.id === id ? { ...msg, pinned: !msg.pinned } : msg
      );
      return next;
    });
  }, []);

  const handleDeleteMessage = useCallback(async (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    // Optional: Notify server to remove from memory if needed
    try {
      await vedaService.postAction({ action: "handleChatMessage", params: { text: `DELETE_MSG:${id}`, role: 'system_command' } });
    } catch (e) {
      console.warn("Server-side node removal acknowledgment failed, but UI updated.");
    }
  }, []);

  const handleEditMessage = (id: string, text: string) => {
    setEditingMsgId(id);
    setEditInput(text);
  };

  const handleSaveEdit = async () => {
    if (!editingMsgId) return;
    const msgToEdit = messages.find(m => m.id === editingMsgId);
    if (!msgToEdit) return;

    setMessages(prev => prev.map(m => 
      m.id === editingMsgId ? { ...m, text: editInput } : m
    ));

    // If it's a user message, we might want to re-generate the assistant's response
    if (msgToEdit.role === 'user') {
       // Logic to potentially re-trigger assistant could go here, 
       // but for now we just update the text.
    }

    setEditingMsgId(null);
    setEditInput('');
  };

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle auto-scroll logic
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsAutoScrolling(isAtBottom);
  };

  // Helper to prune chat history for Firestore (1MB limit)
  const pruneMessagesForStorage = (msgs: Message[]): Message[] => {
    // Keep all pinned messages, plus the last 20 messages
    const pinned = msgs.filter(m => m.pinned);
    const recent = msgs.slice(-20);
    
    // Merge and remove duplicates
    const combined = [...pinned, ...recent];
    const uniqueMap = new Map();
    combined.forEach(m => uniqueMap.set(m.id, m));
    const unique = Array.from(uniqueMap.values());
    
    // Sort by timestamp
    unique.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return unique.map((m, idx, arr) => {
      // For messages older than the last 5, remove heavy base64 images
      const isRecent = idx >= arr.length - 5;
      if (!isRecent && m.userImage && m.userImage.startsWith('data:')) {
        return { 
          ...m, 
          userImage: undefined, 
          text: m.text + "\n\n*(影像數據已歸檔以節省空間)*" 
        };
      }
      return m;
    }).slice(-50); // Hard cap at 50 messages for Firestore
  };

  const handleSpeak = useCallback(async (text: string) => {
    if (isMuted) return;
    await speechService.speak(text, !useHighQualityVoice);
    setUsingSpeechFallback(speechService.isUsingFallback);
  }, [isMuted, useHighQualityVoice]);

  useEffect(() => {
    const init = async () => {
      try {
        let chatHistory: Message[] = [];
        let settings: any = {};

        if (user && !isQuotaExceeded) {
          // Fetch from Firestore
          const { getDoc, doc } = await import('firebase/firestore');
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            chatHistory = data.chatHistory || [];
            settings = data.settings || {};
            setArchitectName(data.architectName || '');
            setInterests(data.interests || '');
          }
        } else {
          // Fallback to server persistence
          console.log(`[VEDA_CHAT] Loading from local fallback (User: ${!!user}, QuotaExceeded: ${isQuotaExceeded})`);
          const p = await vedaService.getPersistence();
          chatHistory = p.chatHistory || [];
          settings = p.settings || {};
          setArchitectName(p.architectName || '');
          setInterests(p.interests || '');
        }

        if (chatHistory.length > 0) {
          setMessages(chatHistory);
        } else {
          setMessages([
            { 
              id: 'initial',
              role: 'veda', 
              text: "系統已就緒。全球知識庫與即時數據已同步。請輸入您的指令或問題。", 
              timestamp: new Date().toLocaleTimeString() 
            }
          ]);
        }
        
        setIsMuted(settings.isMuted ?? false);
        setUseHighQualityVoice(settings.useHighQualityVoice ?? true);
        setShowSuggestions(settings.showSuggestions ?? true);
      } catch (err) {
        console.error("Failed to load chat persistence:", err);
      }
    };
    init();
  }, [user]);

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        const pruned = pruneMessagesForStorage(messages);
        if (user && !isQuotaExceeded && !isFirestoreQuotaExceeded()) {
          updateDoc(doc(db, 'users', user.uid), { chatHistory: pruned })
            .catch(err => {
              if (err.code === 'resource-exhausted') {
                setFirestoreQuotaExceeded(true);
              } else {
                handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/chatHistory`);
              }
            });
        } else {
          vedaService.updatePersistence({ chatHistory: pruned });
        }
      }, 10000); // 10s debounce
      return () => clearTimeout(timer);
    }
  }, [messages, user, isQuotaExceeded]);

  useEffect(() => {
    const settings = { isMuted, useHighQualityVoice, showSuggestions };
    const timer = setTimeout(() => {
      if (user && !isQuotaExceeded && !isFirestoreQuotaExceeded()) {
        updateDoc(doc(db, 'users', user.uid), { settings })
          .catch(err => {
            if (err.code === 'resource-exhausted') {
              setFirestoreQuotaExceeded(true);
            } else {
              handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/settings`);
            }
          });
      } else {
        vedaService.updatePersistence({ settings });
      }
    }, 10000); // 10s debounce
    return () => clearTimeout(timer);
  }, [isMuted, useHighQualityVoice, showSuggestions, user, isQuotaExceeded]);

  useEffect(() => {
    const dataToUpdate = { architectName, interests };
    if (!architectName && !interests) return; // Skip initial empty
    
    const timer = setTimeout(() => {
      if (user && !isQuotaExceeded && !isFirestoreQuotaExceeded()) {
        updateDoc(doc(db, 'users', user.uid), dataToUpdate)
          .catch(err => {
            if (err.code !== 'resource-exhausted') {
              handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/profile`);
            }
          });
      } else {
        vedaService.updatePersistence(dataToUpdate);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [architectName, interests, user, isQuotaExceeded]);

  useEffect(() => {
    if (scrollRef.current && isAutoScrolling) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: isTyping ? 'auto' : 'smooth'
      });
    }
  }, [messages, isTyping, isAutoScrolling]);

  // Listen for proactive reminders from App.tsx
  useEffect(() => {
    const handleProactive = (e: any) => {
      const { tasks } = e.detail;
      const proactiveMsg: Message = {
        id: `proactive-${Date.now()}`,
        role: 'veda',
        text: `提醒：您設定的任務「${tasks.join('、')}」時間已到。`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, proactiveMsg]);
      handleSpeak(proactiveMsg.text);
    };

    window.addEventListener('veda_proactive_reminder', handleProactive);
    
    return () => {
      window.removeEventListener('veda_proactive_reminder', handleProactive);
    };
  }, [isMuted]);

  const handleVoiceInput = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
      return;
    }

    const rec = speechService.listen(
      (text) => {
        setInput(text);
      },
      () => {
        setIsListening(false);
        setRecognition(null);
      },
      (error) => {
        console.error("Speech recognition error:", error);
        setIsListening(false);
        setRecognition(null);
      }
    );

    if (rec) {
      setRecognition(rec);
      setIsListening(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (((!textToSend || !textToSend.trim()) && !selectedImage) || isTyping || loading || isDreaming) return;

    // Active Inference: Knowledge Friction Check
    if (!isFrictionBypassed) {
       const friction = await knbService.detectContradictions(textToSend);
       if (friction.exists) {
         setFrictionWarning(friction.reason || "Logical friction detected.");
         return; // Halt submission
       }
    }

    setIsFrictionBypassed(false); // Reset for next turn
    setFrictionWarning(null);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend || (selectedImage ? "分析此圖片" : ""),
      timestamp: new Date().toLocaleTimeString(),
      userImage: selectedImage || null
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null);
    setIsTyping(true);
    speechService.stop(); // Stop any ongoing speech when sending new message

    try {
      const history = messages
        .filter(m => m.role !== 'thought')
        .concat(userMsg)
        .map(m => ({
          role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model',
          text: m.text,
          image: m.userImage
        }));

      const assistantMsgId = `veda-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'veda',
        text: "",
        timestamp: new Date().toLocaleTimeString(),
        isStreaming: true
      }]);

      const stream = isLocalMode 
        ? vedaService.chatLocalStream(history.map(h => ({ role: h.role, text: h.text })), 'gemma2')
        : vedaService.chatStream(history, {
            rejection_count: rejectionCount,
            isFocusMode,
            isLocked,
            global_coherence,
            reminders,
            sensorData,
            weather
          }, { name: architectName, interests });

      let finalResult: any = null;
      let lastSpokenIndex = 0;

      for await (const chunk of stream) {
        if (chunk.text !== undefined) {
          const fullText = chunk.text || "";
          setMessages(prev => prev.map(m => 
            m.id === assistantMsgId ? { ...m, text: fullText } : m
          ));

          // Streaming Speech: Speak completed sentences
          if (!isMuted) {
            let remainingText = fullText.substring(lastSpokenIndex);
            // Split on Chinese punctuation OR English punctuation followed by a space or end of string
            let match = remainingText.match(/[。！？\n]|(?<=[.!?])\s/);
            while (match && match.index !== undefined) {
              const endIdx = match.index + (match[0].length);
              const textToSpeak = remainingText.substring(0, endIdx)?.trim() || "";
              if (textToSpeak) {
                const cleanText = textToSpeak.replace(/\[.*?\]/g, '')?.trim() || "";
                if (cleanText) {
                  handleSpeak(cleanText);
                }
              }
              lastSpokenIndex += endIdx;
              remainingText = fullText.substring(lastSpokenIndex);
              match = remainingText.match(/[。！？\n]/);
            }
          }
        }
        if (chunk.isDone) {
          finalResult = chunk;
        }
      }

      if (!finalResult || (!finalResult.text && (!finalResult.actions || finalResult.actions.length === 0))) {
        setMessages(prev => prev.map(m => 
          m.id === assistantMsgId ? { 
            ...m, 
            text: "系統響應為空。可能存在邏輯斷層或 API 限制。請重新輸入指令。",
            isStreaming: false 
          } : m
        ));
        return;
      }

      if (finalResult) {
        let cleanText = finalResult.text;
        
        // Speak remaining text
        const remainingText = (cleanText?.substring(lastSpokenIndex) || "").trim();
        if (remainingText && !isMuted) {
          const cleanRemaining = remainingText.replace(/\[.*?\]/g, '')?.trim() || "";
          if (cleanRemaining) {
            handleSpeak(cleanRemaining);
          }
        }
        
        // Handle Memory Update
        const memoryMatch = cleanText.match(/\[MEMORY_UPDATE:\s*(.*?)\]/);
        if (memoryMatch) {
          onMemoryUpdate(memoryMatch[1]);
          cleanText = cleanText.replace(/\[MEMORY_UPDATE:\s*.*?\]/g, '')?.trim() || "";
        }

        // Handle Set Reminder (Legacy Regex support)
        const reminderMatch = cleanText.match(/\[SET_REMINDER:\s*(.*?)\]/);
        if (reminderMatch) {
          try {
            const reminderData = JSON.parse(reminderMatch[1]);
            const newReminder: Reminder = {
              id: reminderData.id || Math.random().toString(36).substr(2, 9),
              task: reminderData.task,
              time: reminderData.time,
              completed: false
            };
            onRemindersUpdate([...reminders, newReminder]);
            cleanText = cleanText.replace(/\[SET_REMINDER:\s*.*?\]/g, '')?.trim() || "";
            cleanText += `\n\n*(系統已為您設定提醒：${newReminder.task}，時間：${new Date(newReminder.time).toLocaleString()}。)*`;
          } catch (e) {
            console.error("Failed to parse reminder data", e);
          }
        }

        // Handle Tool Actions
        if (finalResult.actions && finalResult.actions.length > 0) {
          finalResult.actions.forEach((action: any) => {
            if (action.type === 'SET_REMINDER') {
              const { task, time } = action.data;
              const newReminder: Reminder = {
                id: Math.random().toString(36).substr(2, 9),
                task,
                time,
                completed: false
              };
              onRemindersUpdate([...reminders, newReminder]);
              cleanText += `\n\n*(系統已執行工具：設定提醒 - ${task})*`;
            } else if (action.type === 'SYSTEM_ACTION') {
              cleanText += `\n\n*(系統已執行核心操作：${action.name})*`;
            } else if (action.type === 'MEMORY_UPDATE') {
              cleanText += `\n\n*(系統已同步長期記憶)*`;
            }
          });
        }

        setMessages(prev => prev.map(m => 
          m.id === assistantMsgId ? { 
            ...m, 
            text: cleanText,
            sources: finalResult.sources || null,
            imageUrl: finalResult.imageUrl || null,
            suggestions: finalResult.suggestions || null,
            isStreaming: false 
          } : m
        ));
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'veda',
        text: "系統處理異常，請檢查日誌或重試。",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = async () => {
    try {
      // 1. Reset Server-side Brain logic (Context & History)
      const res = await vedaService.postAction({ action: 'clearChatHistory', params: {} });
      if (res.error) throw new Error(res.error);
      
      // 2. Clear Firestore / Persistence
      if (user && !isQuotaExceeded) {
        await updateDoc(doc(db, 'users', user.uid), { chatHistory: [] });
      } else {
        await vedaService.updatePersistence({ chatHistory: [] });
      }

      // 3. Update Local UI
      setMessages([{ 
        id: 'reset',
        role: 'veda', 
        text: t.system_crystallized || "認識論已重置。當前因果鏈已清零，系統回歸初始狀態。", 
        timestamp: new Date().toLocaleTimeString() 
      }]);
      setShowClearConfirm(false);
      console.log("[VEDA_RESET] Causal chain purged successfully.");
    } catch (err) {
      console.error("[VEDA_RESET] Failed to purge epistemic state:", err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8 bg-black/40 backdrop-blur-md"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl h-[90vh] md:h-[650px] ff-panel bg-[#222] shadow-[0_0_120px_rgba(34,211,238,0.2)] rounded-none flex flex-col cursor-default overflow-hidden relative border border-white/30"
          >
            {/* Holographic Edge Glow */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent z-50 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent z-50 pointer-events-none" />

            {/* Header */}
            <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3 md:gap-6">
                <div className="relative">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        `0 0 15px ${rejectionCount > 7 ? '#ef4444' : rejectionCount > 4 ? '#f97316' : '#00d2ff'}30`,
                        `0 0 35px ${rejectionCount > 7 ? '#ef4444' : rejectionCount > 4 ? '#f97316' : '#00d2ff'}60`,
                        `0 0 15px ${rejectionCount > 7 ? '#ef4444' : rejectionCount > 4 ? '#f97316' : '#00d2ff'}30`
                      ]
                    }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-none flex items-center justify-center border ${
                      rejectionCount > 7 ? 'bg-red-500/10 border-red-500/50' : 
                      rejectionCount > 4 ? 'bg-orange-500/10 border-orange-500/50' : 
                      'bg-cyan-500/10 border-cyan-400/50'
                    }`}
                  >
                    <Brain className={`w-5 h-5 md:w-6 md:h-6 ${
                      rejectionCount > 7 ? 'text-red-500' : 
                      rejectionCount > 4 ? 'text-orange-500' : 
                      'text-cyan-400'
                    }`} />
                  </motion.div>
                  <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 rounded-none border border-black ${
                    rejectionCount > 7 ? 'bg-red-500 animate-pulse' : 
                    rejectionCount > 4 ? 'bg-orange-500' : 'bg-cyan-400'
                  }`} />
                </div>
                <FFLabel 
                  main="VEDA SOVEREIGN LINK" 
                  sub={rejectionCount > 7 ? 'STATUS: CRITICAL' : rejectionCount > 4 ? 'STATUS: FLUCTUATION' : 'STATUS: OPTIMIZED'} 
                  className="items-start scale-90 md:scale-100 origin-left"
                />
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-1 md:gap-2">
                  <button 
                    onClick={async () => {
                      const res = await vedaService.postAction({ action: 'performAudit', params: {} });
                      if (res && res.data) {
                        setAuditResult(res.data);
                        setShowAuditModal(true);
                      }
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 bg-accent/5 hover:bg-accent/10 text-accent/40 hover:text-accent rounded-none transition-all border border-accent/10 hover:border-accent/30"
                    title="SYSTEM AUDIT"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="text-[9px] font-bold tracking-[0.2em] ff-font hidden sm:inline">AUDIT</span>
                  </button>
                  <button 
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 bg-red-500/5 hover:bg-red-500/10 text-red-500/40 hover:text-red-500 rounded-none transition-all border border-red-500/10 hover:border-red-500/30"
                    title="CLEAR CHAT"
                  >
                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="text-[9px] font-bold tracking-[0.2em] ff-font hidden sm:inline">CLEAR</span>
                  </button>
                  <button 
                    onClick={() => setShowProfile(!showProfile)}
                    className={`p-1.5 md:p-2 rounded-none transition-all border ${showProfile ? 'bg-purple-500/20 text-purple-500 border-purple-500/50' : 'bg-white/5 text-white/30 border-white/5 hover:text-white/70'}`}
                    title="ARCHITECT PROFILE"
                  >
                    <Shield className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                  <button 
                    onClick={async () => {
                      const res = await vedaService.postAction({ action: "getDistillationHistory", params: {} });
                      if (res && res.data) {
                        setDistillationHistory(res.data);
                        setShowLedger(true);
                      }
                    }}
                    className={`p-1.5 md:p-2 rounded-none transition-all border ${showLedger ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-white/5 text-white/30 border-white/5 hover:text-white/70'}`}
                    title="CONSENSUS LEDGER"
                  >
                    <Repeat className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                  <button 
                    onClick={() => setShowPinned(!showPinned)}
                    className={`p-1.5 md:p-2 rounded-none transition-all border ${showPinned ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' : 'bg-white/5 text-white/30 border-white/5 hover:text-white/70'}`}
                    title="PINNED"
                  >
                    <Pin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-1.5 md:p-2 rounded-none transition-all border ${isMuted ? 'bg-red-500/20 text-red-500 border-red-500/50' : 'bg-white/5 text-white/30 border-white/5 hover:text-white/70'}`}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                  </button>
                </div>
                <div className="w-px h-6 md:h-8 bg-white/10 mx-1 md:mx-2 hidden md:block" />
                <button 
                  onClick={onClose}
                  className="p-1.5 md:p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-none transition-all border border-white/10"
                >
                  <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </div>
            </div>

            {/* Architect Profile Overlay */}
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-[89px] right-6 left-6 z-[160] ff-panel bg-black/90 backdrop-blur-3xl border-purple-500/30 rounded-none p-6 shadow-2xl overflow-y-auto"
                >
                  <div className="flex justify-between items-center mb-6 border-b border-purple-500/20 pb-4">
                    <FFLabel main="SOVEREIGN PROFILE" sub="ARCHITECT IDENTIFICATION" />
                    <button onClick={() => setShowProfile(false)} className="opacity-40 hover:opacity-100 text-white transition-all">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold tracking-[0.3em] text-purple-400 uppercase ff-font">Architect Name / 架構者姓名</label>
                      <input 
                        type="text"
                        value={architectName}
                        onChange={(e) => setArchitectName(e.target.value)}
                        placeholder="Define your identity..."
                        className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all ff-text-body"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold tracking-[0.3em] text-purple-400 uppercase ff-font">Interests & Expertise / 興趣與核心領域</label>
                      <textarea 
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        placeholder="What should VEDA remember about you?"
                        className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all ff-text-body h-24 resize-none"
                      />
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <div className="flex items-center gap-3 p-3 bg-purple-500/5 border border-purple-500/10">
                        <Shield className="w-5 h-5 text-purple-400" />
                        <span className="text-[10px] text-white/50 tracking-wider ff-font">
                          此資料將保存在 Firestore 高階扇區，VEDA 會在每次啟動神經連結時識別此身分。
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Consensus Ledger Overlay */}
            <AnimatePresence>
              {showLedger && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-[89px] right-6 left-6 z-[160] ff-panel bg-black/90 backdrop-blur-3xl border-cyan-500/30 rounded-none p-6 shadow-2xl max-h-[450px] overflow-y-auto"
                >
                 <div className="flex justify-between items-center mb-6 border-b border-cyan-500/20 pb-4">
                    <FFLabel main={t.consensus_ledger} sub={t.ontological_evolution} />
                    <button onClick={() => setShowLedger(false)} className="opacity-40 hover:opacity-100 text-white transition-all">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {distillationHistory.length === 0 ? (
                      <div className="text-center py-16 opacity-20 text-[10px] uppercase tracking-[0.5em] ff-font">
                        NO EVOLUTIONARY DATA
                      </div>
                    ) : (
                      distillationHistory.map((h, idx) => (
                        <div key={idx} className="p-4 bg-white/5 rounded-none border border-cyan-500/10 hover:border-cyan-500/40 transition-all group relative">
                          <div className="text-[8px] font-bold tracking-[0.3em] text-cyan-500/40 mb-2 flex justify-between ff-font">
                            <span>{t.recall_anchor}: v{h.version}</span>
                            <span>{new Date(h.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="text-xs text-white/70 ff-text-body italic">
                             "{h.summary}"
                          </div>
                          <div className="mt-3 flex items-center gap-4 text-[7px] text-white/30 uppercase ff-font tracking-widest">
                             <span>Depth: {h.chainDepth || 0}</span>
                             <span>Protocol: V-AA_CHAIN_V1</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pinned Messages Overlay */}
            <AnimatePresence>
              {showPinned && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-[89px] right-6 left-6 z-[160] ff-panel bg-black/90 backdrop-blur-3xl border-yellow-500/30 rounded-none p-6 shadow-2xl max-h-[450px] overflow-y-auto"
                >
                  <div className="flex justify-between items-center mb-6 border-b border-yellow-500/20 pb-4">
                    <FFLabel main="PINNED REPOSITORY" sub="NEURAL ANCHORS" />
                    <button onClick={() => setShowPinned(false)} className="opacity-40 hover:opacity-100 text-white transition-all">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {messages.filter(m => m.pinned).length === 0 ? (
                      <div className="text-center py-16 opacity-20 text-[10px] uppercase tracking-[0.5em] ff-font">
                        NO PINNED DATA
                      </div>
                    ) : (
                      messages.filter(m => m.pinned).map(m => (
                        <div key={m.id} className="p-4 bg-white/5 rounded-none border border-yellow-500/10 hover:border-yellow-500/40 transition-all group relative">
                          <div className="text-[8px] font-bold tracking-[0.3em] text-yellow-500/40 mb-2 flex justify-between ff-font">
                            <span>{m.role === 'user' ? 'COMMANDER' : 'VEDA'}</span>
                            <span>{m.timestamp}</span>
                          </div>
                          <div className="text-xs line-clamp-3 text-white/70 ff-text-body">{m.text}</div>
                          <div className="mt-4 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => handleCopy(m.text, `pinned-${m.id}`)}
                              className="p-1.5 text-yellow-500/40 hover:text-yellow-500 transition-colors"
                              title="Copy"
                            >
                              {copiedId === `pinned-${m.id}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={() => handlePin(m.id)}
                              className="p-1.5 text-red-500/40 hover:text-red-500 transition-colors"
                              title="Unpin"
                            >
                              <PinOff className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reminders Management Overlay */}
            <AnimatePresence>
              {showReminders && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-[89px] right-6 left-6 z-[160] ff-panel bg-black/90 backdrop-blur-3xl border-white/20 rounded-none p-6 shadow-2xl max-h-[450px] overflow-y-auto"
                >
                  <div className="flex justify-between items-center mb-6 border-b border-white/20 pb-4">
                    <FFLabel main="TASK MANAGEMENT" sub="STRATEGIC OBJECTIVES" />
                    <button onClick={() => setShowReminders(false)} className="opacity-40 hover:opacity-100 text-white transition-all">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Filter & Sort Controls */}
                  <div className="flex flex-col gap-4 mb-6">
                    {/* Add Task Input */}
                    <div className="flex gap-2 p-1 bg-white/5 border border-white/10">
                      <input 
                        type="text" 
                        placeholder="輸入新任務或指令..." 
                        className="flex-1 bg-transparent border-none text-[10px] ff-font text-white placeholder:text-white/20 focus:outline-none px-3 py-2 uppercase tracking-widest"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = (e.currentTarget as HTMLInputElement).value.trim();
                            if (val) {
                              onRemindersUpdate([...reminders, {
                                id: `manual-${Date.now()}`,
                                task: val,
                                time: new Date().toISOString(),
                                completed: false
                              }]);
                              (e.currentTarget as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <button className="px-4 py-2 bg-cyan-500/20 text-cyan-400 text-[10px] ff-font font-bold hover:bg-cyan-500 hover:text-black transition-all">
                        ADD
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 px-1">
                    <div className="flex items-center gap-2">
                      <div className="flex bg-white/5 border border-white/10 p-0.5 rounded-none">
                        {(['ALL', 'PENDING', 'COMPLETED'] as const).map(f => (
                          <button
                            key={f}
                            onClick={() => setReminderFilter(f)}
                            className={cn(
                              "px-3 py-1 text-[8px] font-bold tracking-widest transition-all ff-font",
                              reminderFilter === f ? "bg-cyan-500 text-black" : "text-white/40 hover:text-white/70"
                            )}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setReminderSort(prev => prev === 'DATE_ASC' ? 'DATE_DESC' : 'DATE_ASC')}
                        className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-[8px] font-bold text-white/60 hover:text-white ff-font tracking-widest transition-all"
                      >
                        <Calendar className="w-3 h-3" />
                        {reminderSort === 'DATE_ASC' ? 'OLDEST FIRST' : 'NEWEST FIRST'}
                      </button>

                      {reminders.some(r => r.completed) && (
                        <button
                          onClick={() => onRemindersUpdate(reminders.filter(r => !r.completed))}
                          className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 text-[8px] font-bold text-red-500 hover:bg-red-500 hover:text-white ff-font tracking-widest transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                          CLEAR COMPLETED
                        </button>
                      )}
                    </div>
                  </div>
                  </div>

                  <div className="space-y-3">
                    {reminders.length === 0 ? (
                      <div className="text-center py-16 opacity-20 text-[10px] uppercase tracking-[0.5em] ff-font">
                        NO ACTIVE OBJECTIVES
                      </div>
                    ) : (
                      reminders
                        .filter(r => {
                          if (reminderFilter === 'PENDING') return !r.completed;
                          if (reminderFilter === 'COMPLETED') return r.completed;
                          return true;
                        })
                        .sort((a, b) => {
                          const dateA = new Date(a.time).getTime();
                          const dateB = new Date(b.time).getTime();
                          return reminderSort === 'DATE_ASC' ? dateA - dateB : dateB - dateA;
                        })
                        .map(r => (
                          <div key={r.id} className="flex items-center justify-between p-4 bg-white/5 rounded-none border border-white/5 hover:border-cyan-500/30 transition-all group">
                            <div className="flex flex-col gap-1 overflow-hidden flex-1">
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => {
                                    onRemindersUpdate(reminders.map(rem => rem.id === r.id ? { ...rem, completed: !rem.completed } : rem));
                                  }}
                                  className="focus:outline-none"
                                >
                                  {r.completed ? <CheckCircle2 className="w-4 h-4 text-cyan-400" /> : <Clock className="w-4 h-4 opacity-30 hover:opacity-60 transition-opacity" />}
                                </button>
                                <span className={`text-xs tracking-wide ff-text-body ${r.completed ? 'opacity-30 line-through' : 'text-white/90'}`}>{r.task}</span>
                              </div>
                              <div className="text-[8px] opacity-30 ml-7 font-mono">
                                {new Date(r.time).toLocaleString([], { hour12: false })}
                              </div>
                            </div>
                            <button 
                              onClick={() => setReminderToDelete(r.id)}
                              className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-none transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-veda bg-black/20 relative"
            >
              {/* Reminders HUD Overlay */}
              {reminders.filter(r => !r.completed).length > 0 && (
                <div className="sticky top-0 z-20 mb-6 pointer-events-none">
                  <div className="inline-flex flex-col gap-2 p-3 ff-panel bg-black/60 backdrop-blur-xl border-white/10 rounded-none pointer-events-auto max-w-[220px]">
                    <div className="flex items-center gap-2 text-[8px] font-bold text-white/60 uppercase tracking-[0.3em] border-b border-white/10 pb-2 mb-1 ff-font">
                      <Bell className="w-2.5 h-2.5" /> ACTIVE OBJECTIVES
                    </div>
                    {reminders.filter(r => !r.completed).slice(0, 3).map(r => (
                      <div key={r.id} className="flex items-center gap-3 text-[10px] text-white/80 truncate ff-font">
                        <div className="w-1 h-1 bg-cyan-400 rounded-none shadow-[0_0_8px_#00d2ff]" />
                        <span className="truncate tracking-wider">{r.task}</span>
                      </div>
                    ))}
                    {reminders.filter(r => !r.completed).length > 3 && (
                      <div className="text-[8px] opacity-30 text-center text-white ff-font tracking-widest">+ MORE</div>
                    )}
                  </div>
                </div>
              )}

              {messages.filter(m => m.role !== 'thought').map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} group`}
                >
                  <div className={`max-w-[92%] p-5 rounded-none text-sm leading-relaxed relative overflow-hidden crystal-panel transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] ${
                    msg.role === 'user' 
                      ? 'border-cyan-400/80 bg-cyan-700/30 text-white shadow-[0_0_30px_rgba(34,211,238,0.25)]' 
                      : 'border-white/50 bg-zinc-700/40 text-white shadow-[0_0_30px_rgba(255,255,255,0.15)]'
                  }`}>
                    {/* Memory shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 pointer-events-none" />
                    
                    {/* Role Indicator HUD */}
                    <div className={`absolute top-0 ${msg.role === 'user' ? 'right-0' : 'left-0'} px-2 py-0.5 bg-white/5 border-b border-white/10 text-[7px] font-black tracking-[0.2em] opacity-40 uppercase ff-font z-20`}>
                      {msg.role === 'user' ? 'AUTH_USER' : 'SYSTEM_CORE'}
                    </div>
                    {msg.userImage && (
                      <div className="mb-3 rounded-none overflow-hidden border border-white/20 max-w-[200px] relative z-10">
                        <img src={msg.userImage} alt="User Upload" className="w-full h-auto" />
                      </div>
                    )}
                    <div className="markdown-body relative group ff-text-body z-10">
                      {msg.isStreaming && (
                        <div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-cyan-400 animate-pulse" />
                      )}
                      <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-1">
                        {msg.role === 'user' && (
                          <button 
                            onClick={() => handleEditMessage(msg.id, msg.text)}
                            className="p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-none border border-white/20 transition-all font-bold"
                            title="Edit Message"
                          >
                            <Terminal className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handlePin(msg.id)}
                          className={`p-1.5 rounded-none border transition-all ${
                            msg.pinned 
                              ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/40 shadow-[0_0_10px_rgba(234,179,8,0.3)]' 
                              : 'bg-black/40 hover:bg-black/60 text-white border-white/20'
                          }`}
                          title={msg.pinned ? "Unpin Message" : "Pin Message"}
                        >
                          {msg.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                        </button>
                        <button 
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-none border border-white/20 transition-all"
                          title="Copy Message"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button 
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-none border border-red-500/20 transition-all"
                          title="Delete Message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {editingMsgId === msg.id ? (
                        <div className="space-y-4 py-2">
                           <textarea
                             value={editInput}
                             onChange={(e) => setEditInput(e.target.value)}
                             className="w-full bg-black/40 border border-cyan-400/50 p-3 text-sm text-white focus:outline-none ff-text-body min-h-[80px]"
                           />
                           <div className="flex gap-2">
                              <button 
                                onClick={handleSaveEdit}
                                className="px-3 py-1 bg-cyan-500 text-black text-[10px] ff-font font-bold"
                              >
                                {t.save_change}
                              </button>
                              <button 
                                onClick={() => setEditingMsgId(null)}
                                className="px-3 py-1 bg-white/5 text-white/40 text-[10px] ff-font font-bold"
                              >
                                {t.cancel}
                              </button>
                           </div>
                        </div>
                      ) : (
                        <div className={cn(
                          "ff-text-body",
                          msg.text.includes('[VEDA_EPISTEMIC_BOUNDARY]') && "border-l-2 border-orange-500 pl-4 bg-orange-500/5 py-2"
                        )}>
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
                                  <code className={`${className} bg-white/10 px-1.5 py-0.5 rounded-none text-cyan-300 border border-white/5`} {...props}>
                                    {children}
                                  </code>
                                );
                              }
                            }}
                          >
                            {msg.text.replace('[VEDA_EPISTEMIC_BOUNDARY]', '【認識論邊界 / EPISTEMIC BOUNDARY】')}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {msg.imageUrl && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4 rounded-none overflow-hidden border border-white/20 relative group/img"
                      >
                        <img 
                          src={msg.imageUrl} 
                          alt="VEDA Visualization" 
                          referrerPolicy="no-referrer"
                          className="w-full h-auto object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = msg.imageUrl!;
                              link.download = `VEDA_VISUALIZATION_${Date.now()}.png`;
                              link.click();
                            }}
                            className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-none text-white transition-all flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold"
                          >
                            <Download className="w-4 h-4" /> 下載影像 / DOWNLOAD
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {msg.videoUrl && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4 rounded-none overflow-hidden border border-white/20 relative group/vid"
                      >
                        <video 
                          src={msg.videoUrl} 
                          controls
                          className="w-full h-auto"
                        />
                        {/* VEDA Watermark */}
                        <div className="absolute bottom-12 right-4 flex items-center gap-1.5 opacity-30 select-none pointer-events-none group-hover/vid:opacity-60 transition-opacity duration-700 z-10">
                           <div className="w-3 h-3 border-r border-b border-accent" />
                           <div className="flex flex-col items-end gap-0.5">
                             <span className="text-[6px] font-mono text-accent leading-none tracking-[0.2em]">VEDA_SYNTHESIS</span>
                             <span className="text-[5px] font-mono text-white/60 leading-none">NEURAL_BLOCK_SIGNED</span>
                           </div>
                        </div>
                        <div className="absolute top-2 right-2 z-10">
                          <button 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = msg.videoUrl!;
                              link.download = `VEDA_SYNTHESIS_${Date.now()}.mp4`;
                              link.click();
                            }}
                            className="p-2 bg-black/60 hover:bg-black/80 border border-white/20 rounded-none text-white transition-all"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {msg.audioUrl && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-white/5 border border-white/10 rounded-none flex flex-col gap-3"
                      >
                        <div className="flex items-center gap-2 text-[10px] opacity-60 uppercase tracking-widest font-black text-white ff-font">
                          <Music className="w-3 h-3 text-cyan-400" /> 神經音頻合成 / NEURAL AUDIO SYNTHESIS
                        </div>
                        <audio 
                          src={msg.audioUrl} 
                          controls
                          className="w-full h-8 opacity-80 filter invert grayscale brightness-200"
                        />
                      </motion.div>
                    )}

                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2 mb-3 text-[10px] opacity-60 uppercase tracking-widest font-black text-white ff-font">
                          <Sparkles className="w-3 h-3 text-cyan-400" /> 建議後續 / SUGGESTIONS
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {msg.suggestions.map((s, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(s)}
                              className="group/btn relative px-4 py-2 bg-white/5 border border-white/10 rounded-none text-[8px] text-white/60 hover:text-cyan-300 transition-all active:scale-95 ff-font overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-cyan-400/0 group-hover/btn:bg-cyan-400/10 transition-colors" />
                              <div className="absolute left-0 top-0 bottom-0 w-0 group-hover/btn:w-1 bg-cyan-400 transition-all" />
                              <span className="relative z-10 tracking-[0.2em]">{s}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                        <div className="flex items-center gap-2 text-[10px] opacity-60 uppercase tracking-widest font-black text-white ff-font">
                          <Globe className="w-3 h-3 text-cyan-400" /> 來源：全球檔案館 / SOURCES
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((source, idx) => (
                            <a 
                              key={idx}
                              href={source.web?.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-none text-[9px] hover:bg-white/20 hover:border-cyan-400/50 transition-all max-w-[180px] ff-font"
                            >
                              <span className="truncate text-white/80">{source.web?.title || '知識節點'}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-50 flex-shrink-0 text-white" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 opacity-20 group-hover:opacity-40 transition-opacity">
                    <div className="h-[1px] w-8 bg-white/40" />
                    <div className="text-[7px] uppercase tracking-[0.4em] font-black ff-font">
                      {msg.role === 'user' ? 'USER_DATA_LINK' : 'SYSTEM_RESPONSE'} // {msg.timestamp}
                    </div>
                    <div className="h-[1px] flex-1 bg-white/10" />
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-cyan-400 opacity-80 text-[10px] animate-pulse ff-font">
                    <Sparkles className="w-3 h-3" /> 系統正在處理數據...
                  </div>
                  <div className="flex gap-1">
                    {layers?.map(layer => (
                      <div key={layer.id} className="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded-none border border-white/10">
                        <div className={`w-1 h-1 rounded-none ${layer.coherence > 0.8 ? 'bg-cyan-400 shadow-[0_0_5px_#00ffff]' : 'bg-white/40'} animate-pulse`} />
                        <span className="text-[7px] opacity-40 uppercase font-black text-white ff-font">{layer.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/60 border-t border-white/20 backdrop-blur-md">
              {/* Active Inference Friction Alert */}
              <AnimatePresence>
                {frictionWarning && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="ff-panel border border-accent/40 bg-accent/5 p-4 flex flex-col gap-3">
                       <div className="flex items-center gap-3">
                          <Zap size={14} className="text-accent animate-pulse" />
                          <span className="text-[10px] font-bold tracking-[0.3em] text-accent uppercase ff-font">邏輯摩擦檢測 / LOGICAL FRICTION</span>
                       </div>
                       <p className="text-xs italic text-white/70 ff-text-body pl-6 border-l border-accent/20">
                         {frictionWarning}
                       </p>
                       <div className="flex gap-4 pl-6">
                          <button 
                            onClick={() => {
                              setIsFrictionBypassed(true);
                              setFrictionWarning(null);
                              handleSend();
                            }}
                            className="text-[9px] tracking-[0.4em] uppercase text-accent hover:text-white transition-colors flex items-center gap-2"
                          >
                            <Shield size={10} /> Bypass Axioms
                          </button>
                          <button 
                            onClick={() => {
                              setFrictionWarning(null);
                              setInput('');
                            }}
                            className="text-[9px] tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors"
                          >
                            Retract Command
                          </button>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Suggestions */}
              {showSuggestions && !selectedImage && input.length === 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <Sparkles className="w-3 h-3 text-cyan-400 opacity-80" />
                    <span className="text-[10px] font-bold text-white opacity-60 uppercase tracking-widest ff-font">建議查詢 / SUGGESTIONS</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(s)}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-none text-[10px] text-white/80 hover:bg-white/20 hover:border-cyan-400/50 hover:text-cyan-300 transition-all active:scale-95 ff-font"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {selectedImage && (
                <div className="mb-3 flex items-center gap-2 p-2 bg-white/5 border border-white/20 rounded-none crystal-panel">
                  <div className="w-12 h-12 rounded-none overflow-hidden border border-white/40">
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-[10px] opacity-80 truncate text-white ff-font">圖片已就緒 / IMAGE READY</div>
                  <button onClick={() => setSelectedImage(null)} className="p-1 hover:bg-white/10 rounded-none text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="relative flex items-center gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-white/5 border border-white/10 rounded-none hover:bg-white/10 text-white transition-all hover:border-cyan-400/50"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleVoiceInput}
                  className={`p-3 border rounded-none transition-all ${
                    isListening 
                      ? 'bg-red-500/20 border-red-500/50 text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white hover:border-cyan-400/50'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <div className="relative flex-1">
                  <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 text-white" />
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="注入神經查詢或上傳圖面..."
                    className="w-full bg-white/10 border border-white/20 rounded-none py-4 pl-12 pr-24 text-sm focus:outline-none focus:border-cyan-400/50 transition-colors placeholder:opacity-40 text-white ff-font"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {input && (
                      <button
                        onClick={() => setInput('')}
                        className="p-2 hover:bg-white/10 text-white/40 hover:text-white rounded-none transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      id="send-button"
                      onClick={() => handleSend()}
                      disabled={(!(input?.trim() || "") && !selectedImage) || isTyping}
                      className="ff-button px-4 py-2 flex items-center justify-center disabled:opacity-20 disabled:scale-100"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute inset-0 z-[-1] opacity-5 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,#ffffff_0%,transparent_70%)]" />
            </div>

            {/* Audit Modal */}
            <AnimatePresence>
              {showAuditModal && auditResult && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
                >
                  <div className="ff-panel border border-accent/30 p-8 rounded-none max-w-lg w-full space-y-8 overflow-y-auto max-h-[80vh] custom-scrollbar">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="text-accent w-5 h-5" />
                        <span className="text-white font-bold uppercase tracking-[0.4em] text-xs ff-font">系統自我審計報告 / SELF_AUDIT_REPORT</span>
                      </div>
                      <button onClick={() => setShowAuditModal(false)} className="text-white/40 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {auditResult.diagnostics.map((d: any, idx: number) => (
                        <div key={idx} className="p-4 bg-white/5 border border-white/5 flex flex-col gap-2 group hover:border-accent/30 transition-all">
                          <span className="text-[10px] font-mono text-accent/60 uppercase">{d.component}</span>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-white/90">{d.status || d.count}</span>
                            <span className="text-[10px] font-mono text-zinc-500">{d.integrity || d.validity || d.state}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-accent/5 border border-accent/10 space-y-3">
                      <div className="text-[9px] font-mono text-accent uppercase tracking-widest">主權架構師筆記 / ARCHITECT_NOTE</div>
                      <p className="text-xs text-white/70 italic leading-relaxed ff-text-body">
                        "{auditResult.architect_note}"
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono text-white/30">AUDIT_TS: {new Date(auditResult.timestamp).toLocaleString()}</span>
                          <span className="text-[10px] font-mono text-green-400">HEALTH: {auditResult.overall_health}</span>
                       </div>
                       <button 
                         onClick={() => setShowAuditModal(false)}
                         className="w-full py-4 bg-accent/10 border border-accent/30 text-accent font-bold rounded-none text-xs uppercase tracking-widest hover:bg-accent/20 transition-all ff-font mt-4"
                       >
                         確認並關閉 / ACKNOWLEDGE
                       </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Clear Confirm Modal */}
            <AnimatePresence>
              {showClearConfirm && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
                >
                  <div className="ff-panel border border-red-500/30 p-6 rounded-none max-w-xs w-full space-y-6 text-center">
                    <div className="text-red-500 font-bold uppercase tracking-[0.3em] text-[10px] ff-font">警告：執行認識論清零？</div>
                    <div className="text-white/40 text-[10px] ff-text-body leading-relaxed">
                      這將永久清除當前對話產生的因果定錨鏈（Causal Chain）與所有對話歷史。此操作不可逆。
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={handleReset}
                        className="flex-1 py-3 bg-red-500 text-white font-bold rounded-none text-xs uppercase tracking-widest hover:bg-red-600 transition-colors ff-font"
                      >
                        確認 / YES
                      </button>
                      <button 
                        onClick={() => setShowClearConfirm(false)}
                        className="flex-1 py-3 bg-white/5 text-white/60 font-bold rounded-none text-xs uppercase tracking-widest hover:bg-white/10 transition-colors ff-font"
                      >
                        取消 / NO
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reminder Delete Confirm Modal */}
            <AnimatePresence>
              {reminderToDelete && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
                >
                  <div className="ff-panel border border-red-500/30 p-6 rounded-none max-w-xs w-full space-y-6 text-center">
                    <div className="text-red-500 font-bold uppercase tracking-widest text-[10px] ff-font">確認刪除此項任務？</div>
                    <div className="text-white/80 text-xs ff-text-body italic">
                      「{reminders.find(r => r.id === reminderToDelete)?.task}」
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          onRemindersUpdate(reminders.filter(rem => rem.id !== reminderToDelete));
                          setReminderToDelete(null);
                        }}
                        className="flex-1 py-3 bg-red-500 text-white font-bold rounded-none text-[10px] uppercase tracking-widest hover:bg-red-600 transition-colors ff-font"
                      >
                        確認刪除 / DELETE
                      </button>
                      <button 
                        onClick={() => setReminderToDelete(null)}
                        className="flex-1 py-3 bg-white/5 text-white/60 font-bold rounded-none text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors ff-font"
                      >
                        取消 / CANCEL
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

ChatPanel.displayName = 'ChatPanel';
