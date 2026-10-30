import fs from 'node:fs';
const rows = [];
function q(
  source,
  tags,
  question,
  correct,
  distractors,
  explanation,
  objective,
) {
  rows.push({
    id: `${source}-practice-${rows.filter((row) => row.source === source).length + 1}`,
    source,
    tags: tags.split(','),
    question,
    options: [correct, ...distractors],
    answer: 0,
    explanation,
    objective,
  });
}
q(
  'linux',
  'shell,identity,build',
  'Your SSH tab may be on the wrong VM. Which read-only check identifies the account, host and folder?',
  'Run whoami, hostname and pwd.',
  [
    'Run sudo reboot.',
    'Delete the SSH known_hosts file.',
    'Assume the tab title is correct.',
  ],
  'These commands identify the current account, computer and working directory without changing the server.',
  'Essential tools · shell identity',
);
q(
  'linux',
  'folder,file,home,transfer',
  'pwd prints /home/rexuser. What does that tell you?',
  'This shell is working in rexuser’s home directory.',
  [
    'Every file on the server is stored there.',
    'The shell is running as root.',
    'The public IP address changed.',
  ],
  'pwd reports the current directory. It does not report privilege, network addresses or every storage location.',
  'Essential tools · directories',
);
q(
  'linux',
  'permissions,file,transfer',
  'A practice file is mode 600. Who can normally read its contents?',
  'Its owner; other ordinary users have no permission through these mode bits.',
  [
    'Every user can read it.',
    'Only its group can read it.',
    'No one can read it, including its owner.',
  ],
  'The first 6 grants owner read and write. The group and other digits are zero. Privileged access and ACLs require separate consideration.',
  'Security · standard permissions',
);
q(
  'linux',
  'permissions,default,security',
  'What does umask influence when a program creates a file?',
  'Which permission bits are removed from the program’s requested starting mode.',
  [
    'The file’s network address.',
    'The password hash of its owner.',
    'The permissions of every existing file.',
  ],
  'A umask limits new file and directory modes. It does not retroactively change existing files.',
  'Security · default permissions',
);
q(
  'linux',
  'ssh,key,access,transfer',
  'Which SSH key file stays protected on your workstation?',
  'The private key.',
  [
    'The server’s public host key.',
    'The public key copied into authorized_keys.',
    'The public-key fingerprint.',
  ],
  'The private key proves possession during authentication and must not be copied into tickets or uploaded to the target as a public key.',
  'Security · key-based SSH',
);
q(
  'linux',
  'sudo,identity,privilege',
  'A command fails with Permission denied. What is the best next step?',
  'Check the target, ownership and required permissions before using extra privilege.',
  [
    'Run every command with sudo from now on.',
    'Set every directory to mode 777.',
    'Disable SELinux immediately.',
  ],
  'The error is evidence to investigate. Extra privilege or broad permissions can hide the cause and damage the wrong target.',
  'Users and groups · privileged access',
);
q(
  'linux',
  'service,systemd,agent,central,inventory',
  'A service is enabled but inactive. What does enabled mean?',
  'It is configured to start through its enablement links; that does not prove it is running now.',
  [
    'It is definitely running now.',
    'Its configuration is valid.',
    'It has passed an application test.',
  ],
  'Enablement and runtime state are separate. Check status and the journal, then validate the application.',
  'Maintain systems · service startup',
);
q(
  'linux',
  'logs,journal,troubleshoot,check',
  'Which command reads messages for a known systemd unit without restarting it?',
  'journalctl -u UNIT --no-pager',
  ['systemctl restart UNIT', 'rm -rf /var/log', 'chmod 777 /etc'],
  'journalctl reads the journal. Replace UNIT with the discovered unit name and use the relevant time range to preserve useful evidence.',
  'Running systems · interpret journals',
);
q(
  'linux',
  'rpm,software,inventory,install,agent',
  'What is the purpose of rpm -q PACKAGE?',
  'Query whether the named RPM package is installed.',
  [
    'Install the package.',
    'Start its service.',
    'Download all available updates.',
  ],
  'The -q option queries package information. Installation and service control are separate operations.',
  'Software · RPM package management',
);
q(
  'linux',
  'flatpak,software,desktop',
  'What should you check before installing a Flatpak application?',
  'The configured remote and the application’s source, permissions and suitability.',
  [
    'Whether its filename ends in .rpm.',
    'Whether SELinux is disabled.',
    'Whether the application can replace the kernel.',
  ],
  'Flatpak uses remotes and application permissions. Current RHCSA RHEL 10 objectives include managing Flatpak sources and packages.',
  'Software · Flatpak repositories and applications',
);
q(
  'linux',
  'dnf,software,install,repositories',
  'DNF cannot find a package. Which check comes before downloading a random installer?',
  'Check the enabled repositories, package name and distribution version.',
  [
    'Disable package signature verification.',
    'Run the first script found in a forum.',
    'Rename a text file to .rpm.',
  ],
  'Available packages depend on the configured repositories, architecture and release. Keep integrity checks enabled.',
  'Software · repositories',
);
q(
  'linux',
  'storage,disk,baseline,filesystem',
  'Which pair helps distinguish block devices from mounted filesystem free space?',
  'lsblk and df -hT',
  ['whoami and passwd', 'hostname and date', 'touch and echo'],
  'lsblk describes the block-device layout; df reports mounted filesystem usage and, with -T, filesystem type.',
  'Storage · identify devices and filesystems',
);
q(
  'linux',
  'xfs,storage,grow,filesystem',
  'A lab needs a smaller XFS filesystem. Which plan is sound?',
  'Back up and recreate it at the required size, then restore and validate.',
  [
    'Shrink it in place with resize2fs.',
    'Reduce the logical volume first.',
    'Remove random directories until its size changes.',
  ],
  'XFS supports growth, not in-place shrinking. Reducing the underlying volume first can destroy data.',
  'Filesystems · resizing and safe recovery',
);
q(
  'linux',
  'mount,storage,reboot,filesystem',
  'Why use a verified UUID in a persistent filesystem mount entry?',
  'It identifies the filesystem more reliably than an assumed device enumeration name.',
  [
    'It automatically creates a backup.',
    'It disables mount errors.',
    'It guarantees the disk can never fail.',
  ],
  'Device names can change. Verify the UUID and filesystem, test the configuration and keep console recovery available before rebooting.',
  'Storage · persistent mounts',
);
q(
  'linux',
  'selinux,security,nginx,troubleshoot',
  'UNIX permissions look correct, but SELinux denies an application. What should you inspect?',
  'The denial evidence and relevant file/process contexts.',
  [
    'Only the desktop wallpaper.',
    'Whether all files can be made world-writable.',
    'How to permanently disable SELinux first.',
  ],
  'SELinux checks contexts and policy in addition to ordinary permissions. Diagnose the denial and apply the specific approved correction.',
  'Security · SELinux contexts',
);
q(
  'linux',
  'selinux,context,recover',
  'A file has the wrong default SELinux context. Which tool can restore the policy-defined context?',
  'restorecon',
  ['chmod 777', 'kill -9', 'passwd -d'],
  'restorecon applies the default labeling policy for the path. Confirm the intended policy and path before running a change.',
  'Security · restore file contexts',
);
q(
  'linux',
  'firewall,network,central,port',
  'A temporary firewalld rule works. What else must a persistent change consider?',
  'The correct zone and source, permanent configuration and post-reload verification.',
  [
    'Only the terminal color.',
    'Opening every port permanently.',
    'Removing the default route.',
  ],
  'Runtime and permanent rules are separate. Keep access narrowly scoped and verify behavior after applying the persistent configuration.',
  'Networking · firewalld persistence',
);
q(
  'linux',
  'network,dns,hostname',
  'A name lookup fails but connecting to the correct IP works. Which layer should you investigate first?',
  'Name resolution.',
  [
    'The filesystem’s inode count.',
    'The keyboard layout.',
    'The private key’s comment field.',
  ],
  'The working IP path narrows the initial investigation toward the resolver, records and the exact hostname used.',
  'Networking · hostname resolution',
);
q(
  'linux',
  'transfer,checksum,scp,sftp',
  'Why compare SHA-256 values after copying a practice file?',
  'To check whether the copied bytes match the original.',
  [
    'To prove the file is malware-free.',
    'To create a private key.',
    'To prove the destination service is running.',
  ],
  'Matching checksums support byte-for-byte integrity. They do not by themselves establish source trust or application health.',
  'Running systems · secure transfer',
);
q(
  'linux',
  'sftp,transfer,folder',
  'At an sftp> prompt, what is the difference between pwd and lpwd?',
  'pwd shows the remote folder; lpwd shows the local folder.',
  [
    'Both print the SSH password.',
    'pwd exits SFTP; lpwd uploads a key.',
    'Both change the remote folder.',
  ],
  'SFTP maintains local and remote working directories. Confirm both before using put or get.',
  'Essential tools · remote file paths',
);
q(
  'linux',
  'script,shell,condition',
  'What does a shell script’s test or [ expression do?',
  'Evaluate a condition that can guide an if branch.',
  [
    'Always install a package.',
    'Create a new login shell account.',
    'Make every command run as root.',
  ],
  'Conditional expressions return a status that a script can use for decisions. Read the expression and quote variable expansions appropriately.',
  'Shell scripts · conditional execution',
);
q(
  'linux',
  'script,shell,loop',
  'Why use a for loop in a small administration script?',
  'To apply the same controlled operation to a known set of items.',
  [
    'To bypass file permissions.',
    'To guarantee every command succeeds.',
    'To turn text into a filesystem.',
  ],
  'Loops repeat a body. Validate the input list, handle failures and avoid unintended targets before applying changes.',
  'Shell scripts · loops',
);
q(
  'linux',
  'cron,timer,schedule,maintain',
  'What should a scheduled administration task record besides its schedule?',
  'The execution identity, exact command, required environment and evidence of success or failure.',
  [
    'Only the creator’s favorite editor.',
    'A plaintext copy of every password.',
    'A promise that scheduled means successful.',
  ],
  'Scheduled jobs have an identity and environment that may differ from an interactive shell. Verify outcomes and preserve useful logs.',
  'Maintain systems · task scheduling',
);
q(
  'linux',
  'backup,rollback,recovery,snapshot',
  'Why is a VM snapshot not a complete backup strategy?',
  'It depends on the VM’s underlying storage and may not survive its loss.',
  [
    'It always creates an off-site copy.',
    'It restores every external dependency automatically.',
    'It proves an application-consistent recovery.',
  ],
  'A snapshot is a point-in-time mechanism within the storage chain. A recovery plan also needs independent protection and a tested restore.',
  'Course practice · recovery planning',
);
q(
  'linux',
  'fault,agent,checkin,validate',
  'After restoring an agent configuration, what best proves recovery?',
  'A recent, correctly identified check-in plus the original user-visible function.',
  [
    'An old screenshot of a green status.',
    'Only a successful file copy.',
    'Only an enabled service flag.',
  ],
  'Correlate the actual host, agent identity and timestamps, then repeat the original acceptance check. Old evidence can describe a different state.',
  'Course practice · evidence-based validation',
);
q(
  'linux',
  'tar,archive,backup',
  'What should you do before extracting an unfamiliar archive into a system directory?',
  'Inspect its entries and test extraction into a disposable directory.',
  [
    'Extract as root immediately.',
    'Delete the directory first.',
    'Disable all integrity checks.',
  ],
  'Inspecting paths and testing in a disposable location reduces accidental overwrites and helps verify the archive’s actual structure.',
  'Essential tools · archives',
);

