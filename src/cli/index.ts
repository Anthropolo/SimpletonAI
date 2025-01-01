#!/usr/bin/env node
import { Command } from 'commander';
import { initializeProject } from './commands/init';
import { uploadDataset } from './commands/upload';
import { chunkData } from './commands/chunk';
import { vectorize } from './commands/vectorize';
import { trainModel } from './commands/train';
import { startServer } from './commands/serve';

const program = new Command();

program
  .name('simpleton')
  .description('CLI for Simpleton AI framework')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize a new Simpleton AI project')
  .action(initializeProject);

program
  .command('upload')
  .description('Upload a dataset (Excel/PDF)')
  .argument('<path>', 'Path to the dataset file')
  .option('-t, --type <type>', 'Type of dataset (excel/pdf)')
  .action(uploadDataset);

program
  .command('chunk')
  .description('Chunk uploaded dataset')
  .argument('<datasetId>', 'ID of the uploaded dataset')
  .option('-s, --size <size>', 'Chunk size', '1000')
  .action(chunkData);

program
  .command('vectorize')
  .description('Vectorize chunks using Ollama')
  .argument('<datasetId>', 'ID of the dataset')
  .option('-m, --model <model>', 'Ollama model to use', 'llama2')
  .action(vectorize);

program
  .command('train')
  .description('Train a model using Ollama')
  .argument('<datasetId>', 'ID of the dataset')
  .option('-m, --model <model>', 'Base model to fine-tune', 'llama2')
  .action(trainModel);

program
  .command('serve')
  .description('Start the inference server')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .action(startServer);

program.parse();
