export interface DatasetInfo {
  id: string;
  name: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  path: string;
  type: string;
  status: string;
  isChunked: boolean;
  isVectorized: boolean;
}

export interface ChunkInfo {
  id: string;
  name: string;
  datasetId: string;
  size: number;
  createdAt: string;
  preview?: string;
}

export interface VectorInfo {
  id: string;
  name: string;
  datasetId: string;
  size: number;
  createdAt: string;
  dimensions: number;
  model: string;
}
