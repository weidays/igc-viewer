# 把 Leaflet 内联进单个 HTML，离线也能打开
import pathlib
s = pathlib.Path(__file__).parent / 'src'
html = (s/'template.html').read_text('utf-8')
html = html.replace('/*LEAFLET_CSS*/', (s/'leaflet.css').read_text('utf-8'), 1)
html = html.replace('/*LEAFLET_JS*/', (s/'leaflet.js').read_text('utf-8').replace('</script', '<\\/script'), 1)
(s.parent/'IGC-Viewer.html').write_text(html, 'utf-8')
print('ok', len(html))
