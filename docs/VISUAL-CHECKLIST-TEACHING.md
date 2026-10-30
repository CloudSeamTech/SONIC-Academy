# Visual checklist teaching standard

Chosen design: Visual checklist (the third design preview).

Every lesson reader uses the same order:

1. A short step title and the machine/app to work in.
2. The relevant picture, with zoom and its original provenance.
3. Numbered actions with individual checkboxes.
4. Exact command/code blocks, when the procedure calls for them.
5. A visible result check and the existing evidence/verification control.
6. Optional explanation, recovery, and command help in expandable sections.
7. Previous/Next navigation.

The shared readers cover the entire catalog: the Linux/Wazuh walkthroughs,
Windows/migration/AlmaLinux guided labs, and all JSON-backed courses (including
PKI, vSphere, Nessus, security, Azure, Splunk, WSUS and MECM).

## Writing rules

- Start actions with a verb. Name the exact button, field, machine or shell.
- Give one action per row. Separate different screens into different actions.
- Put the exact input beside the field name. Explain any learner-specific value
  in the prerequisites; do not invent a value or conceal a required decision.
- Keep warnings, conditions and stop points beside the affected action.
- Put background explanations in Why?, and fixes in My result is different.
- Keep commands and configuration intact. Do not shorten them for appearance.
- Define success as an observable result, not simply “it worked”.
- A read-only explanation can use learning checks; it must not pretend to be
  an executed lab procedure.
- Show real capture/platform labels and vendor credits. An illustrated map is
  an illustration. A missing capture stays visibly marked screenshot pending.

## Compatibility

Existing lesson IDs, step indices, course progress keys, verification rules and
quiz answers are unchanged. Action notes use a separate browser-local namespace,
`sonic-visual-actions-v1:`. They do not award course completion or synchronize as
verified lab evidence. Edited action text invalidates its old action check.
Blocked storage keeps the current session usable and shows a notice.

This presentation cleanup does not establish that every legacy procedure has
been retested or that every screenshot gap has been filled. Keep those evidence
limits explicit when reviewing and extending the curriculum.
