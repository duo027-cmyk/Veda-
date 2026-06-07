export class GeneticOptimizer {
  private population: Float32Array[] = [];
  private nextPopulation: Float32Array[] = [];
  private scores: Float32Array;
  private readonly popSize: number = 20;
  private genomeSize: number;
  private mutationRate: number = 0.08;
  private mutationStrength: number = 0.15;
  private generation: number = 0;

  constructor(genomeSize: number) {
    this.genomeSize = genomeSize;
    this.scores = new Float32Array(this.popSize);
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

    this.nextPopulation = this.nextPopulation.map(() => {
      return new Float32Array(validatedNewSize);
    });

    this.genomeSize = validatedNewSize;
  }

  private initialize() {
    this.population = [];
    this.nextPopulation = [];
    for (let i = 0; i < this.popSize; i++) {
      const genome = new Float32Array(this.genomeSize);
      const nextGenome = new Float32Array(this.genomeSize);
      for (let j = 0; j < this.genomeSize; j++) {
        genome[j] = Math.random();
        nextGenome[j] = 0;
      }
      this.population.push(genome);
      this.nextPopulation.push(nextGenome);
      this.scores[i] = 0;
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
    if (this.scores.length < 2) return 1.0;
    let max = -Infinity;
    let min = Infinity;
    for (let i = 0; i < this.popSize; i++) {
      const s = this.scores[i];
      if (s > max) max = s;
      if (s < min) min = s;
    }
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

  private crossover(p1: Float32Array, p2: Float32Array, outChild: Float32Array) {
    const point = Math.floor(Math.random() * this.genomeSize);
    if (point > 0) {
      outChild.set(p1.subarray(0, point), 0);
    }
    if (point < this.genomeSize) {
      outChild.set(p2.subarray(point), point);
    }
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
    const bestGenome = this.population[index0] || this.population[0];
    this.nextPopulation[0].set(bestGenome);

    const topCount = Math.max(1, Math.floor(this.popSize * 0.4));
    const survivors: Float32Array[] = [];
    for (let i = 0; i < topCount; i++) {
      const idx = indices[i];
      if (idx !== undefined && this.population[idx]) {
        survivors.push(this.population[idx]);
      }
    }

    if (survivors.length === 0) {
      survivors.push(this.nextPopulation[0]);
    }

    const convergence = this.calculateConvergence();
    const safeConvergence = Number.isFinite(convergence) ? Math.max(0, Math.min(1.0, convergence)) : 0.5;
    this.mutationRate = 0.02 + (0.1 * (1 - safeConvergence));
    this.mutationStrength = 0.05 + (0.2 * (1 - safeConvergence));

    let newCount = 1;
    while (newCount < this.popSize) {
      const child = this.nextPopulation[newCount];
      if (Math.random() < 0.4 && survivors.length >= 2) {
        const p1 = survivors[Math.floor(Math.random() * survivors.length)];
        const p2 = survivors[Math.floor(Math.random() * survivors.length)];
        this.crossover(p1, p2, child);
        this.mutate(child);
      } else {
        const parent = survivors[Math.floor(Math.random() * survivors.length)] || this.nextPopulation[0];
        child.set(parent);
        this.mutate(child);
      }
      newCount++;
    }

    // Swap buffers (zero memory allocation)
    const temp = this.population;
    this.population = this.nextPopulation;
    this.nextPopulation = temp;
  }

  public getBest(): Float32Array {
    const indices = Array.from({ length: this.popSize }, (_, i) => i);
    indices.sort((a, b) => {
      const scoreA = Number.isFinite(this.scores[a]) ? this.scores[a] : 0;
      const scoreB = Number.isFinite(this.scores[b]) ? this.scores[b] : 0;
      return scoreB - scoreA;
    });
    const index0 = indices[0] !== undefined ? indices[0] : 0;
    return this.population[index0] || this.population[0];
  }

  public getPopulationData() {
    let sum = 0;
    let best = -Infinity;
    for (let i = 0; i < this.popSize; i++) {
      const s = this.scores[i];
      sum += s;
      if (s > best) best = s;
    }
    const avg = sum / this.popSize;
    return {
      generation: this.generation,
      avgScore: Number((avg || 0).toFixed(5)),
      bestScore: Number((best === -Infinity ? 0 : best).toFixed(5)),
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
