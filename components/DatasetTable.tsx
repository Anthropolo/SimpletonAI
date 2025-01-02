"use client";

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ...existing code...

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
        // ...existing code for table header...
        <TableBody>
          {datasets.map((dataset) => (
            <>
              <TableRow key={dataset.id}>
                <TableCell className="cursor-pointer" onClick={() => toggleRow(dataset.id)}>
                  {expandedRows.has(dataset.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </TableCell>
                // ...existing cells...
              </TableRow>
              {expandedRows.has(dataset.id) && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="p-4 bg-gray-50">
                      <h4 className="font-medium mb-2">Additional Metadata</h4>
                      <p>Created: {new Date(dataset.createdAt).toLocaleString()}</p>
                      <p>Last Modified: {new Date(dataset.updatedAt).toLocaleString()}</p>
                      <div className="mt-4 space-x-4">
                        {!dataset.isChunked ? (
                          <Button onClick={() => handleChunk(dataset.id)}>Chunk</Button>
                        ) : (
                          <Button onClick={() => router.push(`/datasets/${dataset.id}/chunks`)}>
                            View Chunks
                          </Button>
                        )}
                        {!dataset.isVectorized ? (
                          <Button onClick={() => handleVectorize(dataset.id)}>Vectorize</Button>
                        ) : (
                          <Button onClick={() => router.push(`/datasets/${dataset.id}/vectors`)}>
                            View Vectors
                          </Button>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
