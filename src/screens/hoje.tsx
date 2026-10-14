import * as React from "react"
import { Link } from "react-router-dom"
import { BookOpen, CalendarPlus, Check, ChevronRight, Info, Lightbulb, Loader2, Moon, PartyPopper, ShoppingBag, Users } from "lucide-react"
import { PageHeader } from "@/components/layout"
import { GlowBackground } from "@/components/ui/glow-background"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { Avatar, Checklist, FaseBadge, PerfilChips, Progresso, rotuloPerfil, TODOS, usePerfilAtual, type Linha } from "@/components/protocolo"
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
import { cn } from "@/lib/utils"
import { DICAS, FASE_INFO, LINKS, PRODUTOS_IMG, REACOES_LEVES } from "@/content/protocolo"
import { secaoDaFase } from "@/content/guia"
import { estaInstalado } from "@/screens/instalar"
import type { AppState, Profile } from "@/lib/api"

function useMarcar() {
  const { marcar } = useApp()
  const [erro, setErro] = React.useState<string | null>(null)
  async function toggle(runId: string, date: string, itemKey: string, valor: boolean) {
    setErro(null)
    try {
      await marcar(runId, date, itemKey, valor)
    } catch {
      setErro("Não deu para salvar agora. Confira a internet e toque de novo.")
    }
  }
  return { erro, toggle }
}

function Erro({ texto }: { texto: string | null }) {
  if (!texto) return null
  return (
    <p role="alert" className="rounded-2xl bg-[#f6e3dd] px-4 py-3 text-sm text-destructive">
      {texto}
    </p>
  )
}

export function HojeScreen() {
  const { state } = useApp()
  const s = state!
  const { selecionado, perfil, trocar } = usePerfilAtual(s.profiles, true)
  const nome = firstName(s.customer.nome)
  const algumAguardando = s.profiles.some((p) => {
    const run = cicloAtual(p, s.runs)
    return run && situacao(p, run, s.hoje).fase === "aguardando"
  })

  return (
    <>
      <PageHeader
        eyebrow={formatWeekday(s.hoje)}
        titulo={nome ? `Olá, ${nome}` : "Olá!"}
        acao={
          <Link to="/pessoas" className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-[13px] font-semibold text-primary">
            <Users className="size-4" aria-hidden /> Pessoas e datas
          </Link>
        }
      />
      <PerfilChips perfis={s.profiles} atual={selecionado} onChange={trocar} comTodos />
      {selecionado === TODOS || !perfil ? <FamiliaHoje onEscolher={trocar} /> : <PerfilHoje key={perfil.id} perfil={perfil} />}
      {algumAguardando && <Preparacao s={s} />}
    </>
  )
}

/* ---------- Família: todo mundo numa tela ---------- */

function FamiliaHoje({ onEscolher }: { onEscolher: (id: string) => void }) {
  const { state } = useApp()
  const s = state!
  const done = React.useMemo(() => checkSet(s.checks), [s.checks])
  const { erro, toggle } = useMarcar()

  const pessoas = s.profiles.flatMap((p) => {
    const run = cicloAtual(p, s.runs)
    return run ? [{ p, run, sit: situacao(p, run, s.hoje), itens: itensDaData(p, run, s.hoje) }] : []
  })
  const linhas: (Linha & { runId: string })[] = pessoas.flatMap(({ p, run, itens }) =>
    itens.map((item) => ({ id: `${run.id}|${item.key}`, item, pessoa: p.nome, runId: run.id })),
  )
  const feitos = linhas.filter((l) => done.has(checkKey(l.runId, s.hoje, l.item.key))).length
  const paraFechar = pessoas.filter(({ run }) => precisaFecharCiclo(run, s.quiz, s.hoje))

  return (
    <div className="space-y-4 animate-subir">
      <GlowBackground tone="forest" className="min-h-0 overflow-hidden rounded-panel">
        <ul className="divide-y divide-white/10 p-2">
          {pessoas.map(({ p, run, sit, itens }) => {
            const feitosP = itens.filter((i) => done.has(checkKey(run.id, s.hoje, i.key))).length
            return (
              <li key={p.id}>
                <button type="button" onClick={() => onEscolher(p.id)} className="flex w-full items-center gap-3 rounded-card p-3 text-left">
                  <Avatar nome={p.nome} tom="escuro" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15.5px] font-bold text-white">{p.nome}</span>
                    <span className="block text-[13px] text-[#d5e2d0]">{statusCurto(p, run, sit)}</span>
                  </span>
                  {itens.length > 0 && (
                    <span className={cn("rounded-full px-2.5 py-1 text-[12px] font-bold", feitosP === itens.length ? "bg-accent text-accent-foreground" : "bg-white/10 text-white")}>
                      {feitosP}/{itens.length}
                    </span>
                  )}
                  <ChevronRight className="size-5 shrink-0 text-white/50" aria-hidden />
                </button>
              </li>
            )
          })}
        </ul>
      </GlowBackground>

      <Erro texto={erro} />

      {paraFechar.map(({ p, run }) => (
        <Link key={run.id} to={`/fim/${run.id}`} className="flex items-center gap-3 rounded-panel border border-border bg-card p-4">
          <PartyPopper className="size-6 shrink-0 text-leaf" aria-hidden />
          <span className="flex-1 text-[15px] font-semibold text-primary">Como foi o ciclo de {p.nome}?</span>
          <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
        </Link>
      ))}

      {linhas.length > 0 && (
        <section className="rounded-panel border border-border bg-card/80 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-[1.5rem] text-primary">Doses de hoje</h2>
            <span className="shrink-0 text-sm font-semibold text-muted-foreground">
              {feitos}/{linhas.length}
            </span>
          </div>
          <Checklist
            linhas={linhas}
            feito={(l) => done.has(l.id.replace("|", `|${s.hoje}|`))}
            onToggle={(l, v) => toggle(l.id.split("|")[0], s.hoje, l.item.key, v)}
          />
        </section>
      )}
    </div>
  )
}

