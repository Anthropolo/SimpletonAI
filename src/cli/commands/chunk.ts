import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';

interface ChunkOptions {
  size?: number;
}

interface CSVRow {
  [key: string]: string | number;
}

export async function chunkData(datasetId: string, options: ChunkOptions = {}) {
  try {
    const chunkSize = options.size || 1000;
    const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
    const chunksDir = path.join(process.cwd(), 'data', 'chunks');

    // Ensure chunks directory exists
    try {
      await fs.mkdir(chunksDir, { recursive: true });
    } catch (error) {
      console.error('Error creating chunks directory:', error);
      throw new Error('Failed to create chunks directory');
    }

    // Find the dataset file with any extension
    let files;
    try {
      files = await fs.readdir(uploadsDir);
    } catch (error) {
      console.error('Error reading uploads directory:', error);
      throw new Error('Failed to read uploads directory');
    }
    
    const datasetFile = files.find(file => file.startsWith(datasetId));
    if (!datasetFile) {
      throw new Error(`Dataset not found: ${datasetId}`);
    }

    // Read dataset content
    let content;
    try {
      content = await fs.readFile(path.join(uploadsDir, datasetFile), 'utf-8');
    } catch (error) {
      console.error('Error reading dataset file:', error);
      throw new Error('Failed to read dataset file');
    }

    let records: string[];

    // Handle different file types
    const ext = path.extname(datasetFile).toLowerCase();
    try {
      if (ext === '.csv') {
        // Parse CSV and convert each row to string
        const parsed = parse(content, { columns: true }) as CSVRow[];
        records = parsed.map(row => JSON.stringify(row));
      } else {
        // For text files, split by words
        records = content.split(/\s+/);
      }
    } catch (error) {
      console.error('Error parsing file content:', error);
      throw new Error(`Failed to parse ${ext} file`);
    }

    const chunks: string[] = [];

    // Create chunks
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize).join(' ');
      chunks.push(chunk);
    }

    // Save chunks
    const datasetDir = path.join(chunksDir, datasetId);
    try {
      await fs.mkdir(datasetDir, { recursive: true });
    } catch (error) {
      console.error('Error creating dataset chunks directory:', error);
      throw new Error('Failed to create dataset chunks directory');
    }

    // Write chunks to files
    try {
      await Promise.all(chunks.map(async (chunk, index) => {
        const chunkPath = path.join(datasetDir, `chunk_${index}.txt`);
        await fs.writeFile(chunkPath, chunk);
      }));
    } catch (error) {
      console.error('Error writing chunks:', error);
      throw new Error('Failed to write chunks to files');
    }

    console.log(`✨ Created ${chunks.length} chunks for dataset ${datasetId}`);
    return chunks.length;
  } catch (error) {
    console.error('Error in chunkData:', error);
    throw error;
  }
}
