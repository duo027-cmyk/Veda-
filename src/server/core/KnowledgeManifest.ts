import { WorldModel } from "../types";

/**
 * KnowledgeManifest - 知識清單
 * Preserves the high-level world model, epistemic state, and topological causal lattice.
 */
export class KnowledgeManifest {
  private worldModel: WorldModel;
  private epistemicState = {
    credibility: 1.0,
    pollution_level: 0.0,
    last_verification_ts: Date.now()
  };
  private causalLattice = {
    nodes: [] as any[],
    edges: [] as any[]
  };

  constructor(initialModel: WorldModel) {
    this.worldModel = initialModel;
  }

  public updateModel(update: Partial<WorldModel>) {
    this.worldModel = { ...this.worldModel, ...update };
  }

  public getModel() {
    return this.worldModel;
  }

  public updateEpistemic(credibility: number) {
    this.epistemicState.credibility = credibility;
    this.epistemicState.last_verification_ts = Date.now();
  }

  public getEpistemic() {
    return this.epistemicState;
  }

  public registerCausalNode(node: any) {
    this.causalLattice.nodes.push(node);
    if (this.causalLattice.nodes.length > 500) this.causalLattice.nodes.shift();
  }

  public getTopologicalState() {
    return {
      nodeCount: this.causalLattice.nodes.length,
      edgeCount: this.causalLattice.edges.length,
      credibility: this.epistemicState.credibility
    };
  }
}