function statusCurto(p: Profile, run: { moon_date: string; end_date: string }, sit: ReturnType<typeof situacao>) {
  if (sit.fase === "aguardando") {
    const quando = sit.diasAteInicio === 1 ? "amanhã" : `em ${formatShort(sit.inicio)}`
    return `${p.tipo === "adulto" ? "Preparo começa" : "Começa"} ${quando}`
  }
  if (sit.fase === "preparo") return `Preparo · dia ${sit.dia} de ${sit.total}`
  if (sit.fase === "protocolo") return `Protocolo · dia ${sit.dia} de ${sit.total}`
  return `Ciclo concluído em ${formatShort(run.end_date)}`
}

/* ---------- Uma pessoa ---------- */

function PerfilHoje({ perfil }: { perfil: Profile }) {
  const { state, novoCiclo } = useApp()
  const s = state!
  const hoje = s.hoje
  const run = cicloAtual(perfil, s.runs)
  const done = React.useMemo(() => checkSet(s.checks), [s.checks])
  const { erro: erroMarcar, toggle } = useMarcar()
  const [erro, setErro] = React.useState<string | null>(null)
  const [agendando, setAgendando] = React.useState(false)

  if (!run) return null

  const sit = situacao(perfil, run, hoje)
  const itens = itensDaData(perfil, run, hoje)
  const linhas: Linha[] = itens.map((item) => ({ id: item.key, item }))
  const prog = progresso(perfil, run, done, hoje)
  const feitosHoje = itens.filter((i) => done.has(checkKey(run.id, hoje, i.key))).length
  const fechar = precisaFecharCiclo(run, s.quiz, hoje)
  const quiz = quizDoCiclo(run, s.quiz)
  const proximaLua = proximaLuaPermitida(run, hoje)
  const dicas = DICAS[perfil.tipo][sit.fase] ?? []
  const guia = secaoDaFase(perfil.tipo, sit.fase)
  const primeirosDias = (sit.fase === "preparo" || sit.fase === "protocolo") && sit.dia <= 3

  async function agendar() {
    setAgendando(true)
    setErro(null)
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
            <div className="flex min-w-0 items-center gap-3">
              <Avatar nome={perfil.nome} tom="escuro" />
              <div className="min-w-0">
                <p className="truncate text-[17px] font-bold text-white">{perfil.nome}</p>
                <p className="text-[13px] text-[#d5e2d0]">{rotuloPerfil(perfil)}</p>
              </div>
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
                  ? `para o preparo do fígado, que começa em ${formatLong(sit.inicio)}. A lua nova é em ${formatLong(run.moon_date)}.`
                  : `para as tinturas, que começam na lua nova, em ${formatLong(run.moon_date)}.`}
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

      <Erro texto={erro || erroMarcar} />

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

      {primeirosDias && (
        <section className="flex gap-3 rounded-panel bg-[#f7f0dd] p-4 text-[14px] text-[#5b4410]">
          <Info className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>{REACOES_LEVES}</p>
        </section>
      )}

      {linhas.length > 0 && (
        <section className="rounded-panel border border-border bg-card/80 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-[1.5rem] text-primary">{sit.fase === "manutencao" ? "Manutenção de hoje" : "Doses de hoje"}</h2>
            <span className="shrink-0 text-sm font-semibold text-muted-foreground">
              {feitosHoje}/{itens.length}
            </span>
          </div>
          <Checklist
            linhas={linhas}
            feito={(l) => done.has(checkKey(run.id, hoje, l.item.key))}
            onToggle={(l, v) => toggle(run.id, hoje, l.item.key, v)}
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
          <h2 className="text-[1.4rem] text-primary">Como vai ser</h2>
          <ol className="mt-3 space-y-3">
            {(perfil.tipo === "adulto"
              ? [
                  { quando: `${formatShort(run.silimarina_start_date!)} a ${formatShort(addDays(run.start_date, -1))}`, texto: "Fase 1 · Preparo do fígado: Silimarina, depois do café e do jantar." },
                  { quando: `${formatShort(run.start_date)} a ${formatShort(run.end_date)}`, texto: "Fase 2 · a partir da lua nova: Tintura e Óleo de Orégano antes das refeições, e Ornitina antes de deitar." },
                ]
              : [{ quando: `${formatShort(run.start_date)} a ${formatShort(run.end_date)}`, texto: "As duas tinturas, 3 vezes ao dia, antes das refeições, por 30 dias." }]
            ).map((etapa, i) => (
              <li key={i} className="flex gap-3">
                <span className={cn("mt-1 size-3 shrink-0 rounded-full", i === 0 && perfil.tipo === "adulto" ? "bg-[#e9d9b0]" : "bg-accent")} aria-hidden />
                <span>
                  <span className="block text-[13px] font-bold text-primary">{etapa.quando}</span>
                  <span className="block text-[14.5px] text-foreground">{etapa.texto}</span>
                </span>
              </li>
            ))}
          </ol>
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
          <Link
            to={`/guia?secao=${guia.id}`}
            className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-leaf underline underline-offset-4"
          >
            <BookOpen className="size-4" aria-hidden /> {guia.rotulo} no Guia
          </Link>
        </section>
      )}
    </div>
  )
}

