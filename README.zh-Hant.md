<!-- 本檔由 tools/gen_hant.py 從 README.md 自動產生，請修改 README.md 後重新執行 -->
<p align="center"><img src="src/lumitrail-icon.png" width="72" alt="光跡 Lumitrail"></p>

# 光跡 IGC 查看器 · Lumitrail IGC Viewer

[简体中文](README.md) · **繁體中文**

> 🌐 **線上使用，不用下載：https://lumitrail.app/tools/igc-viewer/zh-hant/** · [English](https://lumitrail.app/tools/igc-viewer/en/)

飛行傘 / 滑翔機 `.igc` 飛行記錄的檢視和清理工具：開啟資料夾，↑↓ 秒切換看航跡，自動標出 GPS 跳點和疑似接駁車，上傳競賽平台前一鍵清掉廢記錄。由 [光跡 Lumitrail](https://lumitrail.app) 提供，免費開源。

A free, open-source viewer for `.igc` flight logs (paragliding / gliding) by [Lumitrail](https://lumitrail.app). Use it online at **https://lumitrail.app/tools/igc-viewer/en/** — open a folder, flip through flights with the arrow keys, spot GPS glitches and shuttle rides, and clean out bad files before uploading to a competition server.

![demo](docs/demo.gif)

## 使用

**線上**：用電腦上的 **Edge** 或 **Chrome** 開啟 https://lumitrail.app/tools/igc-viewer/ ，點「開啟資料夾」，選你存 IGC 的資料夾。不用註冊。繁體版：https://lumitrail.app/tools/igc-viewer/zh-hant/ ，English：https://lumitrail.app/tools/igc-viewer/en/ 。

**離線**：下載 [`IGC-Viewer.html`](https://github.com/weidays/igc-viewer/releases/latest/download/IGC-Viewer.html)（簡體）、[`IGC-Viewer-zh-Hant.html`](https://github.com/weidays/igc-viewer/releases/latest/download/IGC-Viewer-zh-Hant.html)（繁體）或 [`IGC-Viewer-en.html`](https://github.com/weidays/igc-viewer/releases/latest/download/IGC-Viewer-en.html)（English），雙擊用瀏覽器開啟就行。沒網也能看航跡，只是沒有地圖底圖。

**隱私**：IGC 檔案只在你自己的電腦上讀取，不會上傳到任何地方。地圖底圖會向 Esri 請求圖塊，因此會透露飛行區域的大致位置；介意的話，在右上角「底圖」裡選「無底圖」。

## 功能

- **開啟資料夾**：遞迴掃描子資料夾裡的所有 `.igc`，也可以直接拖進視窗。下次可一鍵重新開啟上次的資料夾。
- **極速切換**：<kbd>↑</kbd> <kbd>↓</kbd> 切換檔案，航跡立即顯示；背景預讀相鄰檔案，最近 40 個常駐記憶體。
- **飛行資訊**：日期、飛行員、機型、起降時間、時長、航跡長度、離起飛點最遠距離、最高高度、爬升、最大爬升 / 下沉率。
- **高度曲線**：與地圖聯動，滑鼠移上去顯示時間、高度、升降速度、地速。
- **GPS 跳點檢測**：自動找出定位漂移的點，地圖上用橙色圈標出，列表裡也會提示。
- **疑似接駁車檢測**：忘了關記錄儀、降落後搭車回去（或在車上就開了記錄）的路段，地圖上用紫色虛線標出，高度曲線上也會塗成紫色。
- **⚠ 可疑篩選**：開啟資料夾後在背景逐個檢查所有檔案，點「⚠ 可疑」只看有 GPS 跳點或疑似接駁車的記錄，上傳競賽平台前快速清理。
- **標記 & 清理**：按 <kbd>Del</kbd> / <kbd>D</kbd> 標記「待刪」並跳到下一個，然後一鍵「移到 `_已刪除` 資料夾（可恢復）」或永久刪除。
- **篩選排序**：按檔名、日期、飛行員篩選；按名稱或日期排序。
- **三種語言**：簡體中文、繁體中文、English，各有獨立網址，在左上角按鈕那一排切換；瀏覽器語言不一樣時會提示切換。繁體用語按台灣習慣（檔案、資料夾…）。檔名、飛行員名等你自己的資料保持原樣。
- 底圖可切換：Esri 地形 / Esri 衛星 / OpenTopoMap / 無底圖。

| 快捷鍵 | 作用 |
| --- | --- |
| <kbd>↑</kbd> <kbd>↓</kbd> | 上一個 / 下一個檔案 |
| <kbd>PgUp</kbd> <kbd>PgDn</kbd> <kbd>Home</kbd> <kbd>End</kbd> | 翻頁 / 第一個 / 最後一個 |
| <kbd>Del</kbd> / <kbd>D</kbd> | 標記 / 取消「待刪」 |
| <kbd>Ctrl</kbd>+<kbd>F</kbd> | 篩選 |

> 接駁車檢測靠速度、爬升和是否盤旋來判斷，針對飛行傘調過參數：不盤旋卻持續爬升 6 分鐘以上（車上山路），或高度不變、快速移動 3 分鐘以上（車走平路）才會標出。山脊上來回飛不會被誤判；太短或很慢很繞的車程可能識別不到。滑翔機（固定翼）記錄可能誤報。

> 刪除和「上次資料夾」依賴瀏覽器的 File System Access API，需要 Edge / Chrome 等 Chromium 核心瀏覽器。Firefox / Safari 可以瀏覽，但不能刪除。

## 關於光跡 Lumitrail

光跡 Lumitrail 是一個安靜的足跡記錄 App：自動記下你走過的路，認出飛行傘、登山等戶外活動，並用 3D 回放、匯出影片。資料留在你自己的裝置上。

- 官網：https://lumitrail.app
- iOS：[App Store 下載](https://apps.apple.com/app/id6784893459)

## 開發

原始碼在 [`src/template.html`](src/template.html)（簡體寫成，英文版寫在 `L:en` 塊裡），Leaflet 和圖示在建置時內嵌進去：

```bash
python3 build.py   # 產生 site/（網站用的三語頁面 + csp-hashes.txt）和 dist/（三個離線檔案）
```

- 繁體：由簡體整頁轉換，對照表是 `src/zh-Hant.json`。
- English：大段內容寫在模板的 `L:en` 塊裡，介面短語在 `src/en.json`。`build.py` 發現有文字沒翻譯會報錯。

改了介面文字或本 README 後，執行下面的命令重新產生繁體對照表和 [`README.zh-Hant.md`](README.zh-Hant.md)（需要 OpenCC，不要直接改繁體 README）：

```bash
pip install opencc && python3 tools/gen_hant.py
```

`samples/` 裡有兩個測試用的合成航跡。宣傳片由 `promo/` 下的腳本錄製（Playwright + 本機 Chrome + ffmpeg）：

```bash
cd promo && npm install
node record.mjs lumitrail.app/tools/igc-viewer hans      # 簡體版 → out/promo-hans.mp4
node record.mjs lumitrail.app/tools/igc-viewer hant      # 繁體版 → out/promo-hant.mp4
node record.mjs lumitrail.app/tools/igc-viewer/en en     # English → out/promo-en.mp4
```

## 授權

程式碼採用 MIT 授權。內含 [Leaflet](https://leafletjs.com)（BSD-2-Clause，見 [`src/LEAFLET-LICENSE`](src/LEAFLET-LICENSE)）。地圖底圖版權歸各自提供方所有，Esri 底圖按 Esri 條款顯示署名。

原作者：[weidays](https://github.com/weidays)。

「光跡」「Lumitrail」名稱和圖示屬於光跡，不在 MIT 授權範圍內。如果你 fork 後另外發布，請換成你自己的名稱和圖示。
