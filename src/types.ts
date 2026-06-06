export enum EvolutionStatus {
  IDLE = "IDLE",
  SUCCESS = "SUCCESS",
  ADAPTIVE = "ADAPTIVE",
  CRITICAL_REJECTION = "CRITICAL REJECTION",
  ULTIMATE_SANCTION = "ULTIMATE_SANCTION"
}

export type ViewMode = 'DIALOGUE' | 'SYNAPSE' | 'DREAM' | 'CORE' | 'KNOWLEDGE' | 'SOVEREIGN' | 'SYNTHESIS' | 'VISUAL' | 'EFFICACY' | 'CINEMA' | 'TASKS' | 'PALANTIR_AIP' | 'ARCHITECTURE';

export interface NetworkLayer {
  id: string;
  name: string;
  data: number[][];
  coherence: number;
}

export interface CrystalStatus {
  soulName: string;
  stability: number;
  ratios: number[];
}

export interface MemoryFragment {
  id: string;
  type: string;
  content: string;
  resonance: number;
  timestamp: string;
}

export interface VisualAnchor {
  id: string;
  type: 'CHARACTER' | 'ENVIRONMENT' | 'OBJECT';
  label: string;
  description: string;
  imageUrl?: string;
  causal_weight: number;
}

export interface Scene {
  id: string;
  order: number;
  title: string;
  prompt: string;
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  url?: string;
  duration: number;
  causal_summary?: string; 
  visual_references?: string[]; 
  causal_version?: string; 
  causal_integrity?: number; 
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
  physics_constancy: number; // 0-1, tracking how well laws are maintained
  causal_entropy: number;
  internal_pressure: number;
  cohesion_index: number;
}

export interface WorldModel {
  snapshot: WorldState;
  axioms: string[];
  laws_of_nature: string[];
  causal_history: string[]; // Log of major state transitions
  version: string;
}

export interface LongVideoProject {
  id: string;
  title: string;
  description: string;
  fullPrompt: string;
  status: 'PLANNING' | 'DESIGNING_ANCHORS' | 'SYNTHESIZING' | 'COMPLETED';
  scenes: Scene[];
  visualAnchors: VisualAnchor[];
  worldAxioms: string[]; 
  worldModel?: WorldModel;
  distilled_context?: string; 
  last_distillation_ts?: number;
  causal_version: number; 
  baseline_ref?: string;
  metadata: {
    fps: number;
    aspect_ratio: string;
    engine_ver: string;
    total_duration_estimate: number;
  };
  createdAt: number;
  updatedAt: number;
}

export interface StrategicReport {
  id: string;
  title: string;
  intent: string;
  status: 'INITIALIZING' | 'READY' | 'PLANNING' | 'SYNTHESIZING' | 'COMPLETED' | 'FAILED';
  progress: number;
  outline: {
    id: string;
    title: string;
    guideline?: string;
    content: string;
    status: 'PENDING' | 'GENERATING' | 'DONE' | 'FAILED';
  }[];
  axioms: string[];
  createdAt: number;
  updatedAt: number;
  expertiseAssessment?: {
    overallScore: number;
    totalPoints: number;
    grade: 'L1' | 'L2' | 'L3' | 'L4';
    metrics: {
      informationQuality: number;
      causalModel: number;
      counterfactual: number;
      variableWeighting: number;
      uncertainty: number;
      actionability: number;
    };
    pros: string[];
    cons: string[];
    missingAbilities: string[];
    recommendations: string[];
  };
}

export interface LatticeJob<T = any> {
  id: string;
  type: string;
  status: 'PENDING' | 'PROCESSING' | 'SYNTHESIZING' | 'SOLIDIFIED' | 'FAILED';
  payload: any;
  result?: T;
  coherence: number;
  timestamp: number;
  blockHeight: number;
  isPaused?: boolean;
}

export interface JepaMetrics {
  avgEnergy: number;
  currentEnergy: number;
  uncertaintyVariance: number;
  latentState: number[];
}

export interface StrategicSimulation {
  id: string;
  scenario?: string;
  best_path_id?: string;
  divergenceVector?: number[];
  resonanceDelta?: number;
  coherenceOutcome?: number;
  entropy?: number;
  timestamp: number;
}

export interface BrainMetrics {
  global_coherence: number;
  sovereign_coherence?: number;
  phi?: number;
  energy?: number;
  tension?: number;
  entropy: number;
  bias?: number;
  free_energy?: number;
  resonance?: number;
  collectiveStrength?: number;
  pain?: number;
  tension_index?: number;
  confidence_score?: number;
  variational_free_energy?: number;
  omega_integrity?: number;
}

