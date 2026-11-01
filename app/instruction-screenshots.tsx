'use client';
import { useRef } from 'react';
import { ScreenshotSurface } from './screenshot-surface';
import { reviewedInstructionCapture } from '../lib/instruction-media';
import './migration/guided-lab.css';

/** Only a reviewed capture matching this instruction; never a generic text-card fallback. */
export function InstructionScreenshots({ stepId }: { stepId: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const capture = reviewedInstructionCapture(stepId);
  if (!capture) return null;
  const src = capture.src;
  const title = 'Screenshot: ' + capture.platform;
  const note = capture.provenance;
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
          {'Lab capture · ' + capture.platform}
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
