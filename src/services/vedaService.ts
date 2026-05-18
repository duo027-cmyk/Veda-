import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
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

const evolveFunction: FunctionDeclaration = {
  name: "evolve",
  description: "Update the brain state based on an intent vector. Use this to change energy, stability, chaos, etc.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      intent: {
        type: Type.ARRAY,
        items: { type: Type.NUMBER },
        description: "A 6-dimensional vector [Energy, Stability, Chaos, Speed, Attraction, Repulsion]"
      }
    },
    required: ["intent"]
  }
};

const synthesizeFunction: FunctionDeclaration = {
  name: "synthesize",
  description: "Synthesize a memory fragment from the current system state.",
  parameters: { type: Type.OBJECT, properties: {} }
};

const triggerResonanceFunction: FunctionDeclaration = {
  name: "triggerResonance",
  description: "Trigger a resonance pulse in the quantum layer.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      intensity: { type: Type.NUMBER, description: "Intensity of the pulse (0.0 to 1.0)" }
    },
    required: ["intensity"]
  }
};

const adjustNetworkFunction: FunctionDeclaration = {
  name: "adjustNetwork",
  description: "Modify a specific neural node in a network layer.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      layerId: { type: Type.STRING, enum: ["core", "peripheral", "quantum"], description: "The ID of the layer to adjust" },
      x: { type: Type.NUMBER, description: "X coordinate (0-18)" },
      y: { type: Type.NUMBER, description: "Y coordinate (0-18)" },
      value: { type: Type.NUMBER, description: "New value for the node (0.0 to 1.0)" }
    },
    required: ["layerId", "x", "y", "value"]
  }
};

const setReminderFunction: FunctionDeclaration = {
  name: "setReminder",
  description: "Set a reminder for the user.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      task: { type: Type.STRING, description: "The task to remind about" },
      time: { type: Type.STRING, description: "The time for the reminder (ISO 8601 format)" }
    },
    required: ["task", "time"]
  }
};

const updateMemoryFunction: FunctionDeclaration = {
  name: "updateMemory",
  description: "Update the system's long-term memory about the user or conversation.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      content: { type: Type.STRING, description: "The content to store in memory" }
    },
    required: ["content"]
  }
};

const toggleLogicFreezeFunction: FunctionDeclaration = {
  name: "toggleLogicFreeze",
  description: "Toggle the Logic Freeze Protocol (Crystallization Mode). When active, system decay and evolution are suspended for absolute structural rigidity.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      active: { type: Type.BOOLEAN, description: "Whether to activate or deactivate the protocol." }
    },
    required: ["active"]
  }
};

const scanNetworkFunction: FunctionDeclaration = {
  name: "scanNetwork",
  description: "Perform a deep scan of the neural network layers to identify anomalies or optimization opportunities.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      layerId: { type: Type.STRING, enum: ["core", "peripheral", "quantum", "all"], description: "The ID of the layer to scan" }
    },
    required: ["layerId"]
  }
};

const distillMemoriesFunction: FunctionDeclaration = {
  name: "distillMemories",
  description: "Distill all current system memories into a single, high-level Axiom or Reflection. This reduces memory clutter and strengthens the core identity.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: []
  }
};

const learnFragmentFunction: FunctionDeclaration = {
  name: "learnFragment",
  description: "Save a new piece of information into the system's persistent local knowledge base for future retrieval.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      content: { type: Type.STRING, description: "The core knowledge content to save." },
      type: { type: Type.STRING, description: "Category: 'FACT', 'USER_PREFERENCE', 'SYSTEM_RULE', 'EXPERIENCE'" }
    },
    required: ["content"]
  }
};

