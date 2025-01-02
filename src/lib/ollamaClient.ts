import axios, { AxiosError } from 'axios';

interface GenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  stream?: boolean;
}

interface EmbeddingOptions {
  model?: string;
  dimensions?: number;
}

export class OllamaClient {
  private baseUrl: string;
  private defaultModel: string;

  constructor(baseUrl: string = 'http://127.0.0.1:11434', defaultModel: string = 'nomic-embed-text') {
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      return error.response?.data?.error || error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  async getEmbedding(text: string, options: EmbeddingOptions = {}): Promise<number[]> {
    try {
      const model = options.model || this.defaultModel;
      const response = await axios.post(`${this.baseUrl}/api/embeddings`, {
        model,
        prompt: text,
        dimensions: options.dimensions,
      });

      if (!response.data.embedding) {
        throw new Error('No embedding returned from Ollama');
      }

      return response.data.embedding;
    } catch (error) {
      console.error('Error getting embedding:', error);
      throw new Error(`Failed to get embedding: ${this.getErrorMessage(error)}`);
    }
  }

  async generateText(prompt: string, options: GenerateOptions = {}): Promise<string> {
    try {
      const {
        model = 'llama2',
        temperature = 0.7,
        maxTokens = 500,
        topP = 0.9,
        topK = 40,
        stream = false
      } = options;

      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model,
        prompt,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
        top_k: topK,
        stream,
      });

      if (!response.data.response) {
        throw new Error('No response returned from Ollama');
      }

      return response.data.response;
    } catch (error) {
      console.error('Error generating text:', error);
      throw new Error(`Failed to generate text: ${this.getErrorMessage(error)}`);
    }
  }

  async generateCompletion(prompt: string, options: GenerateOptions = {}): Promise<string> {
    return this.generateText(prompt, options);
  }

  async chat(messages: { role: 'system' | 'user' | 'assistant'; content: string }[], options: GenerateOptions = {}): Promise<string> {
    try {
      const {
        model = 'llama2',
        temperature = 0.7,
        maxTokens = 500,
        stream = false
      } = options;

      const response = await axios.post(`${this.baseUrl}/api/chat`, {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream,
      });

      if (!response.data.message?.content) {
        throw new Error('No response returned from Ollama chat');
      }

      return response.data.message.content;
    } catch (error) {
      console.error('Error in chat:', error);
      throw new Error(`Failed to generate chat response: ${this.getErrorMessage(error)}`);
    }
  }
}
