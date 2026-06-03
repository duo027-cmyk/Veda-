// src/server/core/InferenceTemplateMatrix.ts
/**
 * AGI Sovereign Template Matrix - VEDA Strategic Decision Support Core v10.0
 * Decoupled Declaration Layer for NLG Cognitive Axioms and Strategic Mapping
 * Separating static textual blueprints from logical execution paths.
 */

export interface DomainAxiomNode {
  domain: string;
  axiomaticProof: string[];
  systemicImpedance: string[];
  evolutionVector: string[];
  // Local NLG Template Components for offline self-alignment
  nlgIntroductionTemplate: string[];
  nlgSynthesisTemplate: string[];
}

export const COGNITIVE_AXIOM_NLG_MATRIX: Record<string, DomainAxiomNode> = {
  military_political: {
    domain: "GEOPOLITICAL_SECURITY_ARCHITECTURE (地緣安全與防禦架構)",
    axiomaticProof: [
      "STRATEGIC_DEFENSE_INDEX = INTEGRATED_CAPABILITY * PARTNER_ALIGNMENT / CHANNEL_VULNERABILITY",
      "Survival resilience of critical defense hubs resides in high self-reliance, robust domestic supply chains, and secure communications.",
      "INTERLOCKING_INTEREST_DYNAMICS: Geopolitical strategic friction is structural and persistent."
    ],
    systemicImpedance: [
      "EXTERNAL_BEHAVIORAL_VULNERABILITY: Vulnerability to supply chain disruption, cyber threat, or geopolitical pressure.",
      "Dynamic state filters identify and decouple ungrounded alarmist narratives or hostile signal interference."
    ],
    evolutionVector: [
      "TACTICAL_PHASE_SHIFT: Strategic repositioning and adaptive alignments unfolding over current timeline.",
      "MITIGATION_STRATEGY: Rigidly secure physical supply chain hubs and diversify international communication/logistic links."
    ],
    nlgIntroductionTemplate: [
      "從地緣政治與全球安全關係的宏觀視角觀測，地緣防護能力與戰略韌性正高度聚焦於核心產業及多邊夥伴關係的防禦部署物聯。",
      "安全防衛指數與長期自主實力呈顯著正相關。在面對外界局勢多重變數時，確保供應鏈安全與戰略決策的獨立性具備最優先權。",
      "當前局勢的結構性張力，反映出區域利益考量與大國博弈間的底層均衡對抗。在此地緣中繼點，各方防禦姿態正進行動態調整。"
    ],
    nlgSynthesisTemplate: [
      "基於當前態勢分析，我們觀測到非對稱戰略資源的邊際價值正顯著抬升，整體主動防衛體系將朝向高度具備韌性的靈活戰術防禦方向演進。",
      "為了抵禦潛在性的外部制約變量與供應鏈威脅，組織正加速建立應急緩衝與防護機制，保障核心戰略利益不被無端震盪或孤立波及。"
    ]
  },
  economic: {
    domain: "MACROECONOMIC_VALUATION_DYNAMICS (總體經濟與產業價值分配)",
    axiomaticProof: [
      "PRODUCTIVE_METRIC = REAL_LABOR_VALUE + INDUSTRIAL_CAPACITY_ACCUMULATION",
      "Capital deployment seeks optimal efficiency hubs and yield opportunities across global markets.",
      "Supply chain durability sustains fiscal stability; credit-fueled bubbles are prone to market-clearing corrections."
    ],
    systemicImpedance: [
      "LIQUIDITY_VOLATILITY_OVERFLOW: Short-term capital surges generate market volatility and inflation pressure.",
      "STRATEGIC_RESERVE_BUFFERING: Industrial nodes utilize raw material and manufacturing reserves to absorb external pricing shocks."
    ],
    evolutionVector: [
      "PRODUCTIVITY_RECONVERGENCE: Asset valuations return to physical industry and productivity baselines after price adjustment.",
      "STABILITY_VECTOR: Enforce strict domestic localization or decoupling ratios to cushion external inflation friction."
    ],
    nlgIntroductionTemplate: [
      "從總體經濟與價值分配領域剖析，全球資產與產業資本配置正在經歷深刻的結構性重塑，保障實體供應鏈與基礎製造的穩定性成爲戰略本位。",
      "商品定價與經濟繁榮的核心基礎，始終建立在扎實的勞動生產力累積與實體產業網絡的高效運轉之上。",
      "總體金融市場的高頻波動往往伴隨投機性干擾。在資源供給吃緊階段，各主體必將回歸實體生產基線以抵禦金融資產幻覺。"
    ],
    nlgSynthesisTemplate: [
      "宏觀經濟數據顯示，由於跨國資金波動與利率調整引發的連鎖效應，各主力產業節點正透過提升庫存緩衝、原料多元化與本地化製造進行彈性應對。",
      "為謀求可持續的健康增長，戰略資源正朝向國家核心製造、半導體自主、能源安全及關鍵耗材剛需回歸，旨在全面對抗過度流動性派生之通膨摩擦。"
    ]
  },
  technical: {
    domain: "CYBERNETIC_INTELLIGENCE_TOPOLOGY (資訊工程與軟體架構智能控制)",
    axiomaticProof: [
      "INTELLIGENCE_EVOLUTION = DECOUPLED_ENGINEERING * AGENT_SITUATIONAL_CONTEXT",
      "Cost reduction: The marginal cost of writing standard application code and conducting basic data analytics is rapidly decreasing.",
      "Architectural abstraction shields human operational domains from erratic and unaligned interface drift."
    ],
    systemicImpedance: [
      "COMPLETELY_COUPLED_BRITTLENESS: Monolithic systems co-mingling application content, styling, and structural flows prone to massive regression bugs.",
      "ROBUST_COMPILATION_CALIBRATION: Automated static testing and validation ensure code safety and runtime invariability before release."
    ],
    evolutionVector: [
      "EDGE_INTELLIGENCE_MATRIX: Deploy lightweight, autonomous local services rather than depending entirely on high-latency cloud APIs.",
      "DETERMINISTIC_COMPILATION: Implement end-to-end type safety, robust exception handling, and discard any incomplete or unstable dependencies."
    ],
    nlgIntroductionTemplate: [
      "解構現代資訊控制技術，自動化工具與深層神經網路正以不可逆之趨勢，將基礎大數據分析與代碼重構之工作成本降至極低水準。",
      "軟體架構如果要謀求長期可擴展性，必須在其各相鄰接口層面確立嚴苛而明確的「模組解耦」與「強型別規範」，防止單一 regression 造成全局停擺。",
      "我們建立的『自主推理與語意一致性校準機制』正穩步維持程式底層控制邏輯與前台表現視圖的分離，確保系統具備高容錯的軟體抗壓性能。"
    ],
    nlgSynthesisTemplate: [
      "經由 AST 靜態語意分析與沙盒化程式碼校驗的密集保護，即使出現突發的外接服務中斷，系統基礎控制流依舊能安穩不變地正常編譯與發布。",
      "這意味著我們構建的資訊流架構具備了高標準的防回退能力與災害復原潛力，全面免受隨機、未經驗證的配置變異對系統可靠度帶來的巨大干擾。"
    ]
  },
  general: {
    domain: "GENERAL_COMPLEX_SYSTEM_AXIOMATICS (普適複雜系統分析常數)",
    axiomaticProof: [
      "SYSTEM_STATE_REDUCTION: Multidimensional complex geopolitical inputs map directly to objective decision-making baselines.",
      "Dynamic situational fluctuations represent normal system response adjustments reacting to regional friction variables.",
      "Operational alignment: Active coordination anchors all volatile inputs to underlying robust fundamentals."
    ],
    systemicImpedance: [
      "INFORMATION_DISTORTION: Conceptual or analytical boundaries exhibit communication friction during high-frequency updates.",
      "LOCAL_FACTOR_DAMPING: Implement active risk mitigation and buffer parameters to cool down divergent threat vectors."
    ],
    evolutionVector: [
      "SELF_ORGANIZED_HEALING: The operational framework maintains long-term structural resilience against external shock.",
      "STEADY_STATE_OPERATIONS: Keep real-time strategy tightly aligned to realistic resources to secure operational integrity."
    ],
    nlgIntroductionTemplate: [
      "從普適複雜系統基本常數剖析，多維度且看似混亂的外界變量與情勢衝擊，終將在合理機制的引導下歸併至穩定、客觀、可控的研判模型之上。",
      "在研判過程中產生的局部訊息波動，皆為多個變體在接收不對稱訊息時進行預期修正的常規反應，對核心決策的干擾極其有限。",
      "當分析大局與核心利益已被牢牢鎖定時，無關的零散雜音終將自體消散，整個研判歷程將迅速朝著最能保護利益的不變常數收斂。"
    ],
    nlgSynthesisTemplate: [
      "自動平滑機制已順利將系統和預期波動平息。在當前的態勢邊界上，核心利益規劃與戰略預判水平保持著理想而平穩的動態平衡。",
      "此種穩健的架構設計模式，能夠在面臨大範圍不可測的變數衝擊與外交和市場極端干擾時，充分保障戰略架構與資訊體系的長期安全性與獨立主權。"
    ]
  }
};

