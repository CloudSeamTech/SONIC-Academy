export function brandForCourse(
  id: string,
): { id: string; name: string } | null {
  if (id === 'splunk') return { id: 'splunk', name: 'Splunk' };
  if (id === 'vsphere') return { id: 'vmware', name: 'VMware' };
  if (
    [
      'azure',
      'bicep',
      'azure-cloud-engineering',
      'azure-operations',
      'landing-zone',
      'migrations',
      'security',
    ].includes(id)
  )
    return { id: 'azure', name: 'Microsoft Azure' };
  if (
    [
      'windows-system-administration',
      'windows',
      'active-directory',
      'sql',
      'helpdesk',
      'dmz',
      'wsus',
      'mecm',
      'pki-windows-iis',
    ].includes(id)
  )
    return { id: 'microsoft', name: 'Microsoft' };
  if (
    [
      'linux-system-administration',
      'linux',
      'linux-daily-admin',
      'tls',
    ].includes(id)
  )
    return { id: 'redhat', name: 'Red Hat' };
  if (id === 'alma') return { id: 'almalinux', name: 'AlmaLinux' };
  if (id === 'pki-alma-nginx') return { id: 'nginx', name: 'NGINX' };
  return null;
}
