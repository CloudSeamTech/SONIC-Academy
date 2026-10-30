/** Full prompt examples generated from unchanged executable course commands. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { terminalLines, promptFor } from '../lib/terminal-presentation.ts';
const root=path.resolve(import.meta.dirname,'..');
const course=JSON.parse(fs.readFileSync(path.join(root,'content/linux-admin/course.json'),'utf8'));
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const refs=[];
for(const lesson of course.lessons) for(const step of lesson.steps) {
  const context=step.terminal;
  if(!context) throw new Error(`Missing explicit terminal context: ${step.title}`);
  const rows=[];
  function add(text,color='#ede6f4') {
    for(const line of String(text).split('\n')) {
      // Wrap display only; the copyable executable command remains unchanged.
      for(let at=0;at<Math.max(1,line.length);at+=91) rows.push({text:line.slice(at,at+91),color});
    }
  }
  add(`01  START HERE: ${context.shell==='powershell'?'Windows PowerShell':'Bash in your Linux VM'}`,'#ffb45b');
  add(`Required starting folder: ${context.directory} — sample user/host; yours may differ.`);
  const setup=context.shell==='powershell'?'Set-Location $HOME\nGet-Location':'cd "$HOME"\npwd';
  for(const line of terminalLines(setup,context)) add(`${line.prompt} ${line.text}`);
  add(context.shell==='powershell'?'C:\\Users\\Administrator':'/home/learner');
  add('');add('02  TYPE THESE COMMANDS — COPY USING THE WEBSITE BUTTON','#ffb45b');
  const input=terminalLines(step.command||'',context);
  for(const line of input) add(`${line.prompt} ${line.text}`);
  add('');add('03  EXPECTED OBSERVATION — NOT A MEASURED RESULT','#bfa3ff');
  const finalPrompt=input.at(-1)?.prompt??promptFor(context);
  const example=(step.terminalExample||step.expected).split('\n').map(line=>line.startsWith('$ ')?`${finalPrompt} ${line.slice(2)}`:line).join('\n');
  add(example);
  const height=185+rows.length*24;
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}" role="img" aria-labelledby="title desc"><title id="title">${escape(step.title)}</title><desc id="desc">Instructional mockup, not a live capture. Full sample prompt with working directory. ${escape(step.expected)}</desc><rect width="1200" height="${height}" rx="16" fill="#20182d"/><rect x="20" y="20" width="1160" height="48" rx="8" fill="#352843"/><text x="38" y="50" fill="#fff" font-family="monospace" font-size="18">INSTRUCTIONAL MOCKUP — NOT A LIVE CAPTURE</text><text x="32" y="108" fill="#fff" font-family="sans-serif" font-size="24">${escape(step.title)}</text>`;
  rows.forEach((row,index)=>{svg+=`<text x="32" y="${152+index*24}" fill="${row.color}" font-family="monospace" font-size="19" xml:space="preserve">${escape(row.text)}</text>`;});
  svg+='</svg>\n';
  const id=step.screenshot.assetId;
  fs.writeFileSync(path.join(root,`public/linux-admin/screens/${id}.svg`),svg);
  refs.push({id,src:`/linux-admin/screens/${id}.svg`,title:step.title,platform:'RHEL / AlmaLinux 9 · instructional terminal mockup',source:step.sources[0],credit:'CloudSeam Tech · authored teaching visual',note:'Not a live capture. Prompts, usernames, hostnames and outputs are examples. Start in the shown folder, compare pwd/Get-Location, and copy executable input using the command button.',sha256:crypto.createHash('sha256').update(svg).digest('hex')});
}
fs.writeFileSync(path.join(root,'content/linux-admin/references.json'),JSON.stringify(refs,null,2)+'\n');
console.log(`Rendered ${refs.length} terminal examples with full prompts and directories.`);
