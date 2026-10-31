import linux from '../content/nessus/linux.json' with { type: 'json' };
import windows from '../content/nessus/windows.json' with { type: 'json' };
import scanning from '../content/nessus/scanning.json' with { type: 'json' };
import type { TerminalContext } from './terminal-presentation';

export type NessusStep = {
  title: string;
  guide?: { what: string; why: string; verify: string; failure: string };
  where: string;
  actions: string[];
  notes?: string[];
  command?: string;
  terminal?: TerminalContext;
  breakdown: { term: string; meaning: string }[];
  expected: string;
  screenshot: {
    status: 'capture-needed' | 'reference' | 'illustration';
    title: string;
    instructions: string;
    assetId?: string;
  };
  downloads?: { title: string; href: string }[];
  sources: string[];
};
export type NessusLesson = {
  id: string;
  module?: string;
  title: string;
  description: string;
  needs?: string[];
  what: string;
  why: string;
  bestPractices: string[];
  commonMistakes: string[];
  troubleshooting: { problem: string; fix: string }[];
  pass: string;
  exercise: string;
  quiz: {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  }[];
  steps: NessusStep[];
};
export type NessusCourse = {
  id: string;
  title: string;
  description: string;
  baseline: string;
  prerequisite: string;
  supplies?: string[];
  sources: { title: string; url: string }[];
  lessons: NessusLesson[];
};
export const nessusCourses = [linux, windows, scanning] as NessusCourse[];
export const nessusCourseHref = (id: string) =>
  `/nessus/${id.replace('nessus-', '')}`;
export const nessusLessons = nessusCourses.flatMap((course) => course.lessons);
