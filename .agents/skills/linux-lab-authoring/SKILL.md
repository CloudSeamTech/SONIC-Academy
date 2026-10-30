---
name: linux-lab-authoring
description: Author or review beginner RHEL/AlmaLinux administration labs in SONIC-Academy using the existing reader, honest visuals and bounded fault exercises.
---

Read the current repository instructions and existing course schema before editing. Preserve navigation, visual tokens, routes and saved progress keys.

For each meaningful step provide: what, why, exact workspace, numbered actions, copyable exact-case commands, argument explanations, expected observations, verification and recovery. Define a new term before relying on it. Use plain language suitable for someone who has never opened Terminal, without talking down to adults.

Start diagnostic tasks with impact/scope and read-only evidence. Explain why the next check follows from that evidence. Finish with the original user-visible task and a short handoff. Distinguish facts, hypotheses and simulated evidence.

Use disposable named files/services and resource-bounded failures. Never fill the root filesystem, break the student's only SSH connection, initialize an unidentified disk, remove unknown logs or disable security as a shortcut. Require explicit disk identification, separate lab storage, backup/recovery planning and least privilege. Teach XFS growth versus ext4 correctly; do not suggest XFS shrinking. Preserve incident evidence before retention changes.

RHEL and AlmaLinux are distinct distributions. Label the actual captured system. Explain entitlement/repository differences. Never claim a mockup is a real screenshot or a local/container test proves behavior on the student's VM.

Reuse CourseScreenshot and lesson progress. Every meaningful step needs a matched visual before Next Step. For unavailable captures render explicitly labeled instructional mockups from the exact commands and expected observations. Preserve command case, complete output and readable mobile zoom. Use existing teaching surfaces rather than introducing a new website theme.

Include practical checks, explained quiz feedback and realistic interview reasoning. Completion is self-verified unless a real authorized backend checks the environment. Do not imply an official certification, automatic VM execution or account-backed persistence that does not exist.

Validate schema/routes/progress, command syntax, visual coverage, responsive browser rendering and the project build/tests. Verify bounded exercises on the actual target OS when available; list what remains unvalidated. Keep credentials out of logs, screenshots and Git.
