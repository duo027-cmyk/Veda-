/**
 * CausalNexus - 因果樞紐
 * Manages weighted causal data with temporal decay.
 */
export class CausalNexus {
  private data = new Map<string, { v: any; w: number; t: number }>();
  private readonly DECAY = 0.998;

  public set(key: string, v: any, w: number = 1.0) {
    this.data.set(key, { v, w, t: Date.now() });
    if (this.data.size > 256) {
      const oldestKey = Array.from(this.data.keys())[0];
      this.data.delete(oldestKey);
    }
  }

  public get(key: string) {
    const node = this.data.get(key);
    if (!node) return null;
    return node.v;
  }

  public has(key: string) { return this.data.has(key); }
  public delete(key: string) { return this.data.delete(key); }
  public keys() { return this.data.keys(); }
  public entries() { return this.data.entries(); }
  get size() { return this.data.size; }

  [Symbol.iterator]() { return this.data.entries()[Symbol.iterator](); }

  public getWeightedEntropy() {
    let total = 0;
    this.data.forEach(n => {
      const age = (Date.now() - n.t) / 1000;
      total += n.w * Math.pow(this.DECAY, age);
    });
    return total;
  }
}
