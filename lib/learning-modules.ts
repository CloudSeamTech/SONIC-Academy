import { learningPathways } from '../app/learning-pathways.ts';
import { guidedCourses } from './guided-courses.ts';
import { lessons as linuxLessons } from '../app/course.ts';
import bank from '../content/assessments/questions.json' with { type: 'json' };

export type PracticeQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  source: string;
  objective: string;
  tags: string[];
};
const references: Record<string, { title: string; url: string; note: string }> =
  {
    bicep: {
      title: 'Microsoft · Bicep language and deployment',
      url: 'https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview',
      note: 'Original beginner practice aligned to the taught Bicep skills; not a full certification exam or live Azure deployment check.',
    },
    azure: {
      title: 'AZ-104 · Azure Administrator',
      url: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104',
      note: 'April 17, 2026 objectives; selected skills, not full exam coverage.',
    },
    windows: {
      title: 'AZ-802 · Windows Server Administrator',
      url: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-802',
      note: 'Current Windows Server objectives; product-specific labs may go beyond the exam.',
    },
    linux: {
      title: 'RHCSA EX200 · RHEL 10',
      url: 'https://www.redhat.com/en/services/training/ex200-red-hat-certified-system-administrator-rhcsa-exam',
      note: 'Current EX200 is based on RHEL 10. Existing RHEL 9 labs retain their version labels. This quiz is not the practical RHCSA exam.',
    },
    pki: {
      title: 'Microsoft · Certificate requests and installation',
      url: 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/certreq_1',
      note: 'Certificate workflow practice, not a standalone certification exam.',
    },
    mecm: {
      title: 'Microsoft · Configuration Manager',
      url: 'https://learn.microsoft.com/en-us/mem/configmgr/',
      note: 'Product-specific practice; no claim that all topics appear on AZ-802.',
    },
    splunk: {
      title: 'Splunk Core Certified User',
      url: 'https://www.splunk.com/en_us/training/certification-track/splunk-core-certified-user.html',
      note: 'Core User skills with additional course investigation exercises.',
    },
    vsphere: {
      title: 'Broadcom · VCP-VVF Administrator',
      url: 'https://www.broadcom.com/support/education/vmware/certification/vcp-vvf-administrator',
      note: 'Selected vSphere fundamentals; the vSphere 8 course is not a complete current VVF exam course.',
    },
    nessus: {
      title: 'Tenable · Nessus User Guide',
      url: 'https://docs.tenable.com/nessus/Content/GettingStarted.htm',
      note: 'Nessus product practice, not a certification exam.',
    },
    sql: {
      title: 'Microsoft · SQL Server documentation',
      url: 'https://learn.microsoft.com/en-us/sql/sql-server/',
      note: 'SQL Server lab practice; not a claim of full database certification coverage.',
    },
  };
export function moduleDomain(course: string) {
  if (course === 'bicep') return 'bicep';
  if (course.startsWith('pki-')) return 'pki';
  if (['linux', 'linux-daily-admin', 'alma'].includes(course)) return 'linux';
  if (
    [
      'azure',
      'landing-zone',
      'azure-operations',
      'security',
      'migrations',
    ].includes(course)
  )
    return 'azure';
  if (course.startsWith('nessus')) return 'nessus';
  if (['vsphere', 'mecm', 'splunk', 'sql'].includes(course)) return course;
  return 'windows';
}
export const learningModules = learningPathways.flatMap((course) =>
  course.sections
    .filter((section) => section.lessons.length)
    .map((section) => ({
      id: `${course.id}:${section.lessons[0].id}`,
      courseId: course.id,
      courseTitle: course.title,
      title: section.title,
      lessons: section.lessons,
      last: section.lessons.at(-1)!,
      domain: section.lessons.every((lesson) => lesson.id.startsWith('tls-'))
        ? 'pki'
        : course.id === 'migrations' && /Between Domains/.test(section.title)
          ? 'windows'
          : course.id === 'migrations' && /MECM Migration/.test(section.title)
            ? 'mecm'
            : moduleDomain(course.id),
    })),
);
export const modulesForLesson = (id: string) =>
  learningModules.filter((module) =>
    module.lessons.some((lesson) => lesson.id === id),
  );
