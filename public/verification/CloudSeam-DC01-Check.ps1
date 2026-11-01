# CloudSeam Tech DC01 collector v1.0.0 — unsigned preview.
# Reads local configuration. Writes one JSON report. No upload, remoting,
# installation, firewall change, credential collection or automatic repair.
[CmdletBinding()]
param([string]$OutputDirectory = [Environment]::GetFolderPath('MyDocuments'))
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $OutputDirectory -PathType Container)) {
    throw 'Choose an existing output folder with -OutputDirectory.'
}
function Read-Fact([scriptblock]$Reader) {
    try { return @{ status = 'ok'; value = (& $Reader) } }
    catch { return @{ status = 'unavailable'; value = $null } }
}
$facts = @{}
$facts.computer = Read-Fact {
    $computer = Get-CimInstance -ClassName Win32_ComputerSystem
    $os = Get-CimInstance -ClassName Win32_OperatingSystem
    @{ hostname = [string]$computer.Name; domain = [string]$computer.Domain;
       domainRole = [int]$computer.DomainRole; productType = [int]$os.ProductType }
}
$facts.adapters = Read-Fact {
    ,@(Get-NetIPConfiguration | Where-Object { $_.IPv4Address } | ForEach-Object {
        $config = $_
        @{ addresses = @($config.IPv4Address | ForEach-Object {
              @{ address = [string]$_.IPAddress; prefix = [int]$_.PrefixLength }
           }); dns = @((Get-DnsClientServerAddress -InterfaceIndex $config.InterfaceIndex -AddressFamily IPv4).ServerAddresses);
           gateways = @($config.IPv4DefaultGateway | ForEach-Object { [string]$_.NextHop }) }
    })
}
$facts.roles = Read-Fact {
    ,@(Get-WindowsFeature -Name AD-Domain-Services,DNS | Where-Object Installed | ForEach-Object { [string]$_.Name })
}
$facts.services = Read-Fact {
    # A missing service is an observed absence, not a silently successful check.
    $all = @(Get-Service)
    ,@(@('NTDS','DNS','Netlogon') | ForEach-Object {
        $name = $_
        $service = $all | Where-Object Name -EQ $name | Select-Object -First 1
        @{ name = $name; state = $(if ($service) { [string]$service.Status } else { 'Missing' }) }
    })
}
$facts.shares = Read-Fact { ,@(Get-SmbShare | Where-Object { $_.Name -in @('SYSVOL','NETLOGON') } | ForEach-Object { [string]$_.Name }) }
$facts.controller = Read-Fact {
    $dc = Get-ADDomainController -Identity $env:COMPUTERNAME -Server localhost
    @{ hostname = [string]$dc.HostName; domain = [string]$dc.Domain; readOnly = [bool]$dc.IsReadOnly }
}
$facts.dnsRegistration = Read-Fact {
    if ($facts.computer.status -ne 'ok' -or $facts.computer.value.domainRole -notin @(4,5)) { throw 'Not a DC' }
    $domain = $facts.computer.value.domain
    if ($domain -notmatch '^(?=.{1,253}$)[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])$') { throw 'Invalid DNS domain' }
    ,@(Resolve-DnsName -Name "_ldap._tcp.dc._msdcs.$domain" -Type SRV -Server 127.0.0.1 -DnsOnly | Where-Object { $_.Type -eq 'SRV' } | ForEach-Object {
        @{ target = [string]$_.NameTarget; port = [int]$_.Port }
    })
}
$report = @{ schemaVersion = 1; packId = 'windows-dc01'; packVersion = '1.0.0';
    collectorVersion = '1.0.0'; collectedAt = [DateTime]::UtcNow.ToString('o'); facts = $facts }
$filename = 'cloudseam-dc01-' + [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss-fff') + '.json'
$path = Join-Path $OutputDirectory $filename
if (Test-Path -LiteralPath $path) { throw 'Report already exists; run again for a new filename.' }
$report | ConvertTo-Json -Depth 10 | Out-File -LiteralPath $path -Encoding utf8 -NoClobber
Write-Host "Report saved: $path"
Write-Host 'Review the JSON, then choose this file in CloudSeam. Nothing was uploaded.'
