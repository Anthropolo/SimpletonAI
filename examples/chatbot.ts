import { OllamaClient } from '../src/lib/ollamaClient';
import { VectorStore } from '../src/lib/vectorStore';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatbotOptions {
  systemPrompt?: string;
  model?: string;
  maxHistory?: number;
  documents?: { id: number; content: string }[];
}

async function createChatbot(options: ChatbotOptions = {}) {
  const {
    systemPrompt = 'You are a helpful AI assistant.',
    model = 'llama2',
    maxHistory = 10,
    documents = []
  } = options;

  const ollama = new OllamaClient('http://127.0.0.1:11434', model);
  const vectorStore = new VectorStore({
    dimension: 768,
    model: 'nomic-embed-text',
    similarity: 'cosine'
  });

  // Initialize vector store with documents if provided
  if (documents.length > 0) {
    const embeddings = await Promise.all(
      documents.map(doc => ollama.getEmbedding(doc.content))
    );
    await vectorStore.addVectors(embeddings, documents.map(doc => doc.id));
  }

  const history: Message[] = [
    { role: 'system', content: systemPrompt }
  ];

  async function chat(userMessage: string): Promise<string> {
    try {
      // 1. Add user message to history
      history.push({ role: 'user', content: userMessage });
      if (history.length > maxHistory) {
        // Remove oldest messages but keep system prompt
        history.splice(1, history.length - maxHistory);
      }

      // 2. Get relevant context from vector store
      const messageEmbedding = await ollama.getEmbedding(userMessage);
      const searchResults = await vectorStore.search(messageEmbedding, 2);
      
      // Get documents based on returned indices
      const relevantDocs = searchResults.indices
        .map(index => documents.find(doc => doc.id === index))
        .filter((doc): doc is { id: number; content: string } => doc !== undefined)
        .map(doc => doc.content);

      const context = relevantDocs.join('\n');

      // 3. Create prompt with history and context
      const prompt = `
        ${context ? `Context:\n${context}\n\n` : ''}
        Based on the above context (if any), please respond to the following conversation:
        
        ${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
      `;

      // 4. Generate response
      const response = await ollama.generateText(prompt, {
        temperature: 0.7,
        maxTokens: 1000
      });

      // 5. Add response to history
      history.push({ role: 'assistant', content: response });

      return response;
    } catch (error) {
      console.error('Error in chat:', error);
      if (error instanceof Error) {
        return `I apologize, but I encountered an error: ${error.message}`;
      }
      return 'I apologize, but I encountered an unexpected error.';
    }
  }

  return {
    chat,
    getHistory: () => [...history],
    clearHistory: () => {
      history.length = 1; // Keep system prompt
    }
  };
}

export default createChatbot;
