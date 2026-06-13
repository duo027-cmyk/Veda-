// src/server/core/GeminiService.ts
/**
 * AGI Architecture Academic Protocol (卓越學術憲法 - 認識論降維)
 * Decoupled Gemini Service Layer v1.1 (AGI v6.0 Decoupling)
 * 
 * Responsibilities:
 * 1. Interface with the official Google GenAI @google/genai SDK.
 * 2. Manage API Key lifecycle, security state, and runtime fallback logic.
 * 3. Isolate neural inference queries from the main controller to prevent stack dependency.
 * 4. Gracefully mitigate rate limits (HTTP 429/RESOURCE_EXHAUSTED) with a temporary cooldown.
 */

import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private currentKey: string = "";
  private isBlocked: boolean = false;
  private rateLimitCooldownUntil: number = 0;
  private quotaExceededUntil: number = 0;
  private degradedModels = new Map<string, number>();
  private logger: (type: string, msg: string) => void;

  constructor(logger?: (type: string, msg: string) => void) {
    this.logger = logger || ((type, msg) => console.log(`[GEMINI_SERVICE][${type}] ${msg}`));
    this.syncClient();
  }

  /**
   * Patches a GoogleGenAI instance to automatically retry transient errors and dynamically 
   * fallback to standard/efficient models.
   */
  private patchAiInstance(aiInstance: GoogleGenAI): GoogleGenAI {
    if (!aiInstance || !aiInstance.models || (aiInstance as any).__patched) {
      return aiInstance;
    }

    const originalGenerateContent = aiInstance.models.generateContent.bind(aiInstance.models);

    aiInstance.models.generateContent = async (params: any) => {
      // If client is globally blocked, cooling down, or has no valid key configured, short-circuit immediately
      if (this.getBlockedStatus() || this.currentKey === "DISABLED_KEY") {
        throw new Error("VEDA_OFFLINE_OR_BLOCKED: API is currently deactivated or in offline block. Bypassing slow network timeouts.");
      }

      // If we are cooling down under rate limit, wait or raise an error for retry loop
      if (Date.now() < this.rateLimitCooldownUntil) {
        const remaining = Math.max(0, this.rateLimitCooldownUntil - Date.now());
        this.logger("COOLDOWN", `Adaptive cooldown is active. Holding search query for ${remaining}ms.`);
        await new Promise(resolve => setTimeout(resolve, Math.min(remaining, 5000)));
      }

      // Helper function to map/normalize models to prevent 404/400 errors
      const getNormalizedModel = (m: string): string => {
        if (m === "gemini-3.5-flash") return "gemini-3.1-flash-lite";
        if (m === "gemini-2.5-flash") return "gemini-3.5-flash";
        if (m === "gemini-3.1-flash-lite") return "gemini-flash-latest";
        if (m === "gemini-3.1-pro-preview" || m === "gemini-3.1-pro" || m === "gemini-2.5-pro") return "gemini-3.5-flash";
        return m;
      };

      // Build fallback list starting with the requested model
      const modelsToTry = [params.model];
      modelsToTry.push(getNormalizedModel(params.model));

      const isSpecializedAudioVideoImage = 
         params.model.includes("image") || 
         params.model.includes("veo") || 
         params.model.includes("lyria") || 
         params.model.includes("generateVideos") ||
         params.model.includes("generateAudio");

      if (!isSpecializedAudioVideoImage) {
        // Sequentially fall back across multiple solid production-grade nodes based on capability guidelines
        modelsToTry.push("gemini-3.5-flash");
        modelsToTry.push("gemini-3.1-pro-preview");
        modelsToTry.push("gemini-3.1-flash-lite");
        modelsToTry.push("gemini-flash-latest");
        modelsToTry.push("gemini-2.5-flash");
      }

      // Deduplicate fallback chain and prioritize non-degraded models first
      const uniqueModels = Array.from(new Set(modelsToTry)).sort((a, b) => {
        const aCooldown = this.degradedModels.get(a) || 0;
        const bCooldown = this.degradedModels.get(b) || 0;
        const aIsDegraded = aCooldown > Date.now();
        const bIsDegraded = bCooldown > Date.now();
        if (aIsDegraded && !bIsDegraded) return 1;
        if (!aIsDegraded && bIsDegraded) return -1;
        return 0;
      });

      let lastError: any = null;

      for (const model of uniqueModels) {
        // Safe check so we don't attempt models that are strictly registered as degraded/overloaded right now
        const modelCooldown = this.degradedModels.get(model) || 0;
        if (modelCooldown > Date.now()) {
          this.logger("PROACTIVE_FAILOVER_SKIP", `Model ${model} is currently cooled down/degraded. Passing over for adjacent nodes.`);
          continue;
        }

        let attempt = 0;
        const maxAttempts = 3;

        while (attempt < maxAttempts) {
          attempt++;
          try {
            this.logger("INFERENCE", `Executing query: model=${model}, attempt=${attempt}/${maxAttempts}`);
            
            const response = await originalGenerateContent({
              ...params,
              model: model,
            });

            if (response && (response.text !== undefined || response.candidates)) {
              this.degradedModels.delete(model); // Restore health state instantly
              return response;
            }
            throw new Error("Empty response received from Gemini.");
          } catch (err: any) {
            lastError = err;
            const errMsg = err?.message || String(err);
            const cleanMsg = this.cleanErrorMessage(err);

            const isQuotaError = 
              errMsg.includes("429") || 
              errMsg.includes("RESOURCE_EXHAUSTED") || 
              errMsg.includes("quota") || 
              errMsg.includes("Quota") ||
              errMsg.includes("limit") ||
              errMsg.includes("Limit") ||
              errMsg.includes("Resource exhausted");

            const isAuthError =
              errMsg.includes("API key not valid") || 
              errMsg.includes("API_KEY_INVALID") ||
              errMsg.includes("Forbidden") ||
              errMsg.includes("Unauthorized") ||
              errMsg.includes("invalid key");

            if (isAuthError) {
              this.logger("SECURITY_STATUS", "API key invalid or unauthorized. Triggering safe, silent offline cognitive fallback mode.");
              this.isBlocked = true;
              break; // exit loop immediately, do not try other models
            }

            const isModelOverloaded = 
              errMsg.includes("503") || 
              errMsg.includes("UNAVAILABLE") || 
              errMsg.includes("high demand") || 
              errMsg.includes("temporary") || 
              errMsg.includes("overloaded");

            const isModelQuotaExceeded = 
              errMsg.includes("429") || 
              errMsg.includes("RESOURCE_EXHAUSTED") || 
              errMsg.includes("quota") || 
              errMsg.includes("Quota") ||
              errMsg.includes("limit") ||
              errMsg.includes("Limit") ||
              errMsg.includes("Resource exhausted");

            const isModelNotFoundOrInvalid =
              errMsg.includes("400") ||
              errMsg.includes("not found") ||
              errMsg.includes("Not found") ||
              errMsg.includes("invalid model") ||
              errMsg.includes("INVALID_ARGUMENT") ||
              errMsg.includes("does not exist") ||
              errMsg.includes("not exist");

            if (isModelOverloaded || isModelQuotaExceeded || isModelNotFoundOrInvalid) {
              let reason = "overloaded (503/UNAVAILABLE)";
              let cooldownDuration = 120000; // 2 mins default
              if (isModelQuotaExceeded) {
                // If model has a limit of 0, it means it's strictly not supported under this free-tier API Key.
                // We lock it for 24 hours to prevent slow, failing retry checks.
                if (errMsg.includes("limit: 0") || errMsg.includes("FreeTier")) {
                  reason = "zero-quota-free-tier (429/RESOURCE_EXHAUSTED - Locked for 24h)";
                  cooldownDuration = 86400000; // 24 hours
                } else {
                  reason = "quota-exhausted (429/RESOURCE_EXHAUSTED)";
                  cooldownDuration = 180000; // 3 mins for Quota limits to reset
                }
              } else if (isModelNotFoundOrInvalid) {
                reason = "not-found/invalid (400/INVALID_ARGUMENT)";
                cooldownDuration = 300000; // 5 mins for missing/unsupported models
              }
              
              this.degradedModels.set(model, Date.now() + cooldownDuration);
              this.logger("PROACTIVE_FAILOVER", `Model ${model} is ${reason}. Registering degradation for ${cooldownDuration}ms. Switching immediately to next available fallback model.`);
              break; // exit current model's attempt loop to gracefully switch to the next fallback model
            }

            this.logger("WARNING", `Attempt ${attempt} failed with model ${model}: ${cleanMsg}`);

            // Classify error and apply rate-limits/cooldown
            this.handleError(err, false);
            if (this.isBlocked) {
              this.logger("SECURITY", "Fatal security condition detected during generation loop. Aborting fallback.");
              throw err;
            }

            if (attempt < maxAttempts) {
              const backoffMs = attempt * 1200; // exponential back-off
              this.logger("RETRY", `Transient issue detected. Initiating ${backoffMs}ms back-off delay.`);
              await new Promise(resolve => setTimeout(resolve, backoffMs));
            }
          }
        }

        this.logger("COGNITIVE_DEGRADATION", `Model ${model} exhausted maximum retries. Escalating to subsequent fallback model.`);
      }

      if (lastError) {
        this.handleError(lastError, true);
        throw lastError;
      }
      throw new Error("COGNITIVE_RECOVERY_DEGRADED: All available Gemini inference nodes are currently flagged as degraded or cooling down. Diverting queries to local autonomous backup channels.");
    };

    (aiInstance as any).__patched = true;
    return aiInstance;
  }

  /**
   * Syncs the underlying GoogleGenAI client with current env settings
   */
  public syncClient(): boolean {
    const rawKey = (process.env.GEMINI_API_KEY || process.env.API_KEY || "").trim();
    const isValid = rawKey && 
                    rawKey.length > 10 && 
                    rawKey !== "GEMINI_API_KEY" && 
                    rawKey !== "DISABLED_KEY" && 
                    rawKey !== "undefined" && 
                    rawKey !== "null";

    if (isValid) {
      if (!this.ai || this.currentKey !== rawKey) {
        this.logger("SECURITY", "Synthesizing new GoogleGenAI client mapping with self-healing core decorator.");
        const rawAi = new GoogleGenAI({
          apiKey: rawKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        this.ai = this.patchAiInstance(rawAi);
        this.currentKey = rawKey;
      }
      this.isBlocked = false;
      return true;
    } else {
      this.isBlocked = true;
      if (!this.ai) {
        // Fallback dummy client to prevent crash
        const rawAi = new GoogleGenAI({
          apiKey: "DISABLED_KEY",
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        this.ai = this.patchAiInstance(rawAi);
        this.currentKey = "DISABLED_KEY";
      }
      return false;
    }
  }

  /**
   * Safe check for active API features
   */
  public isExternalAiActive(): boolean {
    this.syncClient();
    return !this.getBlockedStatus();
  }

  /**
   * Overrides / updates the runtime API Key
   */
  public updateApiKey(key: string) {
    if (!key || key.length < 20) return;
    process.env.GEMINI_API_KEY = key.trim();
    this.syncClient();
  }

  /**
   * Check blocked state, indicating a permanent key deactivation or configuration block.
   */
  public getBlockedStatus(): boolean {
    return this.isBlocked || Date.now() < this.quotaExceededUntil;
  }

  public setBlockedStatus(blocked: boolean) {
    this.isBlocked = blocked;
    if (!blocked) {
      this.rateLimitCooldownUntil = 0; // Clear rate-limit cooldown on manual reset
      this.quotaExceededUntil = 0;
    }
  }

  /**
   * Translates a raw, massive, ugly JSON error or stack trace from the Gemini API 
   * into a clean, concise, academic-grade system diagnostic message.
   */
  public cleanErrorMessage(err: any): string {
    if (!err) return "Unknown entity failure";
    const errMsg = err?.message || String(err);
    if (
      errMsg.includes("429") || 
      errMsg.includes("RESOURCE_EXHAUSTED") || 
      errMsg.includes("quota") || 
      errMsg.includes("Quota") ||
      errMsg.includes("limit") ||
      errMsg.includes("Limit") ||
      errMsg.includes("Resource exhausted")
    ) {
      return "EXTERNAL_RESOURCE_EXHAUSTED (Gemini API 額度已達上限/頻率限制)";
    }

    if (
      errMsg.includes("503") ||
      errMsg.includes("UNAVAILABLE") ||
      errMsg.includes("high demand") ||
      errMsg.includes("temporary") ||
      errMsg.includes("overloaded")
    ) {
      return "EXTERNAL_SERVICE_OVERLOADED (Gemini 外部服務負載飽和/臨時無法連線，已啟動多級自癒備援)";
    }

    if (
      errMsg.includes("API key not valid") || 
      errMsg.includes("INVALID_ARGUMENT") || 
      errMsg.includes("400") ||
      errMsg.includes("not found") ||
      errMsg.includes("Forbidden") ||
      errMsg.includes("Unauthorized")
    ) {
      return "INVALID_API_KEY (API 金鑰無效或配置錯誤)";
    }

    if (errMsg.length > 200) {
      return errMsg.substring(0, 200) + "...";
    }
    return errMsg;
  }

  /**
   * Classifies error types and applies appropriate blockades or temporary cooldown timers.
   */
  public handleError(err: any, isGlobalBlocked: boolean = false): boolean {
    const errMsg = err?.message || String(err);

    // Rate Limit or Quota Exceeded (HTTP 429) detection
    if (
      errMsg.includes("429") || 
      errMsg.includes("RESOURCE_EXHAUSTED") || 
      errMsg.includes("quota") || 
      errMsg.includes("Quota") ||
      errMsg.includes("limit") ||
      errMsg.includes("Limit") ||
      errMsg.includes("Resource exhausted")
    ) {
      if (isGlobalBlocked) {
        this.logger("RATE_LIMIT", "Quota boundary hit across all domains. Imposing an adaptive 15-second offline block to allow endpoint recovery.");
        this.rateLimitCooldownUntil = Date.now() + 15000; // 15-second cooldown for general rate-limit
        this.quotaExceededUntil = Date.now() + 15000;    // 15-second offline block
      } else {
        this.logger("RATE_LIMIT", "Model-specific quota exhausted. Registering localized degradation to try adjacent fallback nodes.");
      }
      return true;
    }

    // Invalid API key or authorization errors (fatal key issues)
    if (
      errMsg.includes("API key not valid") || 
      errMsg.includes("API_KEY_INVALID") ||
      errMsg.includes("Forbidden") ||
      errMsg.includes("Unauthorized") ||
      errMsg.includes("invalid key")
    ) {
      this.logger("SECURITY", "Invalid API key or authorization. Deactivating external inference.");
      this.isBlocked = true;
      return false;
    }

    return false;
  }

  /**
   * Generate robust content using Gemini (Deprecated in favor of direct execution if preferred, but maintains full support)
   */
  public async generateContent(params: {
    model: string;
    contents: string | any;
    config?: any;
  }): Promise<string | null> {
    this.syncClient();

    if (this.getBlockedStatus() || !this.ai || this.currentKey === "DISABLED_KEY") {
      this.logger("WARNING", "Inference bypassed: Client is offline / blocked / cooling down.");
      return null;
    }

    try {
      const response = await this.ai.models.generateContent({
        model: params.model,
        contents: params.contents,
        config: params.config,
      });

      return response.text || "";
    } catch (err: any) {
      this.handleError(err);
      throw err;
    }
  }

  /**
   * Expose safe access to the active patched GoogleGenAI client
   */
  public getAi(): GoogleGenAI | null {
    this.syncClient();
    return this.ai;
  }

  /**
   * Safe generation that also extracts Google Search or Google Maps grounding sources and metadata
   */
  public async generateContentWithGrounding(params: {
    model: string;
    contents: string | any;
    config?: any;
  }): Promise<{ text: string; sources?: any[] } | null> {
    this.syncClient();

    if (this.getBlockedStatus() || !this.ai || this.currentKey === "DISABLED_KEY") {
      this.logger("WARNING", "Inference with grounding bypassed: Client is offline.");
      return null;
    }

    try {
      const response = await this.ai.models.generateContent({
        model: params.model,
        contents: params.contents,
        config: params.config,
      });

      const text = response.text || "";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: any[] = [];
      for (const chunk of chunks) {
        if (chunk.web) {
          sources.push({
            web: {
              uri: chunk.web.uri || "",
              web: chunk.web.uri || "",
              title: chunk.web.title || "來源點"
            }
          });
        }
      }

      return { text, sources };
    } catch (err: any) {
      this.handleError(err);
      throw err;
    }
  }
}
