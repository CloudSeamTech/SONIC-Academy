'use client';
import { useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { careerPathways, careerSubjects } from './career-pathways';
import { CourseBrand } from './course-brand';

export function QuietPathways() {
  const [selected, setSelected] = useState(careerPathways[0].id);
  const path = careerPathways.find((p) => p.id === selected)!;
  return (
    <div className="quiet-pathway-browser">
      <div className="quiet-pathway-choices" aria-label="Career pathways">
        {careerPathways.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={p.id === selected}
            onClick={() => setSelected(p.id)}
          >
            <span className="quiet-pathway-icon">
              <CourseBrand id={p.id} />
              {p.id === 'cyber-analyst' && <ShieldCheck size={30} />}
            </span>
            <span>{p.title}</span>
            <ArrowRight size={18} />
          </button>
        ))}
      </div>
      <section
        className="quiet-pathway-detail"
        aria-label={path.title + ' courses'}
      >
        <span className="quiet-kicker">YOUR PATHWAY</span>
        <h2>{path.title}</h2>
        <p className="quiet-pathway-description">{path.description}</p>
        <nav aria-label="Pathway subjects">
          {careerSubjects(path.id).map((subject) => (
            <a key={subject.id} href={'/?view=courses&subject=' + subject.id}>
              {subject.title}
              <ArrowRight size={17} />
            </a>
          ))}
        </nav>
        <a className="quiet-pathway-open" href={'/?view=paths&path=' + path.id}>
          Open pathway <ArrowRight size={17} />
        </a>
        <p className="quiet-standalone">
          Standalone courses <a href="/pki">PKI Certificate Management →</a>
        </p>
      </section>
    </div>
  );
}
