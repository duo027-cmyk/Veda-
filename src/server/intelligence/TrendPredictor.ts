export class TrendPredictor {
  private history: number[] = [];
  private window: number = 5;

  public predict(val: number): { trend: number; state: string } {
    this.history.push(val);
    if (this.history.length > this.window) this.history.shift();
    if (this.history.length < 3) return { trend: 0.0, state: "穩定" };
    const v1 = this.history[this.history.length - 1] - this.history[this.history.length - 2];
    const v2 = (this.history[this.history.length - 1] - this.history[this.history.length - 2]) - (this.history[this.history.length - 2] - this.history[this.history.length - 3]);
    const trendVal = v1 + 0.5 * v2;
    const state = trendVal > 0.01 ? "上升" : trendVal < -0.01 ? "下降" : "穩定";
    return { trend: trendVal, state };
  }
}