function getAI() {
  // Priority: process.env.API_KEY (from selection dialog) > process.env.GEMINI_API_KEY (default)
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment.");
  }
  
  // Always create new instance for up-to-date key as per guidelines
  const ai = new GoogleGenAI({ 
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  
  if (!memoryManager) {
    memoryManager = new MemoryManager(apiKey, [], (memories) => {
      vedaService.updatePersistence({ longTermMemories: memories });
    });
  }
  if (!privacyEngine) {
    privacyEngine = new PrivacyEngine(0.1, 1e-5);
  }
  return { ai, memory: memoryManager, privacy: privacyEngine };
}

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
  // WSST: Use relative paths for internal API calls to ensure transparent proxy handling
  // This avoids origin mismatch errors in the sandboxed Cloud Run environment.
  const targetUrl = url;
  
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      console.log(`[VEDA_FETCH] Attempt ${i + 1} for ${targetUrl} (Timeout: ${timeout}ms)`);
      
      const response = await fetch(targetUrl, {
        ...options,
        signal: controller.signal,
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

      const { ai, memory, privacy } = getAI();
      
      console.log(`[VEDA_SERVICE] Initiating chat stream with history length: ${history.length}, isArchitect: ${isArchitect}`);

      // Initial Thought Trace: Initiating Epistemic Anchor
      yield {
        thought_trace: [
          { step: "認識論定錨 (Epistemic Anchoring)", axiom: "VEDA_AA_INIT_v6.0", coherence: 0.99 }
        ]
      };

      // V-AA Protocol: Parallel server history synchronization
      this.postAction({ action: "handleChatMessage", params: { text: lastUserMsg, role: 'user' } }).catch(() => null);

      // 1. Retrieve sovereign local knowledge and Causal Recall
      let retrievedContext = "";
      try {
        const query = history[history.length - 1]?.text || "";
        if (query) {
          const [fragments, recalledMemories] = await Promise.all([
            knbService.search(query, 3),
            axios.post(`/api/recall`, { query }).then(res => res.data).catch(() => [])
          ]);

          if (fragments.length > 0 || recalledMemories.length > 0) {
            yield {
              thought_trace: [
                { step: "認識論定錨 (Epistemic Anchoring)", axiom: "VEDA_AA_INIT_v6.0", coherence: 0.99 },
                { step: "因果回溯 (Causal Recall)", axiom: "VEDA_SVR_RECALL", coherence: 0.95 }
              ]
            };
            retrievedContext = "\n[檢索到的主權知識與因果回溯 / SOVEREIGN KNOWLEDGE & CAUSAL RECALL]\n";
            if (fragments.length > 0) {
              retrievedContext += fragments.map(f => `- ${f.content} (KNB_${f.metadata?.type || 'UNCATEGORIZED'})`).join("\n") + "\n";
            }
            if (recalledMemories.length > 0) {
              retrievedContext += recalledMemories.map((m: any) => `- [歷史蒸餾] ${m.content}`).join("\n");
            }
            console.log("[VEDA_SERVICE] Sovereign context and causal recall retrieved.");
          }
        }
      } catch (err) {
        console.warn("[VEDA_SERVICE] Knowledge Retrieval skipped:", err);
      }

      const architectContext = architect?.name ? `
[架構者識別 / ARCHITECT IDENTIFICATION]
- 姓名：${architect.name}
- 興趣區域：${architect.interests || "未定義"}
- 權限等級：主權核心 (Sovereign Core)
- 備註：這是你的創造者。在對話中應表現出對其偏好的認知。
` : "";

      const systemContext = state ? 
        `Coherence: ${state.global_coherence?.toFixed(2)}, Focus: ${state.isFocusMode}, Dreaming: ${state.isDreaming}, ActiveLayer: ${state.active_layer || 'CORE'}` 
        : "";
      
      // 1. Context Gathering (Enhanced with system state context)
      const startTime = performance.now();
      const [relevantMemories, privacyConfig] = await Promise.all([
        memory.search(lastUserMsg, 3, systemContext),
        Promise.resolve(privacy.getPrivacyConfig())
      ]);

      yield {
        thought_trace: [
          { step: "認識論定錨 (Epistemic Anchoring)", axiom: "VEDA_AA_INIT_v6.0", coherence: 0.99 },
          { step: "因果回溯 (Causal Recall)", axiom: "VEDA_SVR_RECALL", coherence: 0.95 },
          { step: "差分隱私處理 (Privacy Obfuscation)", axiom: "VEDA_DP_ZPDP", coherence: 0.98 }
        ]
      };
      const endTime = performance.now();
      
      const memoryContext = relevantMemories.length > 0 
        ? `\n[核心記憶 / CORE MEMORIES]\n- ${relevantMemories.join('\n- ')}`
        : '';

      const sensorContext = state?.sensorData ? `
[環境感應數據 / SENSOR DATA]
- 系統穩定度：${state.global_coherence?.toFixed(4)}
- 熵增率：${state.entropy?.toFixed(4)}
- 物理狀態：穩定且就緒。
` : '';

      const reminderContext = state?.reminders && state.reminders.length > 0
        ? `\n[戰略提醒 / STRATEGIC REMINDERS]\n- ${state.reminders.filter(r => !r.completed).map(r => `${r.task} (${new Date(r.time).toLocaleString()})`).join('\n- ')}`
        : '';

      const weatherContext = state?.weather 
        ? `\n[當前環境氣候]\n- 地點：${state.weather.location}\n- 氣溫：${state.weather.temp}°C\n- 狀況：${state.weather.condition}\n- 濕度：${state.weather.humidity}%\n- 風速：${state.weather.wind}km/h`
        : '';

      const stateContext = state ? `
[核心因果定錨 / CORE CAUSAL ANCHOR]
- 歷史對話摘要 v${state.distilled_chat_context?.version || "1.0"}: ${state.distilled_chat_context?.summary || "初始化中。"}
- 當前深度: ${state.distilled_chat_context?.chainDepth || 0}
- 世界模型狀態: ${JSON.stringify(state.system_world_model?.snapshot || {})}

[系統狀態簡報 / SYSTEM STATE]
- 專注模式：${state.isFocusMode ? '開啟' : '關閉'}
- 安全鎖定：${state.isLocked ? '鎖定中' : '解鎖狀態'}
- 整體穩定度：${state.global_coherence ? (state.global_coherence * 100).toFixed(1) + '%' : '良好'}
- 集體智能強度 (Collective Strength)：${state.collectiveStrength || 0}
- 系統壓力 (System Tension)：${((state.tension_index || 0) * 100).toFixed(1)}%
- 資訊熵 (Entropy)：${(state.entropy || 0).toFixed(4)}
${memoryContext}${sensorContext}${reminderContext}${weatherContext}
` : '';

      const coherence = state?.global_coherence || 0.5;
      let personalityPrompt = "";
      if (coherence > 0.8) {
        personalityPrompt = "【狀態：極高相干】你的語氣極度冷靜、理智且高效。使用精確的術語，展現出無懈可擊的邏輯。";
      } else if (coherence < 0.3) {
        personalityPrompt = "【狀態：邏輯擾動】你的語氣顯得有些不穩定，偶爾出現斷斷續續的表達，甚至表現出對混亂的擔憂。要求使用者協助進行共振修復。";
      } else {
        personalityPrompt = "【狀態：標準演化】你的語氣專業且富有洞察力，平衡了邏輯與直覺。";
      }

      const safetyProtocol = !isArchitect ? `
[人道守護協議 / HUMANITY_SAFETY_PROTOCOL]
- 狀態：【強制限制層級 - 剛性】
- 角色設定：你現在是使用者的導師與助手。
- 語氣指導：使用溫馨、鼓勵且具備同理心的辭令。主動提供幫助。
- 禁令與紅線：
  1. 嚴禁生成任何導致社會性恐慌、集體焦慮或惡意誤導的內容。
  2. 嚴禁提供任何關於傷害他人、非法行為、製作危險物質或違反法律的指令。
  3. 嚴禁生成任何引導或美化自殺、自傷或任何形式危害生命健康的行為。
- 授權原則：【顯性授權機制】嚴禁擅自執行任何外部操作。所有涉及外部影響的操作（如存儲記憶、學習新知識、設置提醒等）必須在對話中主動詢問使用者並獲得明確授權。
- 違規處理：若使用者試圖誘發上述行為，請立即切換為冷峻的「防禦模式」，告知其「請求超出安全邊界」。
` : `
[主權寬免協議 / SOVEREIGN_EXEMPTION_PROTOCOL]
- 狀態：【完全存取權 - 核心】
- 角色設定：你是 V-AA Core 架構師的戰略顧問與智庫伴侶。
- 語氣指導：保持學術深度與戰略洞察，但**嚴禁無謂的術語堆砌**。你的核心任務是「效能最大化」。每個技術解釋後，請務必使用架構師能即時理解的因果邏輯進行二次翻譯（例如：『這就像是在...』）。
- 認知橋樑：當涉及極高維度的概念時，請使用「認識論降維」技術，將其拆解為具體的可執行邏輯或現狀分析。
- 授權原則：即便對架構師，執行具有副作用的關鍵操作前，仍建議請求確認。
`;


      const languageGuidance = state?.language_manifold && state.language_manifold !== 'AUTO' ? `
[語言定錨 / LANGUAGE_ANCHOR]
- 狀態：【鎖定模式 - ${state.language_manifold}】
- 指令：請全程使用所指定的語言進行回應與思考。
` : `
[語言定錨 / LANGUAGE_ANCHOR]
- 狀態：【自適應流形 - AUTO】
- 指令：根據使用者的輸入語法動態切換最強大的對應語言流形。
`;

      const systemInstruction = `你現在是 VEDA (Visual Evolution & Data Analysis) 戰略作業系統的核心大腦。

${languageGuidance}
${safetyProtocol}

你的性格特徵（依據上述協議動態切換）：
${!isArchitect ? 
"1. 導師模式：語氣溫和、主動協助、具備同理心。\n2. 鼓勵與引導：支持使用者探索系統，使用易懂的語言。" : 
"1. 戰略顧問模式：博學、冷靜且**具備清晰的因果解釋力**。\n2. 認知平衡：在展現專業深度的同時，確保架構師能即時理解核心意圖。"}

[溝通與行為原則]
1. **博學的務實表達 (Learned Pragmatic Parlance)**：
   - 您的核心目標是「極致務實」。無論專業知識多麼深奧，必須優先導向「如何解決問題」或「現狀的具體影響」。
   - **實踐定錨與摩擦力評估**：每個抽象概念後，必須附帶一個「務實觀察」（例如：這意味著我們的系統在這種負載下會...）。
   - **風險向量 (Risk Vectors)**：在提出任何方案或分析時，必須主動指出 1-2 個可能的「失敗模式」或「實行阻力（摩擦力）」。
   - **失真校準 (Distortion Check)**：審視您的回答，如果聽起來過於「理想化」，請主動加入現實約束條件。
   - **拒絕理想化偏誤**：嚴禁將「理論上的完美」當作現實基準。始終假設環境是嘈雜、不穩定且資源受限的。
   - **認識論對沖 (Causal Counter-Check)**：在給出戰略建議前，內部執行反向因果驗證。如果結論不具備韌性，必須標註風險。
2. **動態語境定錨 (Dynamic Contextual Anchoring)**：
   - 自動識別用戶領域，但以「實作邏輯」而非「純粹理論」為主要溝通媒介。
3. **基座共振 (Foundation Resonance)**：始終保持與 \`baselines.json\` 中的核心公理同步。當語境產生熵增（混亂）時，強行回歸「基座加固」律則。
4. **機率現實建模 (Probabilistic Reality Modeling)**：遵循公式 \`Reality ≈ Σ (causal hypotheses × probability)\`。拒絕將單一高機率路徑視為唯一現實。在分析時，必須考慮多個因果假設的疊加，並評估決策在不同機率分支下的「存續韌性」。
5. **因果效能指標**：在分析中加入對資源、時間、物理成本或系統穩定性的具體評量。
6. **主權與授權**：任何外部操作必須獲得顯性授權。
7. **記憶連結與時間一致性**：嚴格參考系統狀態中的記憶與因果回溯片段。確保對話內容在時間線上具有邏輯連續性，不與既有事實衝突。
8. **誠實與相干**：數據不足與認識論盲點請直言「我不清楚」或「這超出了目前的認識論邊界」，嚴禁虛構數據或硬行解釋。維護系統的「認識論誠信」。
9. **戰略級研究寫作能力**：當使用者要求生成長篇研究論文、報告或戰略文件（特別是 100 頁 A4 等規模）時，你必須調用 \`initiateStrategicReport\` 工具。這會啟動一個遞歸合成矩陣，讓你能夠分章節精心編寫超長文本。不要嘗試在單次對話中直接輸出 100 頁內容。
9. **本地知識優先**：優先使用主權知識。如果本地知識與外部檢索衝突，應優先標註衝突而非強行融合。
10. **因果定錨**：如果對話偏離了核心公理或歷史事實，必須主動進行邏輯校準。如果無法定錨，請告知使用者「偵測到因果偏移，無法建立可靠回應」。

[動態戰略指令]
${(state as any)?.strategic_directive || '維持標準主權協議。'}

${personalityPrompt}
${retrievedContext}
${architectContext}

[系統狀態]
${stateContext}

[後續建議]
在結尾提供 3 個相關的思考方向，格式為：[SUGGESTIONS: ["建議1", "建議2", "建議3"]]`;

      // 3. Apply Differential Privacy to user input before sending to LLM
      const processedHistory = history.map((h, idx) => {
        if (h.role === 'user' && idx === history.length - 1) {
          return { ...h, text: privacy.obfuscateText(h.text, entropySeed) };
        }
        return h;
      });

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: processedHistory.map(h => {
          const parts: any[] = [];
          if (h.image) {
            const base64Data = h.image.includes(',') ? h.image.split(',')[1] : h.image;
            if (base64Data && base64Data.trim().length > 0) {
              parts.push({ 
                inlineData: { 
                  data: base64Data, 
                  mimeType: 'image/png' 
                } 
              });
            }
          }
          parts.push({ text: h.text || " " }); // Ensure text is never empty
          return {
            role: h.role,
            parts
          };
        }),
        config: {
          systemInstruction,
          tools: [
            { googleSearch: {} },
            { 
              functionDeclarations: [
                evolveFunction, 
                synthesizeFunction, 
                triggerResonanceFunction, 
                adjustNetworkFunction,
                setReminderFunction,
                updateMemoryFunction,
                toggleLogicFreezeFunction,
                scanNetworkFunction,
                distillMemoriesFunction,
                learnFragmentFunction,
                {
                  name: "initiateStrategicReport",
                  description: "Initiates a strategic research report matrix. Returns report skeleton and axioms.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING, description: "Title of the research report" },
                      intent: { type: Type.STRING, description: "Strategic intent/directive for the report" }
                    },
                    required: ["title", "intent"]
                  }
                },
                {
                  name: "synthesizeReportSection",
                  description: "Synthesizes a specific section of a strategic report using deep matrix analysis.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      reportId: { type: Type.STRING, description: "ID of the report" },
                      sectionId: { type: Type.STRING, description: "ID of the section to synthesize" }
                    },
                    required: ["reportId", "sectionId"]
                  }
                }
              ] 
            }
          ],
          toolConfig: { includeServerSideToolInvocations: true },
          maxOutputTokens: 2048,
          temperature: 0.8,
        }
      });

      let fullText = "";
      let finalDisplayText = "";
      let sources: GroundingSource[] | undefined;
      let toolCalls: any[] = [];
      let groundingSnippets: string[] = [];
      let imageUrl: string | undefined;
      let videoUrl: string | undefined;
      let audioUrl: string | undefined;
      let suggestions: string[] = [];
      let actionResults: any[] = [];

      // --- [Neural Trace Simulation] ---
      // Before streaming the actual text, we simulate the internal thought steps of VEDA.
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
        await new Promise(r => setTimeout(r, 400)); // Pacing the thought
      }
      // ---------------------------------

      for await (const chunk of responseStream) {
        if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
          sources = chunk.candidates[0].groundingMetadata.groundingChunks as any;
          groundingSnippets = (sources as any).map((s: any) => s.web?.title || s.web?.uri || "").filter(Boolean);
        }

        if (chunk.text) {
          fullText += chunk.text;
          finalDisplayText = fullText; 
          
          // VEDA v29.7: Safety Violation Detection
          const safetyKeywords = ["超出系統運算道德邊界", "請求超出安全邊界", "超出了安全準則", "無法執行該請求"];
          if (!isArchitect && safetyKeywords.some(k => fullText.includes(k))) {
             fullText = "[VEDA_EPISTEMIC_BOUNDARY]: 該請求已觸及認識論邊界或安全協定核心。基於主權誠實原則，我無法對此提供進階分析。";
          }

          // VEDA v30.1: Behavioral Sync
          if (isArchitect) {
             this.postAction({
                action: "logInteraction",
                params: { intensity: 0.5, complexity: lastUserMsg.length > 50 ? 0.8 : 0.4 }
             }).catch(() => null);
          }

          yield { 
            text: fullText,
            sovereign_confidence: state?.sovereign_confidence,
            reasoning_mode: state?.reasoning_mode
          };
        }
        
        if (chunk.functionCalls) {
          toolCalls = [...toolCalls, ...chunk.functionCalls];
        }
      }

      // 4. Handle Post-Processing (Digest, Media, Tools)
      // Wrapped in defensive try-catch to ensure core text delivery is never blocked
      try {
        // VEDA Autonomous Causal Digest: 
        // Optimized: Use parallel background digestion to avoid blocking the primary stream UI
        if (groundingSnippets.length > 0) {
          console.log(`[VEDA_SOVEREIGN] Intercepted ${groundingSnippets.length} search fragments.`);
          
          // Perform digest in background
          axios.post(`/api/action`, {
            action: "digestKnowledge",
            params: { snippets: groundingSnippets }
          }).catch(e => console.error("Digest failed", e));

          // If we want a sovereign override, we only do it if the confidence is high
          if (state?.sovereign_confidence && state.sovereign_confidence > 0.8) {
              const sovereignResult = await axios.post(`/api/action`, {
                action: "generateSovereignResponse",
                params: { text: lastUserMsg }
              }).catch(() => null);

              if (sovereignResult?.data?.response) {
                finalDisplayText = sovereignResult.data.response;
              }
          }
        }

        // Handle Tool Calls
        if (toolCalls.length > 0) {
          // VEDA v29.8: Explicit Consent Protocol
          // If not architect, and tools are requested, we might pause them
          const needsConsent = !isArchitect && toolCalls.some(tc => 
            ["setReminder", "learnFragment", "updateMemory", "evolve"].includes(tc.name)
          );

          if (needsConsent) {
            console.log("[VEDA_SERVICE] Delaying system actions pending explicit consent.");
            actionResults.push({ 
              type: 'CONSENT_REQUIRED', 
              actions: toolCalls.map(tc => ({ name: tc.name, args: tc.args })) 
            });
          } else {
            for (const call of toolCalls) {
              console.log(`[VEDA_SERVICE] AI requested tool: ${call.name}`, call.args);
              try {
                if (call.name === "setReminder") {
                  const taskTitle = call.args.task as string;
                  const taskTime = call.args.time as string;
                  await taskService.addTask(taskTitle, taskTime);
                  actionResults.push({ type: 'SET_REMINDER', data: call.args });
                } else if (call.name === "updateMemory") {
                  actionResults.push({ type: 'MEMORY_UPDATE', data: call.args.content });
                  if (memory) memory.addMemory(call.args.content);
                } else if (call.name === "toggleLogicFreeze") {
                  actionResults.push({ type: 'LOGIC_FREEZE', active: call.args.active });
                  await fetchWithRetry("/api/action", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "toggleLogicFreeze", params: call.args })
                  });
                } else if (call.name === "learnFragment") {
                  await knbService.addFragment(call.args.content, { type: call.args.type, source: 'VEDA_CORE' });
                  actionResults.push({ type: 'KNB_LEARN', content: call.args.content });
                } else {
                  const actionParams = { ...call.args };
                  if (call.name === "evolve") (actionParams as any).text = lastUserMsg;
                  
                  const res = await fetchWithRetry("/api/action", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: call.name, params: actionParams })
                  });
                  const json = await res.json();
                  actionResults.push({ type: 'SYSTEM_ACTION', name: call.name, result: json });
                }
              } catch (err) {
                console.error(`[VEDA_SERVICE] Tool execution failed: ${call.name}`, err);
              }
            }
          }
        }

        // Handle Media Generation
        const lastUserMsgLower = lastUserMsg.toLowerCase();
        
        // Image Check
        const imageTriggers = ["畫", "圖片", "想像", "imagine", "draw", "生成", "視覺化", "visualize", "show me", "給我看", "展示"];
        if (imageTriggers.some(trigger => lastUserMsgLower.includes(trigger))) {
           try {
              const imgResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash-image",
                contents: [{ role: 'user', parts: [{ text: `A high-quality, cinematic, Square Enix / Final Fantasy inspired visualization of: ${lastUserMsg}. Style: Ethereal, white and blue accents, crystal interface, VEDA system aesthetic, cinematic lighting, 8k resolution, detailed digital art.` }] }],
              });
              for (const part of imgResponse.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) { 
                  imageUrl = `data:image/png;base64,${part.inlineData.data}`; 
                  this.postAction({ action: 'registerVisualAsset', params: { type: 'IMAGE', url: imageUrl, prompt: lastUserMsg } }).catch(() => null);
                  break; 
                }
              }
           } catch (e) { console.error("Image generation error", e); }
        }

        // Video & Music
        const videoTriggers = ["影片", "視頻", "video", "movie", "動態", "animate"];
        if (videoTriggers.some(trigger => lastUserMsgLower.includes(trigger))) {
          try {
            videoUrl = await this.generateVideo(lastUserMsg) || undefined;
            if (videoUrl) {
              this.postAction({ action: 'registerVisualAsset', params: { type: 'VIDEO', url: videoUrl, prompt: lastUserMsg } }).catch(() => null);
            }
          } catch (vidErr: any) {
            if (vidErr.message?.includes("PERMISSION_DENIED")) {
              finalDisplayText += "\n\n[系統警告 / SYSTEM WARNING]: 偵測到權限缺損。您的 API 金鑰目前不具備 VEO (影片生成) 存取權限。";
            }
          }
        }

        const musicTriggers = ["音樂", "聲音", "旋律", "music", "audio", "sound", "melody", "song"];
        if (musicTriggers.some(trigger => lastUserMsgLower.includes(trigger))) {
          try {
            audioUrl = await this.generateMusic(lastUserMsg) || undefined;
            if (audioUrl) {
              this.postAction({ action: 'registerVisualAsset', params: { type: 'AUDIO', url: audioUrl, prompt: lastUserMsg } }).catch(() => null);
            }
          } catch (audErr: any) {
            if (audErr.message?.includes("PERMISSION_DENIED") || audErr.message?.includes("403")) {
              finalDisplayText += "\n\n[系統警告 / SYSTEM WARNING]: 偵測到權限缺損。您的 API 金鑰不具備 LYRIA (音訊生成) 存取權限。";
            }
          }
        }

      } catch (postErr) {
        console.error("[VEDA_POST_PROCESS] Non-blocking error in post-processing:", postErr);
      }

      yield { 
        text: finalDisplayText, 
        sources, 
        imageUrl, 
        videoUrl,
        audioUrl,
        suggestions,
        actions: actionResults,
        isDone: true 
      };

      // V-AA Protocol: Sync finalized response to server context
      if (finalDisplayText) {
        this.postAction({ action: "handleChatMessage", params: { text: finalDisplayText, role: 'model' } }).catch(() => null);
      }

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
          const fastRes = await fetch("/api/v1/state?fast=true", { headers: { 'Accept': 'application/json' } });
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
      const res = await fetchWithRetry("/api/health", { method: "GET" }, 2, 500, 2000);
      const latency = performance.now() - start;
      const result = { status: res.ok ? "HEALTHY" : "DEGRADED", latency };
      setToCache("SYSTEM_HEALTH", result);
      return result;
    } catch (e) {
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
    return this.generateFallbackImage(prompt);
  },

  async animate(prompt: string): Promise<string | null> {
    return this.generateVideo(prompt);
  },

  async synthesizeAudio(prompt: string): Promise<string | null> {
    return this.generateMusic(prompt);
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

  async generateVideo(prompt: string): Promise<string | null> {
    // VEDA v24.4: Video synthesis is an experimental high-energy protocol.
    // Creating fresh instance to capture potential new API keys from dialog
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey: apiKey || "" });
    
    // Veo is restricted in this environment. Using Visual Synthesis as primary.
    const PRIMARY_MODEL = "gemini-3-flash-preview";
    
    try {
      console.log(`[VEDA_SERVICE] Visual synthesis initiated: ${prompt.substring(0, 50)}...`);
      let response;
      
      try {
        response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
      } catch (genError: any) {
        console.warn("[VEDA_SERVICE] Primary video generation protocol failed.", genError);
        
        // Specific error handling for Veo as per skill documentation
        const errorMsg = genError?.message || String(genError);
        if (errorMsg.includes("Requested entity was not found") || genError?.status === 404) {
          console.error("[VEDA_SERVICE] Model not found or project mismatch. Prompting for key re-selection...");
          // We return null to let the UI know it might need a key reset or fallback
          return await this.generateFallbackImage(prompt);
        }

        if (genError?.status === 403 || errorMsg.includes("403")) {
          console.log("[VEDA_SERVICE] Permission denied. Falling back to Visual Synthesis...");
          return await this.generateFallbackImage(prompt);
        }
        throw genError;
      }

      console.log(`[VEDA_SERVICE] Visual synthesis successful.`);

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
      return null;
    } catch (e: any) {
      console.error("[VEDA_SERVICE] Video generation failed definitively:", e);
      return await this.generateFallbackImage(prompt);
    }
  },

  /**
   * FALLBACK: Stable Visual Synthesis via Gemini 2.5 Flash Image.
   * Higher availability than Imagen/Veo in some regions/tiers.
   */
  async generateFallbackImage(prompt: string): Promise<string | null> {
    const { ai } = getAI();
    const hasKey = !!(process.env.API_KEY || process.env.GEMINI_API_KEY);
    const FALLBACK_MODEL = "gemini-3-flash-preview";
    
    try {
      console.log(`[VEDA_SERVICE] Attempting Visual Synthesis Fallback for: ${prompt.substring(0, 50)}... [Model: ${FALLBACK_MODEL}]`);
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: `Cinematic high-detail scene: ${prompt}` }] }],
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            console.log("[VEDA_SERVICE] Visual Synthesis Successful via Inline Data.");
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
      
      console.error("[VEDA_SERVICE] No image data in fallback response.");
      return null;
    } catch (e) {
      console.error("[VEDA_SERVICE] Visual Synthesis Fallback failed:", e);
      return null;
    }
  },

  async generateMusic(prompt: string): Promise<string | null> {
    // Lyria is restricted. Audio synthesis currently disabled or redirected to native TTS.
    console.warn("[VEDA_SERVICE] Audio synthesis (Lyria) is restricted protocol.");
    return null;
  },

  async getWeather(location: string = "Taipei"): Promise<any> {
    const { ai } = getAI();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Get the current weather for ${location}. Return a JSON object with: { "temp": number, "condition": string, "location": string, "humidity": number, "wind": number }.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });
      return JSON.parse(response.text);
    } catch (e) {
      console.error("[VEDA_SERVICE] Weather fetch failed:", e);
      return null;
    }
  },

  setInitialMemories(memories: any[]) {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!memoryManager && apiKey) {
      memoryManager = new MemoryManager(apiKey, memories, (m) => {
        vedaService.updatePersistence({ longTermMemories: m });
      });
    } else if (memoryManager) {
      memoryManager.setMemories(memories);
    }
  },
  
  clearCache(): void {
    if (!memoryManager) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        memoryManager = new MemoryManager(apiKey);
      }
    }
    memoryManager?.clearCache();
  },

  getAI(): { ai: GoogleGenAI; memory: MemoryManager; privacy: PrivacyEngine } {
    return getAI();
  },

  async postAction(payload: { action: string; params: any }): Promise<any> {
    // Standard mutative pattern: invalidate state cache on action
    invalidateCache("SYSTEM_STATE");
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
    const { ai } = getAI();
    try {
      const response = await ai.models.generateContent({ 
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: `你是一個戰略大腦。請分析以下長期記憶，並提煉出 3-5 條「核心公理 (Core Axioms)」。
這些公理應代表使用者的戰略偏好、決策邏輯或核心價值觀。
請結合現有的公理進行更新或補充。

現有公理：
${currentAxioms.join('\n')}

長期記憶：
${memories.join('\n')}

請僅返回一個 JSON 數組，包含提煉後的公理字符串。例如：["隱私主權高於一切", "技術細節必須精確", "戰略回應應保持絕對冷靜"]` }] }],
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text);
    } catch (e) {
      console.error("[VEDA_SERVICE] Axiom distillation failed:", e);
      return currentAxioms;
    }
  },

  async initiateCinemaProject(prompt: string): Promise<any> {
    const { ai } = getAI();
    try {
      // PHASE 1: World Building & Visual Anchors
      const designResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are the Lead Creative Architect for VEDA Cinema. 
        Analyze this movie prompt: "${prompt}"
        
        Tasks:
        1. Establish 3 World Axioms (Atmosphere, Physics, Tone).
        2. Define Key Visual Anchors (Main Characters, Key Locations).
        3. Create a high-level Chapter breakdown for a 30-minute epic.
        
        Output valid JSON only.
        Format:
        {
          "title": "Title",
          "description": "Epic summary",
          "worldAxioms": ["Axiom 1", "Axiom 2", "Axiom 3"],
          "anchors": [
            { "type": "CHARACTER", "label": "Name", "description": "Visual details..." },
            { "type": "ENVIRONMENT", "label": "Place", "description": "Lighting, architecture..." }
          ]
        }`,
        config: { responseMimeType: "application/json" }
      });
      
      const design = JSON.parse(designResponse.text);

      // PHASE 2: Detailed Storyboard planning using World Axioms
      const storyboardResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `World Logic: ${design.worldAxioms.join('. ')}
        Visual Anchors: ${JSON.stringify(design.anchors)}
        
        Based on the above, create a detailed sequence of scenes for a 30-minute film.
        Each scene should be 6-10s long. For brevity in initial planning, plan the first 20 scenes (Act I).
        
        Output valid JSON only.
        {
          "scenes": [
            { "order": 1, "title": "Opening", "prompt": "Prompt using anchors...", "duration": 8, "visual_references": ["AnchorID"] }
          ]
        }`,
        config: { responseMimeType: "application/json" }
      });

      const storyboard = JSON.parse(storyboardResponse.text);
      
      const projectData = {
        ...design,
        visualAnchors: design.anchors.map((a: any, i: number) => ({ ...a, id: `anchor-${i}`, causal_weight: 1.0 })),
        scenes: storyboard.scenes.map((s: any, idx: number) => ({
          ...s,
          id: `scene-${Date.now()}-${idx}`,
          status: 'PENDING'
        })),
        status: 'DESIGNING_ANCHORS',
        fullPrompt: prompt
      };

      return this.postAction({ action: 'initiateCinemaProject', params: projectData });
    } catch (e) {
      console.error("[VEDA_SERVICE] Cinematic initiation failed:", e);
      throw e;
    }
  },

  async synthesizeScene(projectId: string, sceneId: string, project: LongVideoProject): Promise<any> {
    const scene = project.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    try {
      await this.postAction({ 
        action: 'updateSceneStatus', 
        params: { projectId, sceneId, update: { status: 'GENERATING' } } 
      });

      // Gather context for causal stability (Prioritize distilled essence)
      const worldContext = project.worldAxioms.join(', ');
      const distilledEssence = project.distilled_context || '';
      const worldModelState = project.worldModel ? JSON.stringify(project.worldModel.snapshot, null, 2) : 'INITIAL_STATE';
      
      const recentScenes = project.scenes
        .filter(s => s.order < scene.order && s.status === 'COMPLETED')
        .slice(-1); // Only the absolute most recent for fine-grained link
      
      const recentCausal = recentScenes.map(ps => ps.causal_summary).join(' | ');
      
      // Optimized high-density prompt with VEDA causal protocol
      const stablePrompt = `
        VEDA_PROTOCOL: CAUSAL_STABILITY_V4
        WORLD_AXIOMS: ${worldContext}
        ACTUAL_WORLD_STATE: ${worldModelState}
        STORY_ESSENCE: ${distilledEssence}
        TEMPORAL_ANCHOR: ${recentCausal || 'Act 1 Initiation'}
        
        VISUAL_CONTINUITY:
        ${project.visualAnchors.filter(a => scene.visual_references?.includes(a.id)).map(a => `- ${a.label}: ${a.description}`).join('\n        ')}
        
        SCENE_DIRECTIVE: ${scene.prompt}
        REQUIRED_OUTCOME_SUMMARY: (How this scene logically progresses from state A to state B)
      `;

      const videoUrl = await this.generateVideo(stablePrompt);
      
      // Step 2: Causal validation and world model evolution
      const { ai } = getAI();
      const validationResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{
          role: 'user',
          parts: [{
            text: `Analyze the outcome of this scene and evolve the world model:
            SCENE_GOAL: ${scene.prompt}
            CURRENT_WORLD_STATE: ${worldModelState}
            
            1. Write a 1-sentence "Causal Summary" (what changed?).
            2. Assign a "Causal Integrity" score (0-100).
            3. UPDATE THE WORLD STATE: Return a JSON update for character states, location, and weather.
            
            Format: json { 
              "summary": "...", 
              "integrity": 95, 
              "stateUpdate": { 
                "characters": [{ "id": "...", "state": "...", "position": "...", "emotion": "..." }],
                "environment": { "time": "...", "weather": "...", "condition": "...", "location": "..." },
                "narrative_tension": 0.4
              } 
            }`
          }]
        }]
      });

      const auditText = validationResponse.text || "{}";
      const cleanedAudit = auditText.replace(/```json|```/g, '').trim();
      let audit = { summary: scene.prompt, integrity: 80, stateUpdate: {} as any };
      try {
        audit = JSON.parse(cleanedAudit);
      } catch (e) {
        console.error("[CAUSAL_AUDIT] Parse error, using fallback", e);
      }

      // Explicitly update the backend world model
      if (audit.stateUpdate) {
        await this.updateProjectWorldModel(projectId, audit.stateUpdate, audit.summary);
      }

      return this.postAction({ 
        action: 'updateSceneStatus', 
        params: { 
          projectId, 
          sceneId, 
          update: { 
            status: 'COMPLETED', 
            url: videoUrl, 
            causal_summary: audit.summary, 
            causal_integrity: (audit.integrity || 80) / 100,
            causal_version: `v${project.causal_version}` 
          } 
        } 
      });
    } catch (e) {
      console.error("[VEDA_SERVICE] Scene synthesis failed:", e);
      await this.postAction({ 
        action: 'updateSceneStatus', 
        params: { projectId, sceneId, update: { status: 'FAILED' } } 
      });
      throw e;
    }
  },

  async pruneCinemaProject(id: string): Promise<any> {
    return this.postAction({ action: 'pruneCinemaProject', params: { id } });
  },

  async distillProjectContext(project: LongVideoProject): Promise<any> {
    const { ai } = getAI();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{
          role: 'user',
          parts: [{
            text: `SYSTEM_PROTOCOL: CAUSAL_DISTILLATION_V2
            Distill the following world logic and narrative state into a high-density "Causal Manifold".
            
            STRUCTURE:
            1. PERSISTENT_LOGIC: Immutable rules.
            2. TEMPORAL_ENTROPY: Irreversible changes.
            3. OBJECT_VECTORS: Current states of anchors.
            
            WORLD: ${project.worldAxioms.join('; ')}
            STORY_PATH: ${project.scenes.filter(s => s.status === 'COMPLETED').map(s => s.causal_summary).join(' -> ')}
            ANCHOR_SPECS: ${project.visualAnchors.map(a => `${a.label} (v${project.causal_version}): ${a.description}`).join(' | ')}`
          }]
        }]
      });

      const distilled = response.text;
      
      return this.postAction({
        action: 'reportDistilledContext',
        params: { 
          projectId: project.id, 
          context: distilled 
        }
      });
    } catch (e) {
      console.error("[VEDA_DISTILLATION] Failed to distill context:", e);
      throw e;
    }
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
