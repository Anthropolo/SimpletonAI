import axios from 'axios';

export class OllamaClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async getEmbedding(text: string, model: string = 'llama2'): Promise<number[]> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/embeddings`, {
        model,
        prompt: text,
      });
      return response.data.embedding;
    } catch (error) {
      console.error('Error getting embedding:', error);
      throw error;
    }
  }

  async generateCompletion(prompt: string, model: string = 'llama2'): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model,
        prompt,
        stream: false,
      });
      return response.data.response;
    } catch (error) {
      console.error('Error generating completion:', error);
      throw error;
    }
  }
}
