# RHEL 9 NGINX certificate-management pathway

## Scope and entry point

`/tls` opens **SSL/TLS Certificate Management on RHEL 9 with NGINX**. Thirteen hash-addressable lessons provide the setup route and ten requested modules. CSR and renewal methods have independent lessons. The existing Linux Administration subject includes the complete sequence, under the existing Linux System Administration career pathway. Existing lesson IDs, routes, progress keys, typography, navigation and branding remain.

## Course routes

- `/tls#lesson=tls-start`
- `/tls#lesson=tls-basics`
- `/tls#lesson=tls-find`
- `/tls#lesson=tls-key`
- `/tls#lesson=tls-csr-existing`
- `/tls#lesson=tls-csr-new`
- `/tls#lesson=tls-ca`
- `/tls#lesson=tls-install`
- `/tls#lesson=tls-renew-existing`
- `/tls#lesson=tls-renew-new`
- `/tls#lesson=tls-troubleshoot`
- `/tls#lesson=tls-enterprise`
- `/tls#lesson=tls-final`

## Teaching and interactions

100 meaningful steps each identify what, why, where, exact commands where applicable, expected observations, success verification and failure handling. GUI-only steps say no command is required. Literal paths/options remain case-correct inside the uppercase UI. The existing reader supplies command copying, step navigation, image zoom, practical checkboxes, knowledge checks and saved progress. There are 36 multiple-choice questions, including a seven-question final assessment. Completion requires the existing step/exercise/correct-answer gates; it is self-reported learning completion, not remote VM validation or a professional certification.

New course-only interactions provide a selectable enterprise request architecture, a trust chain, four case-sensitive command rehearsals and twelve evidence-based troubleshooting scenarios. Browser exercises never execute commands or fabricate live output.

## Practice environment and safety boundaries

The conceptual enterprise architecture is External users → Firewall → RHEL 9 DMZ application server → NGINX → Hosted application. The self-contained private practice route uses two small RHEL 9 VMware VMs on unused host-only VMnet6, 10.90.0.0/24: TLS-APP01 (.10) and TLS-CA01 (.20), with a Windows practice client (.254). This is explicitly not a full enterprise firewall/DMZ deployment or Internet publication.

`app.example.mil` is the specifically requested fictional service name, resolved only inside the private lab. No public DNS change, real DoD enrollment, invented DoD portal, DoD credentials or DoD-issued certificate is used. The practice hosted application is a static page, not an osTicket deployment.

The app key stays on the app VM. CA keys are encrypted on the separate signing VM. Only checked CSRs and public certificates move between machines. The protocol example uses RSA 3072 and TLS 1.2/1.3, without claiming FIPS or STIG certification. File owner/mode checks, SELinux policy-label verification, complete chains, hostname/purpose checks, versioned file paths, `nginx -t` before graceful reload and actual client-side validation are explicit. No insecure curl bypass, disabling SELinux or broad key permission fix is taught as success.

Root trust is scoped to a disposable Firefox profile or an explicit `--cacert`/`-CAfile`; no root is added to the Windows global trust store. Cleanup removes only the practice hosts entry and disposable profile. Known-valid, uncompromised pairs are the only permitted rollback candidates. A failed final lab can recover to a verified v3 baseline; it must not restore the deliberately expired fixture.

The local systemd timer checks the actual served certificate and HTTP endpoint; it does not auto-renew, email or page operators. Public-PEM filtering avoids saving session-ticket details in its temporary certificate file. Real alert delivery, revocation, key custody and production CA procedures belong to the organization’s approved systems.

## Visual provenance

`content/tls/references.json` and `screen-scenes.json` describe 100 step-specific local SVG instructional mockups. All are prominently marked **INSTRUCTIONAL MOCKUP — NOT A LIVE CAPTURE OR RESULT** and link their documentation basis. They depict Windows PowerShell, RHEL console commands/file contents, VMware, the RHEL installer, Firefox or the relevant architecture. Numbered markers identify the command/control and expected-result areas. Every picture is before the step check and Next Step navigation; full-size zoom uses the existing component.

