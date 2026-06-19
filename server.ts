// server.ts
// Thin orchestration shell: boots subsystems in sequence and starts the HTTP
// server.  All heavy lifting lives in dedicated modules under src/server/.

import "dotenv/config";
import http from "http";
import express from "express";
import { WebSocketServer } from "ws";

import { bootstrapEnv } from "./src/server/bootstrap/env";
import { registerProcessGuards } from "./src/server/bootstrap/processGuards";
import { initFirebase } from "./src/server/bootstrap/firebase";
import { createTenantRegistry } from "./src/server/tenancy/tenantRegistry";
import { setupAppMiddleware } from "./src/server/http/middleware";
import { createApiRouter } from "./src/server/http/routes/apiRouter";
import { setupStaticAssets } from "./src/server/http/staticAssets";
import { attachWebSocketHandlers } from "./src/server/ws/createWebSocketServer";
import { startBackgroundJobs } from "./src/server/runtime/backgroundJobs";

console.log("VEDA SERVER BOOTING...");

async function startServer(): Promise<void> {
  try {
    console.log("[BOOT] VEDA_SERVER: Initializing infrastructure...");

    // 1. Diagnostics & safety
    bootstrapEnv();
    registerProcessGuards();

    // 2. Firebase (non-fatal; returns null handles when config is absent)
    const { db, adminDb } = await initFirebase();

    // 3. Tenant brain registry
    const registry = createTenantRegistry();
    if (db) registry.setDatabase(db);
    if (adminDb) registry.setAdminDatabase(adminDb);

    // 4. HTTP infrastructure
    const app = express();
    const PORT = 3000;
    const server = http.createServer(app);
    const wss = new WebSocketServer({ server });

    // 5. App-level middleware (logger → CORS → JSON body → console trace)
    setupAppMiddleware(app);

    // 6. Immediate pulse / health endpoints (registered before API router)
    app.get("/_veda_pulse", (_req, res) => res.send("SOVEREIGN_PULSE_OK"));
    app.get("/healthz", (_req, res) => res.send("OK"));

    // 7. API router (all /api/* routes)
    const wssRef = { current: wss };
    app.use("/api", createApiRouter(registry, wssRef));

    // 8. Vite dev middleware or production static bundle (must be last)
    await setupStaticAssets(app);

    // 9. WebSocket connection handlers
    attachWebSocketHandlers(wss, registry);

    // 10. Background loops (ticker, telemetry sync, evolution)
    startBackgroundJobs(wss, registry);

    // 11. Start listening
    server.on("error", (err: any) => {
      console.error("[CRITICAL_SERVER_ERROR] Server event listener caught error:", err);
      if (err.code === "EADDRINUSE") {
        console.error(
          `[CRITICAL_SERVER_ERROR] Port ${PORT} is already in use by another process. Exiting to allow supervisor container recovery.`
        );
        process.exit(1);
      }
    });

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`[BOOT] VEDA_OS: Sovereign Interface online on port ${PORT}`);
    });
  } catch (error) {
    console.error("[BOOT_FAULT]", error);
    process.exit(1);
  }
}

startServer();
