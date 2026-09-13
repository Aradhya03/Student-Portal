import ReactMarkdown from 'react-markdown';

/**
 * RevisionNotes — Renders AI-generated markdown notes with clean typography.
 */
export default function RevisionNotes({ content }) {
  return (
    <div className="notes" id="revision-notes">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
