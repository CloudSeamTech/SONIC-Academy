'use client';
import { useRef } from 'react';
import { taskScreenshots } from '../lib/task-navigation';
import { ScreenshotSurface } from './screenshot-surface';

export function TaskPicture({
  stepId,
  instruction,
}: {
  stepId?: string;
  instruction: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const picture = taskScreenshots.find(
    (item) =>
      item.stepId === stepId && instruction.startsWith(item.actionStartsWith),
  );
  if (!picture) return null;
  return (
    <figure className="guided-screenshot task-picture">
      <ScreenshotSurface
        src={picture.src}
        alt={picture.alt}
        onZoom={() => dialog.current?.showModal()}
      />
      <figcaption>
        <p>{picture.caption}</p>
        <a href={picture.source} target="_blank" rel="noreferrer">
          Official Broadcom reference screenshot · © Broadcom · original colors
        </a>
      </figcaption>
      <dialog
        ref={dialog}
        className="guided-image-dialog"
        aria-label="Broadcom download reference"
      >
        <button type="button" onClick={() => dialog.current?.close()}>
          Close picture ×
        </button>
        <ScreenshotSurface src={picture.src} alt={picture.alt} />
        <p>{picture.caption}</p>
      </dialog>
    </figure>
  );
}
