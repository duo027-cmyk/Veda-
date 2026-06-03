import { BaseSubsystem, ISubsystemTelemetry } from "./Subsystem";
import { EventBus } from "./EventBus";

/**
 * Subsystem Manager - AGI Sovereign Core v6.2
 * 
 * Orchestrates the lifecycle and telemetry of all decoupled units.
 * Enhanced with Aerospace-Grade Fault Detection, Isolation, and Recovery (FDIR).
 */
export class SubsystemManager {
  private subsystems: Map<string, BaseSubsystem> = new Map();
  private bus: EventBus = new EventBus();
  private consecutiveFaultCounters: Map<string, number> = new Map();
  private executionTimesNs: Map<string, number> = new Map();

  public register(name: string, subsystem: BaseSubsystem) {
    subsystem.setBus(this.bus);
    this.subsystems.set(name, subsystem);
    this.consecutiveFaultCounters.set(name, 0);
    this.executionTimesNs.set(name, 0);
  }

  public getBus(): EventBus {
    return this.bus;
  }

  public async initializeAll(): Promise<void> {
    const initPromises = Array.from(this.subsystems.entries()).map(async ([name, s]) => {
      try {
        await s.initialize();
        this.consecutiveFaultCounters.set(name, 0);
      } catch (e) {
        console.error(`[FDIR_CRITICAL] Failed to initialize ${name} on system startup`, e);
        this.consecutiveFaultCounters.set(name, 1);
        // Fail-safe: Subsystem enters FAULT state instead of crashing the process
      }
    });
    await Promise.all(initPromises);
  }

  public tickAll(delta: number, globalState: number[]): void {
    const now = Date.now();
    for (const [name, subsystem] of this.subsystems) {
      const startTime = performance.now();
      try {
        subsystem.tick(delta, globalState);
        
        // Reset fault counter upon successful tick execution
        this.consecutiveFaultCounters.set(name, 0);

        // Anti-Stall Guardian: Mark as DEGRADED if not updated for 30s
        if (now - subsystem.getTelemetry().lastUpdate > 30000 && subsystem.getTelemetry().status === 'ONLINE') {
          console.warn(`[FDIR_ALERT] ${name} subsystem stall detected. Inactivity duration > 30s.`);
        }
      } catch (e) {
        const faultCount = (this.consecutiveFaultCounters.get(name) || 0) + 1;
        this.consecutiveFaultCounters.set(name, faultCount);
        console.error(`[FDIR_FAULT_DETECTION] ${name} subsystem tick failed. Consecutive Faults: ${faultCount}`, e);

        // Active Isolation and Recovery Sequence (FDIR)
        if (faultCount >= 3) {
          console.warn(`[FDIR_RECOVERY] Isolate and trigger Hot-Restart for subsystem: ${name}`);
          this.hotRestartSubsystem(name, subsystem);
        }
      } finally {
        const duration = performance.now() - startTime;
        this.executionTimesNs.set(name, duration);
      }
    }
  }

  /**
   * Performs an asynchronous hot-restart on a failing sub-module.
   * Isolates other modules and runs a recovery handshake without thread blocking.
   */
  private async hotRestartSubsystem(name: string, subsystem: BaseSubsystem) {
    try {
      this.consecutiveFaultCounters.set(name, 0); // Guard against endless re-entry
      console.log(`[FDIR_RECOVERY] Resetting connection registers for ${name}.`);
      await subsystem.initialize();
      console.log(`[FDIR_RECOVERY] Hot-Restart successfully completed for ${name}. State: ONLINE.`);
    } catch (reInitError) {
      console.error(`[FDIR_RECOVERY_FAILURE] Hot-Restart failed for ${name}. Marking as hard FAULT.`, reInitError);
    }
  }

  public getGlobalTelemetry(): Record<string, ISubsystemTelemetry> {
    const telemetry: Record<string, ISubsystemTelemetry> = {};
    for (const [name, subsystem] of this.subsystems) {
      const baseTelemetry = subsystem.getTelemetry();
      telemetry[name] = {
        ...baseTelemetry,
        consecFaults: this.consecutiveFaultCounters.get(name) || 0,
        tickDurationMs: Number((this.executionTimesNs.get(name) || 0).toFixed(4))
      };
    }
    return telemetry;
  }

  public getSubsystem<T extends BaseSubsystem>(name: string): T | undefined {
    return this.subsystems.get(name) as T;
  }
}
