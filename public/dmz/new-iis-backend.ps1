# Optional alternative for a fresh rebuild; do not rerun after the manual steps.
# Review the enabled inbound web-rule scope manually before any publication.
# Run only on the fresh IIS-DMZ01 practice guest, in elevated Windows PowerShell.
# Review /dmz#lesson=dmz-iis first. This does not configure a production server.
$ErrorActionPreference = 'Stop'
if ($env:COMPUTERNAME -ne 'IIS-DMZ01') { throw 'Wrong VM. Stop here.' }
if (Test-Path 'C:\inetpub\dmz-lab') { throw 'The lab directory exists. Review the previous attempt before rerunning.' }
if ($env:COMPUTERNAME -ne 'IIS-DMZ01') { throw 'Wrong VM. Stop here.' }
Install-WindowsFeature Web-Server -IncludeManagementTools
Import-Module WebAdministration
New-Item -ItemType Directory -Path C:\inetpub\dmz-lab -Force
'<h1>CloudSeam DMZ lab</h1><p>Private IIS backend: IIS-DMZ01</p>' | Set-Content C:\inetpub\dmz-lab\index.html
Stop-Website 'Default Web Site'
New-Website -Name 'DMZ-Lab' -PhysicalPath C:\inetpub\dmz-lab -IPAddress 127.0.0.1 -Port 8080
(Invoke-WebRequest http://127.0.0.1:8080 -UseBasicParsing).StatusCode

$cert = New-SelfSignedCertificate -DnsName 'iis-backend.cloudseam.tech' -CertStoreLocation 'Cert:\LocalMachine\My' -FriendlyName 'DMZ-Lab backend' -KeyAlgorithm RSA -KeyLength 3072 -HashAlgorithm SHA256 -NotAfter (Get-Date).AddDays(30)
New-WebBinding -Name 'DMZ-Lab' -Protocol https -IPAddress '10.80.0.40' -Port 443 -HostHeader 'iis-backend.cloudseam.tech' -SslFlags 1
(Get-WebBinding -Name 'DMZ-Lab' -Protocol https).AddSslCertificate($cert.Thumbprint, 'My')
New-Item -ItemType Directory C:\DMZ-Lab -Force
$pem = '-----BEGIN CERTIFICATE-----' + "`r`n" + [Convert]::ToBase64String($cert.RawData, [System.Base64FormattingOptions]::InsertLineBreaks) + "`r`n-----END CERTIFICATE-----`r`n"
$pem | Set-Content C:\DMZ-Lab\backend-public.pem -Encoding Ascii

New-NetFirewallRule -DisplayName 'DMZ-Lab HTTPS from proxy only' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 443 -RemoteAddress 10.60.0.10 -Profile Any
Get-NetFirewallRule -DisplayName 'DMZ-Lab HTTPS from proxy only' | Get-NetFirewallAddressFilter
