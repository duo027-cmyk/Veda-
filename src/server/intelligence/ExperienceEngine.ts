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

// ==========================================
// NEW: Sovereign Epistemic Monte Carlo Tree Search (MCTS) Rollout Engine
// Equips the native local model with explicit pre-commitment reasoning or "Thought Loop" capacities.
// ==========================================

export interface MCTSNode {
  nodeKey: string;
  parent: MCTSNode | null;
  children: Map<string, MCTSNode>;
  visits: number;
  value: number; // accumulated success metrics
  costToHere: number;
}

export function mctsEpistemicRollout(
  task: Task,
  experienceEngine: SovereignExperienceEngine,
  currentRound: number = 0,
  maxIterations: number = 40,
  explorationConstant: number = 1.414
): { bestPath: string[]; confidence: number; thoughts: string[] } {
  const root: MCTSNode = {
    nodeKey: task.start,
    parent: null,
    children: new Map(),
    visits: 1,
    value: 0.0,
    costToHere: 0.0,
  };

  const thoughts: string[] = [];
  thoughts.push(`[MCTS_REASON] Starting local epistemic rollout from root: ${task.start}`);

  const getHeuristic = (node: string) => heuristic(node, task.goal);

  for (let iter = 0; iter < maxIterations; iter++) {
    let curr = root;

    // 1. Selection & Traverse down the tree using UCB1 selection with Experience and Solomon priors
    while (curr.children.size > 0) {
      let selected: MCTSNode | null = null;
      let maxScore = -Infinity;

      for (const [childKey, childNode] of curr.children.entries()) {
        const ucb = childNode.value / (childNode.visits + 1e-6) + 
                    explorationConstant * Math.sqrt(Math.log(curr.visits) / (childNode.visits + 1e-6));

        // Inject sovereign spatial priority: closer to goal nodes get a bias multiplier
        const heuristicPrior = 1.0 / (1.0 + getHeuristic(childKey));
        
        // Inject experienced schema bias to boost or suppress the node prioritisation
        const edge = (task.graph[curr.nodeKey] || []).find(e => e.to === childKey);
        const expPrior = edge ? -experienceEngine.patternBias(edge.pattern, currentRound) * 0.1 : 0;

        const totalScore = ucb + heuristicPrior * 1.5 + expPrior;
        if (totalScore > maxScore) {
          maxScore = totalScore;
          selected = childNode;
        }
      }

      if (!selected) break;
      curr = selected;
    }

    // 2. Expansion
    if (curr.nodeKey !== task.goal && curr.visits > 0) {
      const edges = task.graph[curr.nodeKey] || [];
      for (const edge of edges) {
        if (!curr.children.has(edge.to)) {
          const childNode: MCTSNode = {
            nodeKey: edge.to,
            parent: curr,
            children: new Map(),
            visits: 0,
            value: 0.0,
            costToHere: curr.costToHere + edge.cost,
          };
          curr.children.set(edge.to, childNode);
        }
      }
    }

    // Select expansion branch for simulation
    let simNode = curr;
    if (curr.children.size > 0) {
      const childArray = Array.from(curr.children.values());
      simNode = childArray[Math.floor(Math.random() * childArray.length)];
    }

    // 3. Rollout Simulation (Simulate sequence of rapid steps towards goal using experienced action selection)
    let rolloutNode = simNode.nodeKey;
    let rolloutCost = simNode.costToHere;
    let rolledSteps = 0;
    const visitedInRollout = new Set<string>([rolloutNode]);

    while (rolloutNode !== task.goal && rolledSteps < 15) {
      const candidates = task.graph[rolloutNode] || [];
      if (candidates.length === 0) break;

      // Weighted selection based on heuristical proximity and schema optimization
      let bestCandidate = candidates[0];
      let bestUtility = -Infinity;

      for (const edge of candidates) {
        if (visitedInRollout.has(edge.to)) continue;
        const proximity = -heuristic(edge.to, task.goal);
        const schemaAdaptation = -experienceEngine.patternBias(edge.pattern, currentRound);
        const utility = proximity + schemaAdaptation * 0.8;
        if (utility > bestUtility) {
          bestUtility = utility;
          bestCandidate = edge;
        }
      }

      visitedInRollout.add(bestCandidate.to);
      rolloutNode = bestCandidate.to;
      rolloutCost += bestCandidate.cost;
      rolledSteps++;
    }

    // Evaluate simulated path success
    const distToGoal = heuristic(rolloutNode, task.goal);
    let reward = 0.0;
    if (distToGoal === 0) {
      // Direct hit! The reward is inversely proportional to the path cost
      reward = 2.0 / (1.0 + rolloutCost);
    } else {
      // Partial convergence: reward reflects distance reduction efficiency
      const startDist = heuristic(task.start, task.goal);
      reward = Math.max(0.0, (startDist - distToGoal) / (startDist + 1.0));
    }

    // 4. Backpropagation back to the root
    let backNode: MCTSNode | null = simNode;
    while (backNode) {
      backNode.visits++;
      backNode.value += reward;
      backNode = backNode.parent;
    }
  }

  // Extract best trajectory from tree structure
  const path: string[] = [task.start];
  let trace = root;
  const loopSafety = new Set<string>([task.start]);

  while (trace.children.size > 0) {
    let bestChild: MCTSNode | null = null;
    let maxVisits = -1;

    for (const childNode of trace.children.values()) {
      if (childNode.visits > maxVisits && !loopSafety.has(childNode.nodeKey)) {
        maxVisits = childNode.visits;
        bestChild = childNode;
      }
    }

    if (!bestChild || bestChild.visits === 0) break;
    path.push(bestChild.nodeKey);
    loopSafety.add(bestChild.nodeKey);
    trace = bestChild;

    if (bestChild.nodeKey === task.goal) break;
  }

  const confidence = Math.min(1.0, root.value / (root.visits + 1e-6));
  thoughts.push(`[MCTS_REASON] Completed ${maxIterations} rollouts. Target path identified (steps=${path.length}). Final convergence confidence: ${confidence.toFixed(4)}`);

  return {
    bestPath: path,
    confidence: Number(confidence.toFixed(4)),
    thoughts,
  };
}
