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

export class LayeredMemory {
  // Tier 1: Sensory buffer (Ephemeral short-term)
  public recentlyInjected: string[] = [];

  // Tier 2: Provisional zone (Short-to-medium episodic staging)
  public provisionalZone: Map<string, MemoryNode> = new Map();

  // Tier 3: Mineral Lattice (Long-term semantic and causal)
  public mineralLattice: Map<string, MemoryNode> = new Map();

  constructor() {}

  /**
   * Tier 1: Ingest transient sensory inputs
   */
  public injectSensory(text: string) {
    if (!text) return;
    this.recentlyInjected.push(text);
    if (this.recentlyInjected.length > 30) {
      this.recentlyInjected.shift(); // Old sensory impressions fade
    }
  }

  public getSensoryBuffer(): string[] {
    return this.recentlyInjected;
  }

  public setSensoryBuffer(buffer: string[]) {
    this.recentlyInjected = buffer || [];
  }

  /**
   * Tier 2: Provisional episodic memory nodes
   */
  public addProvisional(node: MemoryNode) {
    this.provisionalZone.set(node.id, node);
  }

  public getProvisional(id: string): MemoryNode | undefined {
    return this.provisionalZone.get(id);
  }

  public getProvisionalEntries(): [string, MemoryNode][] {
    return Array.from(this.provisionalZone.entries());
  }

  public getProvisionalValues(): MemoryNode[] {
    return Array.from(this.provisionalZone.values());
  }

  public setProvisionalMap(entries: [string, MemoryNode][]) {
    this.provisionalZone = new Map(entries);
  }

  /**
   * Tier 3: Long-term Semantic and Causal Mineral Lattice
   */
  public addMineral(node: MemoryNode) {
    this.mineralLattice.set(node.id, node);
  }

  public getMineral(id: string): MemoryNode | undefined {
    return this.mineralLattice.get(id);
  }

  public hasMineral(id: string): boolean {
    return this.mineralLattice.has(id);
  }

  public getMineralEntries(): [string, MemoryNode][] {
    return Array.from(this.mineralLattice.entries());
  }

  public getMineralValues(): MemoryNode[] {
    return Array.from(this.mineralLattice.values());
  }

  public setMineralMap(entries: [string, MemoryNode][]) {
    this.mineralLattice = new Map(entries);
  }

  public getMineralCount(): number {
    return this.mineralLattice.size;
  }

  /**
   * Universal Memory Deletion / Pruning
   */
  public pruneMemory(id: string): boolean {
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
    if (!query) return [];

    const queryVector = hdc.encodeString(query);

    const matchFragments = Array.from(this.mineralLattice.values())
      .map(m => {
        const similarity = m.hypervector ? hdc.similarity(queryVector, m.hypervector) : 0;
        // Boost distilled context if recent or broadly aligned
        const typeBoost = m.metadata?.type === 'DISTILLED_CONTEXT' ? 0.3 : 0;

        if (similarity > 0.45) {
          m.accessCount = (m.accessCount || 0) + 1;
          m.coherence = Math.min(1.0, m.coherence + 0.01); // Usage reinforces alignment
        }

        return {
          memory: m,
          score: similarity + typeBoost
        };
      })
      .filter(entry => entry.score > 0.45 || entry.memory.metadata?.type === 'DISTILLED_CONTEXT')
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return matchFragments.map(f => ({
      id: f.memory.id,
      content: f.memory.content,
      type: f.memory.metadata?.type,
      ts: f.memory.timestamp,
      relevance: f.score
    }));
  }
}
