# CloudSeam beginner lesson standard

Required for every published class and every new or edited task. The shared Studio layout is live. A shared layout or a passing build does not certify that the lesson's teaching has been reviewed.

## Exact-route requirement

Use the NextWork teaching sequence as a reference: orient the learner, show one concrete action, show the matching visual, check the result, briefly explain why. Write original CloudSeam instructions; do not copy private project text or infrastructure details.

For each task, supply:

1. **Start here:** machine role, application, required access, and starting screen or working directory.
2. **Follow this route:** the actual website URL and menu labels, or application → screen → control. Do not substitute “configure,” “obtain,” “set up,” or “validate” for the missing procedure.
3. **Do this:** one click, field entry, keypress, or complete command input at a time. Explain learner-specific placeholders before they appear. Show fixed syntax separately from values the learner changes.
4. **Look here:** the screenshot for that action, with its annotation key. Keep original screenshot colors; identify vendor references and instructional mockups honestly. A generic diagram does not count as an exact application screenshot.
5. **You should see:** a specific result, including normal empty terminal output where applicable.
6. **Why:** one short workplace reason. Put optional depth behind help, not ahead of the task.
7. **If different:** one concrete recovery or stopping point, with a relevant official link.

Research menu labels, download access, supported versions, licensing, prerequisites, and compatibility against current primary vendor documentation. Name the tested or documented baseline and review date; never call a version “latest” without checking. If UI access is unavailable, say “vendor-documented route,” not “lab tested.” Do not invent a universal boot key, vendor menu, checksum, or account entitlement.

The center contains ordered steps, task visuals, commands and success checks. The right panel follows the current step with its exact links, short purpose, prerequisites and private notes; provide equivalent links inline on phones. Preserve lesson IDs, command semantics, progress and profile behavior.

## Completion evidence

Audit the complete catalog using `node --experimental-strip-types tools/audit-course-teaching.mjs`. This includes split VMware/Windows lessons and every structured course, not only the legacy screenshot report. Keep incomplete reviews visible in the maintainer report. A lesson is complete only after its exact directions, links, visual associations, success checks, recovery, and browser behavior have been reviewed; never mark it complete based on generated metadata alone.

- Begin with one practical workplace outcome and the machine, application, account and starting folder the learner needs.
- Put the current step and its matching screenshot first. Label illustrations and vendor references honestly. Match every numbered annotation to its explanation.
- Give exact clicks or one complete command input at a time. Students type commands; do not add command-copy or automatic-fill controls.
- Show the prompt and working folder in terminal examples. Explain which prompt characters are contextual and which symbols are part of the actual input. Preserve variables, redirects and continuation syntax.
- Explain unfamiliar words where used: `/` is the root directory; the root account is a separate concept. Distinguish fixed syntax from learner-specific names, addresses and paths.
- Under the visual, briefly explain what the action does and why it matters. Use direct, friendly language without assuming prior command knowledge.
- State the expected result before the next action, including normal empty output. Describe a specific recovery action or stopping point for an unexpected result.
- After guided practice, ask the learner to perform a small variation independently and record evidence in their private notebook. Do not claim self-reported evidence proves a live machine configuration.
- Finish with a recap, appropriate assessment, and explicit cleanup or rollback choices.

Reviewed teaching references: the user's NextWork Satellite and Linux Users, Groups, and Permissions projects. Adapt the teaching sequence in original CloudSeam wording; do not copy private infrastructure details or substitute unrelated screenshots.
