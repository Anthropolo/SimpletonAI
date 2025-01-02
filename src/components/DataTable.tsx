'use client';

import React from 'react';
import { DatasetInfo, ChunkInfo, VectorInfo } from '@/types/data';
import { formatBytes, formatDate } from '@/utils/format';

interface DataTableProps {
  type: 'datasets' | 'chunks' | 'vectors';
  data: DatasetInfo[] | ChunkInfo[] | VectorInfo[];
  onChunk?: (id: string) => void;
  onVectorize?: (id: string) => void;
  processingStates: Record<string, boolean>;
}

export default function DataTable({ type, data, onChunk, onVectorize, processingStates }: DataTableProps) {
  const renderDatasetRow = (item: DatasetInfo) => (
    <tr key={item.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatBytes(item.size)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.createdAt)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onChunk?.(item.id)}
          disabled={processingStates[item.id]}
          className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed mr-4"
        >
          {processingStates[item.id] ? 'Processing...' : 'Create Chunks'}
        </button>
      </td>
    </tr>
  );

  const renderChunkRow = (item: ChunkInfo) => (
    <tr key={item.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{formatBytes(item.size)}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(item.createdAt)}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{item.preview}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onVectorize?.(item.id)}
          disabled={processingStates[item.id]}
          className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed mr-4"
        >
          {processingStates[item.id] ? 'Processing...' : 'Vectorize'}
        </button>
      </td>
    </tr>
  );

  const renderVectorRow = (item: VectorInfo) => (
    <tr key={item.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{item.model}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{item.dimensions}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{formatBytes(item.size)}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(item.createdAt)}</td>
    </tr>
  );

  const renderHeaders = () => {
    switch (type) {
      case 'datasets':
        return (
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'chunks':
        return (
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'vectors':
        return (
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensions</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
          </tr>
        );
    }
  };

  const renderRows = () => {
    return data.map((item) => {
      switch (type) {
        case 'datasets':
          return renderDatasetRow(item as DatasetInfo);
        case 'chunks':
          return renderChunkRow(item as ChunkInfo);
        case 'vectors':
          return renderVectorRow(item as VectorInfo);
      }
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">{renderHeaders()}</thead>
        <tbody className="bg-white divide-y divide-gray-200">{renderRows()}</tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No {type} found
        </div>
      )}
    </div>
  );
}
