/* src/server/c_core/pinc_core.c */
#include "pinc_core.h"
#include <math.h>

/**
 * Fast approximation of exp() for extreme low-overhead environments 
 * or when standard library overhead must be minimized.
 * We'll use standard exp() here but safely protect against NaN/Inf values.
 */
static inline double safe_exp(double x) {
    if (x > 700.0) return 1e300; // Protection against overflow
    if (x < -700.0) return 0.0;  // Protection against underflow / denormals
    return exp(x);
}

/**
 * Circular Spike Propagation Queue to avoid recursive execution (MISRA-C Compliance).
 * Bounded to prevent heap/stack bloating.
 */
#define QUEUE_BOUND 128
typedef struct {
    int32_t data[QUEUE_BOUND];
    int32_t head;
    int32_t tail;
    int32_t count;
} pinc_queue_t;

static inline void queue_init(pinc_queue_t *q) {
    q->head = 0;
    q->tail = 0;
    q->count = 0;
}

static inline bool queue_push(pinc_queue_t *q, int32_t val) {
    if (q->count >= QUEUE_BOUND) {
        return false; // Queue full
    }
    q->data[q->tail] = val;
    q->tail = (q->tail + 1) % QUEUE_BOUND;
    q->count++;
    return true;
}

static inline int32_t queue_pop(pinc_queue_t *q) {
    if (q->count <= 0) {
        return -1;
    }
    int32_t val = q->data[q->head];
    q->head = (q->head + 1) % QUEUE_BOUND;
    q->count--;
    return val;
}

/**
 * Initializes the entire Neuromorphic array matrix deterministically.
 */
void pinc_core_init(pinc_core_state_t *state) {
    if (!state) return;

    state->current_time_ticks = 0;
    state->refractory_period_ticks = 3;
    state->stdp_tau_plus = 5.0;
    state->stdp_tau_minus = 7.0;
    state->stdp_a_plus = 0.08;
    state->stdp_a_minus = 0.05;
    state->raw_dense_operations_count = 0;
    state->total_operations_saved_count = 0;

    // Define Neurons with zero-overhead initial states
    for (int i = 0; i < PINC_NEURON_COUNT; i++) {
        state->neurons[i].id = i;
        state->neurons[i].potential = 0.0;
        state->neurons[i].threshold = 1.0;
        state->neurons[i].rest_potential = 0.0;
        state->neurons[i].reset_potential = 0.0;
        state->neurons[i].membrane_tau = 10.0;
        state->neurons[i].refractory_ticks_left = 0;
        state->neurons[i].spike_count = 0;
        state->neurons[i].last_spike_time = -100;
    }

    // Static Synaptic Connectivity Blueprint (14 Sovereign pathways)
    pinc_synapse_t blueprint[PINC_SYNAPSE_COUNT] = {
        {PINC_IN_SENSORY_FLOW, PINC_ED_CHANGE_DETECT, 0.6, 0.0},
        {PINC_IN_SEMANTIC_PULSE, PINC_ED_LOCAL_RESOLVE, 0.5, 0.0},
        {PINC_ED_CHANGE_DETECT, PINC_ED_LOCAL_RESOLVE, 0.7, 0.0},
        {PINC_ED_LOCAL_RESOLVE, PINC_WS_ENTITIES, 0.5, 0.0},
        {PINC_ED_LOCAL_RESOLVE, PINC_CC_ATTENTION_GATE, 0.8, 0.0},
        {PINC_CC_ATTENTION_GATE, PINC_CC_WORKING_MEM, 0.75, 0.0},
        {PINC_CC_WORKING_MEM, PINC_CR_CAUSAL_GRAPH, 0.65, 0.0},
        {PINC_CR_CAUSAL_GRAPH, PINC_CR_COUNTERFACT_SIM, 0.82, 0.0},
        {PINC_CR_COUNTERFACT_SIM, PINC_WS_CAUSAL_LAWS, 0.6, 0.0},
        {PINC_WS_ENTITIES, PINC_ME_CONSOLIDATION, 0.55, 0.0},
        {PINC_WS_CAUSAL_LAWS, PINC_ME_CONSIST_CHECK, 0.7, 0.0},
        {PINC_ME_CONSOLIDATION, PINC_ME_CONSIST_CHECK, 0.45, 0.0},
        {PINC_ME_CONSIST_CHECK, PINC_CC_ATTENTION_GATE, 0.5, 0.0},
        {PINC_CR_CAUSAL_GRAPH, PINC_ME_CONSOLIDATION, 0.6, 0.0}
    };

    for (int i = 0; i < PINC_SYNAPSE_COUNT; i++) {
        state->synapses[i] = blueprint[i];
    }
}

