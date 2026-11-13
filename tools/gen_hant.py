"""生成 src/zh-Hant.json：界面里每段中文 → 繁體（OpenCC s2twp，台湾正体 + 台湾用语）。
改了界面文字后运行一次：  pip install opencc && python3 tools/gen_hant.py
"""
import json, pathlib, re
import opencc

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCES = ['src/template.html', 'promo/demo-init.js', 'promo/record.mjs']
# 必须与 template.html 里 I18N.re 的字符范围一致
RUN = re.compile('[　-〿㐀-鿿豈-﫿＀-￯]+')

# OpenCC 之后再按台湾 Windows 用户习惯修正
FIXES = {'資源管理器': '檔案總管', '許可權': '權限', '滑翔傘': '飛行傘', '後臺': '背景', '回收站': '資源回收筒'}

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
