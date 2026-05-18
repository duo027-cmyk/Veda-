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
    this.population = this.population.map(genome => {
      const newGenome = new Float32Array(newSize);
      newGenome.set(genome);
      for (let i = this.genomeSize; i < newSize; i++) newGenome[i] = Math.random();
      return newGenome;
    });
    this.genomeSize = newSize;
  }

  private initialize() {
    for (let i = 0; i < this.popSize; i++) {
      const genome = new Float32Array(this.genomeSize).map(() => Math.random());
      this.population.push(genome);
      this.scores.push(0);
    }
  }

  public evaluate(scoringFn: (genome: Float32Array) => number) {
    for (let i = 0; i < this.popSize; i++) {
      this.scores[i] = scoringFn(this.population[i]);
    }
  }

  private calculateConvergence(): number {
    if (this.scores.length < 2) return 1.0;
    const max = Math.max(...this.scores);
    const min = Math.min(...this.scores);
    return max === min ? 1.0 : 1 - (max - min) / (Math.abs(max) + 0.001);
  }

  private mutate(genome: Float32Array) {
    for (let i = 0; i < this.genomeSize; i++) {
      if (Math.random() < this.mutationRate) {
        genome[i] += (Math.random() - 0.5) * this.mutationStrength;
        genome[i] = Math.max(0, Math.min(1, genome[i]));
      }
    }
  }

  private crossover(p1: Float32Array, p2: Float32Array): Float32Array {
    const child = new Float32Array(this.genomeSize);
    const point = Math.floor(Math.random() * this.genomeSize);
    for (let i = 0; i < this.genomeSize; i++) {
      child[i] = i < point ? p1[i] : p2[i];
    }
    return child;
  }

  public evolve() {
    this.generation++;
    const indices = Array.from({ length: this.popSize }, (_, i) => i);
    indices.sort((a, b) => this.scores[b] - this.scores[a]);
    const elite = new Float32Array(this.population[indices[0]]);
    const topCount = Math.floor(this.popSize * 0.4);
    const survivors = indices.slice(0, topCount).map(i => this.population[i]);
    const convergence = this.calculateConvergence();
    this.mutationRate = 0.02 + (0.1 * (1 - convergence));
    this.mutationStrength = 0.05 + (0.2 * (1 - convergence));
    const newPopulation: Float32Array[] = [elite];
    while (newPopulation.length < this.popSize) {
      if (Math.random() < 0.4 && survivors.length >= 2) {
        const p1 = survivors[Math.floor(Math.random() * survivors.length)];
        const p2 = survivors[Math.floor(Math.random() * survivors.length)];
        const child = this.crossover(p1, p2);
        this.mutate(child);
        newPopulation.push(child);
      } else {
        const parent = survivors[Math.floor(Math.random() * survivors.length)];
        const child = new Float32Array(parent);
        this.mutate(child);
        newPopulation.push(child);
      }
    }
    this.population = newPopulation;
  }

  public getBest(): Float32Array {
    const indices = Array.from({ length: this.popSize }, (_, i) => i);
    indices.sort((a, b) => this.scores[b] - this.scores[a]);
    return this.population[indices[0]];
  }

  public getPopulationData() {
    return {
      generation: this.generation,
      avgScore: this.scores.reduce((a, b) => a + b, 0) / this.popSize,
      bestScore: Math.max(...this.scores),
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
