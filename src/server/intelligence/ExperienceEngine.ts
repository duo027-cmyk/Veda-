// src/server/intelligence/ExperienceEngine.ts
import crypto from "crypto";

export interface ExperienceRecord {
  score: number;
  successCount: number;
  failureCount: number;
  avgCost: number;
  lastUsedRound: number;
}

export interface Edge {
  to: string; // coordinate key format "x,y"
  cost: number;
  entropy: number;
  pattern: string;
}

export interface Task {
  id: string;
  start: string;
  goal: string;
  graph: Record<string, Edge[]>;
  hiddenPattern: string;
}

export interface SearchResult {
  success: boolean;
  expandedNodesCount: number;
  pathCost: number;
  patterns: string[];
  path: string[];
}

export class SovereignExperienceEngine {
  public success: Map<string, ExperienceRecord> = new Map();
  public failure: Map<string, ExperienceRecord> = new Map();
  private decayK: number;

  constructor(decayK: number = 0.01) {
    this.decayK = decayK;
  }

  private decay(record: ExperienceRecord, currentRound: number): number {
    const age = Math.max(0, currentRound - record.lastUsedRound);
    return record.score * Math.exp(-this.decayK * age);
  }

  public patternBias(pattern: string, currentRound: number): number {
    const s = this.success.get(pattern);
    const f = this.failure.get(pattern);

    const successScore = s ? this.decay(s, currentRound) : 0.0;
    const failureScore = f ? this.decay(f, currentRound) : 0.0;

    // Prefers patterns with historically high success (negative bias reduces cost representation)
    // Avoids patterns with historically high failure (positive bias increases cost representation)
    return failureScore * 1.2 - successScore * 1.5;
  }

  public updateSuccess(pattern: string, pathCost: number, currentRound: number): void {
    let rec = this.success.get(pattern);
    if (!rec) {
      rec = { score: 1.0, successCount: 0, failureCount: 0, avgCost: 0.0, lastUsedRound: currentRound };
      this.success.set(pattern, rec);
    }
    rec.successCount++;
    rec.score += 1.0;
    rec.lastUsedRound = currentRound;

    if (rec.avgCost === 0.0) {
      rec.avgCost = pathCost;
    } else {
      rec.avgCost = rec.avgCost * 0.85 + pathCost * 0.15;
    }
  }

  public updateFailure(pattern: string, currentRound: number): void {
    let rec = this.failure.get(pattern);
    if (!rec) {
      rec = { score: 1.5, successCount: 0, failureCount: 0, avgCost: 0.0, lastUsedRound: currentRound };
      this.failure.set(pattern, rec);
    }
    rec.failureCount++;
    rec.score += 1.5;
    rec.lastUsedRound = currentRound;
  }

  public getStatus() {
    const successList = Array.from(this.success.entries()).map(([pattern, rec]) => ({
      pattern,
      score: rec.score,
      successCount: rec.successCount,
      avgCost: rec.avgCost,
    }));
    const failureList = Array.from(this.failure.entries()).map(([pattern, rec]) => ({
      pattern,
      score: rec.score,
      failureCount: rec.failureCount,
    }));
    return {
      successLatticeSize: this.success.size,
      failureLatticeSize: this.failure.size,
      successList: successList.sort((a, b) => b.score - a.score),
      failureList: failureList.sort((a, b) => b.score - a.score),
    };
  }
}

