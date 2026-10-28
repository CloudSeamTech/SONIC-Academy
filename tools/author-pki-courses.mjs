import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const sources = {
  req: 'https://docs.openssl.org/3.5/man1/openssl-req/',
  verify: 'https://docs.openssl.org/3.5/man1/openssl-verify/',
  nginx: 'https://nginx.org/en/docs/http/configuring_https_servers.html',
  trust:
    'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/securing_networks/using-shared-system-certificates_securing-networks',
  certreq:
    'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/certreq_1',
  iis: 'https://learn.microsoft.com/en-us/iis/manage/configuring-security/how-to-set-up-ssl-on-iis',
};
function step(
  title,
  where,
  why,
  actions,
  command,
  expected,
  failure,
  assetId,
  breakdown = [],
) {
  return {
    title,
    where,
    actions,
    ...(command ? { command } : {}),
    guide: { what: title, why, verify: expected, failure },
    expected,
    breakdown: breakdown.length
      ? breakdown
      : [{ term: 'Check before continuing', meaning: expected }],
    screenshot: assetId
      ? {
          status: 'reference',
          assetId,
          title: 'Genuine lab reference · ' + title,
          instructions:
            'The image shows the actual captured platform and fixture. Compare names and paths with this step; it does not prove your result. Read its capture limits below.',
        }
      : {
          status: 'capture-needed',
          title: 'Capture needed · ' + title,
          instructions:
            'A genuine screenshot of this exact action/result is still needed. No successful lab execution or screenshot is claimed for this step.',
        },
    sources: Object.values(sources),
  };
}
function lesson(
  id,
  title,
  what,
  why,
  steps,
  question,
  options,
  answer,
  explanation,
) {
  return {
    id,
    title,
    module: title,
    description: what,
    what,
    why,
    needs: [
      'Complete the preceding chapter and keep your change notes beside you.',
    ],
    bestPractices: [
      'Work only on the named application lab machine. Stop at a failed check.',
      'Keep private keys and passwords off chat, tickets and screenshots.',
    ],
    commonMistakes: [
      'Treating a file import or green command result as proof the browser reaches the correct application.',
    ],
    troubleshooting: [
      {
        problem: 'The result differs from this lesson.',
        fix: 'Use the current step’s recovery note. Check the machine, filename, website name and clock before continuing.',
      },
    ],
    pass: steps.at(-1).expected,
    exercise:
      'Repeat this chapter’s checks in your own lab. Record the machine, actual result and any remaining gap before marking it verified.',
    quiz: [{ question, options, answer, explanation }],
    steps,
  };
}
function intro(prefix, windows) {
  return lesson(
    prefix + '-explain',
    'Start here: certificates in everyday words',
    'Meet the website’s name badge, secret key and signing team before touching a server.',
    'Understanding the pieces helps you choose the right file and keep the secret one safe.',
    [
      step(
        'A certificate is a website’s checked name badge',
        'Read here · no server changes',
        'A browser needs a way to check who answered.',
        [
          'Imagine visiting a school office. A name badge tells you who someone says they are. A website certificate is a digital name badge, signed by a trusted organization.',
          'HTTPS also protects the trip between the browser and the server. A valid badge alone does not prove the application behind it works.',
          'The browser checks the website name, the dates and the signing chain. All three must be right. An unexpired certificate with the wrong website name still fails.',
        ],
        null,
        'You can name three checks: correct name, valid dates and a trusted chain.',
        'If the words are new, repeat the badge example before moving on.',
      ),
      step(
        'The private key stays home; the CSR asks for a badge',
        'Read here · application server and PKI team',
        'A CSR lets someone sign your request without receiving your secret.',
        [
          'The private key is like a secret stamp kept by the application server. It helps the server prove it owns the certificate. Never send it to the PKI team.',
          'A public key can be shared. A CSR, short for Certificate Signing Request, carries that public key and requested identity. Its signature shows possession of the matching private key.',
          'The PKI team is the group that checks and signs requests. You send the CSR through its approved ticket or enrollment portal. It returns the signed website certificate and the public CA chain.',
          'A CSR is not yet a usable website certificate. A .pfx or .p12 file can contain a private key; it needs separate protected handling.',
        ],
        null,
        'You can point to the file that may leave the server: the checked CSR.',
        'If a ticket asks for the private key, stop and confirm the approved process.',
      ),
      step(
        'Root, intermediate and leaf have different jobs',
        'Read here · trust-chain example',
        'The website badge and the signing offices do not belong in the same place.',
        [
          'The root CA is the top signing authority your organization deliberately trusts. An intermediate CA is a signing office authorized beneath that root. The leaf is the certificate for your website.',
          'For an ordinary website, ask for a server/leaf certificate. You do not need a new root or intermediate just because your website certificate expired.',
          windows
            ? 'Windows stores approved roots in Trusted Root Certification Authorities, intermediate CAs in Intermediate Certification Authorities, and the website certificate plus matching key in Local Computer → Personal.'
            : 'NGINX presents the leaf first, then its intermediate certificates. Clients normally already trust the root. The operating system trust store is a separate list of authorities this machine trusts as a client.',
          'Install a root only when the organization approves that exact root and its fingerprint. A fingerprint is a digest used to compare identity. Never make an arbitrary leaf or intermediate a trusted root to hide an error.',
          'In a disposable practice lab, a separate practice CA can act as the pretend PKI team. It is not a production CA and must never become a trusted authority on unrelated computers.',
        ],
        null,
        'You can explain which certificate identifies the website and which authority is the trust anchor.',
        'If you cannot identify a file’s role, inspect it and ask the PKI team before importing it.',
        windows ? 'windows-2022-stores' : 'alma-10.2-chain',
      ),
    ],
    'Which file do you normally send to the PKI team?',
    ['The checked CSR', 'The private key', 'A new root CA key'],
    0,
    'The CSR contains the public request. The private key stays protected on the application server.',
  );
}
const linux = {
  id: 'pki-alma-nginx',
  title: 'AlmaLinux / NGINX Certificate Management',
  description:
    'Request a website certificate, work with the PKI team, install the chain, verify HTTPS and plan renewal.',
  baseline:
    'RHEL-style NGINX workflow · genuine supplemental AlmaLinux 10.2 / OpenSSL 3.5.5 captures · NGINX endpoint capture pending',
  prerequisite:
    'Start with the explanation page. This class assumes an existing private NGINX application server; it does not install NGINX or change your VMs automatically.',
  supplies: [
    'A private AlmaLinux application VM with a healthy, already installed NGINX application and authorized sudo access.',
    'A recovery point, the correct application URL, an approved PKI team or a separate disposable practice CA, and a private test client.',
    'Our captured guest is AlmaLinux 10.2. Its OpenSSL mechanics were tested; its NGINX service is not installed. Live NGINX steps and missing screenshots remain unverified in that guest.',
  ],
  sources: Object.entries(sources).map(([title, url]) => ({ title, url })),
  lessons: [intro('pki-alma', false)],
};
const lx = 'AlmaLinux application VM · Terminal · your authorized account';
linux.lessons.push(
  lesson(
    'pki-alma-plan',
    'Prepare the change and find the current certificate',
    'Record the application name, actual files and a recovery plan.',
    'A certificate change should not accidentally move the application or replace a working key.',
    [
      step(
        'Identify the machine and the TLS endpoint',
        lx,
        'The application’s TLS certificate may actually live on a proxy or load balancer.',
        [
          'Open Terminal inside AlmaLinux, or connect through your approved SSH client. Confirm the operating system first; do not assume AlmaLinux 9 from an old screenshot.',
          'Record the exact URL users type, its owner and which component ends HTTPS. This class uses fictional app.example.mil only inside the private lab; never request or publish a real .mil name.',
          'Run the inventory commands. If NGINX is absent, stop the server-configuration route. You may read and inspect the supplied OpenSSL example captures without pretending NGINX is present.',
        ],
        'hostname\ncat /etc/os-release\nrpm -q nginx openssl',
        'Your notes identify the actual OS and whether the application is served by NGINX.',
        'A missing package is a prerequisite gap, not a reason to install software on an unrelated server.',
        'alma-10.2-inventory',
      ),
      step(
        'Find the active paths and preserve recovery',
        lx,
        'A configuration test checks syntax; it does not establish client trust.',
        [
          'On the prepared application server, run nginx -T locally. Its configuration can include sensitive values: do not upload the entire output.',
          'Find the server block for your exact hostname and record ssl_certificate and ssl_certificate_key. If HTTPS does not exist yet, record that and plan a new binding.',
          'Take an approved VM recovery point. Copy /etc/nginx into a protected backup and retain the previous valid certificate/key pair. Record the old paths and rollback commands in your change notes.',
          'Use versioned filenames for the new pair. If a proposed filename already exists, inspect it and choose another version rather than overwriting it.',
        ],
        'sudo nginx -T\nsudo install -d -m 0700 /root/sonic-pki-backup\nsudo cp -a /etc/nginx /root/sonic-pki-backup/nginx-before-change',
        'You know the active site’s paths and have a recoverable pre-change configuration.',
        'If the backup directory already contains an earlier change, choose a new protected backup name. Stop if nginx -T fails.',
      ),
    ],
    'What should happen when NGINX is absent?',
    [
      'Stop and record the missing prerequisite',
      'Mark HTTPS verified',
      'Disable TLS checks',
    ],
    0,
    'This class changes an existing application server; missing software is not successful validation.',
  ),
  lesson(
    'pki-alma-csr',
    'Generate and inspect the CSR',
    'Create a protected key and a request containing the right DNS name.',
    'The returned certificate must match the key and the name users visit.',
    [
      step(
        'Prepare the request settings',
        lx,
        'SAN is the list of website names the certificate should cover.',
        [
          'Create ~/pki-work. Download the CSR settings file below into that folder as req.cnf.',
          'Open it in your text editor. In this private example CN and DNS.1 are app.example.mil. For an organization request, use only its approved real name and required subject fields. Keep the CN and SAN consistent.',
          'Confirm every needed DNS name with the application owner and PKI team. Adding a name to a CSR does not create DNS or authorize ownership.',
        ],
        'mkdir -p ~/pki-work\nchmod 700 ~/pki-work\ncat ~/pki-work/req.cnf',
        'The request settings contain the approved DNS names and no password or private key.',
        'If the file is missing, download it first. Do not paste a screenshot as configuration.',
      ),
      step(
        'Generate a new key and request once',
        lx,
        'The key is secret; the CSR is the public request.',
        [
          'On the approved application VM, run the block once. It refuses to overwrite sonic-app-v1.key. If that key already exists, stop and inspect the change record.',
          'RSA 3072 is the practice choice; follow the PKI team’s supported algorithm policy for real requests. -sha256 selects the request-signature digest.',
          'The key stays root-owned with mode 600. The CSR is written in your working folder. Do not display or photograph the private-key contents.',
        ],
        'sudo sh -c \'umask 077; test ! -e /etc/pki/tls/private/sonic-app-v1.key && openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out /etc/pki/tls/private/sonic-app-v1.key\'\nsudo chmod 600 /etc/pki/tls/private/sonic-app-v1.key\nsudo openssl req -new -sha256 -key /etc/pki/tls/private/sonic-app-v1.key -out "$HOME/pki-work/app-v1.csr" -config "$HOME/pki-work/req.cnf"\nsudo chmod 644 "$HOME/pki-work/app-v1.csr"',
        'A new key and CSR exist without overwriting the prior pair.',
        'If generation fails or the key already exists, stop; never regenerate it after submitting the CSR.',
      ),
      step(
        'Check the signature, names and matching public keys',
        lx,
        'A typo can produce a perfectly signed certificate for the wrong website.',
        [
          'Verify the CSR signature and inspect its subject and Subject Alternative Name. Look for the exact intended hostname.',
          'Compare the two complete public-key digests below. They must match. These are public-key digests, not private-key contents.',
          'The genuine screenshot uses the earlier supplemental fixture filenames app-v1.key/app-v1.csr. The course’s protected key path differs; the same checks apply.',
        ],
        'openssl req -in ~/pki-work/app-v1.csr -noout -verify -subject -text\nset -o pipefail\nopenssl req -in ~/pki-work/app-v1.csr -pubkey -noout | openssl pkey -pubin -outform DER | openssl dgst -sha256\nsudo openssl pkey -in /etc/pki/tls/private/sonic-app-v1.key -pubout -outform DER | openssl dgst -sha256',
        'Signature verification succeeds, SAN is correct and both public-key digests match.',
        'Correct a bad CSR before submission. A digest mismatch means the wrong key/request pair; do not proceed.',
        'alma-10.2-csr',
      ),
    ],
    'Does a successful CSR signature check prove the name is correct?',
    [
      'No; inspect SAN and compare with the approved name',
      'Yes; every signed CSR has the right name',
    ],
    0,
    'The signature and requested identity are different checks.',
  ),
  lesson(
    'pki-alma-handoff',
    'Send the request and check the response',
    'Use the approved PKI handoff, then inspect the returned public files.',
    'A new unexpired certificate still needs the correct identity, chain and key.',
    [
      step(
        'Send only the checked request',
        'Application owner · approved PKI ticket or enrollment portal',
        'The PKI team approves the identity and issuance policy.',
        [
          'Download the handoff checklist below. Fill in the application URL, owner, environment, requested SANs, server-auth purpose, algorithm, desired validity, change window and renewal contact.',
          'Attach app-v1.csr through your organization’s approved portal. Keep the ticket number and CSR SHA-256 in your change record. Do not send the key, a PFX or a screenshot of secret material.',
          'Ask the team to return the leaf certificate, intermediate chain, approved root fingerprint and format instructions. Do not create a root just because you need a new leaf.',
          'For disposable practice only, a separate signing operator can use the existing /tls practice-CA lesson. The same CSR-in/public-response-out boundary applies. A production ticket is never simulated by claiming a real submission happened.',
        ],
        'sha256sum ~/pki-work/app-v1.csr',
        'Your ticket records the request, owner and expected response; no private key left the application server.',
        'If issuance is pending or rejected, keep the working certificate active. Resolve the rejection with the PKI team.',
      ),
      step(
        'Inspect the new leaf and public CA chain',
        lx,
        'Dates, key matching, purpose and names all matter.',
        [
          'Save the returned PEM files in ~/pki-work as app-v1.crt, intermediate.crt and root.crt. Obtain the root identity through a trusted channel separate from the downloaded files.',
          'Inspect subject, issuer, SAN, dates, extended key usage and CA constraints. The website leaf must not be a CA and must permit server authentication.',
          'Check the current clock. Verify the chain, server purpose and hostname. Then compare the certificate’s public-key digest with the key digest from the previous chapter.',
        ],
        'date -u\nopenssl x509 -in ~/pki-work/app-v1.crt -noout -subject -issuer -dates -ext subjectAltName,extendedKeyUsage,basicConstraints\nopenssl x509 -in ~/pki-work/root.crt -noout -fingerprint -sha256\nopenssl verify -CAfile ~/pki-work/root.crt -untrusted ~/pki-work/intermediate.crt -purpose sslserver -verify_hostname app.example.mil ~/pki-work/app-v1.crt\nopenssl x509 -in ~/pki-work/app-v1.crt -pubkey -noout | openssl pkey -pubin -outform DER | openssl dgst -sha256',
        'The new unexpired leaf verifies for the approved name and matches the retained private key.',
        'Stop on a wrong name, expiry, untrusted root or mismatched key. Ask for corrected issuance instead of bypassing verification.',
        'alma-10.2-verify',
      ),
    ],
    'Which response belongs on the website?',
    [
      'The verified leaf matching the website key',
      'The root CA private key',
      'Any certificate with a future expiry',
    ],
    0,
    'The server identity must match its name, intended use, chain and key.',
  ),
  lesson(
    'pki-alma-install',
    'Install the chain and choose trust deliberately',
    'Stage the website pair and understand the separate client trust store.',
    'Serving a chain and trusting a root are different jobs.',
    [
      step(
        'Build and stage the server chain',
        lx,
        'NGINX needs the leaf first, followed by the issuing intermediates.',
        [
          'Join the leaf and intermediate PEM certificates in that order. For this one-intermediate example the bundle contains two certificates. Do not append the private key.',
          'Stage the public leaf and full chain under versioned names. Restore the expected SELinux labels on the new files and key.',
          'Do not replace the old files or edit the active server block until the next chapter.',
        ],
        'cat ~/pki-work/app-v1.crt ~/pki-work/intermediate.crt > ~/pki-work/app-v1-fullchain.pem\ngrep -c "BEGIN CERTIFICATE" ~/pki-work/app-v1-fullchain.pem\nsudo install -m 0644 ~/pki-work/app-v1.crt /etc/pki/tls/certs/sonic-app-v1.crt\nsudo install -m 0644 ~/pki-work/app-v1-fullchain.pem /etc/pki/tls/certs/sonic-app-v1-fullchain.pem\nsudo restorecon -v /etc/pki/tls/certs/sonic-app-v1.crt /etc/pki/tls/certs/sonic-app-v1-fullchain.pem /etc/pki/tls/private/sonic-app-v1.key',
        'A two-certificate public bundle and a protected matching key are staged under the intended paths.',
        'If the chain has extra issuers, preserve their correct order and adjust the expected count. Stop on label or permission errors.',
      ),
      step(
        'Add an approved root only if this client needs it',
        lx + ' · only on an approved disposable trust-test machine',
        'A system trust import changes which authorities local clients accept.',
        [
          'First test with --cacert or -CAfile; no system-wide trust change is needed for that test. NGINX serving its certificate does not by itself require a new system root.',
          'If your organization already distributes the correct root, leave it alone. If you are explicitly authorized to add this exact private root on the practice client, compare its SHA-256 fingerprint with the PKI team’s trusted record first.',
          'Only after approval, run the optional import block on that client. A leaf or an ordinary intermediate must not be placed in anchors to make an error disappear. Browser-managed stores may need separate approved configuration.',
          'For recovery, remove only the uniquely named root file added by this exercise and rerun update-ca-trust extract; never remove the entire anchors directory.',
        ],
        'openssl x509 -in ~/pki-work/root.crt -noout -fingerprint -sha256\n# Optional: only after the exact root is approved for this client\nsudo install -m 0644 ~/pki-work/root.crt /etc/pki/ca-trust/source/anchors/sonic-practice-root.crt\nsudo update-ca-trust extract',
        'An approved root is either already managed or deliberately added on the chosen client; the website leaf is not a trust anchor.',
        'If approval or fingerprint is uncertain, stop before the sudo commands and use explicit -CAfile verification instead.',
      ),
    ],
    'Does NGINX’s fullchain normally include the private key?',
    [
      'No; the key uses a separate protected path',
      'Yes; publish it in the chain',
    ],
    0,
    'The leaf and intermediates are public. The private key remains secret.',
  ),
  lesson(
    'pki-alma-validate',
    'Activate HTTPS and prove the application works',
    'Point the existing NGINX site at the staged pair and test the served result.',
    'A disk file can be correct while the running endpoint still serves an old certificate.',
    [
      step(
        'Update only the intended site and test before reload',
        lx,
        'Keep the application configuration and old recovery pair intact.',
        [
          'Open the recorded site configuration with sudoedit. In its existing HTTPS server block, set ssl_certificate to /etc/pki/tls/certs/sonic-app-v1-fullchain.pem and ssl_certificate_key to /etc/pki/tls/private/sonic-app-v1.key.',
          'For a previously HTTP-only prepared application, add its approved private HTTPS binding with listen 443 ssl and server_name app.example.mil while preserving the real application locations. Do not paste a static-site block over an application proxy.',
          'Run nginx -t. Reload only if it passes. Check service status and logs. Do not disable SELinux, firewalld or validation to obtain a green result.',
        ],
        'sudo nginx -t && sudo systemctl reload nginx\nsudo systemctl --no-pager status nginx',
        'The intended configuration tests successfully and NGINX reloads without losing the application.',
        'If the test or reload fails, restore the recorded prior config and valid pair, retest syntax and reload. Inspect journalctl -u nginx; do not delete the backup.',
      ),
      step(
        'Check the actual endpoint from a client',
        'Private test client · Terminal with OpenSSL and curl',
        'SNI selects the named site; hostname and trust checks verify its identity.',
        [
          'Set APP_IP to the application server’s verified private address at the prompt. Use a client that is allowed through the existing private firewall policy.',
          'Run s_client with the real hostname, root and verification options. Compare the served certificate serial and dates with the issued leaf; a valid result for an old certificate is not renewal proof.',
          'Use curl --resolve to test the right hostname without changing DNS. Expect the actual application page, not merely any HTTP 200. In a browser with the approved trust chain and name resolution, check certificate details and exercise the application workflow.',
        ],
        'read -r -p "Verified private application IP: " APP_IP\nopenssl s_client -connect "$APP_IP:443" -servername app.example.mil -CAfile ~/pki-work/root.crt -verify_return_error -verify_hostname app.example.mil < /dev/null\ncurl --cacert ~/pki-work/root.crt --resolve "app.example.mil:443:$APP_IP" --fail --show-error https://app.example.mil/',
        'The served leaf is the new one, name/chain checks pass and the expected application works from an allowed client.',
        'A timeout is a route/listener/firewall check. A name error is a SAN/SNI check. A chain error needs issuer/trust inspection. Never use -k as the pass check.',
      ),
    ],
    'What proves activation?',
    [
      'The live endpoint serves the new serial and the application works',
      'The certificate file exists',
      'nginx -t alone passes',
    ],
    0,
    'Syntax, live TLS identity and application behavior are separate acceptance checks.',
  ),
  lesson(
    'pki-alma-renew',
    'Track expiration, renew and recover',
    'Keep a named owner and verify replacement before the old certificate expires.',
    'The expiry date is a deadline, not a reminder to begin troubleshooting.',
    [
      step(
        'Record dates and schedule useful reminders',
        lx + ' · certificate inventory',
        'Someone needs time to request, approve and test a replacement.',
        [
          'Download the inventory CSV. Record website, endpoint, serial, issuer, expiry in UTC, key version, owner, backup owner, renewal ticket, change window and actual validation date.',
          'Use the local date check below. -checkend exits nonzero when expiry is inside the interval. Thirty days is an example, not a universal policy; choose reminders that allow your PKI team’s lead time.',
          'Monitor the actual served endpoint as well as staged files. Name who receives alerts and test alert delivery. A website checkbox is not monitoring.',
        ],
        'openssl x509 -in ~/pki-work/app-v1.crt -noout -serial -dates\nopenssl x509 -in ~/pki-work/app-v1.crt -noout -checkend 2592000',
        'The inventory has accountable owners, an actual expiry and a renewal date before the deadline.',
        'If the reminder would arrive too late, move it earlier and escalate the pending renewal now.',
        'alma-10.2-expiry',
      ),
      step(
        'Renew with overlap and retain a valid rollback',
        lx,
        'A new certificate is not active until the endpoint proves it.',
        [
          'Before expiry, confirm key-reuse policy. Prefer a new versioned key when required or when the old key may be exposed. Generate a new CSR with the same approved names, using v2 filenames throughout the CSR chapter.',
          'Submit the new request; verify the returned leaf, chain, dates and key; stage the new full chain. Do not overwrite or delete the current valid pair.',
          'For new-key renewal change both certificate and key paths together. Test syntax, reload and repeat client checks, comparing the new serial. Update inventory only after the live application passes.',
          'If the change fails, restore the prior configuration and still-valid uncompromised pair, retest and reload. An expired or exposed old pair is not a safe rollback: escalate for a valid emergency replacement.',
        ],
        null,
        'A tested replacement is active and a usable recovery plan is retained; the old pair is retired only under policy.',
        'If the old certificate has already expired or its key is compromised, follow the PKI incident process rather than claiming rollback restored trust.',
      ),
    ],
    'Where should expiry monitoring look?',
    [
      'At the live endpoint as well as the recorded certificate',
      'Only at an old downloaded file',
    ],
    0,
    'A correct file on disk can differ from the certificate a user actually receives.',
  ),
);
const windows = {
  id: 'pki-windows-iis',
  title: 'Windows Server / IIS Certificate Management',
  description:
    'Request and install a certificate for an IIS-hosted application, verify trust and bindings, and renew safely.',
  baseline:
    'Windows Server 2022 · Local Computer certificate stores · IIS-hosted application / planned osTicket scenario · IIS captures pending',
  prerequisite:
    'Start with the explanation page. Use a dedicated application-server VM with IIS and the application already working. Do not use a domain controller. This certificate class does not install IIS or osTicket.',
  supplies: [
    'A healthy private Windows Server application VM with IIS Manager, an existing named application site, and an authorized Administrator account.',
    'A recovery point, the application owner’s approved DNS name, a PKI team or separate disposable practice CA, and an allowed test client.',
    'The captured Windows guest has no IIS installation. Its genuine images show certificate-store navigation only; CSR issuance, IIS bindings and application HTTPS remain capture/validation gaps.',
  ],
  sources: Object.entries(sources).map(([title, url]) => ({ title, url })),
  lessons: [intro('pki-iis', true)],
};
const wx = 'Windows application VM · Administrator PowerShell';
windows.lessons.push(
  lesson(
    'pki-iis-plan',
    'Prepare the application and recovery plan',
    'Identify the right IIS site and record the binding before changing it.',
    'A working domain controller and a web application are different lab roles.',
    [
      step(
        'Confirm the application-server prerequisite',
        wx,
        'Certificate work belongs on the server hosting the intended TLS endpoint.',
        [
          'Check the machine name and OS. This class uses tickets.lab.example.test as a fictional private application name. Substitute only an application name approved for your environment.',
          'Confirm this is the dedicated application VM, not your domain controller. Run the role check. If Web-Server or Web-Mgmt-Console is not Installed, stop this route; do not install it on another server to get a screenshot.',
          'Open IIS Manager from Server Manager → Tools → Internet Information Services (IIS) Manager. Select Sites and identify the application by name and physical path. Confirm the application already works over its existing approved route.',
        ],
        'hostname\nGet-CimInstance Win32_OperatingSystem | Format-List Caption,Version,BuildNumber\nGet-WindowsFeature Web-Server,Web-Mgmt-Console | Format-Table Name,InstallState',
        'The selected machine is an application server and the real IIS site is identified.',
        'If the prerequisites are absent, read the certificate lessons but leave their live checks unverified.',
      ),
      step(
        'Save the current configuration and binding',
        wx + ' · IIS Manager',
        'The previous binding identifies the pair you can restore during a failed change.',
        [
          'Take an approved recovery point. Record the site name, IP, HTTPS port, hostname, SNI setting and selected certificate thumbprint. If HTTPS is absent, explicitly record that this change creates the first binding.',
          'Run an IIS configuration backup with a unique name. This saves IIS configuration, not the certificate private key or the application/database. Include those in the approved application recovery plan.',
          'Do not delete the old certificate or change HTTP/application settings as part of this certificate task.',
        ],
        '& "$env:WINDIR\System32\inetsrv\appcmd.exe" add backup SONIC-before-PKI\nImport-Module WebAdministration\nGet-WebBinding | Format-List protocol,bindingInformation,sslFlags,certificateHash,certificateStoreName',
        'Your notes and IIS backup preserve the original binding and its recovery requirements.',
        'If the backup name already exists, choose a fresh one. Stop if you cannot identify a valid previous certificate/key for an existing HTTPS site.',
      ),
    ],
    'Is an IIS configuration backup a private-key backup?',
    [
      'No; key and application recovery need their own protection',
      'Yes; it includes every secret',
    ],
    0,
    'The IIS configuration and certificate/key stores are separate recovery concerns.',
  ),
  lesson(
    'pki-iis-csr',
    'Create a machine key and CSR',
    'Use a SAN-aware request on the application server.',
    'The new certificate must return to the machine that holds its private key.',
    [
      step(
        'Prepare the SAN-aware request file',
        wx,
        'The browser matches DNS names in Subject Alternative Name.',
        [
          'Create C:\\SONIC-PKI on the application VM. Download iis-request.inf below into that folder.',
          'Open the INF in Notepad. Confirm Subject CN and the DNS SAN are tickets.lab.example.test for private practice, or your organization’s approved names. Confirm the key algorithm and PKI policy.',
          'MachineKeySet = TRUE creates the machine-context key; Exportable = FALSE keeps this practice key non-exportable. HashAlgorithm = sha256 signs the request. These are not the validity dates of the returned certificate.',
          'The IIS Manager Create Certificate Request wizard is another entry point, but do not assume its subject form adds your required SANs. This class uses certreq and then verifies the actual request.',
        ],
        'New-Item -ItemType Directory -Path C:\\SONIC-PKI -Force\nGet-Content C:\\SONIC-PKI\\iis-request.inf',
        'The approved application name appears in both the subject and SAN configuration.',
        'A missing or wrong SAN must be corrected before submission. Do not invent names to complete the form.',
      ),
      step(
        'Generate and inspect the request',
        wx,
        'The CSR can travel; the machine private key stays on this server.',
        [
          'Run certreq once for v1. If either request filename already exists, stop and inspect it rather than silently generating another key.',
          'Inspect the request dump. Find the subject, public-key algorithm, signature algorithm and DNS SAN. Compare them with the approved request notes.',
          'Keep this application VM and its machine key intact while issuance is pending. Moving only the CSR to another server does not move its private key. Never screenshot or transmit private-key contents.',
        ],
        "if (Test-Path C:\\SONIC-PKI\\iis-v1.csr) { throw 'CSR exists; inspect it before generating another key.' }\ncertreq.exe -new -machine C:\\SONIC-PKI\\iis-request.inf C:\\SONIC-PKI\\iis-v1.csr\ncertutil.exe -dump C:\\SONIC-PKI\\iis-v1.csr\nGet-FileHash C:\\SONIC-PKI\\iis-v1.csr -Algorithm SHA256",
        'The machine-context request contains the approved SAN and its hash is recorded.',
        'If certreq fails, stop. If the request has the wrong name or key policy, correct the INF and deliberately create a new version; do not submit a bad request.',
      ),
    ],
    'Which machine completes this request when the response returns?',
    [
      'The application server holding its matching machine private key',
      'Any server with the CSR text',
      'The domain controller by default',
    ],
    0,
    'Installing a public response must associate it with the retained matching private key.',
  ),
  lesson(
    'pki-iis-handoff',
    'Work with the PKI team and inspect the response',
    'Submit the checked CSR and identify the returned leaf and CA chain.',
    'A certificate with a future date can still be the wrong certificate.',
    [
      step(
        'Submit through the approved enrollment process',
        'Application owner · approved PKI ticket/portal',
        'Issuance needs ownership, policy and a tracked handoff.',
        [
          'Use the handoff checklist. Attach iis-v1.csr with the approved SAN list, application owner, environment, server-auth purpose, algorithm, validity request, contact and change window.',
          'Record the ticket number and request hash. Send neither the private key nor an unsolicited PFX. For lab practice, a separate practice-CA operator may act as the PKI team; do not install a CA role on the application VM for this class.',
          'Ask for the website leaf, public intermediate chain and the root fingerprint through a trusted channel. Wait for approval and issuance; a submitted CSR is not a new certificate.',
        ],
        null,
        'A tracked request is pending/issued through the intended team and the application private key remains on the server.',
        'Resolve pending or rejected requests with the signing operator while retaining the current valid binding.',
      ),
      step(
        'Inspect the returned certificate before import',
        wx,
        'Read the role, name, purpose and dates before selecting a store.',
        [
          'Save the public response files in C:\\SONIC-PKI as iis-v1.cer, intermediate.cer and root.cer. Follow the PKI team’s format instructions if it returns a PKCS#7 bundle instead.',
          'Inspect all three. The leaf names tickets.lab.example.test, permits Server Authentication, is not a CA, and is currently valid. The intermediate is a CA below the approved root.',
          'Compare the root’s SHA-256 fingerprint with the trusted PKI record; do not rely on a hash of a file as the certificate fingerprint when encodings differ. Double-click the public root → Details → Thumbprint algorithm/value where supported, or use an approved inspection tool.',
        ],
        'certutil.exe -dump C:\\SONIC-PKI\\iis-v1.cer\ncertutil.exe -dump C:\\SONIC-PKI\\intermediate.cer\ncertutil.exe -dump C:\\SONIC-PKI\\root.cer',
        'The response has the intended leaf and CA roles, valid dates and an approved trust anchor.',
        'Stop on a wrong name, expired/not-yet-valid response, CA-role confusion or uncertain root identity.',
      ),
    ],
    'Does renewing a leaf normally require creating a new root?',
    [
      'No; request a replacement leaf under the approved PKI',
      'Yes; every website needs its own root',
    ],
    0,
    'Root and intermediate lifecycles are managed by the PKI team, separately from a website leaf.',
  ),
  lesson(
    'pki-iis-stores',
    'Complete the request and place the chain correctly',
    'Associate the response with its key and use the correct Local Computer stores.',
    'Importing the wrong file into the wrong store can hide the real problem.',
    [
      step(
        'Find the Local Computer stores',
        'Windows application VM · Certificates (Local Computer)',
        'IIS reads machine certificates, not just the signed-in user’s personal store.',
        [
          'Open Start, search Manage computer certificates, and open it as Administrator. Verify the title says Certificates - Local Computer. certlm.msc is the equivalent console name.',
          'Expand Personal: its Certificates folder holds the application leaf with the associated private key.',
          'Trusted Root Certification Authorities holds approved root anchors. Intermediate Certification Authorities holds issuing intermediates. The screenshot is genuine Windows Server 2022 navigation; it does not demonstrate any import.',
        ],
        null,
        'You can distinguish Personal, Trusted Root and Intermediate under Local Computer.',
        'If the title says Current User, close that console and open Local Computer instead.',
        'windows-2022-stores',
      ),
      step(
        'Add only an approved missing CA chain',
        'Windows application VM · Certificates (Local Computer)',
        'Trust changes should be deliberate and limited to the right role.',
        [
          'If the organization already manages the root and intermediate, verify them and skip duplicate imports. If the root is not approved, stop here.',
          'For an explicitly approved missing root: expand Trusted Root Certification Authorities → right-click Certificates → All Tasks → Import. Click Next, browse to root.cer, confirm the selected store is Trusted Root Certification Authorities, then review and finish.',
          'For a missing intermediate: repeat Import under Intermediate Certification Authorities → Certificates using intermediate.cer. Never import the website leaf as a root.',
          'Record the exact thumbprints and stores changed. Clients also need the approved trust chain; importing on the server does not automatically update every browser.',
        ],
        null,
        'The correct approved CA certificates are present in their intended machine stores.',
        'For rollback remove only a newly added, recorded lab certificate when authorized and not used by other applications. Do not remove shared organizational roots.',
        'windows-2022-root-navigation',
      ),
      step(
        'Complete the pending request and verify its key',
        wx + ' · then certificate properties',
        'A public leaf without its private key cannot serve this website.',
        [
          'On the original application server, accept the response in machine context. This installs the response and links it to the pending machine private key.',
          'In Local Computer → Personal → Certificates, open the new leaf. The General tab should say you have a private key corresponding to this certificate. Check SAN, dates, server-auth purpose and Certification Path.',
          'Record the leaf thumbprint. If using IIS Manager Complete Certificate Request instead, select the returned leaf, a unique friendly name and the Personal store, then perform the same key and chain checks. Do not accept a disappearing certificate as success.',
        ],
        'certreq.exe -accept -machine C:\\SONIC-PKI\\iis-v1.cer\nGet-ChildItem Cert:\\LocalMachine\\My | Where-Object Subject -Like "*tickets.lab.example.test*" | Format-List Subject,Thumbprint,NotBefore,NotAfter,HasPrivateKey',
        'The new machine leaf has HasPrivateKey=True and the correct identity and chain.',
        'If the key is missing, stop before binding. Confirm this is the original CSR machine and response. Do not repair association by guessing a certificate/key.',
      ),
    ],
    'Where does the application leaf belong?',
    [
      'Local Computer → Personal, with its matching key',
      'Trusted Root to make it trusted',
      'Current User only',
    ],
    0,
    'The leaf identifies the application; roots establish approved trust.',
  ),
  lesson(
    'pki-iis-bind',
    'Bind HTTPS and validate the actual application',
    'Select the new leaf for the correct IIS site, then test from a client.',
    'A certificate installed in a store is not automatically used by an IIS website.',
    [
      step(
        'Choose the intended HTTPS binding',
        'Windows application VM · IIS Manager',
        'The IP, port, hostname and SNI setting choose which site answers.',
        [
          'Open IIS Manager. In Connections expand the server → Sites → select the existing application site. In Actions choose Bindings.',
          'For existing HTTPS select its recorded row → Edit. For the first approved HTTPS endpoint choose Add → Type https. Keep the approved private IP/All Unassigned choice, port 443 and tickets.lab.example.test hostname.',
          'Use Require Server Name Indication when your approved design shares the IP/port by hostname; preserve the recorded SNI choice for an existing site. Select the new leaf using its friendly name and verified thumbprint.',
          'Review the exact site and values, click OK, then Close. Keep the prior certificate installed. Do not restart all IIS services or rewrite osTicket/PHP settings just to change a binding.',
        ],
        null,
        'The intended site’s HTTPS binding selects the verified new leaf.',
        'If the leaf is absent, recheck Local Computer Personal, private-key association and server-auth purpose; do not select an unrelated certificate.',
      ),
      step(
        'Verify TLS identity and application behavior',
        'Allowed private test client · browser and PowerShell',
        'Users need a trusted HTTPS connection to the intended application.',
        [
          'Resolve tickets.lab.example.test to the verified private application address using your approved private DNS or a temporary lab hosts entry. Do not change public DNS.',
          'From a client with the approved CA trust, browse to https://tickets.lab.example.test. View the certificate and compare its serial/thumbprint and dates with the issued leaf. Test the actual application, including the agreed osTicket page/login or test-ticket workflow once osTicket exists.',
          'Run the request below without certificate-validation bypasses. An HTTP response alone is not proof the right application or new certificate answered.',
          'If there is a TLS warning, investigate name, dates, chain and client trust. A 500/application error after successful TLS belongs to the application layer; do not keep replacing certificates.',
        ],
        'Invoke-WebRequest -UseBasicParsing -Uri https://tickets.lab.example.test/',
        'The live endpoint presents the new leaf, the client validates it and the expected application works.',
        'For a timeout check address, listener, route and approved firewall rules. For the wrong certificate inspect SNI and IIS/HTTP.sys bindings. Do not disable validation.',
      ),
    ],
    'Does HasPrivateKey=True prove IIS is using that certificate?',
    [
      'No; verify the binding and live endpoint',
      'Yes; every site uses the newest leaf',
    ],
    0,
    'Store installation, HTTPS binding and client validation are separate checks.',
  ),
  lesson(
    'pki-iis-renew',
    'Maintain expiration and rehearse rollback',
    'Renew early, test the new binding and retain a valid recovery option.',
    'The application owner needs enough time for PKI approval and deployment.',
    [
      step(
        'Maintain the certificate inventory',
        wx + ' · change record',
        'A named owner and earlier reminders prevent expiry surprises.',
        [
          'Download the inventory CSV. Record hostname, site, endpoint, leaf thumbprint/serial, issuer, UTC expiry, private-key location/context, owner, backup owner, ticket and renewal due date.',
          'Inspect certificates nearing expiry with the example 30-day filter. Choose reminder windows that include your PKI team’s lead time and a change/recovery window.',
          'Monitor the real HTTPS endpoint and alert delivery as well. A certificate in Personal might be unused; an endpoint might be served by a proxy. Assign who reviews and acts on alerts.',
        ],
        'Get-ChildItem Cert:\\LocalMachine\\My | Where-Object { $_.NotAfter -le (Get-Date).AddDays(30) } | Select-Object Subject,Thumbprint,NotAfter,HasPrivateKey',
        'Inventory and tested monitoring identify the owner and renewal deadline for the actual endpoint.',
        'If the deadline is too close, escalate immediately instead of waiting for a scheduled reminder.',
      ),
      step(
        'Renew with overlap, then verify or roll back',
        'Windows application VM · IIS Manager',
        'A new-key renewal needs the new leaf associated with its new machine key.',
        [
          'Confirm key-reuse policy. For a new key repeat the CSR chapter with iis-v2 filenames and retain the current leaf/key while the PKI team issues the replacement.',
          'Inspect and accept the returned v2 response on the same machine. Confirm its private key, SAN, dates, server-auth purpose and path before editing the binding.',
          'In the application site’s Bindings → https → Edit select the new leaf. Test the client again and compare the new serial/thumbprint. Record the actual activation and next expiry.',
          'If validation or the application fails, edit the same binding back to the recorded prior still-valid uncompromised leaf and retest. Do not remove the new or old keys until the change is resolved and retention policy permits it.',
          'If the prior leaf is expired or its key is exposed, it is not a safe rollback. Request a valid emergency replacement and follow the incident process. Remove a temporary lab hosts entry only after recording what it changed.',
        ],
        null,
        'The live binding uses the tested replacement, monitoring is updated and the recovery procedure is documented.',
        'If GUI state differs from what the client receives, inspect Get-WebBinding and netsh http show sslcert before making more changes.',
      ),
    ],
    'When is renewal complete?',
    [
      'After the live application presents and validates the new certificate',
      'When the PKI team sends an email',
      'When the CSR is created',
    ],
    0,
    'Issuance is only one part of renewal; deployment, client testing and monitoring complete it.',
  ),
);
// Fail closed between native commands; never continue with a stale request/key.
linux.lessons[2].steps[1].command = `sudo sh -c 'umask 077; test ! -e /etc/pki/tls/private/sonic-app-v1.key && openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out /etc/pki/tls/private/sonic-app-v1.key' &&
sudo chmod 600 /etc/pki/tls/private/sonic-app-v1.key &&
sudo openssl req -new -sha256 -key /etc/pki/tls/private/sonic-app-v1.key -out "$HOME/pki-work/app-v1.csr" -config "$HOME/pki-work/req.cnf" &&
sudo chmod 644 "$HOME/pki-work/app-v1.csr"`;
linux.lessons[1].steps[1].command =
  'sudo nginx -T\nsudo install -d -m 0700 /root/sonic-pki-backup\nsudo test ! -e /root/sonic-pki-backup/nginx-before-change && sudo cp -a /etc/nginx /root/sonic-pki-backup/nginx-before-change';
