import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const kb = (id) => `https://knowledge.broadcom.com/external/article/${id}`;
const docs = 'https://techdocs.broadcom.com/us/en/vmware-cis/vsphere/vsphere/8-0.html';
const sources = [
  { title: 'vSphere 8 documentation: installation, networking, storage and VM administration', url: docs },
  { title: 'vCenter downloads require product entitlement', url: kb(366685) },
  { title: 'Free ESXi capabilities and limits', url: kb(399823) },
  { title: 'Access VMware Hands-on Labs', url: kb(408578) },
  { title: 'Create a datacenter and add a host', url: kb(308382) },
  { title: 'Standard switch uplink selection', url: kb(443156) },
  { title: 'VMFS device selection and existing partitions', url: kb(410154) },
  { title: 'Templates and Content Libraries', url: kb(396400) },
  { title: 'Snapshot behavior and limits', url: kb(342618) },
  { title: 'Find snapshots and associated disks', url: kb(344559) },
  { title: 'VM network and CD connection settings', url: kb(413851) },
  { title: 'vCenter 8 file-based backup', url: kb(375278) },
  { title: 'Windows Sysprep overview', url: 'https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/sysprep--system-preparation--overview' },
];
const lessons = [];
function s(title, where, why, actions, expected, failure, assetId, sourceIds = [], command) {
  return { title, where, actions, expected,
    guide: { what: title, why, verify: expected, failure },
    breakdown: [{ term: 'Success check', meaning: expected }, { term: 'If it goes wrong', meaning: failure }],
    ...(command ? { command } : {}),
    screenshot: assetId ? {
      status: 'reference', assetId: `vsphere-${assetId}`,
      title: `Official VMware/Broadcom reference · ${title}`,
      instructions: 'Follow the numbered key below the image. This is a vendor-published screen, not our lab or your result. Its names, build and example values can differ. Use the values in your own approved plan.',
    } : {
      status: 'capture-needed', title: `Exact-step capture pending · ${title}`,
      instructions: 'The written procedure is supplied; an exact screenshot for this step has not been added. No live execution is claimed. Compare your result with the Success check.',
    },
    sources: sourceIds.length ? sourceIds.map(kb) : [docs],
  };
}
function l(id, title, description, analogy, steps, question, options, answer = 0, explanation = options[answer]) {
  lessons.push({ id: `vsphere-${id}`, title, module: title, description, what: description, why: analogy,
    needs: [id === 'basics' ? 'No previous VMware experience. Read the access lesson before changing a system.' : 'Use the named disposable lab objects and the access route chosen in chapter 2.'],
    bestPractices: ['Read the object name and recovery note before clicking Finish.', 'Record the real outcome. A screenshot or saved checkbox does not prove a server works.'],
    commonMistakes: ['Copying a screenshot’s IP address, device identifier or VLAN instead of using the lab plan.'],
    troubleshooting: [{ problem: 'The button or result differs.', fix: 'Check whether you opened ESXi Host Client or vCenter vSphere Client, then check version, license and permissions. Use the current step’s recovery note.' }],
    pass: steps.at(-1).expected,
    exercise: 'In your permitted lab, repeat the checks and record actual evidence. Without a lab, write a proposed procedure and label it walkthrough only; do not claim a live pass. Keep passwords, keys and license strings out of notes and screenshots.',
    quiz: [{ question, options, answer, explanation }], steps });
}
l('basics', 'Meet the virtual server building', 'Learn what ESXi, vCenter, a VM, a port group and a datastore do.',
  'Think of a building: ESXi is the building manager, VMs are rooms, networking is the hallway, and storage is the cupboard.', [
  s('Give each piece a job', 'Read here · no changes', 'Names become easier when each one has a simple job.', [
    'A physical server is a real computer. ESXi runs directly on it and shares CPU, memory, disks and network connections among virtual machines. Each VM behaves like its own computer.',
    'vCenter is the central office that manages several ESXi hosts. Its web interface is the vSphere Client at https://your-vcenter/ui. A single host has its own ESXi Host Client at https://your-host/ui.',
    'A datastore stores VM files. A virtual disk is one file-backed disk belonging to a VM. A port group is a named network connection choice. A template is a prepared master used to create new VMs.',
  ], 'You can explain host, VM, vCenter, datastore and port group without mixing them up.', 'Return to the building example. Workstation is a desktop lab tool, not the vCenter interface.'),
  s('Read a VM’s home address', 'Official vendor VM storage reference', 'A VM has both a compute home and a storage home.', [
    'Use the picture’s numbered key to find the selected VM and its datastore. A datastore is not the Windows C: drive inside that VM.',
    'On your own permitted VM, open Summary and record its host, datastore, network, CPU and memory. Keep the VM powered as it was; this is inspection only.',
  ], 'Your notes identify the VM and the separate resources it uses.', 'If no lab is available, label your notes vendor-screen observations, not live results.', 'vm-datastore', [344559]),
], 'Which tool centrally manages multiple ESXi hosts?', ['vCenter Server', 'The guest operating system', 'A datastore'] );
l('access', 'Choose a lab without a vCenter trial', 'Pick a study route that matches the software and permissions you actually have.',
  'A picture of a swimming pool can teach the layout; it does not mean you have already swum.', [
  s('Choose walkthrough, standalone, or hosted practice', 'Your browser · official download and Hands-on Labs pages', 'The class must work without assuming a downloadable vCenter evaluation.', [
    'Walkthrough route: read the steps and numbered official VMware/Broadcom images. Record a proposed change and expected result. This does not require ESXi, vCenter or a trial.',
    'Standalone route: if you lawfully have compatible ESXi hardware or an approved nested lab, use the Host Client for VMs, standard port groups and datastores. Verify the actual edition and build before proceeding.',
    'vCenter practice route: use an existing authorized vCenter environment or visit VMware Hands-on Labs → Explore Catalog, then search Virtualization 101 or vSphere. Registration, available labs and session time limits apply; follow that lab’s own permitted actions.',
    'Broadcom’s vCenter ISO download instructions require entitlement. Do not assume a free vCenter trial is obtainable. Do not reset evaluations, use unofficial ISOs or bypass licensing.',
  ], 'Your notes state the chosen route and which actions you may actually perform.', 'If a download is not entitled, stop that route. Continue the attributed walkthrough or use an available hosted lab.', null, [366685, 408578]),
  s('Know where standalone practice stops', 'Host Client → Host → Manage → Licensing; vCenter inventory if available', 'A visible menu does not guarantee a licensed feature.', [
    'Record the product, build and license edition; hide the actual license key in screenshots. The free ESXi 8.0 U3e option is standalone and cannot be managed by vCenter.',
    'Free standalone ESXi does not provide vMotion, HA, DRS or VADP backup integration. Its documented limits include two physical CPUs and eight vCPUs per VM; confirm current terms for your actual release.',
    'vCenter templates, Content Libraries, centralized permissions and cluster workflows require the vCenter route. Mark these as walkthrough-only when it is unavailable. A cluster can also require additional licensed capabilities.',
  ], 'You can distinguish an ESXi task from a vCenter-only or separately licensed task.', 'If a feature is missing, check edition and privileges before treating it as a fault.', null, [399823]),
], 'Can free standalone ESXi be added to vCenter?', ['No; the free edition does not support vCenter management', 'Yes; every ESXi edition can be managed centrally'] );
l('plan', 'Plan the small training environment', 'Write names, networks, storage and recovery before installing anything.',
  'Draw the rooms and hallways before building the house.', [
  s('Fill in the lab planning sheet', 'Downloadable lab-plan.md · your change record', 'A written map prevents duplicate addresses and wrong-disk mistakes.', [
    'Download the lab plan below. Use fictional names such as esx01.lab.example.test, vc01.lab.example.test and LAB-APP01. Replace every <planned-value> with an approved value; example.test names need your private DNS.',
    'Record reserved management addresses, mask, gateway, DNS, time source, allowed admin workstation and the management recovery console. Document VM, storage and optional vMotion networks separately.',
    'List the boot device and a separate blank practice datastore device by stable ID and capacity. Check hardware compatibility, firmware and sizing in the official documentation for the exact version. Nested virtualization is a training option only when supported by your hardware and lab design.',
  ], 'The plan names every object, device and network before a wizard opens.', 'Resolve duplicate IPs, unknown devices and resource shortages before installing.'),
  s('Define a safe practice boundary', 'Lab plan · out-of-band or VM console', 'Management access is your way back when a network change fails.', [
    'Use a disposable environment and a named recovery point. Never reinstall ESXi over the Windows or AlmaLinux VMs used for other classes.',
    'Keep the management interface on the recorded network. For the first networking exercise, use a new isolated virtual switch with no physical uplink and two test VMs on the same host.',
    'Record the owner, allowed change window, backup location and stop conditions. In a hosted lab, use the provided objects and instructions instead of imposing this example topology.',
  ], 'You know which objects can change and how to regain the host console.', 'If recovery access or permission is missing, stay in walkthrough mode.'),
], 'What should you identify before installing ESXi?', ['The exact target boot device and a recovery plan', 'Only the server name'] );
l('install', 'Install ESXi on the intended server', 'Install a hypervisor without overwriting the wrong disk.',
  'The installer puts the building manager on one chosen device; it must not clear someone else’s cupboard.', [
  s('Prepare and select the installation device', 'ESXi server console · approved boot media', 'Installation can overwrite existing partitions.', [
    'Obtain an authorized installer compatible with your server, NIC and storage controller. Verify its publisher checksum and the selected OEM image when required. Boot only the named disposable host from that ISO or approved USB media.',
    'At the installer, choose the install entry, read the welcome screen and license agreement, and continue only when authorized to accept it. Compare the disk model, capacity and identifier against the lab plan.',
    'Select the planned boot device. Stop if any existing datastore or upgrade/preserve choice is unexpected. Do not choose erase or fresh install to fix an unexplained disk listing.',
  ], 'The selected boot device matches the recorded device, with no unknown data at risk.', 'Cancel before confirmation if the target is uncertain. Check controller visibility and compatibility rather than trying another disk.'),
  s('Complete the install and first console check', 'ESXi installer and Direct Console User Interface (DCUI)', 'The host must boot independently before remote administration starts.', [
    'Choose the intended keyboard and set a unique strong root password locally; never place it in course notes. Review the installation warning and confirm only the planned device.',
    'After the successful install prompt, disconnect the installation media and reboot. Read the DCUI product/build and initial management information.',
    'Record the installed build and installation result. Do not interpret the console’s displayed address as proof that DNS, routing or browser access works.',
  ], 'The host boots to DCUI from its own boot device and its build is recorded.', 'If it boots back into the installer, check boot order/media. For a boot or driver failure, preserve evidence and return to the supported hardware plan.'),
], 'An unfamiliar disk appears in the installer. What next?', ['Stop and identify it before confirmation', 'Select the largest disk and continue'] );
l('host', 'Give the host a reliable management connection', 'Set management identity, DNS and time, then open the Host Client.',
  'The host needs an address, a name and a correct clock, just like an office needs an address and working schedule.', [
  s('Configure and test management in DCUI', 'Host console → F2 → Configure Management Network', 'A stable management path prevents losing the host during later work.', [
    'Sign in locally. In Network Adapters confirm the planned management NIC by its MAC/uplink record. Set the management VLAN only if the physical or nested network plan requires tagged traffic.',
    'Open IPv4 Configuration and enter the reserved address, mask and gateway. In DNS Configuration enter approved DNS servers and the host name; set the suffix under Custom DNS Suffixes when needed.',
    'Review before applying. Applying management changes may interrupt access; do it from the console. Run Test Management Network against the planned gateway, DNS and hostname. Check forward and reverse DNS from the administrator workstation.',
  ], 'The planned management address and DNS resolution work from the allowed workstation.', 'Use the console to restore the recorded NIC/VLAN/IP settings. Do not reset all networking as the first response.', 'dcui-network', [328870, 411275]),
  s('Open Host Client and set time', 'Browser → https://<host-fqdn>/ui → Host → Manage → System → Time & date', 'Correct identity and time support logins, certificates and clear event records.', [
    'Open the planned private FQDN. Verify any certificate warning through the host’s trusted console or approved certificate process; never blindly accept an unexpected identity. Enter credentials only in the verified local interface.',
    'Record Summary → version/build. Under the time settings, edit NTP configuration using approved reachable time servers and choose the approved service startup policy. In Services confirm the NTP service is running.',
    'Compare host time with the trusted source and inspect recent events. Keep SSH disabled unless an approved task requires it; close it when finished.',
  ], 'The verified Host Client opens, the actual build is recorded, and time synchronization is healthy.', 'For a browser timeout check route, DNS and management tests. For clock drift check NTP reachability and service state, not just the displayed timezone.'),
], 'Where should a failed management change be recovered?', ['Through the recorded host console using the previous settings', 'By changing the VM application address at random'] );
l('vcenter', 'Understand and deploy vCenter when entitled', 'Walk through the appliance deployment without depending on a free trial.',
  'vCenter is the central office; it is itself a VM with its own resources and recovery needs.', [
  s('Check the appliance deployment prerequisites', 'Authorized vCenter environment or walkthrough · installer stage 1', 'A working ESXi host, DNS and resource plan come first.', [
    'If you lack the authorized installer and entitlement, read this chapter as a walkthrough or use the hosted lab. The free ESXi edition cannot supply a vCenter-managed lab.',
    'For an authorized new installation, verify compatible ESXi/vCenter versions, sizing, private DNS forward/reverse records, a reserved appliance address and time sources. Obtain a supported target datastore with enough real free space.',
    'Mount the authorized VCSA ISO on the admin workstation. Open vcsa-ui-installer for that operating system → Installer → Install. Read the stages and license terms. Enter the planned destination ESXi host and local credentials only in the verified installer.',
  ], 'You can state the legal access route, target host, appliance identity and sizing.', 'Stop on entitlement, version, name-resolution, certificate-identity or capacity failures.'),
  s('Finish the two stages and distinguish the interfaces', 'VCSA installer → Deploy appliance, then Set up appliance', 'Creating the VM and configuring its services are separate stages.', [
    'In stage 1, name the appliance VM, set its root password locally, choose the documented deployment size, datastore and network. Enter the planned FQDN, address, prefix/mask, gateway and DNS. Review everything before Finish.',
    'In stage 2, configure time synchronization and the intended SSO domain. The SSO domain is vCenter’s login directory, not your Active Directory domain. Set its administrator password locally and keep recovery records protected.',
    'After completion, open https://<vcenter-fqdn>/ui for vSphere inventory. Open https://<vcenter-fqdn>:5480 for appliance management (VAMI). Verify each identity, sign in to the proper interface, and record service health and build.',
  ], 'You can explain stage 1 versus stage 2, SSO versus appliance root, and /ui versus :5480.', 'Inspect the failed stage’s error and logs. Do not deploy another appliance with the same name/IP or delete the target datastore to retry.'),
], 'Which statement is correct?', ['The vSphere Client manages inventory; VAMI manages the appliance', 'They are the same page with the same purpose'] );
l('connect', 'Create inventory and connect ESXi', 'Add only a known host to an authorized vCenter.',
  'A datacenter is a filing cabinet for inventory, not a new physical building created by a button.', [
  s('Create the training inventory and add a host', 'vCenter route · vSphere Client → Hosts and Clusters', 'Organized inventory and verified host identity make later actions safer.', [
    'In vSphere Client, right-click the intended vCenter → New Datacenter; enter LAB-DC. Right-click LAB-DC → Add Host. Enter the planned ESXi FQDN and its authorized administrator credentials.',
    'Check any presented host fingerprint using the trusted host console or established certificate record. Review discovered identity, VMs, license and lifecycle/image choices against the lab plan. Do not change lockdown or management policy blindly.',
    'Review Ready to complete → Finish. In Recent Tasks wait for success, then open the host Summary. Confirm Connected state, correct build, management name, expected datastores and VMs.',
  ], 'The intended host is Connected under LAB-DC, with matching identity and inventory.', 'If connection fails, check DNS from vCenter, time, version compatibility, required network paths and license. Never remove a working production host to practice.', null, [308382, 411381]),
  s('Learn from an official host compatibility failure', 'Official vCenter 8 Add standalone host reference', 'A wizard failure can mean incompatible versions rather than a bad password.', [
    'Read the numbered vendor image. This specific example concerns old ESXi 7 builds and image management in vCenter 8. It is not a recommended version combination.',
    'For your build, use the interoperability and lifecycle documentation. Resolve the exact precheck cause before retrying; do not bypass licensing or force a mismatched image.',
  ], 'Your troubleshooting notes separate identity, access, license and compatibility checks.', 'Keep the host in its known working state while you resolve the precheck.', 'host-precheck', [313403]),
], 'The Add Host wizard reports an incompatible version. What next?', ['Check the supported combination and exact precheck', 'Retry with a different unrelated datastore'] );
l('network', 'Understand switches, uplinks and VMkernel ports', 'Draw the network path before editing a port group.',
  'A virtual switch is a hallway, an uplink is the door outside, and a port group labels which hallway a VM may use.', [
  s('Read the current network without changing it', 'Host Client → Networking; vCenter → host → Configure → Networking', 'Management, VM, storage and migration traffic do different jobs.', [
    'List standard switches, physical NICs (vmnic), VMkernel interfaces (vmk) and VM port groups. Mark which vmk carries management; do not edit it for this exercise.',
    'Trace one VM: its virtual NIC → port group → virtual switch → physical uplink → physical switch/VLAN. For two VMs on an isolated same-host switch, the path stays inside the host.',
    'A VMkernel interface belongs to the host for services such as management, NFS/iSCSI or vMotion. It is not the Windows or Linux VM’s own network address. A distributed switch is centrally managed by vCenter and needs the relevant licensing.',
  ], 'Your sketch identifies management separately from the test VMs and their uplink path.', 'If you cannot identify management traffic, stop before making any network change.'),
  s('Interpret an uplink warning correctly', 'Official VMware/Broadcom networking wizard reference', 'A NIC shown in a list may not be assigned to the switch.', [
    'The numbered reference shows the Add Networking adapter selection and its warning. Inspect whether adapters are unclaimed, active, standby or unused.',
    'For a network meant to reach outside the host, assign only the planned spare adapter and verify physical configuration. Never move the only management uplink for this beginner exercise.',
    'For our intentionally isolated same-host lab, no uplink is expected. Document that exception: this switch cannot reach other hosts or an external gateway.',
  ], 'You can explain whether no uplink is intentional isolation or an actual configuration error.', 'Cancel if the wizard would remove an active management connection. Return to the recorded network map.', 'uplink-warning', [443156]),
], 'Does a VM port group give the ESXi host its management IP?', ['No; the host uses a VMkernel interface', 'Yes; every port group is a host IP'] );
l('portgroups', 'Create an isolated switch and port group', 'Give test VMs a network without touching management.',
  'Build a small practice hallway first; do not rebuild the main entrance while people are using it.', [
  s('Create the isolated standard switch', 'Standalone Host Client → Networking → Virtual switches; vCenter equivalent noted below', 'An isolated test switch avoids changing the host’s existing uplink.', [
    'In Host Client choose Add standard virtual switch. Name it vSwitch-LAB-Isolated, leave MTU at the documented default (1500), and leave uplinks unassigned for this same-host exercise. Review and add.',
    'In vCenter the equivalent entry is host → Configure → Networking → Virtual switches → Add Networking → Virtual Machine Port Group for a Standard Switch → New standard switch. Do not select existing management NICs.',
    'An explicit no-uplink warning is expected only for this planned isolated exercise. Confirm its meaning before proceeding. This network has no external gateway or cross-host connectivity.',
  ], 'The new switch has the intended name, no uplink, and the management switch is unchanged.', 'Delete only the unused newly created lab switch if it was wrong; do not delete or modify the original switch.', 'uplink-warning', [443156]),
  s('Create LAB-Isolated and attach only test VMs', 'Host Client → Networking → Port groups → Add port group', 'VMs choose a port group, not a physical cable directly.', [
    'Enter LAB-Isolated, select vSwitch-LAB-Isolated and VLAN ID 0 for the untagged exercise. Keep security policies at their defaults. In vCenter, complete Connection settings with the same network label and untagged VLAN choice.',
    'Edit two disposable VMs on the same host. Select LAB-Isolated for each network adapter and connect the adapter. In the guests use two unused addresses in the same planned private subnet; no gateway is needed for their same-subnet test.',
    'Test the intended service between the two VMs. If using ping, remember a guest firewall can block it. This isolated switch does not permit an internet test, and matching port-group names on another host do not connect the hosts.',
  ], 'Both same-host test VMs use LAB-Isolated and reach the agreed test service while management stays reachable.', 'Restore each VM’s recorded prior port group. Check guest IP/firewall and NIC state before changing host networking.'),
  s('Use VLANs only with an end-to-end plan', 'Network map · optional external port group design', 'A VLAN number alone cannot create physical connectivity.', [
    'For a later approved external exercise, obtain the VLAN and switchport design from the network owner. An access port and a tagged trunk require different guest/port-group choices; never guess from the screenshot.',
    'Record port-group name, VLAN, vSwitch and intended uplink on each participating host. A standard port group is configured per host. Do not use VLAN 4095 as a generic fix; it has special guest-tagging meaning.',
  ], 'Your plan describes the same VLAN path through VM, vSwitch, uplink and physical network.', 'If tagging is unclear, remain on the isolated lab network and ask the network owner.'),
], 'Two isolated switches on different hosts have the same name. Can the VMs talk across hosts?', ['No; a shared name does not provide an uplink path', 'Yes; the label joins them automatically'] );
l('storage', 'Inspect disks and create a practice VMFS datastore', 'Tell a device, a datastore and a VM disk apart before formatting.',
  'The storage device is the cupboard; the datastore organizes it; a VM disk is one box inside.', [
  s('Identify the storage device safely', 'Host Client → Storage → Devices and Datastores', 'Formatting the wrong device can destroy several VMs at once.', [
    'Record the boot device, existing datastores and the separate blank practice device. Compare its stable ID, capacity and existing partitions with the plan. Device names can change; capacity alone is not enough.',
    'The vendor reference shows a disk/partition view used to diagnose unavailable storage. Existing partitions are a reason to stop and identify ownership, not permission to clear them.',
    'If a device is missing, inspect controller/path visibility and rescan only under your approved procedure. Do not clear partition tables or force-mount unfamiliar storage to make a wizard offer it.',
  ], 'One explicitly blank disposable device is positively identified and is separate from boot and existing data.', 'Stop if the disk is in use or its origin is uncertain. Keep all existing partitions intact.', 'disk-partitions', [410154]),
  s('Create VMFS only on that blank device', 'Host Client → Storage → Datastores → New datastore', 'VMFS organizes block storage for VM files.', [
    'Choose Create new VMFS datastore, enter LAB-VMFS01 and select only the recorded blank device. In vCenter use host → Actions → Storage → New Datastore → VMFS.',
    'Choose VMFS 6 for this vSphere 8 lab. Inspect the partition preview and final target identifier before Finish. Creation formats the selected capacity; continue only on the approved disposable device.',
    'After the task succeeds, inspect capacity, free space and accessible host(s). Create a small folder such as LAB-ISOs in the datastore browser. A local device is not shared storage just because vCenter can display it.',
  ], 'LAB-VMFS01 is accessible on the intended host with expected capacity; existing datastores remain intact.', 'Cancel before Finish if any identifier differs. After creation, do not format again to resolve a refresh delay.', null, [410154]),
  s('Keep capacity headroom and grow carefully', 'Datastore → Summary / capacity; VM → Edit Settings', 'Thin disks can promise more space than is currently free.', [
    'Compare datastore capacity, used/free space and provisioned VM disk sizes. Thin provisioning grows as data is written; it does not create physical capacity. Reserve headroom for snapshots, swap, operations and expected growth.',
    'To expand storage later, first follow the storage owner’s supported device expansion procedure, then the datastore’s Increase capacity workflow. Verify the stable device ID and new capacity. Do not add arbitrary extents.',
    'Growing a VM disk, a datastore and a guest partition are three separate actions. Do not assume any can be safely shrunk through the same wizard.',
  ], 'Your record distinguishes actual free space, promised space and the three growth layers.', 'For low capacity, stop new allocations and identify growth. Never delete unidentified VMDKs or snapshot files to free space.'),
], 'Does thin provisioning create extra physical storage?', ['No; actual datastore capacity still limits growth', 'Yes; thin disks can never fill a datastore'] );
l('nfs', 'Mount and check a shared NFS datastore', 'Connect an existing approved export without formatting it.',
  'NFS is a shared cupboard in another room; mounting it means opening the door, not rebuilding it.', [
  s('Check the storage path before mounting', 'Storage plan · NAS owner · ESXi network view', 'The host needs a permitted path to the exact export.', [
    'Obtain the NAS address, export path, supported NFS version and allowed host addresses from the storage owner. Confirm a host VMkernel path can reach that storage network.',
    'Use the NAS’s approved permissions and identity design. NFS 3 and NFS 4.1 have different setup requirements; do not substitute one because the wizard fails.',
    'For several hosts, document exactly which hosts must access the same backing export. Our isolated VM-only switch is not a storage uplink.',
  ], 'The export, NFS version, allowed hosts and network path are documented.', 'Resolve routing, export permissions and version requirements before creating mount entries.'),
  s('Add the approved NFS datastore and validate access', 'Host Client → Storage → New datastore → Mount NFS datastore', 'A mount should expose the existing share without erasing it.', [
    'Enter LAB-NFS01, the planned server and exact share path; choose the supported version. In vCenter select New Datastore → NFS, then the version and permitted hosts. Review before Finish.',
    'Confirm accessible state and expected capacity on every intended host. With approval, create a uniquely named small test folder/file and verify it is visible from the participating hosts.',
    'Remove only the test artifact after recording success. Unmounting a datastore is a separate maintenance operation; never unmount while VMs, ISO mounts, swap or other dependencies still use it.',
  ], 'All intended hosts access the same export and a harmless write/read check passes.', 'For read-only or inaccessible mounts inspect permissions and network reachability. Do not change the export to world-writable.'),
], 'Does mounting NFS format the NAS share?', ['No; it connects to an existing export', 'Yes; mount always clears the share'] );
l('vm', 'Create a small application-server VM', 'Choose compute, disks and network deliberately.',
  'A VM is a new room. Give it only the furniture it needs.', [
  s('Open the new VM wizard and choose its home', 'Host Client → Virtual Machines → Create/Register VM; vCenter → New Virtual Machine', 'The wizard assigns both compute and storage.', [
    'Choose Create a new virtual machine and enter LAB-APP01. In vCenter select the training folder and intended host/cluster; in Host Client the current host is the compute destination.',
    'Select compatibility supported by the actual target hosts and the correct guest OS family/version. Choose LAB-VMFS01 or the approved lab datastore and the intended storage policy when offered.',
    'Set a modest OS-supported starting CPU and memory size using your resource plan. More vCPUs are not automatically faster. Choose the planned virtual disk size and provisioning policy, leaving growth headroom.',
  ], 'The summary names the intended VM, compute location, OS type and datastore.', 'Before Finish, correct an unexpected host, policy or storage destination; do not compensate by moving unrelated workloads.'),
  s('Connect the correct network and installer', 'New VM → Customize hardware / VM → Edit Settings', 'An unplugged virtual cable looks like a network failure inside the server.', [
    'Choose LAB-Isolated for the first network adapter. For a powered-on test VM, Connected controls its present cable state; Connect at power on controls the next boot. Use the approved NIC model for the guest.',
    'For an OS install select the authorized datastore ISO in CD/DVD settings and Connect at power on. Use a clean supported ISO; verify its checksum before upload. Review VM options and firmware against OS requirements.',
    'Finish, wait for the task, and open the console before powering on. The official picture is a NIC connection reference, not proof an OS was installed.',
  ], 'The intended NIC and installer settings are visible and the VM creation task succeeds.', 'If network or ISO is absent, check the selected backing and both connection flags. Do not attach a test VM to management to get internet.', 'vm-network', [413851]),
], 'What does Connect at power on control?', ['Whether that virtual device connects when the VM starts', 'The ESXi management address'] );
l('guest', 'Install and validate the guest server', 'Turn a created VM into a healthy, identifiable operating system.',
  'An empty room is not yet a working office.', [
  s('Install the operating system and guest tools', 'LAB-APP01 console · OS installer', 'The hypervisor creates hardware; the guest installer creates the server.', [
    'Boot the authorized OS media. Confirm the installer sees only the VM’s intended virtual disk. Select that virtual disk, set the unique guest name and administrator credentials locally, and finish the OS-specific installation.',
    'After successful boot, install supported VMware Tools on Windows or the distribution-supported open-vm-tools on Linux. Apply OS updates using an approved temporary update path or offline repository; the isolated exercise has no internet route.',
    'Disconnect the installation ISO after use so later migrations do not depend on an old datastore. Preserve the approved boot disk and firmware settings.',
  ], 'The correct OS boots from its virtual disk, guest tools report healthy, and installer media is disconnected.', 'For No boot device, check firmware, boot order, ISO and disk selection. Do not recreate the disk or change controller types blindly.', 'vm-cdrom', [413851]),
  s('Check identity and network from inside the guest', 'Guest console and approved peer VM', 'Powered on is not the same as a working service.', [
    'Windows: run hostname and ipconfig /all. Linux: run hostnamectl and ip -br address. Compare the actual hostname and IP with the lab plan.',
    'Verify the intended DNS/time settings and guest firewall rules. On the isolated same-host lab, test the agreed service with the peer VM; an external gateway test is not expected to pass.',
    'Record vCenter/Host Client Tools state, guest identity, disk free space and the service test. Avoid hard Power off; use Shut down guest OS when tools and the guest are responsive.',
  ], 'The guest has a unique identity and the agreed peer/service test succeeds.', 'Check disconnected NIC, port group, same-subnet IP and guest firewall in that order before changing the host.'),
], 'A VM is Powered on. Is the application proven healthy?', ['No; test the guest and actual service', 'Yes; power state proves the application works'] );
l('templates', 'Prepare and deploy a reusable template', 'Make clean copies without duplicating server identity.',
  'A template is a clean recipe, not yesterday’s running meal.', [
  s('Prepare a safe golden VM', 'vCenter route · dedicated non-domain-controller golden VM', 'A template must not carry production secrets or duplicate identity.', [
    'Use a separate nonproduction golden VM, not a domain controller, PKI CA or existing application database. Patch the OS, install supported guest tools and record its OS/build and purpose.',
    'Remove personal files, cached deployment secrets and unneeded ISO connections. Plan OS-specific guest customization: Windows uses the supported Sysprep workflow; Linux must receive unique host keys, machine identity and network settings through its supported customization process.',
    'Do not manually strip identities with guessed commands. Check the guest OS customization support matrix and the approved image preparation procedure. Shut the prepared VM down cleanly.',
  ], 'The golden VM has documented preparation, unique-identity handling and no unintended attached media.', 'Do not clone a running production server as a shortcut. Return to a disposable golden VM and validated OS preparation.'),
  s('Clone to template and deploy a test copy', 'vSphere Client → VMs and Templates → golden VM → Clone', 'A copy should become a new server, not impersonate the original.', [
    'Right-click the prepared VM → Clone → Clone to Template. Choose a versioned name such as LAB-Alma-Golden-v1, training folder, compute resource and datastore. Review storage capacity and wait for the clone task.',
    'Right-click the template → New VM from This Template. Name the new VM LAB-APP02, choose its folder, compute and storage, and select the approved guest customization specification when appropriate. Review NIC mapping before first power-on.',
    'Boot on the isolated lab network first. Verify the new hostname, IP, OS identity, guest tools and application baseline; verify the golden VM remains unchanged. Templates are vCenter functionality, not a promised free Host Client feature.',
  ], 'A new VM boots with unique identity and correct resources while the master stays unchanged.', 'For a duplicate IP or identity, disconnect the clone’s NIC and correct customization. For a missing template option check interface, privileges and license.'),
  s('Confirm the clone’s virtual cable before blaming customization', 'VM → Edit Settings → Network Adapter', 'A correctly customized server can still have its virtual cable disconnected.', [
    'Compare the template and deployed VM’s intended port group. Check Connected for a running clone and Connect at power on for future boots.',
    'Enable networking only after identity conflicts are ruled out. Use the guest console to verify the actual address, then test the agreed service. A green cloning task does not prove connectivity.',
  ], 'The deployed VM has both unique identity and a tested connection on the right port group.', 'Keep the NIC disconnected while duplicate identity or IP issues remain.', 'vm-network', [413851]),
], 'Should the template contain the production server’s fixed hostname and IP for every clone?', ['No; each deployed server needs its planned unique identity', 'Yes; duplicates make deployment easier'] );
l('library', 'Organize templates and installation media', 'Use Content Libraries without confusing them with backup.',
  'A library is a shelf of approved recipes; it still needs storage and an owner.', [
  s('Create a local Content Library when vCenter is available', 'vSphere Client → Menu → Content Libraries → Create', 'A managed catalog helps people choose known versions.', [
    'Choose a descriptive name such as LAB-Approved-Images, select the intended vCenter and a Local content library. Leave publishing disabled for this private exercise. Select the approved backing datastore and review before Finish.',
    'Import only approved ISO/OVF/OVA artifacts using the library’s Import item action. Verify publisher, checksum, size and expected network/disk mappings before deploying an appliance.',
    'Record item version, owner and purpose. OVF/OVA library items and VM Template (VMTX) items have different lifecycle and synchronization behavior. A library is not an independent backup of a running VM.',
  ], 'The local library contains only approved versioned items on the intended storage.', 'If import fails, inspect privileges, free space, format and reachability. Do not publish the library publicly to fix access.', null, [396400, 423112]),
  s('Update an image and retain a known-good version', 'Content Library or VMs and Templates · test clone', 'A bad master repeats the same mistake on every deployment.', [
    'Create a new versioned golden image through the supported workflow; patch and test a disposable clone before making it the recommended image. Preserve the last known-good master until the new one is accepted.',
    'For VM templates in Content Libraries, use the supported check-out/check-in workflow when available for that version and permissions. Do not assume that synchronizing OVF items also synchronizes all VMTX templates.',
    'Deleting a VMTX library item can remove its template inventory object. Retire only the recorded unused item after checking dependencies and retention; never delete the whole datastore to clean a library.',
  ], 'A test deployment validates the new version, and the previous accepted version remains recoverable.', 'If a new version fails, stop publishing/deploying it and select the retained tested version.', null, [396400]),
], 'Is a Content Library a backup of all running VMs?', ['No; it catalogs deployment artifacts', 'Yes; it automatically protects every guest disk'] );
l('snapshots', 'Use snapshots for short changes, not backup', 'Take a small recovery point and clean it up correctly.',
  'A snapshot is a temporary bookmark in the same book; it is not another copy stored safely elsewhere.', [
  s('Take a temporary snapshot of a disposable VM', 'VM → Snapshots → Take Snapshot', 'A short change checkpoint can help only while its disk chain and storage stay healthy.', [
    'Check real datastore headroom and existing snapshots first. For a simple practice change, shut down the test guest cleanly, then take a snapshot named LAB-before-change with an owner, reason and removal deadline.',
    'For powered-on workloads, choose memory or guest filesystem quiescing according to the application-approved procedure; they are not interchangeable and are mutually exclusive in this workflow. Do not assume a snapshot is application-consistent.',
    'Wait for task success and inspect Manage Snapshots. Use the numbered vendor reference to identify the snapshot list and current state; do not copy the vendor’s example names.',
  ], 'The intended VM has one recorded short-lived recovery point and enough datastore space remains.', 'For snapshot errors or low free space, stop changes and investigate. Do not delete delta files from the datastore browser.', 'snapshot-manager', [342618, 344559]),
  s('Understand Revert versus Delete and Consolidate', 'Disposable VM → Snapshots → Manage Snapshots', 'These buttons do different things to the VM’s history.', [
    'Make a harmless guest test-file change. Revert only in this disposable exercise when losing changes since the snapshot is intended. Confirm the exact snapshot and recovery consequence before accepting.',
    'After accepting the desired current state, Delete removes a snapshot checkpoint while preserving current disk changes through consolidation; it does not mean revert. Wait for completion and verify the guest again.',
    'Check for a consolidation-needed alert and sufficient free space; use the supported Consolidate workflow only after reviewing the cause and dependencies. Never remove a VMDK or delta file by hand.',
  ], 'You can explain the buttons, the guest works, and no abandoned practice snapshot or consolidation alert remains.', 'For a failed consolidation, preserve the disk chain and collect task/storage errors. Escalate rather than manually unlinking files.', 'vm-disk-settings', [342618, 344559]),
], 'What does deleting a snapshot normally do?', ['Remove the checkpoint while keeping the current disk state', 'Automatically return the VM to the old state'] );
l('mobility', 'Move VMs and understand clusters', 'Know when migration, HA and DRS are different tools.',
  'Moving a room, restarting it after a building fault, and balancing busy rooms are different jobs.', [
  s('Create a cluster only when the prerequisites exist', 'vCenter route → Hosts and Clusters → LAB-DC → New Cluster', 'A cluster groups hosts; it does not create extra capacity or a backup.', [
    'For an authorized two-host lab, confirm compatible hosts, licensing, networking, accessible storage and spare capacity. Right-click the lab datacenter → New Cluster and name LAB-Cluster. Enable HA/DRS only when those capabilities and their prerequisites are approved.',
    'Follow the cluster workflow to add the intended hosts and review compatibility, lifecycle image and resource settings. Do not move management networking or apply vSAN/NSX changes as part of this beginner exercise.',
    'HA can restart affected VMs after a host failure; it is not continuous application availability or backup. DRS balances placement/resources; it does not repair application faults. Review HA admission control so a surviving host has capacity.',
  ], 'You can explain cluster membership, spare capacity, HA restart and DRS placement separately.', 'Without two permitted compatible hosts and licensed features, complete this as a design walkthrough.'),
  s('Perform a small permitted migration', 'Disposable VM → Migrate', 'Compute migration and storage migration solve different problems.', [
    'Before vMotion, verify compatible CPU/EVC design, supported licensing, working vMotion VMkernel paths, destination port group/VLAN and destination storage visibility. With our isolated no-uplink switch, cross-host guest connectivity is not available.',
    'Choose Migrate → Change compute resource only for an approved compute move, then select the destination and read every compatibility check. Storage-only and combined moves have separate requirements; do not assume shared storage is always required for every migration type.',
    'Finish only a clean precheck in the permitted lab. Watch Recent Tasks, verify the new host/datastore/network as applicable, then test the actual guest service. If live migration is unavailable, use an approved cold migration with documented downtime or remain in walkthrough mode.',
  ], 'The intended location changes and the agreed guest service works after the move.', 'Do not force failed prechecks. If guest networking fails, inspect the destination port group/VLAN path and return by the approved recovery procedure.'),
], 'Is HA the same as vMotion?', ['No; HA may restart after failure, while vMotion moves a running VM under supported conditions', 'Yes; both are backups'] );
l('monitor', 'Do the daily health check', 'Look at tasks, capacity and symptoms before changing settings.',
  'Check the dashboard lights, then find the cause; hiding the light does not repair the engine.', [
  s('Review health and the latest task failure', 'Host/cluster/VM → Summary and Monitor → Tasks and Events', 'The exact failed task is often more useful than a general alarm color.', [
    'Start with disconnected hosts, hardware/storage/network health, datastore free space, old snapshots and failed backup jobs. Note object, time, severity and the first relevant error.',
    'For a failed operation open Recent Tasks or Monitor → Tasks and Events. Read the full error and related event timeline; distinguish a warning from the actual failure.',
    'Acknowledge an alarm only to show an owner is investigating. Do not reset to green until its underlying condition and recovery are verified.',
  ], 'Your daily record names real findings, owner and next action rather than only a green screenshot.', 'For missing metrics confirm the selected object, time range and permissions before restarting services.'),
  s('Troubleshoot one slow VM by evidence', 'VM → Monitor → Performance; guest operating system', 'CPU, memory, storage and the application can each cause slowness.', [
    'Record when the symptom occurs and the affected service. Compare guest CPU/memory/disk with host utilization, CPU scheduling pressure, memory reclamation and datastore latency over the same time window.',
    'Check whether only one VM or several VMs on the same datastore/host are affected. Check recent changes and snapshot growth before adding resources.',
    'Change one approved variable at a time and retest the service. Adding vCPUs, disabling security or power-cycling the host is not a first diagnostic step.',
  ], 'You have a time-aligned symptom, suspected layer and a test that can confirm or reject it.', 'If the evidence does not identify a cause, collect performance/task logs and escalate without making broad changes.'),
], 'Does acknowledging an alarm repair its cause?', ['No; it records that someone is handling it', 'Yes; acknowledgment fixes the server'] );
l('permissions', 'Give administrators the access they need', 'Use named accounts, scoped roles and protected management access.',
  'A person needs a key to the right room, not the master key to the whole building.', [
  s('Assign a small scoped role and test it', 'vCenter → inventory object → Permissions; Administration → Roles', 'Least privilege reduces accidental changes and improves accountability.', [
    'Use the organization’s approved identity source and named administrator groups. For practice, use a dedicated test account and training VM folder; never use a shared root account for daily vCenter work.',
    'Start with the approved read-only role on that lab folder. Set propagation intentionally, then test what the account can see and do. Additional VM deployment rights may also be required on datastore, network and compute objects.',
    'Record effective scope and keep emergency access protected and tested. Do not grant global Administrator merely to make a single deployment work.',
  ], 'The test account has the intended access to the intended lab objects and cannot modify unrelated objects.', 'If a task is denied, inspect the specific missing privilege and relevant objects before changing the role.', null, [423112]),
  s('Keep certificates and management services under control', 'Host and vCenter administration · approved security process', 'Management is powerful and should not be exposed as a public website.', [
    'Restrict management access to approved private networks. Use trusted certificates and monitor their expiry; follow the separate PKI class for certificate concepts rather than disabling validation.',
    'Keep SSH and ESXi Shell off unless needed for a named task. Document any temporary enablement, time limit and closure. Apply supported MFA/identity controls through the organization’s supported design.',
    'Review login failures, certificate dates and account lifecycle. Never put license keys, passwords or authentication tokens in screenshots or support notes.',
  ], 'The management path, named accounts, certificate owner and temporary-service policy are documented.', 'For an unexpected certificate or access request, verify identity and authorization before proceeding.'),
], 'A deployment lacks one privilege. Should you make the user global Administrator?', ['No; grant only the validated required scope', 'Yes; it is the normal fix'] );
l('patching', 'Plan maintenance and patch one host safely', 'Protect capacity and recoverability before remediation.',
  'Close one classroom for repairs only after its students have a safe place to go.', [
  s('Run a version, license and recovery preflight', 'Change record · host/cluster → Updates / Lifecycle Manager when licensed', 'A supported update needs compatible firmware, drivers, versions and a way back.', [
    'Record current and target builds, supported upgrade path, hardware compatibility, OEM add-on, firmware and extension requirements. Confirm authorized software/repository access and the approved vCenter/ESXi upgrade order.',
    'Check recent backups and restore evidence, free datastore capacity, management recovery access, active tasks and cluster spare capacity. vCenter file-based backup and VM workload backups are separate.',
    'Free ESXi is not managed by vCenter Lifecycle Manager. Follow only the supported standalone procedure for its exact edition and available software. Do not turn entitlement errors into requests to reset trials or force an unsupported patch.',
  ], 'The preflight records the supported target, dependencies, access and recovery procedure.', 'Stop for failed compatibility, missing entitled software, no restore path or insufficient evacuation capacity.', null, [399823, 416328]),
  s('Evacuate, maintain, verify and return', 'Authorized lab host → Maintenance Mode; approved update workflow', 'Running VMs must be accounted for before a host reboot.', [
    'On a standalone host, shut down each guest cleanly and document downtime. On a compatible licensed cluster, evacuate VMs through the approved migration workflow and verify the destination service state.',
    'Enter Maintenance Mode and confirm no unexpected workload remains. vSAN, NSX and VCF systems require their own product-specific procedures; do not apply a generic maintenance recipe to them.',
    'Run the approved update/remediation, watch prechecks and reboot through the documented process. Verify build, hardware/storage/network/time health before exiting Maintenance Mode and returning test workloads.',
    'Test the guest service and monitor for new alarms. If boot or driver checks fail, use the preapproved console/recovery procedure and preserve logs; do not improvise an unsupported downgrade.',
  ], 'The host returns on the intended build with healthy dependencies and tested workloads.', 'Keep the host out of workload service if postchecks fail; escalate using the recorded recovery plan.'),
], 'What must happen before rebooting a single standalone host?', ['Account for and cleanly shut down its guests, with planned downtime', 'Nothing; HA always exists on every host'] );
l('backup', 'Back up vCenter and test real recovery', 'Separate appliance backup, VM backup and snapshots.',
  'A recovery plan needs a spare copy and a practiced way to use it.', [
  s('Configure a protected vCenter file-based backup', 'vCenter route · VAMI https://<vcenter-fqdn>:5480 → Backup', 'The central office needs its own recovery copy outside the appliance.', [
    'Use the verified VAMI interface and the permitted appliance administrator account. Select Backup → Backup Now or the supported schedule configuration.',
    'Enter an approved remote backup destination such as sftp://backup.lab.example.test/<approved-folder>. Provide its least-privilege credentials locally and use the approved encryption/secret-retention policy. Do not use a datastore on the same single host as your only recovery copy.',
    'Review data selection, schedule, retention and destination reachability. Start the backup and inspect the result; creating a schedule alone does not prove a backup exists.',
  ], 'A protected independent destination is configured and an actual backup job is recorded.', 'On failure inspect the job message, path, credentials, transport and capacity; preserve previous good backups.', 'backup-home', [375278]),
  s('Verify backup files and plan an isolated restore', 'VAMI Backup → Activity; backup repository; recovery runbook', 'A successful task is useful evidence, but only a restore test proves recovery.', [
    'Inspect the job status, timestamp and destination, then confirm expected files exist on the backup system. Keep encryption secrets in the approved secret store, not beside the public course worksheet.',
    'Record the compatible installer/build and supported file-based restore procedure. Rehearse in an isolated authorized recovery network; never start a restored vCenter beside the live instance using the same identity.',
    'Separately protect VM workloads with supported guest/application or image-level backups and test a restored test service. Free ESXi lacks VADP integration; do not promise a commercial image-backup workflow will work with it.',
  ], 'You have backup-file evidence and a documented, isolated restore test with clear scope and owner.', 'If no restore was performed, label recovery untested. A vCenter configuration backup does not mean the application VM disks are backed up.', 'backup-status', [375278, 399823]),
], 'Does a vCenter file-based backup protect all application VM disks?', ['No; workload backups are separate', 'Yes; it automatically includes every virtual disk'] );
l('capstone', 'Complete the junior administrator handoff', 'Build or rehearse one small server service and explain its recovery.',
  'A good administrator leaves a clear map so the next person can help.', [
  s('Build the evidence pack', 'Downloadable administrator-checklist.md · your actual lab record', 'Clear evidence shows what was done and what remains untested.', [
    'Record access route, actual versions and licenses, host identity, management/DNS/time checks, datastore device and capacity, port-group path and the test VM’s resources.',
    'Add screenshots of the actual VM, network and storage checks with secrets hidden. Keep vendor references labeled vendor references. Without a lab, submit a design walkthrough instead of invented execution evidence.',
    'For a vCenter-capable lab add template deployment with unique identity, a permitted migration, role check, maintenance preflight and independent backup/restore evidence. For standalone ESXi mark unsupported tasks as not available under this edition.',
  ], 'The evidence pack distinguishes passed live checks, walkthroughs, unsupported features and remaining gaps.', 'Do not mark a live pass merely because the quiz is correct or the screenshot resembles the guide.'),
  s('Hand off the service and its recovery steps', 'Test client · owner/change record', 'The point is a working, maintainable service—not only a powered-on VM.', [
    'From the permitted client test the agreed service and record the expected response. State who owns the guest OS, application, host, network, storage and backup.',
    'Record the previous known-good state, recovery triggers and exact objects involved. Identify expired snapshots, capacity alarms, update windows, backup retention and certificate renewals that need follow-up.',
    'Clean up only named disposable artifacts after checking dependencies. Confirm the management connection and unrelated VMs remain healthy. Preserve the plan and restore evidence for the next administrator.',
  ], 'Another administrator can find the service, understand its limits and follow a documented recovery path.', 'If any required check fails, record the fault, owner and next action instead of declaring the environment complete.'),
], 'What is the strongest completion evidence?', ['A tested service with documented identity, dependencies and recovery limits', 'A green power icon alone'] );
const course = {
  id: 'vsphere-administration', title: 'VMware vSphere System Administration',
  description: 'From first host to daily operations: ESXi, vCenter, port groups, datastores, servers, templates, monitoring and recovery.',
  baseline: 'vSphere 8 workflow baseline · official VMware/Broadcom reference screenshots · no local vCenter evaluation required · exact-version checks required',
  prerequisite: 'Start with the everyday explanations. Choose official-screen walkthrough, permitted standalone ESXi practice, or an available authorized vCenter/Hands-on Labs environment. Free ESXi cannot be managed by vCenter.',
  supplies: ['A private authorized lab or the walkthrough route; this website does not install or administer a host.', 'A written network/storage plan and recovery access before any change. Existing Windows and AlmaLinux VMs are not repurposed.', 'Vendor screenshots are attributed references with visible version/context limits. No live ESXi/vCenter validation is claimed by CloudSeam Tech.'],
  sources, lessons,
};
lessons[2].steps[0].downloads = [{ title: 'Download the lab plan', href: '/vsphere-lab/lab-plan.md' }];
lessons.at(-1).steps[0].downloads = [{ title: 'Administrator evidence and handoff checklist', href: '/vsphere-lab/administrator-checklist.md' }];
fs.mkdirSync(path.join(root, 'content/vsphere'), { recursive: true });
fs.writeFileSync(path.join(root, 'content/vsphere/course.json'), JSON.stringify(course, null, 2) + '\n');
console.log(`Authored ${lessons.length} vSphere chapters / ${lessons.reduce((n,l)=>n+l.steps.length,0)} steps.`);
