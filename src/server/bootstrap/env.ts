// src/server/bootstrap/env.ts
// Handles environment variable loading diagnostics at startup.

export function bootstrapEnv(): void {
  const keyFound = !!(process.env.GEMINI_API_KEY || process.env.API_KEY);
  console.log(`[BOOT] GEMINI_API_KEY found: ${keyFound}`);
  if (keyFound) {
    const k = (process.env.GEMINI_API_KEY || process.env.API_KEY || "");
    console.log(`[BOOT] Key Check: ${k.substring(0, 4)}...${k.substring(k.length - 4)}`);
  }
}
