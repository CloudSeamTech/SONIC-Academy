export type TerminalContext = {
  shell: 'bash' | 'powershell' | 'cmd' | 'sftp';
  directory: string;
  user: string;
  host: string;
  privilege?: 'user' | 'root';
};

export function contextFor(
  where: string,
  supplied?: TerminalContext,
): TerminalContext | null {
  if (supplied) return supplied;
  if (
    /\bSPL\b|Splunk.*(?:Web|Search)|query editor|SSMS|\.inf.*editor|configuration file/i.test(
      where,
    ) &&
    !/Bash|PowerShell/i.test(where)
  )
    return null;
  if (/sftp.*(?:prompt|session)|sftp>/i.test(where))
    return {
      shell: 'sftp',
      directory: '<remote-pwd>',
      user: 'your-user',
      host: 'remote host',
    };
  if (/PowerShell|Windows Terminal/i.test(where))
    return {
      shell: 'powershell',
      directory: 'C:\\Users\\YourName',
      user: 'your-user',
      host: 'Windows',
    };
  if (/Bash|Linux|Alma|SSH|terminal/i.test(where))
    return {
      shell: 'bash',
      directory: '<pwd>',
      user: /rexuser/i.test(where) ? 'rexuser' : 'your-user',
      host: /manager/i.test(where)
        ? 'rhel9-manager-01'
        : /endpoint/i.test(where)
          ? 'rhel9-lab-01'
          : 'your-vm',
      privilege:
        /root (?:shell|login|session)|as root|Bash\s*[·:/-]\s*root|root@/i.test(
          where,
        )
          ? 'root'
          : 'user',
    };
  return null;
}

export function promptFor(context: TerminalContext): string {
  if (context.shell === 'powershell') return `PS ${context.directory}>`;
  if (context.shell === 'cmd') return `${context.directory}>`;
  if (context.shell === 'sftp') return 'sftp>';
  return `[${context.privilege === 'root' ? 'root' : context.user}@${context.host} ${context.directory}]${context.privilege === 'root' ? '#' : '$'}`;
}

/** Display only: never used by clipboard handlers or command execution. */
export function terminalLines(
  command: string,
  context: TerminalContext,
): { prompt: string; text: string }[] {
  let current = { ...context };
  let heredoc: string | undefined;
  let continuation = false;
  return command.split('\n').map((text) => {
    const prompt =
      heredoc || continuation
        ? context.shell === 'powershell'
          ? '>>'
          : '>'
        : promptFor(current);
    if (heredoc) {
      if (text.trim() === heredoc) heredoc = undefined;
    } else {
      const marker = /<<-?\s*['"]?([A-Za-z_][A-Za-z0-9_]*)['"]?/.exec(text);
      if (marker) heredoc = marker[1];
      if (context.shell === 'powershell') {
        if (/@'\s*$/.test(text)) heredoc = "'@";
        else if (/@"\s*$/.test(text)) heredoc = '"@';
      }
      const cd =
        /^\s*(?:cd|Set-Location(?: -Path)?)\s+(?:--\s+)?["']?([^"';&|]+)["']?\s*$/.exec(
          text,
        );
      if (cd) {
        const path =
          context.shell === 'powershell' && /^\$HOME$/i.test(cd[1].trim())
            ? context.directory
            : cd[1].trim().replace(/^\$HOME(?=\/|$)/, '~');
        if (
          path.startsWith('/') ||
          path.startsWith('~') ||
          /^[A-Za-z]:\\/.test(path)
        )
          current.directory = path;
        else if (path !== '-')
          current.directory = `${current.directory.replace(/\/$/, '')}/${path}`;
      }
      if (/^\s*sudo\s+(?:-i|-s)\s*$/.test(text)) {
        current.privilege = 'root';
        if (/-i/.test(text)) current.directory = '~';
      }
    }
    continuation =
      /\\\s*$/.test(text) ||
      (context.shell === 'powershell' && /`\s*$/.test(text));
    return { prompt, text };
  });
}
