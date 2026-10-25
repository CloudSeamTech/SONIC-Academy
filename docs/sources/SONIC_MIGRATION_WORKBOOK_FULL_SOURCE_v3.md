HANDS-ON / BEGINNER LEVEL

FROM HOME LAB
TO CLOUD MIGRATION

A click-by-click migration worksheet: Active Directory, WSUS, SQL Server, MECM and Azure

VMware Workstation Pro • Windows Server • SQL Server • Configuration Manager • Azure

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>THE MISSION</strong></p>
<p>Pretend a small agency is moving into a bigger enterprise domain. Build the old agency, build a new destination domain, move one test server safely, then explore how to repeat the process in Azure.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

For beginners: every click, the reason it matters, a PASS CHECK, troubleshooting, and space for notes. Start local; pay for Azure only when ready.

## What you will be able to do

**\[ \]** Build and verify two on-prem domain controllers and an application server.

**\[ \]** Create a separate destination Active Directory forest (not merely a DNS zone).

**\[ \]** Back up and import a test Group Policy, and move a member server into the new domain.

\[ \] Build SQL Server, create a test database, back it up to .bak, restore it, and explain what does NOT carry over.

## Your lab promises

\[ \] Build an MECM (Configuration Manager) primary site on its own server connected to a supported SQL Server instance.

**\[ \]** No real DoD information, systems, credentials, or production networks.

**\[ \]** No exposing Active Directory, RDP, LDAP, or SMB ports to the public internet.

\[ \] Start local and cheap; in Azure, use budgets, timed lab sessions, deallocation, and cleanup.

Version 3.0 \| October 15, 2026 \| Independent learning lab, NOT an official DISA or production implementation guide.

LAB 00 / START HERE

# Pick your training route

The complete course has a working local path and a separate Azure extension. You can succeed even before you spend money in Azure.

| **Route**               | **Machines**                            | **You finish with**                                                 |
|-------------------------|-----------------------------------------|---------------------------------------------------------------------|
| Core (recommended)      | DC01, DEST-DC01, APP01 (3 local VMs) | Two distinct domains, test GPO transfer, member-server domain move. |
| Agency replica (add-on) | Add DC02 (4 local VMs)               | Real same-domain AD replication practice.                           |
| Patching (add-on)       | Add WSUS01 (5 local VMs)                | Understand patch-server dependency and WSUS sizing.                 |
| Azure extension         | Azure AZ-DC01 (+ approved private VPN)  | Separate AD domain in Azure and a planned cloud cutover.            |

IMPORTANT DISTINCTION

A domain controller is not just a new VM and a public DNS zone. A Windows AD forest is created by installing AD DS and promoting a server. Your existing public website DNS zone does not automatically create azure.lab.example.test as an AD domain.

UPDATED LEARNING PATH - SQL/MECM labs follow Lab 13; optional HA-01 through HA-05 follow AZ-03:

[ ] Original Labs 01-07: network, lab.example.test, two DCs, test users, APP01.

[ ] Original Labs 08-12: migrate.lab.example.test, GPO, member-server move, rollback.

[ ] Original Lab 13: WSUS01; then new SQL-01 through SQL-05 and MECM-01 through MECM-05.

[ ] New MOVE-01 through MOVE-04: understand a SQL .bak move vs. MECM site/hierarchy migration.

[ ] Original Labs 14-17: Azure portal, DNS, private connectivity, migration wave.

[ ] New AZ-01 through AZ-03: low-cost Azure SQL restore, validation and safe shutdown.

[ ] Optional HA-01 to HA-05: SQL01 + SQL02 Windows cluster, Azure cloud witness, verification, and safe test.

[ ] Original Labs 18-20 + new FIELD-01: interview handoff, troubleshooting, cleanup.

**Your available desktop RAM (GB)** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Your lab date** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Your Azure monthly cost ceiling** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** Physical Windows host / File Explorer / lab notes; no Azure deployment.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** Compare your recorded result with the named lesson saved result before marking verified.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Create your evidence folder

**WORKSPACE** Your Windows host · lab notes and browser

**DO** On the physical host, open File Explorer and create a SONIC-Lab folder with subfolders Installers, Screenshots, Baselines, and Backups. Keep passwords elsewhere.

**EXPECT** The four folders exist on storage with sufficient free space.

**IF STUCK** Do not use an employer’s production share or store keys in a Git repository.

**EVIDENCE** Capture the four folders exist on storage with sufficient free space. Record the target computer and date.

### Step 02: Record the version journey

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Create a lab note: VMware Workstation Pro on the host; Windows Server 2019 Desktop Experience on premises; Server 2019 Azure destination; migrate test workload/data; then upgrade that Azure member server to Server 2022.

**EXPECT** Your note distinguishes moving an application from moving a whole VM.

**IF STUCK** If an assignment requires full VM rehosting, choose the support-gated AZ-02 route, not a rebuild labeled as rehosting.

**EVIDENCE** Capture your note distinguishes moving an application from moving a whole VM. Record the target computer and date.

### Step 03: Choose the required route

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Complete the Windows/AD core, SQL core, Azure foundations, and migration core in sidebar order. Leave MECM and high availability extensions until their setup checks pass.

**EXPECT** DC01/DC02 and APP01 are prepared before the migration work.

**IF STUCK** Do not buy Azure capacity before completing the local prerequisite checks.

**EVIDENCE** Capture dC01/DC02 and APP01 are prepared before the migration work. Record the target computer and date.

LAB 01 / DIAGRAM + TERMS

# Understand the map

First understand what each computer represents. You are building a tiny version of a real migration.

| **OLD AGENCY / SOURCE**                 | **NEW ENTERPRISE / DESTINATION**                          |
|-----------------------------------------|-----------------------------------------------------------|
| DC01 | lab.example.test | 10.50.0.10 | DEST-DC01 | migrate.lab.example.test | 10.50.0.40            |
| DC02 (optional) | 10.50.0.11     | AZ-DC01 (later) | azure.lab.example.test | Azure private IP |
| APP01 | 10.50.0.30 | IIS website   | APP01 after domain change: migrate.lab.example.test               |
| WSUS01 (optional) | 10.50.0.50      | Your cloud deployment is a separate, later exercise       |

IMAGINE TWO SCHOOLS

The agency domain is the old school. The destination domain is the new school. Moving a computer is like changing the school it belongs to. Its old school record does not magically become a new record. You prepare identities, rules, and access in the new school.

**Forest =** A separate Active Directory identity system with its own domain controllers and directory database.

**OU =** An organizational folder for users/computers; useful for organizing and linking Group Policies.

**GPO =** A set of rules Windows applies to users or computers (for example, a test login notice).

**DNS =** The phone book that finds the right domain controller or service by name.

**Trust =** An approved way for two forests to recognize identities; it does not copy user accounts.

**Host-only / VMnet2 =** An isolated VMware network for the practice servers. It has no internet gateway. Temporary NAT is used only before isolation for guest updates and activation.

**/24 =** Short way to write subnet mask 255.255.255.0.

**Snapshot =** A save point for a VM so you can recover from a lab mistake (not a substitute for a full production backup).

**Cutover =** The planned switch from an old service/domain to a new one.

**Rollback =** Your tested way to return to the original working state if cutover fails.

WHY THIS MATTERS

We will first prove that the two forests really are separate. Then we will deliberately move only APP01. We never try to turn an agency DC into a destination DC.

## Guided walkthrough

**WHERE** Physical Windows host / lab worksheet; read-only planning.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** Compare your recorded result with the named lesson saved result before marking verified.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Know what each practice server does

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Open your lab notes on the Windows host. Write DC01 and DC02: manage practice users, sign-in and DNS. Write APP01: hosts the IIS test website and, in the separate help desk class, osTicket. Write SQL01: stores a practice database; it is not a website. Write DEST-DC01: owns the separate migrate.lab.example.test destination domain. Draw each server on VMnet2, then add the matching addresses from the earlier plan. For the DMZ class later, the new private IIS server moves to its own application network and only the gateway sits in the DMZ.

**EXPECT** Your notes show each server name, its job, network and address. You can point to the website server without confusing it with a domain controller.

**IF STUCK** A domain controller manages accounts and DNS. IIS serves web pages. SQL stores records. Keep these jobs separate in your diagram; no software is installed in this planning step.

**EVIDENCE** Save your own four-role diagram or notes.

LAB 02 / WORKSTATION

# Prepare your laptop and downloads

You need the right installer and enough resources before doing any domain work.

**[ ]** On your Windows desktop, open https://www.microsoft.com/en-us/evalcenter/evaluate-windows-server-2019

**[ ]** Register if Microsoft asks. Choose the 64-bit ISO and download it to a folder such as C:\LabISOs.

**[ ]** VMware Workstation Pro: open it and confirm you can create a Windows Server 64-bit guest.

**[ ]** Choose Windows Server with Desktop Experience during OS installation. GUI-based lessons will not match Server Core.

**[ ]** Budget for RAM: 4 GB per small DC and 4 GB for APP01 as a starting lab allocation; 16 GB of free host RAM is helpful for three VMs, and 32 GB total host RAM is more comfortable.

**[ ]** Reserve disk capacity: approximately 55–65 GB virtual disk per VM (thin provisioned); WSUS needs substantially more if you sync content.

**[ ]** Keep all ISO files and VMware VM folders out of your regular work or classified environments.

EVAL RULE

Microsoft states the Windows Server 2019 evaluation expires after 180 days. Activate the evaluation over the internet within the first 10 days to avoid automatic shutdown. The evaluation is for testing, not production use.

**PASS CHECK** Your ISO downloaded; VMware Workstation Pro opens; you have sufficient free storage.

IF IT DOES NOT WORK

If the VMware installer cannot boot from the ISO, confirm the ISO path, the guest firmware settings, hardware virtualization in BIOS/UEFI, and whether another hypervisor is interfering.

**ISO filename** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Free RAM / free disk** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** Physical Windows host / Workstation Pro / official ISO download; an administrator on your practice computer for installation.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** Your ISO downloaded; VMware Workstation Pro opens; you have sufficient free storage.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Confirm Workstation Pro

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** On your physical Windows PC, open VMware Workstation Pro > Help > About. Record the installed version. This course uses Workstation, not vCenter or ESXi.

**EXPECT** The product is Workstation Pro and it can create Windows Server 2019 guests.

**IF STUCK** If you have Player, Fusion, or ESXi, the menus and migration route differ. Install the assigned supported Workstation version first.

**EVIDENCE** Capture the product is Workstation Pro and it can create Windows Server 2019 guests. Record the target computer and date.

**SCREENSHOTS** workstation-1

### Step 02: Obtain Server 2019 media

**WORKSPACE** Your Windows host · web browser for Microsoft Evaluation Center

**DO** Use the Windows Server 2019 ISO your course or license administrator supplies. For local-only evaluation, open https://www.microsoft.com/evalcenter/evaluate-windows-server-2019 and download the 64-bit ISO. Save it under Installers.

**EXPECT** The media is Windows Server 2019, not 2025.

**IF STUCK** Evaluation is for practice. Do not assume an evaluation VM or an evaluation target supports the later Azure upgrade path.

**EVIDENCE** Capture the media is Windows Server 2019, not 2025. Record the target computer and date.

### Step 03: Choose the media and license path

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Record language, edition, evaluation/licensed status, and whether Desktop Experience is available. The Azure upgrade exercise uses a licensed/pay-as-you-go 2019 Marketplace member VM with a matching 2022 upgrade path.

**EXPECT** Your source and destination license choices are written down.

**IF STUCK** Stop rather than using borrowed product keys. Evaluation DCs cannot simply be converted to retail in place.

**EVIDENCE** Capture your source and destination license choices are written down. Record the target computer and date.

### Step 04: Check host resources

**WORKSPACE** Your Windows host · Windows PowerShell

**DO** On the host press Ctrl+Shift+Esc > Performance. Record available RAM and disk space. Start a tiny DC at 1 vCPU and 2048 MB RAM; keep a 60 GB growable system disk. A basic IIS test can start at 2 GB RAM; the full help desk uses 4 GB or more. SQL and MECM use their separate requirements. Shut down optional VMs you are not using; leave memory for your Windows host.

**EXPECT** The host has enough free resources for the next required pair of VMs.

**IF STUCK** These are lab sizing examples. Avoid allocating all host RAM; if needed shut down unused optional guests before proceeding.

**EVIDENCE** Capture the host has enough free resources for the next required pair of VMs. Record the target computer and date.

LAB 03 / PRIVATE LAB NETWORK

# Build the isolated VMnet2 network

We will give the practice servers their own network. VMnet2 is host-only: the two servers can talk to each other, but they have no route to your physical LAN or the internet. Your Windows host may also reach them through its VMware host adapter; this is not a production security boundary against the host itself.

| Server | Address | Mask | Preferred DNS | Default gateway |
|---|---|---|---|---|
| DC01 | 10.50.0.10 | 255.255.255.0 (/24) | 10.50.0.10 after promotion | Leave blank |
| DC02 | 10.50.0.11 | 255.255.255.0 (/24) | 10.50.0.10 initially | Leave blank |
| APP01 | 10.50.0.30 | 255.255.255.0 (/24) | 10.50.0.10 | Leave blank |
| DEST-DC01 | 10.50.0.40 | 255.255.255.0 (/24) | 10.50.0.40 after promotion | Leave blank |
| WSUS01 (optional) | 10.50.0.50 | 255.255.255.0 (/24) | 10.50.0.10 | Leave blank |
| SQL01 | 10.50.0.60 | 255.255.255.0 (/24) | 10.50.0.10 | Leave blank |
| MECM01 (optional) | 10.50.0.70 | 255.255.255.0 (/24) | 10.50.0.10 | Leave blank |

The host adapter normally uses an unused address such as 10.50.0.1. Check it; never give it .10 or .11. APP01 consistently uses .30 in this course.

Download the Server 2019 ISO on the host first. The guest build lessons explain temporary NAT for activation/updates before isolation. Do not add a second internet adapter to a domain controller. A later WSUS/MECM online synchronization or Azure VPN exercise needs its own approved internet/routing plan; this isolated network does not supply one. Use a current public address only for a later, explicitly required Azure allowlist; it never belongs on these DC adapters.

## Guided walkthrough

**WHERE** Windows 10 host / VMware Workstation Pro / Virtual Network Editor.

**BEFORE** Finish the installer/resource checks. Check that 10.50.0.0/24 does not overlap a home, VPN or other lab route. If VMnet2 already supports unrelated machines, stop and resolve that conflict before editing it.

**PASS** VMnet2 is Host-only, subnet 10.50.0.0/24, VMware DHCP off. Once both guest build lessons are complete, DC01 is 10.50.0.10 and DC02 is 10.50.0.11 and they reply to each other.

**ROLLBACK** Save the previous network settings. If this is the wrong VMnet, cancel without applying. Remove only this new lab network after its guests are powered off; do not change networks used by other machines.

### Step 01: Open Virtual Network Editor

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** On Windows 10 open VMware Workstation Pro. Choose Edit > Virtual Network Editor. Select Change Settings if shown and approve your administrator prompt.

**EXPECT** The editor lets you change virtual networks.

**IF STUCK** Close the editor and reopen it with your authorized administrator account if its controls are locked.

**EVIDENCE** Save a picture of the editable network list.

### Step 02: Create VMnet2 as Host-only

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select Add Network, choose VMnet2 and confirm. Select VMnet2 in the list, then select Host-only. Keep Connect a host virtual adapter to this network checked. Do not select NAT or Bridged.

**EXPECT** VMnet2 is listed as Host-only. It has no NAT gateway or connection to your physical LAN.

**IF STUCK** If VMnet2 already exists, check that it belongs only to this lab before changing it. Do not edit another project's network.

**EVIDENCE** Capture VMnet2 and the Host-only selection.

### Step 03: Set the private address range

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** With VMnet2 selected, enter Subnet IP 10.50.0.0 and Subnet mask 255.255.255.0. This /24 is the shared address range for DC01 and DC02.

**EXPECT** The editor displays 10.50.0.0 and 255.255.255.0 for VMnet2.

**IF STUCK** Stop if this range conflicts with an existing host or VPN route. Resolve the overlap before building the guests; do not quietly mix address plans.

**EVIDENCE** Capture the subnet and mask fields.

### Step 04: Turn off VMware DHCP

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Clear Use local DHCP service to distribute IP addresses to VMs. We will type fixed addresses into the servers ourselves. Select Apply, then OK.

**EXPECT** VMnet2 is saved as Host-only with DHCP off. There is no default gateway to record for this isolated network.

**IF STUCK** Do not open NAT Settings. DHCP supplies automatic addresses; turning it off means a new unconfigured guest may initially show 169.254.x.x. Its later static-address step fixes that.

**EVIDENCE** Reopen the editor and capture the saved DHCP-off setting.

### Step 05: Write the two-server plan

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** In your notes write DC01 = 10.50.0.10/24 and DC02 = 10.50.0.11/24. Use mask 255.255.255.0 and leave Default gateway blank on both. DC02 will use DC01 at 10.50.0.10 for DNS. Confirm the VMware host adapter does not already use .10 or .11.

**EXPECT** Each server has its own address on 10.50.0.0/24. The public internet address is not in either server's adapter settings.

**IF STUCK** These are private guest addresses. Do not substitute your router's public address, home gateway or a public DNS server for the planned AD settings.

**EVIDENCE** Save your address table before creating the VMs.

### Step 06: Connect the guests to VMnet2

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** When each guest VM exists and is powered off, select it > VM > Settings > Network Adapter. Choose Custom: Specific virtual network > VMnet2 and enable Connect at power on. Keep one network adapter. Return here to check this after any temporary NAT update session.

**EXPECT** Both guest adapters use the same VMnet2. After their static-address lessons, their live consoles show DC01 10.50.0.10/24 and DC02 10.50.0.11/24. The DC02 Windows lesson proves replies in both directions before promotion.

**IF STUCK** If a new guest has 169.254.x.x, finish its static IPv4 settings. Do not turn VMware DHCP back on or choose Bridged to make a ping pass.

**EVIDENCE** Save the two network-adapter settings and, after the guest lessons, both consoles with their successful ping replies.

LAB 04 / FIRST DOMAIN CONTROLLER

# Make DC01: the agency begins

Create the first Windows server, then make it the owner of the lab.example.test forest.

**[ ]** VMware: File > New Virtual Machine > Typical > Installer disc image file (ISO). Pick the Windows Server ISO.

**[ ]** Choose Windows Server 2019 Standard (Desktop Experience), if offered. For a tiny practice DC, start with 1 vCPU, 2 GB RAM and a 60 GB growable disk; raise RAM to 4 GB for slower update sessions, and your VMnet2 host-only network.

**[ ]** Install Windows. Set a strong local Administrator password and keep it securely outside the workbook.

**[ ]** In the VM: right-click Start > System > Rename this PC (advanced), or run sysdm.cpl > Computer Name > Change. Name it DC01. Restart.

**[ ]** Set the static IP to 10.50.0.10, subnet mask 255.255.255.0, no default gateway, and preferred DNS 10.50.0.10.

**[ ]** Open Server Manager > Manage > Add Roles and Features > Role-based or feature-based installation > select DC01 > Active Directory Domain Services. Install.

**[ ]** In Server Manager, select the flag notification > Promote this server to a domain controller > Add a new forest.

**[ ]** Root domain name: lab.example.test. Enable DNS server and Global Catalog. Set a strong DSRM password. Continue through prerequisite checks and select Install.

**[ ]** Let the server reboot; sign in with the new domain account (for example LAB\Administrator).

> hostname
> ipconfig /all
> Get-ADDomain | Select-Object DNSRoot,NetBIOSName

**PASS CHECK** hostname = DC01; the Active Directory domain DNS root shows lab.example.test.

WHY THIS MATTERS

You have created an Active Directory forest, not merely typed a name into a public DNS zone. The AD DS installation creates the directory and publishes service records in its DNS.

IF IT DOES NOT WORK

If Get-ADDomain is unrecognized, launch Windows PowerShell as Administrator on the DC and ensure AD DS/RSAT modules are installed. If promotion fails, inspect prerequisite errors, DNS/IP settings, and System event logs.

**Forest name / screenshot path** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** Physical host Workstation Pro, then DC01 guest / Server 2019 Desktop Experience / local Administrator, then LAB domain Administrator.

**BEFORE** LAB 02 must confirm Windows Server 2019 Desktop Experience media and host resources; LAB 03 must record the actual VMnet2 host-only subnet and blank default gateway and unused static addresses. Replica/member builds also require working DC01 DNS. Example addresses apply only to the different, non-overlapping 10.50.0.0/24 lab plan.

**PASS** hostname = DC01; the Active Directory domain DNS root shows lab.example.test.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Open the new VM wizard

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** On your physical Windows PC, open VMware Workstation Pro. Click File, then New Virtual Machine. Do not do this inside another VM.

**EXPECT** The New Virtual Machine Wizard is open.

**IF STUCK** If VMware is absent, finish LAB 02. Help > About identifies your installed version.

**EVIDENCE** Capture the New Virtual Machine Wizard is open. Record the target computer and date.

**SCREENSHOTS** workstation-1

### Step 02: Choose Typical

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select Typical (recommended), then Next. The reference image has Custom selected; use the upper Typical radio button for this lab.

**EXPECT** The wizard asks how the guest operating system will be installed.

**IF STUCK** If you chose Custom, cancel and restart; do not change random advanced disk options.

**EVIDENCE** Capture the wizard asks how the guest operating system will be installed. Record the target computer and date.

**SCREENSHOTS** workstation-2

### Step 03: Use manual Windows installation

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select I will install the operating system later, then Next. This avoids Easy Install silently choosing an edition.

**EXPECT** The wizard lets you choose a guest OS profile.

**IF STUCK** Do not select the example Windows 7 ISO visible in the reference. We attach your Server 2019 ISO later.

**EVIDENCE** Capture the wizard lets you choose a guest OS profile. Record the target computer and date.

**SCREENSHOTS** workstation-4

### Step 04: Choose the Server 2019 guest profile

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select Microsoft Windows. Open Version and choose Windows Server 2019, then Next.

**EXPECT** The guest profile says Windows Server 2019.

**IF STUCK** VERSION CHECK REQUIRED: if your Workstation version does not list Server 2019, stop and check Broadcom compatibility/update guidance; the profile is not the ISO and selecting a newer OS does not install it.

**EVIDENCE** Capture the guest profile says Windows Server 2019. Record the target computer and date.

### Step 05: Name the VM

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Enter DC01 as the virtual machine name. Browse to a folder with enough free space, such as your dedicated SONIC lab folder, then Next.

**EXPECT** The summary uses DC01 and a location you can find again.

**IF STUCK** The VMware name and the Windows computer name are different settings; we will rename Windows after installation.

**EVIDENCE** Capture the summary uses DC01 and a location you can find again. Record the target computer and date.

**SCREENSHOTS** workstation-6

### Step 06: Create a new virtual disk

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Set Maximum disk size to 60 GB for this lab plan. Choose Split virtual disk into multiple files, then Next. If Allocate all disk space now is offered, leave it unchecked so the disk can grow as needed. Splitting files alone does not make a disk growable. Do not attach an existing disk.

**EXPECT** A new blank virtual disk is selected.

**IF STUCK** This is a lab sizing example, not a product minimum. Stop if the host lacks free space for your planned VMs.

**EVIDENCE** Capture a new blank virtual disk is selected. Record the target computer and date.

**SCREENSHOTS** workstation-14

### Step 07: Set memory and CPU

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Click Customize Hardware. Select Memory and enter 2048 MB for a tiny practice DC. Select Processors: 1 processor, 1 core. If Windows updates or the desktop are too slow, shut down and raise memory to 4096 MB. These are practice allocations, not production sizing.

**EXPECT** The Memory page shows 2048 MB (or your recorded 4096 MB fallback), and Processors shows one total core.

**IF STUCK** Leave RAM for the physical host. SQL/MECM need more resources than a domain controller; do not start all optional VMs together on a small PC.

**EVIDENCE** Save the VM hardware summary showing the memory and CPU values you chose.

**SCREENSHOTS** workstation-9, workstation-8

### Step 08: Attach the Server 2019 ISO

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select CD/DVD in the hardware list. Choose Use ISO image file, Browse to your Windows Server 2019 ISO, and enable Connect at power on.

**EXPECT** The CD/DVD path ends with your Server 2019 ISO filename.

**IF STUCK** If a different ISO is listed, replace it now; the guest OS profile alone does not select installation media.

**EVIDENCE** Capture the CD/DVD path ends with your Server 2019 ISO filename. Record the target computer and date.

### Step 09: Attach the private VMnet

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select Network Adapter. Choose Custom: Specific virtual network and VMnet2 (Host-only) from LAB 03. Enable Connected and Connect at power on.

**EXPECT** The VM is attached to the same private lab VMnet as the other lab servers.

**IF STUCK** Do not choose Bridged. If your custom VMnet is missing, return to Virtual Network Editor and verify its name before continuing.

**EVIDENCE** Capture the VM is attached to the same private lab VMnet as the other lab servers. Record the target computer and date.

### Step 10: Finish and start the VM

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Click Close, then Finish. Select the new VM in the Workstation library and click Power on this virtual machine. Click inside its console and press a key when the ISO boot prompt appears.

**EXPECT** Windows Setup appears inside the VM console.

**IF STUCK** If it boots to a network screen or no OS found, power off, check CD/DVD ISO and Connect at power on, then retry. Ctrl+Alt releases your mouse from the console.

**EVIDENCE** Capture windows Setup appears inside the VM console. Record the target computer and date.

**SCREENSHOTS** workstation-15

### Step 11: Start Windows Setup

**WORKSPACE** DC01 · Windows Setup installer

**DO** Choose the language you need for the course, time format, and keyboard, then Next and Install now. Use English (United States) media if you will follow the Azure upgrade-media route later.

**EXPECT** Setup displays an edition list or asks for a legitimate product key.

**IF STUCK** A key prompt depends on your media. Use your authorized course media and license; never enter a sample or shared key.

**EVIDENCE** Capture setup displays an edition list or asks for a legitimate product key. Record the target computer and date.

### Step 12: Choose Desktop Experience

**WORKSPACE** DC01 · Windows Setup installer

**DO** Select Windows Server 2019 Standard (Desktop Experience), or the matching authorized Datacenter (Desktop Experience) edition your course supplies. If using Evaluation for local practice, record that limitation. Click Next and accept the license only if you agree.

**EXPECT** The selected line explicitly includes 2019 and Desktop Experience.

**IF STUCK** If you omit Desktop Experience you get Server Core. This course does not teach switching Core to Desktop Experience; rebuild this new empty lab VM with the correct option.

**EVIDENCE** Capture the selected line explicitly includes 2019 and Desktop Experience. Record the target computer and date.

### Step 13: Install only on the new blank disk

**WORKSPACE** DC01 · Windows Setup installer

**DO** Choose Custom: Install Windows only (advanced). Select the new VM’s blank Drive 0 unallocated space and click Next. This is a clean install in a new VM, not the later Azure in-place upgrade.

**EXPECT** Windows copies files, installs, and restarts.

**IF STUCK** Stop if the disk contains existing partitions or data you did not expect. Never delete an unfamiliar disk to make the instructions fit.

**EVIDENCE** Capture windows copies files, installs, and restarts. Record the target computer and date.

### Step 14: Create the local Administrator password

**WORKSPACE** DC01 · Windows Setup installer

**DO** At Customize settings, set and confirm a strong local Administrator password. Save it in your own password manager, then Finish.

**EXPECT** The Windows sign-in screen appears.

**IF STUCK** Do not put passwords in the course saved result worksheet or screenshots.

**EVIDENCE** Capture the Windows sign-in screen appears. Record the target computer and date.

### Step 15: Sign into the guest

**WORKSPACE** DC01 · Windows Server desktop

**DO** Use Workstation VM > Send Ctrl+Alt+Del (or Ctrl+Alt+Insert), then sign in as the guest’s local Administrator.

**EXPECT** You see a Windows desktop and Server Manager.

**IF STUCK** If only a command window appears, you installed Server Core; return to the edition-selection step for this new lab VM.

**EVIDENCE** Capture you see a Windows desktop and Server Manager. Record the target computer and date.

### Step 16: Install VMware Tools

**WORKSPACE** Your Windows host · VMware Workstation Pro; then the named Windows guest

**DO** In Workstation select VM > Install VMware Tools. In the guest open File Explorer > This PC, open the VMware Tools CD, and run setup64.exe if offered. Choose the normal setup and restart when asked.

**EXPECT** After restart, the guest is usable with the expected mouse/display integration.

**IF STUCK** The menu may say Reinstall VMware Tools. VERSION CHECK REQUIRED: if the bundled Tools ISO is unavailable, use Broadcom’s supported Tools download for your Workstation and guest version.

**EVIDENCE** Capture after restart, the guest is usable with the expected mouse/display integration. Record the target computer and date.

### Step 17: Patch the new Server 2019 guest

**WORKSPACE** Your Windows host · VMware Workstation Pro; then the named Windows guest

**DO** This new guest is not domain-joined yet. Shut it down. In VMware choose VM > Settings > Network Adapter > NAT, keeping one adapter. Start Windows and set Ethernet IPv4 and DNS to Obtain automatically for this temporary update session. Open Start > Settings > Update & Security > Windows Update, check for updates and restart as required. Activate the evaluation while internet access is available. Shut down again, change the same adapter to Custom > VMnet2, and start the guest. The next network steps restore its planned static address and blank gateway before any domain work.

**EXPECT** Windows has completed its pending restarts.

**IF STUCK** VMnet2 has no internet route. Before AD promotion/domain join, power off this fresh guest, temporarily change its single adapter to NAT, obtain automatic IPv4/DNS, apply updates/activate, shut down, return the adapter to Custom VMnet2, and restore its planned static IPv4/DNS with a blank gateway. Keep one adapter only. Never bridge the guest or add an internet adapter to a domain controller.

**EVIDENCE** Capture windows has completed its pending restarts. Record the target computer and date.

### Step 18: Rename Windows

**WORKSPACE** DC01 · Windows System Properties

**DO** Inside the guest press Win+R, enter sysdm.cpl, and press Enter. On Computer Name choose Change. Enter DC01, confirm OK, and restart when prompted.

**EXPECT** After signing in again, hostname returns DC01.

**IF STUCK** Renaming the entry in the Workstation library does not rename Windows.

**EVIDENCE** Capture after signing in again, hostname returns DC01. Record the target computer and date.

**COMMAND**
> hostname

### Step 19: Open the guest IPv4 settings

**WORKSPACE** DC01 · Windows Network Connections

**DO** Inside the guest press Win+R, type ncpa.cpl, and press Enter. Right-click the connected Ethernet adapter > Properties. Select Internet Protocol Version 4 (TCP/IPv4), then Properties.

**EXPECT** The IPv4 address and DNS fields are visible.

**IF STUCK** This is the on-prem VM adapter. Azure VM address configuration is different and is set on the Azure NIC.

**EVIDENCE** Capture the IPv4 address and DNS fields are visible. Record the target computer and date.

### Step 20: Enter the lab address

**WORKSPACE** DC01 · Windows Server desktop

**DO** For the example LAB 03 network only, choose Use the following IP address: 10.50.0.10; subnet mask 255.255.255.0; leave Default gateway blank (VMnet2 is host-only). Set preferred DNS to 10.50.0.10. Click OK and Close. If you changed the subnet in LAB 03, use your matching address plan instead.

**EXPECT** ipconfig /all shows the planned 10.50.0.x address, blank default gateway, and the lab DNS address on VMnet2.

**IF STUCK** Do not enter a gateway on isolated VMnet2 or use a public DNS server as an AD client’s DNS. If an address conflict appears, stop and allocate an unused lab address.

**EVIDENCE** Capture ipconfig /all shows the planned 10.50.0.x address, blank default gateway, and the lab DNS address on VMnet2. Record the target computer and date.

**COMMAND**
> ipconfig /all

### Step 21: Confirm this is Server 2019

**WORKSPACE** DC01 · Windows PowerShell as administrator

**DO** Open Start, search Windows PowerShell, right-click it > Run as administrator. Run the read-only inventory below in this VM.

**EXPECT** WindowsProductName identifies Windows Server 2019; hostname identifies DC01.

**IF STUCK** If the version is 2022 or 2025, you have not built the requested source baseline. Do not present that as a 2019-to-2022 upgrade.

**EVIDENCE** Capture windowsProductName identifies Windows Server 2019; hostname identifies DC01. Record the target computer and date.

**COMMAND**
> hostname
> Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, OsBuildNumber
> DISM /online /Get-CurrentEdition

### Step 22: Open Add Roles and Features

**WORKSPACE** DC01 · Server Manager

**DO** Inside the named server open Server Manager. Choose Manage > Add Roles and Features. Click Next on Before you begin.

**EXPECT** The Select installation type page is shown.

**IF STUCK** If Server Manager is closed, open Start and select Server Manager. Run as the authorized local Administrator for a new forest, or Domain Admin for a replica.

**EVIDENCE** Capture the Select installation type page is shown. Record the target computer and date.

### Step 23: Select the local destination server

**WORKSPACE** DC01 · Windows Server desktop

**DO** Choose Role-based or feature-based installation > Next. Select a server from the server pool and select this VM’s computer name > Next.

**EXPECT** The Server Roles page targets the correct computer.

**IF STUCK** If the target name is wrong, cancel; do not install AD DS on a member server by mistake.

**EVIDENCE** Capture the Server Roles page targets the correct computer. Record the target computer and date.

### Step 24: Select AD DS and its tools

**WORKSPACE** DC01 · Windows Server desktop

**DO** Check Active Directory Domain Services. In the pop-up click Add Features, then Next.

**EXPECT** AD DS is selected and its required management tools are included.

**IF STUCK** Installing DNS alone does not create a domain. Confirm you selected Active Directory Domain Services.

**EVIDENCE** Capture aD DS is selected and its required management tools are included. Record the target computer and date.

**SCREENSHOTS** ad-roles, ad-features

### Step 25: Install the role

**WORKSPACE** DC01 · Windows Server desktop

**DO** Keep the required Features selected. Click Next through the AD DS information page, review the selected target, then click Install.

**EXPECT** Installation succeeds and offers Promote this server to a domain controller.

**IF STUCK** If it fails, read the failed feature and Server Manager error before retrying; do not continue straight to promotion.

**EVIDENCE** Capture installation succeeds and offers Promote this server to a domain controller. Record the target computer and date.

**SCREENSHOTS** ad-promote

### Step 26: Choose the correct promotion operation

**WORKSPACE** DC01 · Windows Server desktop

**DO** Click Promote this server to a domain controller. Choose Add a new forest. Enter lab.example.test as Root domain name. Click Next.

**EXPECT** The wizard shows a NEW forest named lab.example.test.

**IF STUCK** A replica must not create a second forest with the same name. A destination forest must not accidentally join the source forest.

**EVIDENCE** Capture the wizard shows a NEW forest named lab.example.test. Record the target computer and date.

**SCREENSHOTS** ad-forest

### Step 27: Set controller options and DSRM

**WORKSPACE** DC01 · Windows Server desktop

**DO** For Server 2019 in this lab, use Windows Server 2016 for both forest and domain functional levels. Keep DNS server and Global Catalog selected. Set and confirm a unique DSRM recovery password, store it securely, then Next.

**EXPECT** Required options are selected and the password boxes have no validation error.

**IF STUCK** Windows Server 2019 has no Windows Server 2019 functional-level choice. Never copy the older functional levels or passwords from a reference image.

**EVIDENCE** Capture required options are selected and the password boxes have no validation error. Record the target computer and date.

**SCREENSHOTS** ad-dc-options

### Step 28: Review DNS and additional options

**WORKSPACE** DC01 · Windows Server desktop

**DO** Continue past the isolated-root DNS-delegation warning only if it is the expected warning for this private lab. Confirm the LAB NetBIOS name on Additional Options.

**EXPECT** The wizard advances without a blocking validation error.

**IF STUCK** A yellow delegation warning for a private root is different from a red failed prerequisite. Stop for DNS, credential, or connectivity failures.

**EVIDENCE** Capture the wizard advances without a blocking validation error. Record the target computer and date.

### Step 29: Keep the default AD paths

**WORKSPACE** DC01 · Windows Server desktop

**DO** On Paths keep the default NTDS database/log and SYSVOL locations for this small lab, then Next.

**EXPECT** The wizard shows Review Options.

**IF STUCK** This is a practice lab layout, not a production storage design. Do not put AD data on a temporary disk.

**EVIDENCE** Capture the wizard shows Review Options. Record the target computer and date.

**SCREENSHOTS** ad-paths

### Step 30: Check prerequisites before promotion

**WORKSPACE** DC01 · Windows Server desktop

**DO** On Review Options confirm lab.example.test, the correct computer, and DNS. Click Next, then wait for Prerequisites Check.

**EXPECT** The prerequisite check succeeds; only understood lab warnings remain.

**IF STUCK** Read every red failure. Correct its stated cause and rerun the check before clicking Install.

**EVIDENCE** Capture the prerequisite check succeeds; only understood lab warnings remain. Record the target computer and date.

**SCREENSHOTS** ad-review, ad-prerequisites

### Step 31: Promote and wait for restart

**WORKSPACE** DC01 · Windows Server desktop

**DO** Click Install only after the prerequisite check passes. Wait for the VM to restart; do not power it off to shorten the wait.

**EXPECT** The guest restarts and offers a domain sign-in.

**IF STUCK** If promotion fails, keep the message and check Server Manager and Event Viewer > Windows Logs > Directory Service/System before retrying.

**EVIDENCE** Capture the guest restarts and offers a domain sign-in. Record the target computer and date.

### Step 32: Verify the directory

**WORKSPACE** DC01 · Windows PowerShell as administrator

**DO** Sign in with your authorized lab.example.test administrator account. Open Windows PowerShell as administrator in this VM and run the checks.

**EXPECT** The DNSRoot is lab.example.test and domain-controller records resolve to the lab’s private IPs.

**IF STUCK** If Get-ADDomain is unavailable, confirm you are on the promoted server with the AD management tools. If DNS fails, check the adapter’s DNS and the domain DNS zone.

**EVIDENCE** Capture the DNSRoot is lab.example.test and domain-controller records resolve to the lab’s private IPs. Record the target computer and date.

**COMMAND**
> hostname
> Get-ADDomain | Select-Object DNSRoot, NetBIOSName
> Resolve-DnsName -Type SRV _ldap._tcp.dc._msdcs.lab.example.test

LAB 05 / IDENTITY + RULES

# Create test users, OUs, and a GPO

Give the agency realistic things to migrate. Use only fake people and fake data.

**[ ]** On DC01 open Server Manager > Tools > Active Directory Users and Computers.

**[ ]** Right-click lab.example.test > New > Organizational Unit. Create an OU named Operations. Create an OU named Security too.

**[ ]** Right-click Operations > New > User. Make user test.analyst, set a strong temporary password, and optionally require password change at next logon.

**[ ]** Right-click Operations > New > Group. Create group GG-Operations. Add test.analyst as a member.

**[ ]** Open Server Manager > Tools > Group Policy Management. Expand Forest > Domains > lab.example.test.

**[ ]** Right-click the Operations OU > Create a GPO in this domain, and Link it here. Name: LAB-Operations-Banner.

**[ ]** Right-click LAB-Operations-Banner > Edit > Computer Configuration > Policies > Windows Settings > Security Settings > Local Policies > Security Options.

