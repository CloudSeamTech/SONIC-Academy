param([Parameter(Mandatory)][string]$Collector,[Parameter(Mandatory)][string]$OutputDirectory)
# Test doubles only: no real machine, DNS or Active Directory queries.
function Get-CimInstance { param($ClassName)
    if ($ClassName -eq 'Win32_ComputerSystem') { [pscustomobject]@{Name='DC01';Domain='lab.example.test';DomainRole=5} }
    else { [pscustomobject]@{ProductType=2} }
}
function Get-NetIPConfiguration { [pscustomobject]@{InterfaceIndex=9;IPv4Address=@([pscustomobject]@{IPAddress='10.50.0.10';PrefixLength=24});IPv4DefaultGateway=@()} }
function Get-DnsClientServerAddress { param($InterfaceIndex,$AddressFamily) [pscustomobject]@{ServerAddresses=@('10.50.0.10')} }
function Get-WindowsFeature { param($Name) @('AD-Domain-Services','DNS') | ForEach-Object { [pscustomobject]@{Name=$_;Installed=$true} } }
function Get-Service { @('NTDS','DNS','Netlogon') | ForEach-Object { [pscustomobject]@{Name=$_;Status='Running'} } }
function Get-SmbShare { @('SYSVOL','NETLOGON') | ForEach-Object { [pscustomobject]@{Name=$_} } }
function Get-ADDomainController { param($Identity,$Server) [pscustomobject]@{HostName='dc01.lab.example.test';Domain='lab.example.test';IsReadOnly=$false} }
function Resolve-DnsName { param($Name,$Type,$Server,[switch]$DnsOnly) [pscustomobject]@{Type='SRV';NameTarget='dc01.lab.example.test.';Port=389} }
& $Collector -OutputDirectory $OutputDirectory
