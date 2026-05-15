// src/server/types.ts
import { BurstMode } from './intelligence';

export interface MemoryFragment {
  id: string;
  type: string;
  content: string;
  resonance: number;
  timestamp: string; // ISO string by default, or harmonized
  hypervector?: Float32Array;
  causalLinks?: string[]; // IDs of parent memories
  status?: "INTEGRATED" | "PENDING_EVIDENCE" | "STRATEGIC_FADE";
}

export interface MemoryNode {
  id: string;
  content: string;
  hypervector?: Float32Array;
  resonance: number;
  timestamp: number;
  metadata?: Record<string, any>;
  accessCount?: number;
  stability?: number;
}

export interface WorldState {
  characters: Array<{
    id: string;
    state: string;
    position: string;
    inventory: string[];
    emotion: string;
  }>;
  environment: {
    time: string;
    weather: string;
    condition: string;
    location: string;
  };
  narrative_tension: number;
  physics_constancy: number;
  causal_entropy: number;
  internal_pressure: number;
  cohesion_index: number;
}

export interface WorldModel {
  snapshot: WorldState;
  axioms: string[];
  laws_of_nature: string[];
  causal_history: string[];
  version: string;
}

export interface TemporalAnchor {
  id: string;
  label: string;
  timestamp: number;
  state: number[];
  memoryCount: number;
  memoryLattice: [string, MemoryNode][]; // Snapshot of current memories
  worldSnapshot: WorldState;
  metadata?: Record<string, any>;
}

export interface StrategicReport {
  id: string;
  title: string;
  status: string;
  progress: number;
  outline: Array<{
    id: string;
    title: string;
    guideline: string;
    content: string;
    status: string;
  }>;
  axioms: string[];
  createdAt: number;
  updatedAt: number;
}

export interface IVedaBrain {
  activateSovereignBurst(target?: string, intensity?: number, manualApproval?: boolean, mode?: BurstMode): Promise<any>;
  approveSovereignBurst(): any;
  deactivateSovereignBurst(reason?: string): Promise<any>;
  triggerResonance(intensity: number): void;
  getGlobalCoherence(): number;
  neuralLog(type: string, msg: string, data?: any): void;
  digestKnowledge(snippets: string[], scope: string, originSid?: string): Promise<void>;
  distillMemories(): Promise<void>;
  initiateCinemaProject(project: any): Promise<any>;
  updateProjectWorldModel(data: { projectId: string; stateUpdate: any; causalEvent: string }): Promise<any>;
  updateSceneStatus(data: { projectId: string; sceneId: string; update: any }): Promise<any>;
  scanNetwork(data: { layerId: string }): Promise<any>;
  generateSovereignResponse(data: { text: string }): Promise<any>;
  registerVisualAsset(asset: any): Promise<any>;
  evaluateBurstPotential(intensity: number, targets: string[]): any;
  createTemporalAnchor(label: string): Promise<TemporalAnchor>;
  timeTravel(anchorId: string): Promise<boolean>;
}
