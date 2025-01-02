'use client';

import React from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { formatBytes } from '@/utils/format';

interface DataTableProps {
  data: any[];
  type: 'datasets' | 'chunks' | 'vectors';
  onChunk?: (id: string) => void;
  onVectorize?: (id: string) => void;
  processingStates?: Record<string, boolean>;
}

export default function DataTable({ data, type, onChunk, onVectorize, processingStates = {} }: DataTableProps) {
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderHeader = () => {
    switch (type) {
      case 'datasets':
        return (
          <tr>
            <th className="px-4 py-2"></th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Size</th>
            <th className="px-4 py-2">Created</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        );
      case 'chunks':
        return (
          <tr>
            <th className="px-4 py-2"></th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Size</th>
            <th className="px-4 py-2">Created</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        );
      case 'vectors':
        return (
          <tr>
            <th className="px-4 py-2"></th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Size</th>
            <th className="px-4 py-2">Created</th>
            <th className="px-4 py-2">Model</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        );
      default:
        return null;
    }
  };

  const renderRow = (item: any) => {
    const isExpanded = expandedRows[item.id];
    const isProcessing = processingStates[item.id];

    switch (type) {
      case 'datasets':
        return (
          <React.Fragment key={item.id}>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2">
                <button
                  onClick={() => toggleRow(item.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? (
                    <ChevronUpIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </button>
              </td>
              <td className="px-4 py-2">{item.name}</td>
              <td className="px-4 py-2">{formatBytes(item.size)}</td>
              <td className="px-4 py-2">
                {new Date(item.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => onChunk?.(item.id)}
                  disabled={isProcessing}
                  className={`mr-2 px-3 py-1 rounded text-sm ${
                    isProcessing
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isProcessing ? 'Processing...' : 'Chunk'}
                </button>
              </td>
            </tr>
            {isExpanded && (
              <tr>
                <td colSpan={5} className="px-4 py-2 bg-gray-50">
                  <div className="text-sm">
                    <p><strong>ID:</strong> {item.id}</p>
                    <p><strong>Full Name:</strong> {item.name}</p>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        );
      case 'chunks':
        return (
          <React.Fragment key={item.id}>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2">
                <button
                  onClick={() => toggleRow(item.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? (
                    <ChevronUpIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </button>
              </td>
              <td className="px-4 py-2">{item.name}</td>
              <td className="px-4 py-2">{formatBytes(item.size)}</td>
              <td className="px-4 py-2">
                {new Date(item.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => onVectorize?.(item.id)}
                  disabled={isProcessing}
                  className={`mr-2 px-3 py-1 rounded text-sm ${
                    isProcessing
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isProcessing ? 'Processing...' : 'Vectorize'}
                </button>
              </td>
            </tr>
            {isExpanded && (
              <tr>
                <td colSpan={5} className="px-4 py-2 bg-gray-50">
                  <div className="text-sm">
                    <p><strong>ID:</strong> {item.id}</p>
                    <p><strong>Dataset ID:</strong> {item.datasetId}</p>
                    <p><strong>Preview:</strong></p>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40">
                      {item.preview}
                    </pre>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        );
      case 'vectors':
        return (
          <React.Fragment key={item.id}>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-2">
                <button
                  onClick={() => toggleRow(item.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? (
                    <ChevronUpIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </button>
              </td>
              <td className="px-4 py-2">{item.name}</td>
              <td className="px-4 py-2">{formatBytes(item.size)}</td>
              <td className="px-4 py-2">
                {new Date(item.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-2">{item.model}</td>
              <td className="px-4 py-2">
                {/* Add vector-specific actions here */}
              </td>
            </tr>
            {isExpanded && (
              <tr>
                <td colSpan={6} className="px-4 py-2 bg-gray-50">
                  <div className="text-sm">
                    <p><strong>ID:</strong> {item.id}</p>
                    <p><strong>Dataset ID:</strong> {item.datasetId}</p>
                    <p><strong>Dimensions:</strong> {item.dimensions}</p>
                    <p><strong>Model:</strong> {item.model}</p>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        );
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-sm rounded-lg">
        <thead className="bg-gray-50">
          {renderHeader()}
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map(renderRow)}
        </tbody>
      </table>
    </div>
  );
}
