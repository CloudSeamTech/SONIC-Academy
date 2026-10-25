# Windows DMZ and private IIS lab

The Windows System Administration pathway includes **DMZ & Private IIS
Publishing**, a separate nine-lesson, 35-step class at `/dmz`.

## Teaching design

Start in VMware Workstation Pro using equipment the learner already owns.
OPNsense Community routes and filters the lab networks; a single-NIC
AlmaLinux/NGINX proxy sits in the DMZ. A fresh standalone Windows Server 2019
IIS-DMZ01 provides the private test application. TEST01 is an isolated outside
visitor, not the physical host and not an Internet connection.

| Zone | Network | Addresses |
| --- | --- | --- |
| Existing AD and management | VMnet2 / 10.50.0.0/24 | DC01 .10, DC02 .11 unchanged; FW01 .1; host management .254 |
| DMZ | VMnet3 / 10.60.0.0/24 | FW01 .1; PROXY01 .10 |
| Outside practice client | VMnet4 / 10.70.0.0/24 | FW01 .1; TEST01 .10 |
| Separate private application | VMnet5 / 10.80.0.0/24 | FW01 .1; IIS-DMZ01 .40 |

FW01 has four NICs. Every other new guest has exactly one final custom NIC.
VMware DHCP is off. Only VMnet2 retains the host management adapter. Guest
package preparation uses temporary VMnet8 NAT before final isolation; there
must be no remaining NAT/bridged bypass NIC. Temporary shared folders transfer
only public certificates and the reviewed NGINX configuration, then are disabled.

The only visitor web route is TEST01 → FW01 outside HTTPS destination NAT →
PROXY01 → IIS-DMZ01 HTTPS. The explicit allowed backend destination is
10.80.0.40:443. DMZ access to AD/SQL/management and application-initiated access
to AD remain blocked. Responses use stateful connection tracking; no broad
reverse-direction allow or internal source NAT is required.

No home-router port forward, public DNS change, tunnel, Azure deployment or
change to the existing APP01/domain controllers is part of this class.

## Certificates and files

The local lab pins separate front and backend self-signed public certificates.
NGINX verifies the backend hostname and certificate; the visitor's curl verifies
the front certificate. No private key is exported from IIS. `curl -k` and
`proxy_ssl_verify off` are not fixes. Production needs managed PKI/renewal,
monitoring, least privilege and appropriate WAF/availability design.

- `public/dmz/nginx-dmz.conf`: exact proxy configuration.
- `public/dmz/new-iis-backend.ps1`: optional instructor/fresh-rebuild alternative
  to manual steps, not another script to run after those same steps. It refuses
  the wrong computer name or an existing lab directory. Review it before use.
- `public/dmz/traffic-matrix.csv`: positive and negative test evidence checklist.

## Visual provenance and verification limits

Each of the 35 steps has a local picture and numbered textual callouts. One step
uses an unmodified official OPNsense rule-list reference with attribution and
checksum. It shows default LAN rules, explicitly identified as defaults to
replace rather than a finished DMZ policy. The other step pictures are labeled
product-specific UI recreations or architecture diagrams with class values.
They are not live screenshots, vendor-certified replicas, or observed outcomes.

Sources and recreations are registered in `content/dmz/references.json`.
`tools/render-dmz-screens.py` renders the deterministic SVG illustrations from
`content/dmz/screen-scenes.json`; marker positions live in the shared registry.
Keep scene/lesson values synchronized when editing instructions.

Browser checks verify the learning UI, images, markers, focus controls, progress
and navigation. No VMware/Windows/OPNsense training environment is connected to
this workspace, so an instructor still needs to rehearse the complete appliance,
certificate and firewall procedure in the actual lab before treating it as a
validated production runbook. The website never claims a self-check is automated
proof of a server change.

## Azure comparison

The final lesson plans managed gateway/WAF ingress and private backend/data
subnets, with cost estimates and cleanup requirements. It does not deploy a
paid gateway or promise an always-on enterprise stack for $25/month. VM
shutdown/deallocation does not remove all cloud charges. Tags help identify
owners and expiry; a budget alert is not a hard spending cap.

## Learner notebook and beginner revision

Each lesson includes blank, editable notebook fields appropriate to that lesson, plus a whole-plan view and separate lesson notes. Names, network ranges, adapter mappings, firewall rules and test results can be saved or downloaded as text. The entries are notes; they do not interpolate into executable commands or claim that custom values were applied to a VM.

The public Vercel deployment currently has no connected account database. Guest notes are saved to this browser only and are visible to anyone using that same browser profile. The UI states this explicitly and offers a download. On hosts with authenticated account storage, the notebook uses the existing user-scoped learner records API and account-ID checks. Guest import is explicit and keeps an existing account value on conflict. When an account cannot be verified, cached account notes are not opened or overwritten as guest notes. Supabase is still a separate setup task; this release does not provision it.

The course now explains what belongs in the DMZ before configuration: only the reverse proxy is in the DMZ, while IIS is in a separate private application subnet. Its harmless test page stands in for a help desk. This course does not install or relocate osTicket, PHP or its database. All 35 steps have shorter action wording, simpler titles and concrete expected checks. Technical commands, subnet separation and certificate verification remain intact.
