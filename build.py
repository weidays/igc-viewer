# 生成单文件 IGC-Viewer.html：内联 Leaflet 和繁體对照表，离线也能打开
import json, pathlib, re, sys
root = pathlib.Path(__file__).parent
s = root / 'src'
html = (s/'template.html').read_text('utf-8')

RUN = re.compile('[　-〿㐀-鿿豈-﫿＀-￯]+')
table = json.loads((s/'zh-Hant.json').read_text('utf-8'))
missing = sorted(set(RUN.findall(html)) - set(table))
if missing:
    sys.exit('zh-Hant.json 缺少这些文字的繁體，请先运行 python3 tools/gen_hant.py：\n  ' + '\n  '.join(missing[:30]))
hant = {k: v for k, v in table.items() if k != v}

html = html.replace('/*ZH_HANT*/{}', json.dumps(hant, ensure_ascii=False, separators=(',', ':')), 1)
import base64
icon = 'data:image/png;base64,' + base64.b64encode((s/'lumitrail-icon.png').read_bytes()).decode()
html = html.replace('/*BRAND_ICON*/', icon)
html = html.replace('/*LEAFLET_CSS*/', (s/'leaflet.css').read_text('utf-8'), 1)
html = html.replace('/*LEAFLET_JS*/', (s/'leaflet.js').read_text('utf-8').replace('</script', '<\\/script'), 1)
(root/'IGC-Viewer.html').write_text(html, 'utf-8')
print('ok', len(html), 'bytes,', len(hant), 'hant entries')
# CSP hashes for the inline <script> / <style> blocks (for the hosting site's _headers)
import hashlib
def h(x): return "'sha256-" + base64.b64encode(hashlib.sha256(x.encode('utf-8')).digest()).decode() + "'"
scripts = re.findall(r'<script>(.*?)</script>', html, re.S)
styles = re.findall(r'<style>(.*?)</style>', html, re.S)
csp = ("script-src " + " ".join(map(h, scripts)) + "\nstyle-src " + " ".join(map(h, styles)) + "\n")
(root/'docs'/'csp-hashes.txt').write_text(csp, 'utf-8')
print('csp hashes:', len(scripts), 'scripts,', len(styles), 'styles -> docs/csp-hashes.txt')
