# Your first IaC check before review

Practice only. These instructions do not deploy to Azure. Use a new disposable folder and repository so you do not replace an application’s workflow.

## 1. Make the practice folder

In Windows File Explorer → Documents → New → Folder, type `CloudSeam-Bicep-CI`. In VS Code → File → Open Folder, select it.

**Result:** VS Code’s Explorer shows CloudSeam-Bicep-CI. **Why:** Keep this experiment separate.

## 2. Type a tiny blueprint

Select File → New Text File. Type these two lines, then Ctrl+S → `main.bicep` in that folder:

```bicep
param greeting string = 'Hello, team'
output message string = greeting
```

**Result:** The filename ends in `.bicep`. **Why:** Start with one input and one output.

## 3. Add the rule file

Open [the practice bicepconfig.json](/bicep/bicepconfig.json). In VS Code, create `bicepconfig.json` beside `main.bicep` and type the shown JSON. Save it.

`analyzers.core.enabled` turns the linter on. Each rule’s `level: error` makes that rule block a build rather than merely warn. `no-unused-params` catches unused inputs; the two secret-related rules catch specific patterns, not every possible secret leak.

**Result:** Both files appear in the same folder. **Why:** A check must enforce a rule to stop a bad build.

## 4. Build locally

Select Terminal → New Terminal → PowerShell. Type `Get-Location`; confirm CloudSeam-Bicep-CI. If it is wrong, reopen the correct folder and create a fresh terminal.

Example prompt — your user and Documents path will differ. Type only after `>`:

```text
PS C:\Users\YourName\Documents\CloudSeam-Bicep-CI> az bicep version
PS C:\Users\YourName\Documents\CloudSeam-Bicep-CI> az bicep build --file .\main.bicep
```

Run one command at a time. If `az` is missing, return to the course’s tools lesson. Do not sign in to Azure for this compile.

**Result:** `main.json` appears without a build error. **Why:** Test the same file a pipeline will check.

## 5. Make the check fail on purpose

At the top of main.bicep, type `param unusedName string = 'practice'` on its own line. Ctrl+S. Run `az bicep build --file .\main.bicep` again.

**Result:** The build reports `no-unused-params` for unusedName and fails because the rule is configured as an error. **Why:** Prove the rule actually blocks a mistake.

If it only warns, check that bicepconfig.json is saved beside main.bicep and the rule level says `error`. If another error appears first, repair that line before repeating this test.

## 6. Repair and repeat

Delete only the unusedName line. Ctrl+S. Run the same build command again.

**Result:** The unused-input error is gone and JSON is generated. **Why:** A small repair is easy to review.

## 7. Read a CI workflow

Open [the compile-only workflow](/bicep/ci-check.yml). In this disposable practice folder, create `.github`, then `workflows` inside it. Save the example there as `ci-check.yml`; type its lines to learn the structure.

- `on: pull_request` runs when a proposed change is opened or updated. `workflow_dispatch` allows a manual run.
- `permissions: contents: read` gives the workflow a read-only repository token.
- `actions/checkout@…` reads the source. The 40-character commit pins the action; the comment names its baseline release. `persist-credentials: false` avoids leaving its token in Git configuration.
- `az bicep install --version v0.37.4` selects this exercise’s compiler baseline. Update it deliberately rather than claiming it is the newest release.
- `az bicep build` checks the file. There is no `az login`, secret or deployment command.

**Result:** The file is `.github/workflows/ci-check.yml`. **Why:** GitHub discovers workflows in that exact folder.

## 8. Optional: see a hosted run

Using only a disposable GitHub repository you own, add main.bicep, bicepconfig.json and `.github/workflows/ci-check.yml` through the repository’s Code → Add file → Upload files flow, preserving the folder path. Never upload credentials or private keys. Commit the practice files.

Open Actions → Check Bicep before review → Run workflow → select your practice branch → Run workflow. Open the run, then compile → Check tools and compile. Inspect the actual log; a queued or failed run is not a pass. Actions availability and account limits depend on your repository settings. If Azure CLI is missing on a changed runner image, stop and use the official CLI installation guidance; do not remove the check.

**Result:** A successful compile job, or a specific error to repair. **Why:** CI runs the check independently of your workstation.

This example has been authored and syntax checked; a hosted run is not claimed until you actually run it.

## What CD adds later

CI checks a proposed change. A separate deployment stage would need an approved Azure scope, least-privilege identity, what-if review and an approval gate. Prefer OpenID Connect federation over a stored Azure password or client secret. This lesson does not configure an identity or grant access.

A green build checks selected rules and syntax. It does **not** prove policy compliance, correct cost, open ports, guest configuration or successful deployment. Keep secrets out of code, use reviewed modules, and review the planned resources too.

## Evidence

Save the failed diagnostic, the repaired build result and a one-sentence explanation of CI versus CD in your private notebook. Exclude tokens and credentials.

## Official references

- [Bicep linter](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/linter)
- [Bicep CLI build and lint](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-cli)
- [GitHub Actions security](https://docs.github.com/en/actions/reference/security/secure-use)
- [Azure IaC and GitHub Actions](https://learn.microsoft.com/en-us/devops/deliver/iac-github-actions)
