
import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";
import { save } from "@orama/orama";
import { BaseSubsystem } from "./Subsystem";
import { STATE_PATH } from "./constants";

export interface ISystemState {
  state: number[];
  axioms: string[];
  [key: string]: any;
}

export class PersistenceSubsystem extends BaseSubsystem {
  private lastSavedHash: string = "";
  private readonly MEMORIES_PATH: string;
  private readonly INDEX_PATH: string;

  constructor(stateDir: string) {
    super();
    this.MEMORIES_PATH = path.join(stateDir, "veda_memories.json");
    this.INDEX_PATH = path.join(stateDir, "veda_orama_index.json");
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

      await fsPromises.writeFile(STATE_PATH, content, "utf-8");
      this.lastSavedHash = currentHash;
      return true;
    } catch (e) {
      this.log('FAULT', `State persistence failure: ${e}`);
      return false;
    }
  }

  public async saveMemories(mineral: any[], provisional: any[]): Promise<void> {
    try {
      const data = JSON.stringify({ mineral, provisional });
      await fsPromises.writeFile(this.MEMORIES_PATH, data, "utf-8");
    } catch (e) {
      this.log('FAULT', `Memories persistence failure: ${e}`);
    }
  }

  public async saveIndex(causalIndex: any): Promise<void> {
    try {
      if (causalIndex) {
        const data = await save(causalIndex);
        await fsPromises.writeFile(this.INDEX_PATH, JSON.stringify(data), "utf-8");
      }
    } catch (e) {
      this.log('FAULT', `Index persistence failure: ${e}`);
    }
  }

  public async loadState(): Promise<ISystemState | null> {
    try {
      if (fs.existsSync(STATE_PATH)) {
        const raw = await fsPromises.readFile(STATE_PATH, "utf-8");
        return JSON.parse(raw);
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
        return JSON.parse(raw);
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
        return JSON.parse(raw);
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
        return JSON.parse(raw);
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
