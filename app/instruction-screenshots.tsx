'use client';
import { useRef } from 'react';
import { ScreenshotSurface } from './screenshot-surface';
import captureRegistry from '@/content/screenshots/captures.json';
import pictureRegistry from '@/content/screenshots/step-pictures.json';
import './migration/guided-lab.css';

type Capture = {
  stepId: string;
  instructionHash: string;
  src: string;
  platform: string;
  provenance: string;
  reviewed: boolean;
};
const picturesByStep = new Map(
  pictureRegistry.pictures.map((p) => [p.stepId, p]),
);

/** Show the exact authored step map, or a reviewed capture of that same instruction. */
export function InstructionScreenshots({ stepId }: { stepId: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const picture = picturesByStep.get(stepId);
  const capture = (captureRegistry as Capture[]).find(
    (p) =>
      p.stepId === stepId &&
      p.reviewed &&
      p.instructionHash === picture?.instructionHash,
  );
  if (!capture && !picture) return null;
  const src = capture?.src ?? picture!.src;
  const title = capture
    ? 'Screenshot: ' + capture.platform
    : picture!.title + ' — step illustration';
  const note =
    capture?.provenance ??
    'Illustration of this step, not a product screenshot or actual output.';
  return (
    <section
      className="step-picture"
      data-step-id={stepId}
      aria-label="Pictures for this step"
    >
      <figure className="guided-screenshot">
        <ScreenshotSurface
          src={src}
          alt={title}
          onZoom={() => dialog.current?.showModal()}
        />
        <figcaption className="picture-source-note">
          {capture
            ? 'Lab capture · ' + capture.platform
            : 'Step illustration · not a screenshot'}
        </figcaption>
      </figure>
      <dialog className="guided-image-dialog" ref={dialog} aria-label={title}>
        <button onClick={() => dialog.current?.close()}>Close picture ×</button>
        <div className="picture-pan-canvas">
          <ScreenshotSurface src={src} alt={title} />
        </div>
        <p>{note}</p>
      </dialog>
    </section>
  );
}
