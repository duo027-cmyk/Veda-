export class NetworkManager {
  private layers: Map<string, Float32Array> = new Map();
  private readonly size: number = 19;
  private readonly turboEnabled: boolean = true;

  constructor() {
    this.layers.set("core", new Float32Array(this.size * this.size).map(() => Math.random()));
    this.layers.set("peripheral", new Float32Array(this.size * this.size).map(() => Math.random()));
    this.layers.set("quantum", new Float32Array(this.size * this.size).map(() => Math.random()));
    this.layers.set("prediction", new Float32Array(this.size * this.size).map(() => Math.random()));
    this.layers.set("simulation", new Float32Array(this.size * this.size).map(() => Math.random()));
  }

  public resetLayer(id: string) {
    const data = this.layers.get(id);
    if (data) {
      for (let i = 0; i < data.length; i++) data[i] = Math.random();
    }
  }

  public getLayer(id: string): Float32Array | undefined {
    return this.layers.get(id);
  }

  public getLayerAsMatrix(id: string): number[][] {
    const data = this.layers.get(id);
    if (!data) return [];
    const matrix: number[][] = [];
    for (let i = 0; i < this.size; i++) {
      matrix.push(Array.from(data.slice(i * this.size, (i + 1) * this.size)));
    }
    return matrix;
  }

  public setLayerFromMatrix(id: string, matrix: number[][]) {
    const flat = new Float32Array(matrix.flat());
    this.layers.set(id, flat);
  }

  public calculateCoherence(id: string): number {
    const data = this.layers.get(id);
    if (!data) return 0;
    
    let sum = 0;
    const len = data.length;
    for (let i = 0; i < len; i++) sum += data[i];
    const avg = sum / len;
    
    let varianceSum = 0;
    for (let i = 0; i < len; i++) varianceSum += Math.pow(data[i] - avg, 2);
    const variance = varianceSum / len;
    
    return Math.max(0, Math.min(1, avg * (1 - Math.sqrt(variance))));
  }

  public calculateEntropy(): number {
    let totalEntropy = 0;
    let count = 0;
    this.layers.forEach((data) => {
      let layerSum = 0;
      const len = data.length;
      for (let i = 0; i < len; i++) {
        const val = data[i];
        if (!isNaN(val)) {
          layerSum += val * val;
        }
      }
      const layerEntropy = Math.sqrt(layerSum / len);
      if (!isNaN(layerEntropy)) {
        totalEntropy += layerEntropy;
        count++;
      }
    });
    const result = count > 0 ? totalEntropy / count : 0;
    return isNaN(result) ? 0 : Math.min(1, result);
  }

  public update(id: string, intent: number[], resonance: number, crossInfluence: number = 0) {
    const data = this.layers.get(id);
    if (!data) return;

    const size = this.size;
    const newData = new Float32Array(data.length);
    const now = Date.now();

    for (let i = 0; i < data.length; i++) {
      const x = i % size;
      const y = (i / size) | 0;
      
      let influence = 0;
      const intentIdx = x % 6;
      
      if (id === "core") {
        influence = (intent[intentIdx] + intent[y % 6]) * 0.015 + resonance;
      } else if (id === "peripheral") {
        influence = (intent[(intentIdx + 1) % 6] * intent[(y + 1) % 6]) * 0.01 + resonance;
      } else if (id === "quantum") {
        const phase = (x * 0.1 + y * 0.1 + now * 0.001);
        influence = intent[intentIdx] * 0.02 + resonance + Math.sin(phase) * 0.05;
      } else if (id === "prediction") {
        influence = (intent[intentIdx] * 0.03) + (resonance * 0.5);
      } else if (id === "simulation") {
        influence = (intent[(intentIdx + 2) % 6] * 0.02) + (resonance * 0.3);
      }

      const noise = (Math.random() - 0.5) * (id === "quantum" ? 0.1 : 0.03);
      newData[i] = Math.max(0, Math.min(1, data[i] + influence + noise + crossInfluence));
    }

    if (this.turboEnabled && id === "quantum") {
      this.layers.set(id, HighSpeedProcessing.fastDiffuse(newData, size, 2));
    } else {
      const diffused = new Float32Array(newData.length);
      for (let i = 0; i < newData.length; i++) {
        const x = i % size;
        const y = (i / size) | 0;
        let sum = 0, count = 0;
        
        if (y > 0) { sum += newData[i - size]; count++; }
        if (y < size - 1) { sum += newData[i + size]; count++; }
        if (x > 0) { sum += newData[i - 1]; count++; }
        if (x < size - 1) { sum += newData[i + 1]; count++; }

        diffused[i] = newData[i] * 0.7 + (sum / (count || 1)) * 0.3;
      }
      this.layers.set(id, diffused);
    }
  }

  public decay(rate: number) {
    this.layers.forEach(data => {
      for (let i = 0; i < data.length; i++) {
        data[i] += (0.5 - data[i]) * rate;
      }
    });
  }

  public selfOrganize(layerId: string, targetState: number[], learningRate: number = 0.05) {
    const data = this.layers.get(layerId);
    if (!data) return;

    let bmuIdx = 0;
    let minDist = Infinity;
    
    for (let i = 0; i < data.length; i++) {
      const dist = Math.abs(data[i] - targetState[i % targetState.length]);
      if (dist < minDist) {
        minDist = dist;
        bmuIdx = i;
      }
    }

    const bmuX = bmuIdx % this.size;
    const bmuY = Math.floor(bmuIdx / this.size);
    const radius = 3; 

    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const distToBMU = Math.sqrt(Math.pow(x - bmuX, 2) + Math.pow(y - bmuY, 2));
        if (distToBMU < radius) {
          const idx = y * this.size + x;
          const influence = Math.exp(-Math.pow(distToBMU, 2) / (2 * Math.pow(radius, 2)));
          const targetVal = targetState[idx % targetState.length];
          data[idx] += learningRate * influence * (targetVal - data[idx]);
        }
      }
    }
  }

  public mutate(rate: number) {
    this.layers.forEach(data => {
      for (let i = 0; i < data.length; i++) {
        if (Math.random() < rate) {
          data[i] = Math.max(0, Math.min(1, data[i] + (Math.random() - 0.5) * 0.2));
        }
      }
    });
  }

  public adjustLayerCoherence(id: string, target: number) {
    const data = this.layers.get(id);
    if (!data) return;
    const current = this.calculateCoherence(id);
    const diff = target - current;
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.max(0, Math.min(1, data[i] + diff * 0.1));
    }
  }
}

