# Beginner curriculum conventions

The current classroom examples use `lab.example.test`, `migrate.lab.example.test` and `azure.lab.example.test`. `example.test` is a reserved fictional domain. These are private training values, not public website or email configuration. New lab forests use NetBIOS `LAB`; the separate destination uses `MIGRATE`. Keep distinguished names, account examples, DNS queries, certificates, proxy configuration and downloadable scripts consistent.

`DC01`, `DC02`, `APP01`, `SQL01` and the other role-based names are fictional defaults. A fresh learner can follow them as written; an existing learner records their actual values and does not rename an AD forest or application just to match an illustration. Clearly marked inputs such as `<your-subscription-id>` must be replaced before use.

The public website remains cloudseam.tech. Branding, support@cloudseam.tech, authentication callbacks, DNS/hosting and billing information keep the real business domain. Do not globally replace those with the training domain.

Each step tells the learner where to work, what to select or paste, why it matters and what to check. A click path must name controls available in the relevant app. PowerShell inside APP01 is not the host's PowerShell. A SQL query goes in SSMS; SPL goes in Splunk Web. Keep the real commands, rights and recovery requirements; simplify their explanation rather than remove essential steps.

The private help desk class puts IIS, PHP/osTicket and a local, loopback-bound MariaDB database on APP01 for a small demonstration. Domain controllers provide AD/DNS, not the website. The DMZ class uses a separate PROXY01 gateway and private IIS-DMZ01 test server. Its sample page proves the network route; it is not a complete migrated ticketing system.

Use one darker cream teaching surface with dark text. Purple controls keep white text. Original vendor screenshots retain their pixels and provenance; their example values may differ. Owned text diagrams may update labels and the teaching palette, but must remain labeled illustrations, never live captures or verified results. Reuse owned diagram file paths to avoid accumulating a new asset for each copy edit.

For small local practice, use growable disks and stop unused VMs. Do not infer growability from single-file versus split-file storage. Small AD/IIS allocations are not MECM, WSUS, Splunk or production sizing. See `/lab-guide#resources` for the workload-specific plan. Evaluation conditions, vendor requirements and actual performance still apply.
