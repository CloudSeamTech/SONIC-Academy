'use client';
import { useEffect, useState } from 'react';
import type { StepResource } from '../lib/task-navigation';

export function StepResourceLinks({ resource }: { resource: StepResource }) {
  return (
    <>
      {resource.where && (
        <p>
          <strong>Work in</strong>
          <br />
          {resource.where}
        </p>
      )}
      {resource.path?.length ? (
        <>
          <h3>Exact route</h3>
          <ol className="step-route">
            {resource.path.map((part, i) => (
              <li key={`${i}:${part}`}>
                <span>{i + 1}</span>
                {part}
              </li>
            ))}
          </ol>
        </>
      ) : null}
      {resource.why && (
        <p>
          <strong>Why this task</strong>
          <br />
          {resource.why}
        </p>
      )}
      {resource.needs && (
        <p>
          <strong>You’ll need</strong>
          <br />
          {resource.needs}
        </p>
      )}
      {resource.links?.length ? (
        <nav aria-label="Links for this step">
          <h3>Go here</h3>
          {resource.links.map((link) => (
            <a
              className="studio-reference-link"
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
            >
              {link.title} ↗
            </a>
          ))}
        </nav>
      ) : null}
      {resource.reviewedOn && (
        <small>
          Route checked {resource.reviewedOn} · portal options depend on account
          access.
        </small>
      )}
    </>
  );
}

/** Follow the first visible step in the independently scrolling center column. */
export function StepReferencePanel({
  lessonId,
  referenceId,
}: {
  lessonId: string;
  referenceId: string;
}) {
  const [active, setActive] = useState<{
    lesson: string;
    resource: StepResource;
  } | null>(null);
  useEffect(() => {
    const center = document.getElementById('reader-content');
    if (!center) return;
    let frame = 0;
    function update() {
      frame = 0;
      const top = center!.getBoundingClientRect().top + 48;
      const nodes = [
        ...center!.querySelectorAll<HTMLElement>('[data-step-resources]'),
      ];
      const node =
        nodes.find((item) => item.getBoundingClientRect().bottom > top) ??
        nodes.at(-1);
      if (!node?.dataset.stepResources) return;
      try {
        const resource = JSON.parse(node.dataset.stepResources) as StepResource;
        setActive((current) =>
          current?.lesson === lessonId &&
          JSON.stringify(current.resource) === JSON.stringify(resource)
            ? current
            : { lesson: lessonId, resource },
        );
      } catch {
        /* An incomplete render keeps the last valid resource visible. */
      }
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    const observer = new MutationObserver(schedule);
    observer.observe(center, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-step-resources'],
    });
    center.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      observer.disconnect();
      center.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, [lessonId]);
  const resource = active?.lesson === lessonId ? active.resource : null;
  return (
    <section
      className="step-reference-context"
      aria-label="Resources for the visible step"
    >
      {resource ? (
        <>
          <h3>{resource.title}</h3>
          <StepResourceLinks resource={resource} />
        </>
      ) : (
        <p>Step links appear here as you work through the lesson.</p>
      )}
      <a className="studio-reference-link" href={`/references#${referenceId}`}>
        All course references →
      </a>
    </section>
  );
}
