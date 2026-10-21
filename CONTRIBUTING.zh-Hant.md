# 參與貢獻：加入你所在領域的名稱

**繁體中文** | [English](CONTRIBUTING.md) | [日本語](CONTRIBUTING.ja.md)

這個儲存庫是一個「名稱」的資料庫：收集各個領域的人，用來稱呼那些可以請 AI 做出來的東西的說法。一開始收錄的是在 X 上發表過的其中兩組——Motion Graphics 和運鏡，之後又陸續加入了 UI 元件名稱、Landing Page 與網站效果，以及攝影風格。**請用你自己的語言，加入你所在領域的共通語言。**

影像以外的領域也非常歡迎：燈光、聲音、UI 與互動、攝影、字體排印、插畫、料理、建築、時尚、音樂、舞蹈、遊戲。如果某個領域的人彼此會說「這裡用 ___」，而外行人聽不懂這個詞，那這個詞就屬於這裡。

你不必自己寫程式。用 [`make-your-own/prompts/zh-Hant/`](make-your-own/prompts/zh-Hant/) 裡的提示詞，就能讓寫程式的 AI（Claude Code、Codex、Cursor 等）完成大部分的製作。只有你才能提供的，是「哪些名稱真的有人在用」這份知識。

## 三種參與方式

| 參與方式 | 內容 | 怎麼送出 | 放在哪裡 |
|---|---|---|---|
| 名稱包 | 你所在領域的名稱和會動的範例，或替現有的包加上另一種語言 | Pull request（想先討論的話，請用[提議名稱或包](https://github.com/TTMoon1030/motion-prompt/issues/new?template=1-contribution.yml)） | `packs/<pack>/` |
| 你找到的案例 | 在 X 上把名稱配上範例公開分享的貼文（自己的貼文也歡迎） | [推薦案例](https://github.com/TTMoon1030/motion-prompt/issues/new?template=2-example.yml) | `examples/found.json` 和[案例頁面](https://ttmoon1030.github.io/motion-prompt/found.html) |
| 投稿 | 你用 make-your-own 做出來的自製作品（影片、HTML、速查表圖片），或對某個名稱的修正 | Pull request 或[提議名稱或包](https://github.com/TTMoon1030/motion-prompt/issues/new?template=1-contribution.yml) | `make-your-own/examples/<slug>/<lang>/` 等 |

「自製作品」是你自己用 make-your-own 做的東西；「找到的案例」則是別人在 X 上的貼文。

### 案例的收錄方式

- 別人的貼文只會以 X 官方的嵌入、連結，以及我們寫的一句介紹來呈現。圖片、影片、螢幕截圖和貼文內文，都不會複製到這個儲存庫或網站上。
- `examples/found.json` 只記錄貼文 ID（`id`）、作者（`author`）、`url`、主題（`theme`）、一句介紹（`intro`，繁體中文、日文與英文）、貼文的語言（`lang`）和加入的日期（`added`）。不保存貼文內文，也不保存按讚數之類的數字。
- 介紹是用我們自己的話寫成的一句話。不照抄貼文，也不會寫得像是作者在推薦這個網站。
- 我們收錄的是附有作者親手製作範例的貼文（附名稱的會動範例、速查表等）。未標明出處就使用他人作品的貼文、只是引用其他貼文的貼文、以宣傳付費課程或商品為主的貼文，以及企業廣告，都不收錄。
- 案例頁面不放任何課程或服務的廣告。
- 移除或更正的請求，請透過 [issue 表單](https://github.com/showheyohtaki/motion-prompt/issues/new?template=3-removal.yml)提出，確認之後我們會盡快處理。

### 只收能以 MIT 授權釋出的內容

這個儲存庫裡的所有內容都以 MIT 授權條款（MIT License）釋出。無法這樣釋出的素材（他人的作品、不能再散布的字型、未經許可的照片），我們不收。如果你不希望作品採用 MIT 授權，請發表在你自己的網站或 X 上，再推薦為案例；我們會用嵌入和連結來介紹。

## 可以加入的內容

| | 內容 | 放在哪裡 |
|---|---|---|
| 語言 | 用另一種語言寫出現有包的名稱 | `packs/<pack>/meta.json` |
| 包 | 新領域（或同一個領域的另一部分）的名稱，加上會動的範例 | `packs/<pack>/` |
| 「自己做」的範例 | 你做的影片、HTML 原始碼和速查表圖片 | `make-your-own/examples/<slug>/<lang>/` |
| 修正 | 錯誤、不清楚，或是在該語言裡其實沒人這樣說的名稱 | issue 或 pull request |

小小的 pull request 也沒關係。替一個包加上一種語言，就是一份完整的貢獻。

## 名稱需要符合的條件

1. **真的有人在用。** 該領域的從業者會說、會寫這個詞。把它打進 AI 的提示詞或搜尋框，就能得到正確的東西。
2. **不是自創的，也不是直譯。** 如果你的語言直接沿用英文（很多語言對 "J-cut" 或 "Easing" 都是如此），就寫英文。如果兩種說法都很常見，請選比較常見的那個，另一個寫在 pull request 裡。
3. **說得出你在哪裡確認過。** 教科書、軟體手冊、業界詞彙表、知名的教學，或你自己在該領域多年的經驗都可以。請把出處寫在 pull request 的說明裡，每個名稱一行就夠了。對某個名稱沒把握的話，請直接說出來；這對審查的人很有幫助。
4. **有一句話說明**，用淺白的話寫成（`meaning`），**以及一個用這個名稱請 AI 製作的例句**（`ask`），例句裡要包含時間長度、程度或對象。
5. **可以安心使用。** 不要把品牌名稱或商標當成技法的名稱，除非業界本身就把那個詞當成一般用語。

## 範例需要符合的條件

範例是顯示在名稱旁邊的小動畫。外觀由你決定：顏色、字型和畫法都不必和現有的包一致，包與包之間風格不同是好事。不過無論外觀如何，下列幾點都必須做到：

- **蓋住標籤也看得出來。** 懂這個領域的人光看範例，就能說出它是哪個名稱。要呈現那件事實際發生的樣子，而不是畫一個代表它的圖示。一個範例只表達一件事。
- **在手機上看得清楚。** 對比要足夠，重要的部分不要畫得太小。
- **不閃爍。** 不要讓大面積在亮暗之間快速切換。
- **無縫循環。** 最後一格要能接回第一格。
- **只依時間繪製。** 同一個時間點一定畫出同樣的畫面：不用時鐘、不用沒有固定種子的亂數，也不在影格之間保留狀態。
- **不從網路載入，也不使用別人的東西。** 不用網頁字型、圖片、Logo、角色或照片。只有在授權明確允許再散布時，才可以附上字型檔，並把授權條款的全文放在旁邊。

## 替現有的包加上一種語言

`packs/<pack>/meta.json` 裡的每個文字欄位，都是以語言代碼為鍵的物件，例如 `"name": { "ja": "パン", "en": "Pan", "zh-Hant": "橫搖" }`。

1. 把你的語言代碼（`es`、`ko`、`zh-Hans`、`fr`……）加到 `title`、`categories` 的每個項目，以及每個元素的 `name`、`meaning` 和 `ask`。
2. 選擇性：也可以加到 `summary`、`use` 和 `spec`。沒有加的地方會顯示英文。
3. 執行 `node tools/build.mjs`。它會檢查檔案，產生一份在 GitHub 上就能閱讀的一覽 `packs/<pack>/README.<lang>.md`，並從其他語言的一覽連結過去。
4. 開一個 pull request，附上 `meta.json` 和產生的檔案，並說明你在哪裡確認過這些名稱。

第 1 到第 3 步可以請寫程式的 AI 來做（「依照 CONTRIBUTING.zh-Hant.md，在 packs/camera/meta.json 加入西班牙文；把所有你沒把握的名稱列出來」）。之後再由你親自檢查名稱；這部分才是真正的貢獻。

圖庫網站和技能的指令列工具，目前提供繁體中文、日本語和 English。你加入的其他語言會出現在 `packs/` 底下的一覽，以及 `api/v1/catalog.json` 裡。詳細內容請看 [FORMAT.md](FORMAT.md)。

如果也想用你的語言做出影片，請使用 [`make-your-own/prompts/zh-Hant/01-translate.md`](make-your-own/prompts/zh-Hant/01-translate.md)。

## 替你的領域新增一個包

1. **先決定名稱。** 把 [`make-your-own/prompts/zh-Hant/02-your-own-field.md`](make-your-own/prompts/zh-Hant/02-your-own-field.md) 貼給寫程式的 AI。它的第一步會產出名稱清單，並註明每個名稱在哪裡確認過。請修改這份清單，直到你願意拿給同行看為止。一個包通常是 16 到 24 個名稱，分成 2 到 3 組。
2. **用同一份提示詞製作範例。** 你會得到一個 HTML 頁面，以及可以發到任何地方的影片。光是這些，就可以放進 `make-your-own/examples/<slug>/<lang>/`。
3. **把它變成圖庫用的包。** 請寫程式的 AI 這樣做：
   ```text
   請閱讀 FORMAT.md 和 packs/motion/。把 make-your-own/examples/<slug>/<lang>/index.html 轉成
   packs/<pack>/ 裡的一個新包：pack.js 裡每張卡片對應一個 @element 區塊；meta.json 裡用英文和
   <LANGUAGE> 寫 name、meaning、ask、summary、spec、use 和 tags。spec 裡的每個數字都要從程式碼取得。
   "order" 使用下一個還沒用過的號碼。接著執行 node tools/build.mjs 和 node tools/check.mjs，並修正它們回報的問題。
   ```
4. **檢查。** `node tools/build.mjs` 必須跑完且沒有錯誤。`node tools/check.mjs` 會在瀏覽器裡畫出每個範例，回報例外、空白影格和循環的接縫（需要 Playwright；說明在檔案開頭）。把資料夾架成網站（`python3 -m http.server 8000`），在圖庫裡看看你的包。
5. **開 pull request**，寫明：領域與語言、你在哪裡確認過名稱、你沒把握的名稱，以及使用的字型。

每個包都必須有英文，因為英文是各個包共通的語言。只是草稿也沒關係：把你對英文說法沒把握的名稱標出來，審查的人會幫忙。最重要的，還是你自己的語言。

編號依包的順序分配。已公開的編號絕不會重複使用或更改，已公開的名稱也不會改名。新的包會接在現有的編號之後。

## 授權

這裡的所有內容都採用 [MIT 授權條款](LICENSE)。開 pull request，即表示你同意你的貢獻以此授權釋出。請只提供你有權利提供的作品。

Pull request 和投稿用的 issue 會請你確認四件事（範本裡都有）：

- 是你自己做的（或是權利人允許你公開，而且你已說明這項許可）。
- 不包含任何他人的圖片、影片、字型、Logo 或人物（或是你已說明相關許可）。
- 你同意以 MIT 授權條款釋出。
- 你了解作品公開之後，授權就無法撤回。

如果素材也出現在你自己的 X 貼文裡，請附上那則貼文的網址。我們會用它來確認作品是你本人的。
