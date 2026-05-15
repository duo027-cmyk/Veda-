import { MemoryFragment } from './types';

export class NeuralNetwork {
  size: number = 19;
  grid: number[][];
  memories: Map<string, MemoryFragment>;
  memoryPositions: Map<string, { i: number; j: number }>;

  constructor() {
    this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    this.memories = new Map();
    this.memoryPositions = new Map();
  }

  getHexNeighbors(i: number, j: number): [number, number][] {
    const directions: [number, number][] = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [j % 2 === 0 ? -1 : 1, -1],
      [j % 2 === 0 ? -1 : 1, 1]
    ];
    const neighbors: [number, number][] = [];
    for (const [di, dj] of directions) {
      const ni = i + di;
      const nj = j + dj;
      if (ni >= 0 && ni < this.size && nj >= 0 && nj < this.size) {
        neighbors.push([ni, nj]);
      }
    }
    return neighbors;
  }

  insertMemory(memory: MemoryFragment) {
    const i = Math.floor(Math.random() * this.size);
    const j = Math.floor(Math.random() * this.size);
    this.memories.set(memory.id, memory);
    this.memoryPositions.set(memory.id, { i, j });
    this.grid[i][j] = 1.0;
  }

  propagate(steps: number = 5) {
    for (let s = 0; s < steps; s++) {
      const newGrid = this.grid.map(row => [...row]);
      
      for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
          const neighbors = this.getHexNeighbors(i, j);
          if (neighbors.length > 0) {
            const avg = neighbors.reduce((sum, [ni, nj]) => sum + this.grid[ni][nj], 0) / neighbors.length;
            
            // Knowledge propagation algorithm (simplified heat conduction)
            // 70% stability, 30% absorption of neighboring energy
            newGrid[i][j] = 0.7 * this.grid[i][j] + 0.3 * avg;
          }
        }
      }
      this.grid = newGrid;
    }
  }

  getCoherence(): number {
    let sum = 0;
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        sum += this.grid[i][j];
      }
    }
    return (sum / (this.size * this.size)) * 100;
  }

  getEntropy(): number {
    // Simplified entropy based on grid variance
    let sum = 0;
    const mean = this.getCoherence() / 100;
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        sum += Math.pow(this.grid[i][j] - mean, 2);
      }
    }
    return sum / (this.size * this.size);
  }
}
