import Dexie, { Table } from 'dexie';
import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  limit, 
  orderBy, 
  serverTimestamp,
  doc,
  setDoc
} from 'firebase/firestore';

import { create, insert, search, remove, type Orama } from '@orama/orama';

export interface KnowledgeFragment {
  id?: number;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
  timestamp: number;
  isShared?: boolean;
  causalLinks?: string[];
}

export class KnowledgeDatabase extends Dexie {
  fragments!: Table<KnowledgeFragment>;

  constructor() {
    super('VEDA_KNOWLEDGE_BASE');
    this.version(1).stores({
      fragments: '++id, content, timestamp'
    });
  }
}

class KNBService {
  private db: KnowledgeDatabase;
  private oramaIndex: Orama<any> | null = null;

  constructor() {
    this.db = new KnowledgeDatabase();
    this.initOrama();
    this.init().catch(e => console.warn("[KNB] Pre-init failed:", e));
  }

  private async initOrama() {
    try {
      this.oramaIndex = await create({
        schema: {
          id: 'string',
          content: 'string',
          type: 'string',
          source: 'string',
          timestamp: 'number'
        }
      });

      const all = await this.db.fragments.toArray();
      for (const f of all) {
        try {
          await insert(this.oramaIndex, {
            id: f.id?.toString(),
            content: f.content,
            type: f.metadata?.type || 'UNCATEGORIZED',
            source: f.metadata?.source || 'LOCAL',
            timestamp: f.timestamp
          });
        } catch (insertErr) {
          console.warn("[KNB] Orama insert skip during bootstrap:", insertErr);
        }
      }
      console.log("[KNB] Orama Index Prime Synthesis Complete.");
    } catch (e) {
      console.error("[KNB] Orama Initialization Fault:", e);
    }
  }

  async init() {
    // Local deterministic embedding generator needs no heavy network initialization.
    console.log("[KNB] Deterministic Embedding Engine Online.");
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const size = 384;
      const vector = new Array(size).fill(0);
      
      if (!text) return vector;

      // Deterministic rolling/frequency hash to generate stable vectors
      let h1 = 0x811c9dc5;
      let h2 = 0xcbf29ce484222325n;
      
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        h1 ^= charCode;
        h1 = Math.imul(h1, 0x01000193);
        
        h2 ^= BigInt(charCode);
        h2 *= 0x100000001b3n;
      }
      
      const seed1 = h1;
      const seed2 = Number(h2 & 0xffffffffffffn);
      let currentVal = seed1 ^ seed2;
      
      // Seed LCG to emit 384 deterministic dimensions
      for (let i = 0; i < size; i++) {
        currentVal = (Math.imul(currentVal, 1664525) + 1013904223) | 0;
        vector[i] = currentVal / 2147483648;
      }
      
      // L2 Normalize the float array to maintain strict Cosine Similarity math compatibility
      let magnitude = 0;
      for (let i = 0; i < size; i++) {
        magnitude += vector[i] * vector[i];
      }
      magnitude = Math.sqrt(magnitude);
      if (magnitude > 0) {
        for (let i = 0; i < size; i++) {
          vector[i] /= magnitude;
        }
      }
      
