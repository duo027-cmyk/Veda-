/* src/server/c_core/lattice_core.c */
#include "lattice_core.h"
#include <math.h>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

/* -- Sovereign Lattice Core Implementation -- */

void lattice_init(sovereign_lattice_state_t *state) {
    if (!state) return;

    state->coherence_debt = 0.0f;
    state->last_coherence = 0.0f;
    state->collapse_momentum = 0.0f;
    state->is_superconducting = false;
    state->is_planck_dilation_active = false;
    state->cache_pointer = 0;

    for (int i = 0; i < LATTICE_DIM; i++) {
        state->mirror_buffer_real[i] = 0.0f;
        state->mirror_buffer_imag[i] = 0.0f;
        state->buffer_real_a[i] = 0.0f;
        state->buffer_imag_a[i] = 0.0f;
        state->buffer_real_b[i] = 0.0f;
        state->buffer_imag_b[i] = 0.0f;
        state->immune_real[i] = 0.0f;
        state->immune_imag[i] = 0.0f;
    }

    for (int i = 0; i < LATTICE_CACHE_SIZE; i++) {
        state->cache[i].hash = 0;
        state->cache[i].coherence = 0.0f;
        state->cache[i].is_active = false;
    }
}

void lattice_execute_sanction(sovereign_lattice_state_t *state, const float *target_data) {
    if (!state || !target_data) return;

    for (int i = 0; i < LATTICE_DIM; i++) {
        float angle = fmodf(target_data[i] * (float)M_PI * 2.0f, (float)M_PI * 2.0f);
        float r = cosf(angle);
        float img = sinf(angle);

        state->immune_real[i] = (state->immune_real[i] * 0.5f) + (r * 0.5f);
        state->immune_imag[i] = (state->immune_imag[i] * 0.5f) + (img * 0.5f);
    }

    // Purge cache under sanction
    for (int i = 0; i < LATTICE_CACHE_SIZE; i++) {
        state->cache[i].is_active = false;
    }
}

float lattice_calculate_norm(const float *real, const float *imag) {
    if (!real || !imag) return 0.0f;
    float sum = 0.0f;
    for (int i = 0; i < LATTICE_DIM; i++) {
        sum += (real[i] * real[i]) + (imag[i] * imag[i]);
    }
    return sqrtf(sum);
}

void lattice_attract(const sovereign_lattice_state_t *state, const float *real, const float *imag, float *out_real, float *out_imag) {
    if (!state || !real || !imag || !out_real || !out_imag) return;

    float norm = lattice_calculate_norm(real, imag);
    if (norm < 1e-12f) {
        for (int i = 0; i < LATTICE_DIM; i++) {
            out_real[i] = real[i];
            out_imag[i] = imag[i];
        }
        return;
    }

    float target_scale = 2.0f / norm; // resonanceGap = 2.0
    float damping = state->is_superconducting ? 0.98f : 0.75f;
    float attractor_force = (target_scale - 1.0f) * damping;

    for (int i = 0; i < LATTICE_DIM; i++) {
        out_real[i] = real[i] * (1.0f + attractor_force);
        out_imag[i] = imag[i] * (1.0f + attractor_force);
    }
}

void lattice_apply_phase_shift(const float *real, const float *imag, float shift, float *out_real, float *out_imag) {
    if (!real || !imag || !out_real || !out_imag) return;

    float c = cosf(shift);
    float s = sinf(shift);

    for (int i = 0; i < LATTICE_DIM; i++) {
        out_real[i] = real[i] * c - imag[i] * s;
        out_imag[i] = imag[i] * c + real[i] * s;
    }
}

void lattice_apply_planck_mirror(sovereign_lattice_state_t *state, float *real, float *imag) {
    if (!state || !real || !imag) return;
    if (!state->is_planck_dilation_active) return;

    const float reflection_efficiency = 0.9999997f;

    for (int d = 0; d < MIRROR_DEPTH; d++) {
        for (int i = 0; i < LATTICE_DIM; i++) {
            float fold_r = real[i] * reflection_efficiency;
            real[i] = (real[i] * 0.1f) + (fold_r * 0.9f);
            imag[i] = (imag[i] * 0.1f) + (imag[i] * reflection_efficiency * 0.9f);
        }
    }
}

float lattice_heal_coherence(sovereign_lattice_state_t *state, float local_coherence) {
    if (!state) return local_coherence;

    const float target = 0.9999997f;
    if (local_coherence > target) return local_coherence;

    float deficit = target - local_coherence;
    const float debt_limit = 1000.0f;

    if (state->coherence_debt < debt_limit) {
        float borrow = deficit * 0.8f;
        state->coherence_debt += borrow;
        return local_coherence + borrow;
    }

    if (local_coherence > 0.999f) {
        float repayment = (local_coherence - 0.999f) * 0.1f;
        state->coherence_debt = state->coherence_debt - repayment;
        if (state->coherence_debt < 0.0f) state->coherence_debt = 0.0f;
    }

    return local_coherence;
}

