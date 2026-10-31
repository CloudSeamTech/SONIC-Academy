'use client';
import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { NessusStep } from '../../lib/nessus-curriculum';
import {
  commandTeachingUnits,
  explainTeachingCommand,
} from '../../lib/studio-command-guide';
export function CommandCoach({ step }: { step: NessusStep }) {
  const [index, setIndex] = useState(0);
  const units = commandTeachingUnits(step.command ?? '');
  if (!units.length) return null;
  const command = units[index],
    note = explainTeachingCommand(command, step),
    isBlock = command.includes('\n');

  return (
    <section className="st-command-coach" aria-label="Type it with me">
      <header>
        <h2>Type it with me</h2>
        <span>
          Command {index + 1} of {units.length}
        </span>
      </header>
      <p className="st-coach-intro">
        {index === 0
          ? 'Let’s take this one input at a time. Click inside the terminal in your own VM first.'
          : 'Ready for the next one? Stay in the same terminal so your folder and variables carry over.'}
      </p>
      <div className="st-coach-code">
        <code>{command}</code>
      </div>
      <p className="st-coach-type">
        {isBlock
          ? 'Type every line in this block in order, pressing Enter after each line. Include every closing quote, brace or marker shown.'
          : 'Type this command into your VM’s terminal, then press Enter.'}{' '}
        Don’t type the example prompt shown in the terminal picture; keep
        symbols such as $HOME and &gt; when they appear inside the command.
      </p>
      <div className="st-coach-explanation">
        <p>
          <strong>What you’re doing</strong>
          {note.what}
        </p>
        <p>
          <strong>Before you continue</strong>
          {note.look}
        </p>
      </div>
      <nav aria-label="Command teaching navigation">
        <button
          disabled={index === 0}
          onClick={() => {
            setIndex((i) => i - 1);
          }}
        >
          <ArrowLeft size={15} />
          Previous command
        </button>
        {index < units.length - 1 ? (
          <button
            onClick={() => {
              setIndex((i) => i + 1);
            }}
          >
            Next command
            <ArrowRight size={15} />
          </button>
        ) : (
          <span>
            You’ve reached the last command. Compare your results with the
            step’s success check.
          </span>
        )}
      </nav>

    </section>
  );
}


