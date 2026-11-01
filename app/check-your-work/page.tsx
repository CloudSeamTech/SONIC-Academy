import { ConsoleReaderShell } from '../console-reader-shell';
import { learningPathways, pathwayLessons } from '../learning-pathways';
import { CheckYourWork } from './check-your-work';
export const metadata = {
  title: 'Check Your Work | CloudSeam Tech',
  description:
    'Choose a class, learn how lab verification works, and review supported configuration checks.',
};
export default async function CheckWorkPage({
  searchParams,
}: {
  searchParams: Promise<{ lesson?: string | string[] }>;
}) {
  const params = await searchParams;
  const lessons = learningPathways.flatMap((subject) =>
    pathwayLessons(subject).map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      subject: subject.title,
      href: lesson.href,
    })),
  );
  const requested = params.lesson === undefined ? 'lab-04' : params.lesson;
  const initialLesson =
    typeof requested === 'string' && lessons.some((l) => l.id === requested)
      ? requested
      : '';
  return (
    <ConsoleReaderShell activeView="check-work">
      <CheckYourWork lessons={lessons} initialLesson={initialLesson} />
    </ConsoleReaderShell>
  );
}
