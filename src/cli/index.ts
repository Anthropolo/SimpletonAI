#!/usr/bin/env node

import { Command } from 'commander';
import { initializeProject } from './commands/init.js';
import { uploadDataset } from './commands/upload.js';
import { chunkData } from './commands/chunk.js';
import { vectorizeData } from './commands/vectorize.js';
import { trainModel } from './commands/train.js';
import { startServer } from './commands/serve.js';
import { listDatasets, listChunks, listVectors } from './commands/list.js';

const program = new Command();

program
  .name('simpleton')
  .description('CLI for Simpleton AI framework')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize a new Simpleton AI project')
  .action(async () => {
    try {
      await initializeProject();
    } catch (error) {
      console.error('Failed to initialize project:', error);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List datasets, chunks, or vectors')
  .argument('[type]', 'Type of data to list (datasets, chunks, vectors)', 'datasets')
  .option('-d, --dataset <id>', 'Filter by dataset ID')
  .action(async (type, options) => {
    try {
      switch (type) {
        case 'datasets':
          await listDatasets();
          break;
        case 'chunks':
          await listChunks(options.dataset);
          break;
        case 'vectors':
          await listVectors(options.dataset);
          break;
        default:
          console.error('Invalid type. Must be one of: datasets, chunks, vectors');
          process.exit(1);
      }
    } catch (error) {
      console.error(`Failed to list ${type}:`, error);
      process.exit(1);
    }
  });

program
  .command('upload')
  .description('Upload a dataset (Excel/PDF)')
  .argument('<path>', 'Path to the dataset file')
  .option('-t, --type <type>', 'Type of dataset (excel/pdf)')
  .action(async (path, options) => {
    try {
      const datasetId = await uploadDataset(path, options);
      console.log(`Dataset uploaded with ID: ${datasetId}`);
    } catch (error) {
      console.error('Failed to upload dataset:', error);
      process.exit(1);
    }
  });

program
  .command('chunk')
  .description('Chunk uploaded dataset')
  .argument('<datasetId>', 'ID of the uploaded dataset')
  .option('-s, --size <size>', 'Chunk size', '1000')
  .action(async (datasetId, options) => {
    try {
      const chunkSize = parseInt(options.size);
      await chunkData(datasetId, { size: chunkSize });
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program
  .command('vectorize')
  .description('Generate vector embeddings for chunks')
  .argument('<datasetId>', 'ID of the dataset to vectorize')
  .option('-m, --model <model>', 'Model to use for embeddings', 'nomic-embed-text')
  .action(async (datasetId, options) => {
    try {
      await vectorizeData(datasetId, { model: options.model });
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program
  .command('train')
  .description('Train a model using Ollama')
  .argument('<datasetId>', 'ID of the dataset')
  .option('-m, --model <model>', 'Base model to fine-tune', 'llama2')
  .action(async (datasetId, options) => {
    try {
      const metadata = await trainModel(datasetId, options);
      console.log('Training completed successfully');
      console.log('Model metadata:', JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.error('Failed to train model:', error);
      process.exit(1);
    }
  });

program
  .command('serve')
  .description('Start the inference server')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .action(async (options) => {
    try {
      await startServer(options);
      // Server will keep running until terminated
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  });

program.parse();
