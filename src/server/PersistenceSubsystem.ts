
import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";
import { save } from "@orama/orama";
import { BaseSubsystem } from "./Subsystem";

export interface ISystemState {
  state: number[];
  axioms: string[];
  [key: string]: any;
}

export class PersistenceSubsystem extends BaseSubsystem {
  private lastSavedHash: string = "";
  private readonly MEMORIES_PATH: string;
  private readonly INDEX_PATH: string;
  private readonly STATE_PATH: string;

  constructor(stateDir: string, tenantId: string = "CORE_ARCHITECT") {
    super();
    const safeTenantId = tenantId.replace(/[^a-zA-Z0-9_\-]/g, "_");
    this.MEMORIES_PATH = path.join(stateDir, `veda_memories_${safeTenantId}.json`);
    this.INDEX_PATH = path.join(stateDir, `veda_orama_index_${safeTenantId}.json`);
    this.STATE_PATH = path.join(stateDir, `veda_brain_state_${safeTenantId}.json`);
  }

  public async initialize(): Promise<void> {
    this.status = 'ONLINE';
    this.log('INIT', 'Persistence Subsystem initialized.');
  }

  public tick(delta: number, globalState: number[]): void {
    // Standard tick logic
  }

  public async saveState(data: ISystemState): Promise<boolean> {
    try {
      const content = JSON.stringify(data, null, 2);
      const currentHash = this.hash(content);
      
      if (currentHash === this.lastSavedHash) {
        return true;
      }

      const tempPath = `${this.STATE_PATH}.tmp`;
      await fsPromises.writeFile(tempPath, content, "utf-8");
      await fsPromises.rename(tempPath, this.STATE_PATH);
      this.lastSavedHash = currentHash;
      return true;
    } catch (e) {
      this.log('FAULT', `State persistence failure (atomic write): ${e}`);
      return false;
    }
  }

  public async saveMemories(mineral: any[], provisional: any[]): Promise<void> {
    try {
      const data = JSON.stringify({ mineral, provisional });
      const tempPath = `${this.MEMORIES_PATH}.tmp`;
      await fsPromises.writeFile(tempPath, data, "utf-8");
      await fsPromises.rename(tempPath, this.MEMORIES_PATH);
    } catch (e) {
      this.log('FAULT', `Memories persistence failure (atomic write): ${e}`);
    }
  }

  public async saveIndex(causalIndex: any): Promise<void> {
    try {
      if (causalIndex) {
        const data = await save(causalIndex);
        const tempPath = `${this.INDEX_PATH}.tmp`;
        await fsPromises.writeFile(tempPath, JSON.stringify(data), "utf-8");
        await fsPromises.rename(tempPath, this.INDEX_PATH);
      }
    } catch (e) {
      this.log('FAULT', `Index persistence failure (atomic write): ${e}`);
    }
  }

  public async loadState(): Promise<ISystemState | null> {
    try {
      if (fs.existsSync(this.STATE_PATH)) {
        const raw = await fsPromises.readFile(this.STATE_PATH, "utf-8");
        try {
          return JSON.parse(raw);
        } catch (rawError) {
          this.log('FAULT', `State file corrupted during parse: ${rawError}. Backing up file.`);
          try {
            await fsPromises.rename(this.STATE_PATH, `${this.STATE_PATH}.corrupted.${Date.now()}`);
          } catch {}
          return null;
        }
      }
      return null;
    } catch (e) {
      this.log('FAULT', `Load failure: ${e}`);
      return null;
    }
  }

  public async loadMemories(): Promise<{ mineral: any[], provisional: any[] } | null> {
    try {
      if (fs.existsSync(this.MEMORIES_PATH)) {
        const raw = await fsPromises.readFile(this.MEMORIES_PATH, "utf-8");
        try {
          const parsed = JSON.parse(raw);
          return {
            mineral: Array.isArray(parsed?.mineral) ? parsed.mineral : [],
            provisional: Array.isArray(parsed?.provisional) ? parsed.provisional : []
          };
        } catch (rawError) {
          this.log('FAULT', `Memories file corrupted during parse: ${rawError}. Backing up file.`);
          try {
            await fsPromises.rename(this.MEMORIES_PATH, `${this.MEMORIES_PATH}.corrupted.${Date.now()}`);
          } catch {}
          return { mineral: [], provisional: [] };
        }
      }
      return null;
    } catch (e) {
      this.log('FAULT', `Memories load failure: ${e}`);
      return null;
    }
  }

  public async loadBaselines(): Promise<any | null> {
    try {
      const baselinePath = path.join(process.cwd(), "baselines.json");
      if (fs.existsSync(baselinePath)) {
        const raw = await fsPromises.readFile(baselinePath, "utf-8");
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }
      return null;
    } catch (e) {
      this.log('FAULT', `Baseline load failure: ${e}`);
      return null;
    }
  }

  public async loadIndex(): Promise<any | null> {
    try {
      if (fs.existsSync(this.INDEX_PATH)) {
        const raw = await fsPromises.readFile(this.INDEX_PATH, "utf-8");
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }
      return null;
    } catch (e) {
      this.log('FAULT', `Index load failure: ${e}`);
      return null;
    }
  }

  private hash(s: string): string {
    let h = 0;
    for (let i = 0; i < s.length; i += 1) {
      h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    }
    return h.toString(16);
  }
}
