const roles: Record<string, string> = {
  APP01: 'application server', APP02: 'Azure application server',
  DC01: 'first domain controller', DC02: 'second domain controller',
  'DEST-DC01': 'destination domain controller', 'AZ-DC01': 'Azure domain controller',
  SQL01: 'Microsoft SQL Server computer', SQL02: 'second SQL Server computer',
  MECM01: 'Configuration Manager server', WSUS01: 'Windows update server',
  PROXY01: 'DMZ web gateway', 'IIS-DMZ01': 'private IIS test server',
  FW01: 'firewall', TEST01: 'outside practice client',
};
/** Explanation only: executable command blocks and copied values never pass here. */
export function ServerRoleText({ text }: { text: string }) {
  const pattern = /(?<![\w.\\/-])(DEST-DC01|AZ-DC01|IIS-DMZ01|APP01|APP02|DC01|DC02|SQL01|SQL02|MECM01|WSUS01|PROXY01|FW01|TEST01)(?![\w.\\/-])/g;
  const parts = text.split(pattern);
  return <>{parts.map((part, i) => roles[part] && !/(?:server|controller|gateway|firewall|client|computer)\s*\(?$/i.test(parts[i - 1] ?? '')
    ? <span key={i}>{roles[part]} (<strong>{part}</strong>)</span>
    : part)}</>;
}
