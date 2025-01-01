import fs from 'fs';
import path from 'path';

export async function initializeProject() {
  const projectStructure = [
    'data',
    'data/uploads',
    'data/chunks',
    'data/vectors',
    'data/models',
    'config',
  ];

  // Create project directories
  for (const dir of projectStructure) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Create default config
  const configPath = path.join('config', 'simpleton.config.json');
  const defaultConfig = {
    vectorStore: {
      type: 'memory',
      dimension: 384, // Default for many embedding models
    },
    ollama: {
      baseUrl: 'http://localhost:11434',
      defaultModel: 'llama2',
    },
    storage: {
      type: 'local',
      uploadDir: 'data/uploads',
    },
  };

  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  console.log('✨ Initialized Simpleton AI project successfully!');
}
