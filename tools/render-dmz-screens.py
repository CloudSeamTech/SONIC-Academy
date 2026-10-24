"""Render labeled, product-specific training UI illustrations; never live captures.
The written lesson is authoritative. Original vendor references remain separate.
Run from repository root after editing content/dmz/screen-scenes.json.
"""
from pathlib import Path
import json, html, textwrap
W,H=1280,820
scenes=json.loads(Path('content/dmz/screen-scenes.json').read_text())
registry=json.loads(Path('content/screenshots/markers.json').read_text())
Path('public/dmz/screens').mkdir(parents=True,exist_ok=True)
def esc(s):return html.escape(str(s),quote=True)
def rect(x,y,w,h,fill,stroke='none',r=0):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}" rx="{r}"/>'
def text(x,y,s,size=18,fill='#242424',font='Arial, sans-serif',weight='normal'):
 return f'<text x="{x}" y="{y}" font-family="{font}" font-size="{size}" fill="{fill}" font-weight="{weight}">{esc(s)}</text>'
def lines(x,y,s,width=85,size=18,fill='#242424',font='Arial, sans-serif',line=26,maxlines=8):
 out=[]
 for row in str(s).splitlines() or ['']:
  out+=textwrap.wrap(row,width=width,replace_whitespace=False,drop_whitespace=False) or ['']
 return ''.join(text(x,y+i*line,v,size,fill,font) for i,v in enumerate(out[:maxlines]))
def base(s):
 return ['<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="820" viewBox="0 0 1280 820">',f'<title>{esc(s["title"])} — illustrated training recreation</title>',rect(0,0,W,H,'#f3f3f3'),rect(0,0,W,54,'#eadcc5'),text(24,34,'ILLUSTRATED TRAINING RECREATION • NOT A LIVE CAPTURE',18,'#302a24',weight='bold')]
def fields(a,rows,x=310,y=190,width=900,fill='#fff'):
 for i,(label,value) in enumerate(rows[:7]):
  yy=y+i*68
  a += [text(x,yy,label,16,'#555'),rect(x+245,yy-24,width-250,48,fill,'#c5c5c5',3),lines(x+258,yy+4,value,width=57,size=17,line=21,maxlines=2)]
def footer(a,s):
 a += [rect(0,744,1280,76,'#eadcc5'),text(24,769,'COMPARE YOUR OWN RESULT — example state shown for teaching',15,'#40372a',weight='bold'),lines(24,794,s['expected'],width=137,size=14,line=18,maxlines=1)]
 return ''.join(a)+'</svg>'
