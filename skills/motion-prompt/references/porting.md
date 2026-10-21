# 移植 Motion Prompt 元素

`get <id>` 會為每個元素回傳一個文字檔：

```js
// Motion Prompt #012 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#012
// name, what it shows, spec lines, when to use it, size, cycle, "Needs: kit <pack>", live demo URL
// @element 12
CELLS[11] = (k, w, h, u) => { … };     // k = CanvasRenderingContext2D, w/h = card size, u = seconds in [0, cycle)
```

`kit <pack>` 會回傳元素所依賴的程式碼：卡片尺寸、一輪的長度、調色盤物件 `C`、字型堆疊（font stack），以及各種輔助函式（緩動（easing）、文字、形狀）。kit 本身的標頭會示範如何單獨執行一個元素。請先讀它；它是這個包（pack）預期被如何呼叫的參考依據。

移植之前，先讀元素的**規格**行。規格行寫明動態的先後順序，以及每一個關鍵數值。程式碼才是唯一的依據；規格是以文字寫出的同一份資訊。

先判斷這次移植屬於下列兩種中的哪一種：

- **直接執行程式碼**（第 1、2 節）：專案能在 Canvas 2D context 上繪圖。元素的函式原封不動地執行，你只需提供 `u`、尺寸和位置。
- **搬移數值**（第 3、4 節）：專案用其他方式製作動畫。你要在那邊重建這個動作，並沿用原本的時間點、緩動與變化量。

## 時間：循環，或只播放一次

每個元素都寫成長度為 `cycle` 秒的循環。大多數元素包含進場、停留，以及退場或重設，讓循環能接回起點。

- **循環使用**（背景、指示器、圖庫）：`u = t % cycle`，其中 `t` 是場景開始後經過的時間。
- **播放一次後停住**（進場後就一直留在畫面上的標題或字幕）：`u = Math.min(t, uHold)`，其中 `uHold` 是停留期間內、進場已結束之後的某個時間點。可從規格行或程式碼中的階段分界找出它。不要讓 `u` 繼續跑進退場。
- **播放一次並退場**：讓 `u` 走完進場，在場景需要的時間內維持在 `uHold`，等場景結束時再從退場的起點繼續往下走。這樣不論場景多長，進場與退場都能維持設計好的速度。
- **配合固定的時段**（替換既有場景中的某一段）：拉長或縮短的是停留，而不是動態本身。只有當時段比進場加退場還短時，才均勻縮放時間（`u = t * k`），並在報告中說明。
- 絕對不要傳入 `[0, cycle)` 範圍以外的 `u`。場景要從能得到乾淨第一個影格的 `u` 開始；通常是 `0`，但請檢查該元素。

## 1. 一般的 Canvas 引擎（以時間為參數、繪製一個影格的函式）

每個包只需在同一個作用域（scope）中設定一次程式碼：

1. kit（保留它的第一行），
2. 你取得的各個元素區塊（每個都保留第一行），
3. 對你要用的 cell 的參照，例如 `const morph = CELLS[11];`。

如果專案是模組，就把這些放進同一個檔案，並匯出這些 cell。不要把輔助函式複製到每個元素裡；它們共用 kit。

**兩個包絕不共用同一個作用域。** 每個 kit 都會宣告相同的頂層名稱（`CW`、`CH`、`CYC`、`C`、`CELLS` 以及它自己的輔助函式），所以把兩個 kit 貼進同一個 script 或模組會造成語法錯誤。請讓每個包各自擁有自己的模組或函式作用域，並把需要的東西以能看出來自哪個包的名稱匯出：

```js
// motion-prompt-motion.js      (kit "motion" + elements #012 …)
export const morph = CELLS[11];  export const MOTION = { w: CW, h: CH, cycle: CYC };
// motion-prompt-camera.js      (kit "camera" + elements #045 …)
export const wipe = CELLS[20];   export const CAMERA = { w: CW, h: CH, cycle: 9.4 };  // use the Cycle value in the element header; in this kit CYC is half of it
```

不同的包可能有不同的卡片尺寸與一輪長度，所以務必傳給每個 cell 它所屬包的尺寸與一輪長度。

**把卡片放進 1920×1080 的影格。** 元素以卡片座標繪製（標頭中的 `w` × `h`）。要縮放的是 context，不是數值：

```js
function drawElement(ctx, cell, u, x, y, scale, W, H) {   // W, H = the card size from the header
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();        // elements may draw past their card
  cell(ctx, W, H, u);
  ctx.restore();
}
// full width of a 1920 frame, centered vertically:
const s = 1920 / W;  drawElement(ctx, typewriter, u, 0, (1080 - H * s) / 2, s, W, H);
```