q(
  'azure',
  'scope,identity,subscription,plan',
  'Before changing an Azure VM, which identity and scope checks matter?',
  'Confirm the tenant, subscription, resource group and selected VM.',
  [
    'Check only the browser tab color.',
    'Assume the last-used subscription is correct.',
    'Create a new subscription to avoid checking.',
  ],
  'The same names can exist in different scopes. Confirm the actual target and the permissions required before making a change.',
  'AZ-104 · identities and governance',
);
q(
  'azure',
  'rbac,identity,access',
  'An operator needs to manage one resource group. Which role-assignment approach best follows least privilege?',
  'Assign a suitable role at that resource-group scope.',
  [
    'Grant global ownership everywhere.',
    'Share another person’s account.',
    'Disable authentication for the group.',
  ],
  'Azure RBAC combines a principal, role and scope. Use the smallest scope and permissions that satisfy the task.',
  'AZ-104 · role assignments',
);
q(
  'azure',
  'budget,cost,plan',
  'Does an Azure budget alert automatically stop every VM when the threshold is reached?',
  'No. A budget alerts; automated action requires a separately configured process.',
  [
    'Yes, every subscription stops instantly.',
    'Yes, including all retained disks.',
    'Only if a VM has a public IP.',
  ],
  'A budget is a monitoring and notification mechanism. Plan any automation explicitly and account for retained resource charges.',
  'AZ-104 · cost management',
);
q(
  'azure',
  'deallocate,cost,compute,close',
  'A VM is Stopped (deallocated). What cost assumption is safe?',
  'Compute allocation stops, but retained resources such as disks can still cost money.',
  [
    'Every associated resource is free.',
    'All backups are deleted.',
    'The application remains available.',
  ],
  'Deallocation and resource deletion are different. Review disks, IP resources, backups and other retained services in the cost plan.',
  'AZ-104 · VM lifecycle',
);
q(
  'azure',
  'network,subnet,vnet,plan',
  'What is a subnet?',
  'An address range within a virtual network.',
  [
    'A backup of every VM.',
    'An account with owner rights.',
    'A public certificate authority.',
  ],
  'A subnet organizes a portion of the virtual network’s address space. Plan ranges and routing without overlap.',
  'AZ-104 · virtual networking',
);
q(
  'azure',
  'nsg,ssh,security,port',
  'A lab permits SSH only from your workstation’s current public IPv4. Which source rule is most appropriate?',
  'That verified address as a /32 source, with the required destination port only.',
  [
    'Any source and every port.',
    'The whole internet with no expiry or review.',
    'The guest’s hostname as the source subnet.',
  ],
  'A /32 identifies a single IPv4 address. Recheck the source when it changes and retain another approved recovery path.',
  'AZ-104 · network security groups',
);
q(
  'azure',
  'dns,network,migrate',
  'A migrated application’s hostname resolves to the old server. What should you investigate?',
  'The intended DNS record, resolver path and caching/TTL behavior.',
  [
    'Only the new VM’s wallpaper.',
    'Whether the browser has more tabs.',
    'Whether the old server can be deleted immediately.',
  ],
  'DNS can continue directing clients to the old endpoint. Validate the planned record and propagation before concluding that cutover failed.',
  'AZ-104 · DNS and connectivity',
);
q(
  'azure',
  'storage,redundancy,backup',
  'Does storage redundancy replace a backup that protects against accidental deletion?',
  'No. Replication and recovery from deletion address different risks.',
  [
    'Yes, redundancy makes deletion impossible.',
    'Yes, every replica keeps every old version forever.',
    'Only if the VM uses two CPUs.',
  ],
  'Redundancy maintains copies for availability. Recovery features, retention and tested backups are separate controls.',
  'AZ-104 · storage protection',
);
q(
  'azure',
  'sas,storage,access',
  'What is a sound approach to a temporary storage SAS?',
  'Limit permissions, scope and lifetime, and protect the token.',
  [
    'Give every permission with no expiry.',
    'Publish the token in a public screenshot.',
    'Use it as a replacement for all monitoring.',
  ],
  'A SAS can grant data access. Restrict it to the task and manage its exposure and expiry deliberately.',
  'AZ-104 · storage access',
);
q(
  'azure',
  'vm,disk,compute,size',
  'Before resizing a production-like VM, what should the plan include?',
  'Workload requirements, supported sizes, cost, possible downtime and recovery checks.',
  [
    'Only the largest available size.',
    'A promise that every resize is outage-free.',
    'Deletion of all attached data disks.',
  ],
  'A resize affects capacity and may require interruption. Check compatibility, dependencies and the acceptance and rollback plan.',
  'AZ-104 · VM capacity',
);
q(
  'azure',
  'monitor,metrics,logs,baseline',
  'An application is slow. Why compare both metrics and logs?',
  'Metrics show measured trends; logs can explain events and failures around the same time.',
  [
    'They are identical copies of the same information.',
    'Logs always prove the root cause alone.',
    'Metrics remove the need for timestamps.',
  ],
  'Use correlated time windows and the correct resource. Different evidence types help test a hypothesis without immediately changing the system.',
  'AZ-104 · monitoring',
);
q(
  'azure',
  'backup,restore,recover',
  'Which result best demonstrates that a backup is useful?',
  'A permitted restore test followed by validation of the recovered workload.',
  [
    'A green backup-job label alone.',
    'The existence of a vault name.',
    'A screenshot from a different server.',
  ],
  'A completed backup job is useful evidence, but recoverability also depends on retention, permissions, dependencies and a validated restore.',
  'AZ-104 · backup and recovery',
);
q(
  'azure',
  'migrate,assessment,discovery,plan',
  'What comes before committing to a migration target size?',
  'Discover dependencies and assess workload demand and compatibility.',
  [
    'Choose the cheapest size without measurements.',
    'Delete the source server.',
    'Skip application-owner input.',
  ],
  'Assessment informs sizing, readiness and dependencies. Treat assumptions as items to verify before planning cutover.',
  'Azure migration practice · assessment',
);
q(
  'azure',
  'migration,cutover,rollback,plan',
  'What must be agreed before a migration cutover?',
  'Success checks, an outage window, owners and a rollback trigger.',
  [
    'Only the new server’s display name.',
    'A rule that rollback is forbidden.',
    'That replication means the application is already validated.',
  ],
  'A cutover changes the user’s service path. Agree how to validate it and when to restore the prior working route.',
  'Azure migration practice · cutover',
);
q(
  'azure',
  'migration,replication,test',
  'Does successful replication alone prove the migrated application works?',
  'No. Test boot, dependencies, identity, networking and the application’s user workflow.',
  [
    'Yes, replication proves every dependency.',
    'Yes, DNS can be ignored afterward.',
    'Only if a VM has a public IP.',
  ],
  'Replication copies or synchronizes data. Application validation must prove the complete intended service after the move.',
  'Azure migration practice · validation',
);
q(
  'azure',
  'policy,governance,landing',
  'How does Azure Policy differ from Azure RBAC?',
  'Policy evaluates or enforces resource conditions; RBAC controls who can perform actions.',
  [
    'Policy is a replacement for every user identity.',
    'RBAC only controls storage redundancy.',
    'They are the same feature with different colors.',
  ],
  'Use RBAC for access and Policy for governance rules. Their effects can combine, so inspect both when diagnosing a denied change.',
  'AZ-104 · governance',
);
q(
  'azure',
  'lock,delete,recovery',
  'Why should you inspect resource locks before planned deletion?',
  'A lock can block the operation even when RBAC grants permission.',
  [
    'A lock is a password for the VM.',
    'Locks create independent backups.',
    'A lock automatically approves deletion.',
  ],
  'Locks protect resources against certain changes. Removing one requires the appropriate authority and a reviewed plan, not a security workaround.',
  'AZ-104 · resource locks',
);
q(
  'azure',
  'update,maintenance,patch',
  'Why patch a representative pilot before a broad server wave?',
  'To catch compatibility and restart effects with limited impact.',
  [
    'To guarantee the other servers need no checks.',
    'To remove the need for backups.',
    'To install every optional change immediately.',
  ],
  'A pilot tests the change and its validation procedure. Expand only after the agreed checks pass and recovery remains available.',
  'Azure operations practice · update management',
);
q(
  'azure',
  'identity,secret,security',
  'What belongs in a private learning note about a connection failure?',
  'Sanitized error text, the target role, time and checks performed.',
  ['A private key.', 'An administrator password.', 'A reusable access token.'],
  'Useful troubleshooting evidence does not require storing authentication secrets. Remove secrets before saving or sharing screenshots.',
  'AZ-104 · secure administration',
);
q(
  'azure',
  'route,network,troubleshoot',
  'A destination is reachable from one subnet but not another. What should you compare?',
  'Effective routes, network rules, DNS results and the actual source/destination path.',
  [
    'Only the VM’s display icon.',
    'Unrelated storage filenames.',
    'Whether every firewall can be disabled.',
  ],
  'Differences between paths narrow the investigation. Collect effective configuration before making targeted changes.',
  'AZ-104 · network troubleshooting',
);

