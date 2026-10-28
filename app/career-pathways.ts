import { learningPathways, pathwayLessons } from './learning-pathways.ts';

/** Career groups organize subjects without changing lesson routes or progress keys. */
export const careerPathways = [
  {
    id: 'pki-certificate-management',
    title: 'PKI Certificate Management',
    description:
      'Two separate application-server classes: AlmaLinux / NGINX and Windows Server / IIS. Learn requests, PKI handoff, trust, HTTPS validation and renewal.',
    subjects: ['pki-alma-nginx', 'pki-windows-iis'],
  },
  {
    id: 'windows-system-administration',
    title: 'Windows System Administration',
    description:
      'Build Windows servers, manage Active Directory and DNS, then operate SQL, IIS, a DMZ, WSUS and MECM.',
    subjects: [
      'windows',
      'active-directory',
      'sql',
      'helpdesk',
      'dmz',
      'wsus',
      'mecm',
    ],
  },
  {
    id: 'azure-cloud-engineering',
    title: 'Azure Cloud Engineering',
    description:
      'Plan your budget, build a landing zone, secure your cloud, migrate workloads and practice recovery.',
    subjects: [
      'azure',
      'landing-zone',
      'security',
      'azure-operations',
      'migrations',
    ],
  },
  {
    id: 'cyber-analyst',
    title: 'Cyber Analyst',
    description:
      'Search evidence in Splunk, investigate suspicious activity and assess vulnerabilities with Nessus.',
    subjects: ['splunk', 'nessus-linux', 'nessus-windows', 'nessus-scanning'],
  },
  {
    id: 'linux-system-administration',
    title: 'Linux System Administration',
    description:
      'Learn Linux administration, manage RHEL NGINX certificates, troubleshoot servers and build your everyday AlmaLinux desktop.',
    subjects: ['linux', 'alma'],
  },
];
export function careerSubjects(id: string) {
  return (
    careerPathways
      .find((path) => path.id === id)
      ?.subjects.map((subject) =>
        learningPathways.find((path) => path.id === subject)!,
      )
      .filter(Boolean) ?? []
  );
}
export function careerLessons(id: string) {
  return careerSubjects(id).flatMap(pathwayLessons);
}
