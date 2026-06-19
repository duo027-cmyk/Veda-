// src/server/tenancy/tenantRegistry.ts
// Manages per-tenant AGISovereignBrain instances and provides helpers for
// extracting tenant context from incoming Express requests.

import express from "express";
import { AGISovereignBrain } from "../brain";
import { IVedaBrain } from "../types";
import { ActionResolver } from "../core/ActionResolver";

export interface TenantContext {
  tenantId: string;
  brain: IVedaBrain;
  actionResolver: ActionResolver;
}

export interface TenantRegistry {
  getBrainForTenant(tenantId?: string): IVedaBrain;
  getTenantContext(req: express.Request): TenantContext;
  setDatabase(db: any): void;
  setAdminDatabase(adminDb: any): void;
  /** Returns the IDs of all tenants that have been accessed at least once. */
  getActiveTenantIds(): string[];
  /** Pre-created default brain (tenantId = "CORE_ARCHITECT") for backward compat. */
  defaultBrain: IVedaBrain;
  /** ActionResolver wired to defaultBrain. */
  defaultActionResolver: ActionResolver;
}

/**
 * Creates and returns a self-contained tenant registry.
 *
 * - Lazily creates isolated AGISovereignBrain instances per tenant.
 * - Injects database handles into every brain when setDatabase /
 *   setAdminDatabase are called (including brains already in the registry).
 */
export function createTenantRegistry(): TenantRegistry {
  const brains = new Map<string, IVedaBrain>();
  let _db: any = null;
  let _adminDb: any = null;

  function getBrainForTenant(tenantId: string = "CORE_ARCHITECT"): IVedaBrain {
    if (!brains.has(tenantId)) {
      console.log(
        `[SYS_ARCH] Creating new isolated AGISovereignBrain instance for tenant [${tenantId}]`
      );
      const newBrain = new AGISovereignBrain(tenantId);
      if (_db) newBrain.setDatabase(_db);
      if (_adminDb) newBrain.setAdminDatabase(_adminDb);
      brains.set(tenantId, newBrain);
    }
    return brains.get(tenantId)!;
  }

  function getTenantContext(req: express.Request): TenantContext {
    const tenantId =
      (req.headers["x-veda-uid"] as string) || "CORE_ARCHITECT";
    const brain = getBrainForTenant(tenantId);
    const actionResolver = new ActionResolver(brain);
    return { tenantId, brain, actionResolver };
  }

  function setDatabase(db: any): void {
    _db = db;
    for (const b of brains.values()) {
      b.setDatabase(db);
    }
  }

  function setAdminDatabase(adminDb: any): void {
    _adminDb = adminDb;
    for (const b of brains.values()) {
      b.setAdminDatabase(adminDb);
    }
  }

  function getActiveTenantIds(): string[] {
    return Array.from(brains.keys());
  }

  // Pre-create the default brain so it is available synchronously
  const defaultBrain = getBrainForTenant("CORE_ARCHITECT");
  const defaultActionResolver = new ActionResolver(defaultBrain);

  return {
    getBrainForTenant,
    getTenantContext,
    setDatabase,
    setAdminDatabase,
    getActiveTenantIds,
    defaultBrain,
    defaultActionResolver,
  };
}