q(
  'windows',
  'dns,domain,ad ds',
  'Why must a domain client use the planned AD-aware DNS servers?',
  'It needs DNS service records to locate domain services.',
  [
    'DNS sets the client’s local administrator password.',
    'DNS replaces every domain controller.',
    'A public DNS server always contains private AD records.',
  ],
  'Active Directory depends on correct DNS discovery. Check the client’s resolver configuration and domain records before repeatedly attempting a join.',
  'AZ-802 · AD DS and DNS',
);
q(
  'windows',
  'replication,controller,dc02',
  'After adding DC02, what best demonstrates healthy replication?',
  'Current replication checks and relevant event evidence from the actual controllers.',
  [
    'The presence of a second desktop icon.',
    'An old screenshot showing DC01.',
    'Only a successful local administrator sign-in.',
  ],
  'A second VM existing is not evidence that directory replication works. Check the intended controllers, errors and recent timestamps.',
  'AZ-802 · AD DS replication',
);
q(
  'windows',
  'gpo,policy,users',
  'A GPO is linked, but one user does not receive it. What should you inspect?',
  'The object’s OU, link, filtering, inheritance and resultant policy evidence.',
  [
    'Delete every GPO.',
    'Disable the domain firewall on all servers.',
    'Assume linking proves application.',
  ],
  'Linking is only one condition. Scope and processing determine whether the policy applies to the intended user or computer.',
  'AZ-802 · Group Policy',
);
q(
  'windows',
  'users,group,access',
  'Why assign access through a suitable security group rather than repeatedly adding individual users?',
  'It makes membership and permission review more consistent.',
  [
    'It makes authentication unnecessary.',
    'It gives every member domain-admin rights automatically.',
    'It replaces file and application permission checks.',
  ],
  'Groups organize principals for authorization. Still select the correct group type, scope and least-privilege permissions.',
  'AZ-802 · security principals',
);
q(
  'windows',
  'dhcp,network,address',
  'What is the purpose of a DHCP reservation?',
  'Provide a planned client with a consistent address from the DHCP configuration.',
  [
    'Turn every address into a public address.',
    'Replace DNS records automatically in every environment.',
    'Bypass subnet planning.',
  ],
  'Reservations associate a client identifier with a configured address. Verify the scope and avoid conflicts.',
  'AZ-802 · IP addressing',
);
q(
  'windows',
  'vm,install,windows,dc01',
  'Why confirm Desktop Experience before following a lesson with desktop clicks?',
  'Server Core does not provide the same graphical desktop workflow.',
  [
    'Desktop Experience removes the need for updates.',
    'Server Core cannot run any server role.',
    'The choice only changes the VM’s public IP.',
  ],
  'The installation option changes the available management interface. Use the edition and installation mode required by the lesson.',
  'Windows lab practice · installation',
);
q(
  'windows',
  'backup,controller,recover',
  'Why does domain-controller recovery need a role-aware plan?',
  'Directory state, replication and supported recovery procedures matter beyond copying ordinary files.',
  [
    'Any desktop screenshot can restore AD DS.',
    'Copying one log file restores the whole domain.',
    'A controller never needs backup.',
  ],
  'Protect the appropriate system state and follow supported recovery procedures. Test the plan in an isolated permitted environment.',
  'AZ-802 · recovery planning',
);
q(
  'windows',
  'iis,application,helpdesk,install',
  'Where should the lab’s application and IIS role normally run?',
  'On the dedicated application-server VM identified by the course.',
  [
    'On a domain controller just because it is already logged in.',
    'Inside the physical host’s browser process.',
    'On any random VM with available disk space.',
  ],
  'Separating roles limits impact and keeps the lab’s identity, application and recovery boundaries clear.',
  'Windows application-server practice',
);
q(
  'windows',
  'iis,https,binding,certificate',
  'An IIS HTTPS binding uses the wrong site name. What should you check?',
  'The selected site, IP/port, host name, SNI choice and certificate name.',
  [
    'Only the screen resolution.',
    'Whether all root certificates can be deleted.',
    'Whether DNS can be ignored.',
  ],
  'A valid certificate must be bound to the intended endpoint, and the client’s requested name must be covered by the certificate.',
  'Windows IIS practice · HTTPS',
);
q(
  'windows',
  'service,application,troubleshoot',
  'A Windows service is Running. What still needs validation?',
  'The application’s intended user workflow and dependencies.',
  [
    'Nothing; Running proves every function.',
    'Only the taskbar color.',
    'Whether a different server has the same name.',
  ],
  'A service state describes a process, not every dependency or application outcome. Repeat the agreed acceptance test.',
  'AZ-802 · monitoring and troubleshooting',
);
q(
  'windows',
  'storage,share,permissions',
  'A user has share permission but cannot open a file over SMB. What else matters?',
  'The file’s NTFS permissions and other effective-access conditions.',
  [
    'Share permission always overrides every NTFS restriction.',
    'The user’s desktop background.',
    'Whether the file extension is uppercase.',
  ],
  'Network file access combines share and filesystem authorization, along with identity and access conditions. Inspect effective permissions.',
  'AZ-802 · file services',
);
q(
  'windows',
  'wsus,update,groups',
  'Why separate WSUS pilot and broad deployment computer groups?',
  'To stage approvals and observe impact before updating more machines.',
  [
    'To avoid all restarts forever.',
    'To bypass update validation.',
    'To make every server a domain controller.',
  ],
  'Deployment groups support controlled waves. Verify membership and policy before approving a change for a larger population.',
  'Windows update practice · WSUS',
);
q(
  'windows',
  'wsus,client,policy',
  'A client does not appear in the expected WSUS group. What should you investigate?',
  'Client policy, targeting method, reporting time and the actual server configured.',
  [
    'Approve all updates to every server.',
    'Disable domain authentication.',
    'Delete the client’s data disk.',
  ],
  'Incorrect targeting or policy can place clients in the wrong group or service. Confirm configuration and current reporting evidence first.',
  'Windows update practice · WSUS targeting',
);
q(
  'windows',
  'wsus,patch,reboot,maintain',
  'What should a controlled patching plan specify?',
  'Pilot scope, approvals, a maintenance window, restart ownership and post-update checks.',
  [
    'Only the download size.',
    'That an update never needs recovery.',
    'That all users should remain unaware of planned downtime.',
  ],
  'Patching can affect availability. Plan who acts, when the change happens and how success or rollback is determined.',
  'Windows update practice · maintenance',
);
q(
  'windows',
  'dmz,proxy,isolation,network',
  'Why avoid domain-joining an exposed proxy merely for convenience?',
  'It can unnecessarily expand the identity and trust boundary.',
  [
    'A workgroup proxy cannot send any network traffic.',
    'Domain membership is a substitute for firewall rules.',
    'It makes every backend certificate trusted.',
  ],
  'Keep exposed and trusted zones deliberately separated. Grant only the connectivity and identities required by the approved design.',
  'Windows DMZ practice · isolation',
);
q(
  'windows',
  'dmz,firewall,port,network',
  'Which firewall request is easiest to review and validate?',
  'A named source, destination, direction, protocol, port and purpose.',
  [
    'Allow everything everywhere.',
    'Any rule with an unfamiliar name.',
    'A rule with no owner or expiry review.',
  ],
  'Specific flows make least-privilege access and troubleshooting practical. Validate both allowed and deliberately blocked paths.',
  'AZ-802 · network security',
);
q(
  'windows',
  'migration,domain,dns,trust',
  'Does a trust between domains automatically migrate users and their data?',
  'No. Trust and migration are separate tasks.',
  [
    'Yes, every account and profile moves instantly.',
    'Yes, including every application secret.',
    'Only if both domains have the same wallpaper.',
  ],
  'A trust can support authentication between scopes. Migration still requires explicit identity, data, application and permission planning.',
  'Windows migration practice',
);
q(
  'windows',
  'powershell,identity,remote',
  'How can you avoid running a Windows command on the wrong host?',
  'Check hostname, whoami and the current session context before changing anything.',
  [
    'Assume every PowerShell tab is remote.',
    'Use the first open tab without checking.',
    'Rename every host to the same name.',
  ],
  'A PowerShell prompt can be local or remote. Verify identity and target, and use the workspace named in the lesson.',
  'AZ-802 · remote management',
);
q(
  'windows',
  'baseline,logs,recovery',
  'Why preserve logs and a starting baseline before troubleshooting changes?',
  'They help compare states and test whether the change caused the symptom.',
  [
    'They guarantee no outage can happen.',
    'They replace all backups.',
    'They authorize every possible change.',
  ],
  'Baseline and timestamped evidence make reasoning and handoff more reliable. Preserve the original evidence before rotating or editing it.',
  'AZ-802 · monitoring and troubleshooting',
);
q(
  'windows',
  'hyper-v,snapshot,vm,checkpoint',
  'A VM checkpoint exists. Which claim is unsafe?',
  'It guarantees recovery if the underlying storage is lost.',
  [
    'It is a point-in-time recovery mechanism.',
    'Its suitability depends on workload and checkpoint type.',
    'Its retention and cleanup require planning.',
  ],
  'Checkpoints depend on the VM’s storage chain. Use independent backups and workload-appropriate recovery tests as well.',
  'AZ-802 · VM checkpoints',
);

