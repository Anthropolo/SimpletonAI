import fs from 'fs';
import path from 'path';
import { OllamaClient } from '../../lib/ollamaClient';
import { VectorStore } from '../../lib/vectorStore';

interface VectorizeOptions {
  model?: string;
}

export async function vectorize(datasetId: string, options: VectorizeOptions = {}) {
  try {
    const model = options.model || 'llama2';
    const chunksDir = path.join(process.cwd(), 'data', 'chunks', datasetId);
    const vectorsDir = path.join(process.cwd(), 'data', 'vectors');

    if (!fs.existsSync(chunksDir)) {
      throw new Error(`Dataset chunks not found: ${datasetId}`);
    }

    // Ensure vectors directory exists
    if (!fs.existsSync(vectorsDir)) {
      fs.mkdirSync(vectorsDir, { recursive: true });
    }

    const ollama = new OllamaClient();
    const vectorStore = new VectorStore();

    // Process each chunk
    const chunkFiles = fs.readdirSync(chunksDir).filter(file => file.startsWith('chunk_'));
    const vectors: number[][] = [];
    const ids: number[] = [];

    console.log(`Processing ${chunkFiles.length} chunks...`);

    for (let i = 0; i < chunkFiles.length; i++) {
      const chunkPath = path.join(chunksDir, chunkFiles[i]);
      const content = fs.readFileSync(chunkPath, 'utf-8');
      
      // Get embedding from Ollama
      const embedding = await ollama.getEmbedding(content, model);
      vectors.push(embedding);
      ids.push(i);

      process.stdout.write(`\rProcessed ${i + 1}/${chunkFiles.length} chunks`);
    }

    console.log('\nAdding vectors to store...');
    await vectorStore.addVectors(vectors, ids);

    // Save vector store
    const vectorPath = path.join(vectorsDir, `${datasetId}.vstore`);
    await vectorStore.save(vectorPath);

    console.log(`✨ Successfully vectorized ${vectors.length} chunks for dataset ${datasetId}`);
    return vectors.length;
  } catch (error) {
    console.error('Error vectorizing data:', error);
    throw error;
  }
}
