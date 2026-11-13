"""生成繁體版（OpenCC s2twp，台湾正体 + 台湾用语）：
  - src/zh-Hant.json：界面里每段中文 → 繁體
  - README.zh-Hant.md：由 README.md 整篇转换
改了界面文字或 README.md 后运行一次：  pip install opencc && python3 tools/gen_hant.py
"""
import json, pathlib, re
import opencc

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCES = ['src/template.html', 'promo/demo-init.js', 'promo/record.mjs']
# 必须与 template.html 里 I18N.re 的字符范围一致
RUN = re.compile('[　-〿㐀-鿿豈-﫿＀-￯]+')

# OpenCC 之后再按台湾 Windows 用户习惯修正
FIXES = {'資源管理器': '檔案總管', '許可權': '權限', '滑翔傘': '飛行傘', '後臺': '背景', '回收站': '資源回收筒', '引數': '參數', '坐車': '搭車'}

# README 语言切换行，以及只在 README 里需要的修正
LANG_HANS = '**简体中文** · [繁體中文](README.zh-Hant.md)'
LANG_HANT = '[简体中文](README.md) · **繁體中文**'
README_FIXES = {'飛行傘（臺灣稱飛行傘）/ ': '飛行傘 / ', '臺灣': '台灣', '構建': '建置', '指令碼': '腳本',
                '## 許可': '## 授權', '內聯': '內嵌', '聯網': '連網', '生成': '產生'}

def runs(paths):
    out = set()
    for p in paths:
        out |= set(RUN.findall((ROOT / p).read_text('utf-8')))
    return out

if __name__ == '__main__':
    cc = opencc.OpenCC('s2twp')
    def conv(r):
        t = cc.convert(r)
        for a, b in FIXES.items():
            t = t.replace(a, b)
        return t
    table = {r: conv(r) for r in sorted(runs(SOURCES))}
    (ROOT / 'src/zh-Hant.json').write_text(json.dumps(table, ensure_ascii=False, indent=0, sort_keys=True) + '\n', 'utf-8')
    print(len(table), 'runs,', sum(k != v for k, v in table.items()), 'changed')

    readme = (ROOT / 'README.md').read_text('utf-8')
    assert LANG_HANS in readme, 'README.md 第一段需要语言切换行：' + LANG_HANS
    t = conv(readme).replace(conv(LANG_HANS), LANG_HANT, 1)
    for a, b in README_FIXES.items():
        t = t.replace(a, b)
    note = '<!-- 本檔由 tools/gen_hant.py 從 README.md 自動產生，請修改 README.md 後重新執行 -->\n'
    (ROOT / 'README.zh-Hant.md').write_text(note + t, 'utf-8')
    print('README.zh-Hant.md written')