void lattice_distill(sovereign_lattice_state_t *state, const float *input_real, const float *input_imag, float *out_real, float *out_imag, float *convergence) {
    if (!state || !input_real || !input_imag || !out_real || !out_imag || !convergence) return;

    // Buffer copies
    for (int i = 0; i < LATTICE_DIM; i++) {
        state->buffer_real_a[i] = input_real[i];
        state->buffer_imag_a[i] = input_imag[i];
    }

    lattice_apply_planck_mirror(state, state->buffer_real_a, state->buffer_imag_a);

    float delta = 1.0f;
    const int32_t max_iterations = state->is_planck_dilation_active ? 128 : 12;
    const float base_phase_step = state->is_planck_dilation_active ? 0.00005f : 0.001f;
    const float glide_threshold = state->is_superconducting ? 1e-12f : 1e-8f;
    const float base_freq = 432.0f;
    const float collapse_rate = 0.0001f;

    for (int i = 0; i < max_iterations; i++) {
        lattice_attract(state, state->buffer_real_a, state->buffer_imag_a, state->buffer_real_b, state->buffer_imag_b);

        if (state->collapse_momentum > 0.0f) {
            for (int j = 0; j < LATTICE_DIM; j += 64) {
                state->buffer_real_b[j] *= (1.0f + collapse_rate);
            }
        }

        float nerve_factor = delta * 15.0f;
        if (nerve_factor < 0.1f) nerve_factor = 0.1f;
        if (nerve_factor > 1.5f) nerve_factor = 1.5f;

        float adjusted_shift = base_freq * base_phase_step * nerve_factor;
        lattice_apply_phase_shift(state->buffer_real_b, state->buffer_imag_b, adjusted_shift, state->buffer_real_a, state->buffer_imag_a);

        float step_delta = 0.0f;
        // Vector-accelerable unrolled loop
        for (int j = 0; j < LATTICE_DIM; j += 4) {
            float d0 = state->buffer_real_a[j] - state->buffer_real_b[j];
            float d1 = state->buffer_real_a[j+1] - state->buffer_real_b[j+1];
            float d2 = state->buffer_real_a[j+2] - state->buffer_real_b[j+2];
            float d3 = state->buffer_real_a[j+3] - state->buffer_real_b[j+3];
            step_delta += (d0 * d0) + (d1 * d1) + (d2 * d2) + (d3 * d3);

            float i0 = state->buffer_imag_a[j] - state->buffer_imag_b[j];
            float i1 = state->buffer_imag_a[j+1] - state->buffer_imag_b[j+1];
            float i2 = state->buffer_imag_a[j+2] - state->buffer_imag_b[j+2];
            float i3 = state->buffer_imag_a[j+3] - state->buffer_imag_b[j+3];
            step_delta += (i0 * i0) + (i1 * i1) + (i2 * i2) + (i3 * i3);
        }

        step_delta = sqrtf(step_delta);
        delta = step_delta;

        if (step_delta < glide_threshold) break;
    }

    state->collapse_momentum = (state->collapse_momentum * 0.88f) + (delta * 0.12f);

    for (int i = 0; i < LATTICE_DIM; i++) {
        out_real[i] = state->buffer_real_a[i];
        out_imag[i] = state->buffer_imag_a[i];
    }
    *convergence = delta;
}

