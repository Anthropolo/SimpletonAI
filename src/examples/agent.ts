import { OllamaClient } from '../lib/ollamaClient';
import { VectorStore } from '../lib/vectorStore';

export interface Tool {
  name: string;
  description: string;
  execute: (args: any) => Promise<any>;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

async function createAgent() {
  const ollama = new OllamaClient('http://127.0.0.1:11434', 'llama2');
  const vectorStore = new VectorStore({
    dimension: 768,
    model: 'nomic-embed-text',
    similarity: 'cosine'
  });

  // Define agent's tools
  const tools: Tool[] = [
    {
      name: 'search_knowledge_base',
      description: 'Search for information in the knowledge base',
      execute: async (query: string) => {
        const embedding = await ollama.getEmbedding(query);
        return await vectorStore.search(embedding, 3);
      }
    },
    {
      name: 'calculate',
      description: 'Perform mathematical calculations',
      execute: async (expression: string) => {
        return eval(expression);
      }
    }
  ];

  async function think(task: string) {
    try {
      // 1. Analyze task and determine required tools
      const planningPrompt = `
        Task: ${task}
        Available tools: ${tools.map(t => `${t.name}: ${t.description}`).join('\n')}
        
        What tools should be used and in what order to complete this task?
        Respond in JSON format with a list of steps, each containing tool name and arguments.
      `;

      const planText = await ollama.generateText(planningPrompt, {
        temperature: 0.7,
        maxTokens: 500
      });

      let plan;
      try {
        plan = JSON.parse(planText);
      } catch (error) {
        console.error('Failed to parse plan:', planText);
        throw new Error(`Failed to generate a valid plan: ${getErrorMessage(error)}`);
      }

      // 2. Execute plan
      const results = [];
      for (const step of plan) {
        const tool = tools.find(t => t.name === step.tool);
        if (!tool) {
          throw new Error(`Unknown tool: ${step.tool}`);
        }
        try {
          const result = await tool.execute(step.args);
          results.push(result);
        } catch (error) {
          throw new Error(`Failed to execute tool ${step.tool}: ${getErrorMessage(error)}`);
        }
      }

      // 3. Generate final response
      const responsePrompt = `
        Task: ${task}
        Results: ${JSON.stringify(results, null, 2)}
        
        Please provide a natural language response summarizing the results.
      `;

      return await ollama.generateText(responsePrompt, {
        temperature: 0.7,
        maxTokens: 1000
      });
    } catch (error) {
      console.error('Error executing task:', error);
      return `I encountered an error while processing your request: ${getErrorMessage(error)}`;
    }
  }

  return {
    think,
    addTool: (tool: Tool) => tools.push(tool)
  };
}

export default createAgent;
