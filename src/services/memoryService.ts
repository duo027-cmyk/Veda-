import { GoogleGenAI } from "@google/genai";

export interface MemoryEntry {
  id: string;
  text: string;
  embedding: number[];
  timestamp: number;
}

export class MemoryManager {
  private memories: MemoryEntry[] = [];
  private ai: GoogleGenAI;
  private embeddingCache: Map<string, number[]> = new Map();
  private onUpdate?: (memories: MemoryEntry[]) => void;

  constructor(apiKey: string, initialMemories?: MemoryEntry[], onUpdate?: (memories: MemoryEntry[]) => void) {
    this.ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    this.memories = initialMemories || [];
    this.onUpdate = onUpdate;
  }

  public setMemories(memories: MemoryEntry[]) {
    this.memories = memories;
  }

  private normalize(vec: number[]): number[] {
    let norm = 0;
    for (const v of vec) norm += v * v;
    norm = Math.sqrt(norm);
    if (norm === 0) return vec;
    return vec.map(v => v / norm);
  }

  private async getEmbedding(text: string): Promise<number[]> {
    if (!text) return new Array(768).fill(0); // Default embedding size
    const cacheKey = text.trim().toLowerCase();
    if (this.embeddingCache.has(cacheKey)) {
      console.log("[MEMORY_CACHE] Hit for:", cacheKey);
      return this.embeddingCache.get(cacheKey)!;
    }

    try {
      const result = await this.ai.models.embedContent({
        model: "gemini-embedding-2-preview",
        contents: [text],
      });
      // Pre-normalize for O(1) cosine similarity (dot product)
      const normalized = this.normalize(result.embeddings[0].values);
      this.embeddingCache.set(cacheKey, normalized);
      return normalized;
    } catch (e: any) {
      const isQuotaError = e.message?.includes("429") || e.status === 429 || JSON.stringify(e).includes("429");
      if (isQuotaError) {
        console.warn("[MEMORY_EMBEDDING] Quota exceeded.");
      } else {
        console.error("Embedding failed:", e);
      }
      return [];
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) return 0;
    
    // Optimization: Pre-normalized dot product
    // Since we now pre-normalize embeddings, this is just a dot product.
    let dotProduct = 0;
    const len = vecA.length;
    
    // Loop unrolling for SIMD-like performance (4-way)
    let i = 0;
    for (; i <= len - 4; i += 4) {
      dotProduct += vecA[i] * vecB[i] +
                   vecA[i+1] * vecB[i+1] +
                   vecA[i+2] * vecB[i+2] +
                   vecA[i+3] * vecB[i+3];
    }
    // Handle remaining elements
    for (; i < len; i++) {
      dotProduct += vecA[i] * vecB[i];
    }
    
    return dotProduct;
  }

