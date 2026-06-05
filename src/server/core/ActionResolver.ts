// src/server/core/ActionResolver.ts
import { IVedaBrain } from "../types";

/**
 * ActionResolver - AGI Sovereign Decoupling Protocol v6.3
 * 
 * Multiplexes action payloads to the appropriate VEDA System core endpoints.
 * This decouples the low-level transport/framework boundary (Express/WebSocket)
 * from direct brain state manipulation.
 */
export class ActionResolver {
  private brain: IVedaBrain;

  constructor(brain: IVedaBrain) {
    this.brain = brain;
  }

  /**
   * Resolves and executes a sovereign VEDA execution request.
   * Ensures physical, semantic, and causal execution constraints.
   */
  public async executeAction(action: string, params: any): Promise<any> {
    let result: any = { success: true, timestamp: Date.now() };

    switch (action) {
      case "evolve":
        result.data = await this.brain.processEvolution(params.intent, null, params.text);
        break;

      case "activateBurst":
        result.data = await this.brain.activateSovereignBurst(
          params?.target || "Sovereign Optimization",
          params?.intensity || 0.5,
          params?.manualApproval || false,
          params?.mode
        );
        break;

      case "approveBurst":
        result.data = this.brain.approveSovereignBurst();
        break;

      case "deactivateBurst":
        result.data = await this.brain.deactivateSovereignBurst(params?.reason || "COOLDOWN");
        break;

      case "triggerResonance":
        this.brain.triggerResonance(params?.intensity || 0.1);
        break;

      case "triggerCognitiveSymmetry":
        result.data = await this.brain.triggerCognitiveSymmetry();
        break;

      case "toggleLogicFreeze":
        result.isFrozen = this.brain.toggleLogicFreeze();
        break;

      case "synthesize":
        const fragment = await this.brain.synthesizeMemory();
        if (!fragment) throw new Error("SYNTHESIS_FAILED");
        result.memory = fragment;
        break;

      case "injectSensoryData":
        result.data = await this.brain.externalPrecisionInjection(params);
        break;

      case "initiateCinemaProject":
        result.data = await this.brain.initiateCinemaProject(params);
        break;

      case "updateProjectWorldModel":
        result.data = await this.brain.updateProjectWorldModel(params);
        break;

      case "updateSceneStatus":
        result.data = await this.brain.updateSceneStatus(params);
        break;

      case "scanNetwork":
        result.data = await this.brain.scanNetwork(params);
        break;

      case "submitLatticeTask":
        result.data = this.brain.submitLatticeTask(params.type, params.payload);
        break;

      case "pauseLatticeJob":
        if (this.brain.pauseLatticeJob) {
          result.data = this.brain.pauseLatticeJob(params.id, params.isPaused);
        } else {
          result.success = false;
          result.error = "Method not implemented";
        }
        break;

      case "reorderLatticeJob":
        if (this.brain.reorderLatticeJob) {
          result.data = this.brain.reorderLatticeJob(params.id, params.direction);
        } else {
          result.success = false;
          result.error = "Method not implemented";
        }
        break;

      case "smartPurgeLatticeJobs":
        if (this.brain.smartPurgeLatticeJobs) {
          result.data = this.brain.smartPurgeLatticeJobs(params.timeoutMs);
        } else {
          result.success = false;
          result.error = "Method not implemented";
        }
        break;

      case "solidifyLatticeJob":
        result.data = await this.brain.solidifyLatticeJob(params);
        break;

      case "digestKnowledge":
        result.data = await this.brain.digestKnowledge(params.snippets, params.scope);
        break;

      case "registerVisualAsset":
        result.data = await this.brain.registerVisualAsset(params);
        break;

      case "createTemporalAnchor":
        result.data = await this.brain.createTemporalAnchor(params.label);
        break;

      case "timeTravel":
        result.success = await this.brain.timeTravel(params.anchorId);
        break;

      case "distillMemories":
        result.data = await this.brain.distillMemories();
        break;

      case "generateSovereignResponse":
        result.data = await this.brain.generateSovereignResponse(params);
        break;

      case "updateSensorData":
        result.data = await this.brain.updateSensorData(params);
        break;

      case "performAudit":
        result.data = await this.brain.performAudit();
        break;

      case "initiateStrategicReport":
        result.data = await this.brain.initiateStrategicReport(params);
        break;

      case "appraiseStrategicReport":
        result.data = await this.brain.appraiseStrategicReport(params);
        break;

      case "enrichReportToL4":
        result.data = await this.brain.enrichReportToL4(params);
        break;

      case "synthesizeReportSection":
        result.data = await this.brain.synthesizeReportSection(params);
        break;

      case "batchSynthesizeReport":
        result.data = await this.brain.batchSynthesizeReport(params.reportId);
        break;

      case "executePalantirAIPAction":
        result.data = this.brain.executePalantirAIPAction(params.actionType);
        break;

      case "handleChatMessage":
        const chatText = String(params.text || "");
        const chatRole = params.role || 'user';
        
        if (chatText.startsWith("DELETE_MSG:")) {
          const msgId = chatText.replace("DELETE_MSG:", "");
          result.data = { success: true, deletedId: msgId };
        } else if (chatText.trim().startsWith("AIzaSy")) {
          this.brain.updateApiKey(chatText.trim());
          result.data = await this.brain.handleChatMessage("金鑰已更新，正在重新連結外部認識論...", "model");
        } else {
          result.data = await this.brain.handleChatMessage(chatText, chatRole);
        }
        break;

      case "clearChatHistory":
        await this.brain.resetChatHistory();
        result.message = "EPISTEMIC_PURGE_COMPLETE";
        break;

      case "igniteUltimateSovereignty":
        result.data = await this.brain.igniteUltimateSovereignty();
        break;

      default:
        const method = (this.brain as any)[action];
        if (typeof method === "function") {
          result.data = await method.call(this.brain, params);
        } else {
          console.warn(`[VEDA_ACTION_RESOLVER] Unknown action requested: ${action}`);
          throw new Error(`UNKNOWN_DIRECTIVE: ${action}`);
        }
    }

    return result;
  }
}
