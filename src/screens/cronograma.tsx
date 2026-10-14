import * as React from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight, Moon, Pencil } from "lucide-react"
import { PageHeader } from "@/components/layout"
import { Checklist, PerfilChips, rotuloPerfil, usePerfilAtual, type Linha } from "@/components/protocolo"
import { useApp } from "@/lib/app-state"
import { addDays, diffDays, formatLong, formatMonth, formatShort, formatWeekday, weekday } from "@/lib/dates"
import { checkKey, checkSet, cicloAtual, inicioDoCiclo, itensDaData, podeMudarLua, situacao } from "@/lib/schedule"
import { cn } from "@/lib/utils"
import { FASE_INFO } from "@/content/protocolo"
import type { Profile, Run } from "@/lib/api"

const SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"]

function primeiroDoMes(date: string) {
  return date.slice(0, 8) + "01"
}

function mudarMes(date: string, delta: number) {
  const d = new Date(primeiroDoMes(date) + "T00:00:00Z")
  d.setUTCMonth(d.getUTCMonth() + delta)
  return d.toISOString().slice(0, 10)
}

export function CronogramaScreen() {
  const { state } = useApp()
  const s = state!
  const { perfil, trocar } = usePerfilAtual(s.profiles)
  const atual = perfil ?? s.profiles[0]
  return (
    <>
      <PageHeader eyebrow="Seu ciclo" titulo="Cronograma" />
      <PerfilChips perfis={s.profiles} atual={atual.id} onChange={trocar} />
      <CalendarioPerfil key={atual.id} perfil={atual} />
    </>
  )
}

