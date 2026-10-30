'use client';
import { useState } from 'react';
import {
  KeyRound,
  BadgeCheck,
  Upload,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import './lesson-tools.css';

const stages = [
  {
    title: 'Request',
    Icon: KeyRound,
    detail:
      'Create a certificate signing request (CSR) on the server. Its private key stays there.',
  },
  {
    title: 'Issue',
    Icon: BadgeCheck,
    detail:
      'Send the CSR to your PKI team. They return a signed certificate and its certificate chain.',
  },
  {
    title: 'Install',
    Icon: Upload,
    detail:
      'Install the server certificate and its chain in the locations shown in your server track.',
  },
  {
    title: 'Validate',
    Icon: ShieldCheck,
    detail:
      'Check the website name, trust chain, expiry date and HTTPS connection.',
  },
  {
    title: 'Renew',
    Icon: RefreshCw,
    detail:
      'Replace the certificate before it expires. Recheck HTTPS and keep a rollback copy.',
  },
];

export function CertificateJourney() {
  const [selected, setSelected] = useState(0);
  return (
    <section
      className="certificate-journey"
      aria-label="Certificate lifecycle explorer"
    >
      <h2>The certificate journey</h2>
      <p>Select a stage to see its job.</p>
      <div
        className="certificate-stages"
        role="group"
        aria-label="Certificate stages"
      >
        {stages.map(({ title, Icon }, index) => (
          <button
            key={title}
            type="button"
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            <Icon size={24} aria-hidden="true" />
            <span>{title}</span>
          </button>
        ))}
      </div>
      <p className="certificate-stage-detail" aria-live="polite">
        <strong>{stages[selected].title}: </strong>
        {stages[selected].detail}
      </p>
    </section>
  );
}
