import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import course from '../content/bicep/course.json' with {type:'json'};
import practices from '../content/bicep/practices.json' with {type:'json'};
import refs from '../content/bicep/references.json' with {type:'json'};
import {learningModules,questionsForModule} from '../lib/learning-modules.ts';
import {lessonSequenceFor} from '../app/learning-pathways.ts';
test('Beginner Bicep route has twenty ordered lessons, five complete module tests and honest illustrations',()=>{
 assert.equal(course.lessons.length,20);
 assert.deepEqual(lessonSequenceFor('bicep-first-words').map(l=>l.id),course.lessons.map(l=>l.id));
 const modules=learningModules.filter(m=>m.courseId==='bicep');
 assert.equal(modules.length,5);
 for(const module of modules){assert.equal(questionsForModule(module.id).length,10);assert.ok(questionsForModule(module.id).every(q=>q.source.includes('/bicep/')));}
 for(const lesson of course.lessons){
  assert.ok(practices[lesson.id]?.code);
  assert.equal(lesson.steps.length,3);
  for(const step of lesson.steps){assert.ok(step.actions.length&&step.expected&&step.breakdown.length);assert.equal(step.screenshot.status,'illustration');}
  const ref=refs.find(r=>r.id===lesson.id);assert.ok(ref.note.includes('not a captured'));
  assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../public'+ref.src,import.meta.url))).digest('hex'),ref.sha256);
 }
});
test('Compiler is real, isolated, pinned and makes no Azure deployment calls',()=>{
 const worker=fs.readFileSync(new URL('../public/bicep-compiler-worker.js',import.meta.url),'utf8');
 assert.match(worker,/WorkerInterop/);assert.match(worker,/CompileAndEmitDiagnostics/);
 assert.match(worker,/files\[path\] \?\? null/);
 assert.doesNotMatch(worker,/management\.azure\.com|login\.microsoftonline|quickstartsBaseUrl/);
 const lock=JSON.parse(fs.readFileSync(new URL('../content/bicep/runtime-lock.json',import.meta.url)));
 assert.ok(lock.files.length>100);assert.ok(lock.files.every(f=>/^sha256-/.test(f.hash)));
 assert.equal(practices['bicep-modules'].files['network.bicep'].includes('output subnetId'),true);
 assert.ok(practices['bicep-software'].files['cloud-init.yml'].includes('nginx'));
 const servers=practices['bicep-loops'].code;
 assert.ok(servers.includes('@maxValue(3)')&&servers.includes('disablePasswordAuthentication: true'));
 assert.ok(!servers.includes('Microsoft.Network/publicIPAddresses'));
});
