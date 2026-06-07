/* src/server/c_core/pinc_core.h */
/**
 * AGI Arch-Academic Protocol (卓越學術憲法)
 * Aerospace-Grade C-based Neuromorphic Computing Core (PINC_CORE)
 * 
 * DESIGN SPECIFICATIONS:
 * 1. MISRA-C Compliance Focus: No recursion, no dynamic allocations (malloc/free).
 * 2. Static Memory Bounds: Fully deterministic flat data layouts to prevent page faults in RTOS.
 * 3. Cache Line Aligned Aligned structures for high-performance memory bandwidth.
 */

#ifndef PINC_CORE_H
#define PINC_CORE_H

#include <stdint.h>
#include <stdbool.h>

#define PINC_NEURON_COUNT 12
#define PINC_SYNAPSE_COUNT 14

/**
 * Enumerated Cognitive Neural Identifiers mapping string IDs to zero-overhead indexes
 */
typedef enum {
    PINC_IN_SENSORY_FLOW = 0,
    PINC_IN_SEMANTIC_PULSE = 1,
    PINC_WS_ENTITIES = 2,
    PINC_WS_CAUSAL_LAWS = 3,
    PINC_ED_CHANGE_DETECT = 4,
    PINC_ED_LOCAL_RESOLVE = 5,
    PINC_CR_CAUSAL_GRAPH = 6,
    PINC_CR_COUNTERFACT_SIM = 7,
    PINC_CC_ATTENTION_GATE = 8,
    PINC_CC_WORKING_MEM = 9,
    PINC_ME_CONSOLIDATION = 10,
    PINC_ME_CONSIST_CHECK = 11
} pinc_neuron_idx_t;

/**
 * Individual Neuromorphic Unit State Block
 */
typedef struct {
    int32_t id;                       // Unique integer identifier (pinc_neuron_idx_t)
    double potential;                 // Membrane Potential V(t)
    double threshold;                 // V_threshold boundary
    double rest_potential;            // Base V_rest potential
    double reset_potential;           // V_reset potential
    double membrane_tau;              // Leak speed denominator
    int32_t refractory_ticks_left;   // Remaining frames in refractory lockdown
    int32_t spike_count;              // Monotonic spike emission counter
    int32_t last_spike_time;          // Time stamp (ticks) of previous spike event
} pinc_neuron_t;

/**
 * Synaptic Connection State Coupling Block
 */
typedef struct {
    int32_t pre_id;                   // Pre-synaptic neuron index
    int32_t post_id;                  // Post-synaptic neuron index
    double weight;                    // Dynamic connection strength [0.1, 1.5]
    double last_stdp_delta;           // Plasticity correction metric from last STDP epoch
} pinc_synapse_t;

/**
 * Global Consolidated State Machine Block for PINC Core
 */
typedef struct {
    pinc_neuron_t neurons[PINC_NEURON_COUNT];
    pinc_synapse_t synapses[PINC_SYNAPSE_COUNT];
    int64_t current_time_ticks;
    int32_t refractory_period_ticks;
    double stdp_tau_plus;
    double stdp_tau_minus;
    double stdp_a_plus;
    double stdp_a_minus;
    int64_t raw_dense_operations_count;
    int64_t total_operations_saved_count;
} pinc_core_state_t;

/* Public Core API */
#ifdef __cplusplus
extern "C" {
#endif

void pinc_core_init(pinc_core_state_t *state);
void pinc_core_inject_current(pinc_core_state_t *state, int32_t neuron_id, double amplitude);
void pinc_core_tick(pinc_core_state_t *state, double free_energy, double entropy);
void pinc_core_process_semantic_impulse(pinc_core_state_t *state, int32_t text_length, double tension);

#ifdef __cplusplus
}
#endif

#endif /* PINC_CORE_H */