q(
  'pki',
  'csr,request,key',
  'Which item is normally submitted to the PKI team for signing?',
  'The checked CSR and required request details.',
  [
    'The private key.',
    'The root CA’s private key.',
    'The server administrator’s password.',
  ],
  'A CSR carries public request information. Keep the server’s private key protected and provide the name and approval details required by the PKI team.',
  'Certificate practice · CSR handoff',
);
q(
  'pki',
  'root,intermediate,chain,trust',
  'What is the usual job of an intermediate CA?',
  'Issue certificates beneath a trusted root in the certificate hierarchy.',
  [
    'Act as the website’s private key.',
    'Replace every server certificate.',
    'Turn an expired leaf certificate into a valid one.',
  ],
  'An intermediate links the issuing path to a root trust anchor. The website still needs its own valid leaf certificate and key.',
  'Certificate practice · chain roles',
);
q(
  'pki',
  'root,trust,store',
  'When should a private root CA certificate be added to a client trust store?',
  'After verifying its identity and receiving approval to trust that CA.',
  [
    'Whenever any website asks.',
    'To hide a certificate-name mismatch.',
    'Instead of checking the server certificate’s expiry.',
  ],
  'Adding a root changes what the client trusts. Verify the CA through an approved independent channel and install it only in the intended store.',
  'Certificate practice · trust decisions',
);
q(
  'pki',
  'san,name,validate,https',
  'The browser requests helpdesk.lab.example.test. What must the server certificate cover?',
  'That exact hostname through an appropriate subject alternative name.',
  [
    'Only the administrator’s username.',
    'Only the VM’s private IP when the browser uses a DNS name.',
    'Any unrelated hostname from the same organization.',
  ],
  'Name validation uses the requested service identity. Trust and a valid date do not compensate for a name mismatch.',
  'Certificate practice · name validation',
);
q(
  'pki',
  'chain,install,intermediate,nginx',
  'What should a typical server-sent certificate chain include?',
  'The server leaf certificate and the required intermediate certificates in the appropriate order.',
  [
    'Every private key in the organization.',
    'Only an unrelated root certificate.',
    'An expired leaf to keep the old application running.',
  ],
  'Clients need a path from the leaf through the issuing intermediates to a trusted anchor. Follow the product’s chain-file or store requirements.',
  'Certificate practice · chain installation',
);
q(
  'pki',
  'key,match,install',
  'Why compare the certificate’s public key with the key used for its CSR?',
  'To verify the returned certificate belongs with the intended private key.',
  [
    'To upload the private key to a public checker.',
    'To remove the certificate’s expiry.',
    'To change its subject names.',
  ],
  'A certificate and an unrelated private key do not form the required server identity pair. Use local checks and do not expose private material.',
  'Certificate practice · key matching',
);
q(
  'pki',
  'expiry,renew,maintain',
  'When should renewal planning begin?',
  'Before expiry, allowing time for approval, installation, validation and rollback.',
  [
    'Only after every client connection fails.',
    'After deleting the old key without a replacement.',
    'Never, if the certificate was once trusted.',
  ],
  'Issuance and deployment can take time. Track owners, service names, expiry and reminder dates, then validate the replacement before closing the change.',
  'Certificate practice · renewal',
);
q(
  'pki',
  'nginx,config,install,rollback',
  'After preparing an NGINX certificate change, which sequence is sound?',
  'Test configuration, apply the approved reload, then verify the served HTTPS certificate.',
  [
    'Reload first and never inspect the result.',
    'Delete the old configuration before making a recovery copy.',
    'Disable validation to avoid a failed test.',
  ],
  'A configuration test and a live endpoint test check different things. Keep a reviewed rollback path and verify the actual certificate served.',
  'NGINX certificate practice',
);
q(
  'pki',
  'iis,store,private key,install',
  'Why can a certificate appear in a Windows store but be unusable for a server binding?',
  'The intended private key may be missing or inaccessible to the service.',
  [
    'Every imported certificate automatically gains its original private key.',
    'The store deletes all subject names.',
    'IIS never uses private keys.',
  ],
  'Importing a public certificate does not recreate a missing private key. Check key association, machine/user store and service access.',
  'Windows certificate practice',
);
q(
  'pki',
  'csr,details,request',
  'What should be checked before sending a CSR?',
  'Requested names, key parameters, intended usage and the approved request information.',
  [
    'Only the file’s icon.',
    'Whether it contains an administrator password.',
    'Whether it was renamed from any text file.',
  ],
  'Review the decoded request locally. Catch incorrect names and parameters before the certificate is issued.',
  'Certificate practice · request review',
);
q(
  'pki',
  'https,validate,troubleshoot',
  'A certificate file on disk is current, but clients see an expired certificate. What is a likely next check?',
  'Inspect which endpoint, binding or proxy is actually serving the connection.',
  [
    'Assume the disk file proves the live connection changed.',
    'Delete all trusted roots.',
    'Ignore the browser’s requested hostname.',
  ],
  'A load balancer, proxy, alternate binding or unreloaded process can serve a different certificate. Inspect the actual service path.',
  'Certificate practice · live validation',
);
q(
  'pki',
  'expiry,time,validate',
  'Why check system time when investigating a not-yet-valid certificate?',
  'Certificate validity is evaluated against time.',
  [
    'Changing the date is a proper way to renew a certificate.',
    'Time removes the need for a trusted issuer.',
    'Time changes the certificate’s subject names.',
  ],
  'Correct the clock through the approved time configuration and inspect the certificate’s dates. Do not move the clock merely to bypass validation.',
  'Certificate practice · validity dates',
);
q(
  'pki',
  'rollback,renew,backup',
  'What should a certificate rollback plan identify?',
  'The prior working configuration and protected key/certificate material, restore steps and validation checks.',
  [
    'Only the new certificate’s filename.',
    'A public copy of the private key.',
    'An instruction to disable HTTPS permanently.',
  ],
  'Rollback must restore a known working configuration without exposing secrets. Confirm that the prior certificate remains suitable and permitted.',
  'Certificate practice · rollback',
);
q(
  'pki',
  'pem,der,pfx,format',
  'What can a password-protected PFX contain?',
  'A certificate, its private key and optionally certificate-chain material.',
  [
    'Only a public DNS record.',
    'Only a server’s IP address.',
    'A guarantee that any importer is authorized.',
  ],
  'PFX/PKCS#12 can transport private-key material. Protect it, limit access and follow approved import and cleanup procedures.',
  'Certificate practice · file formats',
);
q(
  'pki',
  'practice,ca,root',
  'Where should a training CA’s root be trusted?',
  'Only in the explicitly approved practice trust boundary.',
  [
    'On all personal and work devices by default.',
    'In every production domain without approval.',
    'Inside public DNS instead of certificate stores.',
  ],
  'A practice CA is for the lab. Trust anchors affect authentication decisions and must not silently spread into unrelated environments.',
  'Certificate practice · practice CA scope',
);
q(
  'pki',
  'validate,check,chain',
  'Which combination best demonstrates successful HTTPS deployment?',
  'Correct name, valid dates, trusted chain, intended certificate and a working application request.',
  [
    'A successful file upload alone.',
    'A green text label in a tutorial.',
    'A restart without any client test.',
  ],
  'Validate both the TLS identity and the application outcome from the intended client path. Preserve sanitized evidence of the result.',
  'Certificate practice · acceptance checks',
);

