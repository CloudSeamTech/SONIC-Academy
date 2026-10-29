import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { vsphereCourse, guidedLessons, guidedCourseHref } from '../lib/guided-courses.ts';
import { lessonSequenceFor } from '../app/learning-pathways.ts';
import { careerSubjects } from '../app/career-pathways.ts';
import { normalizeNessusProgress, canVerifyNessusLesson } from '../lib/nessus-progress.ts';
import references from '../content/vsphere/references.json' with { type: 'json' };

test('vSphere is a separate class under Windows administration with an isolated sequence', () => {
  assert.equal(guidedCourseHref(vsphereCourse.id), '/vsphere');
  assert.ok(careerSubjects('windows-system-administration').some(p => p.id === 'vsphere'));
  const ids=vsphereCourse.lessons.map(l=>l.id);
  assert.equal(ids.length,22);
  for(const id of ids) assert.deepEqual(lessonSequenceFor(id).map(l=>l.id),ids);
  assert.ok(!lessonSequenceFor('lab-06').some(l=>l.id.startsWith('vsphere-')));
  assert.equal(new Set(guidedLessons.map(l=>l.id)).size,guidedLessons.length);
  const lesson=vsphereCourse.lessons[0];
  const legacy=guidedLessons.find(l=>l.id==='tls-basics');
  const progress={version:1,checked:[...lesson.steps.map((_,i)=>`${lesson.id}:step:${i}`),...legacy.steps.map((_,i)=>`${legacy.id}:step:${i}`),`${legacy.id}:exercise`],verified:['tls-basics'],answers:{[lesson.id]:lesson.quiz.map(q=>q.answer),[legacy.id]:legacy.quiz.map(q=>q.answer)}};
  assert.equal(canVerifyNessusLesson(lesson.id,progress),false);
  progress.checked.push(`${lesson.id}:exercise`);
  assert.equal(canVerifyNessusLesson(lesson.id,progress),true);
  assert.ok(normalizeNessusProgress(progress).verified.includes('tls-basics'));
});
test('vSphere steps preserve teaching, recovery, vendor attribution and exact image hashes', () => {
  const used=new Set();
  for(const l of vsphereCourse.lessons) {
    assert.ok(l.why && l.quiz.length && l.exercise && l.steps.length>=2);
    for(const s of l.steps) {
      assert.ok(s.where && s.actions.length && s.expected);
      for(const key of ['what','why','verify','failure']) assert.ok(s.guide[key]);
      for(const download of s.downloads??[]) assert.ok(fs.existsSync('public'+download.href));
      if(s.screenshot.status==='reference') used.add(s.screenshot.assetId);
      else assert.equal(s.screenshot.status,'capture-needed');
    }
  }
  assert.equal(used.size,11);
  assert.deepEqual(used,new Set(references.map(r=>r.id)));
  for(const r of references) {
    assert.ok(r.reviewed && r.source.startsWith('https://knowledge.broadcom.com/'));
    assert.match(r.credit,/Official VMware\/Broadcom/);
    for(const [src,hash] of [[r.src,r.sha256],[r.originalSrc,r.originalSha256]])
      assert.equal(createHash('sha256').update(fs.readFileSync('public'+src)).digest('hex'),hash);
    const svg=fs.readFileSync('public'+r.src,'utf8');
    for(const marker of r.markers) {
      assert.ok(marker.x>=0 && marker.x<=1 && marker.y>=0 && marker.y<=1);
      assert.ok(svg.includes(marker.label.replaceAll('&','&amp;')));
    }
  }
  const text=JSON.stringify(vsphereCourse);
  assert.match(text,/cannot be managed by vCenter/);
  assert.match(text,/Walkthrough route/);
  assert.match(text,/snapshot.*not.*backup/i);
  const examples=fs.readFileSync('app/lab-example-plan.tsx','utf8');
  assert.match(examples,/const vsphere = lessonId.startsWith\('vsphere-'\)/);
  assert.match(examples,/esx01\.lab\.example\.test/);
});
