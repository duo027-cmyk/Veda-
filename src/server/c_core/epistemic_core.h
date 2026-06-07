/* src/server/c_core/epistemic_core.h */
/**
 * AGI Arch-Academic Protocol (卓越學術憲法)
 * Aerospace-Grade C-based Epistemic Active Sensing & Distillation Core (EPISTEMIC_CORE)
 * 
 * DESIGN SPECIFICATIONS:
 * 1. MISRA-C Compliance Focus: Strictly bounded loops, zero dynamic allocations, and static arrays.
 * 2. Cache Line Aligned flat structure layouts to optimize CPU-bound matrix & vector conversions.
 * 3. Incorporates 12-channel high-frequency micro-saccadic Active Sensing, 
 *    8-slot autonomic goal exploration trackers, and continuous entropic distillation bridges.
 */

#ifndef EPISTEMIC_CORE_H
#define EPISTEMIC_CORE_H

#include <stdint.h>
#include <stdbool.h>

#define SENSING_CHANNELS_COUNT 12
#define INTRINSIC_GOALS_LIMIT 8
#define BRIDGE_DIMENSION 6

/**
 * Autonomic Intrinsic Goal Entry
 */
typedef struct {
    uint32_t id_hash;                // Hash representation of Goal ID character buffer
    double priority;                 // Latent goal weight priority [0.0, 1.0]
    double progress;                 // Continuous self-learning progress [0.0, 1.0]
    bool active;                     // Active inference state flag
} autonomic_goal_t;

/**
 * Epistemic Foraging & Autonomic State Tracker block
 */
typedef struct {
    autonomic_goal_t goals[INTRINSIC_GOALS_LIMIT];
    double phase_stability;          // Epistemic phase coherence state metric
    int32_t goals_count;             // Active tracked goals count
    int32_t total_evolved_count;     // Monotonic goal level-up count
} epistemic_foraging_state_t;

/**
 * High-Frequency Active Sensing State Tracking Block
 */
typedef struct {
    double channels[SENSING_CHANNELS_COUNT]; // Continuous sensory trackers
    double acuity;                            // Dynamic search acuity width coeff
    double micro_saccade_phase;               // Rotating angular phase for boundary exploration
    int64_t total_saccade_ticks;              // Lifetime saccade pulse registers
} active_sensing_state_t;

/**
 * Symbolic Distillation Bridge Metric Tracker
 */
typedef struct {
    double distillation_entropy;              // Continuous Shannon-KL dissipative entropy loss [0-1]
    int64_t total_reconstruction_ops;         // Cumulative symbolic mapping iterations
    double reconstruction_purity;             // Real-time reverse structural fidelity indicator
} distillation_bridge_state_t;


/* C Core Export Interfaces */
#ifdef __cplusplus
extern "C" {
#endif

/* -- Epistemic Foraging & Autonomic Actions -- */
void epistemic_init_foraging(epistemic_foraging_state_t *state);
void epistemic_update_goals(epistemic_foraging_state_t *state, double surprise, double avg_surprise, bool is_diverging);
bool epistemic_trigger_phase_transition(epistemic_foraging_state_t *state, double avg_energy, double *out_before, double *out_after);

/* -- High-Frequency Active Sensing Actions -- */
void epistemic_init_sensing(active_sensing_state_t *state);
void epistemic_integrate_sensing(active_sensing_state_t *state, const double *action_three, double feedback, double entropy, double *out_jitter_x, double *out_jitter_y);

/* -- Symbolic Distillation Bridges -- */
void epistemic_init_bridge(distillation_bridge_state_t *state);
double epistemic_evaluate_distortion(distillation_bridge_state_t *state, const double *raw_coords, const double *mapped_coords, double *out_compensation_factor);

#ifdef __cplusplus
}
#endif

#endif /* EPISTEMIC_CORE_H */
