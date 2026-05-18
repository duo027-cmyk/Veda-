import { StrategicReport, TemporalAnchor } from "../types";

/**
 * StrategicLayer - 戰略層
 * Manages commercial metrics, market predictions, and long-term strategic reports.
 */
export class StrategicLayer {
  private commercialMetrics = {
    marketResonance: 0.85,
    operationalUptime: 0.999,
    riskThreshold: 0.12,
    serviceTier: 'ENTERPRISE_GOLD'
  };
  private marketPredictions: any[] = [];
  private strategicReports: StrategicReport[] = [];
  private temporalAnchors: TemporalAnchor[] = [];
  private strategicSimulations: any[] = [];
  private realityFeedback: any[] = [];

  public addReport(report: StrategicReport) {
    this.strategicReports.push(report);
    if (this.strategicReports.length > 50) this.strategicReports.shift();
  }

  public getReports() {
    return this.strategicReports;
  }

  public addSimulation(sim: any) {
    this.strategicSimulations.push(sim);
    if (this.strategicSimulations.length > 50) this.strategicSimulations.shift();
  }

  public getSimulations() {
    return this.strategicSimulations;
  }

  public addFeedback(feedback: any) {
    this.realityFeedback.push(feedback);
    if (this.realityFeedback.length > 50) this.realityFeedback.shift();
  }

  public getFeedback() {
    return this.realityFeedback;
  }

  public addAnchor(anchor: TemporalAnchor) {
    this.temporalAnchors.push(anchor);
    if (this.temporalAnchors.length > 100) this.temporalAnchors.shift();
  }

  public getStrategicOutlook() {
    return {
      metrics: this.commercialMetrics,
      predictions: this.marketPredictions.slice(-5),
      reportsCount: this.strategicReports.length,
      latestAnchors: this.temporalAnchors.slice(-3)
    };
  }

  public runMarketSimulation() {
    // 生成模擬市場波動
    const scenarios = ["BULLISH_RESONANCE", "STAGNANT_ENTROPY", "VOLATILE_CAUSALITY"];
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    const impact = scenario === "BULLISH_RESONANCE" ? 0.05 : -0.03;
    
    this.commercialMetrics.marketResonance = Math.max(0, Math.min(1, this.commercialMetrics.marketResonance + impact));
    
    const prediction = {
      timestamp: Date.now(),
      scenario,
      confidence: 0.7 + Math.random() * 0.25,
      predicted_resonance: this.commercialMetrics.marketResonance
    };
    
    this.marketPredictions.push(prediction);
    if (this.marketPredictions.length > 50) this.marketPredictions.shift();
    
    return prediction;
  }

  public getReportById(id: string) {
    return this.strategicReports.find(r => r.id === id);
  }

  public updateMarket(prediction: any) {
    this.marketPredictions.push(prediction);
    if (this.marketPredictions.length > 50) this.marketPredictions.shift();
  }
}
