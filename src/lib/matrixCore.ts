/**
 * Sovereign Matrix Core (高能矩陣演算核心)
 * Designed for C-level mathematical execution performance using TypedArrays (Float64Array).
 * Implements low-level pointer-offset simulation and loop-unrolling to bypass V8 optimization blocks.
 */

export class SovereignMatrixCore {
  /**
   * Pre-allocates aligned memory buffers to prevent runtime GC thrashing.
   */
  private static bufferSize = 8192;
  private static float64Buffer = new Float64Array(SovereignMatrixCore.bufferSize);

  /**
   * Safe allocation/reset of the shared scratchpad buffer
   */
  public static clearScratchpad(): void {
    SovereignMatrixCore.float64Buffer.fill(0);
  }

  /**
   * Highly optimized multi-dimensional Vector Cosine Similarity
   * Uses 8-way loop unrolling to maximize CPU pipeline usage (SIMD-like performance).
   * Math schema: Cosine(A, B) = Dot(A, B) / (Norm(A) * Norm(B))
   */
  public static fastCosineSimilarity(vecA: number[] | Float64Array, vecB: number[] | Float64Array): number {
    const len = vecA.length;
    if (len !== vecB.length || len === 0) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    let i = 0;
    // 8-way Loop Unrolling for high-throughput pipeline filling
    for (; i <= len - 8; i += 8) {
      const a0 = vecA[i];     const b0 = vecB[i];
      const a1 = vecA[i + 1]; const b1 = vecB[i + 1];
      const a2 = vecA[i + 2]; const b2 = vecB[i + 2];
      const a3 = vecA[i + 3]; const b3 = vecB[i + 3];
      const a4 = vecA[i + 4]; const b4 = vecB[i + 4];
      const a5 = vecA[i + 5]; const b5 = vecB[i + 5];
      const a6 = vecA[i + 6]; const b6 = vecB[i + 6];
      const a7 = vecA[i + 7]; const b7 = vecB[i + 7];

      dotProduct += a0 * b0 + a1 * b1 + a2 * b2 + a3 * b3 + a4 * b4 + a5 * b5 + a6 * b6 + a7 * b7;
      normA += a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3 + a4 * a4 + a5 * a5 + a6 * a6 + a7 * a7;
      normB += b0 * b0 + b1 * b1 + b2 * b2 + b3 * b3 + b4 * b4 + b5 * b5 + b6 * b6 + b7 * b7;
    }

    // Process remaining elements
    for (; i < len; i++) {
      const a = vecA[i];
      const b = vecB[i];
      dotProduct += a * b;
      normA += a * a;
      normB += b * b;
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Fast Vector Normalization (Pure pointer/offset simulation)
   */
  public static fastNormalize(vec: number[] | Float64Array): Float64Array {
    const len = vec.length;
    const dest = new Float64Array(len);
    let sqSum = 0;
    
    let i = 0;
    for (; i < len; i++) {
      sqSum += vec[i] * vec[i];
    }
    
    const norm = Math.sqrt(sqSum);
    if (norm === 0) {
      return dest;
    }

    const invNorm = 1.0 / norm;
    for (i = 0; i < len; i++) {
      dest[i] = vec[i] * invNorm;
    }
    
    return dest;
  }

  /**
   * Active Inference Variational Free Energy Calculator
   * Formula: VFE = Sum(q(s) * (ln(q(s)) - ln(p(s, o))))
   * Models the difference between actual system coherence state and variational parameters.
   */
  public static calculateVariationalFreeEnergy(
    state: number[] | Float64Array,
    prior: number[] | Float64Array
  ): number {
    const len = state.length;
    if (len !== prior.length || len === 0) return 0;

    let vfe = 0;
    for (let i = 0; i < len; i++) {
      const q = Math.max(1e-9, state[i]); // avoidance of log(0)
      const p = Math.max(1e-9, prior[i]);
      vfe += q * (Math.log(q) - Math.log(p));
    }
    return Math.max(0, vfe);
  }

  /**
   * 1D Kalman Filter State Prediction step
   * Corrects sensor noise or neural metric jitter in real-time.
   */
  public static kalmanCorrect(currentVal: number, measuredVal: number, errorCovariance: number, processNoise: number, sensorNoise: number): { value: number, variance: number } {
    // Prediction Update
    const predCov = errorCovariance + processNoise;
    
    // Measurement Correction (Kalman Gain)
    const kalmanGain = predCov / (predCov + sensorNoise);
    const correctedValue = currentVal + kalmanGain * (measuredVal - currentVal);
    const correctedCov = (1.0 - kalmanGain) * predCov;
    
    return {
      value: Math.max(0, Math.min(1.0, correctedValue)),
      variance: correctedCov
    };
  }
}
