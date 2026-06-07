/* src/server/c_core/epistemic_core.c */
#include "epistemic_core.h"
#include <math.h>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

/* Simple C standard pseudo-random number generator for self-contained execution */
static uint32_t epistemic_rand_seed = 314159265;
static double epistemic_quick_rand(void) {
    epistemic_rand_seed = (epistemic_rand_seed * 1103515245 + 12345) & 0x7FFFFFFF;
    return (double)epistemic_rand_seed / 2147483648.0;
}

/**
 * Initializes the Autonomic Foraging System Goals & Stability default values.
 * Models the original 4 sovereign intrinsic goals.
 */
void epistemic_init_foraging(epistemic_foraging_state_t *state) {
    if (!state) return;

    state->phase_stability = 0.85;
    state->goals_count = 4;
    state->total_evolved_count = 4;

    // GOAL 1: INT_GOAL_CAUSAL_EXPLORER (Causal flow complexity)
    state->goals[0].id_hash = 0xC101EEAA;
    state->goals[0].priority = 0.95;
    state->goals[0].progress = 0.35;
    state->goals[0].active = true;

    // GOAL 2: INT_GOAL_FALSIFY_VERIFY (Falsifiability engine parameter exploration)
    state->goals[1].id_hash = 0xFB2425FF;
    state->goals[1].priority = 0.88;
    state->goals[1].progress = 0.42;
    state->goals[1].active = true;

    // GOAL 3: INT_GOAL_NEUROMORPHIC_PRUNE (Synapse low power micro-saccadic pruning)
    state->goals[2].id_hash = 0xEE7DFF91;
    state->goals[2].priority = 0.82;
    state->goals[2].progress = 0.28;
    state->goals[2].active = true;

    // GOAL 4: INT_GOAL_SOVEREIGN_PHASE_TRANS (Sovereign field coherence adaptation)
    state->goals[3].id_hash = 0x50FFACCE;
    state->goals[3].priority = 0.99;
    state->goals[3].progress = 0.15;
    state->goals[3].active = true;

    // Fill remaining as inactive pre-allocated partitions
    for (int i = 4; i < INTRINSIC_GOALS_LIMIT; i++) {
        state->goals[i].id_hash = 0;
        state->goals[i].priority = 0.0;
        state->goals[i].progress = 0.0;
        state->goals[i].active = false;
    }
}

/**
 * Updates learning coefficients and evolves active intrinsic goals with self-healing feedback paths.
 */
void epistemic_update_goals(epistemic_foraging_state_t *state, double surprise, double avg_surprise, bool is_diverging) {
    if (!state) return;

    double learning_influence = 0.02 * (1.0 + surprise * 1.5);

    for (int i = 0; i < INTRINSIC_GOALS_LIMIT; i++) {
        if (!state->goals[i].active) continue;

        uint32_t h = state->goals[i].id_hash;
        double progress_increment = 0.0;

        if (h == 0xC101EEAA) { // CAUSAL EXPLORER
            progress_increment = learning_influence * (is_diverging ? 1.8 : 0.6);
        } else if (h == 0xFB2425FF) { // FALSIFY
            progress_increment = learning_influence * (surprise > 0.25 ? 1.2 : 0.4);
        } else if (h == 0xEE7DFF91) { // NEUROMORPHIC PRUNE
            progress_increment = learning_influence * 0.8;
        } else if (h == 0x50FFACCE) { // PHASE TRANS
            progress_increment = learning_influence * (avg_surprise < 0.1 ? 2.0 : 0.5);
        } else {
            // High surprise continuous evolver paths
            progress_increment = learning_influence * (0.5 + surprise * 0.5);
        }

        state->goals[i].progress += progress_increment;
        if (state->goals[i].progress > 1.0) {
            state->goals[i].progress = 1.0;
        }

        // Handle autonomic level-ups / self-regeneration if hitting convergence limit
        if (state->goals[i].progress >= 0.995) {
            if (epistemic_quick_rand() > 0.85) {
                state->goals[i].progress = 0.10;
                state->total_evolved_count++;
            }
        }
    }

    // Dynamic extraction of high-surprise intrinsic goals into pre-allocated slots
    if (surprise > 0.35 && state->goals_count < INTRINSIC_GOALS_LIMIT) {
        if (epistemic_quick_rand() > 0.85) {
            for (int i = 0; i < INTRINSIC_GOALS_LIMIT; i++) {
                if (!state->goals[i].active) {
                    state->goals[i].id_hash = 0xAA000000 | (uint32_t)(epistemic_quick_rand() * 16777215.0);
                    state->goals[i].priority = 0.7 + epistemic_quick_rand() * 0.3;
                    state->goals[i].progress = 0.05;
                    state->goals[i].active = true;
                    state->goals_count++;
                    break;
                }
            }
        }
    }
}

