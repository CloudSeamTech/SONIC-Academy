'use client';

import { useState } from 'react';

function SetupCommands({
  commands,
  windowName,
}: {
  commands: string;
  windowName: string;
}) {
  const [notice, setNotice] = useState('');
  return (
    <div className="setup-commands">
      <p>
        <strong>Where to type:</strong> {windowName}, beside the{' '}
        <code>PS C:\…&gt;</code> prompt. Type one line at a time, then press
        Enter. Wait for the prompt to return before typing the next line. The
        final <code>run dev</code> and <code>companion:start</code> commands
        keep running; leave those windows open.
      </p>
      {commands.split('\n').map((line, index) => (
        <div className="setup-command-line" key={line}>
          <pre>
            <code>{line}</code>
          </pre>
        </div>
      ))}
      <p role="status" aria-live="polite">
        {notice}
      </p>
    </div>
  );
}

export function TerminalSetup() {
  return (
    <details className="terminal-setup guided-reference">
      <summary>Get real terminal output · start here on Windows</summary>
      <p>
        We’ll install the tools first, then connect the terminal to your own PC.
        Use your Windows 10 host, not a server VM. You don’t need an npm account
        or a paid subscription. Opening this website does not install anything.
      </p>
      <p>
        <strong>Your workspace:</strong> Keep this guide open in your browser.
        The setup commands below go into the separate Windows PowerShell app on
        your PC, not the browser address bar or this website’s command field.
        You’ll use two PowerShell windows: window 1 runs the website, and window
        2 runs the companion.
      </p>
      <p>
        If you opened Node.js and see only a <code>&gt;</code> prompt, close it.
        Open <strong>Windows PowerShell</strong> from Start instead. Do not type
        the <code>PS C:\…&gt;</code> prompt itself; type only the command.
      </p>
      <ol>
        <li>
          <h3>Step 1: Open PowerShell and check Windows Package Manager</h3>
          <p>
            Press the Windows key, type <strong>Windows PowerShell</strong>, and
            select Open. Use your normal account. This is window 1. Click beside
            its <code>PS</code> prompt, then type this command and press Enter.
          </p>
          <SetupCommands
            windowName="PowerShell window 1"
            commands={'winget --version'}
          />
          <p>
            <strong>Why:</strong> winget installs programs from PowerShell. A
            version number means it is ready.
          </p>
          <details>
            <summary>Windows says winget is not recognized?</summary>
            <p>
              First close and reopen PowerShell and try again. Still missing?
              Run this command to open Microsoft Store’s App Installer page,
              then select Install or Update. App Installer supplies winget; you
              only need this Store step when it is missing. Reopen PowerShell
              afterward and check again.
            </p>
            <SetupCommands
              windowName="PowerShell window 1"
              commands={
                'Start-Process "ms-windows-store://pdp/?ProductId=9NBLGGH4NNS1"'
              }
            />
            <p>
              If your organization blocks Microsoft Store, ask its IT team to
              provide App Installer. Do not continue until{' '}
              <code>winget --version</code> works.
            </p>
          </details>
        </li>
        <li>
          <h3>Step 2: Install Node.js and npm</h3>
          <SetupCommands
            windowName="PowerShell window 1"
            commands={
              'winget install --id OpenJS.NodeJS.LTS --exact --source winget'
            }
          />
          <p>
            <strong>Why:</strong> Node.js runs the local website. Its installer
            includes npm, which installs the website’s packages. There is no
            separate npm download or npm account.
          </p>
          <p>
            Read and accept any package agreements if you agree, and approve the
            installer’s Windows prompt if you have administrator permission.
            Wait for “Successfully installed.” If winget reports it is already
            installed, check its version in the next steps. The app needs
            Node.js 22.13 or newer.
          </p>
        </li>
        <li>
          <h3>Step 3: Install Git</h3>
          <SetupCommands
            windowName="PowerShell window 1"
            commands={'winget install --id Git.Git --exact --source winget'}
          />
          <p>
            <strong>Why:</strong> Git copies the SONIC-Academy files from GitHub
            onto your PC. Wait for installation to finish. You do not need a
            GitHub account for this public project.
          </p>
        </li>
        <li>
          <h3>Step 4: Refresh PATH so PowerShell can find the new tools</h3>
          <SetupCommands
            windowName="PowerShell window 1"
            commands={
              "$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')"
            }
          />
          <p>
            <strong>Why:</strong> PATH is Windows’ list of places to look for
            programs. This reloads the saved list into this PowerShell window
            after installation. It does not erase or rewrite your saved
            environment variables.
          </p>
          <p>
            <strong>What you’ll see:</strong> Usually nothing prints; the prompt
            returns. That is normal. Opening a fresh PowerShell window also
            loads the updated PATH.
          </p>
        </li>
        <li>
          <h3>Step 5: Check that Node.js, npm, and Git work</h3>
          <SetupCommands
            windowName="PowerShell window 1"
            commands={'node --version\nnpm.cmd --version\ngit --version'}
          />
          <p>
            <strong>Why:</strong> These checks confirm the tools are ready
            before we download the app. Each line should print a version number.
            Node must be 22.13 or newer.
          </p>
          <p>
            If a command is not recognized, close and reopen PowerShell and
            retry. If it still fails, stop and check the installation message.
            We use <code>npm.cmd</code> to avoid the common npm.ps1
            script-policy error without changing your execution policy.
          </p>
        </li>
        <li>
          <h3>Step 6: Optional: install Visual Studio Code</h3>
          <p>
            You can keep using Windows PowerShell. VS Code is a free editor that
            also gives you a terminal beside your files.
          </p>
          <SetupCommands
            windowName="PowerShell window 1"
            commands={
              'winget install --id Microsoft.VisualStudioCode --exact --source winget'
            }
          />
          <p>
            After installation, open Visual Studio Code from Start. Select{' '}
            <strong>Terminal → New Terminal</strong>. Check that the terminal
            profile is PowerShell; use the arrow beside the + button to choose
            it if needed.
          </p>
          <p>
            Type the same commands below into that terminal, then Enter. After
            downloading the project, choose <strong>File → Open Folder</strong>{' '}
            and select the SONIC-Academy folder inside your Windows user folder.
            Use <strong>Terminal → New Terminal</strong> again when you need
            window 2. Leave both service terminals running.
          </p>
        </li>
        <li>
          <h3>Step 7: Download the app into your own user folder</h3>
          <p>In that PowerShell window, run these lines one at a time:</p>
          <SetupCommands
            windowName="PowerShell window 1"
            commands={
              'Set-Location $env:USERPROFILE\ngit clone --branch main https://github.com/CloudSeamTech/SONIC-Academy.git\nSet-Location .\\SONIC-Academy\nnpm.cmd ci'
            }
          />
          <p>
            <strong>What each line does:</strong> First go to your user folder,
            then download the project, enter its folder, and finally install its
            packages. Run <code>npm.cmd ci</code> only inside the SONIC-Academy
            folder, where <code>package.json</code> is stored.
          </p>
          <p>
            <strong>If you see ENOENT or “could not read package.json”:</strong>{' '}
            you are in the wrong folder. Run{' '}
            <code>Set-Location "$env:USERPROFILE\SONIC-Academy"</code>, then
            retry <code>npm.cmd ci</code>. If that folder does not exist, finish
            the download step first.
          </p>
          <p>
            Wait until the PowerShell prompt returns without an install error.
            This first download can take several minutes. If a SONIC-Academy
            folder already exists, stop rather than deleting it or cloning over
            your work. Open that existing checkout and save your changes before
            updating it.
          </p>
        </li>
        <li>
          <h3>Step 8: Start the website locally — keep window 1 open</h3>
          <SetupCommands
            windowName="PowerShell window 1"
            commands={'npm.cmd run dev'}
          />
          <p>
            Look for the Local address printed by the app, usually
            <code> http://localhost:3000</code>. For this command, do not wait
            for the PowerShell prompt to return or type more commands into
            window 1. This window stays busy serving the app; that is normal.
            Leave it open. If Windows asks about firewall access, do not enable
            public-network access for this local-only setup.
          </p>
        </li>
        <li>
          <h3>Step 9: Start the companion — keep window 2 open</h3>
          <p>Open a second Windows PowerShell window. Run:</p>
          <SetupCommands
            windowName="PowerShell window 2"
            commands={
              'Set-Location "$env:USERPROFILE\\SONIC-Academy"\nnpm.cmd run companion:install\nnpm.cmd run companion:start'
            }
          />
          <p>
            The companion should print its local listening address and a
            one-time token. This command also keeps running; do not wait for its
            prompt to return. Leave this window open too. The token connects
            your browser to your PC; keep it private and never paste it into
            chat or GitHub.
          </p>
          <details>
            <summary>
              Installation failed with node-gyp, Python, or C++ errors?
            </summary>
            <p>
              Some PCs need tools to build the companion’s terminal package.
              First read the actual error; you do not need these extra downloads
              when installation already succeeded.
            </p>
            <ol>
              <li>
                Install a supported Python 3 release from{' '}
                <a
                  href="https://www.python.org/downloads/windows/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Python’s Windows downloads
                </a>
                . Include the Python launcher and PATH option if offered.
              </li>
              <li>
                Install{' '}
                <a
                  href="https://aka.ms/vs/17/release/vs_BuildTools.exe"
                  target="_blank"
                  rel="noreferrer"
                >
                  Microsoft Visual Studio 2022 Build Tools
                </a>
                . In its installer, select Desktop development with C++ and keep
                its recommended MSVC and Windows SDK components.
              </li>
              <li>
                Finish installation and restart Windows if requested. Open fresh
                PowerShell windows and return to the project folder.
              </li>
              <li>
                Retry <code>npm.cmd run companion:install</code>, then{' '}
                <code>npm.cmd run companion:start</code>. Restart window 1’s
                local app if you closed it.
              </li>
            </ol>
            <p>
              If it still fails, keep the exact error for troubleshooting. Do
              not disable antivirus or broadly change execution policies to
              force installation.
            </p>
          </details>
        </li>
        <li>
          <h3>Step 10: Connect from the local website</h3>
          <p>
            Open <code>http://localhost:3000/migration#view=terminal</code> in
            your browser. If window 1 printed another port, use that port
            instead. Use the localhost page for this step; the hosted website
            stays disconnected.
          </p>
          <p>
            Choose Windows PowerShell, copy the one-time token from window 2
            into the One-time companion token field, and select Connect locally.
            Wait for LOCAL · CONNECTED before trying a command.
          </p>
          <a
            href="http://localhost:3000/migration#view=terminal"
            target="_blank"
            rel="noreferrer"
          >
            Open local terminal on this PC ↗
          </a>
          <p>
            If the page will not open, check that window 1 is still running. If
            connection fails, check window 2 and copy its current token again.
          </p>
        </li>
        <li>
          <h3>Step 11: Run your first two commands</h3>
          <p>
            Type <code>Get-Date</code> and select Run. Then run{' '}
            <code>$env:COMPUTERNAME</code>.
          </p>
          <p>
            You should see your PC’s date and computer name from the real local
            session. The WSL tab needs an installed WSL distribution; it does
            not connect to your VMware AlmaLinux VM. For that VM, use GNOME
            Terminal directly or a verified SSH connection from native
            PowerShell.
          </p>
        </li>
        <li>
          <h3>Step 12: Close the session when you finish</h3>
          <p>
            Select Disconnect terminal. In each PowerShell window, press Ctrl+C
            to stop its service. Keep the app and companion local; no router
            port-forwarding is needed.
          </p>
        </li>
      </ol>
      <a href="/alma#lesson=alma-real-terminal">
        Follow the guided real-terminal class →
      </a>
    </details>
  );
}
