export class SafeEvaluator {
  private static readonly BLOCK = ["eval", "Function", "constructor", "prototype", "process", "require", "import", "window", "document"];

  private check(code: string): boolean {
    for (const word of SafeEvaluator.BLOCK) {
      if (code.includes(word)) return false;
    }
    return true;
  }

  eval(expr: string, params: Record<string, any> = {}): { success: boolean; result?: any; error?: string } {
    if (!expr || !this.check(expr)) return { success: false, error: "Security Block or Empty Expression" };

    try {
      // Basic sanitization
      let sanitized = (expr.replace(/\^/g, '**') || "").trim();
      
      // Restricted eval-like execution
      const math = {
        pi: Math.PI,
        e: Math.E,
        pow: Math.pow,
        sqrt: Math.sqrt,
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        abs: Math.abs,
        random: Math.random,
        floor: Math.floor,
        ceil: Math.ceil,
        round: Math.round,
        max: Math.max,
        min: Math.min
      };

      // Create a function with restricted scope
      const funcBody = `
        let result = null;
        try {
          ${sanitized};
        } catch (e) {
          return "ERROR: " + e.message;
        }
        return result;
      `;
      
      const func = new Function('math', 'params', funcBody);
      const result = func(math, params);
      
      if (typeof result === 'string' && result.startsWith('ERROR: ')) {
         return { success: false, error: result.substring(7) };
      }

      return { success: true, result };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}
