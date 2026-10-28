import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = path.resolve(import.meta.dirname, '..');
const directory = path.join(root, 'public/pki-lab/captures');
const scenes = [
  { id:'alma-10.2-inventory', title:'Check the actual Linux version first', crop:[595,242,660,516], marks:[[625,401],[625,534],[625,592]], notes:['1. This guest is AlmaLinux 10.2, not RHEL 9 or AlmaLinux 9.','2. The installed OpenSSL library reports version 3.5.5.','3. NGINX is absent. This screen does not validate a live web server.'] },
  { id:'alma-10.2-csr', title:'Inspect the CSR before sending it', crop:[645,292,660,516], marks:[[674,432],[790,545],[675,622]], notes:['1. The CSR signature verifies; inspect its subject too.','2. SAN lists the requested website name: app.example.mil (fictional lab only).','3. The private key is valid; its secret contents are not displayed.'] },
  { id:'alma-10.2-chain', title:'Root, intermediate and website certificates', crop:[695,342,660,516], marks:[[721,500],[721,633],[721,767]], notes:['1. Root: subject and issuer match in this practice chain; CA:TRUE.','2. Intermediate: issued by the practice root; CA:TRUE, pathlen:0.','3. Website leaf: issued by the intermediate; CA:FALSE.'] },
  { id:'alma-10.2-verify', title:'A correct name passes; a wrong name fails', crop:[645,242,660,516], marks:[[675,401],[675,497],[675,592]], notes:['1. Verification passes with the trusted root, intermediate and correct DNS name.','2. A different DNS name is rejected with error 62: hostname mismatch.','3. These are file-verification results, not a browser or NGINX HTTPS test.'] },
  { id:'alma-10.2-expiry', title:'Read the dates and plan renewal', crop:[695,292,660,516], marks:[[720,488],[720,583],[720,642]], notes:['1. v1 has a real NotAfter timestamp; record its timezone and owner.','2. v2 is a separately issued replacement-key certificate; compare its serial.','3. -checkend 2592000 checks the next 30 days. Monitor the live endpoint too.'] },
  { id:'windows-2022-stores', title:'Find the three Windows certificate stores', platform:'Windows Server 2022 / Certificates (Local Computer)', dimensions:[1910,1130], crop:[208,99,1000,782], marks:[[440,208],[440,228],[440,266]], notes:['1. Personal: the application certificate belongs here with its matching private key.','2. Trusted Root: only explicitly approved trust anchors belong here.','3. Intermediate: the issuing CA chain belongs here. This image shows navigation only.'] },
  { id:'windows-2022-root-navigation', title:'Navigate to the root store carefully', platform:'Windows Server 2022 / Certificates (Local Computer)', dimensions:[1910,1130], crop:[216,460,625,489], marks:[[245,554],[245,590],[281,608]], notes:['1. Verify Local Computer; this is different from Current User.','2. Expand Trusted Root Certification Authorities.','3. Select its Certificates folder before an approved import. No import was performed.'] },
];
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const references = [];
for (const scene of scenes) {
  const original = fs.readFileSync(path.join(directory,'originals',`${scene.id}.png`));
  const [x,y,w,h] = scene.crop;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="1080" viewBox="0 0 1120 1080" role="img" aria-labelledby="title desc">
<title id="title">${escape(scene.title)}</title><desc id="desc">Genuine VMware lab screenshot with numbered annotation overlays. ${escape(scene.notes.join(' '))}</desc>
<rect width="1120" height="1080" fill="#101010"/><text x="28" y="35" fill="#d7ad6b" font-family="sans-serif" font-size="17">GENUINE LAB CAPTURE · ${scene.platform ? 'WINDOWS SERVER 2022' : 'ALMALINUX 10.2'} · NUMBERED ANNOTATIONS</text>
<text x="28" y="70" fill="#eee" font-family="sans-serif" font-size="27">${escape(scene.title)}</text>
<svg x="28" y="98" width="1064" height="832" viewBox="${x} ${y} ${w} ${h}">
<image href="data:image/png;base64,${original.toString('base64')}" width="${scene.dimensions?.[0] ?? 1650}" height="${scene.dimensions?.[1] ?? 896}"/>
${scene.marks.map(([mx,my],i)=>`<circle cx="${mx-11}" cy="${my}" r="11" fill="#ffb85c" stroke="#161616" stroke-width="1.2"/><text x="${mx-11}" y="${my+4}" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold">${i+1}</text>`).join('\n')}
</svg>
${scene.notes.map((note,i)=>`<text x="28" y="${960+i*29}" fill="#eee" font-family="sans-serif" font-size="17">${escape(note)}</text>`).join('\n')}
<text x="28" y="1060" fill="#aaa" font-family="sans-serif" font-size="15">CloudSeam Tech / SONIC-Academy · Actual test fixtures · No private-key contents shown</text></svg>`;
  fs.writeFileSync(path.join(directory,`${scene.id}.svg`),svg);
  references.push({id:scene.id,src:`/pki-lab/captures/${scene.id}.svg`,title:scene.title,platform:scene.platform ?? 'AlmaLinux 10.2 / OpenSSL 3.5.5 / VMware Workstation',source:'/pki-lab/captures/README.md',credit:'CloudSeam Tech · genuine local lab capture',note:scene.platform ? 'Genuine Windows certificate-console capture. Navigation only; no certificate imports, IIS operations or trust changes performed. Cropped and numbered; original PNG retained.' : 'Genuine guest terminal capture. Scripted read-only inspection of actual supplemental test artifacts; not NGINX or browser validation. Cropped and numbered; original PNG retained. Fictional app.example.mil name retained from the existing TLS class.',sha256:digest(svg),originalSrc:`/pki-lab/captures/originals/${scene.id}.png`,originalSha256:digest(original),reviewedAt:'2026-10-28',reviewed:true});
}
fs.mkdirSync(path.join(root,'content/pki'),{recursive:true});
fs.writeFileSync(path.join(root,'content/pki/references.json'),JSON.stringify(references,null,2)+'\n');
console.log(`Wrote ${references.length} annotated captures; original PNGs unchanged.`);
const gallery = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>PKI certificate class — genuine capture review</title><style>body{margin:0;padding:32px;background:#101010;color:#eee;font:18px/1.6 system-ui}main{max-width:1100px;margin:auto}article{margin:48px 0;border-top:1px solid #444}img{width:100%;height:auto}a{color:#8bd8e3}small{color:#bbb}</style><main><h1>PKI Certificate Management</h1><p>Genuine captures from the local VMware lab, with numbered annotation overlays. The untouched PNG originals are linked below each image.</p><p>AlmaLinux 10.2 is supplemental. These captures do not establish NGINX HTTPS or IIS validation. Windows images show certificate-store navigation only. No private-key contents are displayed.</p>${references.map(r=>`<article><h2>${escape(r.title)}</h2><p>${escape(r.platform)}</p><img src="${r.id}.svg" alt="${escape(r.title)}"><p>${escape(r.note)}</p><a href="originals/${r.id}.png">Untouched original PNG</a></article>`).join('')}<small>CloudSeam Tech / SONIC-Academy · Captured 2026-10-28</small></main></html>`;
fs.writeFileSync(path.join(directory,'index.html'),gallery);
