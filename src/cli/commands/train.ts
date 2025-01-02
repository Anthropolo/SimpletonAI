import fs from 'fs';
import path from 'path';
import axios from 'axios';

interface TrainOptions {
  model?: string;
  epochs?: number;
  batchSize?: number;
}

export async function trainModel(datasetId: string, options: TrainOptions = {}) {
  try {
    const model = options.model || 'llama2';
    const epochs = options.epochs || 1;
    const batchSize = options.batchSize || 32;

    const chunksDir = path.join(process.cwd(), 'data', 'chunks', datasetId);
    const modelsDir = path.join(process.cwd(), 'data', 'models');

    if (!fs.existsSync(chunksDir)) {
      throw new Error(`Dataset chunks not found: ${datasetId}`);
    }

    // Ensure models directory exists
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }

    // Read all chunks
    const chunkFiles = fs.readdirSync(chunksDir).filter(file => file.startsWith('chunk_'));
    const trainingData = [];

    for (const chunkFile of chunkFiles) {
      const chunkPath = path.join(chunksDir, chunkFile);
      const content = fs.readFileSync(chunkPath, 'utf-8');
      trainingData.push(content);
    }

    console.log(`Starting training with ${trainingData.length} chunks...`);
    console.log(`Model: ${model}, Epochs: ${epochs}, Batch Size: ${batchSize}`);

    // Send training request to Ollama
    const response = await axios.post('http://localhost:11434/api/train', {
      model,
      data: trainingData,
      parameters: {
        epochs,
        batch_size: batchSize
      }
    });

    // Save model metadata
    const modelMetadata = {
      baseModel: model,
      datasetId,
      trainedAt: new Date().toISOString(),
      parameters: {
        epochs,
        batchSize
      }
    };

    const metadataPath = path.join(modelsDir, `${datasetId}_metadata.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(modelMetadata, null, 2));

    console.log(`✨ Successfully trained model for dataset ${datasetId}`);
    return modelMetadata;
  } catch (error) {
    console.error('Error training model:', error);
    throw error;
  }
}
