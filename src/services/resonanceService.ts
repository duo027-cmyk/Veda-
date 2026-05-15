import { EvolutionStatus } from "../types";

export class ResonanceService {
  private socket: WebSocket | null = null;
  private listeners: ((data: any) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.connect();
  }

  private connect() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const url = `${protocol}//${host}`;

    console.log(`[RESONANCE] Connecting to ${url}...`);
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log("[RESONANCE] Connected to Sovereign Network");
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.listeners.forEach(l => l(data));
      } catch (e) {
        console.error("[RESONANCE] Message parse error:", e);
      }
    };

    this.socket.onclose = () => {
      console.warn("[RESONANCE] Connection lost. Attempting sync recovery...");
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
      }
    };

    this.socket.onerror = (err) => {
      console.error("[RESONANCE] WebSocket error:", err);
    };
  }

  public sendPulse(intensity: number = 0.1) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "RESONANCE_PULSE", intensity }));
    }
  }

  public adjustNetwork(layerId: string, x: number, y: number, value: number) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "NETWORK_ADJUST", layerId, x, y, value }));
    }
  }

  public sendComputeResult(taskId: string, result: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "COMPUTE_RESULT", taskId, result }));
    }
  }

  public updateAxioms(axioms: string[]) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "UPDATE_AXIOMS", axioms }));
    }
  }

  public addListener(callback: (data: any) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }
}

export const resonanceService = new ResonanceService();
