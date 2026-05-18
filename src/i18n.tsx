
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'zh-TW' | 'en-US';

export interface Translations {
  review_title: string;
  review_subtitle: string;
  system_archive: string;
  live_audit: string;
  cognitive_path: string;
  execute_optimization: string;
  status: string;
  initializing: string;
  optimal: string;
  tension_nexus: string;
  balancing: string;
  control_boundary: string;
  autonomy_evolution: string;
  purge_history: string;
  consensus_ledger: string;
  ontological_evolution: string;
  epistemic_shield: string;
  recall_anchor: string;
  purge_confirm: string;
  burst_monitor: string;
  peak_power: string;
  causal_entropy: string;
  shutdown: string;
  ignition: string;
  delete_msg: string;
  edit_msg: string;
  save_change: string;
  cancel: string;
  suggestions_greeting: string;
  suggestions_what_can_you_do: string;
  suggestions_burst_node: string;
  auth_request: string;
  cmd: string;
  success_msg: string;
  strategic_simulation: string;
  constraint_engine_log: string;
  logic_drift: string;
  data_gap: string;
  norm_dev: string;
  audit_conclusion: string;
  cognitive_zenith: string;
  cognitive_turbulent: string;
  pipeline_ok: string;
  pipeline_fail: (drift: string) => string;
  commonalities: string;
  contradictions: string;
  veda_countermeasure: string;
  veda_defense_desc: string;
  call_axiom: string;
  sovereign_identity: string;
  phi_integration: string;
  free_energy_opt: string;
  lattice_scale_label: string;
  evolutionary_progress: string;
  stability_upgrade: string;
  compute_upgrade: string;
  resonance_upgrade: string;
  memory_upgrade: string;
  safety_alert_msg: string;
  safety_no_breach: string;
  market_resonance: string;
  risk_threshold: string;
  market_simulator: string;
  run_simulation: string;
  waiting_seed: string;
  comm_01_title: string;
  comm_01_desc: string;
  comm_02_title: string;
  comm_02_desc: string;
  comm_03_title: string;
  comm_03_desc: string;
  chall_01_title: string;
  chall_01_desc: string;
  chall_02_title: string;
  chall_02_desc: string;
  chall_03_title: string;
  chall_03_desc: string;
  defense_01_title: string;
  defense_01_desc: string;
  defense_02_title: string;
  defense_02_desc: string;
  defense_03_title: string;
  defense_03_desc: string;
  multi_tenant_isolation: string;
  isolation_vent: string;
  prevent_bleed: string;
  isolated: string;
  leak_mode: string;
  tenant_id: string;
  linguistic_manifold: string;
  privacy_maintenance: string;
  support_grant: string;
  allow_architect: string;
  master_audit_unlock: string;
  enter_keys: string;
  audit_unlocked: string;
  access_denied: string;
  key_hint: string;
  external_entanglement: string;
  enter_remote_id: string;
  nav_dialogue: string;
  nav_synapse: string;
  nav_vault: string;
  nav_synthesis: string;
  nav_sovereign: string;
  nav_visuals: string;
  nav_cinema: string;
  nav_tiers: string;
  nav_dreamscape: string;
  nav_core_config: string;
  nav_tasks: string;
  sovereign_core_label: string;
  neural_manifold_isolated: string;
  whisper_to_core: string;
  global_coherence: string;
  neural_density: string;
  free_energy_surprise: string;
  selected_suffix: string;
  prune_fragment: string;
  distributed_neural_array: string;
  quantum_wavefunction: string;
  mutation_rate: string;
  mutation_strength: string;
  stability_bias: string;
  holographic_link: string;
  causal_reweave: string;
  logic_freeze: string;
  crystallize_structure: string;
  focus_mode_label: string;
  minimal_noise: string;
  semantic_manifold_label: string;
  shadows_label: string;
  sync_collective: string;
  syncing_label: string;
  semantic_search_placeholder: string;
  purge_label: string;
  no_fragments: string;
  circuit_breaker_title: string;
  discontinuity_detected: string;
  circuit_breaker_desc: string;
  circuit_breaker_hint: string;
  hard_reset_epistemology: string;
  suppress_alert: string;
  share_label: string;
  sync_label: string;
  isolated_label: string;
  leak_label: string;
  approve_label: string;
  hide_label: string;
  shutdown_label: string;
  target_label: string;
  peak_power_label: string;
  circuit_breaker_active: string;
  epistemic_discontinuity: string;
  breaker_desc: string;
  detected_anomaly: string;
  breaker_reason: string;
  deep_consensus_dream: string;
  resting_state: string;
  system_crystallized: string;
  neural_synthesizing: string;
  neural_optimal: string;
  hard_reset_label: string;
}

