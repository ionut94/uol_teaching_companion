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

  // Handle checkbox change and immediately update context
  const handleCheckboxChange = async (filename) => {
    let newSelectedFiles;
    
    if (selectedFiles.includes(filename)) {
      newSelectedFiles = selectedFiles.filter(file => file !== filename);
    } else {
      newSelectedFiles = [...selectedFiles, filename];
    }
    
    setSelectedFiles(newSelectedFiles);
    
    try {
      const response = await fetch('http://localhost:5000/api/select-context-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ selected_files: newSelectedFiles })
      });

      const data = await response.json();
      
      if (data.success) {
        setSelectionStatus(newSelectedFiles.length > 0 
          ? `Using ${newSelectedFiles.length} file(s) as context` 
          : 'No files selected');
        
        // Notify parent component of the change
        if (onFilesSelected) {
          onFilesSelected(newSelectedFiles);
        }
      } else {
        setSelectionStatus('Error: ' + (data.error || 'Failed to select files'));
      }
    } catch (error) {
      setSelectionStatus('Error: ' + error.message);
    }
  };

  // Select all files
  const selectAll = async () => {
    const allFiles = [...availableFiles];
    setSelectedFiles(allFiles);
    
    try {
      const response = await fetch('http://localhost:5000/api/select-context-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ selected_files: allFiles })
      });

      const data = await response.json();
      
      if (data.success) {
        setSelectionStatus(`Using all ${allFiles.length} files as context`);
        
        if (onFilesSelected) {
          onFilesSelected(allFiles);
        }
      } else {
        setSelectionStatus('Error: ' + (data.error || 'Failed to select files'));
      }
    } catch (error) {
      setSelectionStatus('Error: ' + error.message);
    }
  };

  // Deselect all files
  const deselectAll = async () => {
    setSelectedFiles([]);
    
    try {
      const response = await fetch('http://localhost:5000/api/select-context-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ selected_files: [] })
      });

      const data = await response.json();
      
      if (data.success) {
        setSelectionStatus('No files selected as context');
        
        if (onFilesSelected) {
          onFilesSelected([]);
        }
      } else {
        setSelectionStatus('Error: ' + (data.error || 'Failed to clear selection'));
      }
    } catch (error) {
      setSelectionStatus('Error: ' + error.message);
    }
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
            <div key={index} className={`file-item ${selectedFiles.includes(file) ? 'file-selected' : ''}`}>
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
      
      {selectionStatus && (
        <p className={selectionStatus.includes('Error') ? 'status-error' : 'status-success'}>
          {selectionStatus}
        </p>
      )}
    </div>
  );
};

export default ContextFileSelector;
