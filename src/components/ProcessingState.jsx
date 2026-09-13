import { useState, useEffect } from 'react';

const STEPS = [
  { text: 'Reading your lecture…', emoji: '📄', sub: 'Extracting text content' },
  { text: 'Creating revision notes…', emoji: '📝', sub: 'Identifying key concepts' },
  { text: 'Generating practice questions…', emoji: '🧠', sub: 'Building your quiz' },
];

/**
 * ProcessingState — Animated loading screen with step-by-step progress messages.
 * Steps auto-advance every 3 seconds to give a sense of progress.
 */
export default function ProcessingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev; // Stay on last step
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const step = STEPS[currentStep];

  return (
    <div className="processing">
      <div className="processing__card">
        <div className="processing__spinner-wrapper">
          <div className="processing__spinner" />
          <div className="processing__spinner-inner">
            {step.emoji}
          </div>
        </div>

        <p className="processing__step" key={currentStep}>
          {step.text}
        </p>
        <p className="processing__substep" key={`sub-${currentStep}`}>
          {step.sub}
        </p>

        <div className="processing__progress">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`processing__progress-dot${
                i === currentStep ? ' processing__progress-dot--active' :
                i < currentStep ? ' processing__progress-dot--done' : ''
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
