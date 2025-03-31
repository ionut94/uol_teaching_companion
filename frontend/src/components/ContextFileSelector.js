import React, { useState, useEffect } from 'react';
import './ContextFileSelector.css';

const ContextFileSelector = ({ onFilesSelected }) => {
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectionStatus, setSelectionStatus] = useState('');

  // Fetch available files on component mount
  useEffect(() => {
    const fetchContextFiles = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/list-context-files');
        
        if (!response.ok) {
          throw new Error('Failed to fetch context files');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setAvailableFiles(data.files);
        } else {
          setError(data.error || 'Failed to load files');
        }
      } catch (error) {
        setError('Error: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContextFiles();
  }, []);

  // Handle checkbox change
  const handleCheckboxChange = (filename) => {
    setSelectedFiles(prev => {
      if (prev.includes(filename)) {
        return prev.filter(file => file !== filename);
      } else {
        return [...prev, filename];
      }
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      setSelectionStatus('Please select at least one file');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/select-context-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ selected_files: selectedFiles })
      });

      const data = await response.json();
      
      if (data.success) {
        setSelectionStatus(`Successfully selected ${selectedFiles.length} files`);
        if (onFilesSelected) {
          onFilesSelected(selectedFiles);
        }
      } else {
        setSelectionStatus('Error: ' + (data.error || 'Failed to select files'));
      }
    } catch (error) {
      setSelectionStatus('Error: ' + error.message);
    }
  };

  // Select all files
  const selectAll = () => {
    setSelectedFiles([...availableFiles]);
  };

  // Deselect all files
  const deselectAll = () => {
    setSelectedFiles([]);
  };

  if (isLoading) {
    return <div className="context-loader">Loading available files...</div>;
  }

  if (error) {
    return <div className="context-error">{error}</div>;
  }

  return (
    <div className="context-file-selector">
      <div className="selector-controls">
        <button onClick={selectAll}>Select All</button>
        <button onClick={deselectAll}>Deselect All</button>
      </div>
      
      <div className="file-list">
        {availableFiles.length === 0 ? (
          <p>No files available in the context directory</p>
        ) : (
          availableFiles.map((file, index) => (
            <div key={index} className="file-item">
              <label>
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file)}
                  onChange={() => handleCheckboxChange(file)}
                />
                {file}
              </label>
            </div>
          ))
        )}
      </div>
      
      <button 
        className="select-button"
        onClick={handleSubmit}
        disabled={selectedFiles.length === 0}
      >
        Use Selected Files as Context
      </button>
      
      {selectionStatus && (
        <p className={selectionStatus.includes('Error') ? 'status-error' : 'status-success'}>
          {selectionStatus}
        </p>
      )}
    </div>
  );
};

export default ContextFileSelector;
