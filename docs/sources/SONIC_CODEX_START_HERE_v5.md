# CODEX MASTER INSTRUCTION — SONIC v5: HAND-HOLDING MIGRATION ACADEMY + REAL THREE-SHELL LAB TERMINAL

**Repository — inspect and modify only:** https://github.com/CloudSeamTech/RHEL-SONIC
**Project boundary:** Work only in `CloudSeamTech/RHEL-SONIC`. Preserve the existing SONIC design system, navigation, lessons, and learner progress.
**Required companion course source:** `SONIC_MIGRATION_WORKBOOK_FULL_SOURCE_v3.md` (the entire existing AD / WSUS / SQL / MECM / Azure / HA workbook). The accompanying DOCX contains the workbook too. Do not substitute generic course material for the source workbook.
**Date of this brief:** October 18, 2026.

## 0 — MISSION AND NON-NEGOTIABLE OUTCOME

Build a **second, independent course track** in the existing futuristic RHEL-SONIC application titled **Agency-to-Azure Enterprise Migration**, with a **fully integrated, REAL local terminal experience** for **Windows PowerShell**, **Azure CLI**, and **Rocky Linux under Windows Subsystem for Linux (WSL)**. The learner is starting almost from zero in cloud migration. Use a hand-holding, very beginner-friendly, Nextwork.ai-INSPIRED teaching METHOD (not copied materials, look, text, or brand assets). Explain every term and action as though teaching a fifth grader, without becoming condescending. The site must actually guide the learner from on-prem VMware Workstation to a safe Azure lab and show how a cloud engineer joins a migration already in progress.

Do not merely place copyable command snippets on web pages and call that a terminal. Deliver an embedded terminal interface that can return **actual stdout/stderr/exit codes from the learner's OWN authorized Windows host** when a separately installed **local-only companion** is running. Provide reliable setup, connection, denial, error, and troubleshooting states. The public/cloud-hosted course must have no remote host shell execution capability by default.

**No claims of implementation until real code and tests exist.** Work on a new feature branch, create a pull request, report incomplete work honestly; do not overwrite `main` without review.

## 1 — REPOSITORY FACTS: FIRST READ THE SOURCE

Current repo (verified): React 19 + TypeScript, Vinext v1 beta, Cloudflare Worker-compatible build, `app/page.tsx`, `app/course.ts`, `app/course-roadmap.ts`, `app/sonic-dashboard.tsx`, `app/sonic-ui.tsx`, `app/sonic-design-system.css`, `lib/progress-model.ts`, `lib/progress-store.ts`, and `tests`. The accepted design lives in `SONIC-DESIGN-SYSTEM.md`; its futuristic globe and black/graphite/silver/tactical-red/cyan glass interface are LOCKED. The existing 40 RHEL/Wazuh lessons are implemented and existing user progress IDs must survive.

Read `README.md`, `COURSE-DELIVERY-PLAN.md`, `GITHUB-HANDOFF.md`, `SONIC-DESIGN-SYSTEM.md` and the current source/tests BEFORE coding. Verify actual package versions and installed tools. Run `npm ci`, `npm run lint`, `npm test`, and `npm run build` as a baseline. Keep build/runtime compatible with current Vinext/Cloudflare Worker model. Document any existing failures before changing code.

### Preserve
- Globe, translucent command-center panels, main dashboard topology, lesson workspace, existing course content, original lesson IDs, original progress/localStorage migration and existing animations/reduced-motion support.
- `rexuser` for RHEL lesson usernames; do not confuse it with Windows Administrator or Azure identity.
- Existing learner workflows and timing assumptions where relevant; new migration and terminal lessons get new IDs and independent progress.
- Security design colors: graphite/black; silver information; tactical red for security/recovery; cyan for active connectivity; amber warnings; green only for verified learner steps. Never fabricate telemetry.

## 2 — TEACHING CONTRACT: ONE TINY ACTION AT A TIME

Every NEW migration course lesson AND every live-terminal tutorial must include, IN ORDER:

