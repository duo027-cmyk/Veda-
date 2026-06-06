export class GeneticOptimizer {
  private population: Float32Array[] = [];
  private scores: number[] = [];
  private readonly popSize: number = 20;
  private genomeSize: number;
  private mutationRate: number = 0.08;
  private mutationStrength: number = 0.15;
  private generation: number = 0;

  constructor(genomeSize: number) {
    this.genomeSize = genomeSize;
    this.initialize();
  }

  public expandDimensions(newSize: number) {
    const validatedNewSize = typeof newSize === "number" && Number.isFinite(newSize) ? Math.floor(newSize) : this.genomeSize;
    if (validatedNewSize <= this.genomeSize) return;

    this.population = this.population.map(genome => {
      const newGenome = new Float32Array(validatedNewSize);
      newGenome.set(genome);
      for (let i = this.genomeSize; i < validatedNewSize; i++) {
        newGenome[i] = Math.random();
      }
      return newGenome;
    });
    this.genomeSize = validatedNewSize;
  }

  private initialize() {
    this.scores = [];
    for (let i = 0; i < this.popSize; i++) {
      const genome = new Float32Array(this.genomeSize).map(() => Math.random());
      this.population.push(genome);
      this.scores.push(0);
    }
  }

  public evaluate(scoringFn: (genome: Float32Array) => number) {
    const defaultScoring = (g: Float32Array) => 0;
    const safeScoringFn = typeof scoringFn === "function" ? scoringFn : defaultScoring;

    for (let i = 0; i < this.popSize; i++) {
      try {
        const score = safeScoringFn(this.population[i]);
        this.scores[i] = Number.isFinite(score) ? score : 0;
      } catch (err) {
        console.error(`[GeneticOptimizer_EVALUATE_FAULT] Population genome ${i} failed evaluation:`, err);
        this.scores[i] = 0;
      }
    }
  }

  private calculateConvergence(): number {
    const safeScores = this.scores.map(s => Number.isFinite(s) ? s : 0);
    if (safeScores.length < 2) return 1.0;
    const max = Math.max(...safeScores);
    const min = Math.min(...safeScores);
    const maxAbs = Math.abs(max);
    const denominator = (Number.isFinite(maxAbs) ? maxAbs : 0) + 0.001;
    return max === min ? 1.0 : 1 - (max - min) / denominator;
  }

  private mutate(genome: Float32Array) {
    if (!(genome instanceof Float32Array)) return;
    for (let i = 0; i < this.genomeSize; i++) {
      if (Math.random() < this.mutationRate) {
        genome[i] += (Math.random() - 0.5) * this.mutationStrength;
        genome[i] = Math.max(0, Math.min(1, genome[i]));
      }
    }
  }

  private crossover(p1: Float32Array, p2: Float32Array): Float32Array {
    const child = new Float32Array(this.genomeSize);
    const safeP1 = p1 instanceof Float32Array && p1.length >= this.genomeSize ? p1 : new Float32Array(this.genomeSize).map(() => Math.random());
    const safeP2 = p2 instanceof Float32Array && p2.length >= this.genomeSize ? p2 : new Float32Array(this.genomeSize).map(() => Math.random());
    
    const point = Math.floor(Math.random() * this.genomeSize);
    if (point > 0) {
      child.set(safeP1.subarray(0, point), 0);
    }
    if (point < this.genomeSize) {
      child.set(safeP2.subarray(point), point);
    }
    return child;
  }

  public evolve() {
    this.generation++;
    const indices = Array.from({ length: this.popSize }, (_, i) => i);
    indices.sort((a, b) => {
      const scoreA = Number.isFinite(this.scores[a]) ? this.scores[a] : 0;
      const scoreB = Number.isFinite(this.scores[b]) ? this.scores[b] : 0;
      return scoreB - scoreA;
    });

    const index0 = indices[0] !== undefined ? indices[0] : 0;
    const bestGenome = this.population[index0] || new Float32Array(this.genomeSize).map(() => Math.random());
    const elite = new Float32Array(bestGenome);

    const topCount = Math.max(1, Math.floor(this.popSize * 0.4));
    const survivors = indices.slice(0, topCount)
      .map(i => this.population[i])
      .filter(genome => genome instanceof Float32Array);

    if (survivors.length === 0) {
      survivors.push(elite);
    }

    const convergence = this.calculateConvergence();
    const safeConvergence = Number.isFinite(convergence) ? Math.max(0, Math.min(1.0, convergence)) : 0.5;
    this.mutationRate = 0.02 + (0.1 * (1 - safeConvergence));
    this.mutationStrength = 0.05 + (0.2 * (1 - safeConvergence));
    const newPopulation: Float32Array[] = [elite];
    while (newPopulation.length < this.popSize) {
      if (Math.random() < 0.4 && survivors.length >= 2) {
        const p1 = survivors[Math.floor(Math.random() * survivors.length)];
        const p2 = survivors[Math.floor(Math.random() * survivors.length)];
        const child = this.crossover(p1, p2);
        this.mutate(child);
        newPopulation.push(child);
      } else {
        const parent = survivors[Math.floor(Math.random() * survivors.length)] || elite;
        const child = new Float32Array(parent);
        this.mutate(child);
        newPopulation.push(child);
      }
    }
    this.population = newPopulation;
  }

  public getBest(): Float32Array {
    const indices = Array.from({ length: this.popSize }, (_, i) => i);
    indices.sort((a, b) => {
      const scoreA = Number.isFinite(this.scores[a]) ? this.scores[a] : 0;
      const scoreB = Number.isFinite(this.scores[b]) ? this.scores[b] : 0;
      return scoreB - scoreA;
    });
    const index0 = indices[0] !== undefined ? indices[0] : 0;
    return this.population[index0] || new Float32Array(this.genomeSize);
  }

  public getPopulationData() {
    const safeScores = this.scores.map(s => Number.isFinite(s) ? s : 0);
    const avg = safeScores.length > 0 ? safeScores.reduce((a, b) => a + b, 0) / this.popSize : 0;
    const best = safeScores.length > 0 ? Math.max(...safeScores) : 0;
    return {
      generation: this.generation,
      avgScore: Number((avg || 0).toFixed(5)),
      bestScore: Number((best || 0).toFixed(5)),
      convergence: this.calculateConvergence(),
      mutationRate: this.mutationRate,
      mutationStrength: this.mutationStrength
    };
  }

  public updateArchitecturalParameters(params: { mutationRate?: number, mutationStrength?: number }) {
    if (params.mutationRate !== undefined) this.mutationRate = Math.max(0.01, Math.min(0.5, params.mutationRate));
    if (params.mutationStrength !== undefined) this.mutationStrength = Math.max(0.01, Math.min(0.5, params.mutationStrength));
  }
}
