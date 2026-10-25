import {
  additionalScenarios,
  type TroubleshootingTip as Tip,
} from '@/lib/troubleshooting-scenarios';
const groups: { title: string; intro: string; source: string; tips: Tip[] }[] =
  [
    {
      title: 'Azure',
      intro: 'Start with the affected resource and its recent changes.',
      source:
        'https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/',
      tips: [
        {
          title: 'A virtual machine will not start',
          symptom: 'Start fails, or the VM stays unavailable.',
          where: 'Azure portal → Virtual machines → select the affected VM.',
          checks: [
            'Open Activity log. Find the failed Start operation and read its error details.',
            'Check Resource health and Service health for a platform incident.',
            'If the VM starts but Windows or Linux does not load, open Boot diagnostics and inspect its screenshot or serial log.',
          ],
          expected:
            'You can tell a capacity, permission or platform error from an operating system boot error.',
          next: 'Record the operation time and correlation ID. Follow the specific error guidance before resizing or repairing the VM.',
        },
        {
          title: 'RDP or SSH cannot connect',
          symptom: 'Your remote connection times out or is refused.',
          where: 'Azure portal → affected VM → Networking / Network settings.',
          checks: [
            'Confirm the VM is running and that you are using its current address.',
            'Check the network security group rules for the intended connection. Also check the guest firewall and whether RDP or SSH is running.',
            'For a private VM, use your approved VPN, Bastion or jump host. Network Watcher → Connection troubleshoot can help test the path.',
          ],
          expected:
            'The approved route reaches TCP 3389 for RDP or TCP 22 for SSH.',
          next: 'Fix the rule, route or service that failed. Keep management ports restricted to approved sources; do not open them to everyone.',
        },
        {
          title: 'Azure costs are higher than expected',
          symptom: 'Spending continues after you finish a lab.',
          where:
            'Azure portal → Cost Management → Cost analysis; select your subscription.',
          checks: [
            'Group costs by resource and service. Check the date range and allow for reporting delays.',
            'Check whether VMs show Stopped (deallocated). Shutting down inside Windows can leave compute allocated.',
            'Look for remaining disks, snapshots, public IPs, backup storage and enabled security plans.',
          ],
          expected:
            'You can name the resources still generating charges. Tags help identify an owner or lab; tags alone do not reduce prices.',
          next: 'Deallocate unused VMs and remove disposable resources only after confirming the data is no longer needed. Budget alerts warn you; they do not impose a hard spending cap.',
        },
      ],
    },
    {
      title: 'System administration · Windows and Active Directory',
      intro:
        'Check the server name, DNS, time and service state before changing roles.',
      source: 'https://learn.microsoft.com/en-us/troubleshoot/windows-server/',
      tips: [
        {
          title: 'A computer cannot join lab.example.test',
          symptom: 'Windows says it cannot find the domain.',
          where:
            'PowerShell on the practice member server. Run these read-only checks there.',
          checks: [
            'Run ipconfig /all and confirm the lab adapter is on VMnet2 with the planned 10.50.0.x address.',
            'Its DNS server should point to a working lab domain controller: DC01 at 10.50.0.10 or DC02 at 10.50.0.11, not a public DNS resolver.',
            'Use the command below to look for domain controller service records. Also compare the member server and DC clocks.',
          ],
          command:
            'Resolve-DnsName -Type SRV _ldap._tcp.dc._msdcs.lab.example.test',
          expected:
            'DNS returns service records for your domain controllers. A ping reply by itself does not prove AD or DNS is healthy.',
          next: 'Correct the lab adapter or DNS setting first, then retry the join. Save the exact join error if it still fails.',
        },
        {
          title: 'DC01 and DC02 are not replicating',
          symptom: 'A new user or DNS record is missing on the other DC.',
          where:
            'An elevated PowerShell window on a domain controller, using an authorized administrator account.',
          checks: [
            'Run the summary command below and note failures and the last successful replication.',
            'Confirm both DCs use the planned private addresses, can resolve each other and have synchronized time.',
            'Open Event Viewer → Directory Service and DNS Server. Match events to the failure time.',
          ],
          command: 'repadmin /replsummary\nrepadmin /showrepl',
          expected:
            'Replication partners report successful recent attempts without persistent failures.',
          next: 'Address the specific DNS, time, connectivity or authentication error. Do not delete or rebuild a DC as a first troubleshooting step.',
        },
        {
          title: 'A Windows service stopped or disk space is low',
          symptom: 'An application stopped responding or updates fail.',
          where:
            'PowerShell on the affected Windows server; Event Viewer for supporting evidence.',
          checks: [
            'Check free space with the commands below. In Services, find the actual service name and check its status.',
            'Read Event Viewer → Windows Logs → System and Application around the first failure.',
            'Check recent patches, configuration changes and application log growth.',
          ],
          command:
            'Get-Volume | Select-Object DriveLetter,FileSystemLabel,SizeRemaining,Size\nGet-Service | Where-Object Status -eq Stopped',
          expected:
            'You identify the affected volume or required service. Many stopped Windows services are normal.',
          next: 'Use the application runbook to recover only the required service. Do not delete database files or unfamiliar system folders to free space.',
        },
      ],
    },
    {
      title: 'RHEL and AlmaLinux',
      intro:
        'Use the terminal on the affected Linux machine. Start with read-only checks.',
      source:
        'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9',
      tips: [
        {
          title: 'A Linux service failed',
          symptom: 'The application is unavailable or systemctl shows failed.',
          where:
            'Terminal on the affected RHEL or AlmaLinux server. Replace SERVICE with its actual unit name, such as httpd.',
          checks: [
            'Read the status first, then the recent log entries below. sudo may ask for your own Linux password.',
            'Look for a missing file, invalid configuration, permission error or occupied port.',
            'If this is a web server, check whether its configured port is listening with ss -lnt.',
          ],
          command:
            'systemctl status SERVICE --no-pager\nsudo journalctl -u SERVICE -n 50 --no-pager\nss -lnt',
          expected:
            'The status and journal identify why the service failed or which dependency is unavailable.',
          next: 'Validate the configuration using the application’s own check, then restart only during an approved window. Recheck the service and the application afterward.',
        },
        {
          title: 'The Linux server cannot reach a website',
          symptom: 'A browser, curl or package download cannot connect.',
          where: 'Terminal on the affected Linux server.',
          checks: [
            'Inspect the address and default route below. A host-only VMnet2 adapter intentionally has no internet route.',
            'Check the active DNS settings with nmcli device show, then look up a known hostname.',
            'If DNS works, test the intended destination and port; a failed ping alone is not enough to diagnose a blocked application.',
          ],
          command: 'ip -brief address\nip route\ngetent hosts almalinux.org',
          expected:
            'You can distinguish a missing route, DNS lookup failure and application connection failure.',
          next: 'For an isolated lab, use the course’s temporary internet-access procedure when needed. Keep the private DC network isolated.',
        },
        {
          title: 'Disk space, permissions or SELinux block an app',
          symptom:
            'Writes fail, a service reports access denied, or updates cannot finish.',
          where:
            'Terminal on the affected Linux server. sudo is needed to read protected audit logs.',
          checks: [
            'Check both disk capacity and inode use below. Inspect the application’s actual file path with ls -ld.',
            'If permissions look correct, inspect recent SELinux AVC denials.',
            'Check the application documentation for the required ownership, SELinux labels and port policy.',
          ],
          command: 'df -h\ndf -i\ngetenforce\nsudo ausearch -m AVC -ts recent',
          expected:
            'You have evidence of a full filesystem, exhausted inodes, an ownership issue or an SELinux denial. ausearch requires the audit tools to be installed.',
          next: 'Fix the specific path or documented policy. Do not use chmod 777 or disable SELinux as a general fix.',
        },
      ],
    },
    {
      title: 'SQL Server',
      intro: 'Separate connection, authentication and database problems.',
      source: 'https://learn.microsoft.com/en-us/troubleshoot/sql/',
      tips: [
        {
          title: 'An application cannot connect to SQL Server',
          symptom:
            'The connection times out or reports that the server cannot be found.',
          where:
            'PowerShell on the application server; SQL Server Configuration Manager on the SQL server.',
          checks: [
            'Confirm the instance name and the actual configured TCP port. The example below assumes SQL01 uses TCP 1433; change it if yours differs.',
            'Check that the SQL Server service is running and TCP/IP is enabled for the intended instance.',
            'Check DNS, the SQL firewall rule and the application connection string.',
          ],
          command: 'Test-NetConnection SQL01.lab.example.test -Port 1433',
          expected:
            'TcpTestSucceeded is True for the configured port. That confirms a network connection, not a successful SQL login.',
          next: 'If the port works, test the approved login in SQL Server Management Studio (SSMS) and inspect the SQL error log.',
        },
        {
          title: 'SQL login fails or queries are blocked',
          symptom: 'Login failed, or a query waits much longer than usual.',
          where:
            'SSMS on an authorized administrator workstation; connect to the affected SQL instance.',
          checks: [
            'For a login failure, read the matching SQL error log entry and its state. Confirm the intended authentication mode and database access.',
            'For a slow query, open Activity Monitor and inspect Processes for blocking sessions. Appropriate server monitoring permissions are required.',
            'Record the blocking session, wait type and affected application before taking action.',
          ],
          expected:
            'You know whether the issue is a login permission, unavailable database, blocking transaction or resource pressure.',
          next: 'Ask the application owner about an unfinished transaction. Do not kill sessions, grant sysadmin or restart SQL as a first fix.',
        },
        {
          title: 'A database backup fails',
          symptom:
            'The backup job reports a failure or creates no usable backup.',
          where:
            'SSMS → Management → SQL Server Logs; SQL Server Agent → Job Activity Monitor for scheduled jobs.',
          checks: [
            'Read the exact job or backup error, rather than rerunning blindly.',
            'Check free space and whether the SQL Server service account can write to the destination.',
            'Check the last successful backup and practice restoring to a separate test database.',
          ],
          expected:
            'A new backup completes, and a separate test restore proves that the data can be recovered.',
          next: 'Fix the destination or permissions using the service account. A successful backup message or VERIFYONLY check alone does not replace a test restore.',
        },
      ],
    },
    {
      title: 'Migrations',
      intro:
        'Protect the source, check replication, and keep a clear go/no-go decision.',
      source: 'https://learn.microsoft.com/en-us/azure/migrate/',
      tips: [
        {
          title: 'Azure Migrate replication is unhealthy',
          symptom:
            'Replication stalls or reports an agent, connection or capacity error.',
          where:
            'Azure portal → Azure Migrate → your project → Migration and modernization → Replicating machines.',
          checks: [
            'Open the affected machine and read its replication health details and error code.',
            'Check the appliance or replication components, required outbound connectivity and available source storage using that error’s guidance.',
            'Record the last successful replication time and whether source data is still changing.',
          ],
          expected:
            'Replication becomes healthy and the recovery point meets your migration plan.',
          next: 'Resolve the named error and allow replication to catch up before cutover. Do not remove replication or delete the source VM just to clear an alert.',
        },
        {
          title: 'The test-migrated VM boots but the app fails',
          symptom:
            'Windows starts in Azure, but sign-in or the application fails.',
          where: 'The isolated Azure test VM and its test network.',
          checks: [
            'Confirm the test VM uses the planned DNS and can reach its required test dependencies.',
            'Check service status, firewall rules, connection strings and application logs.',
            'Check that the test network cannot conflict with the production source, especially duplicate domain controller identities.',
          ],
          expected:
            'A named user can complete a real test action, such as opening the app and reading the dummy record.',
          next: 'Fix and document the test result before scheduling cutover. A boot screenshot alone is not an application acceptance test.',
        },
        {
          title: 'Cutover validation fails and you may need rollback',
          symptom: 'The migrated application fails an agreed acceptance check.',
          where:
            'Your migration checklist, source and destination consoles, with the application owner.',
          checks: [
            'Stop new writes where the runbook requires it and record which side received data.',
            'Compare the failure against the agreed rollback deadline and recovery objectives.',
            'Use the pre-approved rollback procedure to restore traffic and service; verify DNS, logins and the last known good data.',
          ],
          expected:
            'One clearly identified system is authoritative, and users can complete the agreed acceptance tests.',
          next: 'Do not power on both copies into conflicting networks or roll back a database disk blindly. Resolve post-cutover data changes with the owner before returning service.',
        },
      ],
    },
    {
      title: 'Application issues · IIS, PHP and help desk',
      intro: 'Follow the request from browser to web server to database.',
      source:
        'https://learn.microsoft.com/en-us/troubleshoot/developer/webapps/iis/',
      tips: [
        {
          title: 'IIS returns 503 Service Unavailable',
          symptom: 'The site responds with HTTP 503.',
          where:
            'IIS Manager on APP01; Event Viewer → Windows Logs → Application.',
          checks: [
            'Open Application Pools and find the pool assigned to the affected site. Check whether it stopped.',
            'Read the matching Windows event before starting it again; repeated crashes may trigger rapid-fail protection.',
            'Check pool identity permissions, runtime dependencies and recent deployment changes.',
          ],
          expected:
            'The application pool stays running and a test request reaches the application.',
          next: 'Correct the reported cause and restart only the affected pool when approved. Do not disable rapid-fail protection to hide repeated crashes.',
        },
        {
          title: 'IIS or PHP returns a 500 error',
          symptom:
            'The site opens a server error page after a configuration or PHP change.',
          where:
            'IIS Manager, the site’s IIS logs and its configured PHP/application error log on APP01.',
          checks: [
            'Match the request time to the IIS status, substatus and Win32 status in the log.',
            'Check the PHP FastCGI executable path and handler mapping. In PowerShell, change to the actual PHP folder before running the commands below.',
            'Compare the PHP version, required extensions and php.ini settings with the application’s supported requirements.',
          ],
          command: '.\\php.exe -v\n.\\php.exe --ini\n.\\php.exe -m',
          expected:
            'PHP starts successfully, loads the intended configuration and includes the application’s required extensions.',
          next: 'Correct the specific mismatch or follow the tested version rollback plan. Keep detailed errors private; do not publish a phpinfo page containing server details.',
        },
        {
          title: 'A website has a certificate, DNS or database error',
          symptom:
            'The browser warns about HTTPS, cannot find the host, or the help desk cannot read its data.',
          where:
            'A client browser and PowerShell, then IIS Manager and the application logs on APP01.',
          checks: [
            'For this lab, confirm helpdesk.lab.example.test resolves to APP01’s planned address. The AD domain remains lab.example.test.',
            'In IIS Bindings, check the hostname, HTTPS port and certificate. Check the certificate expiry, matching name and client trust.',
            'If the page loads but its data does not, inspect the application log and its configured database connection without sharing passwords. osTicket uses MySQL or MariaDB: check that service and its configured port (often 3306). Use the SQL Server checks above only for an application that actually uses SQL Server.',
          ],
          command:
            'Resolve-DnsName helpdesk.lab.example.test\nTest-NetConnection helpdesk.lab.example.test -Port 443',
          expected:
            'The hostname resolves correctly, the HTTPS connection is trusted, and a test ticket can be created and read.',
          next: 'Fix the failing layer and retest from a client. Do not bypass certificate validation as the permanent solution.',
        },
      ],
    },
  ];

