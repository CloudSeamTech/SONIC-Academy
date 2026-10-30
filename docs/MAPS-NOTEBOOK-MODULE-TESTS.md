# Lab maps, private evidence and module tests

Reviewed 2026-10-30. Existing class routes, lesson IDs, commands, screenshots, progress keys and completion rules are retained.

## Clickable maps

Every class has a planned-role map opened by the Lab map shortcut. Selecting a role shows its job, workstation/guest/browser context and appropriate read-only identity checks. The learner records hostname and IPv4 labels per role. These labels are device-local and profile-scoped. This is not discovered topology, a connection test or automatic VM access. Existing Passport values are not silently assigned to an arbitrary server role.

## Private evidence notebook

The Notebook shortcut opens a lab-specific editor; My profile also provides a grouped lab picker and saved-note list. Notes support title, result/recovery text and up to six PNG/JPEG/WebP screenshots, each at most 5 MB. Binary headers are checked and images render from local Blob URLs. Scriptable SVG is not accepted.

Entries live in IndexedDB with an owner index, outside the academy progress-sync namespace. Guest and account records are separate. No notebook upload or Supabase synchronization is implemented. Browser-profile access is not an encryption boundary, and browser-data clearing can remove records; the interface states both limitations. Export produces a local JSON backup, with screenshots embedded, limited to 40 MB of image data per export. A selected lab limits the export to that lab.

Moving a note to trash is recoverable. Restore keeps its screenshots. Draft fields remain visible after a save failure. Stored screenshots and exports should exclude secrets.

## Module practice

The 73 existing catalog sections define the module boundaries. Each has ten distinct questions at its final lesson, plus a link from earlier lessons. The sets reuse suitable authored course checks and a bank of 142 original supplemental questions, ranked by module topics; questions may recur across modules. Options rotate deterministically, so existing attempts can be regraded reliably.

All ten answers are required. Submission shows score, explanations and references. The academy practice target is 8/10, not a vendor exam passing standard. Retakes retain the best saved score; version signatures prevent revised questions from inheriting older scores. Attempts save locally for the current profile and never award hands-on lesson completion. RHCSA is a performance-based exam; these questions are concept practice, not a replacement for practical preparation or full blueprint coverage.

## Official alignment references

- [AZ-104](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104): Azure administration and Azure migration prerequisites/validation. Skills measured April 17, 2026.
- [AZ-802](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-802): current Windows Server administration; Windows domain-migration sections use this reference rather than claiming AZ-104 covers them.
- [RHCSA EX200](https://www.redhat.com/en/services/training/ex200-red-hat-certified-system-administrator-rhcsa-exam): current RHEL 10 objectives. Existing RHEL 9 course labels remain accurate; Wazuh and PKI additions are course/product practice rather than claims of full exam alignment.
- [Configuration Manager](https://learn.microsoft.com/en-us/mem/configmgr/), [SQL Server](https://learn.microsoft.com/en-us/sql/sql-server/), [certreq](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/certreq_1), [Splunk Core Certified User](https://www.splunk.com/en_us/training/certification-track/splunk-core-certified-user.html), [VCP-VVF Administrator](https://www.broadcom.com/support/education/vmware/certification/vcp-vvf-administrator), [Nessus](https://docs.tenable.com/nessus/Content/GettingStarted.htm): selected platform knowledge. Existing product/version labs do not promise complete current certification coverage.

Questions are original course practice, not copied official exam questions. Certification mappings are reference labels; the academy does not issue vendor certifications.

## Verification

- Schema/scoring tests cover all 73 modules and ten complete questions each, invalid/sparse answers, score threshold, reference versions and question signatures.
- Scope tests keep notes/maps/attempts out of public progress synchronization; attachment tests reject SVG, renamed text and oversized files.
- Browser: map label save/reload, ten-answer submission and ten explanations, saved score reload without lesson completion, screenshot save/reload, trash/restore, profile access and a JSON export containing the screenshot.
- Mobile 390px checks across all 22 class readers confirm module tests, notebook and planned maps exist without horizontal overflow. Selected 320px and desktop layouts are also reviewed.
- Windows-compatible tests, TypeScript and local production build pass. Full Linux CI runs on the release PR. No VM procedures were executed during these UI tests.
