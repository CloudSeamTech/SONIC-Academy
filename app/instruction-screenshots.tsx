/* Native images preserve unmodified, full-resolution reference assets. */
/* oxlint-disable next/no-img-element */
'use client';
import { useRef, useState } from 'react';
import { ScreenshotSurface } from './screenshot-surface';
import captureRegistry from '@/content/screenshots/captures.json';
import pictureRegistry from '@/content/screenshots/step-pictures.json';
import references from '@/content/screenshots/interface-references.json';
import './migration/guided-lab.css';
type Capture = {
  stepId: string;
  instructionHash: string;
  src: string;
  platform: string;
  provenance: string;
  reviewed: boolean;
};
type Enlarged = { src: string; title: string; note: string };
const picturesByStep = new Map(
  pictureRegistry.pictures.map((p) => [p.stepId, p]),
);
const referenceByStep = new Map(references.steps.map((p) => [p.stepId, p]));
const referenceById = new Map(references.assets.map((p) => [p.id, p]));
export function InstructionScreenshots({ stepId }: { stepId: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [enlarged, setEnlarged] = useState<Enlarged | null>(null);
  const picture = picturesByStep.get(stepId);
  const capture = (captureRegistry as Capture[]).find(
    (p) =>
      p.stepId === stepId &&
      p.reviewed &&
      p.instructionHash === picture?.instructionHash,
  );
  const association = referenceByStep.get(stepId);
  const shots =
    association?.instructionHash === picture?.instructionHash
      ? (association?.assetIds
          .map((id) => referenceById.get(id)!)
          .filter(Boolean) ?? [])
      : [];
  if (!capture && !picture) return null;
  function open(image: Enlarged) {
    setEnlarged(image);
    requestAnimationFrame(() => dialog.current?.showModal());
  }
  return (
    <section
      className="step-picture"
      data-step-id={stepId}
      aria-label="Pictures for this step"
    >
      {association &&
        (association.excludedAssetIds.length > 0 ||
          /VMware Workstation/.test(association.selectionReason) ||
          shots.some((shot) => /VMware Workstation/.test(shot.platform))) && (
          <p className="vmware-platform-note">
            <strong>Windows 10 is your host computer.</strong> The guest is the
            computer inside VMware: use Server 2019 for the Windows server
            builds, or AlmaLinux for the desktop course. Neutral control
            references are not verified Windows 10 captures.
          </p>
        )}
      {capture && (
        <figure className="guided-screenshot">
          <figcaption>
            <strong>Screenshot · {capture.platform}</strong>
          </figcaption>
          <ScreenshotSurface
            src={capture.src}
            alt={`Screenshot: ${capture.platform}`}
            onZoom={() =>
              open({
                src: capture.src,
                title: `Screenshot: ${capture.platform}`,
                note: capture.provenance,
              })
            }
          />
          <p>{capture.provenance}</p>
        </figure>
      )}
      {!capture &&
        shots.map((shot) => (
          <figure
            className="guided-screenshot interface-reference"
            key={shot.id}
          >
            <figcaption>
              <strong>{shot.title}</strong>
              <span>Actual interface reference · {shot.platform}</span>
            </figcaption>
            <ScreenshotSurface
              src={shot.src}
              alt={shot.title}
              onZoom={() => open(shot)}
            />
            <figcaption>
              <p>{shot.note}</p>
              <a href={shot.source} target="_blank" rel="noreferrer">
                {shot.credit} ↗
              </a>
              <small>
                Reference covers the pictured controls, not every action or your
                lab’s results.
              </small>
            </figcaption>
          </figure>
        ))}
      {!capture && !shots.length && (
        <p className="screenshot-gap">
          <strong>Interface screenshot still needed for this step.</strong> The
          guide below is a diagram, not a screenshot.
        </p>
      )}
      {picture && !capture && !shots.length && (
        <section className="step-map-details">
          <h4>Illustrated action map</h4>
          <ScreenshotSurface
            src={picture.src}
            alt={`${picture.title} — illustrated action map`}
            onZoom={() =>
              open({
                src: picture.src,
                title: picture.title,
                note: 'Illustrated step map, not a product screenshot or actual output.',
              })
            }
          />
        </section>
      )}
      <dialog
        className="guided-image-dialog"
        ref={dialog}
        aria-label={enlarged?.title ?? 'Step picture'}
      >
        <button onClick={() => dialog.current?.close()}>Close picture ×</button>
        <p className="picture-pan-hint">
          Swipe the picture sideways on a small screen.
        </p>
        <div className="picture-pan-canvas">
          {enlarged && (
            <ScreenshotSurface src={enlarged.src} alt={enlarged.title} />
          )}
        </div>
        <p>{enlarged?.note}</p>
      </dialog>
    </section>
  );
}
