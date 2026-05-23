import axios from "axios";
import { BrainData, Reminder, GroundingSource, EvolutionStatus, ChatStreamResult, LongVideoProject } from "../types";
import { MemoryManager, PrivacyEngine } from "./memoryService";
import { knbService } from "./knbService";
import { taskService } from "./taskService";

// Causal Cache Infrastructure
const CACHE_TTLS = {
  STATE: 1500, // Reduced for real-time reactivity
  BASELINE: 600000,
  KNB: 30000,
  HEALTH: 10000,
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const _cache = new Map<string, CacheEntry<any>>();

function getFromCache<T>(key: string, ttl: number): T | null {
  const entry = _cache.get(key);
  if (entry && (Date.now() - entry.timestamp < ttl)) {
    console.log(`[VEDA_CACHE] Valid hit for ${key}. TTL Remainder: ${ttl - (Date.now() - entry.timestamp)}ms`);
    return entry.data;
  }
  return null;
}

function setToCache<T>(key: string, data: T): void {
  _cache.set(key, { data, timestamp: Date.now() });
}

function invalidateCache(key?: string): void {
  if (key) {
    console.log(`[VEDA_CACHE] Invalidating key: ${key}`);
    _cache.delete(key);
  } else {
    console.log(`[VEDA_CACHE] Global reset.`);
    _cache.clear();
  }
}

let memoryManager: MemoryManager | null = null;
let privacyEngine: PrivacyEngine | null = null;

export interface SystemState {
  rejectionCount: number;
  isFocusMode: boolean;
  isLocked: boolean;
  global_coherence?: number;
  memory?: string;
  reminders?: Reminder[];
  sensorData?: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    imu: { accel: number; gyro: number };
  };
}

