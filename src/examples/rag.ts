import { OllamaClient } from '../lib/ollamaClient';
import { VectorStore } from '../lib/vectorStore';

interface Document {
  id: number;
  content: string;
  metadata?: Record<string, any>;
}

interface RagOptions {
  documents?: Document[];
  model?: string;
  maxResults?: number;
}

async function createRagApplication(options: RagOptions = {}) {
  const {
    documents = [],
    model = 'llama2',
    maxResults = 3
  } = options;

  // Initialize vector store and Ollama client
  const vectorStore = new VectorStore({
    dimension: 768,  // For nomic-embed-text model
    model: 'nomic-embed-text',
    similarity: 'cosine'
  });
  
  const ollama = new OllamaClient('http://127.0.0.1:11434', model);

  // Initialize vector store with documents if provided
  if (documents.length > 0) {
    console.log(`Initializing vector store with ${documents.length} documents...`);
    const embeddings = await Promise.all(
      documents.map(doc => ollama.getEmbedding(doc.content))
    );
    await vectorStore.addVectors(embeddings, documents.map(doc => doc.id));
  }

  async function queryKnowledgeBase(query: string) {
    try {
      // 1. Generate embedding for the query
      const queryEmbedding = await ollama.getEmbedding(query);

      // 2. Find relevant documents
      const searchResults = await vectorStore.search(queryEmbedding, maxResults);
      
      // 3. Get documents based on returned indices
      const relevantDocs = searchResults.indices
        .map(index => documents.find(doc => doc.id === index))
        .filter((doc): doc is Document => doc !== undefined)
        .map(doc => doc.content);

      // 4. Generate response using LLM with context
      const prompt = `
        Context:
        ${relevantDocs.join('\n\n')}
        
        Question: ${query}
        
        Based on the context provided above, please answer the question. If the context doesn't contain relevant information, please say so.
      `;

      const response = await ollama.generateText(prompt, {
        temperature: 0.7,
        maxTokens: 1000
      });

      return {
        response,
        relevantDocuments: searchResults.indices.map((index, i) => ({
          id: index,
          similarity: searchResults.similarities[i]
        }))
      };

    } catch (error) {
      console.error('Error in RAG query:', error);
      if (error instanceof Error) {
        throw new Error(`RAG query failed: ${error.message}`);
      }
      throw new Error('RAG query failed with an unexpected error');
    }
  }

  return {
    queryKnowledgeBase,
    addDocuments: async (newDocuments: Document[]) => {
      const embeddings = await Promise.all(
        newDocuments.map(doc => ollama.getEmbedding(doc.content))
      );
      await vectorStore.addVectors(embeddings, newDocuments.map(doc => doc.id));
      documents.push(...newDocuments);
    }
  };
}

export default createRagApplication;
