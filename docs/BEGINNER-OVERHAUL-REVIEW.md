# Beginner curriculum overhaul

The retained catalog has 230 lesson selections across 18 subjects. Routes, lesson IDs, existing completion keys and knowledge-check answer positions remain stable.

## Teaching changes

- Use reserved fictional `lab.example.test`, `migrate.lab.example.test` and `azure.lab.example.test` examples. Keep the actual academy website, support address, authentication and hosting configuration on the business domain.
- Explain the job of each example server and application before the procedure. Distinguish a private osTicket/MariaDB build from the separate DMZ gateway/private IIS test-page exercise, and a fake SQL training database from either application’s live database.
- Add step-specific workspace labels to all 440 original Windows workbook steps and 72 AlmaLinux desktop steps. Distinguish the physical Windows host, VMware guest and Azure guest, including the host-side Az PowerShell versus guest-side Windows upgrade operations.
- Show a concrete starting instruction for the relevant app. Keep descriptive sentences attached to their action instead of numbering them as separate tasks. Put Linux commands before their supporting pictures.
- Replace generic Windows success messages and truncated headings with identifiable results and short titles. Preserve specialist commands and recovery requirements; fictional names and application labels are updated consistently in commands and downloads.
- Retain knowledge checks, retries, verification gates, original pictures and picture placement before step navigation.
- Use a single darker cream teaching surface (`#D7C8B2`) with charcoal lettering. Purple controls remain `#7040A8` with white lettering. Expanded interactive teaching diagrams and terminal setup Copy controls follow the same readable palette.

## Small practice resource plan

The beginner lab guide explains growable disks, the separate preallocation checkbox, host-space monitoring and shutting down unused VMs. Tiny practice DCs can begin at 1 vCPU and 2 GB RAM with a 60 GB growable disk and a 4 GB memory fallback. SQL-only practice has a separate small option; MECM/site SQL, WSUS and other heavier services keep their own requirements. No blanket 2 GB allocation is applied to those workloads, and no fixed promise is made about actual host disk usage or cloud cost.

## Visual provenance

All 251 pre-existing PNG/JPG/JPEG/WebP assets were checked against their pre-edit SHA-256 hashes and remain byte-for-byte unchanged. Existing owned vector diagrams retain their purpose and paths; example labels and teaching colors are synchronized with the new prose. No new product-interface screenshot was generated or represented as a live result. Retained vendor images can show other example values or versions; the written fictional values and existing source/version caveats control the exercise.

There is still no connected live VMware/Windows/Azure lab for recording new target screenshots or executing the full infrastructure build. The reference inventory retains that distinction; partial vendor references and diagrams are not promoted to reviewed target captures.

## Verification

TypeScript and the 33 curriculum test files cover the existing course, progress and visual contracts plus new workspace-routing and fictional-domain checks. Browser validation covers 230 lesson selections, 397 step states and widths of 320, 390, 768, 1440 and 1920 pixels. Focused checks exercise the help desk knowledge-check retry, image order, AlmaLinux host/installer/Files contexts, Azure upgrade host/guest contexts and the beginner guide layout.

The browser readability checker opens optional explanations and measures rendered text against its nearest opaque CSS background. It excludes original image content and disabled buttons. It is a useful regression check rather than a full accessibility certification. Reports and browser screenshots are retained outside the published source under the session review directory.
