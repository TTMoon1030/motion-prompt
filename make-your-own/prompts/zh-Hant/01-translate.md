# 提示詞 1：做出另一種語言的版本

把這份提示詞貼給能讀取這個儲存庫、會寫程式的 AI（Claude Code、Codex、Cursor 等）使用。請替換 `<LANGUAGE>` 和 `<lang>`（例如 `繁體中文` 和 `zh-Hant`）。

```
請閱讀這個儲存庫裡的 make-your-own/README.zh-Hant.md 和 make-your-own/examples/camera-moves/en/index.html。

目標：做出 3 支運鏡影片的 <LANGUAGE> 版。

1. 把 make-your-own/examples/camera-moves/en/index.html 複製到
   make-your-own/examples/camera-moves/<lang>/index.html。
2. 只翻譯畫面上會出現的文字：
   - PAGES（頁面標題）和 ITEMS（名稱與一句話說明）
   - drawPage() 裡的標題文字
   - 卡片裡的小標籤（搜尋 "Quiet"、"LOUD"、"Audio"、"Video"）
   "REC"、"24mm"、"1.7m/s" 這類儀表風格的顯示不要翻譯。
3. 不要改動版面、顏色、時間，以及 CELLS 裡的任何繪圖程式碼。
4. 24 個名稱都要用 <LANGUAGE> 影視業界的人實際在用的說法。每一個都要確認
   （可以上網搜尋的話就查一下）。很多語言對其中一些名稱會直接沿用英文，例如 "Dolly zoom"
   或 "J-cut"。這種情況就保留英文。不要自己造出直譯的新詞。把沒把握的名稱全部列出來。
5. 如果 <LANGUAGE> 需要其他字型（中日韓文字、阿拉伯文、泰文……），把字型常數
   （JP / EN / MONO）改成這台電腦上已安裝的字型，並告訴我用了哪一個。
   如果是由右往左書寫的語言，請在修改版面之前先告訴我。
6. 確認文字放得下。名稱必須在卡片裡保持一行（卡片寬度是 539px）。太長的話，先找比較短、
   而且大家也通用的說法；縮小字級是最後的手段，而且要 24 個名稱一起縮小。
7. 輸出並檢查：
     cd make-your-own && node render.mjs examples/camera-moves/<lang>/index.html --all --sheet
   自己打開 out/ 裡的 3 張影格總覽圖來看：文字沒有被切掉、沒有重疊、沒有缺字（空白方框）。
8. 回報：24 個名稱的對照表（英文 -> <LANGUAGE>）、沒把握的名稱，以及使用的字型。
```

要做繁體中文版的話，包 `camera` 的[繁體中文名稱一覽](../../../packs/camera/README.zh-Hant.md)收錄的就是這 24 個名稱，可以拿來對照。

同樣的步驟也適用於 Motion Graphics 的範例（`make-your-own/examples/motion-graphics/ja/index.html`，日文）：畫面上的文字在 `SERIES`、`PAGES` 和 `ITEMS` 裡，另外還有卡片裡的幾個範例用字。

如果也要把翻譯好的名稱加進 `packs/` 的一覽，請看 [CONTRIBUTING.zh-Hant.md](../../../CONTRIBUTING.zh-Hant.md)。