windows.lessons[2].steps[1].command = `if (Test-Path C:\\SONIC-PKI\\iis-v1.csr) { throw 'CSR exists; inspect it before generating another key.' }
certreq.exe -new -machine C:\\SONIC-PKI\\iis-request.inf C:\\SONIC-PKI\\iis-v1.csr
if ($LASTEXITCODE -ne 0) { throw 'CSR creation failed. Stop here.' }
certutil.exe -dump C:\\SONIC-PKI\\iis-v1.csr
Get-FileHash C:\\SONIC-PKI\\iis-v1.csr -Algorithm SHA256`;
windows.lessons[4].steps[2].command = `certreq.exe -accept -machine C:\\SONIC-PKI\\iis-v1.cer
if ($LASTEXITCODE -ne 0) { throw 'Response acceptance failed. Stop before binding.' }
Get-ChildItem Cert:\\LocalMachine\\My | Where-Object Subject -Like "*tickets.lab.example.test*" | Format-List Subject,Thumbprint,NotBefore,NotAfter,HasPrivateKey`;
windows.lessons[3].steps[1].command += `
$rootCertificate = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2('C:\\SONIC-PKI\\root.cer')
$sha256 = [System.Security.Cryptography.SHA256]::Create()
try { [BitConverter]::ToString($sha256.ComputeHash($rootCertificate.RawData)).Replace('-', '') } finally { $sha256.Dispose(); $rootCertificate.Dispose() }`;
windows.lessons[3].steps[1].actions[2] =
  'Compare the root certificate’s SHA-256 fingerprint printed by the final block with the trusted PKI record. The block hashes the certificate’s DER data, so a PEM file and the same DER certificate have the same fingerprint. This is different from hashing an arbitrary download file.';
