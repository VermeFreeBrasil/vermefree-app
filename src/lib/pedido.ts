// Situação do pedido a partir dos dados de envio da Shopify.
import { diffDays } from "@/lib/dates"
import type { Envio, Pedido } from "@/lib/api"

export type Chave = "preparando" | "enviado" | "transito" | "saiu" | "entregue" | "problema"

const PROBLEMAS = new Set(["ATTEMPTED_DELIVERY", "NOT_DELIVERED", "FAILURE", "CANCELED"])

/** Envio mais recente do pedido (o que tem rastreio, se houver). */
export function envioPrincipal(p: Pedido): Envio | undefined {
  const comCodigo = p.envios.filter((e) => e.rastreio.length)
  const lista = comCodigo.length ? comCodigo : p.envios
  return [...lista].sort((a, b) => (a.enviado_em < b.enviado_em ? 1 : -1))[0]
}

export function chaveDoPedido(p: Pedido): Chave {
  const e = envioPrincipal(p)
  if (!e) return "preparando"
  if (e.entregue_em || e.status === "DELIVERED") return "entregue"
  if (e.status && PROBLEMAS.has(e.status)) return "problema"
  if (e.status === "OUT_FOR_DELIVERY") return "saiu"
  if (e.em_transito_em || e.status === "IN_TRANSIT") return "transito"
  return "enviado"
}

export const TEXTO_SITUACAO: Record<Chave, { titulo: string; texto: string }> = {
  preparando: { titulo: "Separando seu pedido", texto: "O código de rastreio aparece aqui assim que o pedido for enviado." },
  enviado: { titulo: "Pedido enviado", texto: "Já está com os Correios. O rastreio começa a se mexer em breve." },
  transito: { titulo: "A caminho", texto: "Seu kit está em transporte pelos Correios." },
  saiu: { titulo: "Saiu para entrega", texto: "Deve chegar hoje. Fique de olho!" },
  entregue: { titulo: "Entregue", texto: "Seu kit chegou. Agora é só seguir o cronograma." },
  problema: { titulo: "Entrega não concluída", texto: "Os Correios não conseguiram entregar. Confira no rastreio ou fale com a gente." },
}

export type Etapa = { rotulo: string; quando: string | null; feito: boolean }

export function etapasDoPedido(p: Pedido): Etapa[] {
  const e = envioPrincipal(p)
  const chave = chaveDoPedido(p)
  const ordem: Chave[] = ["preparando", "enviado", "transito", "saiu", "entregue"]
  const nivel = chave === "problema" ? 2 : ordem.indexOf(chave)
  return [
    { rotulo: "Pedido confirmado", quando: p.criado_em, feito: true },
    { rotulo: "Enviado", quando: e?.enviado_em ?? null, feito: nivel >= 1 },
    { rotulo: "A caminho", quando: e?.em_transito_em ?? null, feito: nivel >= 2 },
    { rotulo: "Entregue", quando: e?.entregue_em ?? null, feito: nivel >= 4 },
  ]
}

/** Pedido mais recente da cliente. */
export function pedidoRecente(pedidos: Pedido[] | null | "erro") {
  if (!pedidos || pedidos === "erro" || !pedidos.length) return undefined
  return [...pedidos].sort((a, b) => (a.criado_em < b.criado_em ? 1 : -1))[0]
}

/** Vale mostrar no Hoje: ainda não chegou, ou chegou há no máximo 3 dias. */
export function mostrarNoHoje(p: Pedido, hoje: string) {
  const chave = chaveDoPedido(p)
  if (chave !== "entregue") return true
  const entregue = envioPrincipal(p)?.entregue_em
  return entregue ? diffDays(hoje, dataBR(entregue)) <= 3 : false
}

/** "2026-10-13T10:20:32Z" → "2026-10-13" no horário de Brasília. */
export function dataBR(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso))
}

/** "13/10, 07:20" no horário de Brasília. */
export function quandoBR(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso))
}

/** Nome curto do item: "VermeFree Kids 2 a 4 anos" em vez do título longo da loja. */
export function nomeCurto(titulo: string) {
  const depois = titulo.split("|").pop()!.trim()
  return depois || titulo
}
