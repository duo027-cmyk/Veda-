import crypto from "crypto";
import { MemoryFragment } from "./types";

/**
 * Generative Model: The system's internal theory of its own dynamics.
 * Implements Active Inference principles (Free Energy Minimization).
 */
export class GenerativeModel {
  private weights: number[][];
  private learningRate: number = 0.01;
  private priorStability: number = 0.5;

  constructor(dim: number) {
    this.weights = Array.from({ length: dim }, (_, i) => 
      Array.from({ length: dim }, (_, j) => (i === j ? 0.9 : 0.0) + (Math.random() - 0.5) * 0.1)
    );
  }

  public setStabilityPrior(stability: number) {
    this.priorStability = stability;
    this.learningRate = 0.005 + (1 - stability) * 0.02;
  }

  public predict(state: number[], action: number[]): number[] {
    return this.weights.map((row, i) => {
      const combined = row.reduce((sum, w, j) => sum + w * (state[j] + action[j] * 0.1), 0);
      const stabilityBias = (this.priorStability - 0.5) * 0.1;
      return Math.max(0, Math.min(1, combined + stabilityBias));
    });
  }

  public calculateFreeEnergy(actual: number[], predicted: number[]): number {
    return actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
  }

  public learn(state: number[], action: number[], outcome: number[]) {
    const prediction = this.predict(state, action);
    for (let i = 0; i < this.weights.length; i++) {
      for (let j = 0; j < this.weights[i].length; j++) {
        const error = outcome[i] - prediction[i];
        const gradient = error * (state[j] + action[j] * 0.1);
        this.weights[i][j] += this.learningRate * gradient;
      }
    }
  }
}

/**
 * Hyperdimensional Computing (HDC) Engine
 * Optimized for O(1) memory pressure and high-throughput vector math.
 */
export class HDCEngine {
  private readonly dimension: number = 1024;
  private readonly jitterTable: Float32Array;
  private readonly positionCache: Float32Array[] = [];
  private readonly hvCache = new Map<string, Float32Array>();
  
  // Reusable buffers to avoid GC pressure during high-frequency math
  private readonly mathBuffer: Float32Array;

  constructor(dimension: number = 1024) {
    this.dimension = dimension;
    this.jitterTable = new Float32Array(dimension);
    this.mathBuffer = new Float32Array(dimension);

    for (let i = 0; i < dimension; i += 1) {
      this.jitterTable[i] = 1.0 + (Math.sin(i * 0.1) * 0.0005);
    }
    this.precomputePositions();
  }

  private precomputePositions(): void {
    for (let i = 0; i < 12; i += 1) {
      const base = this.generateHypervector(`pos_anchor_${i}`);
      this.positionCache.push(this.permute(base, i));
    }
  }

  public getPositionHV(index: number): Float32Array {
    return this.positionCache[index % this.positionCache.length];
  }

  /**
   * Generates a bipolar hypervector (-1, 1).
   */
  public generateHypervector(seed?: string): Float32Array {
    if (seed) {
      const cached = this.hvCache.get(seed);
      if (cached) return cached;
      const hv = new Float32Array(this.dimension);
      const hash = crypto.createHash('sha256').update(seed).digest();
      const hashLen = hash.length;
      for (let i = 0; i < this.dimension; i += 1) {
        const byte = hash[i % hashLen];
        const bitOffset = Math.floor(i / hashLen) % 8;
        const bit = (byte >> bitOffset) & 1;
        hv[i] = bit === 1 ? 1 : -1;
      }
      this.hvCache.set(seed, hv);
      return hv;
    } else {
      const hv = new Float32Array(this.dimension);
      for (let i = 0; i < this.dimension; i += 1) {
        hv[i] = Math.random() < 0.5 ? -1 : 1;
      }
      return hv;
    }
  }

  /**
   * Element-wise XOR (multiplication for bipolar vectors).
   */
  public bind(hv1: Float32Array, hv2: Float32Array): Float32Array {
    const result = new Float32Array(this.dimension);
    for (let i = 0; i < this.dimension; i += 1) {
      result[i] = hv1[i] * hv2[i];
    }
    return this.normalize(result);
  }

  /**
   * Majority rule superposition.
   */
  public bundle(hvs: Float32Array[]): Float32Array {
    this.mathBuffer.fill(0);
    const count = hvs.length;
    for (let j = 0; j < count; j += 1) {
      const hv = hvs[j];
      for (let i = 0; i < this.dimension; i += 1) {
        this.mathBuffer[i] += hv[i];
      }
    }
    const result = new Float32Array(this.dimension);
    for (let i = 0; i < this.dimension; i += 1) {
      result[i] = this.mathBuffer[i] >= 0 ? 1 : -1;
    }
    return this.normalize(result);
  }

