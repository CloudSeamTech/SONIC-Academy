# VMware vSphere System Administration

Route: `/vsphere`. Subject `vsphere` is under Windows System Administration.
22 chapters / 47 guided steps cover concepts and access, planning, ESXi install,
management/DNS/time, vCenter setup and host connection, standard networks and
port groups, VMFS/NFS and capacity, server creation, guest validation, templates,
Content Libraries, snapshots, clusters/migration, monitoring, permissions,
maintenance, backups and a junior-administrator handoff.

The vSphere 8 workflow is a teaching baseline, not a claim of latest-release
coverage or live validation. Published VMware/Broadcom source screenshots may
show historical interfaces; their exact context and build limits are stated.
Eleven source PNGs are retained unchanged, with SHA-256 provenance and numbered
SVG overlays. These are official reference screens, not CloudSeam lab captures.
Missing exact-action screenshots remain explicit capture gaps. All images use
the existing CourseScreenshot placement before Next step.

There is no dependency on obtaining a vCenter evaluation. Walkthrough-only
study is always possible. Standalone ESXi practice covers supported host tasks;
vCenter workflows need an authorized environment or an available hosted lab.
Free ESXi cannot join vCenter, and licensed enterprise features are gated in
the written prerequisites. No license bypass, trial reset or unofficial ISO is
recommended. No host, Windows VM or AlmaLinux VM is changed by these files.

Existing lesson IDs and progress keys remain intact; vSphere chapters use a
separate `vsphere-*` sequence. Overall percentages can change when the catalog
grows, without deleting older completions. Walkthrough notes are explicitly not
live execution evidence.

Regenerate course JSON: `node tools/author-vsphere-course.mjs`.
Regenerate overlays after reviewing source images: run
`tools/annotate-vsphere-references.py` with Pillow. Source URLs, retrieval date,
publisher context, original hashes and annotation keys are in
`content/vsphere/references.json`. Publisher copyright and source redactions are
retained. No generated UI or mockup is represented as a product screenshot.
