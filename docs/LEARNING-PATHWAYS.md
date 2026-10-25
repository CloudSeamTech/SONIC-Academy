# Simpler learning pathways

The dashboard and both lesson readers use `app/learning-pathways.ts` as their navigation map. Every existing lesson remains accessible using its original ID and route. The source workbook and generated catalog are retained unchanged.

1. **Windows Server & Active Directory:** choose the lab, understand the network, prepare downloads, build a private VMware network, install DC01 with AD DS/DNS, create users and policy, add DC02 and verify replication, then join APP01 and test IIS.
2. **SQL Server:** choose supported installers, build SQL01 in lab.example.test, install SQL Server, create practice data with SSMS, and prove backup and restore.
3. **Microsoft Azure:** set the budget, plan the destination, build AZ-DC01, and prove private connectivity.
4. **Cloud Migrations:** review the project, choose a migration method and identity plan, build DEST-DC01, configure cross-forest DNS, transfer policy, move APP01 and rehearse rollback, check tool support, rehearse cutover, move a member server and practice SQL database to Azure, troubleshoot, and close the lab.
5. **Linux Administration:** a separate RHEL/Wazuh track containing the original 40 lessons: two-host build, secure access, file transfer, baseline and rollback, Wazuh installation, event verification, failure diagnosis, and recovery.

The Windows pathway contains 8 core lessons and 6 optional WSUS/MECM lessons; MECM requires completed SQL recovery first. SQL contains 5 core lessons and 5 optional high availability lessons; the latter requires SQL recovery, Azure foundations, and two healthy cluster nodes. The Azure pathway contains 4 lessons. Migrations contains 16 core lessons and an optional MECM migration lesson. This accounts for all 44 retained Windows/SQL/migration source lessons plus the new UPGRADE-01 Azure member-server upgrade exactly once, plus all 40 Linux lessons.

Core pagination skips optional extensions and follows Windows → SQL → Azure → migrations. Optional extension pagination remains inside that extension. Existing source-stage metadata is retained for traceability; the learner-facing directory and selected lesson progress use the new pathway sections.

Short titles and one-sentence introductions summarize the original content. The underlying commands, expected results, pass checks, references, and recovery instructions remain in the existing readers. Progress remains self-verified in the original independent browser storage keys, so previously completed work is not reset. The dashboard does not execute commands or invent lab status.

The current source baseline is Windows Server 2019 Desktop Experience in VMware Workstation Pro. LAB 17 builds a Server 2019 Azure destination and migrates the test workload/data; new UPGRADE-01 then upgrades APP02 inside Azure to Server 2022. It has a new ID so previously verified cutover-planning work does not grant upgrade completion.
