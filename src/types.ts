/**
 * VEDA Unified Sovereign Typology & Contract System (全域強規規約中心型別)
 * 
 * Provides rigorous mathematical and structural typing, complete decoupling of
 * presentation (UI/Visual) state from core thermodynamic and cognitive models, 
 * and explicit typing specifications replacing loose objects.
 */

// ============================================================================
// 1. CORE SYSTEM ENUMS & CONSTANTS
// ============================================================================

export enum EvolutionStatus {
  IDLE = "IDLE",
  SUCCESS = "SUCCESS",
  ADAPTIVE = "ADAPTIVE",
  CRITICAL_REJECTION = "CRITICAL REJECTION",
  ULTIMATE_SANCTION = "ULTIMATE_SANCTION"
}

export type ViewMode = 
  | 'DIALOGUE' 
  | 'SYNAPSE' 
  | 'DREAM' 
  | 'CORE' 
  | 'KNOWLEDGE' 
  | 'SOVEREIGN' 
  | 'SYNTHESIS' 
  | 'VISUAL' 
  | 'EFFICACY' 
  | 'CINEMA' 
  | 'TASKS' 
  | 'PALANTIR_AIP' 
  | 'ARCHITECTURE';

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

// ============================================================================
// 2. DECOUPLED VIEW & PRESENTATION ARCHITECTURE (UI-Only Data Structures)
// ============================================================================

/**
 * Encapsulates all presentation-level configurations to prevent contamination
 * of core telemetry and mathematical models with visual-only states.
 */
export interface UIViewState {
  currentViewMode: ViewMode;
  isNetworkDisplayVisible: boolean;
  isAuditLogOpen: boolean;
  activeWorkspaceId?: string;
  selectedAxiomsTags: string[];
  expandedSceneId?: string;
  themeMode: 'light' | 'dark' | 'cosmic';
  terminalFullscreen: boolean;
  dreamscapePlaybackSpeed: number;
}

// ============================================================================
// 3. EXPLICIT COGNITIVE STATE MODELS (State Representation Layer)
// ============================================================================

export interface CharacterState {
  id: string;
  state: string;
  position: string;
  inventory: string[];
  emotion: string;
}

export interface EnvironmentState {
  time: string;
  weather: string;
  condition: string;
  location: string;
}

export interface WorldState {
  characters: CharacterState[];
  environment: EnvironmentState;
  narrative_tension: number;
  physics_constancy: number; // 0.0 to 1.0 (conservation metric)
  causal_entropy: number;
  internal_pressure: number;
  cohesion_index: number;
}

export interface WorldModel {
  snapshot: WorldState;
  axioms: string[];
  laws_of_nature: string[];
  causal_history: string[]; // Traces of critical intervention events
  version: string;
}

export interface EpistemicModelState {
  credibility?: number;
  beliefUniformity?: number;
  falsificationStatus?: string;
}

export interface CausalLatticeElement {
  id: string;
  label: string;
  density?: number;
  connectedCount?: number;
}

export interface CausalLatticeState {
  nodes?: CausalLatticeElement[];
  density?: number;
  isAcyclic?: boolean;
}

export interface SpatialManifoldState {
  nodes?: number;
  edges?: number;
  dimension?: number;
  fractal_dimension?: number;
  hypervolume?: number;
  ego_center?: number[];
}

export interface SubsystemTelemetry {
  status: string;
  coherence?: number;
  load?: number;
  errorRate?: number;
}

export interface CortexNodeState {
  id: string;
  specialization: string;
  health: number;
  load: number;
}

export interface PINCNeuron {
  id: string;
  name?: string;
  potential?: number;
  energy?: number;
  spikeCount?: number;
  threshold?: number;
  refractory?: boolean | number;
  strengthIndex?: number;
  coordinates?: { x: number; y: number; z: number };
}

export interface PINCSynapse {
  preId?: string;
  postId?: string;
  source?: string;
  target?: string;
  weight: number;
  delta: number;
}

export interface PincState {
  frequency_offset?: number;
  temperature_damping?: number;
  is_neuromorphic_active?: boolean;
  weight_coherence?: number;
  energy_spectral_coherence?: number;
  current_stability?: number;
  core_utilization?: number;
  queue_pressure?: number;
  fano_factor?: number;
  neurons?: PINCNeuron[];
  synapses?: PINCSynapse[];
  metabolicSavingsPercent?: number;
  freeEnergyPrecisionModulation?: number;
  totalSpikeCount?: number;
  averagePotential?: number;
  frequency_hz?: number;
}

