'use client';
import { useState } from 'react';
import { LabVerificationPanel } from '../lab-verification-panel';
import { LivePairing } from './live-pairing';
import './check-your-work.css';
type LessonChoice = {
  id: string;
  title: string;
  subject: string;
  href: string;
};
const howTo = [
  {
    title: 'Choose the exact lesson',
    action:
      'Open Check Your Work → Check a class. Select the subject and lesson you just completed.',
    result: 'Its supported check pack and coverage are shown.',
    why: 'Different lessons expect different settings.',
  },
  {
    title: 'Confirm the expected values',
    action:
      'Enter the short computer name, IP address, prefix, DNS domain and DNS server from your lab plan. Example: DC01 and lab.example.test form dc01.lab.example.test.',
    result:
      'The expected values match your intended lab, not a guessed configuration.',
    why: 'A correct value for another server is still wrong here.',
  },
  {
    title: 'Download and inspect the local checker',
    action:
      'In the selected check pack, download the versioned file. Review its code and compare its SHA-256 hash. The current preview is unsigned; stop if your execution policy blocks it.',
    result: 'You know which file and version you are about to run.',
    why: 'Verify a download before using it.',
  },
  {
    title: 'Run inside the named VM',
    action:
      'Use the exact local PowerShell instructions shown in the pack. The checker reads settings and writes a report; it never repairs your server or asks for a website password.',
    result: 'A new JSON report path appears.',
    why: 'The checker must observe the actual lab machine.',
  },
  {
    title: 'Choose the report on the website',
    action:
      'Review the report, then use Choose file in the pack → select the new report → Check results. If the VM is isolated, transfer the file through your approved VMware workflow first.',
    result:
      'Each supported check shows its expected value, observed value and result. No report is uploaded in this mode.',
    why: 'The website compares facts against the class rules.',
  },
  {
    title: 'Repair, collect again, and recheck',
    action:
      'For a red result, follow its Next instruction and the corresponding lesson step. Rerun the checker and select the new report. A dash means Not checked; it is not a pass.',
    result: 'New results describe the new observation time.',
    why: 'An old report cannot see a later fix.',
  },
];
export function CheckYourWork({
  lessons,
  initialLesson,
}: {
  lessons: LessonChoice[];
  initialLesson: string;
}) {
  const [view, setView] = useState('check');
  const [selected, setSelected] = useState(initialLesson);
  const subjects = [...new Set(lessons.map((l) => l.subject))];
  return (
    <main className="check-work-page">
      <header>
        <p className="check-work-eyebrow">BUILD IT. CHECK THE EVIDENCE.</p>
        <h1>Check Your Work</h1>
        <p>
          Compare your lab’s settings with the class requirements. See what
          passed, what differs, and what still needs a manual check.
        </p>
      </header>
      <nav className="check-work-tabs" aria-label="Verification sections">
        {[
          { id: 'check', label: 'Check a class' },
          { id: 'how', label: 'How to use it' },
          { id: 'setup', label: 'Platform setup' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={view === tab.id}
            onClick={() => setView(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {view === 'check' && (
        <section aria-label="Choose your verification pack">
          <label className="check-work-picker">
            Subject / lesson
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Choose a lesson</option>
              {subjects.map((subject) => (
                <optgroup key={subject} label={subject}>
                  {lessons
                    .filter((l) => l.subject === subject)
                    .map((lesson) => (
                      <option key={lesson.id} value={lesson.id}>
                        {lesson.title}
                        {lesson.id === 'lab-04'
                          ? ' · DC01 local-report preview'
                          : ''}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
          {lessons.find((lesson) => lesson.id === selected) && (
            <p>
              <a href={lessons.find((lesson) => lesson.id === selected)!.href}>
                Open this lesson’s instructions →
              </a>
            </p>
          )}
          <LivePairing
            key={selected}
            lessonId={selected}
            onHelp={() => setView('how')}
          />
          {selected ? (
            <LabVerificationPanel key={selected} lessonId={selected} />
          ) : (
            <output>
              Choose a valid lesson to see its supported checks. No machine has
              been checked.
            </output>
          )}
        </section>
      )}
      {view === 'how' && (
        <section aria-labelledby="how-to-heading">
          <h2 id="how-to-heading">How to check your lab today</h2>
          <p>
            <strong>Available now in preview:</strong> local report selection.
            This does not create a remote connection or sync results to your
            profile.
          </p>
          <ol
            className="check-work-flow"
            aria-label="Current verification flow"
          >
            {[
              'Your VM',
              'Read-only collector',
              'Local JSON report',
              'Browser comparison',
            ].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <ol className="check-work-howto">
            {howTo.map((step) => (
              <li key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.action}</p>
                <p>
                  <strong>You should see:</strong> {step.result}
                </p>
                <small>
                  <strong>Why:</strong> {step.why}
                </small>
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => setView('check')}>
            Open the class checker
          </button>
          <section className="check-work-planned">
            <h2>Planned: paired live checking</h2>
            <p>
              This is the future connection design, not an available connection
              flow.
            </p>
            <h3>How does it work behind VMware NAT?</h3>
            <p>
              <strong>The VM calls us first.</strong> CloudSeam does not try to
              reach a private address such as 192.168.211.130 over the internet.
            </p>
            <ol
              className="check-work-flow"
              aria-label="Outbound connection through NAT"
            >
              {[
                'Checker inside your VM',
                'VMware NAT / your router',
                'CloudSeam HTTPS endpoint',
                'Reply on the VM’s request',
              ].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <ol>
              <li>
                <strong>The checker starts an HTTPS request.</strong> NAT lets
                the request leave through the host’s internet connection and
                tracks where its reply belongs.
              </li>
              <li>
                <strong>Pairing identifies the student and VM.</strong> Your
                account and a revocable device identity tell CloudSeam which
                checker is yours. Your private IP is a value to validate, not an
                internet destination.
              </li>
              <li>
                <strong>The checker asks for its next approved check.</strong>{' '}
                Clicking Run checks would queue that class’s check set. The
                checker receives it in a response to its own authenticated HTTPS
                request.
              </li>
              <li>
                <strong>The checker reads and reports.</strong> It inspects
                allowed local settings and sends observations back over HTTPS.
                The website displays the evaluated results.
              </li>
            </ol>
            <p>
              No student-entered public IP, static public IP, router port
              forwarding, RDP or SSH is required for this outbound-only design.
              The service will still see the connection’s public egress IP, as
              websites normally do; it must not use that shared or changing
              address as the student’s identity. Two students can both use
              10.50.0.10 in their separate labs.
            </p>
            <a
              href="https://knowledge.broadcom.com/external/article?legacyId=1006480"
              target="_blank"
              rel="noreferrer"
            >
              VMware NAT and host-only networking explained ↗
            </a>
            <h3>What must pass before we say Connected?</h3>
            <p>
              <strong>NAT alone is not a guarantee.</strong> The planned
              connector must test each condition and show a specific failure
              instead of a generic connection error.
            </p>
            <ol>
              <li>
                <strong>Network ready:</strong> the VM has a permitted route
                out, working DNS and outbound TCP 443 access to the actual
                verification endpoint. NAT mode by itself does not prove these
                work.
              </li>
              <li>
                <strong>HTTPS trusted:</strong> an HTTPS request succeeds with
                certificate validation enabled. A proxy or incorrect clock can
                prevent this even when TCP 443 opens.
              </li>
              <li>
                <strong>Pairing accepted:</strong> the backend authenticates the
                student/device and accepts the selected class scope. Opening the
                homepage does not prove this.
              </li>
              <li>
                <strong>Checker responding:</strong> an authenticated
                application round trip succeeds and a recent heartbeat is
                visible. Show its time and change to Disconnected or Stale if it
                stops.
              </li>
              <li>
                <strong>Checks can run:</strong> the required local tools and
                permissions are available. A connected checker can still report
                Not checked for an individual task.
              </li>
            </ol>
            <p>
              Those tests prove readiness at that moment, not permanent
              connectivity or a correctly configured class. Live pairing and
              this preflight are not implemented yet; this preview cannot report
              a real Connected state.
            </p>
            <h3>NAT lab or isolated lab?</h3>
            <p>
              <strong>NAT with approved internet access:</strong> the in-VM
              checker can make the outbound HTTPS requests described above.{' '}
              <strong>Host-only with no route out:</strong> it cannot. Keep the
              lab isolated and use report mode; live checking would require a
              separately implemented, approved host relay and a private
              authenticated VM-to-relay path.
            </p>
            <ol
              className="check-work-flow"
              aria-label="Planned live connection flow"
            >
              {[
                'Student signs in',
                'Pairs a signed checker',
                'Checker reads allowed facts',
                'Checker-initiated HTTPS',
                'Private results',
              ].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <ol>
              <li>
                Sign in to CloudSeam after account authentication is enabled.
              </li>
              <li>
                Select the class and review exactly which read-only checks it
                permits.
              </li>
              <li>
                On the website, choose Pair a machine to get a code valid for 10
                minutes. Inside your VM, open the signed checker, verify its
                publisher and type that code.
              </li>
              <li>
                The checker displays a confirmation number. Enter it on the
                website and approve the matching VM name. Connected appears only
                after the approved checker contacts the service.
              </li>
              <li>
                Choose Run class checks. The checker asks for approved work over
                outbound HTTPS, reads the permitted local settings and returns
                observations. The server compares them with your saved class
                requirements; it never sends arbitrary commands.
              </li>
              <li>
                Read each pass, fail or not-checked result. Fix a failed task
                and run again. Stop the checker or revoke its access when done;
                stale connections must not stay green.
              </li>
            </ol>
            <p>
              <strong>For isolated VMware labs:</strong> a VM with no internet
              route cannot send HTTPS directly. Keep its isolation. Use local
              report mode now; a future approved host relay would need its own
              private, authenticated connection to the VM. Do not add Bridged
              networking, public port forwarding, or disabled certificate
              validation just to get a pass.
            </p>
            <p>
              RDP controls a desktop. Verification reads configuration facts.
              Neither RDP nor an SSH login automatically proves that a class was
              completed correctly.
            </p>
          </section>
        </section>
      )}
      {view === 'setup' && (
        <section aria-labelledby="platform-setup-heading">
          <h2 id="platform-setup-heading">Platform owner: prepare Supabase</h2>
          <p>
            Students do not need a Supabase account. These steps are for the
            CloudSeam platform owner; creating a project alone will not enable
            VM connections.
          </p>
          <ol className="check-work-howto">
            <li>
              <h3>Create the account and project</h3>
              <p>
                Open{' '}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                >
                  Supabase Dashboard
                </a>{' '}
                → sign up or sign in → New project. Choose your organization, a
                project name such as CloudSeam-Academy, an appropriate region
                and a plan you accept. Create and keep the database password
                privately; never paste it into this website or chat.
              </p>
              <p>
                <strong>Expected:</strong> your project dashboard becomes ready.
              </p>
            </li>
            <li>
              <h3>Record the public project address</h3>
              <p>
                Use the project’s Connect dialog to find its Project URL and
                publishable key. The URL looks like
                https://your-project-ref.supabase.co. Keep keys in the
                deployment configuration—not a lesson or report. Share only the
                project URL when arranging the integration.
              </p>
              <p>
                <strong>Expected:</strong> we can identify the intended project
                without receiving a database password or secret key.
              </p>
              <a
                href="https://supabase.com/docs/guides/getting-started/api-keys"
                target="_blank"
                rel="noreferrer"
              >
                Official API key guidance ↗
              </a>
            </li>
            <li>
              <h3>Wire student sign-in</h3>
              <p>
                Developer work: implement the authentication callback and
                sessions, then use Authentication → URL Configuration. Set Site
                URL to https://cloudseam.tech. Add only the exact deployed
                callback and approved local development URLs; do not guess a
                callback route or add a broad production wildcard.
              </p>
              <p>
                <strong>Expected:</strong> two test students can sign in as
                separate users. This is not implemented yet.
              </p>
              <a
                href="https://supabase.com/docs/guides/auth/redirect-urls"
                target="_blank"
                rel="noreferrer"
              >
                Official redirect URL guidance ↗
              </a>
            </li>
            <li>
              <h3>Protect pairing and results</h3>
              <p>
                Developer work: create owner-scoped device, pairing, check-run
                and result tables. Enable Row Level Security and test that
                student A cannot read or alter student B’s records. Derive
                identity from a verified session; never trust an owner ID sent
                by a browser.
              </p>
              <p>
                <strong>Expected:</strong> unauthenticated and cross-user
                requests are denied. Secret/service-role keys stay server-side
                because they bypass RLS.
              </p>
              <a
                href="https://supabase.com/docs/guides/database/postgres/row-level-security"
                target="_blank"
                rel="noreferrer"
              >
                Official Row Level Security guidance ↗
              </a>
            </li>
            <li>
              <h3>Finish the connector and prove the checks</h3>
              <p>
                Developer/release work: sign the collector, implement expiring
                pairing and revocation, restrict it to reviewed check packs, and
                verify HTTPS certificates. Test genuine correct and deliberately
                incorrect lab configurations, missing tools, stale results and
                disconnects.
              </p>
              <p>
                <strong>Expected:</strong> documented real-VM evidence and
                isolation tests before enabling Connect server. A green browser
                demo is not that evidence.
              </p>
            </li>
          </ol>
          <p>
            The live connection button remains unavailable until these release
            requirements are met. The existing local-report preview can be
            reviewed independently.
          </p>
        </section>
      )}
    </main>
  );
}
