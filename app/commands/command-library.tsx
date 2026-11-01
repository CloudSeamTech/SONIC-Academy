'use client';
import { useState } from 'react';
import catalog from '../../content/commands/catalog.json';
import './commands.css';

export function CommandLibrary() {
  const [platform, setPlatform] = useState('Windows');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState('win-get-location');
  const categories = [
    ...new Set(
      catalog.commands
        .filter((c) => c.platform === platform)
        .map((c) => c.category),
    ),
  ];
  const term = query.trim().toLowerCase();
  const visible = catalog.commands.filter(
    (c) =>
      c.platform === platform &&
      (category === 'All' || c.category === category) &&
      [c.name, c.category, c.definition, c.usage, c.parts, c.shell, c.example]
        .join(' ')
        .toLowerCase()
        .includes(term),
  );
  const command = visible.find((c) => c.id === selected) ?? visible[0];
  function choosePlatform(value: string) {
    setPlatform(value);
    setCategory('All');
    setSelected(value === 'Windows' ? 'win-get-location' : 'linux-pwd');
  }
  return (
    <main className="command-library">
      <header className="command-library-header">
        <p className="command-eyebrow">YOUR EVERYDAY ADMIN REFERENCE</p>
        <h1>Know what you’re typing.</h1>
        <p>
          Find a command, understand its job, then type it in your own lab. This
          page is a reference—it does not connect to or run commands on a
          machine.
        </p>
        <div className="command-sheet-links">
          <a href="/commands/cheat-sheet.html" target="_blank" rel="noreferrer">
            Open printable cheat sheet ↗
          </a>
          <a
            href="/commands/cheat-sheet.html"
            download="CloudSeam-Windows-Linux-Cheat-Sheet.html"
          >
            Download cheat sheet
          </a>
        </div>
      </header>
      <nav className="command-platforms" aria-label="Command platform">
        {['Windows', 'Linux'].map((value) => (
          <button
            type="button"
            key={value}
            aria-pressed={platform === value}
            onClick={() => choosePlatform(value)}
          >
            {value}
            <span>
              {catalog.commands.filter((c) => c.platform === value).length}{' '}
              commands
            </span>
          </button>
        ))}
      </nav>
      <div className="command-search-row">
        <label>
          Find a command or task
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try DNS, files, disk space or Get-Service"
          />
        </label>
        <label>
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">All categories</option>
            {categories.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        {(query || category !== 'All') && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCategory('All');
            }}
          >
            Clear filters
          </button>
        )}
      </div>
      <output className="command-count" aria-live="polite">
        {visible.length} {platform} commands found
      </output>
      <div className="command-browser">
        <nav className="command-index" aria-label={`${platform} command list`}>
          {visible.map((c) => (
            <button
              type="button"
              key={c.id}
              aria-pressed={command?.id === c.id}
              aria-controls="selected-command"
              onClick={() => setSelected(c.id)}
            >
              <strong>{c.name}</strong>
              <span>
                {c.category} · {c.shell}
              </span>
            </button>
          ))}
          {!visible.length && (
            <p>No match. Try a shorter name or select Clear filters.</p>
          )}
        </nav>
        {command && (
          <article
            id="selected-command"
            className="command-detail"
            aria-labelledby="selected-command-heading"
          >
            <div className="command-meta">
              <span>{command.shell}</span>
              <span>{command.effect}</span>
            </div>
            <h2 id="selected-command-heading">{command.name}</h2>
            <p className="command-definition">{command.definition}</p>
            <h3>When would I use it?</h3>
            <p>{command.usage}</p>
            <h3>Where to type</h3>
            <p>
              {command.shell === 'PowerShell'
                ? 'Windows: Start → type PowerShell → open Windows PowerShell.'
                : command.shell === 'CMD'
                  ? 'Windows: Start → type cmd → open Command Prompt.'
                  : 'AlmaLinux GNOME: Activities → type Terminal → open Terminal.'}{' '}
              Read any role, module or elevation requirement above first.
            </p>
            <p>
              Example starting folder: <code>{command.directory}</code>. Your
              username and starting folder may differ. Check with{' '}
              <code>
                {command.platform === 'Linux'
                  ? 'pwd'
                  : command.shell === 'PowerShell'
                    ? 'Get-Location'
                    : 'cd'}
              </code>{' '}
              before using a relative path.
            </p>
            <h3>Type this example</h3>
            <p>
              Type only after{' '}
              <code>{command.shell === 'Bash' ? '$' : '>'}</code>—the prompt is
              context, not part of the command. Press Enter.
            </p>
            <pre aria-label={`${command.shell} instructional example`}>
              <code>
                <span className="command-prompt">{command.prompt}</span>{' '}
                {command.example}
              </code>
            </pre>
            <p className="command-example-label">
              Instructional example · not a live terminal or captured output.
            </p>
            <h3>Read the parts</h3>
            <p>{command.parts}</p>
            <h3>What should happen?</h3>
            <p>{command.expected}</p>
            <a
              className="command-source"
              href={command.source}
              target="_blank"
              rel="noreferrer"
            >
              Official command documentation ↗
            </a>
          </article>
        )}
      </div>
      <section
        className="command-prompt-guide"
        aria-label="Prompt and naming guide"
      >
        <h2>A few symbols worth knowing</h2>
        <dl>
          <div>
            <dt>
              <code>PS C:\Users\YourName&gt;</code>
            </dt>
            <dd>
              PowerShell, current directory, then your input. Replace the
              example path with your actual context.
            </dd>
          </div>
          <div>
            <dt>
              <code>[learner@alma-lab01 ~]$</code>
            </dt>
            <dd>
              Regular Linux user; ~ is their home. # usually marks a root-user
              prompt. sudo runs one command with authorized elevation; keep
              typing it when shown.
            </dd>
          </div>
          <div>
            <dt>
              <code>/</code> and <code>..</code>
            </dt>
            <dd>
              / is the Linux filesystem root directory. .. is the parent
              directory. A directory called root is not the same thing as being
              the root user.
            </dd>
          </div>
          <div>
            <dt>
              <code>dc01.lab.example.test</code>
            </dt>
            <dd>
              An example FQDN: host plus full DNS domain. DC01 is its short
              name. Use your configured lab name—not a guessed or public target.
            </dd>
          </div>
        </dl>
        <p>
          Windows native commands such as ipconfig can also run in PowerShell.
          PowerShell cmdlets such as Get-Service do not run directly in CMD.
          Linux examples target Bash on RHEL/AlmaLinux; installed tools can
          differ.
        </p>
      </section>
    </main>
  );
}
