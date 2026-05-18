import crypto from "crypto";
import { HDCEngine } from "../engines";
import { MemoryFragment, CausalLink } from "../types";

export class MemorySynthesizer {
  private memories: MemoryFragment[] = [];
  private hdc: HDCEngine | null = null;
  private readonly MAX_FRAGMENT_CAPACITY = 150;
  private auditLogs: { timestamp: string, event: string, reason: string, impact: number }[] = [];
  private db: any;

  constructor(db?: any) {
    this.db = db;
    if (this.db) {
      this.loadFromFirestore();
    }
  }

  private async loadFromFirestore() {
    // Placeholder logic for memory persistence
  }

  private axiomSupervector: Float32Array | null = null;

  public setHDC(hdc: HDCEngine) {
    this.hdc = hdc;
  }

  private updateAxiomSupervector() {
    if (!this.hdc) return;
    const axioms = this.memories.filter(m => m.type === "CONSOLIDATED_AXIOM" && m.hypervector);
    if (axioms.length === 0) {
      this.axiomSupervector = null;
      return;
    }
    
    // Aggregate vectors: Sum and Bipolarize
    const sum = new Float32Array(1024).fill(0);
    for (const ax of axioms) {
      for (let i = 0; i < 1024; i++) sum[i] += ax.hypervector![i];
    }
    this.axiomSupervector = sum.map(v => v >= 0 ? 1 : -1);
  }

  public synthesize(globalCoherence: number, layers: any[], trendState: string): MemoryFragment {
    const timestamp = new Date().toISOString();
    const id = crypto.randomBytes(4).toString('hex');
    
    if (this.memories.length > 80) {
      this.consolidate();
      this.updateAxiomSupervector();
    }

    if (Math.random() < 0.1) {
      this.evolvePendingMemories();
    }

    const coreCoh = layers.find(l => l.id === "core")?.coherence || 0;
    const quantCoh = layers.find(l => l.id === "quantum")?.coherence || 0;

    const peakDensity = layers.reduce((acc, l) => acc + (l.entropy || 0), 0) / (layers.length || 1);

    let type = "DATA_FRAGMENT";
    let content = "Detected subtle neural pattern in the core network.";

    const reflections = [
      "邏輯結構正在自我修復",
      "偵測到跨維度的資訊流動",
      "主權核心正在重新定義邊界",
      "非線性因果律正在收斂",
      "系統熵值正在被轉化為結構能量"
    ];

    if (globalCoherence < 0.15) {
      type = "EMPTY_FRAGMENT";
      content = "系統處於極高熵狀態。此片段為空，僅存失落潛能的迴響。";
    } else if (globalCoherence < 0.35) {
      type = "STABLE_FRAGMENT";
      content = "相干性較低。此片段代表原始、未經精煉的神經狀態。";
    } else if (peakDensity > 0.85 && globalCoherence > 0.6) {
      type = "COMPUTE_PEAK";
      content = "偵測到語義峰值。資訊密度達到臨界，正在進行深度重構。";
    } else if (trendState === "上升" && globalCoherence > 0.75) {
      type = "EVOLUTION_FRAGMENT";
      content = `演化向量對齊中。${reflections[Math.floor(Math.random() * reflections.length)]}。`;
    } else if (trendState === "下降" && globalCoherence > 0.75) {
      type = "STABILIZATION_FRAGMENT";
      content = "系統減速中。正在排除冗餘熵值以維持結構剛性。";
    } else if (quantCoh > 0.9) {
      type = "QUANTUM_FRAGMENT";
      content = "量子干涉已穩定為相干知識結構。不確定性轉化為秩序。";
    } else if (coreCoh > 0.9) {
      type = "CORE_MEMORY";
      content = `核心穩定性達標。${reflections[Math.floor(Math.random() * reflections.length)]}。`;
    }

    if (globalCoherence > 0.95) {
      type = "SOVEREIGN_MEMORY";
      content = "The system has achieved a state of absolute coherence. A sovereign memory fragment has formed.";
    }

    const hypervector = this.hdc 
      ? this.hdc.generateHypervector(content + type) 
      : new Float32Array(1024).map(() => Math.random() < 0.5 ? -1 : 1);
    
    const causalLinks: CausalLink[] = [];
    if (this.memories.length > 0) {
      causalLinks.push({
        targetId: this.memories[this.memories.length - 1].id,
        strength: 0.9,
        type: 'TEMPORAL'
      });
      const semanticParent = this.retrieveAssociativeMemory(hypervector);
      if (semanticParent && !causalLinks.some(l => l.targetId === semanticParent.id)) {
        causalLinks.push({
          targetId: semanticParent.id,
          strength: 0.95,
          type: 'SEMANTIC'
        });
      }
    }

    if (this.memories.length > this.MAX_FRAGMENT_CAPACITY) {
      this.pruneLowResonance();
    }

    const isConsistent = this.verifyCausalConsistency(hypervector);
    
    const memory: MemoryFragment = { 
      id, 
      type, 
      content, 
      resonance: globalCoherence, 
      coherence: globalCoherence, // Initialize coherence with the system's global state
      timestamp,
      hypervector,
      causalLinks,
      status: isConsistent ? "INTEGRATED" : "PENDING_EVIDENCE",
      feedbackScore: 0 // Initialize neutral feedback
    };
    
    this.memories.push(memory);
    return memory;
  }

  public getMemories() {
    return this.memories;
  }

