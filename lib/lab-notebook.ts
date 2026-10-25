export const dmzNotebookKey = 'sonic-academy-notebook-v1:windows-dmz';
export type LabNotebook = {
  version: 1;
  fields: Record<string, string>;
  notes: Record<string, string>;
};
export function readLabNotebook(raw: string | null): LabNotebook {
  const empty: LabNotebook = { version: 1, fields: {}, notes: {} };
  try {
    const value = JSON.parse(raw ?? 'null');
    if (value?.version !== 1) return empty;
    const strings = (input: unknown) =>
      Object.fromEntries(
        Object.entries(
          input && typeof input === 'object' && !Array.isArray(input)
            ? input
            : {},
        ).filter(
          ([key, text]) =>
            /^[a-z0-9-]{1,60}$/.test(key) &&
            typeof text === 'string' &&
            text.length <= 2000,
        ),
      ) as Record<string, string>;
    return {
      version: 1,
      fields: strings(value.fields),
      notes: strings(value.notes),
    };
  } catch {
    return empty;
  }
}
