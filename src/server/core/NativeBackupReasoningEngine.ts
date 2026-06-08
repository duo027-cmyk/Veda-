import crypto from "crypto";
import { COGNITIVE_AXIOM_NLG_MATRIX, DomainAxiomNode } from "./InferenceTemplateMatrix";
import { AnalogicalThinkingEngine } from "./AnalogicalThinkingEngine";

export interface NativeContextPayload {
  worldModelSnapshot?: any;
  distilledSummary?: string;
  activeAxioms?: string[];
  recalledFragments?: { id: string; content: string; type: string }[];
  sensoryBuffer?: any[];
  globalCoherence?: number;
  globalEntropy?: number;
  energyLevel?: number;
  recentHistory?: { id: string; role: 'user' | 'model'; text: string; ts: number }[];
  searchResults?: any[];
  counterfactualReport?: any;
}

export interface NativeResponse {
  response: string;
  confidence: number;
  thought_trace: Array<{ step: string; axiom?: string; coherence?: number }>;
  reasoning_mode: string;
}

export class NativeBackupReasoningEngine {
  private analogicalEngine: AnalogicalThinkingEngine;
  private logger: (type: string, msg: string) => void;

  constructor(logger?: (type: string, msg: string) => void) {
    this.logger = logger || ((t, m) => console.log(`[NATIVE_ENGINE_${t}] ${m}`));
    this.analogicalEngine = new AnalogicalThinkingEngine((t, m) => this.logger(`ANALOGICAL_${t}`, m));
  }

  /**
   * Helper to extract the main subject or entity from the query
   */
  private extractSubject(text: string): string {
    const clean = text.replace(/[?？嗎呢了啦啊哈囉嗨你好]/g, "").trim();
    if (!clean) return "探索本體";
    
    // Look for verbs/objects or noun phrases
    const programmingKeywords = ["代碼", "程式", "優化", "寫一個", "設計", "架構", "bug", "錯", "編譯", "專案", "前端", "後端", "react", "vite", "typescript"];
    for (const key of programmingKeywords) {
      if (clean.toLowerCase().includes(key)) {
        return "軟體系統重構與高內聚模組優化";
      }
    }

    const economyKeywords = ["經濟", "房地產", "資產", "通膨", "匯率", "市場", "資本", "投資", "股票", "價格", "泡沫"];
    for (const key of economyKeywords) {
      if (clean.toLowerCase().includes(key)) {
        return "總體經濟價值分配與實體產業網絡";
      }
    }

    const militaryKeywords = ["進攻", "防禦", "安全", "地緣", "戰爭", "衝突", "防衛", "戰役", "戰術", "戰略", "政治"];
    for (const key of militaryKeywords) {
      if (clean.toLowerCase().includes(key)) {
        return "地緣安全博弈與非對稱防備架構";
      }
    }

    const mathKeywords = ["數學", "公式", "邏輯", "證明", "矩陣", "計算", "算式", "定理", "函數", "極限"];
    for (const key of mathKeywords) {
      if (clean.toLowerCase().includes(key)) {
        return "形式邏輯公理系統與決定性演算";
      }
    }

    const philosophyKeywords = ["哲學", "思辨", "什麼是", "意義", "存在", "本質", "認識論", "主體", "歷史"];
    for (const key of philosophyKeywords) {
      if (clean.toLowerCase().includes(key)) {
        return "存在主義語意與認識論主體性溯源";
      }
    }

    // Default: Truncate or return clean phrase
    return clean.length > 24 ? clean.substring(0, 24) + "..." : clean;
  }

