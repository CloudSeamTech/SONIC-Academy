import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const brands=[['microsoft','microsoft-icon','https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks'],['azure','microsoft-azure','https://learn.microsoft.com/en-us/azure/architecture/icons/'],['redhat','redhat-icon','https://www.redhat.com/en/about/brand/standards/logo'],['splunk','splunk','https://www.splunk.com/'],['vmware','vmware','https://www.vmware.com/'],['almalinux',null,'https://almalinux.org/'],['nginx',null,'https://nginx.org/']];
const results=[];
fs.mkdirSync(path.join(root,'public/vendor-logos'),{recursive:true});
for(const [id,name,vendor] of brands) {
 const source=name?`https://raw.githubusercontent.com/gilbarbara/logos/main/logos/${name}.svg`:`https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/${id}.svg`;
 const response=await fetch(source);
 if(!response.ok)throw new Error(`${id}: HTTP ${response.status}`);
 const svg=await response.text();
 if(!svg.includes('<svg')||/<script|foreignObject|\bon\w+\s*=|href=["']https?:/i.test(svg))throw new Error(`Unsafe SVG ${id}`);
 fs.writeFileSync(path.join(root,`public/vendor-logos/${id}.svg`),svg);
 results.push({id,source,vendor,sha256:crypto.createHash('sha256').update(svg).digest('hex')});
 console.log(`Saved ${id}`);
}
fs.writeFileSync(path.join(root,'public/vendor-logos/sources.json'),JSON.stringify({note:'Vendor marks identify the technology taught, not endorsement or certification. Source collection: gilbarbara/logos (CC0 collection; trademarks remain with their owners). Marks kept in supplied colors and proportions.',assets:results},null,2)+'\n');
