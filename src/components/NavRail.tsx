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
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { ViewMode } from '../types';
import { EpistemicStatus } from './EpistemicStatus';
import { cn } from '../lib/utils';

export const NavRail = () => {
  const { t } = useI18n();
  const { view: active, setView: onSelect } = useUIStore();
  const { isArchitect } = useAuthStore();

  const getActiveHub = (v: ViewMode): ViewMode => {
    if (['DIALOGUE', 'DREAM', 'TASKS'].includes(v)) return 'DIALOGUE';
    if (['SYNAPSE', 'KNOWLEDGE'].includes(v)) return 'SYNAPSE';
    if (['SOVEREIGN', 'PALANTIR_AIP', 'SYNTHESIS'].includes(v)) return 'SOVEREIGN';
    return 'CORE';
  };

  const activeHub = getActiveHub(active);

  const allItems: { id: ViewMode, icon: any, label: string, architectOnly?: boolean }[] = [
    { id: 'DIALOGUE', icon: MessageSquare, label: t.nav_epistemic_console },
    { id: 'SYNAPSE', icon: Activity, label: t.nav_neural_matrix },
    { id: 'SOVEREIGN', icon: Cpu, label: t.nav_sovereign_ops, architectOnly: true },
    { id: 'CORE', icon: Settings, label: t.nav_core_engineering, architectOnly: true }
  ];

  const items = allItems.filter(item => !item.architectOnly || isArchitect);

  return (
    <nav className="fixed left-0 bottom-0 md:top-0 md:bottom-0 w-full md:w-24 h-20 md:h-auto flex flex-row md:flex-col items-center justify-around md:justify-start md:py-8 z-[100] ghibli-glass border-t md:border-t-0 md:border-r border-border-subtle transition-all duration-500">
      <div className="absolute top-0 left-0 w-full h-1 bg-accent/20 hidden md:block" />
      <div className="flex-1 flex flex-row md:flex-col items-center gap-4 sm:gap-10 overflow-y-auto no-scrollbar py-2">
        {items.map((item, i) => {
          const isItemActive = activeHub === item.id;
          return (
            <button
              key={`nav-item-${item.id}-${i}`}
              onClick={() => onSelect(item.id)}
              className={cn(
                "nav-rail-item group p-3 sm:p-4",
                isItemActive && "active bg-accent-soft"
              )}
              title={item.label}
            >
              <item.icon size={24} className={cn(
                "transition-all duration-700 md:w-7 md:h-7",
                isItemActive ? "text-accent stroke-[1.5px] md:stroke-[1.2px]" : "text-ink opacity-40 stroke-[1px] group-hover:opacity-100"
              )} />
              <span className="text-[8px] sm:text-[10px] tracking-[0.2em] uppercase font-display hidden lg:block">{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="opacity-20 hover:opacity-100 transition-opacity cursor-help hidden md:block border-t border-white/5 w-full">
        <EpistemicStatus />
      </div>
    </nav>
  );
};
