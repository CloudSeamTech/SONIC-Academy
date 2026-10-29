# SONIC-Academy · CloudSeamTech Training

Public website: **https://cloudseam.tech/**.

Beginner lessons use fictional `lab.example.test` names and explain the current machine, app, actions and expected checks. Start with the [beginner lab guide](https://cloudseam.tech/lab-guide) for tools, command locations and a small-VM resource plan. Existing learners keep their recorded names; do not rename a working AD forest to match an example. See [classroom conventions](docs/LAB-EXAMPLES.md).
Fallback address: https://sonic-academy-cloud-seam.vercel.app/. See [custom domain setup](docs/CUSTOM-DOMAIN.md).

For Google/GitHub sign-in and database setup, follow the [Supabase owner guide](docs/SUPABASE-SETUP.md). Public social sign-in is not connected yet.

## VMware vSphere System Administration

VMware vSphere System Administration is available at `/vsphere`, under Windows System Administration: 22 concise chapters from ESXi setup and vCenter access to networking, storage, templates and daily operations. Eleven numbered official VMware/Broadcom screenshot references are attributed and distinguished from live lab evidence. No vCenter evaluation is assumed; standalone ESXi and authorized vCenter/hosted-lab routes have explicit capability limits. See [class scope and screenshot provenance](docs/VSPHERE-CLASS.md).

## PKI Certificate Management

The dedicated `/pki` pathway contains two separate application-server classes: `/pki/alma-nginx` and `/pki/windows-iis`. Each has seven chapters beginning with plain-language explanations, followed by CSR creation, PKI-team handoff, certificate/chain inspection, trust-store decisions, HTTPS activation and client validation, expiration tracking, renewal and rollback. New `pki-alma-*` and `pki-iis-*` lesson IDs use the existing progress store without resetting older completion. The existing `/tls` RHEL 9 practice-CA course remains available.

Seven genuine, numbered lab references are embedded in the relevant steps before Next step. AlmaLinux captures are explicitly supplemental **10.2 / OpenSSL 3.5.5**; Windows Server 2022 captures show certificate-store navigation. NGINX/IIS endpoint and binding captures remain incomplete and are labeled capture needed. These classes assume existing prepared application servers; they do not install IIS, NGINX or osTicket automatically, and the IIS class is separate from a domain controller. See [course delivery and verification limits](docs/PKI-COURSES.md).

## Self-paced academy

The dashboard uses the CloudSeamTech cream, purple and orange visual system, with searchable subjects, resume learning, bookmarks, recent activity, and progress calculated from the curriculum. Course readers retain their existing routes, screenshot references and verification checks.

The connected Sites deployment provides Sign in with ChatGPT, learner profiles, and D1-backed progress. Guest browser progress can be imported explicitly after signing in. The separate public Vercel mirror remains available for guest learning and clearly explains that account saving needs its own provider connection. See [learner account and database details](docs/ACADEMY-ACCOUNTS.md).

## Windows DMZ and private IIS publishing

The Windows System Administration pathway now includes a separate [DMZ lab](https://cloudseam.tech/dmz): nine lessons and 35 step visuals covering isolated Workstation networks, OPNsense, a DMZ NGINX proxy, a separate private IIS subnet, positive/negative traffic tests, recovery and Azure cost/design comparison. Existing DC01/DC02/APP01 are left unchanged. See [the lab design and verification limits](docs/DMZ-LAB.md).

The shared lesson readers include an optional **Focus on this step** control. Numbered picture guides are provided on the DMZ steps and reviewed shared interface references; image sources and recreations remain clearly distinguished.

## AlmaLinux Desktop Experience

The `/alma` pathway adds 12 guided classes for day-to-day AlmaLinux 9 GNOME use: VMware installation, desktop configuration, terminal/files/permissions, DNF and Flatpak apps, Steam/Proton, peripherals, Western Digital storage, backups, troubleshooting, and real terminal setup. See [the course notes](docs/ALMALINUX-DESKTOP.md). The hosted Lab Terminal includes local setup instructions; live execution still needs the local Windows companion or the guest’s native Terminal.

## Agency-to-Azure migration pathway and local lab terminal

SONIC now has a separate `/migration` pathway generated from the approved v3
migration workbook. Its 45 lesson IDs do not replace, renumber, or share
progress with the existing 40 RHEL/Wazuh lessons. Learners can follow the
ordered **Learn It** route or enter the same modular content through **Do the
Job** task cards. The complete source workbook and implementation contract are
retained under `docs/sources`, and generated catalog entries retain source-line
mapping.

The migration console also includes an opt-in three-tab LAB TERMINAL for
Windows PowerShell, Azure CLI inside Windows PowerShell, and an actually
installed WSL distribution. The Cloudflare-hosted app is always copy/help mode:
it never fabricates terminal output or claims to execute workstation commands.
Live mode requires a local SONIC page plus the separate loopback-only,
token-authenticated Windows companion. See
[README-LOCAL-TERMINAL.md](README-LOCAL-TERMINAL.md) and
[SECURITY-LAB-TERMINAL.md](SECURITY-LAB-TERMINAL.md).

No command runs merely because a learner opens a lesson or terminal. Azure
state-changing commands receive an explicit target/impact/rollback confirmation
gate. The companion does not log terminal input/output and never elevates the
current Windows user.

## Current SONIC design lock

All 40 available lessons now include ordered walkthroughs, plain-language introductions and a contextual glossary. Each command names its computer/app and gives a result to check. Key generation, SCP and SFTP have separate decision checkpoints. The approved dashboard layout is unchanged. The broader AD/DNS/realm and client-workstation expansion remains planned; see COURSE-DELIVERY-PLAN.md.

The ten Wazuh lessons now use ordered beginner walkthroughs from `app/wazuh-walkthroughs.ts`: named machine/application/account, exact clicks or commands, option explanations, expected outcomes, explicit branch/wait checkpoints and evidence capture. They replace the former bulk command/procedure presentation for those lessons. The dashboard layout and completion IDs are unchanged. The walkthrough standard is the baseline for future lesson work; do not substitute “follow the documentation” for the actual steps of the main lab path. Environment-specific trust/authorization decisions remain explicit stop conditions.

The dashboard retains its approved layout with a graphite, silver, tactical-red and limited-cyan palette. The globe uses silver geography, red instrumentation and selected cyan connectivity. The VNet lesson (`network-plan-v2`) is the representative calm workspace. See [SONIC-DESIGN-SYSTEM.md](SONIC-DESIGN-SYSTEM.md) for semantic color rules and scope.

The 30 implemented preparation lessons total **2–3 hours hands-on** for a learner with a functioning workstation/Azure environment. Build/access: **87–130 minutes**; file delivery: **10–15 minutes**; baseline/rollback: **23–35 minutes**. Optional detailed reading is **80–150 minutes separately**; passive Azure provisioning/deallocation waits are **11–25 minutes separately**, varying with the environment. These are planning estimates, not measured completion times. All lesson, stage and remaining-work estimates use `app/course-timing.ts`. Planned stages have no invented duration.

Current validation: 29 automated tests and lint pass. Dashboard browser checks cover real completion, START/CONTINUE/REVIEW, cross-tab updates and 390–1600px layouts. The design was approved; ten Wazuh deployment, validation, fault and recovery lessons are now implemented.

The existing Milestone 2 application is retained: dashboard, styling, terminal blocks, SSH-key visualization, named account `rexuser`, challenges, and browser progress. The first major lab is now one continuous two-system administration scenario. No advanced storage prerequisite is placed before Wazuh.

## Old roadmap versus new roadmap

Previously: Windows/Azure/SSH foundations → deep storage → identity/permissions → artifact transfer → packages/services → networking → Wazuh manager → Wazuh agent → troubleshooting → recovery.

Now: two-host build/SSH with practical build-time storage → harmless SCP/SFTP transfer → installer literacy, inventory and explicit pre-change rollback → Wazuh central server/dashboard → endpoint agent/service discovery/communication → dashboard check-in and validation → a controlled communication failure → recovery and documentation. Advanced topics follow that complete scenario.

The full 22-step user workflow is visible in the roadmap. Azure requires an existing public key before final VM creation: the lessons stage VM/storage choices first, then restrict/authorize SSH and submit the build. This prerequisite is explicit, not a reason to use password login or expose SSH broadly.

## Implemented now

Thirty detailed tasks across three ready stages:

1. **Build and administer both RHEL systems** — all retained foundations plus a two-host budget/architecture, build-time disks/partitions/filesystems/mounts, manager VM provisioning, `lsblk`/`findmnt`/`df -h`/`df -i`, and separate verified manager access.
2. **Deliver and verify a harmless file** — Windows text/hash creation, SCP, remote `pwd`/`ls -l`/`file`/`sha256sum` checks, and interactive SFTP with local-versus-remote paths. No private key is transferred.
3. **Prepare the software change** — script/RPM/archive/repository methods, package/process/unit inventories, retained baseline, explicit rollback/snapshot/backup checkpoint, vSphere comparisons, and deallocation of both hosts.

Every new task has scenario, objective, enterprise rationale, change scope, commands and argument explanations, expected result, verification, failure causes, ordered troubleshooting, rollback, and a Your Turn challenge. Commands for different shells are separated into labeled blocks. Installer/discovery examples with unknown future names remain commented references, not executable Wazuh instructions.

The central VM is `rhel9-manager-01` (manager + indexer + dashboard role); the retained endpoint is `rhel9-lab-01`. Both use `rexuser`. The central sizing plan follows current Wazuh all-in-one guidance (at least 4 vCPU/8 GiB and adequate storage for the small lab); it does not reuse the lighter endpoint size. Real regional prices, licensing, and supported versions must be reviewed before provisioning/installing. No Azure resources are created by the app.

## Deployment, validation and recovery lessons

Five subsequent main-lab stages now contain ten lessons with completion controls: central installation, agent installation/service discovery, check-in/validation, the ordered communication failure investigation, and recovery/documentation. Each new task begins unverified. Expandable stage specifications remain available as acceptance references.

The troubleshooting exercise is designed around a reversible wrong-manager-address fault after a working check-in. It covers installed package → service → logs → address → DNS → route → ports → NSGs → guest firewall → SELinux/audit evidence → application configuration → central enrollment, then targeted restoration and retesting. Security controls are not disabled as a default fix.

After those stages: advanced LVM/storage; Linux identity/permissions/packages/scripts/processes/systemd; networking/DNS/firewall/SELinux; STIG/SCC/SCAP with Windows export and STIG Viewer; ACAS/Tenable Security Center; hardened RHEL baselines and reusable Azure/vSphere images/templates.

## Progress preservation

All 18 Milestone 2 IDs remain present. The version-2 browser storage schema and key are unchanged: **no new migration or reset is needed**. Existing completion follows the task ID when reordered. Twelve additional tasks use new IDs and start unverified, so the available-task percentage may decrease while every old completion remains retained. Reused foundation tasks cover the original endpoint; new host-specific tasks separately verify manager work.

The original milestone-one numeric-history migration still works. Tests verify old completions survive and cannot auto-complete new work. Browser/origin-specific storage, cross-tab synchronization, invalid-data filtering, and session fallback are retained.

## Files changed or added

- `app/course.ts` — retained foundation content, contextual updates, references, new lesson fields, and ordered composition.
- `app/course-roadmap.ts` — **new**: stage membership, 22-step scenario, planned main-lab exercises, and later deep dives.
- `app/lab-lessons.ts` — **new**: 12 substantial two-host, storage, transfer, inventory, and recovery lessons.
- `app/page.tsx` — existing interface gains stage-aware navigation/completion, planned exercise details, vSphere callouts, and separate follow-up terminal blocks.
- `app/lesson-visuals.tsx` — retained SSH-key visual; architecture and protocol captions reflect the two-host scenario.
- `app/globals.css` — matching styles for callouts, follow-up blocks, and planned exercise details; original design remains.
- `tests/course.test.mjs` — progression/order, stage boundaries, transfer safety, installer examples, and retained progress regression checks.
- `tsconfig.json` — permits explicit TypeScript imports for shared curriculum modules used by Node tests and the app.
- `README.md` — roadmap, implementation boundaries, verification, and preview instructions.

No dependency or lockfile changes. Existing progress model/store files are unchanged.

## Preview and validation

Use Node 22.13+ and npm. If needed run `npm ci`; then `npm run dev` and open http://localhost:3000. `npm run lint`, `npm test`, and `npm run build` validate the application. `npm run start` serves the built Worker locally.

Application lint, all 24 tests, and the production build pass. Browser verification covers lesson rendering, completion routing and responsive layouts. Live Azure provisioning and RHEL/Wazuh command execution were not performed. Optional WebMCP navigation is still feature-detected and was not exercised in a supported WebMCP context.

The inherited exclusions for untouched `components/ui` and `hooks/use-mobile.ts` remain unchanged. No weaker rules or new exclusions were added. The pinned starter's previously reported dependency advisories were not resolved by this curriculum change; audit before broader rollout.

## Wazuh milestone — implemented

Ten new lessons now teach the central-installation and endpoint-agent portion on the prepared VMs: choose and record a currently supported stable Wazuh release; verify official artifacts and revalidate recovery checkpoints; install central manager/indexer/dashboard and inspect discovered services; constrain and verify HTTPS access; inspect/transfer/install the agent RPM; discover its actual service from package/unit evidence; configure private manager communication/enrollment; and prove current dashboard check-in with correlated logs and a harmless event. The controlled wrong-manager-address exercise, approved recovery/validation and final documentation are included. The course now has 40 lessons across eight available stages, with advanced deep dives still planned. Existing completion IDs are preserved; completion of preparation routes to the first Wazuh lesson. Deployment and recovery add an estimated 76–115 minutes hands-on; the original preparation remains 120–180 minutes. Optional reading and passive waits remain separate.

The app teaches the work; it does not execute installers or provision the learner's infrastructure. Earlier ZIP files remain historical exports. The workspace source is current; historical ZIP exports do not contain this milestone.
