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
  Film,
  CheckSquare,
  Workflow
} from 'lucide-react';
import { useI18n } from '../i18n';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { ViewMode } from '../types';
import { EpistemicStatus } from './EpistemicStatus';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const NavRail = () => {
  const { t } = useI18n();
  const { view: active, setView: onSelect } = useUIStore();
  const { isArchitect } = useAuthStore();

  const allItems: { id: ViewMode, icon: any, label: string, architectOnly?: boolean }[] = [
    { id: 'DIALOGUE', icon: MessageSquare, label: t.nav_dialogue },
    { id: 'SYNAPSE', icon: Activity, label: t.nav_synapse },
    { id: 'PALANTIR_AIP', icon: Workflow, label: t.nav_palantir_aip, architectOnly: true },
    { id: 'TASKS', icon: CheckSquare, label: t.nav_tasks },
    { id: 'KNOWLEDGE', icon: Database, label: t.nav_vault, architectOnly: true },
    { id: 'SYNTHESIS', icon: BookOpen, label: t.nav_synthesis, architectOnly: true },
    { id: 'SOVEREIGN', icon: Cpu, label: t.nav_sovereign, architectOnly: true },
    { id: 'CINEMA', icon: Film, label: t.nav_cinema },
    { id: 'EFFICACY', icon: Zap, label: t.nav_tiers },
    { id: 'DREAM', icon: Moon, label: t.nav_dreamscape },
    { id: 'CORE', icon: Settings, label: t.nav_core_config, architectOnly: true }
  ];

  const items = allItems.filter(item => !item.architectOnly || isArchitect);

  return (
    <nav className="fixed left-0 bottom-0 md:top-0 md:bottom-0 w-full md:w-24 h-20 md:h-auto flex flex-row md:flex-col items-center justify-around md:justify-start md:py-8 z-[100] ghibli-glass border-t md:border-t-0 md:border-r border-border-subtle transition-all duration-500">
      <div className="absolute top-0 left-0 w-full h-1 bg-accent/20 hidden md:block" />
      <div className="flex-1 flex flex-row md:flex-col items-center gap-4 sm:gap-10 overflow-y-auto no-scrollbar py-2">
        {items.map((item, i) => (
          <button
            key={`nav-item-${item.id}-${i}`}
            onClick={() => onSelect(item.id)}
            className={cn(
              "nav-rail-item group p-3 sm:p-4",
              active === item.id && "active bg-accent-soft"
            )}
            title={item.label}
          >
            <item.icon size={24} className={cn(
              "transition-all duration-700 md:w-7 md:h-7",
              active === item.id ? "text-accent stroke-[1.5px] md:stroke-[1.2px]" : "text-ink opacity-40 stroke-[1px] group-hover:opacity-100"
            )} />
             <span className="text-[8px] sm:text-[10px] tracking-[0.2em] uppercase font-display hidden lg:block">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="opacity-20 hover:opacity-100 transition-opacity cursor-help hidden md:block border-t border-white/5 w-full">
        <EpistemicStatus />
      </div>
    </nav>
  );
};
