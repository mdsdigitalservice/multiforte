"""Import public WXR content without publishing authors, drafts or plugin configuration.
Usage: python scripts/import-wordpress.py /absolute/path/export.xml
"""
import sys,json,re,html,hashlib
from pathlib import Path
from urllib.parse import urlsplit,unquote
from html.parser import HTMLParser
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parent.parent
NS={'wp':'http://wordpress.org/export/1.2/','content':'http://purl.org/rss/1.0/modules/content/'}
source=Path(sys.argv[1]);tree=ET.parse(source);channel=tree.getroot().find('channel')
items=channel.findall('item')
def val(i,k): return i.findtext(k,default='',namespaces=NS)
def meta(i): return {val(m,'wp:meta_key'):val(m,'wp:meta_value') for m in i.findall('wp:postmeta',NS)}
pages=[i for i in items if val(i,'wp:post_type')=='page' and val(i,'wp:status')=='publish']
page_paths={val(i,'wp:post_id'):urlsplit(val(i,'link')).path for i in pages}
assets=json.loads((ROOT/'src/data/images.json').read_text())
media={};unresolved=set();redirects={}
def local_image(url):
 if not url:return ''
 local_path=urlsplit(url).path
 if (ROOT/'public'/local_path.lstrip('/')).is_file():return local_path
 name=unquote(urlsplit(url).path.split('/')[-1]);stem=re.sub(r'\.(svg|png|jpe?g)$','',name)
 candidates=[a for a in assets if re.sub(r'^imgi_\d+_','',a['file'])==name]
 if not candidates:candidates=[a for a in assets if re.sub(r'^imgi_\d+_','',a['file'])==stem+'.webp']
 if candidates:
  a=candidates[0];media[url]=a['path'];redirects[urlsplit(url).path]=a['path'];return a['path']
 if '/wp-content/uploads/' in url:unresolved.add(url)
 return url
for i in items:
 if val(i,'wp:post_type')=='attachment':
  u=val(i,'wp:attachment_url')
  if u and re.search(r'\.(webp|svg|png|jpe?g)$',u,re.I):local_image(u)
def link(url):
 if not url:return ''
 if url.startswith('https://wwwhttps://www.youtube.com/@GrupoMultiForte'):return 'https://www.youtube.com/@GrupoMultiForte'
 u=urlsplit(url)
 if u.hostname in ['www.multiforteseguranca.com.br','multiforteseguranca.com.br']:
  if '/wp-content/uploads/' in u.path:
   if re.search(r'\.(webp|svg|png|jpe?g)$',u.path,re.I):return local_image(url)
   
   if (ROOT/'public'/u.path.lstrip('/')).is_file():return u.path
   unresolved.add(url);return url
  return u.path+('?' + u.query if u.query else '')+('#'+u.fragment if u.fragment else '')
 return url
class Clean(HTMLParser):
 allowed={'p','br','strong','b','em','i','u','h1','h2','h3','h4','h5','h6','ul','ol','li','a','img','figure','figcaption','blockquote','span'}
 void={'br','img'}
 def __init__(self):super().__init__(convert_charrefs=True);self.out=[];self.skip=0
 def handle_starttag(self,t,attrs):
  if t in ['script','style','svg']:self.skip+=1;return
  if self.skip or t not in self.allowed:return
  a=dict(attrs);out={}
  if t=='a':
   u=link(a.get('href',''))
   if u and not re.match(r'(?i)\s*(javascript|data|vbscript):',u):out['href']=u
   if a.get('target')=='_blank':out.update(target='_blank',rel='noopener noreferrer')
  if t=='img':
   out={'src':local_image(a.get('src','')),'alt':a.get('alt',''),'loading':'lazy','decoding':'async'}
   for k in ['width','height']:
    if a.get(k,'').isdigit():out[k]=a[k]
  self.out.append('<'+t+''.join(' '+k+'="'+html.escape(v,quote=True)+'"' for k,v in out.items())+'>')
 def handle_startendtag(self,t,a):self.handle_starttag(t,a)
 def handle_endtag(self,t):
  if t in ['script','style','svg']:
   self.skip=max(0,self.skip-1);return
  if not self.skip and t in self.allowed and t not in self.void:self.out.append('</'+t+'>')
 def handle_data(self,d):
  if not self.skip:self.out.append(html.escape(d))
def clean(s):
 c=Clean();c.feed(s or '');return ''.join(c.out).strip()
def text(s):return re.sub(r'\s+',' ',html.unescape(re.sub('<[^>]+>',' ',s or ''))).strip()
def nodes(ns):
 for n in ns:
  yield n
  yield from nodes(n.get('elements',[]))
def elementor(id):
 i=next(i for i in items if val(i,'wp:post_id')==str(id));return json.loads(meta(i).get('_elementor_data','[]'))
home=elementor(2);flat={n['id']:n for n in nodes(home)}
def settings(id):return flat[id].get('settings',{})
def dynamic(s,fallback=''):
 d=s.get('__dynamic__',{});raw=d.get('link','') if isinstance(d,dict) else ''
 m=re.search(r'settings="([^"]+)"',raw)
 if m:
  d=json.loads(unquote(m.group(1)));return page_paths.get(str(d.get('post_id')),fallback)
 return link(s.get('link',{}).get('url',fallback))
def button(id):
 s=settings(id);return {'label':s.get('text',''),'href':dynamic(s)}
hero={
 'lines':[settings(i)['title'] for i in ['ef46a52','2e85ae9','cad173b','eb3b474','40095f3']],
 'image':local_image(home[0]['settings']['background_image']['url']),
 'seal':local_image(settings('29f9414')['image']['url']), 'cta':button('5ce5652')}