1. **A simple picture/analogy** (e.g. DNS = address book; domain = school; SQL backup = sealed moving box; cloud witness = tie-breaking referee).
2. **What we are building and why** in one or two short sentences.
3. **The exact computer/console** (HOST Windows PC, VMware guest, DC01, SQL01, MECM01, Azure portal, local PowerShell, Azure CLI inside PowerShell, or WSL Rocky), and permission level required. Say explicitly when the terminal is *local* and does not automatically SSH/RDP into a VM.
4. **Before you start:** exact prior pass checks, budget/cost, prerequisites, account, domain, test data, backups and rollback checkpoint.
5. **Numbered, single-click/single-command steps**. Quote current screen/button names; explain how to open Server Manager, ADUC, GPMC, SSMS, MECM console, Windows Terminal, WSL, Azure portal. One step = one action or tightly related action with clear outcome.
6. **Command + argument dictionary:** what the command does, what each flag means, why it is safe or may change something, which prompt/shell to use, when admin rights are needed. Never copy a prompt like `PS C:\>` into the command clipboard.
7. **Expected result:** label any example transcript `ILLUSTRATIVE EXAMPLE - NOT ACTUAL OUTPUT`; a live terminal shows ACTUAL returned output, including stderr and exit code. Do not invent IPs, prices, versions or successful migration status.
8. **PASS CHECK**: how to prove it worked using portal + command + application-level verification.
9. **If it fails:** exact symptom, first diagnostic commands, interpretation, next safe fix, and when to stop.
10. **Rollback/STOP**: a tested restore plan, not an unqualified snapshot rollback for domain controllers or MECM production sites.
11. **Your Turn:** small challenge and revealable answer/explanation; evidence worksheet, never secrets.
12. **Explain how a real engineer would document it** for change control / handoff: owner, target, dependency, result, next wave, rollback, tickets, maintenance window and affected users.

Do NOT say “configure DNS” or “install the role” without telling the learner where, what to select, how to verify, and why. Never hide behind “follow Microsoft Docs” for the main practice path. If an exact version-specific screen cannot be verified, clearly label it `VERSION CHECK REQUIRED` and identify the decision, not a guessed click label. Explain the difference between *understanding a command*, *running it*, and *confirming its effect*. Include real command-output examples where educational, labeled as examples.

## 3 — COURSE MAP: ADD A SEPARATE MIGRATION PATHWAY, NOT A SONIC REDESIGN

Map the existing complete `SONIC_MIGRATION_WORKBOOK_FULL_SOURCE_v3.md` into authored lessons, following its real order and terminology:

**Foundation and domains:** LAB 00..12 — plan, isolated VMware Workstation VMnet, DC01, second agency DC DC02, source `lab.example.test` users/OUs/GPO/DNS, APP01/IIS, new independent destination `migrate.lab.example.test`, name resolution/trust decision, GPO backup/import, member-server rejoin and rollback.

**Patching and SQL:** LAB 13 WSUS01, then SQL-01..05 — compatible SQL version/edition decision, SQL01 joined to the source domain, SQL Server eval prerequisites, service accounts, storage/collation, SQL Server Management Studio, `PracticeDB`, real data query, `.bak` backup, file move, restore on another instance, login/job/permission checks.

**MECM:** MECM-01..05 — prerequisites, MECM01, connect to SQL's supported site database (separate from `PracticeDB`), MECM evaluation primary site, clients, WSUS Software Update Point. Explicitly distinguish WSUS itself from ConfigMgr SUP. Validate ConfigMgr version/SQL support matrix; SQL Server 2025 compatibility must not be assumed.

**Migration:** MOVE-01..04, AZ-01..03, LAB 14..17 — discovery and dependency worksheet, domain-to-domain identity decisions, private network/DNS/route/NSG rules, compare rebuild/rehost/refactor, Azure Migrate assessment, `.bak` demonstration to an Azure SQL VM, safer MECM site-recovery/hierarchy-migration decision, staged cutover, application checks, rollback and cost control. Do not imply moving a domain controller into an unrelated enterprise domain or treating a public DNS zone as AD DS.

