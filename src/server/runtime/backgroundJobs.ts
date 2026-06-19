// src/server/runtime/backgroundJobs.ts
// Manages the three background loops that run indefinitely:
//   1. Ticker          – fast state tick + WebSocket partial-state push (300 ms)
//   2. Telemetry sync  – persists telemetry caches for all active brains (10 s)
//   3. Evolution loop  – runs autoEvolve for all active brains and broadcasts
//                        system monologue events (120 s, first run after 10 s)

import { WebSocketServer, WebSocket } from "ws";
import type { TenantRegistry } from "../tenancy/tenantRegistry";

/**
 * Starts all background jobs.  Jobs are fire-and-forget — they reschedule
 * themselves via setTimeout so they don't stack up on slow async paths.
 */
export function startBackgroundJobs(
  wss: WebSocketServer,
  registry: TenantRegistry
): void {
  console.log(
    "[VEDA] Initializing cognitive background processes (non-blocking)..."
  );

  startTicker(wss, registry);
  startTelemetrySync(registry);
  startEvolutionLoop(wss, registry);
}

// ---------------------------------------------------------------------------
// 1. Ticker (300 ms)
// ---------------------------------------------------------------------------

function startTicker(wss: WebSocketServer, registry: TenantRegistry): void {
  const runTicker = () => {
    try {
      // getBrainForTenant returns existing brains; we iterate via the internal
      // map by calling getBrainForTenant with any known tenantId.  Since the
      // registry doesn't expose the raw map, we iterate using a helper that
      // borrows the pattern from the original code.
      iterateBrains(registry, (tenantId, tenantBrain) => {
        tenantBrain.tick();
        const stateBuffer = tenantBrain.getTelemetryBuffer();
        if (stateBuffer && wss.clients.size > 0) {
          const s = JSON.parse(stateBuffer);
          wss.clients.forEach((c: any) => {
            if (
              c.readyState === WebSocket.OPEN &&
              c.tenantId === tenantId
            ) {
              c.send(
                JSON.stringify({
                  type: "VEDA_STATE_PARTIAL",
                  data: {
                    global_coherence: s.global_coherence,
                    phi: s.phi,
                    energy: s.energy,
                    energy_level: s.energy_level,
                    tension: s.tension,
                    entropy: s.entropy,
                    status_code: s.status_code,
                    is_bursting: s.is_bursting,
                    is_logic_frozen: s.is_logic_frozen,
                    msg: s.msg,
                  },
                })
              );
            }
          });
        }
      });
      setTimeout(runTicker, 300);
    } catch (e) {
      console.error("[GLOBAL_TICK_FAULT]", e);
      setTimeout(runTicker, 1000);
    }
  };

  runTicker();
}

// ---------------------------------------------------------------------------
// 2. Telemetry sync (10 s)
// ---------------------------------------------------------------------------

function startTelemetrySync(registry: TenantRegistry): void {
  const runTelemetrySync = async () => {
    try {
      iterateBrains(registry, async (_tenantId, tenantBrain) => {
        await tenantBrain.syncTelemetryCache();
      });
    } catch (e) {
      console.error("[GLOBAL_TELEMETRY_SYNC_FAULT]", e);
    }
    setTimeout(runTelemetrySync, 10000);
  };

  runTelemetrySync();
}

// ---------------------------------------------------------------------------
// 3. Evolution loop (120 s, first run delayed by 10 s)
// ---------------------------------------------------------------------------

function startEvolutionLoop(
  wss: WebSocketServer,
  registry: TenantRegistry
): void {
  const runEvolution = async () => {
    try {
      iterateBrains(registry, async (tenantId, tenantBrain) => {
        const result = await tenantBrain.autoEvolve();
        if (result.log) {
          const payload = JSON.stringify({
            type: "SYSTEM_MONOLOGUE",
            message: result.log,
            adjustment: result.adjustment,
          });
          wss.clients.forEach((c: any) => {
            if (
              c.readyState === WebSocket.OPEN &&
              c.tenantId === tenantId
            ) {
              c.send(payload);
            }
          });
        }
      });
    } catch (e) {
      console.error("[GLOBAL_EVOLUTION_FAULT]", e);
    }
    setTimeout(runEvolution, 120000);
  };

  // Slower interval for sustainable multi-tenant performance
  setTimeout(runEvolution, 10000);
}

// ---------------------------------------------------------------------------
// Internal helper: iterate over all tracked brains via the registry
// ---------------------------------------------------------------------------

function iterateBrains(
  registry: TenantRegistry,
  cb: (tenantId: string, brain: any) => void
): void {
  for (const tenantId of registry.getActiveTenantIds()) {
    const brain = registry.getBrainForTenant(tenantId);
    cb(tenantId, brain);
  }
}
