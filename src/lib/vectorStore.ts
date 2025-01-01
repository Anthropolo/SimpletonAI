import { HierarchicalNSW } from 'hnswlib-node';
import fs from 'fs';
import path from 'path';

export class VectorStore {
  private index: HierarchicalNSW;
  private dimension: number;
  private maxElements: number;

  constructor(dimension: number = 384, maxElements: number = 100000) {
    this.dimension = dimension;
    this.maxElements = maxElements;
    this.index = new HierarchicalNSW('cosine', dimension);
    this.index.initIndex(maxElements);
  }

  async addVectors(vectors: number[][], ids: number[]) {
    for (let i = 0; i < vectors.length; i++) {
      this.index.addPoint(vectors[i], ids[i]);
    }
  }

  async search(query: number[], k: number = 5) {
    const result = this.index.searchKnn(query, k);
    return {
      ids: result.neighbors,
      distances: result.distances
    };
  }

  async save(filepath: string) {
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.index.writeIndex(filepath);
  }

  async load(filepath: string) {
    this.index.readIndex(filepath);
  }
}
