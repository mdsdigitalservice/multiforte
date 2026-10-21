"""Verify static routes, metadata, source copy, local resources and home anchors.
Run after npm run build. Optional WXR argument enables comparison against original text.
"""
import sys,json,re,html
from pathlib import Path
from urllib.parse import urlsplit,unquote
from html.parser import HTMLParser
import xml.etree.ElementTree as E
ROOT=Path(__file__).resolve().parent.parent
class Document(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.words=[];self.skip=0;self.links=[];self.ids=set();self.title=False;self.titleText='';self.canonical='';self.h1=0
 def handle_starttag(self,t,a):
  a=dict(a)
  if t in ['style','script','svg']:self.skip+=1
  if t=='h1':self.h1+=1
  if t=='title' and not self.skip:self.title=True
  if t=='link' and a.get('rel')=='canonical':self.canonical=a.get('href','')
  if 'id' in a:self.ids.add(a['id'])
  for k in ['href','src']:
   if a.get(k):self.links.append(a[k])
 def handle_startendtag(self,t,a):self.handle_starttag(t,a)
 def handle_endtag(self,t):
  if t in ['style','script','svg']:self.skip=max(0,self.skip-1)
  if t=='title' and not self.skip:self.title=False
 def handle_data(self,d):
  if self.title:self.titleText+=d
  if not self.skip:self.words.append(d)
 def text(self):return re.sub(r'\s+',' ',html.unescape(' '.join(self.words))).strip()
def parse(s):d=Document();d.feed(s);return d
pages=json.loads((ROOT/'src/data/wordpress.json').read_text())['pages'];seo=json.loads((ROOT/'src/data/seo.json').read_text())
parsed={};errors=[]
for p in pages:
 f=ROOT/'dist'/p['path'].lstrip('/')/'index.html' if p['path']!='/' else ROOT/'dist/index.html'
 if not f.is_file():errors.append('Missing route '+p['path']);continue
 d=parse(f.read_text());parsed[p['path']]=d
 if d.titleText!=seo[p['path']]['title']:errors.append('Changed title '+p['path'])
 if d.canonical!=seo[p['path']]['canonical']:errors.append('Changed canonical '+p['path'])
 if d.h1!=1:errors.append('Expected one H1 '+p['path'])
 for u in d.links:
  parts=urlsplit(u)
  if parts.scheme or parts.netloc or not parts.path.startswith('/'):continue
  path=unquote(parts.path)
  if path.endswith(('.pdf','.webp','.avif','.jpg','.png','.svg','.css','.js','.ttf','.woff2')):
   if not (ROOT/'dist'/path.lstrip('/')).is_file():errors.append('Missing resource '+path)
  elif path in {p['path'] for p in pages}:pass
  elif path=='/avalie-nos':pass  # Existing plugin redirect, handled by _redirects after discovery.
  else:errors.append('Unknown local route '+path)
for u in json.loads((ROOT/'src/data/wordpress.json').read_text())['navigation']:
 x=urlsplit(u['href'])
 if x.fragment and x.fragment not in parsed['/'].ids:errors.append('Missing anchor '+x.fragment)
if len(sys.argv)>1:
 ns={'w':'http://wordpress.org/export/1.2/','c':'http://purl.org/rss/1.0/modules/content/'}
 for i in E.parse(sys.argv[1]).getroot().findall('./channel/item'):
  if i.findtext('w:post_type',namespaces=ns)!='page' or i.findtext('w:status',namespaces=ns)!='publish':continue
  path=urlsplit(i.findtext('link')).path
  source=parse(i.findtext('c:encoded',default='',namespaces=ns)).text().replace('[trustindex no-registration=google]','').strip()
  # Source body is contiguous for inner pages. Home is composed by section,
  # with identical labels and paragraphs; ignore HTML-only whitespace.
  built=parsed[path].text()
  if path!='/':
   if source not in built:errors.append('Original body copy differs '+path)
  else:
   for text in parse(i.findtext('c:encoded',default='',namespaces=ns)).words:
    text=re.sub(r'\s+',' ',text).strip()
    if text.startswith('https://youtu.be/') and any(text.rsplit('/',1)[-1] in u for u in parsed[path].links):continue
    if text and text!='[trustindex no-registration=google]' and text not in built:errors.append('Home text missing '+text[:100])
if errors:
 print('\n'.join(sorted(set(errors))));sys.exit(1)
print(f'PASS: {len(pages)} original routes, titles, canonical URLs, headings, local resources and home anchors; original body text compared when WXR supplied.')
