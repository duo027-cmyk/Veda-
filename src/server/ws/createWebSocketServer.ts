// src/server/ws/createWebSocketServer.ts
// Creates the WebSocketServer, attaches the connection/message/close
// lifecycle handlers, and exposes a broadcast utility.

import { WebSocketServer, WebSocket } from "ws";
import { ActionResolver } from "../core/ActionResolver";
import type { TenantRegistry } from "../tenancy/tenantRegistry";

/**
 * Registers all WebSocket lifecycle handlers on the provided WSS.
 * Connection handling is tenant-aware: the tenant ID is read from the
 * `?uid=` query parameter of the upgrade URL.
 */
export function attachWebSocketHandlers(
  wss: WebSocketServer,
  registry: TenantRegistry
): void {
  wss.on("connection", (ws, req) => {
    const urlParams = new URL(
      req?.url || "",
      `http://${req?.headers.host || "localhost"}`
    ).searchParams;
    const tenantId = urlParams.get("uid") || "CORE_ARCHITECT";
    (ws as any).tenantId = tenantId;

    const tenantBrain = registry.getBrainForTenant(tenantId);
    const tenantActionResolver = new ActionResolver(tenantBrain);

    console.log(
      `[VEDA_SOCKET] New logic link established for tenant [${tenantId}]. Active clients: ${wss.clients.size}`
    );

    // Push the current state snapshot immediately on connect
    const stateBuffer = tenantBrain.getTelemetryBuffer();
    if (stateBuffer) {
      ws.send(
        JSON.stringify({ type: "VEDA_STATE_FULL", data: JSON.parse(stateBuffer) })
      );
    }

    ws.on("message", async (msg) => {
      try {
        const data = JSON.parse(msg.toString());

        if (data.type === "RESONANCE_PULSE")
          tenantBrain.triggerResonance(data.intensity || 0.1);
        if (data.type === "UPDATE_AXIOMS")
          tenantBrain.updateAxioms({ axioms: data.axioms });
        if (data.type === "PING")
          ws.send(JSON.stringify({ type: "PONG", ts: Date.now() }));

        if (data.type === "EXECUTE_ACTION") {
          const { action, params, requestId } = data;
          console.log(
            `[VEDA_SOCKET_ACTION - Tenant: ${tenantId}] Executing ${action} via WebSocket Link.`
          );
          try {
            const result = await tenantActionResolver.executeAction(
              action,
              params
            );
            ws.send(
              JSON.stringify({ type: "ACTION_RESULT", requestId, result })
            );
          } catch (err) {
            console.error(
              `[VEDA_SOCKET_ACTION_ERR] Fail: ${action}`,
              err
            );
            ws.send(
              JSON.stringify({
                type: "ACTION_RESULT",
                requestId,
                result: { success: false, error: String(err) },
              })
            );
          }
        }
      } catch (e) {
        console.error("[VEDA_SOCKET_ERR] Message parse fault:", e);
      }
    });

    ws.on("close", () => {
      console.log(
        `[VEDA_SOCKET] Logic link severed for tenant [${tenantId}].`
      );
    });
  });
}

/**
 * Broadcasts a JSON-serialisable payload to every open WebSocket client.
 */
export function broadcast(wss: WebSocketServer, data: unknown): void {
  const payload = JSON.stringify(data);
  wss.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) {
      c.send(payload);
    }
  });
}
