// src/server/core/LayeredMemory.ts
/**
 * AGI Architecture Academic Protocol (卓越學術憲法 - 記憶分層對齊)
 * Layered Memory Subsystem v1.0 (AGI v6.0 Decoupling)
 * 
 * Implements a strict 3-tier memory protocol to minimize cognitive dependency:
 * Level 1: Working / Sensory Buffer (recentlyInjected) - Fleeting, high-decay.
 * Level 2: Provisional Zone (provisionalZone) - In-flight, unverified, pending integration.
 * Level 3: Long-Term Mineral Lattice (mineralLattice) - Solidified, deep causal graph.
 */

import { MemoryNode, CausalLink } from "../types";
import { HDCEngine } from "../engines";
import crypto from "crypto";

export class LayeredMemory {
  // Tier 1: Sensory buffer (Ephemeral short-term)
  public recentlyInjected: string[] = [];

  // Tier 2: Provisional zone (Short-to-medium episodic staging)
  public provisionalZone: Map<string, MemoryNode> = new Map();

  // Tier 3: Mineral Lattice (Long-term semantic and causal)
  public mineralLattice: Map<string, MemoryNode> = new Map();

  constructor() {}

  /**
   * Helper to securely sanitize and format memory nodes to aerospace-grade specifications.
   */
  private sanitizeNode(node: Partial<MemoryNode>): MemoryNode {
    const safeId = typeof node.id === "string" && node.id.trim() ? node.id : `MEM_${crypto.randomBytes(4).toString("hex")}`;
    const safeContent = typeof node.content === "string" ? node.content : "[CORRUPTED_ENTRY_RECOVERED]";
    const safeResonance = typeof node.resonance === "number" && Number.isFinite(node.resonance) ? Math.max(0, Math.min(1.0, node.resonance)) : 0.5;
    const safeCoherence = typeof node.coherence === "number" && Number.isFinite(node.coherence) ? Math.max(0, Math.min(1.0, node.coherence)) : 0.5;
    const safeTimestamp = typeof node.timestamp === "number" && Number.isFinite(node.timestamp) ? node.timestamp : Date.now();
    const safeAccessCount = typeof node.accessCount === "number" && Number.isFinite(node.accessCount) ? Math.max(0, Math.floor(node.accessCount)) : 0;
    const safeStability = typeof node.stability === "number" && Number.isFinite(node.stability) ? Math.max(0, Math.min(1.0, node.stability)) : 0.5;
    
    let safeCausalLinks: CausalLink[] = [];
    if (Array.isArray(node.causalLinks)) {
      safeCausalLinks = node.causalLinks
        .filter(l => l && typeof l.targetId === "string" && l.targetId.trim())
        .map(l => ({
          targetId: l.targetId,
          strength: typeof l.strength === "number" && Number.isFinite(l.strength) ? Math.max(0, Math.min(1.0, l.strength)) : 0.5,
          type: l.type === 'TEMPORAL' || l.type === 'SEMANTIC' ? l.type : 'TEMPORAL'
        }));
    }

    const safeMetadata = node.metadata && typeof node.metadata === "object" ? { ...node.metadata } : {};

    return {
      id: safeId,
      content: safeContent,
      resonance: safeResonance,
      coherence: safeCoherence,
      timestamp: safeTimestamp,
      hypervector: node.hypervector instanceof Float32Array ? node.hypervector : undefined,
      accessCount: safeAccessCount,
      stability: safeStability,
      causalLinks: safeCausalLinks,
      feedbackScore: typeof node.feedbackScore === "number" && Number.isFinite(node.feedbackScore) ? node.feedbackScore : 0,
      metadata: safeMetadata
    };
  }

  /**
   * Tier 1: Ingest transient sensory inputs
   */
  public injectSensory(text: string) {
    if (typeof text !== "string" || !text.trim()) return;
    this.recentlyInjected.push(text);
    if (this.recentlyInjected.length > 30) {
      this.recentlyInjected.shift(); // Old sensory impressions fade
    }
  }

  public getSensoryBuffer(): string[] {
    return Array.isArray(this.recentlyInjected) ? [...this.recentlyInjected] : [];
  }

  public setSensoryBuffer(buffer: string[]) {
    if (Array.isArray(buffer)) {
      this.recentlyInjected = buffer.filter(item => typeof item === "string");
    } else {
      this.recentlyInjected = [];
    }
  }

  /**
   * Tier 2: Provisional episodic memory nodes
   */
  public addProvisional(node: MemoryNode) {
    if (!node || typeof node !== "object") return;
    const sanitized = this.sanitizeNode(node);
    this.provisionalZone.set(sanitized.id, sanitized);
  }

  public getProvisional(id: string): MemoryNode | undefined {
    if (typeof id !== "string") return undefined;
    const node = this.provisionalZone.get(id);
    return node ? this.sanitizeNode(node) : undefined;
  }

  public getProvisionalEntries(): [string, MemoryNode][] {
    try {
      return Array.from(this.provisionalZone.entries()).map(([k, v]) => [k, this.sanitizeNode(v)]);
    } catch {
      return [];
    }
  }

