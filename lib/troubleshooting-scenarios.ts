export type TroubleshootingTip = {
  title: string;
  symptom: string;
  where: string;
  checks: string[];
  command?: string;
  expected: string;
  next: string;
  changesStorage?: boolean;
  storageMap?: boolean;
  procedure?: {
    title: string;
    why: string;
    actions: string[];
    command?: string;
    expected: string;
  }[];
  references?: { title: string; url: string }[];
};
const lvm =
  'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_managing_logical_volumes/basic-logical-volume-management_configuring-and-managing-logical-volumes';
const vg =
  'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_managing_logical_volumes/managing-lvm-volume-groups_configuring-and-managing-logical-volumes';
const fs =
  'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html-single/managing_file_systems/managing_file_systems';
const azureDisk =
  'https://learn.microsoft.com/en-us/azure/virtual-machines/linux/expand-disks';
export const additionalScenarios: Record<string, TroubleshootingTip[]> = {
  Azure: [
    {
      title: 'A deployment says you do not have permission',
      symptom:
        'The portal reports AuthorizationFailed, or a resource is missing from your view.',
      where:
        'Azure portal → the intended subscription or resource group → Access control (IAM).',
      checks: [
        'Confirm your signed-in account, directory and subscription. Similar names can belong to different tenants.',
        'Open Check access to review your effective role at this resource’s scope. If your organization uses privileged access, check whether the approved role is active.',
        'Read the failed operation in Activity log. Record the action and scope it names.',
      ],
      expected:
        'You can identify the missing permission and the resource scope where it is needed.',
      next: 'Ask the owner for the smallest appropriate role. Do not request subscription-wide Owner just to clear one error.',
      references: [
        {
          title: 'Troubleshoot Azure RBAC',
          url: 'https://learn.microsoft.com/en-us/azure/role-based-access-control/troubleshooting',
        },
      ],
    },
    {
      title: 'A policy or quota blocks a new resource',
      symptom:
        'A deployment reports RequestDisallowedByPolicy, quota exceeded or unavailable capacity.',
      where:
        'Azure portal → failed deployment → Operation details; subscription → Usage + quotas when applicable.',
      checks: [
        'Read the exact code. A policy denial, a quota limit and a regional capacity shortage are different problems.',
        'For policy, open the named assignment and check required region, resource type, size or tags.',
        'For quota, compare the requested VM family and region with your available quota. For capacity, inspect supported alternatives before changing region.',
      ],
      expected: 'You know which rule or limit blocked the request.',
      next: 'Choose a compliant size or configuration, or request an approved exception/quota increase. Check pricing before selecting a larger VM.',
      references: [
        {
          title: 'Resolve policy denials',
          url: 'https://learn.microsoft.com/en-us/azure/azure-resource-manager/troubleshooting/error-policy-requestdisallowedbypolicy',
        },
      ],
    },
    {
      title: 'Azure Backup failed last night',
      symptom: 'The VM has no recent successful recovery point.',
      where:
        'Azure portal → the vault protecting this VM → Backup jobs → failed job.',
      checks: [
        'Read the job’s error and check the last successful recovery point and its retention.',
        'On the VM, inspect Extensions + applications and guest-agent health. A failed snapshot extension can prevent a backup.',
        'Check guest disk space and any reported VSS, connectivity or permission error. Use the specific error’s guidance.',
      ],
      expected:
        'A new backup succeeds and a separate test restore can be validated.',
      next: 'Escalate if the recovery point is older than your recovery objective. A retry alone does not prove recoverability.',
      references: [
        {
          title: 'Azure VM backup troubleshooting',
          url: 'https://learn.microsoft.com/en-us/azure/backup/backup-azure-vms-troubleshoot',
        },
      ],
    },
    {
      title:
        'Azure shows a larger disk, but the guest still shows the old size',
      symptom:
        'You increased a managed disk, yet Windows or Linux has no extra usable space.',
      where:
        'Azure portal → VM → Disks, then the guest’s Disk Management or Linux terminal.',
      checks: [
        'Match the managed disk to the guest disk by its documented mapping. Confirm the resize operation succeeded.',
        'In Windows Disk Management, rescan disks and inspect unallocated space. A basic volume usually needs contiguous free space immediately after it; do not delete a recovery partition to force this.',
        'In Linux, compare lsblk with df -hT. A partition, LVM physical volume, logical volume and filesystem may each need separate growth. Use the RHEL storage scenarios below.',
      ],
      expected:
        'The filesystem, not only the portal disk setting, reports the intended larger capacity.',
      next: 'Follow the documented procedure for the actual layout, encryption and filesystem. Disk growth can increase Azure charges.',
      references: [
        { title: 'Expand Linux managed disks', url: azureDisk },
        {
          title: 'Expand Windows managed disks',
          url: 'https://learn.microsoft.com/en-us/azure/virtual-machines/windows/expand-disks',
        },
      ],
    },
  ],
  'System administration · Windows and Active Directory': [
    {
      title: 'A Group Policy setting did not apply',
      symptom:
        'A computer or user is missing a setting you expected from a GPO.',
      where:
        'An elevated PowerShell window on the affected Windows computer; Group Policy Management on the admin workstation.',
      checks: [
        'Run the report command below, then open the HTML file from your Desktop. Look at applied and denied GPOs and the reason for each denial.',
        'Check the user/computer OU, the GPO link, security filtering and any WMI filter. User and computer settings apply to different objects.',
        'Confirm DNS and DC connectivity. Inspect Event Viewer → Applications and Services Logs → Microsoft → Windows → GroupPolicy → Operational.',
      ],
      command: 'gpresult /h "$env:USERPROFILE\\Desktop\\gp-report.html"',
      expected:
        'The intended GPO appears in the correct user or computer section, without an unexplained denial.',
      next: 'Fix the specific scope or processing problem. Refresh policy in an approved window; a refresh can apply changes and some settings require sign-out or restart.',
      references: [
        {
          title: 'Troubleshoot Group Policy application',
          url: 'https://learn.microsoft.com/en-us/troubleshoot/windows-server/group-policy/applying-group-policy-troubleshooting-guidance',
        },
      ],
    },
    {
      title: 'Domain sign-in fails because the clocks disagree',
      symptom:
        'Kerberos or sign-in errors appear after a server clock changes.',
      where:
        'Elevated PowerShell on the affected domain member; check the domain time hierarchy with your AD administrator.',
      checks: [
        'Read the time source and status below before changing the clock.',
        'Compare time with a healthy DC. Review Windows Time events and approved NTP connectivity.',
        'Check which DC holds the PDC emulator role and its approved time source; domain members normally follow domain time rather than independent public NTP settings.',
      ],
      command: 'w32tm /query /source\nw32tm /query /status',
      expected:
        'The member uses the intended time hierarchy and its clock is synchronized.',
      next: 'Correct the source or connectivity, then resynchronize through the approved runbook. Avoid large manual clock jumps on active servers.',
      references: [
        {
          title: 'Windows Time tools',
          url: 'https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-service-tools-and-settings',
        },
      ],
    },
    {
      title: 'An account keeps locking out',
      symptom:
        'A user is locked out again soon after an administrator unlocks them.',
      where:
        'AD administration tools and the DC Security event log, using an account allowed to read those logs.',
      checks: [
        'Find Security event 4740 near the lockout time, if account-lockout auditing is enabled. Note the caller computer name.',
        'On that computer, check services, scheduled tasks, saved credentials and applications that may still use an old password.',
        'Ask whether the password recently changed, and compare repeated failures with the actual affected service.',
      ],
      expected:
        'You find the device or task repeatedly submitting the old credential.',
      next: 'Update the stored credential securely, verify successful authentication, then unlock according to policy. Do not weaken the lockout policy to hide the cause.',
      references: [
        {
          title: 'Account lockout event 4740',
          url: 'https://learn.microsoft.com/en-us/windows/security/threat-protection/auditing/event-4740',
        },
      ],
    },
    {
      title: 'Windows updates fail or a server is waiting for restart',
      symptom: 'Patches repeatedly fail or the server remains noncompliant.',
      where:
        'Settings → Update & Security → Windows Update on Server 2019; Event Viewer and your WSUS/MECM console if managed.',
      checks: [
        'Record the exact update KB, failure code and time. Check free space and whether a restart is already pending.',
        'Check access to the organization’s configured update source and whether the device is in the intended approval/pilot group.',
        'Review the update and servicing events. Compare one affected server with a healthy pilot before changing policy.',
      ],
      expected:
        'The intended update installs and its required restart completes, followed by application checks.',
      next: 'Use a maintenance window and pilot-first plan. For a failed patch, follow its supported uninstall/recovery procedure; do not delete servicing folders as a blanket fix.',
      references: [
        {
          title: 'Windows Update troubleshooting',
          url: 'https://learn.microsoft.com/en-us/troubleshoot/windows-server/installing-updates-features-roles/windows-update-troubleshooting',
        },
      ],
    },
  ],
  'RHEL and AlmaLinux': [
    {
      title: 'Find what is filling the Linux disk',
      symptom:
        'The system says No space left on device, but you do not know which directory is responsible.',
      where:
        'Terminal on the affected Linux VM. sudo may ask for your Linux account password.',
      checks: [
        'Run df -hT to find the full mounted filesystem, then df -i to check whether it ran out of inodes instead of bytes.',
        'For a full /var filesystem, inspect just that filesystem with the command below. Replace /var if another mount is full. -x avoids crossing into other filesystems. This scan can take time on a busy server.',
        'Check journal size and application log growth. Agree on retention before removing old data.',
      ],
      command:
        'df -hT\ndf -i\nsudo du -xhd1 /var 2>/dev/null | sort -h\njournalctl --disk-usage',
      expected:
        'You identify the full mount and the directory or file pattern consuming space.',
      next: 'Fix runaway logging or use the application’s approved cleanup policy. If legitimate data needs more room, choose the matching LVM scenario below. Never delete a database file just because it is large.',
      references: [{ title: 'RHEL filesystem management', url: fs }],
    },
    {
      title: 'Deleted a large log, but disk space did not come back',
      symptom:
        'du reports less data, but df still says the filesystem is nearly full.',
      where: 'Terminal on the affected Linux server.',
      checks: [
        'An application can keep a deleted file open. Its space is released only after the last process closes it.',
        'If lsof is installed, run the read-only command below and inspect the process, file size and deleted path. If missing, an approved sudo dnf install lsof installs the tool and needs repository access.',
        'Match the process to its owning application and check whether supported log rotation can close and reopen the file.',
      ],
      command: 'sudo lsof +L1',
      expected:
        'You identify an open deleted file, or rule this cause out and continue checking mounts, snapshots and reserved space.',
      next: 'Arrange a supported log reopen or controlled service restart with the owner. Do not kill an unfamiliar process or write directly to /proc file descriptors.',
      references: [{ title: 'Filesystem guidance', url: fs }],
    },
    {
      title: 'Give an LVM volume more space from its existing pool',
      symptom: 'The filesystem is full, but its volume group has unused space.',
      where:
        'Terminal on your RHEL/AlmaLinux practice VM. This procedure changes storage and needs sudo.',
      checks: [
        'Have a recoverable backup and an approved maintenance plan before changing storage. A snapshot by itself is not a tested backup.',
        'This path is for a regular linear LVM logical volume containing mounted XFS or ext4. Stop if you see thin pools, RAID, encryption layers, swap or another filesystem.',
        'VG_NAME, LV_NAME and /MOUNTPOINT below are placeholders. Copy your actual names from the discovery commands; do not paste a device name from someone else’s screenshot.',
      ],
      changesStorage: true,
      storageMap: true,
      procedure: [
        {
          title: '1. Match the full filesystem to its logical volume',
          why: 'We need to enlarge the volume that actually holds your files.',
          actions: [
            'Run the read-only checks below. Find the full mount in df, then match its source to an LV path.',
            'Record the LV path, VG name, filesystem type and mount point. In vgs, VFree must have at least 5 GiB available for this example.',
          ],
          command:
            'df -hT\nlsblk -f\nsudo lvs -o lv_path,vg_name,lv_size,segtype\nsudo vgs',
          expected:
            'You have one confirmed target, a linear LV and enough VG free space. If the VG is full, use the new-disk scenario instead.',
        },
        {
          title: '2. Add a measured amount to the logical volume',
          why: 'The volume group is the pool; this command gives 5 GiB of that pool to the selected volume.',
          actions: [
            'Replace both names in the command with the LV path you recorded. Choose an amount your VG can supply.',
            'Run this once, then check the LV size. If a command fails, read its error before retrying.',
          ],
          command:
            'sudo lvextend -L +5G /dev/VG_NAME/LV_NAME\nsudo lvs -o lv_path,lv_size',
          expected:
            'The intended LV is 5 GiB larger. The filesystem may still show its old size until the next step.',
        },
        {
          title: '3. Grow the filesystem using the matching tool',
          why: 'The filesystem needs to learn about the extra room underneath it.',
          actions: [
            'Run only the command for your confirmed filesystem type. For mounted XFS: sudo xfs_growfs /MOUNTPOINT (replace the mount path).',
            'For ext4 instead: sudo resize2fs /dev/VG_NAME/LV_NAME (replace the LV path). Do not run resize2fs on XFS.',
            'If this step fails, do not run lvextend again. Keep the larger LV and investigate the filesystem error.',
          ],
          expected:
            'The filesystem growth succeeds without formatting or recreating the existing filesystem.',
        },
        {
          title: '4. Verify capacity and the application',
          why: 'A larger LVM volume is useful only if the filesystem and app can use it.',
          actions: [
            'Replace /MOUNTPOINT below with the same mount path. Check the new total size and free space.',
            'Test the application’s normal read/write operation using disposable lab data. Record the before/after sizes.',
          ],
          command: 'df -hT /MOUNTPOINT\nsudo vgs',
          expected:
            'df shows more usable capacity, VG free space has decreased, and the application still works.',
        },
      ],
      expected:
        'The intended filesystem has grown by the approved amount and its application check passes.',
      next: 'Growth is not reversed by shrinking XFS; XFS does not support shrinking. If recovery is needed, use the tested backup/recovery plan. Keep spare VG space for later needs.',
      references: [
        { title: 'Extend a logical volume', url: lvm },
        { title: 'Grow XFS or ext4', url: fs },
      ],
    },
    {
      title: 'Add a new empty VMware disk to a full LVM pool',
      symptom:
        'The target filesystem is full and vgs shows little or no VFree.',
      where:
        'VMware Workstation Pro on your Windows host, then terminal inside the Linux guest.',
      checks: [
        'Use a practice VM with a recoverable backup. This path adds a new virtual disk; it does not format or repartition the existing OS disk.',
        'Use only a brand-new, empty virtual disk. pvcreate writes LVM metadata and can destroy access to existing data on the wrong device.',
        'This walkthrough uses a whole new disk as a PV and an existing regular linear VG/LV. For encrypted, thin, RAID or shared enterprise storage, use its specific runbook.',
      ],
      changesStorage: true,
      storageMap: true,
      procedure: [
        {
          title: '1. Add a separate virtual disk in Workstation',
          why: 'LVM needs more physical capacity before it can offer more free pool space.',
          actions: [
            'Record lsblk and sudo pvs inside Linux, then shut down the practice VM normally.',
            'In VMware Workstation Pro, select this VM → Edit virtual machine settings → Add → Hard Disk. Create a new virtual disk, for example 20 GB, and finish the wizard. Keep the existing disk attached.',
            'Start the VM. Run lsblk again and compare. Identify the new empty disk by its added size and controller position; never assume it is /dev/sdb.',
          ],
          command: 'lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINTS\nsudo pvs',
          expected:
            'One new disk appears with the intended size, no child partitions, no filesystem and no mount point.',
        },
        {
          title: '2. Double-check the new disk before initializing it',
          why: 'A missing mount point alone does not prove a disk is empty.',
          actions: [
            'Replace the entire /dev/NEW_DISK placeholder with the verified full device path, such as /dev/sdb only if discovery confirms it.',
            'Run the read-only signature check below. Confirm the disk was just created empty and is not listed as an existing PV.',
            'If signatures, partitions, existing LVM membership or unexpected data appear, stop and identify the disk. Do not add force flags or erase signatures.',
          ],
          command: 'sudo wipefs --no-act /dev/NEW_DISK\nsudo pvs\nsudo vgs',
          expected:
            'The new disk has no signatures or existing PV membership, and you have recorded the intended existing VG name.',
        },
        {
          title: '3. Make the new disk available to the volume group',
          why: 'pvcreate marks the new disk for LVM; vgextend joins it to the existing pool.',
          actions: [
            'Only after the previous checks, replace NEW_DISK and VG_NAME below. Run each line separately.',
            'If either command reports an unexpected device or existing signature, stop instead of forcing it.',
          ],
          command:
            'sudo pvcreate /dev/NEW_DISK\nsudo vgextend VG_NAME /dev/NEW_DISK\nsudo pvs\nsudo vgs',
          expected:
            'pvs lists the new disk in the intended VG, and VFree has increased.',
        },
        {
          title:
            '4. Give part of the new pool space to the existing filesystem',
          why: 'Adding a disk to the pool does not automatically enlarge any filesystem.',
          actions: [
            'Open “Give an LVM volume more space from its existing pool” above. Use its confirmed LV path, a measured allocation and the correct XFS/ext4 growth tool.',
            'Verify df and test the application afterward. Keep the new virtual disk attached: existing files can now depend on it.',
          ],
          expected:
            'The desired filesystem is larger and its application still works. No new filesystem was created over the existing one.',
        },
      ],
      expected:
        'The VG has gained a new PV and the intended LV/filesystem has been extended.',
      next: 'Do not detach the added disk to undo this. Once allocated, removing it requires planned data migration and verification, not unplugging it.',
      references: [
        { title: 'Extend a volume group', url: vg },
        { title: 'Extend an LV', url: lvm },
      ],
    },
    {
      title:
        'You enlarged the existing virtual disk, but LVM has no new free space',
      symptom:
        'The hypervisor shows a bigger disk, but vgs still shows the old capacity.',
      where:
        'The VM console and a Linux terminal. Start with read-only discovery; the later actions change storage.',
      checks: [
        'Back up first. Determine whether the PV uses a whole disk or a partition with lsblk and pvs. Do not guess from a common /dev/sda example.',
        'If lsblk still shows the old disk size, confirm the resize on the correct virtual disk and follow the platform’s rescan/restart procedure.',
        'Do not run pvcreate on this existing PV. That is not how an existing PV is enlarged.',
      ],
      command:
        'lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINTS\nsudo pvs -o pv_name,vg_name,pv_size,pv_free\nsudo vgs',
      changesStorage: true,
      procedure: [
        {
          title: '1. If the PV lives in a partition, grow that partition first',
          why: 'A larger disk can still contain the old smaller partition.',
          actions: [
            'Check that unused space is directly after the target partition. Stop for a different partition layout, encryption, RAID or a nonstandard image.',
            'If growpart is missing, the cloud-utils-growpart package provides it: install with sudo dnf install cloud-utils-growpart only with repository access and approval.',
            'Use sudo growpart --dry-run /dev/DISK PARTITION_NUMBER to preview. For example, /dev/sda and 3 refer to /dev/sda3, but use your discovered values.',
            'After checking the preview, run sudo growpart /dev/DISK PARTITION_NUMBER. Stop if the kernel cannot reread the changed table; follow the maintenance runbook before rebooting.',
          ],
          expected:
            'lsblk shows the intended partition enlarged. For a whole-disk PV, skip this partition step entirely.',
        },
        {
          title: '2. Let the existing PV recognize its new capacity',
          why: 'pvresize updates LVM’s view of the already-existing PV.',
          actions: [
            'Replace the entire /dev/EXISTING_PV placeholder with the path from pvs, including its partition number if applicable.',
            'Run pvresize only on that existing PV, then recheck the VG.',
          ],
          command: 'sudo pvresize /dev/EXISTING_PV\nsudo pvs\nsudo vgs',
          expected:
            'VFree increases in the intended VG. If it does not, stop and inspect the disk/partition sizes again.',
        },
        {
          title: '3. Extend the intended LV and its filesystem',
          why: 'Free VG capacity is still separate from usable filesystem capacity.',
          actions: [
            'Use the “existing pool” walkthrough above to allocate a measured amount, grow XFS or ext4 and verify the application.',
            'For Azure, also follow the disk type/image/encryption-specific instructions in the linked Microsoft guide.',
          ],
          expected:
            'df now shows the additional usable space on the intended mount.',
        },
      ],
      expected:
        'Disk, partition when present, PV, LV and filesystem sizes agree with the intended expansion.',
      next: 'Record each layer’s before/after size. Do not rebuild the partition table, format the disk or repeat LV growth to troubleshoot a filesystem-only failure.',
      references: [
        { title: 'Azure Linux disk and LVM growth', url: azureDisk },
        {
          title: 'pvresize manual',
          url: 'https://man7.org/linux/man-pages/man8/pvresize.8.html',
        },
      ],
    },
    {
      title: 'lvextend worked, but df still shows the old size',
      symptom:
        'lvs reports a larger LV while the mounted filesystem has not grown.',
      where: 'Terminal on the affected Linux VM.',
      checks: [
        'Confirm df and lvs refer to the same device and mount point. Record the filesystem type with findmnt.',
        'If the LV already grew, do not repeat a +5G lvextend command. Each successful run allocates another 5 GiB.',
        'For XFS, grow the mounted filesystem with sudo xfs_growfs /MOUNTPOINT. For ext4, use sudo resize2fs /dev/VG_NAME/LV_NAME. Replace placeholders and choose only the matching tool.',
      ],
      command:
        'df -hT\nfindmnt -o SOURCE,FSTYPE,TARGET\nsudo lvs -o lv_path,lv_size',
      changesStorage: true,
      expected:
        'The correct filesystem now reports the existing larger LV’s capacity.',
      next: 'If the growth tool fails, save its exact error and check the layout before retrying. Never use mkfs to resize a filesystem; mkfs creates a new one and destroys existing filesystem contents.',
      references: [{ title: 'Filesystem growth tools', url: fs }],
    },
    {
      title: 'dnf cannot download or find a package',
      symptom:
        'A package install fails with a repository, certificate, DNS or package-not-found error.',
      where: 'Terminal on the RHEL or AlmaLinux guest.',
      checks: [
        'Read the first useful error and check the enabled repositories below. Confirm DNS, internet access, system time and any approved proxy.',
        'RHEL repository access may require its valid subscription registration; AlmaLinux uses its own distribution repositories. Do not mix distributions’ repositories.',
        'Check the exact package name and enabled repository. An isolated VMnet2-only machine intentionally has no internet route.',
      ],
      command: 'dnf repolist\ncat /etc/os-release\ntimedatectl status',
      expected:
        'The correct distribution repositories are reachable and supply the intended package.',
      next: 'Restore the approved connectivity/repository configuration, then retry. Do not disable TLS verification or install an arbitrary RPM from a search result.',
      references: [
        {
          title: 'Manage RHEL software',
          url: 'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_software_with_the_dnf_tool/index',
        },
      ],
    },
    {
      title: 'Linux enters emergency mode after a storage change',
      symptom: 'The VM stops during boot after a disk or /etc/fstab edit.',
      where:
        'The VM console, using an authorized recovery account; have the working backup or original configuration available.',
      checks: [
        'Read the failed mount/unit in the console and journal. Check whether the expected disk is still attached.',
        'Compare /etc/fstab UUIDs and filesystem types with lsblk -f. A typo or missing disk can prevent a required mount.',
        'Use findmnt --verify --verbose to check fstab. This validates the configuration; it does not prove every required disk is healthy.',
      ],
      command:
        'lsblk -f\nfindmnt --verify --verbose\njournalctl -xb --no-pager',
      expected:
        'You identify the exact failed device or mount and its incorrect/missing configuration.',
      next: 'Restore the known-good entry or correct only the verified error under the recovery runbook, then test before rebooting. Do not format a disk or remove a required mount just to make the error disappear.',
      references: [{ title: 'RHEL filesystem management', url: fs }],
    },
  ],
  'SQL Server': [
    {
      title: 'The transaction log is full (error 9002)',
      symptom: 'Writes fail even though the database data file is not full.',
      where:
        'SSMS → connect to the affected SQL instance using monitoring permissions.',
      checks: [
        'Run the read-only query below and find the affected database’s log_reuse_wait_desc.',
        'Check the volume containing its log file, the file growth limit, and whether full-recovery log backups are succeeding.',
        'A long transaction, missing log backup or unavailable replica can prevent log reuse. Fix the named cause rather than assuming all full logs have the same fix.',
      ],
      command:
        'SELECT name, recovery_model_desc, log_reuse_wait_desc FROM sys.databases;',
      expected:
        'You identify why log space cannot be reused and restore a healthy backup/transaction/replication flow.',
      next: 'Use the DBA-approved recovery plan. Never delete the .ldf file, switch recovery models casually or shrink the log as a universal fix.',
      references: [
        {
          title: 'Troubleshoot a full transaction log',
          url: 'https://learn.microsoft.com/en-us/sql/relational-databases/logs/troubleshoot-a-full-transaction-log-sql-server-error-9002',
        },
      ],
    },
    {
      title: 'A SQL Server Agent job failed overnight',
      symptom: 'A scheduled backup, import or maintenance job did not finish.',
      where: 'SSMS → SQL Server Agent → Jobs → affected job → View History.',
      checks: [
        'Expand the failed run to find the actual failing step and its error text, not just the final “job failed” summary.',
        'Check the step’s command, database context and approved service/proxy identity. Confirm required files and network paths exist.',
        'Check dependencies and scheduling overlap. SQL Server Express does not include SQL Server Agent; its tasks need a separately configured scheduler.',
      ],
      expected:
        'You know the failing step and the missing permission, path, dependency or resource.',
      next: 'Fix the cause, then rerun only when it is safe. Check whether the first run partially imported data before rerunning it.',
      references: [
        {
          title: 'View job history',
          url: 'https://learn.microsoft.com/en-us/sql/ssms/agent/view-the-job-history',
        },
      ],
    },
    {
      title: 'SQL is slow and CPU is high',
      symptom: 'Queries take longer and sqlservr.exe is consuming CPU.',
      where:
        'Task Manager on SQL01 and SSMS monitoring tools with the required permissions.',
      checks: [
        'Confirm SQL, rather than another process, is using the CPU. Compare with the normal workload and maintenance schedule.',
        'Use Activity Monitor and Query Store if already enabled to identify expensive queries and recent regressions.',
        'Check blocking, query plans and changed data/workload before considering indexes, statistics updates or a larger VM.',
      ],
      expected:
        'You can associate the slowdown with a specific workload or resource bottleneck.',
      next: 'Review the evidence with the DBA and application owner. Avoid clearing the plan cache or restarting SQL as a default response.',
      references: [
        {
          title: 'Diagnose SQL high CPU',
          url: 'https://learn.microsoft.com/en-us/troubleshoot/sql/database-engine/performance/troubleshoot-high-cpu-usage-issues',
        },
      ],
    },
    {
      title: 'A restored database has a user who cannot sign in',
      symptom:
        'A login works on the server but cannot access a migrated/restored database.',
      where:
        'SSMS on the destination instance, using an authorized DBA account.',
      checks: [
        'Confirm the database is online and the application targets the correct instance/database.',
        'Check whether the database user’s SID matches the intended server login. Restoring a database does not necessarily migrate its server login.',
        'Review the database user mapping and required role membership. Windows domain users also need the correct domain identity and access.',
      ],
      expected:
        'The intended login maps to its database user with only the permissions needed by the app.',
      next: 'Use the supported user/login remapping procedure after verifying the identity. Do not fix access by granting sysadmin or making every user db_owner.',
      references: [
        {
          title: 'Troubleshoot orphaned database users',
          url: 'https://learn.microsoft.com/en-us/sql/sql-server/failover-clusters/troubleshoot-orphaned-users-sql-server',
        },
      ],
    },
  ],
  Migrations: [
    {
      title: 'The source server does not appear in discovery',
      symptom: 'Azure Migrate lists fewer machines than expected.',
      where: 'Azure Migrate project and its appliance configuration manager.',
      checks: [
        'Confirm the correct project, discovery method and source scope. Check appliance diagnostics and the last successful discovery time.',
        'Verify required credentials and connectivity for that supported discovery method without displaying passwords in notes.',
        'Workstation Pro is not vCenter. Do not follow an agentless vCenter workflow against a standalone Workstation VM; use the supported physical/other or agent-based path specified by your class.',
      ],
      expected:
        'The intended source is discovered through a supported method and its details are current.',
      next: 'Resolve the specific appliance/credential/network error rather than recreating the entire project.',
      references: [
        {
          title: 'Appliance diagnostics',
          url: 'https://learn.microsoft.com/en-us/azure/migrate/troubleshoot-appliance-diagnostic',
        },
      ],
    },
    {
      title: 'Replication is healthy but the recovery point is too old',
      symptom:
        'The portal shows no hard failure, yet the latest recoverable data is behind the cutover target.',
      where:
        'Azure Migrate → the replicating machine; source storage and network monitoring.',
      checks: [
        'Compare the latest recovery point with your agreed recovery point objective, not just the green health icon.',
        'Check change rate, source disk pressure, replication backlog and available outbound bandwidth.',
        'Check whether backups or large batch jobs are competing with replication.',
      ],
      expected:
        'The backlog reduces and the latest recovery point is within the agreed limit.',
      next: 'Delay cutover if the data gap exceeds the approved objective. Do not promise zero data loss based only on a healthy status.',
      references: [
        {
          title: 'Azure Migrate troubleshooting',
          url: 'https://learn.microsoft.com/en-us/azure/migrate/troubleshoot-general',
        },
      ],
    },
    {
      title: 'Some users still reach the old server after cutover',
      symptom: 'Different clients see different versions of the application.',
      where:
        'Client PowerShell and the authoritative DNS zone for the migrated application.',
      checks: [
        'Confirm the authoritative record now points to the intended destination. Compare DNS answers from affected clients and their configured resolvers.',
        'Review the old record’s TTL, DNS caches, browser connections, load balancers and any hosts-file overrides.',
        'Confirm the old application cannot keep accepting conflicting writes after the approved traffic switch.',
      ],
      command:
        'Resolve-DnsName helpdesk.lab.example.test\nGet-DnsClientServerAddress',
      expected:
        'Clients resolve the intended endpoint and a test action reaches the one authoritative application.',
      next: 'Follow the DNS cutover/runbook and recheck after caches expire. Clearing one client’s cache is not a complete migration fix.',
      references: [
        {
          title: 'Windows DNS troubleshooting',
          url: 'https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/troubleshoot-dns-client-resolution-issues',
        },
      ],
    },
    {
      title:
        'The migrated app runs, but its data or background jobs are missing',
      symptom:
        'The site opens, but records, scheduled jobs or integrations did not move.',
      where:
        'The destination application, database and scheduler, with the source kept available according to the migration plan.',
      checks: [
        'Compare known dummy records, agreed row counts and timestamps. A running VM does not prove data completeness.',
        'Inventory scheduled tasks, SQL Agent jobs where applicable, service accounts, file shares and secrets that live outside the migrated database.',
        'Check which jobs must be disabled on the source before enabling the destination copies.',
      ],
      expected:
        'The destination passes the agreed data checks and each required job runs exactly once in the intended environment.',
      next: 'Reconcile missing changes through the approved sync/rollback plan. Do not run the same write-producing integration on both copies.',
      references: [
        {
          title: 'Migration planning and troubleshooting',
          url: 'https://learn.microsoft.com/en-us/azure/migrate/troubleshoot-general',
        },
      ],
    },
  ],
  'Application issues · IIS, PHP and help desk': [
    {
      title: 'IIS returns 404 for a page that should exist',
      symptom: 'The website opens, but one URL returns File Not Found.',
      where: 'IIS Manager → affected site; IIS access log for that request.',
      checks: [
        'Match the hostname and path to the intended IIS site and application. Read the status and substatus in its log.',
        'Check the site’s physical path, the requested file or application route, default document and any rewrite rules.',
        'A missing static file, a missing handler and an application route failure need different fixes. Compare one working URL with the failing URL.',
      ],
      expected:
        'The intended URL maps to the correct file or application route.',
      next: 'Correct the specific path, deployment artifact or mapping. Do not enable directory browsing just to hide a missing default page.',
      references: [
        {
          title: 'Troubleshoot IIS 404',
          url: 'https://learn.microsoft.com/en-us/troubleshoot/developer/webapps/iis/site-behavior-performance/troubleshoot-404-file-not-found-error',
        },
      ],
    },
    {
      title: 'The site returns 401 or 403 after a permission change',
      symptom: 'A valid user is denied access or asked to sign in repeatedly.',
      where:
        'IIS Manager → site → Authentication and Authorization Rules; Windows application/security logs as appropriate.',
      checks: [
        'Read the full HTTP status/substatus first. Check whether Windows, anonymous or application-level authentication is intended.',
        'Confirm the correct application pool identity has only the necessary filesystem access and the user meets the site’s authorization rules.',
        'For Windows authentication, check domain DNS, time, hostname and the approved SPN/delegation configuration if the app uses a second service.',
      ],
      expected:
        'An authorized test user can access the intended function, while an unauthorized user remains denied.',
      next: 'Fix the matching identity or rule. Avoid granting Everyone Full Control, disabling authentication or changing SPNs without checking ownership.',
      references: [
        {
          title: 'IIS HTTP error troubleshooting',
          url: 'https://learn.microsoft.com/en-us/troubleshoot/developer/webapps/iis/site-behavior-performance/troubleshoot-http-error-code',
        },
      ],
    },
    {
      title: 'A file upload fails but the rest of the app works',
      symptom: 'Small files work, but a larger attachment fails.',
      where:
        'The app’s upload settings, PHP configuration and IIS Request Filtering on APP01.',
      checks: [
        'Record the HTTP error/substatus and the file’s size/type. Check the application’s own allowed sizes and extensions.',
        'For PHP, inspect upload_max_filesize, post_max_size, the temporary directory and the actual php.ini loaded by IIS. The request body includes overhead beyond the file size.',
        'Check IIS request size restrictions and whether the app identity can write to its approved temporary/upload folders.',
      ],
      expected:
        'An allowed test attachment uploads and can be read back, while disallowed types/sizes remain blocked.',
      next: 'Align the documented limits and apply changes through the maintenance process. Keep file-type validation and malware controls in place.',
      references: [
        {
          title: 'PHP upload configuration',
          url: 'https://www.php.net/manual/en/ini.core.php#ini.sect.file-uploads',
        },
        {
          title: 'IIS request limits',
          url: 'https://learn.microsoft.com/en-us/iis/configuration/system.webserver/security/requestfiltering/requestlimits/',
        },
      ],
    },
    {
      title: 'Help desk tickets work, but email notifications do not arrive',
      symptom:
        'A ticket is saved but its confirmation or agent notification is missing.',
      where:
        'osTicket Admin Panel → Emails and System Logs, plus the approved mail service’s delivery logs.',
      checks: [
        'Confirm the sender address, selected mail account and intended notification settings. Test with dummy lab data.',
        'Check SMTP server, port, TLS and supported authentication against the mail provider’s requirements. A correct password alone may not satisfy its authentication policy.',
        'Check whether sending is immediate or uses a configured task/queue. Review scheduled-task history, bounces and spam/quarantine.',
      ],
      expected:
        'A test notification reaches its intended mailbox and the logs show successful delivery or an actionable provider response.',
      next: 'Fix the recorded SMTP/authentication/scheduling error. Do not turn the server into an open relay or put mailbox passwords in screenshots.',
      references: [
        {
          title: 'osTicket email configuration',
          url: 'https://docs.osticket.com/en/latest/Getting%20Started/Email%20Settings.html',
        },
      ],
    },
  ],
};
