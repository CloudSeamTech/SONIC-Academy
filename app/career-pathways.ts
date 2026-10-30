import { learningPathways, pathwayLessons } from './learning-pathways.ts';

/** Career groups organize subjects without changing lesson routes or progress keys. */
export const standaloneCourses = [
  {
    id: 'pki-certificate-management',
    title: 'PKI Certificate Management',
    description:
      'Request, install, validate and renew a server certificate. Choose AlmaLinux / NGINX or Windows Server / IIS.',
    subjects: ['pki-alma-nginx', 'pki-windows-iis'],
  },
];
export const careerPathways = [
  {
    id: 'windows-system-administration',
    title: 'Windows System Administration',
    description:
      'Build VMware vSphere and Windows servers, manage Active Directory and DNS, then operate SQL, IIS, a DMZ, WSUS and MECM.',
    subjects: [
      'vsphere',
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
      'bicep',
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
      'Investigate suspicious activity and Windows event IDs in Splunk, report evidence clearly, and assess vulnerabilities with Nessus.',
    subjects: ['splunk', 'nessus-linux', 'nessus-windows', 'nessus-scanning'],
  },
  {
    id: 'linux-system-administration',
    title: 'Linux System Administration',
    description:
      'Learn Linux administration, manage RHEL NGINX certificates, troubleshoot servers and build your everyday AlmaLinux desktop.',
    subjects: ['linux', 'linux-daily-admin', 'alma'],
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
export function standaloneSubjects(id: string) {
  return (
    standaloneCourses
      .find((course) => course.id === id)
      ?.subjects.map((subject) =>
        learningPathways.find((path) => path.id === subject)!,
      )
      .filter(Boolean) ?? []
  );
}
export function standaloneLessons(id: string) {
  return standaloneSubjects(id).flatMap(pathwayLessons);
}