No genuine RHEL/VMware/browser certificate-installation capture is claimed. Existing product screenshots are untouched. `tools/render-tls-screens.py` regenerates these mockups deterministically; manifest SHA-256 values are checked by tests.

## Created files

- `app/tls/page.tsx`, `layout.tsx`, `tls-interactives.tsx`, `tls-text.tsx`, `tls.css`
- `lib/tls-lab.ts`
- `content/tls/course.json`, `references.json`, `screen-scenes.json`
- `public/tls-lab/screens/*.svg` (100)
- `public/tls-lab/req.cnf`, `intermediate.ext`, `server.ext`, `app-tls.conf`
- `public/tls-lab/check-app-tls.sh`, `.service`, `.timer`
- `public/tls-lab/certificate-inventory.csv`, `make-expired-fixture.sh`
- `tools/render-tls-screens.py`, `verify-tls-crypto.py`, `check-tls-course.mjs`
- `tests/tls-course.test.mjs` and this review

## Modified integration files

- `lib/guided-courses.ts` registers the course and route; `nessus-curriculum.ts` adds optional per-step teaching fields and module grouping.
- `app/learning-pathways.ts` appends the TLS modules to Linux and isolates their lesson pagination; `career-pathways.ts` updates the subject description.
- `app/nessus/nessus-academy.tsx` renders optional teaching fields, course extras and the completion indicator using existing progress/quiz components.
- `app/course-screenshot.tsx` registers new mockup references; `app/lab-example-plan.tsx` and `lib/learner-directions.ts` explain the exact new machine roles and SSH workspaces.
- `tests/pathways.test.mjs`, `plan-access.test.mjs`, `beginner-overhaul.test.mjs` include new IDs and distinguish the real academy download URL from fictional lab identity.

## Validation and limitations

The available build, TypeScript, curriculum/companion tests and browser checks are run as recorded in the task report. `tools/verify-tls-crypto.py` uses temporary keys to test encrypted root/intermediate issuance, SAN/serverAuth validation, both CSR methods, same/new-key renewal, unique serials, key matches/mismatches, wrong-hostname and missing-intermediate failures, and a genuinely expired signed fixture with a repeat guard. All ephemeral keys are removed. This is an OpenSSL rehearsal on the workspace, not a RHEL/NGINX deployment capture.

The course browser test visits all 100 steps and checks all twelve scenarios, command case, progress gates/persistence, final assessment, completion, image order/zoom and responsive widths. The wider existing lesson regression and text-contrast audits check the full catalog.

Unfinished infrastructure validation: no live RHEL 9/VMware/Windows target lab is connected, so the full installer/network/SELinux/NGINX/browser workflow has not been rehearsed on those products. Genuine target screenshots would replace mockups after such a rehearsal. The public academy still uses its existing browser-saved progress; this task does not add Supabase, OAuth, paid labs or a public shell.

## Recorded checks for this release

- `npx tsc --noEmit`: passed.
- `npm test`: 119 curriculum tests passed; 3 companion tests passed; 5 Windows-only checks skipped on Linux.
- `npm run build`: passed, including the new `/tls` route.
- `python tools/verify-tls-crypto.py --endpoint`: passed the cryptographic workflow and temporary loopback HTTPS/monitor test; temporary keys removed.
- `tools/check-tls-course.mjs`: passed 13 lessons, all 100 step visuals, 12 troubleshooting scenarios, 36 quiz questions, persistence/gates/completion and 320/390/768/1440/1920 widths, with no browser errors.
- Existing `tools/check-learning-flow.mjs`: passed 243 selections / 423 sampled step states / five widths / no browser errors.
- `tools/check-teaching-readability.mjs`: passed all 243 selections with no detected text-contrast failure.
- Browser review images: `/workspace/task-review/tls-final/tls-install-desktop.png` and `tls-troubleshoot-mobile.png` (website UI captures, not RHEL target screenshots).
