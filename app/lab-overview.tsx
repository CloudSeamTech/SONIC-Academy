export function LabOverview({
  summary,
  steps,
  outcome,
}: {
  summary?: string;
  steps: string[];
  outcome: string;
}) {
  return (
    <details
      className="lab-overview lesson-support"
      aria-label="What you will do in this lab"
    >
      <summary>Lab goal · {steps.length} steps</summary>
      {summary && <p>{summary}</p>}
      <aside className="teaching-callout">
        <h3>You’re finished when…</h3>
        <p>{outcome}</p>
      </aside>
    </details>
  );
}