/**
 * Triggers autonomic global coherent phase state shifts depending on energy constraint conditions.
 */
bool epistemic_trigger_phase_transition(epistemic_foraging_state_t *state, double avg_energy, double *out_before, double *out_after) {
    if (!state) return false;

    double before = state->phase_stability;
    *out_before = before;

    bool success = (avg_energy < 0.3);
    if (success) {
        state->phase_stability += 0.03;
        if (state->phase_stability > 0.99) {
            state->phase_stability = 0.99;
        }
    } else {
        state->phase_stability -= 0.05;
        if (state->phase_stability < 0.60) {
            state->phase_stability = 0.60;
        }
    }

    *out_after = state->phase_stability;
    return success;
}

/**
 * Initializes the 12-channel physical active sensing parameters.
 */
void epistemic_init_sensing(active_sensing_state_t *state) {
    if (!state) return;

    for (int i = 0; i < SENSING_CHANNELS_COUNT; i++) {
        state->channels[i] = 0.0;
    }
    state->acuity = 0.95;
    state->micro_saccade_phase = 0.0;
    state->total_saccade_ticks = 0;
}

/**
 * High-Speed active physical-sensing phase integrator.
 * Generates spatial exploration jitter (micro-saccades) and folds physical dynamics into the 12 sensors.
 */
void epistemic_integrate_sensing(active_sensing_state_t *state, const double *action_three, double feedback, double entropy, double *out_jitter_x, double *out_jitter_y) {
    if (!state) return;

    state->micro_saccade_phase += 0.22;
    state->total_saccade_ticks++;

    double jitter_factor = 0.008 * (1.0 - state->acuity);
    *out_jitter_x = sin(state->micro_saccade_phase) * jitter_factor;
    *out_jitter_y = cos(state->micro_saccade_phase * 1.3) * jitter_factor;

    double multiplier = 1.0 - entropy;

    for (int i = 0; i < SENSING_CHANNELS_COUNT; i++) {
        double act_val = 0.0;
        if (action_three) {
            act_val = action_three[i % 3];
        }

        // Emulate 12-channel high-dimensional coupled phase inputs
        double raw_input = act_val * 0.6 + feedback * 0.45 + multiplier * 0.35 + sin(state->micro_saccade_phase + (double)i) * 0.15;
        
        // Tahn approximation for bounded sensor saturation [-1, 1]
        double saturated_val = raw_input;
        if (saturated_val > 2.0) saturated_val = 2.0;
        if (saturated_val < -2.0) saturated_val = -2.0;
        double sign = (saturated_val >= 0.0) ? 1.0 : -1.0;
        double abs_val = fabs(saturated_val);
        double tanh_approx = sign * (1.0 - exp(-2.0 * abs_val)) / (1.0 + exp(-2.0 * abs_val));

        state->channels[i] = state->channels[i] * 0.82 + tanh_approx * 0.18;
    }
}

/**
 * Initializes continuous symbolic-distillation mapping variables.
 */
void epistemic_init_bridge(distillation_bridge_state_t *state) {
    if (!state) return;

    state->distillation_entropy = 0.04;
    state->total_reconstruction_ops = 0;
    state->reconstruction_purity = 1.0;
}

/**
 * Evaluates and manages information loss (dissipative random entropy) in continuous symbolic transformations.
 * Approximates Kullback-Leibler distance and recommends feedback compensation strengths.
 */
double epistemic_evaluate_distortion(distillation_bridge_state_t *state, const double *raw_coords, const double *mapped_coords, double *out_compensation_factor) {
    if (!state || !raw_coords || !mapped_coords) return 0.0;

    double info_entropy_loss = 0.0;
    for (int i = 0; i < BRIDGE_DIMENSION; i++) {
        double diff = raw_coords[i] - (mapped_coords[i] - 0.5);
        info_entropy_loss += diff * diff;
    }

    state->distillation_entropy = state->distillation_entropy * 0.88 + info_entropy_loss * 0.12;
    state->total_reconstruction_ops++;
    state->reconstruction_purity = 1.0 - state->distillation_entropy * 0.45;

    if (state->reconstruction_purity < 0.0) {
        state->reconstruction_purity = 0.0;
    }

    double comp_out = 0.0;
    if (state->distillation_entropy > 0.06) {
        comp_out = state->distillation_entropy * 0.15;
    }

    *out_compensation_factor = comp_out;
    return state->distillation_entropy;
}
