import review from '../content/screenshots/step-media-review.json' with { type: 'json' };
import type { NessusStep } from './nessus-curriculum';
export function stepMediaSignature(
  step: Pick<
    NessusStep,
    'title' | 'where' | 'actions' | 'command' | 'expected'
  >,
): string {
  const text = JSON.stringify([
    step.title,
    step.where,
    step.actions,
    step.command ?? '',
    step.expected,
  ]);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++)
    hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16).padStart(8, '0');
}
/** Fail closed: changing a step's asset requires a fresh association review. */
export function showStepScreenshot(stepId: string, step: NessusStep): boolean {
  const entry = (
    review.allowed as Record<string, { assetId: string; signature: string }>
  )[stepId];
  return (
    step.screenshot.status !== 'capture-needed' &&
    Boolean(entry) &&
    entry.assetId === step.screenshot.assetId &&
    entry.signature === stepMediaSignature(step)
  );
}