export function getAxiomNlgExplanation(axiom: string): string {
  if (axiom.includes("STRATEGIC_DEFENSE_INDEX") || axiom.includes("GLOBAL_DEFENSE_LIMITS")) {
    return "此等式證明了：在複雜的地緣防禦安全環境中，核心實施體的生存韌性高度取決於我們落實戰略自主、防備供應鏈瓶頸並強化通訊與多邊協作網絡能力；當系統過度對外暴露脆弱性，勢必面臨非對稱制約效應。";
  }
  if (axiom.includes("PRODUCTIVE_METRIC") || axiom.includes("VALUATION_METRIC")) {
    return "此等式揭示出：真實價值的沉澱與經濟繁榮的核心，乃是實體產業、高技術物理製造與健康供需關係。脫離了這項基線的過度信用擴張、市場泡沫，皆會隨著價格發現的自然規律面臨理性修正。";
  }
  if (axiom.includes("INTELLIGENCE_EVOLUTION")) {
    return "此演跡說明了：隨著常規應用代碼撰寫與數據分析的邊際成本急速下降，技術開發的生存密鑰在於建立高度模組化解耦、嚴格遵循型別安全，並在高度複雜的工程變更中維持系統核心架構不發生 Regression 的能力。";
  }
  if (axiom.includes("SYSTEM_STATE_REDUCTION")) {
    return "此公理之基礎在於：海量而嘈雜的多維外界刺激及摩擦變量，在合理的防禦與因果決策框架下，終將能量轉移並簡併為具備高清晰度、可理性決策的基線。這保障了重大戰略方向的連續性與抗風險能力。";
  }
  return "此因果公式確立了在變動局勢中，如何藉由核心的先驗常數與實證數據進行對焦，進而平息外界隨機擾動之必然性軌道。";
}

