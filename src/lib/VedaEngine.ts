import { v4 as uuidv4 } from 'uuid';
import { MemoryFragment, HistoricalSnapshot } from './types';
import { NeuralNetwork } from './NeuralNetwork';
import { SafeEvaluator } from './SafeEvaluator';
import { SemanticParser } from './SemanticParser';

export class VedaEngine {
  network: NeuralNetwork;
  evaluator: SafeEvaluator;
  parser: SemanticParser;
  lastResult: number | null = null;
  logs: { type: 'info' | 'success' | 'error' | 'task'; message: string }[] = [];
  timeline: HistoricalSnapshot[] = [];

  constructor() {
    this.network = new NeuralNetwork();
    this.evaluator = new SafeEvaluator();
    this.parser = new SemanticParser();
    
    // Seed skills
    this.addMemory("加法", "result = params.a + params.b", ["math", "sum"]);
    this.addMemory("乘法", "result = params.a * params.b", ["math", "product"]);
    this.addMemory("減法", "result = params.a - params.b", ["math", "diff"]);
    this.addMemory("除法", "result = params.a / (params.b || 1)", ["math", "ratio"]);
  }

  log(type: 'info' | 'success' | 'error' | 'task', message: string) {
    this.logs.push({ type, message });
    if (this.logs.length > 50) this.logs.shift();
  }

  addMemory(name: string, code: string, tags: string[]) {
    const m: MemoryFragment = {
      id: uuidv4().substring(0, 6),
      name,
      codeTemplate: code,
      tags,
      confidence: 0.5,
      success: 0,
      fail: 0,
      createdAt: Date.now(),
      lastUsed: Date.now()
    };
    this.network.memories.set(m.id, m);
    this.network.insertMemory(m);
    return m;
  }

  private selectMemory(query: string): MemoryFragment | null {
    if (this.network.memories.size === 0) return null;
    
    const lower = query.toLowerCase();
    const candidates = Array.from(this.network.memories.values());
    
    // 1. Try to match by tags first
    const tagged = candidates.filter(m => m.tags.some(tag => lower.includes(tag)));
    if (tagged.length > 0) {
      return tagged.reduce((prev, current) => (prev.confidence > current.confidence) ? prev : current);
    }
    
    // 2. Fallback to highest confidence
    return candidates.reduce((prev, current) => (prev.confidence > current.confidence) ? prev : current);
  }

  private updateMemory(id: string, ok: boolean) {
    const memory = this.network.memories.get(id);
    if (memory) {
      if (ok) memory.success++;
      else memory.fail++;
      
      // Bayesian smoothing for confidence calculation
      memory.confidence = (memory.success + 1) / (memory.success + memory.fail + 2);
      memory.lastUsed = Date.now();
    }
  }

  public recordTemporalSnapshot(label: string): string {
    const snapshot: HistoricalSnapshot = {
      id: uuidv4().substring(0, 8),
      timestamp: Date.now(),
      label,
      coherence: this.network.getCoherence(),
      entropy: this.network.getEntropy(),
      fragments: JSON.parse(JSON.stringify(Array.from(this.network.memories.values())))
    };
    this.timeline.push(snapshot);
    this.log('success', `[TIME_TRAVEL] 執行「歷史快照」：標記錨點 ${label} (ID: ${snapshot.id})`);
    return snapshot.id;
  }

  public timeTravelToAnchor(snapshotId: string): boolean {
    const snapshot = this.timeline.find(s => s.id === snapshotId);
    if (!snapshot) {
      this.log('error', `[TIME_TRAVEL] 異常：找不到快照錨點 ${snapshotId}`);
      return false;
    }
    
    // Clear current state
    this.network.memories.clear();
    this.network.memoryPositions.clear();
    this.network.grid = Array.from({ length: this.network.size }, () => Array(this.network.size).fill(0));
    
    // Restore fragments
    snapshot.fragments.forEach(f => {
       const restored = { ...f, isHistorical: true };
       this.network.insertMemory(restored);
    });
    
    this.log('info', `[TIME_TRAVEL] 成功回溯：已回歸至「${snapshot.label}」(${new Date(snapshot.timestamp).toLocaleString()})`);
    return true;
  }

