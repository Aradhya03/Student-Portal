import { useState, useCallback } from 'react';
import Dashboard from './components/Dashboard.jsx';
import ProcessingState from './components/ProcessingState.jsx';
import StudyView from './components/StudyView.jsx';
import ErrorState from './components/ErrorState.jsx';

/**
 * StudyFlow App — State machine:
 * idle → uploading → processing → done | error
 */
export default function App() {
  const [state, setState] = useState('idle'); // idle | processing | done | error
  const [data, setData] = useState(null);     // { notes, quiz, fileName }
  const [error, setError] = useState('');

  const handleUpload = useCallback(async (file) => {
    setState('processing');
    setError('');
    setData(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong. Please try again.');
      }

      setData({
        notes: result.notes,
        quiz: result.quiz,
        fileName: result.fileName || file.name,
      });
      setState('done');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      setState('error');
    }
  }, []);

  const handleReset = useCallback(() => {
    setState('idle');
    setData(null);
    setError('');
  }, []);

  return (
    <div className="app">
      {state === 'idle' && (
        <Dashboard onUpload={handleUpload} />
      )}
      {state === 'processing' && (
        <ProcessingState />
      )}
      {state === 'done' && data && (
        <StudyView
          notes={data.notes}
          quiz={data.quiz}
          fileName={data.fileName}
          onReset={handleReset}
        />
      )}
      {state === 'error' && (
        <ErrorState message={error} onRetry={handleReset} />
      )}
    </div>
  );
}
