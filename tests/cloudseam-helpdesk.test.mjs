import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {helpdeskCourse} from '../lib/guided-courses.ts';
import {learningPathways,lessonSequenceFor,pathwayLessons} from '../app/learning-pathways.ts';
import {normalizeNessusProgress,canVerifyNessusLesson} from '../lib/nessus-progress.ts';
import refs from '../content/helpdesk/references.json' with {type:'json'};

test('help desk follows APP01, has a separate route and complete per-step visuals',()=>{
 const windows=learningPathways.find(p=>p.id==='helpdesk');
 const all=pathwayLessons(windows);assert.ok(all.findIndex(l=>l.id==='lab-06')<all.findIndex(l=>l.id==='helpdesk-plan'));
 assert.equal(helpdeskCourse.lessons.length,13);
 assert.equal(helpdeskCourse.lessons.flatMap(l=>l.steps).length,43);
 const assets=new Map(refs.map(r=>[r.id,r]));
 for(const l of helpdeskCourse.lessons){
  assert.ok(l.needs.length&&l.pass&&l.exercise&&l.quiz.length);
  assert.deepEqual(lessonSequenceFor(l.id).map(x=>x.id),helpdeskCourse.lessons.map(x=>x.id));
  for(const s of l.steps){
   const a=assets.get(s.screenshot.assetId);assert.ok(a,l.id+':'+s.title);
   assert.equal(createHash('sha256').update(fs.readFileSync('public'+a.src)).digest('hex'),a.sha256);
   assert.ok(a.source.startsWith('https://')&&a.note&&a.credit);
   assert.ok(['reference','illustration'].includes(s.screenshot.status));
  }
 }
});
test('help desk verification needs evidence checks and the correct quiz, retaining existing progress shape',()=>{
 const l=helpdeskCourse.lessons[0];
 const progress=normalizeNessusProgress({version:1,checked:[...l.steps.map((_,i)=>`${l.id}:step:${i}`),`${l.id}:exercise`],verified:[],answers:{[l.id]:l.quiz.map(q=>q.answer)}});
 assert.equal(canVerifyNessusLesson(l.id,progress),true);
 progress.checked.pop();assert.equal(canVerifyNessusLesson(l.id,progress),false);
});
test('active course commands use reserved fictional primary and migration namespaces',()=>{
 for(const file of ['content/migration/migration-lessons.generated.json','app/migration-curriculum.ts','lib/reference-check-teaching.ts','app/lab-terminal/lab-terminal.tsx']){
  const s=fs.readFileSync(file,'utf8');assert.doesNotMatch(s,/agency\.test|destination\.test|cloudscene\.tech|DC=agency,DC=test/i,file);
 }
 const c=JSON.parse(fs.readFileSync('content/migration/migration-lessons.generated.json'));
 assert.match(c.lessons.find(l=>l.id==='lab-04').body,/lab\.example\.test/);
 assert.match(c.lessons.find(l=>l.id==='lab-08').body,/migrate\.lab\.example\.test/);
 assert.match(c.lessons.find(l=>l.id==='mecm-02').body,/DC=lab,DC=example,DC=test/);
});

test('PHP update teaches the patched minimum, web runtime validation and a safe failed-update decision',()=>{
 const update=helpdeskCourse.lessons.find(l=>l.id==='helpdesk-php-update');
 const recovery=helpdeskCourse.lessons.findIndex(l=>l.id==='helpdesk-recovery');
 assert.equal(helpdeskCourse.lessons[recovery+1].id,update.id);
 assert.equal(update.steps.length,7);
 const setup=helpdeskCourse.lessons.find(l=>l.id==='helpdesk-plan');
 assert.match(setup.steps[2].actions.join(' '),/8\.4\.27/);
 assert.match(setup.steps[2].actions.join(' '),/Non Thread Safe/);
 assert.match(update.steps[1].command,/Stop-WebAppPool/);
 assert.match(update.steps[5].command,/PHP_VERSION.*PHP_SAPI.*php_ini_loaded_file/);
 assert.match(update.steps[5].command,/Remove-Item/);
 const rollback=update.steps[6].actions.join(' ');
 assert.match(rollback,/leave the live pool stopped/);
 assert.match(rollback,/security-approved/);
 assert.match(rollback,/erase new tickets/);
 assert.doesNotMatch(rollback,/iisreset/);
});
