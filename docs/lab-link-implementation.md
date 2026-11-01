# Lab Link: concrete connection contract

Status: backend source, private PostgreSQL migration, email-code sign-in/pairing UI and a release-gated Windows checker source are prepared. The actual API adapter/migration have local PostgreSQL integration tests in addition to the protocol model. No hosted Supabase connection, signed installer or remote VM validation is available yet. The current local-report preview remains separate. Follow [the owner setup checklist](lab-link-setup.md) before enabling a deployment.

## Chosen connection

Run the checker **inside the student's VM**, initially as a foreground program. The checker initiates short HTTPS requests to CloudSeam. Replies travel back over those same requests through VMware NAT and the student's router. CloudSeam does not dial the VM's private address.

No public IP entry, static public IP, inbound firewall opening, port forwarding, RDP or SSH is required. The service can see the normal internet source address, but authorizes the student and paired device by credentials, never by that address. Different students can use the same private IP range.

## Student sequence

1. Sign in, select the class and save the expected hostname, FQDN, IP and domain required by that class. Example: hostname `DC01`, domain `lab.example.test`, FQDN `DC01.lab.example.test`.
2. Select **Pair a machine**. The website shows a one-use enrollment code valid for 10 minutes.
3. In the VM, verify the signed checker's publisher, open it and type the enrollment code. Never enter a server password on CloudSeam.
4. Read the confirmation number displayed by the checker. Enter it on CloudSeam, verify the VM name and approve it. Approval alone does not mean Connected.
5. The approved checker polls over HTTPS. A successful authenticated poll enables Connected. The initial design expires its device session after one hour and marks it stale after 45 seconds without contact.
6. Select **Run class checks**. A poll returns a reviewed check-set identifier and version, not script text. The bundled checker reads local observations and submits them with a one-use job lease.
7. The backend compares observations with the saved requirements. Display expected and observed values, time, target, evidence limitations and pass/fail/not-checked per supported task. Manual tasks remain manual.
8. Correct a failed setting and rerun. Stop the checker or revoke the device to end access. Revocation cancels outstanding work immediately at the service.

Polling every approximately 10 seconds is an initial target, not an uptime or latency guarantee. Use bounded retries with backoff and jitter; do not queue duplicate work while a run is active.

## Prepared API, not deployed or enabled

The route handler is `app/api/lab-link/[...path]/route.ts`; server logic is `lib/lab-link-server.ts`. It fails closed without both environment gates, complete server configuration and released checker metadata. Codes and device credentials are returned once; hashes enter the database.

| Operation                                    | Authentication              | Required behavior                                                                                                    |
| -------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `POST /api/lab-link/pairings`                | Verified student session    | Validate supported class and lab plan; issue enrollment code once; store only its hash.                              |
| `POST /api/lab-link/enroll`                  | One-use enrollment code     | Atomically claim code; return random device credential and confirmation number once. No jobs until owner approval.   |
| `POST /api/lab-link/pairings/:id/approve`    | Owning student session      | Verify confirmation and expiry; reject foreign owner as not found; revoke after repeated wrong confirmations.        |
| `GET /api/lab-link/pairings/:id`             | Owning student session      | Return safe status and last contact, never credential hashes.                                                        |
| `POST /api/lab-link/pairings/:id/runs`       | Owning student session      | Snapshot server-validated requirements and queue one supported class job.                                            |
| `POST /api/lab-link/poll`                    | Scoped device credential    | Return only bundled check-set ID/version and a two-minute lease, or no work.                                         |
| `POST /api/lab-link/runs/:id/observations`   | Device credential and lease | Enforce device/run scope, size/schema, expiry and one-use consumption. Evaluate on server; ignore client pass flags. |
| `GET /api/lab-link/pairings/:id/runs/:runId` | Owning student session      | Return task results and provenance.                                                                                  |
| `DELETE /api/lab-link/pairings/:id`          | Owning student session      | Revoke credential, cancel pending work and record audit event.                                                       |

Never place credentials in URLs or logs. Use trusted HTTPS with normal certificate validation. Do not add arbitrary command, executable download, repair or shell fields to the job payload. New packs require review and a versioned checker release.

## Durable backend and account boundaries

Use Supabase Auth for verified student identity and Postgres for pairings, device credential hashes, immutable requirement snapshots, runs, lease hashes, observations, results and audit events. Keep backend secrets server-only. Derive owner identity from the verified session, never a request body or test header.

Private tables have row-level security enabled and no browser access policies. Only the server-only RPC reads/writes them after API authorization; each owner operation explicitly scopes its query. Students cannot write evaluated result rows or grant device access directly. Enrollment, approval, lease acquisition, submission consumption and revocation use atomic database operations; serverless process memory is not sufficient. Pairing/run quotas and confirmation retry limits are implemented in the database. Add deployment abuse limits and retention operations before release. A duplicate submission returns 409 after its one-use lease is consumed; it never evaluates a second run or awards credit from a replay.

The first pack is DC01. Other classes explicitly show **Automated checks not available** until they have reviewed collectors and rule mappings. Paired results still have limitations: a learner controlling the VM can alter software or observations. Do not represent this as tamper-proof certification or automatic course completion.

## Readiness and recovery

| State                                  | Meaning / next action                                                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Offline / network failed               | In the VM, check its network adapter, default route, DNS and access to the service on TCP 443. NAT alone proves none of these. |
| TLS failed                             | Check system time and trusted certificate chain; do not disable verification.                                                  |
| Awaiting approval                      | Complete the website confirmation for the named VM.                                                                            |
| Code expired                           | Create a new enrollment code; old codes cannot be reused.                                                                      |
| Connected                              | Approved, unexpired device has recently completed an authenticated service request. This does not mean class checks passed.    |
| Stale / session expired                | Reconnect or pair again as instructed. Do not keep a green status.                                                             |
| Check unavailable / permission missing | Explain the specific missing tool or local permission and mark affected tasks not checked. Never report a pass.                |
| Revoked                                | Stop requests and clear the local session credential. Pair again only with explicit student action.                            |

A host-only VM without an internet route cannot use direct polling. Keep it isolated and use local-report import. A future host relay requires a separately designed, private authenticated VM connection; it is not implemented by this plan.

## Evidence and release gates

`tests/support/lab-link-model.mjs` is an in-memory executable specification only. `tests/lab-link-contract.test.mjs` covers ownership, approval, expiry, allowlisted jobs, leases, replay, revocation and a loopback HTTP exchange initiated by the checker. Fixtures are not real authentication. Loopback HTTP does not prove NAT traversal, HTTPS trust, Supabase RLS or a real DC configuration.

Before release: create the Supabase project; deploy/configure the prepared provider authentication and atomic persistent API operations; test cross-user access and database policies on that hosted project; produce and verify the signed checker package; test supported Windows versions and failures on real VMs; verify NAT/proxy/TLS behavior; then review the student walkthrough. Linux requires a separate reviewed check pack. The VMs do not need to exist to prepare this infrastructure, but live connection claims must wait for those checks.
