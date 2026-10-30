# Linux Daily Admin Tasks on RHEL / AlmaLinux 9

## Delivery

- Route: `/linux-admin`, first lesson `/linux-admin#lesson=daily-start`.
- Existing Linux Administration subject inside Linux System Administration; no new sidebar or redesign.
- 20 ordered lessons, 76 meaningful steps with 76 matched terminal illustrations, 35 detailed sample-output panels, 8 interactive reasoning cases, 47 knowledge-check questions (including a six-question final).
- Reuses the existing reader, screenshot zoom, copy-command buttons, step picker, readiness check, practical attestations and normalized browser progress. Course completion requires all lesson self-verifications; it is not a remotely validated certification.
- Existing saved progress keys and all previous routes remain intact.

## Coverage

Setup and safe working directory; file navigation/help; morning baseline; full bytes versus inodes; deleted-but-open files; separate-disk LVM/XFS growth; failed service repair; logs/retention; CPU/memory/I/O; network layers; SSH identity and access recovery; NGINX application checks; mode/ACL/path access; users and sudo; SELinux; pilot patching/rolling maintenance; archive integrity/restore; time and timers; interview incidents; capstone/cleanup.

Every step explains what, why, where, exact commands, arguments, expected observation, verification and failure recovery. Values in sample tables are illustrative. Students must compare real evidence rather than assert a fabricated result.

## Files

Created: `app/linux-admin/{page.tsx,admin-practice.tsx,admin.css}`, `content/linux-admin/{course.json,references.json}`, 76 `public/linux-admin/screens/*.svg`, `tools/render-linux-admin-screens.py`, `tools/check-linux-admin-course.mjs`, `tests/linux-daily-admin.test.mjs`, this review and `.agents/skills/linux-lab-authoring/SKILL.md`.

Modified: guided-course registration, Linux pathway/lesson sequencing, screenshot registry, accurate class-specific example-name guidance and shared reader for the new class's header/progress/practice/final assessment. Existing pathway and tier-count regression tests now include the new course. No account tier, billing, authentication or deployment settings changed.

The local repository skill is reusable guidance for future Codex work, not an installation into every ChatGPT conversation. Existing plugin-management, cloud-environment and React guidance were reviewed; no additional plugin is required or installed.

## Safety and accuracy

- Requires a disposable RHEL 9 or AlmaLinux 9 VM, correct sudo authorization and console recovery. RHEL entitlement/repositories remain distinct from AlmaLinux.
- Space exercises allocate only 8 MiB. No intentional root-disk exhaustion. CPU example stops after 10 seconds; deleted-file holder expires after 10 minutes.
- LVM uses a newly added, positively identified empty 2 GB disk, a new `sonic_lab_vg`, and a 512 MiB LV grown to 768 MiB. No root-disk initialization, blind device assumptions or XFS shrink instructions. Manual disk verification remains essential.
- Faults affect named disposable units/pages/files only. Cleanup is conditional on ownership/creation and includes deliberate destructive-storage warnings.
- No broad firewall opening, root SSH enablement, chmod 777, SELinux disabling, curl trust bypass, random log deletion or guaranteed package rollback claims.
- No production HA guarantee, official Red Hat certification claim or automatic VM execution. RHCSA-style fundamentals and interview reasoning support independent practice.

## Verification and limits

TypeScript, project build, full existing/new unit suite, command syntax for all 76 blocks, visual manifest hashes, bounded file creation/backup/restore operations, browser step/image/navigation/progress/quiz/decision checks and responsive widths 320/390/768/1440/1920 are checked during delivery.

All 76 visuals are labeled **instructional mockups, not live captures**. This cloud workspace has no connected student VM. RHEL/AlmaLinux systemd, NetworkManager, SELinux, package updates and destructive LVM exercises have **not** been executed on the student's actual VMs. Genuine VM captures and target-OS validation remain follow-up work after supported private access is configured.

Progress is browser-local using the existing application behavior, not a newly provisioned Supabase account database. The reasoning case choices are practice feedback; the shared lesson quiz/practical/step checks drive persisted completion.
