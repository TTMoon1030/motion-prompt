# 自己做一套

**繁體中文** | [English](README.md) | [日本語](README.ja.md)

這裡有提示詞、輸出腳本和兩個完成的範例，讓你做出自己的一套「名稱」：3 支循環播放的影片，每支 8 張卡片，每張卡片都是一段小動畫，呈現一個名稱的意思；另外再加上一張一頁式的速查表圖片。

你可以用自己的領域、自己的語言、自己喜歡的外觀來做。

| | 運鏡（`examples/camera-moves/`） | Motion Graphics（`examples/motion-graphics/`） |
|---|---|---|
| 外觀 | 淺灰底、單一藍色、圖示（pictogram）風格 | 深藍色卡片、四種顏色 |
| 語言 | 英文、日文 | 日文 |
| | ![運鏡 01–08](../assets/preview-camera.gif) | ![Motion Graphics 01–08](../assets/preview-motion.gif) |

附帶的影片和速查表就是當初發表的版本，所以保留了當時的用字（例如 10 號的日文名稱是「手持ち風」）。[`packs/`](../packs/README.md) 裡的名稱一覽現在寫的是「手持ち」。

這兩個範例刻意做得不一樣。這不是某一種風格的範本。它們共通的只有一條規則：名稱是主角，每張卡片都在呈現那個名稱的意思。

## 內容

```
prompts/zh-Hant, prompts/en, prompts/ja   貼給寫程式的 AI／圖像生成 AI 的提示詞
render.mjs                                HTML -> mp4（Playwright + ffmpeg）
examples/camera-moves/
  en/  index.html  video-1of3.mp4  video-2of3.mp4  video-3of3.mp4  cheatsheet.png
  ja/  index.html  video-1of3.mp4  video-2of3.mp4  video-3of3.mp4  cheatsheet.png
examples/motion-graphics/
  ja/  index.html  video-1of3.mp4  video-2of3.mp4  video-3of3.mp4  cheatsheet.png  cheatsheet-prompt.md
```

| | |
|---|---|
| 影片 | 1200x1350、30fps、H.264（yuv420p）、無聲、9.4 秒、無縫循環 |
| 速查表圖片 | 用 `prompts/` 裡的提示詞，交給圖像生成 AI 製作 |

每支影片都是一個在 `<canvas>` 上繪圖的 HTML 檔案。沒有建置步驟，也沒有框架，所以寫程式的 AI（Claude Code、Codex、Cursor 等）可以讀完整個檔案，直接幫你修改。

## 提示詞

讓寫程式的 AI 讀取這個儲存庫，再貼上其中一份。

| 目的 | 提示詞 |
|---|---|
| 用另一種語言做出同樣的影片 | [`prompts/zh-Hant/01-translate.md`](prompts/zh-Hant/01-translate.md) |
| 用自己喜歡的外觀，做出自己領域的名稱 | [`prompts/zh-Hant/02-your-own-field.md`](prompts/zh-Hant/02-your-own-field.md) |
| 一頁式的速查表圖片 | [`prompts/zh-Hant/03-cheatsheet-image.md`](prompts/zh-Hant/03-cheatsheet-image.md) |

英文版在 [`prompts/en/`](prompts/en/)，日文版在 [`prompts/ja/`](prompts/ja/)。

要手動修改的話，在 `index.html` 裡找這些地方：

- `PAGES` 和 `ITEMS`：標題和 24 個名稱
- `CELLS[0]` 到 `CELLS[23]`：每張卡片各一個繪圖函式
- `C`：顏色。`JP`、`EN`、`MONO` / `DISP`：字型

## 預覽

用瀏覽器打開 `examples/camera-moves/en/index.html`（建議使用 Chrome 或其他 Chromium 系的瀏覽器），就會循環播放。

- `?page=2` 顯示第 2 頁（共 1 到 3 頁）
- `?t=3.5` 顯示 3.5 秒時的靜止畫面

## 輸出成 mp4

你需要 [Node.js](https://nodejs.org/) 18 以上，以及已加入 PATH 的 [ffmpeg](https://ffmpeg.org/)。請在 `make-your-own/` 裡執行下列指令。

```bash
cd make-your-own
npm install
npx playwright install chromium

node render.mjs examples/camera-moves/en/index.html --page 1
# -> out/en-page1.mp4

node render.mjs examples/motion-graphics/ja/index.html --all --sheet
# -> out/ja-page1.mp4、ja-page2.mp4、ja-page3.mp4，以及每一頁的影格總覽 PNG
```

選項：`--page <n>`、`--all`、`--pages <n>`、`--out <file>`、`--out-dir <dir>`、`--fps <n>`、`--crf <n>`、`--sheet`。詳細說明請執行 `node render.mjs --help`。

`--sheet` 會把每秒一格的畫面排成一張圖存下來（影格總覽，contact sheet）。不必反覆看循環播放，就能一次檢查 8 張卡片有沒有錯，這是最快的方法。

### 輸出的原理

HTML 不使用即時的時鐘。每一格畫面都根據影格編號繪製：

| HTML 裡的項目 | 意義 |
|---|---|
| `window.N_FRAMES` | 一頁的影格數（282 = 9.4 秒 × 30fps） |
| `window.renderFrame(i)` | 在 `<canvas id="c">` 上畫出第 `i` 格 |
| `window.prepareFrame(i)` | 選用，可以是非同步 |
| `window.READY` | 字型載入完成後變成 `true` |
| `?page=N`、`?render=1` | 要畫的頁面／關閉預覽的循環播放 |

`render.mjs` 會逐格呼叫 `renderFrame(i)`，把 canvas 讀成 PNG，再一路送進 ffmpeg。所以即使電腦很慢，也不會掉格。只要遵守這套約定，任何 HTML 都能用同一個腳本輸出。

## 字型

範例不從網路載入任何東西：沒有網頁字型、沒有 CDN，也沒有圖片。它們使用 macOS 內建的字型（Helvetica Neue、Avenir Next、Hiragino Sans、SF Mono），這個儲存庫裡沒有附任何字型檔。

附帶的 mp4 是在 macOS 上輸出的。在 Windows 或 Linux 上，瀏覽器會改用其他字型，所以文字看起來會稍有不同；日文版還需要安裝日文字型（例如 Noto Sans JP）。如果要換字型，請修改 `index.html` 開頭附近的字型常數。

## 補充說明

- 日文版的 HTML 原本是寫成一支約 30 秒、依序播完 3 頁的影片。這裡改成和英文版一樣，一頁畫成一支影片。附帶的日文版 mp4 是當初貼文用的檔案，所以重新輸出後，在硬切的地方可能會差一格。
- 範例 HTML 裡的程式碼註解大多是日文。
- canvas 的程式碼用到 `roundRect` 和 `letterSpacing`，需要較新的 Chromium。Playwright 安裝的版本就可以。
- 這兩個範例的卡片，也以包 `camera` 和包 `motion` 的形式收錄在圖庫裡（[`packs/`](../packs/README.md)）。想把你自己的一套加進去，請看 [CONTRIBUTING.zh-Hant.md](../CONTRIBUTING.zh-Hant.md)。

## 授權

[MIT](../LICENSE)。這裡的程式碼、影片和圖片都可以用在你自己的作品裡，包括商業用途。歡迎附上連結，但並非必要。