  public getProvisionalValues(): MemoryNode[] {
    try {
      return Array.from(this.provisionalZone.values()).map(v => this.sanitizeNode(v));
    } catch {
      return [];
    }
  }

  public setProvisionalMap(entries: [string, MemoryNode][]) {
    try {
      const sanitizedEntries = (Array.isArray(entries) ? entries : [])
        .filter(entry => entry && typeof entry[0] === "string" && entry[1] && typeof entry[1] === "object")
        .map(([k, v]) => [k, this.sanitizeNode(v)] as [string, MemoryNode]);
      this.provisionalZone = new Map(sanitizedEntries);
    } catch {
      this.provisionalZone = new Map();
    }
  }

  /**
   * Tier 3: Long-term Semantic and Causal Mineral Lattice
   */
  public addMineral(node: MemoryNode) {
    if (!node || typeof node !== "object") return;
    const sanitized = this.sanitizeNode(node);
    this.mineralLattice.set(sanitized.id, sanitized);
  }

  public getMineral(id: string): MemoryNode | undefined {
    if (typeof id !== "string") return undefined;
    const node = this.mineralLattice.get(id);
    return node ? this.sanitizeNode(node) : undefined;
  }

  public hasMineral(id: string): boolean {
    if (typeof id !== "string") return false;
    return this.mineralLattice.has(id);
  }

  public getMineralEntries(): [string, MemoryNode][] {
    try {
      return Array.from(this.mineralLattice.entries()).map(([k, v]) => [k, this.sanitizeNode(v)]);
    } catch {
      return [];
    }
  }

  public getMineralValues(): MemoryNode[] {
    try {
      return Array.from(this.mineralLattice.values()).map(v => this.sanitizeNode(v));
    } catch {
      return [];
    }
  }

  public setMineralMap(entries: [string, MemoryNode][]) {
    try {
      const sanitizedEntries = (Array.isArray(entries) ? entries : [])
        .filter(entry => entry && typeof entry[0] === "string" && entry[1] && typeof entry[1] === "object")
        .map(([k, v]) => [k, this.sanitizeNode(v)] as [string, MemoryNode]);
      this.mineralLattice = new Map(sanitizedEntries);
    } catch {
      this.mineralLattice = new Map();
    }
  }

  public getMineralCount(): number {
    return this.mineralLattice.size;
  }

  /**
   * Universal Memory Deletion / Pruning
   */
  public pruneMemory(id: string): boolean {
    if (typeof id !== "string" || !id) return false;
    const deletedMineral = this.mineralLattice.delete(id);
    const deletedProvisional = this.provisionalZone.delete(id);
    return deletedMineral || deletedProvisional;
  }

  /**
   * Clear all transient and long-term memory structures
   */
  public clearAll() {
    this.recentlyInjected = [];
    this.provisionalZone.clear();
    this.mineralLattice.clear();
  }

  /**
   * Performs deep similarity matching against the Mineral Lattice
   * and boosts relative DISTILLED_CONTEXT nodes.
   */
  public getCausalRecall(query: string, hdc: HDCEngine, limit: number = 5): Array<{
    id: string;
    content: string;
    type?: string;
    ts: number;
    relevance: number;
  }> {
    if (typeof query !== "string" || !query.trim() || !hdc || typeof hdc.encodeString !== "function") return [];

    const validatedLimit = typeof limit === "number" && Number.isFinite(limit) ? Math.max(1, limit) : 5;

    try {
      const queryVector = hdc.encodeString(query);
      if (!(queryVector instanceof Float32Array)) return [];

      const matchFragments = Array.from(this.mineralLattice.values())
        .map(m => {
          let similarity = 0;
          try {
            similarity = m.hypervector ? hdc.similarity(queryVector, m.hypervector) : 0;
          } catch (simErr) {
            console.error("[LayeredMemory_RECALL_FAULT] Hypervector comparison exception:", simErr);
            similarity = 0;
          }
          
          const validSimilarity = Number.isFinite(similarity) ? similarity : 0;
          // Boost distilled context if recent or broadly aligned
          const isDistilled = m.metadata?.type === 'DISTILLED_CONTEXT';
          const typeBoost = isDistilled ? 0.3 : 0;

          if (validSimilarity > 0.45) {
            m.accessCount = (m.accessCount || 0) + 1;
            m.coherence = Math.min(1.0, (m.coherence || 0.5) + 0.01); // Usage reinforces alignment
          }

          return {
            memory: m,
            score: validSimilarity + typeBoost
          };
        })
        .filter(entry => {
          const isDistilled = entry.memory.metadata?.type === 'DISTILLED_CONTEXT';
          return entry.score > 0.45 || isDistilled;
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, validatedLimit);

      return matchFragments.map(f => ({
        id: f.memory.id,
        content: f.memory.content,
        type: f.memory.metadata?.type,
        ts: typeof f.memory.timestamp === "number" ? f.memory.timestamp : Date.now(),
        relevance: Number.isFinite(f.score) ? f.score : 0.5
      }));
    } catch (criticalRecallErr) {
      console.error("[LayeredMemory_CRITICAL_RECALL_FAILED] Safe isolation captured:", criticalRecallErr);
      return [];
    }
  }
}