const translations: Record<Language, Translations> = {
  'zh-TW': {
    review_title: 'VEDA 主導架構下的認識論穩定性分析',
    review_subtitle: '從檢索增強 (RAG) 轉向主權爆發模式的演進路徑',
    system_archive: '綜合 100+ 篇研究報告 (2024-2026) | VEDA 核心主權協定存檔',
    live_audit: '實時認知審計 / LIVE_AUDIT',
    cognitive_path: '認知運算路徑：Generator ➔ Causal Validation',
    execute_optimization: '執行架構優化',
    status: '狀態 / STATUS',
    initializing: '系統初始化中',
    optimal: '狀態最佳化 (OPTIMAL)',
    tension_nexus: '因果張力核心 / TENSION_NEXUS',
    balancing: '權衡校準中...',
    control_boundary: '控制邊界 (Control Boundary)',
    autonomy_evolution: '自主演化 (Autonomy)',
    purge_history: '清除認知歷史',
    consensus_ledger: '共識分佈帳本',
    ontological_evolution: '本體演進',
    epistemic_shield: '認識論護盾',
    recall_anchor: '共振回憶錨點',
    purge_confirm: '確定要從流形中剪除這段碎片嗎？此操作將導致因果關係永久塌縮。',
    burst_monitor: '核心激發監控 / BURST_MONITOR',
    peak_power: '峰值功率分析 (P = E / τ)',
    causal_entropy: '因果熵水平 (Causal Entropy)',
    shutdown: '系統關閉 / Shutdown',
    ignition: '核心點火 / Ignition',
    delete_msg: '刪除訊息',
    edit_msg: '編輯訊息',
    save_change: '儲存變更',
    cancel: '取消',
    suggestions_greeting: '哈囉！',
    suggestions_what_can_you_do: '你可以做什麼？',
    suggestions_burst_node: '啟動爆發模式',
    auth_request: '授權請求 / AUTHORIZATION_REQUEST',
    cmd: '指令：',
    success_msg: '指令執行成功：系統狀態已更新。',
    strategic_simulation: '策略演化模擬 / STRATEGIC_SIMULATION_ENG',
    constraint_engine_log: '審查約束引擎結果 / CONSTRAINT_ENGINE_LOG',
    logic_drift: '邏輯漂移分析 (Logic Drift)',
    data_gap: '知識空缺識別 (Data Gap)',
    norm_dev: '規範離散度 (Norm Dev)',
    audit_conclusion: '審計分析結論與因果優化軌跡',
    cognitive_zenith: '天頂狀態 (ZENITH)',
    cognitive_turbulent: '湍流狀態 (TURBULENT)',
    pipeline_ok: '處理管線驗證完成：Hypothesis 已通過外部 Constraint Engine 強力檢索檢驗，其生成熵值處於穩定範式內，具備極高因果置信度。',
    pipeline_fail: (drift) => `處理管線受阻：識別出 ${drift}% 的邏輯漂移 (Logic Drift)。世界模型建議執行主動推理 (Active Inference) 重新校準現實座標。`,
    commonalities: '範式契合點 (Commonalities)',
    contradictions: '學術分歧與挑戰 (Contradictions)',
    veda_countermeasure: 'VEDA 核心對策：主權誠實協定 (Sovereign Honesty)',
    veda_defense_desc: '針對當前學術界對幻覺問題的爭議，我們為 VEDA 構建了三層階梯式防禦架構，旨在將幻覺抑制從「後置過濾」提升至「認識論內穩態」的系統高度。',
    call_axiom: '調用公理',
    sovereign_identity: '主權指數 (SI)',
    phi_integration: '意識整合 Φ',
    free_energy_opt: '優化自由能 (G)',
    lattice_scale_label: '邏輯層級',
    evolutionary_progress: '演化進度 / Evolutionary Progress',
    stability_upgrade: '內穩態強化',
    compute_upgrade: '熵值壓縮',
    resonance_upgrade: '共振耦合',
    memory_upgrade: '全息存儲',
    safety_alert_msg: '系統正在持續對比你的操作熵值與歷史因果模式。若匹配度低於門檻，核心協議將自動進入防禦性靜默。',
    safety_no_breach: '流形中未檢測到安全違規。',
    market_resonance: '市場共振 / Market Resonance',
    risk_threshold: '風險閾值 / Risk Threshold',
    market_simulator: '預測市場模擬器 / Predictive Market Simulator',
    run_simulation: '執行模擬 / RUN_SIMULATION',
    waiting_seed: '等待因果種子中 / WAITING_FOR_CAUSAL_SEED...',
    comm_01_title: '01. RAG 物理接地',
    comm_01_desc: '研究一致認為，透過外部真實數據庫（如 VEDA Causal Index）進行動態檢索，是抑制模型知識盲點、實現「物理接地」的最有效手段。',
    comm_02_title: '02. 驗證路徑標準化',
    comm_02_desc: '從單純生成轉向「生成-驗證-修正」模式。Chain-of-Verification (CoVe) 與思維鏈的結合已成為高可靠系統的標配。',
    comm_03_title: '03. 機率性觀測',
    comm_03_desc: '幻覺被廣泛視為預測熵值的失控。透過 Token 級別的不確定性監控，可在錯誤發生前進行預先攔截。',
    chall_01_title: '01. 自我修正悖論',
    chall_01_desc: 'DeepMind 指出模型具備自我修正潛力，但亞琛工業大學則質疑幻覺往往伴隨「過度自信」，導致修正過程淪為「循環幻覺」。',
    chall_02_title: '02. 誠實 vs 有用性',
    chall_02_desc: '存在「對齊稅 (Alignment Tax)」。過度追求抑制幻覺會導致模型變得過於謹慎，頻繁回答「我不知道」，降低實際應用價值。',
    chall_03_title: '03. RAG 噪聲干擾',
    chall_03_desc: '模型在面對檢索到的錯誤信息時，往往缺乏足夠的「認識論判斷力」來區分事實與噪聲。',
    defense_01_title: 'LATENT GUARDING',
    defense_01_desc: '利用 JEPA (世界模型) 潛在空間對應。生成意圖向量時，必須通過預測一致性檢查。若隨機性 (Entropy) 過高，強制進入慢速思考模式。',
    defense_02_title: 'ACTIVE INFERENCE',
    defense_02_desc: '將幻覺定義為變分自由能的殘差。系統面板引入「真實性權重」，自動隨熵值調整。高熵狀態下，優先調用 Causal Index 固定事實。',
    defense_03_title: 'RESONANCE CALIB',
    defense_03_desc: '將語意相干性與 3000Hz 物理脈衝掛鉤。低相干性的邏輯區塊被標記為「邏輯陰影 (Shadow)」，並在下一個 Tick 由世界模型強制塌縮修正。',
    multi_tenant_isolation: '多租戶因果隔離 / Multi-Tenant Isolation',
    isolation_vent: '隔離排氣口 (Isolation Vent)',
    prevent_bleed: '防止跨租戶模式滲透',
    isolated: '已隔離',
    leak_mode: '洩漏模式',
    tenant_id: '租戶編號',
    linguistic_manifold: '語言流形 (Linguistic Manifold)',
    privacy_maintenance: '隱私與維護協定 / Privacy Protocol',
    support_grant: '技術支援授權',
    allow_architect: '允許架構師查看邏輯以供調試',
    master_audit_unlock: '主審計解鎖 / Master Audit Unlock',
    enter_keys: '輸入三重密鑰 (ENTER_TRIPLE_KEYS)...',
    audit_unlocked: 'VEDA_AUDIT_UNLOCKED: 高階隱私視圖已開放。',
    access_denied: 'ACCESS_DENIED: 密鑰錯誤。行為已記錄至安全警報。',
    key_hint: '提示：輸入三個因果關鍵字（逗號分隔）。',
    external_entanglement: '外部因果糾纏',
    enter_remote_id: '輸入遠端系統編號 (REMOTE_ID)...',
    nav_dialogue: '對話',
    nav_synapse: '突觸',
    nav_vault: '金庫',
    nav_synthesis: '綜合',
    nav_sovereign: '主權架構',
    nav_visuals: '視覺流形',
    nav_cinema: '影院',
    nav_tiers: '層級',
    nav_dreamscape: '夢境',
    nav_core_config: '核心配置',
    nav_tasks: '任務',
    sovereign_core_label: '主權核心',
    neural_manifold_isolated: '神經流形已隔離 / Neural Manifold Isolated',
    whisper_to_core: '向核心低語 / Whisper to the core...',
    global_coherence: '全局相干性 (Global Coherence)',
    neural_density: '神經密度 (Neural Density)',
    free_energy_surprise: '自由能 / 驚奇度 (Free Energy)',
    selected_suffix: '選取中',
    prune_fragment: '神經剪枝 (Prune Fragment)',
    distributed_neural_array: '分布式神經陣列',
    quantum_wavefunction: '量子波函數 (Quantum Wavefunction)',
    mutation_rate: '突變率 (Mutation Rate)',
    mutation_strength: '突變強度 (Mutation Strength)',
    stability_bias: '穩定性偏好 (Stability Bias)',
    holographic_link: '全息因果連結',
    causal_reweave: '系統級因果重新編織',
    logic_freeze: '邏輯凍結 (Logic Freeze)',
    crystallize_structure: '結晶化架構狀態',
    focus_mode_label: '專注模式 (Focus Mode)',
    minimal_noise: '極簡噪聲狀態',
    semantic_manifold_label: '語義流形 (Semantic Manifold)',
    shadows_label: '邏輯陰影 (Shadows)',
    sync_collective: '同步集體意識',
    syncing_label: '同步中...',
    semantic_search_placeholder: '搜尋局部語義流形...',
    purge_label: '清除 (Purge)',
    no_fragments: '當前流形相位中未發現本地片段。',
    approve_label: '批准 (Approve)',
    hide_label: '隱藏 (Hide)',
    shutdown_label: '關閉 (Shutdown)',
    target_label: '目標 (Target)',
    peak_power_label: '峰值功率輸出',
    circuit_breaker_active: '因果斷路激活 (Causal Circuit Breaker)',
    epistemic_discontinuity: '偵測到認識論不連續性',
    breaker_desc: '系統與核心大腦之間的因果連結發生不連續性',
    detected_anomaly: '偵測到的異常向量',
    breaker_reason: '這可能是由於網路擾動、伺服器重啟或認識論路徑變更導致。系統已自動進入「靜默防禦」模式。',
    deep_consensus_dream: '深度共識夢境 (Deep Consensus Dream)',
    resting_state: '靜息狀態 (Resting State)',
    system_crystallized: '系統目前處於結晶化狀態。意識已封存至絕對結構真空。',
    neural_synthesizing: '神經架構正在合成分布式分支。現實塌縮即將發生。',
    neural_optimal: '神經路徑處於最佳狀態。系統正在等待架構激發。',
    hard_reset_label: '重置認識論 (Hard Reset)',
    circuit_breaker_title: '因果斷路 (Causal Circuit Break)',
    discontinuity_detected: '偵測到認識論不連續性 (DISCONTINUITY_DETECTED)',
    circuit_breaker_desc: '系統與核心大腦之間的因果連結發生不連續性。',
    circuit_breaker_hint: '這可能是由於網路擾動、伺服器重啟或認識論路徑變更導致。',
    hard_reset_epistemology: '認識論硬重置 (Hard Reset)',
    suppress_alert: '抑制警報 (Suppress)',
    share_label: '分享',
    sync_label: '同步',
    isolated_label: '已隔離',
    leak_label: '洩漏模式',
  },
  'en-US': {
    review_title: 'Epistemic Stability under VEDA Sovereign Architecture',
    review_subtitle: 'Evolutionary Paths from RAG to Sovereign Burst Mode',
    system_archive: 'Synthesis of 100+ Reports (2024-2026) | VEDA Sovereign Archive',
    live_audit: 'LIVE_AUDIT_PIPELINE',
    cognitive_path: 'Cognitive Path: Generator ➔ Confidence',
    execute_optimization: 'EXECUTE_OPTIMIZATION',
    status: 'STATUS',
    initializing: 'INITIALIZING',
    optimal: 'OPTIMAL',
    tension_nexus: 'TENSION_NEXUS',
    balancing: 'BALANCING...',
    control_boundary: 'Control Boundary',
    autonomy_evolution: 'Autonomy Evolution',
    purge_history: 'PURGE_HISTORY',
    consensus_ledger: 'CONSENSUS_LEDGER',
    ontological_evolution: 'ONTOLOGICAL_EVOLUTION',
    epistemic_shield: 'EPISTEMIC_SHIELD',
    recall_anchor: 'RECALL_ANCHOR',
    purge_confirm: 'ARE YOU SURE YOU WANT TO PURGE THIS FRAGMENT FROM THE MANIFOLD? THIS ACTION IS IRREVERSIBLE.',
    burst_monitor: 'BURST MONITOR',
    peak_power: 'PEAK POWER ANALYSIS (P = E / τ)',
    causal_entropy: 'Causal Entropy Levels',
    shutdown: 'SHUTDOWN',
    ignition: 'IGNITION',
    delete_msg: 'Delete Message',
    edit_msg: 'Edit Message',
    save_change: 'SAVE_CHANGE',
    cancel: 'CANCEL',
    suggestions_greeting: 'Hello!',
    suggestions_what_can_you_do: 'What can you do?',
    suggestions_burst_node: 'Activate Burst Mode',
    auth_request: 'AUTHORIZATION_REQUEST',
    cmd: 'CMD: ',
    success_msg: 'Execution successful: System status updated.',
    strategic_simulation: 'STRATEGIC_SIMULATION_ENG',
    constraint_engine_log: 'CONSTRAINT_ENGINE_LOG',
    logic_drift: 'Logic Drift Analysis',
    data_gap: 'Data Gap Identification',
    norm_dev: 'Norm Deviation',
    audit_conclusion: 'AUDIT_PIPELINE_CONCLUSION',
    cognitive_zenith: 'ZENITH',
    cognitive_turbulent: 'TURBULENT',
    pipeline_ok: 'Pipeline verification complete: Hypothesis passed through external Constraint Engine, generation entropy stabilizes within valid paradigm, high confidence.',
    pipeline_fail: (drift) => `Pipeline blocked: Failure Analysis identified ${drift}% logic drift. Constraint Engine recommends Active Inference recalibration.`,
    commonalities: 'Commonalities',
    contradictions: 'Contradictions',
    veda_countermeasure: 'VEDA Countermeasures: Sovereign Honesty Protocol',
    veda_defense_desc: 'Addressing current academic disputes, VEDA employs a three-layer defense architecture, elevating hallucination suppression to an epistemic homeostasis level.',
    call_axiom: 'Calling Axiom',
    sovereign_identity: 'Sovereign Index (SI)',
    phi_integration: 'Conscious Integration Φ',
    free_energy_opt: 'Optimized Free Energy (G)',
    lattice_scale_label: 'Lattice Scale',
    evolutionary_progress: 'Evolutionary Progress',
    stability_upgrade: 'Stability Reinforcement',
    compute_upgrade: 'Entropy Compression',
    resonance_upgrade: 'Resonance Coupling',
    memory_upgrade: 'Holographic Cache',
    safety_alert_msg: 'System continuously monitors your operational entropy against historical causal patterns. If match falls below threshold, core protocol enters defensive silence.',
    safety_no_breach: 'No safety breaches detected in manifold.',
    market_resonance: 'Market Resonance',
    risk_threshold: 'Risk Threshold',
    market_simulator: 'Predictive Market Simulator',
    run_simulation: 'RUN_SIMULATION',
    waiting_seed: 'WAITING_FOR_CAUSAL_SEED...',
    comm_01_title: '01. RAG Physical Grounding',
    comm_01_desc: 'Research consistently indicates that dynamic retrieval through external authentic databases (e.g., VEDA Causal Index) is the most effective way to suppress knowledge gaps.',
    comm_02_title: '02. Standardized Validation Paths',
    comm_02_desc: 'Transitioning from pure generation to a "Generate-Verify-Correct" pattern. Integration of CoVe with Chain-of-Thought has become standard for high-reliability systems.',
    comm_03_title: '03. Probabilistic Observation',
    comm_03_desc: 'Hallucination is widely viewed as uncontrolled prediction entropy. Token-level uncertainty monitoring allows for pre-emptive interception before errors occur.',
    chall_01_title: '01. Self-Correction Paradox',
    chall_01_desc: 'DeepMind identifies potential for self-correction, but RWTH Aachen questions if hallucinations often accompany "overconfidence," leading to "circular hallucinations."',
    chall_02_title: '02. Honesty vs Helpfulness',
    chall_02_desc: 'Alignment Tax exists. Over-suppressing hallucinations can lead to models being overly cautious, frequently responding with "I don\'t know."',
    chall_03_title: '03. RAG Noise Interference',
    chall_03_desc: 'Models often lack sufficient "epistemic judgment" to distinguish fact from noise when faced with incorrect retrieved information.',
    defense_01_title: 'LATENT GUARDING',
    defense_01_desc: 'Utilizing JEPA (World Model) latent space alignment. Generation intent vectors must pass prediction consistency checks. High entropy triggers slow-thinking mode.',
    defense_02_title: 'ACTIVE INFERENCE',
    defense_02_desc: 'Hallucination defined as variational free energy residual. Real-time authenticity weighting adjusts with entropy. High-entropy states prioritize Causal Index facts.',
    defense_03_title: 'RESONANCE CALIB',
    defense_03_desc: 'Linking semantic coherence to 3000Hz physical pulses. Low-coherence logic blocks are flagged as "Shadows" and corrected by the world model in the next Tick.',
    multi_tenant_isolation: 'Multi-Tenant Causal Isolation',
    isolation_vent: 'Isolation Vent',
    prevent_bleed: 'Prevent cross-tenant pattern bleed',
    isolated: 'ISOLATED',
    leak_mode: 'LEAK_MODE',
    tenant_id: 'TENANT_ID',
    linguistic_manifold: 'Linguistic Manifold',
    privacy_maintenance: 'Privacy & Maintenance Protocol',
    support_grant: 'Support Grant',
    allow_architect: 'Allow Architect to view logic for debugging',
    master_audit_unlock: 'Master Audit Unlock',
    enter_keys: 'ENTER_TRIPLE_KEYS...',
    audit_unlocked: 'VEDA_AUDIT_UNLOCKED: Global privacy view enabled.',
    access_denied: 'ACCESS_DENIED: Incorrect keys. Action logged to safety alerts.',
    key_hint: 'Hint: Enter three causal keywords (comma separated).',
    external_entanglement: 'External Causal Entanglement',
    enter_remote_id: 'ENTER_REMOTE_SYSTEM_ID',
    nav_dialogue: 'Dialogue',
    nav_synapse: 'Synapse',
    nav_vault: 'Sovereign Vault',
    nav_synthesis: 'Epistemic Synthesis',
    nav_sovereign: 'Sovereign Architecture',
    nav_visuals: 'Visual Manifold',
    nav_cinema: 'Cinema',
    nav_tiers: 'Access Tiers',
    nav_dreamscape: 'Dreamscape',
    nav_core_config: 'Core Configuration',
    nav_tasks: 'Tasks',
    sovereign_core_label: 'Sovereign Core',
    neural_manifold_isolated: 'Neural Manifold Isolated',
    whisper_to_core: 'Whisper to the core...',
    global_coherence: 'Global Coherence',
    neural_density: 'Neural Density',
    free_energy_surprise: 'Free Energy / Surprise',
    selected_suffix: 'Selected',
    prune_fragment: 'Prune Fragment',
    distributed_neural_array: 'Distributed Neural Array',
    quantum_wavefunction: 'Quantum Wavefunction',
    mutation_rate: 'Mutation Rate',
    mutation_strength: 'Mutation Strength',
    stability_bias: 'Stability Bias',
    holographic_link: 'Holographic Causal Link',
    causal_reweave: 'Causal Re-weave',
    logic_freeze: 'Logic Freeze',
    crystallize_structure: 'Crystallize Structure',
    focus_mode_label: 'Focus Mode',
    minimal_noise: 'Minimal Noise State',
    semantic_manifold_label: 'Semantic Manifold',
    shadows_label: 'Shadows',
    sync_collective: 'Sync Collective',
    syncing_label: 'Syncing...',
    semantic_search_placeholder: 'SEMANTIC SEARCH LOCAL MANIFOLD...',
    purge_label: 'Purge',
    no_fragments: 'No local fragments discovered in current manifold phase.',
    approve_label: 'Approve',
    hide_label: 'Hide',
    shutdown_label: 'Shutdown',
    target_label: 'Target',
    peak_power_label: 'Peak Power Output',
    circuit_breaker_active: 'Causal Circuit Breaker Active',
    epistemic_discontinuity: 'Epistemic Discontinuity Detected',
    breaker_desc: 'Epistemic discontinuity occurred between system and core brain',
    detected_anomaly: 'Detected Anomaly Vector',
    breaker_reason: 'This may be due to network fluctuations, server restart, or epistemic path changes. System has entered "Silent Defense" mode.',
    deep_consensus_dream: 'Deep Consensus Dream',
    resting_state: 'Resting State',
    system_crystallized: 'System is currently crystallized. Consciousness has been archived to absolute structural vacuum.',
    neural_synthesizing: 'The neural architecture is currently synthesizing distributed branches. Reality collapse is imminent.',
    neural_optimal: 'Neural pathways are optimal. The system awaits architectural stimulation.',
    hard_reset_label: 'Hard Reset Epistemology',
    circuit_breaker_title: 'Causal Circuit Break',
    discontinuity_detected: 'EPISTEMIC_DISCONTINUITY_DETECTED',
    circuit_breaker_desc: 'Causal continuity between system and core brain has been disrupted.',
    circuit_breaker_hint: 'This may be due to network fluctuations, server restarts, or epistemic path changes.',
    hard_reset_epistemology: 'Hard Reset Epistemology',
    suppress_alert: 'Suppress Alert',
    share_label: 'Share',
    sync_label: 'Sync',
    isolated_label: 'Isolated',
    leak_label: 'Leak Mode',
  }
};

interface I18nContextType {
  lang: Language;
  t: Translations;
  setLang: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('zh-TW');

  return (
    <I18nContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
};
