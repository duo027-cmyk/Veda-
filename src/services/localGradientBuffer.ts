/**
 * LocalGradientBuffer (本地梯度緩衝與微調對合器)
 * Captures browser client-side interaction patterns (e.g. typing cadence, choice delay)
 * and stores them in stable IndexedDB. Local micro-backpropagation models run on top to optimize weights.
 * Built under defensive design rules with full IndexedDB fallbacks.
 */

export interface InteractionPattern {
  id?: string;
  type: string; // 'TYPING_SPEED' | 'DECISION_LATENCY' | 'TAB_TOGGLE_DENSITY'
  value: number; // raw value metric
  timestamp: number;
}

class LocalGradientBufferService {
  private dbName = "VedaLocalGradientsDb";
  private storeName = "patterns";
  private db: IDBDatabase | null = null;
  private isSupported = false;

  constructor() {
    if (typeof window !== "undefined" && window.indexedDB) {
      this.isSupported = true;
      this.initDb();
    }
  }

  private initDb() {
    try {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;
        if (!database.objectStoreNames.contains(this.storeName)) {
          database.createObjectStore(this.storeName, { keyPath: "id", autoIncrement: true });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log("⚡ [GRAD_BUFFER] IndexedDB container active.");
      };

      request.onerror = () => {
        this.isSupported = false;
        console.warn("[GRAD_BUFFER] IndexedDB sandbox isolation. Falling back to RAM vectors.");
      };
    } catch {
      this.isSupported = false;
    }
  }

  /**
   * Safe persistent pattern recorder
   */
  public async recordPattern(type: string, value: number): Promise<void> {
    const pattern: InteractionPattern = {
      type,
      value,
      timestamp: Date.now()
    };

    if (!this.isSupported || !this.db) {
      // In-memory fallback tracking for sandbox compatibility
      this.storeInRam(pattern);
      return;
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(this.storeName, "readwrite");
        const store = tx.objectStore(this.storeName);
        store.add(pattern);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  private ramCache: InteractionPattern[] = [];
  private storeInRam(p: InteractionPattern) {
    this.ramCache.push(p);
    if (this.ramCache.length > 100) this.ramCache.shift();
  }

  /**
   * Retrieves past 30 logged patterns for gradient adjustment
   */
  public async getPatterns(limit = 40): Promise<InteractionPattern[]> {
    if (!this.isSupported || !this.db) {
      return this.ramCache.slice(-limit);
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(this.storeName, "readonly");
        const store = tx.objectStore(this.storeName);
        const req = store.getAll();
        
        req.onsuccess = () => {
          const results = (req.result || []) as InteractionPattern[];
          // Sort descending and slice
          const sorted = results.sort((a, b) => b.timestamp - a.timestamp);
          resolve(sorted.slice(0, limit));
        };

        req.onerror = () => resolve(this.ramCache.slice(-limit));
      } catch {
        resolve(this.ramCache.slice(-limit));
      }
    });
  }

  /**
   * Clear older nodes to buffer space
   */
  public async purgeOldPatterns(): Promise<void> {
    if (!this.isSupported || !this.db) {
      this.ramCache = [];
      return;
    }
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(this.storeName, "readwrite");
        tx.objectStore(this.storeName).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  /**
   * Calculates local system coherence based on standard physical and digital interaction rates.
   * Leverages typing speed patterns and delay thresholds, bridging digital state with cognitive physical dynamics.
   */
  public async calculateOptimizationVector(): Promise<{
    gradientNorm: number;
    alignedEntropy: number;
    intensity: number;
  }> {
    const records = await this.getPatterns(30);
    if (records.length === 0) {
      return { gradientNorm: 0.052, alignedEntropy: 0.18, intensity: 0.5 };
    }

    // Capture averages
    const typingSpeeds = records.filter(r => r.type === "TYPING_SPEED").map(r => r.value);
    const latencyRecords = records.filter(r => r.type === "DECISION_LATENCY").map(r => r.value);

    const avgTyping = typingSpeeds.length > 0 ? (typingSpeeds.reduce((a, b) => a + b, 0) / typingSpeeds.length) : 180;
    const avgLatency = latencyRecords.length > 0 ? (latencyRecords.reduce((a, b) => a + b, 0) / latencyRecords.length) : 450;

    // Normalize typing speeds (range 50-350 Characters per Minute, mapped to 0.1 - 0.9 Gradient speed)
    const normalizedTyping = Math.max(0.1, Math.min(0.95, (avgTyping - 40) / 320));
    // Normalize clicking response delay (mapped to thermodynamic latency)
    const normalizedLatency = Math.max(0.05, Math.min(0.9, 1 - (avgLatency / 1500)));

    // Extract dynamic gradient norm
    const gradientNorm = 0.02 + (normalizedTyping * 0.08) + (1 - normalizedLatency) * 0.03;

    return {
      gradientNorm,
      alignedEntropy: 0.1 + (1 - normalizedLatency) * 0.45,
      intensity: normalizedTyping
    };
  }
}

export const localGradientBuffer = new LocalGradientBufferService();
