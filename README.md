# Hex 簡體轉繁體（hex-simplified-to-traditional）

把 [Hex](https://anoma.ly/hex) 的語音聽寫結果，從**簡體中文自動轉成繁體中文（台灣正體）**的自訂轉換（transformation）外掛。

- 純本機、離線運作，不會把聽寫內容傳到任何網路服務。
- 內嵌 [OpenCC](https://github.com/BYVoid/OpenCC) 的簡→繁字詞庫（53,000+ 筆），不需要安裝 Node、npm 或任何套件即可使用。
- 適用 Hex 3.4.0（無內建簡轉繁開關，這個外掛補上這個功能）。

---

Convert Hex dictation output from **Simplified Chinese to Traditional Chinese (Taiwan)** — a self-contained Hex transformation.

- Fully local and offline; dictated text never leaves your machine.
- Bundles the [OpenCC](https://github.com/BYVoid/OpenCC) Simplified→Traditional dictionary (53,000+ entries). No Node/npm/runtime dependencies.
- For Hex 3.4.0, which has no built-in Simplified→Traditional toggle.

## 效果示例 / Example

| 簡體（聽寫原稿） | 繁體（轉換後） |
| --- | --- |
| 汉语 | 漢語 |
| 鼠标和数据库 | 鼠標和數據庫 |
| 头发发展干净干部干杯 | 頭髮發展乾淨幹部乾杯 |
| 我今天用电脑写了一个软件程序 | 我今天用電腦寫了一個軟件程序 |

## 安裝 / Install

1. 找出 Hex 的設定資料夾（若尚未建立，可在終端機執行 `hex commands init` 產生）：

   - **macOS / Linux**：`~/.config/hex/`
   - **Windows**：`%USERPROFILE%\.config\hex\`

2. 把本專案的兩個檔案放進去：

   - `s2t.ts` — 轉換器與字詞庫（自帶資料，無外部依賴）
   - `hex.config.ts` — 註冊「簡體轉繁體」轉換的設定檔

   > 若你已經有自己的 `hex.config.ts`，不要覆蓋它。改成把下面這段加進你現有的檔案即可：
   >
   > ```ts
   > import { convert } from "./s2t.ts"
   > // ...在你的 defineHexConfig({ ... }) 內加入：
   > transformations: {
   >   "simplified-to-traditional": {
   >     name: "簡體轉繁體",
   >     description: "將簡體中文聽寫結果轉成台灣正體中文。",
   >     transform: (text) => convert(text),
   >   },
   > },
   > ```

3. 在 Hex 的**輸出（Output）**頁，把「簡體轉繁體」加入步驟；或在終端機設定全域模式：

   ```sh
   hex settings set dictation_processing.default_mode '{"name":"Global","applications":[],"browser_hosts":[],"replacements":[],"transformations":["simplified-to-traditional"],"post_processing":{"enabled":false}}'
   ```

4. 完成。之後每次聽寫，簡體結果都會自動轉成繁體再貼上。

## 驗證 / Verify

```sh
hex commands check
# 應輸出：…hex.config.ts: 1 transformation
```

然後用平常方式聽寫一句話，確認貼上的結果是繁體。

## 檔案說明 / Files

| 檔案 | 用途 |
| --- | --- |
| `s2t.ts` | 轉換器本體＋內嵌 OpenCC 簡→繁字詞庫（自帶資料） |
| `hex.config.ts` | Hex 設定範例，註冊「簡體轉繁體」轉換 |
| `regenerate.mjs` | 從 opencc-js 重新產生 `s2t.ts`（僅維護者需要） |

## 重新產生字詞庫 / Regenerate the dictionary

`regenerate.mjs` 僅供維護者使用。日常安裝**不需要**任何 npm 套件。

```sh
npm install opencc-js
node regenerate.mjs
```

輸出會自動控制大小，保持在 Hex 單檔 1 MiB 上限內。

## 授權 / License

- 字詞庫資料來自 [OpenCC](https://github.com/BYVoid/OpenCC)（`opencc-data`，Apache-2.0），經 [opencc-js](https://github.com/nk2028/opencc-js)（MIT）打包。
- 本專案的轉換程式碼與其餘檔案採用 Apache-2.0 授權。詳見 [LICENSE](LICENSE)。