q(
  'mecm',
  'collection,device,target',
  'Why preview collection membership before deploying an application?',
  'To confirm the intended devices are targeted.',
  [
    'To authorize deployment to every device.',
    'To remove the need for a pilot.',
    'To replace application detection rules.',
  ],
  'Collections define deployment scope. Validate membership, exclusions and a pilot before broad distribution.',
  'Configuration Manager · collections',
);
q(
  'mecm',
  'boundary,content,distribution',
  'A client cannot find content. Which configuration is relevant?',
  'Boundary groups, content distribution and the client’s selected content location.',
  [
    'Only the server’s wallpaper.',
    'The domain’s password history length alone.',
    'The certificate renewal reminder text.',
  ],
  'Content retrieval depends on location and availability. Verify the client’s effective boundary group and that the required content reached a suitable distribution point.',
  'Configuration Manager · content',
);
q(
  'mecm',
  'detection,app,deploy',
  'What is an application detection method used for?',
  'Determine whether the specified application state is already present.',
  [
    'Create every required firewall rule.',
    'Guarantee an installer is safe.',
    'Replace the uninstall command.',
  ],
  'Detection drives compliance and deployment decisions. Test both installed and absent states using an appropriate, reliable indicator.',
  'Configuration Manager · applications',
);
q(
  'mecm',
  'heartbeat,client,health',
  'Does a recent heartbeat alone prove the client can install an application?',
  'No. Policy, content, execution and detection need separate checks.',
  [
    'Yes, every component is proven healthy.',
    'Yes, including application compatibility.',
    'Only if the console shows a device name.',
  ],
  'Heartbeat is one health signal. Follow the actual deployment path and inspect the relevant logs and outcomes.',
  'Configuration Manager · client health',
);
q(
  'mecm',
  'maintenance,window,reboot',
  'What is the role of a maintenance window?',
  'Constrain when permitted deployments and related activity may run under the configured rules.',
  [
    'Guarantee no restart ever occurs.',
    'Approve every application automatically.',
    'Replace backup and recovery planning.',
  ],
  'Windows affect scheduling but must be understood with deployment deadlines, restart behavior and the organization’s change plan.',
  'Configuration Manager · maintenance',
);
q(
  'mecm',
  'sup,update,wsus',
  'What does a software update point contribute to update management?',
  'Update synchronization and client update-scanning integration for the configured site.',
  [
    'An automatic replacement for all distribution points.',
    'A guarantee every update installs successfully.',
    'A replacement for device targeting.',
  ],
  'Synchronization, scanning, content distribution, deployment and installation are separate stages. Diagnose the stage that failed.',
  'Configuration Manager · software updates',
);
q(
  'mecm',
  'baseline,compliance,remediate',
  'Before enabling automatic remediation in a compliance baseline, what should you do?',
  'Test detection and the remediation change on a representative pilot.',
  [
    'Apply it to all servers immediately.',
    'Assume every noncompliant value is safe to change.',
    'Remove the rollback procedure.',
  ],
  'Detection can be wrong and remediation changes configuration. Review scope, side effects and recovery before broad enforcement.',
  'Configuration Manager · compliance',
);
q(
  'mecm',
  'site,install,prerequisite',
  'Why resolve prerequisite-check failures before site installation?',
  'They identify unsupported or missing dependencies that can prevent a reliable installation.',
  [
    'They only change console colors.',
    'They prove the server should be a domain controller.',
    'They eliminate the need for capacity planning.',
  ],
  'Use supported prerequisites and record the selected versions. Do not bypass a failure without an approved, documented reason.',
  'Configuration Manager · site preparation',
);
q(
  'mecm',
  'client,enroll,pilot',
  'What should a test-client enrollment verify?',
  'Correct site assignment, policy retrieval and the intended management path.',
  [
    'Only the presence of a desktop shortcut.',
    'That every software package is installed.',
    'That updates can never fail.',
  ],
  'A client install is not the complete enrollment outcome. Confirm site identity and current communication before trusting deployments.',
  'Configuration Manager · clients',
);
q(
  'mecm',
  'app,uninstall,rollback',
  'Why test an uninstall command before production deployment?',
  'It can be part of a safe application rollback or removal plan.',
  [
    'It guarantees no user data can be affected.',
    'It substitutes for installation detection.',
    'It approves every future version.',
  ],
  'Test removal, exit codes, application behavior and data handling on a permitted pilot. Keep a suitable recovery plan.',
  'Configuration Manager · application recovery',
);
q(
  'mecm',
  'migration,move,plan',
  'Before moving a Configuration Manager role, what must be understood?',
  'Dependencies, supported migration paths, client impact and recovery.',
  [
    'Only the role’s display name.',
    'That copying one folder migrates all site state.',
    'That clients require no validation after a move.',
  ],
  'A site role has databases, content, certificates, identities and clients that may depend on it. Plan and validate the supported transition.',
  'Configuration Manager · role migration',
);
q(
  'mecm',
  'logs,troubleshoot,operations',
  'A deployment fails on one pilot. What evidence helps most?',
  'The deployment identity, timestamps, client logs, exit code and detection result.',
  [
    'A screenshot from an unrelated client.',
    'A claim that the installer usually works.',
    'Deleting the client’s logs before review.',
  ],
  'Correlate evidence for the same device and deployment. Distinguish download, execution, restart and detection failures.',
  'Configuration Manager · troubleshooting',
);

