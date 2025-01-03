// Core functionality
export { OllamaClient } from './lib/ollamaClient';
export { VectorStore } from './lib/vectorStore';
export { FileLoader } from './lib/fileLoader';
export { TextSplitter } from './lib/textSplitter';

// Application templates
export { default as createRagApplication } from './examples/rag';
export { default as createChatbot } from './examples/chatbot';
export type { Message as ChatMessage, ChatbotOptions } from './examples/chatbot';
export { default as createAgent } from './examples/agent';

// Types
export type { ChunkInfo, DatasetInfo, VectorInfo } from './types/data';

// Utility functions
export { chunkData } from './cli/commands/chunk';
export { vectorizeData } from './cli/commands/vectorize';

// Re-export for convenience
export type { Tool } from './examples/agent';
export type { ChatMessage } from './examples/chatbot';
