import fs from 'fs/promises';
import path from 'path';
import { OllamaClient } from '../../lib/ollamaClient';
import { VectorStore } from '../../lib/vectorStore';

interface VectorizeOptions {
  model?: string;
}

export async function vectorizeData(datasetId: string, options: VectorizeOptions = {}) {
  try {
    const model = options.model || 'nomic-embed-text';
    
    // Find the correct chunks directory
    const chunksBaseDir = path.join(process.cwd(), 'data', 'chunks');
    const chunksDirs = await fs.readdir(chunksBaseDir);
    const matchingDir = chunksDirs.find(dir => dir.startsWith(datasetId));
    
    if (!matchingDir) {
      throw new Error('No chunks directory found for dataset');
    }
    
    const chunksDir = path.join(chunksBaseDir, matchingDir);
    const vectorsDir = path.join(process.cwd(), 'data', 'vectors', matchingDir);

    // Ensure vectors directory exists
    try {
      await fs.mkdir(vectorsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating vectors directory:', error);
      throw new Error('Failed to create vectors directory');
    }

    // Get list of chunk files
    let chunkFiles;
    try {
      chunkFiles = await fs.readdir(chunksDir);
      chunkFiles = chunkFiles.filter(file => file.endsWith('.txt'));
    } catch (error) {
      console.error('Error reading chunks directory:', error);
      throw new Error('Failed to read chunks directory');
    }

    if (chunkFiles.length === 0) {
      throw new Error('No chunks found for dataset');
    }

    // Initialize Ollama client and vector store
    const ollama = new OllamaClient();
    const vectorStore = new VectorStore(768, model, matchingDir);

    // Process each chunk
    console.log(`Processing ${chunkFiles.length} chunks with model ${model}...`);
    for (const [index, file] of chunkFiles.entries()) {
      try {
        // Read chunk content
        const filePath = path.join(chunksDir, file);
        const content = await fs.readFile(filePath, 'utf-8');

        // Get embedding from Ollama
        console.log(`Getting embedding for chunk ${index + 1}/${chunkFiles.length}...`);
        const embedding = await ollama.getEmbedding(content, model);

        // Add to vector store
        await vectorStore.addVectors([embedding], [index]);

        // Log progress
        console.log(` Processed chunk ${index + 1}/${chunkFiles.length}`);
      } catch (error) {
        console.error(`Error processing chunk ${file}:`, error);
        throw new Error(`Failed to process chunk ${file}`);
      }
    }

    // Save the vector store
    await vectorStore.save('');

    console.log(` Created vectors for ${chunkFiles.length} chunks using model ${model}`);
    return chunkFiles.length;
  } catch (error) {
    console.error('Error in vectorizeData:', error);
    throw error;
  }
}
