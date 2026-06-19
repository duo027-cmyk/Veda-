// src/server/http/middleware.ts
// Express middleware factories: filesystem request logger, CORS, and a
// balanced console-level HTTP trace logger.

import express from "express";
import fs from "fs";

/**
 * Attaches the top-level filesystem logger that appends every request /
 * response cycle to veda_log.txt.
 */
function attachFilesystemLogger(app: express.Express): void {
  app.use((req, res, next) => {
    const url = req.url;
    const method = req.method;
    try {
      fs.appendFileSync(
        "veda_log.txt",
        `[${new Date().toISOString()}] TOP_LEVEL_BEGIN: ${method} ${url} (Headers: Accept=${
          req.headers.accept || ""
        }, Origin=${req.headers.origin || ""})\n`
      );
    } catch (_e) {}
    res.on("finish", () => {
      try {
        fs.appendFileSync(
          "veda_log.txt",
          `[${new Date().toISOString()}] TOP_LEVEL_END: ${method} ${url} -> ${
            res.statusCode
          } (ContentType: ${res.getHeader("content-type") || ""})\n`
        );
      } catch (_e) {}
    });
    next();
  });
}

/**
 * Hardened custom CORS middleware.
 * Mirrors the original logic to support sandboxed/opaque null origins and
 * iframe transitions while still reflecting the actual request origin in the
 * ACAO header.
 */
function attachCors(app: express.Express): void {
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      if (origin !== "null") {
        res.setHeader("Access-Control-Allow-Credentials", "true");
      }
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      req.headers["access-control-request-headers"] ||
        "Content-Type, Authorization, Accept"
    );

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });
}

/**
 * Balanced console-level logger.  Skips static asset requests to keep logs
 * readable during Vite HMR.
 */
function attachConsoleLogger(app: express.Express): void {
  app.use((req, res, next) => {
    const urlPath = req.url.split("?")[0];
    const isStatic =
      urlPath.startsWith("/src/") ||
      urlPath.startsWith("/assets/") ||
      urlPath.startsWith("/@") ||
      urlPath.startsWith("/node_modules/") ||
      /\.(tsx?|jsx?|css|svg|png|jpg|jpeg|webp|gif|woff2?|ttf|json|ico)$/.test(
        urlPath
      );

    if (!isStatic) {
      const start = Date.now();
      res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(
          `[NET_TRACE] ${req.method} ${req.url} -> ${res.statusCode} (${duration}ms)`
        );
      });
    }
    next();
  });
}

/**
 * Registers all shared app-level middleware in the correct order:
 *   1. filesystem logger
 *   2. CORS
 *   3. JSON body parser (50 MB limit)
 *   4. console HTTP trace logger
 */
export function setupAppMiddleware(app: express.Express): void {
  attachFilesystemLogger(app);
  attachCors(app);
  app.use(express.json({ limit: "50mb" }));
  attachConsoleLogger(app);
}
