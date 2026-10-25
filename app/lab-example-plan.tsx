export function LabExamplePlan({ lessonId }: { lessonId: string }) {
  const dmz = lessonId.startsWith('dmz-');
  const helpdesk = lessonId.startsWith('helpdesk-');
  const windows = /^(lab-|sql-|mecm-|wsus-|move-|ha-|az-|upgrade-|field-)/.test(
    lessonId,
  );
  const azure = /^(lz-|sec-|azure-|az-)/.test(lessonId);
  const splunk = lessonId.startsWith('splunk-');
  const scanner = lessonId.startsWith('nessus-');
  const example = dmz
    ? 'app-dmz.lab.example.test = the name a practice visitor uses. iis-backend.lab.example.test = the private IIS website name. PROXY01 = the gateway in the DMZ. IIS-DMZ01 = the private server that hosts the test page.'
    : helpdesk
      ? 'APP01 = the example application server. lab.example.test = the example Windows domain. helpdesk.lab.example.test = the example help desk website. Practice IT Help Desk = the name shown to your pretend users.'
      : windows
        ? 'DC01 and DC02 = example domain controllers for lab.example.test. APP01 = an example member/application server. SQL01 = an example database server. migrate.lab.example.test = the separate destination domain used only in the domain-move lessons.'
        : azure
          ? 'Resource names such as rg-practice-lab and APP02 are examples, not resources this website has created. Use your own subscription ID and the region you choose. A name ending in example.test is a private, fictional practice name.'
          : splunk
            ? 'sonic_lab is the example index: the place Splunk stores this class’s fake events. The downloadable CSV files contain pretend users, addresses and requests, not real attacks on the academy.'
            : scanner
              ? 'Scanner means the practice VM running Nessus. Target means a separate practice machine you own and have chosen to check. Website and host names in the examples are made up.'
              : 'Names such as rhel9-lab-01, rexuser and practice-lab are fictional example values. Use your own recorded VM name and user when they differ. A Linux terminal runs on the Linux machine, not automatically on your Windows host.';
  return (
    <section
      className="lab-example-plan"
      aria-label="Example names and what each machine does"
    >
      <h3>Example names — what they mean</h3>
      {/^(mecm-)/.test(lessonId) && (
        <p>
          <strong>What MECM does:</strong> Configuration Manager helps IT
          install software, send settings and check many computers from one
          console. A client is a managed computer. A collection is a group you
          target; we start with one practice client so a mistake does not affect
          everyone.
        </p>
      )}
      {/^(wsus-|lab-13)/.test(lessonId) && (
        <p>
          <strong>What WSUS does:</strong> it helps an organization choose which
          Microsoft updates its computers receive. We approve a small pilot
          group first, check that it still works, and then consider the
          remaining computers.
        </p>
      )}
      {/^(sql-|move-02)/.test(lessonId) && (
        <p>
          <strong>What SQL does:</strong> a database stores records in tables, a
          little like organized worksheets. SQL Server is the engine; SSMS is
          the app we use to ask it questions and manage backups. A query is an
          instruction you run in SSMS.
        </p>
      )}
      {/^(ha-)/.test(lessonId) && (
        <p>
          <strong>What we are learning:</strong> two SQL servers can keep copies
          of a database. Failover means changing which healthy copy serves the
          app. A witness helps the cluster decide whether it can keep running.
          This is an optional extension: finish the single-server SQL and
          restore classes first.
        </p>
      )}
      {splunk && (
        <p>
          <strong>What Splunk does:</strong> it collects event records so you
          can search what happened. An index is a named place for events. An SPL
          search asks a question about them; a dashboard displays saved searches
          as useful charts and tables.
        </p>
      )}
      {scanner && (
        <p>
          <strong>What Nessus does:</strong> it runs checks for known weaknesses
          on the practice machines you choose. A scan policy is the list of
          checks and settings. A reported finding is a clue to investigate, not
          proof that someone broke into the server.
        </p>
      )}
      {/^lab-0[4578]/.test(lessonId) && (
        <p>
          <strong>Three terms you will use:</strong> Active Directory stores the
          lab’s accounts and rules. DNS finds a server’s address from its name.
          An OU is a folder-like group in AD; a GPO is a set of Windows settings
          you can apply to the intended computers or users.
        </p>
      )}

      <p>{example}</p>
      {/^(sql-|move-|ha-)/.test(lessonId) && (
        <p>
          <strong>Which database?</strong> AgencyHelpdesk is a fake SQL Server
          practice database. It is separate from osTicket’s MariaDB database and
          from MECM’s site database. Do not run the sample SQL scripts on either
          application database.
        </p>
      )}
      {helpdesk && (
        <p>
          <strong>What APP01 hosts:</strong> IIS receives browser requests. PHP
          runs osTicket. MariaDB stores the practice users and tickets; this
          small private lab keeps it on APP01 and limits it to local
          connections. DC01 and DC02 provide sign-in and DNS, not the help desk
          website. No server is placed in a DMZ during this class.
        </p>
      )}
      {dmz && (
        <p>
          <strong>What goes in the DMZ:</strong> only PROXY01, the web gateway.
          It forwards allowed HTTPS requests to IIS-DMZ01, which stays private.
          We use a small page first to prove the route. The separate help desk
          class installs osTicket; a real ticketing deployment needs its
          application, database and file-transfer paths reviewed too.
        </p>
      )}
      {(windows || helpdesk || dmz) && (
        <p>
          <strong>Continuing an existing lab?</strong> Keep its current domain
          and server names in your notes. These fictional examples do not tell
          you to rename a working AD forest or change public DNS. Use the sample
          names for a fresh practice build.
        </p>
      )}
      <p>
        <a href="/lab-guide">
          Need help with names, commands, or saving VM space? Open the beginner
          lab guide →
        </a>
      </p>
    </section>
  );
}