q(
  'splunk',
  'index,upload,data',
  'What does an index organize in Splunk?',
  'Stored searchable event data.',
  [
    'The operating system’s user passwords.',
    'Only dashboard colors.',
    'A list of every browser tab.',
  ],
  'Indexes organize event storage and search scope. Use the intended training index and appropriate permissions.',
  'Splunk Core User · data',
);
q(
  'splunk',
  'sourcetype,upload,parse',
  'Why choose the appropriate sourcetype?',
  'It helps Splunk interpret and label the data format correctly.',
  [
    'It creates an administrator account.',
    'It guarantees every event is trustworthy.',
    'It replaces the search time range.',
  ],
  'Sourcetype influences parsing and field behavior. Confirm timestamp and event boundaries when importing practice data.',
  'Splunk Core User · data inputs',
);
q(
  'splunk',
  'time,search,events',
  'A search returns no results. What quick check should you make?',
  'The time range and intended index, before concluding that no data exists.',
  [
    'Delete the index.',
    'Disable all access control.',
    'Assume an empty result proves the system is secure.',
  ],
  'An empty result may reflect scope, time, syntax or ingestion issues. Check the search context before making changes.',
  'Splunk Core User · search',
);
q(
  'splunk',
  'stats,aggregate,count',
  'What does stats count by host produce?',
  'An event count grouped by host for the current search results.',
  [
    'A reboot of every host.',
    'A list of file permissions.',
    'A proof that every host is uncompromised.',
  ],
  'stats summarizes the events currently in scope. The result depends on the search and time range.',
  'Splunk Core User · statistics',
);
q(
  'splunk',
  'table,fields,search',
  'What is table useful for in an SPL search?',
  'Display selected fields as columns.',
  [
    'Create a database backup.',
    'Install a forwarder automatically.',
    'Rewrite every original event.',
  ],
  'table changes the presentation of selected search results. Confirm that the fields exist and suit the question you are answering.',
  'Splunk Core User · fields',
);
q(
  'splunk',
  'dashboard,panel,report',
  'What should a dashboard panel make clear?',
  'The question it answers, its filters and time range.',
  [
    'Only a visually impressive chart.',
    'That every displayed count is live forever.',
    'A private key used to load the data.',
  ],
  'Clear scope makes a visualization interpretable. A chart without time and filter context can mislead the learner.',
  'Splunk Core User · dashboards',
);
q(
  'splunk',
  'lookup,fields,enrich',
  'What is a lookup commonly used for?',
  'Add related information to matching event fields.',
  [
    'Change every server’s hostname.',
    'Replace all raw event storage.',
    'Automatically prove an event is malicious.',
  ],
  'Lookups enrich results using a defined relationship. Validate keys, types and unmatched values.',
  'Splunk Core User · lookups',
);
q(
  'splunk',
  'alert,schedule,report',
  'What should be tested before enabling a scheduled alert?',
  'The search, time window, trigger condition and expected notification behavior.',
  [
    'Only its icon.',
    'That it includes every event forever.',
    'Whether all false positives can be ignored.',
  ],
  'An alert is a search and decision process run on a schedule. Test matching and nonmatching cases and account for repeated triggers.',
  'Splunk practice · scheduled searches',
);
q(
  'splunk',
  'investigate,auth,security',
  'Several failures followed by a success from one source are observed. What is justified?',
  'Investigate the sequence and correlate identity, source and time; it is not proof by itself.',
  [
    'Immediately claim a confirmed breach without other evidence.',
    'Delete the successful event.',
    'Assume all failures are harmless.',
  ],
  'Event patterns support hypotheses. Correlate additional evidence and document uncertainty before drawing a conclusion.',
  'Splunk investigation practice',
);
q(
  'splunk',
  'filter,search,scope',
  'Why begin a search with a narrow, relevant scope?',
  'Reduce unrelated events and make the question easier to investigate.',
  [
    'Guarantee no relevant event can ever be missed.',
    'Remove the need to verify the time range.',
    'Grant extra access automatically.',
  ],
  'Scope improves relevance and efficiency, but you must review whether filters exclude needed evidence.',
  'Splunk Core User · search scope',
);
q(
  'splunk',
  'export,evidence,report',
  'What should a saved investigation result include?',
  'The search text, time range, relevant fields and the meaning of the result.',
  [
    'Only a cropped number without context.',
    'The administrator’s password.',
    'A statement that the result never changes.',
  ],
  'Reproducible evidence needs enough context to understand how it was obtained and what it supports.',
  'Splunk practice · evidence',
);
q(
  'splunk',
  'input,dashboard,token',
  'A dashboard input changes a panel’s result. What should you verify?',
  'The token/filter mapping and that the panel uses the intended value.',
  [
    'That every panel ignores input values.',
    'Only the dashboard’s title font.',
    'That a changed count proves a security incident.',
  ],
  'Inputs affect searches through configured values. Test representative selections and empty or default states.',
  'Splunk dashboard practice',
);

