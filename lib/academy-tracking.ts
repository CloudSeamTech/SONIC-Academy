export const progressKeys = [
  'wazuh-foundations-v2',
  'sonic-agency-azure-migration-v1',
  'sonic-alma-desktop-v1',
  'sonic-academy-nessus-v1',
  'sonic-academy-bookmarks-v1',
];
export function isProgressKey(key: string) {
  return (
    progressKeys.includes(key) ||
    key === 'sonic-academy-notebook-v1:windows-dmz' ||
    /^sonic-guided-workstation2019-v1:[a-z0-9:-]{1,100}$/.test(key)
  );
}
export function parseCompleted(records: Record<string, string>): string[] {
  const values: string[] = [];
  for (const key of progressKeys.slice(0, 4)) {
    try {
      const value = JSON.parse(records[key] ?? 'null');
      const ids =
        key === 'sonic-alma-desktop-v1'
          ? Array.isArray(value)
            ? value
            : []
          : key === 'wazuh-foundations-v2'
            ? value?.version === 2
              ? value.completed
              : []
            : value?.version === 1
              ? key === 'sonic-academy-nessus-v1'
                ? value.verified
                : value.completed
              : [];
      if (Array.isArray(ids))
        values.push(
          ...ids.filter((id): id is string => typeof id === 'string'),
        );
    } catch {
      /* An invalid browser record earns no completion credit. */
    }
  }
  return [...new Set(values)];
}
