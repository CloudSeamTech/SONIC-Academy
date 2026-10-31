# Quiet Desktop overhaul — 31 October 2026

The shared academy shell now uses white global navigation, a slate course outline, a grey canvas with a faint yellow hexagonal wash, and a regular vector hexagon brand. Existing course routes, profile integration, progress stores, bookmarks and completion rules remain in place.

Lessons retain authored commands, prompts, screenshots, provenance and recovery notes. The current step appears before setup disclosures in the Nessus-family reader. The original Linux reader places its walkthrough first. Windows and migration readers place the focused walkthrough before the general change reminder. Additional maps, notebooks and assessments remain available below the lesson. Checking an action does not verify a remote machine or award lesson completion.

The new Pathways selector exposes the existing four career pathways and original subject links. PKI remains a standalone course with its two server tracks. No remote connection or provisioning interface was added.

Validation:

- 149 Windows-compatible repository regression checks passed in the clean validation checkout. Three existing Linux shell-dependent checks are excluded locally and run in CI.
- TypeScript validation passed.
- Browser review covered 23 course entry lessons: shared shell present, visible reference present, no broken visible images, no horizontal overflow.
- Phone-width review at 390px: navigation and lesson-outline drawers open and close; Escape dismisses navigation; no horizontal overflow; both sampled knowledge-check questions preserve a 16px gap between question and first answer.
- Checklist collapse and reopen preserve mounted controls. Existing Previous / Next step controls work.

Illustrations remain labeled as illustrations; the generic location guide is explicitly labeled “Instructional guide · not a screenshot.” No backend machine access is claimed.
