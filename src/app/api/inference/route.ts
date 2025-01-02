import { NextResponse } from 'next/server';
import { OllamaClient } from '@/lib/ollamaClient';
import { VectorStore } from '@/lib/vectorStore';

const ollama = new OllamaClient();
const vectorStore = new VectorStore();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, model = 'llama2' } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Get embedding for the query
    const queryEmbedding = await ollama.getEmbedding(query, model);

    // Search vector store
    const searchResults = await vectorStore.search(queryEmbedding, 5);

    // Generate completion using context
    const completion = await ollama.generateCompletion(query, model);

    return NextResponse.json({
      completion,
      similarDocs: searchResults
    });
  } catch (error) {
    console.error('Inference error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
