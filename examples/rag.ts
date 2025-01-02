import { VectorStore } from '../src/lib/vectorStore';
import { OllamaClient } from '../src/lib/ollamaClient';

async function createRagApplication() {
  // Initialize vector store and Ollama client
  const vectorStore = new VectorStore({
    dimension: 768,  // For nomic-embed-text model
    similarity: 'cosine'
  });
  
  const ollama = new OllamaClient('http://127.0.0.1:11434');

  async function queryKnowledgeBase(query: string) {
    try {
      // 1. Generate embedding for the query
      const queryEmbedding = await ollama.getEmbedding(query);

      // 2. Find relevant documents
      const relevantDocs = await vectorStore.search(queryEmbedding, 3);

      // 3. Create context from relevant documents
      const context = relevantDocs.map(doc => doc.text).join('\n\n');

      // 4. Generate response using LLM with context
      const prompt = `
        Context: ${context}
        
        Question: ${query}
        
        Please answer the question based on the context provided.
      `;

      const response = await ollama.generateText(prompt);
      return response;

    } catch (error) {
      console.error('Error in RAG query:', error);
      throw error;
    }
  }

  return {
    queryKnowledgeBase
  };
}

export default createRagApplication;
