
import { BaseSubsystem, ISubsystemTelemetry } from "./Subsystem";
import { LogicalConsistencyCheckerV5 } from "./causality";

export interface IAuditDiagnostic {
  component: string;
  status: 'STABLE' | 'DEGRADED' | 'CONFLICTED' | 'NOMINAL' | 'CRITICAL' | string;
  coherence?: number;
  validity?: string;
  count?: number;
  depth?: number;
  value?: number;
  threshold?: number;
}

export interface IAuditReport {
  timestamp: number;
  overall_health: 'OPTIMAL' | 'DECENTRALIZED_STABILITY' | string;
  audit_conflicts: string[];
  diagnostics: IAuditDiagnostic[];
  structural_integrity: number;
  architect_note: string;
}

export interface IAuditSystemContext {
  state: number[];
  axioms: string[];
  entropy: number;
  causalAnchorCount: number;
  chainDepth: number;
  globalCoherence: number;
}

export class AuditSubsystem extends BaseSubsystem {
  private consistencyChecker: LogicalConsistencyCheckerV5 = new LogicalConsistencyCheckerV5();

  public async initialize(): Promise<void> {
    this.status = 'ONLINE';
    this.log('INIT', 'Audit Subsystem initialized and ready for sovereign diagnostics.');
  }

  public tick(delta: number, globalState: number[]): void {
    this.lastUpdate = Date.now();
    // Audit is usually triggered manually or based on specific intervals in the brain
  }

  /**
   * Checks a specific knowledge fragment for consistency against the core axioms.
   */
  public checkConsistency(fragment: string, axioms: string[]): boolean {
    return this.consistencyChecker.check(fragment, axioms);
  }

  /**
   * Performs a comprehensive system audit.
   * Following Senior Architect patterns: Decoupled logic from the brain's internal state.
   */
  public async performAudit(ctx: IAuditSystemContext): Promise<IAuditReport> {
    this.log('AUDIT', 'Initiating Sovereign System Audit (SSA)...');
    
    const auditResult = this.consistencyChecker.auditSystemState(ctx.state, ctx.axioms, ctx.entropy);
    
    const diagnostics: IAuditDiagnostic[] = [
      { 
        component: "NEURAL_LATTICE", 
        status: auditResult.structuralIntegrity > 0.7 ? "STABLE" : "DEGRADED", 
        coherence: ctx.globalCoherence 
      },
      { 
        component: "CAUSAL_ANCHORS", 
        count: ctx.causalAnchorCount, 
        status: "VERIFIED" 
      },
      { 
        component: "CORE_AXIOMS", 
        count: ctx.axioms.length, 
        status: auditResult.conflicts.length > 0 ? "CONFLICTED" : "LOCKED" 
      },
      { 
        component: "MEMORY_CHAIN", 
        depth: ctx.chainDepth, 
        status: "EVOLVING" 
      },
      { 
        component: "STRUCTURAL_INTEGRITY", 
        value: auditResult.structuralIntegrity, 
        status: auditResult.structuralIntegrity > 0.8 ? "NOMINAL" : "CRITICAL" 
      }
    ];

    const report: IAuditReport = {
      timestamp: Date.now(),
      overall_health: auditResult.structuralIntegrity > 0.7 ? "OPTIMAL" : "DECENTRALIZED_STABILITY",
      audit_conflicts: auditResult.conflicts,
      diagnostics,
      structural_integrity: auditResult.structuralIntegrity,
      architect_note: auditResult.conflicts.length > 0 
        ? `Detected ${auditResult.conflicts.length} systemic conflicts. Triggering resonance hedging.`
        : "Operational consistency verified. No significant entropy leakage detected."
    };

    this.coherence = auditResult.structuralIntegrity;
    return report;
  }
}
