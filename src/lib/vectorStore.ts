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

export class VectorStore {
  private vectors: Vector[] = [];
  private dimension: number;
  private model: string;
  private datasetId: string;

  constructor(dimension: number = 768, model: string = 'nomic-embed-text', datasetId: string) {
    this.dimension = dimension;
    this.model = model;
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
    const vectorsDir = path.join(process.cwd(), 'data', 'vectors', this.datasetId);
    
    // Create vectors directory if it doesn't exist
    if (!fs.existsSync(vectorsDir)) {
      fs.mkdirSync(vectorsDir, { recursive: true });
    }

    // Save each vector with its metadata
    for (const vector of this.vectors) {
      const vectorId = `vector_${vector.id}`;
      const vectorPath = path.join(vectorsDir, `${vectorId}.json`);
      
      const vectorData = {
        id: vectorId,
        vector: vector.vector,
        dimensions: this.dimension,
        model: this.model,
        createdAt: new Date().toISOString(),
        ...vector.metadata
      };

      fs.writeFileSync(vectorPath, JSON.stringify(vectorData, null, 2));
    }

    // Save the vector store metadata
    const storeMetadata: VectorMetadata = {
      id: this.datasetId,
      dimensions: this.dimension,
      model: this.model,
      createdAt: new Date().toISOString()
    };

    const storePath = path.join(vectorsDir, 'vector_store.json');
    fs.writeFileSync(storePath, JSON.stringify(storeMetadata, null, 2));

    return true;
  }

  async load(filepath: string) {
    const vectorsDir = path.join(process.cwd(), 'data', 'vectors', this.datasetId);
    
    if (!fs.existsSync(vectorsDir)) {
      return false;
    }

    const files = fs.readdirSync(vectorsDir);
    this.vectors = [];

    for (const file of files) {
      if (!file.endsWith('.json') || file === 'vector_store.json') continue;

      const vectorPath = path.join(vectorsDir, file);
      try {
        const vectorData = JSON.parse(fs.readFileSync(vectorPath, 'utf-8'));
        this.vectors.push({
          id: parseInt(vectorData.id.replace('vector_', '')),
          vector: vectorData.vector,
          metadata: {
            dimensions: vectorData.dimensions,
            model: vectorData.model,
            createdAt: vectorData.createdAt
          }
        });
      } catch (error) {
        console.error(`Error loading vector file ${file}:`, error);
      }
    }

    return true;
  }
}