for s in scenes:
 a=base(s);k=s['kind'];marks=[]
 if k in ['architecture','azure']:
  a += [text(32,96,s['title'],27,weight='bold'),text(32,129,'Planning diagram • no resources deployed',18,'#555')]
  nodes=[('OUTSIDE / VISITOR','TEST01 · 10.70.0.10'),('FIREWALL / NAT','FW01 · outside .1'),('DMZ / REVERSE PROXY','PROXY01 · 10.60.0.10'),('PRIVATE APPLICATION','IIS-DMZ01 · 10.80.0.40')]
  if k=='azure':nodes=[('PUBLIC HTTPS','Visitors'),('MANAGED INGRESS','Application Gateway WAF'),('PRIVATE BACKEND','IIS VM · no public IP'),('PRIVATE DATA / AD','Only approved paths')]
  for i,(label,value) in enumerate(nodes):
   x=30+i*313
   a += [rect(x,190,282,142,['#e4e8ed','#f0ddc4','#e8dfef','#dce8e4'][i],'#9c9c9c',10),text(x+15,224,label,16,weight='bold'),lines(x+15,260,value,width=25,size=17,maxlines=2)]
   if i<3:a += [f'<path d="M{x+284} 260 h26" stroke="#333" stroke-width="3"/>',text(x+281,247,'Policy' if k=='azure' and i==2 else '443',12)]
  a += [text(42,376,'Azure uses VNet/subnet policies and a non-overlapping address plan, not VMware VMnet names.' if k=='azure' else 'Separate AD / management: VMnet2 · 10.50.0.0/24 · no approved DMZ or application access.',18,weight='bold')]
  for i,(label,value) in enumerate(s['fields']):a += [text(45,430+i*63,label,17,weight='bold'),text(390,430+i*63,value,17)]
  marks=[{'number':1,'x':15,'y':24,'label':'Start at the visitor side and follow only the approved request arrows.'},{'number':2,'x':85,'y':39,'label':'The application and data/domain infrastructure remain private; verify the denied paths too.'}]
 elif k=='windows-network':
  a += [rect(160,92,960,620,'#f7f7f7','#aaa',4),text(184,130,'Internet Protocol Version 4 (TCP/IPv4) Properties',23,weight='bold'),text(190,177,'VMware Network Adapter VMnet2 · Windows host',18),text(192,229,'○ Obtain an IP address automatically',19),text(192,276,'● Use the following IP address:',19)]
  fields(a,[['IP address','10.50.0.254'],['Subnet mask','255.255.255.0'],['Default gateway',''],['Preferred DNS server','']],x=212,y=342,width=820)
  a += [rect(840,641,110,40,'#eee','#aaa'),text(879,669,'OK',18),rect(967,641,125,40,'#eee','#aaa'),text(997,669,'Cancel',18)]
  marks=[{'number':1,'x':23,'y':33,'label':'Choose the static-address option on the virtual VMnet2 adapter, not the physical Ethernet or Wi-Fi adapter.'},{'number':2,'x':62,'y':42,'label':'Use 10.50.0.254 with the /24 mask; leave this management adapter’s gateway and DNS blank.'}]
 elif k=='workstation':
  a += [rect(0,54,W,42,'#f8f8f8','#c9c9c9'),text(20,82,'VMware Workstation Pro — Windows host',20),text(20,122,'File     Edit     View     VM     Tabs     Help',17),rect(18,145,230,575,'#f1f1f1','#c8c8c8'),text(34,177,'Library',18,weight='bold')]
  for i,n in enumerate(['My Computer','  FW01','  PROXY01','  IIS-DMZ01','  TEST01']):a += [text(34,218+i*38,n,18)]
  a += [rect(267,145,990,575,'#fafafa','#b5b5b5',5)]
  if 'isolated switches' in s['title']:
   a += [text(290,182,'Virtual Network Editor',23,weight='bold'),text(290,225,'Name          Type          Host Connection       DHCP       Subnet Address',17)]
   for i,row in enumerate(['VMnet2        Host-only     Connected             Disabled   10.50.0.0','VMnet3        Host-only     Not connected         Disabled   10.60.0.0','VMnet4        Host-only     Not connected         Disabled   10.70.0.0','VMnet5        Host-only     Not connected         Disabled   10.80.0.0']):a += [rect(285,246+i*42,940,40,'#e4edf9' if i==1 else '#fff','#ddd'),text(296,273+i*42,row,16,font='Consolas, monospace')]
   a += [text(290,424,'VMnet Information',18,weight='bold'),text(310,468,'○ Bridged      ○ NAT      ● Host-only',19),text(310,510,'☐ Connect a host virtual adapter to this network',18),text(310,551,'☐ Use local DHCP service to distribute IP addresses to VMs',18),text(310,606,'Subnet IP:   10.60.0.0       Subnet mask:   255.255.255.0',18)]
  elif 'management adapter' in s['title']:
   a += [text(290,184,'Windows 10 · VMnet2 adapter · IPv4 Properties',22,weight='bold'),text(300,236,'○ Obtain an IP address automatically',19),text(300,279,'● Use the following IP address:',19)]
   fields(a,[['IP address','10.50.0.254'],['Subnet mask','255.255.255.0'],['Default gateway',''],['Preferred DNS','']],x=310,y=338,width=860)
  elif 'rollback' in s['title'].lower():
   a += [text(290,184,'Snapshot Manager — dedicated lab VM',23,weight='bold'),text(310,252,'Before DMZ update',21),text(344,310,'└── You are here',19),lines(310,398,'Name: Before DMZ update\nDescription: Powered-off checkpoint for the approved lab change',width=65,size=18,maxlines=4)]
   a += [rect(750,632,145,40,'#eee','#aaa'),text(790,659,'Go To',18),rect(912,632,145,40,'#eee','#aaa'),text(938,659,'Take Snapshot',16)]
  elif 'Stop and hand' in s['title']:
   a += [text(290,184,'My Computer — lab machines',23,weight='bold')]
   for i,name in enumerate(['FW01','PROXY01','IIS-DMZ01','TEST01']):a += [text(310,254+i*70,name,21,weight='bold'),text(740,254+i*70,'Powered off',20,'#555')]
  else:
   a += [text(290,184,'Virtual Machine Settings — FW01',23,weight='bold'),text(290,223,'Hardware      Options',18),text(290,276,'Device',18,weight='bold'),text(790,276,'Summary',18,weight='bold')]
   rows=[('Memory','4096 MB'),('Processors','2'),('Hard Disk','40 GB'),('CD/DVD','Verified OPNsense DVD ISO'),('Network Adapter 1','Custom (VMnet4)'),('Network Adapter 2','Custom (VMnet2)'),('Network Adapter 3','Custom (VMnet3)'),('Network Adapter 4','Custom (VMnet5)')]
   for i,(name,v) in enumerate(rows):a += [rect(285,293+i*41,940,40,'#e4edf9' if i==4 else '#fff','#ddd'),text(302,320+i*41,name,17),text(790,320+i*41,v,17)]
   a += [text(310,655,'☑ Connected     ☑ Connect at power on',18)]
  a += [rect(1080,666,145,35,'#eee','#aaa',3),text(1122,690,'Close',17)]
  marks=[{'number':1,'x':24,'y':33,'label':'Confirm the exact VM, network or virtual adapter before changing settings.'},{'number':2,'x':77,'y':57,'label':'Compare the displayed address, custom VMnet, or power state with the written step.'}]
 elif k=='opnsense':
  a += [rect(0,54,W,56,'#fff'),text(22,91,'OPNsense',27,'#cf4f15',weight='bold'),text(300,90,'FW01 • training interface reference',19,'#555'),rect(0,110,245,634,'#30353b')]
  for i,n in enumerate(['Lobby','System','Interfaces','Firewall','  Aliases','  Rules [new]','  NAT / Port Forward','  Log Files','VPN','Services','Reporting','Diagnostics']):a += [text(20,150+i*43,n,18,'#f3f3f3')]
  nat='Forward outside' in s['title'];interface='Label the interfaces' in s['title'];logs='policy and adapter' in s['title'];fault='controlled upstream' in s['title']
  heading='Interfaces: WAN / OUTSIDE' if interface else 'Firewall: Log Files: Live View' if logs else 'Firewall: NAT: Destination NAT' if nat else 'Firewall: Rules [new]'
  a += [text(274,150,heading,26,weight='bold')]
  if nat:
   fields(a,[['Interface','WAN / OUTSIDE'],['Protocol','TCP'],['Source','LAB_VISITOR'],['Destination','WAN address · port 443'],['Redirect target IP','10.60.0.10'],['Redirect target port','443']],x=292,y=235,width=900)
  elif interface:
   fields(a,[['Description','OUTSIDE'],['IPv4 Configuration Type','Static IPv4'],['IPv4 address','10.70.0.1 / 24'],['IPv4 upstream gateway','None']],x=292,y=235,width=900)
   a += [text(310,547,'☐ Block private networks — isolated private OUTSIDE only',17),text(310,592,'☐ Block bogon networks — review for this isolated lab',17)]
  else:
   a += [rect(274,178,974,47,'#fff','#ddd'),text(292,208,'Filter: source / destination / interface / action' if logs else 'DMZ Interfaces     Categories     Inspect     Search',17,'#555'),text(285,267,'Action    Dir      Interface            Source       Destination       Port' if logs else 'Enabled   Action   Version / Protocol   Source       Destination       Port',15,weight='bold')]
   rows=[['☑' if not fault else '☐','Pass','IPv4 TCP','DMZ_PROXY','PRIVATE_IIS','443'],['☑','Block','IPv4 any','DMZ net','any','any']]
   if logs:rows=[['Block','in','WAN / OUTSIDE','10.70.0.10','10.80.0.40','443'],['Pass','in','DMZ','10.60.0.10','10.80.0.40','443'],['Block','in','APP_PRIVATE','10.80.0.40','10.50.0.10','445']]
   for i,row in enumerate(rows):
    yy=285+i*110;a += [rect(280,yy,955,100,'#fff','#ddd')]
    for x,v in zip([290,370,470,675,850,1150],row):a += [text(x,yy+35,v,16,'#b33b21' if row[0]=='Block' or row[1]=='Block' else '#333')]
    label=['OUTSIDE_DENY_OTHER','DMZ_PROXY_TO_IIS_443','APP_DENY_OTHER'][i] if logs else 'DMZ_PROXY_TO_IIS_443' if i==0 else 'DMZ_DENY_OTHER'
    a += [text(370,yy+76,label,16,'#555')]
   if not logs:a += [rect(1142,536,40,36,'#bf4617',r=3),text(1156,562,'+',24,'white',weight='bold')]
  a += [rect(284,672,104,42,'#bf4617',r=3),text(309,700,'Apply',18,'white',weight='bold')]
  marks=[{'number':1,'x':25,'y':24,'label':'Confirm the intended interface or NAT screen. New connection rules belong on their ingress interface.'},{'number':2,'x':78,'y':43,'label':'Verify the exact source, destination, port and rule state; never substitute an unrestricted allow.'}]
 elif k=='iis':
  a += [rect(0,54,W,44,'#f7f7f7','#aaa'),text(18,84,'Internet Information Services (IIS) Manager — IIS-DMZ01',21),rect(15,112,235,606,'#fafafa','#bbb'),text(28,144,'Connections',18,weight='bold')]
  for i,n in enumerate(['IIS-DMZ01','  Application Pools','  Sites','    Default Web Site','    DMZ-Lab']):a += [text(28,187+i*37,n,16)]
  a += [rect(267,112,790,606,'#fff','#bbb'),text(292,149,'DMZ-Lab',24,weight='bold'),rect(1080,112,185,606,'#f1f1f1','#bbb'),text(1098,145,'Actions',19,weight='bold'),text(1098,188,'Bindings…',17),text(1098,226,'Browse website',17),rect(290,194,740,490,'#f6f6f6','#aaa'),text(310,228,'Edit Site Binding',22,weight='bold')]
  a += [text(310,270,'Type',16,'#555'),rect(555,246,450,48,'#fff','#c5c5c5',3),text(568,274,'https',17),text(310,338,'IP address',16,'#555'),rect(555,314,300,48,'#fff','#c5c5c5',3),text(568,342,'10.80.0.40',17),text(875,338,'Port',16,'#555'),rect(930,314,75,48,'#fff','#c5c5c5',3),text(940,342,'443',17),text(310,406,'Host name',16,'#555'),rect(555,382,450,48,'#fff','#c5c5c5',3),text(568,410,'iis-backend.cloudseam.tech',17)]
  a += [rect(312,454,18,18,'#fff','#777'),'<path d="M315 462 l5 6 8 -11" fill="none" stroke="#333" stroke-width="2"/>',text(342,469,'Require Server Name Indication',17)]
  fields(a,[['SSL certificate','DMZ-Lab backend']],x=310,y=531,width=700)
  a += [rect(808,638,95,35,'#eee','#aaa'),text(840,662,'OK',17),rect(916,638,95,35,'#eee','#aaa'),text(933,662,'Cancel',17)]
  marks=[{'number':1,'x':13,'y':40,'label':'Select the dedicated DMZ-Lab site on IIS-DMZ01; do not change an existing APP01 website.'},{'number':2,'x':66,'y':43,'label':'Verify the binding name, HTTPS port, SNI and selected test certificate.'}]
 elif k=='gnome':
  a += [rect(0,54,W,36,'#1d1d1d'),text(20,79,'Activities',16,'white'),text(560,79,'AlmaLinux 9 GNOME',16,'white'),rect(68,122,1140,588,'#f6f5f4','#999',9),rect(68,122,1140,52,'#e8e7e6'),text(89,155,'Settings',22,weight='bold'),rect(68,174,240,536,'#efeeed')]
  for i,n in enumerate(['Wi-Fi','Network','Bluetooth','Background','Applications','Notifications','Power','Displays']):a += [text(90,220+i*48,n,18)]
  a += [text(340,217,'Wired → IPv4',24,weight='bold'),text(340,257,'Details     Identity     IPv4     IPv6     Security',17)]
  fields(a,s['fields'],x=340,y=322,width=810)
  a += [rect(1045,640,125,43,'#3584e4',r=5),text(1080,669,'Apply',19,'white',weight='bold')]
  marks=[{'number':1,'x':35,'y':40,'label':'Choose Manual IPv4 on TEST01’s only Wired adapter.'},{'number':2,'x':71,'y':56,'label':'Use the OUTSIDE network values; this visitor must not have a private or NAT adapter.'}]
 elif k=='console':
  a += [rect(18,79,1244,642,'#121212','#777',5),rect(18,79,1244,43,'#eeeeee'),text(35,108,'OPNsense — FW01 VMware console',19)]
  if 'Install OPNsense' in s['title']:
   body='Interface assignment — example device names only\nMatch each interface MAC with your own VMware inventory.\n\nEnter the WAN interface name: vmx0   [VMnet4 / OUTSIDE]\nEnter the LAN interface name: vmx1   [VMnet2 / management]\nEnter the Optional 1 interface name: vmx2   [VMnet3 / DMZ]\nEnter the Optional 2 interface name: vmx3   [VMnet5 / APP_PRIVATE]\nDo you want to proceed? y\n\nNext: configure the four static IPv4 addresses.'
  else:
   body='Set interface IP address — LAN management example\nInterface: LAN  (verify your MAC inventory)\nConfigure IPv4 address LAN interface via DHCP? n\nEnter the new LAN IPv4 address: 10.50.0.1\nEnter subnet bit count: 24\nUpstream gateway: [blank]\nConfigure IPv6 via DHCP6? n\nNew IPv6 address: [blank]\nEnable DHCP server on LAN? n\nUse HTTP instead of HTTPS for the web interface? n\n\nRepeat for WAN 10.70.0.1, OPT1 10.60.0.1 and OPT2 10.80.0.1.'
  a += [lines(42,174,body,width=105,size=17,fill='#f4f4f4',font='Consolas, DejaVu Sans Mono, monospace',line=29,maxlines=17)]
  a += [text(42,690,'Training recreation: prompts/device names can differ by release.',15,'#d9c49d')]
  marks=[{'number':1,'x':6,'y':26,'label':'Use the FW01 VMware console and match interface MACs; do not copy example device names blindly.'},{'number':2,'x':7,'y':43,'label':'Check the selected zone and address before confirming. The complete four-zone values are in the written step.'}]
 else:
  windows=k=='powershell';console=k=='console';bg='#012456' if windows else '#161616'
  title='Windows PowerShell — Administrator: IIS-DMZ01' if windows else 'OPNsense — FW01 VMware console' if console else 'AlmaLinux 9 — '+('TEST01 Terminal' if 'TEST01' in s['where'] else 'PROXY01 console')
  a += [rect(18,79,1244,642,bg,'#777',5),rect(18,79,1244,43,'#eeeeee'),text(35,108,title,19),text(41,156,s['title'],20,'#fafafa',weight='bold')]
  body=s['command'] or '\n'.join(f'{l}: {v}' for l,v in s['fields'])
  prompt='PS C:\\>' if windows else 'root@FW01:~ #' if console else '$'
  a += [lines(42,195,prompt+' '+body,width=105,size=16,fill='#f4f4f4',font='Consolas, DejaVu Sans Mono, monospace',line=23,maxlines=18)]
  a += [text(42,661,'EXPECTED OBSERVATION — compare with your own command output:',15,'#d9c49d',weight='bold'),lines(42,690,s['expected'],width=117,size=15,fill='#f4f4f4',line=19,maxlines=1)]
  marks=[{'number':1,'x':5,'y':24,'label':'Use the named guest console and shell. These are teaching examples, not commands executed by this website.'},{'number':2,'x':4,'y':82,'label':'Compare your observed output with this expected observation; do not treat the illustration as proof.'}]
  if s['fields'] and not s['command']:marks[0]['label']='Read each interface/address assignment and compare it with your MAC inventory.'
 Path('public'+s['src']).write_text(footer(a,s))
 registry[s['src']]=marks
# Reviewed control positions in the existing Workstation reference (original image retained).
registry['/interface-screenshots/vmware-network-editor.png']=[
 {'number':1,'x':28,'y':20,'label':'Network list: select the lab VMnet. This vendor reference currently shows VMnet8; follow your lesson’s written values.'},
 {'number':2,'x':8,'y':68,'label':'Choose the required network mode. A DMZ lab host-only network is different from the NAT example in this reference.'}]
registry['/dmz/references/firewall_rules_1.png']=[
 {'number':1,'x':15,'y':25,'label':'Select the intended ingress interface before reviewing its rules.'},
 {'number':2,'x':89.7,'y':65.5,'label':'Add a narrow rule, then inspect its source, destination and port before applying.'},
 {'number':3,'x':4.7,'y':83.7,'label':'Apply only after checking rule order and preserving administrator access.'}]
Path('content/screenshots/markers.json').write_text(json.dumps(registry,indent=2)+'\n')
print('Rendered',len(scenes),'product-specific illustrations and marker guides')
