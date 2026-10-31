import { commandTeachingUnits } from './studio-command-guide.ts';

/** Display ranges only. Never execute or rewrite the authored input. */
export function teachingInputs(command: string, shell?: string) {
  const units = shell === 'bash' ? commandTeachingUnits(command) : [command];
  let cursor = 0;
  return units.map((text) => {
    const start = command.indexOf(text, cursor);
    cursor = start + text.length;
    return {
      text,
      startLine: command.slice(0, start).split('\n').length - 1,
      lineCount: text.split('\n').length,
    };
  });
}