export function TroubleshootingLibrary() {
  return (
    <section
      className="troubleshooting-library"
      aria-label="Day-to-day troubleshooting"
    >
      <h2>What needs a hand?</h2>
      <p>
        Pick the area that matches your problem, then open a symptom. Start with
        the checks in order. These commands are examples for your own lab; this
        website does not run them.
      </p>
      <aside className="teaching-callout">
        <h3>Before you change anything</h3>
        <p>
          Write down the server or resource name, the exact error, when it
          started, and the last change. Check one thing at a time. Save
          passwords, tokens and customer data outside your troubleshooting
          notes.
        </p>
      </aside>
      {groups
        .map((baseGroup) => ({
          ...baseGroup,
          tips: [
            ...baseGroup.tips,
            ...(additionalScenarios[baseGroup.title] ?? []),
          ],
        }))
        .map((group) => (
          <details className="troubleshooting-category" key={group.title}>
            <summary>
              {group.title}
              <span>{group.tips.length} common issues</span>
            </summary>
            <p>{group.intro}</p>
            {group.tips.map((tip) => (
              <details className="troubleshooting-tip" key={tip.title}>
                <summary>{tip.title}</summary>
                <p>
                  <strong>What you noticed: </strong>
                  {tip.symptom}
                </p>
                <p>
                  <strong>Where to work: </strong>
                  {tip.where}
                </p>
                {tip.changesStorage && (
                  <aside className="teaching-callout">
                    <h4>This procedure changes storage</h4>
                    <p>
                      Use your own practice VM or an approved maintenance
                      window. Confirm the target names and a recoverable backup
                      before any write command. Stop if your layout differs.
                    </p>
                  </aside>
                )}
                {tip.storageMap && (
                  <figure className="lvm-storage-map">
                    <figcaption>How LVM shares disk space</figcaption>
                    <ol>
                      {[
                        'Disk · the storage device',
                        'PV · a disk LVM can use',
                        'VG · the shared space pool',
                        'LV · a slice of that pool',
                        'Filesystem · where your files live',
                      ].map((label) => (
                        <li key={label}>{label}</li>
                      ))}
                    </ol>
                  </figure>
                )}
                <ol>
                  {tip.checks.map((check) => (
                    <li key={check}>{check}</li>
                  ))}
                </ol>
                {tip.command && (
                  <>
                    <p>
                      <strong>
                        Paste into the terminal named above, one line at a time.
                      </strong>{' '}
                      Replace any named placeholders first.
                    </p>
                    <pre>
                      <code>{tip.command}</code>
                    </pre>
                  </>
                )}
                {tip.procedure?.map((step) => (
                  <section
                    className="troubleshooting-procedure"
                    key={step.title}
                  >
                    <h4>{step.title}</h4>
                    <aside className="teaching-callout">
                      <p>
                        <strong>Why: </strong>
                        {step.why}
                      </p>
                    </aside>
                    <ol>
                      {step.actions.map((action) => (
                        <li key={action}>{action}</li>
                      ))}
                    </ol>
                    {step.command && (
                      <>
                        <p>
                          <strong>In the Linux terminal:</strong> Replace the
                          named placeholders first. Run one line, check its
                          result, then continue.
                        </p>
                        <pre>
                          <code>{step.command}</code>
                        </pre>
                      </>
                    )}
                    <p>
                      <strong>Check before you continue: </strong>
                      {step.expected}
                    </p>
                  </section>
                ))}
                <aside className="teaching-callout">
                  <h4>What should I see?</h4>
                  <p>{tip.expected}</p>
                </aside>
                <p>
                  <strong>Your next move: </strong>
                  {tip.next}
                </p>
                {tip.references && (
                  <ul
                    className="troubleshooting-sources"
                    aria-label="Official references"
                  >
                    {tip.references.map((reference) => (
                      <li key={reference.url}>
                        <a
                          href={reference.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {reference.title} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </details>
            ))}
            <a href={group.source} target="_blank" rel="noreferrer">
              Official troubleshooting reference ↗
            </a>
          </details>
        ))}
      <p>
        Need the full build instructions?{' '}
        <a href="/?view=courses">Choose your class</a> and follow its lab steps.
      </p>
    </section>
  );
}