**Optional advanced HA:** HA-01..05 — WSFC, SQL01/SQL02, cloud witness in Azure Storage, majority/quorum, SQL Always On AG configuration and listener, prerequisites, testing and deallocation. Witness holds a vote, not a SQL replica; two SQL nodes plus witness are distinct from three SQL nodes.

**Operations:** FIELD-01 + LAB 18..20 — how to enter an in-progress migration, who owns what, evidence, risk/ATO boundary, troubleshooting, migration wave checklist and safe teardown. Label DoDNet comparisons as conceptual only, never claim lab equals a DISA-approved migration.

Keep the existing workbook as the SOURCE, not simply a downloadable PDF. Every published lesson should be interactive and navigable in the SONIC app. A lesson missing precise content stays **PLANNED**; published counts only include finished instructional experiences. No completed badges for authored content alone. Treat lab execution and learning completion as separate states.

## 4 — THE BIG NEW FEATURE: SONIC LAB TERMINAL (A REAL ONE)

### What the learner sees

Add a futuristic, unobtrusive **LAB TERMINAL** drawer/panel inside each lesson (desktop split view; usable on mobile, with a large readable font). Retain the existing approved SONIC visual system and navigation. Tabs:

- **PowerShell | Windows Host** — `pwsh.exe` when installed, otherwise `powershell.exe`. Display shell/version and machine label.
- **Azure CLI | Windows PowerShell** — same real Windows PowerShell environment with `az` installed; use `az` syntax, *not* `Get-Az...` unless specifically teaching the distinct Az PowerShell module. Azure CLI is a tool, not an independent OS shell.
- **Rocky Linux | WSL 2** — launch the selected installed WSL distribution through `wsl.exe --distribution <verified-name>`. Prefer the user's previously observed `RLCPlus-9` (Rocky Linux Plus 9 from CIQ) only IF `wsl.exe --list --verbose` verifies it; do not silently claim this CIQ image is identical to upstream Rocky. Offer a chooser for supported installed distros and handle absent distro gracefully.

For each tab: **Connect**, **Disconnect**, **Clear screen**, **Copy output**, **Help / explain**, **Run selected lesson command**, **Stop command** (interrupt/cancel), full interactive input, session status, visible working directory, exit status, timestamps optionally, and accessibility. Show normal stdout and stderr in distinct, readable styles. Handle terminal resize, ANSI formatting, shell startup delays, missing executable, authentication timeouts, command failure and user disconnect. Do not fake a connected status or output.

### Critical engineering truth: a hosted browser cannot safely execute the learner's OS shell by itself

Design TWO explicit modes:

