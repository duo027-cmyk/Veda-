/**
 * Spatial Proprioception Unit (SPU) - AGI Sovereign Core v8.8
 * 
 * Logic: Space is constructed via "Action-Feedback" sequences, not visual pixels.
 * Emulates non-visual world construction (Blind Perception Model).
 */

import { BaseSubsystem } from "../Subsystem";

export interface SpatialDelta {
  actionVector: number[]; // Direction [x, y, z]
  resistance: number;    // Physical constraint (0-1)
  proximity: number;     // Auditory/Tactile echo feedback
}

export class SpatialProprioceptionUnit extends BaseSubsystem {
  // Latent map: A topological graph of landmark nodes
  private internalMap: Map<string, { density: number; connections: Set<string> }> = new Map();
  private lastLandmark: string | null = null;
  private currentLocation: number[] = [0, 0, 0];

  public async initialize(): Promise<void> {
    this.status = 'ONLINE';
    this.log("READY", "非視覺空間流形感知器已就緒。");
  }

  public tick(delta: number, globalState: number[]): void {
    // Autonomous drift or internal consistency checks could go here
    this.lastUpdate = Date.now();
  }
  
  /**
   * Updates the egocentric spatial manifold based on action delta and feedback.
   */
  public integrate(action: number[], feedback: number, entropy: number): { x: number; y: number; z: number; density: number; landmarks: number } {
    // Integrate motion into position
    this.currentLocation = this.currentLocation.map((v, i) => v + (action[i] || 0) * (1 - entropy));
    
    // Quantize location to create a "landmark" if feedback is significant or position is new
    const key = this.currentLocation.map(v => Math.round(v * 5) / 5).join('|');
    
    if (!this.internalMap.has(key)) {
      this.internalMap.set(key, { density: feedback, connections: new Set() });
    } else {
      const node = this.internalMap.get(key)!;
      node.density = node.density * 0.9 + feedback * 0.1;
    }

    // Topological connection: relate current landmark to the previous one
    if (this.lastLandmark && this.lastLandmark !== key) {
      if (this.internalMap.has(this.lastLandmark)) {
        this.internalMap.get(this.lastLandmark)!.connections.add(key);
      }
      if (this.internalMap.has(key)) {
        this.internalMap.get(key)!.connections.add(this.lastLandmark);
      }
    }
    
    this.lastLandmark = key;
    this.lastUpdate = Date.now();
    
    return {
      x: this.currentLocation[0],
      y: this.currentLocation[1],
      z: this.currentLocation[2],
      density: this.internalMap.get(key)?.density || 0,
      landmarks: this.internalMap.size
    };
  }

  public override getTelemetry() {
    return {
      ...super.getTelemetry(),
      manifoldComplexity: this.internalMap.size,
      topologicalDesc: this.getTopologicalDescriptor(),
      egoCenter: [...this.currentLocation]
    };
  }

  public getManifoldComplexity(): number {
    return this.internalMap.size;
  }

  public getTopologicalDescriptor(): string {
    const nodeCount = this.internalMap.size;
    const edgeCount = Array.from(this.internalMap.values()).reduce((acc, n) => acc + n.connections.size, 0) / 2;
    return `Nodes: ${nodeCount} | Edges: ${edgeCount}`;
  }

  public getEgoCenter(): number[] {
    return [...this.currentLocation];
  }
}

