// 統一的應用狀態 hook
import { useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { vedaService } from '../services/vedaService';

export function useAppState() {
  const store = useAppStore();

  const handleAction = useCallback(async (action: string, params?: any) => {
    try {
      store.setIsPulsing(true);
      await vedaService.executeAction(action, params);
    } catch (error: any) {
      console.error(`[APP] Action failed: ${action}`, error);
      store.setLastLog(`Action failed: ${action}`);
    } finally {
      store.setIsPulsing(false);
    }
  }, [store]);

  return {
    ...store,
    handleAction,
  };
}
