export class SemanticParser {
  /**
   * 根據 AGI v6.0 Decoupling 架構所設計之高強度語義解析單元。
   * 防範直接表達式返回未賦值狀態與單元操作數複製崩塌。
   */
  parse(input: string, lastResult: number | null): string | null {
    if (!input) return null;
    const text = String(input);
    const lower = text.toLowerCase().trim();
    
    // 1. Direct math expression extraction (確保在沙盒中能夠正確為 result 變數辦理賦值)
    const exprMatch = lower.match(/[\d+\-*/().^ ]+/);
    if (exprMatch && (lower.includes('+') || lower.includes('-') || lower.includes('*') || lower.includes('/') || lower.includes('^'))) {
      const matchStr = (exprMatch[0] || "").trim();
      // 確認篩選後的表達式非空，且不單單只是空字串
      if (matchStr.length > 0 && /[\d]/.test(matchStr)) {
        return `result = ${matchStr}`;
      }
    }

    // 2. Number extraction (獲取輸入參數集)
    const nums = (lower.match(/\d+\.?\d*/g) || []).map(Number);

    // 輔助函數：解析雙變數算符之操作數，防止單操作數未對齊導致的雙倍偏折
    const getBinaryOperands = (defaultDenominator = 0): { a: number; b: number } => {
      if (nums.length >= 2) {
        return { a: nums[0], b: nums[1] };
      }
      const prev = (lastResult !== null && typeof lastResult === 'number') ? lastResult : 0;
      const current = nums.length === 1 ? nums[0] : defaultDenominator;
      return { a: prev, b: current };
    };

    // 3. Semantic patterns (利用沙盒所傳遞之局部 math 自主引導運行)
    if (lower.includes('面積') && nums.length >= 1) {
      return `result = math.pi * math.pow(${nums[0]}, 2)`;
    }

    if (lower.includes('平方') && nums.length >= 1) {
      return `result = math.pow(${nums[0]}, 2)`;
    }

    if (lower.includes('立方') && nums.length >= 1) {
      return `result = math.pow(${nums[0]}, 3)`;
    }

    if (lower.includes('開方') || lower.includes('根號')) {
      const val = nums.length >= 1 ? nums[0] : (typeof lastResult === 'number' ? lastResult : 0);
      return `result = math.sqrt(${val})`;
    }

    if (lower.includes('加')) {
      const { a, b } = getBinaryOperands(0);
      return `result = ${a} + ${b}`;
    }

    if (lower.includes('乘')) {
      const { a, b } = getBinaryOperands(1);
      return `result = ${a} * ${b}`;
    }

    if (lower.includes('減')) {
      const { a, b } = getBinaryOperands(0);
      return `result = ${a} - ${b}`;
    }

    if (lower.includes('除')) {
      // 避免除數為 0，預設設為 1
      const { a, b } = getBinaryOperands(1);
      const safeDivisor = b === 0 ? 1 : b;
      return `result = ${a} / ${safeDivisor}`;
    }

    if (lower.includes('餘數') || lower.includes('模')) {
      const { a, b } = getBinaryOperands(1);
      const safeDivisor = b === 0 ? 1 : b;
      return `result = ${a} % ${safeDivisor}`;
    }

    return null;
  }
}

