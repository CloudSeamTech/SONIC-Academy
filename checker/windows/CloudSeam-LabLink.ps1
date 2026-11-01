# CloudSeam Lab Link v0.1.0 SOURCE ONLY — not a signed release.
# Foreground outbound HTTPS client. No listener, remoting, installation or repair.
# The release process pins the signing certificate before signing both scripts.
[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$TrustedSignerThumbprint = 'RELEASE_CERTIFICATE_THUMBPRINT_NOT_CONFIGURED'
$ServiceOrigin = 'https://cloudseam.tech'
if ($TrustedSignerThumbprint -eq 'RELEASE_CERTIFICATE_THUMBPRINT_NOT_CONFIGURED') {
    throw 'This is unreleased source. Wait for the signed CloudSeam checker package. Do not bypass execution policy.'
}
function Assert-ReleaseSignature([string]$Path) {
    $signature = Get-AuthenticodeSignature -LiteralPath $Path
    if ($signature.Status -ne 'Valid' -or $signature.SignerCertificate.Thumbprint -ne $TrustedSignerThumbprint) {
        throw 'Publisher verification failed. Stop and obtain the approved signed package.'
    }
}
Assert-ReleaseSignature $PSCommandPath
$collector = Join-Path $PSScriptRoot 'CloudSeam-DC01-Check.ps1'
Assert-ReleaseSignature $collector
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$deviceToken = $null
function Send-LabRequest([string]$Path, [hashtable]$Body) {
    $headers = @{}
    if ($deviceToken) { $headers.Authorization = "Bearer $deviceToken" }
    # Fixed origin and no redirects: never forward the device credential elsewhere.
    Invoke-RestMethod -Uri "$ServiceOrigin/api/lab-link/$Path" -Method Post -Headers $headers `
        -Body ($Body | ConvertTo-Json -Depth 14 -Compress) -ContentType 'application/json' `
        -TimeoutSec 15 -MaximumRedirection 0
}
Write-Host 'CloudSeam Lab Link: reads approved local settings and sends observations to your account.'
Write-Host 'No public IP, RDP or SSH password is needed. Press Ctrl+C to stop.'
Write-Host 'On the website, use Revoke device access to end approval immediately.'
$code = Read-Host 'Type the pairing code from CloudSeam Check Your Work'
if ($code -notmatch '^[A-Fa-f0-9-]{20,24}$') { throw 'Check the pairing code.' }
$enrolled = Send-LabRequest 'enroll' @{ code = $code; hostname = [Environment]::MachineName }
$code = $null
$deviceToken = [string]$enrolled.deviceToken
Write-Host "VM name: $([Environment]::MachineName)"
Write-Host "Enter this confirmation on CloudSeam, then approve this VM: $($enrolled.confirmation)"
$expires = [DateTime]::UtcNow.AddMinutes(55)
$failures = 0
try {
    while ([DateTime]::UtcNow -lt $expires) {
        try {
            $poll = Send-LabRequest 'poll' @{}
            $failures = 0
            if ($poll.job) {
                $job = $poll.job
                # The service selects a bundled identifier; never evaluate remote script text.
                if ($job.checkSet -ne 'windows-dc01' -or $job.version -ne '1.0.0' -or
                    $job.runId -notmatch '^[a-fA-F0-9-]{36}$' -or
                    $job.leaseToken -notmatch '^[A-Za-z0-9_-]{43}$') { throw 'Unsupported check job. Stop and contact support.' }
                if ([DateTime]::Parse($job.expiresAt).ToUniversalTime() -le [DateTime]::UtcNow) { throw 'Job expired. Rerun on the website.' }
                Assert-ReleaseSignature $collector
                $folder = Join-Path ([IO.Path]::GetTempPath()) ('CloudSeam-LabLink-' + [Guid]::NewGuid().ToString('N'))
                New-Item -Path $folder -ItemType Directory | Out-Null
                $reportPath = $null
                try {
                    & $collector -OutputDirectory $folder
                    $files = @(Get-ChildItem -LiteralPath $folder -Filter 'cloudseam-dc01-*.json' -File)
                    if ($files.Count -ne 1 -or $files[0].Length -gt 131072) { throw 'Collector did not create one valid-sized report.' }
                    $reportPath = $files[0].FullName
                    $report = Get-Content -LiteralPath $reportPath -Raw | ConvertFrom-Json
                    Send-LabRequest "runs/$($job.runId)/observations" @{leaseToken = [string]$job.leaseToken; report = $report} | Out-Null
                    Write-Host 'Observations sent. Review individual task results on CloudSeam.'
                } finally {
                    if ($reportPath) { Remove-Item -LiteralPath $reportPath -Force }
                    # This uniquely created folder contains only this run's file; no recursive deletion.
                    if (@(Get-ChildItem -LiteralPath $folder -Force).Count -eq 0) { Remove-Item -LiteralPath $folder }
                }
            }
        } catch {
            $status = $null
            if ($_.Exception.Response) { $status = [int]$_.Exception.Response.StatusCode }
            if ($status -in @(401,403)) { throw 'Session expired or revoked. Stop and pair again on the website.' }
            $failures++
            Write-Warning 'Could not complete the request. Check network access, system time and the website status. No server setting was changed.'
            if ($failures -ge 5) { throw 'Repeated connection failures. Stop and pair again after fixing the connection.' }
        }
        Start-Sleep -Seconds ([Math]::Min(30,10 + $failures * 3) + (Get-Random -Minimum 0 -Maximum 3))
    }
    Write-Host 'This foreground session ended. Pair again for another session.'
} finally {
    $deviceToken = $null
    $enrolled = $null
}
