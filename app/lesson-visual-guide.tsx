/* Native images preserve the full-resolution instructional asset and work without a remote image optimizer. */
/* oxlint-disable next/no-img-element */
'use client';

import { useRef } from 'react';
import catalog from '@/content/screenshots/core-guides.json';
import './migration/guided-lab.css';

export function LessonVisualGuide({ lessonId }: { lessonId: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const lesson = catalog.lessons.find((item) => item.lessonId === lessonId);
  if (!lesson) return null;
  const guides = lesson.guideIds.map((id) =>
    catalog.assets.find((asset) => asset.id === id)!,
  );
  return (
    <details className="guided-reference core-visual-guide" key={lessonId} open>
      <summary>Key screens for this class · illustrated guide</summary>
      <p>
        <strong>{lesson.title}</strong>
        {lesson.focus !== lesson.title && <> — {lesson.focus}</>}
      </p>
      <p className="core-visual-notice">
        Illustrated training reference, not a live lab capture. Panels may
        combine separate screens. Follow the exact values and commands in the
        written steps; compare results in your own lab.
      </p>
      {guides.map((guide) => (
        <figure className="guided-screenshot" key={guide.id}>
          <button
            className="guided-image-button"
            onClick={() => dialog.current?.showModal()}
            aria-label={`Enlarge illustrated guide: ${guide.title}`}
          >
            <img
              className="core-visual-thumbnail"
              src={guide.src}
              alt={`${guide.title} — schematic training illustration, not actual output`}
              loading="lazy"
            />
          </button>
          <figcaption>
            <strong>{guide.title}</strong>
            <p>{guide.note}</p>
            <small>{guide.provenance}</small>
          </figcaption>
        </figure>
      ))}
      <dialog
        className="guided-image-dialog"
        ref={dialog}
        aria-label="Illustrated training guide"
      >
        <button onClick={() => dialog.current?.close()}>
          Close illustration ×
        </button>
        {guides.map((guide) => (
          <figure key={guide.id}>
            <img
              src={guide.src}
              alt={`${guide.title} — illustrated training guide`}
            />
            <figcaption>{guide.note}</figcaption>
          </figure>
        ))}
      </dialog>
    </details>
  );
}
