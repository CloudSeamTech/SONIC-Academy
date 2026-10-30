export const passportFields = [
  'hostname',
  'username',
  'ipv4',
  'directory',
] as const;
export type LabEnvironment = Record<(typeof passportFields)[number], string>;
export type LabPassportData = {
  version: 1;
  updatedAt: string;
  environments: Record<string, LabEnvironment>;
};
export const blankEnvironment = (): LabEnvironment => ({
  hostname: '',
  username: '',
  ipv4: '',
  directory: '',
});
export const passportKey = (owner?: string) =>
  `sonic-lab-passport-v1:${owner ? encodeURIComponent(owner) : 'guest'}`;
export function readPassport(raw: string | null): LabPassportData {
  const empty: LabPassportData = {
    version: 1,
    updatedAt: '',
    environments: {},
  };
  try {
    const data = JSON.parse(raw ?? 'null');
    if (
      data?.version !== 1 ||
      !data.environments ||
      typeof data.environments !== 'object' ||
      Array.isArray(data.environments)
    )
      return empty;
    const environments: Record<string, LabEnvironment> = {};
    for (const [id, value] of Object.entries(data.environments).slice(0, 100)) {
      if (!/^[a-z0-9-]{1,80}$/.test(id) || !value || typeof value !== 'object')
        continue;
      const row = blankEnvironment();
      for (const field of passportFields) {
        const text = (value as Record<string, unknown>)[field];
        if (typeof text === 'string')
          row[field] = text.replace(/[\x00-\x1f\x7f]/g, '').slice(0, 200);
      }
      environments[id] = row;
    }
    return {
      version: 1,
      updatedAt:
        typeof data.updatedAt === 'string' ? data.updatedAt.slice(0, 40) : '',
      environments,
    };
  } catch {
    return empty;
  }
}
export function validIPv4(value: string): boolean {
  if (!value) return true;
  return (
    value.split('.').length === 4 &&
    value
      .split('.')
      .every(
        (part) =>
          /^\d{1,3}$/.test(part) &&
          Number(part) <= 255 &&
          (part === '0' || !part.startsWith('0')),
      )
  );
}
