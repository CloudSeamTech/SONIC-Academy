import type { Lesson } from './course';
import { beginnerTerms } from './beginner-language';

/** Beginner support for the original Linux class; Daily Admin remains separate. */
export function LinuxBeginnerHelp({ lesson }: { lesson: Lesson }) {
  const terms = beginnerTerms(lesson);
  return (
    <details className="lesson-support linux-beginner-help">
      <summary>New to Linux? Start here · words and terminal basics</summary>
      <p>
        A terminal is the window where you type commands. A shell is the program
        that reads them. This class starts on Windows, builds Linux VMs in
        Azure, then connects to them with SSH. Follow the lessons in order; you
        do not need an existing Linux server for the first lesson.
      </p>
      <ol>
        <li>
          Read <strong>Work in</strong> first. Windows PowerShell commands run
          on your Windows computer. RHEL Bash commands run inside the named
          Linux VM’s SSH tab. A browser step runs in the website named on that
          step.
        </li>
        <li>
          On Windows, right-click Start → Terminal → choose PowerShell. To reach
          Linux, complete the key and connection lessons first. After SSH signs
          in, that tab controls Linux until you type <code>exit</code>.
        </li>
        <li>
          On Linux, <code>pwd</code> prints your current folder. <code>~</code>{' '}
          means your home folder, normally <code>/home/rexuser</code> in this
          class. <code>cd</code> changes folders. Use the folder named in the
          step; do not guess a directory from an example prompt.
        </li>
        <li>
          Read the prompt, then type only the input after it. <code>$</code>{' '}
          marks a regular Linux shell; <code>#</code> marks root.
          <code> PS C:\Users\YourName&gt;</code> means PowerShell. Keep symbols
          that belong inside the command. Linux names are case-sensitive:{' '}
          <code>Downloads</code> and <code>downloads</code> are different.
        </li>
        <li>
          Run one complete command at a time and press Enter. Some successful
          commands print nothing. Compare with{' '}
          <strong>What you should see</strong> before continuing. Password
          typing may show no characters; keep passwords and private keys out of
          your notes and screenshots.
        </li>
        <li>
          If the result differs, stop and open{' '}
          <strong>My result is different</strong>. Check the computer, account,
          folder and spelling before retrying. Do not add <code>sudo</code> or
          repeat a change just to dismiss an error.
        </li>
      </ol>
      <p>
        <strong>Why this task matters: </strong>
        {lesson.why}
      </p>
      {terms.length > 0 && (
        <dl aria-label="Words used in this lesson">
          {terms.map(({ term, meaning }) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{meaning}</dd>
            </div>
          ))}
        </dl>
      )}
    </details>
  );
}
