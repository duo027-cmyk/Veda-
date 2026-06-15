/**
 * VEDA Frontend Components Barrel Export System (全端組件統合匯流層)
 * 
 * This file acts as the formal, standardized entrypoint for VEDA client components.
 * It groups components into high-integrity domain categories and exports them 
 * cleanly to reduce mutual file dependency clutter.
 */

// --- CORE / SHELL DOMAIN (核心與殼層組件) ---
export { Header } from './Header';
export { NavRail } from './NavRail';
export { SovereignInitialization } from './SovereignInitialization';
export { SovereignCircuitBreaker } from './SovereignCircuitBreaker';
export { ErrorBoundary } from './ErrorBoundary';
export { LiveOverlay } from './LiveOverlay';

// --- COGNITIVE / CONVERSATIONAL DOMAIN (認知與對話組件) ---
export { ChatInterface } from './ChatInterface';
export { ChatPanel } from './ChatPanel';
export { Terminal } from './Terminal';
export { ThoughtTrace } from './ThoughtTrace';

// --- CONTROL & MANAGEMENT DASHBOARD DOMAIN (控制與管理層) ---
export { ControlPanel } from './ControlPanel';
export { CoreConfig } from './CoreConfig';
export { SovereignManagement } from './SovereignManagement';
export { StrategicWorkstation } from './StrategicWorkstation';
export { PalantirAIPDashboard } from './PalantirAIPDashboard';
export { PhysicsInformedNeuromorphicDashboard } from './PhysicsInformedNeuromorphicDashboard';

// --- CAUSAL & METACOGNITIVE REASONING DOMAIN (因果與超維度計算) ---
export { CognitiveArchitecture } from './CognitiveArchitecture';
export { CausalSimulator } from './CausalSimulator';
export { AgiProximityEvaluator } from './AgiProximityEvaluator';
export { KnowledgeGraph } from './KnowledgeGraph';
export { LatticeCruncher } from './LatticeCruncher';
export { AnalogicalThinkingWorkspace } from './AnalogicalThinkingWorkspace';

// --- NEURAL & QUANTUM SIGNALS / MONITOR DOMAIN (底層信號與神經波包) ---
export { NeuralManifold } from './NeuralManifold';
export { QuantumWaveform } from './QuantumWaveform';
export { SelfLearningGradientMonitor } from './SelfLearningGradientMonitor';
export { EntropyVisualizer } from './EntropyVisualizer';
export { NeuralPulse } from './NeuralPulse';
export { BurstMonitor } from './BurstMonitor';
export { CuriosityMonitor } from './CuriosityMonitor';
export { SynapseOverview } from './SynapseOverview';
export { EfficacyManifold } from './EfficacyManifold';
export { HoneycombHUD } from './HoneycombHUD';
export { CrystalSoulHUD } from './CrystalSoulHUD';

// --- VAULTS, ARCHIVES & PORTFOLIO DOMAIN (歷史、知識庫與精選集) ---
export { KnowledgeVault } from './KnowledgeVault';
export { CinemaManifold } from './CinemaManifold';
export { DreamscapeView } from './DreamscapeView';
export { LiteratureReview } from './LiteratureReview';
export { EpistemicLog } from './EpistemicLog';
export { EpistemicStatus } from './EpistemicStatus';
export { AmanoMasterpiece } from './AmanoMasterpiece';
export { AmanoAestheticPreview } from './AmanoAestheticPreview';

// --- COMMON UI & ATOMIC SYSTEMS (原子與公共元件) ---
export { TaskManager } from './TaskManager';
export { ProfileManager } from './ProfileManager';
export { WorkspaceSelector } from './WorkspaceSelector';
export { AuditLogModal } from './AuditLogModal';
export { VedaCrystalLogo } from './VedaCrystalLogo';
export { FFLabel } from './FFLabel';
