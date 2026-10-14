// Gera os ícones da tela inicial a partir do símbolo da marca (src/content/marca.ts).
// Roda no build: os PNGs não vão para o git.
import { mkdirSync, writeFileSync } from "node:fs"
import sharp from "sharp"
import { svgDoIcone } from "../src/content/marca"

const DIR = new URL("../public/icons/", import.meta.url)
mkdirSync(DIR, { recursive: true })

// "any": símbolo a 72% da largura. "maskable": 60%, dentro da área segura do Android (círculo de 80%).
// iPhone: 66%, o iOS arredonda os cantos sozinho.
const ICONES = [
  { arquivo: "icon-192.png", tamanho: 192, escala: 0.72 },
  { arquivo: "icon-512.png", tamanho: 512, escala: 0.72 },
  { arquivo: "icon-maskable-512.png", tamanho: 512, escala: 0.6 },
  { arquivo: "apple-touch-icon.png", tamanho: 180, escala: 0.66 },
]

for (const i of ICONES) {
  const png = await sharp(Buffer.from(svgDoIcone(i.escala))).resize(i.tamanho).png().toBuffer()
  writeFileSync(new URL(i.arquivo, DIR), png)
}
writeFileSync(new URL("icon.svg", DIR), svgDoIcone(0.72))
console.log(`ícones gerados: ${ICONES.map((i) => i.arquivo).join(", ")}, icon.svg`)
