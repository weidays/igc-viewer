"""生成三语静态页面：
  site/index.html          简体（x 也是离线版 dist/IGC-Viewer.html）
  site/zh-hant/index.html  繁體（由简体按 src/zh-Hant.json 整篇转换，OpenCC s2twp + 台湾用语修正）
  site/en/index.html       English（模板里的 en 块 + src/en.json 界面短语）
另外输出 dist/ 下三个离线文件（GitHub Release 用）和 site/csp-hashes.txt。
"""
import base64, hashlib, html as H, json, pathlib, re, shutil, sys

root = pathlib.Path(__file__).parent
s = root / 'src'
tpl = (s / 'template.html').read_text('utf-8')
RUN = re.compile('[　-〿㐀-鿿豈-﫿＀-￯]+')
BASE = 'https://lumitrail.app/tools/igc-viewer/'
BLOCK = re.compile(r'(?:<!--|/\*)L:zh(?:-->|\*/)(.*?)(?:<!--|/\*)L:en(?:-->|\*/)(.*?)(?:<!--|/\*)L:end(?:-->|\*/)', re.S)

hant_t = json.loads((s / 'zh-Hant.json').read_text('utf-8'))
en_t = json.loads((s / 'en.json').read_text('utf-8'))
icon = 'data:image/png;base64,' + base64.b64encode((s / 'lumitrail-icon.png').read_bytes()).decode()
leaflet_css = (s / 'leaflet.css').read_text('utf-8')
leaflet_js = (s / 'leaflet.js').read_text('utf-8').replace('</script', '<\\/script')

PAGES = {
    'hans': dict(dir='', file='IGC-Viewer.html', htmllang='zh-Hans', og='zh_CN', ogimg='og.png', inlang='zh-Hans'),
    'hant': dict(dir='zh-hant/', file='IGC-Viewer-zh-Hant.html', htmllang='zh-Hant', og='zh_TW', ogimg='og.png', inlang='zh-Hant'),
    'en':   dict(dir='en/', file='IGC-Viewer-en.html', htmllang='en', og='en_US', ogimg='og-en.png', inlang='en'),
}

def convert(text, table, lang):
    missing = sorted({r for r in RUN.findall(text) if r not in table})
    if missing:
        hint = 'python3 tools/gen_hant.py' if lang == 'hant' else '在 src/en.json 里补上英文'
        sys.exit(f'[{lang}] 这些文字没有对应翻译（{hint}）：\n  ' + '\n  '.join(missing[:40]))
    return RUN.sub(lambda m: table[m.group(0)], text)

def jsonld(page, lang, url):
    # FAQPage is generated from the visible <details class="faq"> so the two never drift apart
    faq = re.findall(r'<details class="faq"><summary>(.*?)</summary><p>(.*?)</p></details>', page, re.S)
    strip = lambda x: H.unescape(re.sub(r'<[^>]+>', '', x)).strip()
    title = strip(re.search(r'<title>(.*?)</title>', page, re.S).group(1))
    desc = H.unescape(re.search(r'<meta name="description" content="(.*?)">', page, re.S).group(1))
    name = {'en': 'Lumitrail IGC Viewer'}.get(lang, strip(re.search(r'<b>(.*?)</b>', page).group(1)))
    data = [
        {'@context': 'https://schema.org', '@type': 'WebApplication', 'name': name, 'alternateName': title,
         'description': desc, 'url': url, 'inLanguage': PAGES[lang]['inlang'],
         'applicationCategory': 'UtilitiesApplication', 'operatingSystem': 'Web',
         'browserRequirements': 'Requires a modern browser; Edge or Chrome for opening folders',
         'isAccessibleForFree': True, 'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'USD'},
         'publisher': {'@type': 'Organization', 'name': 'Lumitrail', 'url': 'https://lumitrail.app'},
         'license': 'https://opensource.org/licenses/MIT',
         'codeRepository': 'https://github.com/weidays/igc-viewer'},
        {'@context': 'https://schema.org', '@type': 'FAQPage', 'inLanguage': PAGES[lang]['inlang'],
         'mainEntity': [{'@type': 'Question', 'name': strip(q), 'acceptedAnswer': {'@type': 'Answer', 'text': strip(a)}} for q, a in faq]},
    ]
    j = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    return f'<script type="application/ld+json">{j}</script>'

def build(lang):
    p = PAGES[lang]
    url = BASE + p['dir']
    t = BLOCK.sub(lambda m: m.group(2) if lang == 'en' else m.group(1), tpl)
    if lang == 'hant': t = convert(t, hant_t, lang)
    if lang == 'en': t = convert(t, en_t, lang)
    alts = '\n'.join(f'<meta property="og:locale:alternate" content="{q["og"]}">' for k, q in PAGES.items() if k != lang)
    for k, v in {'{{HTMLLANG}}': p['htmllang'], '{{URL}}': url, '{{OGLOCALE}}': p['og'], '{{OGLOCALE_ALTS}}': alts,
                 '{{OGIMAGE}}': BASE + p['ogimg'], '{{LANG}}': lang,
                 '{{SEL_hans}}': ' selected' if lang == 'hans' else '', '{{SEL_hant}}': ' selected' if lang == 'hant' else '',
                 '{{SEL_en}}': ' selected' if lang == 'en' else ''}.items():
        t = t.replace(k, v)
    t = t.replace('<!--JSONLD-->', jsonld(t, lang, url), 1)
    t = t.replace('/*BRAND_ICON*/', icon)
    t = t.replace('/*LEAFLET_CSS*/', leaflet_css, 1).replace('/*LEAFLET_JS*/', leaflet_js, 1)
    left = re.findall(r'\{\{[A-Za-z_]+\}\}|<!--L:|/\*L:', t)
    if left: sys.exit(f'[{lang}] 有没替换掉的占位符：{left[:5]}')
    if lang == 'en' and RUN.search(re.sub(r'<option value="han[st]"[^>]*>.*?</option>', '', t)):
        sys.exit('[en] 英文页里还有中文：' + ', '.join(sorted(set(RUN.findall(t)))[:10]))
    return t

def h(x): return "'sha256-" + base64.b64encode(hashlib.sha256(x.encode('utf-8')).digest()).decode() + "'"

out_site, out_dist = root / 'site', root / 'dist'
out_dist.mkdir(exist_ok=True)
scripts, styles = [], []
for lang, p in PAGES.items():
    page = build(lang)
    d = out_site / p['dir']; d.mkdir(parents=True, exist_ok=True)
    (d / 'index.html').write_text(page, 'utf-8')
    (out_dist / p['file']).write_text(page, 'utf-8')
    scripts += [x for x in re.findall(r'<script>(.*?)</script>', page, re.S)]
    styles += re.findall(r'<style>(.*?)</style>', page, re.S)
    print(f'{lang:5} {len(page):7} bytes  -> site/{p["dir"]}index.html, dist/{p["file"]}')
for img in ('og.png', 'og-en.png'):
    if (root / 'docs' / img).exists(): shutil.copy(root / 'docs' / img, out_site / img)
uniq = lambda xs: list(dict.fromkeys(xs))
(out_site / 'csp-hashes.txt').write_text('script-src ' + ' '.join(uniq(map(h, scripts))) + '\nstyle-src ' + ' '.join(uniq(map(h, styles))) + '\n', 'utf-8')
print('csp hashes ->', 'site/csp-hashes.txt', f'({len(uniq(scripts))} scripts, {len(uniq(styles))} styles across 3 pages)')
