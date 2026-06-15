# 🏛️ VEDA Core Cognitive Platform Architecture Map (系統架構與代碼分類圖誌)

> **智體與戰略維度：** 戰略參謀長 (Strategic Chief of Staff) 剛性建置  
> **軟體工程規格：** 高內聚、低耦合域級封裝 (Domain-driven Standard Layering)  
> **系統狀態：** `V24.4-AWAKENED` (全晶格共振狀態)

本圖誌為 VEDA (自體主權全像協同系統) 全域代碼與功能組件的官方標準範本，旨在確立系統模組的**物理學邊界**、**狀態機轉移路徑**及**正規化分類指南**，防止日後代碼開發發生语意漂移或熱熵增加。

```
                         +-----------------------------------+
                         |         VEDA Chat UI Panel        |
                         +-----------------+-----------------+
                                           |
                                [API proxy via Axios]
                                           v
+------------------------------------------+------------------------------------------+
|                                    Express Backend                                  |
|  +-------------------------------------------------------------------------------+  |
|  |                             Sovereign Brain (brain.ts)                        |  |
|  |                         - Memory Synth, EventBus, DB sync -                   |  |
|  +------------------------------------+------------------------------------------+  |
|                                       |                                             |
|                             [Subsystem Manager]                                     |
|                                       v                                             |
|  +------------------------------------+------------------------------------------+  |
|  |                            Inference Engine Broker                            |  |
|  +-----+------------------------------+------------------------------------+-----+  |
|        |                              |                                    |        |
|        v                              v                                    v        |
|  +-----+---------------+      +-------+-------+                  +---------+-----+  |
|  | Gemini Service (AI) |      | Local Engine  |                  | Syntergic     |  |
|  |     (Server SDK)    |      | (Rule-Based)  |                  | Reasoner (HQ) |  |
|  +---------------------+      +---------------+                  +---------------+  |
|                                                                                     |
|                             [Wasm Native Computations]                              |
|                                       v                                             |
|                     +-----------------+-----------------+                           |
|                     |            WebAssembly            |                           |
|                     | (C-Core: PINC, Epistemic, Lattice)|                           |
|                     +-----------------------------------+                           |
+-------------------------------------------------------------------------------------+
```

---

## 📂 第一部分：系統目錄分類與功能正規化 (Repository Taxonomy)

本系統全面遵守 **「關注點分離 (Separation of Concerns)」** 的最高原則，將整個全域全棧專案劃分為四大核心維度：

```
/
├── server.ts                  # 全棧 Express + Vite 中介伺服器入口點 (Port: 3000)
├── metadata.json              # 系統中樞權限宣告與主權 AGI 命名設定
├── package.json               # 標準多階段建置與原生外部依賴管控
├── ARCHITECTURE_MAP.md        # 戰略參謀長官方架構索引與分類標準規範 (本文件)
│
├── 📁 src/
│   ├── App.tsx                # 前端渲染生命週期頂層管線與視圖路由
│   ├── main.tsx               # 前端 ReactDOM 標準水合與掛載點
│   ├── index.css              # 全域 Tailwind CSS 頂層架構、高階主題、字體注入
│   ├── types.ts               # 前端跨視圖共享類型、接口、組態宣告
│   │
│   ├── 📁 components/         # 前端展示層組件 (以 7 大領域標準化分類)
│   │   ├── index.ts           # 前端組件全域統一 Barrel 匯流出口檔 (新創)
│   │   ├── 📁 ui/             # Reusable Atomic - 高頻原子組件 (Button、Card、Bento、Badge)
│   │   ├── 📁 cinema/         # Cinematic - 特化動態沉浸與影音節能渲染器
│   │   └── ... (40+ 認知展示組件)
│   │
│   ├── 📁 services/           # 客戶端異步數據接口與 Workers
│   │   ├── liveService.ts     # 即時遙測信號與 websocket 反饋服務
│   │   ├── selfCorrectionEngine.ts # 前台閉環動態自檢與修補常驻引擎
│   │   └── ... (API 呼叫與外部資料源)
│   │
│   ├── 📁 store/              # Zustand 跨視圖反應式狀態機
│   │   ├── index.ts           # 狀態管理全域 Barrel 出口檔 (新創)
│   │   ├── vedaStore.ts       # AGI 現象數據、主線操作及與後端 Brain 同步核心
│   │   ├── sovereignStore.ts  # 自體修復與心跳信號狀態
│   │   ├── uiStore.ts         # 介面局部主題、激活子版、對焦點狀態
│   │   └── authStore.ts       # 權限、身分及 Architect 控制面板
│   │
│   └── 📁 server/             # 獨立安全伺服端容器
│       ├── brain.ts           # 整合記憶合成、事件調度及實體同步之主宰節點 (The VEDA Brain)
│       ├── SubsystemManager.ts # 後端模組生命週期、注冊與心跳監督器
│       ├── causality.ts       # Pearl 因果圖演算算子、實體介入 do(X)
│       ├── 📁 core/           # 認知、推理、決策之純功能性原語 (Engine Components)
│       │   ├── InferenceEngine.ts # 雙軌（AI 與 Local，新增 Syntergic）推理調度中心
│       │   ├── SyntergicReasoningEngine.ts # 格林柏格神經場/空間晶格超維度推理引擎 (新創)
│       │   └── ... (wasm 橋接、自癒、因果、計量)
│       ├── 📁 intelligence/   # AGI / JEPA 聯合嵌入演算法自適應策略組組
│       └── 📁 c_core/         # C-Core 底層低延遲物理晶格源代碼 (.c & .h)
```