  public normalize(v: Float32Array): Float32Array {
    let magSq = 0;
    for (let i = 0; i < this.dimension; i += 1) {
      magSq += v[i] * v[i];
    }
    const mag = Math.sqrt(magSq) || 1;
    for (let i = 0; i < this.dimension; i += 1) {
      v[i] /= mag;
    }
    return v;
  }

  public contract(hvs: Float32Array[]): Float32Array {
    if (hvs.length === 0) return new Float32Array(this.dimension).fill(0);
    const tensor = new Float32Array(this.dimension).fill(hvs[0][0]);
    for (let i = 0; i < hvs.length; i += 1) {
      for (let j = 0; j < this.dimension; j += 1) {
        tensor[j] = Math.sin(tensor[j] * hvs[i][j] * Math.PI / 2);
      }
    }
    return tensor;
  }

  public unbind(A: Float32Array, B: Float32Array): Float32Array {
    return this.bind(A, B);
  }

  public permute(A: Float32Array, shift: number = 1): Float32Array {
    const result = new Float32Array(this.dimension);
    for (let i = 0; i < this.dimension; i += 1) {
      result[(i + shift) % this.dimension] = A[i];
    }
    return result;
  }

  public inversePermute(A: Float32Array, shift: number = 1): Float32Array {
    const result = new Float32Array(this.dimension);
    for (let i = 0; i < this.dimension; i += 1) {
      let newIdx = (i - shift) % this.dimension;
      if (newIdx < 0) newIdx += this.dimension;
      result[newIdx] = A[i];
    }
    return result;
  }

  public encodeString(input: string): Float32Array {
    const text = String(input || "");
    const textClean = text.toLowerCase().trim();
    if (!textClean) return new Float32Array(this.dimension).fill(0.1);

    const result = new Float32Array(this.dimension).fill(0);
    const n = 3;
    for (let i = 0; i < textClean.length - (n - 1); i += 1) {
      const gram = textClean.substring(i, i + n);
      let hash = 0;
      for (let j = 0; j < gram.length; j += 1) {
        hash = ((hash << 5) - hash) + gram.charCodeAt(j);
        hash |= 0;
      }

      // Fast vector projection without repeated crypto-hash
      const shift = Math.abs(hash) % this.dimension;
      const sign = hash >= 0 ? 1 : -1;

      for (let j = 0; j < 128; j += 1) { // Sparse projection boost
        const idx = (j * 7 + shift) % this.dimension;
        result[idx] += sign;
      }
    }
    const finalHv = new Float32Array(this.dimension);
    for (let i = 0; i < this.dimension; i += 1) {
      finalHv[i] = result[i] >= 0 ? 1 : -1;
    }
    return finalHv;
  }

  public encodeSequence(symbols: string[]): Float32Array {
    const len = symbols.length;
    if (len === 0) return new Float32Array(this.dimension).fill(0);
    let sequenceHv = new Float32Array(this.dimension).fill(1);
    for (let i = 0; i < len; i += 1) {
      const hv = this.encodeString(symbols[i]);
      const shifted = this.permute(hv, i);
      sequenceHv = this.bind(sequenceHv, shifted);
    }
    return sequenceHv;
  }

  public superposition(memories: MemoryFragment[]): MemoryFragment[] {
    if (memories.length < 5) return memories;
    const threshold = 0.85;
    const groups: MemoryFragment[][] = [];
    const used = new Set<string>();

    for (let i = 0; i < memories.length; i++) {
      if (used.has(memories[i].id)) continue;
      const group = [memories[i]];
      used.add(memories[i].id);

      for (let j = i + 1; j < memories.length; j++) {
        if (used.has(memories[j].id)) continue;
        const sim = this.similarity(
          memories[i].hypervector || new Float32Array(this.dimension), 
          memories[j].hypervector || new Float32Array(this.dimension)
        );
        if (sim > threshold) {
          group.push(memories[j]);
          used.add(memories[j].id);
        }
      }
      groups.push(group);
    }

    return groups.map(g => {
      if (g.length === 1) return g[0];
      return {
        ...g[0],
        content: `[SUPERPOSITION] ${g.length} fragments folded. Primacy: ${g[0].content.substring(0, 30)}...`,
        resonance: g.reduce((acc, m) => acc + m.resonance, 0) / g.length,
        id: `folded-${g[0].id}`,
        hypervector: this.bundle(g.map(m => m.hypervector || new Float32Array(this.dimension)))
      };
    });
  }