// ============================================================================
// 4. ACTION & INTERACTION MODELS (Action Layer Contracts)
// ============================================================================

export interface CognitiveAction {
  name?: string;
  url?: string;
  type?: string;
  actions?: CognitiveAction[];
  parameters?: Record<string, string | number | boolean>;
  [key: string]: unknown;
}

export interface SovereignBurstAction {
  id: string;
  timestamp: number;
  targetZone: string;
  voltageMultiplier: number;
  approvedByArchitect: boolean;
}

export interface PalantirDecision {
  id: string;
  policy: string;
  impactWeight: number;
  causalAnchorId?: string;
  status: 'PENDING' | 'EXECUTED' | 'DISMISSED';
}

// ============================================================================
// 5. THEORETICAL MEMORY & LATTICE MODELS (Memory Layer Contracts)
// ============================================================================

export interface MemoryFragment {
  id: string;
  type: string;
  content: string;
  resonance: number;
  timestamp: string;
}

export interface SovereignKnowledge {
  id: string;
  content: string;
  hv: number[]; // Hypervector representation
  causalSignature: string;
  scope: SovereignScope;
  originSid: string;
  resonanceCount: number;
  timestamp: string;
  expiresAt?: string;
}

export interface Reminder {
  id: string;
  task: string;
  time: string; // ISO DateTime
  completed: boolean;
}

export interface LatticeJob<T = unknown> {
  id: string;
  type: string;
  status: 'PENDING' | 'PROCESSING' | 'SYNTHESIZING' | 'SOLIDIFIED' | 'FAILED';
  payload: Record<string, unknown> | string | number | boolean | null;
  result?: T;
  coherence: number;
  timestamp: number;
  blockHeight: number;
  isPaused?: boolean;
}