/**
 * Fires a virtual neuron, resetting potentials, propagating charges and triggering STDP rules.
 * Handled via a robust worst-case-execution bounded loop instead of recursive calls.
 */
static void execute_firing_cascade(pinc_core_state_t *state, int32_t trigger_neuron_id) {
    pinc_queue_t fire_queue;
    queue_init(&fire_queue);
    
    if (!queue_push(&fire_queue, trigger_neuron_id)) {
        return;
    }

    int32_t iterations_guard = 0;
    // WCET Boundary Guard (Max 128 spikes per simulation cycle to safeguard deterministic processing)
    while (fire_queue.count > 0 && iterations_guard < 128) {
        iterations_guard++;
        int32_t neuron_id = queue_pop(&fire_queue);
        if (neuron_id < 0 || neuron_id >= PINC_NEURON_COUNT) continue;

        pinc_neuron_t *neuron = &state->neurons[neuron_id];

        // Reset potential, activate refractory lock
        neuron->potential = neuron->reset_potential;
        neuron->refractory_ticks_left = state->refractory_period_ticks;
        neuron->spike_count++;
        neuron->last_spike_time = (int32_t)state->current_time_ticks;

        // Propagate signals across synaptic lines
        for (int i = 0; i < PINC_SYNAPSE_COUNT; i++) {
            pinc_synapse_t *syn = &state->synapses[i];

            // Scenario 1: Spiking neuron is the POST-synaptic target.
            // Check pre-synaptic temporal alignment for STDP Causal reinforcement.
            if (syn->post_id == neuron_id) {
                pinc_neuron_t *pre_neuron = &state->neurons[syn->pre_id];
                if (pre_neuron->last_spike_time >= 0) {
                    int32_t delta_t = (int32_t)state->current_time_ticks - pre_neuron->last_spike_time;
                    if (delta_t > 0 && delta_t <= 15) {
                        double delta_w = state->stdp_a_plus * safe_exp(-(double)delta_t / state->stdp_tau_plus);
                        syn->weight += delta_w;
                        if (syn->weight > 1.5) syn->weight = 1.5;
                        syn->last_stdp_delta = delta_w;
                    }
                }
            }

            // Scenario 2: Spiking neuron is the PRE-synaptic trigger.
            // Propagate forward electrical current downstream to the post-synaptic block.
            if (syn->pre_id == neuron_id) {
                pinc_neuron_t *post_neuron = &state->neurons[syn->post_id];
                if (post_neuron->refractory_ticks_left == 0) {
                    post_neuron->potential += 0.4 * syn->weight;
                    state->raw_dense_operations_count++;

                    // If target threshold breached, add downstream neuron to spiking queue
                    if (post_neuron->potential >= post_neuron->threshold) {
                        queue_push(&fire_queue, syn->post_id);
                    }
                }
            }

            // Scenario 3: Spiking neuron is the PRE-synaptic driver, but post-synaptic has ALREADY spiked.
            // Depress anti-causal synaptic connection strength.
            if (syn->pre_id == neuron_id) {
                pinc_neuron_t *post_neuron = &state->neurons[syn->post_id];
                if (post_neuron->last_spike_time >= 0) {
                    int32_t delta_t = (int32_t)state->current_time_ticks - post_neuron->last_spike_time;
                    if (delta_t > 0 && delta_t <= 15) {
                        double delta_w = -state->stdp_a_minus * safe_exp(-(double)delta_t / state->stdp_tau_minus);
                        syn->weight += delta_w;
                        if (syn->weight < 0.1) syn->weight = 0.1;
                        syn->last_stdp_delta = delta_w;
                    }
                }
            }
        }
    }
}

/**
 * Stimulates a specific cognitive node in the neuromorphic array.
 */
void pinc_core_inject_current(pinc_core_state_t *state, int32_t neuron_id, double amplitude) {
    if (!state || neuron_id < 0 || neuron_id >= PINC_NEURON_COUNT) return;

    pinc_neuron_t *neuron = &state->neurons[neuron_id];
    if (neuron->refractory_ticks_left > 0) return;

    neuron->potential += amplitude;
    
    // Bounds guard to prevent floating point overrun
    if (neuron->potential < 0.0) neuron->potential = 0.0;
    if (neuron->potential > 10.0) neuron->potential = 10.0;

    if (neuron->potential >= neuron->threshold) {
        execute_firing_cascade(state, neuron_id);
    }
}

/**
 * Physics-Informed Cognitive Simulation Tick. Run sequentially.
 */