**[ ]** Set Interactive logon: Message title for users attempting to log on = LAB LAB. Set Interactive logon: Message text for users attempting to log on = This is a practice environment.

**[ ]** Close the editor. The GPO must remain linked to the Operations OU so that an Operations computer can receive it.

> Get-ADUser test.analyst
> Get-GPO -Name "LAB-Operations-Banner"

**PASS CHECK** You see both OUs, the test user, GG-Operations, and the named GPO.

WHY THIS MATTERS

A GPO linked to a particular OU applies to the objects in that OU, subject to filtering and inheritance. We chose a visible harmless login notice so we can prove policies survived the move.

IF IT DOES NOT WORK

If you do not see Group Policy Management, add the Group Policy Management feature through Server Manager &gt; Add Roles and Features &gt; Features.

**Your test user / GPO** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** DC01 guest / Server Manager, ADUC, and GPMC / authorized lab.example.test administrator.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** You see both OUs, the test user, GG-Operations, and the named GPO.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Open Active Directory Users and Computers

**WORKSPACE** DC01 · Server Manager

**DO** Inside DC01 open Server Manager > Tools > Active Directory Users and Computers. Expand lab.example.test in the left pane.

**EXPECT** You are managing the lab.example.test directory on DC01.

**IF STUCK** If Tools lacks this console, verify AD DS management tools were installed; do not create users on the physical host.

**EVIDENCE** Capture you are managing the lab.example.test directory on DC01. Record the target computer and date.

### Step 02: Create the Operations OU

**WORKSPACE** DC01 · Windows Server desktop

**DO** Right-click lab.example.test > New > Organizational Unit. Enter Operations. Leave protection from accidental deletion enabled, then OK. Repeat to create Security.

**EXPECT** Both OUs appear under lab.example.test.

**IF STUCK** An OU is a directory container, not a Windows folder. Do not create it inside the default Users container.

**EVIDENCE** Capture both OUs appear under lab.example.test. Record the target computer and date.

### Step 03: Create the test user

**WORKSPACE** DC01 · Windows Server desktop

**DO** Right-click Operations > New > User. Enter a fictional name and user logon name test.analyst. Click Next, set a private temporary password, choose your lab password-change requirement, Next, then Finish.

**EXPECT** test.analyst appears in Operations.

**IF STUCK** Use fake identity data. Check the password-complexity error rather than weakening domain policy.

**EVIDENCE** Capture test.analyst appears in Operations. Record the target computer and date.

### Step 04: Create and populate the group

**WORKSPACE** DC01 · Windows Server desktop

**DO** Right-click Operations > New > Group. Name it GG-Operations, select Global and Security, then OK. Open the group > Members > Add; enter test.analyst > Check Names > OK.

**EXPECT** Members lists the new test user.

**IF STUCK** A group is not the same as an OU. Confirm you are editing Members, not Member Of.

**EVIDENCE** Capture members lists the new test user. Record the target computer and date.

### Step 05: Open Group Policy Management

**WORKSPACE** DC01 · Group Policy Management

**DO** In Server Manager choose Tools > Group Policy Management. Expand Forest: lab.example.test > Domains > lab.example.test.

**EXPECT** The Operations OU appears in the policy tree.

**IF STUCK** If the tree is collapsed, expand each triangle rather than assuming the OU is missing.

**EVIDENCE** Capture the Operations OU appears in the policy tree. Record the target computer and date.

### Step 06: Create and link the GPO

**WORKSPACE** DC01 · Group Policy Management

**DO** Right-click Operations > Create a GPO in this domain, and Link it here. Name it LAB-Operations-Banner and click OK.

**EXPECT** The named GPO is linked under Operations.

**IF STUCK** Creating an unlinked GPO under Group Policy Objects does not apply it to Operations.

**EVIDENCE** Capture the named GPO is linked under Operations. Record the target computer and date.

### Step 07: Edit the logon banner

**WORKSPACE** DC01 · Group Policy Management

**DO** Right-click the linked GPO > Edit. Expand Computer Configuration > Policies > Windows Settings > Security Settings > Local Policies > Security Options. Set the interactive logon message title to LAB LAB and message text to This is a practice environment.

**EXPECT** The two banner settings show your lab text.

**IF STUCK** This is computer policy: the target computer account must be in the linked OU. Putting only a user there is insufficient.

**EVIDENCE** Capture the two banner settings show your lab text. Record the target computer and date.

### Step 08: Verify the objects

**WORKSPACE** DC01 · Group Policy Management

**DO** On DC01 run these read-only checks and capture ADUC plus the GPO link.

**EXPECT** The user, group membership, and GPO are returned.

**IF STUCK** If Get-GPO is missing, open Windows PowerShell opened with Run as administrator on DC01 with Group Policy Management installed.

**EVIDENCE** Capture the user, group membership, and GPO are returned. Record the target computer and date.

**COMMAND**
> Get-ADUser test.analyst
> Get-ADGroupMember GG-Operations
> Get-GPO -Name "LAB-Operations-Banner"

LAB 06 / APPLICATION

# Make APP01: the server that will move

APP01 is a normal domain member, not a domain controller. We will install a tiny website to test.

**[ ]** VMware: create another Windows Server Desktop Experience VM named APP01, 2 vCPUs, 4 GB RAM, ~60 GB thin disk, on your lab NAT VMnet.

**[ ]** Set its IP to 10.50.0.30/24, gateway to your NAT address, and preferred DNS to 10.50.0.10 (DC01).

**[ ]** Open Windows PowerShell as Administrator. Run the DNS and network checks below.

**[ ]** Press Win+R > sysdm.cpl > Computer Name > Change > Domain, enter lab.example.test. Provide authorized lab.example.test admin credentials. Restart.

**[ ]** On DC01 > Active Directory Users and Computers, find APP01 in Computers and move the computer object into the Operations OU.

**[ ]** On APP01 open elevated Windows PowerShell and install IIS using the command below.

**[ ]** Create a simple practice home page at C:\inetpub\wwwroot\index.html. Run gpupdate /force and reboot if requested.

**[ ]** Open http://localhost on APP01. You should see your custom webpage.

> nslookup lab.example.test 10.50.0.10
> Test-NetConnection 10.50.0.10 -Port 53
> Install-WindowsFeature Web-Server -IncludeManagementTools
> Set-Content C:\inetpub\wwwroot\index.html "\<h1>Agency app is alive\</h1>"
> gpupdate /force
> gpresult /r /scope computer

**PASS CHECK** APP01 belongs to lab.example.test; localhost website works; gpresult lists LAB-Operations-Banner as applied.

WHY THIS MATTERS

A domain member has its own application and local data. Moving it to another domain is different from migrating a domain controller or copying Active Directory.

IF IT DOES NOT WORK

If domain join fails, verify APP01 DNS points to DC01, not to your home router or 8.8.8.8. Use nslookup -type=SRV _ldap._tcp.dc._msdcs.lab.example.test 10.50.0.10.

**APP01 IPv4 / domain / website result** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** Physical host Workstation Pro, then APP01 Server 2019 guest / local Administrator, then authorized domain account.

**BEFORE** LAB 02 must confirm Windows Server 2019 Desktop Experience media and host resources; LAB 03 must record the actual VMnet2 host-only subnet and blank default gateway and unused static addresses. Replica/member builds also require working DC01 DNS. Example addresses apply only to the different, non-overlapping 10.50.0.0/24 lab plan.

**PASS** APP01 belongs to lab.example.test; localhost website works; gpresult lists LAB-Operations-Banner as applied.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Open the new VM wizard

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** On your physical Windows PC, open VMware Workstation Pro. Click File, then New Virtual Machine. Do not do this inside another VM.

**EXPECT** The New Virtual Machine Wizard is open.

**IF STUCK** If VMware is absent, finish LAB 02. Help > About identifies your installed version.

**EVIDENCE** Capture the New Virtual Machine Wizard is open. Record the target computer and date.

**SCREENSHOTS** workstation-1

### Step 02: Choose Typical

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select Typical (recommended), then Next. The reference image has Custom selected; use the upper Typical radio button for this lab.

**EXPECT** The wizard asks how the guest operating system will be installed.

**IF STUCK** If you chose Custom, cancel and restart; do not change random advanced disk options.

**EVIDENCE** Capture the wizard asks how the guest operating system will be installed. Record the target computer and date.

**SCREENSHOTS** workstation-2

### Step 03: Use manual Windows installation

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select I will install the operating system later, then Next. This avoids Easy Install silently choosing an edition.

**EXPECT** The wizard lets you choose a guest OS profile.

**IF STUCK** Do not select the example Windows 7 ISO visible in the reference. We attach your Server 2019 ISO later.

**EVIDENCE** Capture the wizard lets you choose a guest OS profile. Record the target computer and date.

**SCREENSHOTS** workstation-4

### Step 04: Choose the Server 2019 guest profile

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select Microsoft Windows. Open Version and choose Windows Server 2019, then Next.

**EXPECT** The guest profile says Windows Server 2019.

**IF STUCK** VERSION CHECK REQUIRED: if your Workstation version does not list Server 2019, stop and check Broadcom compatibility/update guidance; the profile is not the ISO and selecting a newer OS does not install it.

**EVIDENCE** Capture the guest profile says Windows Server 2019. Record the target computer and date.

### Step 05: Name the VM

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Enter APP01 as the virtual machine name. Browse to a folder with enough free space, such as your dedicated SONIC lab folder, then Next.

**EXPECT** The summary uses APP01 and a location you can find again.

**IF STUCK** The VMware name and the Windows computer name are different settings; we will rename Windows after installation.

**EVIDENCE** Capture the summary uses APP01 and a location you can find again. Record the target computer and date.

**SCREENSHOTS** workstation-6

### Step 06: Create a new virtual disk

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Set Maximum disk size to 60 GB for this lab plan. Choose Split virtual disk into multiple files, then Next. If Allocate all disk space now is offered, leave it unchecked so the disk can grow as needed. Splitting files alone does not make a disk growable. Do not attach an existing disk.

**EXPECT** A new blank virtual disk is selected.

**IF STUCK** This is a lab sizing example, not a product minimum. Stop if the host lacks free space for your planned VMs.

**EVIDENCE** Capture a new blank virtual disk is selected. Record the target computer and date.

**SCREENSHOTS** workstation-14

### Step 07: Set memory and CPU

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Click Customize Hardware. Select Memory and enter 4096 MB. Select Processors and use 1 processor with 2 cores for the basic lab.

**EXPECT** The hardware list shows your memory allocation and two virtual cores.

**IF STUCK** Leave RAM for the physical host. SQL/MECM need more resources than a domain controller; do not start all optional VMs together on a small PC.

**EVIDENCE** Capture the hardware list shows your memory allocation and two virtual cores. Record the target computer and date.

**SCREENSHOTS** workstation-9, workstation-8

### Step 08: Attach the Server 2019 ISO

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select CD/DVD in the hardware list. Choose Use ISO image file, Browse to your Windows Server 2019 ISO, and enable Connect at power on.

**EXPECT** The CD/DVD path ends with your Server 2019 ISO filename.

**IF STUCK** If a different ISO is listed, replace it now; the guest OS profile alone does not select installation media.

**EVIDENCE** Capture the CD/DVD path ends with your Server 2019 ISO filename. Record the target computer and date.

### Step 09: Attach the private VMnet

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select Network Adapter. Choose Custom: Specific virtual network and VMnet2 (Host-only) from LAB 03. Enable Connected and Connect at power on.

**EXPECT** The VM is attached to the same private lab VMnet as the other lab servers.

**IF STUCK** Do not choose Bridged. If your custom VMnet is missing, return to Virtual Network Editor and verify its name before continuing.

**EVIDENCE** Capture the VM is attached to the same private lab VMnet as the other lab servers. Record the target computer and date.

### Step 10: Finish and start the VM

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Click Close, then Finish. Select the new VM in the Workstation library and click Power on this virtual machine. Click inside its console and press a key when the ISO boot prompt appears.

**EXPECT** Windows Setup appears inside the VM console.

**IF STUCK** If it boots to a network screen or no OS found, power off, check CD/DVD ISO and Connect at power on, then retry. Ctrl+Alt releases your mouse from the console.

**EVIDENCE** Capture windows Setup appears inside the VM console. Record the target computer and date.

**SCREENSHOTS** workstation-15

### Step 11: Start Windows Setup

**WORKSPACE** APP01 · Windows Setup installer

**DO** Choose the language you need for the course, time format, and keyboard, then Next and Install now. Use English (United States) media if you will follow the Azure upgrade-media route later.

**EXPECT** Setup displays an edition list or asks for a legitimate product key.

**IF STUCK** A key prompt depends on your media. Use your authorized course media and license; never enter a sample or shared key.

**EVIDENCE** Capture setup displays an edition list or asks for a legitimate product key. Record the target computer and date.

### Step 12: Choose Desktop Experience

**WORKSPACE** APP01 · Windows Setup installer

**DO** Select Windows Server 2019 Standard (Desktop Experience), or the matching authorized Datacenter (Desktop Experience) edition your course supplies. If using Evaluation for local practice, record that limitation. Click Next and accept the license only if you agree.

**EXPECT** The selected line explicitly includes 2019 and Desktop Experience.

**IF STUCK** If you omit Desktop Experience you get Server Core. This course does not teach switching Core to Desktop Experience; rebuild this new empty lab VM with the correct option.

**EVIDENCE** Capture the selected line explicitly includes 2019 and Desktop Experience. Record the target computer and date.

### Step 13: Install only on the new blank disk

**WORKSPACE** APP01 · Windows Setup installer

**DO** Choose Custom: Install Windows only (advanced). Select the new VM’s blank Drive 0 unallocated space and click Next. This is a clean install in a new VM, not the later Azure in-place upgrade.

**EXPECT** Windows copies files, installs, and restarts.

**IF STUCK** Stop if the disk contains existing partitions or data you did not expect. Never delete an unfamiliar disk to make the instructions fit.

**EVIDENCE** Capture windows copies files, installs, and restarts. Record the target computer and date.

### Step 14: Create the local Administrator password

**WORKSPACE** APP01 · Windows Setup installer

**DO** At Customize settings, set and confirm a strong local Administrator password. Save it in your own password manager, then Finish.

**EXPECT** The Windows sign-in screen appears.

**IF STUCK** Do not put passwords in the course saved result worksheet or screenshots.

**EVIDENCE** Capture the Windows sign-in screen appears. Record the target computer and date.

### Step 15: Sign into the guest

**WORKSPACE** APP01 · Windows Server desktop

**DO** Use Workstation VM > Send Ctrl+Alt+Del (or Ctrl+Alt+Insert), then sign in as the guest’s local Administrator.

**EXPECT** You see a Windows desktop and Server Manager.

**IF STUCK** If only a command window appears, you installed Server Core; return to the edition-selection step for this new lab VM.

**EVIDENCE** Capture you see a Windows desktop and Server Manager. Record the target computer and date.

### Step 16: Install VMware Tools

**WORKSPACE** Your Windows host · VMware Workstation Pro; then the named Windows guest

**DO** In Workstation select VM > Install VMware Tools. In the guest open File Explorer > This PC, open the VMware Tools CD, and run setup64.exe if offered. Choose the normal setup and restart when asked.

**EXPECT** After restart, the guest is usable with the expected mouse/display integration.

**IF STUCK** The menu may say Reinstall VMware Tools. VERSION CHECK REQUIRED: if the bundled Tools ISO is unavailable, use Broadcom’s supported Tools download for your Workstation and guest version.

**EVIDENCE** Capture after restart, the guest is usable with the expected mouse/display integration. Record the target computer and date.

### Step 17: Patch the new Server 2019 guest

**WORKSPACE** Your Windows host · VMware Workstation Pro; then the named Windows guest

**DO** This new guest is not domain-joined yet. Shut it down. In VMware choose VM > Settings > Network Adapter > NAT, keeping one adapter. Start Windows and set Ethernet IPv4 and DNS to Obtain automatically for this temporary update session. Open Start > Settings > Update & Security > Windows Update, check for updates and restart as required. Activate the evaluation while internet access is available. Shut down again, change the same adapter to Custom > VMnet2, and start the guest. The next network steps restore its planned static address and blank gateway before any domain work.

**EXPECT** Windows has completed its pending restarts.

**IF STUCK** VMnet2 has no internet route. Before AD promotion/domain join, power off this fresh guest, temporarily change its single adapter to NAT, obtain automatic IPv4/DNS, apply updates/activate, shut down, return the adapter to Custom VMnet2, and restore its planned static IPv4/DNS with a blank gateway. Keep one adapter only. Never bridge the guest or add an internet adapter to a domain controller.

**EVIDENCE** Capture windows has completed its pending restarts. Record the target computer and date.

### Step 18: Rename Windows

**WORKSPACE** APP01 · Windows System Properties

**DO** Inside the guest press Win+R, enter sysdm.cpl, and press Enter. On Computer Name choose Change. Enter APP01, confirm OK, and restart when prompted.

**EXPECT** After signing in again, hostname returns APP01.

**IF STUCK** Renaming the entry in the Workstation library does not rename Windows.

**EVIDENCE** Capture after signing in again, hostname returns APP01. Record the target computer and date.

**COMMAND**
> hostname

### Step 19: Open the guest IPv4 settings

**WORKSPACE** APP01 · Windows Network Connections

**DO** Inside the guest press Win+R, type ncpa.cpl, and press Enter. Right-click the connected Ethernet adapter > Properties. Select Internet Protocol Version 4 (TCP/IPv4), then Properties.

**EXPECT** The IPv4 address and DNS fields are visible.

**IF STUCK** This is the on-prem VM adapter. Azure VM address configuration is different and is set on the Azure NIC.

**EVIDENCE** Capture the IPv4 address and DNS fields are visible. Record the target computer and date.

### Step 20: Enter the lab address

**WORKSPACE** APP01 · Windows Server desktop

**DO** For the example LAB 03 network only, choose Use the following IP address: 10.50.0.30; subnet mask 255.255.255.0; leave Default gateway blank (VMnet2 is host-only). Set preferred DNS to 10.50.0.10. Click OK and Close. If you changed the subnet in LAB 03, use your matching address plan instead.

**EXPECT** ipconfig /all shows the planned 10.50.0.x address, blank default gateway, and the lab DNS address on VMnet2.

**IF STUCK** Do not enter a gateway on isolated VMnet2 or use a public DNS server as an AD client’s DNS. If an address conflict appears, stop and allocate an unused lab address.

**EVIDENCE** Capture ipconfig /all shows the planned 10.50.0.x address, blank default gateway, and the lab DNS address on VMnet2. Record the target computer and date.

**COMMAND**
> ipconfig /all

### Step 21: Confirm this is Server 2019

**WORKSPACE** APP01 · Windows PowerShell as administrator

**DO** Open Start, search Windows PowerShell, right-click it > Run as administrator. Run the read-only inventory below in this VM.

**EXPECT** WindowsProductName identifies Windows Server 2019; hostname identifies APP01.

**IF STUCK** If the version is 2022 or 2025, you have not built the requested source baseline. Do not present that as a 2019-to-2022 upgrade.

**EVIDENCE** Capture windowsProductName identifies Windows Server 2019; hostname identifies APP01. Record the target computer and date.

**COMMAND**
> hostname
> Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, OsBuildNumber
> DISM /online /Get-CurrentEdition

### Step 22: Check domain DNS before joining

**WORKSPACE** APP01 · Windows PowerShell as administrator

**DO** In APP01, open Windows PowerShell and run the checks below. Preferred DNS must be a reachable DC for lab.example.test.

**EXPECT** The domain resolves and the DC’s LDAP SRV records are returned.

**IF STUCK** Do not continue on a failed DNS lookup. Verify both VMs use the same VMnet, source DC is running, and the adapter points at lab AD DNS.

**EVIDENCE** Capture the domain resolves and the DC’s LDAP SRV records are returned. Record the target computer and date.

**COMMAND**
> Resolve-DnsName lab.example.test
> Resolve-DnsName -Type SRV _ldap._tcp.dc._msdcs.lab.example.test

### Step 23: Join the domain

**WORKSPACE** APP01 · Windows System Properties

**DO** Inside APP01 press Win+R > sysdm.cpl. On Computer Name select Change. Select Domain, enter lab.example.test, click OK, and supply your authorized lab join credentials.

**EXPECT** Windows welcomes the computer to lab.example.test and requests a restart.

**IF STUCK** Check DNS and time before changing passwords or disabling a firewall. Do not use your personal Microsoft account as AD credentials.

**EVIDENCE** Capture windows welcomes the computer to lab.example.test and requests a restart. Record the target computer and date.

### Step 24: Restart and verify membership

**WORKSPACE** APP01 · Windows PowerShell as administrator

**DO** Restart APP01. Sign in using Other user and an authorized account in lab.example.test. Run the checks below in Windows PowerShell.

**EXPECT** The reported domain is lab.example.test and the secure-channel test returns True.

**IF STUCK** If trust fails, record the error and check DNS/time and the computer account. Do not delete/rejoin a production computer as an experiment.

**EVIDENCE** Capture the reported domain is lab.example.test and the secure-channel test returns True. Record the target computer and date.

**COMMAND**
> hostname
> (Get-CimInstance Win32_ComputerSystem).Domain
> Test-ComputerSecureChannel -Verbose

### Step 25: Install IIS

**WORKSPACE** APP01 · Windows PowerShell as administrator

**DO** On APP01 open Windows PowerShell opened with Run as administrator and install the Web Server role. The command changes this guest, not the physical host.

**EXPECT** Success is True and Web-Server is installed.

**IF STUCK** Check the Server Manager result and servicing logs if the role fails; do not continue with an absent IIS service.

**EVIDENCE** Capture success is True and Web-Server is installed. Record the target computer and date.

**COMMAND**
> Install-WindowsFeature Web-Server -IncludeManagementTools

### Step 26: Create the test page

**WORKSPACE** APP01 · Windows Server desktop

**DO** On APP01 open Notepad as administrator. Save a simple index.html in C:\inetpub\wwwroot containing the text SONIC APP01 / Server 2019 source. Ensure the filename is not index.html.txt.

**EXPECT** Opening http://localhost/index.html in APP01 displays your text.

**IF STUCK** If you see the default IIS page, include /index.html in the URL and check the file extension. Do not expose the site publicly.

**EVIDENCE** Capture opening http://localhost/index.html in APP01 displays your text. Record the target computer and date.

### Step 27: Record the application baseline

**WORKSPACE** APP01 · Windows Server desktop

**DO** On another authorized lab guest open http://APP01/index.html. Record the URL, page text, source hostname, OS version, and file hash.

**EXPECT** The private test client can retrieve the source page before migration.

**IF STUCK** Check IIS service, private DNS, and Windows firewall scope. Do not treat a successful ping as application verification.

**EVIDENCE** Capture the private test client can retrieve the source page before migration. Record the target computer and date.

**COMMAND**
> Get-FileHash C:\inetpub\wwwroot\index.html -Algorithm SHA256
> Get-Service W3SVC

LAB 07 / OPTIONAL REPLICA

# Add DC02: copy the same domain

This exercise demonstrates AD replication. Unlike a new destination forest, DC02 stays in the lab.example.test domain.

**[ ]** Create DC02 (Windows Server Desktop Experience) on the same lab network. Name it DC02.

**[ ]** Assign 10.50.0.11/24; preferred DNS 10.50.0.10; VMware NAT gateway.

**[ ]** Open sysdm.cpl > Computer Name > Change > Domain, enter lab.example.test. Restart.

**[ ]** In Server Manager > Manage > Add Roles and Features, install Active Directory Domain Services.

**[ ]** Select Promote this server to a domain controller > Add a domain controller to an existing domain. Choose lab.example.test.

**[ ]** Use authorized domain admin credentials, enable DNS, choose Global Catalog, and finish the promotion.

**[ ]** After reboot, open PowerShell as Administrator on either DC and run the commands below.

**[ ]** Confirm the Operations OU, test.analyst, and GPO appear when you connect the admin consoles to DC02.

> repadmin /replsummary
> dcdiag /test:dns
> Get-ADDomainController -Filter * | Select-Object HostName,IPv4Address

**PASS CHECK** Two DC names appear; replication shows no persistent errors; user/GPO objects match.

WHY THIS MATTERS

Within one AD forest/domain, directory objects replicate to additional DCs. That is NOT how you transfer identities into a different forest, such as migrate.lab.example.test or a DISA-provided domain.

IF IT DOES NOT WORK

If replication fails, inspect both DNS settings, time synchronization, firewall rules, and Event Viewer &gt; Directory Service / DFS Replication.

**Replication summary** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** Physical host Workstation Pro, then DC02 Server 2019 guest / local Administrator and lab.example.test Domain Admin.

**BEFORE** LAB 02 must confirm Windows Server 2019 Desktop Experience media and host resources; LAB 03 must record the actual VMnet2 host-only subnet and blank default gateway and unused static addresses. Replica/member builds also require working DC01 DNS. Example addresses apply only to the different, non-overlapping 10.50.0.0/24 lab plan.

**PASS** Two DC names appear; replication shows no persistent errors; user/GPO objects match.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Open the new VM wizard

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** On your physical Windows PC, open VMware Workstation Pro. Click File, then New Virtual Machine. Do not do this inside another VM.

**EXPECT** The New Virtual Machine Wizard is open.

**IF STUCK** If VMware is absent, finish LAB 02. Help > About identifies your installed version.

**EVIDENCE** Capture the New Virtual Machine Wizard is open. Record the target computer and date.

**SCREENSHOTS** workstation-1

### Step 02: Choose Typical

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select Typical (recommended), then Next. The reference image has Custom selected; use the upper Typical radio button for this lab.

**EXPECT** The wizard asks how the guest operating system will be installed.

**IF STUCK** If you chose Custom, cancel and restart; do not change random advanced disk options.

**EVIDENCE** Capture the wizard asks how the guest operating system will be installed. Record the target computer and date.

**SCREENSHOTS** workstation-2

### Step 03: Use manual Windows installation

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select I will install the operating system later, then Next. This avoids Easy Install silently choosing an edition.

**EXPECT** The wizard lets you choose a guest OS profile.

**IF STUCK** Do not select the example Windows 7 ISO visible in the reference. We attach your Server 2019 ISO later.

**EVIDENCE** Capture the wizard lets you choose a guest OS profile. Record the target computer and date.

**SCREENSHOTS** workstation-4

### Step 04: Choose the Server 2019 guest profile

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select Microsoft Windows. Open Version and choose Windows Server 2019, then Next.

**EXPECT** The guest profile says Windows Server 2019.

**IF STUCK** VERSION CHECK REQUIRED: if your Workstation version does not list Server 2019, stop and check Broadcom compatibility/update guidance; the profile is not the ISO and selecting a newer OS does not install it.

**EVIDENCE** Capture the guest profile says Windows Server 2019. Record the target computer and date.

### Step 05: Name the VM

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Enter DC02 as the virtual machine name. Browse to a folder with enough free space, such as your dedicated SONIC lab folder, then Next.

**EXPECT** The summary uses DC02 and a location you can find again.

**IF STUCK** The VMware name and the Windows computer name are different settings; we will rename Windows after installation.

**EVIDENCE** Capture the summary uses DC02 and a location you can find again. Record the target computer and date.

**SCREENSHOTS** workstation-6

### Step 06: Create a new virtual disk

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Set Maximum disk size to 60 GB for this lab plan. Choose Split virtual disk into multiple files, then Next. If Allocate all disk space now is offered, leave it unchecked so the disk can grow as needed. Splitting files alone does not make a disk growable. Do not attach an existing disk.

**EXPECT** A new blank virtual disk is selected.

**IF STUCK** This is a lab sizing example, not a product minimum. Stop if the host lacks free space for your planned VMs.

**EVIDENCE** Capture a new blank virtual disk is selected. Record the target computer and date.

**SCREENSHOTS** workstation-14

### Step 07: Set memory and CPU

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Click Customize Hardware. Select Memory and enter 2048 MB for a tiny practice DC. Select Processors: 1 processor, 1 core. If Windows updates or the desktop are too slow, shut down and raise memory to 4096 MB. These are practice allocations, not production sizing.

**EXPECT** The Memory page shows 2048 MB (or your recorded 4096 MB fallback), and Processors shows one total core.

**IF STUCK** Leave RAM for the physical host. SQL/MECM need more resources than a domain controller; do not start all optional VMs together on a small PC.

**EVIDENCE** Save the VM hardware summary showing the memory and CPU values you chose.

**SCREENSHOTS** workstation-9, workstation-8

### Step 08: Attach the Server 2019 ISO

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select CD/DVD in the hardware list. Choose Use ISO image file, Browse to your Windows Server 2019 ISO, and enable Connect at power on.

**EXPECT** The CD/DVD path ends with your Server 2019 ISO filename.

**IF STUCK** If a different ISO is listed, replace it now; the guest OS profile alone does not select installation media.

**EVIDENCE** Capture the CD/DVD path ends with your Server 2019 ISO filename. Record the target computer and date.

### Step 09: Attach the private VMnet

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select Network Adapter. Choose Custom: Specific virtual network and VMnet2 (Host-only) from LAB 03. Enable Connected and Connect at power on.

**EXPECT** The VM is attached to the same private lab VMnet as the other lab servers.

**IF STUCK** Do not choose Bridged. If your custom VMnet is missing, return to Virtual Network Editor and verify its name before continuing.

**EVIDENCE** Capture the VM is attached to the same private lab VMnet as the other lab servers. Record the target computer and date.

### Step 10: Finish and start the VM

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Click Close, then Finish. Select the new VM in the Workstation library and click Power on this virtual machine. Click inside its console and press a key when the ISO boot prompt appears.

**EXPECT** Windows Setup appears inside the VM console.

**IF STUCK** If it boots to a network screen or no OS found, power off, check CD/DVD ISO and Connect at power on, then retry. Ctrl+Alt releases your mouse from the console.

**EVIDENCE** Capture windows Setup appears inside the VM console. Record the target computer and date.

**SCREENSHOTS** workstation-15

### Step 11: Start Windows Setup

**WORKSPACE** DC02 · Windows Setup installer

**DO** Choose the language you need for the course, time format, and keyboard, then Next and Install now. Use English (United States) media if you will follow the Azure upgrade-media route later.

**EXPECT** Setup displays an edition list or asks for a legitimate product key.

**IF STUCK** A key prompt depends on your media. Use your authorized course media and license; never enter a sample or shared key.

**EVIDENCE** Capture setup displays an edition list or asks for a legitimate product key. Record the target computer and date.

### Step 12: Choose Desktop Experience

**WORKSPACE** DC02 · Windows Setup installer

**DO** Select Windows Server 2019 Standard (Desktop Experience), or the matching authorized Datacenter (Desktop Experience) edition your course supplies. If using Evaluation for local practice, record that limitation. Click Next and accept the license only if you agree.

**EXPECT** The selected line explicitly includes 2019 and Desktop Experience.

**IF STUCK** If you omit Desktop Experience you get Server Core. This course does not teach switching Core to Desktop Experience; rebuild this new empty lab VM with the correct option.

**EVIDENCE** Capture the selected line explicitly includes 2019 and Desktop Experience. Record the target computer and date.

### Step 13: Install only on the new blank disk

**WORKSPACE** DC02 · Windows Setup installer

**DO** Choose Custom: Install Windows only (advanced). Select the new VM’s blank Drive 0 unallocated space and click Next. This is a clean install in a new VM, not the later Azure in-place upgrade.

**EXPECT** Windows copies files, installs, and restarts.

**IF STUCK** Stop if the disk contains existing partitions or data you did not expect. Never delete an unfamiliar disk to make the instructions fit.

**EVIDENCE** Capture windows copies files, installs, and restarts. Record the target computer and date.

### Step 14: Create the local Administrator password

**WORKSPACE** DC02 · Windows Setup installer

**DO** At Customize settings, set and confirm a strong local Administrator password. Save it in your own password manager, then Finish.

**EXPECT** The Windows sign-in screen appears.

**IF STUCK** Do not put passwords in the course saved result worksheet or screenshots.

**EVIDENCE** Capture the Windows sign-in screen appears. Record the target computer and date.

### Step 15: Sign into the guest

**WORKSPACE** DC02 · Windows Server desktop

**DO** Use Workstation VM > Send Ctrl+Alt+Del (or Ctrl+Alt+Insert), then sign in as the guest’s local Administrator.

**EXPECT** You see a Windows desktop and Server Manager.

**IF STUCK** If only a command window appears, you installed Server Core; return to the edition-selection step for this new lab VM.

**EVIDENCE** Capture you see a Windows desktop and Server Manager. Record the target computer and date.

### Step 16: Install VMware Tools

**WORKSPACE** Your Windows host · VMware Workstation Pro; then the named Windows guest

**DO** In Workstation select VM > Install VMware Tools. In the guest open File Explorer > This PC, open the VMware Tools CD, and run setup64.exe if offered. Choose the normal setup and restart when asked.

**EXPECT** After restart, the guest is usable with the expected mouse/display integration.

**IF STUCK** The menu may say Reinstall VMware Tools. VERSION CHECK REQUIRED: if the bundled Tools ISO is unavailable, use Broadcom’s supported Tools download for your Workstation and guest version.

**EVIDENCE** Capture after restart, the guest is usable with the expected mouse/display integration. Record the target computer and date.

### Step 17: Patch the new Server 2019 guest

**WORKSPACE** Your Windows host · VMware Workstation Pro; then the named Windows guest

**DO** This new guest is not domain-joined yet. Shut it down. In VMware choose VM > Settings > Network Adapter > NAT, keeping one adapter. Start Windows and set Ethernet IPv4 and DNS to Obtain automatically for this temporary update session. Open Start > Settings > Update & Security > Windows Update, check for updates and restart as required. Activate the evaluation while internet access is available. Shut down again, change the same adapter to Custom > VMnet2, and start the guest. The next network steps restore its planned static address and blank gateway before any domain work.

**EXPECT** Windows has completed its pending restarts.

**IF STUCK** VMnet2 has no internet route. Before AD promotion/domain join, power off this fresh guest, temporarily change its single adapter to NAT, obtain automatic IPv4/DNS, apply updates/activate, shut down, return the adapter to Custom VMnet2, and restore its planned static IPv4/DNS with a blank gateway. Keep one adapter only. Never bridge the guest or add an internet adapter to a domain controller.

**EVIDENCE** Capture windows has completed its pending restarts. Record the target computer and date.

### Step 18: Rename Windows

**WORKSPACE** DC02 · Windows System Properties

**DO** Inside the guest press Win+R, enter sysdm.cpl, and press Enter. On Computer Name choose Change. Enter DC02, confirm OK, and restart when prompted.

**EXPECT** After signing in again, hostname returns DC02.

**IF STUCK** Renaming the entry in the Workstation library does not rename Windows.

**EVIDENCE** Capture after signing in again, hostname returns DC02. Record the target computer and date.

**COMMAND**
> hostname

### Step 19: Open the guest IPv4 settings

**WORKSPACE** DC02 · Windows Network Connections

**DO** Inside the guest press Win+R, type ncpa.cpl, and press Enter. Right-click the connected Ethernet adapter > Properties. Select Internet Protocol Version 4 (TCP/IPv4), then Properties.

**EXPECT** The IPv4 address and DNS fields are visible.

**IF STUCK** This is the on-prem VM adapter. Azure VM address configuration is different and is set on the Azure NIC.

**EVIDENCE** Capture the IPv4 address and DNS fields are visible. Record the target computer and date.

### Step 20: Enter the lab address

**WORKSPACE** DC02 · Windows Server desktop

**DO** For the example LAB 03 network only, choose Use the following IP address: 10.50.0.11; subnet mask 255.255.255.0; leave Default gateway blank (VMnet2 is host-only). Set preferred DNS to 10.50.0.10. Click OK and Close. If you changed the subnet in LAB 03, use your matching address plan instead.

**EXPECT** ipconfig /all shows the planned 10.50.0.x address, blank default gateway, and the lab DNS address on VMnet2.

**IF STUCK** Do not enter a gateway on isolated VMnet2 or use a public DNS server as an AD client’s DNS. If an address conflict appears, stop and allocate an unused lab address.

**EVIDENCE** Capture ipconfig /all shows the planned 10.50.0.x address, blank default gateway, and the lab DNS address on VMnet2. Record the target computer and date.

**COMMAND**
> ipconfig /all

### Step 21: Prove the two private servers can talk

**WORKSPACE** DC01 · Windows PowerShell as administrator

**DO** Start both VMs on VMnet2. On DC01 and DC02 open Windows PowerShell as administrator. On each, run New-NetFirewallRule -DisplayName 'CloudSeam lab ping' -Direction Inbound -Protocol ICMPv4 -IcmpType 8 -RemoteAddress 10.50.0.0/24 -Action Allow -Profile Any once to permit lab-only echo requests. Keep Windows Firewall on. On DC01 run ipconfig and then ping 10.50.0.11. On DC02 run the commands below. Do not promote DC02 until replies work in both directions.

**EXPECT** DC01's console shows 10.50.0.10 with mask 255.255.255.0 and replies from 10.50.0.11. DC02 shows 10.50.0.11 with the same mask and replies from 10.50.0.10. Both default gateways are blank. Ping proves reachability, not AD replication.

**IF STUCK** Check both adapters are Custom VMnet2, each static address is unique, and the scoped ICMP rule exists on both guests. A 169.254 address means the static configuration is incomplete. Do not disable the firewall or bridge the guests. To undo this lab rule on either guest, use Remove-NetFirewallRule -DisplayName 'CloudSeam lab ping'.

**EVIDENCE** Keep two screenshots: each live console must show its own private address and a successful ping to the other server. Never use the public address for this check.

**COMMAND**
> hostname
> ipconfig
> ping 10.50.0.10

### Step 22: Check domain DNS before joining

**WORKSPACE** DC02 · Windows PowerShell as administrator

**DO** In DC02, open Windows PowerShell and run the checks below. Preferred DNS must be a reachable DC for lab.example.test.

**EXPECT** The domain resolves and the DC’s LDAP SRV records are returned.

**IF STUCK** Do not continue on a failed DNS lookup. Verify both VMs use the same VMnet, source DC is running, and the adapter points at lab AD DNS.

**EVIDENCE** Capture the domain resolves and the DC’s LDAP SRV records are returned. Record the target computer and date.

**COMMAND**
> Resolve-DnsName lab.example.test
> Resolve-DnsName -Type SRV _ldap._tcp.dc._msdcs.lab.example.test

### Step 23: Join the domain

**WORKSPACE** DC02 · Windows System Properties

**DO** Inside DC02 press Win+R > sysdm.cpl. On Computer Name select Change. Select Domain, enter lab.example.test, click OK, and supply your authorized lab join credentials.

**EXPECT** Windows welcomes the computer to lab.example.test and requests a restart.

**IF STUCK** Check DNS and time before changing passwords or disabling a firewall. Do not use your personal Microsoft account as AD credentials.

**EVIDENCE** Capture windows welcomes the computer to lab.example.test and requests a restart. Record the target computer and date.

### Step 24: Restart and verify membership

**WORKSPACE** DC02 · Windows PowerShell as administrator

**DO** Restart DC02. Sign in using Other user and an authorized account in lab.example.test. Run the checks below in Windows PowerShell.

**EXPECT** The reported domain is lab.example.test and the secure-channel test returns True.

**IF STUCK** If trust fails, record the error and check DNS/time and the computer account. Do not delete/rejoin a production computer as an experiment.

**EVIDENCE** Capture the reported domain is lab.example.test and the secure-channel test returns True. Record the target computer and date.

