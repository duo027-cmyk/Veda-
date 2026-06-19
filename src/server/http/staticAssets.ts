// src/server/http/staticAssets.ts
// Configures Vite dev middleware (development) or static file serving
// (production) on the Express app.

import express from "express";
import path from "path";

/**
 * Mounts either the Vite HMR dev server or the production static bundle
 * depending on NODE_ENV.  Must be called AFTER all API routes are registered
 * so that the SPA fallback cannot swallow API 404s.
 */
export async function setupStaticAssets(app: express.Express): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    // Hardened SPA fallback: only serve index.html for navigation requests
    app.get("*", (req, res) => {
      const isApi =
        req.url.startsWith("/api") || req.url.startsWith("/_veda_pulse");
      if (!isApi && !req.url.includes(".")) {
        res.sendFile(path.join(distPath, "index.html"));
      } else {
        res.status(404).json({
          error: "NOT_FOUND",
          path: req.url,
          suggestion: isApi
            ? "Check API endpoint mapping"
            : "Static asset missing",
        });
      }
    });
  }
}