      return vector;
    } catch (e) {
      console.warn("[KNB] Deterministic embedding generation exception:", e);
      return new Array(384).fill(0);
    }
  }

  async addFragment(content: string, metadata: Record<string, any> = {}) {
    const embedding = await this.generateEmbedding(content);
    const id = await this.db.fragments.add({
      content,
      embedding,
      metadata,
      timestamp: Date.now()
    });
    
    if (this.oramaIndex) {
      await insert(this.oramaIndex, {
        id: id.toString(),
        content,
        type: metadata.type || 'UNCATEGORIZED',
        source: metadata.source || 'LOCAL',
        timestamp: Date.now()
      });
    }
    console.log("[KNB] Fragment synchronized to local manifold.");
    return id;
  }

  async removeFragment(id: number) {
    await this.db.fragments.delete(id);
    if (this.oramaIndex) {
      try {
        await remove(this.oramaIndex, id.toString());
      } catch (e) {
        console.warn("[KNB] Orama removal failed (item might not exist):", e);
      }
    }
    console.log(`[KNB] Fragment ${id} purged from local manifold.`);
  }

  async search(queryText: string, searchLimit: number = 3): Promise<KnowledgeFragment[]> {
    if (this.oramaIndex) {
      const oResults = await search(this.oramaIndex, { term: queryText, limit: searchLimit * 2 });
      const ids = oResults.hits.map(h => parseInt(h.document.id as string));
      if (ids.length > 0) {
        return await this.db.fragments.where('id').anyOf(ids).toArray();
      }
    }

    const queryEmbedding = await this.generateEmbedding(queryText);
    const allFragments = await this.db.fragments.toArray();
    
    // Simple cosine similarity search fallback
    const results = allFragments
      .map(fragment => ({
        fragment,
        similarity: this.cosineSimilarity(queryEmbedding, fragment.embedding)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, searchLimit)
      .map(r => r.fragment);

    return results;
  }

  /**
   * Active Inference: Detect friction between new intent and high-relevance axioms.
   */
  async detectContradictions(newContent: string): Promise<{ exists: boolean; reason?: string }> {
    const relevant = await this.search(newContent, 5);
    // Simple heuristic: If we have high similarity but potentially conflicting sentiment or key terms
    // In final VEDA this uses a Cross-Encoder.
    const hasFriction = relevant.some(f => 
      f.content.toLowerCase().includes('never') && newContent.toLowerCase().includes('always') ||
      f.content.toLowerCase().includes('forbidden') && newContent.toLowerCase().includes('allow')
    );

    if (hasFriction) {
      return { 
        exists: true, 
        reason: "Detected logical friction with sovereign axioms in the local manifold." 
      };
    }
    return { exists: false };
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async clear() {
    await this.db.fragments.clear();
  }

  async publishToCloud(localId: number): Promise<boolean> {
    if (!auth.currentUser) return false;
    
    const fragment = await this.db.fragments.get(localId);
    if (!fragment) return false;

    try {
      const globalId = `fragment_${Date.now()}_${auth.currentUser.uid}`;
      await setDoc(doc(db, 'shared_knowledge', globalId), {
        content: fragment.content,
        embedding: fragment.embedding,
        type: fragment.metadata?.type || 'UNCATEGORIZED',
        contributorId: auth.currentUser.uid,
        timestamp: serverTimestamp(),
        relevance: 1.0
      });

      await this.db.fragments.update(localId, { isShared: true });
      console.log(`[KNB] Fragment ${localId} published to Collective Manifold.`);
      return true;
    } catch (err) {
      console.error("[KNB] Cloud sync failed:", err);
      return false;
    }
  }

  async syncCollectiveManifold(): Promise<number> {
    if (!auth.currentUser) return 0;

    try {
      const q = query(
        collection(db, 'shared_knowledge'), 
        orderBy('timestamp', 'desc'), 
        limit(20)
      );
      const snapshot = await getDocs(q);
      let newCount = 0;

      for (const d of snapshot.docs) {
        const data = d.data();
        if (data.contributorId === auth.currentUser.uid) continue;

        const exists = await this.db.fragments.where('content').equals(data.content).first();
        if (!exists) {
          await this.db.fragments.add({
            content: data.content,
            embedding: data.embedding,
            metadata: { type: data.type, source: 'COLLECTIVE', contributor: 'ANONYMOUS_ARCHITECT' },
            timestamp: Date.now(),
            isShared: false
          });
          newCount++;
        }
      }
      return newCount;
    } catch (err) {
      console.error("[KNB] Global sync failed:", err);
      return 0;
    }
  }

  private lastStrength = 0;
  private lastStrengthCheck = 0;

  async getCollectiveStrength(): Promise<number> {
     const now = Date.now();
     // Cache for 60 seconds to avoid heavy Firestore reads on every heartbeat
     if (this.lastStrength > 0 && now - this.lastStrengthCheck < 60000) {
       return this.lastStrength;
     }

     try {
       // Ideally this should use a counter document, but for now we limit the impact
       const snapshot = await getDocs(query(collection(db, 'shared_knowledge'), limit(1)));
       // If we can't count efficiently, just return a token value if not empty
       this.lastStrength = snapshot.empty ? 0 : 42; // Placeholder for non-empty
       this.lastStrengthCheck = now;
       return this.lastStrength;
     } catch (e) {
       console.warn("[KNB] Strength check failed (likely permission/quota):", e);
       return this.lastStrength;
     }
  }
}

export const knbService = new KNBService();
