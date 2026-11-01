# CloudSeam Lab Link — owner setup checklist

Prepared on November 1, 2026. The source, database migration, pairing UI and local tests are prepared. **This is not a deployed connection service.** No student VM is connected, and no signed checker is released.

## What students will do

Sign in with an emailed code → choose the class → enter their lab plan → pair the checker inside their VM → confirm its name/number → run checks → fix failures and rerun.

The checker initiates outbound HTTPS through VMware NAT. Students do not enter a public IP, expose ports, configure your Supabase project or give CloudSeam their server password. An isolated VM without an internet route uses local-report mode instead.

## 1. Create the account backend

- [ ] Open [Supabase Dashboard](https://supabase.com/dashboard) → create your account → **New project**.
- [ ] Select your organization, name the project **CloudSeam Academy**, choose a region close to your website deployment and set a strong database password in your password manager. Do not send it in chat.
- [ ] Wait for the project to be ready. Open **Connect** to find its project URL. Open **Project Settings → API Keys** for a publishable key and server secret key. Use the new `sb_publishable_…` and `sb_secret_…` keys.
- [ ] Keep the database password and secret key out of browser code, screenshots, source control and chat. Enter them only in protected hosting settings when needed.

The website verifies student access tokens with Supabase Auth. Random device credentials are separate from student sessions. We do not implement password storage or trust a user ID supplied in the request body.

## 2. Install the database migration

- [ ] In your **new, non-production** Supabase project, open **SQL Editor → New query**.
- [ ] Review and run `supabase/migrations/202611010001_lab_link.sql` once. It creates the private `lab_link` schema, pairings, runs and the `public.lab_link_rpc` function in one transaction.
- [ ] Confirm row-level security is enabled on pairings, runs and audit. Browser roles have no private schema/table access or RPC execute permission. Only the server's `service_role` can execute the RPC. The function has an empty `search_path` and fully qualified private tables.
- [ ] Execute the SQL smoke tests in `supabase/tests/lab_link_access.sql`. An authenticated student must not be able to invoke the privileged RPC directly. Do not add broad anonymous policies to make errors disappear.

The API verifies the student identity first, then supplies that verified owner ID to the privileged RPC. Claims, confirmation attempts, job leases, results and revocation use database transactions/locks. They are not held in a serverless process's memory.

## 3. Configure email sign-in

- [ ] Open **Authentication → Sign In / Providers → Email** and enable email sign-in.
- [ ] Open **Authentication → Email Templates → Magic Link**. Configure an email OTP template that displays `{{ .Token }}`; the interface expects a numeric emailed code, not a magic-link redirect. Confirm the configured OTP length is supported (6–8 digits).
- [ ] Open **Authentication → URL Configuration**. Set the production site URL to `https://cloudseam.tech`. Keep testing in a separate staging project/origin; do not broadly allow arbitrary preview redirects.
- [ ] Configure a production SMTP provider and verified sending domain. Test delivery, junk-folder behavior, expiry, repeated requests and account enumeration protections. Default developer email limits are not a student launch plan.
- [ ] Set Auth OTP rate limits and configure hosting firewall limits for `/api/lab-link/login/*`, `/enroll` and device polling. Behind this server proxy, Supabase sees server-originated requests; do not assume its IP limit alone identifies each student.

This first UI retains an access token only in the current tab's memory, returns no refresh token to the browser and asks for sign-in again after refresh/expiry. It is intentionally separate from the legacy Sites profile/progress storage: it does not silently overwrite or migrate that profile. Account unification is a follow-up integration before a single-sign-in platform release.

## 4. Configure the deployment privately

- [ ] Open the site's hosting project → **Settings → Environment Variables**. Use `config/lab-link.env.example` as the list of required names. Do not paste real values into that tracked example.
- [ ] Set `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` and `LAB_LINK_SITE_ORIGIN` for the correct environment. All are server-side variables; never prefix the secret with `NEXT_PUBLIC_`.
- [ ] Keep `LAB_LINK_ENABLED=false` and `LAB_LINK_RELEASE_APPROVED=false` until every release gate below passes.
- [ ] Deploy a review build with the new API route. With gates off, `/api/lab-link/availability` must return HTTP 503 and the UI must show **Not connected**, with pairing disabled. Existing local-report mode must still work.
- [ ] Configure durable edge rate limits, abuse monitoring and redacted logs. Never log request Authorization, emailed OTPs, pairing codes, device credentials or raw observation bodies. Establish a privacy notice and retention policy before enabling uploads.

The initial checker source pins `https://cloudseam.tech` and refuses redirects. Test a staging release by replacing that fixed origin in the reviewed release source before signing; do not add a student-controlled endpoint parameter that could receive credentials.

## 5. Produce the signed Windows checker

- [ ] Follow `checker/README.md`. Review the foreground client and existing DC01 collector; pin the signing certificate and sign both in the staged package.
- [ ] Publish a versioned package with publisher identity, hashes and concise download/run/stop/revoke instructions. Do not expose the unsigned source as a finished student download.
- [ ] After signature and clean-machine testing, fill `config/lab-link-release.json` with `status: released`, the versioned ZIP URL under your site's `/verification/releases/` directory, ZIP SHA-256, publisher and pinned certificate thumbprint. Until valid release metadata exists, configuration remains disabled even if both environment flags are true. The UI reads its download instructions from this manifest. No installer or signing certificate has been purchased, generated or released by this preparation.
- [ ] Prepare Linux/NGINX as a separate pack with its own collector and validation rules. It is not supported by the DC01 implementation.

## 6. Test before enabling student access

- [ ] Two real student accounts: one cannot list, approve, read, run or revoke the other's devices/results.
- [ ] Real Windows Server VM on VMware NAT: pair → approve → recent heartbeat → run → correct per-task results → deliberate failure → rerun → revoke.
- [ ] No green Connected before approval/contact; lost network, expired device session and revoked device lose their green status.
- [ ] Expired/used enrollment codes, five wrong confirmations, wrong/expired/replayed job leases and unsupported packs fail safely.
- [ ] Missing AD tools, insufficient permissions, incorrect DNS and an unpromoted server return correct failed/not-checked results. A process exit alone is not a pass.
- [ ] Verify TLS trust, system-time errors, redirects, proxies and blocked TCP 443. Never disable certificate verification or open public VM ports.
- [ ] Validate the mobile layout, labels, keyboard access and release download instructions.
- [ ] Establish support ownership, token revocation, data deletion/retention and rollback. Review all evidence and approve the release, then enable both flags in the intended environment and redeploy. Boolean flags and manifest values record that review; they do not perform signing or testing for you.

## Local development evidence

Run the isolated PostgreSQL engine install from the repository root:

```powershell
npm install --prefix work/lab-link-tests --cache work/npm-cache --no-save --package-lock=false @electric-sql/pglite@0.3.14
node --experimental-strip-types --test tests/lab-link-backend.test.mjs tests/lab-link-contract.test.mjs tests/lab-verification.test.mjs
```

The PostgreSQL test executes the actual migration and actual API adapter against PGlite, with a mocked Supabase Auth HTTP response. It tests ownership, transactions, leases, revocation, privileged function grants and RLS configuration. It does **not** test hosted Supabase configuration, production SMTP, real user authentication, network NAT/TLS or a real domain controller. The source-only checker has a PowerShell parse/static safety test; it still needs signed real-machine execution.

## Rollback

Set both release flags to false and redeploy. Live API requests then return 503; the unsigned local-report preview and course content remain available. Revoke existing pairings in the database through an approved owner/admin operation if access must end immediately. Keep result data under the retention policy. Do not drop the schema or user accounts as a routine rollback.

References: [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys), [email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [database functions](https://supabase.com/docs/guides/database/functions).
