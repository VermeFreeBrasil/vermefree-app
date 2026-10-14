// Lembretes das doses como arquivo de agenda (.ics), importado pelo app de calendário do celular.
// Horário "flutuante" (sem fuso): o aviso toca no horário local do aparelho.
import { addDays, diffDays } from "@/lib/dates"
import { cicloAtual, inicioDoCiclo, itensDaData } from "@/lib/schedule"
import type { Profile, Run } from "@/lib/api"

export type Horarios = { cafe: string; almoco: string; jantar: string; deitar: string }
export const HORARIOS_PADRAO: Horarios = { cafe: "07:30", almoco: "12:00", jantar: "19:30", deitar: "22:00" }

type Slot = keyof Horarios
const ROTULO_SLOT: Record<Slot, string> = { cafe: "café da manhã", almoco: "almoço", jantar: "jantar", deitar: "hora de deitar" }

/** Em que horário do dia cada item do protocolo é tomado. */
function slotDoItem(key: string): Slot | null {
  if (key === "ornitina_noite") return "deitar"
  if (key === "silimarina_manha" || key.endsWith("_cafe")) return "cafe"
  if (key.endsWith("_almoco")) return "almoco"
  if (key === "silimarina_noite" || key.endsWith("_jantar")) return "jantar"
  return null // manutenção (Óleo de Alho) fica fora: não tem horário fixo
}

function esc(t: string) {
  return t.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;")
}

/** Quebra linhas longas como pede o formato: no máximo 75 bytes, continuação com espaço. */
function dobrar(linha: string) {
  const enc = new TextEncoder()
  const partes: string[] = []
  let atual = ""
  let bytes = 0
  for (const ch of linha) {
    const n = enc.encode(ch).length
    if (bytes + n > 75) {
      partes.push(atual)
      atual = " "
      bytes = 1
    }
    atual += ch
    bytes += n
  }
  partes.push(atual)
  return partes.join("\r\n")
}

const compacta = (d: string) => d.replace(/-/g, "")
const hora = (h: string) => h.replace(":", "") + "00"

export type Evento = { uid: string; pessoa: string; oque: string; inicio: string; fim: string; hora: string; dias: number; titulo: string; descricao: string }

/**
 * Um evento diário por pessoa, por horário e por fase, a partir de hoje.
 * Ex.: "Pedro · antes do café: Tintura e Óleo de Orégano", todo dia de 09/11 a 23/11.
 */
export function eventosDosLembretes(perfis: Profile[], runs: Run[], hoje: string, h: Horarios): Evento[] {
  const eventos: Evento[] = []
  for (const p of perfis) {
    const run = cicloAtual(p, runs)
    if (!run || run.end_date < hoje) continue
    // Fases do ciclo: no adulto, preparo e protocolo têm itens diferentes.
    const fases: { de: string; ate: string; nome: string }[] = run.silimarina_start_date
      ? [
          { de: run.silimarina_start_date, ate: addDays(run.start_date, -1), nome: "preparo" },
          { de: run.start_date, ate: run.end_date, nome: "protocolo" },
        ]
      : [{ de: inicioDoCiclo(run), ate: run.end_date, nome: "protocolo" }]

    for (const f of fases) {
      const de = f.de < hoje ? hoje : f.de
      if (de > f.ate) continue
      const porSlot = new Map<Slot, { titulos: string[]; detalhes: string[] }>()
      for (const item of itensDaData(p, run, de)) {
        const slot = slotDoItem(item.key)
        if (!slot) continue
        const g = porSlot.get(slot) ?? { titulos: [], detalhes: [] }
        if (!g.titulos.includes(item.titulo)) g.titulos.push(item.titulo)
        g.detalhes.push(`${item.titulo}: ${item.dose} (${item.quando.toLowerCase()})`)
        porSlot.set(slot, g)
      }
      for (const [slot, g] of porSlot) {
        eventos.push({
          uid: `${run.id}-${f.nome}-${slot}@app.vermefree.com.br`,
          pessoa: p.nome,
          oque: `${ROTULO_SLOT[slot]}: ${g.titulos.join(" e ")}`,
          inicio: de,
          fim: f.ate,
          hora: h[slot],
          dias: diffDays(f.ate, de) + 1,
          titulo: `${p.nome} · ${ROTULO_SLOT[slot]}: ${g.titulos.join(" e ")}`,
          descricao: `${g.detalhes.join("\n")}\n\nMarque no app: https://app.vermefree.com.br/hoje`,
        })
      }
    }
  }
  return eventos.sort((a, b) => (a.pessoa === b.pessoa ? (a.inicio + a.hora).localeCompare(b.inicio + b.hora) : 0))
}

export function gerarIcs(eventos: Evento[]) {
  const agora = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z")
  const linhas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VermeFree//App//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:VermeFree",
  ]
  for (const e of eventos) {
    linhas.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}`,
      `DTSTAMP:${agora}`,
      `DTSTART:${compacta(e.inicio)}T${hora(e.hora)}`,
      "DURATION:PT10M",
      `RRULE:FREQ=DAILY;COUNT=${e.dias}`,
      `SUMMARY:${esc(e.titulo)}`,
      `DESCRIPTION:${esc(e.descricao)}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${esc(e.titulo)}`,
      "TRIGGER:PT0M",
      "END:VALARM",
      "END:VEVENT",
    )
  }
  linhas.push("END:VCALENDAR")
  return linhas.map(dobrar).join("\r\n") + "\r\n"
}

/** Baixa o arquivo; o celular oferece abrir na agenda. */
export function baixarIcs(conteudo: string, nome = "lembretes-vermefree.ics") {
  const blob = new Blob([conteudo], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
