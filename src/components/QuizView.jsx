import { useState, useCallback, useMemo } from 'react';

/**
 * QuizView — Interactive 5-question MCQ quiz with scoring.
 */
export default function QuizView({ questions }) {
  const [answers, setAnswers] = useState({});     // { questionIndex: selectedOptionIndex }
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = useMemo(
    () => questions.every((_, i) => answers[i] !== undefined),
    [answers, questions]
  );

  const score = useMemo(() => {
    if (!submitted) return 0;
    return questions.reduce((acc, q, i) => {
      return acc + (answers[i] === q.correctIndex ? 1 : 0);
    }, 0);
  }, [submitted, answers, questions]);

  const scoreMessage = useMemo(() => {
    if (!submitted) return '';
    const pct = (score / questions.length) * 100;
    if (pct === 100) return '🎉 Perfect score! You\'ve mastered this material!';
    if (pct >= 80) return '🌟 Great job! You have a strong understanding.';
    if (pct >= 60) return '👍 Good effort! Review the explanations below.';
    if (pct >= 40) return '📖 Keep studying — you\'re getting there!';
    return '💪 Don\'t worry — review the material and try again!';
  }, [submitted, score, questions.length]);

  const handleSelect = useCallback((questionIdx, optionIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionIdx]: optionIdx }));
  }, [submitted]);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    // Scroll to top to see score
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRetry = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getOptionClass = (qIdx, oIdx) => {
    const base = 'quiz__option';
    const classes = [base];

    if (submitted) {
      classes.push(`${base}--disabled`);
      if (oIdx === questions[qIdx].correctIndex) {
        classes.push(`${base}--correct`);
      } else if (answers[qIdx] === oIdx) {
        classes.push(`${base}--wrong`);
      }
    } else if (answers[qIdx] === oIdx) {
      classes.push(`${base}--selected`);
    }

    return classes.join(' ');
  };

  return (
    <div className="quiz" id="practice-quiz">
      {/* Score card — shown after submission */}
      {submitted && (
        <div className="quiz__score-card">
          <div className="quiz__score-number">{score}/{questions.length}</div>
          <div className="quiz__score-label">Questions Correct</div>
          <div className="quiz__score-message">{scoreMessage}</div>
          <button className="quiz__retry-btn" onClick={handleRetry} id="retry-quiz-btn">
            ↻ Retry Quiz
          </button>
        </div>
      )}

      {/* Question cards */}
      {questions.map((q, qIdx) => (
        <div className="quiz__question-card" key={qIdx}>
          <div className="quiz__question-number">{qIdx + 1}</div>
          <p className="quiz__question-text">{q.question}</p>

          <div className="quiz__options">
            {q.options.map((option, oIdx) => (
              <button
                key={oIdx}
                className={getOptionClass(qIdx, oIdx)}
                onClick={() => handleSelect(qIdx, oIdx)}
                disabled={submitted}
                id={`q${qIdx}-option-${oIdx}`}
              >
                <div className="quiz__option-radio" />
                <span>{option}</span>
              </button>
            ))}
          </div>

          {/* Explanation — shown after submission */}
          {submitted && (
            <div className="quiz__explanation">
              <strong>Explanation:</strong> {q.explanation}
            </div>
          )}
        </div>
      ))}

      {/* Submit button */}
      {!submitted && (
        <div className="quiz__submit-area">
          <button
            className="quiz__submit-btn"
            onClick={handleSubmit}
            disabled={!allAnswered}
            id="submit-quiz-btn"
          >
            {allAnswered ? 'Submit Quiz' : `Answer all ${questions.length} questions to submit`}
          </button>
        </div>
      )}
    </div>
  );
}
