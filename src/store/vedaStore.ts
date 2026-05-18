import { create } from 'zustand';
import { vedaService } from '../services/vedaService';
import { knbService } from '../services/knbService';
import { resonanceService } from '../services/resonanceService';
import { BrainData } from '../types';

interface VedaState {
  userData: BrainData | null;
  apiError: string | null;
  lastLog: string | null;
  isPulsing: boolean;
  isLoading: boolean;
  
  // Actions
  setUserData: (data: BrainData | null) => void;
  setApiError: (error: string | null) => void;
  setLastLog: (log: string | null) => void;
  setIsPulsing: (pulsing: boolean) => void;
  
  // Async Actions
  fetchVedaData: () => Promise<void>;
  handleAction: (action: string, params?: any) => Promise<void>;
}

export const useVedaStore = create<VedaState>((set, get) => ({
  userData: null,
  apiError: null,
  lastLog: null,
  isPulsing: false,
  isLoading: true,

  setUserData: (userData) => set({ userData, isLoading: false }),
  setApiError: (apiError) => set({ apiError }),
  setLastLog: (lastLog) => set({ lastLog }),
  setIsPulsing: (isPulsing) => set({ isPulsing }),

  fetchVedaData: async () => {
    try {
      const [d, strength] = await Promise.all([
        vedaService.getData(),
        knbService.getCollectiveStrength()
      ]);
      const safeData = d ? {
        ...d,
        collectiveStrength: strength,
        innovation_manifold: d.innovation_manifold || {
          innovationIndex: 0,
          experienceSum: 0,
          leapPotential: 0,
          alignmentIndex: 0,
          protocol: 'INITIALIZING',
          uncertaintyVariance: 0
        }
      } : null;
      set({ userData: safeData, apiError: d ? null : "SYSTEM_STATE_EMPTY", isLoading: false });
    } catch (e: any) {
      console.error("Failed to load VEDA state", e);
      set({ apiError: e.message || "Unknown Causal Desync", isLoading: false });
    }
  },

  handleAction: async (action, params) => {
    set({ isPulsing: true });
    setTimeout(() => set({ isPulsing: false }), 800);
    
    try {
      let resultMsg = null;
      
      switch (action) {
        case 'resonance': await vedaService.triggerResonance(params); break;
        case 'synthesize': await vedaService.synthesize(); break;
        case 'distill': await vedaService.distill(); break;
        case 'activateBurst': 
          await vedaService.activateBurst(
            params?.target || "Sovereign Optimization",
            params?.intensity || 0.5,
            params?.manualApproval || false,
            params?.mode || "DEFENSIVE_COUNTER"
          );
          break;
        case 'approveBurst': await vedaService.approveBurst(); break;
        case 'deactivateBurst': await vedaService.deactivateBurst(params?.reason || "MANUAL"); break;
        case 'toggleSteadyState': await vedaService.toggleSteadyState(params?.active || false); break;
        case 'toggleNanosecondSync': await vedaService.toggleNanosecondSync(params?.active || false); break;
        case 'createTemporalAnchor': await vedaService.createTemporalAnchor(params?.label || "MANUAL_ANCHOR"); break;
        case 'timeTravel': await vedaService.timeTravel(params?.anchorId); break;
        case 'update_reminders': await vedaService.updatePersistence({ reminders: params.reminders }); break;
        case 'prune': await vedaService.pruneNeuralFragment(params.id); break;
        case 'imagine': await vedaService.imagine(params.prompt); break;
        case 'animate': await vedaService.animate(params.prompt); break;
        case 'synthesizeAudio': await vedaService.synthesizeAudio(params.prompt); break;
        case 'setSystemTier': await vedaService.setSystemTier(params.tier); break;
        case 'registerVisualAsset': await vedaService.postAction({ action: 'registerVisualAsset', params }); break;
        case 'learnFragment': 
          await knbService.addFragment(params.content, { type: params.type || 'DOCUMENT', source: 'USER_UPLOAD' }); 
          await vedaService.postAction({ action: 'digestKnowledge', params: { snippets: [params.content], scope: 'USER_UPLOAD' } });
          break;
        
        case 'upgrade': {
          const res = await fetch('/api/v1/upgrade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stat: params.stat })
          });
          const json = await res.json();
          if (json.success) {
            resultMsg = `系統演化已成功套用至 ${params.stat} 指標。`;
          }
          break;
        }
      }
      
      // Refresh after action
      await get().fetchVedaData();
      
      const currentData = get().userData;
      if (resultMsg) set({ lastLog: resultMsg });
      else if (currentData?.msg) set({ lastLog: currentData.msg });
      
    } catch (e) {
      console.error("Action failed", e);
      set({ lastLog: "PROTOCOL_FAILURE: Connection disrupted" });
    }
  }
}));