**COMMAND**
> hostname
> (Get-CimInstance Win32_ComputerSystem).Domain
> Test-ComputerSecureChannel -Verbose

### Step 25: Open Add Roles and Features

**WORKSPACE** DC02 · Server Manager

**DO** Inside the named server open Server Manager. Choose Manage > Add Roles and Features. Click Next on Before you begin.

**EXPECT** The Select installation type page is shown.

**IF STUCK** If Server Manager is closed, open Start and select Server Manager. Run as the authorized local Administrator for a new forest, or Domain Admin for a replica.

**EVIDENCE** Capture the Select installation type page is shown. Record the target computer and date.

### Step 26: Select the local destination server

**WORKSPACE** DC02 · Windows Server desktop

**DO** Choose Role-based or feature-based installation > Next. Select a server from the server pool and select this VM’s computer name > Next.

**EXPECT** The Server Roles page targets the correct computer.

**IF STUCK** If the target name is wrong, cancel; do not install AD DS on a member server by mistake.

**EVIDENCE** Capture the Server Roles page targets the correct computer. Record the target computer and date.

### Step 27: Select AD DS and its tools

**WORKSPACE** DC02 · Windows Server desktop

**DO** Check Active Directory Domain Services. In the pop-up click Add Features, then Next.

**EXPECT** AD DS is selected and its required management tools are included.

**IF STUCK** Installing DNS alone does not create a domain. Confirm you selected Active Directory Domain Services.

**EVIDENCE** Capture aD DS is selected and its required management tools are included. Record the target computer and date.

**SCREENSHOTS** ad-roles, ad-features

### Step 28: Install the role

**WORKSPACE** DC02 · Windows Server desktop

**DO** Keep the required Features selected. Click Next through the AD DS information page, review the selected target, then click Install.

**EXPECT** Installation succeeds and offers Promote this server to a domain controller.

**IF STUCK** If it fails, read the failed feature and Server Manager error before retrying; do not continue straight to promotion.

**EVIDENCE** Capture installation succeeds and offers Promote this server to a domain controller. Record the target computer and date.

**SCREENSHOTS** ad-promote

### Step 29: Choose the correct promotion operation

**WORKSPACE** DC02 · Windows Server desktop

**DO** Click Promote this server to a domain controller. Select Add a domain controller to an existing domain. Enter lab.example.test and use Change to supply an authorized domain administrator account.

**EXPECT** The wizard shows the existing lab.example.test domain.

**IF STUCK** A replica must not create a second forest with the same name. A destination forest must not accidentally join the source forest.

**EVIDENCE** Capture the wizard shows the existing lab.example.test domain. Record the target computer and date.

### Step 30: Set controller options and DSRM

**WORKSPACE** DC02 · Windows Server desktop

**DO** Keep DNS server and Global Catalog selected; do not select Read only domain controller. Set and confirm a unique DSRM recovery password, store it securely, then Next.

**EXPECT** Required options are selected and the password boxes have no validation error.

**IF STUCK** Windows Server 2019 has no Windows Server 2019 functional-level choice. Never copy the older functional levels or passwords from a reference image.

**EVIDENCE** Capture required options are selected and the password boxes have no validation error. Record the target computer and date.

**SCREENSHOTS** ad-dc-options

### Step 31: Review DNS and additional options

**WORKSPACE** DC02 · Windows Server desktop

**DO** On Additional Options choose DC01 as the replication source if offered; confirm DNS resolves lab.example.test before continuing.

**EXPECT** The wizard advances without a blocking validation error.

**IF STUCK** A yellow delegation warning for a private root is different from a red failed prerequisite. Stop for DNS, credential, or connectivity failures.

**EVIDENCE** Capture the wizard advances without a blocking validation error. Record the target computer and date.

### Step 32: Keep the default AD paths

**WORKSPACE** DC02 · Windows Server desktop

**DO** On Paths keep the default NTDS database/log and SYSVOL locations for this small lab, then Next.

**EXPECT** The wizard shows Review Options.

**IF STUCK** This is a practice lab layout, not a production storage design. Do not put AD data on a temporary disk.

**EVIDENCE** Capture the wizard shows Review Options. Record the target computer and date.

**SCREENSHOTS** ad-paths

### Step 33: Check prerequisites before promotion

**WORKSPACE** DC02 · Windows Server desktop

**DO** On Review Options confirm lab.example.test, the correct computer, and DNS. Click Next, then wait for Prerequisites Check.

**EXPECT** The prerequisite check succeeds; only understood lab warnings remain.

**IF STUCK** Read every red failure. Correct its stated cause and rerun the check before clicking Install.

**EVIDENCE** Capture the prerequisite check succeeds; only understood lab warnings remain. Record the target computer and date.

**SCREENSHOTS** ad-review, ad-prerequisites

### Step 34: Promote and wait for restart

**WORKSPACE** DC02 · Windows Server desktop

**DO** Click Install only after the prerequisite check passes. Wait for the VM to restart; do not power it off to shorten the wait.

**EXPECT** The guest restarts and offers a domain sign-in.

**IF STUCK** If promotion fails, keep the message and check Server Manager and Event Viewer > Windows Logs > Directory Service/System before retrying.

**EVIDENCE** Capture the guest restarts and offers a domain sign-in. Record the target computer and date.

### Step 35: Verify the directory

**WORKSPACE** DC02 · Windows PowerShell as administrator

**DO** Sign in with your authorized lab.example.test administrator account. Open Windows PowerShell as administrator in this VM and run the checks.

**EXPECT** The DNSRoot is lab.example.test and domain-controller records resolve to the lab’s private IPs.

**IF STUCK** If Get-ADDomain is unavailable, confirm you are on the promoted server with the AD management tools. If DNS fails, check the adapter’s DNS and the domain DNS zone.

**EVIDENCE** Capture the DNSRoot is lab.example.test and domain-controller records resolve to the lab’s private IPs. Record the target computer and date.

**COMMAND**
> hostname
> Get-ADDomain | Select-Object DNSRoot, NetBIOSName
> Resolve-DnsName -Type SRV _ldap._tcp.dc._msdcs.lab.example.test

### Step 36: Prove replication

**WORKSPACE** DC02 · Windows PowerShell as administrator

**DO** On DC02 run the read-only checks. On DC01 create a harmless test OU in ADUC and confirm it appears when ADUC is explicitly connected to DC02.

**EXPECT** Both DCs are listed and replication reports no unexplained failures.

**IF STUCK** Do not revert just one DC to an old snapshot. Check DNS, time, and Directory Service logs; use AD-aware recovery or rebuild the practice replica after a proper demotion plan.

**EVIDENCE** Capture both DCs are listed and replication reports no unexplained failures. Record the target computer and date.

**COMMAND**
> Get-ADDomainController -Filter * | Select-Object HostName, IPv4Address
> repadmin /replsummary
> dcdiag /test:replications

LAB 08 / SECOND FOREST

# Create DEST-DC01: the NEW enterprise

Build the other school. Its directory must remain completely separate from lab.example.test.

**[ ]** Create a new Windows Server Desktop Experience VM named DEST-DC01. Use 2 vCPUs, 4 GB RAM, ~60 GB thin disk, same lab NAT VMnet.

**[ ]** Set static IP 10.50.0.40/24, preferred DNS 10.50.0.40, gateway to your NAT address.

**[ ]** In Server Manager > Manage > Add Roles and Features, install Active Directory Domain Services.

**[ ]** Select Promote this server to a domain controller > Add a new forest. Enter migrate.lab.example.test.

**[ ]** Enable DNS, keep Global Catalog selected, and configure a strong DSRM password. Complete promotion and restart.

**[ ]** Open AD Users and Computers. Verify the tree shows migrate.lab.example.test, not lab.example.test.

**[ ]** Create an Operations OU. Create a *new* test.analyst account and GG-Operations group in migrate.lab.example.test. Record the domain in which you created each.

> Get-ADDomain | Select-Object DNSRoot
> Get-ADUser test.analyst | Select-Object Name,SID

**PASS CHECK** DEST-DC01 shows migrate.lab.example.test; the account SID differs from lab.example.test's test.analyst SID.

WHY THIS MATTERS

Same username does not mean same identity. Separate domains generate different security identifiers. Real migrations require a plan for group mappings, service accounts, permissions, and user profiles.

IF IT DOES NOT WORK

Do not join DEST-DC01 to lab.example.test first. If you accidentally promoted into the wrong forest, revert to a clean pre-promotion VM snapshot and build the intended separate forest again.

**Destination forest / sample SID ending** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** Physical host Workstation Pro, then DEST-DC01 Server 2019 guest / local Administrator for a new migrate.lab.example.test forest.

**BEFORE** LAB 02 must confirm Windows Server 2019 Desktop Experience media and host resources; LAB 03 must record the actual VMnet2 host-only subnet and blank default gateway and unused static addresses. Replica/member builds also require working DC01 DNS. Example addresses apply only to the different, non-overlapping 10.50.0.0/24 lab plan.

**PASS** DEST-DC01 shows migrate.lab.example.test; the account SID differs from lab.example.test's test.analyst SID.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Open the new VM wizard

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** On your physical Windows PC, open VMware Workstation Pro. Click File, then New Virtual Machine. Do not do this inside another VM.

**EXPECT** The New Virtual Machine Wizard is open.

**IF STUCK** If VMware is absent, finish LAB 02. Help > About identifies your installed version.

**EVIDENCE** Capture the New Virtual Machine Wizard is open. Record the target computer and date.

**SCREENSHOTS** workstation-1

### Step 02: Choose Typical

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select Typical (recommended), then Next. The reference image has Custom selected; use the upper Typical radio button for this lab.

**EXPECT** The wizard asks how the guest operating system will be installed.

**IF STUCK** If you chose Custom, cancel and restart; do not change random advanced disk options.

**EVIDENCE** Capture the wizard asks how the guest operating system will be installed. Record the target computer and date.

**SCREENSHOTS** workstation-2

### Step 03: Use manual Windows installation

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select I will install the operating system later, then Next. This avoids Easy Install silently choosing an edition.

**EXPECT** The wizard lets you choose a guest OS profile.

**IF STUCK** Do not select the example Windows 7 ISO visible in the reference. We attach your Server 2019 ISO later.

**EVIDENCE** Capture the wizard lets you choose a guest OS profile. Record the target computer and date.

**SCREENSHOTS** workstation-4

### Step 04: Choose the Server 2019 guest profile

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select Microsoft Windows. Open Version and choose Windows Server 2019, then Next.

**EXPECT** The guest profile says Windows Server 2019.

**IF STUCK** VERSION CHECK REQUIRED: if your Workstation version does not list Server 2019, stop and check Broadcom compatibility/update guidance; the profile is not the ISO and selecting a newer OS does not install it.

**EVIDENCE** Capture the guest profile says Windows Server 2019. Record the target computer and date.

### Step 05: Name the VM

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Enter DEST-DC01 as the virtual machine name. Browse to a folder with enough free space, such as your dedicated SONIC lab folder, then Next.

**EXPECT** The summary uses DEST-DC01 and a location you can find again.

**IF STUCK** The VMware name and the Windows computer name are different settings; we will rename Windows after installation.

**EVIDENCE** Capture the summary uses DEST-DC01 and a location you can find again. Record the target computer and date.

**SCREENSHOTS** workstation-6

### Step 06: Create a new virtual disk

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Set Maximum disk size to 60 GB for this lab plan. Choose Split virtual disk into multiple files, then Next. If Allocate all disk space now is offered, leave it unchecked so the disk can grow as needed. Splitting files alone does not make a disk growable. Do not attach an existing disk.

**EXPECT** A new blank virtual disk is selected.

**IF STUCK** This is a lab sizing example, not a product minimum. Stop if the host lacks free space for your planned VMs.

**EVIDENCE** Capture a new blank virtual disk is selected. Record the target computer and date.

**SCREENSHOTS** workstation-14

### Step 07: Set memory and CPU

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Click Customize Hardware. Select Memory and enter 2048 MB for a tiny practice DC. Select Processors: 1 processor, 1 core. If Windows updates or the desktop are too slow, shut down and raise memory to 4096 MB. These are practice allocations, not production sizing.

**EXPECT** The Memory page shows 2048 MB (or your recorded 4096 MB fallback), and Processors shows one total core.

**IF STUCK** Leave RAM for the physical host. SQL/MECM need more resources than a domain controller; do not start all optional VMs together on a small PC.

**EVIDENCE** Save the VM hardware summary showing the memory and CPU values you chose.

**SCREENSHOTS** workstation-9, workstation-8

### Step 08: Attach the Server 2019 ISO

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select CD/DVD in the hardware list. Choose Use ISO image file, Browse to your Windows Server 2019 ISO, and enable Connect at power on.

**EXPECT** The CD/DVD path ends with your Server 2019 ISO filename.

**IF STUCK** If a different ISO is listed, replace it now; the guest OS profile alone does not select installation media.

**EVIDENCE** Capture the CD/DVD path ends with your Server 2019 ISO filename. Record the target computer and date.

### Step 09: Attach the private VMnet

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select Network Adapter. Choose Custom: Specific virtual network and VMnet2 (Host-only) from LAB 03. Enable Connected and Connect at power on.

**EXPECT** The VM is attached to the same private lab VMnet as the other lab servers.

**IF STUCK** Do not choose Bridged. If your custom VMnet is missing, return to Virtual Network Editor and verify its name before continuing.

**EVIDENCE** Capture the VM is attached to the same private lab VMnet as the other lab servers. Record the target computer and date.

### Step 10: Finish and start the VM

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Click Close, then Finish. Select the new VM in the Workstation library and click Power on this virtual machine. Click inside its console and press a key when the ISO boot prompt appears.

**EXPECT** Windows Setup appears inside the VM console.

**IF STUCK** If it boots to a network screen or no OS found, power off, check CD/DVD ISO and Connect at power on, then retry. Ctrl+Alt releases your mouse from the console.

**EVIDENCE** Capture windows Setup appears inside the VM console. Record the target computer and date.

**SCREENSHOTS** workstation-15

### Step 11: Start Windows Setup

**WORKSPACE** DEST-DC01 · Windows Setup installer

**DO** Choose the language you need for the course, time format, and keyboard, then Next and Install now. Use English (United States) media if you will follow the Azure upgrade-media route later.

**EXPECT** Setup displays an edition list or asks for a legitimate product key.

**IF STUCK** A key prompt depends on your media. Use your authorized course media and license; never enter a sample or shared key.

**EVIDENCE** Capture setup displays an edition list or asks for a legitimate product key. Record the target computer and date.

### Step 12: Choose Desktop Experience

**WORKSPACE** DEST-DC01 · Windows Setup installer

**DO** Select Windows Server 2019 Standard (Desktop Experience), or the matching authorized Datacenter (Desktop Experience) edition your course supplies. If using Evaluation for local practice, record that limitation. Click Next and accept the license only if you agree.

**EXPECT** The selected line explicitly includes 2019 and Desktop Experience.

**IF STUCK** If you omit Desktop Experience you get Server Core. This course does not teach switching Core to Desktop Experience; rebuild this new empty lab VM with the correct option.

**EVIDENCE** Capture the selected line explicitly includes 2019 and Desktop Experience. Record the target computer and date.

### Step 13: Install only on the new blank disk

**WORKSPACE** DEST-DC01 · Windows Setup installer

**DO** Choose Custom: Install Windows only (advanced). Select the new VM’s blank Drive 0 unallocated space and click Next. This is a clean install in a new VM, not the later Azure in-place upgrade.

**EXPECT** Windows copies files, installs, and restarts.

**IF STUCK** Stop if the disk contains existing partitions or data you did not expect. Never delete an unfamiliar disk to make the instructions fit.

**EVIDENCE** Capture windows copies files, installs, and restarts. Record the target computer and date.

### Step 14: Create the local Administrator password

**WORKSPACE** DEST-DC01 · Windows Setup installer

**DO** At Customize settings, set and confirm a strong local Administrator password. Save it in your own password manager, then Finish.

**EXPECT** The Windows sign-in screen appears.

**IF STUCK** Do not put passwords in the course saved result worksheet or screenshots.

**EVIDENCE** Capture the Windows sign-in screen appears. Record the target computer and date.

### Step 15: Sign into the guest

**WORKSPACE** DEST-DC01 · Windows Server desktop

**DO** Use Workstation VM > Send Ctrl+Alt+Del (or Ctrl+Alt+Insert), then sign in as the guest’s local Administrator.

**EXPECT** You see a Windows desktop and Server Manager.

**IF STUCK** If only a command window appears, you installed Server Core; return to the edition-selection step for this new lab VM.

**EVIDENCE** Capture you see a Windows desktop and Server Manager. Record the target computer and date.

### Step 16: Install VMware Tools

**WORKSPACE** Your Windows host · VMware Workstation Pro; then the named Windows guest

**DO** In Workstation select VM > Install VMware Tools. In the guest open File Explorer > This PC, open the VMware Tools CD, and run setup64.exe if offered. Choose the normal setup and restart when asked.

**EXPECT** After restart, the guest is usable with the expected mouse/display integration.

**IF STUCK** The menu may say Reinstall VMware Tools. VERSION CHECK REQUIRED: if the bundled Tools ISO is unavailable, use Broadcom’s supported Tools download for your Workstation and guest version.

**EVIDENCE** Capture after restart, the guest is usable with the expected mouse/display integration. Record the target computer and date.

### Step 17: Patch the new Server 2019 guest

**WORKSPACE** Your Windows host · VMware Workstation Pro; then the named Windows guest

**DO** This new guest is not domain-joined yet. Shut it down. In VMware choose VM > Settings > Network Adapter > NAT, keeping one adapter. Start Windows and set Ethernet IPv4 and DNS to Obtain automatically for this temporary update session. Open Start > Settings > Update & Security > Windows Update, check for updates and restart as required. Activate the evaluation while internet access is available. Shut down again, change the same adapter to Custom > VMnet2, and start the guest. The next network steps restore its planned static address and blank gateway before any domain work.

**EXPECT** Windows has completed its pending restarts.

**IF STUCK** VMnet2 has no internet route. Before AD promotion/domain join, power off this fresh guest, temporarily change its single adapter to NAT, obtain automatic IPv4/DNS, apply updates/activate, shut down, return the adapter to Custom VMnet2, and restore its planned static IPv4/DNS with a blank gateway. Keep one adapter only. Never bridge the guest or add an internet adapter to a domain controller.

**EVIDENCE** Capture windows has completed its pending restarts. Record the target computer and date.

### Step 18: Rename Windows

**WORKSPACE** DEST-DC01 · Windows System Properties

**DO** Inside the guest press Win+R, enter sysdm.cpl, and press Enter. On Computer Name choose Change. Enter DEST-DC01, confirm OK, and restart when prompted.

**EXPECT** After signing in again, hostname returns DEST-DC01.

**IF STUCK** Renaming the entry in the Workstation library does not rename Windows.

**EVIDENCE** Capture after signing in again, hostname returns DEST-DC01. Record the target computer and date.

**COMMAND**
> hostname

### Step 19: Open the guest IPv4 settings

**WORKSPACE** DEST-DC01 · Windows Network Connections

**DO** Inside the guest press Win+R, type ncpa.cpl, and press Enter. Right-click the connected Ethernet adapter > Properties. Select Internet Protocol Version 4 (TCP/IPv4), then Properties.

**EXPECT** The IPv4 address and DNS fields are visible.

**IF STUCK** This is the on-prem VM adapter. Azure VM address configuration is different and is set on the Azure NIC.

**EVIDENCE** Capture the IPv4 address and DNS fields are visible. Record the target computer and date.

### Step 20: Enter the lab address

**WORKSPACE** DEST-DC01 · Windows Server desktop

**DO** For the example LAB 03 network only, choose Use the following IP address: 10.50.0.30; subnet mask 255.255.255.0; leave Default gateway blank (VMnet2 is host-only). Set preferred DNS to 10.50.0.30. Click OK and Close. If you changed the subnet in LAB 03, use your matching address plan instead.

**EXPECT** ipconfig /all shows the planned 10.50.0.x address, blank default gateway, and the lab DNS address on VMnet2.

**IF STUCK** Do not enter a gateway on isolated VMnet2 or use a public DNS server as an AD client’s DNS. If an address conflict appears, stop and allocate an unused lab address.

**EVIDENCE** Capture ipconfig /all shows the planned 10.50.0.x address, blank default gateway, and the lab DNS address on VMnet2. Record the target computer and date.

**COMMAND**
> ipconfig /all

### Step 21: Confirm this is Server 2019

**WORKSPACE** DEST-DC01 · Windows PowerShell as administrator

**DO** Open Start, search Windows PowerShell, right-click it > Run as administrator. Run the read-only inventory below in this VM.

**EXPECT** WindowsProductName identifies Windows Server 2019; hostname identifies DEST-DC01.

**IF STUCK** If the version is 2022 or 2025, you have not built the requested source baseline. Do not present that as a 2019-to-2022 upgrade.

**EVIDENCE** Capture windowsProductName identifies Windows Server 2019; hostname identifies DEST-DC01. Record the target computer and date.

**COMMAND**
> hostname
> Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, OsBuildNumber
> DISM /online /Get-CurrentEdition

### Step 22: Open Add Roles and Features

**WORKSPACE** DEST-DC01 · Server Manager

**DO** Inside the named server open Server Manager. Choose Manage > Add Roles and Features. Click Next on Before you begin.

**EXPECT** The Select installation type page is shown.

**IF STUCK** If Server Manager is closed, open Start and select Server Manager. Run as the authorized local Administrator for a new forest, or Domain Admin for a replica.

**EVIDENCE** Capture the Select installation type page is shown. Record the target computer and date.

### Step 23: Select the local destination server

**WORKSPACE** DEST-DC01 · Windows Server desktop

**DO** Choose Role-based or feature-based installation > Next. Select a server from the server pool and select this VM’s computer name > Next.

**EXPECT** The Server Roles page targets the correct computer.

**IF STUCK** If the target name is wrong, cancel; do not install AD DS on a member server by mistake.

**EVIDENCE** Capture the Server Roles page targets the correct computer. Record the target computer and date.

### Step 24: Select AD DS and its tools

**WORKSPACE** DEST-DC01 · Windows Server desktop

**DO** Check Active Directory Domain Services. In the pop-up click Add Features, then Next.

**EXPECT** AD DS is selected and its required management tools are included.

**IF STUCK** Installing DNS alone does not create a domain. Confirm you selected Active Directory Domain Services.

**EVIDENCE** Capture aD DS is selected and its required management tools are included. Record the target computer and date.

**SCREENSHOTS** ad-roles, ad-features

### Step 25: Install the role

**WORKSPACE** DEST-DC01 · Windows Server desktop

**DO** Keep the required Features selected. Click Next through the AD DS information page, review the selected target, then click Install.

**EXPECT** Installation succeeds and offers Promote this server to a domain controller.

**IF STUCK** If it fails, read the failed feature and Server Manager error before retrying; do not continue straight to promotion.

**EVIDENCE** Capture installation succeeds and offers Promote this server to a domain controller. Record the target computer and date.

**SCREENSHOTS** ad-promote

### Step 26: Choose the correct promotion operation

**WORKSPACE** DEST-DC01 · Windows Server desktop

**DO** Click Promote this server to a domain controller. Choose Add a new forest. Enter migrate.lab.example.test as Root domain name. Click Next.

**EXPECT** The wizard shows a NEW forest named migrate.lab.example.test.

**IF STUCK** A replica must not create a second forest with the same name. A destination forest must not accidentally join the source forest.

**EVIDENCE** Capture the wizard shows a NEW forest named migrate.lab.example.test. Record the target computer and date.

**SCREENSHOTS** ad-forest

### Step 27: Set controller options and DSRM

**WORKSPACE** DEST-DC01 · Windows Server desktop

**DO** For Server 2019 in this lab, use Windows Server 2016 for both forest and domain functional levels. Keep DNS server and Global Catalog selected. Set and confirm a unique DSRM recovery password, store it securely, then Next.

**EXPECT** Required options are selected and the password boxes have no validation error.

**IF STUCK** Windows Server 2019 has no Windows Server 2019 functional-level choice. Never copy the older functional levels or passwords from a reference image.

**EVIDENCE** Capture required options are selected and the password boxes have no validation error. Record the target computer and date.

**SCREENSHOTS** ad-dc-options

### Step 28: Review DNS and additional options

**WORKSPACE** DEST-DC01 · Windows Server desktop

**DO** Choose Add a new forest, not Add a new domain to an existing forest. This is a separate migrate.lab.example.test forest, not an AD child domain. Confirm the MIGRATE NetBIOS name on Additional Options. Record any DNS delegation warning; the next DNS lesson establishes explicit conditional forwarding between the namespaces.

**EXPECT** The wizard advances without a blocking validation error.

**IF STUCK** A yellow delegation warning for a private root is different from a red failed prerequisite. Stop for DNS, credential, or connectivity failures.

**EVIDENCE** Capture the wizard advances without a blocking validation error. Record the target computer and date.

### Step 29: Keep the default AD paths

**WORKSPACE** DEST-DC01 · Windows Server desktop

**DO** On Paths keep the default NTDS database/log and SYSVOL locations for this small lab, then Next.

**EXPECT** The wizard shows Review Options.

**IF STUCK** This is a practice lab layout, not a production storage design. Do not put AD data on a temporary disk.

**EVIDENCE** Capture the wizard shows Review Options. Record the target computer and date.

**SCREENSHOTS** ad-paths

### Step 30: Check prerequisites before promotion

**WORKSPACE** DEST-DC01 · Windows Server desktop

**DO** On Review Options confirm migrate.lab.example.test, the correct computer, and DNS. Click Next, then wait for Prerequisites Check.

**EXPECT** The prerequisite check succeeds; only understood lab warnings remain.

**IF STUCK** Read every red failure. Correct its stated cause and rerun the check before clicking Install.

**EVIDENCE** Capture the prerequisite check succeeds; only understood lab warnings remain. Record the target computer and date.

**SCREENSHOTS** ad-review, ad-prerequisites

### Step 31: Promote and wait for restart

**WORKSPACE** DEST-DC01 · Windows Server desktop

**DO** Click Install only after the prerequisite check passes. Wait for the VM to restart; do not power it off to shorten the wait.

**EXPECT** The guest restarts and offers a domain sign-in.

**IF STUCK** If promotion fails, keep the message and check Server Manager and Event Viewer > Windows Logs > Directory Service/System before retrying.

**EVIDENCE** Capture the guest restarts and offers a domain sign-in. Record the target computer and date.

### Step 32: Verify the directory

**WORKSPACE** DEST-DC01 · Windows PowerShell as administrator

**DO** Sign in with your authorized migrate.lab.example.test administrator account. Open Windows PowerShell as administrator in this VM and run the checks.

**EXPECT** The DNSRoot is migrate.lab.example.test and domain-controller records resolve to the lab’s private IPs.

**IF STUCK** If Get-ADDomain is unavailable, confirm you are on the promoted server with the AD management tools. If DNS fails, check the adapter’s DNS and the domain DNS zone.

**EVIDENCE** Capture the DNSRoot is migrate.lab.example.test and domain-controller records resolve to the lab’s private IPs. Record the target computer and date.

**COMMAND**
> hostname
> Get-ADDomain | Select-Object DNSRoot, NetBIOSName
> Resolve-DnsName -Type SRV _ldap._tcp.dc._msdcs.migrate.lab.example.test

LAB 09 / DNS + OPTIONAL TRUST

# Teach the forests to find each other

For a cross-forest lab, each DC must resolve the other forest. You can transfer GPO backups without a trust.

**[ ]** On DC01, open Server Manager > Tools > DNS. Expand DC01.

**[ ]** Right-click Conditional Forwarders > New Conditional Forwarder. DNS domain: migrate.lab.example.test. Master server IP: 10.50.0.40. Select OK.

**[ ]** On DEST-DC01, open DNS > Conditional Forwarders > New Conditional Forwarder. DNS domain: lab.example.test. Master server IP: 10.50.0.10.

**[ ]** On both DCs run nslookup with the other domain name and its explicit local DNS server.

**[ ]** For a trust exercise ONLY, after name resolution works: open Active Directory Domains and Trusts > right-click the root domain > Properties > Trusts > New Trust.

**[ ]** Enter the other forest name and review the wizard. For a local-only lab you may configure a two-way forest trust with controlled test credentials, then validate it in both directions. Skip this step if you only intend to import GPO backups and rejoin one server.

> nslookup -type=SRV \_ldap.\_tcp.dc.\_msdcs.migrate.lab.example.test 10.50.0.10
> nslookup -type=SRV \_ldap.\_tcp.dc.\_msdcs.lab.example.test 10.50.0.40

**PASS CHECK** Each query returns an SRV record for the opposite forest; trust is optional, not a prerequisite for the rest of the exercises.

WHY THIS MATTERS

Conditional forwarding is like telling one school secretary which phonebook to ask for the other school. A trust adds controlled authentication paths; it does not migrate directory objects.

IF IT DOES NOT WORK

If the SRV query times out, check the server IPs, DNS Server role, conditional forwarder entries, and TCP/UDP 53 on the private lab network. If trust fails, check supported AD ports and time skew.

**DNS query results / trust used?** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** DC01 and DEST-DC01 / DNS Manager / authorized administrator in each separate forest.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** Each query returns an SRV record for the opposite forest; trust is optional, not a prerequisite for the rest of the exercises.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Open DNS on DC01

**WORKSPACE** DC01 · DNS Manager

**DO** On DC01, open Server Manager > Tools > DNS. Expand DC01.

**EXPECT** DNS Manager is open on DC01.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: DNS Manager is open on DC01.

### Step 02: Add the destination DNS forwarder

**WORKSPACE** DC01 · DNS Manager

**DO** Right-click Conditional Forwarders > New Conditional Forwarder. DNS domain: migrate.lab.example.test. Master server IP: 10.50.0.40. Select OK.

**EXPECT** migrate.lab.example.test appears under Conditional Forwarders with 10.50.0.40.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: migrate.lab.example.test appears under Conditional Forwarders with 10.50.0.40.

### Step 03: Add the source DNS forwarder

**WORKSPACE** DEST-DC01 · DNS Manager

**DO** On DEST-DC01, open DNS > Conditional Forwarders > New Conditional Forwarder. DNS domain: lab.example.test. Master server IP: 10.50.0.10.

**EXPECT** lab.example.test appears under the destination server’s Conditional Forwarders with 10.50.0.10.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: lab.example.test appears under the destination server’s Conditional Forwarders with 10.50.0.10.

### Step 04: Test both domain lookups

**WORKSPACE** DC01 · Windows PowerShell as administrator

**DO** On both DCs run nslookup with the other domain name and its explicit local DNS server.

**EXPECT** Both private domain lookups return the intended domain-controller addresses.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Both private domain lookups return the intended domain-controller addresses.

### Step 05: Open the optional trust wizard

**WORKSPACE** DC01 · Windows Server desktop

**DO** For a trust exercise ONLY, after name resolution works: open Active Directory Domains and Trusts > right-click the root domain > Properties > Trusts > New Trust.

**EXPECT** The trust wizard is open; no trust is created just by opening it.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The trust wizard is open; no trust is created just by opening it.

### Step 06: Choose whether this exercise needs a trust

**WORKSPACE** DC01 · Group Policy Management

**DO** Enter the other forest name and review the wizard. For a local-only lab you may configure a two-way forest trust with controlled test credentials, then check it in both directions. Skip this step if you only intend to import GPO backups and rejoin one server.

**EXPECT** Your notes say whether a trust was created and tested or deliberately skipped.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your notes say whether a trust was created and tested or deliberately skipped.

### Step 07: Check the DNS service records

**WORKSPACE** DC01 · Windows PowerShell as administrator

**DO** Use the named shell and machine above. Read each command against the full lesson reference; run these lines only after completing the preceding actions.

**EXPECT** The recorded AD service queries return the correct private domain controllers.

**IF STUCK** Read the actual error. SQL statements belong in SSMS New Query, Windows commands in the named guest PowerShell, and Azure commands in the stated administration context.

**EVIDENCE** Save your own result showing: The recorded AD service queries return the correct private domain controllers.

**COMMAND**
> nslookup -type=SRV _ldap._tcp.dc._msdcs.migrate.lab.example.test 10.50.0.10
> nslookup -type=SRV _ldap._tcp.dc._msdcs.lab.example.test 10.50.0.40

LAB 10 / POLICY MIGRATION

# Export and import your test GPO

This lesson is the answer to “How do I move the agency’s Group Policies into a different domain?”

**[ ]** On DC01 open Group Policy Management. Expand lab.example.test > Group Policy Objects.

**[ ]** Right-click LAB-Operations-Banner > Back Up. Choose a folder like C:\GPOBackups. Give the backup a description.

**[ ]** Copy the completed GPO backup folder onto DEST-DC01 using an approved local lab method (for example, a temporary VMware shared folder). Keep all files within each backup folder.

**[ ]** On DEST-DC01 open Group Policy Management. Expand migrate.lab.example.test > Group Policy Objects.

**[ ]** Right-click Group Policy Objects > New. Create LAB-Operations-Banner-Dest.

**[ ]** Right-click that new GPO > Import Settings > Next. Back up the empty GPO if prompted, then browse to the transferred GPO backup folder.

**[ ]** Choose LAB-Operations-Banner. For our simple banner the wizard should not need domain-specific security principal mappings. Finish importing.

**[ ]** Right-click the Operations OU in migrate.lab.example.test > Link an Existing GPO > LAB-Operations-Banner-Dest.

**[ ]** Open the destination GPO and confirm the login title and message are present.

> Get-GPO -Name "LAB-Operations-Banner-Dest" -Domain migrate.lab.example.test

**PASS CHECK** The destination GPO exists, contains the test banner, and is linked to the destination Operations OU.

WHY THIS MATTERS

A GPO imported across forests brings the selected policy SETTINGS, but not its original OU links or security filtering. Real policies may need a migration table for old domain group names and UNC paths.

IF IT DOES NOT WORK

If Import Settings does not find the backup, verify you copied the backup folder including its manifest and GUID folder. Re-run Back Up and retry. Do not copy SYSVOL folders by hand.

**Backup location / destination GPO** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** DC01 and DEST-DC01 / Group Policy Management / authorized administrator in each forest.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** The destination GPO exists, contains the test banner, and is linked to the destination Operations OU.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Open the source policy console

**WORKSPACE** DC01 · Group Policy Management

**DO** On DC01 open Group Policy Management. Expand lab.example.test > Group Policy Objects.

**EXPECT** The source domain’s Group Policy Objects folder is visible.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The source domain’s Group Policy Objects folder is visible.

### Step 02: Back up the banner policy

**WORKSPACE** DC01 · Group Policy Management

**DO** Right-click LAB-Operations-Banner > Back Up. Choose a folder like C:\GPOBackups. Give the backup a description.

**EXPECT** The backup folder contains a completed backup of LAB-Operations-Banner.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The backup folder contains a completed backup of LAB-Operations-Banner.

### Step 03: Copy the whole policy backup

**WORKSPACE** DC01 · Group Policy Management

**DO** Copy the completed GPO backup folder onto DEST-DC01 using an approved local lab method (for example, a temporary VMware shared folder). Keep all files within each backup folder.

**EXPECT** The destination server has the complete backup folder.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The destination server has the complete backup folder.

### Step 04: Open the destination policy console

**WORKSPACE** DEST-DC01 · Group Policy Management

**DO** On DEST-DC01 open Group Policy Management. Expand migrate.lab.example.test > Group Policy Objects.

**EXPECT** The destination domain’s Group Policy Objects folder is visible.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The destination domain’s Group Policy Objects folder is visible.

### Step 05: Create an empty destination policy

**WORKSPACE** DC01 · Group Policy Management

**DO** Right-click Group Policy Objects > New. Create LAB-Operations-Banner-Dest.

**EXPECT** LAB-Operations-Banner-Dest exists as a new destination GPO.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: LAB-Operations-Banner-Dest exists as a new destination GPO.

### Step 06: Start Import Settings

**WORKSPACE** DC01 · Group Policy Management

**DO** Right-click that new GPO > Import Settings > Next. Back up the empty GPO if prompted, then browse to the transferred GPO backup folder.

**EXPECT** Import Settings points at your transferred backup folder.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Import Settings points at your transferred backup folder.

### Step 07: Select the banner backup

**WORKSPACE** DC01 · Windows Server desktop

**DO** Choose LAB-Operations-Banner. For our simple banner the wizard should not need domain-specific security principal mappings. Finish importing.

**EXPECT** The import finishes using the intended banner backup.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The import finishes using the intended banner backup.

### Step 08: Link the imported policy

**WORKSPACE** DC01 · Group Policy Management

**DO** Right-click the Operations OU in migrate.lab.example.test > Link an Existing GPO > LAB-Operations-Banner-Dest.

**EXPECT** Operations lists the destination banner policy as a linked GPO.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Operations lists the destination banner policy as a linked GPO.

### Step 09: Check the imported banner

**WORKSPACE** DC01 · Group Policy Management

**DO** Open the destination GPO and confirm the login title and message are present.

**EXPECT** The editor shows your practice title and message text.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The editor shows your practice title and message text.

### Step 10: Check the policy from PowerShell

**WORKSPACE** DC01 · Windows PowerShell as administrator

**DO** Use the named shell and machine above. Read each command against the full lesson reference; run these lines only after completing the preceding actions.

**EXPECT** The destination policy is present and linked; its name alone does not prove client application.

**IF STUCK** Read the actual error. SQL statements belong in SSMS New Query, Windows commands in the named guest PowerShell, and Azure commands in the stated administration context.

**EVIDENCE** Save your own result showing: The destination policy is present and linked; its name alone does not prove client application.

**COMMAND**
> Get-GPO -Name "LAB-Operations-Banner-Dest" -Domain migrate.lab.example.test

LAB 11 / CUTOVER DAY

# Move APP01 to the new domain

Now perform one controlled cross-domain server move. Keep the old domain running and prove that the application still works.

STOP HERE BEFORE CHANGING MEMBERSHIP

Take a powered-off VMware snapshot of APP01 (or an independent VM backup). Make a note of its old domain, IP, IIS page, account permissions, and how to sign in with the LOCAL Administrator after leaving lab.example.test.

**[ ]** On APP01, record the starting state using the commands below. Save results as a plain-text migration log.

**[ ]** Confirm the IIS webpage is still available at http://localhost.

**[ ]** Create/verify a local Administrator login on APP01 and test that you know its credentials. Keep a working VMware console session.

**[ ]** On APP01, open sysdm.cpl > Computer Name > Change > Workgroup. Enter LAB-TEMP. Supply agency admin credentials if asked; reboot.

**[ ]** Log in with APP01\Administrator (local). Change APP01 DNS from 10.50.0.10 to 10.50.0.40 in the IPv4 adapter settings. Keep its own IP as 10.50.0.30.

**[ ]** Run nslookup migrate.lab.example.test 10.50.0.40 and the destination AD SRV record check from Lesson 9.

**[ ]** Open sysdm.cpl > Computer Name > Change > Domain. Enter migrate.lab.example.test. Provide destination domain join credentials; reboot.

**[ ]** On DEST-DC01, find APP01 in Active Directory Users and Computers and move the computer account into migrate.lab.example.test > Operations.

**[ ]** On APP01, run gpupdate /force and gpresult /r /scope computer. Open the website again. Check the logon notice.

> hostname
> (Get-CimInstance Win32_ComputerSystem).Domain
> Get-Service W3SVC
> Test-NetConnection 10.50.0.40 -Port 53
> gpupdate /force
> gpresult /r /scope computer

