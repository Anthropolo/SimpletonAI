import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DatasetInfo, ChunkInfo, VectorInfo } from '@/types/data';

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

async function getDatasets(): Promise<DatasetInfo[]> {
  const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
  const datasets: DatasetInfo[] = [];
  
  if (!fs.existsSync(uploadsDir)) return datasets;
  
  const files = fs.readdirSync(uploadsDir);
  
  for (const file of files) {
    if (file === '.gitkeep') continue;
    
    const filePath = path.join(uploadsDir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isFile()) {
      // Check if chunks exist for this dataset
      const chunksDir = path.join(process.cwd(), 'data', 'chunks', path.parse(file).name);
      const isChunked = fs.existsSync(chunksDir);

      // Check if vectors exist for this dataset
      const vectorsDir = path.join(process.cwd(), 'data', 'vectors', path.parse(file).name);
      const isVectorized = fs.existsSync(vectorsDir);

      datasets.push({
        id: path.parse(file).name,
        name: file,
        size: stats.size,
        createdAt: stats.birthtime.toISOString(),
        updatedAt: stats.mtime.toISOString(),
        path: filePath,
        type: path.extname(file).slice(1) || 'unknown',
        status: 'ready',
        isChunked,
        isVectorized
      });
    }
  }
  
  return datasets.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function getChunks(datasetId?: string): Promise<ChunkInfo[]> {
  const chunksDir = path.join(process.cwd(), 'data', 'chunks');
  const chunks: ChunkInfo[] = [];
  
  if (!fs.existsSync(chunksDir)) return chunks;
  
  const datasets = fs.readdirSync(chunksDir);
  
  for (const dataset of datasets) {
    if (dataset === '.gitkeep') continue;
    if (datasetId && dataset !== datasetId) continue;
    
    const datasetDir = path.join(chunksDir, dataset);
    if (!fs.statSync(datasetDir).isDirectory()) continue;
    
    const files = fs.readdirSync(datasetDir);
    
    for (const file of files) {
      if (!file.endsWith('.txt')) continue;

      const filePath = path.join(datasetDir, file);
      const stats = fs.statSync(filePath);
      
      // Read a preview of the chunk content
      const content = fs.readFileSync(filePath, 'utf-8');
      const preview = content.slice(0, 200) + (content.length > 200 ? '...' : '');
      
      chunks.push({
        id: path.parse(file).name,
        name: file,
        datasetId: dataset,
        size: stats.size,
        createdAt: stats.birthtime.toISOString(),
        preview
      });
    }
  }
  
  return chunks.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function getVectors(datasetId?: string): Promise<VectorInfo[]> {
  const vectorsDir = path.join(process.cwd(), 'data', 'vectors');
  const vectors: VectorInfo[] = [];
  
  if (!fs.existsSync(vectorsDir)) return vectors;
  
  const datasets = fs.readdirSync(vectorsDir);
  
  for (const dataset of datasets) {
    if (dataset === '.gitkeep') continue;
    if (datasetId && dataset !== datasetId) continue;
    
    const datasetDir = path.join(vectorsDir, dataset);
    if (!fs.statSync(datasetDir).isDirectory()) continue;
    
    const files = fs.readdirSync(datasetDir);
    
    for (const file of files) {
      if (!file.endsWith('.json') || file === 'vector_store.json') continue;

      const filePath = path.join(datasetDir, file);
      const stats = fs.statSync(filePath);
      
      try {
        const vectorData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        vectors.push({
          id: vectorData.id,
          name: file,
          datasetId: dataset,
          size: stats.size,
          createdAt: vectorData.createdAt || stats.birthtime.toISOString(),
          dimensions: vectorData.dimensions,
          model: vectorData.model
        });
      } catch (error) {
        console.error(`Error parsing vector file ${file}:`, error);
      }
    }
  }
  
  return vectors.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const datasetId = searchParams.get('datasetId');
    
    let data: any = {};
    
    if (type === 'all' || type === 'datasets') {
      data.datasets = await getDatasets();
    }
    
    if (type === 'all' || type === 'chunks') {
      data.chunks = await getChunks(datasetId || undefined);
    }
    
    if (type === 'all' || type === 'vectors') {
      data.vectors = await getVectors(datasetId || undefined);
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