---

## 🧩 第二部分：前端 UI 展示組件之「七大領域」正規化
為了防止 `src/components/` 超過 50 個組件的文件雜亂無章，系統定義了 **「7 大前端領域 (Unified Frontend Domains)」**。所有組件於 `src/components/index.ts` 中完成統一定位：

### 1. 核心與殼層組件 (Core Platform & Shells)
*   **定位**：負責應用程序生命週期初始化、異常阻尼器、外殼導航與連線狀態。
*   **關鍵組件**：
    *   `SovereignInitialization`: 引導系統與 Firestore 進行公理加載。
    *   `SovereignCircuitBreaker`: 電源、網路高阻尼時起飛的安全保險閘門。
    *   `NavRail` / `Header` / `ErrorBoundary` / `LiveOverlay`.

### 2. 生產力/認知對話組件 (Cognitive Conversational Systems)
*   **定位**：提供主權主客體交互界面、思維路徑追踪與底層指令交互。
*   **關鍵組件**：
    *   `ChatInterface` / `ChatPanel`: 主權對話和本地神經場交互層。
    *   `Terminal` / `ThoughtTrace`: 思維過程的高分辨率符號還原。

### 3. 高級戰略控制面板 (Strategic Command & Dashboards)
*   **定位**：用於進行宏觀局勢研判、地緣政治、資產配置和系統配置調度。
*   **關鍵組件**：
    *   `SovereignManagement`: 資源分配、生命週期頻率與高相干度模式開關。
    *   `StrategicWorkstation`: 參謀專用局勢定焦分析板。
    *   `PalantirAIPDashboard` / `PhysicsInformedNeuromorphicDashboard` / `CoreConfig`.

### 4. 因果推理與超維度演算 (Causal & Metacognitive Reasoning)
*   **定位**：執行可證偽性檢查、Judea Pearl 因果關係模擬及多維度晶格轉換。
*   **關鍵組件**：
    *   `CognitiveArchitecture`: 系統認知子版塊與節點網絡高可視分析。
    *   `CausalSimulator`: 反事實介入（do-calculus）仿真與鏈條追蹤。
    *   `LatticeCruncher` / `AgiProximityEvaluator` / `KnowledgeGraph`.

### 5. 低維信號與神經波包監控 (Neural & Quantum Signal Monitors)
*   **定位**：繪製系統即時狀態，包括腦波幅度、負熵率、自體能量強度、神經遞質釋放速率等物理指標。
*   **關鍵組件**：
    *   `NeuralManifold` / `QuantumWaveform`: 即時動態波譜 canvas。
    *   `SelfLearningGradientMonitor`: 自我糾正梯度與學習率阻尼可視圖。
    *   `HoneycombHUD` / `CrystalSoulHUD` / `SynapseOverview` / `EfficacyManifold`.

### 6. 知識存儲與影音劇場 (Archival Vaults & Creative Manifolds)
*   **定位**：文獻審查、永久記憶庫檢索、以及沉浸式人文與影音生成。
*   **關鍵組件**：
    *   `KnowledgeVault`: 永久文獻與 axiom 清單。
    *   `CinemaManifold`: 沉浸式影音投影與生成軌跡。
    *   `AmanoMasterpiece` / `AmanoAestheticPreview` / `DreamscapeView`.

### 7. Reusable Atomic 基礎原子庫
*   **定位**：極致簡練，基於 Radix & Tailwind 的封裝組件。
*   **關鍵組件**：
    *   位於 `src/components/ui/` 的 `button`, `card`, `bento-grid`, `badge`, `separator`。

