import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Video, VideoOff, Activity, Zap, Shield, Globe } from 'lucide-react';
import { liveService } from '../services/liveService';
import { resonanceService } from '../services/resonanceService';

import { useVedaStore } from '../store/vedaStore';

interface LiveOverlayProps {
  apiKey: string;
  systemInstruction: string;
}

export const LiveOverlay: React.FC<LiveOverlayProps> = ({ apiKey, systemInstruction }) => {
  const { setLastLog } = useVedaStore();
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState("神經連結離線 / LINK OFFLINE");
  const [transcription, setTranscription] = useState("");
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    liveService.setCallbacks({
      onStatus: (s) => setStatus(s),
      onTranscription: (text, isUser) => {
        setTranscription(text);
        if (isUser) setIsUserSpeaking(true);
        else setIsUserSpeaking(false);
      },
      onInterrupted: () => {
        setIsUserSpeaking(false);
        setTranscription("... INTERRUPTED ...");
      },
      onClose: () => {
        setIsActive(false);
      }
    });

    return () => liveService.stop();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isActive && showVideo && videoRef.current && canvasRef.current) {
      interval = setInterval(() => {
        const canvas = canvasRef.current!;
        const video = videoRef.current!;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
          liveService.sendVideoFrame(base64);
        }
      }, 1000); // Send frame every second
    }
    return () => clearInterval(interval);
  }, [isActive, showVideo]);

  const toggleLive = async () => {
    if (isActive) {
      liveService.stop();
      setIsActive(false);
      setStatus("神經連結離線 / LINK OFFLINE");
    } else {
      if (!apiKey) {
        setLastLog("請先設置 API Key (Please configure the API Key in the upper right Settings icon first)");
        return;
      }
      setIsActive(true);
      await liveService.start(apiKey, systemInstruction);
    }
  };

  const toggleVideo = async () => {
    if (showVideo) {
      setShowVideo(false);
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setShowVideo(true);
        }
      } catch (e) {
        console.error("Camera error:", e);
      }
    }
  };

  const triggerResonance = () => {
    resonanceService.sendPulse(0.3);
  };

  return (
    <div className="fixed bottom-24 left-6 z-50 flex flex-col items-start gap-4 pointer-events-none">
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="crystal-panel p-4 w-72 pointer-events-auto border border-blue-400/30"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="ff-font text-[10px] text-blue-300 tracking-widest uppercase">Live Neural Link</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            </div>

            <div className="bg-black/40 rounded p-3 mb-3 min-h-[60px] border border-white/5">
              <p className="ff-text-body text-xs text-blue-100/80 italic">
                {transcription || "等待神經訊號..."}
              </p>
            </div>

            {showVideo && (
              <div className="relative aspect-video bg-black rounded overflow-hidden mb-3 border border-blue-400/20">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale brightness-125 contrast-125" />
                <canvas ref={canvasRef} width={320} height={180} className="hidden" />
                <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
                <div className="absolute top-2 left-2 flex gap-1">
                  <div className="w-1 h-1 bg-blue-400" />
                  <div className="w-1 h-1 bg-blue-400/50" />
                </div>
              </div>
            )}

            <div className="flex justify-between items-center gap-2">
              <button 
                onClick={toggleVideo}
                className={`p-2 rounded-full transition-all ${showVideo ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/40'}`}
              >
                {showVideo ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
              
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ width: isUserSpeaking ? '100%' : '0%' }}
                  className="h-full bg-blue-400"
                />
              </div>

              <button 
                onClick={triggerResonance}
                className="p-2 rounded-full bg-white/5 text-blue-300 hover:bg-blue-500/20 transition-all"
                title="Trigger Resonance Pulse"
              >
                <Globe className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          onClick={toggleLive}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${
            isActive 
              ? 'bg-blue-500 shadow-blue-500/50 scale-110' 
              : 'bg-white/10 hover:bg-white/20 border border-white/20'
          }`}
        >
          {isActive ? (
            <Mic className="w-6 h-6 text-white animate-pulse" />
          ) : (
            <MicOff className="w-6 h-6 text-white/60" />
          )}
        </button>

        <motion.div
          initial={false}
          animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -20 }}
          className="bg-black/80 px-3 py-1 rounded border border-blue-400/30 backdrop-blur-md"
        >
          <span className="ff-font text-[10px] text-blue-400 whitespace-nowrap">{status}</span>
        </motion.div>
      </div>
    </div>
  );
};