**PASS CHECK** APP01 now belongs to migrate.lab.example.test; the website works; destination GPO is applied; old DCs remain intact.

WHY THIS MATTERS

We changed the COMPUTER identity and DNS first, then verified the application. Notice that reinstalling or copying the whole VM was not necessary to practice a domain rejoin. This does not automatically transfer user profiles or access control lists.

IF IT DOES NOT WORK

If the new join fails, use local Administrator, verify network route and DNS, check time sync, and review System logs. Do NOT delete the old agency forest to force a migration.

**Before-domain / after-domain / PASS?** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** APP01 guest / System Properties and PowerShell / known local Administrator plus authorized destination domain join credentials.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** APP01 now belongs to migrate.lab.example.test; the website works; destination GPO is applied; old DCs remain intact.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Record APP01 before the move

**WORKSPACE** APP01 · Windows Server desktop

**DO** On APP01, record the starting state using the commands below. Save results as a plain-text migration log.

**EXPECT** Your log records APP01’s current name, domain, network and application check.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your log records APP01’s current name, domain, network and application check.

### Step 02: Check the local test website

**WORKSPACE** APP01 · Windows Server desktop

**DO** Confirm the IIS webpage is still available at http://localhost.

**EXPECT** The test page opens inside APP01 before the move.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The test page opens inside APP01 before the move.

### Step 03: Test your local recovery sign-in

**WORKSPACE** APP01 · Windows Server desktop

**DO** Create/verify a local Administrator login on APP01 and test that you know its credentials. Keep a working VMware console session.

**EXPECT** You can sign in with the local APP01 administrator through VMware.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: You can sign in with the local APP01 administrator through VMware.

### Step 04: Leave the old domain

**WORKSPACE** APP01 · Windows System Properties

**DO** On APP01, open sysdm.cpl > Computer Name > Change > Workgroup. Enter LAB-TEMP. Supply agency admin credentials if asked; reboot.

**EXPECT** After restart, APP01 is in LAB-TEMP and your local login works.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: After restart, APP01 is in LAB-TEMP and your local login works.

### Step 05: Set the destination DNS server

**WORKSPACE** APP01 · Windows Network Connections

**DO** Log in with APP01\Administrator (local). Change APP01 DNS from 10.50.0.10 to 10.50.0.40 in the IPv4 adapter settings. Keep its own IP as 10.50.0.30.

**EXPECT** APP01 keeps its own address and now uses 10.50.0.40 for DNS.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: APP01 keeps its own address and now uses 10.50.0.40 for DNS.

### Step 06: Test the destination name lookup

**WORKSPACE** APP01 · Windows PowerShell as administrator

**DO** Run nslookup migrate.lab.example.test 10.50.0.40 and the destination AD SRV record check from Lesson 9.

**EXPECT** The new domain and its service records resolve through the destination DNS server.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The new domain and its service records resolve through the destination DNS server.

### Step 07: Join the destination domain

**WORKSPACE** APP01 · Windows System Properties

**DO** Open sysdm.cpl > Computer Name > Change > Domain. Enter migrate.lab.example.test. Provide destination domain join credentials; reboot.

**EXPECT** After restart, Windows reports the destination domain.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: After restart, Windows reports the destination domain.

### Step 08: Put APP01 in the right OU

**WORKSPACE** DEST-DC01 · Windows Server desktop

**DO** On DEST-DC01, find APP01 in Active Directory Users and Computers and move the computer account into migrate.lab.example.test > Operations.

**EXPECT** The APP01 computer account is inside the destination Operations OU.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The APP01 computer account is inside the destination Operations OU.

### Step 09: Apply and check the new policy

**WORKSPACE** APP01 · Windows PowerShell as administrator

**DO** On APP01, run gpupdate /force and gpresult /r /scope computer. Open the website again. Check the logon notice.

**EXPECT** The destination policy appears in gpresult and the test website still opens.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The destination policy appears in gpresult and the test website still opens.

### Step 10: Confirm the final computer and domain

**WORKSPACE** APP01 · Windows PowerShell as administrator

**DO** Use the named shell and machine above. Read each command against the full lesson reference; run these lines only after completing the preceding actions.

**EXPECT** Your saved checks show the intended final computer, domain and application result.

**IF STUCK** Read the actual error. SQL statements belong in SSMS New Query, Windows commands in the named guest PowerShell, and Azure commands in the stated administration context.

**EVIDENCE** Save your own result showing: Your saved checks show the intended final computer, domain and application result.

**COMMAND**
> hostname
> (Get-CimInstance Win32_ComputerSystem).Domain
> Get-Service W3SVC
> Test-NetConnection 10.50.0.40 -Port 53
> gpupdate /force
> gpresult /r /scope computer

LAB 12 / RECOVERY

# Test rollback and record the result

A real migration engineer needs a recovery path, not only a success screenshot.

**[ ]** Capture evidence: hostname, new domain, IP configuration, applied GPO name, and successful local IIS page.

**[ ]** Stop and imagine the destination app failed. State the rollback trigger: for example, DNS/domain join failure, app 500 error, or a broken service account.

**[ ]** If you need rollback, power off APP01 and revert to its PRE-CUTOVER snapshot. Do not roll back domain controllers as your recovery technique.

**[ ]** Power on APP01. Confirm the old agency domain, DNS, GPO, and website are back as expected.

**[ ]** If you are continuing to the Azure extension, keep the rollback APP01 snapshot so you can practice a second migration from lab.example.test later.

**[ ]** Write a change ticket note stating what you changed, what worked, what failed, and whether you rolled back.

> (Get-CimInstance Win32_ComputerSystem).Domain
> ipconfig /all
> gpresult /r /scope computer
> Get-Service W3SVC

**PASS CHECK** You can show both a valid cutover checklist and an actual rollback verification.

WHY THIS MATTERS

Snapshots of an isolated test MEMBER server are practical for this exercise. Rolling back a domain controller snapshot is not the same thing and can introduce serious directory consistency issues; use supported AD backup/recovery methods.

**Rollback trigger** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Last known-good snapshot name** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Outcome / fix / what you learned** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** APP01 member server and the two local domain environments / authorized lab administrators.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** You can show both a valid cutover checklist and an actual rollback verification.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Save the post-move checks

**WORKSPACE** APP01 · Group Policy Management

**DO** Capture saved result: hostname, new domain, IP configuration, applied GPO name, and successful local IIS page.

**EXPECT** You have real results from the new domain and the local website.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: You have real results from the new domain and the local website.

### Step 02: Choose when to roll back

**WORKSPACE** APP01 · Windows Server desktop

**DO** Stop and imagine the destination app failed. State the rollback trigger: for example, DNS/domain join failure, app 500 error, or a broken service account.

**EXPECT** Your notes name a failure that would justify recovery.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your notes name a failure that would justify recovery.

### Step 03: Restore only the practice member VM

**WORKSPACE** APP01 · Windows Server desktop

**DO** If you need rollback, power off APP01 and revert to its PRE-CUTOVER snapshot. Do not roll back domain controllers as your recovery technique.

**EXPECT** Only APP01 is restored to the recorded practice recovery point.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Only APP01 is restored to the recorded practice recovery point.

### Step 04: Check the restored website and domain

**WORKSPACE** APP01 · Group Policy Management

**DO** Power on APP01. Confirm the old agency domain, DNS, GPO, and website are back as expected.

**EXPECT** The original domain, DNS and test website work after recovery; check the secure channel too.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The original domain, DNS and test website work after recovery; check the secure channel too.

### Step 05: Keep the recovery point for the next exercise

**WORKSPACE** APP01 · Windows Server desktop

**DO** If you are continuing to the Azure extension, keep the rollback APP01 snapshot so you can practice a second migration from lab.example.test later.

**EXPECT** Your notes identify the retained member-server recovery point.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your notes identify the retained member-server recovery point.

### Step 06: Write a short handover note

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Write a change ticket note stating what you changed, what worked, what failed, and whether you rolled back.

**EXPECT** The note says what changed, what failed, what was restored and which checks passed.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The note says what changed, what failed, what was restored and which checks passed.

### Step 07: Check the restored computer state

**WORKSPACE** APP01 · Windows PowerShell as administrator

**DO** Use the named shell and machine above. Read each command against the full lesson reference; run these lines only after completing the preceding actions.

**EXPECT** The restored computer’s actual state matches your recovery notes.

**IF STUCK** Read the actual error. SQL statements belong in SSMS New Query, Windows commands in the named guest PowerShell, and Azure commands in the stated administration context.

**EVIDENCE** Save your own result showing: The restored computer’s actual state matches your recovery notes.

**COMMAND**
> (Get-CimInstance Win32_ComputerSystem).Domain
> ipconfig /all
> gpresult /r /scope computer
> Get-Service W3SVC

LAB 13 / PATCHING

# Optional: build a WSUS server

WSUS is a separate server role. Treat it as an application dependency, not as something that must automatically move into the cloud.

**[ ]** Create WSUS01 (Windows Server) on the lab.example.test lab network; set IP 10.50.0.50 and DNS 10.50.0.10.

**[ ]** Join WSUS01 to lab.example.test and restart.

**[ ]** In Server Manager > Manage > Add Roles and Features, select Windows Server Update Services. Review prerequisites and choose a local content directory on a volume with generous free space.

**[ ]** Install the role and complete the post-installation tasks. Open the WSUS console.

**[ ]** Do NOT immediately synchronize every product and classification. First review upstream update source, proxy/internet requirements, storage, and cleanup.

**[ ]** Create a worksheet entry identifying which clients use WSUS and what GPO setting configures the intranet update service.

**[ ]** For the “migration plan,” decide whether to preserve WSUS, rebuild it, or use an approved destination patching service.

**PASS CHECK** You can explain the WSUS role, its data/content requirements, client targeting, and why it is not automatically migrated with an AD trust.

WHY THIS MATTERS

Enterprise cloud teams often standardize patching at the destination. You should discover policy, approval, download, bandwidth, and compliance dependencies BEFORE choosing a tool.

IF IT DOES NOT WORK

WSUS can consume a lot of disk and download bandwidth. Skip synchronization in a resource-limited home lab; the architecture lesson still counts.

**WSUS update source / disk plan** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

NEW / ROUTE MAP / HOW ALL THE PARTS FIT

# See the whole migration before touching a server

Picture five school buildings. AD is the student directory; WSUS is the update library; SQL is the filing cabinet; MECM is the school office that tracks computers. They depend on each other.

| **Build order** | **Machine**       | **Suggested lab IP** | **Its job**                                                      |
|-----------------|-------------------|----------------------|------------------------------------------------------------------|
| 1               | DC01 / DC02 | 10.50.0.10 / .11  | AD domain lab.example.test; DNS, accounts, GPO                        |
| 2               | WSUS01            | 10.50.0.50        | Windows update service; later add MECM software update point     |
| 3               | SQL01             | 10.50.0.60        | SQL Server database engine; MECM database + separate PracticeDB  |
| 4               | MECM01            | 10.50.0.70        | Configuration Manager site server, management/distribution roles |
| 5               | APP01             | 10.50.0.30        | IIS member server and client to test migration                   |
| 6               | DEST-DC01         | 10.50.0.40        | Separate migrate.lab.example.test forest for identity migration practice |
| 7               | AZ-SQL01 (later)  | 10.90.x.x            | Azure SQL Server VM; practice .bak restore                       |

Only turn on what you need. For MECM to run: DC01 + SQL01 + MECM01 must be on; add WSUS01 for update lessons. A second DC adds redundancy, not a new forest.

MECM and SQL Server can technically share a server for a lab, but we deliberately separate them so you learn dependency mapping. This requires more RAM and is NOT a tiny laptop lab.

**PASS CHECK** You can draw this dependency arrow: MECM01 -> SQL01 (site database), MECM01 -> AD/DNS, MECM software update point -> WSUS01.

## Guided walkthrough

**WHERE** WSUS01 Server 2019 guest / Server Manager / local administrator; optional extension.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** You can explain the WSUS role, its data/content requirements, client targeting, and why it is not automatically migrated with an AD trust.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Prepare WSUS01

**WORKSPACE** WSUS01 · Windows Server desktop

**DO** Create WSUS01 (Windows Server) on the lab.example.test lab network; set IP 10.50.0.50 and DNS 10.50.0.10.

**EXPECT** WSUS01 is a new practice Windows server at 10.50.0.50, using 10.50.0.10 for DNS.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: WSUS01 is a new practice Windows server at 10.50.0.50, using 10.50.0.10 for DNS.

### Step 02: Join WSUS01

**WORKSPACE** WSUS01 · Windows Server desktop

**DO** Join WSUS01 to lab.example.test and restart.

**EXPECT** After restart, Windows reports your practice domain and the domain login works.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: After restart, Windows reports your practice domain and the domain login works.

### Step 03: Choose the WSUS features

**WORKSPACE** WSUS01 · Server Manager

**DO** In Server Manager > Manage > Add Roles and Features, select Windows Server Update Services. Review the required features and choose a local content directory on a volume with generous free space.

**EXPECT** The role wizard shows Windows Server Update Services and the content folder you chose.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The role wizard shows Windows Server Update Services and the content folder you chose.

### Step 04: Finish WSUS setup

**WORKSPACE** WSUS01 · Windows Server desktop

**DO** Install the role and complete the post-installation tasks. Open the WSUS console.

**EXPECT** Post-installation completes and the WSUS console opens without a setup error.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Post-installation completes and the WSUS console opens without a setup error.

### Step 05: Limit what WSUS downloads

**WORKSPACE** WSUS01 · Windows Server desktop

**DO** Do NOT immediately synchronize every product and classification. First review upstream update source, proxy/internet requirements, storage, and cleanup.

**EXPECT** Your notes list the source, connection and small product/language scope; a full catalog has not been downloaded.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your notes list the source, connection and small product/language scope; a full catalog has not been downloaded.

### Step 06: Record the pilot update policy

**WORKSPACE** WSUS01 · Group Policy Management

**DO** Create a worksheet entry identifying which clients use WSUS and what GPO setting configures the intranet update service.

**EXPECT** Your notes name the pilot client and the GPO setting that directs it to your WSUS address.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your notes name the pilot client and the GPO setting that directs it to your WSUS address.

### Step 07: Choose the future update service

**WORKSPACE** WSUS01 · Windows Server desktop

**DO** For the “migration plan,” decide whether to preserve WSUS, rebuild it, or use an approved destination patching service.

**EXPECT** The plan says keep, rebuild or replace WSUS, with a reason and a pilot test before retiring the old service.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The plan says keep, rebuild or replace WSUS, with a reason and a pilot test before retiring the old service.

SQL-01 / DOWNLOADS + SIZING

# Choose the right SQL and MECM installers

We are building TWO kinds of databases: a practice database we own, and a special Configuration Manager site database that MECM owns.

[ ] Find your Windows Server evaluation installer from Microsoft Evaluation Center; reuse your Windows Server ISO in VMware.

[ ] Download SQL Server 2022 Evaluation (a full Database Engine edition), or another currently supported full SQL edition allowed by the evaluation terms.

[ ] SQL Server 2025 can work with Configuration Manager version 2603 or later. Choose SQL Server 2022 for a straightforward compatible beginner lab; record both exact versions.

[ ] Download SQL Server Management Studio (SSMS) separately. Think: SQL Server is the engine; SSMS is the remote control.

[ ] Download Microsoft Configuration Manager current-branch evaluation from Microsoft Evaluation Center and record its build/version. Verify the current evaluation conditions in the download terms.

[ ] Read the Configuration Manager Windows ADK compatibility page before downloading ADK/WinPE add-on; do NOT automatically choose the newest ADK.

[ ] Estimate memory: DC01 4 GB, DC02 4 GB, WSUS01 4+ GB, SQL01 12-16 GB, MECM01 12-16 GB; host also needs RAM. 48-64 GB host RAM is a practical target for concurrent use.

[ ] Choose thin-provisioned VM disks but keep ample actual storage space for SQL data and MECM content. Avoid synchronizing full WSUS catalogs during first exercise.

**PASS CHECK** You have installer filenames, SQL version, MECM version, host RAM, and a storage plan written down.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** Physical Windows host / Microsoft download pages and the SQL/MECM compatibility matrix.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** You have installer filenames, SQL version, MECM version, host RAM, and a storage plan written down.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Find the Windows ISO

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Find your Windows Server evaluation installer from Microsoft Evaluation Center; reuse your Windows Server ISO in VMware.

**EXPECT** Your installer folder contains the Windows Server 2019 ISO used in the local build.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your installer folder contains the Windows Server 2019 ISO used in the local build.

### Step 02: Download the SQL engine

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Download SQL Server 2022 Evaluation (a full Database Engine edition), or another currently supported full SQL edition allowed by the evaluation terms.

**EXPECT** Your installer folder contains the selected SQL Server Database Engine installer and its version record.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your installer folder contains the selected SQL Server Database Engine installer and its version record.

### Step 03: Check version compatibility

**WORKSPACE** Your Windows host · lab notes and browser

**DO** SQL Server 2025 can work with Configuration Manager version 2603 or later. Choose SQL Server 2022 for a straightforward compatible beginner lab; record both exact versions.

**EXPECT** Your notes pair the selected SQL and MECM builds with a supported combination; no unsupported newer SQL was assumed.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your notes pair the selected SQL and MECM builds with a supported combination; no unsupported newer SQL was assumed.

### Step 04: Download SSMS

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Download SQL Server Management Studio (SSMS) separately. Think: SQL Server is the engine; SSMS is the remote control.

**EXPECT** You have the separate SQL Server Management Studio installer. SSMS alone is not a running database engine.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: You have the separate SQL Server Management Studio installer. SSMS alone is not a running database engine.

### Step 05: Download the MECM evaluation

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Download Microsoft Configuration Manager current-branch evaluation from Microsoft Evaluation Center and record its build/version. Verify the current evaluation conditions in the download terms.

**EXPECT** You have the official Configuration Manager evaluation source and have recorded its build and terms.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: You have the official Configuration Manager evaluation source and have recorded its build and terms.

### Step 06: Choose supported ADK tools

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Read the Configuration Manager Windows ADK compatibility page before downloading ADK/WinPE add-on; do NOT automatically choose the newest ADK.

**EXPECT** Your notes name an ADK and WinPE pair supported by the selected MECM version, if using OS deployment.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your notes name an ADK and WinPE pair supported by the selected MECM version, if using OS deployment.

### Step 07: Plan the active VMs

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Estimate memory: DC01 4 GB, DC02 4 GB, WSUS01 4+ GB, SQL01 12-16 GB, MECM01 12-16 GB; host also needs RAM. 48-64 GB host RAM is a practical target for concurrent use.

**EXPECT** Your memory budget fits the VMs needed now and leaves memory for the host. Tiny SQL-only sizing is not reused for MECM.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your memory budget fits the VMs needed now and leaves memory for the host. Tiny SQL-only sizing is not reused for MECM.

### Step 08: Check real storage space

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Choose thin-provisioned VM disks but keep ample actual storage space for SQL data and MECM content. Avoid synchronizing full WSUS catalogs during first exercise.

**EXPECT** New disks are growable, and the host has space for their growth, backups, updates and content.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: New disks are growable, and the host has space for their growth, backups, updates and content.

SQL-02 / NEW WINDOWS VM

# Create SQL01 and join lab.example.test

We must build the computer first. It is not SQL until SQL Server software is installed.

[ ] In VMware: File > New Virtual Machine > Typical > pick Windows Server ISO > Desktop Experience.

[ ] Give this VM name SQL01, 2-4 vCPUs, lab-sized RAM (begin around 12 GB if you can), and a disk sized for Windows plus SQL data/backups.

[ ] Attach the same isolated VMware VMnet network used by DC01. NEVER bridge into a work or classified network.

[ ] After Windows installation, rename it SQL01 and reboot. Set fixed IP 10.50.0.60/24, correct no default gateway, DNS 10.50.0.10.

[ ] On SQL01 run nslookup lab.example.test and ping DC01 by name; ICMP may be blocked, so DNS is the important first check.

[ ] Windows > Settings > System > About > Rename this PC (advanced) > Change > Domain: lab.example.test. Enter lab domain join credentials; restart.

> hostname
> (Get-CimInstance Win32_ComputerSystem).Domain
> ipconfig /all
> Resolve-DnsName DC01.lab.example.test

**PASS CHECK** SQL01 is a MEMBER of lab.example.test and resolves DC01 correctly. It is NOT a DC.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** Physical host Workstation Pro, then SQL01 Server 2019 member guest / local Administrator and authorized domain join account.

**BEFORE** LAB 02 must confirm Windows Server 2019 Desktop Experience media and host resources; LAB 03 must record the actual VMnet2 host-only subnet and blank default gateway and unused static addresses. Replica/member builds also require working DC01 DNS. Example addresses apply only to the different, non-overlapping 10.50.0.0/24 lab plan.

**PASS** SQL01 is a MEMBER of lab.example.test and resolves DC01 correctly. It is NOT a DC.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Open the new VM wizard

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** On your physical Windows PC, open VMware Workstation Pro. Click File, then New Virtual Machine. Do not do this inside another VM.

**EXPECT** The New Virtual Machine Wizard is open.

**IF STUCK** If VMware is absent, finish LAB 02. Help > About identifies your installed version.

**EVIDENCE** Capture the New Virtual Machine Wizard is open. Record the target computer and date.

**SCREENSHOTS** workstation-1

### Step 02: Choose Typical

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select Typical (recommended), then Next. The reference image has Custom selected; use the upper Typical radio button for this lab.

**EXPECT** The wizard asks how the guest operating system will be installed.

**IF STUCK** If you chose Custom, cancel and restart; do not change random advanced disk options.

**EVIDENCE** Capture the wizard asks how the guest operating system will be installed. Record the target computer and date.

**SCREENSHOTS** workstation-2

### Step 03: Use manual Windows installation

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select I will install the operating system later, then Next. This avoids Easy Install silently choosing an edition.

**EXPECT** The wizard lets you choose a guest OS profile.

**IF STUCK** Do not select the example Windows 7 ISO visible in the reference. We attach your Server 2019 ISO later.

**EVIDENCE** Capture the wizard lets you choose a guest OS profile. Record the target computer and date.

**SCREENSHOTS** workstation-4

### Step 04: Choose the Server 2019 guest profile

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select Microsoft Windows. Open Version and choose Windows Server 2019, then Next.

**EXPECT** The guest profile says Windows Server 2019.

**IF STUCK** VERSION CHECK REQUIRED: if your Workstation version does not list Server 2019, stop and check Broadcom compatibility/update guidance; the profile is not the ISO and selecting a newer OS does not install it.

**EVIDENCE** Capture the guest profile says Windows Server 2019. Record the target computer and date.

### Step 05: Name the VM

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Enter SQL01 as the virtual machine name. Browse to a folder with enough free space, such as your dedicated SONIC lab folder, then Next.

**EXPECT** The summary uses SQL01 and a location you can find again.

**IF STUCK** The VMware name and the Windows computer name are different settings; we will rename Windows after installation.

**EVIDENCE** Capture the summary uses SQL01 and a location you can find again. Record the target computer and date.

**SCREENSHOTS** workstation-6

### Step 06: Create a new virtual disk

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Set Maximum disk size to 120 GB for this lab plan. Choose Split virtual disk into multiple files, then Next. If Allocate all disk space now is offered, leave it unchecked so the disk can grow as needed. Splitting files alone does not make a disk growable. Do not attach an existing disk.

**EXPECT** A new blank virtual disk is selected.

**IF STUCK** This is a lab sizing example, not a product minimum. Stop if the host lacks free space for your planned VMs.

**EVIDENCE** Capture a new blank virtual disk is selected. Record the target computer and date.

**SCREENSHOTS** workstation-14

### Step 07: Set memory and CPU

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Click Customize Hardware. For the standalone tiny SQL exercises, select Memory and enter 4096 MB. Select Processors: 1 processor, 2 cores. If this SQL01 will also serve MECM, use the separate MECM allocation first: 12288–16384 MB or the selected version’s documented requirement, whichever is greater. Do not continue into MECM on the tiny SQL allocation.

**EXPECT** The hardware summary matches your chosen SQL-only or MECM database plan, with two total virtual cores.

**IF STUCK** Leave RAM for the physical host. SQL/MECM need more resources than a domain controller; do not start all optional VMs together on a small PC.

**EVIDENCE** Save your selected workload and the SQL01 hardware summary.

**SCREENSHOTS** workstation-9, workstation-8

### Step 08: Attach the Server 2019 ISO

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select CD/DVD in the hardware list. Choose Use ISO image file, Browse to your Windows Server 2019 ISO, and enable Connect at power on.

**EXPECT** The CD/DVD path ends with your Server 2019 ISO filename.

**IF STUCK** If a different ISO is listed, replace it now; the guest OS profile alone does not select installation media.

**EVIDENCE** Capture the CD/DVD path ends with your Server 2019 ISO filename. Record the target computer and date.

### Step 09: Attach the private VMnet

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Select Network Adapter. Choose Custom: Specific virtual network and VMnet2 (Host-only) from LAB 03. Enable Connected and Connect at power on.

**EXPECT** The VM is attached to the same private lab VMnet as the other lab servers.

**IF STUCK** Do not choose Bridged. If your custom VMnet is missing, return to Virtual Network Editor and verify its name before continuing.

**EVIDENCE** Capture the VM is attached to the same private lab VMnet as the other lab servers. Record the target computer and date.

### Step 10: Finish and start the VM

**WORKSPACE** Your Windows host · VMware Workstation Pro

**DO** Click Close, then Finish. Select the new VM in the Workstation library and click Power on this virtual machine. Click inside its console and press a key when the ISO boot prompt appears.

**EXPECT** Windows Setup appears inside the VM console.

**IF STUCK** If it boots to a network screen or no OS found, power off, check CD/DVD ISO and Connect at power on, then retry. Ctrl+Alt releases your mouse from the console.

**EVIDENCE** Capture windows Setup appears inside the VM console. Record the target computer and date.

**SCREENSHOTS** workstation-15

### Step 11: Start Windows Setup

**WORKSPACE** SQL01 · Windows Setup installer

**DO** Choose the language you need for the course, time format, and keyboard, then Next and Install now. Use English (United States) media if you will follow the Azure upgrade-media route later.

**EXPECT** Setup displays an edition list or asks for a legitimate product key.

**IF STUCK** A key prompt depends on your media. Use your authorized course media and license; never enter a sample or shared key.

**EVIDENCE** Capture setup displays an edition list or asks for a legitimate product key. Record the target computer and date.

### Step 12: Choose Desktop Experience

**WORKSPACE** SQL01 · Windows Setup installer

**DO** Select Windows Server 2019 Standard (Desktop Experience), or the matching authorized Datacenter (Desktop Experience) edition your course supplies. If using Evaluation for local practice, record that limitation. Click Next and accept the license only if you agree.

**EXPECT** The selected line explicitly includes 2019 and Desktop Experience.

**IF STUCK** If you omit Desktop Experience you get Server Core. This course does not teach switching Core to Desktop Experience; rebuild this new empty lab VM with the correct option.

**EVIDENCE** Capture the selected line explicitly includes 2019 and Desktop Experience. Record the target computer and date.

### Step 13: Install only on the new blank disk

**WORKSPACE** SQL01 · Windows Setup installer

**DO** Choose Custom: Install Windows only (advanced). Select the new VM’s blank Drive 0 unallocated space and click Next. This is a clean install in a new VM, not the later Azure in-place upgrade.

**EXPECT** Windows copies files, installs, and restarts.

**IF STUCK** Stop if the disk contains existing partitions or data you did not expect. Never delete an unfamiliar disk to make the instructions fit.

**EVIDENCE** Capture windows copies files, installs, and restarts. Record the target computer and date.

### Step 14: Create the local Administrator password

**WORKSPACE** SQL01 · Windows Setup installer

**DO** At Customize settings, set and confirm a strong local Administrator password. Save it in your own password manager, then Finish.

**EXPECT** The Windows sign-in screen appears.

**IF STUCK** Do not put passwords in the course saved result worksheet or screenshots.

**EVIDENCE** Capture the Windows sign-in screen appears. Record the target computer and date.

### Step 15: Sign into the guest

**WORKSPACE** SQL01 · Windows Server desktop

**DO** Use Workstation VM > Send Ctrl+Alt+Del (or Ctrl+Alt+Insert), then sign in as the guest’s local Administrator.

**EXPECT** You see a Windows desktop and Server Manager.

**IF STUCK** If only a command window appears, you installed Server Core; return to the edition-selection step for this new lab VM.

**EVIDENCE** Capture you see a Windows desktop and Server Manager. Record the target computer and date.

### Step 16: Install VMware Tools

**WORKSPACE** Your Windows host · VMware Workstation Pro; then the named Windows guest

**DO** In Workstation select VM > Install VMware Tools. In the guest open File Explorer > This PC, open the VMware Tools CD, and run setup64.exe if offered. Choose the normal setup and restart when asked.

**EXPECT** After restart, the guest is usable with the expected mouse/display integration.

**IF STUCK** The menu may say Reinstall VMware Tools. VERSION CHECK REQUIRED: if the bundled Tools ISO is unavailable, use Broadcom’s supported Tools download for your Workstation and guest version.

**EVIDENCE** Capture after restart, the guest is usable with the expected mouse/display integration. Record the target computer and date.

### Step 17: Patch the new Server 2019 guest

**WORKSPACE** Your Windows host · VMware Workstation Pro; then the named Windows guest

**DO** This new guest is not domain-joined yet. Shut it down. In VMware choose VM > Settings > Network Adapter > NAT, keeping one adapter. Start Windows and set Ethernet IPv4 and DNS to Obtain automatically for this temporary update session. Open Start > Settings > Update & Security > Windows Update, check for updates and restart as required. Activate the evaluation while internet access is available. Shut down again, change the same adapter to Custom > VMnet2, and start the guest. The next network steps restore its planned static address and blank gateway before any domain work.

**EXPECT** Windows has completed its pending restarts.

**IF STUCK** VMnet2 has no internet route. Before AD promotion/domain join, power off this fresh guest, temporarily change its single adapter to NAT, obtain automatic IPv4/DNS, apply updates/activate, shut down, return the adapter to Custom VMnet2, and restore its planned static IPv4/DNS with a blank gateway. Keep one adapter only. Never bridge the guest or add an internet adapter to a domain controller.

**EVIDENCE** Capture windows has completed its pending restarts. Record the target computer and date.

### Step 18: Rename Windows

**WORKSPACE** SQL01 · Windows System Properties

**DO** Inside the guest press Win+R, enter sysdm.cpl, and press Enter. On Computer Name choose Change. Enter SQL01, confirm OK, and restart when prompted.

**EXPECT** After signing in again, hostname returns SQL01.

**IF STUCK** Renaming the entry in the Workstation library does not rename Windows.

**EVIDENCE** Capture after signing in again, hostname returns SQL01. Record the target computer and date.

**COMMAND**
> hostname

### Step 19: Open the guest IPv4 settings

**WORKSPACE** SQL01 · Windows Network Connections

**DO** Inside the guest press Win+R, type ncpa.cpl, and press Enter. Right-click the connected Ethernet adapter > Properties. Select Internet Protocol Version 4 (TCP/IPv4), then Properties.

**EXPECT** The IPv4 address and DNS fields are visible.

**IF STUCK** This is the on-prem VM adapter. Azure VM address configuration is different and is set on the Azure NIC.

**EVIDENCE** Capture the IPv4 address and DNS fields are visible. Record the target computer and date.

### Step 20: Enter the lab address

**WORKSPACE** SQL01 · Windows Server desktop

**DO** For the example LAB 03 network only, choose Use the following IP address: 10.50.0.60; subnet mask 255.255.255.0; leave Default gateway blank (VMnet2 is host-only). Set preferred DNS to 10.50.0.10. Click OK and Close. If you changed the subnet in LAB 03, use your matching address plan instead.

**EXPECT** ipconfig /all shows the planned 10.50.0.x address, blank default gateway, and the lab DNS address on VMnet2.

**IF STUCK** Do not enter a gateway on isolated VMnet2 or use a public DNS server as an AD client’s DNS. If an address conflict appears, stop and allocate an unused lab address.

**EVIDENCE** Capture ipconfig /all shows the planned 10.50.0.x address, blank default gateway, and the lab DNS address on VMnet2. Record the target computer and date.

**COMMAND**
> ipconfig /all

### Step 21: Confirm this is Server 2019

**WORKSPACE** SQL01 · Windows PowerShell as administrator

**DO** Open Start, search Windows PowerShell, right-click it > Run as administrator. Run the read-only inventory below in this VM.

**EXPECT** WindowsProductName identifies Windows Server 2019; hostname identifies SQL01.

**IF STUCK** If the version is 2022 or 2025, you have not built the requested source baseline. Do not present that as a 2019-to-2022 upgrade.

**EVIDENCE** Capture windowsProductName identifies Windows Server 2019; hostname identifies SQL01. Record the target computer and date.

**COMMAND**
> hostname
> Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, OsBuildNumber
> DISM /online /Get-CurrentEdition

### Step 22: Check domain DNS before joining

**WORKSPACE** SQL01 · Windows PowerShell as administrator

**DO** In SQL01, open Windows PowerShell and run the checks below. Preferred DNS must be a reachable DC for lab.example.test.

**EXPECT** The domain resolves and the DC’s LDAP SRV records are returned.

**IF STUCK** Do not continue on a failed DNS lookup. Verify both VMs use the same VMnet, source DC is running, and the adapter points at lab AD DNS.

**EVIDENCE** Capture the domain resolves and the DC’s LDAP SRV records are returned. Record the target computer and date.

**COMMAND**
> Resolve-DnsName lab.example.test
> Resolve-DnsName -Type SRV _ldap._tcp.dc._msdcs.lab.example.test

### Step 23: Join the domain

**WORKSPACE** SQL01 · Windows System Properties

**DO** Inside SQL01 press Win+R > sysdm.cpl. On Computer Name select Change. Select Domain, enter lab.example.test, click OK, and supply your authorized lab join credentials.

**EXPECT** Windows welcomes the computer to lab.example.test and requests a restart.

**IF STUCK** Check DNS and time before changing passwords or disabling a firewall. Do not use your personal Microsoft account as AD credentials.

**EVIDENCE** Capture windows welcomes the computer to lab.example.test and requests a restart. Record the target computer and date.

### Step 24: Restart and verify membership

**WORKSPACE** SQL01 · Windows PowerShell as administrator

**DO** Restart SQL01. Sign in using Other user and an authorized account in lab.example.test. Run the checks below in Windows PowerShell.

**EXPECT** The reported domain is lab.example.test and the secure-channel test returns True.

**IF STUCK** If trust fails, record the error and check DNS/time and the computer account. Do not delete/rejoin a production computer as an experiment.

**EVIDENCE** Capture the reported domain is lab.example.test and the secure-channel test returns True. Record the target computer and date.

**COMMAND**
> hostname
> (Get-CimInstance Win32_ComputerSystem).Domain
> Test-ComputerSecureChannel -Verbose

SQL-03 / SET UP SQL ENGINE

# Install SQL Server correctly on SQL01

SQL Server is the filing cabinet. We will configure its lock, doors and labels before any application uses it.

[ ] Sign into SQL01 with your authorized lab domain admin/setup account and launch SQL Server Setup as administrator.

[ ] Select Installation > New SQL Server stand-alone installation. Choose your Evaluation licensing option; accept terms.

[ ] Feature Selection: enable Database Engine Services. Keep features minimal; SQL Reporting Services is optional and separate.

[ ] Instance Configuration: select Default instance (MSSQLSERVER); write that choice down. A named instance is fine but needs extra connection details.

[ ] Database Engine Configuration > Server Configuration > Collation: specify SQL_Latin1_General_CP1_CI_AS. This matters for MECM.

[ ] Authentication: Windows Authentication mode; click Add Current User for a setup administrator. Do not use a weak SQL sa password.

[ ] Configure service accounts per current Microsoft guidance. Configure SQL memory after install so it cannot starve Windows; MECM primary site DB requires enough memory.

[ ] Finish setup; use SQL Server Configuration Manager > SQL Server Network Configuration > Protocols for MSSQLSERVER > TCP/IP > Enabled.

[ ] For the simple lab, choose a fixed TCP port 1433 under TCP/IP IPAll, clear dynamic port, restart SQL Server (MSSQLSERVER). Document before changing anything.

[ ] On SQL01, use Windows Defender Firewall with Advanced Security > Inbound Rules > New Rule > Port > TCP 1433 > Allow > scope to MECM01 (10.50.0.70) / authorized management IPs ONLY.

[ ] Do NOT allow public or entire-internet connections to TCP 1433; keep SQL inside private networks.

> Get-Service MSSQLSERVER
> Test-NetConnection SQL01.lab.example.test -Port 1433

**PASS CHECK** SQL engine service Running; correct collation selected; TCP connectivity works from MECM01 later (not necessarily from other hosts).

**WATCH OUT** When setup uses a separate remote SQL host, MECM needs special site-server computer account permissions, described in MECM-02. Do not treat an arbitrary .bak as a supported MECM site recovery.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** SQL01 / SQL Server 2022 Setup and Configuration Manager / authorized setup administrator.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** SQL engine service Running; correct collation selected; TCP connectivity works from MECM01 later (not necessarily from other hosts).

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Start SQL Setup on SQL01

**WORKSPACE** SQL01 · File Explorer

**DO** Sign into SQL01 with your authorized setup account. Mount the SQL Server 2022 ISO, open it in File Explorer, and right-click setup.exe > Run as administrator.

**EXPECT** SQL Server Installation Center opens on SQL01.

**IF STUCK** Do not install SQL on DC01. Confirm SQL01 is a domain member and your chosen SQL edition is compatible with any later MECM exercise.

**EVIDENCE** Capture sQL Server Installation Center opens on SQL01. Record the target computer and date.

### Step 02: Select a stand-alone engine installation

**WORKSPACE** SQL01 · SQL Server Setup wizard

**DO** Choose Installation > New SQL Server stand-alone installation or add features to an existing installation. Use the evaluation or licensed option approved for the lab.

**EXPECT** The setup rules and license pages can be reviewed.

**IF STUCK** SQL Server version and Windows Server version are separate: SQL 2022 can run on this Server 2019 guest.

**EVIDENCE** Capture the setup rules and license pages can be reviewed. Record the target computer and date.

### Step 03: Resolve setup rules

**WORKSPACE** SQL01 · SQL Server Setup wizard

**DO** Accept terms only if you agree. Continue through product updates/rules and stop for any failed rule.

**EXPECT** No blocking setup rule remains.

**IF STUCK** Record the named rule and remediation. A firewall warning is not permission to expose SQL to the internet.

**EVIDENCE** Capture no blocking setup rule remains. Record the target computer and date.

### Step 04: Choose Database Engine Services

**WORKSPACE** SQL01 · SQL Server Setup wizard

**DO** On Feature Selection check Database Engine Services. Leave unrelated features unselected for this core lesson, then Next.

**EXPECT** Database Engine Services is the selected feature.

**IF STUCK** SSMS is a separate management application; selecting client tools is not a substitute for the engine.

**EVIDENCE** Capture database Engine Services is the selected feature. Record the target computer and date.

### Step 05: Choose the default instance

**WORKSPACE** SQL01 · SQL Server Setup wizard

**DO** On Instance Configuration choose Default instance and record MSSQLSERVER. Continue to the service-account configuration.

