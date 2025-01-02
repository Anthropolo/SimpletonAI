import fs from 'fs';
import path from 'path';

interface Vector {
  id: number;
  vector: number[];
  metadata?: Record<string, any>;
}

interface VectorMetadata {
  id: string;
  dimensions: number;
  model: string;
  createdAt: string;
}

interface VectorStoreConfig {
  dimension?: number;
  model?: string;
  datasetId?: string;
  similarity?: 'cosine' | 'dot' | 'euclidean';
}

export class VectorStore {
  private vectors: Vector[] = [];
  private dimension: number;
  private model: string;
  private datasetId: string;
  private similarity: 'cosine' | 'dot' | 'euclidean';

  constructor(config: VectorStoreConfig = {}) {
    this.dimension = config.dimension || 768;
    this.model = config.model || 'nomic-embed-text';
    this.datasetId = config.datasetId || 'default';
    this.similarity = config.similarity || 'cosine';
  }

  setDatasetId(datasetId: string) {
    this.datasetId = datasetId;
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

  private dotSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
    }
    
    return dotProduct;
  }

  private euclideanSimilarity(a: number[], b: number[]): number {
    let sum = 0;
    
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    
    return Math.sqrt(sum);
  }

  async search(query: number[], k: number = 5) {
    if (query.length !== this.dimension) {
      throw new Error(`Query dimension mismatch. Expected ${this.dimension}, got ${query.length}`);
    }

    const similarities = this.vectors.map((item, index) => ({
      index,
      similarity: this.getSimilarity(query, item.vector)
    }));

    similarities.sort((a, b) => b.similarity - a.similarity);
    
    return {
      indices: similarities.slice(0, k).map(s => s.index),
      similarities: similarities.slice(0, k).map(s => s.similarity)
    };
  }

  private getSimilarity(a: number[], b: number[]): number {
    switch (this.similarity) {
      case 'cosine':
        return this.cosineSimilarity(a, b);
      case 'dot':
        return this.dotSimilarity(a, b);
      case 'euclidean':
        return this.euclideanSimilarity(a, b);
      default:
        throw new Error(`Unsupported similarity metric: ${this.similarity}`);
    }
  }

  async save(filepath: string) {
    if (!this.datasetId) {
      throw new Error('Dataset ID is required for save operation');
    }

    const vectorsDir = path.join(process.cwd(), 'data', 'vectors', this.datasetId);
    await fs.promises.mkdir(vectorsDir, { recursive: true });

    const metadata: VectorMetadata = {
      id: this.datasetId,
      dimensions: this.dimension,
      model: this.model,
      createdAt: new Date().toISOString()
    };

    await fs.promises.writeFile(
      path.join(vectorsDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    await fs.promises.writeFile(
      path.join(vectorsDir, 'vectors.json'),
      JSON.stringify(this.vectors, null, 2)
    );
  }

  async load(filepath: string) {
    if (!this.datasetId) {
      throw new Error('Dataset ID is required for load operation');
    }

    const vectorsDir = path.join(process.cwd(), 'data', 'vectors', this.datasetId);
    
    const metadata = JSON.parse(
      await fs.promises.readFile(path.join(vectorsDir, 'metadata.json'), 'utf-8')
    ) as VectorMetadata;

    this.dimension = metadata.dimensions;
    this.model = metadata.model;

    this.vectors = JSON.parse(
      await fs.promises.readFile(path.join(vectorsDir, 'vectors.json'), 'utf-8')
    );
  }
}
