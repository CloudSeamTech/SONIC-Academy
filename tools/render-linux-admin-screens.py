"""Render honest, step-specific terminal teaching cards; no live output is claimed."""
import json, pathlib, html, textwrap, hashlib
root=pathlib.Path(__file__).resolve().parents[1]
course=json.loads((root/'content/linux-admin/course.json').read_text())
refs=[]
def esc(s):return html.escape(s,quote=True)
for lesson in course['lessons']:
 for n,step in enumerate(lesson['steps'],1):
  ident=step['screenshot']['assetId']; lines=[]
  def add(value,color,width=84):
   for original in value.splitlines() or ['']:
    for line in textwrap.wrap(original,width=width,replace_whitespace=False,drop_whitespace=False) or ['']:
     lines.append((line,color))
  add('01  TYPE IN YOUR VM — COPY FROM THE COMMAND BOX, NOT THIS IMAGE','#ffb45b')
  add(step.get('command') or 'Follow the numbered instructions in this step.','#f5f0ff')
  add('','#fff');add('02  EXPECTED OBSERVATION — YOUR VALUES MAY DIFFER','#bfa3ff')
  add(step.get('terminalExample', step['expected']),'#e8e3ee')
  add('','#fff');add('03  WHY THIS CHECK MATTERS','#ffb45b');add(step['guide']['why'],'#e8e3ee')
  add('','#fff');add('04  VERIFY BEFORE CONTINUING','#bfa3ff');add(step['guide']['verify'],'#e8e3ee')
  h=180+len(lines)*25
  svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="{h}" viewBox="0 0 1100 {h}" role="img" aria-labelledby="title desc"><title id="title">{esc(step["title"])}</title><desc id="desc">Instructional mockup. Not a live terminal capture. {esc(step["expected"])}</desc><rect width="1100" height="{h}" rx="18" fill="#20182d"/><rect x="20" y="20" width="1060" height="52" rx="9" fill="#352843"/><circle cx="44" cy="46" r="6" fill="#ffad55"/><circle cx="66" cy="46" r="6" fill="#bda3e4"/><text x="86" y="51" fill="#ffffff" font-family="monospace" font-size="17">INSTRUCTIONAL MOCKUP — NOT A LIVE CAPTURE</text><text x="32" y="108" fill="#ffffff" font-family="sans-serif" font-weight="700" font-size="23">{esc(step["title"])}</text>'
  for i,(line,color) in enumerate(lines):svg+=f'<text x="32" y="{152+i*25}" fill="{color}" font-family="monospace" font-size="19" xml:space="preserve">{esc(line)}</text>'
  svg+='</svg>\n'
  path=root/f'public/linux-admin/screens/{ident}.svg';path.write_text(svg)
  refs.append(dict(id=ident,src=f'/linux-admin/screens/{ident}.svg',title=step['title'],platform='RHEL / AlmaLinux 9 · instructional terminal mockup',source=step['sources'][0],credit='CloudSeam Tech · authored teaching visual',note='Not a screenshot of a running VM. Commands and expected observations illustrate this exact step; actual values vary.',sha256=hashlib.sha256(svg.encode()).hexdigest()))
(root/'content/linux-admin/references.json').write_text(json.dumps(refs,indent=2)+'\n')
print(f'Rendered {len(refs)} labeled terminal mockups')