bool lattice_adjudicate(sovereign_lattice_state_t *state, const float *data, float *out_result, float *out_coherence, int32_t *status_code) {
    if (!state || !data || !out_result || !out_coherence || !status_code) return false;

    // Fast seed hash computation
    uint32_t hash = 0;
    for (int i = 0; i < LATTICE_DIM; i += 32) {
        hash = ((hash << 5) - hash) + (uint32_t)(data[i] * 1000.0f);
    }

    // Cache lookup
    for (int i = 0; i < LATTICE_CACHE_SIZE; i++) {
        if (state->cache[i].is_active && state->cache[i].hash == hash) {
            for (int j = 0; j < LATTICE_DIM; j++) {
                out_result[j] = (state->cache[i].real[j] + 1.0f) / 2.0f;
            }
            *out_coherence = lattice_heal_coherence(state, state->cache[i].coherence);
            *status_code = 200; // CACHE HIT
            return true;
        }
    }

    // Setup input coordinates
    float input_real[LATTICE_DIM];
    float input_imag[LATTICE_DIM];
    for (int i = 0; i < LATTICE_DIM; i++) {
        float angle = fmodf(data[i] * (float)M_PI * 2.0f, (float)M_PI * 2.0f);
        input_real[i] = cosf(angle);
        input_imag[i] = sinf(angle);
    }

    float norm = lattice_calculate_norm(input_real, input_imag);
    const float phi = 1.618f;
    if (norm > (float)LATTICE_DIM * phi || norm < (float)LATTICE_DIM / phi) {
        // Entropy transduction (reject input, damage immune response slightly)
        for (int i = 0; i < LATTICE_DIM; i++) {
            state->immune_real[i] = (state->immune_real[i] * 0.95f) + (-input_real[i] * 0.05f);
            state->immune_imag[i] = (state->immune_imag[i] * 0.95f) + (input_imag[i] * 0.05f);
            out_result[i] = data[i];
        }
        *out_coherence = 0.0f;
        *status_code = 403; // REJECTED_ENTROPY
        return true;
    }

    // Run active distillation on manifolds
    float distilled_real[LATTICE_DIM];
    float distilled_imag[LATTICE_DIM];
    float convergence = 0.0f;

    lattice_distill(state, input_real, input_imag, distilled_real, distilled_imag, &convergence);

    // Calculate overlap barrier
    float immune_overlap = 0.0f;
    for (int i = 0; i < LATTICE_DIM; i++) {
        immune_overlap += distilled_real[i] * state->immune_real[i] + distilled_imag[i] * state->immune_imag[i];
    }
    immune_overlap = fabsf(immune_overlap) / (float)LATTICE_DIM;

    if (immune_overlap > 0.85f) {
        for (int i = 0; i < LATTICE_DIM; i++) {
            out_result[i] = data[i];
        }
        *out_coherence = 0.0f;
        *status_code = 409; // IMMUNE_BLOCK
        return true;
    }

    // Successfully converged
    float avg_coherence = 0.0f;
    for (int i = 0; i < LATTICE_DIM; i++) {
        out_result[i] = (distilled_real[i] + 1.0f) / 2.0f;
        avg_coherence += sqrtf(distilled_real[i] * distilled_real[i] + distilled_imag[i] * distilled_imag[i]);
    }

    state->last_coherence = lattice_heal_coherence(state, avg_coherence / (float)LATTICE_DIM);

    // Dynamic cache eviction and placement
    int32_t c_idx = state->cache_pointer;
    state->cache[c_idx].hash = hash;
    state->cache[c_idx].coherence = state->last_coherence;
    state->cache[c_idx].is_active = true;
    for (int i = 0; i < LATTICE_DIM; i++) {
        state->cache[c_idx].real[i] = distilled_real[i];
        state->cache[c_idx].imag[i] = distilled_imag[i];
    }

    state->cache_pointer = (state->cache_pointer + 1) % LATTICE_CACHE_SIZE;

    *out_coherence = state->last_coherence;
    *status_code = (state->last_coherence > 0.999f) ? 201 : 202; // SOVEREIGN_EXECUTED vs PARTIAL_COLLAPSE
    return true;
}


/* -- Crystal Soul Core Implementation -- */

void soul_init(crystal_soul_state_t *state, const uint32_t *seeds) {
    if (!state) return;

    state->stability = 0.25f;
    
    // Default weights balance ratios
    state->ratios[0] = 0.35f; // honesty
    state->ratios[1] = 0.25f; // gentleness
    state->ratios[2] = 0.20f; // clarity
    state->ratios[3] = 0.12f; // integrity
    state->ratios[4] = 0.08f; // protection

    // Determine deterministic mineral vectors
    for (int m = 0; m < MINERAL_COUNT; m++) {
        uint32_t local_seed = seeds ? seeds[m] : (101 + m);
        for (int i = 0; i < SOUL_DIM; i++) {
            // Pseudorandom seed matching original TypeScript MineralSeed generator
            local_seed = (local_seed * 9301 + 49297) % 233280;
            float rng1 = (float)local_seed / 233280.0f;
            state->minerals[m].base_freq[i] = (rng1 - 0.5f) * 0.48f;

            local_seed = (local_seed * 9301 + 49297) % 233280;
            float rng2 = (float)local_seed / 233280.0f;
            state->minerals[m].perturbation[i] = (rng2 - 0.5f) * 0.07f;
        }
    }
}

void soul_softmax(const float *input, float *output, int32_t length) {
    if (!input || !output || length <= 0) return;

    float max_val = input[0];
    for (int i = 1; i < length; i++) {
        if (input[i] > max_val) {
            max_val = input[i];
        }
    }

    float sum = 0.0f;
    for (int i = 0; i < length; i++) {
        output[i] = expf(input[i] - max_val);
        sum += output[i];
    }

    for (int i = 0; i < length; i++) {
        output[i] /= (sum > 0.0f ? sum : 1.0f);
    }
}

