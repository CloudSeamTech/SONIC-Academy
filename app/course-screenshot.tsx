/* Original instructional screenshots are kept intact and do not need an image optimizer. */
/* oxlint-disable next/no-img-element */
'use client';
import { useRef } from 'react';
import { ScreenshotSurface } from './screenshot-surface';
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
  screenshot,
}: {
  screenshot: NessusStep['screenshot'];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const asset =
    screenshot.status !== 'capture-needed'
      ? references.find((item) => item.id === screenshot.assetId)
      : undefined;
  if (!asset)
    return (
      <section
        className="nessus-capture"
        aria-label="Screenshot capture needed"
        data-capture-status="capture-needed"
      >
        <span className="eyebrow">SCREENSHOT TO ADD · CAPTURE CHECKLIST</span>
        <h4>{screenshot.title}</h4>
        <p>{screenshot.instructions}</p>
        <small>
          We still need a real picture of this step. This checklist is not a
          screenshot. You can follow the written directions and compare your
          result with the check above.
        </small>
      </section>
    );
  return (
    <figure
      className="guided-screenshot"
      data-capture-status={screenshot.status}
    >
      <figcaption>
        <strong>{screenshot.title}</strong>
        <p>
          {screenshot.status === 'illustration'
            ? 'Illustrated training reference · not a live capture'
            : 'Here’s the interface to look for'}{' '}
          · {asset.platform}
        </p>
      </figcaption>
      <ScreenshotSurface
        src={asset.src}
        alt={asset.title}
        onZoom={() => dialog.current?.showModal()}
      />
      <figcaption className="picture-source-note">
        {'reviewed' in asset && <p>{asset.note}</p>}
        {screenshot.status === 'reference' && <p>{screenshot.instructions}</p>}
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