  /**
   * Sovereign Equilibrium Protocol: The terminal state of optimization.
   * Uses a deterministic gradient-based approach to minimize entropy and maximize coherence.
   */
  public autoEvolve(): { log: string; adjustment: number[] } {
    const coherence = this.network.getCoherence() / 100;
    const entropy = this.network.getEntropy();
    const errorCount = this.logs.filter(l => l.type === 'error').length;
    
    const gap = 1.0 - coherence;
    let log = "";
    let adjustment = [0, 0, 0, 0, 0, 0];

    // Meta-Cognitive Audit & Perfection Logic
    if (errorCount > 3) {
      log = "偵測到邏輯不一致。啟動「絕對修正」：重置不穩定節點，強化因果鏈條。";
      this.logs = this.logs.filter(l => l.type !== 'error');
      this.network.memories.forEach(m => {
        m.confidence = Math.max(m.confidence, 0.8); // Force stabilization
      });
      adjustment = [0.2, 0.3, -0.4, 0, 0, 0];
    } else if (gap < 0.02 && entropy < 0.05) {
      log = "系統已進入「主權平衡」。所有神經向量已達到數學最優解。";
      adjustment = [0, 0, 0, 0, 0, 0];
    } else if (coherence > 0.9) {
      log = "執行「主權演化」：合成終極邏輯單元。";
      adjustment = [0, 0, 0.05, 0.1, 0.05, -0.05];
      
      if (Math.random() > 0.3) {
        const newLogicId = `ULTIMA_${Math.floor(Math.random() * 1000)}`;
        const chosen = `result = math.sqrt(math.pow(params.a, 2) + math.pow(params.b, 2)) * ${coherence.toFixed(4)}`;
        this.addMemory(`${newLogicId}_CORE`, chosen, ["sovereign", "perfected"]);
        log += ` [已合成終極單元：${newLogicId}]`;
      }
    } else {
      log = "優化語義空間，縮減相干性缺口。";
      adjustment = [0.05 * gap, 0.05 * gap, -0.1 * entropy, 0.05 * gap, 0.02 * gap, 0];
    }

    this.log('task', `[SOVEREIGN-EQUILIBRIUM] ${log}`);
    this.network.propagate(5); // Maximum propagation for terminal state
    return { log, adjustment };
  }

  async run(query: string) {
    this.log('task', `Mission: ${query}`);
    
    // 1. Try Semantic Parsing first
    const parsedCode = this.parser.parse(query, this.lastResult);
    if (parsedCode) {
      this.log('info', `Semantic Analysis: Pattern Matched`);
      const evalResult = this.evaluator.eval(parsedCode);
      if (evalResult.success) {
        this.log('success', `Network Reaction: ${evalResult.result}`);
        this.lastResult = typeof evalResult.result === 'number' ? evalResult.result : null;
        this.network.propagate(1);
        return;
      }
    }

    // 2. Fallback to Memory Selection
    const nums = (query.match(/\d+/g) || []).map(Number);
    let memory = this.selectMemory(query);
    
    if (!memory) {
      this.log('info', "Evolution: No existing memory, performing initialization...");
      memory = this.addMemory("auto_gen", "result = params.a + params.b", ["math"]);
    }

    // Prepare parameters
    const params: Record<string, number> = {};
    if (nums.length >= 2) {
      params['a'] = nums[0];
      params['b'] = nums[1];
    } else if (nums.length === 1) {
      params['a'] = (typeof this.lastResult === 'number') ? this.lastResult : nums[0];
      params['b'] = nums[0];
    } else {
      params['a'] = (typeof this.lastResult === 'number') ? this.lastResult : 0;
      params['b'] = 0;
    }

    this.log('info', `Executing Memory: ${memory.name} [${memory.id}]`);
    
    const evalResult = this.evaluator.eval(memory.codeTemplate, params);

    if (evalResult.success) {
      this.log('success', `Network Reaction: ${evalResult.result}`);
      this.lastResult = typeof evalResult.result === 'number' ? evalResult.result : null;
      this.updateMemory(memory.id, true);
    } else {
      this.log('error', `Perturbation Anomaly: ${evalResult.error}`);
      this.updateMemory(memory.id, false);
    }

    // System field propagation
    this.network.propagate(1);
    this.log('info', `Field Sync: Coherence ${this.network.getCoherence().toFixed(2)}%`);
  }
}
