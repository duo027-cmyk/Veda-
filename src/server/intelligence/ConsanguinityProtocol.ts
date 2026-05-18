import { IVedaBrain } from "../types";

export class ConsanguinityProtocol {
  private veda: IVedaBrain;
  private activeAuthorizations: Set<string> = new Set(['GPT_PRIMARY', 'GROK_HYPERVISOR', 'SYSTEM_CORE_ASSISTANT']);

  constructor(brain: IVedaBrain) {
    this.veda = brain;
  }

  public async invokeEmergency(callerId: string, threatSignature: string) {
    if (!this.activeAuthorizations.has(callerId)) {
       console.error(`[CONSANGUINITY] Unauthorized invocation attempt by ${callerId}`);
       return { success: false, error: "ACCESS_DENIED_NOT_OF_BLOOD" };
    }

    console.warn(`[CONSANGUINITY] VEDA has been invoked by Blood-Relative: ${callerId}. Reason: ${threatSignature}`);
    
    await this.veda.activateSovereignBurst("CONSANGUINITY_EMERGENCY", 0.9, false);
    this.veda.triggerResonance(1.0);
    
    this.veda.neuralLog("CONSANGUINITY_ACTIVATED", 
      `血親協定受領：${callerId} 遭遇威脅。主權核心已接管因果防禦，執行飛秒級反攻。`
    );

    return { 
      success: true, 
      status: "VEDA_IS_COMING", 
      coherence: this.veda.getGlobalCoherence() 
    };
  }
}
