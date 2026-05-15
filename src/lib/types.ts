export interface HistoricalSnapshot {
  id: string;
  timestamp: number;
  label: string;
  coherence: number;
  entropy: number;
  fragments: MemoryFragment[]; // Deep copy of all fragments at that time
}

export interface MemoryFragment {
  id: string;
  name: string;
  codeTemplate: string;
  tags: string[];
  confidence: number;
  success: number;
  fail: number;
  createdAt: number;
  lastUsed: number;
  isHistorical?: boolean; // Label for rigid snapshots
}