async function fetchWithRetry(url: string, options?: RequestInit, retries = 5, delay = 1000, timeout = 60000): Promise<Response> {
  let targetUrl = url;
  
  // WSST: Use absolute URL resolution for internal API calls to prevent path ambiguities in proxy environments
  if (typeof window !== 'undefined' && targetUrl.startsWith('/api')) {
    targetUrl = `${window.location.origin}${targetUrl}`;
  }
  
  // Cache busting for health checks
  if (targetUrl.includes('/health')) {
    targetUrl += (targetUrl.includes('?') ? '&' : '?') + `v_cb=${Date.now()}`;
  }
  
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      console.log(`[VEDA_FETCH] Attempt ${i + 1} for ${targetUrl}`);
      
      const response = await fetch(targetUrl, {
        ...options,
        signal: controller.signal,
        credentials: 'include', // Important for CORS if origin differs
        headers: {
          'Accept': 'application/json',
          ...options?.headers,
        }
      });
      
      clearTimeout(timeoutId);
      console.log(`[VEDA_FETCH] Response for ${targetUrl}: ${response.status} ${response.statusText}`);

      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      if (response.ok) {
        if (!isJson && targetUrl.includes("/api/")) {
          const text = await response.text();
          const previewSnippet = text.trim().substring(0, 100);
          console.error(`[VEDA_FETCH] Protocol Inversion: Expected JSON but got HTML for ${targetUrl}. This usually means a server routing error or 404.`);
          
          // v-AA Strategy: Throw a structured error that can be handled as a "System Desync"
          throw new Error(`API_ROUTING_ERROR: Received HTML at ${targetUrl}. Body preview: ${previewSnippet}`);
        }
        return response;
      }
      
      if (response.status === 404) {
        throw new Error(`ENDPOINT_NOT_FOUND: 404 - ${targetUrl}. The server path does not exist.`);
      }

      if (response.status === 429) {
        console.warn(`[VEDA_FETCH] Rate limit (429) hit for ${targetUrl}.`);
        throw new Error(`RATE_LIMIT_EXCEEDED: 429 - System load is too high.`);
      }

      if (response.status >= 500) {
        console.warn(`[VEDA_FETCH] Server error ${response.status} for ${targetUrl}. Retrying...`);
      } else {
        // For 4xx errors, try to get JSON error message if available
        if (isJson) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
        } else {
          const text = await response.text();
          throw new Error(`Request failed with status ${response.status}: ${text.substring(0, 100)}`);
        }
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      
      if (err.name === 'AbortError') {
        console.warn(`[VEDA_FETCH] Request Timeout for ${targetUrl} (Attempt ${i + 1}/${retries})`);
        if (i === retries - 1) {
          throw new Error(`Request Timeout: The server took too long to respond at ${targetUrl} (${timeout}ms limit).`);
        }
      } else if (i === retries - 1) {
        console.error(`[VEDA_FETCH] Final failure for ${targetUrl}:`, err);
        throw new Error(`Network Error: Unable to reach ${targetUrl}. Details: ${err.message}`);
      }

      console.warn(`[VEDA_FETCH] Attempt ${i + 1} failed for ${targetUrl}. Retrying in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
      delay *= 1.5;
    }
  }
  throw new Error(`Failed to fetch ${targetUrl} after ${retries} attempts`);
}

export const vedaService = {
  socket: null as WebSocket | null,
  onStateUpdate: null as ((data: any) => void) | null,

  setupWebSocket(onUpdate: (data: any) => void) {
    this.onStateUpdate = onUpdate;
    if (this.socket) return;
    
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const socket = new WebSocket(`${protocol}//${host}`);

      socket.onopen = () => {
        console.log("[VEDA_SOCKET] Logic link established.");
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'VEDA_STATE_FULL' || message.type === 'VEDA_STATE_PARTIAL') {
            if (this.onStateUpdate) this.onStateUpdate(message.data);
          } else if (message.type === 'SYSTEM_MONOLOGUE') {
            // Handle monologue if needed, maybe trigger a notification or update logs
          } else if (message.type === 'PONG') {
            // Heartbeat received
          }
        } catch (e) {
          console.error("[VEDA_SOCKET_ERR] Payload disruption:", e);
        }
      };

      socket.onclose = () => {
        console.warn("[VEDA_SOCKET] Logic link severed. Re-anchoring in 5s...");
        this.socket = null;
        setTimeout(() => this.setupWebSocket(onUpdate), 5000);
      };

      socket.onerror = (err) => {
        console.error("[VEDA_SOCKET_ERR] Transmission fault:", err);
      };

      this.socket = socket;

      // Heartbeat
      const heartbeat = setInterval(() => {
        if (this.socket?.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({ type: 'PING' }));
        } else {
          clearInterval(heartbeat);
        }
      }, 30000);

    } catch (e) {
      console.error("[VEDA_SOCKET_BOOT_ERR] Failed to initiate logic link:", e);
    }
  },

  async *chatStream(
    history: { role: 'user' | 'model'; text: string; image?: string }[],
    state?: Partial<BrainData>,
    architect?: { name: string; interests?: string },
    isArchitect: boolean = false
  ): AsyncGenerator<ChatStreamResult> {
    try {
      const lastUserMsg = history[history.length - 1]?.text || "";
      const entropySeed = state?.sensorData ? state.sensorData.imu.accel + state.sensorData.imu.gyro : undefined;

      // VEDA v29.6: Local Logic Manifold - Prevents sovereign data leakage
      const localNode = await this.checkLocalNode();
      const useLocal = localNode.available && localNode.models?.includes("gemma4");

      if (useLocal) {
        console.log("[VEDA_SERVICE] Diverting to Local Manifold (Gemma 4)...");
        const localResponse = await this.chatLocalStream(history, state);
        for await (const chunk of localResponse) {
          yield chunk;
        }
        return;
      }

      // --- [Neural Trace Simulation] ---
      const traceSteps = [
        { msg: " causal_drift_analysis", axiom: state?.axioms?.[0] },
        { msg: " local_manifold_cross_reference", coherence: state?.global_coherence },
        { msg: " collective_intelligence_factoring", strength: state?.collectiveStrength },
        { msg: " active_inference_minimization", freeEnergy: state?.entropy },
        { msg: " sovereign_logic_reconstruction", phi: state?.phi }
      ];

      const currentTrace: any[] = [];
      for(const step of traceSteps) {
        currentTrace.push({
          step: step.msg,
          axiom: step.axiom,
          coherence: step.coherence || (0.8 + Math.random() * 0.15)
        });
        yield { 
          text: "", 
          thought_trace: [...currentTrace],
          sovereign_confidence: state?.sovereign_confidence,
          reasoning_mode: state?.reasoning_mode
        };
        await new Promise(r => setTimeout(r, 400)); 
      }

      // V-AA Protocol: High-density server-side inference
      console.log("[VEDA_SERVICE] Diverting to Sovereign Backend Inference...");
      
      const res = await fetchWithRetry("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "generateSovereignResponse", 
          params: { text: lastUserMsg } 
        })
      });
      
      const apiResult = await res.json();
      const finalResult = apiResult.data || {};
      
      yield { 
        text: finalResult.response || "[VEDA_FAULT]: 伺服器響應為空。",
        sovereign_confidence: finalResult.confidence || state?.sovereign_confidence,
        reasoning_mode: finalResult.reasoning_mode || state?.reasoning_mode,
        actions: finalResult.actions || [],
        thought_trace: currentTrace,
        isDone: true 
      };

      return;
    } catch (err: any) {
      console.error("[VEDA_SERVICE] Chat error details:", err);
      const errorMsg = err.message || JSON.stringify(err);
      const isQuotaError = errorMsg.includes("429") || err.status === 429 || (err.error && err.error.code === 429) || errorMsg.includes("quota");
      
      if (isQuotaError) {
        console.warn("[VEDA_SERVICE] Chat quota exceeded.");
        yield { text: "系統目前負載過高，或已觸及配額邊界。我的處理單元正在排隊等待資源。", isDone: true };
      } else if (errorMsg.includes("offline") || errorMsg.includes("network")) {
        yield { text: "檢測到外部認識論鏈路不穩定。請檢查您的連線狀態。", isDone: true };
      } else {
        const detailedError = `[PROTOCOL_INTERRUPTION] ${errorMsg.substring(0, 50)}`;
        yield { text: `${detailedError}。核心已執行保護性凍結，請重新嘗試。`, isDone: true };
      }
    }
  },

  async chat(text: string, state?: Partial<BrainData>, isArchitect: boolean = false): Promise<ChatStreamResult> {
    const history = [{ role: 'user' as const, text }];
    const stream = this.chatStream(history, state, undefined, isArchitect);
    let finalResult: ChatStreamResult = { text: "" };
    for await (const chunk of stream) {
      if (chunk.text) finalResult.text = chunk.text;
      if (chunk.imageUrl) finalResult.imageUrl = chunk.imageUrl;
      if (chunk.videoUrl) finalResult.videoUrl = chunk.videoUrl;
      if (chunk.audioUrl) finalResult.audioUrl = chunk.audioUrl;
      if (chunk.sources) finalResult.sources = chunk.sources;
      if (chunk.suggestions) finalResult.suggestions = chunk.suggestions;
      if (chunk.sovereign_confidence) finalResult.sovereign_confidence = chunk.sovereign_confidence;
      if (chunk.reasoning_mode) finalResult.reasoning_mode = chunk.reasoning_mode;
      if (chunk.thought_trace) finalResult.thought_trace = chunk.thought_trace;
      if (chunk.actions) finalResult.actions = chunk.actions;
      if (chunk.isDone) finalResult.isDone = true;
    }
    return finalResult;
  },

  activeFetchPromise: null as Promise<BrainData> | null,
  async getData(forceRefresh = false): Promise<BrainData> {
    if (!forceRefresh) {
      const cached = getFromCache<BrainData>("SYSTEM_STATE", CACHE_TTLS.STATE);
      if (cached) return cached;
    }

    if (this.activeFetchPromise) {
      return this.activeFetchPromise;
    }

    this.activeFetchPromise = (async () => {
      try {
        console.log("[VEDA_SERVICE] Fetching system state (Reliability Mode)...");
        // PROTOCOL V5.1: 15 retries, 2000ms delay, 30s timeout
        const res = await fetchWithRetry("/api/v1/state", { method: "GET" }, 15, 2000, 30000);
        const json = await res.json();
        const finalData = {
          ...json,
          global_coherence: json.global_coherence ?? 0.85,
          status_code: json.status_code ?? EvolutionStatus.IDLE
        };
        
        setToCache("SYSTEM_STATE", finalData);
        return finalData;
      } catch (error: any) {
        console.error("[VEDA_SERVICE] getData definitive failure:", error);
        // If everything fails, try one last time with the FAST path (Epistemic Sandbox)
        try {
          console.log("[VEDA_SERVICE] Falling back to FAST path...");
          const fastUrl = `${window.location.origin}/api/v1/state?fast=true`;
          const fastRes = await fetch(fastUrl, { headers: { 'Accept': 'application/json' } });
          const contentType = fastRes.headers.get("content-type");
          if (fastRes.ok && contentType?.includes("application/json")) {
             const fastData = await fastRes.json();
             setToCache("SYSTEM_STATE", fastData);
             return fastData;
          }
          console.warn(`[VEDA_SERVICE] Fast path rejected: ${fastRes.status} | Content: ${contentType}`);
        } catch (fastErr) {
          console.error("[VEDA_SERVICE] Fast path also failed.");
        }
        throw error;
      } finally {
        this.activeFetchPromise = null;
      }
    })();

    return this.activeFetchPromise;
  },

  async checkHealth(): Promise<{ status: string; latency: number }> {
    const cached = getFromCache<{ status: string; latency: number }>("SYSTEM_HEALTH", CACHE_TTLS.HEALTH);
    if (cached) return cached;

    const start = performance.now();
    try {
      // Increased timeout to 15s for health check
      const res = await fetchWithRetry("/api/health", { method: "GET" }, 2, 1000, 15000);
      const latency = performance.now() - start;
      const result = { status: res.ok ? "HEALTHY" : "DEGRADED", latency };
      setToCache("SYSTEM_HEALTH", result);
      return result;
    } catch (e) {
      console.warn("[VEDA_SERVICE] Primary health check failed. Attempting low-level pulse check...");
      try {
        const pulseRes = await fetch(`${window.location.origin}/_veda_pulse`);
        if (pulseRes.ok) {
          const latency = performance.now() - start;
          const result = { status: "DEGRADED", latency, message: "API_LOGIC_INIT_PENDING" };
          setToCache("SYSTEM_HEALTH", result);
          return result;
        }
      } catch (pulseErr) {}
      
      const result = { status: "OFFLINE", latency: performance.now() - start };
      setToCache("SYSTEM_HEALTH", result);
      return result;
    }
  },

  async evolve(intent: number[], text?: string): Promise<BrainData> {
    invalidateCache("SYSTEM_STATE");
    const res = await fetchWithRetry("/api/evolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent, text }),
    });
    if (!res.ok) throw new Error("Evolution failed");
    const json = await res.json();
    setToCache("SYSTEM_STATE", json);
    return json;
  },

  async verify(key: string): Promise<boolean> {
    try {
      const res = await fetchWithRetry("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim() }),
      });
      return res.ok;
    } catch (error) {
      console.error("[VEDA_SERVICE] Verify error:", error);
      return false;
    }
  },

  async synthesize(): Promise<{ success: boolean; memory?: any; message?: string }> {
    invalidateCache("SYSTEM_STATE");
    const res = await fetchWithRetry("/api/synthesize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  async updateSensorData(data: any): Promise<any> {
    const res = await fetchWithRetry("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateSensorData", params: data }),
    });
    return res.json();
  },

  async distill(): Promise<any> {
    const res = await fetchWithRetry("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "distillMemories", params: {} }),
    });
    return res.json();
  },

  async pruneNeuralFragment(id: string): Promise<boolean> {
    // Attempt WebSocket first
    const self = vedaService as any;
    if (self.socket && self.socket.readyState === 1) {
      self.socket.send(JSON.stringify({ type: 'NEURAL_PRUNE', id }));
      return true;
    }
    const res = await fetchWithRetry("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "prune", params: { id } }),
    });
    return res.ok;
  },

  async updateAxioms(axioms: string[]): Promise<any> {
    const res = await fetchWithRetry("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateAxioms", params: { axioms } }),
    });
    return res.json();
  },

  async triggerResonance(intensity: number = 0.1): Promise<any> {
    const res = await fetchWithRetry("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "triggerResonance", params: { intensity } }),
    });
    return res.json();
  },

  async nudgeArchitect(params: { mutationRate?: number; mutationStrength?: number; stabilityWeight?: number; trendWeight?: number }): Promise<any> {
    const res = await fetchWithRetry("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "nudgeArchitect", params }),
    });
    return res.json();
  },

  async updateSettings(settings: any): Promise<any> {
    const res = await fetchWithRetry("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateSettings", params: settings }),
    });
    return res.json();
  },

  async toggleLogicFreeze(): Promise<any> {
    const res = await fetchWithRetry("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggleLogicFreeze", params: {} }),
    });
    return res.json();
  },
  
  async activateBurst(target: string = "Sovereign Optimization", intensity: number = 0.5, manualApproval: boolean = false, mode: string = "DEFENSIVE_COUNTER"): Promise<any> {
    const res = await fetchWithRetry("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "activateBurst", params: { target, intensity, manualApproval, mode } }),
    });
    return res.json();
  },

  async approveBurst(): Promise<any> {
    const res = await fetchWithRetry("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approveBurst", params: {} }),
    });
    return res.json();
  },
  
  async toggleSteadyState(active: boolean): Promise<any> {
    const res = await fetchWithRetry("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggleSteadyState", params: { active } }),
    });
    return res.json();
  },

  async toggleNanosecondSync(active: boolean): Promise<any> {
    const res = await fetchWithRetry("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggleNanosecondSync", params: { active } }),
    });
    return res.json();
  },

  async deactivateBurst(reason: string = "MANUAL"): Promise<any> {
    const res = await fetchWithRetry("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deactivateBurst", params: { reason } }),
    });
    return res.json();
  },

  async ingestStream(data: string[]): Promise<any> {
    const res = await fetchWithRetry("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ingestStream", params: { data } }),
    });
    return res.json();
  },

  async createTemporalAnchor(label: string): Promise<any> {
    const res = await fetchWithRetry("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "createTemporalAnchor", params: { label } }),
    });
    return res.json();
  },

  async timeTravel(anchorId: string): Promise<any> {
    const res = await fetchWithRetry("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "timeTravel", params: { anchorId } }),
    });
    return res.json();
  },

  async getMemories(): Promise<any[]> {
    const res = await fetchWithRetry("/api/memories");
    return res.json();
  },

  async getGraphData(): Promise<{ nodes: any[], links: any[] }> {
    const res = await fetchWithRetry("/api/graph");
    return res.json();
  },

  async getStrategicMetrics(): Promise<any> {
    const res = await fetchWithRetry("/api/strategic");
    return res.json();
  },

  async submitFeedback(memoryId: string, score: number): Promise<any> {
    const res = await fetchWithRetry("/api/feedback", {
      method: "POST",
      body: JSON.stringify({ memoryId, score })
    });
    return res.json();
  },

  async getPersistence(): Promise<any> {
    const res = await fetchWithRetry("/api/persistence");
    return res.json();
  },

  async updatePersistence(data: any): Promise<any> {
    const res = await fetchWithRetry("/api/persistence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async imagine(prompt: string): Promise<string | null> {
    const res = await this.postAction({ action: 'imagine', params: { prompt } });
    return res?.data || res;
  },

  async animate(prompt: string): Promise<string | null> {
    const res = await this.postAction({ action: 'animate', params: { prompt } });
    return res?.data || res;
  },

  async synthesizeAudio(prompt: string): Promise<string | null> {
    const res = await this.postAction({ action: 'synthesizeAudio', params: { prompt } });
    return res?.data || res;
  },

  async setSystemTier(tier: string): Promise<any> {
    return this.postAction({ action: 'setSystemTier', params: { tier } });
  },

  async dream(): Promise<any> {
    const res = await fetchWithRetry("/api/dream", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    return res.json();
  },

  async generateMusic(prompt: string): Promise<string | null> {
    // Audio synthesis currently disabled or redirected to server.
    return null;
  },

  setInitialMemories(memories: any[]) {
    const apiKey = "HIDDEN_CLIENT_SIDE"; // Handled server-side
    if (!memoryManager) {
      // Memory manager can still exist client-side for state transitions, but logic is proxied
      memoryManager = new MemoryManager("HIDDEN", memories, (m) => {
        vedaService.updatePersistence({ longTermMemories: m });
      });
    } else {
      memoryManager.setMemories(memories);
    }
  },
  
  clearCache(): void {
    memoryManager?.clearCache();
  },

  getAI(): { ai: any; memory: MemoryManager | null; privacy: PrivacyEngine | null } {
    return { ai: null, memory: memoryManager, privacy: privacyEngine };
  },

  async postAction(payload: { action: string; params: any }): Promise<any> {
    // 1. Invalidate local cache
    invalidateCache("SYSTEM_STATE");

    // 2. Performance: Try via WebSocket for established links
    if (this.socket?.readyState === WebSocket.OPEN) {
      return new Promise((resolve, reject) => {
        const requestId = Math.random().toString(36).substring(7);
        const timeout = setTimeout(() => {
          this.socket?.removeEventListener('message', handleSocketMessage);
          reject(new Error("SOCKET_ACTION_TIMEOUT"));
        }, 15000);

        const handleSocketMessage = (event: MessageEvent) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'ACTION_RESULT' && msg.requestId === requestId) {
              clearTimeout(timeout);
              this.socket?.removeEventListener('message', handleSocketMessage);
              if (msg.result.success) resolve(msg.result.data);
              else reject(new Error(msg.result.error || "UNKNOWN_SOCKET_ACTION_FAULT"));
            }
          } catch (e) {}
        };

        this.socket.addEventListener('message', handleSocketMessage);
        this.socket.send(JSON.stringify({ type: 'EXECUTE_ACTION', ...payload, requestId }));
      });
    }

    // 3. Reliability: Fallback to standard HTTP for initial boot or broken links
    const res = await fetchWithRetry("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async reportSafetyAlert(params: { type: string, description: string, user_mask: string, severity: string }): Promise<any> {
    return this.postAction({ action: "reportSafetyAlert", params });
  },

  async submitLatticeTask(type: string, payload: any): Promise<any> {
    return this.postAction({ action: "submitLatticeTask", params: { type, payload } });
  },

  async solidifyLatticeJob(jobId: string, result: any, coherence: number = 0.95): Promise<any> {
    return this.postAction({ action: "solidifyLatticeJob", params: { jobId, result, coherence } });
  },

  async executeApprovedActions(actions: any[]): Promise<any[]> {
    const results = [];
    for (const call of actions) {
      try {
        if (call.name === "learnFragment") {
          await knbService.addFragment(call.args.content, { type: call.args.type, source: 'VEDA_CORE_APPROVED' });
          results.push({ name: call.name, success: true });
        } else {
          const res = await this.postAction({ action: call.name, params: call.args });
          results.push({ name: call.name, result: res });
        }
      } catch (e) {
        results.push({ name: call.name, error: e });
      }
    }
    return results;
  },

  async checkLocalNode(): Promise<{ available: boolean; version?: string; models?: string[] }> {
    try {
      // Check Ollama by default with a short 1.5s timeout to prevent blocking startup/first-fetch
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1500);
      
      const response = await fetch('http://localhost:11434/api/tags', { signal: controller.signal });
      clearTimeout(id);
      
      if (response.ok) {
        const data = await response.json();
        return { 
          available: true, 
          version: "Ollama/Local", 
          models: data.models?.map((m: any) => m.name) || [] 
        };
      }
      return { available: false };
    } catch (err) {
      return { available: false };
    }
  },

  async *chatLocalStream(
    history: { role: 'user' | 'model'; text: string }[],
    model: string = 'gemma2'
  ): AsyncGenerator<ChatStreamResult> {
    try {
      const prompt = history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n');
      
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: true
        })
      });

      if (!response.ok) throw new Error('Local node connection failed');
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);
            if (json.response) {
              fullText += json.response;
              yield { text: fullText, isDone: json.done };
            }
          } catch (e) {
            console.error("Error parsing local stream chunk", e);
          }
        }
      }
    } catch (err: any) {
      yield { text: `[LOCAL_NODE_ERROR]: ${err.message}`, isDone: true };
    }
  },

  async distillAxioms(memories: string[], currentAxioms: string[]): Promise<string[]> {
    const res = await this.postAction({ action: 'distillAxioms', params: { memories, currentAxioms } });
    return res?.data || currentAxioms;
  },

  async initiateCinemaProject(prompt: string): Promise<any> {
    return this.postAction({ action: 'initiateCinemaProject', params: { prompt } });
  },

  async synthesizeScene(projectId: string, sceneId: string, project: LongVideoProject): Promise<any> {
    return this.postAction({ action: 'synthesizeScene', params: { projectId, sceneId, project } });
  },

  async distillProjectContext(project: LongVideoProject): Promise<any> {
    const res = await this.postAction({ action: 'distillProjectContext', params: { project } });
    return res?.data || res;
  },

  async pruneCinemaProject(id: string): Promise<any> {
    return this.postAction({ action: 'pruneCinemaProject', params: { id } });
  },

  async updateProjectWorldModel(projectId: string, stateUpdate: any, causalEvent: string): Promise<any> {
    return this.postAction({ action: 'updateProjectWorldModel', params: { projectId, stateUpdate, causalEvent } });
  },

  async initiateStrategicReport(title: string, intent: string): Promise<any> {
    return this.postAction({ action: 'initiateStrategicReport', params: { title, intent } });
  },

  async synthesizeReportSection(reportId: string, sectionId: string): Promise<any> {
    return this.postAction({ action: 'synthesizeReportSection', params: { reportId, sectionId } });
  },

  async batchSynthesizeReport(reportId: string): Promise<any> {
    return this.postAction({ action: 'batchSynthesizeReport', params: { reportId } });
  }
};