export interface LatticeJobResult {
  jobId: string;
  status: 'SUCCESS' | 'FAULT';
  computedEntropy: number;
  elapsedMs: number;
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

export interface VisualAnchor {
  id: string;
  type: 'CHARACTER' | 'ENVIRONMENT' | 'OBJECT';
  label: string;
  description: string;
  imageUrl?: string;
  causal_weight: number;
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

// ============================================================================
// 6. GENERAL SIGNAL TELEMETRY & STATISTICAL METRICS (System Diagnostics Core)
// ============================================================================

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

export interface JepaMetrics {
  avgEnergy: number;
  currentEnergy: number;
  uncertaintyVariance: number;
  latentState: number[];
}

export interface SafetyAlert {
  id: string;
  timestamp: number;
  type: 'PANIC_DETERRENT' | 'HARM_PREVENTION' | 'UNAUTHORIZED_ATTEMPT' | 'ILLEGAL_ACTION';
  description: string;
  user_mask: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface GovernanceRule {
  targetSid: string;
  strategy: GovernanceStrategy;
  allowedTopics?: string[];
  expiration?: string; // ISO 8601 Date
}

export interface LogEntry {
  id?: string;
  time?: string;
  timestamp?: number;
  msg?: string;
  message?: string;
  type: string;
  data?: unknown;
}

export interface EpistemicLogEntry {
  id: string;
  type: 'PEC_WARNING' | 'SYSTEM_STAGNATION' | 'EVOLUTION' | 'RESONANCE' | 'AUDIT' | 'INFO';
  message: string;
  timestamp: number;
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
  actions?: CognitiveAction[];
  demystifiedText?: string;
  showDemystified?: boolean;
}

export interface Message {
  id?: string;
  ts?: number;
  role: 'user' | 'veda';
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  mode?: 'LOCAL' | 'HYBRID' | 'EXTERNAL';
  confidence?: number;
  trace?: {
    step: string;
    axiom?: string;
    coherence?: number;
    vector?: number[];
  }[];
  actions?: CognitiveAction[];
  isStreaming?: boolean;
  showDemystified?: boolean;
  demystifiedText?: string;
  isDemystifying?: boolean;
  sources?: GroundingSource[];
}

export interface BaselineAnchor {
  id: string;
  label?: string;
  timestamp?: number;
  metrics?: Record<string, number>;
}

export interface BaselineConfig {
  version?: string;
  axioms?: string[];
  anchors?: BaselineAnchor[];
}

export interface FederationNode {
  id: string;
  url?: string;
  name?: string;
  status?: 'ONLINE' | 'OFFLINE' | 'UNREACHABLE';
  coherence?: number;
  lastPing?: number;
}

export interface CounterfactualScenario {
  id: string;
  name?: string;
  description?: string;
  resilienceScore?: number;
  probability?: number;
  systemStabilityOutcome?: string;
  active?: boolean;
}

export interface CounterfactualReport {
  baselineVFE?: number;
  causalResilienceIndex?: number;
  entropyCriticalThreshold?: number;
  scenarios?: CounterfactualScenario[];
}

export interface AerospaceControlParams {
  learningRate?: number;
  forgettingFactor?: number;
  processNoiseScale?: number;
  measurementNoiseScale?: number;
  chiSquareConfidence?: number;
}

export interface AerospaceDefenceState {
  status?: string;
  shieldsActive?: boolean;
  threatLevel?: number;
  redundantBranchesStatus?: string[];
  lastEdacHash?: string;
  edacParityMatch?: boolean;
  lastKalmanInnovation?: number;
  totalVotes?: number;
  currentParams?: AerospaceControlParams;
}

export interface DistillationMetrics {
  distillationEntropy?: number;
  reconstructionPurity?: number;
  compensationOps?: number;
}

export interface CognitiveSelfModel {
  predictedAccuracy?: number;
  metaAwarenessScore?: number;
}

export interface ManifoldPoint {
  id: string;
  x: number;
  y: number;
  z: number;
  label: string;
  type: string;
}

export interface FalsifiabilityHypothesis {
  id: string;
  description: string;
  indicator: string;
  threshold: number;
  operator: "<" | ">";
  status: "ACTIVE" | "FALSIFIED" | "STABLE";
}

export interface FalsifiabilityNote {
  id: string;
  result: string;
  pValue: number;
  tStatistic: number;
}

export interface ResearchChronicleEvent {
  id?: string;
  title?: string;
  event?: string;
  timestamp?: string;
  coherenceAtTrigger?: number;
}

export interface LiteraturePipelineMetrics {
  generator_output?: number;
  constraint_load?: number;
  actor_coherence?: number;
  trigger_fidelity?: number;
}

export interface CognitiveFailureAnalysis {
  logic_drift?: number;
  conceptualBypass?: boolean;
}

export interface DistilledChatContext {
  version: string;
  chainDepth: number;
  summary: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  location: string;
  humidity: number;
  wind: number;
}

export interface SensorData {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  imu: { accel: number; gyro: number };
}

export interface CognitiveEfficacy {
  comprehensionIndex: number;
  reasoningIndex: number;
  analyticalIndex: number;
  executionIndex: number;
  systemOverallEfficacy: number;
}

export interface InnovationManifold {
  innovationIndex: number;
  experienceSum: number;
  leapPotential: number;
  alignmentIndex: number;
  uncertaintyVariance?: number;
  protocol: string;
  latency_ns?: number;
  throughput_teraops?: number;
}

export interface BurstStatus {
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
}

export interface OntologyConcept {
  id: string;
  name: string;
  properties?: Record<string, string>;
}

export interface OntologyRelation {
  source: string;
  target: string;
  type: string;
}

export interface PalantirOntology {
  objects?: OntologyConcept[];
  relations?: OntologyRelation[];
}

export interface CognitiveMetricsState {
  patternCapacity?: number;
  causalInferenceScore?: number;
  metaCoherence?: number;
  foragingEfficiency?: number;
  stability?: number;
  precision?: number;
  resonance?: number;
  memoryCache?: number;
}

export interface ForagingStatus {
  curiosityLevel?: number;
  recentLogs?: string[];
  surpriseAverages?: number;
}

export interface CognitiveIdentity {
  name: string;
  authorityLevel: string;
  publicKey: string;
  syncFrequency: string;
  identity_status?: 'VERIFIED_ARCHITECT' | 'ANOMALOUS_ACCESS' | string;
  resonance_score?: number;
}

export interface CommercialMetrics {
  slaRealtime?: string;
  tokenThroughput?: number;
  activeCores?: number;
  costSavingRatio?: number;
  marketResonance?: number;
  riskThreshold?: number;
  serviceTier?: string;
}

export interface MarketPrediction {
  id: string;
  trend: string;
  probability: number;
  timeframe: string;
}

// ============================================================================
// 7. THE MASTER UNIFIED STATE MATRIX (The Central BrainData State Model)
// ============================================================================

export interface BrainSettings {
  vector_intent?: number[];
  showNetworkDisplay?: boolean;
  [key: string]: unknown;
}

export interface BrainData extends BrainMetrics, BrainStatus {
  // Principal State Indicators & Trajectories
  vectors: number[];
  labels: string[];
  history: number[];
  coherence_history?: number[];
  quantum_waveform?: number[];
  sovereign_confidence?: number;
  reasoning_mode?: 'LOCAL' | 'HYBRID' | 'EXTERNAL';

