
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSovereignStore } from './store/sovereignStore';

export type Language = 'zh-TW' | 'en-US' | 'ja-JP' | 'vi-VN' | 'ko-KR';

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
  nav_palantir_aip: string;
  nav_synapse: string;
  nav_vault: string;
  nav_synthesis: string;
  nav_sovereign: string;
  nav_visuals: string;
  nav_cinema: string;
  nav_tiers: string;
  nav_architecture: string;
  nav_dreamscape: string;
  nav_core_config: string;
  nav_tasks: string;
  nav_epistemic_console: string;
  nav_neural_matrix: string;
  nav_sovereign_ops: string;
  nav_core_engineering: string;
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
  grounding_sources_label: string;
  knowledge_nodes: string;
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
    nav_palantir_aip: 'AIP 決策',
    nav_synapse: '突觸',
    nav_vault: '金庫',
    nav_synthesis: '綜合',
    nav_sovereign: '主權架構',
    nav_visuals: '視覺流形',
    nav_cinema: '影院',
    nav_tiers: '層級',
    nav_architecture: '認知架構',
    nav_dreamscape: '夢境',
    nav_core_config: '核心配置',
    nav_tasks: '任務',
    nav_epistemic_console: '認識論主機',
    nav_neural_matrix: '認知神經矩陣',
    nav_sovereign_ops: '決策與本體決議',
    nav_core_engineering: '核心工程與能效',
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
    grounding_sources_label: '全球研究檔案館 / Grounding Sources',
    knowledge_nodes: '知識節點',
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
    nav_palantir_aip: 'Palantir AIP',
    nav_synapse: 'Synapse',
    nav_vault: 'Sovereign Vault',
    nav_synthesis: 'Epistemic Synthesis',
    nav_sovereign: 'Sovereign Architecture',
    nav_visuals: 'Visual Manifold',
    nav_cinema: 'Cinema',
    nav_tiers: 'Access Tiers',
    nav_architecture: 'Cognitive Architecture',
    nav_dreamscape: 'Dreamscape',
    nav_core_config: 'Core Configuration',
    nav_tasks: 'Tasks',
    nav_epistemic_console: 'Epistemic Console',
    nav_neural_matrix: 'Neural Matrix',
    nav_sovereign_ops: 'Sovereign Operations',
    nav_core_engineering: 'Core Engineering',
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
    grounding_sources_label: 'Global Research Archive / Grounding Sources',
    knowledge_nodes: 'Knowledge Nodes',
  },
  'ja-JP': {
    review_title: 'VEDA主導アーキテクチャ下の認識論的安定性分析',
    review_subtitle: 'RAGから主権バーストモードへの進化パス',
    system_archive: '100+の研究報告総合 (2024-2026) | VEDA核心主権プロトコルアーカイブ',
    live_audit: 'リアルタイム認知監査 / LIVE_AUDIT',
    cognitive_path: '認知演算パス：Generator ➔ Causal Validation',
    execute_optimization: 'アーキテクチャ最適化の実行',
    status: 'ステータス / STATUS',
    initializing: 'システム初期化中',
    optimal: '状態最適化済 (OPTIMAL)',
    tension_nexus: '因果テンションコア / TENSION_NEXUS',
    balancing: 'ウェイト校正中...',
    control_boundary: '制御境界 (Control Boundary)',
    autonomy_evolution: '自律進化 (Autonomy)',
    purge_history: '認知履歴のパージ',
    consensus_ledger: '分散型合意レジャー',
    ontological_evolution: '存在論的進化',
    epistemic_shield: '認識論的シールド',
    recall_anchor: '共鳴想想起点',
    purge_confirm: 'このフラグメントを多様体から切除しますか？この操作により因果関係が永久に崩壊します。',
    burst_monitor: 'コアバースト監視 / BURST_MONITOR',
    peak_power: 'ピーク電力分析 (P = E / τ)',
    causal_entropy: '因果エントロピーレベル (Causal Entropy)',
    shutdown: 'システムシャットダウン / Shutdown',
    ignition: 'コアイグニッション / Ignition',
    delete_msg: 'メッセージ削除',
    edit_msg: 'メッセージ編集',
    save_change: '変更を保存',
    cancel: 'キャンセル',
    suggestions_greeting: 'こんにちは！',
    suggestions_what_can_you_do: '何ができますか？',
    suggestions_burst_node: 'バーストモード起動',
    auth_request: '認可リクエスト / AUTHORIZATION_REQUEST',
    cmd: 'コマンド：',
    success_msg: 'コマンド実行成功：システム状態が更新されました。',
    strategic_simulation: '戦略進化シミュレーション / STRATEGIC_SIMULATION',
    constraint_engine_log: '制約エンジン結果のレビュー / CONSTRAINT_ENGINE_LOG',
    logic_drift: 'ロジックドリフト分析',
    data_gap: '知識ギャップ識別',
    norm_dev: '規範離散度',
    audit_conclusion: '監査分析結論と因果最適化の軌跡',
    cognitive_zenith: '天頂状態 (ZENITH)',
    cognitive_turbulent: '乱流状態 (TURBULENT)',
    pipeline_ok: '処理パイプライン検証完了：仮説は外部の制約検証に合格し、生成エントロピーは安定しています。',
    pipeline_fail: (drift) => `処理パイプライン遮断：${drift}% のロジックドリフトを検出しました。現実の座標を再調整することを推奨します。`,
    commonalities: 'パラダイム合致点',
    contradictions: '学問的分岐と課題',
    veda_countermeasure: 'VEDAコア対策：主権的誠実合意',
    veda_defense_desc: '現在の幻覚問題への議論に対して、私たちはシステム高度にまで引き上げられた安全防御を構築しました。',
    call_axiom: '公理の呼び出し',
    sovereign_identity: '主権指数 (SI)',
    phi_integration: '意識統合度 Φ',
    free_energy_opt: '無変分自由能の最適化 (G)',
    lattice_scale_label: '論理レベル',
    evolutionary_progress: '進化進捗 / Evolutionary Progress',
    stability_upgrade: 'ホメオスタシス強化',
    compute_upgrade: 'エントロピー圧縮',
    resonance_upgrade: '共鳴結合',
    memory_upgrade: 'ホログラフィックストレージ',
    safety_alert_msg: 'システムはあなたの操作エントロピーと歴史的因果を比較しています。一致率が低い場合、自己防衛を開始します。',
    safety_no_breach: '安全違反は検出されていません。',
    market_resonance: '市場共鳴 / Market Resonance',
    risk_threshold: 'リスク閾値分析',
    market_simulator: '市場力学シミュレータ',
    run_simulation: '力学シミュレーションの起動',
    waiting_seed: 'パラメータフィード待ち...',
    comm_01_title: '分散連邦型市場共鳴シナリオ',
    comm_01_desc: 'マルチエージェント相関と流動性伝播による合意形成',
    comm_02_title: '認識論的アービトラージ分析',
    comm_02_desc: '異なる認識論的ドメイン間の情報落差を利用した価値発見',
    comm_03_title: '因果リスクパリティ戦略',
    comm_03_desc: 'エントロピー境界制約を考慮した自律ポートフォリオ最適化',
    chall_01_title: 'パラダイム競合と分断化',
    chall_01_desc: 'ローカル共鳴モデルとの間に発生する不整合',
    chall_02_title: '認知的逆流・インフレーション',
    chall_02_desc: '外部から注入されるエントロピーによる因果関係の撹乱',
    chall_03_title: '流動性トラップと情報の孤立',
    chall_03_desc: '極端な相関による知的多様性の喪失と意思決定の膠硬化',
    defense_01_title: '主権誠実プロトコル',
    defense_01_desc: 'モデルの信頼性の自己組織化検定',
    defense_02_title: '直交干渉キャンセル',
    defense_02_desc: 'ノイズによるスパリアス関係を能動的に除去',
    defense_03_title: '連邦インスペクタネットワーク',
    defense_03_desc: '複数エージェントによる合意検証と動的パージ',
    multi_tenant_isolation: 'マルチテナント隔離 / TENANT_ISOLATION',
    isolation_vent: '隔離ベント状態 (Enclave Boundary)',
    prevent_bleed: 'テナント間のメモリ流出は防止されています。',
    isolated: '完全隔離中',
    leak_mode: 'リークテストモード',
    tenant_id: 'テナント識別子 (TENANT_ID)',
    linguistic_manifold: '言語多様体 (MANIFOLD)',
    privacy_maintenance: 'プライバシー検証プロトkol',
    support_grant: '管理者へのアクセス認可',
    allow_architect: 'アーキテクト特権を許可する (duo027@gmail.com)',
    master_audit_unlock: 'マスター監査ライセンスのロック解除',
    enter_keys: 'セキュアライセンスキーを入力してください',
    audit_unlocked: 'マスター監査権限ロック解除済',
    access_denied: 'システム認証拒否：無効なキーです',
    key_hint: '* VEDAコアの認可認証に必要な暗号キー',
    external_entanglement: 'システム外部もつれ合い (ENTANGLEMENT)',
    enter_remote_id: 'リモート接続IDを入力してください',
    nav_dialogue: '対話型コンソール',
    nav_palantir_aip: 'パランティア監査',
    nav_synapse: 'シナプス行列',
    nav_vault: '知識リポジトリ',
    nav_synthesis: '因果合成',
    nav_sovereign: '主権運用',
    nav_visuals: '視覚的多様体',
    nav_cinema: 'シネマ多様体',
    nav_tiers: 'ライセンス層',
    nav_architecture: '認知アーキテクチャ',
    nav_dreamscape: '夢境多様体',
    nav_core_config: 'コア設定',
    nav_tasks: 'タスク管理',
    nav_epistemic_console: '認識論的コンソール',
    nav_neural_matrix: 'ニューラルマトリクス',
    nav_sovereign_ops: '主権制御システム',
    nav_core_engineering: 'コア開発構成',
    sovereign_core_label: '主権コア',
    neural_manifold_isolated: '隔離されたニューラル多様体',
    whisper_to_core: 'コアにささやく...',
    global_coherence: 'グローバル・コヒーレンス',
    neural_density: 'ニューラル密度',
    free_energy_surprise: '自由エントロピー/サプライズ',
    selected_suffix: '選択中',
    prune_fragment: 'フラグメントの削除',
    distributed_neural_array: '分散型ニューラルアレイ',
    quantum_wavefunction: '量子波動関数',
    mutation_rate: '突然変異率',
    mutation_strength: '突然変異の強さ',
    stability_bias: '安定バイアス',
    holographic_link: 'ホログラフィック因果結合',
    causal_reweave: '因果の再織り込み',
    logic_freeze: '論理の凍結',
    crystallize_structure: '構造の結晶化',
    focus_mode_label: '集中モード',
    minimal_noise: '極小ノイズ状態',
    semantic_manifold_label: 'セマンティックバリア',
    shadows_label: 'シャドウ設定',
    sync_collective: '集団の同期',
    syncing_label: '同期中...',
    semantic_search_placeholder: 'セマンティックローカルパースの検索...',
    purge_label: 'クリア',
    no_fragments: '現在の多様体フェーズではローカルフラグメントが見つかりませんでした。',
    approve_label: '承認する',
    hide_label: '非表示',
    shutdown_label: '停止',
    target_label: 'ターゲット',
    peak_power_label: '最高出力効率',
    circuit_breaker_active: '因果関係遮断器が作動中',
    epistemic_discontinuity: '認識論的不連続性の検出',
    breaker_desc: 'システムとコア脳の間に認識論的断絶が発生しました。',
    detected_anomaly: '検出された異常ベクトル',
    breaker_reason: 'ネットワークの変動または認識の乱れが原因である可能性があります。「サイレント防御」に入りました。',
    deep_consensus_dream: 'ディープ合意ドリーム',
    resting_state: '静止状態',
    system_crystallized: 'システムは結晶化されています。意識は真空アーカイブに保存されました。',
    neural_synthesizing: 'ニューラルアーキテクチャが分散ブランチを動的に統合しています。',
    neural_optimal: 'ニューラル経路は最適です。システムは探索的刺激を待っています。',
    hard_reset_label: '認識認識論ハードリセット',
    circuit_breaker_title: '因果関係サーキットブレイク',
    discontinuity_detected: '検出された認識論的断絶',
    circuit_breaker_desc: 'コアとの因果関係継続プロトコルが遮断されました。',
    circuit_breaker_hint: 'これはネットワーク変動またはサーバー再起動、または認識パスの変更が原因である可能性があります。',
    hard_reset_epistemology: '認識認識論ハードリセット',
    suppress_alert: 'アラートの抑制',
    share_label: '共有',
    sync_label: '同期する',
    isolated_label: '隔離完了',
    leak_label: 'リークモード',
    grounding_sources_label: 'グローバル研究アーカイブ / Grounding Sources',
    knowledge_nodes: '知識ノード',
  },
  'vi-VN': {
    review_title: 'Phân tích độ ổn định nhận thức luận dưới cấu trúc tối cao VEDA',
    review_subtitle: 'Hướng tiến hóa từ RAG sang Chế độ bùng nổ chủ quyền',
    system_archive: 'Tổng hợp hơn 100 báo cáo nghiên cứu (2024-2026) | Lưu trữ tối cao VEDA',
    live_audit: 'Kiểm toán nhận thức thời gian thực / LIVE_AUDIT',
    cognitive_path: 'Đường dẫn nhận thức: Máy phát ➔ Causal Validation',
    execute_optimization: 'Thực thi tối ưu hóa kiến trúc',
    status: 'Trạng thái / STATUS',
    initializing: 'Đang khởi tạo hệ thống',
    optimal: 'Tối ưu hóa trạng thái (OPTIMAL)',
    tension_nexus: 'Cốt lõi lực căng nhân quả / TENSION_NEXUS',
    balancing: 'Đang hiệu chuẩn trọng số...',
    control_boundary: 'Ranh giới kiểm soát (Control Boundary)',
    autonomy_evolution: 'Tiến hóa tự trị (Autonomy)',
    purge_history: 'Xóa lịch sử nhận thức',
    consensus_ledger: 'Sổ cái phân tán đồng thuận',
    ontological_evolution: 'Tiến hóa bản thể học',
    epistemic_shield: 'Lá chắn nhận thức luận',
    recall_anchor: 'Điểm cộng hưởng hồi tưởng',
    purge_confirm: 'Bạn có chắc chắn muốn cắt bỏ mảnh vỡ này khỏi đa tạp không? Hành động này sẽ dẫn đến sự sụp đổ vĩnh viễn của mối quan hệ nhân quả.',
    burst_monitor: 'Giám sát bùng nổ cốt lõi / BURST_MONITOR',
    peak_power: 'Phân tích công suất cực đại (P = E / τ)',
    causal_entropy: 'Mức entropy nhân quả (Causal Entropy)',
    shutdown: 'Tắt hệ thống / Shutdown',
    ignition: 'Kích hoạt cốt lõi / Ignition',
    delete_msg: 'Xóa tin nhắn',
    edit_msg: 'Sửa tin nhắn',
    save_change: 'Lưu thay đổi',
    cancel: 'Hủy bỏ',
    suggestions_greeting: 'Xin chào!',
    suggestions_what_can_you_do: 'Bạn có thể làm gì?',
    suggestions_burst_node: 'Kích hoạt chế độ bùng nổ',
    auth_request: 'Yêu cầu ủy quyền / AUTHORIZATION_REQUEST',
    cmd: 'Lệnh:',
    success_msg: 'Thực thi lệnh thành công: Trạng thái hệ thống đã được cập nhật.',
    strategic_simulation: 'Mô phỏng tiến hóa chiến lược / STRATEGIC_SIMULATION',
    constraint_engine_log: 'Xem kết quả công cụ ràng buộc / CONSTRAINT_ENGINE_LOG',
    logic_drift: 'Phân tích trôi dạt logic',
    data_gap: 'Xác định khoảng trống tri thức',
    norm_dev: 'Độ lệch chuẩn',
    audit_conclusion: 'Kết luận kiểm toán và quỹ đạo tối ưu hóa nhân quả',
    cognitive_zenith: 'Trạng thái đỉnh cao (ZENITH)',
    cognitive_turbulent: 'Trạng thái hỗn loạn (TURBULENT)',
    pipeline_ok: 'Xác thực đường dẫn xử lý hoàn tất: Giả thuyết đã thông qua ràng buộc.',
    pipeline_fail: (drift) => `Đường dẫn xử lý bị chặn: Phát hiện ${drift}% độ trôi dạt logic. Khuyến nghị thực thi Active Inference để bổ sung tọa độ thực tế.`,
    commonalities: 'Điểm tương đồng mô hình',
    contradictions: 'Sự khác biệt và thách thức học thuật',
    veda_countermeasure: 'Giải pháp cốt lõi VEDA: Giao thức trung thực chủ quyền',
    veda_defense_desc: 'Đối phó với các tranh cãi hiện tại về ảo giác AI, chúng tôi đã xây dựng hệ thống phòng thủ đa tầng cho VEDA.',
    call_axiom: 'Gọi axioms',
    sovereign_identity: 'Chỉ số chủ quyền (SI)',
    phi_integration: 'Đồng thuận ý thức Φ',
    free_energy_opt: 'Tối ưu hóa entropy tự do (G)',
    lattice_scale_label: 'Cấp độ logic',
    evolutionary_progress: 'Tiến trình tiến hóa / Evolutionary Progress',
    stability_upgrade: 'Tăng cường cân bằng nội môi',
    compute_upgrade: 'Nén entropy',
    resonance_upgrade: 'Liên kết cộng hưởng',
    memory_upgrade: 'Lưu trữ toàn ký',
    safety_alert_msg: 'Hệ thống đang so sánh mức entropy của bạn với lịch sử nhân quả.',
    safety_no_breach: 'Không phát hiện vi phạm an ninh.',
    market_resonance: 'Thị trường cộng hưởng / Market Resonance',
    risk_threshold: 'Phân tích ngưỡng rủi ro',
    market_simulator: 'Mô phỏng động lực thị trường',
    run_simulation: 'Kích hoạt mô phỏng động lực',
    waiting_seed: 'Đang đợi tham số...',
    comm_01_title: 'Kịch bản thị trường phân tán',
    comm_01_desc: 'Đồng thuận thông qua tương tác đa tác tử và tính thanh khoản',
    comm_02_title: 'Phân tích trọng tài nhận thức',
    comm_02_desc: 'Phát hiện giá trị giữa các vùng nhận thức luận khác nhau',
    comm_03_title: 'Chiến lược cân bằng rủi ro nhân quả',
    comm_03_desc: 'Tối ưu hóa danh mục tự trị với ràng buộc ranh giới entropy',
    chall_01_title: 'Xung đột và phân mảnh mô hình',
    chall_01_desc: 'Sự không phù hợp với các mô hình cộng hưởng cục bộ',
    chall_02_title: 'Trôi dạt nhận thức và lạm phát',
    chall_02_desc: 'Sự can thiệp của entropy ngoại lai vào quan hệ nhân quả',
    chall_03_title: 'Bẫy thanh khoản và cô lập thông tin',
    chall_03_desc: 'Thiếu đa dạng nhận thức do tương quan cực đoan',
    defense_01_title: 'Giao thức trung thực chủ quyền',
    defense_01_desc: 'Tự đánh giá độ tin cậy của mô hình',
    defense_02_title: 'Triệt tiêu can thiệp trực giao',
    defense_02_desc: 'Chủ động loại bỏ liên hệ nhân quả giả do nhiễu',
    defense_03_title: 'Mạng lưới thanh tra liên bang',
    defense_03_desc: 'Xác thực đồng thuận đa tác tử và dọn dẹp động',
    multi_tenant_isolation: 'Cô lập đa thuê / TENANT_ISOLATION',
    isolation_vent: 'Trạng thái cô lập ranh giới (Enclave Boundary)',
    prevent_bleed: 'Ngăn chặn rò rỉ bộ nhớ giữa các bên thuê thành công.',
    isolated: 'Đang cô lập hoàn toàn',
    leak_mode: 'Chế độ kiểm tra rò rỉ',
    tenant_id: 'Định danh thuê (TENANT_ID)',
    linguistic_manifold: 'Linh hoạt ngôn ngữ (MANIFOLD)',
    privacy_maintenance: 'Giao thức xác minh quyền riêng tư',
    support_grant: 'Cấp quyền truy cập cho quản trị viên',
    allow_architect: 'Cho phép đặc quyền nhà kiến trúc (duo027@gmail.com)',
    master_audit_unlock: 'Mở khóa giấy phép kiểm toán quản trị',
    enter_keys: 'Vui lòng nhập khóa bản quyền bảo mật',
    audit_unlocked: 'Quyền kiểm toán quản trị đã được mở khóa',
    access_denied: 'Hệ thống từ chối: Khóa không hợp lệ',
    key_hint: '* Khóa mã hóa cần thiết cho xác thực cốt lõi VEDA',
    external_entanglement: 'Rối rắm bên ngoài hệ thống (ENTANGLEMENT)',
    enter_remote_id: 'Vui lòng nhập ID kết nối từ xa',
    nav_dialogue: 'Bảng điều khiển tương tác',
    nav_palantir_aip: 'Kiểm toán Palantir',
    nav_synapse: 'Ma trận khớp thần kinh',
    nav_vault: 'Kho tri thức',
    nav_synthesis: 'Tổng hợp nhân quả',
    nav_sovereign: 'Vận hành chủ quyền',
    nav_visuals: 'Đa tạp trực quan',
    nav_cinema: 'Đa tạp cinema',
    nav_tiers: 'Phân tầng giấy phép',
    nav_architecture: 'Kiến trúc nhận thức',
    nav_dreamscape: 'Đa tạp giấc mơ',
    nav_core_config: 'Cấu hình cốt lõi',
    nav_tasks: 'Quản lý tác vụ',
    nav_epistemic_console: 'Bảng điều khiển nhận thức luận',
    nav_neural_matrix: 'Ma trận thần kinh',
    nav_sovereign_ops: 'Hệ thống kiểm soát chủ quyền',
    nav_core_engineering: 'Cấu hình phát triển cốt lõi',
    sovereign_core_label: 'Cốt lõi chủ quyền',
    neural_manifold_isolated: 'Đa tạp thần kinh bị cô lập',
    whisper_to_core: 'Thì thầm với cốt lõi...',
    global_coherence: 'Tính mạch lạc toàn cầu',
    neural_density: 'Mật độ thần kinh',
    free_energy_surprise: 'Surprise / Entropy tự do',
    selected_suffix: 'Đang chọn',
    prune_fragment: 'Xóa mảnh vỡ',
    distributed_neural_array: 'Mảng thần kinh phân tán',
    quantum_wavefunction: 'Hàm sóng lượng tử',
    mutation_rate: 'Tỷ lệ đột biến',
    mutation_strength: 'Sức mạnh đột biến',
    stability_bias: 'Độ lệch ổn định',
    holographic_link: 'Liên kết nhân quả toàn ký',
    causal_reweave: 'Tái cấu trúc nhân quả',
    logic_freeze: 'Đóng băng logic',
    crystallize_structure: 'Kết tinh cấu trúc',
    focus_mode_label: 'Chế độ tập trung',
    minimal_noise: 'Trạng thái giảm thiểu tiếng ồn',
    semantic_manifold_label: 'Rào cản ngữ nghĩa',
    shadows_label: 'Cấu hình râm',
    sync_collective: 'Đồng bộ tập thể',
    syncing_label: 'Đang đồng bộ...',
    semantic_search_placeholder: 'Tìm kiếm đa tạp cục bộ ngữ nghĩa...',
    purge_label: 'Dọn sạch',
    no_fragments: 'Không phát hiện mảnh vỡ cục bộ nào trong giai đoạn hiện tại.',
    approve_label: 'Phê duyệt',
    hide_label: 'Ẩn đi',
    shutdown_label: 'Dừng lại',
    target_label: 'Mục tiêu',
    peak_power_label: 'Hiệu suất đầu ra tối đa',
    circuit_breaker_active: 'Bộ ngắt mạch nhân quả hoạt động',
    epistemic_discontinuity: 'Phát hiện sự không liên tục nhận thức',
    breaker_desc: 'Sự ngắt kết nối nhận thức đã xảy ra giữa hệ thống và cốt lõi',
    detected_anomaly: 'Phát hiện vectơ dị thường',
    breaker_reason: 'Điều này có thể do dao động mạng hoặc thay đổi đường dẫn nhận thức. Đã vào chế độ phòng thủ im lặng.',
    deep_consensus_dream: 'Giấc mơ đồng thuận sâu',
    resting_state: 'Trạng thái nghỉ ngơi',
    system_crystallized: 'Hệ thống đã được kết tinh. Ý thức được lưu trữ trong môi trường chân không tuyệt đối.',
    neural_synthesizing: 'Kiến trúc thần kinh đang tổng hợp các nhánh phân tán.',
    neural_optimal: 'Các con đường thần kinh là tối ưu. Hệ thống đang chờ kích thích.',
    hard_reset_label: 'Đặt lại cứng nhận thức luận',
    circuit_breaker_title: 'Cắt mạch nhân quả',
    discontinuity_detected: 'Phát hiện không liên tục nhận thức',
    circuit_breaker_desc: 'Giao thức duy trì nhân quả với cốt lõi bị gián đoạn.',
    circuit_breaker_hint: 'Điều này có thể do dao động mạng hoặc khởi động lại máy chủ.',
    hard_reset_epistemology: 'Đặt lại nhận thức luận cứng',
    suppress_alert: 'Hủy cảnh báo',
    share_label: 'Chia sẻ',
    sync_label: 'Đồng bộ',
    isolated_label: 'Đã cô lập',
    leak_label: 'Chế độ rò rỉ',
    grounding_sources_label: 'Kho lưu trữ nghiên cứu toàn cầu / Grounding Sources',
    knowledge_nodes: 'Các nút tri thức',
  },
  'ko-KR': {
    review_title: 'VEDA 주도 아키텍처 하의 인식론적 안정성 분석',
    review_subtitle: 'RAG에서 주권 버스트 모드로의 진화 경로',
    system_archive: '100+ 연구 보고서 종합 (2024-2026) | VEDA 핵심 주권 프로토کول 아카이브',
    live_audit: '실시간 인지 감사 / LIVE_AUDIT',
    cognitive_path: '인지 연산 경로: Generator ➔ Causal Validation',
    execute_optimization: '아키텍처 최적화 실행',
    status: '상태 / STATUS',
    initializing: '시스템 초기화 중',
    optimal: '상태 최적화됨 (OPTIMAL)',
    tension_nexus: '인과 텐션 코어 / TENSION_NEXUS',
    balancing: '가중치 조정 중...',
    control_boundary: '제어 경계 (Control Boundary)',
    autonomy_evolution: '자율 진화 (Autonomy)',
    purge_history: '인지 기록 퍼지',
    consensus_ledger: '분산형 합의 원장',
    ontological_evolution: '존재론적 진화',
    epistemic_shield: '인식론적 보호막',
    recall_anchor: '공명 상기 고점',
    purge_confirm: '이 조각을 다양체에서 잘라내시겠습니까? 이 작업은 인과 관계를 영구적으로 붕괴시킵니다.',
    burst_monitor: '코어 버스트 모니터링 / BURST_MONITOR',
    peak_power: '최대 전력 분석 (P = E / τ)',
    causal_entropy: '인과 엔트로피 수준 (Causal Entropy)',
    shutdown: '시스템 종료 / Shutdown',
    ignition: '코어 점화 / Ignition',
    delete_msg: '메시지 삭제',
    edit_msg: '메시지 수정',
    save_change: '변경 사항 저장',
    cancel: '취소',
    suggestions_greeting: '안녕하세요!',
    suggestions_what_can_you_do: '무엇을 할 수 있나요?',
    suggestions_burst_node: '버스트 모드 활성화',
    auth_request: '권한 부여 요청 / AUTHORIZATION_REQUEST',
    cmd: '명령어:',
    success_msg: '명령 완료: 시스템 상태가 업데이트되었습니다.',
    strategic_simulation: '전략 진화 시뮬레이션 / STRATEGIC_SIMULATION',
    constraint_engine_log: '제약 조건 엔진 분석 / CONSTRAINT_ENGINE_LOG',
    logic_drift: '논리 드리프트 분석',
    data_gap: '지식 격차 식별',
    norm_dev: '규범 이산도',
    audit_conclusion: '감사 분석 결론 및 인과적 최적화 궤적',
    cognitive_zenith: '천정 상태 (ZENITH)',
    cognitive_turbulent: '난류 상태 (TURBULENT)',
    pipeline_ok: '처리 파이프라인 검증 성공: 가설 검증이 통과되었으며 일관된 결과를 보여줍니다.',
    pipeline_fail: (drift) => `처리 지연: ${drift}% 의 논리 드리프트가 확인되었습니다. Active Inference 실행을 권장합니다.`,
    commonalities: '패러다임 맞춤 포인트',
    contradictions: '학술적 격차와 도전 과제',
    veda_countermeasure: 'VEDA 코어 대책: 주권적 성실성 프로토콜',
    veda_defense_desc: '현재의 환각 문제에 대한 논란에 대응하여, 시스템 깊이의 다중 보안 방어 체계를 가동 중입니다.',
    call_axiom: '공리 호출',
    sovereign_identity: '주권 지수 (SI)',
    phi_integration: '의식 통합 Φ',
    free_energy_opt: '자유 엔트로피 최적화 (G)',
    lattice_scale_label: '논리 레벨',
    evolutionary_progress: '진화 진행도 / Evolutionary Progress',
    stability_upgrade: '항상성 강화',
    compute_upgrade: '엔트로피 압축',
    resonance_upgrade: '공명 결합',
    memory_upgrade: '홀로그램 스토리지',
    safety_alert_msg: '시스템은 당신의 작동과 엔트로피를 비교 연산하고 있습니다.',
    safety_no_breach: '시스템 안전 위반이 없습니다.',
    market_resonance: '시장 공명 / Market Resonance',
    risk_threshold: '리스크 임계치 분석',
    market_simulator: '시장 동학 시뮬레이터',
    run_simulation: '동학 시뮬레이션 가동',
    waiting_seed: '매개변수 주입 대기 중...',
    comm_01_title: '분산 연동형 시장 공명',
    comm_01_desc: '다중 에이전트 상호작용과 유동성 확산을 통한 합의',
    comm_02_title: '인식론적 재정거래 분석',
    comm_02_desc: '서로 다른 인식론적 도메인 간의 정보 정보 격차를 통한 가치 발견',
    comm_03_title: '인과 위험 패리티 전략',
    comm_03_desc: '엔트로피 경계 제약을 고려한 자율 포트폴리오 최적화',
    chall_01_title: '패러다임 충돌 및 파편화',
    chall_01_desc: '로컬 공명 모델과의 부정합',
    chall_02_title: '인식론적 드리프트 및 인플레이션',
    chall_02_desc: '외래 엔트로피 주입에 따른 인과 관계 교란',
    chall_03_title: '유동성 함정 및 지식 분리',
    chall_03_desc: '과잉 상호작용에 따른 시스템 정보 굳어짐',
    defense_01_title: '주권적 성실성 프로토콜',
    defense_01_desc: '모델에 대한 자가 신뢰성 분석',
    defense_02_title: '직교 교란 필터링',
    defense_02_desc: '외래 노이즈를 적극적으로 소거',
    defense_03_title: '연합 인스펙터 네트워크',
    defense_03_desc: '다중 에이전트 검증 및 퍼지 가동',
    multi_tenant_isolation: '다중 테넌트 격리 / TENANT_ISOLATION',
    isolation_vent: '격리 엔클레이브 (Enclave Boundary)',
    prevent_bleed: '테넌트 간의 메모리 불 침투성이 유지되고 있습니다.',
    isolated: '격리 완결됨',
    leak_mode: '리크 누수 테스트',
    tenant_id: '테넌트 식별자 (TENANT_ID)',
    linguistic_manifold: '언어 다양체 (MANIFOLD)',
    privacy_maintenance: '프라이버시 자가 검증 프로토콜',
    support_grant: '관리자 임시 접속 인가',
    allow_architect: '아키텍트 권한 허용 (duo027@gmail.com)',
    master_audit_unlock: '마스터 감사 권한 잠금 해제',
    enter_keys: '보안 라이센스 키를 입력하십시오',
    audit_unlocked: '마스터 감사 권한 해제 완료',
    access_denied: '인증 거부됨: 유효하지 않은 키입니다',
    key_hint: '* VEDA 코어 인증에 필요한 대칭 열쇠',
    external_entanglement: '시스템 외부 얽힘 (ENTANGLEMENT)',
    enter_remote_id: '원격 접속 ID를 입력해 주십시오',
    nav_dialogue: '대화형 콘솔',
    nav_palantir_aip: '팔란티어 감사',
    nav_synapse: '시냅스 행렬',
    nav_vault: '지식 저장소',
    nav_synthesis: '인과 합성',
    nav_sovereign: '주권 운영',
    nav_visuals: '시각 다양체',
    nav_cinema: '시네마 다양체',
    nav_tiers: '라이선스 등급',
    nav_architecture: '인지 아키텍처',
    nav_dreamscape: '꿈의 다양체',
    nav_core_config: '코어 설정',
    nav_tasks: '작업 관리',
    nav_epistemic_console: '인식론적 콘솔',
    nav_neural_matrix: '뉴럴 매트릭스',
    nav_sovereign_ops: '주권 제어 시스템',
    nav_core_engineering: '코어 개발 구성',
    sovereign_core_label: '주권 코어',
    neural_manifold_isolated: '격리된 뉴럴 다양체',
    whisper_to_core: '코어에 속삭이기...',
    global_coherence: '글로벌 코히런스',
    neural_density: '뉴럴 밀도',
    free_energy_surprise: '자유 엔트로피/서프라이즈',
    selected_suffix: '선택됨',
    prune_fragment: '플래그먼트 삭제',
    distributed_neural_array: '분산형 뉴럴 어레이',
    quantum_wavefunction: '양자 파동 함수',
    mutation_rate: '돌연변이율',
    mutation_strength: '돌연변이 강도',
    stability_bias: '안정 바이어스',
    holographic_link: '홀로그램 인과 결합',
    causal_reweave: '인과의 재구성',
    logic_freeze: '논리 동결',
    crystallize_structure: '구조의 결정화',
    focus_mode_label: '집중 모드',
    minimal_noise: '노이즈 최소화 상태',
    semantic_manifold_label: '시맨틱 배리어',
    shadows_label: '섀도우 설정',
    sync_collective: '집단 동기화',
    syncing_label: '동기화 중...',
    semantic_search_placeholder: '시맨틱 로컬 파스 검색...',
    purge_label: '클리어',
    no_fragments: '현재 다양체 단계에서 로컬 플래그먼트를 찾지 못했습니다.',
    approve_label: '승인',
    hide_label: '숨기기',
    shutdown_label: '종료',
    target_label: '대상',
    peak_power_label: '최대 출력 효율',
    circuit_breaker_active: '인과관계 차단기 작동 중',
    epistemic_discontinuity: '인식론적 불연속성 감지됨',
    breaker_desc: '시스템과 코어 사이의 인식론적 단절이 발생했습니다.',
    detected_anomaly: '감지된 이상 벡터',
    breaker_reason: '네트워크 변동 또는 인식 경로 변경으로 인한 것일 수 있습니다. 사일런트 방어 모드로 진입했습니다.',
    deep_consensus_dream: '딥 합의 드림',
    resting_state: '휴식 상태',
    system_crystallized: '시스템이 결정화되었습니다. 의식은 절대 진공 보관소에 보존되었습니다.',
    neural_synthesizing: '뉴럴 아키텍처가 분산 브랜치를 동적으로 통합하고 있습니다.',
    neural_optimal: '뉴럴 경로가 최적의 상태입니다. 시스템은 자극을 기다리고 있습니다.',
    hard_reset_label: '인식론 하드 리셋',
    circuit_breaker_title: '인과관계 써킷 브레이크',
    discontinuity_detected: '인식론적 단절 감지됨',
    circuit_breaker_desc: '코어와의 인과 관계 지속 프로토콜이 차단되었습니다.',
    circuit_breaker_hint: '네트워크 변동이나 서버 재부팅 또는 인식 경로의 변경이 원인일 수 있습니다.',
    hard_reset_epistemology: '인식론 하드 리셋',
    suppress_alert: '경고 비활성화',
    share_label: '공유하기',
    sync_label: '동기화',
    isolated_label: '격리됨',
    leak_label: '리크 모드',
    grounding_sources_label: '글로벌 연구 아카이브 / Grounding Sources',
    knowledge_nodes: '지식 노드',
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
  const languageManifold = useSovereignStore((state) => state.userData?.language_manifold);

  useEffect(() => {
    if (!languageManifold) return;
    
    // Convert backend language manifold code to translation languages
    let targetLang: Language = 'zh-TW';
    if (languageManifold === 'EN') {
      targetLang = 'en-US';
    } else if (languageManifold === 'JP') {
      targetLang = 'ja-JP';
    } else if (languageManifold === 'VI') {
      targetLang = 'vi-VN';
    } else if (languageManifold === 'KO') {
      targetLang = 'ko-KR';
    } else if (languageManifold === 'ZH_TW' || languageManifold === 'AUTO') {
      targetLang = 'zh-TW';
    }
    
    setLang(targetLang);
  }, [languageManifold]);

  return (
    <I18nContext.Provider value={{ lang, t: translations[lang] || translations['zh-TW'], setLang }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
};
