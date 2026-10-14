import * as React from "react"
import { Link } from "react-router-dom"
import { CalendarPlus, Lightbulb, Loader2, Moon, PartyPopper, ShoppingBag } from "lucide-react"
import { PageHeader } from "@/components/layout"
import { GlowBackground } from "@/components/ui/glow-background"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { Checklist, FaseBadge, PerfilChips, Progresso, rotuloPerfil, usePerfilAtual } from "@/components/protocolo"
import { useApp } from "@/lib/app-state"
import { addDays, firstName, formatLong, formatShort, formatWeekday } from "@/lib/dates"
import {
  checkKey,
  checkSet,
  cicloAtual,
  itensDaData,
  precisaFecharCiclo,
  progresso,
  proximaLuaPermitida,
  quizDoCiclo,
  situacao,
} from "@/lib/schedule"
import { DICAS, FASE_INFO, LINKS, PRODUTOS_IMG, REACOES_LEVES } from "@/content/protocolo"
import type { Profile } from "@/lib/api"

export function HojeScreen() {
  const { state } = useApp()
  const s = state!
  const [perfil, setPerfil] = usePerfilAtual(s.profiles)
  const nome = firstName(s.customer.nome)

  return (
    <>
      <PageHeader eyebrow={formatWeekday(s.hoje)} titulo={nome ? `Olá, ${nome}` : "Olá!"} />
      <PerfilChips perfis={s.profiles} atual={perfil.id} onChange={setPerfil} />
      <PerfilHoje key={perfil.id} perfil={perfil} />
      <p className="mt-6 px-1 text-[12.5px] leading-relaxed text-muted-foreground">{REACOES_LEVES}</p>
    </>
  )
}