const terms = [
  [
    'sudo',
    'Run this command with approved administrator privileges; enter your password only locally.',
  ],
  [
    'mkdir',
    'Create a folder. -p also permits an already existing parent folder.',
  ],
  [
    'chmod',
    'Set file permissions: 700 limits a directory to its owner; 600 protects a key; 644 permits reading a public file.',
  ],
  [
    'openssl req',
    'Create or inspect a Certificate Signing Request. -new creates it; -config selects the request settings.',
  ],
  [
    'genpkey',
    'Generate a private key; RSA 3072 is the selected practice algorithm and key size.',
  ],
  [
    '-key',
    'Choose the existing private key. It is read locally, not printed or sent to the PKI team.',
  ],
  ['-sha256', 'Use SHA-256 for the request or certificate signature digest.'],
  [
    '-pubkey',
    'Extract only a public key for comparison; this does not expose the private key.',
  ],
  [
    '-noout',
    'Suppress the encoded certificate/request body; combine it with the requested inspection fields.',
  ],
  [
    'openssl verify',
    'Check a certificate chain. -purpose sslserver also checks its suitability for a TLS server.',
  ],
  [
    '-CAfile',
    'Select the explicitly trusted root file for this check; this does not change system trust.',
  ],
  [
    '-untrusted',
    'Supply intermediate certificates for building the chain; this does not make them trusted roots.',
  ],
  [
    '-verify_hostname',
    'Require the certificate to match the named website. SNI alone is not name verification.',
  ],
  [
    '-checkend',
    'Return a failure status when the certificate expires within the given number of seconds.',
  ],
  [
    'nginx -t',
    'Check NGINX configuration before attempting a reload. It does not test the client trust chain.',
  ],
  ['reload nginx', 'Ask NGINX to load the tested configuration gracefully.'],
  [
    '--resolve',
    'Tell curl which private address to use for a hostname while preserving the HTTPS hostname check.',
  ],
  [
    '--cacert',
    'Use this approved CA root for curl validation; certificate checks remain enabled.',
  ],
  [
    'restorecon',
    'Apply the expected SELinux labels; do not disable SELinux to hide an access problem.',
  ],
  [
    'update-ca-trust',
    'Rebuild this machine’s shared CA trust after an explicitly approved root change.',
  ],
  [
    'certreq.exe -new',
    'Create the request and matching machine private key from the INF settings.',
  ],
  [
    '-machine',
    'Use Local Computer key/certificate context instead of only the signed-in user’s store.',
  ],
  [
    'certreq.exe -accept',
    'Install a signed response and associate it with its pending matching private key.',
  ],
  [
    'certutil.exe -dump',
    'Read the public certificate/request details without installing it.',
  ],
  [
    'Get-FileHash',
    'Compute a file digest for the request/change record. A file digest is not always a certificate fingerprint.',
  ],
  [
    'HasPrivateKey',
    'Whether Windows has the matching private key associated with this installed certificate.',
  ],
  [
    'Get-WebBinding',
    'Inspect website bindings; this does not replace a client-side application test.',
  ],
  [
    '&&',
    'Continue to the next command only if the preceding command succeeded.',
  ],
];
for (const course of [linux, windows])
  for (const chapter of course.lessons)
    for (const item of chapter.steps) {
      const found = terms
        .filter(([term]) => item.command?.includes(term))
        .map(([term, meaning]) => ({ term, meaning }));
      if (found.length) item.breakdown = found;
    }
