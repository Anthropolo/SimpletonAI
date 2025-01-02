'use client';

import { useState, useEffect } from 'react';
import { DatasetInfo, ChunkInfo, VectorInfo } from '@/types/data';
import Sidebar from './Sidebar';
import Drawer from './Drawer';
import DataTable from './DataTable';

export default function Dashboard() {
  const [activeView, setActiveView] = useState<'datasets' | 'chunks' | 'vectors'>('datasets');
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [chunks, setChunks] = useState<ChunkInfo[]>([]);
  const [vectors, setVectors] = useState<VectorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingStates, setProcessingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const response = await fetch('/api/data?type=all');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch data');
      
      setDatasets(data.datasets || []);
      setChunks(data.chunks || []);
      setVectors(data.vectors || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      await fetchData();
      setIsDrawerOpen(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
    }
  }

  async function handleChunk(datasetId: string) {
    try {
      setProcessingStates(prev => ({ ...prev, [datasetId]: true }));
      
      console.log('Starting chunking process for dataset:', datasetId);
      const response = await fetch(`/api/datasets/${datasetId}/chunk`, {
        method: 'POST',
      });

      const data = await response.json();
      console.log('Chunking response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Chunking failed');
      }

      console.log('Chunking successful, fetching updated data...');
      await fetchData();
      setActiveView('chunks');
    } catch (error) {
      console.error('Chunking error:', error);
    } finally {
      setProcessingStates(prev => ({ ...prev, [datasetId]: false }));
    }
  }

  async function handleVectorize(chunkId: string) {
    try {
      setProcessingStates(prev => ({ ...prev, [chunkId]: true }));
      
      console.log('Starting vectorization process for chunk:', chunkId);
      const response = await fetch(`/api/datasets/${chunkId}/vectorize`, {
        method: 'POST',
      });

      const data = await response.json();
      console.log('Vectorization response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Vectorization failed');
      }

      console.log('Vectorization successful, fetching updated data...');
      await fetchData();
      setActiveView('vectors');
    } catch (error) {
      console.error('Vectorization error:', error);
    } finally {
      setProcessingStates(prev => ({ ...prev, [chunkId]: false }));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeItem={activeView} onItemClick={setActiveView} />
      
      <div className="flex-1 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold capitalize">{activeView}</h2>
            {activeView === 'datasets' && (
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Upload Dataset
              </button>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <DataTable
              type={activeView}
              data={activeView === 'datasets' ? datasets : activeView === 'chunks' ? chunks : vectors}
              onChunk={handleChunk}
              onVectorize={handleVectorize}
              processingStates={processingStates}
            />
          </div>
        </div>
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Upload Dataset"
      >
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File
            </label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded"
              accept=".pdf,.xlsx,.csv,.txt"
            />
          </div>
          <button
            type="submit"
            disabled={!selectedFile}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Upload
          </button>
        </form>
      </Drawer>
    </div>
  );
}
