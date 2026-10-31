/* Original instructional screenshots are kept intact and do not need an image optimizer. */
/* oxlint-disable next/no-img-element */
'use client';
import { useRef } from 'react';
import { showStepScreenshot } from '../lib/step-media';
import { ScreenshotSurface } from './screenshot-surface';
import dailyReferences from '../content/linux-admin/references.json';
import bicepReferences from '../content/bicep/references.json';
import tlsReferences from '../content/tls/references.json';
import vsphereReferences from '../content/vsphere/references.json';
import pkiReferences from '../content/pki/references.json';
import dmzReferences from '../content/dmz/references.json';
import splunkReferences from '@/content/splunk/references.json';
import azureReferences from '@/content/azure/maintenance-references.json';
import helpdeskReferences from '@/content/helpdesk/references.json';
import securityReferences from '@/content/security/references.json';
import landingZoneReferences from '@/content/landing-zone/references.json';
import enterpriseReferences from '@/content/enterprise/references.json';
import coreReferences from '@/content/screenshots/interface-references.json';
const references = [
  ...bicepReferences,
  ...dailyReferences,
  ...vsphereReferences,
  ...pkiReferences,
  ...tlsReferences,
  ...dmzReferences,
  ...splunkReferences,
  ...enterpriseReferences,
  ...coreReferences.assets,
  ...azureReferences,
  ...helpdeskReferences,
  ...securityReferences,
  ...landingZoneReferences,
];
import type { NessusStep } from '@/lib/nessus-curriculum';
export function CourseScreenshot({
  step,
  stepId,
}: {
  step: NessusStep;
  stepId: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const screenshot = step.screenshot;
  const asset =
    screenshot.status !== 'capture-needed'
      ? references.find((item) => item.id === screenshot.assetId)
      : undefined;
  if (!asset || !showStepScreenshot(stepId, step)) return null;
  return (
    <figure
      className="guided-screenshot"
      data-capture-status={screenshot.status}
    >
      <ScreenshotSurface
        src={asset.src}
        alt={asset.title}
        onZoom={() => dialog.current?.showModal()}
      />
      <figcaption className="picture-source-note">
        <p>
          {screenshot.status === 'illustration'
            ? 'Illustration · not a live capture'
            : 'Reference screenshot'}{' '}
          · {asset.platform}
        </p>
        <a href={asset.source} target="_blank" rel="noreferrer">
          {screenshot.status === 'illustration'
            ? 'Documentation used for this illustration'
            : asset.credit}
        </a>
      </figcaption>
      <dialog
        ref={dialog}
        className="guided-image-dialog"
        aria-label={asset.title}
      >
        <button onClick={() => dialog.current?.close()}>Close picture ×</button>
        <div className="picture-pan-canvas">
          <ScreenshotSurface src={asset.src} alt={asset.title} />
        </div>
        <p>{asset.note}</p>
        <p>{screenshot.instructions}</p>
      </dialog>
    </figure>
  );
}