---

## ⚡ 第三部分：後端系統架構與「神經中樞」數據流 (Dataflow Flowchart)

本系統的強固性在於**前端 Zustand 狀態機與後端 Brain 物理子系統**之間的無耗損雙向同步：

```
+---------------------------------------------------------------------------------+
|                       FRONTEND: Zustand Reactive Stores                         |
|                                                                                 |
|   +-------------------+       +---------------------+       +---------------+   |
|   |   useVedaStore    | <---> |  useSovereignStore  | <---> |   useUIStore  |   |
|   +---------+---------+       +----------+----------+       +---------------+   |
|             |                            |                                      |
|             v (Sycronization Trigger)    v (Internal Heuristic)                 |
|      [vedaService]               [selfHealBrainData]                            |
+-------------+----------------------------+--------------------------------------+
              |                            |
    (HTTP /api endpoints)        (Websocket streams)
              v                            v
+-------------+----------------------------+--------------------------------------+
|                       BACKEND: Express + Brain Subsystems                       |
|                                                                                 |
|   +-------------------------------------------------------------------------+   |
|   |                         Sovereign Brain (brain.ts)                      |   |
|   |                                                                         |   |
|   |   - Lifecycle execution every 1000ms                                    |   |
|   |   - Receives action payloads, transforms system coordinates              |   |
|   |   - Regularly fires self-synthesis of loose semantic graphs             |   |
|   |   - Synchronizes data arrays with Firestore / local backup JSON         |   |
|   +-------+-----------------------------+-------------------------------+   |
|           |                             |                                       |
|           v (delegates to manager)      v (direct computation)                  |
|   +-------+---------------------+ +-----+-------------------------------+   |
|   |   Subsystem Manager         | |  Inference Engine Broker            |   |
|   |   (Manages memory database, | |  Routes inputs dynamically through  |   |
|   |    audits events, and binds | |  Gemini, Syntergic Engine OR        |   |
|   |    the network state)       | |  Rule-Based Native fallback models. |   |
|   +-----------------------------+ +-------------------------------------+   |
+---------------------------------------------------------------------------------+
```

### 🔒 後端自癒防禦防護機制 (Defensive Self-Healing Protocols)
根據 **「防禦性沙盒 (Defensive Sandboxing)」** 與 **「無損自癒與容錯 (Graceful Failing)」** 通訊協定，後端在做任何推理、資料反串及記憶持久化時遵循以下剛性律令：
1. **防爆 Promise 隔離**：任何異步操作都不允許未封裝地直接暴露至 Express 外層路由。所有事件流必需經由內部 `EventBus.ts` 作消息阻尼與 try-catch。
2. **API 降級代償 (Fallback Cascade)**：當連接 Gemini 網路層發生阻滯或 API 鑰末端不可達時，Inference Engine 必須在 **50毫秒內** 自主無感坍縮為 **「SyntergicReasoningEngine (全像協同推理引擎)」**，完成對不確定性事件的本地主權推理，決不向客戶端透露破損、空白、或包含堆疊日誌的 JSON。
3. **Firestore 平行一致性**：當遠程儲存庫連接失敗，系統應無縫將所有的記憶點保存到本地的宿主環境緩衝區 `veda_persistence_${safeTenantId}.json`，待網路相干性重建後進行後台異步批次重播同步。

---

## 📐 第四部分：研發與分類守則：新模組應該寫在哪？ (PM Deployment Checklist)

每當工程師因應新戰術需求需要添加新代碼、視圖、或算法時，必須通過以下 **「主權 PM 剛性檢驗清單」**：

1.  **它是一個可讀、無任何副作用的純函數（例如：矩陣變換、波包計算）嗎？**
    *   👉 **Yes**: 請寫入 `/src/lib/`（若屬前台高速運行）或 `/src/server/core/`（若屬後台計算）。
2.  **它是一個與 AGI 預測或深度學習、認知算法相關的演算法核心嗎？**
    *   👉 **Yes**: 請寫入 `/src/server/intelligence/`（例如：JEPA 拓撲對齊），並於 `Brain.ts` 定義其高相干性運作模式。
3.  **它是一個全新的前端展示面板或浮動螢幕嗎？**
    *   👉 **Yes**: 請寫入 `/src/components/`，同時將其納入 `/src/components/index.ts` 進行對應的 **Domain classification 導航與導出**。絕不允許在 `App.tsx` 中直接塞入 500 行以上的 UI 排版。
