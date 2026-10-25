export type GuidedStep = {
  title: string;
  where?: string;
  action: string;
  expect: string;
  trouble: string;
  evidence: string;
  command: string;
  screenshots: string[];
};
export type GuidedLab = {
  where: string;
  before: string;
  pass: string;
  rollback: string;
  steps: GuidedStep[];
};

const readField = (text: string, name: string) =>
  text
    .match(
      new RegExp(
        `^\\*\\*${name}\\*\\*\\s+([\\s\\S]*?)(?=^\\*\\*[A-Z ]+\\*\\*|^### Step |$(?![\\s\\S]))`,
        'm',
      ),
    )?.[1]
    .trim()
    .replace(/\\([<>|_*#$[\]])/g, '$1') ?? '';

export function parseGuidedLab(body: string): GuidedLab | null {
  const marker = '## Guided walkthrough';
  const index = body.indexOf(marker);
  if (index === -1) return null;
  const guided = body.slice(index + marker.length);
  const parts = guided.split(/^### Step \d+: /m);
  const steps = parts.slice(1).map((part) => {
    const titleEnd = part.indexOf('\n');
    return {
      title: part.slice(0, titleEnd).trim(),
      where: readField(part, 'WORKSPACE') || undefined,
      action: readField(part, 'DO'),
      expect: readField(part, 'EXPECT'),
      trouble: readField(part, 'IF STUCK'),
      evidence: readField(part, 'EVIDENCE'),
      command: readField(part, 'COMMAND')
        .split('\n')
        .map((line) => line.replace(/^>\s?/, ''))
        .join('\n'),
      screenshots: readField(part, 'SCREENSHOTS')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean),
    };
  });
  if (
    !steps.length ||
    steps.some(
      (step) => !step.title || !step.action || !step.expect || !step.trouble,
    )
  )
    throw new Error('Incomplete guided walkthrough');
  const header = parts[0];
  return {
    where: readField(header, 'WHERE'),
    before: readField(header, 'BEFORE'),
    pass: readField(header, 'PASS'),
    rollback: readField(header, 'ROLLBACK'),
    steps,
  };
}

export function referenceBody(body: string) {
  return body.split('## Guided walkthrough')[0].trim();
}