**EXPECT** The instance name is MSSQLSERVER.

**IF STUCK** If you intentionally use a named instance, its service and connection name differ; do not copy the default-instance commands unchanged.

**EVIDENCE** Capture the instance name is MSSQLSERVER. Record the target computer and date.

### Step 06: Set the required collation

**WORKSPACE** SQL01 · SQL Server Setup wizard

**DO** On Server Configuration open the Collation tab and set Database Engine collation to SQL_Latin1_General_CP1_CI_AS for this lab’s later MECM dependency.

**EXPECT** The collation text exactly matches the planned value.

**IF STUCK** Collation is not a Windows language setting. Correct it before installation; changing it afterward is not a trivial toggle.

**EVIDENCE** Capture the collation text exactly matches the planned value. Record the target computer and date.

### Step 07: Grant your setup account access

**WORKSPACE** SQL01 · SQL Server Setup wizard

**DO** On Database Engine Configuration choose Windows authentication mode. Click Add Current User so your authorized setup identity is listed as a SQL administrator.

**EXPECT** Your setup identity is explicitly in the SQL administrator list.

**IF STUCK** Domain membership alone does not grant SQL sysadmin. Do not solve a missing SQL login with a weak sa password.

**EVIDENCE** Capture your setup identity is explicitly in the SQL administrator list. Record the target computer and date.

### Step 08: Finish installation and open the service

**WORKSPACE** SQL01 · SQL Server Setup wizard

**DO** Review the selected features and click Install. Wait for completion, then open PowerShell opened with Run as administrator on SQL01 and run Get-Service MSSQLSERVER.

**EXPECT** MSSQLSERVER is Running.

**IF STUCK** Use the SQL setup summary/detail logs for a failed installation; do not claim completion because setup.exe launched.

**EVIDENCE** Capture mSSQLSERVER is Running. Record the target computer and date.

**COMMAND**
> Get-Service MSSQLSERVER

### Step 09: Set a bounded SQL memory maximum

**WORKSPACE** SQL01 · SQL Server Management Studio

**DO** After installing SSMS, connect to SQL01 > right-click server > Properties > Memory. Set an explicit maximum that leaves RAM for Windows and other required processes; record the allocation from your lab sizing plan.

**EXPECT** The configured memory limit is recorded and leaves headroom for Windows.

**IF STUCK** No single number fits every host. If the planned MECM requirements cannot fit your RAM, defer that optional extension.

**EVIDENCE** Capture the configured memory limit is recorded and leaves headroom for Windows. Record the target computer and date.

### Step 10: Enable private TCP access only when needed

**WORKSPACE** SQL01 · SQL Server Configuration Manager

**DO** Open SQL Server Configuration Manager > SQL Server Network Configuration > Protocols for MSSQLSERVER. Enable TCP/IP. In TCP/IP Properties > IP Addresses > IPAll clear dynamic ports and set TCP Port 1433 for this lab; restart SQL Server through Configuration Manager.

**EXPECT** The engine is listening on the planned fixed port after restart.

**IF STUCK** This changes instance connectivity. Record existing settings first; avoid changing an unrelated or production instance.

**EVIDENCE** Capture the engine is listening on the planned fixed port after restart. Record the target computer and date.

### Step 11: Scope the Windows firewall rule

**WORKSPACE** SQL01 · Windows Defender Firewall with Advanced Security

**DO** On SQL01 open Windows Defender Firewall with Advanced Security > Inbound Rules > New Rule > Port > TCP > Specific local ports 1433 > Allow the connection. Use the Domain profile, name the rule, then Properties > Scope and limit remote addresses to the recorded MECM01/authorized private admin IPs.

**EXPECT** The SQL rule is private, scoped, and documented.

**IF STUCK** Do not allow Any remote address or create a public Azure rule for SQL 1433. A test from a deliberately excluded host should fail.

**EVIDENCE** Capture the SQL rule is private, scoped, and documented. Record the target computer and date.

SQL-04 / SSMS + FAKE DATA

# Use SSMS to create a database you understand

Think of SSMS as a filing-cabinet window. The SQL database lives on SQL01 even when you open SSMS on another computer.

[ ] On SQL01 install SSMS from the Microsoft website. Open SQL Server Management Studio.

[ ] Connect to Server: Server type = Database Engine; Server name = SQL01 or SQL01.lab.example.test; Authentication = Windows Authentication; Connect.

[ ] Expand Databases. Open New Query. Paste the practice script below. It creates only FAKE records and never touches MECM tables.

> CREATE DATABASE AgencyHelpdesk;
> GO
> USE AgencyHelpdesk;
> GO
> CREATE TABLE dbo.Tickets (
> TicketID INT PRIMARY KEY,
> Summary NVARCHAR(100) NOT NULL,
> Status NVARCHAR(20) NOT NULL
> );
> INSERT INTO dbo.Tickets VALUES
> (101, 'Printer not working', 'Open'),
> (102, 'VPN help', 'Closed');
> SELECT * FROM dbo.Tickets;

[ ] Click Execute (or F5). Verify Messages says commands completed and Results shows two tickets. Refresh Databases and find AgencyHelpdesk.

[ ] Practice SELECT with WHERE Status = Open; screenshot your query and result.

> USE AgencyHelpdesk;
> SELECT TicketID, Summary, Status FROM dbo.Tickets;

**PASS CHECK** Two fake rows visible. You can explain DB = the binder, table = one sheet, rows = entries, SSMS = management tool.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** SQL01 / SQL Server Management Studio / authorized Windows-authenticated SQL setup account.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** Two fake rows visible. You can explain DB = the binder, table = one sheet, rows = entries, SSMS = management tool.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Install and open SSMS

**WORKSPACE** SQL01 · SQL Server Management Studio

**DO** On SQL01 install SSMS from the Microsoft website. Open SQL Server Management Studio.

**EXPECT** SQL Server Management Studio opens on SQL01.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: SQL Server Management Studio opens on SQL01.

### Step 02: Connect to SQL01

**WORKSPACE** SQL01 · Windows Server desktop

**DO** Connect to Server: Server type = Database Engine; Server name = SQL01 or SQL01.lab.example.test; Authentication = Windows Authentication; Connect.

**EXPECT** Object Explorer is connected to your intended SQL01 instance.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Object Explorer is connected to your intended SQL01 instance.

### Step 03: Open a query for the practice data

**WORKSPACE** SQL01 · Windows Server desktop

**DO** Expand Databases. Open New Query. Paste the practice script below. It creates only FAKE records and never touches MECM tables.

**EXPECT** The query editor contains the fictional database script, with the intended server selected.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The query editor contains the fictional database script, with the intended server selected.

### Step 04: Run the script and find the database

**WORKSPACE** SQL01 · Windows Server desktop

**DO** Click Execute (or F5). Verify Messages says commands completed and Results shows two tickets. Refresh Databases and find AgencyHelpdesk.

**EXPECT** AgencyHelpdesk appears after refresh, and the results contain the two fake tickets.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: AgencyHelpdesk appears after refresh, and the results contain the two fake tickets.

### Step 05: Filter the practice tickets

**WORKSPACE** SQL01 · Windows Server desktop

**DO** Practice SELECT with WHERE Status = Open; screenshot your query and result.

**EXPECT** The filtered results show only rows whose Status is Open.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The filtered results show only rows whose Status is Open.

### Step 06: Check the database objects

**WORKSPACE** SQL01 · Windows PowerShell as administrator

**DO** Use the named shell and machine above. Read each command against the full lesson reference; run these lines only after completing the preceding actions.

**EXPECT** The practice database and its Tickets table appear on the intended instance.

**IF STUCK** Read the actual error. SQL statements belong in SSMS New Query, Windows commands in the named guest PowerShell, and Azure commands in the stated administration context.

**EVIDENCE** Save your own result showing: The practice database and its Tickets table appear on the intended instance.

**COMMAND**
> CREATE DATABASE AgencyHelpdesk;
> GO
> USE AgencyHelpdesk;
> GO
> CREATE TABLE dbo.Tickets (
> TicketID INT PRIMARY KEY,
> Summary NVARCHAR(100) NOT NULL,
> Status NVARCHAR(20) NOT NULL
> );
> INSERT INTO dbo.Tickets VALUES
> (101, 'Printer not working', 'Open'),
> (102, 'VPN help', 'Closed');
> SELECT * FROM dbo.Tickets;

### Step 07: Read the saved practice records

**WORKSPACE** SQL01 · Windows PowerShell as administrator

**DO** Use the named shell and machine above. Read each command against the full lesson reference; run these lines only after completing the preceding actions.

**EXPECT** The displayed rows match the fake records you created, not a production database.

**IF STUCK** Read the actual error. SQL statements belong in SSMS New Query, Windows commands in the named guest PowerShell, and Azure commands in the stated administration context.

**EVIDENCE** Save your own result showing: The displayed rows match the fake records you created, not a production database.

**COMMAND**
> USE AgencyHelpdesk;
> SELECT TicketID, Summary, Status FROM dbo.Tickets;

SQL-05 / .BAK AND RESTORE

# Make a real backup and restore it

This is the same side-by-side idea you heard about when SQL 2017 moved to SQL 2022. A .bak is a database backup, not a whole Windows VM or complete SQL instance.

[ ] In File Explorer on SQL01 make C:\SQLBackups; ensure the SQL Server service account has access.

[ ] SSMS > Databases > AgencyHelpdesk > right-click > Tasks > Back Up. Backup type Full; Destination Disk; Add C:\SQLBackups\AgencyHelpdesk_full.bak.

[ ] Click OK. Confirm backup completed successfully. File Explorer: verify file exists and is not zero bytes.

[ ] In SSMS choose New Query, then RESTORE VERIFYONLY to test whether the backup set is readable.

> RESTORE VERIFYONLY
> FROM DISK = 'C:\SQLBackups\AgencyHelpdesk_full.bak';

[ ] Now practice restoring a COPY on SQL01 without overwriting original: SSMS > Databases > Restore Database > Device > ... choose .bak > Destination: AgencyHelpdesk_RestoreTest.

[ ] On the Files page choose Relocate all files to folder (or give new physical file paths) so the restored MDF/LDF do not overwrite originals.

[ ] After restore succeeds run SELECT against AgencyHelpdesk_RestoreTest. You should see the same two rows.

> SELECT name, state_desc FROM sys.databases;
> SELECT * FROM AgencyHelpdesk_RestoreTest.dbo.Tickets;

**PASS CHECK** Original AgencyHelpdesk and AgencyHelpdesk_RestoreTest coexist; .bak file exists and passes VERIFYONLY.

**WATCH OUT** A database .bak restores database contents and schema; it does NOT automatically migrate SQL logins, SQL Agent jobs, linked servers, server settings, service accounts, certificates or app connection strings.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** SQL01 / SSMS / account permitted to back up and restore the practice database.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** Original AgencyHelpdesk and AgencyHelpdesk_RestoreTest coexist; .bak file exists and passes VERIFYONLY.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Create the backup folder

**WORKSPACE** SQL01 · File Explorer

**DO** On SQL01 open File Explorer, create C:\SQLBackups, and ensure the SQL Server service account can write there.

**EXPECT** The backup destination exists on SQL01, where the engine runs.

**IF STUCK** An SSMS client path is not automatically a server-side path. Do not grant Everyone full control to bypass a service-account error.

**EVIDENCE** Capture the backup destination exists on SQL01, where the engine runs. Record the target computer and date.

### Step 02: Open the database backup dialog

**WORKSPACE** SQL01 · SQL Server Management Studio

**DO** In SSMS connected to SQL01, expand Databases. Right-click AgencyHelpdesk > Tasks > Back Up. Choose Full and Disk. Remove an unintended default destination if necessary, then Add C:\SQLBackups\AgencyHelpdesk_full.bak.

**EXPECT** The dialog targets AgencyHelpdesk and the intended .bak path.

**IF STUCK** If AgencyHelpdesk is missing, finish SQL-04. Do not back up or restore a MECM site database using this practice-database lesson.

**EVIDENCE** Capture the dialog targets AgencyHelpdesk and the intended .bak path. Record the target computer and date.

### Step 03: Run and verify the backup

**WORKSPACE** SQL01 · Windows PowerShell as administrator

**DO** Click OK and wait for the success message. Open New Query and run RESTORE VERIFYONLY against the exact server-side file path.

**EXPECT** SQL reports that the backup set is valid; the file exists and is nonempty.

**IF STUCK** VERIFYONLY is not a restore test. Read any access-denied or missing-file error on SQL01 before continuing.

**EVIDENCE** Capture sQL reports that the backup set is valid; the file exists and is nonempty. Record the target computer and date.

**COMMAND**
> RESTORE VERIFYONLY FROM DISK = N'C:\SQLBackups\AgencyHelpdesk_full.bak';

### Step 04: Restore as a separate test database

**WORKSPACE** SQL01 · Windows Server desktop

**DO** Right-click Databases > Restore Database > Device > browse (...) > Add. Select the .bak. Set destination database name to AgencyHelpdesk_RestoreTest.

**EXPECT** The restore targets a NEW database name.

**IF STUCK** Do not select overwrite/REPLACE for AgencyHelpdesk. Cancel if the original database is the destination.

**EVIDENCE** Capture the restore targets a NEW database name. Record the target computer and date.

### Step 05: Keep the original data files untouched

**WORKSPACE** SQL01 · Windows Server desktop

**DO** On the Files page use Relocate all files to folder or choose distinct new MDF/LDF paths. Review the destination names again, then OK.

**EXPECT** Original and restored databases coexist in Object Explorer.

**IF STUCK** A different database name alone may still reference original physical files; verify the file destinations before restoring.

**EVIDENCE** Capture original and restored databases coexist in Object Explorer. Record the target computer and date.

### Step 06: Compare the actual data

**WORKSPACE** SQL01 · Windows Server desktop

**DO** Open New Query and query the restored Tickets table. Compare it with the source database before recording the result.

**EXPECT** Both practice databases return the same two original sample tickets and are ONLINE.

**IF STUCK** If the database restores but queries fail, check the database context, user mapping, and the full restore messages.

**EVIDENCE** Capture both practice databases return the same two original sample tickets and are ONLINE. Record the target computer and date.

**COMMAND**
> SELECT name, state_desc FROM sys.databases;
> SELECT * FROM AgencyHelpdesk.dbo.Tickets;
> SELECT * FROM AgencyHelpdesk_RestoreTest.dbo.Tickets;

MECM-01 / MAKE THE SITE SERVER

# Create MECM01 and prepare Windows roles

Configuration Manager / MECM is the school office: it knows which computers exist and which software and updates they need. It stores much of that information in SQL01.

[ ] VMware > File > New VM > Windows Server Desktop Experience; name MECM01; fixed lab IP 10.50.0.70; DNS 10.50.0.10; allocate about 12-16 GB RAM if possible.

[ ] Join MECM01 to lab.example.test, restart, and confirm domain name/DNS connectivity.

[ ] Open Server Manager > Manage > Add Roles and Features; review current Configuration Manager site prerequisites for IIS, BITS, .NET, RDC and other required components for your selected version.

[ ] Install the correct supported Windows ADK plus Windows PE add-on, if you plan to use operating-system deployment. Cross-check the current ADK support matrix first.

[ ] Create folders on MECM01: C:\CMPrereqs for prerequisite downloads, C:\CMSource for setup sources, and a spacious content library folder as needed.

[ ] Verify MECM01 can contact SQL01 on the SQL TCP port from PowerShell. DNS and firewall must permit it.

> hostname
> (Get-CimInstance Win32_ComputerSystem).Domain
> Resolve-DnsName SQL01.lab.example.test
> Test-NetConnection SQL01.lab.example.test -Port 1433

**PASS CHECK** MECM01 is domain-joined; SQL01 resolves; Test-NetConnection reports TcpTestSucceeded = True.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** MECM01 Server 2019 guest / Server Manager and Windows PowerShell opened with Run as administrator / authorized administrator.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** MECM01 is domain-joined; SQL01 resolves; Test-NetConnection reports TcpTestSucceeded = True.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Create the MECM server

**WORKSPACE** MECM01 · Windows Server desktop

**DO** VMware > File > New VM > Windows Server Desktop Experience; name MECM01; fixed lab IP 10.50.0.70; DNS 10.50.0.10; allocate about 12-16 GB RAM if possible.

**EXPECT** MECM01 runs the intended Windows edition with IP 10.50.0.70 and DNS 10.50.0.10, using its heavier site-server allocation.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: MECM01 runs the intended Windows edition with IP 10.50.0.70 and DNS 10.50.0.10, using its heavier site-server allocation.

### Step 02: Join the practice domain

**WORKSPACE** MECM01 · Windows Server desktop

**DO** Join MECM01 to lab.example.test, restart, and confirm domain name/DNS connectivity.

**EXPECT** MECM01 reports lab.example.test, resolves the domain and can use its domain account after restart.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: MECM01 reports lab.example.test, resolves the domain and can use its domain account after restart.

### Step 03: Prepare Windows features

**WORKSPACE** MECM01 · Server Manager

**DO** Open Server Manager > Manage > Add Roles and Features; review current Configuration Manager site requirements for IIS, BITS, .NET, RDC and other required components for your selected version.

**EXPECT** The required features for your recorded MECM version are installed; failed feature checks have been resolved.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The required features for your recorded MECM version are installed; failed feature checks have been resolved.

### Step 04: Prepare deployment tools

**WORKSPACE** MECM01 · Windows Server desktop

**DO** Install the correct supported Windows ADK plus Windows PE add-on, if you plan to use operating-system deployment. Cross-check the current ADK support matrix first.

**EXPECT** If OS deployment is included, the installed ADK and WinPE versions match the supported combination in your notes.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: If OS deployment is included, the installed ADK and WinPE versions match the supported combination in your notes.

### Step 05: Create setup folders

**WORKSPACE** MECM01 · Windows Server desktop

**DO** Create folders on MECM01: C:\CMPrereqs for prerequisite downloads, C:\CMSource for setup sources, and a spacious content library folder as needed.

**EXPECT** C:\CMPrereqs and C:\CMSource exist on MECM01, with a recorded location for content that has enough space.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: C:\CMPrereqs and C:\CMSource exist on MECM01, with a recorded location for content that has enough space.

### Step 06: Test access to SQL

**WORKSPACE** MECM01 · Windows PowerShell as administrator

**DO** Verify MECM01 can contact SQL01 on the SQL TCP port from PowerShell. DNS and firewall must permit it.

**EXPECT** The recorded SQL name resolves correctly and the TCP test to the intended private SQL port succeeds.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The recorded SQL name resolves correctly and the TCP test to the intended private SQL port succeeds.

### Step 07: Check the setup server

**WORKSPACE** MECM01 · Windows PowerShell as administrator

**DO** Use the named shell and machine above. Read each command against the full lesson reference; run these lines only after completing the preceding actions.

**EXPECT** Your hostname, domain and service checks match the planned MECM01 setup machine.

**IF STUCK** Read the actual error. SQL statements belong in SSMS New Query, Windows commands in the named guest PowerShell, and Azure commands in the stated administration context.

**EVIDENCE** Save your own result showing: Your hostname, domain and service checks match the planned MECM01 setup machine.

**COMMAND**
> hostname
> (Get-CimInstance Win32_ComputerSystem).Domain
> Resolve-DnsName SQL01.lab.example.test
> Test-NetConnection SQL01.lab.example.test -Port 1433

MECM-02 / AD + SQL PERMISSIONS

# Allow MECM01 to talk to Active Directory and SQL

A computer can be domain-joined and still be denied database access. We must give the proper identity permission.

[ ] On DC01, open Server Manager > Tools > ADSI Edit. This is the advanced AD editor; use ONLY in this disposable training forest.

[ ] In ADSI Edit > Connect to Default naming context > DC=lab,DC=example,DC=test > CN=System. Right-click System > New > Object > Container, name it System Management.

[ ] Right-click CN=System Management > Properties > Security > Add LAB\MECM01\$ (select Computers); grant Full Control with inheritance to descendants for site publishing.

[ ] Optionally extend the lab AD schema using ConfigMgr media \SMSSETUP\BIN\X64\extadsch.exe as a Schema Admin; BACK UP AD system state first. Schema extension is a separate, forest-wide, difficult-to-reverse change.

[ ] On SQL01: Computer Management > Local Users and Groups > Groups > Administrators > Add LAB\MECM01\$ (site-server computer account), as required for this remote site-system setup.

[ ] SSMS on SQL01 > Security > Logins > New Login > LAB\MECM01\$ > Server Roles > sysadmin. This high privilege is required by Configuration Manager; apply only to the isolated lab SQL instance.

[ ] Ensure the account RUNNING MECM Setup is local Administrator on MECM01 and SQL01, and SQL sysadmin on the instance (per Microsoft requirements).

[ ] On MECM01 test name resolution and SQL connectivity again. Confirm SQL01 Windows firewall permits TCP 1433 ONLY from MECM01 and authorized admin hosts.

> Test-NetConnection SQL01.lab.example.test -Port 1433
> \# In SSMS on SQL01 check Security > Logins for LAB\MECM01\$

**PASS CHECK** You can explain two access paths: MECM01 -> SQL01 TCP and MECM01 computer identity -> SQL Server permissions.

**WATCH OUT** Do not repeat sysadmin grants, ADSI changes, or schema extension inside a government tenant without change approval and the official design/permissions review.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** DC01, SQL01, and MECM01 / ADUC, SSMS, and Windows security tools / authorized administrators.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** You can explain two access paths: MECM01 -> SQL01 TCP and MECM01 computer identity -> SQL Server permissions.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Open the practice directory editor

**WORKSPACE** DC01 · ADSI Edit

**DO** On DC01, open Server Manager > Tools > ADSI Edit. This is the advanced AD editor; use ONLY in this practice training forest.

**EXPECT** ADSI Edit is open on the intended practice domain controller; no directory object has been changed yet.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: ADSI Edit is open on the intended practice domain controller; no directory object has been changed yet.

### Step 02: Create the publishing container

**WORKSPACE** DC01 · ADSI Edit

**DO** In ADSI Edit > Connect to Default naming context > DC=lab,DC=example,DC=test > CN=System. Right-click System > New > Object > Container, name it System Management.

**EXPECT** CN=System Management appears inside CN=System in the practice domain naming context.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: CN=System Management appears inside CN=System in the practice domain naming context.

### Step 03: Grant the site computer publishing rights

**WORKSPACE** DC01 · Windows Server desktop

**DO** Right-click CN=System Management > Properties > Security > Add LAB\MECM01\$ (select Computers); grant Full Control with inheritance to descendants for site publishing.

**EXPECT** The System Management permissions show LAB\MECM01$ with the intended inherited rights, limited to this container.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The System Management permissions show LAB\MECM01$ with the intended inherited rights, limited to this container.

### Step 04: Record the schema decision

**WORKSPACE** DC01 · Windows Server desktop

**DO** Optionally extend the lab AD schema using ConfigMgr media \SMSSETUP\BIN\X64\extadsch.exe as a Schema Admin; BACK UP AD system state first. Schema extension is a separate, forest-wide, difficult-to-reverse change.

**EXPECT** If you performed the optional extension, your backup and log show the result; otherwise your notes state that it was skipped.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: If you performed the optional extension, your backup and log show the result; otherwise your notes state that it was skipped.

### Step 05: Prepare remote setup rights

**WORKSPACE** SQL01 · Windows Server desktop

**DO** On SQL01: Computer Management > Local Users and Groups > Groups > Administrators > Add LAB\MECM01\$ (site-server computer account), as required for this remote site-system setup.

**EXPECT** The SQL01 local Administrators group has the site-server computer account required by the documented remote setup.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The SQL01 local Administrators group has the site-server computer account required by the documented remote setup.

### Step 06: Add the required SQL login

**WORKSPACE** SQL01 · SQL Server Management Studio

**DO** SSMS on SQL01 > Security > Logins > New Login > LAB\MECM01\$ > Server Roles > sysadmin. This high privilege is required by Configuration Manager; apply only to the isolated lab SQL instance.

**EXPECT** SQL01 lists the intended MECM01 computer login with its required site-server role on the isolated lab instance.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: SQL01 lists the intended MECM01 computer login with its required site-server role on the isolated lab instance.

### Step 07: Check setup account rights

**WORKSPACE** MECM01 · Windows Server desktop

**DO** Ensure the account RUNNING MECM Setup is local Administrator on MECM01 and SQL01, and SQL sysadmin on the instance (per Microsoft requirements).

**EXPECT** The account running Setup has the documented Windows and SQL setup rights on the intended servers.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The account running Setup has the documented Windows and SQL setup rights on the intended servers.

### Step 08: Repeat the private SQL test

**WORKSPACE** MECM01 · Windows Server desktop

**DO** On MECM01 test name resolution and SQL connectivity again. Confirm SQL01 Windows firewall permits TCP 1433 ONLY from MECM01 and authorized admin hosts.

**EXPECT** MECM01 resolves SQL01 and reaches its SQL port; the SQL firewall permits only the documented private sources.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: MECM01 resolves SQL01 and reaches its SQL port; the SQL firewall permits only the documented private sources.

### Step 09: Check the final setup targets

**WORKSPACE** DC01 · Windows PowerShell as administrator

**DO** Use the named shell and machine above. Read each command against the full lesson reference; run these lines only after completing the preceding actions.

**EXPECT** Your checks refer to the intended practice AD container and SQL server, with no production target selected.

**IF STUCK** Read the actual error. SQL statements belong in SSMS New Query, Windows commands in the named guest PowerShell, and Azure commands in the stated administration context.

**EVIDENCE** Save your own result showing: Your checks refer to the intended practice AD container and SQL server, with no production target selected.

**COMMAND**
> Test-NetConnection SQL01.lab.example.test -Port 1433
> \# In SSMS on SQL01 check Security > Logins for LAB\MECM01\$

MECM-03 / SETUP WIZARD

# Install a stand-alone primary site (evaluation)

Use the graphical Setup Wizard and verify every prerequisite. We are NOT installing an enterprise central administration site for five lab VMs.

[ ] On MECM01, mount the official Configuration Manager evaluation media. Run splash.hta or the documented setup entry point and choose Install; follow setup.exe wizard.

[ ] Select Install a Configuration Manager primary site. For a small lab choose Use typical installation options only if that path correctly matches your remote SQL layout; otherwise Custom setup options.

[ ] Product Key page: Evaluation. Accept product terms. Download prerequisite files to C:\CMPrereqs (internet connection needed) or use predownloaded files.

[ ] Site settings: Site code LAB (three characters); Site name Agency Lab; installation folder on MECM01. Choose stand-alone primary site.

[ ] Database Information: SQL Server FQDN SQL01.lab.example.test; default instance (leave name blank); database by default CM_LAB; Service Broker port 4022.

[ ] SMS Provider: MECM01.lab.example.test. On client communication choose HTTPS/enhanced HTTP design appropriate for your isolated lab; do NOT expose HTTP roles to the internet.

[ ] Management Point and Distribution Point: MECM01.lab.example.test for small lab. Use required certificates/communication options for your chosen version.

[ ] Run Prerequisite Checker. STOP if red errors appear. Resolve missing Windows features, ADK, permissions, SQL collation, port or network issues before installing.

[ ] Begin install. Watch the setup progress and logs, including C:\ConfigMgrSetup.log or logs shown by the wizard. This can take a while.

[ ] When done, open Configuration Manager Console > Administration > Site Configuration > Sites. Confirm site LAB appears.

**PASS CHECK** The console opens successfully and SQL01 SSMS > Databases contains CM_LAB. You never manually created CM_LAB!

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** MECM01 / Configuration Manager setup wizard / authorized setup account.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** The console opens successfully and SQL01 SSMS > Databases contains CM_LAB. You never manually created CM_LAB!

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Open MECM Setup

**WORKSPACE** MECM01 · Configuration Manager Setup wizard

**DO** On MECM01, mount the official Configuration Manager evaluation media. Run splash.hta or the documented setup entry point and choose Install; follow setup.exe wizard.

**EXPECT** The Configuration Manager setup wizard opens on MECM01 using the intended evaluation source.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The Configuration Manager setup wizard opens on MECM01 using the intended evaluation source.

### Step 02: Choose a primary site

**WORKSPACE** MECM01 · Configuration Manager Setup wizard

**DO** Select Install a Configuration Manager primary site. For a small lab choose Use typical installation options only if that path correctly matches your remote SQL layout; otherwise Custom setup options.

**EXPECT** The wizard is configured for a standalone primary site and the options match your remote SQL design.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The wizard is configured for a standalone primary site and the options match your remote SQL design.

### Step 03: Prepare setup downloads

**WORKSPACE** MECM01 · Configuration Manager Setup wizard

**DO** Product Key page: Evaluation. Accept product terms. Download prerequisite files to C:\CMPrereqs (internet connection needed) or use predownloaded files.

**EXPECT** Evaluation and accepted terms are selected, and prerequisite files are available in the recorded folder.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Evaluation and accepted terms are selected, and prerequisite files are available in the recorded folder.

### Step 04: Name the site

**WORKSPACE** MECM01 · Configuration Manager Setup wizard

**DO** Site settings: Site code LAB (three characters); Site name Agency Lab; installation folder on MECM01. Choose stand-alone primary site.

**EXPECT** Site code LAB and the fictional site name appear in the wizard with the intended install folder.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Site code LAB and the fictional site name appear in the wizard with the intended install folder.

### Step 05: Select the SQL server

**WORKSPACE** MECM01 · Configuration Manager Setup wizard

**DO** Database Information: SQL Server FQDN SQL01.lab.example.test; default instance (leave name blank); database by default CM_LAB; Service Broker port 4022.

**EXPECT** Database Information points to SQL01.lab.example.test, the default instance and CM_LAB, with the documented broker port.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Database Information points to SQL01.lab.example.test, the default instance and CM_LAB, with the documented broker port.

### Step 06: Choose provider and communication

**WORKSPACE** MECM01 · Configuration Manager Setup wizard

**DO** SMS Provider: MECM01.lab.example.test. On client communication choose HTTPS/enhanced HTTP design appropriate for your isolated lab; do NOT expose HTTP roles to the internet.

**EXPECT** The provider is MECM01 and the communication settings match the supported lab design in your notes.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The provider is MECM01 and the communication settings match the supported lab design in your notes.

### Step 07: Choose the management and content roles

**WORKSPACE** MECM01 · Configuration Manager Setup wizard

**DO** Management Point and Distribution Point: MECM01.lab.example.test for small lab. Use required certificates/communication options for your chosen version.

**EXPECT** The management point and distribution point target the planned practice server, using supported communication settings.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The management point and distribution point target the planned practice server, using supported communication settings.

### Step 08: Resolve prerequisite errors

**WORKSPACE** MECM01 · Configuration Manager Setup wizard

**DO** Run Prerequisite Checker. STOP if red errors appear. Resolve missing Windows features, ADK, permissions, SQL collation, port or network issues before installing.

**EXPECT** The checker reports no blocking failures. Read and resolve each red error before starting installation.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The checker reports no blocking failures. Read and resolve each red error before starting installation.

### Step 09: Install the site

**WORKSPACE** MECM01 · Configuration Manager Setup wizard

**DO** Begin install. Watch the setup progress and logs, including C:\ConfigMgrSetup.log or logs shown by the wizard. This can take a while.

**EXPECT** The setup wizard and its log report completion; an unfinished progress bar is not a completed site.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The setup wizard and its log report completion; an unfinished progress bar is not a completed site.

### Step 10: Open the site in the console

**WORKSPACE** MECM01 · Configuration Manager console

**DO** When done, open Configuration Manager Console > Administration > Site Configuration > Sites. Confirm site LAB appears.

**EXPECT** Administration → Site Configuration → Sites lists LAB as the installed practice site.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Administration → Site Configuration → Sites lists LAB as the installed practice site.

MECM-04 / A REAL MANAGED DEVICE

# Add a client and test the SQL dependency

The office needs a student. An MECM site with no client is like a tracking system with nothing to track.

[ ] On MECM01 > Administration > Hierarchy Configuration > Boundaries, add the LAB subnet 10.50.0.0/24 or your actual VMnet IP range.

[ ] Create a Boundary Group (example LAB-BG), add that boundary, and associate site assignment LAB and the distribution/management server as appropriate.

[ ] On APP01 (a lab member server), install the Configuration Manager client using the approved client push/setup method documented for your version. For example, an authorized manual install from \MECM01\SMS_LAB\Client uses ccmsetup.exe with site parameters.

[ ] Check the Windows Control Panel > Configuration Manager applet on APP01, then Actions and assigned site; verify client is healthy and assigned LAB.

[ ] On MECM01 console > Assets and Compliance > Devices, find APP01, see active/client status and new inventory.

[ ] In SSMS on SQL01, refresh databases; confirm CM_LAB is online. Do NOT make manual inserts/deletes in CM_LAB.

[ ] For dependency proof (lab only), pause MECM-related work and stop SQL Server briefly on SQL01. Observe MECM console/database connectivity errors, then START the SQL service immediately.

> Get-Service MSSQLSERVER \# on SQL01
> Get-Service CcmExec \# on APP01 if client installed

**PASS CHECK** APP01 is visible as a managed client and returns after SQL restarts. You can explain that MECM uses a LIVE SQL database, not a one-time .bak.

**WATCH OUT** Client install arguments and server-role permissions vary by version. For production use change controls and approved deployment methods; a server can appear in inventory before all features function.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** MECM01 console and named test client / authorized management account.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** APP01 is visible as a managed client and returns after SQL restarts. You can explain that MECM uses a LIVE SQL database, not a one-time .bak.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Add the client network boundary

**WORKSPACE** MECM01 · Windows Server desktop

**DO** On MECM01 > Administration > Hierarchy Configuration > Boundaries, add the LAB subnet 10.50.0.0/24 or your actual VMnet IP range.

**EXPECT** The console lists the practice subnet or chosen IP range as a boundary.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The console lists the practice subnet or chosen IP range as a boundary.

### Step 02: Create the boundary group

**WORKSPACE** MECM01 · Configuration Manager console

**DO** Create a Boundary Group (example LAB-BG), add that boundary, and associate site assignment LAB and the distribution/management server as appropriate.

**EXPECT** LAB-BG contains that boundary and has the intended LAB site assignment and site-system references.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: LAB-BG contains that boundary and has the intended LAB site assignment and site-system references.

### Step 03: Install the pilot client

**WORKSPACE** SQL01 · SQL Server Setup wizard

**DO** On APP01 (a lab member server), install the Configuration Manager client using the approved client push/setup method documented for your version. For example, an authorized manual install from \MECM01\SMS_LAB\Client uses ccmsetup.exe with site parameters.

**EXPECT** APP01 has the Configuration Manager client installed using the documented source and site parameters.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: APP01 has the Configuration Manager client installed using the documented source and site parameters.

### Step 04: Check client policy actions

**WORKSPACE** APP01 · Windows Server desktop

**DO** Check the Windows Control Panel > Configuration Manager applet on APP01, then Actions and assigned site; verify client is healthy and assigned LAB.

**EXPECT** The APP01 Configuration Manager applet shows the intended site and the expected client action list.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The APP01 Configuration Manager applet shows the intended site and the expected client action list.

### Step 05: Find APP01 in Devices

**WORKSPACE** MECM01 · Configuration Manager console

**DO** On MECM01 console > Assets and Compliance > Devices, find APP01, see active/client status and new inventory.

**EXPECT** The console shows APP01 as the intended managed client, with updated activity or inventory after the required wait.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The console shows APP01 as the intended managed client, with updated activity or inventory after the required wait.

### Step 06: Check the site database

**WORKSPACE** SQL01 · SQL Server Management Studio

**DO** In SSMS on SQL01, refresh databases; confirm CM_LAB is online. Do NOT make manual inserts/deletes in CM_LAB.

**EXPECT** CM_LAB is online in SQL01; no sample inserts or deletes were made in its application tables.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: CM_LAB is online in SQL01; no sample inserts or deletes were made in its application tables.

### Step 07: Restore SQL after the controlled test

**WORKSPACE** MECM01 · Configuration Manager console

**DO** To show that MECM needs SQL (lab only), pause MECM-related work and stop SQL Server briefly on SQL01. Observe MECM console/database connectivity errors, then START the SQL service immediately.

**EXPECT** The dependency test is recorded, SQL is running again, and the site and client checks work after recovery.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The dependency test is recorded, SQL is running again, and the site and client checks work after recovery.

### Step 08: Check the pilot client services

**WORKSPACE** MECM01 · Windows PowerShell as administrator

**DO** Use the named shell and machine above. Read each command against the full lesson reference; run these lines only after completing the preceding actions.

**EXPECT** Your recorded checks show the actual site assignment and client service state on APP01.

**IF STUCK** Read the actual error. SQL statements belong in SSMS New Query, Windows commands in the named guest PowerShell, and Azure commands in the stated administration context.

**EVIDENCE** Save your own result showing: Your recorded checks show the actual site assignment and client service state on APP01.

**COMMAND**
> Get-Service MSSQLSERVER \# on SQL01
> Get-Service CcmExec \# on APP01 if client installed

MECM-05 / WSUS + SUP

# Connect MECM to the separate WSUS01 server

WSUS is the update catalog. MECM is the manager that approves and targets update deployments. MECM Software Update Point (SUP) is the connector.

[ ] Confirm WSUS01 already has the WSUS role installed (original Lab 13) and is joined to lab.example.test with proper DNS.

[ ] On WSUS01 open IIS Manager and check whether WSUS Administration is listening on HTTP 8530 or HTTPS 8531; record actual configured ports.

[ ] Install WSUS Administration Console/components on MECM01 as required by your ConfigMgr version. Make sure MECM01 can talk to WSUS01 and SQL01.

[ ] MECM console > Administration > Site Configuration > Servers and Site System Roles > Add Site System Server > WSUS01.lab.example.test.

[ ] Add Software Update Point role, select lab-appropriate HTTPS/security settings and WSUS ports; use the correct port values for the existing WSUS install.

[ ] Use Administration > Site Configuration > Sites > Configure Site Components > Software Update Point to choose narrow products/classifications, for example a limited Windows category, and a safe sync schedule.

[ ] Monitor Monitoring > Software Update Point Synchronization Status and review WCM.log and wsyncmgr.log on the site server if sync fails.

[ ] Avoid downloading every update. A tiny demo can prove architecture with minimal or no package content; use a limited pilot client for deployment.

**PASS CHECK** WSUS01 has a SUP role in ConfigMgr; MECM shows configuration/sync status; you know the update workflow and disk impact.

**WATCH OUT** Do not configure the same clients with conflicting stand-alone WSUS GPO and Configuration Manager update policies. Production SUP usually needs TLS, certificates and approved patching design.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** MECM01 and WSUS01 / Configuration Manager console / authorized site administrator.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** WSUS01 has a SUP role in ConfigMgr; MECM shows configuration/sync status; you know the update steps and disk impact.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Check WSUS is ready

**WORKSPACE** MECM01 · Windows Server desktop

**DO** Confirm WSUS01 already has the WSUS role installed (original Lab 13) and is joined to lab.example.test with proper DNS.

**EXPECT** WSUS01 is joined to the practice domain, has the role installed and uses the intended DNS server.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: WSUS01 is joined to the practice domain, has the role installed and uses the intended DNS server.

### Step 02: Record the actual WSUS ports

**WORKSPACE** WSUS01 · IIS Manager

**DO** On WSUS01 open IIS Manager and check whether WSUS Administration is listening on HTTP 8530 or HTTPS 8531; record actual configured ports.