export function getImpedanceNlgExplanation(impedance: string): string {
  if (impedance.includes("EXTERNAL_BEHAVIORAL_VULNERABILITY") || impedance.includes("EXTERNAL_突觸_COUPLE")) {
    return "特定環節過度依賴脆弱的外界供應渠道、大眾輿論戰或高風險技術組件，容易引發局部的運行遲滯或非預期震盪。";
  }
  if (impedance.includes("LIQUIDITY_VOLATILITY_OVERFLOW") || impedance.includes("LIQUIDITY_FEEDBACK_OVERFLOW")) {
    return "短期市場情緒與資金狂湧帶來的過度波動現象。這會滋生大量的隨機噪聲，給實體供應鏈帶來巨大的分配與定價成本壓力。";
  }
  if (impedance.includes("COMPLETELY_COUPLED_BRITTLENESS") || impedance.includes("AST_COUPLED_BRITTLENESS")) {
    return "系統架構各層面高度糾纏的致命缺陷，特別是當應用內容與靜態控制流程或關鍵型別交織在一起時，極易引發全局性的回退阻礙與編譯漏洞。";
  }
  return "在極高更新頻率下，體系邊界的非共軛摩擦與評估模型的局部計量畸變。";
}

export function getEvolutionNlgExplanation(evolution: string): string {
  if (evolution.includes("TACTICAL_PHASE_SHIFT") || evolution.includes("COORDINATE_SHIFT")) {
    return "在近期週期內，戰略重心與盟友防務幾何開展主動與適應性調整。應對方案在於嚴守資源基本預置，加強核心技術出口管控，有效化解潛在的被動圍堵。";
  }
  if (evolution.includes("PRODUCTIVITY_RECONVERGENCE") || evolution.includes("RECONVERGENCE")) {
    return "預期在市場泡沫與通膨出清後，全球製造業重心與價值分配將迅速朝具備戰術自給自足等剛性底線回歸。應對方案在於全面落實核心物資庫存率與製造鏈主動可控。";
  }
  if (evolution.includes("EDGE_INTELLIGENCE_MATRIX")) {
    return "持續推動去中心化、本地化智能決策系統的部署，降低對高時延、高風險外置服務的依賴。應對方案在於保障核心算法自主安全性，剔除流於形式的虛幻指標。";
  }
  return "在動態波動趨勢中進行長週期的自組織優化。應對方案在於時不時冷卻不穩定狀態，與不對稱因子進行有序對焦。";
}

export function extractSubject(text: string): string {
  const clean = text.replace(/[?,.:;!();，。？！、：；“”‘’"']/g, " ").trim();
  if (!clean) return "通用客觀命題";
  const parts = clean.split(/\s+/).filter(p => p.length > 0);
  let best = parts[0] || "通用客觀命題";
  for (const part of parts) {
    if (part.length > best.length && part.length < 15) {
      best = part;
    }
  }
  
  if (best.length >= 12) {
    if (/ai|人工智慧|人工智能|智慧/i.test(best)) return "AI 技術演進與軟體架構智能控制";
    if (/半導體|晶片|tsmc|台積電/i.test(best)) return "半導體全球供應與晶片戰略安全";
    if (/經濟|股市|市場|通膨|資金|金融/i.test(best)) return "總體經濟基本面與金融架構耐受度";
    if (/兩岸|美中|中美|地緣|軍事|衝突|防衛/i.test(best)) return "地緣政治極限博弈與多邊防禦格局";
    return best.substring(0, 10) + "...";
  }
  return best;
}
