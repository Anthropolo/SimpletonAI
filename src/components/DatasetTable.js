import React, { useState } from 'react';
import './DatasetTable.css';
// ...existing code...

const DatasetTable = ({ datasets }) => {
  const [expandedRows, setExpandedRows] = useState({});
  const [chunkedDatasets, setChunkedDatasets] = useState({});
  const [vectorisedDatasets, setVectorisedDatasets] = useState({});

  const toggleRow = (id) => {
    setExpandedRows({ ...expandedRows, [id]: !expandedRows[id] });
  };

  const handleChunk = (id) => {
    // Implement chunk functionality here
    setChunkedDatasets({ ...chunkedDatasets, [id]: true });
  };

  const handleVectorise = (id) => {
    // Implement vectorise functionality here
    setVectorisedDatasets({ ...vectorisedDatasets, [id]: true });
  };

  return (
    <table>
      <thead>
        <tr>
          {/* ...existing code... */}
        </tr>
      </thead>
      <tbody>
        {datasets.map((dataset) => (
          <React.Fragment key={dataset.id}>
            <tr>
              <td>
                <button 
                  className={`chevron-button ${expandedRows[dataset.id] ? 'expanded' : ''}`}
                  onClick={() => toggleRow(dataset.id)}
                >
                  ▶
                </button>
              </td>
              {/* ...existing code... */}
            </tr>
            {expandedRows[dataset.id] && (
              <tr>
                <td colSpan="5">
                  <div className="expanded-content">
                    <p>Additional Metadata: {dataset.metadata}</p>
                    {!chunkedDatasets[dataset.id] ? (
                      <button onClick={() => handleChunk(dataset.id)}>Chunk</button>
                    ) : (
                      <button onClick={() => {/* Route to view chunks */}}>View Chunks</button>
                    )}
                    {!vectorisedDatasets[dataset.id] ? (
                      <button onClick={() => handleVectorise(dataset.id)}>Vectorise</button>
                    ) : (
                      <button onClick={() => {/* Route to view vectors */}}>View Vectors</button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

export default DatasetTable;
