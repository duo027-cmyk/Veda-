import { HDCEngine } from "../engines";

export class SemanticSolomonEngine {
  private target: string | null;
  private population: string[] = [];
  private populationSize: number;
  private mutationRate: number;
  private retainTop: number;
  private charset: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
  private history: number[] = [];
  private isOpenEnded: boolean = false;

  constructor(target: string | null, populationSize: number = 50, mutationRate: number = 0.05, retainTop: number = 0.2) {
    this.target = target ? target.toUpperCase() : null;
    this.isOpenEnded = target === null;
    this.populationSize = populationSize;
    this.mutationRate = mutationRate;
    this.retainTop = retainTop;
    this.initialize();
  }

  private initialize() {
    const len = this.target ? this.target.length : 12;
    for (let i = 0; i < this.populationSize; i++) {
      this.population.push(this.randomString(len));
    }
  }

  private randomString(length: number): string {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += this.charset.charAt(Math.floor(Math.random() * this.charset.length));
    }
    return result;
  }

  private score(candidate: string): number {
    if (!this.isOpenEnded && this.target) {
      let score = 0;
      for (let i = 0; i < candidate.length; i++) {
        if (candidate[i] === this.target[i]) score++;
      }
      return score;
    } else {
      let score = 0;
      for (let i = 1; i < candidate.length; i++) {
        if (candidate.charCodeAt(i) === candidate.charCodeAt(i-1) + 1) score += 2;
        if (candidate[i] === candidate[i-1]) score -= 1;
      }
      return score;
    }
  }

  private mutate(s: string): string {
    let chars = s.split("");
    for (let i = 0; i < chars.length; i++) {
      if (Math.random() < this.mutationRate) {
        chars[i] = this.charset.charAt(Math.floor(Math.random() * this.charset.length));
      }
    }
    return chars.join("");
  }

  private crossover(p1: string, p2: string): string {
    const point = Math.floor(Math.random() * p1.length);
    return p1.substring(0, point) + p2.substring(point);
  }

  public evolveStep(): { best: string; score: number; converged: boolean } {
    const scored = this.population.map(ind => ({ score: this.score(ind), ind }));
    scored.sort((a, b) => b.score - a.score);

    const best = scored[0];
    this.history.push(best.score);

    if (best.ind === this.target) {
      return { best: best.ind, score: best.score, converged: true };
    }

    const retainLength = Math.floor(this.populationSize * this.retainTop);
    const parents = scored.slice(0, retainLength).map(s => s.ind);

    const children: string[] = [];
    while (children.length + parents.length < this.populationSize) {
      const p1 = parents[Math.floor(Math.random() * parents.length)];
      const p2 = parents[Math.floor(Math.random() * parents.length)];
      let child = this.crossover(p1, p2);
      child = this.mutate(child);
      children.push(child);
    }

    this.population = [...parents, ...children];
    return { best: best.ind, score: best.score, converged: false };
  }

  public getStatus() {
    return {
      target: this.target,
      history: this.history.slice(-20),
      currentBest: this.population[0] || ""
    };
  }
}
