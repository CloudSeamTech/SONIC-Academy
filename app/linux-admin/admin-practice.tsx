'use client';
import { useState } from 'react';
const cases: Record<
  string,
  { evidence: string; options: string[]; answer: number; reason: string }
> = {
  'daily-space': {
    evidence:
      'SIMULATION: A write to /var/log fails. /var is 100% full; /home is only 20% full.',
    options: [
      'Delete large files from /home',
      'Identify what uses /var, check inode use and retention',
      'Disable the firewall',
    ],
    answer: 1,
    reason:
      'Investigate the affected mount. Freeing another filesystem will not give /var space.',
  },
  'daily-deleted': {
    evidence:
      'SIMULATION: df stays high after a log was deleted. lsof shows the exact log with (deleted).',
    options: [
      'Delete unrelated logs',
      'Reboot every server',
      'Identify the owning process and arrange a safe file release',
    ],
    answer: 2,
    reason:
      'The process still holds storage. Confirm its identity and service owner before a controlled reopen/restart.',
  },
  'daily-lvm': {
    evidence:
      'SIMULATION: The LV is larger, but the mounted XFS filesystem still shows its old capacity.',
    options: [
      'Verify the target and grow that mounted XFS filesystem',
      'Shrink the root disk',
      'Change DNS',
    ],
    answer: 0,
    reason:
      'A logical volume and the filesystem inside it are different layers. Verify both after growth.',
  },
  'daily-services': {
    evidence:
      'SIMULATION: sonic-practice failed with 203/EXEC. Its ExecStart path does not exist.',
    options: [
      'Disable SELinux immediately',
      'Correct only the proven practice executable path and retest',
      'Open port 443',
    ],
    answer: 1,
    reason:
      'Use the evidence: a missing executable explains this bounded fault. Other 203/EXEC causes require their own checks.',
  },
  'daily-network': {
    evidence:
      'SIMULATION: curl reports Could not resolve host before any HTTP response.',
    options: [
      'Delete web content',
      'Grow the filesystem',
      'Check the exact name and configured resolver',
    ],
    answer: 2,
    reason:
      'Name resolution failed before a connection could be made. Test layers in order.',
  },
  'daily-selinux': {
    evidence:
      'SIMULATION: The practice web page has user_home_t; an AVC names it. Policy expects httpd_sys_content_t.',
    options: [
      'Restore the expected standard-path label and retest',
      'chmod 777 everything',
      'Disable enforcement',
    ],
    answer: 0,
    reason:
      'Fix the proven label mismatch while preserving enforcement. Also verify the actual client result.',
  },
  'daily-updates': {
    evidence:
      'SIMULATION: The pilot update passes package installation, but the application acceptance check fails.',
    options: [
      'Patch all remaining servers',
      'Pause rollout, preserve evidence and use the approved recovery plan',
      'Delete the failure logs',
    ],
    answer: 1,
    reason:
      'Pilot acceptance gates the next wave. A successful package transaction is not application acceptance.',
  },
  'daily-interview': {
    evidence:
      'SIMULATION: Local HTTP works; a remote client times out. No HTTP error status returns remotely.',
    options: [
      'Assume the page file is wrong',
      'Disable all security',
      'Check listener address, client route and relevant firewall path',
    ],
    answer: 2,
    reason:
      'Local application success narrows the problem but does not prove remote reachability.',
  },
};
export function AdminPractice({
  lessonId,
  done,
  total,
}: {
  lessonId: string;
  done: number;
  total: number;
}) {
  const scenario = cases[lessonId];
  const [choice, setChoice] = useState<number | null>(null);
  return (
    <section
      className="teaching-callout"
      aria-label="Daily administrator practice"
    >
      <h2>
        {done === total
          ? 'Course complete · self-verified'
          : 'Your daily administration practice'}
      </h2>
      <p>
        {done} of {total} lessons self-verified. Complete each lesson’s step
        checks, practical exercise and knowledge check. Progress uses this
        browser’s existing academy storage.
      </p>
      <progress
        value={done}
        max={total}
        aria-label="Daily administration course completion"
      />
      {scenario && (
        <div className="admin-decision">
          <h3>Think first: what would you check next?</h3>
          <p>{scenario.evidence}</p>
          <p>
            This is a reasoning exercise. It runs no commands and reads no VM
            data.
          </p>
          <div role="group" aria-label="Choose the next investigation">
            {scenario.options.map((option, i) => (
              <button
                key={option}
                type="button"
                aria-pressed={choice === i}
                onClick={() => setChoice(i)}
              >
                {option}
              </button>
            ))}
          </div>
          <p role="status">
            {choice === null
              ? 'Choose a next step, then compare your reasoning.'
              : choice === scenario.answer
                ? `Good choice. ${scenario.reason}`
                : 'Pause and locate the failing layer in the evidence. Try another check before making a change.'}
          </p>
        </div>
      )}
    </section>
  );
}
