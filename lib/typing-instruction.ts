/** Reword clipboard instructions in explanatory prose only. Never apply to command/code values. */
export function typingInstruction(text: string): string {
  return text
    .replace(
      /\bCopy (the (?:(?:three|two|four|following) )?(?:lines|commands) below), paste (?:them|it), and press Enter\./g,
      'Type $1 one at a time, pressing Enter after each input.',
    )
    .replace(
      /\bPaste (the (?:(?:whole|complete|command) )?block)(?: there)?(?:,? then)? press Enter/gi,
      'Type $1 in order, pressing Enter after each line',
    )
    .replace(/\btype or (?:copy|paste)\b/gi, 'type')
    .replace(/\bcopy and paste\b/gi, 'type')
    .replace(/\bcopy and run the block\b/gi, 'type and run the block')
    .replace(
      /\b(?:select|click) (?:the )?Copy (?:command|full block)(?: button)?(?: and)?\b/gi,
      'Type the command shown',
    )
    .replace(
      /\b(?:copy|paste)(?=\s+(?:the|this|these|each|all|both)\s+(?:(?:whole|complete|following|three|two|four)\s+)*(?:command|block|line|code|SPL|query))/gi,
      (match) => (/^[A-Z]/.test(match) ? 'Type' : 'type'),
    )
    .replace(/\bpaste (?:it|them)\b/gi, 'type the input')
    .replace(
      /\bpaste into (?:the )?(?:workspace|terminal|PowerShell)/gi,
      (match) => match.replace(/^paste/i, 'Type'),
    )
    .replace(/\bCopy command\b/g, 'Type the command')
    .replace(/\bCOPY IT WHEN YOU’RE READY\b/g, 'TYPE IT WHEN YOU’RE READY')
    .replace(/\bPASTE INTO SPLUNK WEB\b/g, 'TYPE INTO SPLUNK WEB');
}