**Mode A — hosted online SONIC:** lessons, practice examples, command copy, output interpretation, optional link to OFFICIAL Azure Cloud Shell for *commercial Azure* where supported; never claim that GitHub/Cloudflare-hosted frontend can reach `C:\`, local PowerShell, WSL or private VMs directly. No shared cloud-hosted arbitrary command executor. Show “Live local terminal not connected” + local companion setup steps.

**Mode B — local practice SONIC:** an **opt-in local-only companion service** installed and started on the learner's OWN Windows PC. It starts authenticated terminal sessions under the logged-in user's rights using platform-appropriate PTYs, with processes bound to loopback and a browser UI served same-origin from the local companion (preferred). Execute commands only upon explicit user action, never automatically on page open / lesson selection / AI explanation. Feed genuine process stdout, stderr (where distinguishable), termination and exit codes to the UI over an authenticated local WebSocket/stream transport. Support full interactive sessions and command histories per local session only. Do not send terminal content to third-party AI by default.

**Never:** put privileged `node-pty` or `child_process` into a Cloudflare Worker; expose an unauthenticated or internet-facing PTY server; run arbitrary commands on GitHub Pages; request the learner to disable CORS/firewall protections; open inbound internet ports; store tokens/API keys in Git; silently execute cost-incurring Azure operations; record passwords/secret data in persistent transcripts. Browser-to-localhost public-origin connections are security-sensitive and may be blocked by browsers; choose same-origin local hosting or an explicitly reviewed desktop wrapper, not a fragile cross-origin hack.

The live experience is NOT complete until a Windows integration test proves a real `Get-Date` result, real `az version` result and real `cat /etc/os-release` result from a locally installed WSL distro, each with exit code/status. CI on Linux can use mocked transport tests but does not prove Windows shell functionality.

### Local companion implementation guidance (for Codex to design, test and refine)

Suggested additive project layout; adjust to the actual repo without replacing current components:

```
app/lab-terminal/                # SONIC display, tabs, command help, output UX
lib/lab-terminal/                # protocol/types, safe command metadata, transport adapter
local-companion/                 # separate local Windows service/CLI and shell adapters
local-companion/shells/          # powershell, azure-cli-in-powershell, wsl adapters
app/migration-*.ts(x)            # migration lessons, walkthroughs, visuals, timing
scripts/                       # verified local launcher/setup helpers
README-LOCAL-TERMINAL.md          # prerequisites, pairing, launch, troubleshooting, security
SECURITY-LAB-TERMINAL.md          # threat model, consent, trust and execution boundaries
tests/                           # UI/progress, command/parser, security and integration tests
```

Select `node-pty` or another Windows-compatible native PTY library only after verifying Node 22/Windows support and build strategy. Keep native dependencies OUT of Worker bundles. Spawn the configured user shell directly with a vetted argv array (not `cmd /c` concatenation), restrict executable choices to the three named shells, don't start elevated processes, use per-session max processes/idle timeout/buffer limits, local origin checks, an unpredictable per-session pairing token/CSRF protection, a loopback-only bind, and sensitive-output redaction when saving/exporting. **A login prompt inside the terminal is NOT the same as cloud credential storage.** Never upload transcripts or tokens without informed opt-in.

Clear “Preview command / run in live local terminal / copy only” states. Flag `az vm create`, `az vm delete`, `az group delete`, `Remove-*`, destructive `rm`, domain rejoin, SQL restore and Azure billable operations as HIGH-RISK with explicit review/confirmation, safe dry-run/What-If when supported, and rollback explanation. Risk hints are educational and cannot guarantee safety. Interactive terminal users may still type privileged commands under their own OS permissions: the companion must be prominently labeled **local execution under YOUR account**. First connection requires active opt-in and precise host display. Do not expose live terminal to untrusted people or workplaces without authorization.

### Commands and first-run checks (read-only baseline)

**PowerShell | Windows host (actual PowerShell prompt, NOT WSL):**

```powershell
$PSVersionTable.PSVersion
Get-Location
Get-Date
Get-Help Get-Service -Examples
Get-Command az -ErrorAction SilentlyContinue
wsl.exe --list --verbose
```

**Azure CLI | Windows PowerShell (local executable):**

```powershell
az version
az cloud show --query name --output tsv
az account show --output table
az group list --output table
az vm list --show-details --output table
az vm --help
```

`az account show` and `az group list` require the learner's own authorized `az login` session; missing credentials must return a clear sign-in guide, NOT a fake result. `az login --use-device-code` is an optional interactive login that needs user's confirmation. For a PERSONAL/COMMERCIAL Azure subscription, check current cloud is `AzureCloud`; do NOT change clouds silently. A separate optional **Azure Government lesson** teaches `az cloud set --name AzureUSGovernment`, login and endpoint verification ONLY if the user actually has a permitted Azure Government account. Azure Government doesn't offer portal Cloud Shell equivalent in Microsoft's current documentation; do not promise it.

**Rocky Linux | WSL 2:** first run from Windows PowerShell and use the EXACT listed distro name:

```powershell
wsl.exe --list --online
wsl.exe --list --verbose
wsl.exe --install --distribution RLCPlus-9  # Only if currently listed AND user approves install
wsl.exe --distribution RLCPlus-9
```

Inside the WSL Rocky/RLC+ shell (not in Windows PowerShell):

```bash
cat /etc/os-release
whoami
pwd
uname -r
ip -brief address
df -h
df -i
lsblk
ss -tulnp
command -v az || echo 'Azure CLI not installed inside this WSL distro'
```

Teach that an Azure CLI installed on Windows does **not necessarily mean** `az` is installed inside WSL. Show two explicit options: use the local Azure CLI tab (recommended for simplicity) or separately install Azure CLI inside the verified WSL distribution following current Microsoft RHEL-family guidance. Don't mix PowerShell `$env:NAME` and Bash `$NAME` syntax. `systemctl` behavior under WSL depends on systemd configuration; do not present WSL as a full Azure RHEL VM or STIG-compliant enterprise server.

**Important:** `RLCPlus-9` is *Rocky Linux Plus 9 (CIQ)*, not an automatically assumed universal alias `RockyLinux`. If not installed / unavailable, show official WSL distro discovery and optionally an approved Rocky rootfs import procedure; don't fabricate a download link.

### Smart contextual help, without fictional magic

Add **Explain command** and **Explain this output** help below the live terminal. For built-in lesson commands, maintain curated explanations per executable, flag, permission, potential changes and 2–3 common errors. For arbitrary commands, show local `Get-Help`, `az ... --help` or `man --help` documentation buttons where available, and optionally a *clearly marked* AI explanation when configured with privacy notice and redaction. Without AI/back-end integration, offer reliable static, explainable guidance — **do not pretend AI or live diagnostics are active**. On failure, explain error code and guide learner to inspect output; do not auto-run fixes or disable firewalls, SELinux, policies, or defenses.

## 5 — LIVE TERMINAL TEST CASES: PASS OR FAIL, NO DEMOS PRETENDING TO BE LIVE

Test on a real Windows development workstation with WSL installed. The acceptance evidence should include:

- [ ] Local companion refuses remote/network interface binding and unauthenticated WebSocket connections.
- [ ] Hosted SONIC WITHOUT companion says “Not connected,” shows copyable commands and never simulates a real OS.
- [ ] PowerShell tab returns the current `Get-Date` and exits successfully; bad command returns actual error and nonzero status where applicable.
- [ ] Azure CLI tab returns installed `az version` and `az cloud show`; signed-out `az account show` is an honest login-required state.
- [ ] WSL tab launches an actually installed distro and returns a genuine `cat /etc/os-release` identifying that distro; absent distro shows guided installation, never fabricated output.
- [ ] Shell identity/permissions clearly visible, `Stop` cancels/interrupts, `Disconnect` shuts session down and terminals do not survive forgotten browser sessions indefinitely.
- [ ] Command help correctly distinguishes Azure CLI from Az PowerShell and Windows host vs WSL vs remote Linux guest.
- [ ] High-risk command requires explicit confirmation; no automatic cloud billing, resource deletion, schema changes, domain change, or SQL restore.
- [ ] Local terminal traffic stays local; pairing tokens are not in Git, browser localStorage, console logs or downloadable lesson artifacts.
- [ ] No secret value appears in stored/exported transcripts by default; normal stdout, error text, exit status and cancellations render truthfully.
- [ ] Keyboard, responsive widths (390/768/desktop), high contrast, selection/copy, reduced motion and screen-reader labels pass manual checks.
- [ ] All original 40 lessons still exist; all previous progress still exists after update; new lesson IDs and track counts are correct.
- [ ] `npm run lint`, `npm test`, `npm run build` succeed; Windows end-to-end test run is separately recorded as PASS, FAIL, or NOT RUN. Never call mocked output a live test.

## 6 — DEPLOYMENT AND ENGINEERING PHASES

**Phase 0 (mandatory):** Repo inspection/baseline and threat model; record architecture choices and all permissions. Branch: `feature/sonic-migration-local-terminal`. No direct write to main.

**Phase 1:** Add the separate migration track as a planned curriculum, independent IDs/progress; preserve Wazuh and existing design.

**Phase 2:** Author the full click-by-click migration lessons from the companion workbook; no summaries masquerading as lessons. Add pass checks, cost gates, and resume-an-in-progress-migration scenarios.

**Phase 3:** Ship guided terminal with copy/explain/expected-result only, and prominent NOT LIVE labeling; static host path available even when companion is absent.

**Phase 4:** Implement local companion on Windows, real PowerShell/Azure CLI/WSL streams and pairing; test security, failure states and Windows integration end-to-end. Keep process execution isolated from Worker production build.

**Phase 5:** Verify optional Azure commercial Cloud Shell entry points and Azure Government guidance separately, plus advanced SQL/MECM/WSFC lessons, budget and deallocation procedures. App must not accidentally provision paid cloud resources.

**Phase 6:** Run tests, verify responsive visuals, publish PR with architecture diagrams, screenshots (redacted), security choices, test transcripts (sanitized), incomplete items and manual setup. PR title: `Add agency-to-Azure lessons and safe local three-shell terminal to SONIC`.

If the whole feature cannot be implemented in one iteration, create small tested PRs in this sequence. Don't ship incomplete terminal UI as “working.” Don't change current hosting or add any always-on paid backend as an unapproved shortcut. Never push secrets, credentials or real DoD data.

## 7 — REQUIRED DOCUMENTS AND TESTS IN THE REPOSITORY

- Update `README.md` to list two independent tracks, live-local vs hosted mode, requirements and privacy warning.
- `README-LOCAL-TERMINAL.md`: zero-to-working Windows 11 setup, Node requirement, WSL distro check, PowerShell / Azure CLI install, launch and connect instructions, what user sees, troubleshooting and stop/uninstall steps.
- `SECURITY-LAB-TERMINAL.md`: local execution threat model, authenticated transport, origins, session limits, credential/secret redaction and restricted administrative environment guidance.
- `docs/MIGRATION-COURSE-SOURCES.md` or equivalent: map each workbook lesson ID to source heading, published lesson ID and validation method; authoritative workbook remains companion source.
- Functional tests for track separation, old progress preservation, shell-state UI, terminal transport auth, no-output fabrication, permission/cancellation, syntax/help explanation and Windows/Wsl integration.
- Clear source attribution links to Microsoft WSL, Azure CLI and Cloud Shell docs, CIQ RLC+ if used, Microsoft SQL/ConfigMgr and Azure witness docs. Avoid copyright duplication of Nextwork content.

## 8 — FINAL DEFINITION OF DONE

The learner can open futuristic SONIC; choose the unchanged **RHEL/Wazuh** track or independent **Agency-to-Azure Migration** track; click each guided action; see what machine is being used; copy a command; use a **REAL** PowerShell, Azure CLI or Rocky WSL terminal through an explicitly launched local companion; see ACTUAL returned command output, honest errors, step-by-step help and verification; and safely exit without leaving a paid Azure machine running unnecessarily. The hosted version never claims direct access to the learner's local computer. All changes are reviewed, tests are honest and the entire source workbook has been faithfully converted without breaking existing RHEL lessons.

## 9 — OFFICIAL REFERENCES TO CHECK FOR CHANGING DETAILS

- Microsoft WSL: https://learn.microsoft.com/en-us/windows/wsl/reference
- WSL installation: https://learn.microsoft.com/en-us/windows/wsl/install
- Microsoft WSL distro manifest (RLCPlus-9): https://github.com/microsoft/WSL/blob/master/distributions/DistributionInfo.json
- Azure CLI for Windows: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-windows
- Azure CLI installation overview: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli/
- Azure CLI sign-in: https://learn.microsoft.com/en-us/cli/azure/authenticate-azure-cli-interactively
- Azure Government CLI guidance: https://learn.microsoft.com/en-us/azure/azure-government/documentation-government-get-started-connect-with-cli
- Azure Cloud Shell overview (commercial Azure): https://learn.microsoft.com/en-us/azure/cloud-shell/overview
- Microsoft WSL distro provider: https://ciq.com/products/rocky-linux/plus

**CODEX: Do not respond only with a plan. Implement the safe architecture in iterations, run the tests you can actually execute, report blockers, and create a reviewable PR. When exact Windows integration tests are impossible in your environment, state that honestly and provide a local executable verification script + learner instructions, not fake output.**
