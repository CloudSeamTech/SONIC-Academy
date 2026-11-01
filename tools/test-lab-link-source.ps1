[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$Source)
$ErrorActionPreference='Stop'
$tokens=$null
$errors=$null
$null=[Management.Automation.Language.Parser]::ParseFile($Source,[ref]$tokens,[ref]$errors)
if ($errors.Count -gt 0) { throw ($errors | Out-String) }
try {
    & $Source
    throw 'The unreleased checker unexpectedly ran.'
} catch {
    if ($_.Exception.Message -notlike '*unreleased source*') { throw }
}
Write-Output 'PowerShell parsed; unreleased source refused execution before networking.'
