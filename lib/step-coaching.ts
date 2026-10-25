/**
 * Contextual teaching notes for SONIC Academy's existing lab instructions.
 *
 * These notes explain the intention and effects of an authored step. They do
 * not replace the authored action, original command, expected outcome,
 * prerequisite, screenshot, evidence or rollback, and do not claim execution.
 */
export type StepCoaching = {
  reason: string;
  impact: string;
  commandNotes: string[];
  specific: boolean;
};

type Topic = {
  find: RegExp;
  reason: string;
  impact: string;
};

// Order is intentional: a specific check takes priority over broad concepts.
const topics: Topic[] = [
  { find: /subnet ip|subnet mask|10\.50\.0\.0|255\.255\.255\.0/i, reason: '10.50.0.0 names our lab network. The mask 255.255.255.0 makes it a /24 network: DC01 at 10.50.0.10 and DC02 at 10.50.0.11 can share it. Keep both servers on VMnet2.', impact: 'Saving these values defines the private network. It does not give the servers their addresses; you set each server’s address in its Windows network settings later.' },
  { find: /use local dhcp|disable dhcp|dhcp.*off|dhcp.*clear/i, reason: 'DHCP hands out IP addresses automatically. We turn VMware DHCP off on VMnet2 so each practice server keeps the address you choose.', impact: 'Clearing the checkbox stops VMware from handing out addresses on VMnet2. Reopen the editor after saving and check that the box is still cleared.' },
  { find: /repadmin|replication|dcdiag/i, reason: 'DC01 and DC02 need matching domain information. These checks help you spot a problem with how the two domain controllers share updates.', impact: 'Read the results on your own servers. A failed check needs troubleshooting; running a check does not fix replication by itself.' },

  { find: /restore verifyonly|verify.*\.bak/i, reason: 'Check that SQL Server can read the structure of the backup before treating it as a recovery candidate.', impact: 'RESTORE VERIFYONLY performs a backup-media check; it does not restore the database and does not prove application recovery.' },
  { find: /restore.*(database|backup)|restore.test|restored tickets|restore the backup/i, reason: 'A backup is only useful if the data can be restored and validated on a separate target.', impact: 'A restore creates or overwrites the selected target database. Check its name, data, logins and integrity before any production cutover.' },
  { find: /backup.*(database|sql|\.bak)|sql.*backup|back up.*database/i, reason: 'Keep a recoverable copy of the database before making changes or moving it to another server.', impact: 'A SQL backup writes a backup set to the named destination. It does not automatically migrate SQL logins, jobs or server configuration.' },
  { find: /repadmin|dcdiag|replication|sysvol/i, reason: 'Active Directory needs healthy replication so users, computers and policies are consistent across domain controllers.', impact: 'These health checks report replication and directory status; a successful role installation by itself does not prove replication works.' },
  { find: /group policy|\bgpo\b|gpupdate|gpresult/i, reason: 'Group Policy delivers managed configuration to computers or users within its linked and filtered scope.', impact: 'Creating or linking a GPO can affect multiple identities. gpupdate requests policy processing; gpresult reads the effective policy on a client.' },
  { find: /domain controller|promot.*\bdc\b|active directory domain services|\badd.*domain services\b/i, reason: 'A domain controller provides directory authentication and publishes services other computers locate through DNS.', impact: 'Promotion changes the server into identity infrastructure; plan DNS, replication, time, backup and recovery before doing this beyond a lab.' },
  { find: /domain join|join the domain|join.*lab\.example\.test|computer.*domain|securechannel/i, reason: 'Joining the domain lets this server use the lab’s shared accounts and Windows settings.', impact: 'Joining changes computer identity and its trust relationship. Verify DNS, the computer account and secure channel after the reboot.' },
  { find: /dns|resolve-dnsname|nslookup|srv record|conditional forwarder/i, reason: 'DNS must return the intended addresses and service records before domain joins, replication or migrations can work.', impact: 'Lookup commands are observational. Changing a resolver, zone or forwarder changes where hosts find services; validate both directions.' },
  { find: /create.*\bou\b|organizational unit|create.*user|active directory user|get-aduser|get-adgroupmember/i, reason: 'Directory organization and group membership control which identities exist and which access or policies they receive.', impact: 'Creating or moving directory objects affects identity scope; read-only Get-AD commands show existing state without changing it.' },
  { find: /\bcluster\b|quorum|cloud witness|failover/i, reason: 'High availability needs a tested decision about which nodes stay online after a failure.', impact: 'Cluster and witness changes affect quorum decisions, not the existence of independent database backups. Test failure scenarios safely.' },
  { find: /sql server.*(install|setup)|install.*sql server|\bmssqlserver\b|sql instance/i, reason: 'SQL Server runs as managed services; the instance, service identity, network settings and storage must match application requirements.', impact: 'Installation creates SQL services and files. Get-Service only checks service state and does not prove database connectivity.' },
  { find: /create database|create table|select .*from|use agencyhelpdesk|\bssms\b|tickets table/i, reason: 'Using a disposable database makes schema and query behavior visible without risking production data.', impact: 'CREATE changes schema; SELECT reads matching rows. Confirm the active database context before executing any statement.' },
  { find: /\biis\b|web-server|w3svc|web site|webpage/i, reason: 'The web server role hosts the test workload whose availability and identity must be confirmed before and after migration.', impact: 'Installing IIS enables Windows web-server components; Get-Service W3SVC reads service state, which is not the same as a successful HTTP request.' },
  { find: /\bwsus\b|update ring|software update point/i, reason: 'Update services distribute approved patches in controlled waves rather than updating all managed systems at once.', impact: 'Configuration can affect update sourcing and deployment scope; always pilot before organization-wide rollout.' },
  { find: /\bmecm\b|configmgr|sccm|ccmexec/i, reason: 'Endpoint management depends on healthy identity, site services, SQL, clients and software distribution paths.', impact: 'Installing or configuring site roles changes management infrastructure; service checks alone do not confirm client policy delivery.' },
  { find: /\bupgrade\b|setup\.exe.*auto upgrade|server 2022/i, reason: 'A supported upgrade moves an existing workload to a newer OS while preserving the dependencies it still needs.', impact: 'An in-place upgrade changes the guest OS and may require restarts. Verify vendor support, backups, application health and rollback before touching production.' },
  { find: /\bazure\b.*(budget|cost)|cost worksheet|estimated cost|billing/i, reason: 'A cloud lab needs cost boundaries because running and allocated resources can incur charges even when work is unfinished.', impact: 'Budgets and alerts improve visibility; they do not automatically stop every charge. Check billing and delete approved disposable resources.' },
  { find: /network security group|\bnsg\b|inbound rule|firewall rule|port 22|port 3389/i, reason: 'Network rules decide which sources can reach a service and are part of the system security boundary.', impact: 'Adding an allow rule can expose a port. Limit source scope, document the owner and verify connectivity without opening broad public access.' },
  { find: /vnet|virtual network|subnet|private ip|vpn|bastion|hybrid connect/i, reason: 'A migration must have predictable private address space, routing and name resolution between its source and destination.', impact: 'Creating network resources or routes changes connectivity. Verify reachability and policy from both sides before migrating services.' },
  { find: /storage account|azure blob|file share|cloud witness/i, reason: 'Cloud storage settings affect data location, access and reliability across the deployment.', impact: 'A new storage account may incur cost or expose data if improperly configured; enforce private access, least privilege and retention controls.' },
  { find: /azure.*virtual machine|create.*\bvm\b|create.*instance|compute size|vm size/i, reason: 'A virtual machine is a managed computer with explicit compute, disk, network, image and identity choices.', impact: 'Creating a cloud VM allocates billable resources. Validate image support, security, tags and shutdown/backup policies.' },
  { find: /snapshot|backup|rollback|recovery point/i, reason: 'A baseline and recovery path make it possible to compare or reverse a risky change.', impact: 'A snapshot captures selected VM state, but it is not a replacement for a supported application-aware or independent backup.' },
  { find: /verify.*(checksum|sha-?256)|get-filehash|hash.*compare/i, reason: 'Checking a trusted checksum helps detect an accidental or malicious change to installation media or files.', impact: 'A hash command reads file bytes to calculate a fingerprint; it does not repair the file or verify publisher identity by itself.' },
  { find: /vmware|workstation|virtual machine|virtual disk|nat network|virtual switch/i, reason: 'A dedicated practice VM allows repeatable exercises while keeping the primary computer and business systems separate.', impact: 'VM settings change the guest hardware or network attachment; double-check which disk or network is selected.' },
  { find: /partition|format|mkfs|fdisk|wipefs|diskpart/i, reason: 'Storage setup assigns space and filesystems to the correct target disk.', impact: 'Formatting and partition changes can destroy existing data; confirm device identity, backups and destination before writing anything.' },
  { find: /mount|fstab|lsblk|blkid|findmnt|wd drive/i, reason: 'Mounts expose an existing filesystem at a chosen path and help establish durable access to data.', impact: 'A mount usually leaves data intact, but formatting does not. Confirm UUID, filesystem type and existing contents before editing mount settings.' },
  { find: /\bselinux\b|getenforce|ausearch|semanage|restorecon/i, reason: 'SELinux controls what a process may access even when traditional file permissions appear to allow it.', impact: 'Inspection commands read policy state; changing contexts or booleans changes access. Diagnose denials rather than disabling enforcement.' },
  { find: /systemctl|journalctl|\bservice\b|logs? /i, reason: 'Services must be running and healthy, and their logs help explain why an operation did or did not work.', impact: 'Status and journal queries inspect state; start, stop, restart or enable requests change runtime or boot behavior.' },
  { find: /dnf|yum|rpm|flatpak|install.*package|repository/i, reason: 'Package managers resolve software versions and dependencies from configured sources.', impact: 'Package installs and updates change installed software; verify repository provenance, compatibility and a patch window.' },
  { find: /ssh|authorized_keys|public key|private key|host key/i, reason: 'SSH authenticates administrative access while allowing you to verify the server you are actually connecting to.', impact: 'Authorized-key and sshd configuration changes affect access. Preserve recovery access and do not expose private keys.' },
  { find: /useradd|groupadd|usermod|chmod|chown|\bpermissions\b|\bsudo\b/i, reason: 'Users, groups and file privileges determine who can administer or access a system.', impact: 'Account and permission changes modify security boundaries; scope privileges narrowly and verify with a nonprivileged test account.' },
  { find: /networkmanager|nmcli|ip route|ip addr|ping|traceroute|connectivity/i, reason: 'Network inventory establishes addressing, routes and the path a connection must follow.', impact: 'Inspection commands only report state; changing interface or route settings can disconnect a remote session.' },
  { find: /wazuh|agent enrollment|endpoint detection|siem/i, reason: 'An endpoint agent sends security telemetry to a manager, making visibility and alerting possible.', impact: 'Agent configuration changes log collection and network communication; check enrollment, TLS trust and events before declaring success.' },
  { find: /steam|proton|gaming|anti-cheat/i, reason: 'Compatibility checks prevent installing software that the GPU, drivers or operating system cannot support.', impact: 'Game and compatibility layers install software locally; gaming tools are normally excluded from managed enterprise endpoints.' },
  { find: /printer|bluetooth|wi-fi|wifi|desktop settings|gnome/i, reason: 'Desktop settings and peripherals must be functional before users can rely on the operating system day to day.', impact: 'The change applies to the guest or user profile; hardware passthrough and corporate policy may limit available devices.' },
  { find: /\bhostname\b|whoami|\bpwd\b|ipconfig|get-computerinfo|osbuildnumber/i, reason: 'Confirm the machine, operating-system version and signed-in identity before making any system change.', impact: 'These inventory commands read current state. They do not rename, patch or configure the machine.' },

  { find: /choose typical|guest profile|new virtual machine wizard|manual windows installation/i, reason: 'The VM creation wizard must use the intended operating-system profile and virtual hardware before software installation begins.', impact: 'These choices configure the virtual machine, not the physical Windows host. Verify that the guest targets a new disposable virtual disk.' },
  { find: /desktop experience|server with gui|gnome desktop|desktop environment/i, reason: 'The graphical installation profile provides local administration tools and desktop components needed for the exercise.', impact: 'Selecting a GUI installation changes which packages the guest receives; server-core or minimal profiles have different management interfaces.' },
  { find: /attach.*\biso\b|download.*\biso\b|server 2019 media|mount the iso/i, reason: 'Attaching the correct installation media lets the new guest boot the OS installer.', impact: 'Attaching an ISO does not install the OS; verify source integrity and boot order before continuing.' },
  { find: /start the installer|click install|installation wizard|install the operating system/i, reason: 'The installer creates the operating-system baseline for the rest of the practice workload.', impact: 'Installation writes to the selected guest disk and can erase its existing contents. Confirm the VM and destination drive first.' },
  { find: /memory and cpu|ram allocation|virtual cpu|vm sizing|size the.*vm/i, reason: 'CPU and memory sizing determines whether the lab can start reliably without exhausting resources on the Windows host.', impact: 'These values change a virtual machine allocation; production sizing requires workload measurement and growth planning.' },
  { find: /local administrator password|administrator password|password setup|set the password/i, reason: 'A protected administrator credential is needed to complete initial setup and recover access to the guest.', impact: 'Setting a password changes sign-in security; protect the credential and use separate named, least-privileged accounts for routine work.' },
  { find: /vmnet|nat gateway|ipv4 settings|static ip|default gateway|network adapter|virtual switch/i, reason: 'Fixed practice addresses help your VMs find each other while keeping the lab separate from your home network.', impact: 'Changing virtual networking or IPv4 settings affects reachability, DNS and routing. Record the previous settings before changing them.' },
  { find: /open add roles|add roles and features|server manager|choose the windows role/i, reason: 'Server Manager exposes installed Windows roles and the wizard used to add only the services needed for this server.', impact: 'Opening the wizard does not install anything; the actual change happens only when you confirm the selected role features.' },
  { find: /create and populate.*group|grant.*setup account|security group|delegate permissions/i, reason: 'Groups and delegated roles determine which users, services or computers can perform an operation.', impact: 'Group membership or delegated access can immediately expand privileges. Apply only necessary rights and verify the intended scope.' },
  { find: /sql.*(setup rules|database engine services|service accounts|windows authentication)|grant your setup account access/i, reason: 'SQL Server setup decisions determine the installed instance, services, authentication and administrative access.', impact: 'These selections change the server installation; document the instance and service-account choices before any production deployment.' },
  { find: /boundary group|management point|distribution point|sms provider|cm prereqs|cmprereqs|ccmexec/i, reason: 'Configuration Manager depends on boundaries, site services and content distribution for clients to receive policy and software.', impact: 'Site configuration can redirect clients or expose content to an incorrect boundary. Verify the pilot client before broad assignment.' },
  { find: /upload .*\.bak|upload.*practice file|copy the text file|copy.*test file|scp|sftp/i, reason: 'A controlled file transfer should place the intended data at the intended destination without mixing up source and target.', impact: 'Transfers create or replace remote files. Verify destination, permissions and checksum before treating the copy as usable.' },
  { find: /archive|compress|tar -|gzip|zip file/i, reason: 'Archives collect files into a portable backup or handoff unit.', impact: 'Creating an archive copies selected content into a new file; it is not equivalent to tested disaster recovery.' },
  { find: /search and inspect|clean only your practice|create, copy and rename|make a folder/i, reason: 'Practicing safe file operations teaches how names, paths and permissions affect the data you can see or modify.', impact: 'Copying creates another file, renaming changes its path and deletion removes it. Work only in the disposable practice folder.' },
  { find: /open.*powershell tab|open powershell on your windows|windows terminal|shell prompt/i, reason: 'Before using a command, confirm it is being executed in the correct shell, on the correct machine and under the intended identity.', impact: 'Opening a terminal is not a remote configuration change. A local PowerShell prompt is different from an SSH Bash session or SSMS query editor.' },
  { find: /start sonic locally|sonic companion|connect and prove a real windows result/i, reason: 'A local terminal companion can distinguish actual output from simulated examples when configured securely.', impact: 'Starting the companion creates a local service; keep loopback/token protections in place and never expose it on the internet.' },
  { find: /read.*output|save your notes|record.*outcome|change ticket|evidence folder|prove.*result|state the problem/i, reason: 'Write down what happened, what you want to fix, and the test that will show whether your change worked.', impact: 'Writing an evidence record should not change the server. Keep secrets, keys, personal information and sensitive logs out of screenshots.' },
  { find: /privacy|lock the screen|screen blank|display resolution|keyboard layout|set the basics/i, reason: 'Initial desktop settings should make the workstation usable, secure and consistent for its intended users.', impact: 'Most of these settings affect the desktop profile or session, not the hypervisor. Apply organizational defaults on managed devices.' },
  { find: /start a new connection|vpn connection|rdp session|portal session/i, reason: 'Administrative sessions should use a known identity, approved path and verified destination before any configuration changes.', impact: 'Opening an administrative session does not authorize new permissions; confirm role and host identity and leave an audit trail.' },
  { find: /select.*subscription|azure.*directory|cost analysis|monthly budget|resource groups?\b/i, reason: 'Azure work must target the correct tenant/subscription and management scope so permissions, budgets and ownership remain clear.', impact: 'Creating a resource group or budget changes Azure management state, but a budget notification does not stop all spending automatically.' },
  { find: /check.*resources|cpu usage|ram usage|memory usage|disk usage|free memory/i, reason: 'Resource measurements help narrow whether a failure is caused by capacity, not configuration alone.', impact: 'Inspecting memory, CPU or disk usage does not free it. Confirm the root cause before deleting or changing workloads.' },

  { find: /\$\w+\s*=|replace_with|stores? a value in the current powershell/i, reason: 'Named PowerShell variables keep your selected environment values consistent across the next commands and make them easier to review.', impact: 'Assigning a PowerShell variable only changes the current shell session. It does not create or update an Azure resource; replace placeholders with verified values.' },
  { find: /\bicacls\b|inheritance:r|\/grant:r/i, reason: 'Private SSH keys must only be readable by the authorized user and the explicitly permitted system identities.', impact: 'icacls changes Windows access-control entries. /grant:r replaces the named explicit grant; /inheritance:r removes inherited entries. Verify access before locking yourself out.' },
  { find: /portal\.azure\.com|directories \+ subscriptions|sign-in\/mfa/i, reason: 'The correct cloud identity and tenant must be selected before working with billable or security-sensitive Azure resources.', impact: 'Signing in changes your administrative session, not the target resources. Confirm subscription and permissions before creation.' },
  { find: /system management|adsi edit|default naming context/i, reason: 'Configuration Manager publishes site information in an approved Active Directory container and requires correct delegation.', impact: 'Creating the AD container and ACL changes directory objects. Scope permissions to authorized site servers and verify before client discovery.' },
  { find: /database engine services|setup rules|click execute|practice select|query results/i, reason: 'The SQL workflow must be run against the right server and database, with a known input and an observed result.', impact: 'SELECT and setup validation inspect state; choosing features or executing CREATE/INSERT changes the target instance. Confirm the active SSMS connection.' },
  { find: /public inbound ports|public ip|no public rdp/i, reason: 'Administrators should use secure private management paths instead of exposing server administration to the internet.', impact: 'Public IP allocation or inbound access rules change the external attack surface. Verify the effective NIC, NSG and route settings.' },
  { find: /installer compatibility|windows adk|current-branch evaluation|evaluation installer/i, reason: 'Infrastructure installers depend on specific, supported versions of the operating system and prerequisite tools.', impact: 'Downloading media does not install it. Verify the official supported version and required license before changing any managed server.' },
  { find: /choose.*site|site code lab|primary site|site settings/i, reason: 'Configuration Manager site identity and dependencies must be established before client enrollment and policy delivery.', impact: 'Site installation writes to SQL and management services; reversing it is not the same as deleting a practice folder. Protect the lab baseline.' },
  { find: /trusted.*forest|trust.*exercise|trust relationship/i, reason: 'An Active Directory trust enables cross-forest authentication only after DNS, identity and security design are validated.', impact: 'Creating trust expands authentication paths. It does not automatically grant access to files or applications; review selective authentication and SID filtering.' },
  { find: /sysdm\.cpl|computer name tab|change.*member.*domain/i, reason: 'Windows machine identity and domain affiliation determine which directory authenticates the server and applies policy.', impact: 'A domain change breaks and creates trust relationships. Plan credential recovery, DNS, application identity and a tested rollback before doing it.' },
  { find: /index\.html|notepad as administrator|create.*test page/i, reason: 'The harmless sample page provides a known application response to compare before and after moving the server.', impact: 'Saving index.html changes web content; confirm the exact file extension and use a disposable site, not a business application.' },
  { find: /signed off|signs off|sti[g]|nist|approved tenant/i, reason: 'A migration needs accountable owners and explicit technical/security acceptance criteria rather than assuming a working VM means a completed project.', impact: 'Decision records assign responsibility and gates; they do not authorize deployment until the named approvers accept scope, risk and compliance requirements.' },
  { find: /record starting state|starting state using|starting balance|ending balance|export your notes/i, reason: 'Before-and-after evidence makes the change auditable and shows whether the original service and cost targets are met.', impact: 'Documenting observations does not change infrastructure; redact credentials and compare like-for-like measurements.' },
  { find: /re-run a read\/write query|listener|availability group/i, reason: 'An availability endpoint must preserve correct database reads and writes after a controlled failover.', impact: 'Test writes modify a disposable database. Verify the listener, active replica and application transaction results, not just a connected port.' },
  { find: /run.*powershell alternative|open.*windows powershell/i, reason: 'Choosing the correct administration shell and device avoids running a command against the wrong environment.', impact: 'Opening PowerShell is not a configuration change. Read the supplied command and verify its target before running it.' },
  { find: /check the actual results|open.*configuration manager console|client.*applet/i, reason: 'Management health requires observing the actual client/site behavior after services are configured.', impact: 'Console and client status screens read policy delivery results; they do not themselves prove compliance until the client has reported current data.' },
  { find: /download.*every update|not immediately synchronize|updates? classifications/i, reason: 'Patch infrastructure must select relevant supported products and classifications rather than synchronizing everything indiscriminately.', impact: 'Update selections change catalog size, storage, deployment scope and future patch policy. Use pilot rings and bandwidth limits.' },
  { find: /file transfer|restore.*without changing source|keep the original data/i, reason: 'A side-by-side migration must preserve the source while the restored target is validated.', impact: 'Keep existing source files and databases intact until acceptance is signed off. A copied backup must be restored and verified separately.' },
  { find: /linux-native title|graphics capability|launch.*actual result/i, reason: 'A small native application is a safe way to test that the graphical runtime, drivers and available hardware work.', impact: 'Installing and launching a test app affects only the selected practice environment; a VM GPU cannot prove performance on a physical workstation.' },

  { find: /\$\w+\s*(?:,|$)|displays the values you saved/i, reason: 'Reading back the chosen PowerShell variables catches wrong account, resource group or address values before a later command uses them.', impact: 'Displaying variables only prints local shell values. It does not create or modify Azure resources.' },
  { find: /\btags\b|purpose =|owner =/i, reason: 'Resource tags let administrators identify ownership, environment and cost purpose across a cloud subscription.', impact: 'Tags change searchable Azure metadata but do not grant access, encrypt data or enforce security by themselves.' },
  { find: /red hat-published|publisher\/offer\/version|trusted launch/i, reason: 'The VM image must be supported and correctly licensed to match the exercises and security requirements.', impact: 'Choosing an image sets guest OS baseline and billing/support characteristics; Trusted Launch compatibility must be assessed before provisioning.' },
  { find: /read-only command and run|complete sha256 fingerprint/i, reason: 'Server identity should be checked through a separately trusted console before accepting an SSH host key.', impact: 'A read-only fingerprint command reports key identity and does not change the server. Do not accept a mismatch without investigation.' },
  { find: /cat \/etc\/redhat-release/i, reason: 'The release file identifies the installed RHEL version so the administrator can check vendor compatibility and patch support.', impact: 'cat displays the release file; it does not change the installed operating system.' },
  { find: /\bdf -h\b|df checks filesystem space/i, reason: 'Filesystem free space is the capacity that matters to applications; it may differ from the size of the virtual disk.', impact: 'df -h reports human-readable filesystem usage; it does not extend a filesystem or clean old files.' },
  { find: /\bps -ef\b|ps lists running programs/i, reason: 'Process inventory establishes which programs are currently active before troubleshooting or patching.', impact: 'ps -ef is observational: -e lists all processes and -f provides details such as the owning user.' },
  { find: /stopped \(deallocated\)|stop.*azure vm|overview → stop/i, reason: 'Cloud VMs that are no longer needed should be properly deallocated to reduce compute billing.', impact: 'Stopping and deallocating ends compute allocation, but retained disks, networking and data can still incur charges.' },
  { find: /sonic verification change|sonic recovered|sha256sum.*probe\.txt|syscheck\.path/i, reason: 'A harmless controlled file modification tests whether the Wazuh manager receives and correlates new endpoint events.', impact: 'Appending the test marker changes only the chosen practice file. Compare timestamp, path and agent identity before declaring alert delivery healthy.' },
  { find: /which agency is moving|which azure tenant|who signs off|approval.*scope/i, reason: 'Before moving anything, find the old system, the new destination, who owns them and the checks they expect to pass.', impact: 'Scoping questions document intent; they do not authorize resource access or an actual cutover.' },
  { find: /estimate memory:|wsus01 .*gb|sql01 .*gb|memory requirements/i, reason: 'Realistic sizing avoids overcommitting the practice host and reveals workloads that need dedicated capacity.', impact: 'A sizing worksheet does not allocate memory. Production capacity requires measured load, vendor requirements and headroom.' },
  { find: /configuration manager applet|software center|client status/i, reason: 'A client must have healthy communication with its management point and receive current policy to be genuinely managed.', impact: 'The Configuration Manager applet inspects client state. Confirm registration and policy flow, not just the presence of the UI.' },
  { find: /migration jobs for supported|supported collections and objects/i, reason: 'Configuration Manager migrations must account for supported site objects and versions, plus dependencies that cannot simply be copied.', impact: 'Migration jobs can move supported metadata, while security settings, clients and site roles may require separate work and validation.' },
  { find: /current domain =|destination =|lab\.example\.test.*migrate\.lab\.example\.test/i, reason: 'Domain migration planning must identify the source and destination identity namespaces and application dependencies.', impact: 'Recording domain values is planning only; actual membership and trust changes need a separate approved cutover.' },

  { find: /different owners|retirement dates|unrelated or production resources/i, reason: 'Separate resource groups make cost, responsibility and cleanup decisions easier to manage without including unrelated systems.', impact: 'Keeping assets separate is a management and lifecycle choice, not proof of workload isolation. Shared network or recovery resources may need a longer retention period.' },
  { find: /\bls -la\b|ls lists files/i, reason: 'Inspecting visible and hidden files shows what already exists before changing names, permissions or content.', impact: 'ls -la only lists directory entries; -l supplies file details and -a includes hidden dotfiles. It does not modify a file.' },
  { find: /\bdf -i\b|checks inodes/i, reason: 'An inode shortage can block file creation even when the filesystem still reports free bytes.', impact: 'df -i reports inode counts and usage; it does not delete files or increase inode capacity.' },
  { find: /auto-shutdown time|cost reporting can lag|treat it as a fallback/i, reason: 'Automatic shutdown is a backup cost control, not evidence that the VM was actually deallocated.', impact: 'Scheduling automatic shutdown changes a future VM operation. Inspect current power state and delayed Cost Management records separately.' },
  { find: /Navigate with Files|Files from Activities|Ctrl\+H|Ctrl\+L/i, reason: 'Files is the desktop app for opening folders and finding your practice file without typing a command.', impact: 'Opening folders and showing hidden files changes what you can see; copying, renaming or deleting a file is a separate action.' },
  { find: /plan|inventory|checklist|document|record evidence|scope/i, reason: 'Write down how the lab works now and what you want to change, so you can check the result or go back.', impact: 'Planning and inventory should not modify systems; they establish what to verify and what a rollback must recover.' },
];