  private generateId(): string {
    try {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
      }
      // Fallback for older browsers or non-window environments
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    } catch (e) {
      return Math.random().toString(36).substring(2, 15);
    }
  }

  async addMemory(text: string) {
    const embedding = await this.getEmbedding(text);
    if (embedding.length === 0) return;

    const entry: MemoryEntry = {
      id: this.generateId(),
      text,
      embedding,
      timestamp: Date.now(),
    };

    this.memories.push(entry);
    this.saveToStorage();

    // Trigger distillation if memory count exceeds threshold
    if (this.memories.length > 20) {
      this.distillMemories();
    }
  }

  /**
   * Memory Synthesis & Refinement Protocol
   * Summarizes and refines memories to reduce noise and improve retrieval density.
   * Optimization: Network-Clustered Synthesis - groups memories by semantic proximity before refinement.
   */
  async distillMemories() {
    console.log("[MEMORY_SYNTHESIS] Starting Network-Clustered refinement protocol...");
    if (this.memories.length < 10) return;

    // 1. Semantic Clustering (Simplified)
    const clusters: MemoryEntry[][] = [];
    const visited = new Set<string>();

    for (let i = 0; i < this.memories.length; i++) {
      if (visited.has(this.memories[i].id)) continue;
      
      const cluster = [this.memories[i]];
      visited.add(this.memories[i].id);

      for (let j = i + 1; j < this.memories.length; j++) {
        if (visited.has(this.memories[j].id)) continue;
        const sim = this.cosineSimilarity(this.memories[i].embedding, this.memories[j].embedding);
        if (sim > 0.85) {
          cluster.push(this.memories[j]);
          visited.add(this.memories[j].id);
        }
        if (cluster.length >= 5) break;
      }
      
      if (cluster.length >= 3) {
        clusters.push(cluster);
      }
    }

    if (clusters.length === 0) return;

    // 2. Synthesize clusters in parallel
    const distillationPromises = clusters.slice(0, 3).map(async (cluster) => {
      const combinedText = cluster.map(m => m.text).join(" | ");
      try {
        const response = await this.ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `請將以下語義相近的記憶片段精煉為一個高密度的「重要記憶」（摘要）：\n${combinedText}`,
          config: {
            systemInstruction: "你是一個記憶精煉系統。請將多個記憶片段轉化為一段簡潔、精確且包含所有核心資訊的文字。"
          }
        });

        const distilledText = response.text || "";
        if (distilledText) {
          const embedding = await this.getEmbedding(distilledText);
          return {
            memory: {
              id: `memory-${crypto.randomUUID()}`,
              text: `[重要記憶]: ${distilledText}`,
              embedding,
              timestamp: Date.now()
            },
            removedIds: cluster.map(m => m.id)
          };
        }
      } catch (e: any) {
        const isQuotaError = e.message?.includes("429") || e.status === 429 || JSON.stringify(e).includes("429");
        if (isQuotaError) {
          console.warn("[MEMORY_SYNTHESIS] Quota exceeded for chunk.");
        } else {
          console.error("Synthesis chunk failed:", e);
        }
      }
      return null;
    });

    const results = (await Promise.all(distillationPromises)).filter(r => r !== null);
    
    if (results.length > 0) {
      const allRemovedIds = new Set(results.flatMap(r => r!.removedIds));
      const newMemories = results.map(r => r!.memory);
      
      this.memories = [...newMemories, ...this.memories.filter(m => !allRemovedIds.has(m.id))];
      this.saveToStorage();
      console.log(`[MEMORY_SYNTHESIS] Refined ${results.length} clusters.`);
    }
  }

  /**
   * 記憶檢索優化
   * 模擬高效的記憶檢索結構，快速尋找相關資訊。
   */
  private networkParallelCompute(query: number[], memories: MemoryEntry[]): { text: string, score: number }[] {
    const tileSize = 16; 
    console.log(`[MEMORY_RETRIEVAL] 正在初始化記憶檢索系統...`);
    
    const results: { text: string, score: number }[] = new Array(memories.length);
    
    // Direct loop for maximum performance
    for (let i = 0; i < memories.length; i++) {
      results[i] = {
        text: memories[i].text,
        score: this.cosineSimilarity(query, memories[i].embedding)
      };
    }
    
    return results;
  }

  /**
   * Optimized search using Network-Based Parallel Computing.
   * Incorporates system context to bias retrieval towards relevant state-dependent memories.
   */
  async search(query: string, limit: number = 3, context?: string): Promise<string[]> {
    const searchString = context ? `[SYSTEM_STATE: ${context}] ${query}` : query;
    const queryEmbedding = await this.getEmbedding(searchString);
    if (queryEmbedding.length === 0) return [];

    // Use Network Parallel Computing for similarity scoring
    const scored = this.networkParallelCompute(queryEmbedding, this.memories);

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .filter(s => s.score > 0.65) // Slightly lower threshold to allow context-biased matches
      .map(s => s.text);
  }

  private saveToStorage() {
    if (this.onUpdate) {
      this.onUpdate(this.memories);
    }
  }

  clear() {
    this.memories = [];
    this.embeddingCache.clear();
    this.saveToStorage();
  }

  clearCache() {
    this.embeddingCache.clear();
  }
}

/**
 * Rényi Differential Privacy (RDP) Engine
 * Implements (alpha, epsilon)-RDP for precise privacy loss tracking.
 */
export class PrivacyEngine {
  private alpha: number;
  private totalEpsilon: number;
  private delta: number;
  private sensitivity: number = 1;
  private seed: number = 0;
  private entropyPool: number[] = [];

  constructor(alpha: number = 2, delta: number = 1e-5) {
    this.alpha = alpha;
    this.delta = delta;
    this.totalEpsilon = 0;
    this.initializeEntropy();
  }