function CalendarioPerfil({ perfil }: { perfil: Profile }) {
  const { state, marcar } = useApp()
  const s = state!
  const run = cicloAtual(perfil, s.runs)
  const done = React.useMemo(() => checkSet(s.checks), [s.checks])
  const inicio = run ? inicioDoCiclo(run) : s.hoje
  const diaInicial = run && s.hoje < inicio ? inicio : s.hoje
  const [dia, setDia] = React.useState<string>(diaInicial)
  const [mes, setMes] = React.useState(() => primeiroDoMes(diaInicial))
  const [erro, setErro] = React.useState<string | null>(null)
  const detalheRef = React.useRef<HTMLElement>(null)

  if (!run) return null

  const escolher = (d: string, rolar = false) => {
    setDia(d)
    setMes(primeiroDoMes(d))
    if (rolar) detalheRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const dias: (string | null)[] = []
  for (let i = 0; i < weekday(mes); i++) dias.push(null)
  for (let d = mes; d.slice(0, 7) === mes.slice(0, 7); d = addDays(d, 1)) dias.push(d)

  const itensDia = itensDaData(perfil, run, dia)
  const linhas: Linha[] = itensDia.map((item) => ({ id: item.key, item }))
  const sitDia = situacao(perfil, run, dia)
  const podeMarcar = dia <= s.hoje && dia >= inicio
  const feitosDia = itensDia.filter((i) => done.has(checkKey(run.id, dia, i.key))).length
  const totalCiclo = diffDays(run.end_date, inicio) + 1

  return (
    <div className="space-y-4 animate-subir">
      {/* Linha do tempo do ciclo */}
      <section className="rounded-panel border border-border bg-card p-5">
        <p className="text-[13px] text-muted-foreground">{rotuloPerfil(perfil)}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[15px] font-semibold text-primary">
          <Moon className="size-4 shrink-0 text-leaf" aria-hidden /> Lua nova em {formatLong(run.moon_date)}
        </p>
        <div className="mt-3 flex h-3 overflow-hidden rounded-full" aria-hidden>
          {run.silimarina_start_date && <span className="bg-[#e9d9b0]" style={{ width: `${(15 / totalCiclo) * 100}%` }} />}
          <span className="flex-1 bg-accent" />
        </div>
        <div className="mt-2 flex justify-between gap-2 text-[12.5px] text-muted-foreground">
          {run.silimarina_start_date ? (
            <>
              <span>
                <span className="font-semibold text-[#7a5b16]">Preparo</span> {formatShort(run.silimarina_start_date)} a{" "}
                {formatShort(addDays(run.start_date, -1))}
              </span>
              <span>
                <span className="font-semibold text-leaf">Fase 2</span> {formatShort(run.start_date)} a {formatShort(run.end_date)}
              </span>
            </>
          ) : (
            <span>
              <span className="font-semibold text-leaf">Protocolo</span> {formatShort(run.start_date)} a {formatShort(run.end_date)}
            </span>
          )}
        </div>
        {podeMudarLua(run, s.checks) && s.hoje <= run.end_date && (
          <Link to="/pessoas" className="mt-1 inline-flex min-h-11 items-center gap-1.5 text-[13px] font-semibold text-leaf">
            <Pencil className="size-3.5" aria-hidden /> Mudar a data do ciclo
          </Link>
        )}
      </section>

      {/* O dia escolhido: o que tomar */}
      <section ref={detalheRef} className="scroll-mt-4 rounded-panel border border-border bg-card p-5" aria-live="polite">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => escolher(addDays(dia, -1))}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-border"
            aria-label="Dia anterior"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <h2 className="text-[1.3rem] text-primary">{dia === s.hoje ? "Hoje" : formatWeekday(dia)}</h2>
            <p className="text-[12.5px] text-muted-foreground">
              {sitDia.fase === "preparo" || sitDia.fase === "protocolo"
                ? `${FASE_INFO[sitDia.fase].nome} · dia ${sitDia.dia} de ${sitDia.total}`
                : sitDia.fase === "aguardando"
                  ? sitDia.diasAteInicio === 1
                    ? "Começa no dia seguinte"
                    : `Faltam ${sitDia.diasAteInicio} dias para começar`
                  : "Depois do ciclo"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => escolher(addDays(dia, 1))}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-border"
            aria-label="Próximo dia"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>

        {dia !== s.hoje && (
          <div className="mt-1 text-center">
            <button type="button" onClick={() => escolher(s.hoje)} className="min-h-10 text-[13px] font-semibold text-leaf underline underline-offset-4">
              Voltar para hoje
            </button>
          </div>
        )}

        {erro && (
          <p role="alert" className="mt-3 rounded-2xl bg-[#f6e3dd] px-4 py-3 text-sm text-destructive">
            {erro}
          </p>
        )}

        <div className="mt-4">
          {linhas.length === 0 ? (
            <p className="text-center text-[14.5px] text-muted-foreground">
              {sitDia.fase === "aguardando" ? "Ainda não começou. Nada para tomar neste dia." : "Sem doses previstas neste dia."}
            </p>
          ) : podeMarcar ? (
            <>
              <p className="mb-3 text-right text-sm font-semibold text-muted-foreground">
                {feitosDia}/{itensDia.length} marcadas
              </p>
              <Checklist
                linhas={linhas}
                feito={(l) => done.has(checkKey(run.id, dia, l.item.key))}
                onToggle={async (l, v) => {
                  setErro(null)
                  try {
                    await marcar(run.id, dia, l.item.key, v)
                  } catch {
                    setErro("Não deu para salvar agora. Confira a internet e toque de novo.")
                  }
                }}
              />
            </>
          ) : (
            <ul className="space-y-2">
              {itensDia.map((i) => (
                <li key={i.key} className="rounded-card bg-secondary/50 p-3 text-[14px]">
                  <span className="font-bold text-primary">{i.titulo}</span>
                  <span className="block text-muted-foreground">
                    {i.dose} · {i.quando}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Calendário do mês */}
      <section className="rounded-panel border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMes((m) => mudarMes(m, -1))}
            className="grid size-11 place-items-center rounded-full hover:bg-selected"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <h2 className="font-sans text-[15px] font-bold tracking-normal text-primary">{formatMonth(mes)}</h2>
          <button
            type="button"
            onClick={() => setMes((m) => mudarMes(m, 1))}
            className="grid size-11 place-items-center rounded-full hover:bg-selected"
            aria-label="Próximo mês"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {SEMANA.map((d, i) => (
            <span key={i} className="pb-1 text-[11px] font-bold text-muted-foreground" aria-hidden>
              {d}
            </span>
          ))}
          {dias.map((d, i) =>
            d ? (
              <DiaCelula
                key={d}
                date={d}
                perfil={perfil}
                run={run}
                hoje={s.hoje}
                selecionado={d === dia}
                done={done}
                onClick={() => escolher(d, true)}
              />
            ) : (
              <span key={`v${i}`} />
            ),
          )}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-muted-foreground">
          {run.silimarina_start_date && (
            <li className="flex items-center gap-1.5">
              <span className="size-3 rounded bg-[#f3ead2]" aria-hidden /> Preparo
            </li>
          )}
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded bg-accent/55" aria-hidden /> Protocolo
          </li>
          <li className="flex items-center gap-1.5">
            <Moon className="size-3.5 text-primary" aria-hidden /> Lua nova
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-leaf" aria-hidden /> Tudo marcado
          </li>
        </ul>
      </section>
    </div>
  )
}

function DiaCelula({
  date,
  perfil,
  run,
  hoje,
  selecionado,
  done,
  onClick,
}: {
  date: string
  perfil: Profile
  run: Run
  hoje: string
  selecionado: boolean
  done: Set<string>
  onClick: () => void
}) {
  const sit = situacao(perfil, run, date)
  const noCiclo = sit.fase === "preparo" || sit.fase === "protocolo"
  const itens = noCiclo ? itensDaData(perfil, run, date) : []
  const feitos = itens.filter((i) => done.has(checkKey(run.id, date, i.key))).length
  const passado = date <= hoje
  const lua = date === run.moon_date
  const status = !noCiclo || !passado ? "" : feitos === itens.length ? "completo" : feitos > 0 ? "parcial" : "nada"

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selecionado}
      aria-label={`${formatLong(date)}${date === hoje ? ", hoje" : ""}${lua ? ", lua nova" : ""}${status === "completo" ? ", todas as doses marcadas" : status === "parcial" ? `, ${feitos} de ${itens.length} doses` : ""}`}
      className={cn(
        "relative flex h-11 flex-col items-center justify-center rounded-xl text-[14px] font-semibold transition-colors",
        sit.fase === "preparo" && "bg-[#f3ead2] text-[#5b4410]",
        sit.fase === "protocolo" && "bg-accent/55 text-accent-foreground",
        !noCiclo && "text-foreground",
        date === hoje && !selecionado && "font-extrabold underline decoration-2 underline-offset-4",
        selecionado && "bg-primary! text-white! shadow-[0_6px_14px_-6px_rgba(21,60,44,0.7)]",
      )}
    >
      {lua && <Moon className={cn("absolute right-1 top-1 size-3", selecionado ? "text-accent" : "text-primary")} aria-hidden />}
      {Number(date.slice(8))}
      {status && (
        <span
          aria-hidden
          className={cn(
            "absolute bottom-1 size-1.5 rounded-full",
            status === "completo" && "bg-leaf",
            status === "parcial" && "bg-[#c58b2a]",
            status === "nada" && "bg-[#c9cfc5]",
            selecionado && "bg-accent",
          )}
        />
      )}
    </button>
  )
}
