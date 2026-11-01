import { ConsoleReaderShell } from '../console-reader-shell';
import { guidedCourses, guidedCourseHref } from '../../lib/guided-courses';
import alma from '../../content/alma/desktop-lessons.json';
import { sources } from '../course';
export default function References() {
  const groups = [
    {
      id: 'linux',
      title: 'Linux, Windows and Azure foundations',
      href: '/?view=courses&subject=linux',
      sources: Object.values(sources),
    },
    { id: 'alma', title: alma.title, href: '/alma', sources: alma.sources },
    ...guidedCourses.map((course) => ({
      id: course.id,
      title: course.title,
      href: guidedCourseHref(course.id),
      sources: course.sources,
    })),
  ];
  return (
    <ConsoleReaderShell>
      <main className="academy-information references-page">
        <header>
          <span className="eyebrow">OPTIONAL READING</span>
          <h1>Official references</h1>
          <p>
            <a href="/commands">
              Windows &amp; Linux commands and printable cheat sheet →
            </a>
          </p>
          <p>
            Product documentation and version notes, kept separate from your lab
            steps. Screens may differ between versions; follow the values in
            your lesson and verify your own results.
          </p>
        </header>
        <nav className="information-nav" aria-label="Reference subjects">
          {groups.map((group) => (
            <a key={group.id} href={`#${group.id}`}>
              {group.title}
            </a>
          ))}
        </nav>
        {groups.map((group) => (
          <section id={group.id} className="reference-subject" key={group.id}>
            <h2>{group.title}</h2>
            <p>
              <a href={group.href}>Return to this course →</a>
            </p>
            <ul>
              {group.sources.map((source, index) => (
                <li key={`${source.url}-${index}`}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.title} ↗
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </ConsoleReaderShell>
  );
}