- 一律傳入卡片本身的 `w, h`。傳入 `1920, 1080` 會改變版面配置，因為元素內的尺寸是針對卡片寫的。
- 卡片的長寬比不是 16:9。你可以把卡片當成版面中的一條橫帶或一個面板來放置，或把它縮放到填滿影格並接受裁切。請確認重要的部分仍留在畫面內。
- 許多元素會自己繪製卡片背景，通常是透過在元素第一行呼叫的 kit 輔助函式。若要把元素疊在實拍素材或其他圖層上，找出那個呼叫或填色，將它移除或替換，並在報告中說明這項變更。
- 文字清晰度：縮放 context 會讓文字和形狀維持向量，因此不需要額外步驟。請在像素尺寸等於最終影格尺寸的 canvas 上繪製。

**同一個影格中有多個元素。** 依由後到前的順序呼叫，每個都像上面那樣包在各自的 `save()`/`restore()` 之中，並各自依自己的起始時間算出自己的 `u`：`u = sceneClock(t - start)`。如果你的引擎不會自動處理，請在 cell 之間重設 `globalAlpha`、`filter` 和 `globalCompositeOperation`。

**使用離屏 canvas 的元素。** 有些元素會用 `document.createElement('canvas')` 建立 canvas，用來做遮罩、模糊或合成。

- 在瀏覽器中，照原樣就能運作。
- 在 Node（node-canvas、skia-canvas、@napi-rs/canvas）中沒有 `document`。請在 kit 執行之前，提供它們需要的那一個呼叫，例如 `globalThis.document = { createElement: () => createCanvas(1, 1) }`，並使用你所用函式庫的 `createCanvas`。
- 離屏 canvas 的尺寸以卡片像素計算。卡片被大幅放大時，其內容也會被放大而變得模糊。如果看得出來，就在離屏 canvas 內同樣套用縮放，以更大的卡片倍率渲染該元素，並拿一個影格與示範（demo）比對。
- 並非每個 canvas 函式庫都支援 `ctx.filter`。如果元素用到它，請及早測試一個影格。

**字型。** kit 使用系統字型堆疊。缺少這些字型的渲染器會默默改用替代字型，導致版面跑掉。請註冊專案的字型並修改 kit 中的字型常數，或確認該字型堆疊在負責渲染的機器上能正確解析。如果包有宣告字型檔，請在繪製第一個影格之前載入它們。

## 2. Remotion

依目前的影格在 `<canvas>` 上繪製。元素維持為純函式，因此每個影格在預覽與匯出時都會以相同方式渲染。

```tsx
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useEffect, useRef } from 'react';
import { typewriter, CARD_W, CARD_H, CYCLE } from './motion-prompt-motion';   // one module per pack: kit + its elements, license lines kept

export const Typewriter: React.FC<{ hold?: number }> = ({ hold }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);
  const t = frame / fps;
  const u = hold === undefined ? t % CYCLE : Math.min(t, hold);   // loop, or play once and stay
  useEffect(() => {
    const ctx = ref.current!.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, CARD_W, CARD_H);
    ctx.save();
    typewriter(ctx, CARD_W, CARD_H, u);
    ctx.restore();
  }, [u]);
  return <canvas ref={ref} width={CARD_W} height={CARD_H} style={{ width: '100%' }} />;
};
```

- 在 `<Sequence>` 之內，`useCurrentFrame()` 從 0 開始，所以 `t` 本身就是該場景自己的時間。
- 若要得到清晰的結果，請讓 canvas 的像素尺寸等於它在螢幕上的尺寸：把 `width`/`height` 設為卡片尺寸乘上你的縮放倍率，並在呼叫 cell 之前呼叫 `ctx.scale(scale, scale)`。
- 不要使用 `requestAnimationFrame`、`Date.now()` 或 `performance.now()`。時間只能來自影格。
- 如果包會載入字型檔，請用 `delayRender()` / `continueRender()` 等待它們載入完成。

## 3. 把數值搬到 CSS、SVG、Lottie 或 After Effects

這裡不執行程式碼。你要用目標格式本身的工具重建這個動作，並照抄它的數值。

