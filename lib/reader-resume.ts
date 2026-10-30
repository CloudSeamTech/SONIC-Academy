/** Resume only for an initial load, profile reset, or this lesson's changed checks. */
export function shouldResumeReader(
  eventKey: string | null | undefined,
  progressKey: string,
  previousChecks: string,
  currentChecks: string,
) {
  if (eventKey === undefined || eventKey === null) return true;
  return eventKey === progressKey && previousChecks !== currentChecks;
}
