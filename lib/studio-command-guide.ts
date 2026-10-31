import type { NessusStep } from './nessus-curriculum';

/** Keep compound shell input together; these are teaching units, never executable parsing. */
export function commandTeachingUnits(script: string): string[] {
  if (!script.trim()) return [];
  if (
    /\\\s*$|(?:&&|\|\||\|)\s*$|^\s*(?:if|for|while|until|case|function)\b|^\s*\{|\$\(|`/m.test(
      script,
    )
  )
    return [script];
  const lines = script.split('\n');
  const units: string[] = [];
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (line.includes('<<')) {
      const marker = /<<(-?)\s*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\2\s*$/.exec(
        line,
      );
      if (!marker || (line.match(/<</g)?.length ?? 0) !== 1) return [script];
      const start = index;
      let closed = false;
      while (++index < lines.length) {
        const text = marker[1]
          ? lines[index].replace(/^\t+/, '')
          : lines[index];
        if (text === marker[3]) {
          closed = true;
          break;
        }
      }
      if (!closed) return [script];
      units.push(lines.slice(start, index + 1).join('\n'));
      continue;
    }
    let quote = '';
    let escape = false;
    for (const char of line) {
      if (escape) {
        escape = false;
        continue;
      }
      if (char === '\\' && quote !== "'") {
        escape = true;
        continue;
      }
      if (quote) {
        if (char === quote) quote = '';
      } else if (char === '"' || char === "'") quote = char;
    }
    if (quote) return [script];
    if (line.trim()) units.push(line);
  }
  return units;
}
const guidance: Record<string, { what: string; look: string }> = {
  'cat /etc/redhat-release': {
    what: 'First, let’s find out which Linux version you’re using. cat (read a file) shows the contents of /etc/redhat-release: / is the root directory, etc is the configuration folder, and redhat-release is the version file.',
    look: 'Look for AlmaLinux 9 or Red Hat Enterprise Linux 9. If you see another major version, pause—this class uses version 9.',
  },
  whoami: {
    what: 'Now let’s check which account you’re using. whoami means “who am I?” and prints your signed-in username.',
    look: 'You should see your own username. It does not need to match the example name learner.',
  },
  hostname: {
    what: 'Next, ask the VM for its computer name. This helps you check that you’re working on the right machine before you make changes.',
    look: 'You should see your VM’s hostname. Write it down; your name may differ from alma-lab01.',
  },
  'sudo -v': {
    what: 'Let’s check your permission to run administrator commands. sudo -v validates your access without making a system change.',
    look: 'If asked, type your own VM password and press Enter. Nothing appears while you type; returning to the prompt without an error is normal.',
  },
  'sudo -l': {
    what: 'Now ask which administrator commands your account is allowed to run. -l means “list”; it does not give you new permissions.',
    look: 'Read the permitted-command list. If you see “not in the sudoers file” or a denial, pause and use the recovery help.',
  },
  pwd: {
    what: 'Let’s check where you are. pwd means “print working directory”—show the full path of your current folder.',
    look: 'Read the path from left to right. A leading / starts at the root directory; after a cd command, confirm the path is the folder you intended.',
  },
};
const common: Record<string, string> = {
  '{': 'The braces collect several read-only checks into one report. > saves the report to the quoted file (replacing an existing report); the next cat command lets you read what was saved.',
  find: 'Let’s search only the named practice folder. -xdev stays on that filesystem, -type f selects files, -size +5M selects files larger than 5 MiB, and -printf prints the requested details without deleting anything.',
  lsblk:
    'lsblk lists disks and partitions. -o chooses the displayed columns; the quoted $LAB_DISK restricts this check to the disk you identified earlier. Confirm the disk identity before any storage change.',
  vgs: 'vgs shows volume groups (pools of disk space). Read the VG name and free space; this command reports information without creating or deleting a group.',
  lvs: 'lvs shows logical volumes (usable slices of a volume group). Confirm the requested name and size; this command does not resize or remove a volume.',
  pvs: 'pvs lists the physical volumes (disks or partitions assigned to LVM). Use the device and volume-group columns to confirm which practice storage belongs together.',
  xfs_growfs:
    'xfs_growfs expands an XFS filesystem into space already added to its logical volume. The argument is the mounted folder, not a disk name; confirm this is the disposable practice mount before running it.',
  systemctl:
    'systemctl talks to systemd (the service manager). status shows the unit’s state, --failed lists failed units, and start or stop changes only the named service. daemon-reload rereads unit files; reset-failed clears a stored failure state after you have addressed it.',
  du: 'du estimates space used by folders. -x stays on one filesystem, -h makes sizes readable, and -d1 shows one level of folders. The pipe (|) sends the list to sort -h, which orders the readable sizes.',
  ps: 'ps lists processes (running programs). These columns show process ID, command name and CPU percentage; --sort=-%cpu orders the busiest first, and head -n 8 keeps only the first eight lines including the heading.',
  'firewall-cmd':
    'firewall-cmd talks to firewalld (the firewall service). --state only asks whether it is running; it does not open a port or change the firewall rules.',
  ip: 'ip -br address lists network interfaces (network connections) and their IP addresses in a short format. Find the adapter used by your lab; do not guess an address from the example.',
  ssh: 'ssh opens an encrypted command session to another machine. Replace your-linux-user and YOUR_VM_IP with your own saved lab username and address; the @ separates the account from the destination.',
  journalctl:
    'journalctl reads the system journal (the collected log messages). -u selects a service, -b selects this boot, -n limits the number of lines, and --no-pager prints them directly; -t instead selects a message tag.',
  ss: 'ss lists network sockets (communication endpoints). -l shows listeners, -n keeps numeric addresses and ports, -t selects TCP, and -p shows process details when your permissions allow it.',
  curl: 'curl makes the web request shown in the command. 127.0.0.1 means this same VM; --max-time 5 limits the wait to five seconds, --fail treats HTTP errors as failures, and -I requests only the response headers.',
  getent:
    'getent passwd asks the configured account sources about the named user. A matching row contains account details (including the home directory), not the password itself; no row can mean that account is absent.',
  findmnt:
    'findmnt -T shows which filesystem contains the given path. For /var/log, read the target and source to connect that folder to the storage area behind it.',
  nginx:
    'nginx -t checks NGINX configuration syntax and attempts to open referenced files. It does not restart or reload NGINX; read the whole result and stop at a failed test.',
  namei:
    'namei -l shows ownership and permissions for each component of the path. Work down from / (root directory) to the file to find where access might be blocked.',
  ausearch:
    'ausearch looks through audit records. -m AVC selects SELinux access-denial messages, and -ts recent limits the time window; a denial is evidence to investigate, not a reason to disable SELinux.',
  rm: 'rm removes the named files; -i asks before each removal. Answer yes only for the disposable practice files named in this lesson, and answer no if you cannot confirm a target. This does not send files to a desktop recycle bin.',
  mkdir:
    'mkdir creates folders; -p also creates missing parent folders and accepts folders that already exist. $HOME points to your own home folder.',
  cd: 'cd changes the folder your terminal is working in. Keep the quoted path exactly as shown; this does not move any files.',
  ls: 'ls lists the contents of a folder. -l adds details, -a includes hidden names, and -h makes sizes easier to read.',
  cat: 'cat reads the named file and prints its contents; it does not edit the file.',
  printf:
    'printf produces the text in quotes. > writes it to a file and replaces existing contents; >> adds it to the end. Keep the practice filename unchanged.',
  cp: 'cp copies the source (the first path) to the destination (the second path). -a preserves file details where your permissions allow it.',
  diff: 'diff compares two files. -u shows the changed lines with nearby context; an exit status of 1 means differences were found.',
  less: 'less opens a file in a read-only viewer. Press Space to move down, / to search, and q to return to your command prompt.',
  man: 'man opens the manual for a command. Use Space to move down, / to search for a word, and q to leave the viewer.',
  df: 'df reports filesystem usage. -h makes sizes readable, -T shows filesystem type, and -i checks inode use (file records). / identifies the root filesystem.',
  free: 'free reports memory use. -h makes the amounts readable; look at available memory rather than treating all cached memory as unavailable.',
  nproc:
    'nproc prints the number of processing units available to the current process. This is a count, not a CPU-usage percentage.',
  uptime:
    'uptime shows how long the system has been running and its load averages (work running or waiting over 1, 5 and 15 minutes).',
  date: 'date shows the system clock. -Is asks for an ISO-style timestamp with seconds and a time-zone offset.',
  dnf: 'dnf manages software packages. install adds the listed packages; -y accepts the transaction, so review all package names before running it.',
  rpm: 'rpm -q asks which versions of the named packages are installed. This is a query; it does not install software.',
};
export function explainTeachingCommand(
  command: string,
  step: Pick<NessusStep, 'breakdown'>,
): { what: string; look: string } {
  if (/^sudo systemctl daemon-reload$/.test(command.trim()))
    return {
      what: 'Now let’s ask systemd (the service manager) to reread the service files. daemon-reload loads your edited definitions; it does not restart every service.',
      look: 'Returning quietly to the prompt is normal. If you see an error, stop and check the file and the recovery note before trying to start the practice service.',
    };
  if (/^sudo systemctl start sonic-practice.service$/.test(command.trim()))
    return {
      what: 'Now start only sonic-practice.service (the disposable training service). Its file deliberately names a missing program so you can practice diagnosing a failure.',
      look: 'This start is expected to fail. Keep the error message, then use the next step to inspect status and logs; do not restart real services.',
    };
  const exact = guidance[command.trim()];
  if (exact) return exact;
  if (
    /^sudo tee\b[^\n]*<<-?\s*['"]?([A-Za-z_][A-Za-z0-9_]*)['"]?\s*$/.test(
      command.split('\n')[0],
    )
  )
    return {
      what: 'Let’s write the practice file. sudo requests administrator permission; tee writes the incoming text to the named file; > /dev/null hides the extra printed copy. EOF marks where the file text ends—keep the opening line, every content line and the final EOF together. This replaces the named file, so finish the existing-file check in the Steps panel first.',
      look: 'Wait for your usual prompt to return. If a continuation prompt stays open, do not type the next command; check the closing marker and the recovery help.',
    };
  if (command.includes('\n'))
    return {
      what: 'These lines belong together. Type them in the order shown, preserving quotes, braces and continuation symbols. A continuation prompt means the shell is waiting for the rest of the input; it does not mean the whole block has finished.',
      look: 'Finish the complete input, then compare the actual output with this step’s success check. If you see an error, pause and use the recovery instructions before continuing.',
    };
  const name = command
    .trim()
    .replace(/^sudo\s+/, '')
    .split(/\s+/)[0];
  const matching = [...step.breakdown]
    .sort((a, b) => b.term.length - a.term.length)
    .find((item) =>
      item.term.split(' / ').some((term) => command.includes(term.trim())),
    );
  return {
    what:
      common[name] ??
      matching?.meaning ??
      'Read this command alongside the step’s instructions before you run it. Keep the names, options and quoted paths together, and use your saved lab values wherever the lesson asks for them.',
    look:
      name === 'cd'
        ? 'Returning to the prompt without a message is normal. Use the next pwd check to confirm your new folder.'
        : name === 'mkdir'
          ? 'No message is normal when the folders are created successfully. Continue to the folder and file checks in this step.'
          : name === 'diff'
            ? 'Read which lines differ; a difference is not automatically an error. Confirm that only your intended practice edit appears.'
            : 'Read the actual result before continuing. If it reports an error, pause and use Need help; the success check describes the result for the complete step.',
  };
}
