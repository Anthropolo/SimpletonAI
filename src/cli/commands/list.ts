import fs from 'fs';
import path from 'path';

interface DatasetInfo {
  id: string;
  filename: string;
  uploadedAt: string;
  size: number;
  type: string;
}

interface ChunkInfo {
  id: string;
  datasetId: string;
  size: number;
  createdAt: string;
}

interface VectorInfo {
  id: string;
  datasetId: string;
  model: string;
  dimension: number;
  createdAt: string;
}

export async function listDatasets() {
  try {
    const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
    const files = fs.readdirSync(uploadsDir);
    
    const datasets: DatasetInfo[] = [];
    
    for (const file of files) {
      if (file === '.gitkeep') continue;
      
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isFile()) {
        datasets.push({
          id: path.parse(file).name,
          filename: file,
          uploadedAt: stats.birthtime.toISOString(),
          size: stats.size,
          type: path.extname(file).slice(1)
        });
      }
    }
    
    if (datasets.length === 0) {
      console.log('No datasets found. Upload a dataset using: simpleton upload <file>');
      return;
    }
    
    console.log('\nUploaded Datasets:');
    console.log('=================\n');
    
    datasets.forEach(dataset => {
      console.log(`ID: ${dataset.id}`);
      console.log(`Filename: ${dataset.filename}`);
      console.log(`Type: ${dataset.type}`);
      console.log(`Size: ${formatSize(dataset.size)}`);
      console.log(`Uploaded: ${formatDate(dataset.uploadedAt)}`);
      console.log('-------------------\n');
    });
  } catch (error) {
    console.error('Error listing datasets:', error);
    process.exit(1);
  }
}

export async function listChunks(datasetId?: string) {
  try {
    const chunksDir = path.join(process.cwd(), 'data', 'chunks');
    const chunks: ChunkInfo[] = [];
    
    if (!fs.existsSync(chunksDir)) {
      console.log('No chunks directory found. Create chunks using: simpleton chunk <datasetId>');
      return;
    }

    const datasets = fs.readdirSync(chunksDir);
    
    for (const dataset of datasets) {
      if (dataset === '.gitkeep') continue;
      if (datasetId && dataset !== datasetId) continue;
      
      const datasetDir = path.join(chunksDir, dataset);
      if (!fs.statSync(datasetDir).isDirectory()) continue;
      
      const files = fs.readdirSync(datasetDir);
      
      for (const file of files) {
        const filePath = path.join(datasetDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile() && file.endsWith('.json')) {
          chunks.push({
            id: path.parse(file).name,
            datasetId: dataset,
            size: stats.size,
            createdAt: stats.birthtime.toISOString()
          });
        }
      }
    }
    
    if (chunks.length === 0) {
      if (datasetId) {
        console.log(`No chunks found for dataset ${datasetId}. Create chunks using: simpleton chunk ${datasetId}`);
      } else {
        console.log('No chunks found. Create chunks using: simpleton chunk <datasetId>');
      }
      return;
    }
    
    console.log('\nChunks:');
    console.log('=======\n');
    
    chunks.forEach(chunk => {
      console.log(`ID: ${chunk.id}`);
      console.log(`Dataset ID: ${chunk.datasetId}`);
      console.log(`Size: ${formatSize(chunk.size)}`);
      console.log(`Created: ${formatDate(chunk.createdAt)}`);
      console.log('-------------------\n');
    });
  } catch (error) {
    console.error('Error listing chunks:', error);
    process.exit(1);
  }
}

export async function listVectors(datasetId?: string) {
  try {
    const vectorsDir = path.join(process.cwd(), 'data', 'vectors');
    const vectors: VectorInfo[] = [];
    
    if (!fs.existsSync(vectorsDir)) {
      console.log('No vectors directory found. Create vectors using: simpleton vectorize <datasetId>');
      return;
    }

    const datasets = fs.readdirSync(vectorsDir);
    
    for (const dataset of datasets) {
      if (dataset === '.gitkeep') continue;
      if (datasetId && dataset !== datasetId) continue;
      
      const datasetDir = path.join(vectorsDir, dataset);
      if (!fs.statSync(datasetDir).isDirectory()) continue;
      
      const files = fs.readdirSync(datasetDir);
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const filePath = path.join(datasetDir, file);
        const stats = fs.statSync(filePath);
        
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          vectors.push({
            id: path.parse(file).name,
            datasetId: dataset,
            model: content.model || 'unknown',
            dimension: content.dimension || 0,
            createdAt: stats.birthtime.toISOString()
          });
        } catch (e) {
          console.warn(`Warning: Could not parse vector file ${file}`);
        }
      }
    }
    
    if (vectors.length === 0) {
      if (datasetId) {
        console.log(`No vectors found for dataset ${datasetId}. Create vectors using: simpleton vectorize ${datasetId}`);
      } else {
        console.log('No vectors found. Create vectors using: simpleton vectorize <datasetId>');
      }
      return;
    }
    
    console.log('\nVectors:');
    console.log('========\n');
    
    vectors.forEach(vector => {
      console.log(`ID: ${vector.id}`);
      console.log(`Dataset ID: ${vector.datasetId}`);
      console.log(`Model: ${vector.model}`);
      console.log(`Dimension: ${vector.dimension}`);
      console.log(`Created: ${formatDate(vector.createdAt)}`);
      console.log('-------------------\n');
    });
  } catch (error) {
    console.error('Error listing vectors:', error);
    process.exit(1);
  }
}

function formatSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString();
}
