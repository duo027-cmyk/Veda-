export enum EvolutionStatus {
  IDLE = "IDLE",
  SUCCESS = "SUCCESS",
  ADAPTIVE = "ADAPTIVE",
  CRITICAL_REJECTION = "CRITICAL REJECTION",
  ULTIMATE_SANCTION = "ULTIMATE_SANCTION"
}

export type ViewMode = 'DIALOGUE' | 'SYNAPSE' | 'DREAM' | 'CORE' | 'KNOWLEDGE' | 'SOVEREIGN' | 'SYNTHESIS' | 'VISUAL' | 'EFFICACY' | 'CINEMA';

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
}

export interface LatticeJob {
  id: string;
  type: string;
  payload: any;
  status: 'PENDING' | 'PROCESSING' | 'SYNTHESIZING' | 'SOLIDIFIED' | 'FAILED';
  result?: any;
  timestamp: number;
}

export interface BrainData {
  lattice_jobs?: any[];
  lattice_results?: any[];
  epistemic_state?: {
    credibility: number;
    pollution_level: number;
    last_verification_ts: number;
  };
  causal_lattice?: {
    nodes: Array<{ id: string; label: string; weight: number; layer: string }>;
    edges: Array<{ source: string; target: string; strength: number }>;
  };
  strategic_simulations?: Array<{
    id: string;
    scenario: string;
    paths: Array<{ id: string; outcome: string; probability: number; risk: number }>;
    best_path_id: string;
    entropy: number;
  }>;
  reality_feedback?: Array<{
    id: string;
    inputId: string;
    predictedOutcome: string;
    actualOutcome: string;
    bias: number;
    backprop_status: 'STABLE' | 'COLLAPSED' | 'REPAIRED';
  }>;
  status: string;
  status_code: EvolutionStatus;
  rejection_count: number;
  pain: number;
  msg: string;
  vectors: number[];
  labels: string[];
  history: number[];
  coherence_history?: number[];
  version: string;
  is_unique_architect?: boolean;
  strategic_rank?: string;
  sovereign_confidence?: number;
  reasoning_mode?: 'LOCAL' | 'HYBRID' | 'EXTERNAL';
  network?: number[][]; // Renamed from lattice
  layers: NetworkLayer[];
  crystal?: CrystalStatus;
  global_coherence: number;
  sovereign_coherence?: number;
  phi?: number;
  energy?: number;
  tension?: number;
  entropy: number;
  bias?: number;
  free_energy?: number;
  resonance?: number;
  shadow_count?: number;
  active_attention?: string;
  hybrid_mode?: 'WARRIOR' | 'ARCHITECT';
  quantum_waveform?: number[];
  manifold_points?: { id: string; x: number; y: number; z: number; label: string; type: string }[];
  trend?: number;
  trend_state?: string;
  axioms?: string[];
  reflections?: string[];
  memories?: MemoryFragment[];
  isFocusMode?: boolean;
  isLocked?: boolean;
  isDreaming?: boolean;
  is_bursting?: boolean;
  is_user_burst?: boolean;
  is_steady_state?: boolean;
  is_support_authorized?: boolean;
  language_manifold?: 'AUTO' | 'ZH_TW' | 'EN' | 'JP' | 'VI' | 'KO';
  commercial_metrics?: {
    marketResonance: number;
    operationalUptime: number;
    riskThreshold: number;
    serviceTier: string;
  };
  market_predictions?: Array<{
    timestamp: number;
    scenario: string;
    confidence: number;
    predicted_resonance: number;
  }>;
  is_causal_isolated?: boolean;
  active_tenants?: string[];
  current_tenant?: string;
  system_tier?: 'STANDARD' | 'COMMERCIAL' | 'INDUSTRIAL' | 'STRATEGIC' | 'ARCHITECT';
  tier_capabilities?: {
    processing_power: number;
    causal_depth: number;
    market_foresight: number;
    security_clearance: number;
  };
  distilled_chat_context?: {
    version: string;
    chainDepth: number;
    parentHash?: string;
    summary: string;
  };
  system_world_model?: WorldModel;
  long_video_projects?: LongVideoProject[];
  strategic_reports?: StrategicReport[];
  research_chronicles?: any[];
  baseline?: {
    version: string;
    axioms: string[];
    anchors: any[];
    status: string;
  } | null;
  burst_progress?: number;
  burst_phase?: string;
  is_logic_frozen?: boolean;
  v9_status?: string;
  logs?: any[];
  settings?: any;
  active_layer?: string;
  collectiveStrength?: number;
  effective_node_count?: number;
  lattice_scale?: number;
  omega_integrity?: number;
  fractal_depth?: number;
  throughput?: number;
  causal_congruence?: number;
  reminders?: Reminder[];
  systemID?: string;
  evolution_points?: number;
  governanceRules?: GovernanceRule[];
  negative_energy?: number;
  guardian_mode?: boolean;
  lattice_integrity?: number;
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
  is_solomon_active?: boolean;
  is_nanosecond_sync?: boolean;
  is_zpdp_active?: boolean;
  matrix_latency?: number;
  causal_anchor?: number;
  matrix_stability?: number;
  vfe?: number;
  energy_level?: number;
  holographic_coherence?: number;
  causal_nexus?: any; // Global nexus map
  proactive_goal?: string;
  autonomy_degree?: number;
  prediction_error?: number;
  ops_per_tick?: number;
  is_planck_active?: boolean;
  coherence_threshold?: number;
  last_sovereign_action?: string;
  vault_active?: boolean;
  sovereign_index?: number;
  active_governance?: string[];
  state_hash?: string;
  hallucination_index?: number;
  alignment_integrity?: number;
  audit_status?: string;
  evolution_logs?: string[];
  tension_index?: number;
  confidence_score?: number;
  simulation?: {
    actors: {
      name: string;
      decision: 'ESCALATE' | 'RESPOND_LIMITED' | 'HOLD';
      risk_level: number;
      utility_score?: number;
    }[];
    constraints: {
      score: number;
      issues: string[];
    };
    event: {
      name: string;
      intensity: number;
    };
  };
  stability?: number;
  variational_free_energy?: number;
  pipeline?: {
    generator_output: number;
    scenario_depth: number;
    constraint_load: number;
    actor_coherence: number;
    trigger_fidelity: number;
  };
  failure_analysis?: {
    logic_drift: number;
    data_gap: number;
    norm_deviation: number;
  };
  jepa?: {
    avgEnergy: number;
    currentEnergy: number;
    latentState: number[];
  };
  foraging_status?: {
    curiosityLevel: number;
    recentLogs: string[];
    surpriseAverages: number;
  };
  innovation_manifold?: {
    innovationIndex: number;
    experienceSum: number;
    leapPotential: number;
    alignmentIndex: number;
    uncertaintyVariance?: number;
    protocol: string;
    throughput_teraops?: number;
    latency_ns?: number;
  };
  federation?: any[];
  cortex_array?: any[];
  federation_multiplier?: number;
  safety_alerts?: SafetyAlert[];
  chat_history?: any[];
  cognitive_identity?: {
    resonance_score: number;
    behavioral_baseline_match: boolean;
    identity_status: 'VERIFIED_ARCHITECT' | 'ANOMALOUS_ACCESS' | 'STANDARD_USER';
  };
  visual_stream?: Array<{
    type: 'IMAGE' | 'VIDEO' | 'AUDIO';
    url: string;
    prompt: string;
    timestamp: number;
  }>;
  burst_status?: {
    active: boolean;
    isApproved: boolean;
    target: string;
    intensity: number;
    peakPower: number;
    entropy: number;
    runtime: number;
  };
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
}
