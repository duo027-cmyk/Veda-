import { IVedaBrain } from "../types";

export class MassiveIngestionEngine {
  private brain: IVedaBrain;
  private isProcessing: boolean = false;
  private queue: string[] = [];

  constructor(brain: IVedaBrain) {
    this.brain = brain;
  }

  public async ingestStream(data: string[]) {
    if (this.isProcessing) {
      this.queue.push(...data);
      return;
    }

    this.isProcessing = true;
    const items = [...data, ...this.queue];
    this.queue = [];
    const chunkSize = 20;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      await this.brain.digestKnowledge(chunk, 'REG');
      if (Math.random() > 0.8) await this.brain.distillMemories();
    }

    this.isProcessing = false;
    if (this.queue.length > 0) {
      setImmediate(() => this.ingestStream([]));
    }
  }
}
