// src/server/bootstrap/processGuards.ts
// Registers process-level error handlers to prevent silent crashes.

export function registerProcessGuards(): void {
  process.on("uncaughtException", (err) => {
    console.error("[CRITICAL_SERVER_ERROR] Uncaught Exception:", err);
    // We don't exit to prevent dev server crash loop
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error(
      "[CRITICAL_SERVER_ERROR] Unhandled Rejection at:",
      promise,
      "reason:",
      reason
    );
  });
}