  public similarity(hv1: Float32Array, hv2: Float32Array): number {
    let dot = 0;
    const len = Math.min(this.dimension, hv1.length, hv2.length);
    const jitter = this.jitterTable;
    for (let i = 0; i < len; i += 1) {
      dot += hv1[i] * jitter[i] * hv2[i];
    }
    return dot / this.dimension;
  }

  public encode(state: number[]): Float32Array {
    const symbols = state.map((v, i) => `DIM_${i}_VAL_${Math.floor(v * 20)}`);
    return this.encodeSequence(symbols);
  }
}

/**
 * HolographicMemory
 */
export class HolographicMemory {
  private hdc: HDCEngine = new HDCEngine();
  private memoryPool: { hv: Float32Array, val: number, resonance: number, timestamp: number, status: string }[] = [];
  private readonly capacity: number = 500;

  public store(state: number[], value: number, resonance: number) {
    const stateHv = new Float32Array(1024).fill(0);
    for (let i = 0; i < state.length; i++) {
        const valHv = this.hdc.generateHypervector(state[i].toFixed(2));
        const posHv = this.hdc.getPositionHV(i);
        const bound = this.hdc.bind(valHv, posHv);
        for(let j=0; j<1024; j++) stateHv[j] += bound[j];
    }
    const finalHv = new Float32Array(1024);
    for(let j=0; j<1024; j++) finalHv[j] = stateHv[j] >= 0 ? 1 : -1;

    const conflict = this.detectInterference(finalHv, value);
    const status = conflict > 0.6 ? "INTERFERENCE_STRICT" : "STABLE";

    if (!this.memoryPool) this.memoryPool = [];
    this.memoryPool.unshift({ 
      hv: finalHv, 
      val: value, 
      resonance: status === "STABLE" ? resonance : resonance * 0.2, 
      timestamp: Date.now(),
      status 
    });
    
    if (this.memoryPool.length > this.capacity) this.memoryPool.pop();
    this.applyDecay();
  }

  private detectInterference(hv: Float32Array, val: number): number {
    if (this.memoryPool.length === 0) return 0;
    let interference = 0;
    const anchors = this.memoryPool.slice(0, 50).filter(m => m.resonance > 0.8);
    for (const anchor of anchors) {
      const sim = this.hdc.similarity(hv, anchor.hv);
      if (sim > 0.5 && Math.abs(val - anchor.val) > 0.5) {
        interference = Math.max(interference, sim);
      }
    }
    return interference;
  }

  private applyDecay() {
    const now = Date.now();
    this.memoryPool = this.memoryPool.map(m => {
      const age = (now - m.timestamp) / 1000;
      const decayFactor = Math.pow(0.999, age);
      return { ...m, resonance: m.resonance * decayFactor };
    }).filter(m => m.resonance > 0.05);
  }

  public decay(rate: number = 0.001) {
    if (!this.memoryPool) this.memoryPool = [];
    this.memoryPool = this.memoryPool.map(m => {
      return { ...m, resonance: m.resonance * (1 - rate) };
    }).filter(m => m.resonance > 0.01);
  }

  public query(state: number[]): { bestValue: number, confidence: number, bestHv: Float32Array | null, superpositionValue?: number } {
    if (!this.memoryPool || this.memoryPool.length === 0) return { bestValue: 0, confidence: 0, bestHv: null };
    
    const queryHv = new Float32Array(1024).fill(0);
    for (let i = 0; i < state.length; i++) {
        const valHv = this.hdc.generateHypervector(state[i].toFixed(2));
        const posHv = this.hdc.getPositionHV(i);
        const bound = this.hdc.bind(valHv, posHv);
        for(let j=0; j<1024; j++) queryHv[j] += bound[j];
    }
    const finalQueryHv = new Float32Array(1024);
    for(let j=0; j<1024; j++) finalQueryHv[j] = queryHv[j] >= 0 ? 1 : -1;

    let bestMatch = this.memoryPool[0];
    let maxSim = -Infinity;
    let weightedValueSum = 0;
    let totalWeight = 0;

    for (const entry of this.memoryPool) {
      if (entry.status === "INTERFERENCE_STRICT") continue;
      const sim = this.hdc.similarity(finalQueryHv, entry.hv);
      if (sim > maxSim) {
        maxSim = sim;
        bestMatch = entry;
      }
      if (sim > 0.4) {
        const weight = Math.pow(sim, 4) * entry.resonance; 
        weightedValueSum += entry.val * weight;
        totalWeight += weight;
      }
    }
    
    const superpositionValue = totalWeight > 0 ? weightedValueSum / totalWeight : bestMatch.val;
    return { 
        bestValue: bestMatch.val, 
        confidence: Math.max(0, maxSim), 
        bestHv: bestMatch.hv,
        superpositionValue
    };
  }
}
