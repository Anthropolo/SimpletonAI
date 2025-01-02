import { OllamaClient } from '../src/lib/ollamaClient';
import { VectorStore } from '../src/lib/vectorStore';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function createChatbot() {
  const ollama = new OllamaClient('http://127.0.0.1:11434');
  const vectorStore = new VectorStore({
    dimension: 768,
    similarity: 'cosine'
  });

  let conversationHistory: ChatMessage[] = [];

  async function chat(userMessage: string) {
    try {
      // 1. Add user message to history
      conversationHistory.push({ role: 'user', content: userMessage });

      // 2. Get relevant context if available
      const messageEmbedding = await ollama.getEmbedding(userMessage);
      const relevantDocs = await vectorStore.search(messageEmbedding, 2);
      const context = relevantDocs.map(doc => doc.text).join('\n');

      // 3. Create prompt with history and context
      const prompt = `
        ${context ? `Relevant context: ${context}\n\n` : ''}
        Conversation history:
        ${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
        
        Assistant: 
      `;

      // 4. Generate response
      const response = await ollama.generateText(prompt);
      
      // 5. Add response to history
      conversationHistory.push({ role: 'assistant', content: response });

      return response;

    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  function clearHistory() {
    conversationHistory = [];
  }

  return {
    chat,
    clearHistory,
    getHistory: () => conversationHistory
  };
}

export default createChatbot;