  // System Diagnostics
  sovereign_index?: number;
  lattice_scale?: number;
  effective_node_count?: number;
  is_planck_active?: boolean;
  systemID?: string;
  compute_mode?: string;
  is_causal_isolated?: boolean;
  active_tenants?: string[];
  current_tenant?: string;
  language_manifold?: string;
  evolution_points?: number;
  is_support_authorized?: boolean;
  logs?: LogEntry[];
  stability?: number;
  settings?: BrainSettings;
  tier_capabilities?: Record<string, boolean | string | number>;
  causal_congruence?: number;
  state_hash?: string;
  chat_history?: Message[];
  baseline?: BaselineConfig;
  federation_multiplier?: number;
  energy_level?: number;
  federation?: FederationNode[];
  cortex_array?: CortexNodeState[];
  trend?: number;
  trend_state?: string;
  strategic_rank?: string;
  vault_active?: boolean;
  guardian_mode?: boolean;
  last_sovereign_action?: string;
  simulation_step_size?: number;
  simulation_complexity?: number;
  agi_proximity?: number;
  fractal_depth?: number;
  throughput?: number;
  is_zpdp_active?: boolean;
  coherence_threshold?: number;
  burst_phase?: string;
  coherence?: number;
  counterfactual_report?: CounterfactualReport;
  aerospace_defence?: AerospaceDefenceState;
  system_deblinded?: boolean;
  distillation_metrics?: DistillationMetrics;
  self_model?: CognitiveSelfModel;

  // Topological Grid Representations
  network?: number[][];
  layers: NetworkLayer[];
  crystal?: CrystalStatus;
  manifold_points?: ManifoldPoint[];
  
  // High-Density Persistence Vaults
  axioms?: string[];
  reflections?: string[];
  memories?: MemoryFragment[];
  reminders?: Reminder[];
  
  // Distributed Autonomic Components
  lattice_jobs?: LatticeJob[];
  lattice_results?: LatticeJobResult[];
  strategic_simulations?: StrategicSimulation[];
  long_video_projects?: LongVideoProject[];
  strategic_reports?: StrategicReport[];
  jepa?: JepaMetrics;
  market_predictions?: MarketPrediction[];
  falsifiability_hypotheses?: FalsifiabilityHypothesis[];
  falsifiability_notes?: FalsifiabilityNote[];
  epistemic_state?: EpistemicModelState;
  causal_lattice?: CausalLatticeState;
  reality_feedback?: unknown;
  spatial_manifold?: SpatialManifoldState;
  subsystems?: Record<string, SubsystemTelemetry>;
  research_chronicles?: ResearchChronicleEvent[];

  // Epistemological Pipeline Outputs
  audit_status?: string;
  pipeline?: LiteraturePipelineMetrics;
  failure_analysis?: CognitiveFailureAnalysis;
  
  // Synthesized World Context
  system_world_model?: WorldModel;
  distilled_chat_context?: DistilledChatContext;
  
  // Decoupled Environmental Targets
  weather?: WeatherData | null;
  sensorData?: SensorData;

  // Fully Typed Domain Submodels
  cognitive_efficacy?: CognitiveEfficacy;
  innovation_manifold?: InnovationManifold;
  burst_status?: BurstStatus;
  palantir_decisions?: PalantirDecision[];
  palantir_ontology?: PalantirOntology;
  pinc?: PincState;
  cognitive_metrics?: CognitiveMetricsState;
  foraging_status?: ForagingStatus;
  cognitive_identity?: CognitiveIdentity;
  commercial_metrics?: CommercialMetrics;
  safety_alerts?: SafetyAlert[];
  governanceRules?: GovernanceRule[];

  // User presentation and environment decoupling hooks
  ui_state_reference?: UIViewState;
  custom_attributes?: Record<string, unknown>;
}

// ============================================================================
// 8. AMBIENT GLOBAL DECLARATIONS
// ============================================================================

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