q(
  'vsphere',
  'vcenter,host,esxi',
  'Which component centrally manages multiple ESXi hosts?',
  'vCenter Server.',
  ['A guest’s text editor.', 'A single VMDK file.', 'The Windows Start menu.'],
  'vCenter provides central inventory and management. ESXi runs VMs on an individual host.',
  'vSphere fundamentals · management roles',
);
q(
  'vsphere',
  'datastore,storage,disk',
  'What is a datastore?',
  'A storage container used for VM files and related objects.',
  [
    'A guest operating-system account.',
    'A DNS forwarding rule.',
    'A replacement for all backups.',
  ],
  'A datastore is the virtualization storage location. Guest filesystems and virtual disks are separate layers.',
  'vSphere fundamentals · storage',
);
q(
  'vsphere',
  'port group,network,vlan',
  'What does a VM’s selected port group represent?',
  'A configured virtual network connection choice.',
  [
    'A datastore folder.',
    'The VM’s administrator password.',
    'The application’s certificate issuer.',
  ],
  'Port groups define network attachment and associated settings. Verify the intended switch, VLAN and uplink design.',
  'vSphere fundamentals · networking',
);
q(
  'vsphere',
  'template,clone,deploy',
  'Why use a reviewed VM template?',
  'Create consistent new VMs from an approved starting configuration.',
  [
    'Share one machine identity across every clone without preparation.',
    'Avoid patching forever.',
    'Replace every application acceptance test.',
  ],
  'Templates improve consistency. Still apply the required customization, identity, network settings and post-deployment checks.',
  'vSphere fundamentals · templates',
);
q(
  'vsphere',
  'snapshot,backup,rollback',
  'Why should snapshots be monitored and cleaned up under a plan?',
  'They consume resources and depend on the VM’s storage chain.',
  [
    'They are always independent backups.',
    'They never grow.',
    'They make datastore capacity irrelevant.',
  ],
  'Snapshots are temporary recovery mechanisms with storage and performance implications. Follow supported consolidation and backup procedures.',
  'vSphere fundamentals · snapshots',
);
q(
  'vsphere',
  'host,connect,certificate',
  'Before adding an ESXi host to management, what should be verified?',
  'The intended host identity, access, network prerequisites and certificate trust.',
  [
    'Only its label in a spreadsheet.',
    'That every warning can be ignored.',
    'That its datastore is empty.',
  ],
  'Adding a host changes management scope. Verify the correct server and the approved trust and access path.',
  'vSphere fundamentals · host onboarding',
);
q(
  'vsphere',
  'capacity,datastore,monitor',
  'Why monitor datastore free space before growing VMs?',
  'VM disks, snapshots and related operations need adequate capacity.',
  [
    'Free space never affects VM operations.',
    'It proves backups are restorable.',
    'It automatically sizes guest filesystems.',
  ],
  'Plan growth across the storage layers and leave suitable operational headroom. Monitor actual usage and alarms.',
  'vSphere fundamentals · capacity',
);
q(
  'vsphere',
  'ha,availability,cluster',
  'Does a highly available VM remove the need for application backups?',
  'No. Availability and data recovery solve different problems.',
  [
    'Yes, HA preserves every deleted record.',
    'Yes, a restart recreates every lost file.',
    'Only if the VM has two network adapters.',
  ],
  'Host-level recovery can improve availability but does not substitute for independent backups and tested application recovery.',
  'vSphere fundamentals · availability',
);
q(
  'vsphere',
  'permission,role,access',
  'What is a good vSphere permission design for a limited operator?',
  'A suitable role scoped to the required inventory objects.',
  [
    'Administrator permissions everywhere for everyone.',
    'A shared untracked login.',
    'No audit trail for changes.',
  ],
  'Scope and role determine access. Grant the permissions needed for the task and retain accountability.',
  'vSphere fundamentals · permissions',
);
q(
  'vsphere',
  'vm,tools,guest',
  'What should be checked after deploying a VM from a template?',
  'Identity, networking, guest integration, updates and the intended workload.',
  [
    'Only whether the power icon is green.',
    'Whether all clones use the same hostname.',
    'Whether the template’s old IP remains on every VM.',
  ],
  'A powered-on VM is not a completed application deployment. Validate the guest and service configuration.',
  'vSphere fundamentals · VM deployment',
);
q(
  'vsphere',
  'migration,vmotion,network',
  'What should be confirmed before a planned VM migration?',
  'The supported prerequisites, destination capacity, network compatibility and recovery plan.',
  [
    'That any two random hosts are compatible.',
    'Only the VM’s display name.',
    'That application validation can be skipped.',
  ],
  'Migration behavior depends on the environment and feature. Check the required compatibility and repeat the workload acceptance test afterward.',
  'vSphere fundamentals · migration planning',
);
q(
  'vsphere',
  'maintenance,host,evacuate',
  'Before host maintenance, what must the plan account for?',
  'The running workloads, evacuation or shutdown path, capacity and return-to-service checks.',
  [
    'Only the host’s desktop wallpaper.',
    'That every VM can be stopped without an owner.',
    'That maintenance mode creates a backup.',
  ],
  'Host work can affect many guests. Coordinate ownership, supported migration or shutdown steps and application validation.',
  'vSphere fundamentals · host operations',
);

q(
  'nessus',
  'scope,scan,target',
  'What is required before scanning a network target?',
  'Explicit permission and a defined target scope.',
  [
    'Only knowing an IP address.',
    'A guess that the server is unused.',
    'A public internet search result.',
  ],
  'Scanning must be authorized. Define targets, timing, ownership and any operational restrictions before sending scan traffic.',
  'Nessus practice · authorization',
);
q(
  'nessus',
  'credential,scan,auth',
  'Why can an authenticated scan reveal more than an unauthenticated scan?',
  'Permitted credentials allow inspection of additional local state.',
  [
    'It automatically grants unlimited authorization.',
    'It removes the need to protect credentials.',
    'It proves every finding is exploitable.',
  ],
  'Authenticated checks can inspect software and configuration more directly. Use approved least-privilege credentials and protect them.',
  'Nessus practice · credentials',
);
q(
  'nessus',
  'plugin,update,prepare',
  'Why record the scanner and plugin versions?',
  'Results depend partly on the checks available when the scan ran.',
  [
    'Versions determine the target’s password.',
    'The oldest feed is always best.',
    'Version notes replace the scan scope.',
  ],
  'Scanner and feed versions provide context for interpreting and reproducing results.',
  'Nessus practice · scanner readiness',
);
q(
  'nessus',
  'false positive,validate,finding',
  'A severe finding appears. What comes before claiming confirmed impact?',
  'Validate the evidence, target identity, applicability and relevant service state.',
  [
    'Delete the report.',
    'Assume the score proves exploitation occurred.',
    'Apply every possible fix without review.',
  ],
  'A finding is evidence to investigate. Confirm that the condition applies and plan an appropriate remediation and validation.',
  'Nessus practice · finding validation',
);
q(
  'nessus',
  'safe,policy,scan',
  'Why review a scan policy’s settings before use?',
  'Some checks and scan loads may affect a target’s availability.',
  [
    'All scans are guaranteed harmless.',
    'A policy replaces permission.',
    'A scan never contacts the target.',
  ],
  'Match policy and intensity to the approved environment. Use safe, permitted settings and coordinate impact.',
  'Nessus practice · policy selection',
);
q(
  'nessus',
  'target,dns,scope',
  'Why verify a hostname’s resolved address before scanning?',
  'DNS may resolve to a different or out-of-scope server.',
  [
    'It makes authentication unnecessary.',
    'It turns a public host into a private lab.',
    'It proves all ports are open.',
  ],
  'Authorization applies to the approved target, not any address a stale name happens to return.',
  'Nessus practice · target identity',
);
q(
  'nessus',
  'report,evidence,export',
  'What context should accompany an exported scan result?',
  'Target scope, time, policy, scanner/feed details and sanitized evidence.',
  [
    'Only a total vulnerability count.',
    'The credential password.',
    'A screenshot of an unrelated scan.',
  ],
  'Context helps reviewers interpret findings and reproduce the assessment without exposing authentication secrets.',
  'Nessus practice · reporting',
);
q(
  'nessus',
  'remediate,rescan,validate',
  'How should a remediation be checked?',
  'Repeat the relevant authorized checks and validate the application still works.',
  [
    'Assume installing an update closes every finding.',
    'Delete the finding from a report only.',
    'Skip the target’s identity check on rescan.',
  ],
  'Verify both the original security condition and the operational outcome after the change.',
  'Nessus practice · remediation validation',
);
q(
  'nessus',
  'install,service,scanner',
  'A scanner web page does not load. What should be checked in order?',
  'The intended host, service, listener and approved network path.',
  [
    'Disable every security control immediately.',
    'Reinstall the guest without reading logs.',
    'Assume the browser is always the cause.',
  ],
  'Layered checks distinguish a stopped service, wrong address, listener issue and network restriction before changes.',
  'Nessus practice · troubleshooting',
);
q(
  'nessus',
  'risk,cvss,prioritize',
  'Should a severity score be the only remediation priority?',
  'No. Also consider exposure, exploitability, asset importance and compensating controls.',
  [
    'Yes, business context is irrelevant.',
    'Yes, every low score can be ignored forever.',
    'Only if the report has many pages.',
  ],
  'Severity is an input to risk decisions. Use the actual environment and document the rationale.',
  'Nessus practice · prioritization',
);
q(
  'nessus',
  'windows,linux,prepare',
  'Why keep the scanner separate from a domain controller in this lab?',
  'To keep scanning software and workload impact outside the domain-controller role.',
  [
    'A domain controller cannot use networking.',
    'A separate scanner authorizes all targets.',
    'It removes the need for patching.',
  ],
  'Role separation limits impact and makes recovery and access boundaries easier to understand.',
  'Nessus practice · deployment boundaries',
);
q(
  'nessus',
  'credential,failure,logs',
  'A credentialed check fails. What should be investigated?',
  'The approved account, target policy, connectivity and scanner diagnostic evidence.',
  [
    'Publish the password so others can test it.',
    'Grant permanent domain-admin rights without review.',
    'Treat the failure as proof that the host has no vulnerabilities.',
  ],
  'Authentication failure limits the checks that ran. Diagnose the cause and clearly report the resulting coverage limitation.',
  'Nessus practice · authenticated coverage',
);

