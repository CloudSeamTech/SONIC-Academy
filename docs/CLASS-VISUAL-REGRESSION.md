# Class layout and beginner review

Reviewed 2026-10-30. Applies to the existing shared readers, not a new theme.

## Changes

- Remove outer boxes from class progress, Passport, title and lesson-picker areas. Keep input boundaries, purple class tabs, darker cream teaching panels and the sidebar.
- Use one header/content width and gutter. Let long control labels and terminal headings wrap.
- Reserve space for disclosure arrows so they do not collide with multiline labels.
- Keep class search and focus controls in normal document flow so they cannot cover lesson text.
- Show the original Linux class's plain-language goal without repeating its title. Add optional terminal basics and a glossary selected from each lesson's vocabulary. Daily Admin Tasks remains separate.

## Verification

- Browser entry-page review: all 22 classes at 1280px and 390px. No document overflow, clipped headings/buttons/labels or boxed class headers were detected.
- Mobile navigation: next-step checks across the class readers; 320px review includes final dropdown steps where available. The Azure Operations rehearsal table intentionally scrolls inside its existing table container.
- Visual review: desktop class header, Linux terminal block, expanded beginner help and narrow-screen disclosure labels.
- TypeScript and production build passed. 134 Windows-compatible regression checks passed, including original Linux lesson order, unchanged Daily Admin commands, saved-progress boundaries and screenshot provenance.
- Full Linux CI runs on the pull request. Browser geometry checks cover representative entry and selected later steps, not every combination of every lesson and expanded panel.

No VM commands were executed for this presentation review. No command payloads, lesson IDs, course membership, progress keys or screenshot assets were changed.
