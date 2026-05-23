export class SemanticParser {
  parse(input: string, lastResult: number | null): string | null {
    if (!input) return null;
    const text = String(input);
    const lower = text.toLowerCase().trim();
    
    // 1. Direct math expression extraction
    const exprMatch = lower.match(/[\d+\-*/().^ ]+/);
    if (exprMatch && (lower.includes('+') || lower.includes('-') || lower.includes('*') || lower.includes('/') || lower.includes('^'))) {
      return (exprMatch[0] || "").trim();
    }

    // 2. Number extraction
    const nums = (lower.match(/\d+\.?\d*/g) || []).map(Number);

    // 3. Semantic patterns
    if (lower.includes('面積') && nums.length >= 1) {
      return `result = math.pi * Math.pow(${nums[0]}, 2)`;
    }

    if (lower.includes('平方') && nums.length >= 1) {
      return `result = Math.pow(${nums[0]}, 2)`;
    }

    if (lower.includes('立方') && nums.length >= 1) {
      return `result = Math.pow(${nums[0]}, 3)`;
    }

    if (lower.includes('開方') || lower.includes('根號')) {
      const val = nums[0] || (typeof lastResult === 'number' ? lastResult : 0);
      return `result = Math.sqrt(${val})`;
    }

    if (lower.includes('加')) {
      const a = (lastResult !== null && typeof lastResult === 'number' && nums.length === 1) ? lastResult : (nums[0] || 0);
      const b = nums[nums.length - 1] || 0;
      return `result = ${a} + ${b}`;
    }

    if (lower.includes('乘')) {
      const a = (lastResult !== null && typeof lastResult === 'number' && nums.length === 1) ? lastResult : (nums[0] || 0);
      const b = nums[nums.length - 1] || 0;
      return `result = ${a} * ${b}`;
    }

    if (lower.includes('減')) {
      const a = (lastResult !== null && typeof lastResult === 'number' && nums.length === 1) ? lastResult : (nums[0] || 0);
      const b = nums[nums.length - 1] || 0;
      return `result = ${a} - ${b}`;
    }

    if (lower.includes('除')) {
      const a = (lastResult !== null && typeof lastResult === 'number' && nums.length === 1) ? lastResult : (nums[0] || 0);
      const b = nums[nums.length - 1] || 1;
      return `result = ${a} / ${b}`;
    }

    if (lower.includes('餘數') || lower.includes('模')) {
      const a = (lastResult !== null && typeof lastResult === 'number' && nums.length === 1) ? lastResult : (nums[0] || 0);
      const b = nums[nums.length - 1] || 1;
      return `result = ${a} % ${b}`;
    }

    return null;
  }
}
