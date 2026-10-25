import catalog from '../content/migration/migration-lessons.generated.json' with { type: 'json' };

export type CurriculumLesson = (typeof catalog.lessons)[number] & {
  screenshotLessonId?: string;
  stepOffset?: number;
  description?: string;
  separated?: boolean;
};

const machines: Record<string, string> = {
  'lab-04': 'DC01', 'lab-06': 'APP01', 'lab-07': 'DC02',
  'lab-08': 'DEST-DC01', 'sql-02': 'SQL01',
};

/** Preserve workbook and screenshot IDs while presenting one application per lesson. */
export const migrationCurriculum: CurriculumLesson[] = catalog.lessons.flatMap((lesson) => {
  const machine = machines[lesson.id];
  if (!machine) return [lesson];
  const [, walkthrough] = lesson.body.split('## Guided walkthrough');
  if (!walkthrough) throw new Error(`Missing walkthrough: ${lesson.id}`);
  const parts = walkthrough.split(/^### Step \d+: /m);
  const header = parts[0];
  const steps = parts.slice(1);
  const role = lesson.id === 'lab-04' || lesson.id === 'lab-08'
    ? `Set Up Active Directory and DNS on ${machine}`
    : lesson.id === 'lab-07' ? 'Add DC02 and Check Active Directory Replication'
    : lesson.id === 'lab-06' ? 'Join APP01 and Install IIS' : 'Join SQL01 to the Domain';
  const slices = [
    { id: `${lesson.id}-vmware`, title: `Create the ${machine} VMware VM`, start: 0, end: 10,
      where: 'Physical Windows computer · VMware Workstation Pro',
      before: 'Finish the lab preparation and private network lessons. Have the Windows Server 2019 ISO ready.',
      pass: `The ${machine} VM exists, uses the approved private VMnet, and starts Windows Setup.`,
      description: `Create the empty ${machine} virtual machine in VMware Workstation Pro and attach the Server 2019 installer.` },
    { id: `${lesson.id}-windows`, title: `Install Windows Server 2019 on ${machine}`, start: 10, end: 21,
      where: `${machine} console · Windows Server 2019 installer and desktop`,
      before: `Complete “Create the ${machine} VMware VM” first. Do not install AD DS in this lesson.`,
      pass: `${machine} runs patched Windows Server 2019 Desktop Experience with the planned name and private address.`,
      description: `Install Windows Server 2019, add VMware Tools, and set ${machine}’s name and network address.` },
    { id: lesson.id, title: role, start: 21, end: steps.length,
      where: `${machine} guest · Windows Server 2019 administrative tools`,
      before: `Complete “Install Windows Server 2019 on ${machine}” first. VMware VM creation and Windows installation are separate earlier lessons.`,
      pass: header.match(/\*\*PASS\*\* ([^\n]+)/)?.[1] ?? '',
      description: lesson.id === 'lab-04' ? 'Install AD DS and DNS on the prepared DC01 server and create lab.example.test.'
        : lesson.id === 'lab-07' ? 'Promote the prepared DC02 server and verify replication with DC01.'
        : lesson.id === 'lab-08' ? 'Install AD DS on the prepared DEST-DC01 server and create migrate.lab.example.test.'
        : `Join the prepared ${machine} server to lab.example.test${lesson.id === 'lab-06' ? ' and install the IIS test website' : ''}.` },
  ];
  return slices.map((part) => {
    const scopedHeader = header
      .replace(/\*\*WHERE\*\* [^\n]+/, `**WHERE** ${part.where}`)
      .replace(/\*\*BEFORE\*\* [^\n]+/, `**BEFORE** ${part.before}`)
      .replace(/\*\*PASS\*\* [^\n]+/, `**PASS** ${part.pass}`);
    return { ...lesson, id: part.id, title: part.title, description: part.description,
      surface: part.where, screenshotLessonId: lesson.id, stepOffset: part.start, separated: true,
      body: `# ${part.title}\n\n${part.description}\n\n**PASS CHECK** ${part.pass}\n\n## Guided walkthrough${scopedHeader}`
        + steps.slice(part.start, part.end).map((step, index) => `### Step ${index + 1}: ${step}`).join(''),
    };
  });
});

export function migrationParts(id: string): string[] {
  return machines[id] ? [`${id}-vmware`, `${id}-windows`, id] : [id];
}
