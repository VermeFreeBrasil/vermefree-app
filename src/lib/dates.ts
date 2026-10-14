// Datas trafegam como "YYYY-MM-DD" (dia civil no horário de Brasília).

export function todayBR(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

export function addDays(date: string, days: number): string {
  const d = new Date(date + "T00:00:00Z")
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function diffDays(a: string, b: string): number {
  return Math.round((Date.parse(a + "T00:00:00Z") - Date.parse(b + "T00:00:00Z")) / 86400000)
}

function asDate(date: string) {
  return new Date(date + "T12:00:00Z")
}

const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", ...opts })

/** "9 de novembro" */
export function formatLong(date: string) {
  return fmt({ day: "numeric", month: "long" }).format(asDate(date))
}

function inicialMaiuscula(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** "Seg., 9 de nov." */
export function formatWeekday(date: string) {
  return inicialMaiuscula(fmt({ weekday: "short", day: "numeric", month: "short" }).format(asDate(date)))
}

/** "09/11" */
export function formatShort(date: string) {
  return fmt({ day: "2-digit", month: "2-digit" }).format(asDate(date))
}

/** "Novembro de 2026" */
export function formatMonth(date: string) {
  return inicialMaiuscula(fmt({ month: "long", year: "numeric" }).format(asDate(date)))
}

/** 0 = domingo */
export function weekday(date: string) {
  return asDate(date).getUTCDay()
}

export function firstName(nome?: string | null) {
  const n = (nome || "").trim().split(/\s+/)[0] || ""
  return n ? n.charAt(0).toUpperCase() + n.slice(1).toLowerCase() : ""
}
