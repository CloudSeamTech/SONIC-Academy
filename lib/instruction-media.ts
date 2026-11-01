import captures from '../content/screenshots/captures.json' with { type: 'json' };
import hashes from '../content/screenshots/instruction-hashes.json' with { type: 'json' };
export type InstructionCapture = {
  stepId: string;
  instructionHash: string;
  src: string;
  platform: string;
  provenance: string;
  reviewed: boolean;
};
/** A text card is not an application screenshot. Missing captures stay absent. */
export function reviewedInstructionCapture(
  stepId: string,
  records: InstructionCapture[] = captures,
) {
  const instructionHash = (hashes as Record<string, string>)[stepId];
  if (!instructionHash) return undefined;
  return records.find(
    (c) =>
      c.stepId === stepId &&
      c.reviewed === true &&
      c.instructionHash === instructionHash &&
      Boolean(c.platform?.trim()) &&
      Boolean(c.provenance?.trim()) &&
      /^\/lab-screenshots\/captures\/[a-z0-9-]+\.png$/.test(c.src),
  );
}
