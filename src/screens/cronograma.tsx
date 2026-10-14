import * as React from "react"
import { ChevronLeft, ChevronRight, Moon } from "lucide-react"
import { PageHeader } from "@/components/layout"
import { Checklist, PerfilChips, rotuloPerfil, usePerfilAtual } from "@/components/protocolo"
import { useApp } from "@/lib/app-state"
import { addDays, formatLong, formatMonth, formatShort, formatWeekday, weekday } from "@/lib/dates"
import { checkKey, checkSet, cicloAtual, inicioDoCiclo, itensDaData, situacao } from "@/lib/schedule"
import { cn } from "@/lib/utils"
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
  const [perfil, setPerfil] = usePerfilAtual(s.profiles)
  return (
    <>
      <PageHeader eyebrow="Seu ciclo" titulo="Cronograma" />
      <PerfilChips perfis={s.profiles} atual={perfil.id} onChange={setPerfil} />
      <CalendarioPerfil key={perfil.id} perfil={perfil} />
    </>
  )
}

function CalendarioPerfil({ perfil }: { perfil: Profile }) {
  const { state, marcar } = useApp()
  const s = state!
  const run = cicloAtual(perfil, s.runs)
  const done = React.useMemo(() => checkSet(s.checks), [s.checks])
  const inicio = run ? inicioDoCiclo(run) : s.hoje
  const [mes, setMes] = React.useState(() => primeiroDoMes(run && s.hoje < inicio ? inicio : s.hoje))
  const [dia, setDia] = React.useState<string>(() => (run && s.hoje < inicio ? inicio : s.hoje))
  const [erro, setErro] = React.useState<string | null>(null)

  if (!run) return null

  const dias: (string | null)[] = []
  const vazios = weekday(mes)
  for (let i = 0; i < vazios; i++) dias.push(null)
  for (let d = mes; d.slice(0, 7) === mes.slice(0, 7); d = addDays(d, 1)) dias.push(d)

  const itensDia = itensDaData(perfil, run, dia)
  const sitDia = situacao(perfil, run, dia)
  const podeMarcar = dia <= s.hoje && dia >= inicio && (sitDia.fase !== "manutencao" || perfil.tipo === "adulto")

  return (
    <div className="space-y-4 animate-subir">
      <section className="rounded-panel border border-border bg-card p-5">
        <p className="text-[13px] text-muted-foreground">{rotuloPerfil(perfil)}</p>
        <ul className="mt-2 space-y-1.5 text-[14px]">
          {run.silimarina_start_date && (
            <Legenda cor="bg-[#e9d9b0]">
              Preparo: {formatShort(run.silimarina_start_date)} a {formatShort(addDays(run.start_date, -1))}
            </Legenda>
          )}
          <Legenda cor="bg-accent">
            Protocolo: {formatShort(run.start_date)} a {formatShort(run.end_date)}
          </Legenda>
          <Legenda icone>Lua nova: {formatLong(run.moon_date)}</Legenda>
        </ul>
      </section>

      <section className="rounded-panel border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMes((m) => mudarMes(m, -1))}
            className="grid size-11 place-items-center rounded-full hover:bg-selected"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <h2 className="font-sans text-[16px] font-bold tracking-normal text-primary">{formatMonth(mes)}</h2>
          <button
            type="button"
            onClick={() => setMes((m) => mudarMes(m, 1))}
            className="grid size-11 place-items-center rounded-full hover:bg-selected"
            aria-label="Próximo mês"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center" role="grid">
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
                onClick={() => setDia(d)}
              />
            ) : (
              <span key={`v${i}`} />
            ),
          )}
        </div>
      </section>

      <section className="rounded-panel border border-border bg-card p-5">
        <h2 className="text-[1.35rem] text-primary">{formatWeekday(dia)}</h2>
        {erro && (
          <p role="alert" className="mt-2 rounded-2xl bg-[#f6e3dd] px-4 py-3 text-sm text-destructive">
            {erro}
          </p>
        )}
        {itensDia.length === 0 ? (
          <p className="mt-2 text-[14.5px] text-muted-foreground">
            {sitDia.fase === "aguardando" ? "Ainda não começou." : "Sem doses previstas neste dia."}
          </p>
        ) : podeMarcar ? (
          <div className="mt-3">
            <Checklist
              itens={itensDia}
              feito={(i) => done.has(checkKey(run.id, dia, i.key))}
              onToggle={async (i, v) => {
                setErro(null)
                try {
                  await marcar(run.id, dia, i.key, v)
                } catch {
                  setErro("Não deu para salvar agora. Confira a internet e toque de novo.")
                }
              }}
            />
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
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
      </section>
    </div>
  )
}

function Legenda({ cor, icone, children }: { cor?: string; icone?: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-foreground">
      {icone ? (
        <Moon className="size-4 text-primary" aria-hidden />
      ) : (
        <span aria-hidden className={cn("size-3.5 rounded-full", cor)} />
      )}
      {children}
    </li>
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
      aria-label={`${formatLong(date)}${lua ? ", lua nova" : ""}${status === "completo" ? ", todas as doses marcadas" : status === "parcial" ? `, ${feitos} de ${itens.length} doses` : ""}`}
      className={cn(
        "relative flex aspect-square min-h-10 flex-col items-center justify-center rounded-xl text-[14px] font-semibold transition-colors",
        sit.fase === "preparo" && "bg-[#f3ead2] text-[#5b4410]",
        sit.fase === "protocolo" && "bg-accent/55 text-accent-foreground",
        !noCiclo && "text-foreground",
        date === hoje && "ring-2 ring-primary",
        selecionado && "bg-primary! text-white!",
      )}
    >
      {lua ? <Moon className="size-4" aria-hidden /> : Number(date.slice(8))}
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
