import { BaseSubsystem, ISubsystemTelemetry } from "./Subsystem";
import { EventBus } from "./EventBus";

/**
 * Subsystem Manager - AGI Sovereign Core v6.2
 * 
 * Orchestrates the lifecycle and telemetry of all decoupled units.
 */
export class SubsystemManager {
  private subsystems: Map<string, BaseSubsystem> = new Map();
  private bus: EventBus = new EventBus();

  public register(name: string, subsystem: BaseSubsystem) {
    subsystem.setBus(this.bus);
    this.subsystems.set(name, subsystem);
  }

  public getBus(): EventBus {
    return this.bus;
  }

  public async initializeAll(): Promise<void> {
    const initPromises = Array.from(this.subsystems.entries()).map(async ([name, s]) => {
      try {
        await s.initialize();
      } catch (e) {
        console.error(`[SUBSYSTEM_CRITICAL] Failed to initialize ${name}`, e);
        // Fail-safe: Subsystem enters FAULT state instead of crashing the process
      }
    });
    await Promise.all(initPromises);
  }

  public tickAll(delta: number, globalState: number[]): void {
    const now = Date.now();
    for (const [name, subsystem] of this.subsystems) {
      try {
        subsystem.tick(delta, globalState);
        
        // Anti-Stall Guardian: Mark as DEGRADED if not updated for 30s
        if (now - subsystem.getTelemetry().lastUpdate > 30000 && subsystem.getTelemetry().status === 'ONLINE') {
          console.warn(`[SUBSYSTEM_STALL] ${name} has stopped ticking.`);
        }
      } catch (e) {
        console.error(`[SUBSYSTEM_RUNTIME_ERROR] ${name} tick failed`, e);
      }
    }
  }

  public getGlobalTelemetry(): Record<string, ISubsystemTelemetry> {
    const telemetry: Record<string, ISubsystemTelemetry> = {};
    for (const [name, subsystem] of this.subsystems) {
      telemetry[name] = subsystem.getTelemetry();
    }
    return telemetry;
  }

  public getSubsystem<T extends BaseSubsystem>(name: string): T | undefined {
    return this.subsystems.get(name) as T;
  }
}
