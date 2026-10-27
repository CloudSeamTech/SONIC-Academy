"""Render truthful, step-specific UI/terminal mockups, never target-lab captures."""
from pathlib import Path
import json, html, textwrap, hashlib
root=Path(__file__).resolve().parents[1]
scenes=json.loads((root/'content/tls/screen-scenes.json').read_text())
refs=json.loads((root/'content/tls/references.json').read_text())
out=root/'public/tls-lab/screens';out.mkdir(parents=True,exist_ok=True)
def esc(s):return html.escape(str(s),quote=True)
def lines(s,width=88):
 result=[]
 for row in str(s).splitlines() or ['']:
  result.extend(textwrap.wrap(row,width,replace_whitespace=False,drop_whitespace=False) or [''])
 return result
def text(rows,x,y,color='#292929',size=20,mono=False):
 return ''.join(f'<text x="{x}" y="{y+i*(size+10)}" fill="{color}" font-family="{("monospace" if mono else "Arial, sans-serif")}" font-size="{size}">{esc(row)}</text>' for i,row in enumerate(rows))
def rect(x,y,w,h,c,stroke='none',rx=8):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{c}" stroke="{stroke}"/>'
def mark(n,x,y):return f'<circle cx="{x}" cy="{y}" r="18" fill="#7040a8" stroke="white" stroke-width="2"/>'+text([str(n)],x-6,y+6,'white',18)
for s in scenes:
 y=124;body='';kind=s['kind'];cmd=s.get('command')
 header=lines(s['title'],75);body+=text(header,32,87,size=25);y+=max(0,len(header)-1)*35
 body+=text(lines(s['where'],100),32,y,size=17);y+=len(lines(s['where'],100))*27+16
 if kind in ['terminal','powershell','editor'] or cmd:
  windows=kind=='powershell';label='Windows PowerShell — '+('Administrator' if 'Administrator' in s['where'] else 'Windows host') if windows else ('RHEL 9 — learner@tls-ca01' if 'TLS-CA01' in s['where'] else 'RHEL 9 — learner@tls-app01')
  if kind=='editor':label+=' · file content / shell here-document'
  code=lines(cmd or 'No command is needed for this step.',100)
  h=90+len(code)*27
  body+=rect(28,y,1144,h,'#202124')+rect(28,y,1144,42,'#343438')+text([label],52,y+28,'#f5f5f5',17)
  body+=text(['COMMAND / FILE CONTENT TO ENTER — PRESERVE CASE'],64,y+73,'#e7975f',16)+text(code,64,y+107,'#f2f2f2',17,True)+mark(1,47,y+69)
  y+=h+35
 elif kind=='vmware':
  body+=rect(28,y,1144,360,'#f6f6f6','#8b8b8b')+rect(28,y,1144,42,'#333438')+text(['VMware Workstation Pro 17 — Windows host'],50,y+29,'white',18)
  body+=text(['File    Edit    View    VM    Tabs    Help'],50,y+74,size=18)
  network='network' in s['title'].lower()
  vmname='TLS-CA01' if 'CA VM' in s['title'] else 'TLS-APP01'
  rows=['Virtual Network Editor','VMnet6     Host-only     10.90.0.0','(●) Host-only    ( ) NAT    ( ) Bridged','[✓] Connect a host virtual adapter','[ ] Use local DHCP service','Subnet IP: 10.90.0.0    Subnet mask: 255.255.255.0','                                      Apply       OK'] if network else ['New Virtual Machine / Virtual Machine Settings',f'Name: {vmname}    Guest: Red Hat Enterprise Linux 9 64-bit','Memory: 2048 MB    Processor: 1 processor / 1 core','Disk: 30 GB growable    [ ] Allocate all disk space now','CD/DVD: your verified RHEL 9 x86_64 ISO','Temporary installation: NAT; later select Custom VMnet6','                                        Next / Finish']
  body+=text(rows,80,y+116,size=22)+mark(1,48,y+110);y+=390
 elif kind=='rhel-installer':
  body+=rect(28,y,1144,390,'#f7f7f7','#999')+rect(28,y,1144,60,'#b31b1b')+text(['RED HAT ENTERPRISE LINUX 9 — INSTALLATION SUMMARY'],52,y+38,'white',23)
  body+=text(['Installation Destination: new 30 GB virtual disk only','Software Selection: Minimal Install','Network & Host Name: adapter On / tls-app01.lab.example.test','User Creation: learner    [✓] Make this user administrator','                                            Begin Installation','After reboot: text login → learner → password → Bash prompt'],80,y+120,size=22)+mark(1,48,y+112);y+=420
 elif kind=='firefox':
  cert='trust' in s['title'].lower() or 'root' in s['title'].lower();profile='profile' in s['title'].lower() and not cert
  url='about:profiles' if profile else ('about:preferences#privacy — Certificate Manager' if cert else 'https://app.example.mil')
  body+=rect(28,y,1144,360,'#fafafa','#888')+rect(28,y,1144,56,'#dedede')+text(['Firefox · SONIC TLS Practice   |   '+url],50,y+35,size=19)
  rows=['About Profiles','Create a New Profile → Next','Profile name: SONIC TLS Practice','Finish → Launch profile in new browser','Confirm this is the separate practice profile.'] if profile else (['Certificate Manager','Your Certificates   People   Servers   Authorities','Import → Documents / SONIC-TLS / root.crt','View → compare SHA-256 certificate fingerprint to CA console','Only the checked practice root identifies websites in this profile.'] if cert else ['TLS practice application','Hosted on TLS-APP01.','Site information → Connection secure → View certificate','SAN: app.example.mil    Issuer: SONIC Practice Issuing CA','Read YOUR actual serial and validity; sample values are not proof.'])
  body+=text(rows,78,y+118,size=23)+mark(1,48,y+110);y+=390
 else:
  nodes=['External practice user','Firewall / private lab boundary','RHEL 9 DMZ application server','NGINX · TLS ends here','Hosted practice application']
  if any(t in s['title'].lower() for t in ['chain','csr','key','certificate','trust']): nodes=['Website leaf · public identity','Intermediate CA · signs the leaf','Root CA · client trust anchor','Private key · secret, never shared','CSR · public request, not certificate']
  body+=rect(28,y,1144,350,'#f6f0e6','#ad987a')
  for i,node in enumerate(nodes):
   yy=y+34+i*59;body+=rect(80,yy,1032,44,'#d7c8b2')+text([node],105,yy+29,size=21)
  body+=mark(1,48,y+55);y+=380
 # Explicit expected-result panel, not a fabricated terminal transcript.
 result=lines(s['output'],96);hh=82+len(result)*29
 body+=rect(28,y,1144,hh,'#d7c8b2')+text(['EXPECTED RESULT / SIMULATED CLUE — CHECK YOUR OWN MACHINE'],67,y+31,size=17)+mark(2,47,y+25)+text(result,56,y+70,size=19);y+=hh+32
 notes=[]
 for i,a in enumerate(s['actions'],1):notes.extend(lines(f'{i}. {a}',104))
 body+=text(['FOLLOW THE NUMBERED INSTRUCTIONS IN THE LESSON'],32,y,size=18);y+=35
 body+=text(notes,32,y,size=17);y+=len(notes)*27+38
 body+=text(['No real private key, real certificate result, production access or DoD endorsement is shown.'],32,y,size=17)
 height=y+38
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="{height}" viewBox="0 0 1200 {height}" role="img" aria-labelledby="title desc"><title id="title">{esc(s["title"])} — instructional mockup</title><desc id="desc">Step-specific guided recreation. Not a genuine screenshot or live result.</desc>'+rect(0,0,1200,height,'#e3d8c4',rx=0)+rect(0,0,1200,48,'#292929',rx=0)+text(['INSTRUCTIONAL MOCKUP — NOT A LIVE CAPTURE OR RESULT'],25,31,'white',18)+body+'</svg>'
 (out/(s['id']+'.svg')).write_text(svg)
 ref=next(r for r in refs if r['id']==s['id']);ref['sha256']=hashlib.sha256(svg.encode()).hexdigest()
(root/'content/tls/references.json').write_text(json.dumps(refs,indent=2,ensure_ascii=False)+'\n')
print(f'Rendered {len(scenes)} labeled, step-specific mockups.')
