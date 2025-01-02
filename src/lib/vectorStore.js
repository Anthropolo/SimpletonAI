"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorStore = void 0;
class VectorStore {
    constructor(dimension = 384) {
        this.vectors = [];
        this.dimension = dimension;
    }
    async addVectors(vectors, ids) {
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
    cosineSimilarity(a, b) {
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
    async search(query, k = 5) {
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
    async save(filepath) {
        // For demonstration, we'll just log that we're saving
        console.log(`[VectorStore] Would save vectors to: ${filepath}`);
        return true;
    }
    async load(filepath) {
        // For demonstration, we'll just log that we're loading
        console.log(`[VectorStore] Would load vectors from: ${filepath}`);
        return true;
    }
}
exports.VectorStore = VectorStore;
