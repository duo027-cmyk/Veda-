// 內存同步 hook - 優化版本
import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { knbService } from '../services/knbService';

export function useMemorySync() {
  const { userData, syncedMemories, addSyncedMemory, setSyncInProgress } = useAppStore();
  const syncTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    syncTimerRef.current = setTimeout(async () => {
      if (!userData?.memories || userData.memories.length === 0) return;
      
      const newMemories = userData.memories.filter(m => !syncedMemories.has(m.id));
      if (newMemories.length === 0) return;

      try {
        setSyncInProgress(true);
        console.log(`[MEMORY_SYNC] Syncing ${newMemories.length} memories...`);
        
        const validMemories = newMemories.filter(m => m.content && m.content.length <= 50000);
        
        // 批量同步
        for (const m of validMemories) {
          try {
            await (knbService as any).addFragment(m.content, {
              type: m.type || 'SYNTHESIZED',
              source: 'VEDA_BRAIN',
              resonance: m.resonance,
              id: m.id
            });
            addSyncedMemory(m.id);
          } catch (e) {
            console.warn(`[MEMORY_SYNC] Failed to sync ${m.id}:`, e);
          }
        }
        
        console.log(`[MEMORY_SYNC] Completed: ${validMemories.length} memories`);
      } catch (error) {
        console.error('[MEMORY_SYNC] Error:', error);
      } finally {
        setSyncInProgress(false);
      }
    }, 3000);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [userData?.memories, syncedMemories, addSyncedMemory, setSyncInProgress]);
}
