import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import course from '../content/splunk/course.json' with {type:'json'};
test('Windows investigation expected counts match the fictional evidence',()=>{
  const lines=fs.readFileSync(new URL('../public/splunk/cloudseam-windows-events.csv',import.meta.url),'utf8').trim().split(/\r?\n/);
  const keys=lines.shift().split(',');
  const rows=lines.map(line=>Object.fromEntries(line.match(/"(?:[^"]|"")*"/g).map((value,i)=>[keys[i],value.slice(1,-1).replaceAll('""','"')])));
  assert.equal(rows.length,14);
  assert.equal(new Set(rows.map(r=>r.EventID)).size,11);
  assert.equal(rows.filter(r=>['4624','4625','4740'].includes(r.EventID)).length,6);
  assert.equal(rows.filter(r=>r.EventID==='4625').length,3);
  assert.equal(rows.filter(r=>r.ChangeTicket).length,5);
  assert.equal(rows.filter(r=>r.EventID==='4104')[0].Channel,'Microsoft-Windows-PowerShell/Operational');
  assert.equal(rows.filter(r=>r.EventID==='7045')[0].Channel,'System');
  assert.ok(rows.every(r=>Number.isFinite(Date.parse(r.timestamp))));
  assert.equal(rows.at(-1).timestamp,'2026-01-15T09:18:00Z');
});
test('Investigation lessons include context, logging limits and reporting, without altering earlier lesson IDs',()=>{
  assert.deepEqual(course.lessons.slice(-4).map(l=>l.id),['splunk-windows-import','splunk-windows-logons','splunk-windows-changes','splunk-windows-report']);
  const text=JSON.stringify(course.lessons.slice(-4));
  for(const term of ['4624','4625','4672','4688','4720','4728','4732','4740','4104','7045','1102','Provider','UTC','hypothesis','approved incident queue','command-line']) assert.ok(text.includes(term),term);
  assert.match(text,/does not prove|does not establish|not proof/);
});