void pinc_core_tick(pinc_core_state_t *state, double free_energy, double entropy) {
    if (!state) return;

    state->current_time_ticks++;

    // Base free energy precision modulation coefficient
    double modulator_factor = safe_exp(-0.75 * free_energy);
    if (modulator_factor < 0.2) modulator_factor = 0.2;
    if (modulator_factor > 2.0) modulator_factor = 2.0;

    // Active Predictive Coding Inhibitory Feedback:
    // If consistency is highly aligned, we feeds back inhibitors to minimize change-detection error.
    pinc_neuron_t *consistency = &state->neurons[PINC_ME_CONSIST_CHECK];
    pinc_neuron_t *sensory_err = &state->neurons[PINC_ED_CHANGE_DETECT];

    if (consistency->potential > 0.4) {
        double inhibition = 0.12 * (1.0 - (free_energy > 1.0 ? 1.0 : (free_energy < 0.0 ? 0.0 : free_energy)));
        sensory_err->potential -= inhibition;
        if (sensory_err->potential < 0.0) sensory_err->potential = 0.0;
    }

    // Process general membrane leak updates and random thermal entropy fluctuations
    for (int i = 0; i < PINC_NEURON_COUNT; i++) {
        pinc_neuron_t *neuron = &state->neurons[i];

        if (neuron->refractory_ticks_left > 0) {
            neuron->refractory_ticks_left--;
            continue;
        }

        // Apply thermodynamic free-energy modulation on membrane leak tau
        neuron->membrane_tau = 10.0 * modulator_factor;
        if (neuron->membrane_tau < 0.1) neuron->membrane_tau = 0.1; // Guard divide-by-zero

        // V(t+1) = V(t) - (V(t) - V_rest) / membrane_tau
        double leak_delta = (neuron->potential - neuron->rest_potential) / neuron->membrane_tau;
        neuron->potential -= leak_delta;
        if (neuron->potential < neuron->rest_potential) {
            neuron->potential = neuron->rest_potential;
        }

        // Apply tiny thermodynamic noise spikes to simulate thermal entropy
        // Handled via static pseudorandom generator simulation to prevent clock timing noise
        uint32_t seed = (uint32_t)(state->current_time_ticks + i);
        seed ^= seed << 13;
        seed ^= seed >> 17;
        seed ^= seed << 5;
        double rand_val = (double)(seed % 1000) / 1000.0;

        if (rand_val < 0.1) {
            double noise_level = (rand_val * 10.0 - 4.5) * 0.08 * entropy;
            neuron->potential += noise_level;
            if (neuron->potential < neuron->rest_potential) {
                neuron->potential = neuron->rest_potential;
            }
            if (neuron->potential > neuron->threshold) {
                neuron->potential = neuron->threshold - 0.01;
            }
        }
    }

    // Synaptic Homeostatic Balance (Normalized every 20 clock epochs)
    if (state->current_time_ticks % 20 == 0) {
        for (int i = 0; i < PINC_SYNAPSE_COUNT; i++) {
            pinc_synapse_t *syn = &state->synapses[i];
            const double target_baseline = 0.6;
            syn->weight += (target_baseline - syn->weight) * 0.015;
            if (syn->weight < 0.1) syn->weight = 0.1;
            if (syn->weight > 1.5) syn->weight = 1.5;
        }
    }

    // Dense vs Matrix operations saving tracker
    int64_t dense_n = PINC_NEURON_COUNT * PINC_NEURON_COUNT;
    int64_t saved = dense_n - state->raw_dense_operations_count;
    if (saved < 0) saved = 0;
    
    state->total_operations_saved_count += saved;
    state->raw_dense_operations_count -= 1;
    if (state->raw_dense_operations_count < 0) {
        state->raw_dense_operations_count = 0;
    }
}

/**
 * Transcribes high-density semantic sensory payloads into direct currents injected on-the-fly.
 */
void pinc_core_process_semantic_impulse(pinc_core_state_t *state, int32_t text_length, double tension) {
    if (!state) return;

    // Direct proportional calibration
    double sensory_charge = 0.15 + ((double)text_length / 400.0);
    if (sensory_charge > 0.9) sensory_charge = 0.9;

    double anomaly_charge = tension * 1.5;
    if (anomaly_charge > 0.95) anomaly_charge = 0.95;

    pinc_core_inject_current(state, PINC_IN_SENSORY_FLOW, sensory_charge);
    pinc_core_inject_current(state, PINC_ED_CHANGE_DETECT, anomaly_charge);

    pinc_core_tick(state, 0.1, 0.1);
}
