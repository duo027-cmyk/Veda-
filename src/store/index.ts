/**
 * VEDA Unified State Store Barrel Export (統一狀態儲存庫匯流層)
 * 
 * Provides unified, highly coherent access to all reactive frontend state containers
 * supporting VEDA's persistent cognitive engine.
 */

export { useAuthStore } from './authStore';
export { useVedaStore } from './vedaStore';
export { useUIStore } from './uiStore';
export { 
  useSovereignStore, 
  selfHealBrainData,
  isBrainDataValid
} from './sovereignStore';
export type { SovereignState } from './sovereignStore';
