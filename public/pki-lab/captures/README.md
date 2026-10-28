# Genuine PKI lab captures

Captured on 2026-10-28 by foregrounding the VMware window and using Windows screen-copy APIs, with the owner's explicit authorization. The normal desktop capture tool was failing even on blank Notepad. Originals preserve the complete VMware window; SVG teaching copies embed the original PNG, crop to the terminal, and add numbered overlays. They are not generated images or mockups.

The AlmaLinux images show AlmaLinux **10.2**, OpenSSL **3.5.5**, and genuine read-only inspections of fixtures in `/home/cyclops/sonic-tls-supplement.PoZVjWwW`. The commands were executed in the logged-in guest terminal through a capture-display script launched over authorized SSH. Printed command labels identify the actual inspection commands; they are not a recording of manual typing. The website name `app.example.mil` is fictional and retained from the existing TLS course. No private-key contents were displayed.

Available: environment/package inventory; CSR signature/SAN and key validity; root/intermediate/leaf constraints; correct/wrong hostname verification; v1/v2 expiration dates and a 30-day check. v2 issuance is not proof of a completed service renewal.

Windows Server 2022 captures show the genuine Certificates (Local Computer) store overview and expansion of Trusted Root Certification Authorities to reveal its Certificates child. These are navigation references, not evidence of an imported certificate or working IIS binding. The owner signed in and started the already installed SSH service locally. The console was opened with a temporary interactive task; capture-related tasks were unregistered afterward. IIS was not installed, no trust stores were changed, and no Windows certificate request was generated.

Not captured or validated: NGINX installation/configuration/HTTPS, OS trust-store import, browser validation, external PKI-team submission, IIS request/completion/bindings, osTicket hosting or service rollback. NGINX and IIS were absent at inventory. The owner prohibited installing IIS. Missing captures must remain explicitly incomplete.

`content/pki/references.json` records original and annotated SHA-256 hashes and review status. Run `node tools/annotate-pki-captures.mjs` to rebuild annotations from the unchanged originals. Never use these supplemental results as evidence of RHEL 9 testing or learner completion.