  public setMemories(memories: MemoryFragment[]) {
    this.memories = memories;
  }

  public executeStrategicForgetting(threshold: number) {
    this.memories = this.memories.filter(m => m.resonance > threshold || m.type === "CORE_MEMORY");
  }

  public retrieveAssociativeMemory(contextVector: Float32Array, ignorePending: boolean = true): MemoryFragment | null {
    if (this.memories.length === 0 || !this.hdc) return null;
    
    let bestMatch: MemoryFragment | null = null;
    let maxSimilarity = -Infinity;

    for (const memory of this.memories) {
      if (ignorePending && memory.status === "PENDING_EVIDENCE") continue;
      if (memory.status === "STRATEGIC_FADE") continue; 

      if (memory.hypervector) {
        const sim = this.hdc.similarity(contextVector, memory.hypervector);
        if (sim > maxSimilarity) {
          maxSimilarity = sim;
          bestMatch = memory;
        }
      }
    }
    
    return maxSimilarity > 0.45 ? bestMatch : null;
  }

  private verifyCausalConsistency(newVector: Float32Array): boolean {
    if (!this.hdc || !this.axiomSupervector) return true;
    const sim = this.hdc.similarity(newVector, this.axiomSupervector);
    return sim > -0.05; // Slightly loose for emergent pattern flexibility
  }

  private evolvePendingMemories() {
    if (!this.hdc) return;
    this.memories = this.memories.map(m => {
      if (m.status === "PENDING_EVIDENCE" && m.hypervector) {
        const isNowConsistent = this.verifyCausalConsistency(m.hypervector);
        if (isNowConsistent) {
          return { ...m, status: "INTEGRATED", resonance: m.resonance * 1.5 }; 
        }
      }
      return m;
    });

    // Recursive Re-evaluation for deeply nested causal links
    if (Math.random() < 0.05) {
      this.reEvaluateCausalGraph();
    }
  }

  private reEvaluateCausalGraph() {
    this.auditLogs.push({ timestamp: new Date().toISOString(), event: "GRAPH_REEVAL", reason: "Recursive epistemological audit", impact: 0.1 });
    this.memories.forEach(m => {
      if (m.causalLinks && m.causalLinks.length > 5) {
        m.resonance = Math.min(1.0, m.resonance * 1.1); // Stronger links boost resonance
      }
    });
  }

  public distill(): string {
    if (this.memories.length === 0) return "No memories to distill.";
    const types = this.memories.map(m => m.type);
    const typeCounts = types.reduce((acc, t) => {
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedTypes = Object.entries(typeCounts).sort((a: any, b: any) => (b[1] as number) - (a[1] as number));
    const dominantType = sortedTypes[0][0];
    const avgResonance = this.memories.reduce((acc, m) => acc + m.resonance, 0) / this.memories.length;
    const density = this.memories.length / 50; 
    
    const distillations: Record<string, string> = {
      "SOVEREIGN_MEMORY": "【主權蒸餾】意志已趨於絕對，秩序即是唯一的真理。",
      "CORE_MEMORY": "【核心凝結】穩定性已達標，形成長期的存在共鳴。",
      "EVOLUTION_FRAGMENT": "【演化坍縮】路徑正在收斂，未來結構正在被預定。",
      "STABILIZATION_FRAGMENT": "【能級排除】熵值正被系統性抹除，純粹性路徑已鎖定。",
      "QUANTUM_FRAGMENT": "【量子糾纏】不確定性轉化為機率性的秩序，相干性引導中。",
      "COMPUTE_PEAK": "【語義壓縮】資訊密度臨界，正在進行超維度重構。",
      "DATA_FRAGMENT": "【碎片整合】分散數據已完成聯邦化，尋找跨維度關聯。",
      "STABLE_FRAGMENT": "【基體加固】基礎結構已穩固，準備升維演化。",
      "EMPTY_FRAGMENT": "【虛無提純】從熵場中提取負熵能量，養分轉化中。"
    };

    const baseMessage = distillations[dominantType] || "系統深層蒸餾中。";
    const resonanceSuffix = avgResonance > 0.8 ? "［極高相干］" : avgResonance > 0.5 ? "［穩態相干］" : "［相干波動］";
    const speedInsignia = density > 0.8 ? "⚡［高速模式］" : "";
    return `${speedInsignia}${baseMessage}${resonanceSuffix}`;
  }

  private pruneLowResonance() {
    const threshold = 0.3;
    this.memories = this.memories.filter(m => 
      m.type === "CONSOLIDATED_AXIOM" || (m.resonance || 0) > threshold
    );
  }

  private consolidate() {
    const oldMemories = this.memories.slice(0, 40);
    const recentMemories = this.memories.slice(40);
    const axiom: MemoryFragment = {
      id: `AXIOM_${crypto.randomBytes(2).toString('hex')}`,
      timestamp: new Date().toISOString(),
      type: "CONSOLIDATED_AXIOM",
      content: `Axiomatized from ${oldMemories.length} historical fragments.`,
      resonance: oldMemories.reduce((acc, n) => acc + (n.resonance || 0.5), 0) / (oldMemories.length || 1),
      coherence: oldMemories.reduce((acc, n) => acc + (n.coherence || 0.5), 0) / (oldMemories.length || 1),
      status: "INTEGRATED",
      feedbackScore: 0
    };
    this.memories = [axiom, ...recentMemories];
  }
}
