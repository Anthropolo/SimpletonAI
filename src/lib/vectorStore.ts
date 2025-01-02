import fs from 'fs';
import path from 'path';

interface Vector {
  id: number;
  vector: number[];
  metadata?: Record<string, any>;
}

export class VectorStore {
  private vectors: Vector[] = [];
  private dimension: number;

  constructor(dimension: number = 384) {
    this.dimension = dimension;
  }

  async addVectors(vectors: number[][], ids: number[]) {
    for (let i = 0; i < vectors.length; i++) {
      if (vectors[i].length !== this.dimension) {
        throw new Error(`Vector dimension mismatch. Expected ${this.dimension}, got ${vectors[i].length}`);
      }
      this.vectors.push({
        id: ids[i],
        vector: vectors[i]
      });
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  async search(query: number[], k: number = 5) {
    if (query.length !== this.dimension) {
      throw new Error(`Query dimension mismatch. Expected ${this.dimension}, got ${query.length}`);
    }

    const similarities = this.vectors.map((item, index) => ({
      index,
      similarity: this.cosineSimilarity(query, item.vector)
    }));

    similarities.sort((a, b) => b.similarity - a.similarity);
    const topK = similarities.slice(0, k);

    return {
      ids: topK.map(item => this.vectors[item.index].id),
      distances: topK.map(item => 1 - item.similarity) // Convert similarity to distance
    };
  }

  async save(filepath: string) {
    // For demonstration, we'll just log that we're saving
    console.log(`[VectorStore] Would save vectors to: ${filepath}`);
    return true;
  }

  async load(filepath: string) {
    // For demonstration, we'll just log that we're loading
    console.log(`[VectorStore] Would load vectors from: ${filepath}`);
    return true;
  }
}
