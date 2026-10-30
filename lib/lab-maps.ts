export type LabNode = {
  id: string;
  title: string;
  role: string;
  workspace: string;
  checks: string;
  terms: string;
};
const workstation: LabNode = {
  id: 'workstation',
  title: 'Your workstation',
  role: 'The computer you sit at. Open the browser, VMware console or an SSH client here.',
  workspace: 'Windows Terminal → PowerShell on your physical computer.',
  checks: 'hostname\nGet-Location',
  terms:
    'A host is a computer. A VM is a separate computer running inside a host.',
};
const linux: LabNode = {
  id: 'linux',
  title: 'Linux application VM',
  role: 'Runs the Linux commands and application used by this course.',
  workspace:
    'Open this VM’s console, or its verified SSH session. Use Bash inside Linux.',
  checks: 'hostname\nwhoami\npwd',
  terms:
    'SSH connects to another computer. Commands after login run there until you type exit.',
};
const windows: LabNode = {
  id: 'application',
  title: 'Windows application VM',
  role: 'Runs IIS or the Windows application. Keep it separate from domain controllers.',
  workspace:
    'Open the Windows VM desktop → Terminal or PowerShell as the step requires.',
  checks: 'hostname\nwhoami\nGet-Location',
  terms:
    'Administrator PowerShell has extra permissions. Use it only when the step asks.',
};
const controller: LabNode = {
  id: 'controller',
  title: 'Domain controller',
  role: 'Provides Active Directory sign-in and DNS. It is not your application server.',
  workspace: 'Inside the named DC’s desktop → Server Manager or PowerShell.',
  checks: 'hostname\nwhoami\nGet-Location',
  terms:
    'DNS turns names into addresses. AD DS stores domain users, computers and policy.',
};
export function nodesForCourse(id: string): LabNode[] {
  if (id === 'linux')
    return [
      workstation,
      {
        ...linux,
        id: 'manager',
        title: 'RHEL manager',
        role: 'Receives Wazuh security data. Do manager installation steps here.',
      },
      {
        ...linux,
        id: 'endpoint',
        title: 'RHEL endpoint',
        role: 'Sends security data to the manager. Do agent steps here.',
      },
    ];
  if (id === 'vsphere')
    return [
      workstation,
      {
        ...linux,
        id: 'vcenter',
        title: 'vCenter',
        role: 'Centrally manages ESXi hosts. It is not a guest VM console.',
        workspace:
          'Your workstation browser → the verified vCenter /ui address.',
        checks: '',
        terms:
          'Inventory shows where VMs live. Confirm the selected object before changing it.',
      },
      {
        ...linux,
        id: 'esxi',
        title: 'ESXi host',
        role: 'The physical hypervisor that runs the VMs.',
        workspace:
          'Use the verified ESXi Host Client in your browser; do not enter guest OS commands here.',
        checks: '',
        terms:
          'A datastore holds VM files. A port group is a named VM network connection.',
      },
      { ...linux, id: 'guest', title: 'Guest VM' },
    ];
  if (id.startsWith('nessus'))
    return [
      workstation,
      {
        ...windows,
        id: 'scanner',
        title: 'Nessus scanner',
        checks: '',
        role: 'Runs approved scans from the selected scanner host.',
        workspace:
          'The scanner’s verified Nessus web interface; install commands run inside the scanner VM.',
        terms:
          'The scanner and target are different computers. Scan only addresses you have permission to test.',
      },
      {
        ...linux,
        id: 'target',
        title: 'Authorized target',
        role: 'A practice server you are allowed to scan.',
        checks: '',
        workspace:
          'Use its own console to verify findings; scanner UI commands do not run here.',
      },
    ];
  if (id === 'pki-alma-nginx' || id === 'linux-daily-admin' || id === 'alma')
    return [
      workstation,
      {
        ...linux,
        title:
          id === 'alma'
            ? 'AlmaLinux desktop VM'
            : id === 'linux-daily-admin'
              ? 'Linux practice VM'
              : linux.title,
      },
    ];
  if (id === 'windows' || id === 'active-directory')
    return [
      workstation,
      { ...controller, id: 'dc-first', title: 'DC01 · first controller' },
      { ...controller, id: 'dc-second', title: 'DC02 · second controller' },
    ];
  if (id === 'sql')
    return [
      workstation,
      controller,
      {
        ...windows,
        id: 'sql-first',
        title: 'SQL01 · database VM',
        role: 'Runs the first SQL Server instance. Use the instance named in the step.',
      },
      {
        ...windows,
        id: 'sql-second',
        title: 'SQL02 · availability VM',
        role: 'Runs the second SQL instance for the course’s availability exercises.',
      },
    ];
  if (id === 'mecm' || id === 'wsus')
    return [
      workstation,
      controller,
      {
        ...windows,
        id: 'management',
        title: id === 'mecm' ? 'Configuration Manager server' : 'WSUS server',
        role: 'Provides the course’s management service. Confirm the selected site and server before changing policy.',
      },
      {
        ...windows,
        id: 'pilot',
        title: 'Windows pilot client',
        role: 'Receives the test policy, application or update. Use this client’s own console for client-side checks.',
      },
    ];
  if (id === 'dmz')
    return [
      workstation,
      {
        ...linux,
        id: 'proxy',
        title: 'AlmaLinux / NGINX proxy',
        role: 'The front-door reverse proxy forwards permitted web traffic to the private application.',
      },
      windows,
      {
        ...windows,
        id: 'firewall',
        title: 'OPNsense firewall',
        role: 'Separates the practice networks and permits only approved flows.',
        workspace:
          'The verified OPNsense browser interface from the workstation, following the firewall lesson.',
        checks: '',
        terms:
          'Rules are directional. Confirm source, destination, port and interface before applying a rule.',
      },
    ];
  if (id === 'azure-operations')
    return [
      workstation,
      { ...windows, id: 'windows-pilot', title: 'Windows pilot VM' },
      { ...linux, id: 'linux-pilot', title: 'Linux pilot VM' },
      {
        ...linux,
        id: 'azure',
        title: 'Azure management',
        role: 'Manage the cloud resources and maintenance services.',
        workspace: 'The Azure portal in the workstation browser.',
        checks: '',
        terms:
          'Portal actions and guest commands run in different places. Confirm the subscription and selected resource.',
      },
    ];
  if (id === 'splunk')
    return [
      workstation,
      {
        ...windows,
        id: 'splunk',
        title: 'Splunk server',
        role: 'Stores and searches the imported practice events.',
        workspace:
          'Use Splunk Web for SPL searches. Use VM PowerShell only for Windows commands.',
        checks: '',
        terms:
          'SPL is a search language. Do not paste SPL into PowerShell or Bash.',
      },
    ];
  if (
    [
      'azure',
      'landing-zone',
      'azure-operations',
      'security',
      'migrations',
    ].includes(id)
  )
    return [
      workstation,
      {
        ...windows,
        id: 'source',
        title: 'Source lab server',
        role: 'The existing server being assessed, maintained or moved.',
      },
      {
        ...linux,
        id: 'azure',
        title: 'Azure destination',
        role: 'The planned cloud resources. A source server and its Azure destination are separate.',
        workspace:
          'Azure portal in your workstation browser. Guest OS commands run inside the selected VM, not in the portal.',
        checks: '',
        terms:
          'Confirm tenant, subscription, region and target. This map does not test connectivity.',
      },
    ];
  return [
    workstation,
    ...(id === 'pki-windows-iis' ? [] : [controller]),
    windows,
  ];
}
export type NodeValues = { hostname: string; ipv4: string };
export const mapKey = (owner: string | undefined, course: string) =>
  `sonic-lab-map-v1:${encodeURIComponent(owner ?? 'guest')}:${course}`;
export function readMap(raw: string | null): Record<string, NodeValues> {
  try {
    const data = JSON.parse(raw ?? '{}');
    if (data.version !== 1 || !data.nodes || Array.isArray(data.nodes))
      return {};
    return Object.fromEntries(
      Object.entries(data.nodes)
        .filter(([id]) => /^[a-z-]{1,40}$/.test(id))
        .slice(0, 12)
        .map(([id, row]) => [
          id,
          {
            hostname:
              typeof (row as NodeValues)?.hostname === 'string'
                ? (row as NodeValues).hostname
                    .replace(/[\x00-\x1f]/g, '')
                    .slice(0, 120)
                : '',
            ipv4:
              typeof (row as NodeValues)?.ipv4 === 'string'
                ? (row as NodeValues).ipv4.slice(0, 40)
                : '',
          },
        ]),
    );
  } catch {
    return {};
  }
}
