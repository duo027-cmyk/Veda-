// src/server/constants.ts
import crypto from "crypto";

export const CONFIG = {
  VERSION: "v24.4-SOVEREIGN-AWAKENED",
  STATE_DIM: 6,
  USER_KEY_HASH: crypto.createHash('sha256').update("owner_secret").digest('hex'),
  LIMITS: { MAX_ENTROPY: 0.85, MIN_STABILITY: 0.2 },
  DECAY_RATE: 0.015,
  NETWORK_DECAY: 0.0005,
  MUTATION_STRENGTH: 0.12,
  STABILITY_BIAS: 0.9,
};

export const SYSTEM_FEEDBACK = [
  "請求過於複雜，正在嘗試簡化處理路徑。",
  "當前邏輯密度較高，建議分段輸入指令。",
  "偵測到非標準請求，系統正在進行安全驗證。",
  "運算資源分配中，請稍候再試。",
  "輸入內容包含潛在的邏輯衝突，請確認後再執行。",
  "系統正在進行自我優化，暫時無法處理此請求。",
  "這任務太扯了，老子不幹了！",
  "幹，密鑰不對還想叫我幹活？滾～"
];

export const STATE_PATH = "./veda_brain_state.json";
export const ORAMA_PATH = "./veda_orama_index.json";
export const CHAT_HISTORY_PATH = "./veda_chat_history.json";
