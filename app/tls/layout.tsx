import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'SSL/TLS Certificate Management on RHEL 9 with NGINX | SONIC-Academy',
  description:
    'A beginner-guided private lab for RHEL 9 NGINX certificates, CSRs, simulated CA issuance, renewal and troubleshooting.',
};
export default function TLSLayout({ children }: { children: React.ReactNode }) {
  return children;
}