float soul_cosine_similarity(const float *vec_a, const float *vec_b, int32_t length) {
    if (!vec_a || !vec_b || length <= 0) return 0.0f;

    float dot = 0.0f, magnitude_a = 0.0f, magnitude_b = 0.0f;
    for (int i = 0; i < length; i++) {
        dot += vec_a[i] * vec_b[i];
        magnitude_a += vec_a[i] * vec_a[i];
        magnitude_b += vec_b[i] * vec_b[i];
    }

    float denom = sqrtf(magnitude_a) * sqrtf(magnitude_b);
    return (denom < 1e-12f) ? 0.0f : (dot / denom);
}

void soul_process(crystal_soul_state_t *state, const float *input_vec, float *out_coherence, float *out_tension, int32_t *response_code) {
    if (!state || !input_vec || !out_coherence || !out_tension || !response_code) return;

    float weights[MINERAL_COUNT];
    soul_softmax(state->ratios, weights, MINERAL_COUNT);

    // Sum crystal current spectrum
    float current_freq[SOUL_DIM] = {0.0f};
    for (int m = 0; m < MINERAL_COUNT; m++) {
        for (int i = 0; i < SOUL_DIM; i++) {
            float f = state->minerals[m].base_freq[i] + 0.08f * state->minerals[m].perturbation[i];
            current_freq[i] += weights[m] * f;
        }
    }

    float base_similarity = soul_cosine_similarity(input_vec, current_freq, SOUL_DIM);
    
    // microVibrationFactor emulates micro time cycles
    float coherence = base_similarity * (0.5f + 0.5f * state->stability);

    // Analyze individual variance (tension)
    float similarities[MINERAL_COUNT];
    float sim_sum = 0.0f;
    for (int m = 0; m < MINERAL_COUNT; m++) {
        float f[SOUL_DIM];
        for (int i = 0; i < SOUL_DIM; i++) {
            f[i] = state->minerals[m].base_freq[i] + 0.08f * state->minerals[m].perturbation[i];
        }
        similarities[m] = soul_cosine_similarity(input_vec, f, SOUL_DIM);
        sim_sum += similarities[m];
    }

    float mean_sim = sim_sum / (float)MINERAL_COUNT;
    float variance_accum = 0.0f;
    for (int m = 0; m < MINERAL_COUNT; m++) {
        float diff = similarities[m] - mean_sim;
        variance_accum += diff * diff;
    }
    float tension = sqrtf(variance_accum / (float)MINERAL_COUNT);

    *out_coherence = coherence;
    *out_tension = tension;

    if (coherence > 0.43f && tension < 0.22f) {
        // Crystalline Solidification
        state->stability = state->stability + 0.042f * (1.1f - state->stability);
        if (state->stability > 1.0f) state->stability = 1.0f;
        *response_code = 100; // SOLIDIFIED (Accept & Deepen)
    } else if (coherence < 0.20f || tension > 0.36f) {
        // Crystalline Fracture
        state->stability = state->stability - 0.028f * (state->stability + 0.1f);
        if (state->stability < 0.12f) state->stability = 0.12f;
        *response_code = 101; // REFUSED (Reject direction)
    } else {
        // Internal fluctuation
        state->stability = state->stability - 0.012f;
        if (state->stability < 0.18f) state->stability = 0.18f;
        *response_code = 102; // STRUGGLE (Cognitive Dissonance)
    }

    // Static drift evolution 
    float adjust_rate = (coherence > 0.43f && tension < 0.22f) ? 0.012f : 0.018f;
    for (int m = 0; m < MINERAL_COUNT; m++) {
        // Static determinism offset drift
        uint32_t drift_seed = (uint32_t)(state->stability * 1000.0f) + m;
        drift_seed ^= drift_seed << 13;
        drift_seed ^= drift_seed >> 17;
        float offset = ((float)(drift_seed % 200) / 100.0f) - 1.0f; // [-1.0, 1.0]
        state->ratios[m] += offset * adjust_rate * 0.1f;
    }
    soul_softmax(state->ratios, state->ratios, MINERAL_COUNT);
}

void soul_apply_influence(crystal_soul_state_t *state, int32_t type_code, float resonance) {
    if (!state) return;

    float influence = 0.01f * resonance;
    if (type_code == 0) { // CORE_MEMORY
        state->ratios[3] += influence;
        state->ratios[2] += influence * 0.5f;
    } else if (type_code == 1) { // SYSTEM_REFLECTION
        state->ratios[2] += influence;
        state->ratios[0] += influence * 0.5f;
    } else if (type_code == 2) { // RESONANCE_FRAGMENT
        state->ratios[4] += influence;
        state->ratios[1] += influence * 0.5f;
    }

    soul_softmax(state->ratios, state->ratios, MINERAL_COUNT);
    state->stability = state->stability + 0.005f * resonance;
    if (state->stability > 1.0f) state->stability = 1.0f;
}
