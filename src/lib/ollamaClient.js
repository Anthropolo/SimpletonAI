"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaClient = void 0;
const axios_1 = __importDefault(require("axios"));
class OllamaClient {
    constructor(baseUrl = 'http://localhost:11434') {
        this.baseUrl = baseUrl;
    }
    async getEmbedding(text, model = 'llama2') {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/api/embeddings`, {
                model,
                prompt: text,
            });
            return response.data.embedding;
        }
        catch (error) {
            console.error('Error getting embedding:', error);
            throw error;
        }
    }
    async generateCompletion(prompt, model = 'llama2') {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/api/generate`, {
                model,
                prompt,
                stream: false,
            });
            return response.data.response;
        }
        catch (error) {
            console.error('Error generating completion:', error);
            throw error;
        }
    }
}
exports.OllamaClient = OllamaClient;