/* ---------- Antes de começar: lista de preparação ---------- */

const PREP_KEY = "vf_preparacao"

function usePreparacao(email: string) {
  const chave = `${PREP_KEY}:${email}`
  const [feitos, setFeitos] = React.useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(chave) || "[]"))
    } catch {
      return new Set()
    }
  })
  const alternar = (id: string) =>
    setFeitos((atual) => {
      const novo = new Set(atual)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      try {
        localStorage.setItem(chave, JSON.stringify([...novo]))
      } catch {
        /* vale só nesta sessão */
      }
      return novo
    })
  return { feitos, alternar }
}

/** Lembretes baixados na tela de lembretes também contam como feitos aqui. */
export function marcarPreparacao(email: string, id: string) {
  const chave = `${PREP_KEY}:${email}`
  try {
    const atual = new Set<string>(JSON.parse(localStorage.getItem(chave) || "[]"))
    atual.add(id)
    localStorage.setItem(chave, JSON.stringify([...atual]))
  } catch {
    /* sem armazenamento */
  }
}

function Preparacao({ s }: { s: AppState }) {
  const { feitos, alternar } = usePreparacao(s.customer.email)
  const temAdulto = s.profiles.some((p) => p.tipo === "adulto")
  const temKids = s.profiles.some((p) => p.tipo === "kids")
  const instalado = estaInstalado()

  const passos = [
    { id: "kit", texto: "Meu kit chegou", detalhe: "Se o kit atrasar, dá para mudar a data em Pessoas e datas.", to: "/pessoas" },
    { id: "lembretes", texto: "Colocar lembretes na agenda do celular", detalhe: "Um aviso na hora de cada dose.", to: "/lembretes" },
    { id: "compras", texto: "Separar a lista de compras", detalhe: "Temperos, frutas e fibras do Guia.", to: "/guia?secao=compras" },
    {
      id: "guia",
      texto: temAdulto ? "Ler o que comer no preparo" : "Ler a alimentação das crianças",
      detalhe: temAdulto && temKids ? "E a parte das crianças, logo depois." : "Leva 3 minutos.",
      to: temAdulto ? "/guia?secao=fases" : "/guia?secao=criancas",
    },
    ...(instalado ? [] : [{ id: "instalar", texto: "Colocar o app na tela inicial", detalhe: "Abre com um toque, como um aplicativo.", to: "/instalar" }]),
  ]
  const total = passos.length
  const prontos = passos.filter((p) => feitos.has(p.id)).length

  return (
    <section className="mt-4 rounded-panel border border-border bg-card p-5 animate-subir" aria-labelledby="t-prep">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="t-prep" className="text-[1.4rem] text-primary">
          Enquanto a lua não chega
        </h2>
        <span className="shrink-0 text-sm font-semibold text-muted-foreground">
          {prontos}/{total}
        </span>
      </div>
      <p className="mt-1 text-[14px] text-muted-foreground">Deixe tudo pronto para começar sem correria.</p>
      <ul className="mt-3 divide-y divide-border">
        {passos.map((p) => {
          const ok = feitos.has(p.id)
          return (
            <li key={p.id} className="flex items-center gap-3 py-2.5">
              <button
                type="button"
                role="checkbox"
                aria-checked={ok}
                aria-label={p.texto}
                onClick={() => alternar(p.id)}
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full border-2 transition-colors",
                  ok ? "border-primary bg-primary text-accent" : "border-[#b9c6b3] bg-white",
                )}
              >
                {ok && <Check className="size-4" strokeWidth={3} aria-hidden />}
              </button>
              <Link to={p.to} className="flex min-h-11 min-w-0 flex-1 items-center gap-2">
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-[15px] font-semibold leading-tight", ok ? "text-primary/60 line-through" : "text-primary")}>{p.texto}</span>
                  <span className="block text-[12.5px] text-muted-foreground">{p.detalhe}</span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