export interface BrainStatus {
  status: string;
  status_code: EvolutionStatus;
  rejection_count: number;
  msg: string;
  version: string;
  system_tier?: 'STANDARD' | 'COMMERCIAL' | 'INDUSTRIAL' | 'STRATEGIC' | 'ARCHITECT' | 'SOVEREIGN_CORE';
  isFocusMode?: boolean;
  isLocked?: boolean;
  isDreaming?: boolean;
  is_bursting?: boolean;
  is_user_burst?: boolean;
  is_logic_frozen?: boolean;
  is_steady_state?: boolean;
}

export interface BrainData extends BrainMetrics, BrainStatus {
  // Vectors and History
  vectors: number[];
  labels: string[];
  history: number[];
  coherence_history?: number[];
  quantum_waveform?: number[];

  // Infrastructure
  network?: number[][];
  layers: NetworkLayer[];
  crystal?: CrystalStatus;
  manifold_points?: { id: string; x: number; y: number; z: number; label: string; type: string }[];
  
  // Data Assets
  axioms?: string[];
  reflections?: string[];
  memories?: MemoryFragment[];
  reminders?: Reminder[];
  
  // Complex Subsystems
  lattice_jobs?: LatticeJob[];
  lattice_results?: any[];
  strategic_simulations?: StrategicSimulation[];
  long_video_projects?: LongVideoProject[];
  strategic_reports?: StrategicReport[];
  jepa?: JepaMetrics;
  
  // Intelligence & Modeling
  system_world_model?: WorldModel;
  distilled_chat_context?: {
    version: string;
    chainDepth: number;
    summary: string;
  };
  
  // Environment
  weather?: {
    temp: number;
    condition: string;
    location: string;
    humidity: number;
    wind: number;
  } | null;
  sensorData?: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    imu: { accel: number; gyro: number };
  };

  // Misc
  innovation_manifold?: {
    innovationIndex: number;
    experienceSum: number;
    leapPotential: number;
    alignmentIndex: number;
    uncertaintyVariance?: number;
    protocol: string;
    latency_ns?: number;
    throughput_teraops?: number;
  };
  burst_status?: {
    active: boolean;
    isApproved: boolean;
    target: string;
    intensity: number;
    peakPower: number;
    entropy: number;
    runtime: number;
    vfe?: number;
    q_coordinate?: number;
    p_momentum?: number;
    totalAction?: number;
    zenoCoeff?: number;
  };
  [key: string]: any; // Keep any as fallback for legacy fields during transition
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export interface SafetyAlert {
  id: string;
  timestamp: number;
  type: 'PANIC_DETERRENT' | 'HARM_PREVENTION' | 'UNAUTHORIZED_ATTEMPT' | 'ILLEGAL_ACTION';
  description: string;
  user_mask: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export enum SovereignScope {
  PVT = "PVT", // Private
  REG = "REG", // Regional
  GLO = "GLO"  // Global
}

export enum GovernanceStrategy {
  MIRROR = "MIRROR",
  PATTERN_ONLY = "PATTERN_ONLY",
  TOPIC_FILTER = "TOPIC_FILTER",
  ON_DEMAND = "ON_DEMAND",
  NEUTRALIZE = "NEUTRALIZE",
  HARMONIZE = "HARMONIZE",
  ABSORB = "ABSORB"
}

export interface GovernanceRule {
  targetSid: string;
  strategy: GovernanceStrategy;
  allowedTopics?: string[];
  expiration?: string; // ISO Date
}

export interface SovereignKnowledge {
  id: string;
  content: string;
  hv: number[]; // Hypervector
  causalSignature: string;
  scope: SovereignScope;
  originSid: string;
  resonanceCount: number;
  timestamp: string;
  expiresAt?: string; // For decay
}

export interface LogEntry {
  time: string;
  msg: string;
  type: EvolutionStatus;
}

export interface Reminder {
  id: string;
  task: string;
  time: string; // ISO string
  completed: boolean;
}

export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ChatStreamResult {
  text?: string;
  sources?: GroundingSource[];
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  suggestions?: string[];
  sovereign_confidence?: number;
  reasoning_mode?: 'LOCAL' | 'HYBRID' | 'EXTERNAL';
  thought_trace?: {
    step: string;
    axiom?: string;
    coherence?: number;
    vector?: number[];
  }[];
  isDone?: boolean;
  isVerified?: boolean;
  actions?: any[];
  demystifiedText?: string;
  showDemystified?: boolean;
}
