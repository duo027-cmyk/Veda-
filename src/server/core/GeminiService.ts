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
  private logger: (type: string, msg: string) => void;

  constructor(logger?: (type: string, msg: string) => void) {
    this.logger = logger || ((type, msg) => console.log(`[GEMINI_SERVICE][${type}] ${msg}`));
    this.syncClient();
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
        this.logger("SECURITY", "Synthesizing new GoogleGenAI client mapping.");
        this.ai = new GoogleGenAI({
          apiKey: rawKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        this.currentKey = rawKey;
      }
      this.isBlocked = false;
      return true;
    } else {
      this.isBlocked = true;
      if (!this.ai) {
        // Fallback dummy client to prevent crash
        this.ai = new GoogleGenAI({
          apiKey: "DISABLED_KEY",
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
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
    if (this.isBlocked) return false;
    if (Date.now() < this.rateLimitCooldownUntil) {
      return false; // Rate limit is active
    }
    return true;
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
   * Check blocked state, considering both permanent blocks and rate-limiting cooldown flags.
   */
  public getBlockedStatus(): boolean {
    if (this.isBlocked) return true;
    if (Date.now() < this.rateLimitCooldownUntil) {
      return true; // Blocked under cooldown
    }
    return false;
  }

  public setBlockedStatus(blocked: boolean) {
    this.isBlocked = blocked;
    if (!blocked) {
      this.rateLimitCooldownUntil = 0; // Clear rate-limit cooldown on manual reset
    }
  }

  /**
   * Translates a raw, massive, ugly JSON error or stack trace from the Gemini API 
   * into a clean, concise, academic-grade system diagnostic message.
   */
  public cleanErrorMessage(err: any): string {
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
  public handleError(err: any): boolean {
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
      this.logger("RATE_LIMIT", "Quota boundary hit. Imposing an adaptive 12-second cooldown to restore energy limits.");
      this.rateLimitCooldownUntil = Date.now() + 12000; // 12-second adaptive cooldown for quick recovery
      return true;
    }

    // Invalid parameters, expired authorization, or fatal keys (HTTP 400 etc)
    if (
      errMsg.includes("API key not valid") || 
      errMsg.includes("INVALID_ARGUMENT") || 
      errMsg.includes("400") ||
      errMsg.includes("not found") ||
      errMsg.includes("Forbidden") ||
      errMsg.includes("Unauthorized")
    ) {
      this.logger("SECURITY", "Invalid environment authorization detected. Deactivating external inference.");
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
}
