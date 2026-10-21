# Motion Prompt

**繁體中文** | [English](README.md) | [日本語](README.ja.md)

> 這是 [showheyohtaki/motion-prompt](https://github.com/showheyohtaki/motion-prompt)（作者：大滝昇平 Shohei Ohtaki）的繁體中文版（fork）。全部 144 個名稱，連同一句話說明、對 AI 的說法範例、規格與使用時機，以及圖庫介面、技能和它的指令列工具，都已經有繁體中文；日本語和 English 也照樣可以使用。

這是一個「名稱」的資料庫，收錄你請 AI 製作東西時會用到的各種名稱。每個名稱都附有會動的範例、一句話說明，以及對 AI 的說法範例。目前收錄 6 個包，每個包 24 個名稱，共 144 個：Motion Graphics 的動態手法（`motion`）、運鏡（`camera`）、UI 元件名稱（`ui`）、Landing Page 與網站效果（`lp`）、攝影的風格、光線與畫風（`photo`），以及 Motion Graphics 動態手法第二彈（`motion2`）。另外也附上提示詞，讓你用自己的語言，替自己的領域做出同樣的名稱資料庫。

| Motion Graphics | 運鏡 |
|---|---|
| ![Motion Graphics 的名稱 01–08](assets/preview-motion.gif) | ![運鏡的名稱 01–08](assets/preview-camera.gif) |

- 圖庫（所有範例都會動）：https://ttmoon1030.github.io/motion-prompt/
- 可以直接在 GitHub 上閱讀的名稱一覽：[`packs/`](packs/README.zh-Hant.md)
- 其他人把名稱配上範例公開分享的案例（嵌入 X 貼文並附上連結）：https://ttmoon1030.github.io/motion-prompt/found.html

## 為什麼做這個

我發了幾支短影片，把 Motion Graphics 的動態手法和運鏡的「名稱」排在一起介紹，結果這幾天收到了很多留言。其中有一則留言，大意是說：一直讓自己卡住的，並不是缺乏想像力，而是不知道這種動法叫什麼。

看到這則留言，我就想：如果各種語言、各個領域的專家，能把善用 AI 所需要的「共通語言」整理成資料庫給大家看，那一定超級有用。所以我試著把它做成了一個 GitHub 儲存庫。

這不是一個發給大家一套固定風格的儲存庫。用這裡的提示詞和說明，你可以做出像這樣的 Motion Graphics；也可以用自己的領域、自己的語言、自己喜歡的外觀，做出同樣的名稱範例。我希望這裡能成為這樣的地方。

我還收到另一則留言："this is how you become a creative director"。正是如此。如果世界各地能有更多創意總監，和 AI 一起發揮出色的才華，我覺得那會是一件很美好的事。

大滝昇平（Shohei Ohtaki）

（繁體中文版譯自作者的日文與英文原文。）

## 目前收錄的名稱

| 編號 | 包 | 數量 | 名稱一覽 |
|---|---|---|---|
| 001–024 | `motion`：Motion Graphics 動態手法 | 24 | [繁體中文](packs/motion/README.zh-Hant.md) · [English](packs/motion/README.md) · [日本語](packs/motion/README.ja.md) |
| 025–048 | `camera`：運鏡與轉場 | 24 | [繁體中文](packs/camera/README.zh-Hant.md) · [English](packs/camera/README.md) · [日本語](packs/camera/README.ja.md) |
| 049–072 | `ui`：UI 元件名稱 | 24 | [繁體中文](packs/ui/README.zh-Hant.md) · [English](packs/ui/README.md) · [日本語](packs/ui/README.ja.md) |
| 073–096 | `lp`：Landing Page 與網站效果 | 24 | [繁體中文](packs/lp/README.zh-Hant.md) · [English](packs/lp/README.md) · [日本語](packs/lp/README.ja.md) |
| 097–120 | `photo`：攝影風格：光線、鏡頭與調色 | 24 | [繁體中文](packs/photo/README.zh-Hant.md) · [English](packs/photo/README.md) · [日本語](packs/photo/README.ja.md) |
| 121–144 | `motion2`：Motion Graphics 動態手法 第二彈 | 24 | [繁體中文](packs/motion2/README.zh-Hant.md) · [English](packs/motion2/README.md) · [日本語](packs/motion2/README.ja.md) |

每份一覽都列出編號、名稱、英文名稱、一句話說明，以及對 AI 的說法範例。同樣的名稱可以在[圖庫](https://ttmoon1030.github.io/motion-prompt/)裡看到會動的樣子。

每個包都有自己的外觀。包 `motion` 和 `motion2` 是深藍底配四種顏色；包 `camera` 是淺灰底配一種藍色；包 `ui` 是帶點暖色的米白底，配黑色和一種藍色，游標一碰到，元件就會動起來；包 `lp` 在淺灰色的桌面上畫出白色的瀏覽器視窗，強調色是朱紅色，頁面裡的圖片則用藍色；包 `photo` 沒有共用的配色，每張卡片都用該場景本身的顏色來畫，效果會套上去再退回原樣，方便你比較前後差異。這是刻意的。一個包要做對的是名稱，而不是統一的風格。

## 三種用法

### 1. 打開資料庫、挑選，再交給 AI

在 Claude Code 或 Codex 裝好 `motion-prompt` 技能之後，只要開口請 AI，就會打開這個圖庫。不必記住名稱或編號。不知道某個東西叫什麼的時候，就像查字典一樣，請 AI 把資料庫打開來找。

```sh
npx skills add TTMoon1030/motion-prompt
```

1. 跟 AI 說：
   ```text
   打開 motion-prompt 的資料庫。
   ```
2. 瀏覽器會打開圖庫。在想用的範例上按「選擇」，要選幾個都可以。螢幕下方的「備註」欄可以寫一句話，例如「用在開頭的標題」。
3. 按下「交給 AI」，選好的項目就會送到 AI 那邊。回到 AI 的視窗，告訴它你想怎麼做：
   ```text
   把這支影片的開頭改成這種感覺。
   ```

AI 只會使用你選的項目。它會取得這些項目的規格和參考實作，再配合你專案的做法，套用到你的影片或網站裡。如果你指定種類，例如「給我看有哪些運鏡」，圖庫打開時就只會顯示那個包。

如果 AI 沒有裝這個技能，就先在圖庫裡選好，按螢幕下方的「複製已選項目」，再把文字貼到對話裡。裡面包含範例和規格的網址。

**已經知道編號的話**，也可以不開圖庫，直接用編號指定：

```text
用 motion-prompt 的 #012 和 #045，讓這支產品影片看起來更專業。
```

```text
把標題出現的那一段換成 motion-prompt 的 #005。長度和前後的轉場維持不變。
```

```text
把 motion-prompt #032 的運鏡寫成給 Veo 用的英文提示詞。被攝體是桌上的一個咖啡杯。
```

其他安裝方式，以及 AI 會做哪些事，請看下方的[技能說明](#技能說明)。

### 2. 查好名稱，直接告訴 AI

打開[名稱一覽](packs/README.zh-Hant.md)或圖庫，找到你腦中想的那個效果，把它的名稱寫進提示詞。再補上「多長」「多強」「什麼在動」，結果會更接近你想要的。

```text
標題請用 Mask Reveal 從下方升起，0.6 秒，每一行稍微錯開。
```

```text
用 Dolly in 讓攝影機慢慢朝她的臉前進。要實際移動攝影機，不要用變焦。
```

這種用法不需要安裝任何東西。這些名稱可以用在寫程式的 AI、影片生成模型，也可以寫進交給別人的需求說明裡。

### 3. 做出你自己的領域或語言版本

[`make-your-own/`](make-your-own/README.zh-Hant.md) 裡有可以直接複製貼上給寫程式的 AI 的提示詞、把影片輸出的腳本，以及兩個完成的範例（各自附有 HTML 原始碼、3 支影片和 1 張速查表圖片）。

| 目的 | 提示詞 |
|---|---|
| 用另一種語言做出同樣的影片 | [`01-translate.md`](make-your-own/prompts/zh-Hant/01-translate.md) |
| 用自己喜歡的外觀，做出自己領域的名稱 | [`02-your-own-field.md`](make-your-own/prompts/zh-Hant/02-your-own-field.md) |
| 一頁式的速查表圖片 | [`03-cheatsheet-image.md`](make-your-own/prompts/zh-Hant/03-cheatsheet-image.md) |

不一定要是影像領域。燈光、聲音、UI、攝影、料理、建築……只要是「知道名稱，才能開口請人做」的領域都可以。

## 加入你所在領域的名稱

如果你很熟悉某個領域，請用你的語言，把那個領域的共通語言加進來。怎麼新增一個包、怎麼替現有的包加上一種語言，以及名稱收錄前需要符合哪些條件，都寫在 [CONTRIBUTING.zh-Hant.md](CONTRIBUTING.zh-Hant.md)。大部分的製作工作，都可以用上面的提示詞交給寫程式的 AI。

## 原始貼文

這個專案的起點是這幾支影片（X，日文）：

- https://x.com/showheyohtaki/status/2108065874511077598
- https://x.com/showheyohtaki/status/2109112248832503895
- https://x.com/showheyohtaki/status/2109840044554891464

第一則貼文的那組名稱（網站與 Landing Page 的動畫名稱）還沒有收進這個儲存庫。包 `lp` 是另一組名稱。有些名稱和那則貼文重疊（例如 Parallax、Scroll Snap 等），但挑選方式和範例都是為了這個儲存庫重新製作的。包 `ui` 是根據 10 月 10 日在 X 上發表的「UIパーツ名24」（24 個 UI 元件名稱）製作的；包 `photo` 也是為這個儲存庫新做的。

## 技能說明

需要 Node.js 18 以上。

### 安裝

**用提示詞安裝。** 把下面這段貼到 Claude Code 或 Codex：

```text
請閱讀 https://github.com/TTMoon1030/motion-prompt ，把 motion-prompt 技能安裝到這個環境。裝好之後，用三行告訴我怎麼使用。
```

**用指令安裝。** 這會用到 `skills` 安裝工具，Claude Code、Codex 和其他支援 Agent Skills 的 AI 代理（agent）都能用：

```sh
npx skills add TTMoon1030/motion-prompt
```

**當成 Claude Code 外掛安裝。**

```text
/plugin marketplace add TTMoon1030/motion-prompt
/plugin install motion-prompt@motion-prompt
```

**手動安裝。** 把 `skills/motion-prompt` 資料夾複製到下列其中一個位置：

| 位置 | 適用範圍 |
|---|---|
| `~/.claude/skills/` | Claude Code，所有專案 |
| `~/.agents/skills/` | Codex 等，所有專案 |
| 專案裡的 `.claude/skills/` | Claude Code，只限該專案 |
| 專案裡的 `.agents/skills/` | Codex 等，只限該專案 |

### 給 AI 代理的安裝步驟

這一節是寫給收到「用提示詞安裝」那段文字的 AI 代理看的。

1. 用 `node --version` 確認可以使用 Node.js 18 以上。
2. 在使用者的專案資料夾裡執行下面的指令。如果它問要安裝給哪個代理，請選你自己。
   ```sh
   npx skills add TTMoon1030/motion-prompt -y
   ```
3. 如果第 2 步行不通，就取得儲存庫並複製資料夾。如果你是 Claude Code，複製到 `.claude/skills/`；否則複製到 `.agents/skills/`（要讓所有專案都能用，則複製到 `~/.claude/skills/` 或 `~/.agents/skills/`）。
   ```sh
   git clone --depth 1 https://github.com/TTMoon1030/motion-prompt.git /tmp/motion-prompt
   mkdir -p .claude/skills
   cp -R /tmp/motion-prompt/skills/motion-prompt .claude/skills/
   ```
4. 確認安裝成功。把 `<skill-dir>` 換成技能安裝的路徑（裡面有 `SKILL.md` 的那個資料夾）。如果印出資料來源和元素數量，就代表成功了。
   ```sh
   node <skill-dir>/scripts/motion-prompt.mjs info
   ```
   結束代碼 3 表示連不到資料來源。請取得網路存取權限後再執行一次。
5. 閱讀 `<skill-dir>/SKILL.md`，用三行告訴使用者怎麼使用這個技能。例如：
   - 說「打開 motion-prompt 的資料庫」，圖庫就會打開。在想用的項目上按「選擇」，再按「交給 AI」。
   - 接著說要怎麼用，例如「把這支影片的開頭改成這種感覺」。
   - 如果已經知道編號，也可以直接說：「用 #012 和 #045」。

不要修改既有的設定檔或其他技能。

### AI 會做什麼

- 你要它打開資料庫時，它會在瀏覽器打開圖庫，然後等你選好並按下「交給 AI」（最多等 15 分鐘）。
- 它會先弄清楚你的專案是怎麼做影片的：Canvas、Remotion、CSS、After Effects，或是寫給影片生成模型的提示詞。
- 它只使用你選的項目或你給的編號，不會自己多加。如果你還沒選，它會建議你打開圖庫；如果你請它幫忙挑，它會針對每個場景搜尋目錄。
- 它會在你的專案裡重現這些動態。時間、緩動（Easing）和數值都照公開的規格，文字、顏色和圖片則換成你的。
- 回覆的最後會列出它用了哪些編號、各自用在哪個場景、改了什麼，以及每個範例的連結。

### 運作方式

- 一個元素就是一個函式：`cells[i](ctx, w, h, u)`。`ctx` 是 Canvas 2D context，`w` 和 `h` 是卡片的尺寸，`u` 是一個週期內的秒數。
- 畫面只由 `u` 決定。函式在繪製時不讀取時鐘，也不使用亂數，所以即時播放和逐格輸出會得到一模一樣的畫面。
- 顏色、尺寸、週期長度和共用的輔助函式，都集中在每個包各自的 kit（共用輔助程式碼）裡。使用一個元素時，也需要它所屬包的 kit。
- 不使用任何外部函式庫。

技能由三個檔案組成：說明（`SKILL.md`）、把元素移植到各種影片專案時的注意事項（`references/porting.md`），以及查詢元素用的 Node 腳本（`scripts/motion-prompt.mjs`，只用標準函式庫）。

| 指令 | 作用 |
|---|---|
| `pick` / `pick --pack camera` | 打開圖庫，印出按「交給 AI」後送來的內容（編號、名稱、規格和你的備註），語言和你在圖庫瀏覽時用的一樣。最多等 15 分鐘 |
| `search 打字 文字` / `search 轉場` / `search typewriter` | 找出適合某個場景的元素（中文、日文或英文關鍵字都可以） |
| `list` / `list --pack motion` | 列出所有包的概覽，或逐一列出某個包的元素 |
| `get 12 #045` | 依序印出這些編號的規格和程式碼（一次最多 8 個） |
| `kit motion` | 某個包的共用程式碼 |
| `prompt 12` | 某個元素可以直接複製貼上的提示詞 |
| `info` | 顯示資料從哪裡來、有多少，以及快取存在哪裡 |

名稱和說明文字的語言可以用 `--lang zh-Hant|ja|en` 指定，預設是 `zh-Hant`（也接受 `zh` 或 `zh-TW`）。

如果技能是從完整的儲存庫副本執行（例如以 Claude Code 外掛安裝，或是從 git clone 下來的資料夾執行），`pick` 會自己在 127.0.0.1 提供圖庫，不需要線上的網站；加上 `--remote` 則強制使用線上圖庫 https://ttmoon1030.github.io/motion-prompt/。其他情況下，`pick` 會打開 https://ttmoon1030.github.io/motion-prompt/。

這個腳本只會用 GET 取得下列的文字檔，不做其他事，也不會上傳你專案裡的任何東西。`pick` 還會在你自己的電腦（127.0.0.1）上開一個暫時的接收端，只接收圖庫「交給 AI」送來的編號和備註。

1. `https://ttmoon1030.github.io/motion-prompt/api/v1/`
2. 連不到上面那個時：`https://raw.githubusercontent.com/TTMoon1030/motion-prompt/main/api/v1/`

| 檔案 | 內容 |
|---|---|
| `catalog.json` | 版本、數量、各個包，以及每個元素的名稱、一句話說明、摘要、規格和標籤 |
| `{zh-Hant,ja,en}/catalog.tsv` | 以 Tab 分隔的索引（id、pack、category、title、tags、summary） |
| `{zh-Hant,ja,en}/e/{id}.txt` | 單一元素：授權標示行、它呈現什麼、規格，接著是程式碼 |
| `{zh-Hant,ja,en}/p/{id}.txt` | 單一元素可以直接複製貼上的提示詞 |
| `kit/{pack}.js` | 某個包的共用程式碼 |

如果你 clone 了整個儲存庫，CLI 會優先讀取本機的 `api/v1`，不需要網路。下載過的資料會存在磁碟上，連不到資料來源時，就使用存下來的副本。

| 環境變數 | 說明與預設值 |
|---|---|
| `MOTION_PROMPT_BASE` | 改從這裡讀取，而不是預設的資料來源：本機資料夾或網址，多個時用逗號分隔 |
| `MOTION_PROMPT_CACHE` | 下載資料的存放位置；預設是 `~/.cache/motion-prompt`，家目錄無法寫入時改用系統的暫存資料夾 |
| `MOTION_PROMPT_TTL` | 存下來的目錄可以信任多久（秒）；預設是 `21600`（6 小時） |

### 在自己的電腦上執行圖庫

```sh
git clone https://github.com/TTMoon1030/motion-prompt.git motion-prompt
cd motion-prompt
python3 -m http.server 8000
```

打開 `http://localhost:8000/` 就能看到圖庫（`index.html`）。在 clone 下來的儲存庫裡執行 `node skills/motion-prompt/scripts/motion-prompt.mjs pick`，會直接用本機的圖庫來挑選（加上 `--remote` 則改用 https://ttmoon1030.github.io/motion-prompt/）。檔案格式的說明請看 [FORMAT.md](FORMAT.md)。

## 授權

[MIT](LICENSE) © 2026 Shohei Ohtaki

程式碼、影片和圖片都可以用於商業用途。使用元素的程式碼時，請保留它的第一行（`// Motion Prompt #ID · MIT License (c) 2026 Shohei Ohtaki · …`）。

如果想申請移除或更正內容，請使用[移除或更正表單](https://github.com/showheyohtaki/motion-prompt/issues/new?template=3-removal.yml)。確認請求之後，我們會盡快處理。

## 致謝

把會動的範例圖庫和 AI 代理的技能搭配在一起，這個點子來自 [Lucian UX/UI Prompt](https://lucianlabs.dev/uxui-prompt/)。CLI 的指令設計和靜態資料檔案的配置也參考了該專案；詳見 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)。

## 作者

大滝昇平 Shohei Ohtaki（株式會社デイトラ） / X [@showheyohtaki](https://x.com/showheyohtaki)
