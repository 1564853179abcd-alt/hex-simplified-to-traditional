import { defineHexConfig } from "@hex/commands"
import { convert } from "./s2t.ts"

// 本機簡體轉繁體（台灣正體）。不連網、不呼叫外部服務。
//
// 安裝：把 s2t.ts 與本檔案放進 Hex 的設定資料夾
//   macOS / Linux：~/.config/hex/
//   Windows：%USERPROFILE%\.config\hex\
// 再到 Hex「輸出」頁把「簡體轉繁體」加入步驟即可。
export default defineHexConfig({
  transformations: {
    "simplified-to-traditional": {
      name: "簡體轉繁體",
      description: "將簡體中文聽寫結果轉成台灣正體中文。",
      transform: (text) => convert(text),
    },
  },
})
