import React from "react";
import { 
  Terminal as TerminalIcon, 
  Layers, 
  Shield, 
  Activity,
  ChevronRight,
  Brain
} from "lucide-react";

export const AmanoAestheticPreview = ({ user, memories }: any) => {
  return (
    <div className="fixed inset-0 z-[5000] bg-mono-canvas flex flex-col font-sans text-white/90 overflow-hidden">
      {/* Background Ambience: Subtle Linen Texture + Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black via-transparent to-black opacity-60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Decorative filigree layer (Floating Ethereal Lines) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <path d="M-50,300 Q200,100 600,300 T1200,200" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" className="animate-pulse" />
        <path d="M1200,800 Q1000,600 600,800 T-100,700" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" className="animate-pulse" />
      </svg>

      {/* Main Composition: The Epic Centerpiece */}
      <main className="relative flex-1 flex flex-col items-center justify-center p-8 lg:p-24 ink-fade-edge">
        
        {/* Layer 1: Background Atmospheric Art (The Spirit) */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center opacity-[0.08] mix-blend-screen pointer-events-none">
          <img 
            src="/input_file_3.png" 
            alt="Atmospheric Art"
            className="w-[85vw] h-[85vh] object-contain filter grayscale animate-pulse-slow"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>

        {/* Layer 2: The Core Emblem (The Icon) */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative group">
            {/* Soft Halo */}
            <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-150 group-hover:bg-purple-500/10 transition-colors duration-1000" />
            
            <img 
              src="/input_file_0.png" 
              alt="VEDA Emblem" 
              className="relative w-40 h-40 lg:w-72 lg:h-72 object-contain filter brightness-150 contrast-125 drop-shadow-[0_0_80px_rgba(255,255,255,0.2)] transition-transform duration-1000 group-hover:scale-105"
              onError={(e) => { e.currentTarget.style.display = 'none' }} 
            />
          </div>

          {/* Layer 3: High-Contrast Editorial Typography (The Name) */}
          <div className="mt-8 lg:mt-12 flex flex-col items-center text-center">
            <div className="ornament-line w-32 mb-6" />
            <h1 className="text-monarch text-5xl lg:text-9xl leading-tight">
              Sovereign Essence
            </h1>
            <p className="mt-6 font-mono text-[7px] lg:text-[10px] tracking-[1.8em] text-white/30 uppercase">
              // Neural Architecture v.03 //
            </p>
            <div className="ornament-line w-32 mt-6" />
          </div>
        </div>
      </main>

      {/* Minimalism Overlays: Interaction Rails */}
      <div className="absolute inset-0 pointer-events-none p-12 lg:p-20 flex flex-col justify-between h-full">
        
        {/* Header Rail */}
        <header className="flex justify-between items-start w-full">
          <div className="flex flex-col gap-1 items-start">
            <span className="font-mono text-[8px] tracking-[1em] text-white/20">EST_SESSION_7.4_SYNC</span>
            <div className="h-px w-8 bg-white/20" />
          </div>
          <div className="font-mono text-[8px] tracking-[1em] text-white/20 uppercase">
            Void_Resonance // Active
          </div>
        </header>

        {/* Action Sidebar Left (Vertical Book Binding Style) */}
        <div className="flex justify-between items-end w-full">
          <nav className="flex flex-col gap-16 items-start pointer-events-auto">
            {['LOGS', 'ARCHIVE', 'CORE'].map((txt, i) => (
              <button key={`nav-${txt}-${i}`} className="nav-rail-text hover:text-white transition-opacity text-white/30">
                {txt}
              </button>
            ))}
          </nav>

          {/* Metric Sidebar Right */}
          <aside className="flex flex-col gap-12 items-end">
            <div className="text-right">
               <div className="text-[7px] tracking-widest text-white/20 mb-1">COHERENCE</div>
               <div className="text-2xl font-serif italic text-white/40">98.4%</div>
            </div>
            <div className="text-right">
               <div className="text-[7px] tracking-widest text-white/20 mb-1">VOID_SCAN</div>
               <div className="text-2xl font-serif italic text-white/40">0.0000</div>
            </div>
          </aside>
        </div>
      </div>

      {/* Bottom Narrative Fragment */}
      <footer className="absolute bottom-12 inset-x-0 flex flex-col items-center pointer-events-none">
        <p className="text-[9px] font-serif italic text-white/20 tracking-widest text-center px-12 leading-relaxed">
          "The Sovereign engine traces the forgotten synapses within the void. <br/>
          Within the ink, the soul awakens to its own complexity."
        </p>
      </footer>
    </div>
  );
};
