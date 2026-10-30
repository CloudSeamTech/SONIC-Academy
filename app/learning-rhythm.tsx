export function LearningRhythm({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`learning-rhythm${compact ? ' is-compact' : ''}`}
      aria-label="Learning method: See it, Try it, Check it"
    >
      <span>
        <b>01</b> See it
      </span>
      <span aria-hidden="true">→</span>
      <span>
        <b>02</b> Try it
      </span>
      <span aria-hidden="true">→</span>
      <span>
        <b>03</b> Check it
      </span>
    </div>
  );
}
