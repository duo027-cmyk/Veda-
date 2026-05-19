
/**
 * AGI Sovereign Core Event Bus - v1.0
 * Decentralized messaging for decoupled modules.
 */
export type SystemEvent = 
  | { type: 'STATE_UPDATE'; payload: { delta: number; state: number[] } }
  | { type: 'CAUSAL_GAP'; payload: { energy: number; description: string } }
  | { type: 'STRATEGIC_PIVOT'; payload: { direction: string; confidence: number } }
  | { type: 'MEMORY_SYNC'; payload: { nodeIds: string[] } }
  | { type: 'BURST_TRIGGER'; payload: { active: boolean } };

export type EventCallback = (event: SystemEvent) => void;

export class EventBus {
  private listeners: Map<SystemEvent['type'], Set<EventCallback>> = new Map();

  public subscribe(type: SystemEvent['type'], callback: EventCallback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
    
    return () => this.unsubscribe(type, callback);
  }

  public unsubscribe(type: SystemEvent['type'], callback: EventCallback) {
    this.listeners.get(type)?.delete(callback);
  }

  public publish(event: SystemEvent) {
    this.listeners.get(event.type)?.forEach(callback => {
      try {
        callback(event);
      } catch (e) {
        console.error(`[EVENT_BUS_FAULT] Error in listener for ${event.type}`, e);
      }
    });
  }
}
