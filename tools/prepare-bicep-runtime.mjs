import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
const base = 'https://azure.github.io/bicep/_framework/';
const out = new URL('../public/bicep-runtime/', import.meta.url);
const lockPath = new URL('../content/bicep/runtime-lock.json', import.meta.url);
const hash = data => 'sha256-' + createHash('sha256').update(data).digest('base64');
await fs.mkdir(out, { recursive: true });
async function download(name) {
  const response = await fetch(base + name);
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}
let lock;
if (process.argv.includes('--pin')) {
  const loader = await download('dotnet.js');
  const config = JSON.parse(loader.toString().split('/*json-start*/')[1].split('/*json-end*/')[0]);
  const resources = Object.entries(config.resources).filter(([key]) => key !== 'satelliteResources').flatMap(([, value]) => Array.isArray(value) ? value : []);
  lock = { source: base, checked: '2026-10-30', license: 'https://github.com/Azure/bicep/blob/main/LICENSE', files: [{ name: 'dotnet.js', hash: hash(loader) }] };
  for (const item of resources) {
    if (!item.name || lock.files.some(f => f.name === item.name)) continue;
    const data = await download(item.name);
    if (item.hash && hash(data) !== item.hash) throw new Error(`Upstream integrity mismatch: ${item.name}`);
    lock.files.push({ name: item.name, hash: hash(data) });
    await fs.writeFile(new URL(item.name, out), data);
  }
  await fs.writeFile(new URL('dotnet.js', out), loader);
  await fs.mkdir(new URL('../content/bicep/', import.meta.url), { recursive: true });
  await fs.writeFile(lockPath, JSON.stringify(lock, null, 2) + '\n');
} else {
  lock = JSON.parse(await fs.readFile(lockPath, 'utf8'));
  for (const item of lock.files) {
    const target = new URL(item.name, out);
    let data = await fs.readFile(target).catch(() => null);
    if (!data || hash(data) !== item.hash) {
      // Pages replaces its hashed assets on new upstream releases. The last
      // production build retains our pinned copy; never accept changed bytes.
      const sources = [base, 'https://cloudseam.tech/bicep-runtime/'];
      data = null;
      for (const source of sources) {
        try {
          const response = await fetch(source + item.name);
          if (!response.ok) continue;
          const candidate = Buffer.from(await response.arrayBuffer());
          if (hash(candidate) === item.hash) { data = candidate; break; }
        } catch { /* Try the next public mirror; no credentials are involved. */ }
      }
      if (!data) throw new Error(`Cannot obtain the pinned compiler asset: ${item.name}. Review upstream and repin explicitly.`);
    }
    if (hash(data) !== item.hash) throw new Error(`Pinned Bicep asset changed: ${item.name}. Explicitly review and repin upstream.`);
    await fs.writeFile(target, data);
  }
}
console.log(`Verified ${lock.files.length} official Bicep compiler assets. No student code is sent to Microsoft.`);