export class HighSpeedProcessing {
  private static readonly SCALE = 255;

  public static quantize(data: Float32Array): Uint8Array {
    const len = data.length;
    const quantized = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      quantized[i] = (data[i] * 255) | 0;
    }
    return quantized;
  }

  public static dequantize(data: Uint8Array): Float32Array {
    const len = data.length;
    const dequantized = new Float32Array(len);
    const invScale = 1 / 255;
    for (let i = 0; i < len; i++) {
      dequantized[i] = data[i] * invScale;
    }
    return dequantized;
  }

  public static fastDiffuse(data: Float32Array, size: number, iterations: number = 1): Float32Array {
    let current = this.quantize(data);
    const next = new Uint8Array(current.length);
    const s = size;

    for (let iter = 0; iter < iterations; iter++) {
      for (let y = 1; y < s - 1; y++) {
        const offset = y * s;
        for (let x = 1; x < s - 1; x++) {
          const i = offset + x;
          next[i] = (
            (current[i] << 2) + 
            current[i - s] + 
            current[i + s] + 
            current[i - 1] + 
            current[i + 1]
          ) >> 3;
        }
      }
      current.set(next);
    }
    return this.dequantize(current);
  }
}

export class NeuralCache {
  private cache: Map<string, any> = new Map();
  private readonly limit: number = 1000;

  public set(key: string, value: any) {
    if (this.cache.size >= this.limit) {
      const first = this.cache.keys().next().value;
      if (first !== undefined) this.cache.delete(first);
    }
    this.cache.set(key, value);
  }

  public get(key: string): any {
    return this.cache.get(key);
  }

  public has(key: string): boolean {
    return this.cache.has(key) && this.cache.get(key) !== undefined;
  }

  public clear() {
    this.cache.clear();
  }

  public executeStrategicFade(riskLevel: number) {
    if (riskLevel < 0.6) return;
    // Simple fade for now
    if (this.cache.size > 10) {
      const keys = Array.from(this.cache.keys());
      for (let i = 0; i < 5; i++) this.cache.delete(keys[i]);
    }
  }
}