// Helper: Custom Seeded Multi-round Task Generator for Grid Navigation
export class UnifiedTaskGenerator {
  public static makeTask(
    seed: number,
    size: number = 12,
    noiseEdges: number = 40,
    patternPool: string[] = ["boundary", "mirror", "chain", "skip", "rotate"],
    forcePattern?: string
  ): Task {
    const rng = this.seededRandom(seed);
    const hiddenPattern = forcePattern || patternPool[Math.floor(rng() * patternPool.length)];

    const graph: Record<string, Edge[]> = {};
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        graph[`${x},${y}`] = [];
      }
    }

    const start = "0,0";
    const goal = `${size - 1},${size - 1}`;

    const addEdge = (from: string, to: string, cost: number, entropy: number, pattern: string) => {
      if (graph[from] && graph[to]) {
        graph[from].push({ to, cost, entropy, pattern });
      }
    };

    // Basic grid movement
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (x + 1 < size) {
          addEdge(`${x},${y}`, `${x + 1},${y}`, 1.0, 0.25, "plain");
        }
        if (y + 1 < size) {
          addEdge(`${x},${y}`, `${x},${y + 1}`, 1.0, 0.25, "plain");
        }
      }
    }

    // Hidden pattern short-cuts chain
    let currentX = 0;
    let currentY = 0;
    for (let i = 1; i < size; i++) {
      let nxtX = i;
      let nxtY = 0;

      if (hiddenPattern === "boundary") {
        nxtY = Math.min(size - 1, Math.floor(i / 2));
      } else if (hiddenPattern === "mirror") {
        nxtY = size - 1 - i >= 0 ? size - 1 - i : 0;
      } else if (hiddenPattern === "chain") {
        nxtY = i;
      } else if (hiddenPattern === "skip") {
        nxtY = Math.min(size - 1, i + 1);
      } else { // rotate
        nxtY = Math.min(size - 1, (i * 2) % size);
      }

      const fromKey = `${currentX},${currentY}`;
      const toKey = `${nxtX},${nxtY}`;
      addEdge(fromKey, toKey, 0.35, 0.10, hiddenPattern);
      currentX = nxtX;
      currentY = nxtY;
    }

    // Connect last checkpoint to the final goal node
    addEdge(`${currentX},${currentY}`, goal, 0.35, 0.10, hiddenPattern);

    // Injection of ambient structural noise & decoy traps
    const allCoordinates = Object.keys(graph);
    for (let i = 0; i < noiseEdges; i++) {
      const from = allCoordinates[Math.floor(rng() * allCoordinates.length)];
      const to = allCoordinates[Math.floor(rng() * allCoordinates.length)];
      if (from !== to) {
        const pattern = patternPool.concat(["trap", "noise"])[Math.floor(rng() * (patternPool.length + 2))];
        const cost = 0.2 + rng() * 3.3;
        const entropy = 0.4 + rng() * 0.6;
        addEdge(from, to, cost, entropy, pattern);
      }
    }

    return {
      id: `TASK_${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
      start,
      goal,
      graph,
      hiddenPattern,
    };
  }

  private static seededRandom(seed: number) {
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }
}

// Low-overhead Binary Min-Heap Priority Queue implementation for pathfinder
interface QueueItem {
  priority: number;
  node: string;
  cost: number;
  path: string[];
  patterns: string[];
}

class MinHeap {
  private data: QueueItem[] = [];

  public get size(): number {
    return this.data.length;
  }

  public push(item: QueueItem) {
    this.data.push(item);
    this.up(this.data.length - 1);
  }

  public pop(): QueueItem | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const bottom = this.data.pop();
    if (this.data.length > 0 && bottom !== undefined) {
      this.data[0] = bottom;
      this.down(0);
    }
    return top;
  }

  private up(i: number) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.data[i].priority >= this.data[p].priority) break;
      this.swap(i, p);
      i = p;
    }
  }

  private down(i: number) {
    const len = this.data.length;
    while (2 * i + 1 < len) {
      let left = 2 * i + 1;
      let right = left + 1;
      let best = left;
      if (right < len && this.data[right].priority < this.data[left].priority) {
        best = right;
      }
      if (this.data[i].priority <= this.data[best].priority) break;
      this.swap(i, best);
      i = best;
    }
  }

  private swap(i: number, j: number) {
    const temp = this.data[i];
    this.data[i] = this.data[j];
    this.data[j] = temp;
  }
}

export function heuristic(a: string, b: string): number {
  const [ax, ay] = a.split(",").map(Number);
  const [bx, by] = b.split(",").map(Number);
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

// Sovereign Transferable Experience Pathfinder
export function searchExperiencePath(
  task: Task,
  mode: "baseline" | "solomon_neap" | "experience",
  experienceEngine?: SovereignExperienceEngine,
  currentRound: number = 0,
  beamWidth: number | null = 8,
  noveltyThreshold: number = 0.45
): SearchResult {
  const openHeap = new MinHeap();
  const visited = new Set<string>();
  let expanded = 0;

  openHeap.push({
    priority: heuristic(task.start, task.goal),
    node: task.start,
    cost: 0.0,
    path: [task.start],
    patterns: [],
  });

  while (openHeap.size > 0) {
    const current = openHeap.pop()!;

    if (visited.has(current.node)) {
      continue;
    }

    visited.add(current.node);
    expanded++;

    if (current.node === task.goal) {
      return {
        success: true,
        expandedNodesCount: expanded,
        pathCost: Number(current.cost.toFixed(4)),
        patterns: current.patterns,
        path: current.path,
      };
    }

    let edges = task.graph[current.node] || [];

    // Optional directional/beam width optimization
    if (beamWidth !== null && edges.length > beamWidth) {
      edges = [...edges]
        .sort((a, b) => (a.cost + a.entropy) - (b.cost + b.entropy))
        .slice(0, beamWidth);
    }

    for (const edge of edges) {
      if (visited.has(edge.to)) continue;

      const g = current.cost + edge.cost;
      const h = heuristic(edge.to, task.goal);

      // Solomon Spacetime penalty: penalize moves directed away from the goal coordinate
      let solomonPenalty = 0.0;
      if (mode === "solomon_neap" || mode === "experience") {
        const oldDist = heuristic(current.node, task.goal);
        const newDist = heuristic(edge.to, task.goal);
        if (newDist > oldDist) {
          solomonPenalty = 2.0;
        }
      }

      // Adaptive NEAP Penalty: dynamic entropy-damping
      let neapPenalty = 0.0;
      if (mode === "solomon_neap" || mode === "experience") {
        const progress = heuristic(current.node, task.goal) - heuristic(edge.to, task.goal);
        if (progress >= 0) {
          neapPenalty = edge.entropy * 0.35;
        } else {
          neapPenalty = edge.entropy * 1.25;
        }
      }

      // Transferable Experience bias adaptation
      let expBias = 0.0;
      if (mode === "experience" && experienceEngine) {
        expBias = experienceEngine.patternBias(edge.pattern, currentRound);

        // Novelty adaptation: cushion the bias if the strength falls below noveltyThreshold
        if (Math.abs(expBias) < noveltyThreshold) {
          expBias *= 0.35;
        }
      }

      const priority = g + h + solomonPenalty + neapPenalty + expBias;

      openHeap.push({
        priority,
        node: edge.to,
        cost: g,
        path: [...current.path, edge.to],
        patterns: [...current.patterns, edge.pattern],
      });
    }
  }

  return {
    success: false,
    expandedNodesCount: expanded,
    pathCost: Infinity,
    patterns: [],
    path: [],
  };
}

export function extractDominantPattern(patterns: string[]): string | null {
  if (patterns.length === 0) return null;
  const counts: Record<string, number> = {};
  for (const p of patterns) {
    counts[p] = (counts[p] || 0) + 1;
  }
  let bestPattern: string | null = null;
  let maxCount = -1;
  for (const [p, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      bestPattern = p;
    }
  }
  return bestPattern;
}
