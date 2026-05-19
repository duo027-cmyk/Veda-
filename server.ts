// server.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import fs from "fs";
import { promises as fsPromises } from "fs";
import { create, insert, search, save, load, type Orama } from "@orama/orama";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, doc, getDocFromServer, setLogLevel, initializeFirestore } from "firebase/firestore";
import admin from "firebase-admin";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";

import { AGISovereignBrain } from "./src/server/brain";
import { IVedaBrain } from "./src/server/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Sovereign Brain
const brain: IVedaBrain = new AGISovereignBrain();

// Load Firebase Config
const firebaseConfigPath = path.join(__dirname, "firebase-applet-config.json");
let db: any = null;

// Initialize Firebase SDK
if (fs.existsSync(firebaseConfigPath)) {
  try {
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
    // Initialize Admin SDK for server-side operations (bypasses rules)
    let adminApp;
    if (admin.apps.length === 0) {
      try {
        adminApp = admin.initializeApp();
        console.log("[VEDA_ADMIN] Admin SDK initialized via Default Credentials.");
      } catch (e) {
        console.warn("[VEDA_ADMIN_WARNING] Default initialization failed, using explicit projectId.");
        adminApp = admin.initializeApp({
          projectId: firebaseConfig.projectId
        });
      }
    } else {
      adminApp = admin.app();
    }
    
    let adminDb;
    const requestedDbId = firebaseConfig.firestoreDatabaseId || "(default)";
    try {
      adminDb = (requestedDbId !== '(default)')
        ? getAdminFirestore(adminApp, requestedDbId)
        : getAdminFirestore(adminApp);
      console.log(`[VEDA_ADMIN] Admin SDK linked to database: ${requestedDbId}`);
    } catch (e) {
      console.warn(`[VEDA_ADMIN_WARNING] Failed to link to ${requestedDbId}, falling back to (default).`, e);
      adminDb = getAdminFirestore(adminApp);
    }
    
    // Silence internal SDK logs early
    setLogLevel('silent');
    
    // Global Log Filter: Suppress benign Firebase SDK internal lifecycle "errors"
    const originalError = console.error;
    const originalWarn = console.warn;
    const noiseSignatures = [
      'idle stream',
      'timed out waiting for new targets',
      'grpcconnection rpc',
      'listen stream',
      'code: 1',
      'cancelled'
    ];

    console.error = (...args: any[]) => {
      const msg = args.join(' ').toLowerCase();
      // Only suppress truly benign, repetitive SDK internal timeout logs
      const noiseSignatures = [
        'idle stream',
        'timed out waiting for new targets',
      ];
      const isNoise = noiseSignatures.some(sig => msg.includes(sig)) && msg.includes('firebase');
      if (isNoise) return;
      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      const msg = args.join(' ').toLowerCase();
      const isNoise = noiseSignatures.some(sig => msg.includes(sig)) && msg.includes('firebase');
      if (isNoise) return;
      originalWarn.apply(console, args);
    };
    
    // Choose standard getFirestore with databaseId
    const firestoreSettings = process.env.NODE_ENV === "production" ? {} : { experimentalForceLongPolling: true };
    const dbId = firebaseConfig.firestoreDatabaseId || "(default)";
    
    try {
      // Try initializing with settings
      db = initializeFirestore(app, firestoreSettings, dbId);
    } catch (e: any) {
      // If already initialized (common in dev/HMR), use getFirestore
      if (e.code === 'failed-precondition' || e.message?.includes('already been called')) {
        db = getFirestore(app, dbId);
      } else {
        throw e;
      }
    }

    brain.setDatabase(db);
    brain.setAdminDatabase(adminDb);
    console.log(`[FIREBASE] VEDA Persistent Memory Interface Online. Database: ${firebaseConfig.firestoreDatabaseId || "(default)"}`);
    
    // Safety: Global Process Guard
    process.on('uncaughtException', (err) => {
      console.error("[CRITICAL_SERVER_ERROR] Uncaught Exception:", err);
      // We don't exit to prevent dev server crash loop
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error("[CRITICAL_SERVER_ERROR] Unhandled Rejection at:", promise, "reason:", reason);
    });
    
    // Non-blocking connectivity check with retry
        const verifyConnection = async (retries = 3) => {
          for (let i = 0; i < retries; i++) {
            try {
              // Any response (even document not found) indicates connectivity is working
              await getDocFromServer(doc(db, 'test', 'connection'));
              console.log("[FIREBASE] Connection verified successfully.");
              return;
            } catch (err: any) {
              if (err?.code === 'permission-denied') {
                console.log("[FIREBASE] Connection verified (Auth required but network is alive).");
                return;
              }
              if (i === retries - 1) {
                console.warn("[FIREBASE] Initial connection test failed after 3 attempts. System will operate in hybrid/offline mode.");
              } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }
        };
        verifyConnection();
      } catch (e) {
        console.error("[FIREBASE] Config Fault:", e);
      }
    }

console.log("VEDA SERVER BOOTING...");

// --- VEDA Sovereign Infrastructure ---
// Core logic moved to /src/server/brain.ts

async function startServer() {
  try {
    const app = express();
    const PORT = 3000;
    const server = http.createServer(app);
    const wss = new WebSocketServer({ server });

    app.use(cors());
    app.use(express.json({ limit: "20mb" }));

    // --- API Router Definition ---
    const api = express.Router();

    // v-AA Protocol: Middleware for router-level logging
    api.use((req, res, next) => {
      const start = Date.now();
      console.log(`[VEDA_ROUTER] ${req.method} ${req.path}`);
      res.on('finish', () => {
        const duration = Date.now() - start;
        if (duration > 1500) {
          console.warn(`[VEDA_PERF_ALERT] ${req.method} ${req.path} took ${duration}ms`);
        }
      });
      next();
    });

    // v-AA Protocol: Unified state handler
    const stateHandler = async (req: express.Request, res: express.Response) => {
      try {
        const stateBuffer = brain.getTelemetryBuffer();
        if (!stateBuffer || stateBuffer === "null") {
          return res.status(200).json({ status: "INIT", message: "EPIMETIC_ENGINE_CALIBRATING" });
        }
        
        let state;
        try {
          state = JSON.parse(stateBuffer);
        } catch (e) {
          console.error("[VEDA_STATE_PARSE_FAULT] Failed to parse state buffer.");
          return res.status(200).json({ status: "RECOVERING", error: "BUFFER_CORRUPTION" });
        }

        if (req.query.fast === "true") {
           return res.json({
             status: state.status,
             global_coherence: state.global_coherence,
             server_uptime: process.uptime()
           });
        }
        
        const directive = brain.getStrategicDirective();
        if (directive) {
          state.strategic_directive = typeof directive === 'string' ? directive : directive.directive;
          if (typeof directive !== 'string') {
            state.directive_proof = directive.proof;
            state.actor_model = directive.actor_model;
          }
        }
        
        state.server_uptime = process.uptime();
        state.engine_v = "VEDA_SVR_32.0_SOVEREIGN";
        
        return res.status(200).json(state);
      } catch (err) {
        console.error("[STATE_FAULT]", err);
        return res.status(500).json({ 
          error: "SYSTEM_DESYNC", 
          message: "The sovereign state handler encountered a critical failure."
        });
      }
    };

    // --- Hardened API Endpoints ---
    api.get("/v1/state", stateHandler);
    api.get("/state", stateHandler); 

    api.get("/v1/export", (req, res) => {
      try {
        const data = brain.getResearchExport();
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=veda_research_export.json');
        res.send(JSON.stringify(data, null, 2));
      } catch (e) {
        res.status(500).json({ error: "EXPORT_ERROR", message: e instanceof Error ? e.message : String(e) });
      }
    });

    api.post("/action", async (req, res) => {
      try {
        const { action, params } = req.body;
        console.log(`[VEDA_ACTION] Executing: ${action}`);
        let result: any = { success: true, timestamp: Date.now() };

        switch (action) {
          case "evolve":
            result.data = await brain.processEvolution(params.intent, null, params.text);
            break;
          case "activateBurst":
            result.data = await brain.activateSovereignBurst(
              params?.target || "Sovereign Optimization",
              params?.intensity || 0.5,
              params?.manualApproval || false,
              params?.mode
            );
            break;
          case "approveBurst":
            result.data = brain.approveSovereignBurst();
            break;
          case "deactivateBurst":
            result.data = await brain.deactivateSovereignBurst(params?.reason || "COOLDOWN");
            break;
          case "triggerResonance":
            brain.triggerResonance(params?.intensity || 0.1);
            break;
          case "triggerCognitiveSymmetry":
            result.data = await brain.triggerCognitiveSymmetry();
            break;
          case "toggleLogicFreeze":
            result.isFrozen = brain.toggleLogicFreeze();
            break;
          case "synthesize":
            const fragment = await brain.synthesizeMemory();
            if (!fragment) throw new Error("SYNTHESIS_FAILED");
            result.memory = fragment;
            break;
          case "injectSensoryData":
            result.data = await brain.externalPrecisionInjection(params);
            break;
          case "initiateCinemaProject":
            result.data = await brain.initiateCinemaProject(params);
            break;
          case "updateProjectWorldModel":
            result.data = await brain.updateProjectWorldModel(params);
            break;
          case "updateSceneStatus":
            result.data = await brain.updateSceneStatus(params);
            break;
          case "scanNetwork":
            result.data = await brain.scanNetwork(params);
            break;
          case "submitLatticeTask":
            result.data = brain.submitLatticeTask(params.type, params.payload);
            break;
          case "solidifyLatticeJob":
            result.data = await brain.solidifyLatticeJob(params);
            break;
          case "digestKnowledge":
            result.data = await brain.digestKnowledge(params.snippets, params.scope);
            break;
          case "registerVisualAsset":
            result.data = await brain.registerVisualAsset(params);
            break;
          case "createTemporalAnchor":
            result.data = await brain.createTemporalAnchor(params.label);
            break;
          case "timeTravel":
            result.success = await brain.timeTravel(params.anchorId);
            break;
          case "distillMemories":
            result.data = await brain.distillMemories();
            break;
          case "generateSovereignResponse":
            result.data = await brain.generateSovereignResponse(params);
            break;
          case "updateSensorData":
            result.data = await brain.updateSensorData(params);
            break;
          case "performAudit":
            result.data = await brain.performAudit();
            break;
          case "initiateStrategicReport":
            result.data = await brain.initiateStrategicReport(params);
            break;
          case "synthesizeReportSection":
            result.data = await brain.synthesizeReportSection(params);
            break;
          case "batchSynthesizeReport":
            result.data = await brain.batchSynthesizeReport(params.reportId);
            break;
          case "handleChatMessage":
            if (params.text?.startsWith("DELETE_MSG:")) {
              const msgId = params.text.replace("DELETE_MSG:", "");
              result.data = { success: true, deletedId: msgId };
            } else if (params.text?.trim().startsWith("AIzaSy")) {
              brain.updateApiKey(params.text.trim());
              result.data = await brain.handleChatMessage("金鑰已更新，正在重新連結外部認識論...", "model");
            } else {
              result.data = await brain.handleChatMessage(params.text, params.role);
            }
            break;
          case "clearChatHistory":
            await brain.resetChatHistory();
            result.message = "EPISTEMIC_PURGE_COMPLETE";
            break;
          default:
            if (typeof (brain as any)[action] === "function") {
              result.data = await (brain as any)[action](params);
            } else {
              console.warn(`[VEDA_ACTION] Unknown action: ${action}`);
              return res.status(400).json({ error: "UNKNOWN_DIRECTIVE", action });
            }
        }
        res.json(result);
      } catch (e) {
        console.error(`[API_FAULT] Action ${req.body?.action} failed:`, e);
        res.status(500).json({ error: "EXECUTION_ERROR", message: e instanceof Error ? e.message : String(e) });
      }
    });

    api.get("/health", (req, res) => {
      try {
        res.json({
          status: "ONLINE",
          brain_id: brain.getSystemID(),
          uptime: process.uptime(),
          memory: process.memoryUsage().rss
        });
      } catch (e) {
        res.status(500).json({ error: "HEALTH_QUERY_FAULT" });
      }
    });

    // --- Specific API Paths (Compatibility with vedaService.ts) ---
    api.get("/ping", (req, res) => res.json({ pong: true, time: Date.now() }));
    
    api.get("/strategic", async (req, res) => {
      try {
        console.log(`[VEDA_OS] Serving strategic metrics...`);
        const report = brain.generateStrategicReport();
        if (!report) {
          return res.status(200).json({ 
            status: "STBY", 
            message: "EPIMETIC_CRYSTALLIZATION",
            metrics: { stability: 0.8, coherence: 1.0 }
          });
        }
        res.json(report);
      } catch (e) {
        console.error("[VEDA_STRATEGIC_FAULT]", e);
        res.status(500).json({ 
          error: "STRATEGIC_REPORT_ERROR", 
          details: e instanceof Error ? e.message : String(e),
          fallback: true
        });
      }
    });

    api.get("/persistence", async (req, res) => {
      const PERSISTENCE_PATH = path.join(process.cwd(), "veda_persistence.json");
      try {
        if (fs.existsSync(PERSISTENCE_PATH)) {
          const data = await fsPromises.readFile(PERSISTENCE_PATH, "utf-8");
          res.json(JSON.parse(data));
        } else {
          res.json({});
        }
      } catch (e) {
        res.status(500).json({ error: "READ_ERROR" });
      }
    });

    api.post("/persistence", async (req, res) => {
      const PERSISTENCE_PATH = path.join(process.cwd(), "veda_persistence.json");
      try {
        const data = req.body;
        let existing = {};
        if (fs.existsSync(PERSISTENCE_PATH)) {
          existing = JSON.parse(await fsPromises.readFile(PERSISTENCE_PATH, "utf-8"));
        }
        const merged = { ...existing, ...data };
        await fsPromises.writeFile(PERSISTENCE_PATH, JSON.stringify(merged, null, 2));
        res.json({ success: true });
      } catch (e) {
        res.status(500).json({ error: "WRITE_ERROR" });
      }
    });

    api.get("/memories", (req, res) => {
      try {
        const memories = brain.getAllMemories();
        res.json(memories);
      } catch (e) {
        res.status(500).json({ error: "FETCH_ERROR" });
      }
    });

    api.post("/feedback", async (req, res) => {
      try {
        const { memoryId, score } = req.body;
        await brain.submitFeedback(memoryId, score);
        res.json({ success: true });
      } catch (e) {
        res.status(500).json({ error: "FEEDBACK_ERROR" });
      }
    });

    api.get("/graph", (req, res) => {
      try {
        const data = brain.getGraphData();
        res.json(data);
      } catch (e) {
        res.status(500).json({ error: "GRAPH_ERROR" });
      }
    });

    api.post("/evolve", async (req, res) => {
      try {
        const { intent, text } = req.body;
        const result = await brain.processEvolution(intent, null, text);
        res.json(result);
      } catch (e) {
        res.status(500).json({ error: "EVOLUTION_ERROR" });
      }
    });

    api.post("/verify", (req, res) => {
      try {
        const { key } = req.body;
        const result = brain.verifyAuditKeys([key]);
        if (result.verified) {
          res.json({ success: true, token: result.access_token });
        } else {
          res.status(403).json({ error: "VERIFICATION_FAILED" });
        }
      } catch (e) {
        res.status(500).json({ error: "VERIFY_ERROR" });
      }
    });

    api.post("/synthesize", async (req, res) => {
      try {
        const fragment = await brain.synthesizeMemory();
        res.json({ success: true, memory: fragment });
      } catch (e) {
        res.status(500).json({ error: "SYNTHESIS_ERROR" });
      }
    });

    api.post("/dream", async (req, res) => {
      try {
        brain.runDreamCycle(wss).catch(e => console.error("Dream failed", e));
        res.json({ status: "DREAMING_STARTED" });
      } catch (e) {
        res.status(500).json({ error: "DREAM_ERROR" });
      }
    });

    api.post("/recall", (req, res) => {
      try {
        const { query } = req.body;
        const memories = brain.getCausalRecall(query || "");
        res.json(memories);
      } catch (e) {
        res.status(500).json({ error: "RECALL_ERROR" });
      }
    });

    api.post("/reset-chat", async (req, res) => {
      try {
        await brain.resetChatHistory();
        res.json({ status: "SUCCESS", message: "EPISTEMIC_RESET_COMPLETE" });
      } catch (e) {
        res.status(500).json({ error: "RESET_ERROR" });
      }
    });

    api.post("/v1/nudge", async (req, res) => {
      try {
        res.json({ success: true });
      } catch (e) {
        res.status(500).json({ error: "NUDGE_ERROR" });
      }
    });

    api.post("/v1/toggle-freeze", async (req, res) => {
      try {
        const result = brain.toggleLogicFreeze();
        res.json({ success: true, is_frozen: result });
      } catch (e) {
        res.status(500).json({ error: "FREEZE_ERROR" });
      }
    });

    api.post("/v1/upgrade", async (req, res) => {
      try {
        const { stat } = req.body;
        const result = await brain.setSystemTier(stat === 'ARCHITECT' ? 'ARCHITECT' : 'STRATEGIC'); 
        res.json({ success: true, ...result });
      } catch (e) {
        res.status(500).json({ error: "UPGRADE_ERROR" });
      }
    });

    // Mount the API router AFTER all routes are defined.
    // This ensures Express properly builds the internal route stack.
    app.use("/api", api);
    app.get("/healthz", (req, res) => res.send("OK"));

    // Unified fallthrough for /api that fell through the router
    app.all("/api/*", (req, res) => {
      console.warn(`[VEDA_API_FALLTHROUGH] ${req.method} ${req.originalUrl}`);
      // Ensure we NEVER send HTML for anything starting with /api/
      res.status(404).json({
        error: "NOT_FOUND",
        message: "The requested VEDA endpoint is not registered in the sovereign logic.",
        path: req.originalUrl,
        protocol: "VEDA_OVAL_V3"
      });
    });

    console.log("[VEDA] Waiting for Sovereign Brain readiness...");
    await brain.isReady();
    console.log("[VEDA] Sovereign Brain synchronized. Starting tickers.");

    // --- Background Operations ---
    
    const runTicker = () => {
      try {
        brain.tick();
        const pulse = brain.getSovereignPulse();
        setTimeout(runTicker, Math.max(100, pulse));
      } catch (e) {
        console.error("[TICK_FAULT]", e);
        setTimeout(runTicker, 1000);
      }
    };
    runTicker();

    const runTelemetrySync = async () => {
      try {
        await brain.syncTelemetryCache();
      } catch (e) {
        console.error("[TELEMETRY_SYNC_FAULT]", e);
      }
      setTimeout(runTelemetrySync, 10000); // V-AA Protocol: Increased to 10s to stabilize system load
    };
    runTelemetrySync();

    const runEvolution = async () => {
      try {
        const result = await brain.autoEvolve();
        if (result.log) {
          const payload = JSON.stringify({
            type: "SYSTEM_MONOLOGUE",
            message: result.log,
            adjustment: result.adjustment
          });
          wss.clients.forEach(c => c.readyState === WebSocket.OPEN && c.send(payload));
        }
        const coherence = brain.getGlobalCoherence();
        const delay = Math.max(20000, 60000 * (1 - coherence));
        setTimeout(runEvolution, delay);
      } catch (e) {
        console.error("[EVOLUTION_FAULT]", e);
        setTimeout(runEvolution, 45000);
      }
    };
    runEvolution();

    // --- Vite / Static Assets ---
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
    }

    // --- WebSocket Handlers ---
    wss.on("connection", (ws) => {
      ws.on("message", (msg) => {
        try {
          const data = JSON.parse(msg.toString());
          if (data.type === "RESONANCE_PULSE") brain.triggerResonance(data.intensity || 0.1);
          if (data.type === "UPDATE_AXIOMS") brain.updateAxioms({ axioms: data.axioms });
        } catch (e) {}
      });
    });

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`[VEDA_OS] Sovereign Interface online on port ${PORT}`);
    });

  } catch (error) {
    console.error("[BOOT_FAULT]", error);
    process.exit(1);
  }
}

startServer();
