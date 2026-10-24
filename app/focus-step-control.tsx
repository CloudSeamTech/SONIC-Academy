'use client';
export function FocusStepControl({
  focused,
  onChange,
  step,
  total,
}: {
  focused: boolean;
  onChange: (focused: boolean) => void;
  step: number;
  total: number;
}) {
  return (
    <div className="focus-step-control">
      <span>
        <strong>
          Step {step + 1} of {total}
        </strong>{' '}
        · {focused ? 'Focused view' : 'Setup and lesson notes visible'}
      </span>
      <button
        type="button"
        aria-pressed={focused}
        onClick={(event) => {
          const root = event.currentTarget.closest('[data-step-focus]');
          onChange(!focused);
          if (!focused)
            requestAnimationFrame(() => {
              const target =
                root?.querySelector<HTMLElement>('.guided-step') ??
                Array.from(
                  root?.querySelectorAll<HTMLElement>('.sonic-action-panel') ??
                    [],
                ).find((el) => el.getBoundingClientRect().height > 0);
              target?.scrollIntoView({ block: 'start' });
            });
        }}
      >
        {focused ? 'Show setup & notes' : 'Focus on this step'}
      </button>
    </div>
  );
}