function PerfilHoje({ perfil }: { perfil: Profile }) {
  const { state, marcar, novoCiclo } = useApp()
  const s = state!
  const hoje = s.hoje
  const run = cicloAtual(perfil, s.runs)
  const done = React.useMemo(() => checkSet(s.checks), [s.checks])
  const [erro, setErro] = React.useState<string | null>(null)
  const [agendando, setAgendando] = React.useState(false)

  if (!run) return null

  const sit = situacao(perfil, run, hoje)
  const itens = itensDaData(perfil, run, hoje)
  const prog = progresso(perfil, run, done, hoje)
  const feitosHoje = itens.filter((i) => done.has(checkKey(run.id, hoje, i.key))).length
  const fechar = precisaFecharCiclo(run, s.quiz, hoje)
  const quiz = quizDoCiclo(run, s.quiz)
  const proximaLua = proximaLuaPermitida(run, hoje)
  const dicas = DICAS[perfil.tipo][sit.fase] ?? []

  async function toggle(itemKey: string, valor: boolean) {
    setErro(null)
    try {
      await marcar(run!.id, hoje, itemKey, valor)
    } catch {
      setErro("Não deu para salvar agora. Confira a internet e toque de novo.")
    }
  }

  async function agendar() {
    setAgendando(true)
    try {
      await novoCiclo(perfil.id, proximaLua)
    } catch {
      setErro("Não deu para agendar agora. Tente de novo em instantes.")
    } finally {
      setAgendando(false)
    }
  }

  return (
    <div className="space-y-4 animate-subir">
      {/* Cabeçalho da fase, em vidro sobre o verde da marca */}
      <GlowBackground tone="forest" className="min-h-0 overflow-hidden rounded-panel">
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[17px] font-bold text-white">{perfil.nome}</p>
              <p className="text-[13px] text-[#d5e2d0]">{rotuloPerfil(perfil)}</p>
            </div>
            <FaseBadge fase={sit.fase} />
          </div>

          {sit.fase === "aguardando" && (
            <div className="glass-dark mt-5 rounded-card p-4">
              <p className="font-display text-[2rem] leading-none text-white">
                {sit.diasAteInicio === 1 ? "Começa amanhã" : `Faltam ${sit.diasAteInicio} dias`}
              </p>
              <p className="mt-2 text-[14px] text-[#d5e2d0]">
                {perfil.tipo === "adulto"
                  ? `O preparo do fígado começa em ${formatLong(sit.inicio)}. Lua nova em ${formatLong(run.moon_date)}.`
                  : `As tinturas começam na lua nova, em ${formatLong(run.moon_date)}.`}
              </p>
            </div>
          )}

          {(sit.fase === "preparo" || sit.fase === "protocolo") && (
            <div className="glass-dark mt-5 rounded-card p-4">
              <p className="text-[13px] font-semibold text-[#d5e2d0]">{FASE_INFO[sit.fase].nome}</p>
              <p className="font-display text-[2.3rem] leading-none text-white">
                Dia {sit.dia} <span className="text-[1.3rem] text-white/60">de {sit.total}</span>
              </p>
              <div className="mt-3">
                <Progresso valor={prog.diasPassados} total={prog.totalDias} claro />
              </div>
              <p className="mt-2 text-[12.5px] text-[#d5e2d0]">
                {perfil.tipo === "adulto" && sit.fase === "preparo"
                  ? `Lua nova em ${formatLong(run.moon_date)}: começa a Fase 2.`
                  : `Termina em ${formatLong(run.end_date)}.`}
              </p>
            </div>
          )}

          {sit.fase === "manutencao" && (
            <div className="glass-dark mt-5 rounded-card p-4">
              <p className="font-display text-[1.8rem] leading-tight text-white">Ciclo concluído</p>
              <p className="mt-1 text-[14px] text-[#d5e2d0]">
                {prog.previstos ? `${prog.feitos} de ${prog.previstos} doses marcadas no ciclo. ` : ""}
                {FASE_INFO.manutencao.resumo[perfil.tipo]}
              </p>
            </div>
          )}
        </div>
      </GlowBackground>

      {erro && (
        <p role="alert" className="rounded-2xl bg-[#f6e3dd] px-4 py-3 text-sm text-destructive">
          {erro}
        </p>
      )}

      {fechar && (
        <section className="rounded-panel border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <PartyPopper className="size-7 text-leaf" aria-hidden />
            <h2 className="text-[1.4rem] text-primary">Como foi o ciclo?</h2>
          </div>
          <p className="mt-2 text-[14.5px] text-muted-foreground">
            Responda em 1 minuto. Com isso a gente indica o melhor próximo passo para {perfil.nome}.
          </p>
          <LiquidButton asChild tone="onLight" size="lg" className="mt-4 w-full">
            <Link to={`/fim/${run.id}`}>Contar como foi</Link>
          </LiquidButton>
        </section>
      )}

      {itens.length > 0 && (
        <section className="rounded-panel border border-border bg-card/80 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-[1.5rem] text-primary">{sit.fase === "manutencao" ? "Manutenção de hoje" : "Doses de hoje"}</h2>
            <span className="shrink-0 text-sm font-semibold text-muted-foreground">
              {feitosHoje}/{itens.length}
            </span>
          </div>
          <Checklist
            itens={itens}
            feito={(i) => done.has(checkKey(run.id, hoje, i.key))}
            onToggle={(i, v) => toggle(i.key, v)}
          />
          {sit.fase === "manutencao" && perfil.tipo === "adulto" && (
            <a
              href={LINKS.oleoAlho}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center gap-3 rounded-card bg-secondary/60 p-3 text-[14px] font-semibold text-primary"
            >
              <img src={PRODUTOS_IMG.oleoAlho} alt="" className="size-12 rounded-xl bg-white object-contain" />
              Ainda não tem o Óleo de Alho? Ver no site
              <ShoppingBag className="ml-auto size-5 shrink-0" aria-hidden />
            </a>
          )}
        </section>
      )}

      {sit.fase === "aguardando" && (
        <section className="rounded-panel border border-border bg-card p-5">
          <h2 className="text-[1.4rem] text-primary">O que vem por aí</h2>
          <p className="mt-2 text-[14.5px] text-muted-foreground">{FASE_INFO.aguardando.resumo[perfil.tipo]}</p>
          <p className="mt-2 text-[14.5px] text-muted-foreground">
            {perfil.tipo === "adulto"
              ? "Fase 1: Silimarina por 15 dias. Fase 2, a partir da lua nova: Tintura, Óleo de Orégano e Ornitina por 15 dias."
              : "As duas tinturas, 3 vezes ao dia, antes das refeições, por 30 dias."}
          </p>
          <Link to="/guia" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-leaf underline underline-offset-4">
            Enquanto isso, veja o Guia de Alimentos
          </Link>
        </section>
      )}

      {sit.fase === "manutencao" && quiz && !fechar && (
        <section className="rounded-panel border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <Moon className="size-6 text-leaf" aria-hidden />
            <h2 className="text-[1.4rem] text-primary">Próximo ciclo</h2>
          </div>
          <p className="mt-2 text-[14.5px] text-muted-foreground">
            O protocolo pode ser repetido até 4 vezes por ano, com no mínimo 3 meses entre um ciclo e outro. A próxima lua nova possível é em {formatLong(proximaLua)}
            {perfil.tipo === "adulto" ? `, com preparo a partir de ${formatShort(addDays(proximaLua, -15))}` : ""}.
          </p>
          <LiquidButton tone="onLight" size="lg" className="mt-4 w-full" onClick={agendar} disabled={agendando}>
            {agendando ? <Loader2 className="animate-spin" aria-hidden /> : <CalendarPlus aria-hidden />}
            Agendar para {formatShort(proximaLua)}
          </LiquidButton>
        </section>
      )}

      {dicas.length > 0 && (
        <section className="rounded-panel bg-selected p-5">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-5 text-leaf" aria-hidden />
            <h2 className="font-sans text-[15px] font-bold tracking-normal text-primary">Dicas para esta fase</h2>
          </div>
          <ul className="mt-2 space-y-1.5 text-[14px] text-foreground">
            {dicas.map((d) => (
              <li key={d} className="flex gap-2">
                <span aria-hidden className="mt-[9px] size-1.5 shrink-0 rounded-full bg-leaf" />
                {d}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
