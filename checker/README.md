# Checker release preparation

The Windows foreground client source is in `windows/CloudSeam-LabLink.ps1`. It deliberately refuses to run until its release certificate is pinned and its Authenticode signature is valid. It never changes execution policy. Do not publish this source as a ready-to-run student download.

Release work:

1. Review and test the bundled DC01 collector against supported disposable Windows Server VMs, including missing roles/tools/permissions. Never install IIS on the domain controller for this pack.
2. Obtain the CloudSeam code-signing certificate through the signing provider. Keep its private key in the signing service; do not put PFX files, passwords or keys in this repository.
3. Stage the foreground client and `public/verification/CloudSeam-DC01-Check.ps1` together in a private release folder. Pin the approved signer's thumbprint in the client before signing. Sign both staged scripts with SHA-256 and a trusted timestamp. Do not overwrite the unsigned local-report preview or its hash manifest.
4. Verify both publisher signatures on a clean Windows Server VM. Package the files with exact versions, SHA-256 hashes and concise run/stop/revoke instructions. Use a trusted HTTPS download location.
5. Test installation/download under the supported execution policy without bypasses, the full pairing handshake, network failures, code expiry, lease expiry, revoked sessions and actual checks. Archive release evidence and reviewer approval.
6. Record the approved package URL, publisher, version, ZIP hash and certificate thumbprint in `config/lab-link-release.json`. Only then enable both backend release gates. The API checks the manifest and supplies download details to the student UI. No auto-update or Windows service is implemented in this first foreground client.

The client holds its one-hour device credential in memory and stops after 55 minutes; refreshing the website requires signing in again. It polls at about ten seconds, with bounded failure backoff. Ctrl+C stops local polling; website revocation invalidates access immediately on the server. A timed-out upload is not silently counted as a pass. Rerun via the website after resolving it.

Linux/NGINX is a separate release pack: its collector, permission requirements and enterprise checks are not implemented here. Do not give a Linux machine the Windows DC01 pack. Use local/manual evidence until that pack is reviewed and released.