q(
  'sql',
  'backup,restore,recover',
  'What best proves that a SQL Server backup supports recovery?',
  'A permitted restore test followed by database and application validation.',
  [
    'A backup filename alone.',
    'An old console screenshot.',
    'A successful browser refresh.',
  ],
  'A backup job can complete while the recovery plan still lacks required files, permissions or restore steps. Test the actual recovery path.',
  'SQL Server practice · recovery',
);
q(
  'sql',
  'log,recovery model,backup',
  'Why must the database recovery model be understood before planning log backups?',
  'It affects the supported backup and recovery approach.',
  [
    'It only changes the database icon.',
    'It makes all backups unnecessary.',
    'It determines the server’s public IP.',
  ],
  'The recovery model and backup chain influence point-in-time recovery options and log management.',
  'SQL Server practice · recovery models',
);
q(
  'sql',
  'ha,availability,backup',
  'Does a secondary replica replace a backup strategy?',
  'No. Replication can also propagate unwanted changes.',
  [
    'Yes, accidental deletion cannot reach it.',
    'Yes, backups are forbidden with HA.',
    'Only if both servers have the same name.',
  ],
  'High availability and independent historical recovery address different risks. Plan and test both.',
  'SQL Server practice · availability',
);
q(
  'sql',
  'listener,ha,connection',
  'Why test an application through the intended SQL listener or connection name?',
  'That is the path users will rely on during normal operation and failover.',
  [
    'Direct connection to one replica proves every path.',
    'The listener replaces database permissions.',
    'It avoids the need to test DNS.',
  ],
  'Validate the client’s actual endpoint, DNS, authentication and database behavior rather than only an individual instance.',
  'SQL Server practice · client connectivity',
);
q(
  'sql',
  'install,service,identity',
  'Why choose a suitable SQL Server service account deliberately?',
  'It defines the service’s identity and permitted access to required resources.',
  [
    'It should always be a shared domain administrator.',
    'It removes the need for database logins.',
    'Its password should be saved in a public runbook.',
  ],
  'Use supported service-account practices and least privilege. Confirm required filesystem and network access without excessive rights.',
  'SQL Server practice · service identity',
);
q(
  'sql',
  'port,network,connect',
  'A client cannot connect to SQL Server. What should you verify before broadening firewall rules?',
  'The intended instance, actual listener, name resolution, authentication and existing path.',
  [
    'Open every inbound port.',
    'Disable all domain policy.',
    'Delete the database.',
  ],
  'Connection failures can occur at several layers. Identify the failed layer and apply the smallest appropriate correction.',
  'SQL Server practice · connectivity',
);
q(
  'sql',
  'failover,ha,validate',
  'What should a planned failover test include?',
  'Application acceptance checks, data state and a documented return or recovery path.',
  [
    'Only watching the primary label move.',
    'A guarantee that users never need reconnection logic.',
    'Deletion of the former primary.',
  ],
  'Role changes alone do not prove service success. Validate the application path and data expectations after the transition.',
  'SQL Server practice · failover',
);
q(
  'sql',
  'storage,capacity,disk',
  'Why monitor database and log storage separately?',
  'They have different growth and recovery roles and either can exhaust its available space.',
  [
    'The log never grows.',
    'A large data disk prevents every log-space issue.',
    'Disk space is unrelated to availability.',
  ],
  'Track actual growth, free space and recovery requirements. Do not delete live database or log files to create room.',
  'SQL Server practice · capacity',
);
q(
  'sql',
  'permission,login,security',
  'Why distinguish a server login from a database user?',
  'They apply at different identity and authorization scopes.',
  [
    'They are always the same object.',
    'A login automatically grants every database permission.',
    'A database user defines network routing.',
  ],
  'Server authentication and database access are related but separate. Map identities correctly and grant the required roles or permissions.',
  'SQL Server practice · access',
);
q(
  'sql',
  'integrity,restore,check',
  'Why validate database integrity after a recovery rehearsal?',
  'To check the recovered database state as well as whether the restore command completed.',
  [
    'Restore success always proves every table is correct.',
    'Integrity checking creates missing backups automatically.',
    'It removes the need for application tests.',
  ],
  'Recovery acceptance combines the restore sequence, integrity checks and application-level validation.',
  'SQL Server practice · recovery validation',
);
q(
  'sql',
  'witness,quorum,ha',
  'Why must quorum behavior be understood in a clustered availability design?',
  'It affects which cluster membership can continue operating during failures.',
  [
    'It stores every SQL backup.',
    'It replaces the database’s transaction log.',
    'It guarantees zero data loss in every mode.',
  ],
  'Cluster membership and quorum influence availability. Review supported topology and failure scenarios without treating a witness as a backup.',
  'SQL Server practice · cluster availability',
);
q(
  'sql',
  'update,maintenance,rollback',
  'Before patching a SQL Server lab, what should be ready?',
  'A reviewed compatibility, backup, outage, validation and recovery plan.',
  [
    'Only the installer filename.',
    'A rule to ignore application owners.',
    'Deletion of all prior recovery information.',
  ],
  'Patching changes database infrastructure. Use a representative test, follow supported procedures and verify the original service afterward.',
  'SQL Server practice · maintenance',
);

fs.mkdirSync('content/assessments', { recursive: true });
fs.writeFileSync(
  'content/assessments/questions.json',
  JSON.stringify(rows, null, 2) + '\n',
);
console.log(
  `Authored ${rows.length} original supplemental practice questions.`,
);
