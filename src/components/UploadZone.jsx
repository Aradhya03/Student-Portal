import { useState, useRef, useCallback } from 'react';

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.pptx'];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

/**
 * UploadZone — Drag-and-drop file upload with validation.
 */
export default function UploadZone({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef(null);

  const validateFile = useCallback((file) => {
    if (!file) return 'No file selected.';

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported format (${ext}). Please upload a PDF, DOCX, or PPTX file.`;
    }

    if (file.size > MAX_SIZE_BYTES) {
      return `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is ${MAX_SIZE_MB}MB.`;
    }

    if (file.size === 0) {
      return 'File appears to be empty. Please select a valid file.';
    }

    return null;
  }, []);

  const handleFile = useCallback((file) => {
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError('');
    onUpload(file);
  }, [validateFile, onUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleClick = () => inputRef.current?.click();

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  return (
    <div className="upload-zone">
      <div
        className={`upload-zone__droparea${isDragging ? ' upload-zone__droparea--active' : ''}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Upload lecture file"
        id="upload-dropzone"
      >
        <div className="upload-zone__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <div className="upload-zone__text">
          <p className="upload-zone__title">
            {isDragging
              ? 'Drop your file here'
              : <>Drag & drop your lecture file, or <span>browse</span></>
            }
          </p>
          <p className="upload-zone__subtitle">
            Upload and we'll create revision notes & a practice quiz
          </p>
        </div>

        <div className="upload-zone__formats">
          <span className="upload-zone__format-badge">PDF</span>
          <span className="upload-zone__format-badge">DOCX</span>
          <span className="upload-zone__format-badge">PPTX</span>
        </div>

        <input
          ref={inputRef}
          type="file"
          className="upload-zone__input"
          accept=".pdf,.docx,.pptx"
          onChange={handleInputChange}
          id="file-upload-input"
        />
      </div>

      {validationError && (
        <p style={{
          textAlign: 'center',
          color: 'var(--error)',
          fontSize: '0.85rem',
          marginTop: 'var(--space-3)',
          fontWeight: 500,
          animation: 'fadeIn 0.3s ease',
        }}>
          {validationError}
        </p>
      )}
    </div>
  );
}
