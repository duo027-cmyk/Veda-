// 初始數據加載 hook
import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { vedaService } from '../services/vedaService';

export function useInitialDataLoad() {
  const { setUserData, setIsLoadingVedaData, setApiError } = useAppStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('[DATA_LOAD] Loading initial data...');
        const data = await vedaService.getData();
        setUserData(data);
      } catch (error: any) {
        console.error('[DATA_LOAD] Error:', error);
        setApiError(error.message || 'Failed to load data');
      } finally {
        setIsLoadingVedaData(false);
      }
    };

    loadData();
  }, [setUserData, setIsLoadingVedaData, setApiError]);
}