**EXPECT** IIS Manager shows the WSUS Administration bindings and you have written down the actual HTTP or HTTPS port.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: IIS Manager shows the WSUS Administration bindings and you have written down the actual HTTP or HTTPS port.

### Step 03: Prepare the site server connection

**WORKSPACE** MECM01 · Configuration Manager console

**DO** Install WSUS Administration Console/components on MECM01 as required by your ConfigMgr version. Make sure MECM01 can talk to WSUS01 and SQL01.

**EXPECT** Required WSUS components are installed on MECM01 and its private connection to the chosen WSUS port works.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Required WSUS components are installed on MECM01 and its private connection to the chosen WSUS port works.

### Step 04: Add the WSUS site-system server

**WORKSPACE** MECM01 · Configuration Manager console

**DO** MECM console > Administration > Site Configuration > Servers and Site System Roles > Add Site System Server > WSUS01.lab.example.test.

**EXPECT** The site-system wizard uses WSUS01 in the LAB site, with the intended server name.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The site-system wizard uses WSUS01 in the LAB site, with the intended server name.

### Step 05: Configure the update-point role

**WORKSPACE** MECM01 · Windows Server desktop

**DO** Add Software Update Point role, select lab-appropriate HTTPS/security settings and WSUS ports; use the correct port values for the existing WSUS install.

**EXPECT** The role uses the correct WSUS ports and the supported security settings selected for the lab.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The role uses the correct WSUS ports and the supported security settings selected for the lab.

### Step 06: Limit synchronization scope

**WORKSPACE** MECM01 · Windows Server desktop

**DO** Use Administration > Site Configuration > Sites > Configure Site Components > Software Update Point to choose narrow products/classifications, for example a limited Windows category, and a safe sync schedule.

**EXPECT** The update-point settings include only the chosen products, classifications and languages for the pilot.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The update-point settings include only the chosen products, classifications and languages for the pilot.

### Step 07: Check the synchronization logs

**WORKSPACE** MECM01 · Windows Server desktop

**DO** Monitor Monitoring > Software Update Point Synchronization Status and review WCM.log and wsyncmgr.log on the site server if sync fails.

**EXPECT** The console and WCM.log/wsyncmgr.log show the actual sync result or the exact error to fix.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The console and WCM.log/wsyncmgr.log show the actual sync result or the exact error to fix.

### Step 08: Keep content downloads small

**WORKSPACE** MECM01 · Windows Server desktop

**DO** Avoid downloading every update. A tiny demo can prove architecture with minimal or no package content; use a limited pilot client for deployment.

**EXPECT** Your pilot proves the chosen update workflow without downloading every product’s update content.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your pilot proves the chosen update workflow without downloading every product’s update content.

MOVE-01 / COMPARE MIGRATION METHODS

# You do not move every server the same way

Here is the secret to cloud migration interviews: inventory one system at a time, identify its dependencies, and choose a supported migration method.

| **System**         | **Common supported strategy**                                                                                                | **Big thing to check**                                            |
|--------------------|------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| Domain controllers | Create additional DC in same forest then replicate; for NEW forest rebuild identity/migrate objects through approved process | DNS, SYSVOL, GPO, trusts, identity, FSMO                          |
| WSUS01             | Rebuild or redesign; optionally move supported WSUS DB/content with planned restore                                          | Products, update catalog, clients, approvals, content             |
| SQL01 (user DB)    | New SQL Azure VM + .bak backup / restore                                                                                     | SQL version, logins, jobs, permissions, DB users                  |
| MECM01 with CM_LAB | Same site move requires a supported site server/site DB process; new target hierarchy requires side-by-side migration jobs   | Cannot simply restore a .bak to new forest and declare site moved |
| APP01              | Rebuild/migrate VM or app, test login and dependencies; rejoin target domain when approved                                   | Service account, DNS, SQL string, certificates, GPO               |

[ ] Inventory name/IP/OS/CPU/RAM/disks, AD domain, SQL instance, applications, service accounts, certificates, ports and backup status.

[ ] Draw arrows: APP01 -> MECM management service; MECM01 -> SQL01; MECM SUP -> WSUS01; every domain-joined server -> AD DNS/DC.

[ ] Pick one cutover and rollback point PER service. Never shut down all original services before testing a pilot.

**PASS CHECK** You can describe why SQL user database restore and Configuration Manager site recovery are different tasks.

## Guided walkthrough

**WHERE** Lab inventory worksheet / read-only discovery and required connection or service planning.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** You can describe why SQL user database restore and Configuration Manager site recovery are different tasks.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Write the service inventory

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Inventory name/IP/OS/CPU/RAM/disks, AD domain, SQL instance, applications, service accounts, certificates, ports and backup status.

**EXPECT** Each practice service has a named server, software version, address, owner, required connections and backup status.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Each practice service has a named server, software version, address, owner, required connections and backup status.

### Step 02: Draw the required connections

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Draw arrows: APP01 -> MECM management service; MECM01 -> SQL01; MECM SUP -> WSUS01; every domain-joined server -> AD DNS/DC.

**EXPECT** Your arrows show application-to-management, MECM-to-SQL, update-point-to-WSUS and member-server-to-AD/DNS connections.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your arrows show application-to-management, MECM-to-SQL, update-point-to-WSUS and member-server-to-AD/DNS connections.

### Step 03: Choose a pilot and recovery point

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Pick one cutover and rollback point PER service. Never shut down all original services before testing a pilot.

**EXPECT** Each service has its own test, cutover decision and recovery point; the old services are not all shut down together.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Each service has its own test, cutover decision and recovery point; the old services are not all shut down together.

MOVE-02 / SQL TO AZURE

# .bak migration: the portable practice database

Azure is the new building. We will move ONLY our practice database first, then prove that it still opens. This lab does not migrate the whole MECM site.

[ ] On local SQL01: SSMS > right-click AgencyHelpdesk > Tasks > Back Up > Full to C:\SQLBackups\AgencyHelpdesk_Azure.bak. Verify with RESTORE VERIFYONLY.

[ ] Before cutover: identify every app that writes to it. Since this is a test database with no writes, no downtime is needed; for a real app use a change window, final backup and consistency checks.

[ ] Azure portal > Resource groups > choose lab group > Create a VNet subnet for application/SQL. Do not overlap your VMware 10.50.0.0/24.

[ ] Create an Azure Windows Server VM named AZ-SQL01 on a private subnet; access it via an approved secure management path (VPN/Bastion), not an open public RDP rule.

[ ] Install the SAME or NEWER supported SQL Server version on AZ-SQL01 and SSMS; for a practice user database SQL Developer is an option for nonproduction if its terms allow. MECM site DB needs its own compatible licensed edition.

[ ] Azure portal > Storage accounts > Create a short-lived LAB staging account/container; keep anonymous blob access disabled and restrict network access as appropriate.

[ ] Upload AgencyHelpdesk_Azure.bak to staging through the portal/storage tools using appropriate auth. Download the blob on AZ-SQL01 using an authenticated transfer; avoid embedding storage keys in scripts.

[ ] On AZ-SQL01 open SSMS > Connect > Databases > Restore Database > Device > ... choose downloaded .bak > set database name AgencyHelpdesk > Files > relocate files if needed > OK.

[ ] Run SELECT and compare row count/data with SQL01; create required destination login/permissions for your practice app separately; change app connection string only after test.

[ ] Retest backups and connectivity after cutover. When finished deallocate AZ-SQL01, then remove unneeded staging files and temporary access grants.

> SELECT name, state_desc FROM sys.databases;
> SELECT COUNT(*) AS TicketCount FROM AgencyHelpdesk.dbo.Tickets;

**PASS CHECK** Both local and Azure servers return two fake tickets. Explain why a .bak does not move Windows settings, SQL Agent jobs, logins, or MECM site configuration.

**WATCH OUT** For a real production database, version compatibility, encryption keys (TDE), SQL logins/SIDs, full/diff/log backup chain, RPO/RTO and application cutover require separate planning.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** SQL01 and the named Azure SQL Server VM / SSMS and an approved private file-transfer route / authorized SQL administrators.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** Both local and Azure servers return two fake tickets. Explain why a .bak does not move Windows settings, SQL Agent jobs, logins, or MECM site configuration.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Back up the fake SQL database

**WORKSPACE** SQL01 · SSMS → New Query

**DO** On local SQL01: SSMS > right-click AgencyHelpdesk > Tasks > Back Up > Full to C:\SQLBackups\AgencyHelpdesk_Azure.bak. Verify with RESTORE VERIFYONLY.

**EXPECT** SQL01 has the intended full .bak file and its readability check completes; a restore test is still required.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: SQL01 has the intended full .bak file and its readability check completes; a restore test is still required.

### Step 02: Decide how to stop writes

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Before cutover: identify every app that writes to it. Since this is a test database with no writes, no downtime is needed; for a real app use a change window, final backup and consistency checks.

**EXPECT** Your notes say that this fake database has no active writers, or identify the real application’s controlled final-backup window.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your notes say that this fake database has no active writers, or identify the real application’s controlled final-backup window.

### Step 03: Choose the private Azure subnet

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Azure portal > Resource groups > choose lab group > Create a VNet subnet for application/SQL. Do not overlap your VMware 10.50.0.0/24.

**EXPECT** Your saved Azure network range does not overlap VMnet2, and the SQL target has its own planned private subnet.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your saved Azure network range does not overlap VMnet2, and the SQL target has its own planned private subnet.

### Step 04: Create the private SQL target

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Create an Azure Windows Server VM named AZ-SQL01 on a private subnet; access it via an approved secure management path (VPN/Bastion), not an open public RDP rule.

**EXPECT** AZ-SQL01 exists in the intended lab resource group, with a working private management route and no public SQL access.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: AZ-SQL01 exists in the intended lab resource group, with a working private management route and no public SQL access.

### Step 05: Install the target SQL tools

**WORKSPACE** AZ-SQL01 · Azure Windows Server · SQL Server Setup wizard

**DO** Install the SAME or NEWER supported SQL Server version on AZ-SQL01 and SSMS; for a practice user database SQL Developer is an option for nonproduction if its terms allow. MECM site DB needs its own compatible licensed edition.

**EXPECT** The target SQL engine and SSMS are installed at a supported version, with the intended service account and memory plan.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The target SQL engine and SSMS are installed at a supported version, with the intended service account and memory plan.

### Step 06: Create protected staging

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Azure portal > Storage accounts > Create a short-lived LAB staging account/container; keep anonymous blob access disabled and restrict network access as appropriate.

**EXPECT** A temporary staging account/container exists with anonymous access disabled and a documented cleanup plan.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: A temporary staging account/container exists with anonymous access disabled and a documented cleanup plan.

### Step 07: Copy and check the backup file

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Upload AgencyHelpdesk_Azure.bak to staging through the portal/storage tools using appropriate auth. Download the blob on AZ-SQL01 using an authenticated transfer; avoid embedding storage keys in scripts.

**EXPECT** The downloaded .bak on AZ-SQL01 matches the intended source file and the recorded transfer check.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The downloaded .bak on AZ-SQL01 matches the intended source file and the recorded transfer check.

### Step 08: Restore to a distinct target

**WORKSPACE** AZ-SQL01 · Azure Windows Server · SSMS → New Query

**DO** On AZ-SQL01 open SSMS > Connect > Databases > Restore Database > Device > ... choose downloaded .bak > set database name AgencyHelpdesk > Files > relocate files if needed > OK.

**EXPECT** The practice database restores successfully on AZ-SQL01 with correct destination data-file paths.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The practice database restores successfully on AZ-SQL01 with correct destination data-file paths.

### Step 09: Compare rows and app access

**WORKSPACE** AZ-SQL01 · Azure Windows Server · SSMS → New Query

**DO** Run SELECT and compare row count/data with SQL01; create required destination login/permissions for your practice app separately; change app connection string only after test.

**EXPECT** The fake ticket rows and counts match SQL01, and the intended practice login has only the required access.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The fake ticket rows and counts match SQL01, and the intended practice login has only the required access.

### Step 10: Check backups and remove staging

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Retest backups and connectivity after cutover. When finished deallocate AZ-SQL01, then remove unneeded staging files and temporary access grants.

**EXPECT** The target backup and connection tests pass; confirmed temporary staging is removed and the VM is deallocated when paused.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The target backup and connection tests pass; confirmed temporary staging is removed and the VM is deallocated when paused.

### Step 11: Read the target database check

**WORKSPACE** AZ-SQL01 · Azure Windows Server · SSMS → New Query

**DO** Use the named shell and machine above. Read each command against the full lesson reference; run these lines only after completing the preceding actions.

**EXPECT** The reference query shows the expected fake database and records on the intended Azure SQL instance.

**IF STUCK** Read the actual error. SQL statements belong in SSMS New Query, Windows commands in the named guest PowerShell, and Azure commands in the stated administration context.

**EVIDENCE** Save your own result showing: The reference query shows the expected fake database and records on the intended Azure SQL instance.

**COMMAND**
> SELECT name, state_desc FROM sys.databases;
> SELECT COUNT(*) AS TicketCount FROM AgencyHelpdesk.dbo.Tickets;

MOVE-03 / MECM SITE TO AZURE

# Different mission: preserving or replacing MECM

A Configuration Manager site is not a normal customer database. Its database belongs to the site and is tied to names, roles, certificates and clients.

PATH A - SAME SITE / SAME DOMAIN: ask the team whether they are relocating an existing Configuration Manager site, site database or remote role. For example, SQL location changes can use Configuration Manager Setup site-maintenance options. Site server recovery has hostname/FQDN and version requirements. Do NOT guess.

[ ] MECM console > Administration > Site Configuration > Sites. Record site code LAB and version; list site system roles, client count, packages and distribution points.

[ ] MECM console > Administration > Site Configuration > Servers and Site System Roles. Write down which server hosts MP, DP, SUP, site server and SMS Provider.

[ ] Enable and complete the supported Backup Site Server maintenance task and archive supporting content. Test recovery planning; a casual SQL .bak alone is not a site migration plan.

[ ] For moving only SQL to Azure in the SAME supported forest/site scenario, review Microsoft ConfigMgr SQL database location change/setup maintenance guidance and validate latency, permissions, DB compatibility, certificates, firewall and DNS BEFORE change.

PATH B - NEW DESTINATION FOREST / NEW MECM HIERARCHY: this most closely resembles migrating an acquired agency into a DISA-managed identity environment.

[ ] Create a NEW target-domain MECM primary site and target SQL instance, with its own site code. Make sure the required domain/trust and network connectivity is approved.

[ ] In the new MECM console > Administration > Migration > Source Hierarchy, configure supported old hierarchy connection and credentials; gather data from source site.

[ ] Use migration jobs for supported collections and objects. Recreate or configure destination roles, update clients/site assignment, test packages and software updates. Not all settings move automatically.

[ ] Do NOT attempt to join the existing MECM01 to an unrelated destination forest and assume CM_LAB, service identities and management roles will keep working.

**PASS CHECK** You can explain SAME hierarchy maintenance vs NEW hierarchy migration to the interviewer, and identify why either requires a pilot and rollback.

**WATCH OUT** Lab can fully exercise Path B only with a SECOND MECM site + SECOND SQL instance + supported connectivity/credentials, which is expensive. First practice planning the exact clicks; execute when your workstation/tenant budget allows.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** MECM site inventory / Configuration Manager backup/recovery planning / authorized site owner.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** You can explain SAME hierarchy maintenance vs NEW hierarchy migration to the interviewer, and identify why either requires a pilot and rollback.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Record the source site

**WORKSPACE** Your Windows host · lab notes and browser

**DO** MECM console > Administration > Site Configuration > Sites. Record site code LAB and version; list site system roles, client count, packages and distribution points.

**EXPECT** Your worksheet names the current site code, version, roles, clients, packages and distribution points.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your worksheet names the current site code, version, roles, clients, packages and distribution points.

### Step 02: Map the site roles

**WORKSPACE** Your Windows host · lab notes and browser

**DO** MECM console > Administration > Site Configuration > Servers and Site System Roles. Write down which server hosts MP, DP, SUP, site server and SMS Provider.

**EXPECT** Your notes identify which server hosts each management, distribution, update, provider and site role.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your notes identify which server hosts each management, distribution, update, provider and site role.

### Step 03: Back up the site correctly

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Enable and complete the supported Backup Site Server maintenance task and archive supporting content. Test recovery planning; a casual SQL .bak alone is not a site migration plan.

**EXPECT** The supported site-server backup is complete and its supporting content and recovery instructions are kept privately.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The supported site-server backup is complete and its supporting content and recovery instructions are kept privately.

### Step 04: Separate a SQL location change from a site move

**WORKSPACE** Your Windows host · lab notes and browser

**DO** For moving only SQL to Azure in the SAME supported forest/site scenario, review Microsoft ConfigMgr SQL database location change/setup maintenance guidance and check latency, permissions, DB compatibility, certificates, firewall and DNS BEFORE change.

**EXPECT** Your plan identifies whether this is a supported same-site database location change, with its network and SQL requirements reviewed first.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your plan identifies whether this is a supported same-site database location change, with its network and SQL requirements reviewed first.

### Step 05: Prepare a separate destination site

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Create a NEW target-domain MECM primary site and target SQL instance, with its own site code. Make sure the required domain/trust and network connectivity is approved.

**EXPECT** The new target-domain site and SQL instance use a distinct site code and the supported private identity and network design.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The new target-domain site and SQL instance use a distinct site code and the supported private identity and network design.

### Step 06: Connect the source hierarchy

**WORKSPACE** Your Windows host · lab notes and browser

**DO** In the new MECM console > Administration > Migration > Source Hierarchy, configure supported old hierarchy connection and credentials; gather data from source site.

**EXPECT** The destination migration workspace connects to the intended supported source hierarchy using the documented permissions.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The destination migration workspace connects to the intended supported source hierarchy using the documented permissions.

### Step 07: Migrate and test supported objects

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Use migration jobs for supported collections and objects. Recreate or configure destination roles, update clients/site assignment, test packages and software updates. Not all settings move automatically.

**EXPECT** The selected supported objects migrate, destination roles are configured and the pilot client and package checks pass.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The selected supported objects migrate, destination roles are configured and the pilot client and package checks pass.

### Step 08: Do not treat a domain rejoin as a site migration

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Do NOT attempt to join the existing MECM01 to an unrelated destination forest and assume CM_LAB, service identities and management roles will keep working.

**EXPECT** Your notes explain why joining MECM01 to an unrelated forest is not a substitute for a supported site migration.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your notes explain why joining MECM01 to an unrelated forest is not a substitute for a supported site migration.

MOVE-04 / DOMAIN CHANGE

# What changes when an organization enters a new domain?

An existing domain controller cannot simply be joined to the destination domain. You migrate identities and computers using a plan, while apps often need to be reconfigured for new accounts.

[ ] Write down current domain = lab.example.test and destination = migrate.lab.example.test (or approved mock Azure domain). Keep both AD systems available during transition.

[ ] Create new users/groups/OUs and permitted GPOs in destination forest. Use Group Policy Migration Table if account/group references differ.

[ ] Check which MECM01 services, SQL permissions and clients refer to LAB users/groups; those need mapping to destination identities.

[ ] Move only APP01 first: backup app, validate destination DNS/credentials, change domain in System Properties, reboot, apply new GPO, verify application.

[ ] After APP01 is healthy, run approved MECM client migration/reassignment workflow on it. Never re-home your only DC first.

**PASS CHECK** You can explain: DCs manage identity; member servers join domains; data/services and permissions need separate checks.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** Source and destination domain inventory / identity/application planning / named domain owners.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** You can explain: DCs manage identity; member servers join domains; data/services and permissions need separate checks.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Record the two domains

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Write down current domain = lab.example.test and destination = migrate.lab.example.test (or approved mock Azure domain). Keep both AD systems available during transition.

**EXPECT** Your notes identify the old practice domain and the separate destination; both remain available for the test.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your notes identify the old practice domain and the separate destination; both remain available for the test.

### Step 02: Prepare destination identities

**WORKSPACE** DC01 · Group Policy Management

**DO** Create new users/groups/OUs and permitted GPOs in destination forest. Use Group Policy Migration Table if account/group references differ.

**EXPECT** The needed test users, groups, OUs and policies exist in the destination, with any name mappings recorded.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The needed test users, groups, OUs and policies exist in the destination, with any name mappings recorded.

### Step 03: Map application account dependencies

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Check which MECM01 services, SQL permissions and clients refer to LAB users/groups; those need mapping to destination identities.

**EXPECT** Your worksheet lists service accounts, SQL rights and MECM references that still use old-domain identities.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your worksheet lists service accounts, SQL rights and MECM references that still use old-domain identities.

### Step 04: Move the application pilot

**WORKSPACE** DC01 · Group Policy Management

**DO** Move only APP01 first: backup app, check destination DNS/credentials, change domain in System Properties, reboot, apply new GPO, verify application.

**EXPECT** APP01 passes the intended destination DNS, domain membership, policy and website checks before more servers move.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: APP01 passes the intended destination DNS, domain membership, policy and website checks before more servers move.

### Step 05: Check the pilot management client

**WORKSPACE** Your Windows host · Windows PowerShell as administrator

**DO** After APP01 is healthy, run approved MECM client migration/reassignment steps on it. Never re-home your only DC first.

**EXPECT** The APP01 MECM client uses the intended site and receives policy after the move; the domain controllers were not moved first.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The APP01 MECM client uses the intended site and receives policy after the move; the domain controllers were not moved first.

AZ-01 / SPEND LESS

# Azure cost worksheet: one cloud VM at a time

You can learn the on-prem build at home. Cloud VMs consume money per powered-on hour, plus some resources keep charging after shutdown.

[ ] Before deploying: Azure portal > Subscriptions > select your subscription > Cost Management > Budgets. Set a monthly budget and email alerts; alerts do NOT auto-stop spending.

[ ] Estimate actual VM size/region/disk/storage/SQL licensing with Azure Pricing Calculator BEFORE creating resources.

[ ] Azure portal > Virtual Machines > AZ-SQL01 > Auto-shutdown > On and select your end-of-lab time. Confirm timezone/email notification.

[ ] Use a single AZ-SQL01 at first. Defer Azure AD DCs, WSUS and MECM until your local simulation is complete and you can pay for combined uptime.

[ ] Do NOT leave VPN Gateway, Azure Bastion, public IP resources, storage snapshots, backup vaults or managed disks running without checking cost; some charge even while VMs are off.

[ ] When done: Azure portal > Virtual Machines > select VM > Stop and wait for status Stopped (deallocated). Shutting down inside Windows may NOT deallocate VM billing.

[ ] Delete unneeded temporary VMs/disks/IPs after copying your sample backups off. Use resource group cleanup only after checking it contains nothing you need.

[ ] Record starting balance/cost, ending balance/cost, and whether all resource group items have been removed.

**PASS CHECK** Your Azure VM is Stopped (deallocated) or deleted, and you have checked storage, public IP and network service charges separately.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** Physical host browser / Azure Cost Management / approved subscription owner or cost-management reader.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** Your Azure VM is Stopped (deallocated) or deleted, and you have checked storage, public IP and network service charges separately.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Set budget alerts

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Before deploying: Azure portal > Subscriptions > select your subscription > Cost Management > Budgets. Set a monthly budget and email alerts; alerts do NOT auto-stop spending.

**EXPECT** The selected subscription has the planned amount and alert recipients. Alerts do not automatically stop billing.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The selected subscription has the planned amount and alert recipients. Alerts do not automatically stop billing.

### Step 02: Price the complete target

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Estimate actual VM size/region/disk/storage/SQL licensing with Azure Pricing Calculator BEFORE creating resources.

**EXPECT** Your estimate includes the chosen region, VM, disk, storage, SQL licensing and required access services.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your estimate includes the chosen region, VM, disk, storage, SQL licensing and required access services.

### Step 03: Set a shutdown reminder

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Azure portal > Virtual Machines > AZ-SQL01 > Auto-shutdown > On and select your end-of-lab time. Confirm timezone/email notification.

**EXPECT** Auto-shutdown shows the chosen local end time, time zone and notification setting for the intended VM.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Auto-shutdown shows the chosen local end time, time zone and notification setting for the intended VM.

### Step 04: Keep the first cloud test small

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Use a single AZ-SQL01 at first. Defer Azure AD DCs, WSUS and MECM until your local simulation is complete and you can pay for combined uptime.

**EXPECT** The plan starts with one AZ-SQL01 and defers optional cloud servers until their combined costs are accepted.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The plan starts with one AZ-SQL01 and defers optional cloud servers until their combined costs are accepted.

### Step 05: List charges that continue

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Do NOT leave VPN Gateway, Azure Bastion, public IP resources, storage snapshots, backup vaults or managed disks running without checking cost; some charge even while VMs are off.

**EXPECT** Your notes identify disks, gateways, IP resources, storage and backup costs that can remain when a VM is off.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your notes identify disks, gateways, IP resources, storage and backup costs that can remain when a VM is off.

### Step 06: Deallocate the paused VM

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** When done: Azure portal > Virtual Machines > select VM > Stop and wait for status Stopped (deallocated). Shutting down inside Windows may NOT deallocate VM billing.

**EXPECT** The Azure portal reports Stopped (deallocated), rather than only an operating-system shutdown.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The Azure portal reports Stopped (deallocated), rather than only an operating-system shutdown.

### Step 07: Delete only temporary resources

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Delete unneeded temporary VMs/disks/IPs after copying your sample backups off. Use resource group cleanup only after checking it contains nothing you need.

**EXPECT** The confirmed temporary items are deleted only after their required backups are saved and the resource list is checked.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The confirmed temporary items are deleted only after their required backups are saved and the resource list is checked.

### Step 08: Record the cost result

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Record starting balance/cost, ending balance/cost, and whether all resource group items have been removed.

**EXPECT** Your notes include the starting and ending cost view and the resources that still exist; delayed charges are checked later.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your notes include the starting and ending cost view and the resources that still exist; delayed charges are checked later.

AZ-02 / AZURE IS NOT WORKSTATION

# Choose a migration tool that supports your source

The VMware Workstation lab is not automatically a supported VMware vSphere appliance environment. For work, tools depend on the real source hypervisor.

[ ] Ask: is the customer using vCenter/ESXi, Hyper-V, physical servers, or another cloud? Write down hypervisor versions and credentials.

[ ] In a real vSphere environment, Azure Migrate can discover and assess VMs with its appliance; agentless replication requires supported vCenter/ESXi prerequisites.

[ ] In VMware Workstation Pro home lab, DO NOT assume the same vCenter-driven Azure Migrate workflow works. Learn with portable SQL .bak, build destination Azure VM, then compare with documented agent-based/physical server migration options.

[ ] For SQL user DB choose database-aware backup/restore rather than entire VM replication if the training objective is maintaining DB settings/consistency.

[ ] For a domain controller, build new additional DC in the same domain/forest and replicate, or use an identity migration strategy if moving to a NEW forest. Do not clone domain controllers casually.

[ ] For MECM, confirm SQL and site/hierarchy support and configuration before any VM replication. Plan a supported service-aware migration.

**PASS CHECK** Given each source (Workstation, vSphere, physical), you choose a method with a stated support assumption.

## Guided walkthrough

**WHERE** Physical host / Workstation Pro inventory and official Azure migration support matrix / planning only.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** Given each source (Workstation, vSphere, physical), you choose a method with a stated support assumption.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Name the source hypervisor correctly

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Open Workstation Pro > Help > About and record the product/version. The course source is VMware Workstation Pro, not a vCenter-managed vSphere estate.

**EXPECT** Your inventory explicitly says Workstation Pro and Server 2019.

**IF STUCK** Do not deploy a vCenter agentless appliance and assume it can discover Workstation guests.

**EVIDENCE** Capture your inventory explicitly says Workstation Pro and Server 2019. Record the target computer and date.

### Step 02: Select the supported route

**WORKSPACE** Your Windows host · lab notes and browser

**DO** For this guided assignment use LAB 17 to create a Server 2019 Azure member VM and move the test workload/data, then AZ-03 to upgrade it to 2022. If the assignment instead requires moving the entire existing VM, stop until the owner approves an applicable replication/import route based on the current support matrix.

**EXPECT** The migration plan distinguishes workload/data migration, VM rehosting, and OS upgrade.

**IF STUCK** Do not label a newly built Azure VM as the original migrated VM. Do not upload a Workstation VMDK directly and assume Azure can boot it.

**EVIDENCE** Capture the migration plan distinguishes workload/data migration, VM rehosting, and OS upgrade. Record the target computer and date.

### Step 03: Document full-VM prerequisites separately

**WORKSPACE** Your Windows host · lab notes and browser

**DO** For a true rehost, record supported source OS/license, disk conversion/boot generation, guest drivers/agent readiness, replication or VHD import method, private connectivity, testing, and rollback. Use the official Azure Migrate physical/agent-based and VMware support references; exact support must be checked for your configuration.

**EXPECT** Any full-VM move has an approved, documented method before resources or replication are created.

**IF STUCK** This course cannot verify your hypervisor or tenant remotely. Keep full rehosting blocked rather than inventing a green support status.

**EVIDENCE** Capture any full-VM move has an approved, documented method before resources or replication are created. Record the target computer and date.

AZ-03 / FULL WAVE CAPSTONE

# The pretend enterprise cutover plan

Now you can talk like a cloud engineer coming into a migration halfway through. Your job is to understand the environment BEFORE you change it.

| **Order** | **Action**                   | **You must be able to show**                                                      |
|-----------|------------------------------|-----------------------------------------------------------------------------------|
| 1         | Discover inventory           | DCs, SQL, WSUS, MECM, APP01, service accounts, dependencies                       |
| 2         | Build destination foundation | Azure subscription/tenant, VNet, NSG, DNS, identity, private admin access, budget |
| 3         | Migrate identity safely      | Decide same forest extension vs new forest; pilot GPO and sign-in                 |
| 4         | Migrate SQL user DB          | Full .bak, verify, copy, restore, queries, permissions, app test                  |
| 5         | Migrate app + patch roles    | App connection strings, WSUS/SUP redesign, approved MECM hierarchy migration      |
| 6         | Cut over in waves            | Approval, final backup, switch app/config/DNS, monitor, rollback ready            |
| 7         | Prove + shut down            | Screenshots, log evidence, backups, closure and Azure deallocation                |

[ ] Fill in the project handoff card: current phase / completed tasks / blockers / what still runs on-prem / identity plan / data plan / next milestone.

[ ] Perform a staged rehearsal on the fake AgencyHelpdesk user database. If it fails, restore local service and document why.

[ ] Explain data vs server: Azure Migrate can move a VM in a supported environment; .bak moves a database; AD replication shares a forest; ConfigMgr migration jobs move supported site data.

**PASS CHECK** You can say confidently what is moving, what must be rebuilt, and how you know the change worked.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** Lab worksheet and the source/destination saved result; authorized migration owner.

**BEFORE** The required Windows, SQL, Azure foundation, and migration saved result must pass; UPGRADE-01 is a separate new exercise.

**PASS** Your cutover plan names the owner, source, target, validation, stop trigger, rollback, and cleanup decision.

**ROLLBACK** Keep the source available until acceptance; never change live DNS or remove a rollback copy on an unverified rehearsal.

### Step 01: Write the cutover handover card

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Fill in the project handoff card: current phase / completed tasks / blockers / what still runs on-prem / identity plan / data plan / next milestone.

**EXPECT** The handover note names the phase, completed work, blockers, remaining local services and next step.

**IF STUCK** Return to the first missing required connection or service or failed saved result; do not guess a success state or switch real users.

**EVIDENCE** Save your own result showing: The handover note names the phase, completed work, blockers, remaining local services and next step.

### Step 02: Practice a small cutover and recovery

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Perform a staged rehearsal on the fake AgencyHelpdesk user database. If it fails, restore local service and document why.

**EXPECT** Your notes contain the test database, pilot checks, result and recovery decision.

**IF STUCK** Return to the first missing required connection or service or failed saved result; do not guess a success state or switch real users.

**EVIDENCE** Save your own result showing: Your notes contain the test database, pilot checks, result and recovery decision.

### Step 03: Explain what each migration method moves

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Explain data vs server: Azure Migrate can move a VM in a supported environment; .bak moves a database; AD replication shares a forest; ConfigMgr migration jobs move supported site data.

**EXPECT** You can distinguish copying a database, moving a VM, sharing AD data and moving supported MECM objects.

**IF STUCK** Return to the first missing required connection or service or failed saved result; do not guess a success state or switch real users.

**EVIDENCE** Save your own result showing: You can distinguish copying a database, moving a VM, sharing AD data and moving supported MECM objects.

UPGRADE-01 / AZURE OS UPGRADE

# Upgrade APP02 from Server 2019 to Server 2022

Upgrade the already-migrated IIS member server inside Azure, preserving the tested workload and recording guest OS evidence before and after. This is separate from application migration and does not upgrade domain controllers, SQL hosts, or MECM sites.

**PASS CHECK** APP02 reports Server 2022 after its Server 2019 baseline and its application, private access, domain secure channel, and recovery evidence all pass.

## Official reference

Microsoft Azure in-place upgrade: https://learn.microsoft.com/en-us/azure/virtual-machines/windows-in-place-upgrade

Microsoft upgrade restrictions: https://learn.microsoft.com/en-us/windows-server/get-started/install-upgrade-migrate

## Guided walkthrough

**WHERE** Azure portal plus APP02 guest; Az PowerShell on the admin workstation for media creation; Windows PowerShell opened with Run as administrator INSIDE APP02 for Setup.

**BEFORE** LAB 17 must prove the test workload on APP02 while it is still Server 2019. This is a MEMBER server, not AD DS/SQL/MECM. Confirm an eligible licensed 2019-to-2022 path, language/edition, Az PowerShell access, costs, private administration, and a recoverable backup.

**PASS** APP02 was verified as Server 2019 before upgrade, is verified as Server 2022 afterward, and the migrated IIS application, private client access, domain secure channel, and recovery/cleanup record all pass.

**ROLLBACK** Cancel Setup before installation if preservation/edition checks fail. For an established failure after upgrade, recover APP02 from the verified pre-upgrade OS/data disk and application backup plan; keep the unchanged APP01 source. Never apply this member-server rollback to a DC, SQL cluster, or MECM site. Delete temporary media only after acceptance and the rollback window.

### Step 01: Identify the Azure upgrade target

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** This lesson upgrades APP02 only: an Azure Windows Server 2019 member server with the migrated test IIS site from LAB 17. Open its Azure Overview and connect through the approved private administration path.

**EXPECT** The target is APP02, not a DC, SQL server, or MECM site server.

**IF STUCK** If the workload migration is not verified, return to LAB 17. Do not treat an OS upgrade as a migration method.

**EVIDENCE** Capture the target is APP02, not a DC, SQL server, or MECM site server. Record the target computer and date.

### Step 02: Record the guest baseline and eligibility

**WORKSPACE** APP02 · Azure Windows Server · Windows PowerShell as administrator

**DO** Inside APP02 open Windows PowerShell as administrator and run the read-only checks. Confirm Server 2019, the installed edition, English (United States) for the documented Azure media route, and sufficient OS disk free space.

**EXPECT** The starting point records actual OS/build, edition, language, free space, IIS service, and site response.

**IF STUCK** Do not use evaluation upgrade media or assume a migrated evaluation guest is eligible. Imported images may need an approved licensing conversion; do not convert an evaluation DC.

**EVIDENCE** Capture the starting point records actual OS/build, edition, language, free space, IIS service, and site response. Record the target computer and date.

**COMMAND**
> Get-ComputerInfo | Select-Object WindowsProductName, OsBuildNumber
> DISM /online /Get-CurrentEdition
> DISM /online /Get-Intl
> Get-Volume -DriveLetter C
> Get-Service W3SVC
> Invoke-WebRequest http://localhost/index.html -UseBasicParsing | Select-Object StatusCode

### Step 03: Read the Azure-specific upgrade constraints

**WORKSPACE** Your Windows host · browser for the Microsoft Azure upgrade guide

**DO** Open the Microsoft Azure in-place-upgrade reference linked in this lesson. Use its Azure VM OS Upgrade Assessment Tool and resolve any reported incompatibilities for APP02 before continuing. The route is 2019 to 2022 using server2022Upgrade media, not the newer 2025 example default.

**EXPECT** The supported source/target, licensing, language, application compatibility, and disk requirements are recorded.

**IF STUCK** STOP if support is uncertain. Microsoft notes that in-place upgrade leaves Azure source image metadata unchanged; auto guest patching, Auto OS image upgrades, Hotpatching, and Update Manager may be unsupported after this procedure. Obtain an approved alternative if these are required.

**EVIDENCE** Capture the supported source/target, licensing, language, application compatibility, and disk requirements are recorded. Record the target computer and date.

### Step 04: Create a recoverable pre-upgrade checkpoint

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Record a maintenance window and rollback decision. Back up IIS/site data off APP02. In Azure shut down/deallocate APP02 for a consistent disposable-lab snapshot, then snapshot its OS disk and every data disk from each disk resource > Create snapshot. Record the snapshots and a tested recovery path before restarting APP02.

**EXPECT** You have application backups, disk recovery points, and the exact VM/NIC/disk configuration to recover.

**IF STUCK** A snapshot is not a verified full restore plan. For this member VM, restore/recreate the disks/VM from your checkpoint if needed; do not revert a live DC or cluster with this procedure.

**EVIDENCE** Capture you have application backups, disk recovery points, and the exact VM/NIC/disk configuration to recover. Record the target computer and date.

### Step 05: Prepare the Azure PowerShell tool

**WORKSPACE** Your Windows host · Windows PowerShell with the Az module

**DO** On your authorized administration workstation open Windows PowerShell with the Az PowerShell module installed. Run Connect-AzAccount and explicitly set the correct subscription. This is Az PowerShell, not the az CLI and not a command to run on a domain controller.

**EXPECT** Get-AzContext identifies the intended subscription and account.

**IF STUCK** If Get-Command Get-AzVMImage fails, install the approved Az module first. Never paste a token or password into the course.

**EVIDENCE** Capture get-AzContext identifies the intended subscription and account. Record the target computer and date.

**COMMAND**
> Connect-AzAccount
> $subscriptionId = Read-Host 'Approved subscription ID'
> Set-AzContext -Subscription $subscriptionId
> Get-AzContext

### Step 06: Create the Server 2022 upgrade media disk

**WORKSPACE** Your Windows host · Windows PowerShell with the Az module

**DO** In the same Az PowerShell session, use the command below. Enter the ACTUAL existing VM resource group, region and matching zone; leave zone empty for a regional VM. The script creates a billable managed disk from Microsoft’s hidden upgrade-media image and stops if APP02 or its placement does not match. It does not create a new resource group or guess an image version.

**EXPECT** A managed disk named SONIC-Server2022-Upgrade is returned in APP02’s region and zone.

**IF STUCK** The source must be an eligible Azure VM using managed disks. Stop for missing images, licensing, region, policy, or permission errors. Review the managed-disk cost before running.

**EVIDENCE** Capture a managed disk named SONIC-Server2022-Upgrade is returned in APP02’s region and zone. Record the target computer and date.

