'use client';
import { useEffect, useState } from 'react';
import { Monitor, Server, Cloud, ArrowRight } from 'lucide-react';
import { useAcademy } from './academy-provider';
import { learningPathways, pathwayLessons } from './learning-pathways';
import {
  mapKey,
  nodesForCourse,
  readMap,
  type NodeValues,
} from '../lib/lab-maps';
import { validIPv4 } from '../lib/lab-passport';
import { TerminalExample } from './terminal-example';
import './learning-lab-tools.css';
function MapEditor({
  courseId,
  lessonId,
  owner,
}: {
  courseId: string;
  lessonId: string;
  owner?: string;
}) {
  const nodes = nodesForCourse(courseId);
  const [selected, setSelected] = useState(nodes[0].id);
  const [saved, setSaved] = useState<Record<string, NodeValues>>({});
  const [draft, setDraft] = useState<NodeValues>({ hostname: '', ipv4: '' });
  const [notice, setNotice] = useState('');
  const key = mapKey(owner, courseId);
  const node = nodes.find((item) => item.id === selected) ?? nodes[0];
  const course = learningPathways.find((item) => item.id === courseId)!;
  const lesson = pathwayLessons(course).find((item) => item.id === lessonId);
  useEffect(() => {
    try {
      const values = readMap(localStorage.getItem(key));
      setSaved(values);
      setDraft(values[nodes[0].id] ?? { hostname: '', ipv4: '' });
    } catch {
      setNotice(
        'Map values stay in this visit because browser storage is unavailable.',
      );
    }
  }, [key]);
  return (
    <details className="clickable-lab-map lesson-support" id="lab-map">
      <summary>My lab map · which computer and which terminal?</summary>
      <p>
        Planned course roles, not a live network scan. Select a computer to see
        its job. Arrows show the management journey, not verified network
        connectivity.
      </p>
      <p>
        <strong>This lesson’s workspace: </strong>
        {lesson?.metadata}
      </p>
      <div className="lab-map-nodes" role="group" aria-label="Lab computers">
        {nodes.map((item, index) => {
          const Icon =
            item.id === 'workstation'
              ? Monitor
              : item.id === 'azure'
                ? Cloud
                : Server;
          return (
            <div className="lab-map-stop" key={item.id}>
              <button
                type="button"
                aria-pressed={node.id === item.id}
                onClick={() => {
                  setSelected(item.id);
                  setDraft(saved[item.id] ?? { hostname: '', ipv4: '' });
                  setNotice('');
                }}
              >
                <Icon size={28} aria-hidden="true" />
                <strong>{item.title}</strong>
                <small>
                  {saved[item.id]?.hostname || 'Add your hostname'}
                  <br />
                  {saved[item.id]?.ipv4 || 'IP not recorded'}
                </small>
              </button>
              {index < nodes.length - 1 && (
                <ArrowRight
                  className="lab-map-arrow"
                  aria-hidden="true"
                  size={20}
                />
              )}
            </div>
          );
        })}
      </div>
      <section className="lab-map-detail" aria-live="polite">
        <h3>{node.title}</h3>
        <p>{node.role}</p>
        <p>
          <strong>Open this workspace: </strong>
          {node.workspace}
        </p>
        <p>{node.terms}</p>
        {node.checks && (
          <>
            <p>
              Read-only identity checks · run these only in the workspace above:
            </p>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(node.checks);
                  setNotice(
                    'Identity-check input copied. Run it only in the named workspace.',
                  );
                } catch {
                  setNotice(
                    'Copy unavailable. Select only the command input, without the displayed prompts.',
                  );
                }
              }}
            >
              Copy identity checks
            </button>
            <TerminalExample command={node.checks} where={node.workspace} />
          </>
        )}
      </section>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!validIPv4(draft.ipv4.trim())) {
            setNotice('Enter a valid IPv4 address, or leave it blank.');
            return;
          }
          try {
            const values = {
              ...readMap(localStorage.getItem(key)),
              [node.id]: {
                hostname: draft.hostname.trim().slice(0, 120),
                ipv4: draft.ipv4.trim(),
              },
            };
            localStorage.setItem(
              key,
              JSON.stringify({ version: 1, nodes: values }),
            );
            setSaved(values);
            setNotice(
              'Map labels saved on this device for your current profile. No connection was tested.',
            );
          } catch {
            setNotice('Could not save map labels. Your draft is still shown.');
          }
        }}
      >
        <div className="lab-map-fields">
          <label>
            Hostname for {node.title}
            <input
              maxLength={120}
              value={draft.hostname}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  hostname: event.target.value,
                }))
              }
            />
          </label>
          <label>
            IPv4 address for {node.title}
            <input
              maxLength={40}
              inputMode="decimal"
              value={draft.ipv4}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  ipv4: event.target.value,
                }))
              }
            />
          </label>
        </div>
        <button type="submit">Save this computer’s labels</button>
      </form>
      {notice && <p role="status">{notice}</p>}
    </details>
  );
}
export function ClickableLabMap({ lessonId }: { lessonId: string }) {
  const academy = useAcademy();
  const course = learningPathways.find((item) =>
    pathwayLessons(item).some((lesson) => lesson.id === lessonId),
  );
  return academy.ready && course ? (
    <MapEditor
      key={`${academy.user?.id ?? 'guest'}:${course.id}`}
      courseId={course.id}
      lessonId={lessonId}
      owner={academy.user?.id}
    />
  ) : null;
}