export function referenceFor(domain: string) {
  return references[domain] ?? references.windows;
}
function hash(value: string) {
  let h = 2166136261;
  for (const char of value) {
    h ^= char.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
const guidedById = new Map(
  guidedCourses
    .flatMap((course) => course.lessons)
    .map((lesson) => [lesson.id, lesson]),
);
const linuxById = new Map(linuxLessons.map((lesson) => [lesson.id, lesson]));
export function questionsForModule(id: string): PracticeQuestion[] {
  const module = learningModules.find((item) => item.id === id);
  if (!module) return [];
  const text =
    `${module.title} ${module.lessons.map((lesson) => `${lesson.title} ${lesson.description} ${lesson.steps.join(' ')} ${linuxById.get(lesson.id)?.args.join(' ') ?? ''}`).join(' ')}`.toLowerCase();
  const existing = module.lessons
    .flatMap((lesson) => {
      const item = guidedById.get(lesson.id);
      return (item?.quiz ?? []).map((question, i) => ({
        ...question,
        id: `${lesson.id}:knowledge:${i}`,
        source: referenceFor(module.domain).url,
        objective: `Course checkpoint · ${lesson.title}`,
        tags: [],
      }));
    })
    .filter((question) => question.explanation.length >= 35);
  const candidates = (bank as PracticeQuestion[])
    .filter(
      (question) =>
        question.source === module.domain ||
        (module.domain === 'linux' &&
          question.source === 'azure' &&
          /azure|windows/.test(text)),
    )
    .map((question) => ({
      question,
      score: question.tags.reduce(
        (sum, tag) => sum + (text.includes(tag) ? 1 : 0),
        0,
      ),
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        hash(id + a.question.id) - hash(id + b.question.id),
    )
    .map(({ question }) => ({
      ...question,
      source: referenceFor(question.source).url,
    }));
  const seen = new Set<string>();
  const representative =
    existing.length <= 6
      ? existing
      : Array.from(
          { length: 6 },
          (_, index) =>
            existing[Math.round((index * (existing.length - 1)) / 5)],
        );
  return [...representative, ...candidates, ...existing]
    .filter((question) => {
      const key = question.question.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 10)
    .map((question) => {
      const rotation = hash(id + question.id) % question.options.length;
      const options = question.options.map(
        (_, i) => question.options[(i + rotation) % question.options.length],
      );
      return {
        ...question,
        options,
        answer: (question.answer - rotation + options.length) % options.length,
      };
    });
}
export function gradeQuestions(
  questions: PracticeQuestion[],
  answers: number[],
) {
  if (
    questions.length !== 10 ||
    answers.length !== 10 ||
    questions.some(
      (question, i) =>
        !Number.isInteger(answers[i]) ||
        answers[i] < 0 ||
        answers[i] >= question.options.length,
    )
  )
    return null;
  const correct = questions.reduce(
    (score, question, i) => score + Number(question.answer === answers[i]),
    0,
  );
  return { correct, total: 10, passed: correct >= 8 };
}
export const assessmentKey = (owner: string | undefined, module: string) =>
  `sonic-module-test-v1:${encodeURIComponent(owner ?? 'guest')}:${encodeURIComponent(module)}`;
export function retainPracticeAttempts(
  questions: PracticeQuestion[],
  attempts: { answers: number[]; at: string }[],
) {
  const valid = attempts.filter((attempt) =>
    gradeQuestions(questions, attempt.answers),
  );
  const recent = valid.slice(-20);
  const best = valid.reduce<(typeof valid)[number] | undefined>(
    (best, attempt) =>
      !best ||
      gradeQuestions(questions, attempt.answers)!.correct >
        gradeQuestions(questions, best.answers)!.correct
        ? attempt
        : best,
    undefined,
  );
  if (best && !recent.includes(best)) recent[0] = best;
  return recent;
}
export const questionSignature = (questions: PracticeQuestion[]) =>
  hash(
    JSON.stringify(
      questions.map((q) => [q.id, q.question, q.options, q.answer]),
    ),
  ).toString(16);