**COMMAND**
> $rg = Read-Host 'APP02 resource group'
> $vmName = 'APP02'
> $vm = Get-AzVM -ResourceGroupName $rg -Name $vmName -ErrorAction Stop
> $location = $vm.Location
> $zone = if ($vm.Zones) { $vm.Zones[0] } else { '' }
> $images = @(Get-AzVMImage -Location $location -PublisherName MicrosoftWindowsServer -Offer WindowsServerUpgrade -Skus server2022Upgrade | Sort-Object { [version]$_.Version } -Descending)
> if ($images.Count -eq 0) { throw 'No Server 2022 upgrade image available here.' }
> $image = Get-AzVMImage -Location $location -PublisherName MicrosoftWindowsServer -Offer WindowsServerUpgrade -Skus server2022Upgrade -Version $images[0].Version
> $parameters = @{ Location=$location; SkuName='Standard_LRS'; CreateOption='FromImage' }
> if ($zone) { $parameters.Zone = $zone }
> $diskConfig = New-AzDiskConfig @parameters
> $diskConfig = Set-AzDiskImageReference -Disk $diskConfig -Id $image.Id -Lun 0
> New-AzDisk -ResourceGroupName $rg -DiskName 'SONIC-Server2022-Upgrade' -Disk $diskConfig

### Step 07: Attach the upgrade media as a DATA disk

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** In Azure open APP02 > Disks. Choose Attach existing disks (the label can appear as Attach existing data disk), select SONIC-Server2022-Upgrade as a data disk, set host caching to None where offered, and Save/Apply. Start APP02 if it is stopped.

**EXPECT** The media disk appears in APP02’s data-disk list; its OS disk is unchanged.

**IF STUCK** Do not swap the OS disk with the upgrade media. If the disk is unavailable, compare region/zone and attachment state; never select an unrelated disk.

**EVIDENCE** Capture the media disk appears in APP02’s data-disk list; its OS disk is unchanged. Record the target computer and date.

### Step 08: Find setup inside the guest

**WORKSPACE** APP02 · Azure Windows Server · File Explorer; then administrator PowerShell

**DO** Reconnect to APP02. Open File Explorer > This PC and locate the attached Windows Server upgrade-media volume. Open its only upgrade-media folder and confirm setup.exe exists. Right-click Start > Windows PowerShell (Admin), then change directory to that exact folder.

**EXPECT** You can identify setup.exe on the attached media volume.

**IF STUCK** Do not assume the volume is D:, E:, or F:. Do not format or initialize the upgrade-media disk or boot the VM from it.

**EVIDENCE** Capture you can identify setup.exe on the attached media volume. Record the target computer and date.

### Step 09: Start the in-place upgrade

**WORKSPACE** APP02 · Azure Windows Server · Windows PowerShell as administrator

**DO** From the media folder in Windows PowerShell opened with Run as administrator INSIDE APP02 run the command below. Review and accept licensing only if authorized; select the supported Server 2022 edition matching the installed Desktop Experience configuration when asked.

**EXPECT** Windows Setup starts an upgrade that preserves applications/settings and targets Server 2022.

**IF STUCK** If Setup offers only a destructive clean install, incompatible edition/language, evaluation target, or cannot keep apps/settings, cancel. Do not proceed by choosing Nothing.

**EVIDENCE** Capture windows Setup starts an upgrade that preserves applications/settings and targets Server 2022. Record the target computer and date.

**COMMAND**
> .\setup.exe /auto upgrade /dynamicupdate disable

### Step 10: Monitor restarts without interrupting them

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** RDP disconnection is expected during setup. In Azure open APP02 > Boot diagnostics and check the guest screenshot/serial log while it restarts. Reconnect only after the guest is available.

**EXPECT** Setup progresses through restarts and the guest returns to a sign-in screen.

**IF STUCK** Do not force power-off because RDP disappeared. For a confirmed failure capture the setup error and consult C:\Windows\Panther logs; invoke the recorded recovery plan if necessary.

**EVIDENCE** Capture setup progresses through restarts and the guest returns to a sign-in screen. Record the target computer and date.

### Step 11: Verify Server 2022 and the migrated workload

**WORKSPACE** APP02 · Azure Windows Server · Windows PowerShell as administrator

**DO** After reconnecting to APP02 run the same checks as the 2019 baseline. Test the site from the same approved private client, compare its content hash, and verify the domain secure channel and application authentication.

**EXPECT** WindowsProductName says Windows Server 2022; the IIS site and private client test still pass.

**IF STUCK** The Azure portal may still list the original 2019 image metadata; verify the guest OS directly. A successful OS version check without a working application is not a passing migration.

**EVIDENCE** Capture windowsProductName says Windows Server 2022; the IIS site and private client test still pass. Record the target computer and date.

**COMMAND**
> Get-ComputerInfo | Select-Object WindowsProductName, OsBuildNumber
> Get-Service W3SVC
> Test-ComputerSecureChannel -Verbose
> Invoke-WebRequest http://localhost/index.html -UseBasicParsing | Select-Object StatusCode
> Get-FileHash C:\inetpub\wwwroot\index.html -Algorithm SHA256

### Step 12: Finish the handoff and control costs

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** After the acceptance checks, detach the upgrade-media disk from APP02 > Disks and save. Delete only that verified temporary disk if no longer needed. Keep backups until the rollback window ends, review activation/monitoring/patching implications with the owner, and deallocate the lab when pausing.

**EXPECT** Your saved result contains 2019 before, 2022 after, matching workload checks, recovery references, and cleanup decisions.

**IF STUCK** Do not delete backup disks or the old source just because Setup completed. Deallocation does not stop disk/snapshot/Bastion/VPN costs.

**EVIDENCE** Capture your saved result contains 2019 before, 2022 after, matching workload checks, recovery references, and cleanup decisions. Record the target computer and date.

HA-01 / OPTIONAL SQL HIGH AVAILABILITY

# Two SQL servers + one cloud witness: the idea

IMAGINE THREE REFEREES. SQL01 and SQL02 are two students voting about whether the cluster can run. The Azure cloud witness is the referee with the third vote. It does NOT run SQL, hold your database, or replace a backup.

| **PART**            | **WHAT IT DOES**                                                  | **IS IT A SQL SERVER?** |
|---------------------|-------------------------------------------------------------------|-------------------------|
| SQL01               | SQL database replica - primary during normal operation            | Yes                     |
| SQL02               | SQL database replica - secondary; may take over                   | Yes                     |
| Azure cloud witness | Small Azure Blob object that helps cluster quorum voting          | No                      |
| SQL listener        | Stable name that clients use to reach the active database replica | No                      |

[ ] Say aloud: SQL01 + SQL02 + Cloud Witness = three possible quorum votes; majority generally allows the cluster to remain online. Dynamic quorum/witness can adjust votes.

[ ] Explain: WSFC quorum controls whether the cluster is allowed to run. SQL Always On Availability Groups (AG) synchronize the user databases and manage which replica is primary.

[ ] Remember: the witness does not automatically make SQL02 ready. AG replicas must be healthy/synchronized and configured for automatic failover, and app clients must connect through a correctly configured listener.

[ ] Our MECM01 application still needs its own HA design. For the MECM SITE DATABASE, confirm ConfigMgr compatibility and SQL Enterprise licensing/requirements before using an AG.

ONE-LINE MAP: MECM01 -> SQL AG LISTENER -> SQL01 (primary) \<-> SQL02 (secondary). Both SQL VMs also talk to one Cloud Witness stored in Azure Storage.

WHY THIS MATTERS In a real migration, a two-node cluster can be a cost-conscious design. A three-node cluster is NOT required simply to get a third quorum vote.

PASS CHECK \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

WHAT I SAW \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

IF IT FAILS Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** Lab worksheet / optional SQL high availability design.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** Compare your recorded result with the named lesson saved result before marking verified.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Understand the quorum vote

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Say aloud: SQL01 + SQL02 + Cloud Witness = three possible quorum votes; majority generally allows the cluster to remain online. Dynamic quorum/witness can adjust votes.

**EXPECT** You can explain that SQL01, SQL02 and the witness help the cluster decide whether it may keep running; dynamic votes can change the count.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: You can explain that SQL01, SQL02 and the witness help the cluster decide whether it may keep running; dynamic votes can change the count.

### Step 02: Separate cluster and database jobs

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Explain: WSFC quorum controls whether the cluster is allowed to run. SQL Always On Availability Groups (AG) synchronize the user databases and manage which replica is primary.

**EXPECT** Your notes distinguish WSFC’s cluster decision from the availability group’s database synchronization.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your notes distinguish WSFC’s cluster decision from the availability group’s database synchronization.

### Step 03: Check readiness before a failover

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Remember: the witness does not automatically make SQL02 ready. AG replicas must be healthy/synchronized and configured for automatic failover, and app clients must connect through a correctly configured listener.

**EXPECT** Your plan requires healthy replicas and a working listener; having a witness alone is not proof that failover will work.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your plan requires healthy replicas and a working listener; having a witness alone is not proof that failover will work.

### Step 04: Check the MECM-specific limits

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Our MECM01 application still needs its own HA design. For the MECM SITE DATABASE, confirm ConfigMgr compatibility and SQL Enterprise licensing/requirements before using an AG.

**EXPECT** Any proposed MECM site-database availability group has its own supported version, edition and application design checked first.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Any proposed MECM site-database availability group has its own supported version, edition and application design checked first.

HA-02 / PLAN + PREPARE

# Before you click Create: prepare two SQL nodes

This optional chapter starts AFTER you understand your one-server SQL backup/restore exercise. It is a separate, more advanced test. Building the witness alone is cheaper than running two SQL VMs, so prepare the design locally first.

[ ] Confirm SQL01 and SQL02 are separate Windows Server VMs, joined to the SAME destination AD domain, with reliable DNS and correct time synchronization.

[ ] If deploying in Azure, plan two private SQL VMs. Use separate availability zones where supported; Microsoft recommends separate subnets for a multi-subnet SQL AG to avoid a load balancer for the listener.

[ ] Give each VM its own SQL instance and data storage. AG replicates databases; it is not a shared data disk. Check edition/version support (MECM site DB AG requires a supported SQL Enterprise edition).

[ ] Ensure both VMs can reach the domain controllers and each other over approved ports. No public RDP, SMB, SQL port 1433 or cluster ports. Use private access/Bastion and least-privilege rules.

[ ] On BOTH Windows SQL VMs: Server Manager > Manage > Add Roles and Features > Features > Failover Clustering > Add Features > Install.

[ ] PowerShell alternative on both: run the command below in Windows PowerShell as Administrator.

Install-WindowsFeature Failover-Clustering -IncludeManagementTools

[ ] Run a cluster validation in Server Manager > Tools > Failover Cluster Manager > Validate Configuration; supply SQL01 and SQL02. Review all failed tests, not just the pass count.

Test-Cluster -Node SQL01,SQL02 -Include "Inventory","Network","System Configuration"

[ ] With the cluster prerequisites and chosen Azure address plan verified, use Failover Cluster Manager > Create Cluster. Add SQL01 and SQL02 and name the cluster; follow the Azure SQL AG tutorial for valid multi-subnet cluster name/IP settings. Do NOT blindly copy on-prem cluster virtual IP instructions.

[ ] Check that Failover Cluster Manager shows BOTH nodes Online. Stop if you see cluster validation errors, AD/DNS name conflicts, or an unsupported network layout.

Get-ClusterNode | Format-Table Name,State,NodeWeight,DynamicWeight

NOTE A Windows cluster is a prerequisite; a cloud witness is attached to an EXISTING WSFC. The witness does not create SQL Always On, and joining a cluster alone does not replicate a database.

PASS CHECK \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

WHAT I SAW \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

IF IT FAILS Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** SQL01 and SQL02 / Windows Failover Clustering preparation / authorized cluster administrator; optional extension.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** Compare your recorded result with the named lesson saved result before marking verified.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Check both SQL servers

**WORKSPACE** SQL01 · Windows Server desktop

**DO** Confirm SQL01 and SQL02 are separate Windows Server VMs, joined to the SAME destination AD domain, with reliable DNS and correct time synchronization.

**EXPECT** SQL01 and SQL02 are separate VMs in the same intended domain, with working DNS and matching time settings.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: SQL01 and SQL02 are separate VMs in the same intended domain, with working DNS and matching time settings.

### Step 02: Plan their Azure placement

**WORKSPACE** SQL01 · Windows Server desktop

**DO** If deploying in Azure, plan two private SQL VMs. Use separate availability zones where supported; Microsoft recommends separate subnets for a multi-subnet SQL AG to avoid a load balancer for the listener.

**EXPECT** If using Azure, the saved zone/subnet design follows the selected SQL availability-group architecture rather than copied on-premises IP rules.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: If using Azure, the saved zone/subnet design follows the selected SQL availability-group architecture rather than copied on-premises IP rules.

### Step 03: Keep the SQL storage separate

**WORKSPACE** SQL01 · Windows Server desktop

**DO** Give each VM its own SQL instance and data storage. AG replicates databases; it is not a shared data disk. Check edition/version support (MECM site DB AG requires a supported SQL Enterprise edition).

**EXPECT** Each node has its own supported SQL instance and data storage; no shared disk was assumed for this availability-group design.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Each node has its own supported SQL instance and data storage; no shared disk was assumed for this availability-group design.

### Step 04: Check the private service paths

**WORKSPACE** SQL01 · Windows Server desktop

**DO** Ensure both VMs can reach the domain controllers and each other over approved ports. No public RDP, SMB, SQL port 1433 or cluster ports. Use private access/Bastion and least-privilege rules.

**EXPECT** Required domain and node connections work over private routes without public RDP, SMB, SQL or cluster access.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Required domain and node connections work over private routes without public RDP, SMB, SQL or cluster access.

### Step 05: Add Failover Clustering through the wizard

**WORKSPACE** SQL01 · Server Manager

**DO** On BOTH Windows SQL VMs: Server Manager > Manage > Add Roles and Features > Features > Failover Clustering > Add Features > Install.

**EXPECT** Both nodes report the required feature installed after the role wizard finishes.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Both nodes report the required feature installed after the role wizard finishes.

### Step 06: Use the PowerShell feature check

**WORKSPACE** SQL01 · Windows PowerShell as administrator

**DO** PowerShell alternative on both: run the command below in Windows PowerShell as Administrator.

**EXPECT** The feature-install command or its readback confirms the intended feature on both named nodes.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The feature-install command or its readback confirms the intended feature on both named nodes.

### Step 07: Read the cluster validation report

**WORKSPACE** SQL01 · Failover Cluster Manager

**DO** Run a cluster validation in Server Manager > Tools > Failover Cluster Manager > Check Configuration; supply SQL01 and SQL02. Review all failed tests, not just the pass count.

**EXPECT** The report names both intended nodes and all blocking failures are resolved before cluster creation.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The report names both intended nodes and all blocking failures are resolved before cluster creation.

### Step 08: Create the planned cluster

**WORKSPACE** SQL01 · Failover Cluster Manager

**DO** With the cluster setup checks and chosen Azure address plan verified, use Failover Cluster Manager > Create Cluster. Add SQL01 and SQL02 and name the cluster; follow the Azure SQL AG tutorial for valid multi-subnet cluster name/IP settings. Do NOT blindly copy on-prem cluster virtual IP instructions.

**EXPECT** The cluster wizard uses the recorded nodes and Azure-appropriate name/address design, with no guessed virtual IP.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The cluster wizard uses the recorded nodes and Azure-appropriate name/address design, with no guessed virtual IP.

### Step 09: Confirm both nodes are online

**WORKSPACE** SQL01 · Failover Cluster Manager

**DO** Check that Failover Cluster Manager shows BOTH nodes Online. Stop if you see cluster validation errors, AD/DNS name conflicts, or an unsupported network layout.

**EXPECT** Failover Cluster Manager shows both nodes Online; failed validation or name registration is resolved before proceeding.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Failover Cluster Manager shows both nodes Online; failed validation or name registration is resolved before proceeding.

HA-03 / AZURE PORTAL

# Create the witness storage account (no third VM)

Think of the storage account as a tiny locked ballot box in Azure. The cluster stores a small blob there so it can safely break ties. The name below is an EXAMPLE, not a guaranteed available storage account name.

[ ] Open https://portal.azure.com > check that you are in the intended tenant and subscription > search for Storage accounts > select + Create.

[ ] Basics: choose your LAB resource group and preferred Azure region. Enter a globally unique lowercase account name, for example labwitness12345 (your actual name will differ).

[ ] Choose Standard performance and General-purpose v2 / StorageV2. For replication choose LRS for a same-zone lab; consider ZRS for a cluster spread across availability zones, when available and appropriate to your design.

[ ] Review Advanced / Configuration: Require secure transfer = enabled, minimum TLS 1.2 or higher, and Allow storage account key access = enabled IF permitted by your organization, because this witness workflow needs account keys. If policy blocks shared keys, STOP and request an approved alternative or exemption; do not weaken a production policy.

[ ] Review Networking: BOTH SQL VMs must be able to reach the Blob service on outbound HTTPS TCP 443. Follow your environment’s approved public/private storage connectivity design; never expose the SQL servers publicly. Check network rules before disabling public access.

[ ] Select Review + create > Create. Wait for deployment success; open the new Storage account > Security + networking > Access keys > Show keys.

[ ] Copy the storage account NAME and one key into your temporary secure password manager for setup; do NOT paste it into a ticket, workbook, email, screenshot, script or Git repo.

[ ] Do not manually make a witness container. Windows Failover Clustering creates an msft-cloud-witness container/blob automatically after successful setup.

TEST NETWORK PATH FROM BOTH SQL VMs (commercial Azure example):

Test-NetConnection \<accountname>.blob.core.windows.net -Port 443
netsh winhttp show proxy

AZURE GOVERNMENT Storage endpoints differ (typically .core.usgovcloudapi.net). For the real DoD environment, verify the sovereign-cloud endpoint and approved network path before configuring a witness.

WHY THIS MATTERS The account persists after VM deallocation. The witness is inexpensive, but it is not free, and storage/network resources can continue accruing charges.

PASS CHECK \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

WHAT I SAW \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

IF IT FAILS Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** Azure portal / Storage account for cloud witness / approved subscription account; optional extension.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** Compare your recorded result with the named lesson saved result before marking verified.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Open the storage-account wizard

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Open https://portal.azure.com > check that you are in the intended tenant and subscription > search for Storage accounts > select + Create.

**EXPECT** The portal is in the intended subscription and the storage-account creation page is open.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The portal is in the intended subscription and the storage-account creation page is open.

### Step 02: Choose a unique witness account name

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Basics: choose your LAB resource group and preferred Azure region. Enter a globally unique lowercase account name, for example labwitness12345 (your actual name will differ).

**EXPECT** Basics shows your practice resource group, region and an available lowercase account name, not the literal placeholder.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Basics shows your practice resource group, region and an available lowercase account name, not the literal placeholder.

### Step 03: Choose account type and redundancy

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Choose Standard performance and General-purpose v2 / StorageV2. For replication choose LRS for a same-zone lab; consider ZRS for a cluster spread across availability zones, when available and appropriate to your design.

**EXPECT** Standard StorageV2 and the intended supported redundancy option are selected and recorded.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Standard StorageV2 and the intended supported redundancy option are selected and recorded.

### Step 04: Review the required security settings

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Review Advanced / Configuration: Require secure transfer = enabled, minimum TLS 1.2 or higher, and Allow storage account key access = enabled IF permitted by your organization, because this witness setup needs account keys. If policy blocks shared keys, STOP and request an approved alternative or exemption; do not weaken a production policy.

**EXPECT** Secure transfer, minimum TLS and the account-key access required by this design match the documented witness requirements.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Secure transfer, minimum TLS and the account-key access required by this design match the documented witness requirements.

### Step 05: Check HTTPS reachability

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Review Networking: BOTH SQL VMs must be able to reach the Blob service on outbound HTTPS TCP 443. Follow your environment’s approved public/private storage connectivity design; never expose the SQL servers publicly. Check network rules before disabling public access.

**EXPECT** Both cluster nodes can reach the required Blob service over the intended HTTPS path, without an unplanned public bypass.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Both cluster nodes can reach the required Blob service over the intended HTTPS path, without an unplanned public bypass.

### Step 06: Create the witness storage account

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Select Review + create > Create. Wait for deployment success; open the new Storage account > Security + networking > Access keys > Show keys.

**EXPECT** The deployment completes and the intended storage account’s settings page opens.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The deployment completes and the intended storage account’s settings page opens.

### Step 07: Store the key privately

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Copy the storage account NAME and one key into your temporary secure password manager for setup; do NOT paste it into a ticket, workbook, email, screenshot, script or Git repo.

**EXPECT** The account name and selected key are available only in your secure password manager, not in public screenshots or lab notes.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The account name and selected key are available only in your secure password manager, not in public screenshots or lab notes.

### Step 08: Let the cluster create its witness data

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Do not manually make a witness container. Windows Failover Clustering creates an msft-cloud-witness container/blob automatically after successful setup.

**EXPECT** You have not manually built a witness container; the cluster configuration step will create the required witness objects.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: You have not manually built a witness container; the cluster configuration step will create the required witness objects.

HA-04 / CLUSTER MANAGER

# Tell Windows: use my Azure cloud witness

Now that you already have SQL01 + SQL02 in a healthy Windows Failover Cluster AND the storage account exists, connect the witness. This step takes place on ONE cluster node, not inside SSMS.

[ ] Remote into SQL01 using your private management path. Open Server Manager > Tools > Failover Cluster Manager.

[ ] On the left, select the cluster you built (for example SQLCLUS01). On the right: Actions > More Actions > Configure Cluster Quorum Settings.

[ ] Click Next. Under Select Quorum Configuration Option, choose Select the quorum witness > Next.

[ ] Under Select Quorum Witness, choose Configure a cloud witness > Next.

[ ] Enter your Azure Storage account name and paste the key into the wizard. For a normal commercial Azure account leave the default endpoint; for Azure Government follow its supported endpoint guidance.

[ ] Click Next > review the confirmation > Next > Finish. Look under the cluster core resources for a Cloud Witness resource. It should report Online.

[ ] Run PowerShell as Administrator on SQL01 to confirm. These commands READ status; they do not change the cluster.

Import-Module FailoverClusters
Get-ClusterQuorum | Format-List *
Get-ClusterNode | Format-Table Name,State,NodeWeight,DynamicWeight
Get-ClusterResource | Where-Object Name -Like "*Witness*" | Format-Table Name,State,ResourceType

[ ] For your first lab, use the GUI. For reference, the matching PowerShell cmdlet is Set-ClusterQuorum, but it requires the secret account key as a string, so do NOT enter it into command history or scripts.

Set-ClusterQuorum -CloudWitness -AccountName \<StorageAccountName> -AccessKey \<StorageAccountAccessKey>

[ ] If you need to rotate storage keys later, update the cluster witness to the other valid key BEFORE regenerating the original one; follow Microsoft key-rotation instructions.

PASS CHECK Get-ClusterQuorum reports a cloud witness; Failover Cluster Manager shows the witness Online. BOTH SQL01 and SQL02 still show as cluster nodes.

IF IT FAILS Check TCP 443, Blob DNS, WinHTTP proxy, correct account name/key, storage key access policy, TLS, and the correct commercial/Gov endpoint. Never deactivate company-wide security policies to make a lab command work.

WRITE IT DOWN Witness resource name / status: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** One healthy Windows cluster node / Failover Cluster Manager / authorized cluster administrator.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** Compare your recorded result with the named lesson saved result before marking verified.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Open the cluster console

**WORKSPACE** SQL01 · Failover Cluster Manager

**DO** Remote into SQL01 using your private management path. Open Server Manager > Tools > Failover Cluster Manager.

**EXPECT** Failover Cluster Manager is open on the intended private SQL server and connected to your practice cluster.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Failover Cluster Manager is open on the intended private SQL server and connected to your practice cluster.

### Step 02: Start Configure Cluster Quorum

**WORKSPACE** SQL01 · Failover Cluster Manager

**DO** On the left, select the cluster you built (for example SQLCLUS01). On the right: Actions > More Actions > Configure Cluster Quorum Settings.

**EXPECT** The wizard is open for the correct cluster; no quorum setting changes just by opening it.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The wizard is open for the correct cluster; no quorum setting changes just by opening it.

### Step 03: Choose witness configuration

**WORKSPACE** SQL01 · Failover Cluster Manager

**DO** Click Next. Under Select Quorum Configuration Option, choose Select the quorum witness > Next.

**EXPECT** Select the quorum witness is selected in the wizard.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Select the quorum witness is selected in the wizard.

### Step 04: Choose Cloud Witness

**WORKSPACE** SQL01 · Failover Cluster Manager

**DO** Under Select Quorum Witness, choose Configure a cloud witness > Next.

**EXPECT** Configure a cloud witness is selected rather than a file-share or disk witness.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Configure a cloud witness is selected rather than a file-share or disk witness.

### Step 05: Enter the witness account privately

**WORKSPACE** SQL01 · Failover Cluster Manager

**DO** Enter your Azure Storage account name and paste the key into the wizard. For a normal commercial Azure account leave the default endpoint; for Azure Government follow its supported endpoint guidance.

**EXPECT** The account name, key and Azure endpoint match the intended storage account; the key is kept out of screenshots.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The account name, key and Azure endpoint match the intended storage account; the key is kept out of screenshots.

### Step 06: Finish and check the witness

**WORKSPACE** SQL01 · Failover Cluster Manager

**DO** Click Next > review the confirmation > Next > Finish. Look under the cluster core resources for a Cloud Witness resource. It should report Online.

**EXPECT** The wizard completes and Cloud Witness appears as an Online cluster resource.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The wizard completes and Cloud Witness appears as an Online cluster resource.

### Step 07: Read the quorum status

**WORKSPACE** SQL01 · Failover Cluster Manager

**DO** Run PowerShell as Administrator on SQL01 to confirm. These commands READ status; they do not change the cluster.

**EXPECT** The PowerShell readback identifies the intended cluster and witness state without changing quorum.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The PowerShell readback identifies the intended cluster and witness state without changing quorum.

### Step 08: Keep the GUI result as your first build

**WORKSPACE** SQL01 · Failover Cluster Manager

**DO** For your first lab, use the GUI. For reference, the matching PowerShell cmdlet is Set-ClusterQuorum, but it requires the secret account key as a string, so do NOT enter it into command history or scripts.

**EXPECT** Your notes match the finished GUI configuration; the reference cmdlet is not rerun with guessed parameters.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your notes match the finished GUI configuration; the reference cmdlet is not rerun with guessed parameters.

### Step 09: Plan safe key rotation

**WORKSPACE** SQL01 · Failover Cluster Manager

**DO** If you need to rotate storage keys later, update the cluster witness to the other valid key BEFORE regenerating the original one; follow Microsoft key-rotation instructions.

**EXPECT** Your plan updates the witness to another valid key before the old key is regenerated, then checks witness health.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your plan updates the witness to another valid key before the old key is regenerated, then checks witness health.

HA-05 / VERIFICATION + ROLLBACK

# Prove quorum safely, then protect your wallet

You have configured CLUSTER QUORUM. That does NOT mean your SQL database is replicated yet. To get true database failover, you must separately configure Always On AG, database FULL recovery, synchronization, listener/DNS, permissions and client retry behavior.

[ ] Before testing: verify both nodes Online, witness Online, backups valid, SQL AG replicas healthy, listener working, and a lab application can connect to the intended primary.

[ ] With change approval in a DISPOSABLE LAB, perform a planned AG failover using SSMS or the approved AG workflow. Do not just unplug the primary first. Watch for temporary client disconnect/reconnect.

[ ] Re-run a read/write query against your test database by connecting via AG listener, NOT by hard-coding the SQL01 node name. Verify the primary changed and data stayed consistent.

[ ] For quorum experiments, record what happens when the witness loses access versus when one node is unavailable. Only simulate a disruptive outage when you have a tested recovery plan.

[ ] If the witness is Offline unexpectedly, do NOT reset SQL IPs or delete the database. Confirm TCP 443 and storage access; review Failover Clustering events before making changes.

Get-ClusterQuorum
Get-ClusterNode | Format-Table Name,State
Get-ClusterLog -UseLocalTime -Destination C:\ClusterLogs

[ ] ROLLBACK (lab only): if planned failover does not work, return the AG primary to the last verified healthy node using supported procedures, correct the fault, and rerun validation. Do not casually roll back AD domain controllers or SQL nodes from independent VM snapshots.

[ ] COST: to stop Azure VM compute billing, stop/deallocate SQL01 and SQL02 from the Azure portal, and verify their states are Stopped (deallocated). This intentionally means your lab cluster is OFF and has no HA until restarted.

[ ] Check remaining costs for managed disks, storage account, any gateways, load balancers, public IPs, monitoring and backups. Azure budgets/alerts do NOT automatically shut resources down.

[ ] Before deleting the witness Storage account, confirm no running or preserved cluster still uses it. Delete test resources only when their dependencies and recovery files are documented.

| **QUESTION**                        | **QUICK ANSWER**                                                                                                   |
|-------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| Can 2 SQL nodes work?               | Yes, with a witness for resilient cluster quorum.                                                                  |
| Does witness replicate my database? | No. SQL Always On Availability Groups do that.                                                                     |
| Do I need 3 SQL VMs?                | No. A cloud witness is an Azure Storage resource, not SQL03.                                                       |
| If one node fails?                  | Remaining node and witness can retain quorum; SQL failover still requires a healthy synchronized AG configuration. |
| If both SQL VMs are deallocated?    | The lab is stopped; there is no working SQL service.                                                               |

INTERVIEW ANSWER “For two SQL Server Azure VMs, I would validate and configure WSFC, use a standard Azure Storage cloud witness for quorum, and separately configure a supported SQL Always On Availability Group and listener. Then I would test planned failover, app connectivity, backups and monitoring.”

SEE OFFICIAL REFERENCES PAGE for current Microsoft WSFC, SQL AG, and MECM support guidance.

PASS CHECK \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

WHAT I SAW \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

IF IT FAILS Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** Approved SQL lab cluster / Failover Cluster Manager and application checks / authorized cluster administrator.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** Compare your recorded result with the named lesson saved result before marking verified.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Check the starting health

**WORKSPACE** SQL01 · Windows Server desktop

**DO** Before testing: verify both nodes Online, witness Online, backups valid, SQL AG replicas healthy, listener working, and a lab application can connect to the intended primary.

**EXPECT** Both nodes, the witness, backups, database replicas and listener checks pass before a controlled failover starts.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Both nodes, the witness, backups, database replicas and listener checks pass before a controlled failover starts.

### Step 02: Perform the supported planned failover

**WORKSPACE** SQL01 · SQL Server Management Studio

**DO** With change approval in a DISPOSABLE LAB, perform a planned AG failover using SSMS or the approved AG workflow. Do not just unplug the primary first. Watch for temporary client disconnect/reconnect.

**EXPECT** The supported workflow completes and the intended healthy synchronized replica becomes primary; no forced data-loss step was used.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The supported workflow completes and the intended healthy synchronized replica becomes primary; no forced data-loss step was used.

### Step 03: Test through the listener

**WORKSPACE** SQL01 · Windows PowerShell as administrator

**DO** Re-run a read/write query against your test database by connecting via AG listener, NOT by hard-coding the SQL01 node name. Verify the primary changed and data stayed consistent.

**EXPECT** A fresh connection through the availability-group listener reads and writes the fake test database as expected.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: A fresh connection through the availability-group listener reads and writes the fake test database as expected.

### Step 04: Record the quorum experiment

**WORKSPACE** SQL01 · Windows Server desktop

**DO** For quorum experiments, record what happens when the witness loses access versus when one node is unavailable. Only simulate a disruptive outage when you have a tested recovery plan.

**EXPECT** Your notes describe the controlled failure, real cluster response and recovery, including why the result occurred.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your notes describe the controlled failure, real cluster response and recovery, including why the result occurred.

### Step 05: Diagnose an offline witness

**WORKSPACE** SQL01 · Windows Server desktop

**DO** If the witness is Offline unexpectedly, do NOT reset SQL IPs or delete the database. Confirm TCP 443 and storage access; review Failover Clustering events before making changes.

**EXPECT** The recorded HTTPS/account-key checks identify the witness problem; SQL IPs and databases were not reset as a guess.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The recorded HTTPS/account-key checks identify the witness problem; SQL IPs and databases were not reset as a guess.

### Step 06: Restore the known-good service

**WORKSPACE** SQL01 · Windows PowerShell as administrator

**DO** ROLLBACK (lab only): if planned failover does not work, return the AG primary to the last verified healthy node using supported procedures, correct the fault, and rerun validation. Do not casually roll back AD domain controllers or SQL nodes from independent VM snapshots.

**EXPECT** The last verified healthy primary, listener and application checks work again using the supported recovery procedure.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The last verified healthy primary, listener and application checks work again using the supported recovery procedure.

### Step 07: Stop cloud compute when pausing

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** COST: to stop Azure VM compute billing, stop/deallocate SQL01 and SQL02 from the Azure portal, and verify their states are Stopped (deallocated). This intentionally means your lab cluster is OFF and has no HA until restarted.

**EXPECT** The intended Azure SQL VMs report Stopped (deallocated) after the practice session.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The intended Azure SQL VMs report Stopped (deallocated) after the practice session.

### Step 08: Check the resources still billing

**WORKSPACE** SQL01 · Windows Server desktop

**DO** Check remaining costs for managed disks, storage account, any gateways, load balancers, public IPs, monitoring and backups. Azure budgets/alerts do NOT automatically shut resources down.

**EXPECT** Your notes list the disks, storage, network, monitoring and backup items that remain and their purpose.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your notes list the disks, storage, network, monitoring and backup items that remain and their purpose.

### Step 09: Remove only an unused witness

**WORKSPACE** SQL01 · Windows Server desktop

**DO** Before deleting the witness Storage account, confirm no running or preserved cluster still uses it. Delete test resources only when their required connections and services and recovery files are documented.

**EXPECT** No retained cluster depends on the witness account before any confirmed test resources are deleted.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: No retained cluster depends on the witness account before any confirmed test resources are deleted.

FIELD-01 / QUESTIONS ON DAY ONE

# Joining a migration mid-project: ten questions to ask

No engineer should start changing resources until they know what is done, what is blocked, and where the source of truth lives.

[ ] Which agency is moving, which Azure tenant/subscription/cloud is the approved target, and what is the target boundary?

[ ] What is the migration wave plan and current phase? Can I review discovery/assessment reports?

[ ] What is the source hypervisor (vSphere/Hyper-V/physical), Windows/SQL/ConfigMgr version, server inventory and owner?

[ ] Are we extending their AD forest or joining a completely NEW enterprise domain? Who owns identity and DNS?

[ ] Which app maps to which SQL database, logins and service accounts? Are there external dependencies?

[ ] Where are runbooks, change tickets, diagrams, GPO exports, maintenance windows and rollback plans?

[ ] What tools are approved for migration, backup, monitoring, and infrastructure as code?

[ ] Has each Azure VNet/subnet, NSG, route table, private DNS, logging and least-privilege role been approved?

[ ] How are CM clients, SUP/WSUS, distribution points, content and site databases handled; same site or new hierarchy?

[ ] Who signs off on application acceptance, STIG/NIST compliance, evidence and decommissioning?

INTERVIEW EXAMPLE: "I would ask for the dependency map and the wave plan first. I would validate identity, DNS and private connectivity, then pilot a noncritical workload. For SQL, I would verify a .bak restore plus server-level settings. For Configuration Manager, I would verify whether the site is being recovered/moved or migrated into a new hierarchy. I would not cut over without app testing, backups, approvals and rollback."

**PASS CHECK** You can give a 60-second summary of the above in your own words.

**WRITE IT DOWN** Server or resource: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Result: PASS / FAIL Date: \_\_\_\_\_\_\_\_\_\_

**IF IT FAILS** Error / screenshot: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Fix tried: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

NEW / OFFICIAL REFERENCES / LOOK IT UP BEFORE YOU CLICK

# Microsoft documentation used for the expanded lessons

Links below are for technical verification. Product screens and version prerequisites may change; always use current documentation and validate changes in a disposable lab.

Configuration Manager - Setup Wizard - https://learn.microsoft.com/en-us/intune/configmgr/core/servers/deploy/install/use-the-setup-wizard-to-install-sites

Configuration Manager - New primary site - https://learn.microsoft.com/en-us/intune/configmgr/core/servers/deploy/install/setup-wizard-central-primary

Configuration Manager - Site database requirements - https://learn.microsoft.com/en-us/intune/configmgr/core/plan-design/hierarchy/plan-for-the-site-database

Configuration Manager - SQL versions (2025 support from version 2603) - https://learn.microsoft.com/en-us/intune/configmgr/core/plan-design/configs/support-for-sql-server-versions

Configuration Manager - SQL required collation - https://learn.microsoft.com/en-us/intune/configmgr/core/plan-design/configs/supported-configurations-for-sql-server

Configuration Manager - Setup accounts - https://learn.microsoft.com/en-us/mem/configmgr/core/plan-design/hierarchy/accounts

Configuration Manager - ADK support matrix - https://learn.microsoft.com/en-us/intune/configmgr/core/plan-design/configs/support-for-windows-adk

Configuration Manager - Software update point - https://learn.microsoft.com/en-us/mem/configmgr/sum/get-started/install-a-software-update-point

Configuration Manager - Back up the site - https://learn.microsoft.com/en-us/intune/configmgr/core/servers/manage/backup-and-recovery

Configuration Manager - Site recovery caveats - https://learn.microsoft.com/en-us/intune/configmgr/core/servers/manage/recover-sites

Configuration Manager - Hierarchy migration - https://learn.microsoft.com/en-us/intune/configmgr/core/migration/migrate-data-between-hierarchies

SQL Server to Azure VM migration guide - https://learn.microsoft.com/en-us/data-migration/sql-server/virtual-machines/guide

Azure Migrate vSphere support - https://learn.microsoft.com/en-us/azure/migrate/migrate-support-matrix-vmware-migration

Windows Failover Clustering - Deploy a quorum witness - https://learn.microsoft.com/en-us/windows-server/failover-clustering/deploy-quorum-witness

SQL Server Azure VMs - Multi-subnet AG tutorial - https://learn.microsoft.com/en-us/azure/azure-sql/virtual-machines/windows/availability-group-manually-configure-tutorial-multi-subnet

Configuration Manager - Availability Group site database - https://learn.microsoft.com/en-us/intune/configmgr/core/servers/deploy/configure/configure-aoag

LAB END - Remember: fake users and data only; no public RDP, SQL, LDAP or MECM management ports; review Azure charges every session.

## Guided walkthrough

**WHERE** Project handoff worksheet / read-only interview with the authorized project owner.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** You can give a 60-second summary of the above in your own words.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Identify the project owner

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Which agency is moving, which Azure tenant/subscription/cloud is the approved target, and what is the target boundary?

**EXPECT** Your handover notes name the moving organization, destination subscription/tenant and person responsible for the boundary.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your handover notes name the moving organization, destination subscription/tenant and person responsible for the boundary.

### Step 02: Find the active migration phase

**WORKSPACE** Your Windows host · lab notes and browser

**DO** What is the migration wave plan and current phase? Can I review discovery/assessment reports?

**EXPECT** Your notes identify the current wave, completed work, blockers and the assessment reports to review.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your notes identify the current wave, completed work, blockers and the assessment reports to review.

### Step 03: Find the source inventory

**WORKSPACE** Your Windows host · lab notes and browser

**DO** What is the source hypervisor (vSphere/Hyper-V/physical), Windows/SQL/ConfigMgr version, server inventory and owner?

**EXPECT** Your notes link to the actual source platform, software versions, server list and responsible owners.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your notes link to the actual source platform, software versions, server list and responsible owners.

### Step 04: Identify the identity and DNS owners

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Are we extending their AD forest or joining a completely NEW enterprise domain? Who owns identity and DNS?

