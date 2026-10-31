import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { showStepScreenshot } from '../lib/step-media.ts';
const course=JSON.parse(fs.readFileSync(new URL('../content/splunk/course.json',import.meta.url),'utf8'));
test('Splunk preparation never shows an installed product screen',()=>{
 const lesson=course.lessons.find(l=>l.id==='splunk-start');
 assert.deepEqual(lesson.steps.map((s,i)=>showStepScreenshot(`${lesson.id}:${i+1}`,s)),[false,false,false]);
});
test('a reviewed image is invalidated when the instruction or asset changes',()=>{
 const step=course.lessons.find(l=>l.id==='splunk-install').steps[0];
 assert.equal(showStepScreenshot('splunk-install:1',step),true);
 for(const edit of [{title:'Choose the practice computer'},{where:'Before installation'},{actions:['A different action']},{command:'different command'},{expected:'Different result'},{screenshot:{...step.screenshot,assetId:'splunk-interface-01'}}]){
  assert.equal(showStepScreenshot('splunk-install:1',{...step,...edit}),false);
 }
 assert.equal(showStepScreenshot('unknown:1',step),false);
});
