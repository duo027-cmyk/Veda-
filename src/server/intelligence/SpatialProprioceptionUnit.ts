/**
 * Spatial Proprioception Unit (SPU) - AGI Sovereign Core v8.8
 * 
 * Logic: Space is constructed via "Action-Feedback" sequences, not visual pixels.
 * Emulates non-visual world construction (Blind Perception Model).
 */

import { BaseSubsystem } from "../Subsystem";
import { WasmEpistemicCore } from "../core/WasmEpistemicCore";

export interface SpatialDelta {
  actionVector: number[]; // Direction [x, y, z]
  resistance: number;    // Physical constraint (0-1)
  proximity: number;     // Auditory/Tactile echo feedback
}

export class SpatialProprioceptionUnit extends BaseSubsystem {
  // Latent map: A topological graph of landmark nodes
  private internalMap: Map<string, { density: number; connections: Set<string>; sensingVector?: Float64Array }> = new Map();
  private lastLandmark: string | null = null;
  private currentLocation: Float64Array = new Float64Array(3);

  // High-dimensional Active Sensing loop (Emulating 12 sensory tracks e.g. micro-tactility, echo radar, tension, phase coupling)
  private activeSensingChannels: Float64Array = new Float64Array(12);
  private activeAcuity: number = 0.95;
  private microSaccadePhase: number = 0;
  private wasmCore = new WasmEpistemicCore();

  public async initialize(): Promise<void> {
    this.status = 'ONLINE';
    this.log("READY", "非視覺空間流形感知器已就緒。已開啟 12 通道主動傳感環路與微震顫探測。");
  }

  public tick(delta: number, globalState: number[]): void {
    // Autonomous drift or internal consistency checks could go here
    this.lastUpdate = Date.now();
  }
  
  /**
   * Updates the egocentric spatial manifold based on action delta and feedback.
   */
  public integrate(action: number[], feedback: number, entropy: number): { x: number; y: number; z: number; density: number; landmarks: number; activeAcuity: number } {
    // 1. Emulate High-Frequency Micro-Saccades phase to explore topological boundaries
    this.microSaccadePhase += 0.22;
    const jitterX = Math.sin(this.microSaccadePhase) * 0.008 * (1 - this.activeAcuity);
    const jitterY = Math.cos(this.microSaccadePhase * 1.3) * 0.008 * (1 - this.activeAcuity);

    // Integrate motion into position
    const multiplier = 1 - entropy;
    this.currentLocation[0] += ((action[0] || 0) + jitterX) * multiplier;
    this.currentLocation[1] += ((action[1] || 0) + jitterY) * multiplier;
    this.currentLocation[2] += (action[2] || 0) * multiplier;
    
    // 2. Continuous 12-channel high-dimensional active sensing integration
    const targetSensoryIn = new Float64Array(12);
    for (let i = 0; i < 12; i++) {
      const actVal = action[i % 3] || 0;
      const combinedSensing = this.wasmCore.fastTanh(actVal * 0.6 + feedback * 0.45 + (1 - entropy) * 0.35 + Math.sin(this.microSaccadePhase + i) * 0.15);
      this.activeSensingChannels[i] = this.activeSensingChannels[i] * 0.82 + combinedSensing * 0.18;
    }

    // Quantize location to create a "landmark" if feedback is significant or position is new
    const cx = Math.round(this.currentLocation[0] * 5) / 5;
    const cy = Math.round(this.currentLocation[1] * 5) / 5;
    const cz = Math.round(this.currentLocation[2] * 5) / 5;
    const key = `${cx}|${cy}|${cz}`;
    
    const sensingSnapshot = new Float64Array(this.activeSensingChannels);

    if (!this.internalMap.has(key)) {
      this.internalMap.set(key, { density: feedback, connections: new Set(), sensingVector: sensingSnapshot });
    } else {
      const node = this.internalMap.get(key)!;
      node.density = node.density * 0.88 + feedback * 0.12;
      if (node.sensingVector) {
        for (let i = 0; i < 12; i++) {
          node.sensingVector[i] = node.sensingVector[i] * 0.72 + sensingSnapshot[i] * 0.28;
        }
      } else {
        node.sensingVector = sensingSnapshot;
      }
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
      landmarks: this.internalMap.size,
      activeAcuity: this.activeAcuity
    };
  }

  public override getTelemetry() {
    return {
      ...super.getTelemetry(),
      manifoldComplexity: this.internalMap.size,
      topologicalDesc: this.getTopologicalDescriptor(),
      egoCenter: Array.from(this.currentLocation),
      activeAcuity: this.activeAcuity,
      sensingChannels: Array.from(this.activeSensingChannels).map(v => Number(v.toFixed(4)))
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
    return Array.from(this.currentLocation);
  }
}