**EXPECT** The plan clearly says extend an existing forest or use a separate destination, with owners for each DNS environment.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The plan clearly says extend an existing forest or use a separate destination, with owners for each DNS environment.

### Step 05: Map application connections

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Which app maps to which SQL database, logins and service accounts? Are there external required connections and services?

**EXPECT** The application-to-database, login, service-account and external-service relationships are recorded.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The application-to-database, login, service-account and external-service relationships are recorded.

### Step 06: Find the change and recovery instructions

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Where are runbooks, change tickets, diagrams, GPO exports, maintenance windows and rollback plans?

**EXPECT** You know where the diagrams, policy exports, maintenance window and rollback instructions are kept.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: You know where the diagrams, policy exports, maintenance window and rollback instructions are kept.

### Step 07: Confirm the allowed tools

**WORKSPACE** Your Windows host · lab notes and browser

**DO** What tools are approved for migration, backup, monitoring, and infrastructure as code?

**EXPECT** Your notes list the migration, backup, monitoring and automation tools the project actually uses.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your notes list the migration, backup, monitoring and automation tools the project actually uses.

### Step 08: Review the cloud network decisions

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Has each Azure VNet/subnet, NSG, route table, private DNS, logging and least-privilege role been approved?

**EXPECT** The documented address ranges, rules, private DNS, logs and access roles have named reviewers before a deployment.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The documented address ranges, rules, private DNS, logs and access roles have named reviewers before a deployment.

### Step 09: Understand the management-platform move

**WORKSPACE** Your Windows host · lab notes and browser

**DO** How are CM clients, SUP/WSUS, distribution points, content and site databases handled; same site or new hierarchy?

**EXPECT** Your notes distinguish the site, clients, update services, distribution points, content and database migration work.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your notes distinguish the site, clients, update services, distribution points, content and database migration work.

### Step 10: Find acceptance and retirement owners

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Who signs off on application acceptance, STIG/NIST compliance, saved result and decommissioning?

**EXPECT** The people who approve app tests, required security checks, saved results and old-system retirement are named.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The people who approve app tests, required security checks, saved results and old-system retirement are named.

LAB 14 / CLOUD PORTAL

# Azure: create a safe destination plan

Now map the same ideas into the Azure subscription you already own. Do not treat Azure Public DNS as your AD server.

**[ ]** Open https://portal.azure.com. Confirm the correct directory and subscription at the top of the portal.

**[ ]** Search for Cost Management + Billing or open Subscriptions > choose your subscription > Cost Management > Budgets.

**[ ]** Create a monthly budget aligned to your own limit, and configure email alerts (for example 50%, 80%, 100%). IMPORTANT: alerts do not shut down resources.

**[ ]** Search for Resource groups > Create. Use a name such as rg-ad-migration-lab, choose an available region, and create.

**[ ]** Search for Virtual networks > Create. Resource group: rg-ad-migration-lab. Name: vnet-ad-migration-lab.

**[ ]** Use address space 10.90.0.0/16 and one subnet named snet-identity, 10.90.1.0/24. Confirm the address range does not overlap your on-premises/home/VPN networks.

**[ ]** Save and review the VNet. Write down which location and subnet you selected.

**[ ]** Search for Azure DNS zones. Read what a public DNS zone does. Do not create a public lab.example.test zone: example.test is a fictional private training name. Keep AD service records and private server IPs in the lab DNS only.

**PASS CHECK** Budget alert exists; resource group and VNet exist; no domain controller has a public-facing DNS record.

WHY THIS MATTERS

The Azure tenant holds subscriptions/resources. An AD DS forest is a DIFFERENT identity system hosted on Windows Server. A public DNS zone is for names that the internet can query, not for making a private AD DS domain.

IF IT DOES NOT WORK

If your subscription does not allow the chosen region or VM family, select another permitted region/SKU or stop and inspect policy/quota restrictions. Do not remove guardrails just to force a lab deployment.

**Subscription / region / monthly budget** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** Physical host browser / Azure portal / approved subscription account with budget and resource permissions.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** Budget alert exists; resource group and VNet exist; no domain controller has a public-facing DNS record.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Check your Azure subscription

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Open https://portal.azure.com. Confirm the correct directory and subscription at the top of the portal.

**EXPECT** The portal shows your intended tenant and subscription.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The portal shows your intended tenant and subscription.

### Step 02: Open Budgets

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Search for Cost Management + Billing or open Subscriptions > choose your subscription > Cost Management > Budgets.

**EXPECT** The Budgets page is open for that subscription.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The Budgets page is open for that subscription.

### Step 03: Add spending alerts

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Create a monthly budget aligned to your own limit, and configure email alerts (for example 50%, 80%, 100%). IMPORTANT: alerts do not shut down resources.

**EXPECT** The budget lists your amount and alert recipients; it is an alert, not a spending cap.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The budget lists your amount and alert recipients; it is an alert, not a spending cap.

### Step 04: Create the practice resource group

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Search for Resource groups > Create. Use a name such as rg-ad-migration-lab, choose an available region, and create.

**EXPECT** The practice resource group appears in the selected region.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The practice resource group appears in the selected region.

### Step 05: Start the private virtual network

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Search for Virtual networks > Create. Resource group: rg-ad-migration-lab. Name: vnet-ad-migration-lab.

**EXPECT** The virtual network wizard uses the practice resource group.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The virtual network wizard uses the practice resource group.

### Step 06: Set non-overlapping address ranges

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Use address space 10.90.0.0/16 and one subnet named snet-identity, 10.90.1.0/24. Confirm the address range does not overlap your on-premises/home/VPN networks.

**EXPECT** The VNet and subnet address fields match the saved, non-overlapping plan.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The VNet and subnet address fields match the saved, non-overlapping plan.

### Step 07: Save the network and record it

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Save and review the VNet. Write down which location and subnet you selected.

**EXPECT** The completed VNet shows the planned subnet and region.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The completed VNet shows the planned subnet and region.

### Step 08: Keep practice AD DNS private

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Search for Azure DNS zones. Read what a public DNS zone does. Do not create a public lab.example.test zone: example.test is a fictional private training name. Keep AD service records and private server IPs in the lab DNS only.

**EXPECT** No public DNS zone or public AD service record was created for the fictional practice domain.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: No public DNS zone or public AD service record was created for the fictional practice domain.

LAB 15 / CLOUD VM + AD DS

# Azure: create AZ-DC01 carefully

This is your optional cloud destination forest: azure.lab.example.test. It is not the same forest as local migrate.lab.example.test.

**[ ]** Azure portal > Virtual machines > Create > Azure virtual machine. Select rg-ad-migration-lab, an allowed region, and name AZ-DC01.

**[ ]** Image: supported Windows Server Datacenter marketplace image, with Desktop Experience if available. Select the smallest practical supported VM size you can afford after reviewing pricing.

**[ ]** Choose a system disk that fits the operating system and budget. Select vnet-ad-migration-lab and snet-identity.

**[ ]** Set Public inbound ports = None. Do not assign a public IP unless you have a specifically approved secure access design.

**[ ]** Create the VM. Use your approved private administration method (for example, an already-established private VPN) to connect; a public RDP rule is NOT a shortcut for this exercise.

**[ ]** Azure portal > Virtual machines > AZ-DC01 > Networking > Network interface > IP configurations. Make the private address static within snet-identity using a permitted unused IP; for example 10.90.1.10.

**[ ]** Inside the Azure Windows VM, leave IP addressing and DNS adapter settings automatic. Azure manages NIC settings. After promotion, configure the Azure VNet custom DNS server to use this DC’s Azure private IP (next step).

**[ ]** Install AD DS with Server Manager > Add Roles and Features and promote as Add a new forest > azure.lab.example.test. Enable DNS and reboot.

**[ ]** Azure portal > Virtual networks > vnet-ad-migration-lab > DNS servers > Custom. Add AZ-DC01 private IP and Save. Existing VMs may need DHCP lease refresh or reboot to use new DNS settings.

**[ ]** From a VM inside the connected VNet, resolve AD SRV records and confirm AZ-DC01 responds. Keep all AD DNS zones private.

> Get-ADDomain | Select-Object DNSRoot
> ipconfig /all
> nslookup -type=SRV \_ldap.\_tcp.dc.\_msdcs.azure.lab.example.test 10.90.1.10

**PASS CHECK** New cloud AD domain exists, resolves PRIVATELY, and its VM has no direct public RDP/AD exposure.

WHY THIS MATTERS

You did not “point lab.example.test at a server” and magically get AD. You built a Windows Server, configured private networking, installed AD DS, and created a new forest that happens to use a subdomain of the name you own.

IF IT DOES NOT WORK

If connecting to AZ-DC01 requires a paid secure-access service you have not budgeted for, STOP. Finish the local domain migration path first; the Azure VM is not a prerequisite for it.

**AZ-DC01 private IP / image / machine size** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** Azure portal, then AZ-DC01 guest / licensed Server 2019 Marketplace image / VM administrator for a separate forest.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** New cloud AD domain exists, resolves PRIVATELY, and its VM has no direct public RDP/AD exposure.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Start the Azure VM wizard

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Azure portal > Virtual machines > Create > Azure virtual machine. Select rg-ad-migration-lab, an allowed region, and name AZ-DC01.

**EXPECT** The Azure VM wizard names AZ-DC01 in the intended lab resource group and region.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The Azure VM wizard names AZ-DC01 in the intended lab resource group and region.

### Step 02: Choose the supported Windows image

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Image: supported Windows Server Datacenter marketplace image, with Desktop Experience if available. Select the smallest practical supported VM size you can afford after reviewing pricing.

**EXPECT** The selected Windows Server image and VM size meet the recorded lab requirements and estimated budget.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The selected Windows Server image and VM size meet the recorded lab requirements and estimated budget.

### Step 03: Choose its disk and private subnet

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Choose a system disk that fits the operating system and budget. Select vnet-ad-migration-lab and snet-identity.

**EXPECT** The disk, VNet and snet-identity selections match your saved plan.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The disk, VNet and snet-identity selections match your saved plan.

### Step 04: Keep public inbound access closed

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Set Public inbound ports = None. Do not assign a public IP unless you have a specifically approved secure access design.

**EXPECT** The VM has no unplanned public IP or public inbound RDP rule.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The VM has no unplanned public IP or public inbound RDP rule.

### Step 05: Review cost and create the VM

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Create the VM. Use your approved private administration method (for example, an already-established private VPN) to connect; a public RDP rule is NOT a shortcut for this exercise.

**EXPECT** The deployment succeeds and your previously tested private management method reaches AZ-DC01.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The deployment succeeds and your previously tested private management method reaches AZ-DC01.

### Step 06: Make its Azure private address static

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Azure portal > Virtual machines > AZ-DC01 > Networking > Network interface > IP configurations. Make the private address static within snet-identity using a permitted unused IP; for example 10.90.1.10.

**EXPECT** The Azure NIC reports the planned static private address, such as 10.90.1.10; the guest adapter itself is not manually hard-coded.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The Azure NIC reports the planned static private address, such as 10.90.1.10; the guest adapter itself is not manually hard-coded.

### Step 07: Keep the guest adapter managed by Azure

**WORKSPACE** AZ-DC01 · Azure Windows Network Connections

**DO** Inside the Azure Windows VM, leave IP addressing and DNS adapter settings automatic. Azure manages NIC settings. After promotion, configure the Azure VNet custom DNS server to use this DC’s Azure private IP (next step).

**EXPECT** Inside Windows, the NIC still obtains its Azure-managed address and DNS settings automatically.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Inside Windows, the NIC still obtains its Azure-managed address and DNS settings automatically.

### Step 08: Create the separate practice AD domain

**WORKSPACE** AZ-DC01 · Azure Windows Server · Server Manager

**DO** Install AD DS with Server Manager > Add Roles and Features and promote as Add a new forest > azure.lab.example.test. Enable DNS and reboot.

**EXPECT** After promotion and restart, AZ-DC01 reports the separate azure.lab.example.test forest with DNS available.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: After promotion and restart, AZ-DC01 reports the separate azure.lab.example.test forest with DNS available.

### Step 09: Point the VNet at its private DNS

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** Azure portal > Virtual networks > vnet-ad-migration-lab > DNS servers > Custom. Add AZ-DC01 private IP and Save. Existing VMs may need DHCP lease refresh or reboot to use new DNS settings.

**EXPECT** The VNet DNS settings list AZ-DC01’s private address, and clients have refreshed their network settings as required.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The VNet DNS settings list AZ-DC01’s private address, and clients have refreshed their network settings as required.

### Step 10: Check AD DNS inside the VNet

**WORKSPACE** AZ-DC01 · Azure Windows PowerShell as administrator

**DO** From a VM inside the connected VNet, resolve AD SRV records and confirm AZ-DC01 responds. Keep all AD DNS zones private.

**EXPECT** The private AD service records resolve correctly in the VNet; public AD records were not created.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The private AD service records resolve correctly in the VNet; public AD records were not created.

### Step 11: Read the Azure domain checks

**WORKSPACE** AZ-DC01 · Azure Windows PowerShell as administrator

**DO** Use the named shell and machine above. Read each command against the full lesson reference; run these lines only after completing the preceding actions.

**EXPECT** New cloud AD domain exists, resolves PRIVATELY, and its VM has no direct public RDP/AD exposure.

**IF STUCK** Read the actual error. SQL statements belong in SSMS New Query, Windows commands in the named guest PowerShell, and Azure commands in the stated administration context.

**EVIDENCE** Capture new cloud AD domain exists, resolves PRIVATELY, and its VM has no direct public RDP/AD exposure. Record the target computer and date.

**COMMAND**
> Get-ADDomain | Select-Object DNSRoot
> ipconfig /all
> nslookup -type=SRV _ldap._tcp.dc._msdcs.azure.lab.example.test 10.90.1.10

LAB 16 / VPN / DNS / SECURITY

# Azure: the networking gate comes FIRST

To actually move an on-premises server into an Azure-hosted domain, the two networks must communicate privately.

THIS IS NOT JUST ONE PORTAL SWITCH

A typical site-to-site connection requires an Azure VPN gateway, an on-premises compatible VPN endpoint with appropriate public reachability, routing, and nonoverlapping subnets. Host-only VMnet2 by itself cannot reach Azure. A later private-connectivity extension needs a separately planned router/VPN appliance connected to VMnet2 and an approved uplink; its routing and cost must be reviewed first. Do not assume the two-DC isolation lab supplies that appliance. A home ISP using carrier-grade NAT may complicate site-to-site connectivity. Azure VPN Gateway can cost money even when idle.

**[ ]** Write down your SOURCE subnet (10.50.0.0/24), DESTINATION VNet subnet (10.90.1.0/24), and expected routing through the VPN device.

**[ ]** Check whether you actually have a compatible on-premises VPN endpoint/router, control of firewall/NAT, and permission to use it.

**[ ]** Review Microsoft’s Site-to-site VPN Gateway docs, gateway sizing, and current pricing BEFORE creating a VPN gateway.

**[ ]** If your network setup supports it, in Azure create a GatewaySubnet, Virtual network gateway, Local network gateway (your real VPN public endpoint and internal prefixes), then the IPsec/IKE connection. Configure the peer VPN device using matching values.

**[ ]** Verify routes both ways, permitted AD ports inside the tunnel, and DNS conditional forwarding from lab.example.test to azure.lab.example.test and vice versa as required.

**[ ]** Run nslookup for the AD SRV record across the private path and Test-NetConnection to approved destination ports. Do not publish AD ports in an Azure NSG to the internet.

**[ ]** Do not attempt an actual cross-cloud domain join until the private connectivity and DNS tests both pass.

> nslookup -type=SRV \_ldap.\_tcp.dc.\_msdcs.azure.lab.example.test \<AGENCY-DNS-IP>
> Test-NetConnection \<AZ-DC01-PRIVATE-IP> -Port 53

**PASS CHECK** VPN path and DNS tests pass OR you explicitly record “Azure cutover deferred, local course complete.”

WHY THIS MATTERS

A VNet is only a private network inside Azure. Your home Workstation VMs do not automatically become part of that VNet. DNS is necessary but cannot replace routing and a secure network path.

IF IT DOES NOT WORK

If a DNS response shows the wrong IP, inspect the DNS server the client uses, conditional forwarders, and connectivity. Ping alone is not enough to verify DNS or Active Directory readiness.

**VPN approach / projected monthly gateway cost** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** Physical host, on-prem guests, and Azure networking / approved private connectivity owner; do not run tenant commands in the wrong guest.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** VPN path and DNS tests pass OR you explicitly record “Azure cutover deferred, local course complete.”

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Write both network ranges

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Write down your SOURCE subnet (10.50.0.0/24), DESTINATION VNet subnet (10.90.1.0/24), and expected routing through the VPN device.

**EXPECT** Your notes list both private address ranges and the intended path through the VPN equipment.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your notes list both private address ranges and the intended path through the VPN equipment.

### Step 02: Check your VPN equipment and permission

**WORKSPACE** Your Windows host · lab notes and VPN equipment inventory

**DO** Check whether you actually have a compatible on-premises VPN endpoint/router, control of firewall/NAT, and permission to use it.

**EXPECT** The specific compatible VPN device, its administrator and permission to configure it are identified; otherwise this build is paused.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The specific compatible VPN device, its administrator and permission to configure it are identified; otherwise this build is paused.

### Step 03: Price the VPN before creating it

**WORKSPACE** Your Windows host · browser for the Azure VPN pricing guide

**DO** Review Microsoft’s Site-to-site VPN Gateway docs, gateway sizing, and current pricing BEFORE creating a VPN gateway.

**EXPECT** Your estimate includes gateway size, running time and related network charges before any paid deployment.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your estimate includes gateway size, running time and related network charges before any paid deployment.

### Step 04: Plan the matching VPN connection

**WORKSPACE** Your Windows host · Azure portal and your documented VPN device management interface

**DO** If your network setup supports it, in Azure create a GatewaySubnet, Virtual network gateway, Local network gateway (your real VPN public endpoint and internal prefixes), then the IPsec/IKE connection. Configure the peer VPN device using matching values.

**EXPECT** If the prerequisites are satisfied, both VPN peers use the matching documented settings and the intended private ranges.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: If the prerequisites are satisfied, both VPN peers use the matching documented settings and the intended private ranges.

### Step 05: Check private routes and DNS

**WORKSPACE** DC01 and AZ-DC01 · Windows PowerShell for private route and DNS tests

**DO** Verify routes both ways, permitted AD ports inside the tunnel, and DNS conditional forwarding from lab.example.test to azure.lab.example.test and vice versa as required.

**EXPECT** Both private routes and the required conditional DNS lookups have been checked from the appropriate side.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Both private routes and the required conditional DNS lookups have been checked from the appropriate side.

### Step 06: Test the required private services

**WORKSPACE** DC01 · Windows PowerShell as administrator

**DO** Run nslookup for the AD SRV record across the private path and Test-NetConnection to approved destination ports. Do not publish AD ports in an Azure NSG to the internet.

**EXPECT** The saved DNS and TCP checks show the required private service path, without public AD port exposure.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: The saved DNS and TCP checks show the required private service path, without public AD port exposure.

### Step 07: Stop if the connection tests fail

**WORKSPACE** Your Windows host · lab notes and pass/fail checklist

**DO** Do not attempt an actual cross-cloud domain join until the private connectivity and DNS tests both pass.

**EXPECT** You proceed only after both private connectivity and DNS checks pass, or record the missing prerequisite and stop.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: You proceed only after both private connectivity and DNS checks pass, or record the missing prerequisite and stop.

### Step 08: Record the private lookup results

**WORKSPACE** DC01 · Windows PowerShell as administrator

**DO** Use the named shell and machine above. Read each command against the full lesson reference; run these lines only after completing the preceding actions.

**EXPECT** VPN path and DNS tests pass OR you explicitly record “Azure cutover deferred, local course complete.”

**IF STUCK** Read the actual error. SQL statements belong in SSMS New Query, Windows commands in the named guest PowerShell, and Azure commands in the stated administration context.

**EVIDENCE** Capture vPN path and DNS tests pass OR you explicitly record “Azure cutover deferred, local course complete.” Record the target computer and date.

**COMMAND**
> nslookup -type=SRV _ldap._tcp.dc._msdcs.azure.lab.example.test \<AGENCY-DNS-IP>
> Test-NetConnection \<AZ-DC01-PRIVATE-IP> -Port 53

LAB 17 / OPTIONAL CAPSTONE

# Azure: run a real migration wave

Only after the networking gate passes: do one member server at a time. Do not try to migrate the old agency domain controllers.

**[ ]** Take a backup/snapshot of source APP01 and export a simple application inventory: hostname, IP, disk sizes, IIS page, service accounts, URL, DNS, and current domain.

**[ ]** Decide whether this workload requires VM rehosting (actual disk/OS move) or whether you can redeploy a clean Azure VM and copy application data/configuration.

**[ ]** For VMware Workstation Pro, do NOT assume Azure Migrate vCenter agentless discovery works: that workflow expects vCenter-managed vSphere VMs.

**[ ]** Read the current Microsoft documentation for agent-based/physical-server-style migration and confirm whether your exact Workstation-based source and Windows edition are supported before selecting it.

**[ ]** For a low-cost alternate hands-on: create a clean Azure APP02 VM with no public inbound ports, install IIS, securely transfer your simple test site through the VPN, and join APP02 to azure.lab.example.test.

**[ ]** Validate APP02 DNS/domain membership, local test page, required authentication, GPO application, patching, and monitoring. Only then think about switching real clients to APP02.

**[ ]** Record when you would change DNS/service endpoints for actual users, how you would freeze writes, how you would validate, and when you would invoke rollback.

**[ ]** Delete the Azure resource group when the exercise is complete and you no longer need its resources. Confirm billing/cost analysis afterward.

**PASS CHECK** You can clearly explain the difference among VM rehosting, application rebuild, and AD domain migration.

WHY THIS MATTERS

Migrating an operating system disk is different from joining a domain. Rebuilding a simple IIS app in Azure may be a better introductory exercise than replicating a whole VMware Workstation VM.

IF IT DOES NOT WORK

Never assume Azure Migrate is free end-to-end or that Workstation equals vSphere. Validate the support matrix and costs for your chosen migration mechanism.

**Selected migration method / reason** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** APP01 Server 2019 Workstation guest, Azure portal, then APP02 Server 2019 Azure member VM / authorized source, transfer, and destination administrators.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** APP02 is still Server 2019, serves the migrated test IIS workload over the approved private path, and its file hash/client checks match APP01 before the separate AZ-03 upgrade.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Choose the workload-migration route

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Use the application/data route: APP01 runs Server 2019 in Workstation Pro; APP02 will be a NEW Server 2019 Azure member VM. You will copy the test IIS workload, not claim to have moved the original OS disk.

**EXPECT** Your change note says workload migration, source APP01, destination APP02.

**IF STUCK** If your requirement is to rehost the entire VM, stop here and use AZ-02 to check a supported replication/import route; Workstation is not vCenter.

**EVIDENCE** Capture your change note says workload migration, source APP01, destination APP02. Record the target computer and date.

### Step 02: Prove the source before copying

**WORKSPACE** APP01 · Windows PowerShell as administrator

**DO** On APP01 confirm the OS, IIS service, test page, domain, IP, and index.html hash. Back up site content and export IIS configuration to your private lab backup folder.

**EXPECT** The starting point identifies Server 2019 and a working test site.

**IF STUCK** A VM screenshot or successful file copy is not proof that the application works. Fix the source before migrating.

**EVIDENCE** Capture the starting point identifies Server 2019 and a working test site. Record the target computer and date.

**COMMAND**
> Get-ComputerInfo | Select-Object WindowsProductName
> Get-Service W3SVC
> Get-FileHash C:\inetpub\wwwroot\index.html -Algorithm SHA256
> & "$env:windir\system32\inetsrv\appcmd.exe" add backup SONIC-BeforeMigration

### Step 03: Create the Azure member-server target

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** In Azure portal search Virtual machines > Create > Azure virtual machine. Choose the practice lab resource group/region, name APP02, and explicitly select a Windows Server 2019 Datacenter Marketplace image. Do not choose Server 2022 yet.

**EXPECT** The review page identifies APP02 and a 2019 image.

**IF STUCK** If your subscription/region has no suitable 2019 image or quota, stop and resolve that choice; selecting 2022 skips the requested upgrade exercise.

**EVIDENCE** Capture the review page identifies APP02 and a 2019 image. Record the target computer and date.

### Step 04: Keep administration private

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** On Networking choose the planned VNet/subnet and Public inbound ports None; use no direct public IP for this private route. Review the full cost including your approved private access service before Create.

**EXPECT** APP02 is created without a public inbound RDP rule.

**IF STUCK** The isolated host-only VMnet2 is not a VPN and has no Azure route. Do not click Create until LAB 16 proves the approved private route; do not open 3389 to the internet.

**EVIDENCE** Capture aPP02 is created without a public inbound RDP rule. Record the target computer and date.

### Step 05: Connect and establish the 2019 baseline

**WORKSPACE** APP02 · Azure Windows Server · Windows PowerShell as administrator

**DO** Use your approved VPN/private RDP or budgeted Bastion path to APP02. In the guest open Windows PowerShell opened with Run as administrator and confirm the actual OS. Leave Azure guest NIC IP assignment automatic.

**EXPECT** APP02 reports Windows Server 2019.

**IF STUCK** The portal image label is not enough. The in-guest product name is the starting point you will compare after upgrade.

**EVIDENCE** Capture aPP02 reports Windows Server 2019. Record the target computer and date.

**COMMAND**
> hostname
> Get-ComputerInfo | Select-Object WindowsProductName, OsBuildNumber
> DISM /online /Get-CurrentEdition

### Step 06: Join the destination domain and install IIS

**WORKSPACE** APP02 · Azure Windows System Properties; then administrator PowerShell

**DO** With private DNS to AZ-DC01 verified, use sysdm.cpl > Computer Name > Change to join azure.lab.example.test with authorized credentials. Restart, then install IIS from elevated PowerShell.

**EXPECT** APP02 is a member server, has a healthy domain secure channel, and IIS is running.

**IF STUCK** Do not install AD DS on APP02. If domain DNS or the private route fails, stop rather than changing it to public DNS.

**EVIDENCE** Capture aPP02 is a member server, has a healthy domain secure channel, and IIS is running. Record the target computer and date.

**COMMAND**
> Install-WindowsFeature Web-Server -IncludeManagementTools
> Test-ComputerSecureChannel -Verbose
> Get-Service W3SVC

### Step 07: Transfer the test site over the private path

**WORKSPACE** APP01 and APP02 · private file transfer through Windows File Explorer

**DO** On APP01 create a temporary read-only SMB share for the test site, limited to the authorized transfer identity and private APP02 path. From APP02 open the UNC path using an explicitly authorized source account and copy index.html into C:\inetpub\wwwroot. Remove the temporary share and credential mapping afterward. Do not open public SMB 445.

**EXPECT** The site file exists on APP02 and matches the source SHA-256 hash.

**IF STUCK** Separate forests do not automatically trust each other. If the approved network/account design cannot transfer the file, stop and have the lab owner establish a permitted transfer route; do not email credentials or expose SMB.

**EVIDENCE** Capture the site file exists on APP02 and matches the source SHA-256 hash. Record the target computer and date.

**COMMAND**
> Get-FileHash C:\inetpub\wwwroot\index.html -Algorithm SHA256

### Step 08: Prove the migrated application on Server 2019

**WORKSPACE** APP02 · Azure Windows Server browser; then administrator PowerShell

**DO** On APP02 browse http://localhost/index.html. From the approved private test client browse APP02’s private URL. Compare page text, hash, authentication, and logs with the APP01 baseline.

**EXPECT** APP02 serves the same test workload while still running Server 2019.

**IF STUCK** Keep APP01 unchanged and available for rollback. Do not switch real user DNS or copy production data.

**EVIDENCE** Capture aPP02 serves the same test workload while still running Server 2019. Record the target computer and date.

### Step 09: Hand off to the OS upgrade lesson

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Record the successful APP02 application starting point and open UPGRADE-01 next. That lesson backs up APP02 and upgrades this Azure member server from 2019 to 2022.

**EXPECT** Your saved result clearly separates application migration from the subsequent OS upgrade.

**IF STUCK** Do not upgrade DC01, DC02, AZ-DC01, SQL01, or MECM01 using the simple member-server procedure.

**EVIDENCE** Capture your saved result clearly separates application migration from the subsequent OS upgrade. Record the target computer and date.

LAB 18 / PROVE THE LEARNING

# Interview drill and checklist

Practice saying the process out loud. The goal is to describe a safe sequence, not merely remember tool names.

## Say this in an interview

30-SECOND ANSWER

I would inventory the on-premises servers and dependencies, establish the approved Azure landing zone and private connectivity, confirm destination identity and DNS, and pilot a low-risk application. For an agency moving into a different enterprise AD forest, I would coordinate the identity and GPO migration, rejoin or replace member servers in waves, validate authentication and application behavior, and keep a rollback plan until acceptance.

[ ] I can explain why lab.example.test public DNS does not create an AD forest.

[ ] I can distinguish extra domain controllers from a second forest.

[ ] I can join APP01 to lab.example.test, then to migrate.lab.example.test.

[ ] I can show a GPO backup/import and identify what did NOT transfer.

[ ] I can explain why DNS must point to the correct domain DNS server.

[ ] I can explain why the home Workstation VMs cannot just “talk to Azure.”

[ ] I can describe an Azure test migration and cutover with rollback.

## Three quick practice questions

1\. Your source has two DCs and ten app servers. Do you migrate the DCs directly into a different forest? Why?

**Your answer** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

2\. The new server can resolve a public DNS name but cannot find the destination DC. What do you check first?

**Your answer** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

3\. Your GPO imported but APP01 does not show it in gpresult. What could be missing?

**Your answer** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** Lab worksheet / completed saved result and interview rehearsal.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** Compare your recorded result with the named lesson saved result before marking verified.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Explain private AD and public DNS

**WORKSPACE** Your Windows host · lab notes and browser

**DO** I can explain why lab.example.test public DNS does not create an AD forest.

**EXPECT** Your answer says that AD DS promotion creates the directory; a public DNS record does not create a Windows domain.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your answer says that AD DS promotion creates the directory; a public DNS record does not create a Windows domain.

### Step 02: Explain a replica and another forest

**WORKSPACE** Your Windows host · lab notes and browser

**DO** I can distinguish extra domain controllers from a second forest.

**EXPECT** Your answer distinguishes another DC in the same domain from a separate identity environment.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your answer distinguishes another DC in the same domain from a separate identity environment.

### Step 03: Describe the APP01 move

**WORKSPACE** Your Windows host · lab notes and browser

**DO** I can join APP01 to lab.example.test, then to migrate.lab.example.test.

**EXPECT** Your answer names the old and new domains and the DNS, local recovery login, restart and application checks.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your answer names the old and new domains and the DNS, local recovery login, restart and application checks.

### Step 04: Describe the policy backup

**WORKSPACE** Your Windows host · lab notes and browser

**DO** I can show a GPO backup/import and identify what did NOT transfer.

**EXPECT** Your answer distinguishes copied policy settings from accounts, links and permissions that need separate review.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your answer distinguishes copied policy settings from accounts, links and permissions that need separate review.

### Step 05: Explain the client DNS choice

**WORKSPACE** Your Windows host · lab notes and browser

**DO** I can explain why DNS must point to the correct domain DNS server.

**EXPECT** Your answer connects the chosen DNS server to the domain service records the client needs to find.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your answer connects the chosen DNS server to the domain service records the client needs to find.

### Step 06: Explain private Azure access

**WORKSPACE** Your Windows host · lab notes and browser

**DO** I can explain why the home Workstation VMs cannot just “talk to Azure.”

**EXPECT** Your answer says a VMware host-only network is not an Azure route and that private connectivity and DNS must be built and tested.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your answer says a VMware host-only network is not an Azure route and that private connectivity and DNS must be built and tested.

### Step 07: Explain pilot and rollback

**WORKSPACE** Your Windows host · lab notes and browser

**DO** I can describe an Azure test migration and cutover with rollback.

**EXPECT** Your answer includes the small pilot, pass/fail checks, recovery trigger and known-good restoration plan.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your answer includes the small pilot, pass/fail checks, recovery trigger and known-good restoration plan.

LAB 19 / CHEAT SHEET

# Troubleshooting decision tree

When you get stuck, follow this order. The order matters more than memorizing all the commands.

| **Symptom**                      | **First check**                                      | **Useful command**                                          |
|----------------------------------|------------------------------------------------------|-------------------------------------------------------------|
| Cannot join lab.example.test          | Client DNS points to agency DC; private reachability | ipconfig /all ; nslookup lab.example.test                        |
| Cannot join migrate.lab.example.test     | Client DNS points to destination DC; DNS SRV lookup  | nslookup -type=SRV \_ldap.\_tcp.dc.\_msdcs.migrate.lab.example.test |
| Second DC not replicating        | AD replication / time / DNS                          | repadmin /replsummary ; dcdiag                              |
| GPO exists but not applied       | Correct OU link, computer object, filtering          | gpresult /r /scope computer                                 |
| Website disappeared after rejoin | IIS service, local app files, permissions            | Get-Service W3SVC ; curl.exe http://localhost               |
| Azure domain not reachable       | Private route/VPN, NSG, DNS path                     | Test-NetConnection \<IP> -Port 53                          |
| Azure costs rising               | VM, VPN gateway, disk, IP, backups                   | Azure Cost Management > Cost analysis                      |

GOOD ENGINEER HABIT

Capture the symptom, recent change, expected result, actual result, command output, and rollback decision. Do not randomly change firewalls and IP addresses until the problem disappears.

**Troubleshooting notes** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** The exact failed host or Azure resource / checks that do not change settings before a corrective change.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** Compare your recorded result with the named lesson saved result before marking verified.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Find the failing part before changing settings

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Write the exact symptom and time: for example, the help desk does not open. On the affected client, open PowerShell and run Resolve-DnsName with your recorded website name; compare its address with the lab plan. If the name is wrong, check the client DNS setting and the private DNS record first. If the name is right, run Test-NetConnection with that name and -Port 443; check its firewall rule and whether IIS is running on the target. If the connection works but the page reports an error, open IIS Manager on the application server and check the site, application pool and recent application logs. Change one setting, repeat the same request and record what changed. Open the Troubleshooting menu for the detailed Windows, Azure, RHEL, SQL or application scenario.

**EXPECT** You have identified whether the failure is name lookup, network access or the application, and have saved the real error before making a fix.

**IF STUCK** Use the VM console if remote access fails. Do not turn off all firewalls, reset domain controllers or restore a database just because a webpage does not open.

**EVIDENCE** Save the name lookup, port check, application error and the one change you tested.

LAB 20 / FINISH

# Shut down safely + official references

Clean up your cloud resources deliberately; preserve only the lab files you want to study again.

**[ ]** Export your notes and screenshots; keep passwords OUT of your workbook.

**[ ]** Power off local training VMs when idle. Keep one known-good snapshot of member APP01 and document when it was taken.

**[ ]** Azure: confirm whether any VMs, disks, public IPs, VPN gateways, or backups remain billed. Stopping a VM may leave disks and networking resources billable.

**[ ]** If you are finished, go to Azure portal > Resource groups > rg-ad-migration-lab > Delete resource group. Verify the resource list and type the requested name. This is destructive.

**[ ]** Return to Cost Management > Cost analysis to monitor any remaining or delayed charges.

**[ ]** If a later lab needs Azure, rebuild from your saved worksheet rather than leaving a VPN Gateway running around the clock.

OFFICIAL READING LIST

Microsoft Evaluation Center: https://www.microsoft.com/en-us/evalcenter/evaluate-windows-server-2019

Install AD DS: https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/install-active-directory-domain-services--level-100-

GPO backup/import: https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-backup-restore

Firewall for AD: https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/config-firewall-for-ad-domains-and-trusts

Azure VPN S2S: https://learn.microsoft.com/en-us/azure/vpn-gateway/design

Azure Migrate VMware: https://learn.microsoft.com/en-us/azure/migrate/migrate-support-matrix-vmware-migration

Azure budget alerts: https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-acm-create-budgets

NOTES: The portal UI and supported migration tools may change. Follow Microsoft documentation for your actual subscription and OS. For real DoD/DoDNet projects, approved destinations, boundaries, access models, and migration tooling come from program authorities.

**Date completed / what I can now explain** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Guided walkthrough

**WHERE** Azure portal and physical Workstation host / practice lab resource owner.

**BEFORE** Complete the preceding required pathway pass checks. Use only the isolated lab and authorized accounts. Record the target, software version, and recovery point before a change.

**PASS** Compare your recorded result with the named lesson saved result before marking verified.

**ROLLBACK** Stop at a failed prerequisite; keep the original source and evidence. For a practice member VM, restore only using its recorded verified backup/rebuild plan. For domain controllers, use AD-aware recovery or a planned demotion/rebuild, not an arbitrary snapshot revert. For SQL/MECM, follow their application-aware backup and recovery procedures.

### Step 01: Save your learning records

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Export your notes and screenshots; keep passwords OUT of your workbook.

**EXPECT** Your own notes and pictures are saved outside temporary resources, with no passwords or private keys included.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your own notes and pictures are saved outside temporary resources, with no passwords or private keys included.

### Step 02: Stop unused local VMs

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Power off local training VMs when idle. Keep one known-good snapshot of member APP01 and document when it was taken.

**EXPECT** Unneeded practice VMs are shut down cleanly and the member-server recovery point is identified.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Unneeded practice VMs are shut down cleanly and the member-server recovery point is identified.

### Step 03: Find ongoing Azure costs

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Azure: confirm whether any VMs, disks, public IPs, VPN gateways, or backups remain billed. Stopping a VM may leave disks and networking resources billable.

**EXPECT** You have checked the remaining VMs, disks, IP resources, gateways and backups rather than assuming shutdown means zero cost.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: You have checked the remaining VMs, disks, IP resources, gateways and backups rather than assuming shutdown means zero cost.

### Step 04: Delete only the finished lab group

**WORKSPACE** Your Windows host · Azure portal in a browser

**DO** If you are finished, go to Azure portal > Resource groups > rg-ad-migration-lab > Delete resource group. Verify the resource list and type the requested name. This is destructive.

**EXPECT** After reviewing every resource, the intended temporary group is deleted or deliberately retained with a written reason.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: After reviewing every resource, the intended temporary group is deleted or deliberately retained with a written reason.

### Step 05: Review costs after cleanup

**WORKSPACE** Your Windows host · lab notes and browser

**DO** Return to Cost Management > Cost analysis to monitor any remaining or delayed charges.

**EXPECT** Cost Analysis shows the selected subscription and remaining or delayed charges have been reviewed.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Cost Analysis shows the selected subscription and remaining or delayed charges have been reviewed.

### Step 06: Write a later-session plan

**WORKSPACE** Your Windows host · lab notes and browser

**DO** If a later lab needs Azure, rebuild from your saved worksheet rather than leaving a VPN Gateway running around the clock.

**EXPECT** Your saved rebuild notes let you stop paid infrastructure between sessions instead of leaving a gateway running all month.

**IF STUCK** Check the named computer and account first. Capture the exact error and compare the lesson reference below before retrying; do not skip a failed prerequisite.

**EVIDENCE** Save your own result showing: Your saved rebuild notes let you stop paid infrastructure between sessions instead of leaving a gateway running all month.
