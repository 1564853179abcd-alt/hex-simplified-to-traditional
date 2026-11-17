// Regenerates s2t.ts from the opencc-js package (OpenCC dictionary data).
//
// This file is for maintainers only. The shipped s2t.ts is self-contained and
// needs no npm packages at runtime. To rebuild the dictionary (for example,
// after an OpenCC data update):
//
//     npm install opencc-js
//     node regenerate.mjs
//
// The output keeps only BMP (U+FFFF and below) entries, because Hex dictation
// never produces supplementary-plane characters, and stores the data in a
// compact "from to|from to" string so the file stays under Hex's 1 MiB
// per-imported-file limit.

import OpenCC from "opencc-js";
import { writeFileSync } from "node:fs";

const L = OpenCC.Locale;

// opencc-js stores dictionary groups as either [from, to] arrays or compact
// "from to|from to" strings. Flatten either form into [from, to] pairs.
function flatten(groups) {
  const out = [];
  for (const group of groups) {
    for (const entry of group) {
      if (Array.isArray(entry)) {
        out.push([String(entry[0]), String(entry[1])]);
      } else if (typeof entry === "string") {
        for (const pair of entry.split("|")) {
          const idx = pair.indexOf(" ");
          if (idx === -1) continue;
          out.push([pair.slice(0, idx), pair.slice(idx + 1)]);
        }
      }
    }
  }
  return out;
}

const fromCN = flatten(L.from.cn);
const toTW = flatten(L.to.tw);

const isBMP = (s) => [...s].every((c) => c.codePointAt(0) <= 0xffff);
const fromCNFiltered = fromCN.filter(([a, b]) => isBMP(a) && isBMP(b));
const toTWFiltered = toTW.filter(([a, b]) => isBMP(a) && isBMP(b));

const compact = (arr) => arr.map(([a, b]) => a + " " + b).join("|");

const code =
  "// Simplified -> Traditional Chinese (Taiwan) converter for Hex.\n" +
  "//\n" +
  "// Dictionary data derived from OpenCC (opencc-data, Apache-2.0) via the\n" +
  "// opencc-js package (MIT). The converter code is part of this repository.\n" +
  "//\n" +
  "// Self-contained: no npm packages and no network access at runtime.\n" +
  "// Regenerate with: npm install opencc-js && node regenerate.mjs\n" +
  "//\n" +
  "// Two-stage longest-match conversion:\n" +
  "//   Simplified -> Traditional (standard) -> Taiwan variants.\n" +
  "const FROM_CN = " + JSON.stringify(compact(fromCNFiltered)) + ";\n" +
  "const TO_TW = " + JSON.stringify(compact(toTWFiltered)) + ";\n" +
  "\n" +
  "function buildTrie(data) {\n" +
  "  const root = Object.create(null);\n" +
  "  const pairs = data.split(\"|\");\n" +
  "  for (let k = 0; k < pairs.length; k++) {\n" +
  "    const idx = pairs[k].indexOf(\" \");\n" +
  "    if (idx === -1) continue;\n" +
  "    const from = pairs[k].slice(0, idx);\n" +
  "    const to = pairs[k].slice(idx + 1);\n" +
  "    let node = root;\n" +
  "    for (const ch of from) {\n" +
  "      if (!node[ch]) node[ch] = Object.create(null);\n" +
  "      node = node[ch];\n" +
  "    }\n" +
  "    node.v = to;\n" +
  "  }\n" +
  "  return root;\n" +
  "}\n" +
  "\n" +
  "function apply(text, trie) {\n" +
  "  const chars = Array.from(text);\n" +
  "  let out = \"\";\n" +
  "  let i = 0;\n" +
  "  const n = chars.length;\n" +
  "  while (i < n) {\n" +
  "    let node = trie;\n" +
  "    let match = null;\n" +
  "    let matchLen = 0;\n" +
  "    let j = i;\n" +
  "    while (j < n) {\n" +
  "      node = node[chars[j]];\n" +
  "      if (!node) break;\n" +
  "      j++;\n" +
  "      if (node.v !== undefined) { match = node.v; matchLen = j - i; }\n" +
  "    }\n" +
  "    if (match !== null) { out += match; i += matchLen; }\n" +
  "    else { out += chars[i]; i++; }\n" +
  "  }\n" +
  "  return out;\n" +
  "}\n" +
  "\n" +
  "const TRIE1 = buildTrie(FROM_CN);\n" +
  "const TRIE2 = buildTrie(TO_TW);\n" +
  "\n" +
  "export function convert(text) {\n" +
  "  if (!text) return text;\n" +
  "  return apply(apply(text, TRIE1), TRIE2);\n" +
  "}\n";

writeFileSync("s2t.ts", code, "utf8");
const bytes = Buffer.byteLength(code, "utf8");
console.log("Wrote s2t.ts (" + bytes + " bytes, " + fromCNFiltered.length + " + " + toTWFiltered.length + " entries)");
if (bytes > 1048576) {
  console.error("WARNING: s2t.ts exceeds Hex's 1 MiB per-file limit.");
  process.exit(1);
}