services=[]
for n in nodes(home):
 if n.get('widgetType')=='bdt-flip-box':
  s=n['settings'];services.append({'title':clean(s['front_title_text']),'prompt':clean(s['front_description_text']),'detailTitle':clean(s['back_title_text']),'html':clean(s['back_description_text']),'image':local_image(s['front_background_image']['url'])})
about={'eyebrow':settings('9c501ea')['title'],'title':settings('3d6d8f5')['title'],'html':clean(settings('8c325eb')['editor']),'image':local_image(next(n for n in home if n['id']=='737d85e')['settings']['background_image']['url']),'counters':[{'number':n['settings']['content_number'],'label':n['settings']['content_text']} for n in nodes(home) if n.get('widgetType')=='bdt-advanced-counter']}
secondary={'title':clean(settings('cf9cb0c')['title']),'html':clean(settings('14eb0f5')['editor']),'video':settings('522ec0e')['youtube_url']}
report={'title':settings('8780a80')['title'],'html':clean(settings('6e7421a')['editor']),'image':local_image(settings('bff21d2')['image']['url']),'cta':button('4aa5ea5')}
portfolio={'title':settings('daecd06')['title'],'subtitle':settings('9385d7a')['title'],'image':local_image(settings('07f7b2c')['image']['url']),'cta':button('3ca0565')}
logos=[]
for n in nodes(home):
 if n.get('widgetType')=='bdt-logo-carousel':
  for x in n['settings']['logo_list']:logos.append({'image':local_image(x['image']['url']),'name':x.get('name','')})
reviews=[{'name':x['reviewer_name'],'job':x['reviewer_job_title'],'html':clean(x['review_text'])} for x in settings('82f90a1')['review_items']]
# The source container hides this section on all three device classes.
review_hidden=all(next(n for n in home if n['id']=='4b73833')['settings'].get('hide_'+d) for d in ['desktop','tablet','mobile'])
header=list(nodes(elementor(19)));footer=list(nodes(elementor(139)))
nav=[]
for i in sorted([i for i in items if val(i,'wp:post_type')=='nav_menu_item' and val(i,'wp:status')=='publish'],key=lambda i:int(val(i,'wp:menu_order') or 0)):
 m=meta(i);u=page_paths.get(m.get('_menu_item_object_id'),'/') if m.get('_menu_item_type')=='post_type' else m.get('_menu_item_url','')
 nav.append({'label':val(i,'title'),'href':('/'+u if u.startswith('#') else u)})
# Footer has separate mobile and desktop copyright texts in the original template.
footer_data={
 'address':next(n['settings']['title_text'] for n in footer if n.get('widgetType')=='icon-box'),
 'phones':next([x['text'] for x in n['settings']['icon_list']] for n in footer if n.get('widgetType')=='icon-list' and any('Fone:' in x.get('text','') for x in n['settings']['icon_list'])),
 'links':[{'label':x['text'],'href':dynamic(x)} for n in footer if n.get('widgetType')=='icon-list' for x in n['settings'].get('icon_list',[]) if x.get('__dynamic__')][:2],
 'copyrightDesktop':clean(next(n['settings']['editor'] for n in footer if n['id']=='32c6565')),
 'copyrightMobile':clean(next(n['settings']['editor'] for n in footer if n['id']=='ce7f85a')),
 'socials':[{'href':link(x['link']['url']),'label':label} for x,label in zip(next(n['settings']['icon_list'] for n in header if n.get('widgetType')=='icon-list'),['Instagram','Facebook','YouTube','Localização'])],
 'cta':next({'label':n['settings']['text'],'href':dynamic(n['settings'])} for n in header if n.get('widgetType')=='button')}
public_pages=[]
for i in pages:
 public_pages.append({'id':val(i,'wp:post_id'),'title':val(i,'title'),'path':urlsplit(val(i,'link')).path,'html':clean(val(i,'content:encoded')).replace('<h2>', '<h1>', 1).replace('</h2>', '</h1>', 1) if val(i,'wp:post_id')!='2' else '', 'modified':val(i,'wp:post_modified_gmt')})
# Remove XML-derived assets that are merely attachment records, not required by migrated content.
used_missing=set()
serialized=json.dumps([public_pages,hero,services,about,secondary,report,portfolio,logos,footer_data],ensure_ascii=False)
for u in unresolved:
 if u in serialized:used_missing.add(u)
data={'source':str(source.name),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'siteTitle':channel.findtext('title'),'siteDescription':channel.findtext('description'),'exportDate':channel.findtext('pubDate'),'pages':public_pages,'navigation':nav,'hero':hero,'services':services,'about':about,'secondary':secondary,'report':report,'portfolio':portfolio,'logos':logos,'clientsTitle':settings('003958c')['title'],'reviews':{'title':settings('6dfa539')['title'],'hidden':review_hidden,'items':reviews},'cta':{'title':settings('1e9aeb0')['title'],**button('182516f')},'footer':footer_data}
(ROOT/'src/data/wordpress.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
(ROOT/'src/data/missing-media.json').write_text(json.dumps(sorted(used_missing),ensure_ascii=False,indent=2)+'\n')
(ROOT/'public/_redirects').write_text('# Original image URLs mapped to the supplied local WebP assets.\n'+'\n'.join(f'{p} {target} 301' for p,target in sorted(redirects.items()))+'\n')
print(f'Imported {len(pages)} public pages, {len(nav)} menu items, {len(services)} services. Missing media: {len(used_missing)}')

for r in json.loads((ROOT/'src/data/redirects.json').read_text()):
 with (ROOT/'public/_redirects').open('a') as f:f.write(f"{r['from']} {r['to']} {r['status']}\n")
