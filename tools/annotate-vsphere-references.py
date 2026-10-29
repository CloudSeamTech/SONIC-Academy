"""Numbered SVG overlays; publisher PNGs remain byte-for-byte unchanged."""
from pathlib import Path
from PIL import Image
import base64, hashlib, json, html

root=Path(__file__).resolve().parent.parent
out=root/'public/vsphere-lab'
kb=lambda n:f'https://knowledge.broadcom.com/external/article/{n}'
items=[
 ('dcui-network',411275,'1994179427986','ESXi management network menu','ESXi 8.0.3 DCUI · official source reference',
  'Actual vendor ESXi 8.0.3 screen. VLAN is highlighted in the source; use IPv4 and DNS entries for their own settings. It does not show a successfully configured management connection.',
  [(0.47,0.16,'IPv4 configuration: enter only the planned management address.'),(0.47,0.21,'DNS configuration: use your approved name and DNS servers.'),(0.82,0.98,'Read the actual ESXi release and build at the bottom.')]),
 ('host-precheck',313403,'1679108224559','Read the exact Add Host precheck error','vCenter 8.0 / 8.0.1 · official compatibility-failure example',
  'Vendor error example involving old ESXi 7 versions, not a recommended combination or a successful add-host result. License warnings and source redactions are preserved.',
  [(0.18,0.24,'Confirm the selected inventory object.'),(0.66,0.40,'Read the expanded host/lifecycle compatibility failure.'),(0.85,0.68,'Use Recent Tasks for the failed operation and its details.')]),
 ('uplink-warning',443156,'2267288538065','Recognize the standard-switch uplink warning','vSphere 8.x networking wizard · official reference',
  'The published warning overlays adapter selection. No active uplink can mean intentional same-host isolation or an incomplete external path. Never move a management uplink to imitate this image.',
  [(0.20,0.33,'The wizard is creating a standard switch.'),(0.43,0.35,'Unclaimed is not the same as Active.'),(0.35,0.78,'Read the warning and verify the intended isolation or uplink design.')]),
 ('disk-partitions',410154,'1983247038732','Inspect existing partitions before any format','ESXi shell partition listing · build not stated in source image',
  'This is a vendor shell-output screenshot, not the Host Client. It shows existing partitions in a missing-datastore diagnosis; it is NOT a blank disk or an instruction to erase it. No shell command execution is required in this class.',
  [(0.02,0.20,'The command targets a specific storage device; do not copy it.'),(0.02,0.62,'Existing partition records require an ownership check.')]),
 ('vm-datastore',344559,'1651618655257','Locate a VM disk and its datastore','vSphere Client Edit Settings · historical vendor reference; exact build unstated',
  'Vendor example shows VM_deploy and an iscsi2 datastore. A bracketed datastore name and snapshot-backed disk file are visible. This is not a CloudSeam VM, a new VM recipe or a recommendation to alter the file.',
  [(0.05,0.38,'Expand the virtual disk to inspect its settings.'),(0.37,0.82,'The bracketed name identifies the backing datastore.'),(0.78,0.82,'The disk filename can indicate a snapshot-backed disk.')]),
 ('vm-network',413851,'2013116034728','Check a VM network adapter connection','VMware ESXi / vCenter Edit Settings · exact source build unstated',
  'Official diagnostic example: Connected and Connect At Power On are unchecked. Published black redactions are unchanged. Do not copy its CPU, RAM, disk or network values.',
  [(0.36,0.77,'Expand the intended network adapter and confirm its backing.'),(0.91,0.77,'Connected describes the current virtual cable state.'),(0.35,0.88,'Connect At Power On controls the next boot.')]),
 ('vm-cdrom',413851,'2013124045631','Recognize installer-media connection settings','VMware VM CD/DVD settings · exact source build unstated',
  'Official diagnostic example shows Host Device and unavailable media, not a selected installation ISO. The lesson requires the approved datastore ISO during install and disconnection after it is no longer needed.',
  [(0.93,0.11,'Connected describes the current virtual CD/DVD connection.'),(0.38,0.27,'Connect At Power On controls boot-time connection.'),(0.78,0.46,'Inspect the actual media backing; this example is unavailable.')]),
 ('snapshot-manager',344559,'1651610178271','Read Manage Snapshots before acting','vSphere Client Manage Snapshots · historical July 2020 example; exact build unstated',
  'Source shows a memory-enabled snapshot of VM_deploy. Our first exercise uses a cleanly powered-off disposable VM. Memory and quiescing values in this screenshot are examples, not settings to copy.',
  [(0.18,0.15,'The tree lists the snapshot and current position.'),(0.30,0.77,'Delete removes a checkpoint; it is not Revert.'),(0.42,0.77,'Revert returns to the selected snapshot state.')]),
 ('vm-disk-settings',344559,'1651623025393','Recognize a snapshot-backed disk filename','vSphere Client Edit Settings · historical vendor reference; exact build unstated',
  'Source highlights a virtual disk filename ending in -000001.vmdk. This is snapshot-chain evidence only. Never delete, rename or edit disk-chain files by hand.',
  [(0.16,0.46,'The selected device is a virtual disk, not a physical host disk.'),(0.39,0.91,'The bracketed part is the datastore.'),(0.78,0.91,'A numbered VMDK may be snapshot-backed; preserve the full chain.')]),
 ('backup-home',375278,'1628347077074','Find the vCenter appliance backup page','vCenter Server 8.0 VAMI · official reference',
  'Vendor page shows no configured schedule and no listed jobs. This is a starting state, not proof of protection. VAMI protects the appliance configuration/database, not all application VM disks.',
  [(0.11,0.88,'Backup is an appliance-management page.'),(0.93,0.16,'Configure creates the backup schedule.'),(0.93,0.39,'Backup Now starts a separate on-demand job.')]),
 ('backup-status',375278,'1629307105352','Verify the appliance backup activity','vCenter Server 8.0 VAMI · official historical backup example',
  'Vendor example shows a completed job and published redactions. It is not our backup result. Confirm your own timestamp, destination files and isolated restore test separately.',
  [(0.24,0.36,'Check the actual job state, not just schedule creation.'),(0.57,0.36,'Review transfer size and duration for the job.'),(0.53,0.59,'Verify the intended destination and corresponding files.')]),
]
refs=[]
digest=lambda b:hashlib.sha256(b).hexdigest()
esc=lambda t:html.escape(t,quote=True)
for name,article,fileid,title,platform,note,markers in items:
    original=out/'originals'/f'{name}.png'; data=original.read_bytes()
    with Image.open(original) as img: w,h=img.size; mime=Image.MIME[img.format]
    width=1200; ih=h*width/w; head=86; foot=48+len(markers)*40; total=head+ih+foot
    svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{total:.0f}" viewBox="0 0 {width} {total:.0f}" role="img" aria-label="{esc(title)}">',
         '<rect width="100%" height="100%" fill="#f6f0e6"/>',
         f'<text x="24" y="35" font-family="Arial,sans-serif" font-size="26" font-weight="bold" fill="#292929">{esc(title)}</text>',
         f'<text x="24" y="66" font-family="Arial,sans-serif" font-size="17" fill="#66596c">Official VMware/Broadcom reference · source KB {article} · not our lab</text>',
         f'<image x="0" y="{head}" width="{width}" height="{ih}" href="data:{mime};base64,{base64.b64encode(data).decode()}"/>']
    for i,(x,y,label) in enumerate(markers,1):
        cx=max(20,min(width-20,x*width)); cy=head+max(20,min(ih-20,y*ih))
        svg += [f'<circle cx="{cx}" cy="{cy}" r="19" fill="#7040a8" stroke="white" stroke-width="3"/>',f'<text x="{cx}" y="{cy+6}" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="19" fill="white">{i}</text>',
                f'<text x="24" y="{head+ih+43+(i-1)*40}" font-family="Arial,sans-serif" font-size="20" fill="#292929">{i}. {esc(label)}</text>']
    svg.append('</svg>'); annotated='\n'.join(svg).encode()
    (out/f'{name}.svg').write_bytes(annotated)
    refs.append(dict(id='vsphere-'+name,src=f'/vsphere-lab/{name}.svg',title=title,platform=platform,source=kb(article),credit=f'Official VMware/Broadcom screenshot · KB {article}',note=note+' Original retained unchanged; numbered overlay and reading key added by CloudSeam Tech.',originalSrc=f'/vsphere-lab/originals/{name}.png',downloadUrl=f'https://api-broadcomcms-software.wolkenservicedesk.com/es/attachments/get_attachment_content?uniqueFileId={fileid}',originalSha256=digest(data),sha256=digest(annotated),reviewed=True,reviewedAt='2026-10-29',markers=[{'number':i,'x':x,'y':y,'label':label} for i,(x,y,label) in enumerate(markers,1)]))
(root/'content/vsphere/references.json').write_text(json.dumps(refs,indent=2)+'\n',encoding='utf-8')
print(f'Annotated {len(refs)} official reference screenshots; publisher originals preserved.')
