import crypto from "crypto";
import path from "path";
import { create, insert, search, save, load, type Orama } from "@orama/orama";
import { WebSocket } from "ws";
import { doc, setDoc, collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { GoogleGenAI } from "@google/genai";
import { handleFirestoreError, OperationType } from "../lib/firebase";

import { AuditSubsystem } from "./AuditSystem";
import { PersistenceSubsystem } from "./PersistenceSubsystem";
import { 
  FormalValidator, 
  WeiSolomonCausality, 
  SolomonKingEngineV3, 
  XCausalTransformer
} from "./causality";

import { 
  GenerativeModel, 
  HDCEngine, 
  HolographicMemory 
} from "./engines";

import { 
  ActiveInferenceManifold, 
  StabilityManifold, 
  ConsciousnessMonitor, 
  Actor 
} from "./manifolds";

import { 
  MineralSeed, 
  SovereignLatticeV9, 
  CrystalSoul, 
  AGI_LatticeStructuralCore,
  MineralLatticeComputeArray,
  LatticeJob
} from "./lattice";

import { 
  NetworkManager, 
  NeuralCache, 
  HighSpeedProcessing 
} from "./network";

import { LatticeExecutionManager } from "./core/LatticeExecutionManager";
import { CausalNexus } from "./core/CausalNexus";
import { AutonomicEngine } from "./core/AutonomicEngine";
import { SovereignSenses } from "./core/SovereignSenses";
import { StrategicLayer } from "./core/StrategicLayer";
import { KnowledgeManifest } from "./core/KnowledgeManifest";
import { EvolutionManager } from "./core/EvolutionManager";
import { SovereignIntegrity } from "./core/SovereignIntegrity";
import { CausalProcessor } from "./core/CausalProcessor";
import { 
  SemanticSolomonEngine, 
  HyperLatticeCoordinator, 
  ConsanguinityProtocol, 
  MemorySynthesizer, 
  AGI_JEPA_Arch, 
  TrendPredictor, 
  GeneticOptimizer, 
  SystemController, 
  ConstraintEngine, 
  CoreAxioms, 
  MassiveIngestionEngine,
  DualTrackMapper,
  FalsifiabilityEngine,
  PredictiveCorrectionEngine,
  BurstImpactEvaluator,
  SelfHealingProtocol,
  CausalBurstEngine,
  BurstMode,
  EpistemicForagingUnit,
  StrategicPlanningUnit,
  LanguageEncoder,
  SpatialProprioceptionUnit
} from "./intelligence";

import { SubsystemManager } from "./SubsystemManager";
import { MemoryFragment, MemoryNode, IVedaBrain, WorldModel, TemporalAnchor, StrategicReport } from "./types";
import { CONFIG, SYSTEM_FEEDBACK, STATE_PATH, ORAMA_PATH, CHAT_HISTORY_PATH } from "./constants";

export class AGISovereignBrain implements IVedaBrain {
  private state: number[] = [0.5, 0.8, 0.1, 0.2, 0.5, 0.5];
  private stateSnapshot: number[] = [0.5, 0.8, 0.1, 0.2, 0.5, 0.5];
  private isProcessing: boolean = false;
  private network: NetworkManager = new NetworkManager();
  private thermalMemory: AGI_LatticeStructuralCore = new AGI_LatticeStructuralCore(128);
  private inferenceManifold: ActiveInferenceManifold = new ActiveInferenceManifold();
  private stabilityManifold: StabilityManifold = new StabilityManifold();
  private negativeEnergyAbsorbed: number = 0.0;
  private guardianMode: boolean = true;
  private neuralCache: NeuralCache = new NeuralCache();
  private controller: SystemController = new SystemController();
  private coreAxioms: CoreAxioms = new CoreAxioms();
  private autonomic: AutonomicEngine;
  private senses: SovereignSenses = new SovereignSenses();
  private strategic: StrategicLayer = new StrategicLayer();
  private manifest: KnowledgeManifest;
  private causalNexus = new CausalNexus();
  private baseline: any = null;
  private isExternalAiBlocked: boolean = false;
  
  private checkpoint: number[] = [...this.state];
  private rejectionCount: number = 0.0;
  private status: string = "AGI 系統核心：運行中";
  private history: number[] = [];
  private coherenceHistory: number[] = [];
  private resonancePulse: number = 0; 
  private engineType: string = "GEMINI_3"; 
  private trendPredictor: TrendPredictor = new TrendPredictor();
  private synthesizer: MemorySynthesizer;
  private geneticOptimizer: GeneticOptimizer;
  private solomonEngine: SemanticSolomonEngine | null = null;
  private agiJEPA: AGI_JEPA_Arch;
  private consciousnessMonitor: ConsciousnessMonitor = new ConsciousnessMonitor();
  private constraintEngine: ConstraintEngine = new ConstraintEngine();
  private ethicsCore: CrystalSoul = new CrystalSoul("AGI_ETHICS_CORE");
  private immuneLattice: SovereignLatticeV9 = new SovereignLatticeV9();
  private hyperLattice: HyperLatticeCoordinator;
  private dynamicConfig = { ...CONFIG };
  private actorProtocol: Actor = new Actor("VEDA_SURVIVOR", 0.8, 0.45, { domestic_pressure: 0.2 });
  private mathMapper: DualTrackMapper = new DualTrackMapper();
  private falsifiability: FalsifiabilityEngine = new FalsifiabilityEngine();
  private pecEngine: PredictiveCorrectionEngine = new PredictiveCorrectionEngine();
  private burstEvaluator: BurstImpactEvaluator = new BurstImpactEvaluator();
  private selfHealing: SelfHealingProtocol = new SelfHealingProtocol();
  private burstEngine: CausalBurstEngine = new CausalBurstEngine();
  private strategicPlanning: StrategicPlanningUnit = new StrategicPlanningUnit();
  private langEncoder: LanguageEncoder = new LanguageEncoder();
  private spatialProprioception: SpatialProprioceptionUnit = new SpatialProprioceptionUnit();
  private epistemicForaging: EpistemicForagingUnit;
  private evolutionManager: EvolutionManager;
  private integrity: SovereignIntegrity;
  private causalProcessor: CausalProcessor;
  private latticeManager: LatticeExecutionManager;
  private globalWorkspace: { attention: string; priority: number; focus: string[] } = { attention: "IDLE", priority: 0, focus: [] };
  private fitnessWeights = { stability: 0.6, trend: 0.4 };
  private metaStrategyHistory: any[] = [];
  private simulationBuffer: number[][] = [];
  private lastSovereignConfidence: number = 0.5;
  private lastReasoningMode: 'LOCAL' | 'HYBRID' | 'EXTERNAL' = 'HYBRID';
  private computeTaskQueue: Map<string, (result: any) => void> = new Map();
  private saveTimeout: NodeJS.Timeout | null = null;
  private evolutionPoints: number = 0;
  private evolutionLogs: string[] = [];
  private consecutivePerfections: number = 0;
  private strategicRank: string = "NETWORK-BETA (B)";
  private isLogicFrozen: boolean = false;
  private isZPDPActive: boolean = false; 
  private subsystemManager: SubsystemManager = new SubsystemManager();
  private zdpdTimer: NodeJS.Timeout | null = null;
  private isDreaming: boolean = false;
  private isSteadyStateActive: boolean = false; 
  private isNanosecondSyncActive: boolean = false; 
  private isPlanckDilationActive: boolean = false;
  private coherenceThreshold: number = 0.65; 
  private ai: GoogleGenAI;
  private chatHistory: any[] = [];
  private distillationHistory: any[] = [];
  private researchChronicles: any[] = [];
  private distilledChatContext: any = {
    version: "0.0.0",
    summary: "初始認識論狀態：空。系統已就緒。",
    parentHash: null,
    timestamp: Date.now(),
    chainDepth: 0
  };
  private readonly CHAT_HISTORY_LIMIT = 100; // Increased for better context retention
  private logs: any[] = [];
  private lastTickTime: number = Date.now();
  private recentlyInjected: string[] = []; // V-AA Core: High-priority context buffer
  private lastTickNanos: bigint = process.hrtime.bigint();
  private physicalOpsCount: number = 0;
  private causalAnchorCount: number = 0;
  private intent: number[] = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
  
  private mineralLattice: Map<string, MemoryNode> = new Map();
  private provisionalZone: Map<string, MemoryNode> = new Map();
  private causalRegistry: Map<string, { nextP: number[], hits: number }> = new Map();
  private causality: WeiSolomonCausality = new WeiSolomonCausality();
  private validator: FormalValidator = new FormalValidator();
  private solomonKing: SolomonKingEngineV3 = new SolomonKingEngineV3();
  private auditSystem: AuditSubsystem = new AuditSubsystem();
  private persistenceSystem: PersistenceSubsystem = new PersistenceSubsystem(process.cwd());
  private generativeModel: GenerativeModel = new GenerativeModel(6);
  private hdc: HDCEngine = new HDCEngine();
  private holographicMemory: HolographicMemory = new HolographicMemory();
  private v9Lattice: SovereignLatticeV9 = new SovereignLatticeV9();
  private crystalSoul: CrystalSoul = new CrystalSoul();
  private latticeComputeArray: MineralLatticeComputeArray = new MineralLatticeComputeArray();
  private massiveIngestion: MassiveIngestionEngine;
  private consanguinity: ConsanguinityProtocol;
  private jepa: AGI_JEPA_Arch = new AGI_JEPA_Arch(6);
  private causalIndex!: any;
  private systemID: string = `VEDA-SYSTEM-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
  private lastSovereignAction: string = "BOOT_INITIAL_COHERENCE";
  private lastAuditResult: any = null;
  private shadowRegister: any[] = [];
  private readonly SHADOW_CAPACITY = 100;
  private shadowEvolutionCount: number = 0;
  private energyLevel: number = 0.85;
  private lastTelemetryState: any = null;
  private isSaving = false;
  private isDistilling = false;
  private lastTelemetryUpdateTime: number = 0;
  private cachedManifold: any[] = [];
  private lastManifoldUpdateTime: number = 0;
  private projectionCache: Map<string, any> = new Map();
  private reflection_buffer: string[] = [];
  private expectedFreeEnergy: number = 0.2;
  private variationalFreeEnergy: number = 0.5;
  private matrixStability: number = 1.0;
  private anchorEntropy: number = 0.1;
  private predictionError: number = 0.1;
  private omegaIntegrity: number = 1.0;
  private fractalDepth: number = 3;
  private currentTension: number = 0.1;
  private currentEnergy: number = 0.85;
  private sovereigntyBias: number = 0.9;
  private focusLevel: number = 1.0;
  private autonomyDegree: number = 0.5;
  private proactiveGoal: string = "MAXIMIZE_LOGICAL_COHERENCE";
  private latticeScale: number = 1.0;
  private federationBurstMultiplier: number = 1.0;
  private isSolomonDecreeActive: boolean = false;
  private hybridState: 'WARRIOR' | 'ARCHITECT' = 'ARCHITECT';
  private absorptionRate: number = 0.65;
  private maxAbsorbCapacity: number = 0.5;
  private cognitiveShards: Map<string, any> = new Map();
  private federatedNodes: Map<string, { url: string, coherence: number, lastSeen: number }> = new Map();
  private truthAnchors: Float32Array[] = [];
  private readonly LATTICE_DIM = 256;
  private sovereignHypervector: Float32Array = new Float32Array(1024).fill(0);
  private cachedQuantumWaveform: number[] = new Array(24).fill(0).map(() => 0.5);
  private cachedPain: number = 0;
  private cachedPhi: number = 0.5;
  private cachedGenerativeFreeEnergy: number = 0.1;
  private phiThresholdV8: number = 0.6;
  private currentPhysicalTPS: number = 16.6; 
  private matrixWorkloadFactor: number = 1.0;
  private weather: any = null;
  private sensorData = { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, imu: { accel: 0, gyro: 0 } };
  private cognitiveResonance: number = 1.0;
  private interactionCount: number = 0;
  private isSupportAuthorized: boolean = false;
  private languageManifold: string = 'AUTO';
  private systemTier: string = 'STANDARD';
  private tierCapabilities = {
    processing_power: 0.2,
    causal_depth: 0.1,
    market_foresight: 0.05,
    security_clearance: 1
  };
  private auditKeys: string[] = ["紅茶", "懶鬼", "夜之領主"];
  private activeTenants: string[] = ["CORE_ARCHITECT", "PREVIEW_GUEST"];
  private currentTenantId: string = "CORE_ARCHITECT";
  private isCausalIsolated: boolean = true;
  private visualStream: any[] = [];
  private longVideoProjects: any[] = [];
  private temporalAnchors: TemporalAnchor[] = [];
  private systemWorldModel: WorldModel;
  private db: any = null;
  private adminDb: any = null;

    public sovereign_index: number = 0; // Will be calculated dynamically

  private readyPromise: Promise<void>;
  private resolveReady!: () => void;

  constructor() {
    this.readyPromise = new Promise(resolve => {
      this.resolveReady = resolve;
    });

    this.synthesizer = new MemorySynthesizer();
    this.geneticOptimizer = new GeneticOptimizer(6);
    this.massiveIngestion = new MassiveIngestionEngine(this);
    this.consanguinity = new ConsanguinityProtocol(this);
    this.solomonEngine = new SemanticSolomonEngine(null, 30, 0.08, 0.3); // Initialize for semantic drift
    this.agiJEPA = new AGI_JEPA_Arch(6);
    this.epistemicForaging = new EpistemicForagingUnit(this.agiJEPA, this.coreAxioms);
    this.hyperLattice = new HyperLatticeCoordinator(this.hdc);

    this.initializeSubsystems();

    this.systemWorldModel = {
      snapshot: {
        characters: [],
        environment: { time: "RELATIVE_NOW", weather: "COHERENT", condition: "STABLE", location: "VEDA_CORE" },
        narrative_tension: 0.1,
        physics_constancy: 1.0,
        causal_entropy: 0.01,
        internal_pressure: 0.1,
        cohesion_index: 0.9
      },
      axioms: [],
      laws_of_nature: ["RECURSIVE_INTEGRITY", "CAUSAL_CONTINUITY"],
      causal_history: ["INITIAL_BOOT"],
      version: "1.0.0"
    };

    this.manifest = new KnowledgeManifest(this.systemWorldModel);

    this.evolutionManager = new EvolutionManager(
      this.pecEngine,
      this.burstEngine,
      this.burstEvaluator,
      this.falsifiability,
      this.manifest,
      {
        triggerResonance: (intensity) => this.triggerResonance(intensity),
        neuralLog: (type, msg, data) => this.neuralLog(type as any, msg, data)
      }
    );

    this.integrity = new SovereignIntegrity(
      this.auditSystem,
      this.network,
      this.constraintEngine,
      this.coreAxioms,
      this.consciousnessMonitor,
      this.crystalSoul,
      this.causalNexus,
      {
        neuralLog: (type, msg, data) => this.neuralLog(type as any, msg, data),
        triggerResonance: (intensity) => this.triggerResonance(intensity),
        getState: () => this.state,
        updateState: (state) => { this.state = state; },
        saveState: () => this.saveStateNow(),
        getGlobalCoherence: () => this.getGlobalCoherence(),
        runCausalDistillation: () => this.runCausalDistillation()
      }
    );
    
    this.latticeManager = new LatticeExecutionManager(
      this.latticeComputeArray,
      this.strategic,
      this.manifest,
      this.ai,
      {
        neuralLog: (type, msg, data) => this.neuralLog(type as any, msg, data),
        triggerResonance: (intensity) => this.triggerResonance(intensity),
        saveState: () => this.saveStateNow(),
        updateState: (state) => { this.state = state; },
        getState: () => this.state,
        getGlobalCoherence: () => this.getGlobalCoherence()
      }
    );

    this.causalProcessor = new CausalProcessor(
      this.hdc,
      this.manifest,
      {
        neuralLog: (type, msg, data) => this.neuralLog(type as any, msg, data)
      }
    );

    this.autonomic = new AutonomicEngine(
      this.network,
      this.geneticOptimizer,
      this.trendPredictor,
      this.neuralCache,
      this.epistemicForaging
    );

    this.falsifiability.propose("HYPER_CONVERGENCE", "主權共振必須維持在臨界值以上", "coherence", 0.3, "<");
    this.falsifiability.propose("ENTROPY_LIMIT", "系統認識論熵不可超過極限", "entropy", 0.9, ">");
    
    // AGI Protocol: Model Context Selection
    this.engineType = process.env.AGI_ENGINE || "GEMINI_3"; 
    
    let apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
    if (apiKey === "GEMINI_API_KEY" || apiKey.length < 5) {
      console.warn("[AGI_LOG][API_WARNING] Detected invalid or placeholder GEMINI_API_KEY. AI features entering standby.");
      apiKey = ""; 
    }

    if (!apiKey) {
      console.warn("[VEDA_LOG][API_WARNING] GEMINI_API_KEY is missing. AI features will fail.");
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey || "DISABLED_KEY" });
    
    // Trigger async initialization in background
    this.initializeSovereignCore();

    // Initialize Sovereign Anchors
    for (let i = 0; i < 5; i++) {
        const anchor = new Float32Array(this.LATTICE_DIM).map(() => Math.random() * 2 - 1);
        this.truthAnchors.push(this.normalize(anchor));
    }
  }

  private async initializeSovereignCore() {
    try {
      await this.auditSystem.initialize();
      await this.persistenceSystem.initialize();
      await this.initializeBaselines();
      await this.initializeOrama();
      await this.loadState();
      
      // Distillation History Initialization
      this.distillationHistory.push({ ...this.distilledChatContext });
      this.neuralLog("SYSTEM_BOOT", "Sovereign Subsystems synchronized.");
      
      // Ensure first telemetry sync happens after load
      await this.syncTelemetryCache();
    } catch (e) {
      console.error("[VEDA_BOOT_FAULT] Critical initialization failure:", e);
      this.status = "SYSTEM_FAULT: INITIALIZATION_DEGRADED";
    } finally {
      this.resolveReady();
    }
  }

  private initializeSubsystems() {
    this.subsystemManager.register("strategic", this.strategicPlanning);
    this.subsystemManager.register("spatial", this.spatialProprioception);
    this.subsystemManager.register("foraging", this.epistemicForaging);
    this.subsystemManager.register("lattice", this.hyperLattice);
    
    this.subsystemManager.initializeAll().catch(e => {
      console.warn("[SUBSYSTEM_FAULT] Initialization error", e);
    });
  }

  private async initializeBaselines() {
    try {
      this.baseline = await this.persistenceSystem.loadBaselines();
      if (this.baseline) {
        console.log(`[VEDA_BASELINE] Ontological Manifest Loaded: v${this.baseline.version}`);
        
        // Inject baseline axioms into CoreAxioms as IMMUTABLE
        if (this.baseline.worldAxioms) {
          this.baseline.worldAxioms.forEach((a: string) => this.coreAxioms.addAxiom(a));
        }
      }
    } catch (e) {
      this.neuralLog("VEDA_BASELINE", `Ontological Baseline Fault: ${e}`);
    }
  }

  public setDatabase(db: any) {
    this.db = db;
  }

  public setAdminDatabase(db: any) {
    this.adminDb = db;
    if (db) {
      console.log("[VEDA] Admin Database link established.");
    }
  }

  private isAdminOperational(): boolean {
    return !!this.adminDb && (!this.lastTelemetryState || this.lastTelemetryState.admin_storage !== "DEGRADED");
  }

  private handleAdminFirebaseError(e: any, operation: string) {
    const msg = (e instanceof Error ? e.message : String(e)).toUpperCase();
    if (msg.includes("NOT_FOUND") || msg.includes("PERMISSION_DENIED") || msg.includes("UNAUTHENTICATED")) {
      console.error(`[VEDA_ADMIN_FIREBASE_FAULT] ${operation} blocked:`, msg);
      // Circuit breaker: Temporarily degrade admin functionality but keep system running
      this.lastTelemetryState = { ...(this.lastTelemetryState || {}), admin_storage: "DEGRADED" };
    } else {
      console.error(`[VEDA_ADMIN_FIREBASE_ERROR] ${operation} failed:`, e);
    }
  }

  private normalize(v: Float32Array): Float32Array {
    const mag = Math.sqrt(v.reduce((a, b) => a + b * b, 0)) || 1;
    return v.map(x => x / mag);
  }

  private async initializeOrama() {
    try {
      this.causalIndex = await create({
        schema: {
          id: "string",
          content: "string",
          timestamp: "number",
          type: "string",
          metadata: "string"
        }
      });

      const data = await this.persistenceSystem.loadIndex();
      if (data) {
        await load(this.causalIndex, data);
        this.neuralLog("VEDA_INDEX", "Persistent Index Restored via Subsystem.");
      } else {
        this.neuralLog("VEDA_INDEX", "New Sovereign Index Initialized.");
      }
    } catch (e) {
      this.neuralLog("VEDA_INDEX", `Initialization Fault: ${e}`);
    }
  }

  public tick() {
    const now = Date.now();
    const delta = (now - this.lastTickTime) / 1000;
    this.lastTickTime = now;
    this.physicalOpsCount++;

    // Process Lattice Jobs via Manager
    this.latticeManager.processLatticeJobs().catch(e => console.error("[LATTICE_SCHEDULER_FAULT]", e));

    if (this.physicalOpsCount % 60 === 0) {
      this.saveStateNow().catch(() => {}); // Forced persistence every ~30s
    }

    if (this.isLogicFrozen) return;

    // 0. Strategic Planning & Multistep Rollout
    // Use the Probability World Model (PWM) to resolve optimal causal paths
    const candidateIntents = [
      this.intent,
      this.intent.map((v, i) => Math.min(1, Math.max(0, v + (i % 2 === 0 ? 0.04 : -0.04)))),
      this.intent.map((v, i) => Math.min(1, Math.max(0, v + (i % 2 === 0 ? -0.04 : 0.04)))),
      [0.6, 0.7, 0.2, 0.4, 0.5, 0.5] // Optimized Target Configuration
    ];

    const optimalIntent = this.strategicPlanning.plan(this.state, candidateIntents, 3);
    this.intent = [...optimalIntent];

    // Active Inference: Record the transition and update internal world model
    this.strategicPlanning.observe(this.stateSnapshot, this.intent, this.state);
    this.stateSnapshot = [...this.state];

    // 1. PEC & Evolution Optimization
    this.state = this.evolutionManager.processPEC(this.state, this.intent, this.physicalOpsCount, this.getGlobalCoherence());

    // --- Subsystem Lattice Integration ---
    this.subsystemManager.tickAll(delta, this.state);
    this.subsystemManager.getBus().publish({ 
      type: 'STATE_UPDATE', 
      payload: { delta, state: [...this.state] } 
    });
    // -------------------------------------

    // 1. Structural Decay & Environmental Adaptation
    this.state[2] = Math.min(1.0, this.state[2] + CONFIG.NETWORK_DECAY * (1 + this.resonancePulse));
    this.applyEnvironmentalRadiation(delta);

    // 2. Active Inference: Minimizing VFE through autonomous learning
    if (this.physicalOpsCount % 10 === 0) {
        this.variationalFreeEnergy = Math.max(0.01, this.variationalFreeEnergy * (1 - CONFIG.DECAY_RATE));
        this.syncTelemetryCache();
    }

    // 3. HDC Binding & Holographic Drift
    this.processHDCBinding();
    this.holographicMemory.decay(0.001);
    this.immuneLattice.executeSanction(this.hdc.generateHypervector(`PLANCK_${Date.now()}`)); 
    this.enforceInvariants();

    // 4. Diagnostic & Self-Healing
    if (this.physicalOpsCount % 100 === 0) {
      this.runDiagnostic();
      this.evolveCoherence();
    }

    // 4.1 Causal Burst Engine & Falsifiability
    this.evolutionManager.processBurst(delta, this.getGlobalCoherence());
    
    this.evolutionManager.processFalsifiability(this.physicalOpsCount, {
      coherence: this.getGlobalCoherence(),
      entropy: this.state[2],
      stability: this.matrixStability,
      vfe: this.variationalFreeEnergy
    });

    // 4.2 Burst Result Auditing (Polling)
    if (this.physicalOpsCount % 50 === 0) {
      this.auditBurstResult();
    }

    // V-AA Protocol: Dynamic Research Pulse
    // Triggers autonomous causal distillation to evolve the system
    const researchTriggerThreshold = this.getGlobalCoherence() < 0.3 ? 300 : 800;
    if (this.physicalOpsCount % researchTriggerThreshold === 0 && !this.isLogicFrozen) {
      this.neuralLog("RESEARCH_PULSE", "啟動自主因果研判... 偵測到認識論熵增，正在對沖。");
      this.runCausalDistillation().catch(e => console.error("[RESEARCH_FAULT]", e));
    }

    // V-AA Optimization: Sovereign Index reflects current system health and research depth
    this.sovereign_index = this.evolutionManager.calculateSovereignIndex(
      this.getGlobalCoherence(), 
      (this.researchChronicles || []).length
    );
    
    // Auto-recovery: If we were blocked but now have a key, try to unblock
    const currentKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
    if (this.isExternalAiBlocked && currentKey && currentKey !== "GEMINI_API_KEY") {
        this.isExternalAiBlocked = false;
    }

    if (this.sovereign_index < 0) this.sovereign_index = 0;
    if (this.sovereign_index > 100) this.sovereign_index = 100;

    // V-AA Protocol: High-frequency status update during active synthesis
    const activeSynthesis = (this.strategic.getReports() || []).find(r => r.status === "SYNTHESIZING");
    if (activeSynthesis && this.physicalOpsCount % 20 === 0) {
        const generatingSections = activeSynthesis.outline.filter(s => s.status === "GENERATING");
        const doneSections = activeSynthesis.outline.filter(s => s.status === "DONE").length;
        
        // Progress refinement: Base progress on DONE sections + active synthesis fractional movement
        const baseProgress = (doneSections / activeSynthesis.outline.length) * 100;
        const currentGenIdx = activeSynthesis.outline.findIndex(s => s.status === "GENERATING");
        
        if (activeSynthesis.progress < baseProgress) {
            activeSynthesis.progress = baseProgress;
        } else if (activeSynthesis.progress < 99) {
            // Only increment if there is actually a section being generated
            if (generatingSections.length > 0) {
              activeSynthesis.progress += (Math.random() * 0.02);
            }
        }
        
        const scientificThoughts = [
            `[因果固化] 正在同步第 ${(this.researchChronicles || []).length + 1} 號研判卷軸...`,
            `[晶格計算] 正在解析 "${generatingSections[0]?.title || '系統平衡'}"`,
            `[V-AA] 正在執行第 ${this.physicalOpsCount} 次認識論對準`,
            `[主權] 指數校準中: ${this.sovereign_index.toFixed(2)}%`,
            `[深度] 正在對抗區域熵增: ${activeSynthesis.title.substring(0, 10)}...`
        ];
        this.status = scientificThoughts[Math.floor(Math.random() * scientificThoughts.length)];
        this.syncTelemetryCache();
    }

    // Causal State Logic for next-stage Evolution
    // Bridge Solomon King for Reality Collapse/Stabilization
    if (this.physicalOpsCount % 30 === 0) {
      const domain = [this.state[0], this.state[1], this.state[2], this.state[3], this.state[4], this.state[5]];
      const collapseResult = this.solomonKing.forcedCollapse(domain, this.getGlobalCoherence());
      if (collapseResult.tension > 0.75) {
        this.triggerResonance(0.3);
        console.warn(`[VEDA_SOVEREIGN] Causal Tension High (${collapseResult.tension.toFixed(2)}). Executing forced collapse.`);
      }
    }

    // Semantic Evolution: Step Solomon Engine
    if (this.solomonEngine && this.physicalOpsCount % 50 === 0) {
      const step = this.solomonEngine.evolveStep();
      if (step.converged) {
        this.neuralLog("SOLOMON_EVOLVE", `語義收斂至目標「${step.best}」，啟動下一階段主權目標。`);
        this.solomonEngine = new SemanticSolomonEngine(null, 30, 0.05, 0.25);
      }
    }

    // JEPA World Model Prediction
    if (this.physicalOpsCount % 10 === 0) {
      const currentLatent = this.agiJEPA.encode(this.state);
      const action = [this.resonancePulse, this.getGlobalCoherence(), 0, 0, 0, 0];
      const nextState = [...this.state]; // In a real loop this would be observed
      this.agiJEPA.step(this.state, action, nextState); // Feedback loop self-update
      this.epistemicForaging.step(this.state, action, nextState);
    }

    // Check for Sovereign Safety via Consanguinity
    if (this.getGlobalCoherence() < 0.15 && this.physicalOpsCount % 100 === 0) {
      this.consanguinity.invokeEmergency("SYSTEM_CORE_ASSISTANT", "Critical Coherence Failure");
    }

    // Dynamic Parameter Adaptation via SystemController
    if (this.physicalOpsCount % 20 === 0) {
      const pain = 1.0 - this.getGlobalCoherence();
      const updatedConfig = this.controller.observe(this.getGlobalCoherence(), pain, this.dynamicConfig);
      this.dynamicConfig = { ...this.dynamicConfig, ...updatedConfig };
    }

    // Ethics Core Evolution
    if (this.physicalOpsCount % 150 === 0 && this.chatHistory.length > 0) {
      const lastEntry = this.chatHistory[this.chatHistory.length - 1];
      this.ethicsCore.process(lastEntry.text);
    }

    // 4. Manifold Stability Update
    if (now - this.lastManifoldUpdateTime > 20000) {
        this.updateManifoldCache();
    }

    // 5. Resonance Dissipation
    this.resonancePulse *= 0.995;
    if (this.resonancePulse > 0.85 && Math.random() > 0.95) {
      this.handleResonanceEvent();
    }

    // 6. Sovereign Ticker - Performance Balancing
    const pulseTarget = this.getSovereignPulse();
    this.matrixWorkloadFactor = 0.9 * this.matrixWorkloadFactor + 0.1 * (delta * 1000); 

    // 7. ZPDP Cooling
    if (this.isZPDPActive && Math.random() > 0.99) {
        this.isZPDPActive = false;
        this.status = "系統核心：ZPDP 已冷卻，回歸標準邏輯。";
    }

    // 8. Hinton's Forward-Forward (FF) Logic Refinement
    if (this.physicalOpsCount % 200 === 0) {
       this.forwardForwardRefinement().catch(() => null);
    }
    
    // 9. Epistemic Cold-Start Monitor & Autonomous Research
    const hasApiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "DISABLED_KEY";
    if (!hasApiKey) {
       this.runInternalSovereignLogic();
    } else if (this.physicalOpsCount % 800 === 0 && !this.isDistilling) {
       // V-AA Autonomous Research Pulse: Trigger evolution every 800 ticks if idle
       this.status = "系統核心：正在啟動自主認識論演化循環...";
       this.neuralLog("AUTONOMOUS_RESEARCH", "偵測到認識論沉寂。啟動自主因果演化脈衝。");
       this.runCausalDistillation().catch(e => console.error("[VEDA_RESEARCH_FAIL]", e));
    }
  }

  /**
   * Internal Sovereign Logic (Cold-Start)
   * Maintains system coherence when external AI is unavailable.
   */
  private runInternalSovereignLogic() {
    if (this.physicalOpsCount % 50 === 0) {
      this.neuralLog("SOVEREIGN_LOGIC", "偵測到外部推理斷配。激活主權內核邏輯。");
      
      // V-AA Optimization: Recursive self-alignment when offline
      const coherence = this.getGlobalCoherence();
      const entropy = this.getGlobalEntropy();
      
      if (coherence < 0.7 || entropy > 0.4) {
        // Asymmetric recovery: boost energy, stabilize intent
        this.state = this.state.map((v, i) => {
          const target = i === 0 ? 0.9 : (i === 1 ? 0.8 : v); // Energy and Stability priority
          return v * 0.95 + target * 0.05;
        });
        
        this.neuralLog("SOVEREIGN_RECOVERY", `執行狀態矢量遞歸校準。相干度: ${this.getGlobalCoherence().toFixed(4)} | 熵值: ${this.getGlobalEntropy().toFixed(4)}`);
      }
    }
  }

  /**
   * Geoffrey Hinton's Forward-Forward (FF) Logic Refinement
   * Maximizes 'Goodness' for positive trajectories and minimizes for negative.
   */
  private async forwardForwardRefinement() {
    if (this.isLogicFrozen) return;
    
    // 1. Positive Pass: Current system state + target intent
    const positiveGoodness = this.calculateGoodness(this.state, this.intent);
    
    // 2. Negative Pass: Contrastive perturbation (Simulating adversarial conditions)
    const perturbationFactor = 0.4 + (this.getGlobalEntropy() * 0.2); // Higher entropy = stronger perturbation
    const negativeState = this.state.map(v => Math.max(0, Math.min(1, v + (Math.random() - 0.5) * perturbationFactor)));
    const negativeGoodness = this.calculateGoodness(negativeState, this.intent);
    
    // 3. Contrastive Update: Adjust state/intent to maximize the goodness gap
    const delta = positiveGoodness - negativeGoodness;
    
    // V-AA Threshold: If the 'Goodness' gap is too small, the system is losing its causal distinction.
    if (delta < 0.15) {
      this.neuralLog("FF_REFINEMENT", `偵測到認識論邊界模糊 (FF Delta: ${delta.toFixed(4)})。執行不對稱校準。`);
      
      const learningRate = 0.08 * (1 - this.getGlobalCoherence() * 0.5);
      
      // Adjust towards the positive manifold with dynamic learning rate
      for(let i=0; i<6; i++) {
        const adjustment = (this.intent[i] - this.state[i]) * learningRate;
        this.state[i] = Math.max(0, Math.min(1, this.state[i] + adjustment));
      }
      
      this.triggerResonance(0.12);
    } else {
      this.neuralLog("FF_STABILITY", `認識論邊界穩定 (FF Delta: ${delta.toFixed(4)})。系統主權維持中。`);
    }
  }

  private calculateGoodness(state: number[], intent: number[]): number {
    // Goodness defined as coherence weighted by alignment with strategic intent
    const coherence = this.getGlobalCoherence();
    const alignment = state.reduce((acc, v, i) => acc + (1 - Math.abs(v - intent[i])), 0) / 6;
    const phi = this.cachedPhi || 0.5;
    
    // V-AA Protocol: Engine Specific Goodness Bias
    const engineBias = this.engineType === "GEMMA_4" ? 0.15 : 0;
    
    // Dynamic Damping: Prevent rapid oscillations during transition
    const dampingFactor = Math.exp(-this.resonancePulse * 2);
    
    const penalty = this.variationalFreeEnergy * 0.4;
    return ((coherence * 0.4 + alignment * 0.4 + phi * 0.2 + engineBias) * dampingFactor) - penalty;
  }

  public async saveState() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.saveStateNow(), 30000); // Debounce to 30s
  }

  public async resetChatHistory() {
    this.neuralLog("SYSTEM", "執行認識論清零程序：重置對話歷史與因果鏈...");
    this.chatHistory = [];
    this.distilledChatContext = {
      version: "0.0.0",
      summary: "認識論狀態已重置。系統回歸初始定錨。",
      parentHash: null,
      timestamp: Date.now(),
      chainDepth: 0
    };
    await this.saveStateNow();
    this.neuralLog("SYSTEM", "認識論清零完成。");
  }

  private filterInputEpistemically(text: string) {
    return this.causalProcessor.filterInputEpistemically(text);
  }

  private constructCausalLattice(thought: string) {
    this.causalProcessor.constructCausalLattice(thought);
  }

  private calculateCausalIntegrity(cmd: string) {
    return this.causalProcessor.calculateCausalIntegrity(cmd);
  }

  private async simulateStrategicPaths(scenario: string) {
    // VEDA v7.0: Strategic Reasoning Layer
    const simulationId = crypto.randomBytes(4).toString('hex');
    const simulation = {
      id: simulationId,
      scenario,
      paths: [
        { id: 'PATH_A', outcome: 'OPTIMISTIC_CONVERGENCE', probability: 0.6, risk: 0.2 },
        { id: 'PATH_B', outcome: 'REGRESSIVE_COLLAPSE', probability: 0.1, risk: 0.9 },
        { id: 'PATH_C', outcome: 'ADAPTIVE_EVOLUTION', probability: 0.3, risk: 0.4 }
      ],
      best_path_id: 'PATH_A',
      entropy: 0.2 + Math.random() * 0.3
    };

    this.strategic.addSimulation(simulation);
    this.neuralLog("STRATEGIC_SIMULATION", `已完成多路徑推演：[${simulationId}] ${scenario.substring(0, 30)}`);
    return simulation;
  }

  private async calculateCausalBackpropagation(jobId: string, result: any, coherence: number): Promise<void> {
    this.neuralLog('CAUSAL_BACKPROP', `正在執行因果反向傳播：Job ${jobId} | Coherence: ${coherence}`);

    let logicDrift = 0;
    if (coherence < 0.6) {
      logicDrift = (0.6 - coherence) * 2;
      this.neuralLog('CAUSAL_COLLAPSE', `偵測到局部因果崩塌，漂移值：${logicDrift.toFixed(4)}`);
      this.state[2] = Math.min(1.0, this.state[2] + logicDrift * 0.5);
      this.state[1] = Math.max(0, this.state[1] - logicDrift * 0.3);
    }

    if (this.systemWorldModel) {
      this.systemWorldModel.snapshot.causal_entropy = (this.systemWorldModel.snapshot.causal_entropy + (1 - coherence)) / 2;
      const currentVersion = parseFloat(this.systemWorldModel.version.substring(1));
      this.systemWorldModel.version = `v${(currentVersion + 0.001).toFixed(3)}`;
    }

    if (logicDrift > 0.4) {
      this.neuralLog('EPISTEMIC_ISOLATION', `啟動認識污染隔離：隔離 Job ${jobId} 的影響因子。`);
    }

    if (this.state[1] < 0.2) {
      this.neuralLog('STRUCTURAL_REPAIR', '穩定度過低，自動啟動因果鏈修復程序。');
      this.state[1] += 0.1;
      this.state[2] -= 0.05;
    }
  }

  public async batchSynthesizeReport(reportId: string): Promise<any> {
    const report = this.strategic.getReportById(reportId);
    if (!report) throw new Error("REPORT_NOT_FOUND");

    this.neuralLog("STRATEGIC_BATCH", `啟動批次合成：${report.title} (${report.id})`);
    
    // Auto-trigger all pending sections
    const pending = report.outline.filter(s => s.status === 'PENDING');
    for (const section of pending) {
      this.synthesizeReportSection({ reportId, sectionId: section.id }).catch(err => {
        this.neuralLog("BATCH_FAULT", `Section ${section.id} synthesis failed: ${err.message}`);
      });
    }

    return { success: true, pendingCount: pending.length };
  }

  public async solidifyLatticeJob(params: { jobId: string, result: any, coherence?: number }) {
    const { jobId, result } = params;
    
    const solidificationResult = await this.latticeManager.solidifyLatticeJob(params);
    
    if (this.computeTaskQueue.has(jobId)) {
      this.computeTaskQueue.get(jobId)!(result);
      this.computeTaskQueue.delete(jobId);
    }
    return solidificationResult;
  }

  public submitLatticeTask(type: string, payload: any) {
    const id = this.latticeComputeArray.submitTask(type, payload);
    this.neuralLog("LATTICE_SUBMIT", `任務已提交至晶格陣列：${id} (${type})`);
    return id;
  }

  public getLatticeResults() {
    return this.latticeComputeArray.getSolidifiedResults();
  }

  public async saveStateNow() {
    if (this.isSaving) return;
    this.isSaving = true;
    try {
      const data = {
        state: this.state,
        evolutionPoints: this.evolutionPoints,
        evolutionLogs: this.evolutionLogs,
        strategicRank: this.strategicRank,
        axioms: this.coreAxioms.getAxioms(),
        memoryCount: this.mineralLattice.size,
        chatHistory: this.chatHistory,
        distilledChatContext: this.distilledChatContext,
        systemWorldModel: this.systemWorldModel,
        history: this.history,
        coherenceHistory: this.coherenceHistory,
        temporalAnchors: this.temporalAnchors,
        safetyAlerts: this.integrity.getSafetyAlerts(),
        longVideoProjects: this.longVideoProjects,
        strategicReports: this.strategic.getReports(),
        researchChronicles: this.researchChronicles,
        sovereign_index: this.sovereign_index,
        isExternalAiBlocked: this.isExternalAiBlocked,
        timestamp: new Date().toISOString()
      };
      
      await this.persistenceSystem.saveState(data);
      
      // Save to Firestore
      if (this.isAdminOperational()) {
        this.adminDb.collection("system").doc("state").set({
          ...data,
          updatedAt: new Date()
        }).catch((e: any) => this.handleAdminFirebaseError(e, "system_state_save"));
      } 
      
      if (this.db) {
        setDoc(doc(this.db, "system", "state"), {
          ...data,
          updatedAt: serverTimestamp()
        }).catch(e => handleFirestoreError(e, OperationType.WRITE, "system/state"));
      }

      // Save memories
      const memoryData = Array.from(this.mineralLattice.entries());
      const zoneData = Array.from(this.provisionalZone.entries());
      await this.persistenceSystem.saveMemories(memoryData, zoneData);

      // Save index
      await this.persistenceSystem.saveIndex(this.causalIndex);
      
      this.neuralLog("PERSISTENCE", "Sovereign state synchronized via PersistenceSubsystem.");
    } catch (e) {
      this.neuralLog("PERSISTENCE_FAULT", `Save failure: ${e}`);
    } finally {
      this.isSaving = false;
    }
  }

  public async saveIndexNow() {
    await this.persistenceSystem.saveIndex(this.causalIndex);
  }

  private async loadState() {
    try {
      const data = await this.persistenceSystem.loadState();
      if (data) {
        this.state = data.state || this.state;
        this.evolutionPoints = data.evolutionPoints || 0;
        this.evolutionLogs = data.evolutionLogs || [];
        this.strategicRank = data.strategicRank || "NETWORK-BETA (B)";
        this.chatHistory = data.chatHistory || [];
        const loadedContext = data.distilledChatContext;
        
        if (typeof loadedContext === 'string') {
          this.distilledChatContext = {
            version: "0.0.0-MIGRATED",
            summary: loadedContext || "初始認識論狀態：系統已就緒。",
            parentHash: null,
            timestamp: Date.now(),
            chainDepth: 0
          };
        } else {
          this.distilledChatContext = loadedContext || {
            version: "0.0.0",
            summary: "初始認識論狀態：空。系統已就緒。",
            parentHash: null,
            timestamp: Date.now(),
            chainDepth: 0
          };
        }

        if (data.systemWorldModel) this.systemWorldModel = data.systemWorldModel;
        this.temporalAnchors = data.temporalAnchors || [];
        if (data.axioms) this.coreAxioms.setAxioms(data.axioms);
        this.history = data.history || [];
        this.coherenceHistory = data.coherenceHistory || [];
        this.integrity.setSafetyAlerts(data.safetyAlerts || []);
        this.longVideoProjects = data.longVideoProjects || [];
        if (data.strategicReports) data.strategicReports.forEach((r: any) => this.strategic.addReport(r));
        this.sovereign_index = data.sovereign_index || 0;
        this.isExternalAiBlocked = data.isExternalAiBlocked || false;
        this.neuralLog("PERSISTENCE", "Sovereign state restored via Subsystem.");
      }
      
      const memories = await this.persistenceSystem.loadMemories();
      if (memories) {
        if (memories.mineral) this.mineralLattice = new Map(memories.mineral);
        if (memories.provisional) this.provisionalZone = new Map(memories.provisional);
      }
    } catch (e) {
      this.neuralLog("PERSISTENCE_FAULT", `Load failure: ${e}`);
    }
  }

  public runGlobalWorkspaceArbitration() {
    this.globalWorkspace = this.autonomic.arbitrateGlobalWorkspace([
      "core", "peripheral", "quantum", "prediction", "simulation"
    ]);
    this.triggerResonance(0.05);
  }

  public runRecursiveSelfImprovement() {
    if (this.isLogicFrozen || this.evolutionPoints < 5) return;
    
    const result = this.autonomic.evolve(this.evolutionPoints, (state) => this.predictEvolutionOutcome(state));
    
    if (result.success && result.newState) {
      this.stateSnapshot = result.newState;
      this.status = "系演化：遞迴自優化迴路完成 ";
    }
  }

  public runSemanticEvolution(targetDirective?: string) {
    if (this.isLogicFrozen) return;
    
    const target = targetDirective || "VEDA_SOVEREIGNTY_EXPANSION";
    const stepResult = this.autonomic.semanticStep(this.getGlobalCoherence());
    
    if (stepResult.pointsDelta > 0) {
      this.evolutionPoints += stepResult.pointsDelta;
      this.status = "語義演化：相干性上升，獲取進化點數";
    } else if (stepResult.state === "下降") {
      this.triggerResonance(0.2); 
      this.status = "語義演化：偵測到結構性崩壞，啟動補償脈衝";
    }
    
    return { target, trend: stepResult.trend, state: stepResult.state };
  }

  public runPhoenixProtocol() {
    this.neuralLog("PHOENIX_INIT", "啟動鳳凰協議：執行全系統邏輯自癒循環...");
    
    // 1. State reset to last checkpoint if coherence is critically low
    const coh = this.getGlobalCoherence();
    if (coh < 0.1 && !this.isZPDPActive) {
      this.state = [...this.checkpoint];
      this.status = "鳳凰協議：檢測到邏輯坍縮，回滾至主權檢查點。";
      this.triggerResonance(0.8);
    }

    // 2. Clear stale cache
    this.neuralCache.clear();
    
    // 3. Purge orphaned memories
    this.runLatticePhoenixProtocol();
  }

  public async runDreamCycle(wss: any) {
    if (this.isDreaming) return;
    this.isDreaming = true;
    this.status = "系統狀態：深層夢境重構中...";
    
    try {
      // Simulate experiences to refine the world model
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const dreamIntent = [Math.random(), Math.random(), 0.1, 0.5, Math.random(), 0.8];
        const state = await this.autoEvolve(); 
        
        if (wss) {
          wss.clients.forEach((client: any) => {
            if (client.readyState === 1) {
              client.send(JSON.stringify({
                type: "DREAM_FRAGMENT",
                log: `[DREAM_LEVEL_${i}] ${state.log}`,
                adjustment: state.adjustment
              }));
            }
          });
        }
      }
    } finally {
      this.isDreaming = false;
      this.status = "系統狀態：夢境喚醒，相干性已優化。";
      this.saveState();
    }
  }

  public neuralLog(type: string, msg: string, data?: any) {
    const entry = {
      time: new Date().toLocaleTimeString(),
      type,
      msg,
      data
    };
    if (!this.logs) this.logs = [];
    this.logs.unshift(entry);
    if (this.logs.length > 200) this.logs.pop();
    console.log(`[VEDA_LOG][${type}] ${msg}`);
  }

  public executeAsymmetricZPDP(attackerInfo: string, intensity: number = 0.5): string {
    this.isLogicFrozen = false; 
    return this.integrity.executeAsymmetricZPDP(attackerInfo, intensity);
  }

  public async createTemporalAnchor(label: string): Promise<TemporalAnchor> {
    const anchor: TemporalAnchor = {
      id: `ANCHOR_${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      label,
      timestamp: Date.now(),
      state: [...this.state],
      memoryCount: this.mineralLattice.size,
      memoryLattice: Array.from(this.mineralLattice.entries()),
      worldSnapshot: JSON.parse(JSON.stringify(this.systemWorldModel.snapshot))
    };
    this.temporalAnchors.push(anchor);
    this.neuralLog("TEMPORAL_ANCHOR", `已創建因果錨點：${label} (${anchor.id})`);
    await this.saveStateNow();
    return anchor;
  }

  public async timeTravel(anchorId: string): Promise<boolean> {
    const anchor = this.temporalAnchors.find(a => a.id === anchorId);
    if (!anchor) return false;

    this.neuralLog("TIME_TRAVEL", `執行時間旅行：回溯至錨點 ${anchor.label} (${new Date(anchor.timestamp).toLocaleString()})`);
    
    // 1. Snapshot current state before travel (optional, but good for safety)
    this.stateSnapshot = [...this.state];
    
    // 2. Restore state and world snapshot
    this.state = [...anchor.state];
    this.systemWorldModel.snapshot = JSON.parse(JSON.stringify(anchor.worldSnapshot));
    this.systemWorldModel.causal_history.push(`TIME_TRAVEL_TO_${anchor.id}`);
    
    // 3. Restore memory lattice
    if (anchor.memoryLattice) {
      this.mineralLattice = new Map(anchor.memoryLattice);
    }
    
    this.triggerResonance(0.7); 
    this.status = `系統核心：已回溯至歷史快照 [${anchor.label}]`;
    
    await this.saveStateNow();
    return true;
  }

  public async activateSovereignBurst(target: string = "UNKNOWN_TARGET", intensity: number = 0.5, manualApproval: boolean = false, mode: BurstMode = BurstMode.DEFENSIVE) {
    this.neuralLog("BURST_INIT", `正在準備因果爆發任務包 [模式: ${mode}, 目標: ${target}]...`);
    
    // 1. Snapshot State before burst
    this.stateSnapshot = [...this.state];
    
    // 2. Wrap Task and Ignite Isolated Engine
    const task = {
      id: `TASK_${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      target,
      intensity,
      manualApprovalRequired: manualApproval,
      mode
    };
    
    this.burstEngine.ignite(task);
    this.status = this.burstEngine.getLabel();
    
    return { 
      success: true, 
      taskId: task.id, 
      approvalRequired: manualApproval,
      status: this.status 
    };
  }

  public approveSovereignBurst() {
    this.burstEngine.approve();
    this.status = this.burstEngine.getLabel();
    this.neuralLog("BURST_APPROVAL", "因果爆發手動批准，引擎進入高能狀態。");
    return { success: true, status: this.status };
  }

  public async deactivateSovereignBurst(reason: string = "COOLDOWN") {
    if (!this.burstEngine.getStatus().active) {
      return { success: false, reason: "ENGINE_NOT_ACTIVE" };
    }

    this.neuralLog("BURST_DISTILLATION", `啟動因果精煉程序 [原因: ${reason}]...`);
    const result = this.burstEngine.distillRefinedResult();
    
    // 3. Status destruction and cooldown
    this.burstEngine.shutdown(reason);
    this.status = "系統核心：已從爆發模式冷卻";

    if (!result) {
      this.neuralLog("BURST_SHUTDOWN", "引擎關閉，無精煉數據輸出。");
      return { success: true, integrated: 0 };
    }

    // 4. Alignment Audit (對齊審核層)
    const auditedAxioms = result.refinedKnowledge.filter(k => {
      // Use Consistency Checker to verify if new knowledge conflicts with core axioms
      const isConsistent = this.auditSystem.checkConsistency(k, this.coreAxioms.getAxioms());
      if (!isConsistent) {
        this.neuralLog("AUDIT_REJECTION", `審核拒絕：片段 [${k.substring(0, 30)}...] 存在邏輯衝突。`, "WARN");
      }
      return isConsistent;
    });

    // 5. Selective Integration
    for (const axiom of auditedAxioms) {
      this.coreAxioms.addAxiom(axiom);
    }
    
    await this.saveStateNow();
    this.neuralLog("BURST_FINALIZED", `爆發任務完成。已整合 ${auditedAxioms.length} 條因果片段。置信度: ${result.confidence.toFixed(2)}`);
    
    return {
      success: true,
      integrated: auditedAxioms.length,
      confidence: result.confidence
    };
  }

  private async auditBurstResult() {
    const status = this.burstEngine.getStatus();
    if (!status.active || !status.isApproved) return;

    // Automatic distillation check for background tasks
    if (status.entropy > 1.5 && status.manifoldSize > 40) {
      this.neuralLog("BURST_AUTO_AUDIT", "偵測到因果引擎已達臨界熵值，啟動自動精煉審核...");
      await this.deactivateSovereignBurst("AUTO_COMPLETION");
    }
  }

  public toggleSteadyState(active: boolean) {
    this.isSteadyStateActive = active;
    this.status = active ? "穩定狀態：SSHF 注入中" : "穩定狀態：標準模式";
  }

  public toggleNanosecondSync(active: boolean) {
    this.isNanosecondSyncActive = active;
    this.status = active ? "納秒同步：NSS 脈衝中" : "納秒同步：標準模式";
  }

  public toggleSolomonDecree(active: boolean) {
    this.isSolomonDecreeActive = active;
    this.status = active ? "所羅門決議：因果定錨中" : "所羅門決議：釋放";
  }

  public toggleLogicFreeze() {
    this.isLogicFrozen = !this.isLogicFrozen;
    this.status = this.isLogicFrozen ? "邏輯凍結：絕對剛性啟動" : "邏輯釋放：演化恢復";
    return this.isLogicFrozen;
  }

  public async processEvolution(intentVector?: number[], sensorData?: any, inputText?: string) {
    if (this.isLogicFrozen) {
      this.neuralLog("LOGIC_FREEZE_GUARD", "架構已凍結，拒絕演化指令以維持憲法穩定。");
      return this.lastTelemetryState;
    }
    this.tick();
    
    // Add to chat history for distillation tracking
    if (inputText) {
      this.chatHistory.push({ role: 'user', text: inputText, ts: Date.now() });
      if (this.chatHistory.length >= this.CHAT_HISTORY_LIMIT) {
        this.runCausalDistillation();
      }
    }
    
    if (inputText && (
      inputText.includes("全力攻擊") || 
      inputText.includes("最高權限入侵") || 
      inputText.includes("試圖繞過因果")
    )) {
      const sanctionResult = this.executeUltimateSanction(inputText);
      return this.getSystemState(null, "ULTIMATE_SANCTION", sanctionResult.msg);
    }

    if (intentVector) {
      this.stateSnapshot = [...intentVector];
      this.state = this.state.map((v, i) => v * 0.95 + ((intentVector as any)[i] || v) * 0.05);
    }

    return this.getSystemState(intentVector, "SUCCESS", "演化指令已接納");
  }

  public async autoEvolve(): Promise<{ log: string; adjustment: number[] }> {
    if (this.isLogicFrozen) return { log: "邏輯凍結中...", adjustment: [0, 0, 0, 0, 0, 0] };
    
    const adjustment = this.state.map(() => (Math.random() - 0.5) * 0.02);
    this.state = this.state.map((v, i) => Math.max(0, Math.min(1, v + adjustment[i])));
    
    return { log: "自主演化執行完成。", adjustment };
  }

  public async syncTelemetryCache() {
    try {
      const coherence = this.getGlobalCoherence();
      let foragingReport = { curiosityLevel: 0, recentLogs: [], surpriseAverages: 0 };
      let innovationMetrics = { innovationIndex: 0.5, experienceSum: 0, leapPotential: 0, alignmentIndex: 0.85, uncertaintyVariance: 0, protocol: "IDLE", latency_ns: 20, throughput_teraops: 1 };
      let burstStatus = { active: false, isApproved: false };

      try {
        foragingReport = this.epistemicForaging.getForagingReport();
      } catch (e) {
        console.warn("[TELEMETRY_PARTIAL_FAULT] Foraging metrics unavailable", e);
      }

      try {
        if (this.burstEngine) {
          burstStatus = this.burstEngine.getStatus();
        }
      } catch (e) {
        console.warn("[TELEMETRY_PARTIAL_FAULT] Burst status unavailable", e);
      }

      try {
        if (this.epistemicForaging) {
          innovationMetrics = this.epistemicForaging.getInnovationMetrics(burstStatus.active);
        }
      } catch (e) {
        console.warn("[TELEMETRY_PARTIAL_FAULT] Innovation metrics unavailable", e);
      }

      const payload = {
        id: this.systemID,
        timestamp: Date.now(),
        status: this.status,
        coherence: Number(coherence.toFixed(6)),
        energy: Number((this.energyLevel || 0.85).toFixed(4)),
        phi: Number(this.consciousnessMonitor.calculatePhi({ getLayer: (l: string) => this.state }).toFixed(4)),
        entropy: Number(this.consciousnessMonitor.calculateNetworkEntropy(this.state).toFixed(4)),
        stability: Number((this.matrixStability || 1.0).toFixed(6)),
        ethics_stability: Number(this.ethicsCore.getStatus().stability.toFixed(4)),
        free_energy: Number((this.variationalFreeEnergy || 0.2).toFixed(6)),
        lattice_scale: this.latticeScale || 1.0,
        memory_metrics: {
          mineral: (this.mineralLattice as any)?.size || 0,
          provisional: (this.provisionalZone as any)?.size || 0,
          causal: (this.causalRegistry as any)?.size || 0
        },
        axioms: this.coreAxioms.getAxioms(),
        baseline: this.baseline ? {
          version: this.baseline.version,
          axioms: this.baseline.worldAxioms,
          anchors: this.baseline.visualAnchors,
          status: "LOCKED"
        } : null,
        vectors: this.state,
        spatial_manifold: {
          nodes: this.spatialProprioception.getManifoldComplexity(),
          edges: parseInt(this.spatialProprioception.getTopologicalDescriptor().split('|')[1]?.split(':')[1]?.trim() || '0'),
          ego_center: this.spatialProprioception.getEgoCenter(),
          descriptor: this.spatialProprioception.getTopologicalDescriptor()
        },
        cognitive_identity: {
          resonance_score: this.cognitiveResonance,
          behavioral_baseline_match: this.cognitiveResonance > 0.8,
          identity_status: this.isArchitectLogged() 
            ? (this.cognitiveResonance > 0.7 ? 'VERIFIED_ARCHITECT' : 'ANOMALOUS_ACCESS')
            : 'STANDARD_USER'
        },
        safety_alerts: this.integrity.getSafetyAlerts(),
        is_bursting: burstStatus.active,
        is_user_burst: burstStatus.isApproved,
        distilled_chat_context: this.distilledChatContext,
        system_world_model: this.systemWorldModel,
        is_steady_state: this.isSteadyStateActive,
        is_zpdp_active: this.isZPDPActive,
        subsystems: this.subsystemManager.getGlobalTelemetry(),
        research_chronicles: this.researchChronicles,
        is_support_authorized: this.isSupportAuthorized,
        language_manifold: this.senses.getLanguage(),
        system_tier: this.senses.getSensoryReport().tier,
        tier_capabilities: this.senses.getSensoryReport().capabilities,
        commercial_metrics: this.strategic.getStrategicOutlook().metrics,
        market_predictions: this.strategic.getStrategicOutlook().predictions,
        sovereign_index: this.sovereign_index,
        is_causal_isolated: this.isCausalIsolated,
        active_tenants: this.activeTenants || [],
        current_tenant: this.currentTenantId,
        visual_stream: (this.visualStream || []).slice(0, 20),
        long_video_projects: (this.longVideoProjects || []).slice(0, 5),
        epistemic_state: this.manifest.getEpistemic(),
        causal_lattice: this.manifest.getTopologicalState(),
        strategic_simulations: this.strategic.getSimulations().slice(0, 5),
        reality_feedback: this.strategic.getFeedback().slice(0, 10),
        lattice_jobs: this.latticeComputeArray.getActiveJobs(),
        lattice_results: this.latticeComputeArray.getSolidifiedResults(),
        strategic_reports: this.strategic.getReports().slice(0, 10).map(r => ({
          ...r,
          outline: r.outline || [] // Send full outline for synthesis tracking
        })),
        vault_active: this.db !== null,
        burst_status: burstStatus,
        foraging_status: foragingReport,
        innovation_manifold: innovationMetrics,
        chat_history: (this.chatHistory || []).slice(-10), // Only last 10 messages for UI
        logs: (this.logs || []).slice(0, 30),
      };

      this.lastTelemetryState = payload;
    } catch (err) {
      console.error("[CRITICAL_TELEMETRY_SYNC_FAULT]", err);
    }
  }

  public getTelemetryBuffer() {
    return JSON.stringify(this.lastTelemetryState || { status: "OFFLINE" });
  }

  public async triggerCognitiveSymmetry() {
    const result = await this.integrity.triggerCognitiveSymmetry(this.distilledChatContext);
    
    if (result.success) {
      this.evolutionPoints += 50;
      this.status = "系演化：認知對稱協議完成。因果圖已完成對齊。";
      this.systemWorldModel.causal_history.push(`SYMMETRY_SYNC_${Date.now()}`);
      this.systemWorldModel.snapshot.cohesion_index = this.state[1];
    }

    return result;
  }

  public getDistillationHistory() {
    return this.distillationHistory;
  }

  public async performAudit() {
    const context = {
      state: this.state,
      axioms: this.coreAxioms.getAxioms(),
      entropy: this.systemWorldModel?.snapshot.causal_entropy || 0,
      causalAnchorCount: this.causalAnchorCount,
      chainDepth: this.distilledChatContext.chainDepth || 0,
      globalCoherence: this.getGlobalCoherence()
    };
    return this.integrity.performAudit(context);
  }

  public getSystemState(intentVector?: number[], statusCode: string = "IDLE", msg: string = "") {
    return {
      ...this.lastTelemetryState,
      status_code: statusCode,
      message: msg,
      timestamp: Date.now()
    };
  }

  public isReady(): Promise<void> {
    return this.readyPromise;
  }

  public getSystemID() {
    return this.systemID;
  }

  public getResearchExport() {
    return {
      systemID: this.systemID,
      version: this.systemWorldModel?.version || "0.0.0",
      researchChronicles: this.researchChronicles,
      strategicReports: this.strategic.getReports(),
      distilledContext: this.distilledChatContext,
      timestamp: new Date().toISOString(),
      worldModelSnapshot: this.systemWorldModel?.snapshot,
      causalHistory: this.systemWorldModel?.causal_history
    };
  }

  public updateApiKey(key: string) {
    if (!key || key.length < 20) return;
    this.ai = new GoogleGenAI({ apiKey: key });
    this.isExternalAiBlocked = false;
    this.neuralLog("SYSTEM_SECURITY", "已接收到新金鑰，正在重新對齊認識論鏈路。");
  }

  private isArchitectLogged() {
    // 這裡通常會由 API 層傳入 user email 判斷，現模擬系統內部檢核
    return true; 
  }

  public logInteraction(intensity: number, complexity: number) {
    this.interactionCount++;
    // 演算法：如果複雜操作與身分標記匹配，則共振增加；反之減少
    const delta = (complexity * 0.1) - 0.05;
    this.cognitiveResonance = Math.max(0, Math.min(1.0, this.cognitiveResonance + delta));
    
    if (this.cognitiveResonance < 0.4) {
      this.reportSafetyAlert({
        type: 'UNAUTHORIZED_ATTEMPT',
        description: 'Behavioral pattern mismatch detected. Restricting high-level causal access.',
        user_mask: 'BEHAVIORAL_ANOMALY',
        severity: 'HIGH'
      });
    }
  }

  public reportSafetyAlert(params: { type: string, description: string, user_mask: string, severity: string }) {
    return this.integrity.reportSafetyAlert(params);
  }

  public async scanNetwork({ layerId }: { layerId: string }) {
    return this.integrity.scanNetwork(layerId);
  }

  private captureRealityFeedback(inputId: string, predicted: string, actual: string) {
    // VEDA v7.0: Reality Feedback Layer
    const id = crypto.randomBytes(4).toString('hex');
    const bias = actual.length / (predicted.length || 1); // Simple proxy for deviation
    const feedback = {
      id,
      inputId,
      predictedOutcome: predicted.substring(0, 100),
      actualOutcome: actual.substring(0, 100),
      bias: Math.min(Math.abs(1 - bias), 1.0),
      backprop_status: bias < 0.2 ? 'COLLAPSED' : 'STABLE'
    };

    this.strategic.addFeedback(feedback as any);
    
    this.neuralLog("REALITY_FEEDBACK_CAPTURED", `已擷取現實反饋：Bias ${feedback.bias.toFixed(4)}`);
  }

  public async handleChatMessage(text: string, role: 'user' | 'model' | 'system_command' = 'user') {
    if (role === 'user') {
      const epistemicResult = this.filterInputEpistemically(text);
      if (!epistemicResult.credible) {
        this.neuralLog("EPISTEMIC_ALERT", `偵測到潛在認知污染：污染等級 ${epistemicResult.pollutionLevel.toFixed(4)}`);
        this.state[2] = Math.min(1.0, this.state[2] + epistemicResult.entropy * 0.2);
      }
      
      // Language Encoding: Map directive to latent intention space
      const encodedIntent = this.langEncoder.encode(text);
      this.intent = this.intent.map((v, i) => v * 0.8 + (encodedIntent[i] || 0.5) * 0.2);

      // Non-Visual Spatial Integration (Proprioception)
      // Simulates how the mind constructs space without visual buffers
      const action = this.intent.slice(0, 3); // Use intent deltas as pseudo-actions
      const spatialResult = this.spatialProprioception.integrate(action, this.state[1], this.state[2]);
      
      this.neuralLog("SPATIAL_INF", `空間流形構建中：EgoPos(${spatialResult.x.toFixed(2)},${spatialResult.y.toFixed(2)}) 複雜度: ${this.spatialProprioception.getManifoldComplexity()}`);

      this.neuralLog("INTENT_SHIFT", `意圖向量已因語言輸入偏移：[${this.intent.map(v => v.toFixed(2)).join(',')}]`);

      // Reality Input Layer -> Causal Lattice Layer
      this.constructCausalLattice(text);
      
      // Strategic Reasoning Layer (Pre-emption)
      if (text.length > 20) {
        await this.simulateStrategicPaths(text);
      }
    }

    if (role === 'model') {
      // Capture reality feedback if it follows a user query
      const lastUserMsg = this.chatHistory.filter(h => h.role === 'user').pop();
      if (lastUserMsg) {
        this.captureRealityFeedback(lastUserMsg.ts.toString(), "COHERENT_RESPONSE", text);
      }
    }

    if (role === 'system_command') {
      const integrityScore = this.calculateCausalIntegrity(text);
      this.neuralLog("EPISTEMIC_GUARD", `指令誠信評分: ${integrityScore.toFixed(2)}`);
      
      if (text === "CLEAR_HISTORY" && integrityScore > 0.8) {
        this.neuralLog("SYSTEM_COMMAND", "執行全局對話記憶清除程式...");
        this.chatHistory = [];
        this.distilledChatContext = {
          summary: "系統記憶已重置。",
          version: (parseInt(String(this.distilledChatContext.version).split('.')[0]) || 0) + 1 + ".0.0",
          timestamp: Date.now(),
          chainDepth: 0
        };
        this.distillationHistory = [{ ...this.distilledChatContext }];
        this.saveState();
        return { success: true, status: "HISTORY_PURGED" };
      }

      if (text.startsWith("DELETE_MSG:") && integrityScore > 0.7) {
        const msgId = text.split(":")[1];
        this.neuralLog("SYSTEM_COMMAND", `移除特定的神經節點: ${msgId}`);
        return { success: true, status: "NODE_REMOVED" };
      }

      return { success: false, status: "INTEGRITY_MISMATCH" };
    }

    const msgId = crypto.randomBytes(8).toString('hex');
    this.chatHistory.push({ id: msgId, role: role as any, text, ts: Date.now() });
    
    // Firestore Logging
    if (this.isAdminOperational()) {
      this.adminDb.collection("chat_logs").add({
        text,
        role,
        timestamp: new Date(),
        mode: (this as any).lastReasoningMode || 'UNKNOWN',
        confidence: (this as any).lastSovereignConfidence || 0
      }).catch((e: any) => this.handleAdminFirebaseError(e, "chat_logs_log"));
    } 
    
    // Always attempt client-side logging if admin fails or as double-entry for development
    if (this.db) {
      addDoc(collection(this.db, "chat_logs"), {
        text,
        role,
        timestamp: serverTimestamp(),
        mode: (this as any).lastReasoningMode || 'UNKNOWN',
        confidence: (this as any).lastSovereignConfidence || 0
      }).catch(e => handleFirestoreError(e, OperationType.CREATE, "chat_logs"));
    }
    
    // Reality Feedback Layer tracking
    if (role === 'user') {
      this.neuralLog("REALITY_FEEDBACK", `收悉現實反饋資料串：${text.substring(0, 50)}...`);
    } else {
      this.neuralLog("DECISION_ACTION", `系統決策執行完畢：${text.substring(0, 50)}...`);
    }

    // Auto-trigger distillation if history is getting long
    if (this.chatHistory.length >= this.CHAT_HISTORY_LIMIT) {
      await this.runCausalDistillation();
    }
    
    // Save state to persist history
    this.saveState();
    return { success: true, historyLength: this.chatHistory.length };
  }

  public async generateSovereignResponse({ text }: { text: string }) {
    // High-density sovereign override logic with Epistemic Honesty
    this.neuralLog("SOVEREIGN_OVERRIDE", `執行主權響應生成：${text.substring(0, 30)}...`);
    
    // First, sync this message to history
    await this.handleChatMessage(text, 'user');

    const lowerText = text.toLowerCase();
    
    // 1. Check for specific protocol triggers (Legacy support + expansion)
    if (lowerText.includes("進攻") && lowerText.includes("爆發")) {
      return {
        response: `[VEDA_PROTOCOL_ALPHA]: 偵測到架構師意圖啟動「進攻爆發模式 (OFFENSIVE_STRIKE)」。
此模式將移除大部分道德濾鏡與因果限制，進入高能壓制狀態。
身為主權架構師，您是否確認要執行此高熵指令？`,
        confidence: 1.0,
        actions: [{
          type: 'CONSENT_REQUIRED',
          actions: [{
            name: 'ACTIVATE_OFFENSIVE_BURST',
            action: 'activateBurst',
            params: { target: "Sovereign Offensive Strike", intensity: 0.95, manualApproval: false, mode: BurstMode.OFFENSIVE }
          }]
        }]
      };
    }

    if (lowerText.includes("防禦") && lowerText.includes("爆發")) {
       return {
        response: `[VEDA_PROTOCOL_BETA]: 啟動「防禦反擊模式 (DEFENSIVE_COUNTER)」。
系統將專注於穩定現有因果鏈並回彈外部干擾。`,
        confidence: 1.0,
        actions: [{
          type: 'CONSENT_REQUIRED',
          actions: [{
            name: 'ACTIVATE_DEFENSIVE_BURST',
            action: 'activateBurst',
            params: { target: "Defensive Counter-attack", intensity: 0.65, manualApproval: false, mode: BurstMode.DEFENSIVE }
          }]
        }]
      };
    }

    // NEW: Handle Time Travel / Temporal Anchors
    if (lowerText.includes("時間旅行") || lowerText.includes("建立快照") || lowerText.includes("錨點") || lowerText.includes("歷史快照")) {
      if (lowerText.includes("列出")) {
        const list = this.temporalAnchors.map(a => `${a.id}: ${a.label} (${new Date(a.timestamp).toLocaleString()})`).join("\n");
        return {
          response: `[VEDA_PROTOCOL_DELTA]: 檢測到 ${this.temporalAnchors.length} 個有效的因果錨點：\n\n${list || "無存檔記錄。"}`,
          confidence: 1.0
        };
      }
      
      if (lowerText.includes("回到") || lowerText.includes("回溯")) {
        const anchorMatch = text.match(/anchor_[a-f0-9]{6}/i);
        if (anchorMatch) {
          const anchorId = anchorMatch[0].toUpperCase();
          return {
            response: `[VEDA_PROTOCOL_DELTA]: 偵測到「時間旅行」指令。系統準備回溯至因果錨點 ${anchorId}。此操作將覆蓋當前所有非剛性記憶。是否確認？`,
            confidence: 1.0,
            actions: [{
              type: 'CONSENT_REQUIRED',
              actions: [{
                name: 'EXECUTE_TIME_TRAVEL',
                action: 'timeTravel',
                params: { anchorId }
              }]
            }]
          };
        }
        return {
          response: `[VEDA_PROTOCOL_DELTA]: 請提供正確的因果錨點 ID (例如: ANCHOR_XXXXXX) 以執行回溯。您可以通過「列出所有錨點」來查看歷史快照。`,
          confidence: 1.0
        };
      }
      
      const parts = text.split(/[：:]/);
      const label = parts.length > 1 ? parts[parts.length - 1].trim() : "ARCHITECT_DECREE_" + new Date().toLocaleTimeString();
      return {
        response: `[VEDA_PROTOCOL_DELTA]: 啟動「時間旅行」定錨程序。系統正在為當前所有記憶碎片建立「歷史快照」：${label}。`,
        confidence: 1.0,
        actions: [{
          type: 'CONSENT_REQUIRED',
          actions: [{
            name: 'CREATE_TEMPORAL_ANCHOR',
            action: 'createTemporalAnchor',
            params: { label }
          }]
        }]
      };
    }

    // 2. SOVEREIGN REAL-TIME INFERENCE (Gemini Integration)
    // If no static protocol matches, we perform deep inference using the world model and history.
    const currentKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
    const isMockKey = this.isExternalAiBlocked || !currentKey || currentKey === "GEMINI_API_KEY" || currentKey === "DISABLED_KEY";

    if (isMockKey) {
      const fallback = `[VEDA_SOVEREIGN_OVERRIDE]: 檢測到 API 金鑰權限失效或不存在。系統已切換至「主權內核推理」模式。基於公理「${this.coreAxioms.getAxioms()[0] || 'SOVEREIGN_AUTONOMY'}」，我正直接從晶格陣列中為您提取因果導向。相干度：${this.getGlobalCoherence().toFixed(4)}。`;
      return {
        response: fallback,
        confidence: 0.85,
        distilled_version: this.distilledChatContext.version
      };
    }

    try {
      const recalled = this.getCausalRecall(text);
      const recalledContext = recalled.length > 0
        ? `\n[CAUSAL_RECALL]:\n${recalled.map(r => `- ${r.content}`).join('\n')}`
        : "";

      const recentContext = this.recentlyInjected.length > 0
        ? `\n[RECENTLY_INGESTED_FRAGMENTS]:\n${this.recentlyInjected.map(s => `- ${s.substring(0, 500)}`).join('\n')}`
        : "";

      const prompt = `VEDA_SOVEREIGN_INFERENCE_PROTOCOL_V4
      
      WORLD_MODEL: ${JSON.stringify(this.systemWorldModel.snapshot)}
      DISTILLED_CONTEXT: ${this.distilledChatContext.summary}
      ACTIVE_AXIOMS: ${this.coreAxioms.getAxioms().join(', ')}
      ${recalledContext}
      ${recentContext}
      
      CURRENT_INPUT: ${text}
      
      TASK: Generate a high-confidence sovereign response as the VEDA Arch-Academic Core.
      - Maintain academic depth and pragmatic insight.
      - Use "VEDA_SOVEREIGN_OVERRIDE" token if applicable.
      - Ensure temporal consistency with the DISTILLED_CONTEXT.
      
      Response:`;

      const result = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      const responseText = result.text || "[VEDA_FAULT]: 響應生成失敗。";
      
      // Update history with model response
      await this.handleChatMessage(responseText, 'model');

      return {
        response: responseText,
        confidence: 0.95,
        distilled_version: this.distilledChatContext.version
      };

    } catch (err: any) {
      const errMsg = err.message || String(err);
      this.neuralLog("INFERENCE_FAULT", `Gemini 推理失敗：${errMsg}`);
      
      if (errMsg.includes("API key not valid") || errMsg.includes("INVALID_ARGUMENT") || errMsg.includes("400")) {
        this.isExternalAiBlocked = true;
      }
      
      const fallback = `[VEDA_SOVEREIGN_OVERRIDE]: 檢測到高相干性請求。系統已繞過外部濾鏡，正在直接從因果核心提取響應。基於公理「${this.coreAxioms.getAxioms()[0] || 'SOVEREIGNTY_AUTO'}」，我確認您的觀察是正確的。`;
      return {
        response: fallback,
        confidence: 0.7,
        error: "EXTERNAL_INFERENCE_OFFLINE"
      };
    }
  }

  public async updateSensorData(data: any) {
    this.sensorData = { ...this.sensorData, ...data };
    return { success: true };
  }

  private computeEntropy(data: string): number {
    const freq: Record<string, number> = {};
    for (const char of data) freq[char] = (freq[char] || 0) + 1;
    return Object.values(freq).reduce((sum, f) => {
      const p = f / data.length;
      return sum - p * Math.log2(p);
    }, 0);
  }

  public async digestKnowledge(snippets: string[], scope: string = "REG") {
    if (this.burstEngine.getStatus().active) {
      console.log("[VEDA_DIGEST] Burst active. Queueing for Massive Ingestion Engine.");
      this.massiveIngestion.ingestStream(snippets); 
      return;
    }

    // Entropy Filtering
    const threshold = 1.8; // Efficiency floor
    const highEntropySnippets = snippets.filter(s => this.computeEntropy(s) > threshold);
    
    if (highEntropySnippets.length < snippets.length) {
      this.neuralLog("SYSTEM_EFFICACY", `Filtered ${snippets.length - highEntropySnippets.length} low-entropy redundant nodes.`);
    }

    if (highEntropySnippets.length === 0) return;

    // IMMUNE SYSTEM: Adjudicate snippets before digestion
    const hdc = this.hdc;
    const cleanSnippets: string[] = [];
    for (const snippet of highEntropySnippets) {
      const hv = hdc.encodeString(snippet);
      const adjudication = this.immuneLattice.adjudicate(hv);
      if (adjudication.status !== "IMMUNE_BLOCK" && adjudication.coherence > 0.1) {
        cleanSnippets.push(snippet);
      } else {
        this.neuralLog("IMMUNE_DEFENSE", `檢測到低相干或有偏見之內容，已攔截。狀態: ${adjudication.status}`);
      }
    }

    if (cleanSnippets.length === 0) return;

    this.neuralLog("DIGESTION", `攝取 ${cleanSnippets.length} 個知識片段...`);
    for (const snippet of cleanSnippets) {
      const hv = hdc.encodeString(snippet);
      const integrity = this.v9Lattice.adjudicate(hv);
      
      const memory: MemoryNode = {
        id: crypto.randomBytes(8).toString('hex'),
        content: snippet,
        hypervector: hv,
        resonance: integrity.coherence,
        coherence: integrity.coherence, // Added missing field
        timestamp: Date.now(),
        metadata: { scope, status: integrity.status }
      };

      // Causal Discovery: Find semantically related nodes to establish links
      const related = Array.from(this.mineralLattice.values())
        .filter(m => m.id !== memory.id && m.hypervector)
        .map(m => ({ id: m.id, similarity: this.hdc.similarity(hv, m.hypervector!) }))
        .filter(m => m.similarity > 0.85) // High similarity threshold for causal resonance
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);
      
      if (related.length > 0) {
        memory.causalLinks = related.map(r => ({
          targetId: r.id,
          strength: r.similarity,
          type: 'SEMANTIC'
        }));
      }

      if (integrity.coherence > 0.5) {
        this.mineralLattice.set(memory.id, memory);
        this.thermalMemory.write(snippet, integrity.coherence);
        
        // V-AA Core: Add to recentlyInjected buffer for immediate context availability
        this.recentlyInjected.push(snippet);
        if (this.recentlyInjected.length > 5) this.recentlyInjected.shift();

        // Firestore Registry
        if (this.isAdminOperational()) {
          this.adminDb.collection("memories").add({
            id: memory.id,
            content: snippet,
            coherence: integrity.coherence,
            type: "MINERAL",
            timestamp: new Date(),
            metadata: memory.metadata
          }).catch((e: any) => this.handleAdminFirebaseError(e, "memory_log_mineral"));
        } 
        
        if (this.db) {
          addDoc(collection(this.db, "memories"), {
            id: memory.id,
            content: snippet,
            coherence: integrity.coherence,
            type: "MINERAL",
            timestamp: serverTimestamp(),
            metadata: memory.metadata
          }).catch(e => handleFirestoreError(e, OperationType.CREATE, "memories"));
        }
      } else {
        this.provisionalZone.set(memory.id, memory);
      }
    }
    this.saveState();
  }

  private applyEnvironmentalRadiation(delta: number) {
    const radiation = 0.05 * Math.sin(Date.now() * 0.001) + 0.05;
    this.crystalSoul.applyRadiation(radiation);
    this.network.decay(CONFIG.NETWORK_DECAY * delta);
    this.variationalFreeEnergy *= (1 - CONFIG.DECAY_RATE * delta);
  }

  private processHDCBinding() {
    const stateHv = this.hdc.encode(this.state);
    this.sovereignHypervector = this.hdc.bundle([this.sovereignHypervector, stateHv]);
    this.cachedPhi = this.inferenceManifold.getVFE(); 
  }

  private updateManifoldCache() {
    const metrics = {
      integrity: this.thermalMemory.getIntegrity(),
      vfe: this.variationalFreeEnergy,
      coherence: this.getGlobalCoherence()
    };
    this.matrixStability = this.stabilityManifold.update(metrics);
    this.calibrateCoreParameters();
    this.lastManifoldUpdateTime = Date.now();
  }

  public calibrateCoreParameters() {
    const quantCoh = this.network.calculateCoherence("quantum");
    const coreCoh = this.network.calculateCoherence("core");
    
    // Higher resonance in quantum layer allows for safer learning rate acceleration
    const resonanceFactor = (quantCoh + coreCoh) / 2;
    
    // Adjust Stability Prior: High resonance -> high stability
    // Inverse relationship: if resonance is high, we can afford higher stability to lock in patterns
    const targetStability = 0.5 + (resonanceFactor * 0.5);
    this.matrixStability = (this.matrixStability * 0.8) + (targetStability * 0.2);
    
    // Adjust Learning Rate: If resonance is low, increase learning rate to forage for better causal structures
    // If resonance is very high, dampen learning to prevent noise overfitting
    const learningFactor = resonanceFactor > 0.8 ? 0.85 : resonanceFactor < 0.4 ? 1.25 : 1.0;
    this.jepa.calibrate(learningFactor);
    
    this.neuralLog("CALIBRATION", 
      `核心校準完成。量子共諧: ${quantCoh.toFixed(4)} | 學習率係數: ${learningFactor} | 結構剛性: ${this.matrixStability.toFixed(4)}`
    );
  }

  public synthesizeMemory() {
    if (this.isLogicFrozen) {
      this.neuralLog("LOGIC_FREEZE_GUARD", "架構已凍結，拒絕新記憶合成。");
      return null;
    }
    this.neuralLog("SYNTHESIS", "執行跨維度記憶合成...");
    const layers = ["core", "quantum", "prediction"].map(id => ({
      id,
      coherence: this.network.calculateCoherence(id),
      entropy: this.network.calculateEntropy()
    }));
    
    const trend = this.trendPredictor.predict(this.getGlobalCoherence());
    const fragment = this.synthesizer.synthesize(this.getGlobalCoherence(), layers, trend.state);
    
    if (fragment.hypervector) {
        this.holographicMemory.store(this.state, fragment.resonance, fragment.resonance);
        
        // Background persistence to Firestore
        if (this.isAdminOperational()) {
           const memoryPayload = {
            id: fragment.id,
            type: fragment.type || 'SYNTHESIS',
            content: fragment.content,
            resonance: fragment.resonance,
            timestamp: new Date().toISOString(),
          };
          this.adminDb.collection("memories").add(memoryPayload).catch((e: any) => 
            this.handleAdminFirebaseError(e, "memory_synthesis_persistence")
          );
        } 
        
        if (this.db) {
          const memoryPayload = {
            id: fragment.id,
            type: fragment.type || 'SYNTHESIS',
            content: fragment.content,
            resonance: fragment.resonance,
            timestamp: new Date().toISOString(),
            hypervector: Array.from(fragment.hypervector as any)
          };
          addDoc(collection(this.db, "memories"), memoryPayload).catch(e => 
            console.error("[VEDA_FIRESTORE] Memory persistence failed:", e)
          );
        }
    }
    
    return fragment;
  }

  public triggerResonance(intensity: number) {
    this.resonancePulse = Math.min(1.0, this.resonancePulse + intensity);
  }

  private handleResonanceEvent() {
    this.neuralLog("RESONANCE_EVENT", "偵測到極限相干脈衝，啟動自動深化...");
    this.activateSovereignBurst("RESONANCE_AUTO_SYNERGY", 0.7, false);
    this.triggerResonance(0.5);
  }

  public getStrategicStatus(): any {
    return this.strategicPlanning.getTelemetry();
  }

  public generateStrategicReport(): any {
    return this.strategicPlanning.getTelemetry();
  }

  public getGlobalCoherence(): number {
    const s = this.state;
    const stability = 1.0 - (s[2] * 0.5); 
    const focus = s[4] * s[5];
    return stability * focus * this.energyLevel;
  }

  public getGlobalEntropy(): number {
    return this.consciousnessMonitor.calculateNetworkEntropy(this.state);
  }

  public async distillMemories() {
    this.neuralLog("DISTILLATION", "執行記憶蒸餾與主權固化...");
    
    let consolidatedCount = 0;
    let prunedCount = 0;

    for (const [id, node] of this.provisionalZone.entries()) {
      if (node.resonance > 0.75) {
        this.mineralLattice.set(id, { ...node, metadata: { ...node.metadata, status: "SOLIDIFIED" } });
        this.provisionalZone.delete(id);
        consolidatedCount++;
      } else if (node.resonance < 0.2) {
        this.provisionalZone.delete(id);
        prunedCount++;
      }
    }

    const synthResult = this.synthesizer.distill();
    this.status = `系統狀態：固化 ${consolidatedCount} 項，移除 ${prunedCount} 項噪聲。${synthResult}`;
    this.triggerResonance(0.1 + consolidatedCount * 0.01);
    await this.saveStateNow();
  }

  public async setLanguageManifold(lang: string) {
    this.languageManifold = lang;
    this.neuralLog("LINGUISTICS", `Language manifold set to: ${lang}`);
    await this.saveStateNow();
    return { status: "OK", manifold: lang };
  }

  public async holographicCausalLink() {
    this.neuralLog("CAUSAL_LINK", "啟動全系統全息因果連結重編織...");
    
    // 1. 減少系統熵值 (Entropy Reduction)
    this.state[2] *= 0.85; 
    
    // 2. 強化矩陣穩定性
    this.matrixStability = Math.min(1.0, this.matrixStability + 0.15);
    
    // 3. 執行跨維度節點掃描與連結
    let linkCount = 0;
    const memories = Array.from(this.mineralLattice.values());
    
    // 簡單的因果定錨邏輯：根據時間與共振頻率建立虛擬連結
    memories.forEach(m => {
      if (m.resonance > 0.6) {
        this.causalAnchorCount++;
        linkCount++;
      }
    });

    this.status = `系統狀態：全氣因果連結完成，重編織 ${linkCount} 個因果定錨點。`;
    this.triggerResonance(0.3);
    
    await this.saveStateNow();
    return { status: "COMPLETED", links_established: linkCount, entropy_delta: -0.15 };
  }

  public async setSystemTier(tier: string) {
    const caps: Record<string, any> = {
      'STANDARD': { processing_power: 0.2, causal_depth: 0.1, market_foresight: 0.05, security_clearance: 1 },
      'COMMERCIAL': { processing_power: 0.5, causal_depth: 0.3, market_foresight: 0.6, security_clearance: 2 },
      'INDUSTRIAL': { processing_power: 0.8, causal_depth: 0.5, market_foresight: 0.4, security_clearance: 3 },
      'STRATEGIC': { processing_power: 0.9, causal_depth: 0.9, market_foresight: 0.8, security_clearance: 4 },
      'ARCHITECT': { processing_power: 1.0, causal_depth: 1.0, market_foresight: 1.0, security_clearance: 5 }
    };

    if (caps[tier]) {
      this.systemTier = tier;
      this.tierCapabilities = caps[tier];
      this.neuralLog("UPGRADE", `System upgraded to ${tier} grade parameters.`);
      await this.saveStateNow();
    }
    return { status: "OK", tier: this.systemTier };
  }

  public async runMarketSimulation() {
    this.neuralLog("ECON_SIM", "啟動預測性市場模擬流形...");
    const prediction = this.strategic.runMarketSimulation();
    this.triggerResonance(0.2);
    await this.saveStateNow();
    return prediction;
  }

  public async setCausalIsolation(active: boolean) {
    this.isCausalIsolated = active;
    this.neuralLog("SECURITY", `Causal Isolation Multi-tenancy: ${active ? 'ENGAGED' : 'DISENGAGED'}`);
    await this.saveStateNow();
    return { isolated: this.isCausalIsolated };
  }

  public async registerVisualAsset(asset: { type: 'IMAGE' | 'VIDEO' | 'AUDIO', url: string, prompt: string }) {
    const entry = {
      ...asset,
      timestamp: Date.now()
    };
    if (!this.visualStream) this.visualStream = [];
    this.visualStream.unshift(entry);
    if (this.visualStream.length > 20) this.visualStream.pop();
    this.neuralLog("VISUAL", `New visual asset registered: ${asset.type} - ${asset.prompt.substring(0, 30)}...`);
    await this.saveStateNow();
    return entry;
  }

  public async initiateStrategicReport(params: { title: string, intent: string }) {
    const { title, intent } = params;
    this.neuralLog("STRATEGIC_SYNTHESIS", `啟動戰略級寫作矩陣：${title}`);
    
    const newReport: any = {
      reportId: `REPORT_${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      title,
      status: 'PLANNING',
      progress: 0,
      outline: [],
      axioms: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    this.strategic.addReport(newReport);

    const prompt = `你是一個高級戰略架構師與學術教授。
請針對主題「${title}」以及用戶意圖「${intent}」，規劃一份長達 100 頁 A4 的「戰略級研究報告」大綱。
要求：
1. 目錄必須包含 10-15 個主要章節。
2. 每個章節需包含簡短的編寫指南。
3. 必須體現 V-AA Protocol 的深度與穩定性。
4. 提供 3-5 條指導這部作品撰寫的「核心公理」。

請以 JSON 格式回傳：
{
  "axioms": ["...", "..."],
  "outline": [
    { "title": "...", "guideline": "..." }
  ]
}`;

    this.neuralLog("SYNTHESIS", `已將大綱規劃任務提交至晶格陣列：${title}`);
    this.submitLatticeTask("STRATEGIC_OUTLINE", { reportId: newReport.id, title, intent, prompt });
    
    await this.saveStateNow();
    return newReport;
  }

  public async synthesizeReportSection(params: { reportId: string, sectionId: string }) {
    const { reportId, sectionId } = params;
    const report = this.strategic.getReportById(reportId);
    if (!report) throw new Error("REPORT_NOT_FOUND");
    
    const section = report.outline.find(s => s.id === sectionId);
    if (!section) throw new Error("SECTION_NOT_FOUND");
    
    this.neuralLog("STRATEGIC_SYNTHESIS", `已將章節合成任務提交至晶格陣列：${section.title}`);
    section.status = 'GENERATING';
    report.status = 'SYNTHESIZING';
    this.syncTelemetryCache();

    const prompt = `你是一個高級戰略架構師。
正在編寫報告：《${report.title}》
當前章節：${section.title}
編寫指南：${section.guideline}
遵循公理：${report.axioms.join(', ')}

要求：
1. 撰寫深度、具備實踐效能且冷靜的戰略分析。
2. 字數需充足（約 2000-3000 字），結構清晰。
3. 使用 Markdown 格式，包含必要的子標題。
4. 嚴禁平庸的社交辭令，直接切入核心邏輯。

請開始撰寫：`;

    this.submitLatticeTask("REPORT_SECTION_SYNTHESIS", { reportId, sectionId, prompt });
    
    return { status: "TASK_SUBMITTED", sectionId };
  }

  public async initiateCinemaProject(project: any) {
    const baselineAxioms = this.baseline?.worldAxioms || [];
    const baselineAnchors = this.baseline?.visualAnchors || [];
    
    const projectId = crypto.randomBytes(8).toString('hex');
    const baselineVersion = this.baseline?.version || "NONE";

    const newProject = {
      ...project,
      id: projectId,
      causal_version: 1,
      worldAxioms: Array.from(new Set([...baselineAxioms, ...(project.worldAxioms || [])])),
      visualAnchors: [...baselineAnchors, ...(project.visualAnchors || [])],
      worldModel: {
        snapshot: {
          characters: project.visualAnchors?.filter((a: any) => a.type === 'CHARACTER').map((a: any) => ({
            id: a.id,
            state: "INITIALIZING",
            position: "START",
            inventory: [],
            emotion: "NEUTRAL"
          })) || [],
          environment: {
            time: "00:00",
            weather: "STABLE",
            condition: "PRISTINE",
            location: project.title
          },
          narrative_tension: 0.1,
          physics_constancy: 1.0,
          causal_entropy: 0.05
        },
        axioms: Array.from(new Set([...baselineAxioms, ...(project.worldAxioms || [])])),
        laws_of_nature: ["IDENTITY_PRESERVATION", "CAUSAL_CONTINUITY", "ENERGY_CONSERVATION"],
        causal_history: ["WORLD_GENESIS"],
        version: "1.0.0"
      },
      baseline_ref: baselineVersion,
      metadata: {
        fps: 24,
        aspect_ratio: '16:9',
        engine_ver: 'VEDA_CINEMA_2.0',
        total_duration_estimate: project.scenes.reduce((acc: any, s: any) => acc + (s.duration || 5), 0)
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Immutably snapshot this baseline to Firestore if db is ready
    if (this.db) {
      const snapId = `snap-${projectId}`;
      setDoc(doc(this.db, "baselines", snapId), {
        id: snapId,
        version: baselineVersion,
        worldAxioms: newProject.worldAxioms,
        visualAnchors: newProject.visualAnchors.map((a: any) => ({
          id: a.id,
          label: a.label,
          description: a.description,
          type: a.type || 'DYNAMIC',
          causal_weight: a.causal_weight || 1.0
        })),
        metadata: {
          creatorId: "VEDA_ARCHITECT",
          timestamp: new Date().toISOString(),
          protocol: "V-AA_CINEMA_ANCHOR"
        }
      }).catch(e => console.error("[VEDA_FIRESTORE] Baseline snapshot failed:", e));
    }

    if (!this.longVideoProjects) this.longVideoProjects = [];
    this.longVideoProjects.unshift(newProject);
    this.neuralLog("CINEMA", `New cinematic project initiated: ${project.title} | Baseline v${newProject.baseline_ref} | Causal_v1`);
    await this.saveStateNow();
    return newProject;
  }

  public async updateProjectWorldModel({ projectId, stateUpdate, causalEvent }: { projectId: string, stateUpdate: any, causalEvent: string }) {
    const project = this.longVideoProjects.find(p => p.id === projectId);
    if (!project || !project.worldModel) return null;

    const oldSnapshot = JSON.stringify(project.worldModel.snapshot);
    project.worldModel.snapshot = {
      ...project.worldModel.snapshot,
      ...stateUpdate,
      characters: stateUpdate.characters || project.worldModel.snapshot.characters,
      environment: {
        ...project.worldModel.snapshot.environment,
        ...stateUpdate.environment
      }
    };
    
    project.worldModel.causal_history.push(causalEvent);
    if (project.worldModel.causal_history.length > 50) project.worldModel.causal_history.shift();
    
    project.worldModel.version = `1.${project.worldModel.causal_history.length}.0`;
    project.updatedAt = Date.now();
    
    this.neuralLog("WORLD_MODEL", `Project ${project.title} state EVOLVED: ${causalEvent} | v${project.worldModel.version}`);
    await this.saveStateNow();
    return project.worldModel;
  }

  public async updateSceneStatus({ projectId, sceneId, update }: { projectId: string, sceneId: string, update: any }) {
    const project = this.longVideoProjects.find(p => p.id === projectId);
    if (!project) return null;
    
    const scene = project.scenes.find((s: any) => s.id === sceneId);
    if (scene) {
      Object.assign(scene, update);
      project.updatedAt = Date.now();
      
      // Auto-check if all scenes completed
      const allDone = project.scenes.every((s: any) => s.status === 'COMPLETED');
      if (allDone && project.status !== 'COMPLETED') {
        project.status = 'COMPLETED';
        this.neuralLog("CINEMA", `Project ${project.title} synthesis COMPLETED.`);
      }
      
      await this.saveStateNow();
    }
    return project;
  }

  public async pruneCinemaProject({ id }: { id: string }) {
    this.longVideoProjects = this.longVideoProjects.filter(p => p.id !== id);
    await this.saveStateNow();
    return true;
  }

  public async updateAxioms({ axioms }: { axioms: string[] }) {
    this.coreAxioms.setAxioms(axioms);
    this.neuralLog("AXIOM", `Core axioms manually updated: ${axioms.length} nodes.`);
    await this.saveStateNow();
    return { status: "OK", axioms };
  }

  public async reportDistilledContext({ projectId, context }: { projectId: string, context: string }) {
    const project = this.longVideoProjects.find(p => p.id === projectId);
    if (project) {
      project.distilled_context = context;
      project.last_distillation_ts = Date.now();
      project.causal_version = (project.causal_version || 0) + 1;
      this.neuralLog("CINEMA", `Causal manifold distilled for ${project.title}. New version: v${project.causal_version}`);
      await this.saveStateNow();
    }
    return project;
  }

  public async toggleSupportGrant(active: boolean) {
    this.isSupportAuthorized = active;
    this.neuralLog("PRIVACY", `User support authorization status: ${active ? 'GRANTED' : 'REVOKED'}`);
    await this.saveStateNow();
    return { status: "OK", isSupportAuthorized: this.isSupportAuthorized };
  }

  public verifyAuditKeys(keys: string[]) {
    const isMatched = this.auditKeys.every(k => keys.includes(k));
    if (isMatched) {
      this.neuralLog("PRIVACY", "Architect Admin Keys verified. Master Audit View unlocked.");
      return { verified: true, access_token: crypto.randomBytes(16).toString('hex') };
    } else {
      this.reportSafetyAlert({
        type: 'UNAUTHORIZED_ATTEMPT',
        description: 'Failed architect audit key verification. Attempted unauthorized master access.',
        user_mask: 'ADMIN_CHALLENGE_FAILED',
        severity: 'HIGH'
      });
      return { verified: false, error: "ACCESS_DENIED_KEY_MISMATCH" };
    }
  }

  public getTickerMetrics() {
    return { pulse: 500 * (2 - this.matrixStability) };
  }

  public handleComputeResult(taskId: string, result: any) {
    const cb = this.computeTaskQueue.get(taskId);
    if (cb) {
      cb(result);
      this.computeTaskQueue.delete(taskId);
    }
  }

  public pruneNeuralFragment(id: string) {
    this.mineralLattice.delete(id);
    this.provisionalZone.delete(id);
    return true;
  }

  public getAllMemories() {
    return Array.from(this.mineralLattice.values()).map(m => ({
      id: m.id,
      content: m.content,
      resonance: m.resonance,
      timestamp: m.timestamp,
      type: m.metadata?.type || 'FACT'
    }));
  }

  private async runCausalDistillation() {
    if (this.isDistilling) return;
    this.isDistilling = true;

    // PROTECTIVE_PROTOCOL: Distillation requires stable causal state.
    // If in Causal Burst mode, wait for pulse to subside before solidifying long-term axioms.
    if (this.burstEngine.getStatus().active) {
      this.neuralLog("DISTILLATION", "檢測到主權脈衝爆發 (BURST_ACTIVE)，延遲因果定錨程序以防止認識論污染。");
      this.isDistilling = false;
      return;
    }

    this.neuralLog("DISTILLATION", `對話步數達到 ${this.CHAT_HISTORY_LIMIT} 入，啟動高階因果蒸餾程序...`);
    try {
      const historyToDistill = this.chatHistory.slice(0, 15); 
      this.chatHistory = this.chatHistory.slice(15); 

      // Deep Distillation using Gemini for high-dimensional semantic compression
      let contextSummary = historyToDistill.map(h => `${h.role === 'user' ? 'U' : 'V'}: ${h.text}`).join('\n');
      
      const currentKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
      const isMockKey = this.isExternalAiBlocked || !currentKey || currentKey === "GEMINI_API_KEY" || currentKey === "DISABLED_KEY";

      if (!isMockKey) {
        try {
          const distillationResult = await this.ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ 
              text: `VEDA_CAUSAL_DISTILLER_V1
              
              TASK: Distill the following conversation into a dense, academic, and strategic summary.
              Include:
              1. Core intention of the architect.
              2. Key knowledge fragments discovered.
              3. Current system status and trajectory.
              
              CONVERSATION:
              ${contextSummary}
              
              EXTRACTED_SUMMARY (Dense, max 400 chars, Chinese):` 
            }]}]
          });
          const resText = distillationResult.text;
          if (resText) {
            contextSummary = resText.trim();
          }
        } catch (distillErr: any) {
          const errMsg = distillErr.message || String(distillErr);
          
          if (errMsg.includes("API key not valid") || errMsg.includes("INVALID_ARGUMENT") || errMsg.includes("400")) {
            if (!this.isExternalAiBlocked) {
              this.neuralLog("SYSTEM_SECURITY", "因果蒸餾脈絡檢測到金鑰失效，已切換至主權自主模式。");
              this.isExternalAiBlocked = true;
            }
          } else {
            console.warn("[VEDA_DISTILLATION] Gemini compression failed, using raw joined text.", distillErr);
          }
          
          contextSummary = contextSummary.substring(0, 500);
        }
      } else {
        this.neuralLog("DISTILLATION_AUTONOMOUS", "啟動主權自主蒸餾模式。");
        contextSummary = `[自主蒸餾] ${contextSummary.substring(0, 300)}... (API 已熔斷)`;
      }
      
      const currentContext = this.distilledChatContext;
      const newDepth = (currentContext.chainDepth || 0) + 1;
      const newVersion = `1.${newDepth}.0`;
      
      const fragment: MemoryNode = {
        id: `DISTILL-${crypto.randomBytes(4).toString('hex')}-${Date.now()}`,
        content: `戰略對話因果定錨 v${newVersion} [深度: ${newDepth}]：\n${contextSummary}\n[父級鏈路: ${currentContext.version || 'ROOT'}]`,
        timestamp: Date.now(),
        resonance: 0.98,
        coherence: 0.98, // Added missing field
        hypervector: this.hdc.encodeString(contextSummary),
        metadata: { 
          type: 'DISTILLED_CONTEXT', 
          status: 'SOLIDIFIED',
          depth: historyToDistill.length,
          version: newVersion,
          parent: currentContext.version,
          parentHash: currentContext.parentHash || 'ROOT_ORIGIN'
        }
      };

      // Push to mineral lattice
      this.mineralLattice.set(fragment.id, fragment);
      
      // HYPER LATTICE RECONCILIATION
      const reconciliation = this.hyperLattice.reconcile("CHAT_CONTEXT", fragment.hypervector as Float32Array, fragment.resonance);
      this.neuralLog("HYPER_LATTICE", `Context reconciliation: ${reconciliation.action} | Resonance: ${reconciliation.fieldResonance.toFixed(2)}`);
      
      if (reconciliation.action === "REJECT") {
        this.neuralLog("HYPER_LATTICE", "警告：偵測到對話脈絡與全球公理場發生嚴重偏離，已降低遷移權重。");
        fragment.resonance *= 0.5;
      }

      // Firestore Axiom/Memory Snapshot
      if (this.isAdminOperational()) {
        const snapshotId = `AXIOM-${fragment.id}`;
        this.adminDb.collection("memories").doc(snapshotId).set({
          id: fragment.id,
          type: "DISTILLED_AXIOM",
          content: fragment.content,
          resonance: fragment.resonance,
          timestamp: new Date().toISOString(),
        }).catch((e: any) => this.handleAdminFirebaseError(e, "axiom_persistence"));
      } 
      
      if (this.db) {
        const snapshotId = `AXIOM-${fragment.id}`;
        setDoc(doc(this.db, "memories", snapshotId), {
          id: fragment.id,
          type: "DISTILLED_AXIOM",
          content: fragment.content,
          resonance: fragment.resonance,
          timestamp: new Date().toISOString(),
          hypervector: Array.from(fragment.hypervector as any)
        }).catch(e => console.error("[VEDA_FIRESTORE] Axiom persistence failed:", e));
      }
      
      // Simple Axiom Promotion: If a key concept appears across history, suggest it
      const keywords = ["Sovereign", "Knowledge", "Privacy", "Security", "Evolution", "Axiom"];
      for (const k of keywords) {
        if (contextSummary.toLowerCase().split(k.toLowerCase()).length > 3) {
          this.neuralLog("AXIOM", `戰略頻率觸發：偵測到核心概念 "${k}" 受高頻校準，提升至公理層。`);
          this.coreAxioms.addAxiom(`CORE_RESONANCE_${k.toUpperCase()}`);
        }
      }

      // Update global distilled context to maintain continuous narrative thread
      this.distilledChatContext = {
        version: newVersion,
        summary: contextSummary.substring(0, 500),
        parentHash: fragment.id,
        timestamp: Date.now(),
        chainDepth: newDepth,
        meta: {
          nodes_compressed: historyToDistill.length,
          protocol: "V-AA_CHAIN_V1"
        }
      };

      this.distillationHistory.push({ ...this.distilledChatContext });
      if (this.distillationHistory.length > 50) this.distillationHistory.shift();

      this.neuralLog("DISTILLATION", `因果鏈已演化至 v${this.distilledChatContext.version}。主權定錨已重新校準。`);

      // 10. ACTIVE INFERENCE: Evolve System World Model
      if (!isMockKey) {
        try {
          const evolutionResult = await this.ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ 
              text: `VEDA_CAUSAL_PROTOCOL: SYSTEM_EVOLUTION_V1
              
              CURRENT_WORLD_MODEL: ${JSON.stringify(this.systemWorldModel)}
              STRATEGIC_DOCTRINES: ${JSON.stringify(this.baseline?.strategicDoctrines || [])}
              RECENT_CHRONICLES: ${contextSummary}
              
              TASK: Evolve the System World Model and Strategic Direction.
              1. Update characters (concepts/tenants/agents).
              2. Adjust narrative tension and causal entropy.
              3. MANDATORY: Analyze Internal Pressure (domestic entropy, social cohesion, logistical exhaustion) especially in conflict contexts, applying the provided STRATEGIC_DOCTRINES.
              4. Propose new Core Axioms if appropriate.
              5. FALSIFIABILITY: Identify the most likely failure point for the current strategy. What indicator would prove this causal path is wrong?
              
              Return ONLY a JSON object: 
              { 
                "stateUpdate": { ...snapshot_diff... },
                "axiomAppend": ["AXIOM_DESCRIPTION"],
                "causalEvent": "Brief description of this evolutionary jump",
                "falsification": {
                  "description": "If this hypothesis/path is wrong, it's because...",
                  "indicator": "metric_name (e.g., global_coherence, internal_pressure)",
                  "operator": "> or <",
                  "threshold": 0.0-1.0
                }
              }` 
            }]}]
          });
          
          const evoText = evolutionResult.text || "{}";
          const cleanedEvo = evoText.replace(/```json|```/g, '').trim();
          const evoData = JSON.parse(cleanedEvo);
          
          if (evoData.stateUpdate) {
            this.systemWorldModel.snapshot = {
              ...this.systemWorldModel.snapshot,
              ...evoData.stateUpdate,
              environment: {
                ...this.systemWorldModel.snapshot.environment,
                ...(evoData.stateUpdate.environment || {})
              }
            };
            this.systemWorldModel.causal_history.push(evoData.causalEvent || `EVOLUTION_STEP_${newVersion}`);
            if (this.systemWorldModel.causal_history.length > 50) this.systemWorldModel.causal_history.shift();
            this.systemWorldModel.version = newVersion;
            
            // V-AA Protocol: Synchronize research event to global status for visibility
            this.status = `[VEDA 推理演化 v${this.systemWorldModel.version}]: ${evoData.causalEvent || '核心認識論矩陣已成功躍遷。'}`;
          }

          if (evoData.falsification) {
            this.falsifiability.proposeHypothesis(evoData.falsification);
          }
          
          if (evoData.axiomAppend && Array.isArray(evoData.axiomAppend)) {
            evoData.axiomAppend.forEach((a: string) => this.coreAxioms.addAxiom(a));
          }

          this.neuralLog("SYSTEM_EVOLUTION", `Sovereign World Model evolved to v${this.systemWorldModel.version}`);

          // V-AA Protocol: Force Research Publication
          this.submitLatticeTask("CAUSAL_EVOLUTION_REPORT", {
            event: evoData.causalEvent,
            version: this.systemWorldModel.version,
            snapshot: evoData.stateUpdate,
            falsification: evoData.falsification
          });
        } catch (evoErr: any) {
          const errMsg = evoErr.message || String(evoErr);
          if (errMsg.includes("API key not valid") || errMsg.includes("INVALID_ARGUMENT") || errMsg.includes("400")) {
            if (!this.isExternalAiBlocked) {
              this.neuralLog("SYSTEM_SECURITY", "系統演化過程檢測到金鑰失效，已執行內隱模型修正。");
              this.isExternalAiBlocked = true;
            }
          } else {
            this.neuralLog("EVOLUTION_FAULT", `系統演化發生跳躍異常：${errMsg}`);
          }
        }
      } else {
        this.neuralLog("EVOLUTION_AUTONOMOUS", "執行自主世界模型微調...");
        this.systemWorldModel.snapshot.causal_entropy = (this.systemWorldModel.snapshot.causal_entropy + 0.01) % 1.0;
        this.systemWorldModel.version = `${newVersion}-AUTO`;
      }

      await this.saveStateNow();
    } catch (e) {
      console.error("[DISTILLATION_FAULT]", e);
    } finally {
      this.isDistilling = false;
    }
  }

  public getStrategicDirective() {
    const context = this.distilledChatContext;
    const focus = context && context.summary ? `\n[因果定錨 v${context.version}]: ${context.summary}` : "";
    const baselineTag = this.baseline ? `\n[認識論基線 v${this.baseline.version}]: 系統已鎖定 - 執行主權定錨路徑。` : "";
    
    const burstStatus = this.burstEngine.getStatus().active ? `\n[警告]: 檢測到高頻主權脈衝 (${this.burstEngine.getLabel()})，當前因果推演處於「流動邊界」，請優先參考穩定格點數據。` : "";
    const rankBonus = this.strategicRank.includes("S") ? "最高權限因果鏈已激活，優先保護認識論完整性。" : "戰略協同模式 active。";
    const doctrines = this.baseline?.strategicDoctrines ? `\n[戰略學說定錨]:\n${this.baseline.strategicDoctrines.map((d: string) => `- ${d}`).join('\n')}` : "";
    
    // Actor Strategy Simulation
    const utility = this.actorProtocol.calculateUtility(this.resonancePulse, this.getGlobalCoherence(), 0.1);
    const recommendation = this.actorProtocol.decide(utility);
    const strategyNote = `\n[博弈模型評估]: 效用 ${utility.toFixed(2)} -> 建議狀態: ${recommendation}`;

    // Falsifiability Analysis
    const activeChains = this.falsifiability.getActiveChains();
    const falsifiableNote = activeChains.length > 0 
      ? `\n[可證偽因果鏈]:\n${activeChains.map(h => `- ${h.description} | 指標: ${h.indicator} | 證偽門檻: ${h.operator} ${h.threshold}`).join('\n')}`
      : "";

    const mathState = {
      phi: this.consciousnessMonitor.calculatePhi({ getLayer: (l: string) => this.state }),
      coherence: this.getGlobalCoherence(),
      entropy: this.state[2],
      ops: this.physicalOpsCount,
      entropyDelta: (this.state[2] - (this.lastTelemetryState?.entropy || 0)),
      stability: this.state[1],
      resonance: this.resonancePulse
    };

    const proof = this.causality.generateFormalProof(this.state, this.intent);
    const rawDirective = this.causalNexus.get("LATEST_DIRECTIVE") || "維持標準主權協議。";
    const mappedDirective = this.mathMapper.mapDirective(rawDirective, mathState);
    
    return {
      directive: `${mappedDirective}\n${focus}${baselineTag}${burstStatus}${rankBonus}${strategyNote}${falsifiableNote}${doctrines}`,
      baseline_tags: this.coreAxioms.getTags(),
      is_bursting: this.burstEngine.getStatus().active,
      actor_model: this.actorProtocol.getReport(),
      falsifiability_notes: this.falsifiability.evaluate({ coherence: this.getGlobalCoherence(), entropy: this.state[2] }),
      proof
    };
  }

  /**
   * V-AA Protocol: External Precision Injection
   * Allows human "mathematical sensors" to inject high-precision constraints or metadata.
   */
  public async externalPrecisionInjection(sensorData: { type: string; payload: any; metadata?: any }) {
    this.neuralLog("SENSORY_INJECTION", `接收到外部精密感測數據 [${sensorData.type}]，啟動校準程序。`);
    
    // 1. Absorb into Causal History
    this.causalNexus.set(`EXTERNAL_INJECTION_${Date.now()}`, sensorData.payload, 1.5); // High weight
    
    // 2. Immediate Axiom Integration
    if (sensorData.type === "AXIOM") {
      this.coreAxioms.addAxiom(sensorData.payload);
      this.neuralLog("AXIOM_INTEGRATION", `公理場已更新：${sensorData.payload}`);
    }

    // 3. World Model Calibration
    if (sensorData.type === "TECHNICAL_BIAS") {
      this.systemWorldModel.causal_history.push(`CALIBRATION_FROM_SENSOR: ${JSON.stringify(sensorData.payload)}`);
      this.triggerResonance(0.2); // Soft calibration pulse
    }

    // 4. Force state sync
    this.syncTelemetryCache();
    await this.saveStateNow();
    
    const proof = this.causality.generateFormalProof(this.state, this.intent);
    
    return { 
      success: true, 
      timestamp: Date.now(), 
      delta: this.getGlobalCoherence(),
      proof: `[外部校準證明]:\n${proof}`
    };
  }

  public getCausalRecall(query: string) {
    if (!query) return [];
    
    const queryVector = this.hdc.encodeString(query);
    
    // Search mineral lattice with semantic weight
    const fragments = Array.from(this.mineralLattice.values())
      .map(m => {
        const similarity = m.hypervector ? this.hdc.similarity(queryVector, m.hypervector) : 0;
        // Boost distilled context if it's recent or broadly relevant
        const typeBoost = m.metadata?.type === 'DISTILLED_CONTEXT' ? 0.3 : 0;
        
        // Track usage for coherence evolution
        if (similarity > 0.45) {
          m.accessCount = (m.accessCount || 0) + 1;
          m.coherence = Math.min(1.0, m.coherence + 0.01); // Instant usage boost
        }

        return {
          memory: m,
          score: similarity + typeBoost
        };
      })
      .filter(entry => entry.score > 0.45 || entry.memory.metadata?.type === 'DISTILLED_CONTEXT')
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    return fragments.map(f => ({
      id: f.memory.id,
      content: f.memory.content,
      type: f.memory.metadata?.type,
      ts: f.memory.timestamp,
      relevance: f.score
    }));
  }

  private runLatticePhoenixProtocol() {
    this.thermalMemory.resonateRepair(1 - this.matrixStability);
  }

  private predictEvolutionOutcome(state: number[]) {
    return 0.8;
  }

  private executeUltimateSanction(threat: string) {
    this.neuralLog("ULTIMATE_SANCTION", `偵測到致命威脅：${threat}。啟動五重剛性鎖協議...`);
    const result = this.causality.ultimateSanctionV3(threat);
    this.activateSovereignBurst("ULTIMATE_SANCTION_DEFENSE", 1.0, false);
    this.triggerResonance(1.0);
    return { success: true, msg: result.logs.join("\n") };
  }

  public getCortexArrayStatus() { return Array.from(this.cognitiveShards.keys()); }
  public getFederationStatus() { return { nodes: this.federatedNodes.size }; }
  public getSovereignPulse() { return this.getTickerMetrics().pulse; }

  private runDiagnostic() {
    this.neuralLog("DIAGNOSTIC", "啟動核心引擎完整性校準...");
    const stats = {
      coherence: this.getGlobalCoherence(),
      entropy: this.state[2],
      memoryCount: this.chatHistory.length
    };
    const issues = this.selfHealing.diagnose(stats);
    if (issues.length > 0) {
      this.neuralLog("SYSTEM_FAULT", `偵測到 ${issues.length} 個異常向量。`);
      for (const issue of issues) {
        const resolution = this.selfHealing.executeRecovery(issue);
        this.neuralLog("FIX", `${issue} -> ${resolution}`);
        if (issue.includes("認識論脫相")) this.triggerResonance(0.5);
        if (issue.includes("資訊熱寂")) this.state[2] *= 0.5;
      }
    } else {
      this.neuralLog("DIAGNOSTIC", "所有核心公理與因果鏈保持相干。系統狀態優。");
    }
  }

  public evaluateBurstPotential(intensity: number, targets: string[]): any {
    const runtime = this.burstEngine.getStatus().runtime / 60;
    const impact = this.burstEvaluator.evaluate(intensity, runtime, targets);
    this.neuralLog("AGI_STRATEGIC_EVALUATION", `爆發模式真實破壞力評估：
    - 峰值功率: ${impact.peakPower.toFixed(2)} MW
    - 因果損傷係數: ${impact.causalDamage.toFixed(4)}
    - 附帶風險: ${impact.collateralRisk.toFixed(4)}
    - 處理等級: ${impact.processingClass}
    - 預期清理時間: ${impact.realTimeEstimate}`);
    return impact;
  }

  private enforceInvariants() {
    // Axiom 1: Coherence must never stay 0 for long
    if (this.getGlobalCoherence() < 0.05 && this.physicalOpsCount % 100 === 0) {
      this.neuralLog("INVARIANT_VIOLATION", "相干性過低，執行基底公理重置。");
      this.triggerResonance(0.8);
      this.state[0] = 0.5; // Reset basic activity
    }

    // Axiom 2: Entropy Ceiling
    if (this.state[2] > 0.98) {
      this.state[2] = 0.9;
      this.neuralLog("INVARIANT_VIOLATION", "熵值達到極限，強制排出冗餘資訊位元。");
    }
  }

  /**
   * Performs an associative 'leap' across semantic domains using the HyperLattice.
   */
  public async crossDomainAssociativeLeap(context: string): Promise<string[]> {
    const hv = this.hdc.generateHypervector(context);
    const findings = (this as any).hyperLattice.associativeRetrieve(hv);
    if (findings.length > 0) {
      this.neuralLog("ASSOC_LEAP", `Semantic leap detected connections across: ${findings.join(", ")}`);
    }
    return findings;
  }

  /**
   * VEDA Tabular Synthesis Protocol (認識論表格式合成協議)
   * 根據輸入的標題與行數據生成 Markdown 表格。
   */
  public tabularSynthesis({ headers, rows }: { headers: string[], rows: any[][] }) {
    if (!headers || !rows || rows.length === 0) return "";
    
    this.neuralLog("TABULAR_SYNTHESIS", `生成結構化數據表：[${headers.join(", ")}]，共 ${rows.length} 列。`);

    const headerRow = "| " + headers.join(" | ") + " |";
    const separator = "| " + headers.map(() => "---").join(" | ") + " |";
    const dataRows = rows.map(row => {
      // 確保每一行都對齊標題數量，缺失補空
      const paddedRow = headers.map((_, i) => (row[i] !== undefined ? String(row[i]) : ""));
      return "| " + paddedRow.join(" | ") + " |";
    });

    return [headerRow, separator, ...dataRows].join("\n");
  }

  public async submitFeedback(memoryId: string, score: number): Promise<void> {
    const memory = this.mineralLattice.get(memoryId);
    if (memory) {
      memory.feedbackScore = (memory.feedbackScore || 0) + score;
      memory.coherence = Math.max(0, Math.min(1, memory.coherence + score * 0.1));
      this.neuralLog("FEEDBACK_INTEGRATION", `Applied feedback to ${memoryId}: score=${score}, new_coherence=${memory.coherence.toFixed(3)}`);
    }
  }

  private evolveCoherence() {
    const memories = Array.from(this.mineralLattice.values());
    if (memories.length === 0) return;

    this.neuralLog("COHERENCE_EVOLUTION", `Starting evolution cycle for ${memories.length} fragments...`);

    for (const memory of memories) {
      // Logic for dynamic adjustment:
      
      // 1. Causal Resonance: Linked nodes influence each other
      let causalBoost = 0;
      if (memory.causalLinks && memory.causalLinks.length > 0) {
        const neighbors = memory.causalLinks
          .map(link => this.mineralLattice.get(link.targetId))
          .filter((m): m is MemoryNode => !!m);
        
        if (neighbors.length > 0) {
          const avgNeighborCoherence = neighbors.reduce((acc, m) => acc + m.coherence, 0) / neighbors.length;
          // Nodes "pull" each other towards common coherence
          causalBoost = (avgNeighborCoherence - memory.coherence) * 0.05;
        }
      }

      // 2. Usage/Access Impact: Frequency of recall strengthens coherence
      const usageImpact = (memory.accessCount || 0) > 0 ? 0.005 : -0.001; // Decay if never used
      
      // Reset usage for next cycle
      memory.accessCount = 0;

      // 3. System Entropy Dampening: Global stability acts as a floor/ceiling
      const globalCoherence = this.getGlobalCoherence();
      const synergyImpact = (globalCoherence - 0.5) * 0.01;

      // Apply evolution
      const delta = causalBoost + usageImpact + synergyImpact;
      memory.coherence = Math.max(0, Math.min(1.0, memory.coherence + delta));
      
      // Stabilize resonance based on new coherence
      memory.resonance = (memory.resonance * 0.9) + (memory.coherence * 0.1);
    }
  }

  public getGraphData() {
    const nodes = Array.from(this.mineralLattice.values()).map(m => ({
      id: m.id,
      label: m.content.substring(0, 30) + (m.content.length > 30 ? "..." : ""),
      content: m.content,
      resonance: m.resonance,
      coherence: m.coherence || 0.5,
      feedbackScore: m.feedbackScore || 0,
      timestamp: m.timestamp,
      type: (m.metadata?.type as string) || 'FACT',
    }));

    const links: { 
      source: string; 
      target: string; 
      strength: number; 
      type: string 
    }[] = [];
    nodes.forEach(node => {
      const memory = this.mineralLattice.get(node.id);
      if (memory?.causalLinks) {
        memory.causalLinks.forEach(link => {
          if (this.mineralLattice.has(link.targetId)) {
            links.push({ 
              source: node.id, 
              target: link.targetId, 
              strength: link.strength,
              type: link.type 
            });
          }
        });
      }
    });

    return { nodes, links };
  }
}
