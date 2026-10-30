'use client';
import { useEffect, useRef, useState } from 'react';
import { useAcademy } from './academy-provider';
import {
  assessmentKey,
  gradeQuestions,
  learningModules,
  modulesForLesson,
  questionSignature,
  questionsForModule,
  referenceFor,
  retainPracticeAttempts,
} from '../lib/learning-modules';
import './learning-lab-tools.css';

function Test({ module }: { module: (typeof learningModules)[number] }) {
  const academy = useAcademy();
  const questions = questionsForModule(module.id);
  const signature = questionSignature(questions);
  const key = assessmentKey(academy.user?.id, module.id);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState<{ answers: number[]; at: string }[]>(
    [],
  );
  const [notice, setNotice] = useState('');
  const panel = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (
      academy.ready &&
      new URLSearchParams(location.hash.slice(1)).get('module-test') === '1' &&
      panel.current
    ) {
      panel.current.open = true;
      panel.current.querySelector('summary')?.focus({ preventScroll: true });
      panel.current.scrollIntoView({ block: 'start' });
    }
  }, [academy.ready, module.id]);
  useEffect(() => {
    setAnswers([]);
    setSubmitted(false);
    setAttempts([]);
    setNotice('');
    if (!academy.ready) return;
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? '{}');
      if (saved.signature !== signature || !Array.isArray(saved.attempts))
        return;
      const valid = saved.attempts
        .filter(
          (attempt: { answers?: number[] }) =>
            Array.isArray(attempt?.answers) &&
            gradeQuestions(questions, attempt.answers),
        )
        .slice(-20);
      setAttempts(valid);
      if (valid.length) {
        setAnswers(valid.at(-1).answers);
        setSubmitted(true);
      }
    } catch {
      setNotice('Saved attempts are unavailable. You can still practice.');
    }
    // The signature captures the question set; never reuse answers after an edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, signature, academy.ready]);
  const result = gradeQuestions(questions, answers);
  const reference = referenceFor(module.domain);
  const best = attempts.reduce(
    (score, attempt) =>
      Math.max(score, gradeQuestions(questions, attempt.answers)?.correct ?? 0),
    0,
  );
  return (
    <details
      ref={panel}
      className="module-test lesson-support"
      id="module-test"
    >
      <summary>Module test · {module.title} · 10 questions</summary>
      <p>
        Original practice questions. Answer all 10, then review the
        explanations. Practice target: 8/10. This does not award lesson
        completion or an official certification.
      </p>
      <p>
        <a href={reference.url} target="_blank" rel="noreferrer">
          Reference: {reference.title} ↗
        </a>
        <br />
        {reference.note}
      </p>
      <p>
        Attempts are saved on this device for the current profile.{' '}
        {attempts.length > 0 && `Best saved score: ${best}/10.`}
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!result) return;
          setSubmitted(true);
          const next = retainPracticeAttempts(questions, [
            ...attempts,
            { answers: [...answers], at: new Date().toISOString() },
          ]);
          try {
            localStorage.setItem(
              key,
              JSON.stringify({ version: 1, signature, attempts: next }),
            );
            setAttempts(next);
            setNotice('Score and explanations saved on this device.');
          } catch {
            setNotice(
              'The score is shown for this visit; browser storage could not save it.',
            );
          }
        }}
      >
        {questions.map((question, index) => (
          <fieldset key={question.id} disabled={submitted || !academy.ready}>
            <legend>
              {index + 1}. {question.question}
            </legend>
            {question.options.map((option, choice) => (
              <label key={choice}>
                <input
                  type="radio"
                  name={`${module.id}-${index}`}
                  value={choice}
                  checked={answers[index] === choice}
                  onChange={() =>
                    setAnswers((current) => {
                      const next = [...current];
                      next[index] = choice;
                      return next;
                    })
                  }
                />
                {option}
              </label>
            ))}
            {submitted && (
              <div className="test-explanation">
                <strong>
                  {answers[index] === question.answer
                    ? 'Correct.'
                    : `Review: ${question.options[question.answer]}`}
                </strong>
                <p>{question.explanation}</p>
                <small>
                  {question.objective} ·{' '}
                  <a href={question.source} target="_blank" rel="noreferrer">
                    Official reference ↗
                  </a>
                </small>
              </div>
            )}
          </fieldset>
        ))}
        {!submitted && (
          <button type="submit" disabled={!result || !academy.ready}>
            Submit 10 answers
          </button>
        )}
      </form>
      {submitted && result && (
        <p className="test-score" role="status">
          {result.correct}/10 ·{' '}
          {result.passed
            ? 'Practice target met.'
            : 'Review the explanations, then try again.'}
        </p>
      )}
      {submitted && (
        <button
          type="button"
          onClick={() => {
            setAnswers([]);
            setSubmitted(false);
            setNotice('New attempt started. Your saved best score remains.');
          }}
        >
          Try a fresh attempt
        </button>
      )}
      {notice && <p role="status">{notice}</p>}
    </details>
  );
}
export function ModuleTest({ lessonId }: { lessonId: string }) {
  const academy = useAcademy();
  return (
    <section className="module-assessments" aria-label="End-of-module practice">
      {modulesForLesson(lessonId).map((module) =>
        module.last.id === lessonId ? (
          <Test
            key={`${module.id}:${academy.user?.id ?? 'guest'}`}
            module={module}
          />
        ) : (
          <p className="module-test-link" key={module.id}>
            Module: {module.title} ·{' '}
            <a href={`${module.last.href}&module-test=1`}>
              10-question test at the end →
            </a>
          </p>
        ),
      )}
    </section>
  );
}