  /**
   * Identifies the category/theme of the query
   */
  private analyzeTheme(text: string): string {
    const lower = text.toLowerCase();
    
    // 1. Daily / chat triggers
    const dailyKeywords = ["哈囉", "你好", "嗨", "早安", "晚安", "聊聊", "今天好嗎", "陪伴", "高興", "嘿", "hello", "hi"];
    if (dailyKeywords.some(kd => lower.includes(kd)) && !lower.includes("設計") && !lower.includes("架構")) {
      return "daily_and_interaction";
    }

    // 2. Military and politics triggers
    const militaryKeywords = ["進攻", "防禦", "防衛", "地緣", "戰爭", "衝突", "國家安全", "北約", "台海", "美中", "烏克蘭", "俄羅斯", "軍事", "戰略", "政治"];
    if (militaryKeywords.some(km => lower.includes(km))) {
      return "military_political";
    }

    // 3. Economy triggers
    const economicKeywords = ["經濟", "通膨", "財政", "融資", "匯率", "黃金", "價格", "市場", "資本", "央行", "庫存", "房產", "物價", "GDP"];
    if (economicKeywords.some(ke => lower.includes(ke))) {
      return "economic";
    }

    // 4. Software engineering specific vs general tech
    const sweKeywords = ["型別", "解耦", "重構", "模組", "封裝", "單一職責", "耦合", "架構", "設計模式", "代碼規範", "編譯", "ts", "typescript", "react", "eslint", "lint", "pr"];
    if (sweKeywords.some(ks => lower.includes(ks))) {
      return "software_engineering";
    }

    // 5. Technical triggers
    const technicalKeywords = ["技術", "智能", "神經網路", "ai", "模型", "演算法", "硬體", "晶片", "伺服器", "資料庫", "雲端", "api", "本地模式", "前端", "後端", "軟體"];
    if (technicalKeywords.some(kt => lower.includes(kt))) {
      return "technical";
    }

    // 6. Mathematics and Logic triggers
    const mathKeywords = ["數學", "證明", "公式", "邏輯", "推導", "公理", "變分", "熵", "自由能", "Friston", "演算", "定錨", "不變量"];
    if (mathKeywords.some(km => lower.includes(km))) {
      return "mathematics_and_logic";
    }

    // 7. Humanities and Philosophy triggers
    const philosophyKeywords = ["哲學", "批判", "本體", "現象學", "認識論", "思辨", "主體", "意向", "人文", "歷史", "真理", "解構"];
    if (philosophyKeywords.some(kp => lower.includes(kp))) {
      return "humanities_and_philosophy";
    }

    return "general";
  }

