import { ConsoleReaderShell } from '../console-reader-shell';
import Link from 'next/link';
import { pkiCourses, guidedCourseHref } from '../../lib/guided-courses';
import '../alma/alma.css';
import '../nessus/nessus.css';
export default function PkiPathway() {
  return (
    <ConsoleReaderShell activeView="courses">
      <main className="alma-reader nessus-reader" id="reader-content">
        <header className="alma-header">
          <span className="eyebrow">SONIC-ACADEMY / CLOUDSEAM TECH</span>
          <h1>PKI Certificate Management</h1>
          <p>
            A certificate is a website’s checked name badge. Its private key
            stays secret on the server. A CSR asks the PKI team to issue the
            badge; the root and intermediate certificates explain who signed it.
          </p>
          <p>
            Choose one of two separate application-server classes. Each starts
            with a simple explanation, then shows what to do, why, what success
            looks like and how to recover.
          </p>
        </header>
        <section className="teaching-callout" aria-label="PKI classes">
          {pkiCourses.map((course, index) => (
            <article key={course.id}>
              <p className="eyebrow">CLASS {index + 1}</p>
              <h2>
                <a href={guidedCourseHref(course.id)}>{course.title}</a>
              </h2>
              <p>{course.description}</p>
              <p>
                {course.lessons.length} chapters · separate progress ·
                explanation, CSR, PKI handoff, chain/trust, HTTPS checks and
                expiration management
              </p>
              <a href={guidedCourseHref(course.id)}>Start this class →</a>
            </article>
          ))}
        </section>
        <section className="teaching-callout">
          <h2>Read the capture labels</h2>
          <p>
            Numbered images are genuine AlmaLinux 10.2 or Windows Server 2022
            lab captures. AlmaLinux images show supplemental OpenSSL results;
            Windows images show certificate-store navigation. Live NGINX, IIS
            binding and application HTTPS captures are still needed. Missing
            screens are marked in their steps.
          </p>
          <p>
            These classes require an existing prepared application server. They
            do not install IIS, NGINX or osTicket automatically, and the IIS
            class does not use a domain controller.
          </p>
          <Link href="/tls">Existing RHEL 9 / NGINX practice-CA course →</Link>
        </section>
      </main>
    </ConsoleReaderShell>
  );
}
