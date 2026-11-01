export type DC01Expected = {
  hostname: string;
  ipv4: string;
  prefix: number;
  domain: string;
  dns: string;
};
export type CheckResult = {
  id: string;
  title: string;
  status: 'pass' | 'fail' | 'not-checked';
  expected: string;
  observed: string;
  repair: string;
};
type Fact = { status: 'ok' | 'unavailable'; value: unknown };
export type LocalLabReport = {
  schemaVersion: 1;
  packId: 'windows-dc01';
  packVersion: '1.0.0';
  collectorVersion: string;
  collectedAt: string;
  demo?: boolean;
  facts: Record<string, Fact>;
};
const record = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const ipv4 = (value: string) =>
  /^(\d{1,3}\.){3}\d{1,3}$/.test(value) &&
  value.split('.').every((n) => Number(n) <= 255);
const domainName = (value: string) =>
  value.length <= 253 &&
  value.includes('.') &&
  value
    .split('.')
    .every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label));
export function validateDC01Expected(e: DC01Expected): string | null {
  if (!/^[a-z0-9](?:[a-z0-9-]{0,13}[a-z0-9])?$/i.test(e.hostname))
    return 'Enter a short Windows computer name, such as DC01 (not its FQDN).';
  if (!ipv4(e.ipv4) || !ipv4(e.dns))
    return 'Enter valid IPv4 addresses for the server and expected DNS server.';
  if (!Number.isInteger(e.prefix) || e.prefix < 1 || e.prefix > 32)
    return 'Enter a prefix from 1 to 32; this lesson uses 24.';
  if (!domainName(e.domain))
    return 'Enter a DNS domain such as lab.example.test, without a server name or https://.';
  return null;
}
export function parseLocalLabReport(text: string): LocalLabReport {
  if (text.length > 131072)
    throw new Error('Choose a report smaller than 128 KB.');
  let value: unknown;
  try {
    value = JSON.parse(text.replace(/^\uFEFF/, ''));
  } catch {
    throw new Error('This is not a valid JSON report.');
  }
  if (
    !record(value) ||
    value.schemaVersion !== 1 ||
    value.packId !== 'windows-dc01' ||
    value.packVersion !== '1.0.0' ||
    value.collectorVersion !== '1.0.0' ||
    typeof value.collectedAt !== 'string' ||
    !Number.isFinite(Date.parse(value.collectedAt)) ||
    !record(value.facts)
  )
    throw new Error('Use a DC01 report from collector version 1.0.0.');
  for (const key of [
    'computer',
    'adapters',
    'roles',
    'services',
    'shares',
    'controller',
    'dnsRegistration',
  ]) {
    const fact = value.facts[key];
    if (
      !record(fact) ||
      !['ok', 'unavailable'].includes(String(fact.status)) ||
      !Object.hasOwn(fact, 'value')
    )
      throw new Error(`The report is missing a valid ${key} observation.`);
  }
  return value as LocalLabReport;
}
const normalize = (text: string) => text.toLowerCase().replace(/\.$/, '');
const summary = (value: unknown, depth = 0): string => {
  if (depth > 4) return '[nested value]';
  if (typeof value === 'string') return value.slice(0, 500);
  if (Array.isArray(value))
    return value.length
      ? value
          .slice(0, 10)
          .map((item) => summary(item, depth + 1))
          .join('; ')
          .slice(0, 500)
      : 'None found';
  if (record(value))
    return Object.entries(value)
      .slice(0, 8)
      .map(([key, item]) => `${key}: ${summary(item, depth + 1)}`)
      .join('; ')
      .slice(0, 500);
  return typeof value === 'number' || typeof value === 'boolean'
    ? String(value)
    : 'No observation';
};
export function checkDC01(
  report: LocalLabReport,
  expected: DC01Expected,
  now = Date.now(),
): CheckResult[] {
  const error = validateDC01Expected(expected);
  if (error) throw new Error(error);
  const age = now - Date.parse(report.collectedAt);
  const stale = age > 24 * 60 * 60 * 1000 || age < -5 * 60 * 1000;
  const read = (name: string) =>
    stale || report.facts[name].status !== 'ok'
      ? undefined
      : report.facts[name].value;
  const computer = read('computer');
  const c = record(computer) ? computer : undefined;
  const adapters = read('adapters');
  const adapter = Array.isArray(adapters)
    ? adapters.find(
        (a) =>
          record(a) &&
          Array.isArray(a.addresses) &&
          a.addresses.some(
            (ip: unknown) => record(ip) && ip.address === expected.ipv4,
          ),
      )
    : undefined;
  const make = (
    id: string,
    title: string,
    wanted: string,
    observed: unknown,
    matches: boolean | undefined,
    repair: string,
  ): CheckResult => ({
    id,
    title,
    expected: wanted,
    observed: stale
      ? 'Report expired or clock is ahead; collect a fresh report.'
      : observed === undefined
        ? 'Observation unavailable. Run on the named VM in elevated Windows PowerShell; inspect tool availability.'
        : summary(observed),
    status:
      stale || matches === undefined
        ? 'not-checked'
        : matches
          ? 'pass'
          : 'fail',
    repair,
  });
  const roles = read('roles'),
    services = read('services'),
    shares = read('shares'),
    controller = read('controller'),
    dns = read('dnsRegistration');
  const fqdn = `${expected.hostname}.${expected.domain}`.toLowerCase();
  return [
    make(
      'hostname',
      'Computer name',
      expected.hostname,
      c?.hostname,
      typeof c?.hostname === 'string'
        ? normalize(c.hostname) === normalize(expected.hostname)
        : undefined,
      'On the intended lab VM, check Server Manager → Local Server → Computer name. Use the lesson’s rename/restart procedure if needed.',
    ),
    make(
      'server',
      'Windows Server OS',
      'Windows Server (product type 2 or 3)',
      typeof c?.productType === 'number'
        ? c.productType === 2
          ? 'Domain controller (Windows Server)'
          : c.productType === 3
            ? 'Windows Server'
            : `Not Windows Server (product type ${c.productType})`
        : undefined,
      typeof c?.productType === 'number'
        ? [2, 3].includes(c.productType)
        : undefined,
      'Run the collector inside the Windows Server VM, not on your physical Windows workstation.',
    ),
    make(
      'ipv4',
      'IPv4 address and prefix',
      `${expected.ipv4}/${expected.prefix}`,
      Array.isArray(adapters) ? adapters : undefined,
      Array.isArray(adapters)
        ? Boolean(
            adapter &&
            adapter.addresses.some(
              (ip: unknown) =>
                record(ip) &&
                ip.address === expected.ipv4 &&
                ip.prefix === expected.prefix,
            ),
          )
        : undefined,
      'Check the VM’s active Ethernet adapter → IPv4 properties. This check confirms the address/prefix; it does not yet prove DHCP is disabled.',
    ),
    make(
      'dns-client',
      'DNS client on the selected adapter',
      expected.dns,
      adapter?.dns,
      adapter && Array.isArray(adapter.dns)
        ? Boolean(
            adapter &&
            Array.isArray(adapter.dns) &&
            adapter.dns.length &&
            adapter.dns.every((ip: unknown) => ip === expected.dns),
          )
        : undefined,
      'First confirm the expected IP is present. Then, in that adapter’s IPv4 properties, use the DNS address required by this lesson phase. Do not substitute public DNS.',
    ),
    make(
      'roles',
      'AD DS and DNS roles',
      'AD-Domain-Services and DNS installed',
      roles,
      Array.isArray(roles)
        ? roles.includes('AD-Domain-Services') && roles.includes('DNS')
        : undefined,
      'Check Server Manager → Manage → Add Roles and Features. Follow the course’s role installation task; this verifier never installs roles.',
    ),
    make(
      'promotion',
      'Promoted domain controller',
      expected.domain,
      c ? { domain: c.domain, domainRole: c.domainRole } : undefined,
      c && typeof c.domain === 'string' && typeof c.domainRole === 'number'
        ? [4, 5].includes(c.domainRole) &&
            normalize(c.domain) === normalize(expected.domain)
        : undefined,
      'A role installation is not promotion. Return to the AD DS promotion task, verify the intended domain, and restart if that task requires it.',
    ),
    make(
      'identity',
      'DC FQDN and domain',
      fqdn,
      controller,
      record(controller) &&
        typeof controller.hostname === 'string' &&
        typeof controller.domain === 'string' &&
        typeof controller.readOnly === 'boolean'
        ? normalize(controller.hostname) === fqdn &&
            normalize(controller.domain) === normalize(expected.domain) &&
            controller.readOnly === false
        : undefined,
      'Run on DC01 with the ActiveDirectory module available. Check the actual DNS domain and computer name; do not guess a different FQDN.',
    ),
    make(
      'services',
      'Directory services running',
      'NTDS, DNS and Netlogon Running',
      services,
      Array.isArray(services)
        ? ['NTDS', 'DNS', 'Netlogon'].every((name) =>
            services.some(
              (s) => record(s) && s.name === name && s.state === 'Running',
            ),
          )
        : undefined,
      'Open Server Manager → Tools → Services. Inspect the named service and its event log; return to the troubleshooting task before changing it.',
    ),
    make(
      'shares',
      'Domain shares present',
      'SYSVOL and NETLOGON',
      shares,
      Array.isArray(shares)
        ? ['SYSVOL', 'NETLOGON'].every((name) =>
            shares.some(
              (v) => typeof v === 'string' && v.toUpperCase() === name,
            ),
          )
        : undefined,
      'Check promotion and SYSVOL initialization. Inspect Directory Service and DFS Replication logs; do not create these shares manually to make a check pass.',
    ),
    make(
      'dns-registration',
      'Local LDAP SRV registration',
      `${fqdn}, port 389`,
      dns,
      Array.isArray(dns)
        ? dns.some(
            (v) =>
              record(v) &&
              typeof v.target === 'string' &&
              normalize(v.target) === fqdn &&
              v.port === 389,
          )
        : undefined,
      'Check Server Manager → Tools → DNS and the lesson’s DNS registration checks. This queries the DC’s local DNS service; it does not test every DNS record.',
    ),
    make(
      'replication',
      'DC02 replication',
      'Separate DC02 check pack',
      'Not included in this DC01 pack.',
      undefined,
      'Not included in this DC01 pack. Complete DC02 and its replication checks separately.',
    ),
  ];
}