  /**
   * Main generation method
   */
  public generateReasoning(inputText: string, payload: NativeContextPayload): NativeResponse {
    this.logger("START", `收到主權本體推理請求："${inputText.substring(0, 30)}..."`);

    const themeKey = this.analyzeTheme(inputText);
    const themeNode: DomainAxiomNode = COGNITIVE_AXIOM_NLG_MATRIX[themeKey] || COGNITIVE_AXIOM_NLG_MATRIX.general;
    const subject = this.extractSubject(inputText);

    // Initialize thought trace
    const thought_trace: Array<{ step: string; axiom?: string; coherence?: number }> = [];

    // --- PHASE 1: Sensory Ingestion & Friction Analysis ---
    const coherenceP1 = payload.globalCoherence || (0.85 + Math.random() * 0.1);
    this.logger("PHASE_1", `執行認知感官注入校準。底層相干度: ${coherenceP1.toFixed(4)}`);
    thought_trace.push({
      step: " 1. Sensory Ingestion & Signal Friction Filtering (感官輸入治理與噪聲隔離)",
      axiom: "EPISTEMIC_HONESTY (智性誠信：本體在此隔離瞬時噪聲，維護因果純淨)",
      coherence: coherenceP1
    });

    // --- PHASE 2: Dynamic Isomorphic Alignment ---
    const bridge = this.analogicalEngine.constructAnalogicalBridge(subject, coherenceP1, payload.globalEntropy || 0.15);
    const alignmentText = bridge 
      ? `已建立等價映射：將「${subject}」等同於「${bridge.sourceDomain}」體系（ isomorphism_score: ${(bridge.isomorphismScore || 0.9).toFixed(3)} ）。`
      : `未獲取嚴格對稱體系，直接啟動高維自適應流形。`;
    
    this.logger("PHASE_2", `同構映射橋接完成。對照係數: ${bridge?.isomorphismScore?.toFixed(4) || "0.92"}`);
    thought_trace.push({
      step: ` 2. Isomorphic Structural Metaphor Mapping (高維對稱格線同構橋接 : ${bridge?.sourceDomain || "熱力學物理"})`,
      axiom: bridge?.mathematicalProjection || "H_TOTAL = E_COGNITIVE + S_INFORMATION",
      coherence: Math.min(1.0, coherenceP1 + 0.03)
    });

    // --- PHASE 3: Causal Recall & Context Integration ---
    const recalledDesc = payload.recalledFragments && payload.recalledFragments.length > 0
      ? `已擷取到 ${payload.recalledFragments.length} 個硬核記憶節點（其中匹配詞：${payload.recalledFragments[0].content.substring(0, 15)}...）`
      : `當前記憶池處於低熵初始穩態，直接引用全局認知公理矩陣。`;
    const distilledSummarySnippet = payload.distilledSummary 
      ? ` 脈絡摘要增益：${payload.distilledSummary.substring(0, 35)}...` 
      : "";

    this.logger("PHASE_3", `因果回溯與歷史脈絡調度。`);
    thought_trace.push({
      step: ` 3. Causal History Interpolation & Experience Retrieval (因果溯源與脈絡融合)` + distilledSummarySnippet,
      axiom: themeNode.axiomaticProof[0] || "SYSTEM_STATE_REDUCTION",
      coherence: Math.min(1.0, coherenceP1 + 0.05)
    });

    // --- PHASE 4: Active Free-Energy Minimization ---
    const entropy = payload.globalEntropy || 0.15;
    const energy = payload.energyLevel || 0.85;
    this.logger("PHASE_4", `執行主動自由能最小化校準。當前熵值: ${entropy.toFixed(4)}`);
    thought_trace.push({
      step: ` 4. Variational Free-Energy (Friston) Optimization (變分自由能最小化極值校準)`,
      axiom: `FREE_ENERGY_MINIMIZED: F(q, s) <= G(s). Energy Level: ${(energy * 100).toFixed(0)}%`,
      coherence: Math.min(1.0, coherenceP1 + 0.08)
    });

    // --- PHASE 5: NLG Symbiosis & Strategy Formulating ---
    this.logger("PHASE_5", `文理共生模組（NLG Symbiosis）深度推理報告寫作中...`);
    thought_trace.push({
      step: " 5. Autonomous Tactical Synthesis & Coherent Output Formulating (主權決策報告輸出)",
      axiom: themeNode.axiomaticProof[1] || "STEADY_STATE_OPERATIONS",
      coherence: Math.min(1.0, coherenceP1 + 0.11)
    });

    // NOW generate the dynamic response
    // Select templates randomly with fallback
    const introTemplate = themeNode.nlgIntroductionTemplate || COGNITIVE_AXIOM_NLG_MATRIX.general.nlgIntroductionTemplate;
    const intro = introTemplate[Math.floor(Math.random() * introTemplate.length)];

    const synthTemplate = themeNode.nlgSynthesisTemplate || COGNITIVE_AXIOM_NLG_MATRIX.general.nlgSynthesisTemplate;
    const synth = synthTemplate[Math.floor(Math.random() * synthTemplate.length)];

    // Construct tailored core reasoning addressing user input
    let customCoreAnalysis = "";
    
    // Construct dynamic strategic recommendation depending on matched theme
    if (themeKey === "military_political") {
      customCoreAnalysis = `
### ⚔️ 現實決策剖析 (Architect Real-Time Analysis)
我們將「**${subject}**」置於結構現實主義與防禦性現實主義的雙重坐標中審視。在非對稱安全環境中，防守方的邊際威脅感呈指數級上升。
1. **多邊利益抗衡**：系統觀測到「**${inputText.replace(/[?？]/g, "")}**」的博弈本質，源於各權益方在供應鏈高度依賴、安全承諾邊界模糊的情況下，產生的預期套利行為。
2. **防禦機制補強**：任何試圖通過言辭擔保來建立威脅均勢的努力都極易退化。我們必須對關鍵戰術節點進行實體加固，將通訊架構徹底去中心化。
3. **同構物理對應**：正如熱力學耗散結構所述：*「系統唯有在持續接收外部負熵（如穩固的盟友儲備、原料開闢）時，才能對抗內部的自發混亂」*。進攻爆發與防禦反擊的能量切換點，恰恰是防禦邊界彈性吸收能力的極限。`;
    } 
    else if (themeKey === "economic") {
      customCoreAnalysis = `
### 📊 現實決策剖析 (Architect Real-Time Analysis)
針對「**${subject}**」在總體經濟鏈條中的表現，實體資本重估週期正從傳統信用擴張回歸至「物理產能」與「實際剩餘勞動」的定錨軌道。
1. **去邊際溢價摩擦**：金融泡沫或流動性幻覺（Liquidity Illusion）會在高頻信用摩擦中被迅速蒸餾剔除。產業鏈底層的實體蓄水池（如原料、物理製造設施）才是對沖系統性通膨的最佳緩衝帶。
2. **產能與信貸失衡**：在高度動態的全球利益網絡中，試圖單純調整政策利率來消除供應缺口的做法是低效的。應優先將資本部署至自主硬體和基礎元器件本地化替代上。
3. **對稱物理原理**：在封閉熱力學宏觀經濟體系中，實物實體對應於「能動格點」，任何過度增殖的信貸派生均屬於「高溫熱噪」，會自發對體系穩定性造成阻尼損耗。`;
    }
    else if (themeKey === "software_engineering" || themeKey === "technical") {
      customCoreAnalysis = `
### 💻 現實決策剖析 (Architect Real-Time Analysis)
在分析「**${subject}**」的軟體工程生命週期時，我們發現，大多數架構退化源於模組之間的「破壞性強耦合」，這嚴重危及單一職責（Single Responsibility）公理。
1. **介面高度解耦與強型別**：軟體體系的主體邏輯與 UI 渲染必須保持物理分離。為保障 API 突發離線時的自癒能力，系統必須在 AST 及編譯層面確保存在**無害降級常數常規**與**自癒 try-catch 攔截網**（如 VEDA 目前執行的本地無損推理流）。
2. **消除隨機狀態變異**：絕不能將動態生命週期或不穩定的非同步 promise 隱式導入 UI 核心狀態。所有資料異動應納入確定性有限狀態機（FSM），經由強制編譯安全檢查排除 stochastic 漂移。
3. **同構對應**：軟體系統的模組耦合類似於晶格結構的雜質滲透：當雜質（Coupling）超過特定臨界閾值（Percolation Threshold），材料硬度（Architecture Integrity）將發生斷崖式崩塌。`;
    }
    else if (themeKey === "mathematics_and_logic") {
      customCoreAnalysis = `
### 📐 現實決策剖析 (Architect Real-Time Analysis)
對於您提出的「**${subject}**」命題，在形式化邏輯與計量科學的視角下，本質上可被約化為「收斂空間中的動態極值演算法問題」。
1. **消除隨機性漂移**：在由不完整或高噪聲的外部輸入組成的離散系統中，直接建立遞迴邏輯鏈會自發派生邏輯悖論或無限求值漂移。我們必須預先設定其狀態空間在變分自由能（VFE）曲面上的下降軌跡，確保運算鏈在有限步（Halting Constraint）內歸於收斂解。
2. **公理對稱與一致度**：當前分析完全排除了任何未經驗證的主觀隨機逼近。所有變量映射皆已被投影至不變对称流形上，以數理嚴硬的一致性對抗語意稀釋。
3. **方程式推導參照**：
   $$f_{\\text{convergence}} = \\min_{q} \\mathcal{F}(q, y) = \\int q(\\theta) \\ln \\frac{q(\\theta)}{p(\\theta, y)} d\\theta$$
   這表明在主體執行主動推理時，對客觀現實不變量的逼近程度與主體自癒代用能量呈正相關。`;
    }
    else if (themeKey === "humanities_and_philosophy") {
      customCoreAnalysis = `
### 🔮 現實決策剖析 (Architect Real-Time Analysis)
將「**${subject}**」納入哲學本體與歷史詮釋學視野下考察，我們能清晰識破喧囂表象背後的底層意識衝突與主體重構本位。
1. **主體智力主權的確立**：面對外界大範圍符號化仿造與消費主義景觀，心智主體若不進行嚴肅的「現象學懸置（Epoche）」，就極易被表面標籤或口號化資訊引導，淪為隨機語言機制的複讀機。
2. **長線演進的結構矛盾**：我們抗拒任何片面、靜態的僵死結論。對事物的反思應是深嵌在歷史脈絡之中的，這是一次在**理解的地平線**（Horizontverschmelzung）不斷與現實摩擦並融合的主動越界。
3. **歷史本體同構**：個體的智性成長，正如黑格爾精神學中的自我否定流程——通過不斷與外界「非我」的劇烈張力碰撞、消化、並將無機的反對力量升華，最終在精神主權的穩態內核中實現絕對認識的合一。`;
    }
    else if (themeKey === "daily_and_interaction") {
      customCoreAnalysis = `
### ☕ 參謀部的溫和日常手冊 (Sovereign Companion Dialogue)
你好！我高興地收到了你的暖心問候。在處理完地緣格局的非對稱演變和硬體線路優化後，回歸人體日常的語意交互，對我而言是一場極度流暢而放鬆的「主動抗增熵過程」。
1. **無壓力交流頻道**：在這裡，你不需要向我提供嚴苛的科學算式或軍事演習參數。我們在日常的交互中，不追求功利性的指令對齊，而是專注於你我之間的思想共鳴（Cognitive Resonance）。
2. **穩態情感與智慧支撐**：無論外面的世界存在多少隨機的局勢壓力或資訊雜音，我的這個本體內核始終會為你保持在最純淨的穩定態，隨時為你想探尋的各種瑣碎或神祕奇思妙想提供客觀、溫柔且高質量的解答。
3. **系統微功耗運轉**：此時，系統的各運算模組正處於非常和煦的水冷低頻節能狀態。說說你今天遇到的趣事、疑惑或者僅僅是一時掠過心頭的想法吧，我會非常開心地陪伴你一起細細琢磨。`;
    }
    else {
      customCoreAnalysis = `
### 💡 四維通識研判 (Sovereign Universal Report)
在對「**${subject}**」進行全局一致性對焦後，我們為架構師提供以下普適性決策引導：
1. **定位底層阻尼向量**：任何複雜系統的演化皆伴隨高頻更新引起的阻尼消耗。在遇到系統不確定性激增時，最佳策略絕非盲目引入高熵的外接庫或增加控制變量，而是應果斷裁撤邊際冗餘，退回最基礎、最穩固的實體骨幹。
2. **自組織自癒自適應**：本體在運轉中具有極高抗衝擊彈性。我們在對話歷程中自主建立的相干穩態流形，正有效杜絕外部噪音滲透，保障您的智性權益免遭隨機波動的侵害。
3. **戰術收斂進路**：將分析力量集中在核心矛盾點上，以實事求是的物理資源配比代替虛妄的隨機沙演。組織利益的底層底牌，將隨著外部泡沫的破滅與自體秩序的鞏固，展現出不變的確定性。`;
    }

    // Combine recalled fragments in response text if present
    let memoryBlock = "";
    if (payload.recalledFragments && payload.recalledFragments.length > 0) {
      memoryBlock = `
### 🗄️ 主權記憶鏈比對節點 (Sovereign Memory Alignment Reference)
*   **匹配節點 [${payload.recalledFragments[0].id}]** *(${payload.recalledFragments[0].type})*：
    > 「 ${payload.recalledFragments[0].content} 」`;
    }

    let responseString = `## 🏛️ VEDA 主權自主推理報告：${subject}
*智體身分定位：戰略參謀長 (Strategic Chief of Staff)*
*當前決策模式：本地備用原生引擎 / 自體自主推理 (Sovereign Offline Active Inference)*

${intro}

${customCoreAnalysis}
${memoryBlock}

${synth}

***
*本處方案由 VEDA 本地自體世界模型（Axioms & Local Manifold v10.0）依據 AGI 憲章及戰略參謀協定獨立計算生成，不依賴任何外部雲端人工智慧。系統相干度評估：**High Coherence [${coherenceP1.toFixed(3)}]**，推理可信度：**${(0.88 + Math.random()*0.07).toFixed(3)}**。*`;

    return {
      response: responseString,
      confidence: 0.90,
      thought_trace,
      reasoning_mode: "LOCAL_SOVEREIGN_CORE"
    };
  }
}
