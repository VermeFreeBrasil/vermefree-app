import { addDays, diffDays } from "@/lib/dates"
import { newMoonsFrom } from "@/lib/moon"
import { DIAS_PARA_O_KIT_CHEGAR, itensDoDia, TOTAL_DIAS, type Fase, type Item } from "@/content/protocolo"
import type { Check, Profile, Quiz, Run } from "@/lib/api"

export type Situacao = {
  fase: Fase
  /** Dia dentro da fase (1-based), quando aplicável. */
  dia: number
  total: number
  /** Dias até o início do ciclo (preparo no adulto, lua nova no kids). */
  diasAteInicio: number
  inicio: string
}

/** Primeiro dia do ciclo: começo do preparo (adulto) ou lua nova (kids). */
export function inicioDoCiclo(run: Run) {
  return run.silimarina_start_date ?? run.start_date
}

export function situacao(profile: Profile, run: Run, date: string): Situacao {
  const inicio = inicioDoCiclo(run)
  if (date < inicio) {
    return { fase: "aguardando", dia: 0, total: 0, diasAteInicio: diffDays(inicio, date), inicio }
  }
  if (profile.tipo === "adulto" && run.silimarina_start_date && date < run.start_date) {
    return { fase: "preparo", dia: diffDays(date, run.silimarina_start_date) + 1, total: TOTAL_DIAS.adulto.preparo!, diasAteInicio: 0, inicio }
  }
  if (date <= run.end_date) {
    return {
      fase: "protocolo",
      dia: diffDays(date, run.start_date) + 1,
      total: TOTAL_DIAS[profile.tipo].protocolo!,
      diasAteInicio: 0,
      inicio,
    }
  }
  return { fase: "manutencao", dia: diffDays(date, run.end_date), total: 0, diasAteInicio: 0, inicio }
}

export function itensDaData(profile: Profile, run: Run, date: string): Item[] {
  return itensDoDia(profile.tipo, profile.faixa_etaria, situacao(profile, run, date).fase)
}

/** Ciclo mais recente da pessoa (por lua nova). */
export function cicloAtual(profile: Profile, runs: Run[]): Run | undefined {
  return runs
    .filter((r) => r.profile_id === profile.id)
    .sort((a, b) => (a.moon_date < b.moon_date ? 1 : -1))[0]
}

export function checkKey(runId: string, date: string, itemKey: string) {
  return `${runId}|${date}|${itemKey}`
}

export function checkSet(checks: Check[]) {
  return new Set(checks.filter((c) => c.done).map((c) => checkKey(c.run_id, c.check_date, c.item_key)))
}

/** Progresso do ciclo: itens marcados sobre itens previstos, do início até hoje. */
export function progresso(profile: Profile, run: Run, done: Set<string>, hoje: string) {
  const inicio = inicioDoCiclo(run)
  const ate = hoje < run.end_date ? hoje : run.end_date
  let previstos = 0
  let feitos = 0
  for (let d = inicio; d <= ate; d = addDays(d, 1)) {
    for (const item of itensDaData(profile, run, d)) {
      previstos++
      if (done.has(checkKey(run.id, d, item.key))) feitos++
    }
  }
  const totalDias = diffDays(run.end_date, inicio) + 1
  const diasPassados = Math.max(0, Math.min(totalDias, diffDays(ate, inicio) + 1))
  return { previstos, feitos, totalDias, diasPassados }
}

export function quizDoCiclo(run: Run, quiz: Quiz[]) {
  return quiz.find((q) => q.run_id === run.id)
}

/** Ciclo terminou e ainda não respondeu como foi. */
export function precisaFecharCiclo(run: Run, quiz: Quiz[], hoje: string) {
  return hoje > run.end_date && !quizDoCiclo(run, quiz)
}

/** Próxima lua nova possível para um novo ciclo: no mínimo 3 meses depois da lua do ciclo anterior. */
export function proximaLuaPermitida(run: Run, hoje: string) {
  const minimo = addDays(run.moon_date, 90)
  const base = minimo > hoje ? minimo : hoje
  return newMoonsFrom(base, 1)[0]
}

/** Primeiro dia do ciclo para uma lua: com adulto, o preparo começa 15 dias antes. */
export function inicioPelaLua(lua: string, temAdulto: boolean) {
  return temAdulto ? addDays(lua, -15) : lua
}

/**
 * Luas para escolher. Com adulto, só as que ainda dão tempo de fazer o preparo.
 * A recomendada é a primeira em que dá tempo do kit chegar (ou a primeira, se o kit já chegou).
 */
export function opcoesDeLua(temAdulto: boolean, hoje: string, kitChegou: boolean, n = 3) {
  const validas = newMoonsFrom(hoje, n + 3).filter((l) => inicioPelaLua(l, temAdulto) >= hoje)
  const minimo = addDays(hoje, kitChegou ? 0 : DIAS_PARA_O_KIT_CHEGAR)
  const idx = Math.max(0, validas.findIndex((l) => inicioPelaLua(l, temAdulto) >= minimo))
  return { luas: validas.slice(idx, idx + n), recomendada: validas[idx] }
}

/** A data do ciclo só muda enquanto nenhuma dose foi marcada. */
export function podeMudarLua(run: Run, checks: Check[]) {
  return !checks.some((c) => c.run_id === run.id && c.done)
}
