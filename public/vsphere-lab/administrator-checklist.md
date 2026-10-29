# Junior vSphere administrator evidence and handoff

For each item record: object | timestamp | actual result | evidence | owner | recovery.
Use PASS only for a real successful check. Otherwise use FAILED, UNTESTED,
WALKTHROUGH ONLY or NOT AVAILABLE UNDER THIS EDITION.

- Access route, actual build, licensing limits and permissions.
- Host boot, management identity, forward/reverse DNS and synchronized time.
- Out-of-band or local console recovery path.
- Unchanged management switch and documented VM network path.
- Datastore identity, correct backing device, free space and growth headroom.
- Guest identity, supported tools, intended NIC and disconnected installer ISO.
- Actual service response from an allowed client.
- vCenter only: host connection, template deployment with unique identity,
  Content Library scope, migration prechecks and post-migration service test.
- Snapshot owner, reason, cleanup date and absence of consolidation warnings.
- Named account access, least privilege, certificate owner and expiry.
- Maintenance preflight, evacuation/shutdown plan and supported target build.
- Independent appliance and workload backups; isolated restore test evidence.
- Known-good recovery procedure, escalation owner and remaining gaps.

Label official vendor screenshots as references, never as your own lab result.
Redact secrets before capturing or sharing evidence. Remove only named approved
disposable artifacts after checking dependencies.
