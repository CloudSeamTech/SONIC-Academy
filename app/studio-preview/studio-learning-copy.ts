import { typingInstruction } from '../../lib/typing-instruction';
/** Presentation-only additions: authored commands and checklist storage keys stay unchanged. */
const actionDetails: Record<string, Record<number, string[]>> = {
  'daily-start': {
    0: [
      'In VMware Workstation, select your Linux VM (virtual machine—a practice computer inside your physical computer). Sign in to that VM.',
      'On GNOME (the graphical desktop), click Activities → type Terminal → open Terminal (the window for typing commands). On a text-only server, sign in at its console (the VM’s login screen).',
      'Let’s ask your VM three questions. In Type it with me (below the terminal), type one command, press Enter, then read its result before moving on; leave out the $ prompt (the shell’s ready indicator).',
    ],
    1: [
      'Run sudo -v (check your permission to use administrator commands). If asked, type your own VM password and press Enter (no dots or stars appear while typing).',
      'Run sudo -l (list the administrator commands your account may run). Read the list; keep passwords out of notes and screenshots.',
    ],
    2: [
      'In your VM’s Linux terminal, type the inputs in Type it with me in order. Press Enter after each input and read the result before continuing. mkdir -p creates the practice folders, cd enters a folder, and pwd prints your current folder.',
      'Keep $HOME (the variable containing your home-folder path, such as /home/learner) and the quotes exactly as shown. The / at the beginning of /home/learner means root directory (the top of the folder tree), not the root administrator account.',
      'The > symbol (write output to a file, replacing its existing contents) creates practice/readme.txt. This relative path starts inside your current folder; never change it to an important file.',
    ],
    3: [
      'Keep VMware networking on NAT (the VM shares your host’s network connection) for package downloads. Save your work first.',
      'Run the install command inside the Linux VM. sudo requests administrator permission, dnf installs packages, and -y accepts the installation transaction (review the full command before running it).',
      'Run rpm -q (ask which package versions are installed). In VMware, choose VM → Snapshot → Take Snapshot and name it Daily Admin Ready (a rollback point, not an independent backup); keep credentials out of exported training files.',
    ],
  },
  'daily-files': {
    0: [
      'Run each line in order: pwd (print your current folder), ls (list files and folders), then cd (change folder). Run pwd again to confirm the folder ends in /sonic-admin/practice.',
      'A hidden filename begins with a dot (for example, .bashrc). In ls -lah, -l shows detailed information, -a includes hidden names, and -h uses readable sizes such as K or M.',
    ],
    1: [
      'Stay in the practice folder and type each input in order. cp -a makes a copy while preserving file details; >> appends text (adds to the end instead of replacing the file); diff -u shows what changed.',
      'To undo, run: cp -a "$HOME/sonic-admin/practice/readme.txt.before" "$HOME/sonic-admin/practice/readme.txt" (restore the saved copy over the practice file).',
    ],
    2: [
      'Run less /etc/services (open the file in a read-only viewer). / means root directory, etc is the system-configuration folder, and services is the file’s name; use the keys in the success check to navigate and quit.',
      'The services file is a list of familiar port names (labels for network services). It does not prove a port is open or an application is running.',
    ],
    3: [
      'Read df --help (the command’s built-in instructions) before choosing unfamiliar options. man df opens the longer manual page (a reference document for the command).',
      'Inside the manual viewer, type /inodes (search for the word inodes), then press Enter; press q to quit. Here / starts a search—it is not the root-directory path.',
    ],
  },
  'daily-morning': {
    0: [
      'Run the read-only checks (they inspect the system without changing its settings). date shows the clock, uptime shows how long the system has been running, and systemctl --failed lists services that failed.',
      'Load averages describe running or waiting work over 1, 5 and 15 minutes. Compare them with the CPU count (the number of processing units), rather than assuming one number is always good or bad.',
    ],
    1: [
      'Read each row by its mount point (the folder where a filesystem is attached). / (root directory—the top of Linux’s folder tree) is the main filesystem; /boot (the boot-files directory) may be on a separate filesystem.',
      'A filesystem is a storage area; an inode is a record for one file or directory. df -hT shows capacity and filesystem type, df -i shows inode use, free -h shows memory, and nproc shows the available CPU count.',
    ],
    2: [
      'Type the complete report block, including its closing brace. { ...; } groups several commands; > saves their combined output to morning.txt (replacing an older file with that name). $HOME points to your own home folder.',
      'For tomorrow’s baseline (a saved reference for comparison), choose a different filename first. Keep today’s file so you can compare the results.',
    ],
    3: [
      'Use this sample only when you observed no incident. For a real issue, replace it with the symptom, checks, changes and next action you actually observed (a handoff gives the next administrator the facts).',
    ],
  },
};
export function studioActionCopy(
  lessonId: string,
  step: number,
  index: number,
  original: string,
): string {
  return typingInstruction(
    actionDetails[lessonId]?.[step]?.[index] ?? original,
  );
}
export function directoryMeaning(directory: string): string {
  if (directory === '/')
    return 'root directory—the top of the Linux folder tree';
  if (directory === '~' || directory === '$HOME')
    return 'your signed-in user’s home directory';
  if (directory === '.') return 'your current directory';
  if (directory === '..')
    return 'the parent directory—one level above your current directory';
  if (directory.startsWith('/'))
    return 'an absolute directory path, starting at / (root directory)';
  if (directory === '<pwd>')
    return 'run pwd first to see your actual current directory';
  if (/^[A-Za-z]:\\/.test(directory)) return 'an absolute Windows folder path';
  return 'the working directory required by this step';
}