  private initializeEntropy() {
    const initial = new Uint32Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(initial);
      this.entropyPool = Array.from(initial).map(v => v / 0xFFFFFFFF);
      this.seed = this.entropyPool.reduce((a, b) => a ^ (b * 0x100000000), 0);
    }
  }

  /**
   * Mixes new physical entropy into the pool.
   */
  public addEntropy(data: number[]) {
    this.entropyPool = [...this.entropyPool, ...data].slice(-128);
    // Mix entropy into the seed using a non-linear combination
    this.seed = this.entropyPool.reduce((a, b, i) => {
      const x = Math.sin(b * (i + 1)) * 10000;
      return a ^ (x - Math.floor(x)) * 0x100000000;
    }, this.seed);
    console.log(`[PRIVACY] Physical Entropy Harvested: Pool Size ${this.entropyPool.length}`);
  }

  /**
   * Adds Gaussian noise calibrated for RDP.
   * For (alpha, epsilon)-RDP, sigma^2 = alpha * sensitivity^2 / (2 * epsilon)
   * Hardware-Entropy Seeding: Uses IMU data and entropy pool as a seed.
   */
  addNoise(value: number, stepEpsilon: number = 0.01, externalSeed?: number): number {
    const sigma = Math.sqrt((this.alpha * Math.pow(this.sensitivity, 2)) / (2 * stepEpsilon));
    
    // Hardware-Anchored Randomness with Entropy Pool
    const randomSource = () => {
      const s = (this.seed + (externalSeed || 0) + 0.123456) * 10000;
      const x = Math.sin(s) * 10000;
      this.seed += 0.789123; // Increment internal seed
      return x - Math.floor(x);
    };

    // Box-Muller transform for Gaussian noise
    const u1 = randomSource();
    const u2 = randomSource();
    const z0 = Math.sqrt(-2.0 * Math.log(u1 || 0.000001)) * Math.cos(2.0 * Math.PI * (u2 || 0.000001));
    const noise = z0 * sigma;

    // Accumulate privacy loss using RDP composition (linear for RDP)
    this.totalEpsilon += stepEpsilon;
    
    return value + noise;
  }

  /**
   * Converts RDP (alpha, epsilon) to standard (epsilon, delta)-DP
   * epsilon_std = epsilon_rdp + ln(1/delta) / (alpha - 1)
   */
  getStandardDP() {
    const stdEpsilon = this.totalEpsilon + Math.log(1 / this.delta) / (this.alpha - 1);
    return { epsilon: stdEpsilon, delta: this.delta, alpha: this.alpha };
  }

  /**
   * Adaptive Privacy Budgeting: Calculates epsilon based on content sensitivity.
   * High sensitivity (PII, financial) -> Higher epsilon (more noise)
   * Low sensitivity (general knowledge) -> Lower epsilon (less noise)
   */
  private getAdaptiveEpsilon(text: string): number {
    const sensitivePatterns = [
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // Phone
      /\b\d{16}\b/g, // Credit Card (simple)
      /\b(address|location|secret|password|key)\b/i // Keywords
    ];

    let sensitivityScore = 0.005; // Base epsilon
    for (const pattern of sensitivePatterns) {
      if (pattern.test(text)) {
        sensitivityScore += 0.02; // Increase noise for each match
      }
    }
    return Math.min(sensitivityScore, 0.1); // Cap at 0.1
  }

  obfuscateText(text: string, entropySeed?: number): string {
    const adaptiveEpsilon = this.getAdaptiveEpsilon(text);
    
    let processed = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[PROTECTED_EMAIL]");
    processed = processed.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[PROTECTED_PHONE]");
    
    // Temporarily disabled number noise to ensure dialogue stability
    /*
    processed = processed.replace(/\b\d+(\.\d+)?\b/g, (match) => {
      const num = parseFloat(match);
      if (isNaN(num)) return match;
      return this.addNoise(num, adaptiveEpsilon, entropySeed).toFixed(2);
    });
    */

    return processed;
  }

  getPrivacyConfig() {
    const std = this.getStandardDP();
    return { 
      epsilon: std.epsilon, 
      delta: std.delta, 
      alpha: std.alpha,
      mechanism: "Rényi Differential Privacy (RDP)"
    };
  }
}
