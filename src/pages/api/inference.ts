import { NextApiRequest, NextApiResponse } from 'next';
import { OllamaClient } from '@/lib/ollamaClient';
import { VectorStore } from '@/lib/vectorStore';

const ollama = new OllamaClient();
const vectorStore = new VectorStore();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { query, model = 'llama2' } = req.body;

    // Get embedding for the query
    const queryEmbedding = await ollama.getEmbedding(query, model);

    // Search vector store
    const searchResults = await vectorStore.search(queryEmbedding, 5);

    // Generate completion using context
    const completion = await ollama.generateCompletion(query, model);

    return res.status(200).json({
      completion,
      similarDocs: searchResults
    });
  } catch (error) {
    console.error('Inference error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
