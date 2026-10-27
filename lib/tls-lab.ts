/** Browser-only rehearsals. No shell, CA, or certificate operation executes here. */
export const tlsTerminalTasks = [
  {
    id: 'os',
    task: 'On the application server, read the RHEL release file.',
    command: 'cat /etc/redhat-release',
    why: 'cat prints the release label. This browser exercise does not read your VM.',
  },
  {
    id: 'loaded',
    task: 'Test and print all loaded NGINX configuration files.',
    command: 'sudo nginx -T',
    why: 'Capital -T tests and dumps the configuration. Lowercase -t tests without dumping it.',
  },
  {
    id: 'test',
    task: 'Test the candidate NGINX configuration without activating it.',
    command: 'sudo nginx -t',
    why: 'Lowercase -t checks syntax and file loading. It does not prove client trust or expiration.',
  },
  {
    id: 'reload',
    task: 'After a successful test, gracefully reload NGINX.',
    command: 'sudo systemctl reload nginx',
    why: 'reload adopts the candidate configuration without an unnecessary service restart. Verify the real endpoint afterwards.',
  },
];
export function checkTlsCommand(taskId: string, value: string) {
  const task = tlsTerminalTasks.find((item) => item.id === taskId);
  if (!task) return false;
  return value.trim().replace(/\s+/g, ' ') === task.command;
}
export const tlsScenarios = [
  {
    id: 'expired',
    title: 'Expired certificate',
    evidence:
      'Client: certificate has expired. The served leaf notAfter is yesterday; the client clock is correct.',
    choices: [
      'Change the client clock',
      'Verify the active pair and request a valid renewal',
      'Use curl -k',
    ],
    answer: 1,
    why: 'Renew through the approved issuer, validate the replacement pair and verify it from the client. Do not hide expiry.',
  },
  {
    id: 'key',
    title: 'Wrong private key',
    evidence:
      'nginx -t: key values mismatch. The two extracted public-key fingerprints differ.',
    choices: [
      'Find the correct approved pair or reissue for a new key',
      'Make the key mode 777',
      'Rename the certificate to match the key',
    ],
    answer: 0,
    why: 'Names and permissions cannot turn two unrelated public/private keys into a matching pair.',
  },
  {
    id: 'intermediate',
    title: 'Missing intermediate',
    evidence:
      'Client: unable to get local issuer certificate. NGINX serves only the leaf; the client already trusts the correct root.',
    choices: [
      'Trust every certificate',
      'Copy the CA private key to NGINX',
      'Add the correct public intermediate after the leaf',
    ],
    answer: 2,
    why: 'Build the actual issuer chain in leaf-first order, then test, reload and verify it.',
  },
  {
    id: 'chain',
    title: 'Invalid chain',
    evidence:
      'The leaf names Issuing CA A, but the provided intermediate is Issuing CA B. Verification fails.',
    choices: [
      'Disable verification',
      'Obtain the correct issuer chain from the approved CA',
      'Put the unrelated root first',
    ],
    answer: 1,
    why: 'A chain must verify cryptographic issuer links to a trusted root; similar filenames are not enough.',
  },
  {
    id: 'name',
    title: 'Wrong DNS name',
    evidence:
      'Requested name: app.example.mil. SAN: DNS:other.example.mil. Client: hostname mismatch.',
    choices: [
      'Request the approved correct SAN',
      'Edit the certificate text',
      'Use only the Common Name',
    ],
    answer: 0,
    why: 'The CA must issue a new signed certificate for the intended approved SAN. Editing a certificate breaks its signature.',
  },
  {
    id: 'permissions',
    title: 'File permission problem',
    evidence:
      'NGINX reports permission denied reading the planned key. Metadata shows the wrong owner for this standard root-master service.',
    choices: [
      'Disable the firewall',
      'Grant all users key access',
      'Inspect ownership, parent access and service privileges',
    ],
    answer: 2,
    why: 'Check the specific access problem; use root ownership and mode 600 for this lab. Do not grant broad access.',
  },
  {
    id: 'selinux',
    title: 'SELinux denial',
    evidence:
      'NGINX fails. Mode bits look right, but an AVC names the certificate path and matchpathcon shows a label mismatch.',
    choices: [
      'Fix the planned path/context with restorecon and retest',
      'Set SELinux permissive forever',
      'Install every audit2allow suggestion',
    ],
    answer: 0,
    why: 'Use installed policy labels on the standard path. A nonstandard path needs an approved persistent policy decision.',
  },
  {
    id: 'syntax',
    title: 'Configuration test failure',
    evidence:
      'nginx -t names app-tls.conf and a line containing a missing semicolon.',
    choices: [
      'Restart immediately',
      'Fix the named line and rerun the test before reload',
      'Delete the private key',
    ],
    answer: 1,
    why: 'Do not activate a candidate configuration until its syntax and file-loading test succeeds.',
  },
  {
    id: 'reload',
    title: 'Failed reload',
    evidence:
      'The journal reports reload failure, but existing workers still serve the prior valid certificate.',
    choices: [
      'Assume the website is offline',
      'Stop NGINX without checking',
      'Keep the healthy workers while diagnosing or restoring a valid candidate',
    ],
    answer: 2,
    why: 'Service status, candidate validity and the actual client result are separate checks. Avoid an unnecessary outage.',
  },
  {
    id: 'browser',
    title: 'Browser trust warning',
    evidence:
      'The leaf, name and intermediate are correct. Only the disposable Firefox profile without the checked practice root warns.',
    choices: [
      'Accept the risk on every visit',
      'Compare the root fingerprint and import it only in the intended practice profile',
      'Turn off all browser certificate checking',
    ],
    answer: 1,
    why: 'A new private CA needs a deliberate, scoped trust decision. Never trust an unverified root.',
  },
  {
    id: 'wrong',
    title: 'Wrong certificate presented',
    evidence:
      'The disk certificate is v3, but the client sees another serial. The test omitted SNI.',
    choices: [
      'Retest with the intended server name and inspect loaded virtual hosts',
      'Generate a fourth root CA',
      'Delete all default sites',
    ],
    answer: 0,
    why: 'Send SNI with -servername and compare the endpoint, loaded config, serial and last successful reload.',
  },
  {
    id: 'balancer',
    title: 'Load balancer terminates TLS',
    evidence:
      'The public endpoint presents a load-balancer certificate; the direct approved RHEL backend presents the renewed leaf.',
    choices: [
      'Repeat the same backend reload forever',
      'Turn off backend TLS',
      'Coordinate the front-end certificate with the load-balancer owner',
    ],
    answer: 2,
    why: 'Renew at the actual browser-facing TLS terminator and verify both hops. This private lab has no live load balancer.',
  },
];
export function checkTlsScenario(id: string, answer: number) {
  const scenario = tlsScenarios.find((item) => item.id === id);
  return Boolean(scenario && scenario.answer === answer);
}
