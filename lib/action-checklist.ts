/** Move only an explicit explanation; never hide a later action or condition. */
export function actionCopy(action: string): {
  instruction: string;
  explanation?: string;
} {
  const match =
    /\s+(?=(?:This (?:means|is|keeps|shows|lets|allows)|Think of|In plain English|The reason is)\b)/.exec(
      action,
    );
  if (!match || !/[.!?]$/.test(action.slice(0, match.index)))
    return { instruction: action };
  const explanation = action.slice(match.index).trim();
  if (
    /\b(if|before|must|should|unless|never|only|do not|don't|sudo)\b/i.test(
      explanation,
    )
  )
    return { instruction: action };
  if (
    /(?:^|[.!?]\s+)(?:Click|Choose|Select|Open|Run|Type|Enter|Press|Set|Stop|Check|Verify|Before|If|Do not|Never|Must|Keep|Wait|Save|Confirm)\b/i.test(
      explanation,
    )
  )
    return { instruction: action };
  return { instruction: action.slice(0, match.index), explanation };
}

/** Action notes are separate from existing course completion and quiz records. */
export function readActionChecks(
  raw: string | null,
  actions: string[],
): string[] {
  try {
    const saved: unknown = JSON.parse(raw ?? '[]');
    if (!Array.isArray(saved)) return [];
    return [
      ...new Set(
        saved.filter(
          (value): value is string =>
            typeof value === 'string' && actions.includes(value),
        ),
      ),
    ];
  } catch {
    return [];
  }
}
