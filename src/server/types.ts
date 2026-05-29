// src/server/types.ts
import { BurstMode } from './intelligence';

export interface CausalLink {
  targetId: string;
  strength: number;
  type: 'SEMANTIC' | 'TEMPORAL' | 'LOGICAL';
}

export interface MemoryFragment {
  id: string;
  type: string;
  content: string;
  resonance: number;
  coherence: number;
  timestamp: string; // ISO string by default, or harmonized
  hypervector?: Float32Array;
  causalLinks?: CausalLink[]; // Enhanced causal link tracking
  status?: "INTEGRATED" | "PENDING_EVIDENCE" | "STRATEGIC_FADE";
  feedbackScore?: number;
}

export interface MemoryNode {
  id: string;
  content: string;
  hypervector?: Float32Array;
  resonance: number;
  coherence: number;
  timestamp: number;
  metadata?: Record<string, any>;
  accessCount?: number;
  stability?: number;
  causalLinks?: CausalLink[]; // Enhanced causal link tracking
  feedbackScore?: number;
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

export interface SystemCoreState {
  energy: number;     // Index 0: System metabolic activity
  stability: number;  // Index 1: Causal coherence baseline
  entropy: number;    // Index 2: Informational disorder
  intent: number;     // Index 3: Teleological alignment
  focus_x: number;    // Index 4: Cognitive focus dimension A
  focus_y: number;    // Index 5: Cognitive focus dimension B
}

export interface TemporalAnchor {
  id: string;
  label: string;
  timestamp: number;
  state: number[]; // Maintained as array for mathematical continuity
  memoryCount: number;
  memoryLattice: [string, MemoryNode][]; // Snapshot of current memories
  worldSnapshot: WorldState;
  metadata?: Record<string, any>;
}

export interface StrategicReport {
  id: string;
  title: string;
  intent?: string;
  status: string;
  directive?: string;
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
  expertiseAssessment?: any;
}

export interface IVedaBrain {
  isReady(): Promise<void>;
  activateSovereignBurst(target?: string, intensity?: number, manualApproval?: boolean, mode?: BurstMode): Promise<any>;
  approveSovereignBurst(): any;
  deactivateSovereignBurst(reason?: string): Promise<any>;
  getBurstOverrides(): {
    batchSizeMultiplier: number;
    quantizationTarget: string;
    latencyTargetNs: number;
    threadPriority: string;
    kvCacheCompression: number;
    computationPrecision: string;
  };
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
  batchSynthesizeReport(reportId: string): Promise<any>;
  executePalantirAIPAction(actionType: "ALIGN_ONTOLOGY" | "MITIGATE_SURPRISE" | "APOLLO_EDGE_CALIBRATION"): any;
  getTelemetryBuffer(): string;
  tick(): void;
  syncTelemetryCache(): Promise<void>;
  processEvolution(intent: number[], sensor: any, text: string): Promise<any>;
  toggleLogicFreeze(): boolean;
  synthesizeMemory(): MemoryFragment | null;
  externalPrecisionInjection(params: any): Promise<any>;
  updateSensorData(params: any): Promise<any>;
  handleChatMessage(text: string, role: string): Promise<any>;
  resetChatHistory(): Promise<void>;
  updateApiKey(key: string): void;
  submitLatticeTask(type: string, payload: any): string;
  solidifyLatticeJob(params: any): Promise<any>;
  initiateStrategicReport(params: any): Promise<any>;
  appraiseStrategicReport(params: any): Promise<any>;
  enrichReportToL4(params: any): Promise<any>;
  synthesizeReportSection(params: any): Promise<any>;
  performAudit(): Promise<any>;
  triggerCognitiveSymmetry(): Promise<any>;
  setDatabase(db: any): void;
  setAdminDatabase(db: any): void;
  updateAxioms(data: { axioms: string[] }): Promise<any>;
  getResearchExport(): any;
  getGlobalCoherence(): number;
  getSovereignPulse(): number;
  getStrategicDirective(): any;
  getSystemID(): string;
  getCausalRecall(query: string): any[];
  getAllMemories(): any[];
  getGraphData(): { nodes: any[], links: any[] };
  verifyAuditKeys(keys: string[]): any;
  setSystemTier(tier: string): Promise<any>;
  runDreamCycle(wss: any): Promise<void>;
  submitFeedback(memoryId: string, score: number): Promise<void>;
  getStrategicStatus(): any;
  generateStrategicReport(): any;
  autoEvolve(): Promise<{ log: string; adjustment: number[] }>;
}
