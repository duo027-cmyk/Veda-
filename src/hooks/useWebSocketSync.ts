// WebSocket 同步 hook
import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { vedaService } from '../services/vedaService';
import { websocketService } from '../services/websocketService';

export function useWebSocketSync() {
  const { setUserData, setWsConnected } = useAppStore();

  useEffect(() => {
    // 訂閱狀態更新
    const unsubscribeState = vedaService.subscribeToStateUpdates((newState) => {
      console.log('[WEBSOCKET_SYNC] Received state update');
      setUserData(newState);
    });

    // 訂閱連接狀態
    const unsubscribeConnection = websocketService.onConnectionChange((connected) => {
      console.log('[WEBSOCKET_SYNC] Connection status:', connected);
      setWsConnected(connected);
    });

    return () => {
      unsubscribeState();
      unsubscribeConnection();
    };
  }, [setUserData, setWsConnected]);
}
