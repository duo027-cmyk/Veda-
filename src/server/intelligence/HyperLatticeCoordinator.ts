import { HDCEngine } from "../engines";
import { BaseSubsystem } from "../Subsystem";

export class HyperLatticeCoordinator extends BaseSubsystem {
  private federationNodes: Map<string, { hypervector: Float32Array, coherence: number, lastSync: number }> = new Map();
  private globalAxiomField: Float32Array = new Float32Array(1024).fill(0);
  private hdc: HDCEngine;
  private semanticBridge: Map<string, string[]> = new Map();

  constructor(hdc: HDCEngine) {
    super();
    this.hdc = hdc;
  }

  public async initialize(): Promise<void> {
    this.status = 'ONLINE';
    this.log("READY", "超晶格協調器(HDC)已就緒。");
  }

  public tick(delta: number, globalState: number[]): void {
    this.lastUpdate = Date.now();
  }

  public override getTelemetry() {
    return {
      ...super.getTelemetry(),
      nodeCount: this.federationNodes.size,
      bridgeComplexity: this.semanticBridge.size,
      fieldStrength: this.calculateFieldStrength()
    };
  }

  private calculateFieldStrength(): number {
    return Array.from(this.federationNodes.values()).reduce((acc, n) => acc + n.coherence, 0) / (this.federationNodes.size || 1);
  }

  public bridgeDomains(domainA: string, domainB: string) {
    const list = this.semanticBridge.get(domainA) || [];
    if (!list.includes(domainB)) {
      list.push(domainB);
      this.semanticBridge.set(domainA, list);
    }
  }

  public associativeRetrieve(queryVector: Float32Array): string[] {
    const findings: string[] = [];
    this.federationNodes.forEach((node, key) => {
      let dotProduct = 0;
      for (let i = 0; i < 1024; i++) dotProduct += queryVector[i] * node.hypervector[i];
      if (dotProduct > 0.7) findings.push(key);
    });
    return findings;
  }

  public reconcile(nodeId: string, nodeHv: Float32Array, nodeCoherence: number): { action: "INTEGRATE" | "REJECT" | "ALIGN", fieldResonance: number } {
    this.federationNodes.set(nodeId, { hypervector: nodeHv, coherence: nodeCoherence, lastSync: Date.now() });
    this.updateGlobalField();
    const similarity = this.hdc.similarity(nodeHv, this.globalAxiomField);
    if (similarity < -0.1 && nodeCoherence < 0.7) return { action: "REJECT", fieldResonance: similarity };
    if (similarity < 0.3) return { action: "ALIGN", fieldResonance: similarity };
    return { action: "INTEGRATE", fieldResonance: similarity };
  }

  private updateGlobalField() {
    const nodes = Array.from(this.federationNodes.values());
    const totalPotential = nodes.reduce((acc, node) => acc + node.coherence, 0);
    if (totalPotential === 0) return;
    const newField = new Float32Array(1024).fill(0);
    nodes.forEach(node => {
      const weight = node.coherence / totalPotential;
      for (let i = 0; i < 1024; i++) newField[i] += node.hypervector[i] * weight;
    });
    for (let i = 0; i < 1024; i++) this.globalAxiomField[i] = newField[i] >= 0 ? 1 : -1;
  }
}
