# Simpleton AI Framework

A NextJS-based backend framework for AI tasks with built-in CLI, Ollama integration, and vector store capabilities. This framework provides a seamless way to process datasets, create embeddings, and serve AI models through a modern web interface.

## Features

- 🚀 Built on Next.js and TypeScript
- 🛠️ Powerful CLI interface
- 📊 Support for Excel and PDF dataset processing
- 🧠 Integrated with Ollama for embeddings and inference
- 💾 In-memory vector store with persistence
- 🔄 Automatic data chunking and processing
- 🌐 RESTful API endpoints
- ⚡ Real-time inference capabilities
- 🎨 Extensible React components
- 📁 Local file storage system

## Prerequisites

- Node.js 18+ and npm
- Ollama installed locally (for embeddings and inference)
- TypeScript knowledge
- 2GB+ RAM recommended for vector operations

## Quick Start

1. Clone and install dependencies:
```bash
git clone <your-repo>
cd simpleton-ai
npm install
```

2. Build and link the CLI:
```bash
npm run build
npm link # To use the CLI globally
```

3. Initialize your project:
```bash
simpleton init
```

## Detailed CLI Usage

### Dataset Management

#### Upload Dataset
Upload Excel or PDF files for processing:
```bash
# Upload Excel file
simpleton upload ./data/mydata.xlsx --type excel

# Upload PDF document
simpleton upload ./docs/paper.pdf --type pdf
```

#### Chunk Data
Split your dataset into manageable chunks:
```bash
# Default chunk size (1000 tokens)
simpleton chunk dataset_123

# Custom chunk size
simpleton chunk dataset_123 --size 500
```

### Vector Operations

#### Vectorize Data
Create embeddings using Ollama:
```bash
# Using default model (llama2)
simpleton vectorize dataset_123

# Specify different model
simpleton vectorize dataset_123 --model llama2-uncensored
```

### Model Operations

#### Train Model
Fine-tune models using your data:
```bash
# Basic training
simpleton train dataset_123

# Advanced training options
simpleton train dataset_123 --model llama2 --epochs 3 --batch-size 32
```

#### Serve Model
Start the inference server:
```bash
# Default port (3000)
simpleton serve

# Custom port
simpleton serve --port 8080
```

## API Reference

### Inference Endpoint

#### POST /api/inference
Make inference requests to your model.

Request body:
```json
{
  "query": "What is the capital of France?",
  "model": "llama2",
  "options": {
    "temperature": 0.7,
    "max_tokens": 100
  }
}
```

Response:
```json
{
  "completion": "The capital of France is Paris.",
  "similarDocs": {
    "ids": [1, 2, 3],
    "distances": [0.1, 0.2, 0.3]
  },
  "metadata": {
    "model": "llama2",
    "processingTime": "0.5s"
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
├── config/               # Configuration files
│   └── simpleton.config.json
├── src/
│   ├── cli/             # CLI implementation
│   │   ├── commands/    # Individual CLI commands
│   │   └── index.ts     # CLI entry point
│   ├── lib/             # Core libraries
│   │   ├── vectorStore.ts
│   │   └── ollamaClient.ts
│   ├── pages/           # Next.js pages
│   │   └── api/         # API routes
│   └── components/      # React components
└── tests/               # Test files
```

### Core Components

#### Vector Store
The vector store uses HNSWLib for efficient similarity search:
- Cosine similarity metric
- In-memory storage with persistence
- Configurable dimensions and max elements
- Fast nearest neighbor search

#### Ollama Integration
Built-in integration with Ollama for:
- Text embeddings
- Model inference
- Fine-tuning capabilities
- Multiple model support

## Configuration

### Full Configuration Options

```json
{
  "vectorStore": {
    "type": "memory",
    "dimension": 384,
    "maxElements": 100000,
    "efConstruction": 200,
    "M": 16
  },
  "ollama": {
    "baseUrl": "http://localhost:11434",
    "defaultModel": "llama2",
    "timeout": 30000,
    "maxRetries": 3
  },
  "storage": {
    "type": "local",
    "uploadDir": "data/uploads",
    "maxFileSize": "100mb",
    "allowedTypes": ["xlsx", "pdf"]
  },
  "server": {
    "port": 3000,
    "host": "localhost",
    "cors": {
      "origin": "*",
      "methods": ["GET", "POST"]
    }
  }
}
```

## Error Handling

The framework includes comprehensive error handling:
- Detailed error messages
- Error codes for API responses
- Automatic retries for transient failures
- Logging system for debugging

## Best Practices

1. **Data Management**
   - Regularly clean up unused datasets
   - Monitor vector store memory usage
   - Use appropriate chunk sizes for your use case

2. **Model Usage**
   - Start with smaller models for testing
   - Monitor Ollama resource usage
   - Cache frequently used embeddings

3. **API Implementation**
   - Implement rate limiting for production
   - Add authentication for sensitive operations
   - Use appropriate timeout values

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## License

MIT License - see LICENSE file for details

## Support

- GitHub Issues: [Report a bug](https://github.com/yourusername/simpleton-ai/issues)
- Documentation: [Full documentation](https://docs.simpleton-ai.com)
- Discord: [Join our community](https://discord.gg/simpleton-ai)
