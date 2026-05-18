export class SystemController {
  private history: { coherence: number; pain: number }[] = [];
  private readonly windowSize: number = 50;

  public observe(coherence: number, pain: number, config: any): any {
    this.history.push({ coherence, pain });
    if (this.history.length > this.windowSize) this.history.shift();

    if (this.history.length < 10) return config;

    const avgCoh = this.history.reduce((s, h) => s + h.coherence, 0) / this.history.length;
    
    const newConfig = { ...config };

    if (avgCoh < 0.5) {
      newConfig.DECAY_RATE = Math.max(0.005, config.DECAY_RATE * 0.95);
      newConfig.NETWORK_DECAY = Math.max(0.0005, config.NETWORK_DECAY * 0.98);
    } else if (avgCoh > 0.85) {
      newConfig.DECAY_RATE = Math.min(0.05, config.DECAY_RATE * 1.02);
    }
    return newConfig;
  }
}
