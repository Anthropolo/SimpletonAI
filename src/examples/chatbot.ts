import { OllamaClient } from '../lib/ollamaClient';
import { VectorStore } from '../lib/vectorStore';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatbotOptions {
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
    similarity: 'cosine'
  });

  if (documents.length > 0) {
    const embeddings = await Promise.all(
      documents.map(doc => ollama.getEmbedding(doc.content))
    );
    await vectorStore.addVectors(embeddings, documents.map(doc => doc.id));
  }

  const history: Message[] = [
    { role: 'system', content: systemPrompt }
  ];

  return {
    async chat(userMessage: string) {
      history.push({ role: 'user', content: userMessage });

      const messageEmbedding = await ollama.getEmbedding(userMessage);
      const searchResults = await vectorStore.search(messageEmbedding, 2);
      
      const relevantDocs = searchResults.indices
        .map(index => documents.find(doc => doc.id === index))
        .filter((doc): doc is { id: number; content: string } => doc !== undefined)
        .map(doc => doc.content);

      const context = relevantDocs.join('\n');

      const prompt = `
        ${context ? `Context:\n${context}\n\n` : ''}
        Based on the above context (if any), please respond to the following conversation:
        
        ${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
      `;

      const response = await ollama.generateText(prompt);
      history.push({ role: 'assistant', content: response });

      if (history.length > maxHistory * 2 + 1) {
        history.splice(1, 2);
      }

      return response;
    },
    getHistory: () => [...history]
  };
}

export default createChatbot;