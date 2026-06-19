// src/server/http/routes/apiRouter.ts
// Assembles the Express API router with all VEDA endpoints.
// All route handlers delegate business logic to the TenantRegistry and the
// underlying brain / ActionResolver — they never access brains directly.

import express from "express";
import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { WebSocketServer } from "ws";
import type { TenantRegistry } from "../../tenancy/tenantRegistry";

/** Thin reference holder so the router can access the WSS after it is created. */
export interface WssRef {
  current: WebSocketServer | null;
}

// ---------------------------------------------------------------------------
// Router factory
// ---------------------------------------------------------------------------

export function createApiRouter(
  registry: TenantRegistry,
  wssRef: WssRef
): express.Router {
  const api = express.Router();

  // v-AA Protocol: router-level logging (mounted first)
  api.use((req, res, next) => {
    const start = Date.now();
    try {
      fs.appendFileSync(
        "veda_log.txt",
        `[${new Date().toISOString()}] ROUTER_ENTRY: ${req.method} ${
          req.path
        } (OriginalUrl: ${req.originalUrl || ""})\n`
      );
    } catch (_e) {}
    console.log(`[VEDA_ROUTER] ${req.method} ${req.path}`);
    res.on("finish", () => {
      const duration = Date.now() - start;
      try {
        fs.appendFileSync(
          "veda_log.txt",
          `[${new Date().toISOString()}] ROUTER_FINISH: ${req.method} ${
            req.path
          } -> Done in ${duration}ms\n`
        );
      } catch (_e) {}
      if (duration > 1500) {
        console.warn(
          `[VEDA_PERF_ALERT] ${req.method} ${req.path} took ${duration}ms`
        );
      }
    });
    next();
  });

  // ------------------------------------------------------------------
  // Health
  // ------------------------------------------------------------------

  const healthHandler = (
    req: express.Request,
    res: express.Response
  ) => {
    console.log(`[NET_TRACE] Service health check received.`);
    const { brain } = registry.getTenantContext(req);
    res.json({
      status: "ONLINE",
      brain_id: brain.getSystemID(),
      uptime: process.uptime(),
      server_ts: Date.now(),
      version: "v10.4-hardened",
    });
  };

  api.get("/health", healthHandler);

  // ------------------------------------------------------------------
  // State
  // ------------------------------------------------------------------

  const stateHandler = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const { brain } = registry.getTenantContext(req);
      console.log(
        `[VEDA_STATE_REQUEST] ${
          req.query.fast === "true" ? "FAST" : "FULL"
        } for template token ${brain.getSystemID()}`
      );
      const stateBuffer = brain.getTelemetryBuffer();
      if (!stateBuffer || stateBuffer === "null") {
        return res
          .status(200)
          .json({ status: "INIT", message: "EPIMETIC_ENGINE_CALIBRATING" });
      }

      let state;
      try {
        state = JSON.parse(stateBuffer);
      } catch (_e) {
        console.error("[VEDA_STATE_PARSE_FAULT] Failed to parse state buffer.");
        return res
          .status(200)
          .json({ status: "RECOVERING", error: "BUFFER_CORRUPTION" });
      }

      if (req.query.fast === "true") {
        return res.json({
          status: state.status,
          global_coherence: state.global_coherence,
          server_uptime: process.uptime(),
        });
      }

      const directive = brain.getStrategicDirective();
      if (directive) {
        state.strategic_directive =
          typeof directive === "string" ? directive : directive.directive;
        if (typeof directive !== "string") {
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
        message:
          "The sovereign state handler encountered a critical failure.",
      });
    }
  };

  api.get("/v1/state", stateHandler);
  api.get("/state", stateHandler);

  // ------------------------------------------------------------------
  // Export
  // ------------------------------------------------------------------

  api.get("/v1/export", (req, res) => {
    try {
      const { brain } = registry.getTenantContext(req);
      const data = brain.getResearchExport();
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=veda_research_export.json"
      );
      res.send(JSON.stringify(data, null, 2));
    } catch (e) {
      res.status(500).json({
        error: "EXPORT_ERROR",
        message: e instanceof Error ? e.message : String(e),
      });
    }
  });

  // ------------------------------------------------------------------
  // Action (HTTP)
  // ------------------------------------------------------------------

  api.post("/action", async (req, res) => {
    try {
      const { action, params } = req.body;
      console.log(
        `[VEDA_ACTION] Executing decoupled resolution: ${action}`
      );
      const { actionResolver } = registry.getTenantContext(req);
      const result = await actionResolver.executeAction(action, params);
      res.json(result);
    } catch (e: any) {
      console.error(
        `[API_FAULT] Decoupled resolution of ${req.body?.action} failed:`,
        e
      );
      const errMessage = e instanceof Error ? e.message : String(e);
      const isUnknown = errMessage.includes("UNKNOWN_DIRECTIVE");
      res.status(isUnknown ? 400 : 500).json({
        error: "EXECUTION_ERROR",
        message: errMessage,
      });
    }
  });

  // ------------------------------------------------------------------
  // Misc / Compatibility
  // ------------------------------------------------------------------

  api.get("/ping", (_req, res) =>
    res.json({ pong: true, time: Date.now() })
  );

  api.get("/strategic", async (req, res) => {
    try {
      const { brain } = registry.getTenantContext(req);
      console.log(`[VEDA_OS] Serving strategic metrics...`);
      const report = brain.generateStrategicReport();
      if (!report) {
        return res.status(200).json({
          status: "STBY",
          message: "EPIMETIC_CRYSTALLIZATION",
          metrics: { stability: 0.8, coherence: 1.0 },
        });
      }
      res.json(report);
    } catch (e) {
      console.error("[VEDA_STRATEGIC_FAULT]", e);
      res.status(500).json({
        error: "STRATEGIC_REPORT_ERROR",
        details: e instanceof Error ? e.message : String(e),
        fallback: true,
      });
    }
  });

  api.post("/recall", (req, res) => {
    try {
      const { query } = req.body;
      const { brain } = registry.getTenantContext(req);
      const memories = brain.getCausalRecall(query || "");
      res.json(memories);
    } catch (_e) {
      res.status(500).json({ error: "RECALL_ERROR" });
    }
  });

  api.post("/reset-chat", async (req, res) => {
    try {
      const { brain } = registry.getTenantContext(req);
      await brain.resetChatHistory();
      res.json({ status: "SUCCESS" });
    } catch (_e) {
      res.status(500).json({ error: "RESET_ERROR" });
    }
  });

  // ------------------------------------------------------------------
  // Persistence (local JSON fallback)
  // ------------------------------------------------------------------

  api.get("/persistence", async (req, res) => {
    try {
      const { tenantId } = registry.getTenantContext(req);
      const safeTenantId = tenantId.replace(/[^a-zA-Z0-9_\-]/g, "_");
      const PERSISTENCE_PATH = path.join(
        process.cwd(),
        `veda_persistence_${safeTenantId}.json`
      );
      if (fs.existsSync(PERSISTENCE_PATH)) {
        const data = await fsPromises.readFile(PERSISTENCE_PATH, "utf-8");
        res.json(JSON.parse(data));
      } else {
        res.json({});
      }
    } catch (_e) {
      res.status(500).json({ error: "READ_ERROR" });
    }
  });

  api.post("/persistence", async (req, res) => {
    try {
      const { tenantId } = registry.getTenantContext(req);
      const safeTenantId = tenantId.replace(/[^a-zA-Z0-9_\-]/g, "_");
      const PERSISTENCE_PATH = path.join(
        process.cwd(),
        `veda_persistence_${safeTenantId}.json`
      );
      const data = req.body;
      let existing: Record<string, unknown> = {};
      if (fs.existsSync(PERSISTENCE_PATH)) {
        existing = JSON.parse(
          await fsPromises.readFile(PERSISTENCE_PATH, "utf-8")
        );
      }
      const merged = { ...existing, ...data };
      await fsPromises.writeFile(
        PERSISTENCE_PATH,
        JSON.stringify(merged, null, 2)
      );
      res.json({ success: true });
    } catch (_e) {
      res.status(500).json({ error: "WRITE_ERROR" });
    }
  });

  // ------------------------------------------------------------------
  // Memory
  // ------------------------------------------------------------------

  api.get("/memories", (req, res) => {
    try {
      const { brain } = registry.getTenantContext(req);
      const memories = brain.getAllMemories();
      res.json(memories);
    } catch (_e) {
      res.status(500).json({ error: "FETCH_ERROR" });
    }
  });

  api.post("/feedback", async (req, res) => {
    try {
      const { memoryId, score } = req.body;
      const { brain } = registry.getTenantContext(req);
      await brain.submitFeedback(memoryId, score);
      res.json({ success: true });
    } catch (_e) {
      res.status(500).json({ error: "FEEDBACK_ERROR" });
    }
  });

  // ------------------------------------------------------------------
  // Graph
  // ------------------------------------------------------------------

  api.get("/graph", (req, res) => {
    try {
      const { brain } = registry.getTenantContext(req);
      const data = brain.getGraphData();
      res.json(data);
    } catch (_e) {
      res.status(500).json({ error: "GRAPH_ERROR" });
    }
  });

  // ------------------------------------------------------------------
  // Evolution / cognitive ops
  // ------------------------------------------------------------------

  api.post("/evolve", async (req, res) => {
    try {
      const { brain } = registry.getTenantContext(req);
      const { intent, text } = req.body;
      const result = await brain.processEvolution(intent, null, text);
      res.json(result);
    } catch (_e) {
      res.status(500).json({ error: "EVOLUTION_ERROR" });
    }
  });

  api.post("/verify", (req, res) => {
    try {
      const { brain } = registry.getTenantContext(req);
      const { key } = req.body;
      const result = brain.verifyAuditKeys([key]);
      if (result.verified) {
        res.json({ success: true, token: result.access_token });
      } else {
        res.status(403).json({ error: "VERIFICATION_FAILED" });
      }
    } catch (_e) {
      res.status(500).json({ error: "VERIFY_ERROR" });
    }
  });

  api.post("/synthesize", async (req, res) => {
    try {
      const { brain } = registry.getTenantContext(req);
      const fragment = await brain.synthesizeMemory();
      res.json({ success: true, memory: fragment });
    } catch (_e) {
      res.status(500).json({ error: "SYNTHESIS_ERROR" });
    }
  });

  api.post("/dream", async (req, res) => {
    try {
      const { brain } = registry.getTenantContext(req);
      brain
        .runDreamCycle(wssRef.current)
        .catch((e) => console.error("Dream failed", e));
      res.json({ status: "DREAMING_STARTED" });
    } catch (_e) {
      res.status(500).json({ error: "DREAM_ERROR" });
    }
  });

  // ------------------------------------------------------------------
  // v1 controls
  // ------------------------------------------------------------------

  api.post("/v1/nudge", async (_req, res) => {
    try {
      res.json({ success: true });
    } catch (_e) {
      res.status(500).json({ error: "NUDGE_ERROR" });
    }
  });

  api.post("/v1/toggle-freeze", async (req, res) => {
    try {
      const { brain } = registry.getTenantContext(req);
      const result = brain.toggleLogicFreeze();
      res.json({ success: true, is_frozen: result });
    } catch (_e) {
      res.status(500).json({ error: "FREEZE_ERROR" });
    }
  });

  api.post("/v1/upgrade", async (req, res) => {
    try {
      const { brain } = registry.getTenantContext(req);
      const { stat } = req.body;
      const result = await brain.setSystemTier(
        stat === "ARCHITECT" ? "ARCHITECT" : "STRATEGIC"
      );
      res.json({ success: true, ...result });
    } catch (_e) {
      res.status(500).json({ error: "UPGRADE_ERROR" });
    }
  });

  // ------------------------------------------------------------------
  // Lattice
  // ------------------------------------------------------------------

  api.post("/v1/lattice/pause", async (req, res) => {
    try {
      const { brain } = registry.getTenantContext(req);
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
      res
        .status(500)
        .json({ error: "LATTICE_PAUSE_ERROR", message: e.message || String(e) });
    }
  });

  api.post("/v1/lattice/reorder", async (req, res) => {
    try {
      const { brain } = registry.getTenantContext(req);
      const { id, direction } = req.body;
      if (!id || (direction !== "up" && direction !== "down")) {
        return res.status(400).json({
          error: "Missing required parameters: id or direction ('up'|'down')",
        });
      }
      if (brain.reorderLatticeJob) {
        const success = brain.reorderLatticeJob(id, direction);
        return res.json({ success, id, direction });
      }
      res.status(500).json({ error: "Lattice manager not operational" });
    } catch (e: any) {
      res.status(500).json({
        error: "LATTICE_REORDER_ERROR",
        message: e.message || String(e),
      });
    }
  });

  // ------------------------------------------------------------------
  // Federation
  // ------------------------------------------------------------------

  api.post("/v1/federation/join", async (req, res) => {
    try {
      const { brain } = registry.getTenantContext(req);
      const { nodeId, nodeUrl, coherence } = req.body;
      if (!nodeId || !nodeUrl) {
        return res.status(400).json({
          error: "Missing required parameters: nodeId or nodeUrl",
        });
      }
      const result = await brain.joinFederationNode(
        nodeId,
        nodeUrl,
        Number(coherence || 0.9)
      );
      res.json(result);
    } catch (e: any) {
      console.error("[FEDERATION_JOIN_FAULT]", e);
      res.status(500).json({
        error: "FEDERATION_JOIN_ERROR",
        message: e.message || String(e),
      });
    }
  });

  // ------------------------------------------------------------------
  // TTS proxy
  // ------------------------------------------------------------------

  api.post("/speech/tts", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ error: "Text has zero length" });
      }

      const rawKey = (
        process.env.GEMINI_API_KEY ||
        process.env.API_KEY ||
        ""
      ).trim();
      const isValid =
        rawKey &&
        rawKey.length > 10 &&
        rawKey !== "GEMINI_API_KEY" &&
        rawKey !== "DISABLED_KEY" &&
        rawKey !== "undefined" &&
        rawKey !== "null";

      if (!isValid) {
        console.warn(
          "[VEDA_TTS] API key invalid or missing on server. Directing client to fallback speaker."
        );
        return res.status(400).json({ error: "SERVER_API_KEY_INVALID" });
      }

      const tempAi = new GoogleGenAI({
        apiKey: rawKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const result = await tempAi.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `Say: ${text}` }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" },
            },
          },
        },
      });

      const base64Audio =
        result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({ success: true, audio: base64Audio });
      } else {
        return res
          .status(500)
          .json({ error: "Empty model inlineData waveform buffer payload" });
      }
    } catch (err: any) {
      console.error(
        "[VEDA_TTS_ERROR] Server speech proxy exception caught:",
        err
      );
      return res
        .status(500)
        .json({ error: err.message || "Synthesis session crash" });
    }
  });

  // ------------------------------------------------------------------
  // 404 catch-all for /api/*
  // ------------------------------------------------------------------

  api.all("/*", (req, res) => {
    res.status(404).json({ error: "NOT_FOUND", path: req.originalUrl });
  });

  return api;
}
