// WebSocket Service - 雙向實時通信層
// 完全替換輪詢機制

import { BrainData } from '../types';

interface WebSocketMessage {
  type: string;
  data?: any;
  requestId?: string;
  timestamp?: number;
}

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timeout: NodeJS.Timeout;
}

type StateUpdateListener = (state: BrainData) => void;
type MessageListener = (message: WebSocketMessage) => void;
type ConnectionListener = (connected: boolean) => void;

export class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private pendingRequests: Map<string, PendingRequest> = new Map();
  
  private stateListeners: Set<StateUpdateListener> = new Set();
  private messageListeners: Set<MessageListener> = new Set();
  private connectionListeners: Set<ConnectionListener> = new Set();

  constructor() {
    this.setupWebSocket();
  }

  private setupWebSocket(): void {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const url = `${protocol}//${host}`;

      console.log('[WEBSOCKET] Connecting to', url);
      this.socket = new WebSocket(url);

      this.socket.onopen = () => this.handleOpen();
      this.socket.onmessage = (event) => this.handleMessage(event);
      this.socket.onclose = () => this.handleClose();
      this.socket.onerror = (error) => this.handleError(error);
    } catch (error) {
      console.error('[WEBSOCKET] Setup failed:', error);
      this.scheduleReconnect();
    }
  }

  private handleOpen(): void {
    console.log('[WEBSOCKET] Connection established');
    this.reconnectAttempts = 0;
    this.notifyConnectionListeners(true);
    this.flushMessageQueue();
    this.startHeartbeat();
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log('[WEBSOCKET] Received:', message.type);

      // 處理狀態更新
      if (message.type === 'VEDA_STATE_FULL' || message.type === 'VEDA_STATE_PARTIAL') {
        this.stateListeners.forEach(listener => {
          listener(message.data);
        });
      }

      // 處理 RPC 响應
      if (message.requestId && this.pendingRequests.has(message.requestId)) {
        const pending = this.pendingRequests.get(message.requestId)!;
        clearTimeout(pending.timeout);
        
        if (message.type === 'ACTION_RESULT') {
          pending.resolve(message.data);
        } else {
          pending.reject(new Error(message.data?.error || 'Unknown error'));
        }
        
        this.pendingRequests.delete(message.requestId);
      }

      // 處理心跳
      if (message.type === 'PONG') {
        console.log('[WEBSOCKET] Heartbeat acknowledged');
      }

      // 通知其他監聽器
      this.messageListeners.forEach(listener => {
        listener(message);
      });
    } catch (error) {
      console.error('[WEBSOCKET] Message parse error:', error);
    }
  }

  private handleClose(): void {
    console.warn('[WEBSOCKET] Connection closed');
    this.stopHeartbeat();
    this.socket = null;
    this.notifyConnectionListeners(false);
    this.scheduleReconnect();
  }

  private handleError(error: Event): void {
    console.error('[WEBSOCKET] Error:', error);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.send({ type: 'PING' });
      }
    }, 30000); // 每 30 秒發一次心跳
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WEBSOCKET] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    console.log(`[WEBSOCKET] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => this.setupWebSocket(), delay);
  }

  public send(message: WebSocketMessage): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(message));
        console.log('[WEBSOCKET] Sent:', message.type);
      } catch (error) {
        console.error('[WEBSOCKET] Send error:', error);
      }
    } else {
      console.warn('[WEBSOCKET] Connection not ready, queueing message:', message.type);
      this.messageQueue.push(message);
    }
  }

  public async executeAction(action: string, params: any, timeoutMs = 15000): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = `${Date.now()}-${Math.random()}`;
      
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Action timeout: ${action}`));
      }, timeoutMs);

      this.pendingRequests.set(requestId, { resolve, reject, timeout });

      this.send({
        type: 'EXECUTE_ACTION',
        requestId,
        data: { action, params },
        timestamp: Date.now()
      });
    });
  }

  public onStateUpdate(listener: StateUpdateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  public onMessage(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  public onConnectionChange(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(listener => listener(connected));
  }

  public isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  public disconnect(): void {
    this.stopHeartbeat();
    this.socket?.close();
    this.socket = null;
  }
}

// 單例實例
export const websocketService = new WebSocketService();
