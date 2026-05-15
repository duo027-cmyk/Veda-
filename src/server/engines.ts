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
 */
export class HDCEngine {
  private readonly dim: number = 1024;
  private jitterTable: Float32Array = new Float32Array(1024);

  constructor(dimension: number = 1024) {
    this.dim = dimension;
    for (let i = 0; i < 1024; i++) {
      this.jitterTable[i] = 1.0 + (Math.sin(i * 0.1) * 0.0005);
    }
  }

  public generateHypervector(seed?: string): Float32Array {
    const hv = new Float32Array(this.dim);
    if (seed) {
        const hash = crypto.createHash('sha256').update(seed).digest();
        for (let i = 0; i < this.dim; i++) {
            const byte = hash[i % hash.length];
            const bitOffset = Math.floor(i / hash.length) % 8;
            const bit = (byte >> bitOffset) & 1;
            hv[i] = bit === 1 ? 1 : -1;
        }
    } else {
        for (let i = 0; i < this.dim; i++) hv[i] = Math.random() < 0.5 ? -1 : 1;
    }
    return hv;
  }

  public bind(hv1: Float32Array, hv2: Float32Array): Float32Array {
    const result = new Float32Array(this.dim);
    for (let i = 0; i < this.dim; i++) {
        result[i] = hv1[i] * hv2[i];
    }
    return this.normalize(result);
  }

  public bundle(hvs: Float32Array[]): Float32Array {
    const sum = new Float32Array(this.dim);
    hvs.forEach(hv => {
      for (let i = 0; i < this.dim; i++) sum[i] += hv[i];
    });
    return this.normalize(sum);
  }

  public normalize(v: Float32Array): Float32Array {
    let mag = 0;
    for (let i = 0; i < this.dim; i++) mag += v[i] * v[i];
    mag = Math.sqrt(mag) || 1;
    for (let i = 0; i < this.dim; i++) v[i] /= mag;
    return v;
  }

  public contract(hvs: Float32Array[]): Float32Array {
    if (hvs.length === 0) return new Float32Array(this.dim).fill(0);
    const tensor = new Float32Array(this.dim).fill(hvs[0][0]);
    for (let i = 0; i < hvs.length; i++) {
        for (let j = 0; j < this.dim; j++) {
            tensor[j] = Math.sin(tensor[j] * hvs[i][j] * Math.PI / 2);
        }
    }
    return tensor;
  }

  public unbind(A: Float32Array, B: Float32Array): Float32Array {
    return this.bind(A, B);
  }

  public permute(A: Float32Array, shift: number = 1): Float32Array {
    const result = new Float32Array(this.dim);
    for (let i = 0; i < this.dim; i++) {
      result[(i + shift) % this.dim] = A[i];
    }
    return result;
  }

  public inversePermute(A: Float32Array, shift: number = 1): Float32Array {
    const result = new Float32Array(this.dim);
    for (let i = 0; i < this.dim; i++) {
        let newIdx = (i - shift) % this.dim;
        if (newIdx < 0) newIdx += this.dim;
        result[newIdx] = A[i];
    }
    return result;
  }

  public encodeString(text: string): Float32Array {
    const textClean = text.toLowerCase().trim();
    if (!textClean) return new Float32Array(this.dim).fill(0.1);
    
    const result = new Float32Array(this.dim).fill(0);
    const n = 3; 
    for (let i = 0; i < textClean.length - (n - 1); i++) {
        const gram = textClean.substring(i, i + n);
        let hash = 0;
        for (let j = 0; j < gram.length; j++) {
            hash = ((hash << 5) - hash) + gram.charCodeAt(j);
            hash |= 0;
        }
        const shift = i % this.dim;
        for (let j = 0; j < this.dim; j++) {
            const val = ((hash ^ (j * 1337)) & 1) ? 1 : -1;
            result[(j + shift) % this.dim] += val;
        }
    }
    const finalHv = new Float32Array(this.dim);
    for(let i=0; i<this.dim; i++) finalHv[i] = result[i] >= 0 ? 1 : -1;
    return finalHv;
  }

  public encodeSequence(symbols: string[]): Float32Array {
    if (symbols.length === 0) return new Float32Array(this.dim).fill(0);
    let sequenceHv = new Float32Array(this.dim).fill(1);
    symbols.forEach((symbol, index) => {
      const hv = this.encodeString(symbol);
      const shifted = this.permute(hv, index);
      sequenceHv = this.bind(sequenceHv, shifted);
    });
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
          memories[i].hypervector || new Float32Array(this.dim), 
          memories[j].hypervector || new Float32Array(this.dim)
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
        hypervector: this.bundle(g.map(m => m.hypervector || new Float32Array(this.dim)))
      };
    });
  }

  public similarity(hv1: Float32Array, hv2: Float32Array): number {
    let dot = 0;
    const len = Math.min(this.dim, hv1.length, hv2.length);
    for (let i = 0; i < len; i++) {
      dot += (hv1[i] * this.jitterTable[i % 1024]) * hv2[i];
    }
    return dot / this.dim;
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
    const stateHv = this.hdc.generateHypervector();
    for (let i = 0; i < state.length; i++) {
        const valHv = this.hdc.generateHypervector(state[i].toFixed(2));
        const posHv = this.hdc.permute(this.hdc.generateHypervector("pos" + i), i);
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
        const posHv = this.hdc.permute(this.hdc.generateHypervector("pos" + i), i);
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
