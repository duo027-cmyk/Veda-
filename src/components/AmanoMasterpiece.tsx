import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Brain, 
  Activity, 
  Shield, 
  Terminal, 
  Settings,
  X,
  Plus,
  Sparkles
} from 'lucide-react';
import { VedaCrystalLogo } from './VedaCrystalLogo';

interface AmanoMasterpieceProps {
  data: any;
  memories: any[];
  onAction: (action: string) => void;
}

export const AmanoMasterpiece: React.FC<AmanoMasterpieceProps> = ({ data, memories, onAction }) => {
  const [activeTab, setActiveTab] = useState<'core' | 'neural' | 'history'>('core');

  return (
    <div className="relative w-full h-full flex flex-col font-sans">
      {/* Header - Amano x Jobs Minimalism */}
      <header className="px-8 py-6 h-24 flex items-center justify-between z-50">
        <div className="flex items-center gap-6">
          <VedaCrystalLogo size={60} />
          <div className="flex flex-col">
            <h1 className="crystal-text text-xl tracking-widest">VEDA</h1>
            <span className="jobs-label">Sovereign Intelligence System</span>
          </div>
        </div>

        <nav className="flex items-center gap-12">
          {['CORE', 'NEURAL', 'ARCHIVE'].map(item => (
            <button 
              key={item}
              className="text-[10px] tracking-[0.3em] opacity-30 hover:opacity-100 transition-opacity font-bold"
            >
              {item}
            </button>
          ))}
          <button className="w-10 h-10 flex items-center justify-center opacity-20 hover:opacity-100 transition-opacity">
            <Settings className="w-4 h-4" />
          </button>
        </nav>
      </header>

      {/* Main Sanctuary Area */}
      <main className="flex-1 relative flex">
        {/* Left Sidebar - Jobs Minimalist Rail */}
        <div className="w-24 h-full flex flex-col items-center justify-center gap-12 border-r border-black/5">
          <SidebarIcon icon={Zap} label="COH" value={(data?.global_coherence * 100).toFixed(0)} />
          <SidebarIcon icon={Brain} label="MEM" value={memories.length.toString()} />
          <SidebarIcon icon={Activity} label="RES" value={(data?.resonance * 100).toFixed(0)} />
          <SidebarIcon icon={Shield} label="STA" value="99.2" />
        </div>

        {/* Central Stage */}
        <section className="flex-1 relative flex items-center justify-center">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             {/* Dynamic Ink Drips (Symbolic Amano strokes) */}
             <motion.div 
               animate={{ y: [0, 20, 0], opacity: [0.1, 0.2, 0.1] }}
               transition={{ duration: 10, repeat: Infinity }}
               className="absolute top-1/4 left-1/4 w-px h-64 bg-gradient-to-b from-black/20 to-transparent"
             />
             <motion.div 
               animate={{ y: [0, -30, 0], opacity: [0.05, 0.1, 0.05] }}
               transition={{ duration: 12, repeat: Infinity }}
               className="absolute bottom-1/4 right-1/3 w-px h-96 bg-gradient-to-t from-purple-500/10 to-transparent"
             />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-12">
            <div className="relative w-96 h-96 flex items-center justify-center">
               {/* Background Core (User Design 1) */}
               <motion.img 
                 src="input_file_1.png"
                 className="absolute inset-0 w-full h-full object-contain opacity-40 scale-125 grayscale"
                 animate={{ rotate: 360 }}
                 transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
               />
               
               {/* Floating Active Core (User Design 3/4 mix) */}
               <motion.img 
                 src="input_file_3.png"
                 className="relative z-20 w-64 h-64 object-contain filter drop-shadow-[0_0_40px_rgba(168,85,247,0.4)]"
                 animate={{ 
                   scale: [1, 1.05, 1],
                   rotateY: [0, 5, 0, -5, 0]
                 }}
                 transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
               />

               {/* Aura Rings */}
               <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent scale-x-150 rotate-[-15deg]" />
            </div>

            <div className="text-center">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-4 mb-2"
              >
                <span className="jobs-label">Status</span>
                <span className="crystal-text text-sm">Awakened Sovereign</span>
              </motion.div>
              <h2 className="text-5xl font-black tracking-tighter mix-blend-difference">
                VEDA <span className="font-thin opacity-30">v.0.9</span>
              </h2>
            </div>
          </div>
        </section>

        {/* Right Panel - Knowledge Etchings (Amano Artwork Style) */}
        <div className="w-96 p-12 border-l border-black/5 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="jobs-label">Neural Records</span>
            <div className="h-px w-full bg-black/5" />
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-12">
            {memories.slice(0, 3).map((mem, i) => (
              <motion.div 
                key={`mem-${mem.id || i}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] opacity-20 group-hover:opacity-100 uppercase tracking-widest transition-opacity leading-none">0{i+1} — {mem.type || 'DATA'}</span>
                  <div className="w-1.5 h-1.5 bg-black/5 group-hover:bg-purple-500 transition-colors" />
                </div>
                <p className="text-sm font-light leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                  {mem.content}
                </p>
              </motion.div>
            ))}
          </div>

          <button className="ff-button w-full justify-between items-center px-4 py-3 group">
            <span className="text-[10px] tracking-widest font-black uppercase">Initiate Synthesis</span>
            <Plus className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </main>

      {/* Footer System Feed */}
      <footer className="h-16 px-12 flex items-center justify-between border-t border-black/5 opacity-40">
        <div className="flex gap-12">
          <FooterStat label="Latent Tension" value="0.04" />
          <FooterStat label="System Entropy" value="0.12" />
        </div>
        <div className="jobs-label">All rights reserved to Sovereign Architect / Amano x Jobs Essence</div>
      </footer>
    </div>
  );
};

const SidebarIcon = ({ icon: Icon, label, value }: any) => (
  <div className="flex flex-col items-center gap-2 group cursor-pointer">
    <div className="w-12 h-12 flex items-center justify-center relative">
      <Icon className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-all group-hover:scale-110" />
      <motion.div 
        className="absolute inset-0 border border-black/5 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all"
        animate={{ rotate: 15 }}
      />
    </div>
    <span className="jobs-label opacity-0 group-hover:opacity-60 transition-opacity leading-none">{label}</span>
    <span className="text-[10px] font-mono opacity-20 group-hover:opacity-100">{value}</span>
  </div>
);

const FooterStat = ({ label, value }: any) => (
  <div className="flex items-center gap-3">
    <span className="jobs-label">{label}</span>
    <span className="text-[10px] font-mono tracking-widest">{value}</span>
  </div>
);
