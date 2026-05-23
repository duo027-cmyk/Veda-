/**
 * Language Encoder Unit - AGI Sovereign Core v8.6
 * 
 * Maps natural language directives into the system's shared intention space.
 * Protocol: Epistemic Grounding (認識論降維)
 */

export class LanguageEncoder {
  // Dimension of the intention space: 6 (matching SystemCoreState's indices or custom intent dimensions)
  private readonly dim = 6;

  // Semantic keyword mapping (weights for the 6 core dimensions)
  // Dimensions: [Energy, Stability, -Entropy, Intent_Align, Focus_A, Focus_B]
  private readonly vocabulary: Record<string, number[]> = {
    "goal": [0.1, 0.2, -0.4, 0.8, 0.1, 0.1],
    "avoid": [-0.2, 0.8, -0.6, 0.1, 0.1, 0.1],
    "cooperate": [0.3, 0.6, 0.1, 0.4, 0.2, 0.2],
    "compete": [0.8, -0.2, 0.4, 0.2, 0.4, 0.1],
    "explore": [0.6, -0.1, 0.5, 0.1, 0.8, 0.2],
    "stabilize": [0.1, 0.9, -0.8, 0.1, 0.1, 0.1],
    "evolve": [0.7, 0.3, 0.6, 0.4, 0.5, 0.5],
    "archive": [-0.4, 0.5, -0.3, 0.1, 0.1, 0.8],
    "entropy": [0.2, -0.5, 0.9, 0.0, 0.2, 0.2],
    "order": [0.1, 0.8, -0.9, 0.0, 0.1, 0.1]
  };

  /**
   * Encodes text into a normalized latent vector.
   */
  public encode(input: string): number[] {
    const text = String(input || "");
    const tokens = text.toLowerCase().split(/\W+/);
    let vector = new Array(this.dim).fill(0);
    let matches = 0;

    for (const token of tokens) {
      if (this.vocabulary[token]) {
        const weights = this.vocabulary[token];
        for (let i = 0; i < this.dim; i++) {
          vector[i] += weights[i];
        }
        matches++;
      }
    }

    if (matches === 0) {
      // Return neutral vector if no keywords match
      return [0.5, 0.5, 0.1, 0.1, 0.5, 0.5];
    }

    // Normalize and clamp to [0, 1] range
    return vector.map(v => Math.min(1, Math.max(0, 0.5 + v / matches)));
  }
}
