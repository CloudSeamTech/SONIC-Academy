# Lab checks: proposed first release

Status: a DC01 local-report preview is implemented. The unsigned PowerShell collector reads local facts; the browser evaluates an imported report and displays per-check results. Other lessons explicitly report that no automated pack is available. No hosted VM connection, provisioning or certified grading is implemented.

Current production blockers: publisher code signing and a real authenticated account/result-storage backend. Do not turn the unsigned preview into an internet-facing command runner or weaken execution policy to make it run. Genuine Windows Server/DC01 execution and supported failure-state testing remain required before production release. Current automated tests use explicit fixtures/mocked collectors; they are not a real VM validation run.

## Student flow

1. Select the Windows Administration lesson and enter their own expected DC01 hostname, address and domain in a private lab profile.
2. Download a versioned, signed checker, inspect its declared checks, and run it locally on the disposable lab VM. No password is entered on CloudSeam.
3. Start with a local report. The page imports only the structured check results after the learner chooses the file. Label this **local evidence — self-reported**, because an uploaded file can be edited.
4. A future paired connector on the VMware host could run approved, read-only checks against that VM using local credentials. It would send a small result over outbound HTTPS to a scoped authenticated API. No public inbound RDP, WinRM or SSH port is needed.
5. Show each check’s expected value, observed value, time, target, evidence provenance and a short repair. Allow rerun after the repair.

## First DC01 check pack

| Check | Expected result from lesson/profile | Evidence source |
| --- | --- | --- |
| Target identity | Selected VM is DC01 | Local hostname / OS identity |
| Network | Expected address and prefix | Get-NetIPConfiguration / Get-NetIPAddress |
| DNS client | Lesson’s expected DNS servers | Get-DnsClientServerAddress |
| Roles | AD-Domain-Services and DNS installed where required | Get-WindowsFeature |
| Promotion | Expected domain and DC identity | Get-ADDomain / Get-ADDomainController |
| Services | AD DS, DNS and Netlogon service state | Get-Service |
| Shares | SYSVOL and NETLOGON present | Get-SmbShare |
| DNS registration | Appropriate DC DNS records resolve | Resolve-DnsName; selected dcdiag DNS tests |
| Replication | Partner checks only once DC02 is expected | Repadmin / selected dcdiag tests |

Exact expected DNS/IP values depend on lesson phase and lab topology. Do not use a universal DNS value for every DC. A running role does not prove successful promotion. Never use `dcdiag /fix` in a read-only check pack. Define supported command permissions and OS versions before shipping.

## Result semantics

- Pass: observed value meets this versioned rule.
- Fail: observed value was obtained and differs.
- Not checked: required permission, dependency or supported tool is missing.
- Running / connection failed / stale: separate transport and time states, not a failed configuration test.

Checks must use stable structured values where possible, not a naive search for “passed” in localized console output. A green pass applies only to the named check and time; it does not certify a secure domain or every lesson task.

## Boundary and integration

The existing local-companion is a loopback-only terminal service and accepts loopback web origins. It is not a public-site connector or a verifier. Preserve those protections; do not add permissive CORS or expose that service.

For hosted verification, add a separate pairing flow with short-lived, revocable lab/device identity, authenticated user ownership, per-lesson check-pack versions, server-side rule evaluation, signed result envelopes, nonce/replay protection, rate limits and deletion controls. Keep raw logs local by default and send minimum non-secret facts. Do not accept arbitrary PowerShell from the website. Use an allowlisted, versioned check pack; explicit reruns cannot mutate the VM.

A compromised learner-controlled host can still forge evidence. Label provenance honestly; reserve stronger assessment claims for controlled, platform-owned labs.

RDP/SSH console access is a separate feature from checking configuration. It can come later through an authenticated relay/gateway, but a desktop connection alone cannot produce trustworthy green checks.

## Delivery order

1. Read-only DC01 checker and local report, tested against deliberately correct and incorrect lab states.
2. Private import and per-check feedback in preview; no automatic course completion from imported evidence.
3. Authenticated outbound connector and saved check history after the account/backend design is ready.
4. Optional remote console integration, separately scoped and reviewed.

References: [Microsoft dcdiag](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/dcdiag), [DNS verification for AD replication](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/troubleshoot/verify-dns-functionality-to-support-directory-replication).
