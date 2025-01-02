# Simpleton AI Framework

A NextJS-based backend framework for AI tasks with built-in CLI, Ollama integration, and vector store capabilities. This framework provides a seamless way to process datasets, create embeddings, and serve AI models through a modern web interface.

## Features

- 🚀 Built on Next.js and TypeScript
- 🛠️ Powerful CLI interface
- 📊 Support for CSV and text dataset processing
- 🧠 Integrated with Ollama for embeddings and inference
- 💾 In-memory vector store with persistence
- 🔄 Automatic data chunking and processing
- 🌐 RESTful API endpoints
- ⚡ Real-time inference capabilities
- 🎨 Extensible React components
- 📁 Local file storage system
- 🤖 Ready-to-use AI application templates
- 🔍 Built-in RAG (Retrieval-Augmented Generation) support
- 💬 Chatbot creation capabilities
- 🎯 AI Agent framework

## Prerequisites

- Node.js 18+ and npm
- Ollama installed locally (for embeddings and inference)
- TypeScript knowledge
- 2GB+ RAM recommended for vector operations

## Quick Start

1. Install SimpletonAI:
```bash
npm install simpleton-ai
```

2. Initialize your project:
```bash
npx simpleton init
```

3. Start the development server:
```bash
npm run dev
```

## Use Cases

### 1. Building a RAG Application

```typescript
import { createRagApplication } from 'simpleton-ai';

async function main() {
  const rag = await createRagApplication();
  
  // Query your knowledge base
  const answer = await rag.queryKnowledgeBase(
    "What are the key features of SimpletonAI?"
  );
}
```

### 2. Creating a Chatbot

```typescript
import { createChatbot } from 'simpleton-ai';

async function main() {
  const chatbot = await createChatbot();
  
  // Start chatting
  const response = await chatbot.chat("Tell me about AI frameworks");
  
  // Get conversation history
  const history = chatbot.getHistory();
}
```

### 3. Building an AI Agent

```typescript
import { createAgent } from 'simpleton-ai';

async function main() {
  const agent = await createAgent();
  
  // Add custom tools
  agent.addTool({
    name: 'weather',
    description: 'Get weather information',
    execute: async (location) => {
      // Implement weather lookup
    }
  });
  
  // Let the agent solve tasks
  const result = await agent.think(
    "Analyze the weather data and summarize the trends"
  );
}
```

## CLI Usage

### Data Processing Pipeline

1. Upload your dataset:
```bash
simpleton upload ./data/knowledge_base.csv
```

2. Create chunks:
```bash
simpleton chunk <dataset-id>
```

3. Generate embeddings:
```bash
simpleton vectorize <dataset-id>
```

### Vector Operations

```bash
# List all vectors
simpleton list vectors

# Search vectors
simpleton search "your query here"
```

## API Reference

### RAG Endpoints

#### POST /api/rag/query
Query your knowledge base with RAG.

Request:
```json
{
  "query": "What is SimpletonAI?",
  "options": {
    "numResults": 3,
    "threshold": 0.7
  }
}
```

### Chatbot Endpoints

#### POST /api/chat
Interact with the chatbot.

Request:
```json
{
  "message": "Tell me about AI",
  "conversationId": "123",
  "options": {
    "temperature": 0.7
  }
}
```

### Agent Endpoints

#### POST /api/agent/task
Submit a task to the AI agent.

Request:
```json
{
  "task": "Analyze this dataset",
  "tools": ["search", "calculate"],
  "context": {
    "datasetId": "123"
  }
}
```

## Architecture

### Directory Structure
```
.
├── data/                  # Data storage
│   ├── uploads/          # Raw dataset files
│   ├── chunks/           # Processed data chunks
│   ├── vectors/          # Vector embeddings
│   └── models/           # Trained models
├── src/
│   ├── cli/             # CLI implementation
│   ├── lib/             # Core libraries
│   │   ├── vectorStore.ts
│   │   ├── ollamaClient.ts
│   │   ├── rag.ts
│   │   ├── chatbot.ts
│   │   └── agent.ts
│   ├── app/             # Next.js app
│   └── components/      # React components
└── examples/            # Example implementations
    ├── rag.ts
    ├── chatbot.ts
    ├── agent.ts
    └── integration.ts
```

## Best Practices

### 1. Data Management
- Organize data into logical datasets
- Use appropriate chunk sizes (default 1000 tokens)
- Regularly update vector embeddings
- Monitor vector store size

### 2. Performance
- Implement caching for frequent queries
- Use batch processing for large datasets
- Configure vector store parameters based on your data size

### 3. Security
- Secure your Ollama endpoint
- Implement rate limiting
- Validate all user inputs
- Handle sensitive information properly

### 4. Development
- Start with example templates
- Use TypeScript for type safety
- Follow the modular architecture
- Write tests for custom tools

## Configuration

```json
{
  "vectorStore": {
    "dimension": 768,
    "similarity": "cosine",
    "maxElements": 100000
  },
  "ollama": {
    "baseUrl": "http://127.0.0.1:11434",
    "defaultModel": "nomic-embed-text",
    "timeout": 30000
  },
  "rag": {
    "numResults": 3,
    "minSimilarity": 0.7
  }
}
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) for details.
