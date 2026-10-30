# See it → Try it → Check it

The original Linux Administration lesson order is retained. Linux Daily Admin
Tasks has a separate catalog entry, route `/linux-admin`, 20 chapters and 76
steps. Existing chapter and completion IDs are unchanged. Both retain the
visual-checklist reader selected by the user.

## Terminal teaching

- Show a full example prompt, including the machine, account and directory.
- `$` is a normal Bash prompt; `#` is a root shell prompt. `sudo command` still
  returns to the normal user prompt. `>` and `>>` show continued shell input.
- Daily Admin steps have explicit starting-directory metadata. The illustrated
  session shows how to reach home and check it using `pwd` or `Get-Location`.
- Track explicit directory changes within a block. Keep here-document lines
  intact, including the closing delimiter.
- Presentation prompts live in CSS/data attributes, outside executable command
  text. Existing copy buttons still use the original command strings. A frozen
  76-command hash contract guards against prompt or symbol corruption.
- Legacy steps with no authored starting folder show `<pwd>` as an explicit
  placeholder and ask the learner to measure it. Do not pretend to know their
  actual shell directory or change the original course procedure silently.
- Regenerate only labeled Daily Admin mockups. Genuine captures remain intact.

## Lab Passport and future Supabase integration

Schema: `{ version: 1, updatedAt, environments: { [courseId]: { hostname,
username, ipv4, directory } } }`. Fields start blank and are bounded strings.
The storage key is `sonic-lab-passport-v1:<account-id-or-guest>`. Signed-in users
and the guest have different records. This namespace is deliberately excluded
from the existing progress-upload API. No Supabase connection or cross-device
save is claimed.

Learners can edit values in their class or `/profile#lab-passport`. Updates are
reflected beside terminal examples. Notes never substitute into executable
commands, award completion or claim that the VM was inspected. Passwords,
private keys and tokens have no fields. Invalid IPv4 input is not saved.

A future Supabase adapter should map this stable schema to authenticated rows
with owner-based row-level security, explicit guest import, validation and
conflict handling. Preserve this local record until an authenticated server
confirms a successful save; a failed request must never show “saved”.

## Branding and motion

Card logos identify the technology taught. Sources and SHA-256 values are in
`public/vendor-logos/sources.json`; artwork retains supplied proportions.
CloudSeam’s favicon is derived from the existing zipper/cloud artwork, not the
old SONIC mark. No external image requests are needed to display the cards.

The learning rhythm appears on the dashboard and lesson pages. It uses a short
entrance animation, not continuous flashing or fake live telemetry. Hover
motion and entrance animation respect `prefers-reduced-motion`. The left sidebar
is unchanged.