const commandNames: ReadonlyArray<[RegExp, string]> = [
  [/\bGet-FileHash\b/i, 'Get-FileHash calculates a file digest; -Algorithm SHA256 selects the hash algorithm. Compare against a trustworthy reference.'],
  [/\bResolve-DnsName\b/i, 'Resolve-DnsName queries DNS; -Type SRV requests service-discovery records rather than host addresses.'],
  [/\bTest-NetConnection\b/i, 'Test-NetConnection checks reachability; -Port specifies the TCP port to probe and does not authorize access.'],
  [/\bGet-AD(?:User|Domain|GroupMember|DomainController)\b/i, 'Get-AD* reads selected directory objects. -Filter * means all objects of that type; it does not grant access.'],
  [/\brepadmin\b/i, 'repadmin reports or manages Active Directory replication; /replsummary summarizes errors. Verify selected subcommands before using them.'],
  [/\bdcdiag\b/i, 'dcdiag tests domain-controller health; /test:replications narrows checks to replication health.'],
  [/\bipconfig\b/i, 'ipconfig /all displays interface addresses, DNS servers and other network details; it does not set a static IP.'],
  [/\bGet-ComputerInfo\b/i, 'Get-ComputerInfo reads Windows OS details; Select-Object limits the fields displayed.'],
  [/\bDISM\b/i, 'DISM /online targets the running OS; /Get-CurrentEdition reads the installed Windows edition.'],
  [/\bGet-CimInstance\b/i, 'Get-CimInstance reads Windows management data; Win32_ComputerSystem includes current domain membership.'],
  [/\bGet-Service\b/i, 'Get-Service reads Windows service state; use the exact service name and check the related application separately.'],
  [/\bInstall-WindowsFeature\b/i, 'Install-WindowsFeature adds the named Windows role; -IncludeManagementTools also installs its administration tools.'],
  [/\bTest-ComputerSecureChannel\b/i, 'Test-ComputerSecureChannel checks the member-computer domain trust; -Verbose supplies additional diagnostics.'],
  [/\bGet-GPO\b/i, 'Get-GPO reads a Group Policy Object; -Name identifies it and -Domain scopes the lookup.'],
  [/\bgpresult\b/i, 'gpresult reads Resultant Set of Policy; /r summarizes applied policy and /scope limits the computer or user context.'],
  [/\bgpupdate\b/i, 'gpupdate /force reprocesses Group Policy; it does not guarantee every policy takes effect without a restart or sign-out.'],
  [/\bnslookup\b/i, 'nslookup queries DNS; -type=SRV selects service records and the last address can select a specific DNS server.'],
  [/\bRESTORE VERIFYONLY\b/i, 'RESTORE VERIFYONLY checks readability of the backup set; FROM DISK names the server-side backup path. It is not a restore test.'],
  [/\bRESTORE DATABASE\b/i, 'RESTORE DATABASE writes a target database from a backup. Confirm target name, file mapping and recovery options first.'],
  [/\bBACKUP DATABASE\b/i, 'BACKUP DATABASE creates a backup set; TO DISK points to storage accessible to the SQL Server service account.'],
  [/\bSELECT\b/i, 'SELECT reads data; FROM identifies its source; WHERE (if present) filters rows. Check the active database before querying.'],
  [/\bCREATE TABLE\b/i, 'CREATE TABLE changes the schema; column types, NOT NULL and PRIMARY KEY define how records must be stored.'],
  [/\bCREATE DATABASE\b/i, 'CREATE DATABASE creates a database on the current SQL instance; USE selects the following query context.'],
  [/\bGet-Item\b/i, 'Get-Item returns information about the specified file or object; it does not modify it.'],
  [/\b(Get-FileHash|Get-Service)\b/i, 'These Get-* PowerShell cmdlets query existing information and normally do not modify configuration.'],
  [/\bGet-?AD\b/i, 'Get-AD commands read Active Directory state; scope the server/domain and object before trusting the output.'],
  [/\bwhoami\b/i, 'whoami prints the current account; it does not change identity.'],
  [/\bhostname\b/i, 'hostname prints the machine name; it does not rename the computer.'],
  [/\bpwd\b/i, 'pwd prints the current directory. It does not move you elsewhere.'],
  [/\bls\b/i, 'ls lists files; -l gives details, -a includes hidden entries and -h uses readable sizes.'],
  [/\bsystemctl\b/i, 'systemctl manages or reads systemd units: status inspects, restart changes the running service, enable changes boot behavior.'],
  [/\bjournalctl\b/i, 'journalctl reads the system journal; -u scopes a service, -n limits lines and -f follows incoming records.'],
  [/\bdnf\b/i, 'DNF manages RPM software: repolist reads enabled sources, info/search inspect, install/update change packages. -y accepts prompts automatically.'],
  [/\bfirewall-cmd\b/i, 'firewall-cmd inspects or changes firewall rules; --permanent edits persistent configuration and --reload applies it.'],
  [/\bgetenforce\b/i, 'getenforce reads the SELinux mode; it does not change policy.'],
  [/\bausearch\b/i, 'ausearch searches audit records; -m limits message type and -ts limits the time range.'],
  [/\blsblk\b/i, 'lsblk shows block devices and mount points; it does not erase or repartition disks.'],
  [/\bblkid\b/i, 'blkid reads filesystem identifiers so a stable UUID can be used instead of a changing device name.'],
  [/\bfindmnt\b/i, 'findmnt reports mounted filesystems and their sources; it is observational.'],
  [/\bmount\b/i, 'mount attaches a filesystem at a target path; ensure device, type and existing data are correct first.'],
  [/\bmkfs\b/i, 'mkfs creates a filesystem and can destroy previous data on its target device. Never guess the target disk.'],
  [/\bchmod\b/i, 'chmod changes filesystem permissions; numeric modes control read/write/execute for owner, group and others.'],
  [/\bchown\b/i, 'chown changes file ownership; scope the path and -R recursion carefully.'],
  [/\bssh\b/i, 'ssh connects to a host; -i selects an identity-file path, -p selects a nondefault port. Check host identity before accepting keys.'],
  [/\bGet-Process\b/i, 'Get-Process reads current processes and is not itself a stop or restart operation.'],
  [/\bGet-Help\b/i, 'Get-Help documents PowerShell commands; -Examples displays usage examples.'],
  [/\bGet-?Net\b/i, 'Network inspection cmdlets show status and connectivity; confirm target name and port before making configuration changes.'],
  [/^\$\w+\s*=/m, 'A PowerShell $variable = value assignment stores a value in the current session; it does not provision cloud resources. Replace any placeholder first.'],
  [/^\$\w+\s*(?:,|$)/m, 'A comma-separated PowerShell variable list prints stored values so you can verify them against your approved notes.'],
  [/\bRead-Host\b/i, 'Read-Host prompts the operator for a value; protect credentials and verify entered names, IDs and addresses before acting.'],
  [/\bJoin-Path\b/i, 'Join-Path constructs an OS-correct path from folder and filename components; it does not create a file.'],
  [/\bTest-Path\b/i, 'Test-Path returns whether the specified path exists; -LiteralPath treats wildcard characters as literal characters.'],
  [/\bNew-Item\b/i, 'New-Item creates an item; -ItemType chooses file/directory and -Force can allow an existing folder. Never assume -Force authorizes overwriting a key.'],
  [/\bSet-Location\b/i, 'Set-Location changes only the current shell directory; -LiteralPath treats the supplied path exactly.'],
  [/\bGet-Content\b/i, 'Get-Content reads a file; -LiteralPath selects the exact path without treating wildcard symbols as patterns.'],
  [/\bSet-AzContext\b/i, 'Set-AzContext chooses the active Azure subscription; -Subscription selects the specified subscription, not a new resource.'],
  [/\bConnect-AzAccount\b/i, 'Connect-AzAccount establishes an Azure authenticated session. Verify the selected tenant/subscription with Get-AzContext before any changes.'],
  [/\bGet-AzVM\b/i, 'Get-AzVM retrieves VM metadata; -ResourceGroupName and -Name select its scope and name, while -ErrorAction Stop turns errors into terminating failures.'],
  [/\bRead-Host\b/i, 'Read-Host waits for a value entered at the current PowerShell prompt; use approved IDs instead of placeholders.'],
  [/\.\\setup\.exe\s+\/auto\s+upgrade/i, 'setup.exe /auto upgrade requests a supported in-place Windows OS upgrade. /dynamicupdate disable prevents setup from fetching updates during setup; patch afterward per policy.'],
  [/\bicacls\b/i, 'icacls inspects or changes NTFS ACLs; /grant:r replaces the selected explicit grant, /inheritance:r removes inherited entries and /restore reads a prior ACL backup.'],
  [/\bid\b/i, 'id displays current Linux UID and group memberships; it does not grant new rights.'],
  [/\bsudo -l\b/i, 'sudo -l lists the commands your account may run as an administrator; it does not change privileges.'],
  [/\bsudo -v\b/i, 'sudo -v refreshes/verifies the credential timestamp without running an installation.'],
  [/\bhostnamectl\b/i, 'hostnamectl without a changing subcommand reads host metadata including OS and machine name.'],
  [/\bcat\b/i, 'cat prints the contents of an existing file; check the selected path and avoid exposing secrets.'],
  [/\buname\b/i, 'uname -r prints the running kernel release; uname -m prints CPU architecture. Neither is an OS upgrade.'],
  [/\bip addr\b/i, 'ip addr reads interface addresses; it does not add or change IP addresses.'],
  [/\bip route\b/i, 'ip route displays routing decisions, including the default gateway; it does not create a route without an action subcommand.'],
  [/\bdf -h\b/i, 'df -h reports filesystem space in human-readable units; a size can be repeated for directories on one filesystem.'],
  [/\bdf -i\b/i, 'df -i checks available inode records, which may run out before filesystem byte capacity.'],
  [/\brpm -qa\b/i, 'rpm -q queries package records; -a requests all installed packages. No packages are changed.'],
  [/\brpm -qip\b/i, 'rpm -qip inspects metadata inside an RPM file; it does not install the package.'],
  [/\brpm -qlp\b/i, 'rpm -qlp lists files that a provided RPM would install; it does not install them.'],
  [/\bps -ef\b/i, 'ps -ef lists all current processes with full-format user/process details; it does not stop any process.'],
  [/\bscp\b/i, 'scp copies files over SSH. -i selects the authentication key; verify the local source and remote user, host and path before transferring.'],
  [/\bsftp\b/i, 'sftp starts interactive file transfer. -i selects the authentication key; at sftp> use put to upload and get to download.'],
  [/\bput\s+\S+/i, 'At the sftp> prompt, put uploads a local file to the named remote destination, potentially replacing an existing file.'],
  [/\bdate -Is\b/i, 'date -Is prints an ISO-formatted timestamp for matching the operation with later logs and evidence.'],
  [/\bexit\b/i, 'exit closes the current shell or SSH connection; it does not deallocate a cloud VM.'],
  [/\bsha(?:256|512)sum\b/i, 'sha256sum/sha512sum calculate file digests for integrity comparisons; they do not alone verify publisher authenticity.'],
  [/\bfile\s/i, 'file inspects a file type using its content signature; it does not execute or install that file.'],
  [/\bcurl\b/i, 'curl retrieves remote data; --fail rejects HTTP errors, --location follows redirects, --show-error reports failures and --output writes to a local filename.'],
  [/\bcurl -I\b/i, 'curl -I requests HTTP response headers without downloading the page body; it tests HTTP reachability, not application correctness.'],
  [/\bgpg\b/i, 'GPG key listing/fingerprint commands inspect identity metadata; verify the fingerprint through an independent trusted vendor source.'],
  [/\bgrep\b/i, 'grep searches text; -n includes line numbers and -i ignores case. A search result is evidence, not a configuration change.'],
  [/\bdiff -u\b/i, 'diff -u prints a unified comparison of two files; the command does not restore either file.'],
  [/\bsudoedit\b/i, 'sudoedit edits a privileged file through a temporary copy; review the final diff and keep a tested rollback copy.'],
  [/\bsed -i\b/i, 'sed -i edits a file in place; restrict the expression and verify the resulting lines before restarting a service.'],
  [/\bcp -[a-z]*[an]\b/i, 'cp -a preserves metadata; -n avoids overwriting an existing destination. Confirm the saved backup before editing the original.'],
  [/\bprintf\b/i, 'printf prints precisely formatted text; > replaces a file and >> appends. Confirm the target is only a disposable lab file.'],
  [/\bmkdir -p\b/i, 'mkdir -p creates a directory and necessary parents without failing when they already exist.'],
  [/\bmv -i\b/i, 'mv renames/moves a file; -i asks before overwriting an existing target.'],
  [/\bcp -i\b/i, 'cp copies files; -i asks before overwriting an existing destination.'],
  [/\bflatpak\b/i, 'Flatpak manages desktop apps. --user scopes changes to the current user; remote-add adds a source, install adds an app and update refreshes installed apps.'],
  [/\bnmcli\b/i, 'nmcli reads/manages NetworkManager state; device status and connection show are read-only inspection commands.'],
  [/\bgetent hosts\b/i, 'getent hosts asks the configured name-service lookup system to resolve a hostname.'],
  [/\bfree -h\b/i, 'free -h shows RAM and swap usage using readable units; it does not free memory.'],
  [/\btop\b/i, 'top displays live process and CPU/memory statistics until you quit; it does not optimize the system automatically.'],
  [/\bgit clone\b/i, 'git clone copies a repository locally; --branch selects a named branch instead of the default. Confirm the current owner/repository before using historical examples.'],
  [/\bnpm (ci|run)\b/i, 'npm ci installs packages matching the lockfile; npm run executes the named local script. Review a repository and its scripts before running them.'],
  [/\bGet-Date\b/i, 'Get-Date shows the time from the Windows machine executing PowerShell; check hostname to know which machine produced it.'],
  [/\bsudo bash\b/i, 'sudo bash runs a local shell script with elevated rights. In the approved Wazuh installer, -a installs central components on the manager. Review and verify the exact downloaded script before executing.'],
  [/\bStart-VBRJob\b/i, 'Start-VBRJob triggers the selected Veeam backup job; confirm the job, repository, policy and capacity with the backup owner first.'],

];

export function explainStep(input: {
  lessonId: string;
  title: string;
  action: string;
  command?: string;
  expected: string;
}): StepCoaching {
  // A command reference can clarify a vague autogenerated 'reference check'
  // without replacing the original words or supplying invented results.
  const source = [input.title, input.action, input.command || ''].join(' ');
  const matched = topics.find((topic) => topic.find.test(source));
  const readOnly = !/(install|create|update|set-|remove|restart|stop|start|restore database|backup database|grant|delete|mkfs|format|chmod|chown|gpupdate)/i.test(input.command || '');
  const notes = commandNames.filter(([pattern]) => pattern.test(input.command || ''))
    .map(([, note]) => note);
  const commandNotes = [...new Set(notes)].slice(0, 8);
  return {
    reason: matched?.reason || `We’re working toward this result: ${input.expected}`,
    impact: matched?.impact || (input.command && readOnly
      ? 'Treat this command as an observation first. Compare the actual output with the required result; do not assume the command repaired anything.'
      : 'The effect depends on the selected control and target. Work only in the specified practice system and do not assume a change was successful until it is verified.'),
    commandNotes,
    specific: Boolean(matched),
  };
}
