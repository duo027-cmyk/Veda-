import React from 'react';
import { 
  MessageSquare, 
  Activity, 
  Moon, 
  Settings, 
  Zap, 
  Cpu, 
  Database,
  BookOpen,
  MonitorPlay,
  Film
} from 'lucide-react';
import { useI18n } from '../i18n';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ViewMode = 'DIALOGUE' | 'SYNAPSE' | 'DREAM' | 'CORE' | 'KNOWLEDGE' | 'SOVEREIGN' | 'SYNTHESIS' | 'VISUAL' | 'EFFICACY' | 'CINEMA';

export const NavRail = ({ active, onSelect, isArchitect }: { active: ViewMode, onSelect: (v: ViewMode) => void, isArchitect: boolean }) => {
  const { t } = useI18n();
  const allItems: { id: ViewMode, icon: any, label: string, architectOnly?: boolean }[] = [
    { id: 'DIALOGUE', icon: MessageSquare, label: t.nav_dialogue },
    { id: 'SYNAPSE', icon: Activity, label: t.nav_synapse },
    { id: 'KNOWLEDGE', icon: Database, label: t.nav_vault, architectOnly: true },
    { id: 'SYNTHESIS', icon: BookOpen, label: t.nav_synthesis, architectOnly: true },
    { id: 'SOVEREIGN', icon: Cpu, label: t.nav_sovereign, architectOnly: true },
    { id: 'VISUAL', icon: MonitorPlay, label: t.nav_visuals },
    { id: 'CINEMA', icon: Film, label: t.nav_cinema },
    { id: 'EFFICACY', icon: Zap, label: t.nav_tiers },
    { id: 'DREAM', icon: Moon, label: t.nav_dreamscape },
    { id: 'CORE', icon: Settings, label: t.nav_core_config, architectOnly: true }
  ];

  const items = allItems.filter(item => !item.architectOnly || isArchitect);

  return (
    <nav className="fixed left-0 bottom-0 md:top-0 md:bottom-0 w-full md:w-24 h-20 md:h-auto flex flex-row md:flex-col items-center justify-around md:justify-start md:py-12 z-[100] ghibli-glass border-t md:border-t-0 md:border-r border-white/5 transition-all duration-500">
      <div className="absolute top-0 left-0 w-full h-1 bg-accent/20 hidden md:block" />
      <div className="flex-1 flex flex-row md:flex-col items-center gap-4 sm:gap-10">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "nav-rail-item group p-3 sm:p-4",
              active === item.id && "active bg-white/5 md:bg-white/5"
            )}
            title={item.label}
          >
            <item.icon size={24} className={cn(
              "transition-all duration-700 md:w-7 md:h-7",
              active === item.id ? "text-accent stroke-[1.5px] md:stroke-[1.2px]" : "text-white/40 stroke-[1px] group-hover:text-ink"
            )} />
             <span className="text-[8px] sm:text-[10px] tracking-[0.2em] uppercase font-display hidden lg:block">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="p-6 opacity-20 hover:opacity-100 transition-opacity cursor-help hidden md:block">
        <Zap size={20} className="text-gold" />
      </div>
    </nav>
  );
};