linux.lessons[2].steps[0].downloads = [
  { title: 'Download req.cnf', href: '/pki-lab/req.cnf' },
];
windows.lessons[2].steps[0].downloads = [
  { title: 'Download iis-request.inf', href: '/pki-lab/iis-request.inf' },
];
for (const course of [linux, windows]) {
  course.lessons.find((l) => l.id.endsWith('-handoff')).steps[0].downloads = [
    { title: 'PKI handoff checklist', href: '/pki-lab/pki-handoff.txt' },
  ];
  course.lessons.at(-1).steps[0].downloads = [
    {
      title: 'Certificate inventory CSV',
      href: '/pki-lab/certificate-inventory.csv',
    },
  ];
  fs.mkdirSync(path.join(root, 'content/pki'), { recursive: true });
  fs.writeFileSync(
    path.join(
      root,
      'content/pki',
      course === linux ? 'alma-nginx.json' : 'windows-iis.json',
    ),
    JSON.stringify(course, null, 2) + '\n',
  );
}
console.log(
  'Authored 2 separate PKI classes, ' +
    [linux, windows].reduce((n, c) => n + c.lessons.length, 0) +
    ' chapters, ' +
    [linux, windows].flatMap((c) => c.lessons.flatMap((l) => l.steps)).length +
    ' guided steps.',
);
