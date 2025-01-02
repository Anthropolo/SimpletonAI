"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DatasetInfo } from '../src/types/data';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from './ui/table';

interface DatasetTableProps {
  datasets: DatasetInfo[];
}

export function DatasetTable({ datasets }: DatasetTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const router = useRouter();

  const handleChunk = async (datasetId: string) => {
    await fetch(`/api/datasets/${datasetId}/chunk`, { method: 'POST' });
    router.refresh();
  };

  const handleVectorize = async (datasetId: string) => {
    await fetch(`/api/datasets/${datasetId}/vectorize`, { method: 'POST' });
    router.refresh();
  };

  const toggleRow = (datasetId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(datasetId)) {
      newExpanded.delete(datasetId);
    } else {
      newExpanded.add(datasetId);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {datasets.map((dataset) => (
            <React.Fragment key={dataset.id}>
              <TableRow>
                <TableCell className="cursor-pointer" onClick={() => toggleRow(dataset.id)}>
                  {expandedRows.has(dataset.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </TableCell>
                <TableCell>{dataset.name}</TableCell>
                <TableCell>{dataset.type}</TableCell>
                <TableCell>{dataset.size}</TableCell>
                <TableCell>{dataset.status}</TableCell>
                <TableCell>
                  <button
                    onClick={() => handleChunk(dataset.id)}
                    className="mr-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Chunk
                  </button>
                  <button
                    onClick={() => handleVectorize(dataset.id)}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Vectorize
                  </button>
                </TableCell>
              </TableRow>
              {expandedRows.has(dataset.id) && (
                <TableRow>
                  <TableCell colSpan={6} className="bg-gray-50 p-4">
                    <div className="text-sm">
                      <p><strong>ID:</strong> {dataset.id}</p>
                      <p><strong>Created:</strong> {new Date(dataset.createdAt).toLocaleString()}</p>
                      <p><strong>Path:</strong> {dataset.path}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
