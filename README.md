# IGC Viewer

一个**单文件、双击即用**的 IGC 飞行记录查看器，用来快速浏览、筛选和清理滑翔伞 / 滑翔机的 `.igc` 航迹文件。

A single-file, zero-install viewer for `.igc` flight logs (paragliding / gliding). Open a folder, flip through flights with the arrow keys, spot GPS glitches, and clean out bad files.

![demo](docs/demo.gif)

## 下载使用

1. 下载 [`IGC-Viewer.html`](IGC-Viewer.html)（点进去后点右上角的下载按钮）。
2. 用 **Edge** 或 **Chrome** 打开（Windows / macOS / Linux 都可以）。
3. 点「打开文件夹」，选你存 IGC 的文件夹。

不需要安装、不需要联网（联网时显示地图底图，没网也能看航迹）。文件只在你自己的电脑上读取，不会上传到任何地方。

## 功能

- **打开文件夹**：递归扫描子文件夹里的所有 `.igc`，也可以直接拖进窗口。下次可一键重新打开上次的文件夹。
- **极速切换**：<kbd>↑</kbd> <kbd>↓</kbd> 切换文件，航迹立即显示；后台预读相邻文件，最近 40 个常驻内存。
- **飞行信息**：日期、飞行员、机型、起降时间、时长、航迹长度、离起飞点最远距离、最高高度、爬升、最大爬升 / 下沉率。
- **高度曲线**：与地图联动，鼠标移上去显示时间、高度、升降速度、地速。
- **GPS 跳点检测**：自动找出定位漂移的点，地图上用橙色圈标出，列表里也会提示。
- **标记 & 清理**：按 <kbd>Del</kbd> / <kbd>D</kbd> 标记「待删」并跳到下一个，然后一键「移到 `_已删除` 文件夹（可恢复）」或永久删除。
- **筛选排序**：按文件名、日期、飞行员筛选；按名称或日期排序。
- **简体 / 繁體**：右上角切换；繁體中文系统（台湾、香港、澳门）自动用繁體，用语按台湾习惯（檔案、資料夾…）。文件名、飞行员名等你自己的数据保持原样。
- 底图可切换：Esri 地形 / Esri 卫星 / OpenTopoMap / 无底图。

| 快捷键 | 作用 |
| --- | --- |
| <kbd>↑</kbd> <kbd>↓</kbd> | 上一个 / 下一个文件 |
| <kbd>PgUp</kbd> <kbd>PgDn</kbd> <kbd>Home</kbd> <kbd>End</kbd> | 翻页 / 第一个 / 最后一个 |
| <kbd>Del</kbd> / <kbd>D</kbd> | 标记 / 取消「待删」 |
| <kbd>Ctrl</kbd>+<kbd>F</kbd> | 筛选 |

> 删除和「上次文件夹」依赖浏览器的 File System Access API，需要 Edge / Chrome 等 Chromium 内核浏览器。Firefox / Safari 可以浏览，但不能删除。

## 开发

源码在 [`src/template.html`](src/template.html)，Leaflet 在构建时内联进去：

```bash
python3 build.py   # 生成 IGC-Viewer.html
```

改了界面文字后，先重新生成繁體对照表 `src/zh-Hant.json`（需要 OpenCC）。`build.py` 发现有文字没有繁體时会提示：

```bash
pip install opencc && python3 tools/gen_hant.py
```

`samples/` 里有两个测试用的合成航迹。宣传片由 `promo/` 下的脚本录制（Playwright + 本机 Chrome + ffmpeg）：

```bash
cd promo && npm install
node record.mjs github.com/weidays/igc-viewer hans   # 简体版 → out/promo-hans.mp4
node record.mjs github.com/weidays/igc-viewer hant   # 繁體版 → out/promo-hant.mp4
```

## 许可

MIT。内含 [Leaflet](https://leafletjs.com)（BSD-2-Clause，见 [`src/LEAFLET-LICENSE`](src/LEAFLET-LICENSE)）。地图底图版权归各自提供方所有。
