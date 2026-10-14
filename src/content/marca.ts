// Símbolo da marca (a "minhoquinha" do favicon da loja), vetorizado do favicon oficial da Shopify.
// Usado no logo do app e nos ícones da tela inicial (scripts/icones.ts).

export const MARCA_PATH =
  "M156.5 215.1C132.9 218.5 110.6 231.3 87.8 254.6C68.6 274.3 64.4 281.2 65.2 291.6C66.4 306 78.3 316.1 92.6 314.6C100.1 313.9 105.5 310.4 112.7 301.7C149.5 257.2 175.8 253.8 213 288.4C266.2 338.1 318.2 338 369.2 288.1L378.9 278.6L387.4 282.8C394.5 286.3 396.6 288 400.5 293C413.9 310.4 437.8 308.3 445 289.1C453.1 267.8 430.3 243.4 389.8 229.8C366.5 222 359.7 223.3 347.6 237.9C315.9 275.9 291.4 284 263.5 265.5C260.6 263.5 253 257.1 246.8 251.3C214.4 221.3 187.7 210.5 156.5 215.1Z"

/** Caixa do traço dentro do desenho original de 512. */
export const MARCA_CAIXA = { x: 64, y: 212, largura: 390, altura: 116 }

export const COR = { floresta: "#153c2c", lima: "#C0DE96" }

/** SVG quadrado do ícone: símbolo centralizado ocupando `escala` da largura. */
export function svgDoIcone(escala: number) {
  const { x, y, largura, altura } = MARCA_CAIXA
  const k = (512 * escala) / largura
  const cx = x + largura / 2
  const cy = y + altura / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="${COR.floresta}"/><path fill="${COR.lima}" transform="translate(256 256) scale(${k.toFixed(4)}) translate(${-cx} ${-cy})" d="${MARCA_PATH}"/></svg>`
}