1. 根據程式碼和規格，為每個有動畫的屬性寫一張小表：開始時間、結束時間、起始值、結束值、緩動。每個數字都取自原始來源。距離要用與卡片相同的換算係數轉換（例如 `1920 / W`）；角度、縮放倍率與持續時間則原樣沿用。
2. 對應緩動。找出 kit 中的緩動輔助函式並轉換它：
   - cubic-bezier → CSS 中的 `cubic-bezier(a, b, c, d)`、SVG 中的 `keySplines`，在 Lottie 與 After Effects 的關鍵影格中則是以同樣四個數字作為貝茲曲線把手；
   - 冪次（power）或指數（exponential）緩動 → 最接近的標準貝茲曲線；並說明你選了哪一條；
   - 彈簧（spring）或過衝（overshoot）→ 在峰值點與收斂點設置關鍵影格，使用元素本身的數值（例如縮放 `0 → 1.12 → 1.0`，時間點依規格所述）。CSS 的 `linear()` 緩動或取樣後的關鍵影格也可以。不要用單純的 ease-out 取代。
3. 用目標格式的基本圖形和元素的比例重建形狀。
4. 錯開（stagger）：保留每個項目的延遲時間與先後順序。

各目標格式的注意事項：

- **CSS**：每組屬性一個 `@keyframes`，`animation-duration` 等於一輪的長度（若只播放一次，則等於進場的長度，並搭配 `animation-fill-mode: both`）。百分比為 `time / duration`。
- **SVG**：筆畫描繪對應 `stroke-dasharray`/`stroke-dashoffset`；遮罩對應 `clipPath` 或 `mask`。
- **Lottie**：關鍵影格的時間以影格計算，即 `time * fps`。維持專案的影格率。
- **After Effects**：以上述數值設定關鍵影格，或在屬性上寫運算式（expression），把 `time - inPoint` 當作 `u`。運算式就是 JavaScript，所以可以把 kit 中的緩動函式貼進運算式，套用到相同的數值上。在腳本檔中以註解加上授權行；若數值是直接輸入到關鍵影格中，則在圖層或合成（comp）的註解中寫上元素名稱。

逐像素的效果（模糊、光暈、顆粒、以離屏 canvas 合成）常常沒有直接對應的功能。請使用目標格式中最接近的效果，與示範比對，並在報告中說明差異。

## 4. 給影片生成模型的提示詞

寫句子，不要寫程式碼。使用元素的英文名稱和規格：

- 畫面上有什麼、什麼在動，
- 動態的先後順序，以及每個部分以秒計的長度，
- 緩動方式（一開始快、然後慢慢停下；稍微過衝再回來；等速），
- 最後停在哪裡、停留多久，
- 鏡頭類元素：鏡頭的運動、方向、速度，以及開始與結束時的構圖。

接著加上使用者的主體、視覺風格、長寬比與片段長度。每個鏡頭只放一個動作；這類模型處理單一明確的動作，比處理一連串動作好。畫面上的文字要寫出確切的字句，並預期需要檢查，因為生成的文字常常有錯。在報告中把成果描述為「based on #ID」（以 #ID 為基礎），而不是「移植」。

## 顏色

元素的顏色取自 kit 中的調色盤物件 `C`。請閱讀 kit，了解哪個鍵扮演哪個角色（背景、文字、強調色）；各個包的鍵名都不一樣。要換配色時，只需在 `C` 中改一次數值。除非某個元素自行定義了顏色，否則不要修改元素內的顏色常值。保持原本的對比關係：原本在深色底上的淺色文字要維持易讀，每個強調色也要維持原本的角色。如果專案有品牌色，就把它們對應到調色盤的角色，並在報告中列出對應關係。

## 內容

元素裡的文字、數字和名稱都是範例內容。請替換成使用者的內容。文字是依範例的長度來測量與排版的，所以較長的替換內容要檢查：寧可縮小字級常數或拆成多行，也不要讓文字超出卡片。相同字級下，日文（以及中文）與拉丁文字的寬度不同；如果影片是雙語的，兩種都要檢查。

## 授權行

在由元素製作出來的程式碼上方，保留每個元素的第一行 `// Motion Prompt #ID · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#ID`，並在 kit 上方保留 kit 的第一行。若只沿用了數值（第 3 節），則在目標格式允許註解的地方，以註解放入同一行。

## 回報前的檢查

- 每個移植場景的第一個影格、動態進行中的一個影格，以及靜止時的影格；能看到示範時，與示範比對
- 循環的接點（如果元素會循環）：最後一個影格與第一個影格一致
- 場景邊界：場景開始或結束時，沒有東西突然出現或消失
- 替換後的文字放得下，而且渲染機器上用的是預期的字型
- 輸出的影格尺寸與影格率是專案的，而不是卡片的
