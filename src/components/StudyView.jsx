import { useState, useCallback } from 'react';
import RevisionNotes from './RevisionNotes.jsx';
import QuizView from './QuizView.jsx';

/**
 * StudyView — Tabbed results page showing revision notes and quiz.
 * Includes download and "upload another" actions.
 */
export default function StudyView({ notes, quiz, fileName, onReset }) {
  const [activeTab, setActiveTab] = useState('notes');

  const downloadFile = useCallback((content, filename, type = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleDownloadNotes = useCallback(() => {
    downloadFile(notes, 'StudyFlow_Revision_Notes.md', 'text/markdown');
  }, [notes, downloadFile]);

  const handleDownloadQuiz = useCallback(() => {
    let quizText = 'StudyFlow — Practice Quiz\n';
    quizText += '═'.repeat(40) + '\n\n';

    quiz.forEach((q, i) => {
      quizText += `Question ${i + 1}: ${q.question}\n\n`;
      q.options.forEach((opt, j) => {
        const letter = String.fromCharCode(65 + j);
        const marker = j === q.correctIndex ? ' ✓' : '';
        quizText += `  ${letter}. ${opt}${marker}\n`;
      });
      quizText += `\nCorrect Answer: ${String.fromCharCode(65 + q.correctIndex)}\n`;
      quizText += `Explanation: ${q.explanation}\n\n`;
      quizText += '─'.repeat(40) + '\n\n';
    });

    downloadFile(quizText, 'StudyFlow_Practice_Quiz.txt');
  }, [quiz, downloadFile]);

  return (
    <div className="study-view">
      {/* Header */}
      <header className="study-view__header">
        <div className="study-view__title-group">
          <div className="study-view__logo-small">📚</div>
          <div>
            <h1 className="study-view__title">StudyFlow</h1>
            <p className="study-view__file-name">{fileName}</p>
          </div>
        </div>

        <div className="study-view__actions">
          <button className="btn btn--secondary" onClick={onReset} id="upload-another-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
            Upload Another
          </button>
          <button className="btn btn--secondary" onClick={handleDownloadNotes} id="download-notes-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Notes
          </button>
          <button className="btn btn--secondary" onClick={handleDownloadQuiz} id="download-quiz-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Quiz
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs" role="tablist">
        <button
          className={`tabs__tab${activeTab === 'notes' ? ' tabs__tab--active' : ''}`}
          onClick={() => setActiveTab('notes')}
          role="tab"
          aria-selected={activeTab === 'notes'}
          id="tab-notes"
        >
          📝 Revision Notes
        </button>
        <button
          className={`tabs__tab${activeTab === 'quiz' ? ' tabs__tab--active' : ''}`}
          onClick={() => setActiveTab('quiz')}
          role="tab"
          aria-selected={activeTab === 'quiz'}
          id="tab-quiz"
        >
          🧠 Practice Quiz
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'notes' && <RevisionNotes content={notes} />}
      {activeTab === 'quiz' && <QuizView questions={quiz} />}
    </div>
  );
}
