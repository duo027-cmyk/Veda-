
import { EventBus, SystemEvent } from "./EventBus";

/**
 * AGI Sovereign Subsystem Base Interface
 * Defines the lifecycle and telemetry requirements for all VEDA modules.
 */

export interface ISubsystemTelemetry {
  status: 'ONLINE' | 'STANDBY' | 'DEGRADED' | 'FAULT';
  coherence: number;
  lastUpdate: number;
  [key: string]: any;
}

export abstract class BaseSubsystem {
  protected status: 'ONLINE' | 'STANDBY' | 'DEGRADED' | 'FAULT' = 'STANDBY';
  protected coherence: number = 1.0;
  protected lastUpdate: number = Date.now();
  protected bus?: EventBus;

  public setBus(bus: EventBus) {
    this.bus = bus;
  }

  protected publish(event: SystemEvent) {
    this.bus?.publish(event);
  }

  public abstract initialize(): Promise<void>;
  public abstract tick(delta: number, globalState: number[]): void;
  
  public getTelemetry(): ISubsystemTelemetry {
    return {
      status: this.status,
      coherence: this.coherence,
      lastUpdate: this.lastUpdate,
    };
  }

  protected log(tag: string, message: string) {
    const ts = new Date().toISOString();
    console.log(`[${ts}][${this.constructor.name}:${tag}] ${message}`);
  }
}