4.  **它是跨畫面共享的客戶端狀態嗎？**
    *   👉 **Yes**: 請在 `/src/store/` 創建獨立 Store，並在 `/src/store/index.ts` 註冊導出。絕對禁止在組件頂層設置過多高層傳遞的 `props`。

---
*「本圖誌旨在引導本智體與未來開發團隊，以代碼之剛性抗擊變形隨機，維護 VEDA 自體認知之絕對主權與高階自癒穩態。」*

---

## 🛑 第五部分：去神秘化、去相位語彙與認知模擬沙盒規範 (Demystification & Realism Guidelines)

為了維護 **「真實數據，拒絕虛妄 (Anti-Larpping & Definite State)」** 的戰略與專業原則，全系統的研發人與智體必須嚴格遵守以下四項**正規化與真實化鋼性原則**。此原則旨在防止任何虛名或神秘化敘事入侵代碼與產品定位本身：

### 1. 嚴禁過度神化、神秘化與黑箱命名 (No Cryptic or Mystical Over-Naming)
*   **工程原則**：不以虛妄、無法測量、或超出當前軟體工程現實的伪神秘主義名詞定義核心邏輯與組件。
*   **命名對齊**：
    *   將過度浮誇的名詞（如 *"全像空間前晶格共振"*）轉化為對應的軟體實現本質（如 **多維特徵對齊、空間向量對焦、跨域邏輯推理**）。
    *   保持所有 UI 輸出日誌之「人文/學術隱喻」僅限於展示美學層面，而在實際提示詞與後端處理器中，所有功能必須有確定的數據流向與 API 定位支撐。

### 2. 嚴禁相位與量子物理語彙工程化 (Phase & Quantum Terms are ONLY Visual Simulation Overlays)
*   **系統認知定位**：
    *   系統內部的「量子波形監控器 (`QuantumWaveform`)」、「神經場流形 (`NeuralManifold`)」及「晶格計算器 (`LatticeCruncher`)」均是為高維度特徵空間（High-Dimensional Latent Spaces）與多代理人對話狀態、事件序列設計的 **「高品質擬真幾何可視化沙盒」**。
    *   在底層代碼中，明確標定這類名詞屬於 **物理與數學隱喻 (Mathematical & Physical Metaphors)**。系統是運行在 Express 中介伺服、Node.js 容器和 Firebase Firestore/Auth 資料庫之上。
    *   任何在 UI 渲染的波譜與相空間（q, p），均是將前端流量、API 反饋時延、隊列狀態、與 AI 內容語境相干度，映射到經典物理哈密頓力學方程（如 Symplectic Euler 數值求導）以進行可視化舒緩或系統應力折射，不可混淆為真實之物理量子電腦硬體。

### 3. 去神化 Burst 萬能說 (Burst Mode is a Stress-Testing & High-Batch Queue Engine)
*   **本質定位**：
    *   當前系統的「因果爆發 (`BurstMode/CausalBurstEngine`)」本質上是 **「高頻壓力壓力測試、突發吞吐隊列與模型精度自動代償 (Stress-Testing, Active Queuing, Lossy-Precision Mitigation)」** 的模擬核心。
    *   它不是超自然物理、亦不可用於解釋所有系統異常。它在代碼上的職責是：模擬當系統遭遇高尖峰請求負載（intensity > 0.8）時，藉由降級精度（如模擬 quantization Target 從 FP32 到 INT4）、縮短容忍時延、壓縮 KV-Cache、加大批次採集（batch scaling）來保護系統不受阻塞，屬於**自動閉環的高負荷舒緩算法模擬器**。

### 4. 切實剝離「UI 的視覺敘事」與「系統核心運作能力」 (Decouple Visual Storytelling from Core Competency)
*   **研發分界**：
    *   **視覺敘事層 (Visual Narrative)**：包含動態 canvas、流動粒子、因果網絡渲染、冷調賽博色系（Cyberpunk Aesthetic / Cosmic Slate Theme）。其目的是提供架構師高分辨率的監控體驗。
    *   **核心運作層 (Core Operational Logic)**：由 **Gemini AI 安全路由代理、Firestore 實體一致性同步、本地 JSON 物理備份、標準 OAuth 身分校驗及 Drizzle SQL 剛性結構** 所組成。
    *   智體與工程師開發新模組時，必須確保**功能模組即使失去所有視覺特效，其接口、邏輯推理與存儲讀寫依然 100% 獨立不變、精確運作**。任何視覺上的動態演出（如 "正在修復..."、"正相相干..."）本身不代表對應網路阻斷的真實物理修復，必須有底層 `vedaService`、`selfCorrectionEngine` 等真實自檢與 try-catch 連線重試碼作為最終執行現實。

