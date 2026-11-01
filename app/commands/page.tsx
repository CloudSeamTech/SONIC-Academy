import { ConsoleReaderShell } from '../console-reader-shell';
import { CommandLibrary } from './command-library';
export const metadata = {
  title: 'Windows & Linux Commands | CloudSeam Tech',
  description:
    'Beginner command definitions, examples, prompts and printable Windows and Linux cheat sheets.',
};
export default function CommandsPage() {
  return (
    <ConsoleReaderShell activeView="commands">
      <CommandLibrary />
    </ConsoleReaderShell>
  );
}
