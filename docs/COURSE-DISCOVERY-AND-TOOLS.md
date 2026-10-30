# Course discovery and lesson shortcuts

Updated 2026-10-30.

PKI Certificate Management is a standalone course in All Courses and Explore More Courses, with two server tracks. It is no longer a career pathway. Its entry URL is `/?view=courses&course=pki-certificate-management`; the earlier `/?view=paths&path=pki-certificate-management` link still resolves to the course. Track routes, lesson IDs, completion checks and saved-progress keys are retained. Dashboard progress combines both tracks for the course card, while each track keeps its own progress.

The former learning slogan is removed. Class pages have four practical shortcuts: Picture, Instructions, Check result and Help. They find the currently visible step, scroll to the relevant section and move keyboard focus there. Help opens a disclosure. Shortcuts never execute commands, tick checks or award completion, and scrolling respects reduced motion.

The PKI course page has a clickable certificate lifecycle explorer. Selecting Request, Issue, Install, Validate or Renew changes a short explanation; the selection is a learning aid, not a lab completion record.

## Review

- Course/pathway tests account for every subject and lesson exactly once; PKI progress isolation remains tested.
- All four shortcuts exercised in all 22 class readers, plus the original Linux reader after switching steps.
- Course catalog, old PKI link, stage selection and 320px layouts reviewed in the browser.
- TypeScript, production build and Windows-compatible tests run locally; full Linux CI runs on the PR.

## Design references

These are research references, not copied assets or claims of an integration:

- [KodeKloud learning paths](https://kodekloud.com/learning-paths/): clear course/path organization around career goals.
- [NextWork work-page improvements](https://blog.nextwork.ai/p/weekly-release-easier-sharing-better): keeping project instructions, work and progress connected.
- [Microsoft Learn authoring template](https://github.com/microsoft/aed-learn-template): practical exercises and knowledge checks. The reference repository is archived.

Recommended next additions: clickable lab topology maps, private evidence notebooks and a guided-to-independent practice mode. These are proposals; hosted VM sessions, automatic lab validation and evidence synchronization are not added by this change.
