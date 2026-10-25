export type ExamNote = { exam: string; skill: string; url: string };
const azure = (skill: string): ExamNote => ({ exam: 'AZ-104 · Azure Administrator', skill, url: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104' });
const server = (skill: string): ExamNote => ({ exam: 'AZ-802 · Windows Server administration', skill, url: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-802' });
export function examRelevance(id: string): ExamNote | undefined {
  if (/^lz-(storage|data|recover)$/.test(id)) return azure('Practise Azure storage access, data protection and recovery. Know why an access setting or recovery option fits the problem, not just where its button is.');
  if (/^lz-network$|^lab-16$/.test(id)) return azure('Practise private addressing, network boundaries and traffic controls. Explain which route and rule let a connection succeed.');
  if (/^lz-(plan|group)$|^sec-cost$|^az-01$/.test(id)) return azure('Practise organizing resources, tags, budgets and cleanup. Tags help you find costs; they do not automatically stop charges.');
  if (/^azure-maint-/.test(id)) return azure('Practise monitoring, protecting and maintaining Azure resources. Explain how you verify a healthy pilot and recover a failed change.');
  if (/^lab-(14|15|17)$/.test(id)) return azure('Practise planning Azure compute and networking, then checking a workload after deployment. The VMware migration tool details are supporting practice, not a separate AZ-104 objective.');
  if (/^sec-identity$/.test(id)) return azure('Practise Microsoft Entra identities, roles and least privilege. Be able to explain the difference between identity and permission to manage an Azure resource.');
  if (/^lab-0[3-9](?:-(vmware|windows))?$|^lab-1[012]$/.test(id)) return server('Practise Windows Server networking, Active Directory, DNS or recovery. VMware wizard clicks are lab preparation; the transferable skill is explaining how the Windows service works and checking its result.');
  if (/^ha-0[2-5]$/.test(id)) return server('Practise Windows Server clustering, quorum and recovery checks. The SQL-specific configuration supports the exercise; it is not a promise of SQL exam coverage.');
  if (/^(resource-group-v2|azure-scope-v2)$/.test(id)) return azure('Practise organizing Azure resources and choosing a subscription and scope before deployment.');
  if (/^(network-plan-v2|nsg-v2|reachability-v2)$/.test(id)) return azure('Practise virtual network addressing, network security groups and connection troubleshooting. Explain which rule permits the required traffic.');
  if (/^(vm-provision-v2|manager-vm-v3|deallocate-v2)$/.test(id)) return azure('Practise deploying and stopping Azure virtual machines. Deallocation stops compute charges; disks and other retained resources can still cost money.');
  if (/^(identity-v2|host-os-v2|guest-network-v2|home-files-v2|storage-verify-v3|installer-types-v3|software-inventory-v3|baseline-v2|linux-|rhel-)/.test(id)) return {exam:'RHCSA · EX200', skill:'Practise Linux commands, services, permissions and storage. AlmaLinux is useful for learning; confirm the current Red Hat exam environment and objectives before booking.',url:'https://www.redhat.com/en/services/certification/rhcsa'};
  // Product-specific and desktop-enrichment lessons do not claim an exam match.
  return undefined;
}
