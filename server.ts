// server.ts
import "dotenv/config";

// --- API Key Diagnostics ---
const keyFound = !!(process.env.GEMINI_API_KEY || process.env.API_KEY);
console.log(`[BOOT] GEMINI_API_KEY found: ${keyFound}`);
if (keyFound) {
  const k = (process.env.GEMINI_API_KEY || process.env.API_KEY || "");
  console.log(`[BOOT] Key Check: ${k.substring(0, 4)}...${k.substring(k.length - 4)}`);
}

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
import { ActionResolver } from "./src/server/core/ActionResolver";
import { GoogleGenAI } from "@google/genai";

// Initialize Sovereign Brain
const brain: IVedaBrain = new AGISovereignBrain();
const actionResolver = new ActionResolver(brain);

// Load Firebase Config
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
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
    console.log("[BOOT] VEDA_SERVER: Initializing infrastructure...");
    const app = express();
    const PORT = 3000;
    const server = http.createServer(app);
    const wss = new WebSocketServer({ server });

    // Filesystem diagnosis logger to understand routing behavior and catch any invisible interceptions
    app.use((req, res, next) => {
      const url = req.url;
      const method = req.method;
      try {
        fs.appendFileSync(
          "veda_log.txt",
          `[${new Date().toISOString()}] TOP_LEVEL_BEGIN: ${method} ${url} (Headers: Accept=${req.headers.accept || ""}, Origin=${req.headers.origin || ""})\n`
        );
      } catch (e) {}
      res.on("finish", () => {
        try {
          fs.appendFileSync(
            "veda_log.txt",
            `[${new Date().toISOString()}] TOP_LEVEL_END: ${method} ${url} -> ${res.statusCode} (ContentType: ${res.getHeader("content-type") || ""})\n`
          );
        } catch (e) {}
      });
      next();
    });

    // Hardened custom CORS middleware for iframe transitions and sandboxed opaque null origins
    app.use((req, res, next) => {
      const origin = req.headers.origin;
      if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        if (origin !== "null") {
          res.setHeader("Access-Control-Allow-Credentials", "true");
        }
      } else {
        res.setHeader("Access-Control-Allow-Origin", "*");
      }
      res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", req.headers["access-control-request-headers"] || "Content-Type, Authorization, Accept");
      
      if (req.method === "OPTIONS") {
        return res.sendStatus(204);
      }
      next();
    });
    app.use(express.json({ limit: "50mb" }));

    // Standard health check handler declared early for highest priority binding
    const healthHandler = (req: express.Request, res: express.Response) => {
      console.log(`[NET_TRACE] Service health check received.`);
      res.json({
        status: "ONLINE",
        brain_id: brain.getSystemID(),
        uptime: process.uptime(),
        server_ts: Date.now(),
        version: "v10.4-hardened"
      });
    };

    // IMMEDIATE Debug Heartbeat & Health Check (Highest Priority block to bypass routing / Vite fallback)
    app.get("/_veda_pulse", (req, res) => res.send("SOVEREIGN_PULSE_OK"));

    // Global Logger (Balanced)
    app.use((req, res, next) => {
      const urlPath = req.url.split('?')[0];
      const isStatic = urlPath.startsWith('/src/') || 
                       urlPath.startsWith('/assets/') || 
                       urlPath.startsWith('/@') || 
                       urlPath.startsWith('/node_modules/') ||
                       /\.(tsx?|jsx?|css|svg|png|jpg|jpeg|webp|gif|woff2?|ttf|json|ico)$/.test(urlPath);
                       
      if (!isStatic) {
        const start = Date.now();
        res.on('finish', () => {
          const duration = Date.now() - start;
          console.log(`[NET_TRACE] ${req.method} ${req.url} -> ${res.statusCode} (${duration}ms)`);
        });
      }
      next();
    });

    // --- API Router Definition ---
    const api = express.Router();

    // v-AA Protocol: Middleware for router-level logging (mounted FIRST)
    api.use((req, res, next) => {
      const start = Date.now();
      try {
        fs.appendFileSync(
          "veda_log.txt",
          `[${new Date().toISOString()}] ROUTER_ENTRY: ${req.method} ${req.path} (OriginalUrl: ${req.originalUrl || ""})\n`
        );
      } catch (e) {}
      console.log(`[VEDA_ROUTER] ${req.method} ${req.path}`);
      res.on('finish', () => {
        const duration = Date.now() - start;
        try {
          fs.appendFileSync(
            "veda_log.txt",
            `[${new Date().toISOString()}] ROUTER_FINISH: ${req.method} ${req.path} -> Done in ${duration}ms\n`
          );
        } catch (e) {}
        if (duration > 1500) {
          console.warn(`[VEDA_PERF_ALERT] ${req.method} ${req.path} took ${duration}ms`);
        }
      });
      next();
    });

    api.get("/health", healthHandler);

    // Secure Text-to-Speech proxy endpoint using gemini-3.1-flash-tts-preview
    api.post("/speech/tts", async (req, res) => {
      try {
        const { text } = req.body;
        if (!text || !text.trim()) {
          return res.status(400).json({ error: "Text has zero length" });
        }

        const rawKey = (process.env.GEMINI_API_KEY || process.env.API_KEY || "").trim();
        const isValid = rawKey && 
                        rawKey.length > 10 && 
                        rawKey !== "GEMINI_API_KEY" && 
                        rawKey !== "DISABLED_KEY" && 
                        rawKey !== "undefined" && 
                        rawKey !== "null";

        if (!isValid) {
          console.warn("[VEDA_TTS] API key invalid or missing on server. Directing client to fallback speaker.");
          return res.status(400).json({ error: "SERVER_API_KEY_INVALID" });
        }

        const tempAi = new GoogleGenAI({
          apiKey: rawKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const result = await tempAi.models.generateContent({
          model: "gemini-3.1-flash-tts-preview",
          contents: [{ parts: [{ text: `Say: ${text}` }] }],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
            },
          },
        });

        const base64Audio = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          return res.json({ success: true, audio: base64Audio });
        } else {
          return res.status(500).json({ error: "Empty model inlineData waveform buffer payload" });
        }
      } catch (err: any) {
        console.error("[VEDA_TTS_ERROR] Server speech proxy exception caught:", err);
        return res.status(500).json({ error: err.message || "Synthesis session crash" });
      }
    });

    app.get("/healthz", (req, res) => res.send("OK"));

    // v-AA Protocol: Unified state handler
    const stateHandler = async (req: express.Request, res: express.Response) => {
      try {
        console.log(`[VEDA_STATE_REQUEST] ${req.query.fast === 'true' ? 'FAST' : 'FULL'}`);
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
        console.log(`[VEDA_ACTION] Executing decoupled resolution: ${action}`);
        const result = await actionResolver.executeAction(action, params);
        res.json(result);
      } catch (e: any) {
        console.error(`[API_FAULT] Decoupled resolution of ${req.body?.action} failed:`, e);
        const errMessage = e instanceof Error ? e.message : String(e);
        const isUnknown = errMessage.includes("UNKNOWN_DIRECTIVE");
        res.status(isUnknown ? 400 : 500).json({ 
          error: "EXECUTION_ERROR", 
          message: errMessage 
        });
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
        res.json({ status: "SUCCESS" });
      } catch (e) {
        res.status(500).json({ error: "RESET_ERROR" });
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

    api.post("/v1/lattice/pause", async (req, res) => {
      try {
        const { id, isPaused } = req.body;
        if (!id) {
          return res.status(400).json({ error: "Missing job id" });
        }
        if (brain.pauseLatticeJob) {
          const success = brain.pauseLatticeJob(id, !!isPaused);
          return res.json({ success, id, isPaused: !!isPaused });
        }
        res.status(500).json({ error: "Lattice manager not operational" });
      } catch (e: any) {
        res.status(500).json({ error: "LATTICE_PAUSE_ERROR", message: e.message || String(e) });
      }
    });

    api.post("/v1/lattice/reorder", async (req, res) => {
      try {
        const { id, direction } = req.body;
        if (!id || (direction !== 'up' && direction !== 'down')) {
          return res.status(400).json({ error: "Missing required parameters: id or direction ('up'|'down')" });
        }
        if (brain.reorderLatticeJob) {
          const success = brain.reorderLatticeJob(id, direction);
          return res.json({ success, id, direction });
        }
        res.status(500).json({ error: "Lattice manager not operational" });
      } catch (e: any) {
        res.status(500).json({ error: "LATTICE_REORDER_ERROR", message: e.message || String(e) });
      }
    });

    api.post("/v1/federation/join", async (req, res) => {
      try {
        const { nodeId, nodeUrl, coherence } = req.body;
        if (!nodeId || !nodeUrl) {
          return res.status(400).json({ error: "Missing required parameters: nodeId or nodeUrl" });
        }
        const result = await brain.joinFederationNode(nodeId, nodeUrl, Number(coherence || 0.9));
        res.json(result);
      } catch (e: any) {
        console.error("[FEDERATION_JOIN_FAULT]", e);
        res.status(500).json({ error: "FEDERATION_JOIN_ERROR", message: e.message || String(e) });
      }
    });

    api.all("/*", (req, res) => {
      res.status(404).json({ error: "NOT_FOUND", path: req.originalUrl });
    });

    // Mount API with completely populated routing stack to prevent routing bypasses
    app.use("/api", api);

    console.log("[VEDA] Waiting for Sovereign Brain synchronization (non-blocking server)...");
    brain.isReady().then(() => {
      console.log("[VEDA] Sovereign Brain synchronized. Starting background tickers.");
      
      // --- Background Operations ---
      const runTicker = () => {
        try {
          brain.tick();
          const pulse = brain.getSovereignPulse();

          if (wss.clients.size > 0) {
            const stateBuffer = brain.getTelemetryBuffer();
            if (stateBuffer) {
              const s = JSON.parse(stateBuffer);
              broadcast({
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
                  msg: s.msg
                }
              });
            }
          }
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
        setTimeout(runTelemetrySync, 10000);
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
    }).catch(err => {
      console.error("[VEDA_BRAIN_READY_FAULT] Failed to synchronize brain state:", err);
    });

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
      
      // Hardened SPA Fallback: Only return index.html for navigation requests
      app.get("*", (req, res) => {
        const isApi = req.url.startsWith('/api') || req.url.startsWith('/_veda_pulse');
        if (!isApi && !req.url.includes('.')) {
          res.sendFile(path.join(distPath, "index.html"));
        } else {
          res.status(isApi ? 404 : 404).json({ 
            error: "NOT_FOUND", 
            path: req.url,
            suggestion: isApi ? "Check API endpoint mapping" : "Static asset missing"
          });
        }
      });
    }

    // --- WebSocket Handlers ---
    const broadcast = (data: any) => {
      const payload = JSON.stringify(data);
      wss.clients.forEach(c => {
        if (c.readyState === WebSocket.OPEN) {
          c.send(payload);
        }
      });
    };

    wss.on("connection", (ws) => {
      console.log(`[VEDA_SOCKET] New logic link established. Active clients: ${wss.clients.size}`);
      
      // Initial state push
      const stateBuffer = brain.getTelemetryBuffer();
      if (stateBuffer) {
        ws.send(JSON.stringify({ type: "VEDA_STATE_FULL", data: JSON.parse(stateBuffer) }));
      }

      ws.on("message", async (msg) => {
        try {
          const data = JSON.parse(msg.toString());
          if (data.type === "RESONANCE_PULSE") brain.triggerResonance(data.intensity || 0.1);
          if (data.type === "UPDATE_AXIOMS") brain.updateAxioms({ axioms: data.axioms });
          if (data.type === "PING") ws.send(JSON.stringify({ type: "PONG", ts: Date.now() }));
          
          if (data.type === "EXECUTE_ACTION") {
            const { action, params, requestId } = data;
            console.log(`[VEDA_SOCKET_ACTION] Executing ${action} via WebSocket Link.`);
            try {
              const result = await actionResolver.executeAction(action, params);
              ws.send(JSON.stringify({ type: "ACTION_RESULT", requestId, result }));
            } catch (err) {
              console.error(`[VEDA_SOCKET_ACTION_ERR] Fail: ${action}`, err);
              ws.send(JSON.stringify({ type: "ACTION_RESULT", requestId, result: { success: false, error: String(err) } }));
            }
          }
        } catch (e) {
          console.error("[VEDA_SOCKET_ERR] Message parse fault:", e);
        }
      });

      ws.on("close", () => {
        console.log(`[VEDA_SOCKET] Logic link severed.`);
      });
    });

    // Start listening
    server.on("error", (err: any) => {
      console.error("[CRITICAL_SERVER_ERROR] Server event listener caught error:", err);
      if (err.code === "EADDRINUSE") {
        console.error(`[CRITICAL_SERVER_ERROR] Port ${PORT} is already in use by another process. Exiting to allow supervisor container recovery.`);
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
