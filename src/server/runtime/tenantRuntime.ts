import path from "path";
import type { IncomingHttpHeaders } from "http";

// Shared tenant/runtime helpers used by HTTP routes and WebSocket bootstrap.
// Keeping these pure avoids duplicating tenant resolution logic in server entry code.
export const DEFAULT_TENANT_ID = "CORE_ARCHITECT";

const TENANT_ID_SANITIZER = /[^a-zA-Z0-9_-]/g;

export function resolveTenantIdFromHeaders(headers: IncomingHttpHeaders): string {
  const tenantHeader = headers["x-veda-uid"];
  if (typeof tenantHeader === "string" && tenantHeader.trim().length > 0) {
    return tenantHeader;
  }
  if (Array.isArray(tenantHeader) && tenantHeader[0]?.trim()) {
    return tenantHeader[0];
  }
  return DEFAULT_TENANT_ID;
}

export function resolveTenantIdFromSocketUrl(rawUrl: string | undefined, host: string | undefined): string {
  const searchParams = new URL(rawUrl || "", `http://${host || "localhost"}`).searchParams;
  return searchParams.get("uid") || DEFAULT_TENANT_ID;
}

export function getTenantPersistencePath(tenantId: string): string {
  const safeTenantId = tenantId.replace(TENANT_ID_SANITIZER, "_");
  return path.join(process.cwd(), `veda_persistence_${safeTenantId}.json`);
}
