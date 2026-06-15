export class TrendPredictor {
  private history: number[] = [];
  private window: number = 10; // Extended historical window for more robust OLS estimation

  /**
   * Computes the Ordinary Least Squares (OLS) linear regression for the historical trend.
   * If N < 3, falls back to stable status.
   * Otherwise, solves: y = mx + c
   */
  public predict(val: number): { 
    trend: number; 
    state: string; 
    rSquared?: number; 
    predictionNext?: number;
    slope?: number;
    intercept?: number;
  } {
    if (typeof val !== "number" || !Number.isFinite(val)) {
      return { trend: 0.0, state: "穩定" };
    }

    this.history.push(val);
    if (this.history.length > this.window) {
      this.history.shift();
    }

    const n = this.history.length;
    if (n < 3) {
      return { 
        trend: 0.0, 
        state: "穩定",
        rSquared: 0,
        predictionNext: val,
        slope: 0,
        intercept: val
      };
    }

    // Coordinates: x_i = i, y_i = history[i]
    let sumX = 0;
    let sumY = 0;
    let sumXX = 0;
    let sumYY = 0;
    let sumXY = 0;

    for (let i = 0; i < n; i++) {
      const x = i;
      const y = this.history[i];
      sumX += x;
      sumY += y;
      sumXX += x * x;
      sumYY += y * y;
      sumXY += x * y;
    }

    const numerator = n * sumXY - sumX * sumY;
    const denominator = n * sumXX - sumX * sumX;

    // Linear Slope (m) and Intercept (c)
    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = (sumY - slope * sumX) / n;

    // Correlation Coefficient R
    const rNumerator = numerator;
    const rDenominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    const rValue = (rDenominator !== 0 && !isNaN(rDenominator)) ? rNumerator / rDenominator : 0;
    const rSquared = rValue * rValue;

    // Predict the next sequence value (x = n)
    const predictionNext = slope * n + intercept;

    // Classify the trend velocity
    // If the slope is positive and mathematically significant, it is an upward trend.
    const threshold = 0.005;
    const state = slope > threshold ? "上升" : slope < -threshold ? "下降" : "穩定";

    return {
      trend: Number(slope.toFixed(6)),
      state,
      rSquared: Number(rSquared.toFixed(5)),
      predictionNext: Number(Math.max(0, Math.min(1, predictionNext)).toFixed(5)),
      slope: Number(slope.toFixed(6)),
      intercept: Number(intercept.toFixed(6))
    };
  }
}

