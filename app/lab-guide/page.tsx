import { everydayWords } from '../../lib/beginner-directions';
import { ConsoleReaderShell } from '../console-reader-shell';
export default function LabGuide() {
  return (
    <ConsoleReaderShell>
      <main className="academy-information beginner-lab-guide">
        <h1>Your beginner lab guide</h1>
        <p>
          You do not need to know every IT term before starting. Keep your
          lesson beside the app you are using and finish the current check
          before moving on.
        </p>
        <section id="tools">
          <h2>Get the tools before starting</h2>
          <ol>
            <li>
              On your Windows PC, open the{' '}
              <a
                href="https://www.vmware.com/products/desktop-hypervisor/workstation-and-fusion"
                target="_blank"
                rel="noreferrer"
              >
                official VMware desktop hypervisor page
              </a>
              . Follow its Workstation Pro download link. Sign in or create the
              requested Broadcom account, choose the Windows download and read
              the listed host requirements. Use a build supported on your
              Windows version; do not bypass an unsupported-host error.
            </li>
            <li>
              In File Explorer, open Downloads. Right-click the downloaded
              VMware installer → Run as administrator. Follow the installer,
              accept terms only if you agree, and restart if asked. Then open
              Start → VMware Workstation Pro → Help → About and record the
              version.
            </li>
            <li>
              Open the{' '}
              <a
                href="https://www.microsoft.com/en-us/evalcenter/evaluate-windows-server-2019"
                target="_blank"
                rel="noreferrer"
              >
                Windows Server 2019 Evaluation page
              </a>
              . Complete registration if asked, choose the 64-bit ISO and save
              it in C:\LabISOs. Keep Server 2019 for these on-premises
              exercises; the later Azure class teaches its separate 2022
              upgrade.
            </li>
            <li>
              For AlmaLinux, use{' '}
              <a
                href="https://almalinux.org/get-almalinux/"
                target="_blank"
                rel="noreferrer"
              >
                Get AlmaLinux
              </a>{' '}
              and choose the course’s major version 9, x86_64 DVD image. Follow
              the installation lesson’s software profile. Do not substitute a
              different major version and expect every package or screen to
              match.
            </li>
            <li>
              When a class asks you to verify a download, open PowerShell and
              run{' '}
              <code>
                Get-FileHash -Algorithm SHA256 -LiteralPath
                'C:\LabISOs\YOUR-DOWNLOADED-FILE.iso'
              </code>{' '}
              after replacing the filename. Compare the full result with the
              publisher’s checksum for that exact file; a filename alone does
              not prove the download is correct.
            </li>
          </ol>
          <p>
            Need Node.js, npm, Git or optional VS Code? The{' '}
            <a href="/migration#view=terminal&amp;setup=1">
              Windows terminal setup guide
            </a>{' '}
            provides the PowerShell install commands and tells you where to
            paste them.
          </p>
        </section>
        <section id="names">
          <h2>Use practice names, not a real business domain</h2>
          <p>
            <code>lab.example.test</code> is a made-up domain reserved for this
            training. It does not need to be purchased and should not be added
            to public DNS. Create it only in the private lab’s AD/DNS setup.{' '}
            <code>APP01</code> is our example application server, not a special
            name required by Windows.
          </p>
          <p>
            For your first build, use the example names so commands and pictures
            are easy to compare. If continuing a lab you already built, keep its
            names and record the differences. Never rename a working directory
            just to match a picture.
          </p>
          <p>
            Text inside angle brackets, such as{' '}
            <code>{'<your-subscription-id>'}</code>, is a placeholder: replace
            the entire label, including the brackets, with your own value before
            running that command. Do not put passwords or private keys in your
            notes.
          </p>
        </section>
        <section id="resources">
          <h2>Keep the VM footprint small</h2>
          <p>
            A virtual disk’s capacity is its maximum size. A growable disk uses
            host storage as the VM writes data. A 60 GB growable disk does not
            immediately reserve 60 GB, but it can grow to that size. Updates,
            backups and snapshots need extra room.
          </p>
          <ol>
            <li>
              In VMware, power off the VM before changing its hardware. Open VM
              → Settings → Memory or Processors.
            </li>
            <li>
              For a new virtual disk, leave{' '}
              <strong>Allocate all disk space now</strong> unchecked if that
              option is offered. Choosing single-file versus split files does
              not by itself decide whether the disk is growable.
            </li>
            <li>
              Keep only the VMs needed for the current lesson running. On your
              host, press Ctrl+Shift+Esc → Performance to check memory; open
              File Explorer → This PC to check free disk space.
            </li>
            <li>
              If Windows updates or the app are too slow, shut the VM down and
              raise its memory. Do not take memory from the physical host until
              Windows itself starts paging heavily.
            </li>
          </ol>
          <div className="resource-table-scroll">
            <table>
              <caption>
                Starting points for tiny local practice workloads, not
                production sizing
              </caption>
              <thead>
                <tr>
                  <th>VM or workload</th>
                  <th>Small starting point</th>
                  <th>Storage and limits</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>DC01 / DC02 / DEST-DC01</td>
                  <td>1 vCPU, 2 GB RAM each</td>
                  <td>
                    60 GB growable disk. Use 4 GB if updates or the GUI need it.
                    Keep the two DCs running together for replication checks.
                  </td>
                </tr>
                <tr>
                  <td>APP01, basic IIS test</td>
                  <td>1 vCPU, 2 GB RAM</td>
                  <td>
                    60 GB growable. The full PHP/database help desk starts at 2
                    vCPUs and 4 GB RAM; raise it if needed.
                  </td>
                </tr>
                <tr>
                  <td>AlmaLinux gateway / desktop</td>
                  <td>
                    Gateway: 1–2 vCPUs, 2 GB RAM. Desktop: 2 vCPUs, 4 GB RAM.
                  </td>
                  <td>
                    30 GB growable for the gateway; 40 GB or more for a desktop
                    with apps. Games need their own space.
                  </td>
                </tr>
                <tr>
                  <td>OPNsense FW01</td>
                  <td>2 vCPUs, 4 GB RAM</td>
                  <td>
                    Keep the class’s 40 GB growable disk and four-adapter
                    layout. Check the selected release’s requirements.
                  </td>
                </tr>
                <tr>
                  <td>SQL practice only</td>
                  <td>2 vCPUs, 4 GB RAM for a tiny standalone demo</td>
                  <td>
                    A growable disk with room for Windows, the engine, data and
                    backups. Set SQL’s memory limit so Windows has room. This is
                    not the MECM database sizing.
                  </td>
                </tr>
                <tr>
                  <td>MECM, its SQL server, WSUS and Splunk</td>
                  <td>Use the product-specific allocation in that class</td>
                  <td>
                    Do not copy the 2 GB DC plan. These services need more
                    memory and content/log storage. Run the extension later if
                    your host cannot fit its documented requirements.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            We keep Windows system-disk capacity roomy and growable rather than
            promise that a 40 GB system disk will have enough space for every
            update. A snapshot is not a backup, and deleting files inside a VM
            does not always shrink its host disk file.
          </p>
        </section>
        <section id="words">
          <h2>Common IT words, in plain English</h2>
          <dl>
            {everydayWords.map(([word, meaning]) => (
              <div key={word}>
                <dt>
                  <strong>{word}</strong>
                </dt>
                <dd>{meaning}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section id="commands">
          <h2>Where do I paste a command?</h2>
          <ul>
            <li>
              <strong>Windows PowerShell:</strong> inside the Windows machine
              named in the step, open Start → Windows PowerShell. Choose Run as
              administrator only when asked. Look for the PS prompt.
            </li>
            <li>
              <strong>Linux:</strong> open the named VM’s console or its
              existing SSH connection. On GNOME, open Activities → Terminal.
              Linux commands belong there.
            </li>
            <li>
              <strong>SQL:</strong> open SQL Server Management Studio, connect
              to the named instance, then choose New Query. Check the database
              before Execute.
            </li>
            <li>
              <strong>Splunk:</strong> put SPL searches in Splunk Web’s Search
              box, not in a terminal.
            </li>
          </ul>
          <p>
            Copy only copies text. It does not run it. Read the block, replace
            any clearly marked placeholders, paste it into the named app, and
            then run it. Keep connected lines together when the lesson says they
            form one block.
          </p>
        </section>
        <section>
          <h2>Use the picture as a guide</h2>
          <p>
            Original vendor screenshots keep their original labels and colors. A
            picture may show a different example name or an older product
            version; follow the written value and look for the same control. A
            labeled illustration is a teaching guide, not a capture proving your
            VM worked. Save your own result after the step succeeds.
          </p>
        </section>
      </main>
    </ConsoleReaderShell>
  );
}
