import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ArrowRight, Check, Loader2, Moon, Plus, ShieldCheck, Trash2 } from "lucide-react"
import { GlowBackground } from "@/components/ui/glow-background"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { Logo } from "@/components/layout"
import { useApp } from "@/lib/app-state"
import { addDays, firstName, formatShort, formatWeekday } from "@/lib/dates"
import { newMoonsBefore } from "@/lib/moon"
import { luasSugeridas } from "@/lib/schedule"
import type { Produtos } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  CONTRAINDICACOES,
  CUIDADOS_GERAIS,
  PRODUTOS_IMG,
  REACOES_LEVES,
  type Faixa,
  type Tipo,
} from "@/content/protocolo"

type Opcao = "adulto" | Faixa
type Linha = { id: number; nome: string; opcao: Opcao }

const OPCOES: { valor: Opcao; rotulo: string; img: string }[] = [
  { valor: "adulto", rotulo: "Adulto", img: PRODUTOS_IMG.adulto },
  { valor: "2-4", rotulo: "Kids 2 a 4", img: PRODUTOS_IMG.kids24 },
  { valor: "5-9", rotulo: "Kids 5 a 9", img: PRODUTOS_IMG.kids59 },
]

let seq = 0
const nova = (opcao: Opcao, nome = ""): Linha => ({ id: ++seq, nome, opcao })

function sugerirPerfis(produtos: Produtos | null, nomeCliente: string): Linha[] {
  const p = produtos ?? { adulto: 0, kids_2_4: 0, kids_5_9: 0, familia: 0, oleo_alho: 0 }
  const adultos = p.adulto + 2 * p.familia
  const k24 = p.kids_2_4 + p.familia
  const k59 = p.kids_5_9 + p.familia
  const linhas: Linha[] = []
  for (let i = 0; i < adultos; i++) linhas.push(nova("adulto"))
  for (let i = 0; i < k24; i++) linhas.push(nova("2-4"))
  for (let i = 0; i < k59; i++) linhas.push(nova("5-9"))
  if (!linhas.length) linhas.push(nova("adulto"))
  linhas[0].nome = nomeCliente
  return linhas.slice(0, 10)
}

function Passos({ atual }: { atual: number }) {
  return (
    <div className="flex gap-1.5" aria-label={`Passo ${atual + 1} de 3`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={cn("h-1.5 flex-1 rounded-full", i <= atual ? "bg-accent" : "bg-white/20")} />
      ))}
    </div>
  )
}

export function CadastroScreen() {
  const { state, salvarPerfis } = useApp()
  const navigate = useNavigate()
  const hoje = state!.hoje
  const [passo, setPasso] = React.useState(0)
  const [linhas, setLinhas] = React.useState<Linha[]>(() =>
    sugerirPerfis(state!.customer.produtos, firstName(state!.customer.nome)),
  )
  const temAdulto = linhas.some((l) => l.opcao === "adulto")
  const temKids = linhas.some((l) => l.opcao !== "adulto")
  const sugeridas = React.useMemo(() => luasSugeridas(temAdulto, hoje), [temAdulto, hoje])
  const passadas = React.useMemo(
    () => newMoonsBefore(addDays(hoje, 1), 2).filter((l) => l >= addDays(hoje, -60)),
    [hoje],
  )
  const [jaComecei, setJaComecei] = React.useState(false)
  const [lua, setLua] = React.useState<string | null>(null)
  const [aceite, setAceite] = React.useState(false)
  const [salvando, setSalvando] = React.useState(false)
  const [erro, setErro] = React.useState<string | null>(null)

  const luaEscolhida = lua && (jaComecei ? passadas : sugeridas).includes(lua) ? lua : null
  const perfisOk = linhas.length > 0 && linhas.every((l) => l.nome.trim())

  function atualizar(id: number, patch: Partial<Linha>) {
    setLinhas((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  async function concluir() {
    if (!luaEscolhida) return
    setSalvando(true)
    setErro(null)
    try {
      await salvarPerfis(
        linhas.map((l) => ({
          tipo: (l.opcao === "adulto" ? "adulto" : "kids") as Tipo,
          nome: l.nome.trim(),
          faixa_etaria: l.opcao === "adulto" ? null : l.opcao,
        })),
        luaEscolhida,
      )
      navigate("/instalar", { replace: true })
    } catch {
      setErro("Não foi possível salvar agora. Confira a internet e tente de novo.")
      setSalvando(false)
    }
  }

  return (
    <GlowBackground tone="forest">
      <main className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col px-5 pb-safe pt-safe">
        <div className="flex items-center justify-between pt-4">
          <Logo tone="light" />
          {passo > 0 && (
            <button
              type="button"
              onClick={() => setPasso((p) => p - 1)}
              className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[#d5e2d0]"
            >
              <ArrowLeft className="size-4" aria-hidden /> Voltar
            </button>
          )}
        </div>
        <div className="mt-5">
          <Passos atual={passo} />
        </div>

        {passo === 0 && (
          <section className="mt-6 flex flex-1 animate-subir flex-col" aria-labelledby="t-quem">
            <p className="eyebrow text-accent">Passo 1 · Quem vai fazer</p>
            <h1 id="t-quem" className="mt-2 text-[2.1rem] text-white">
              Quem vai fazer o protocolo?
            </h1>
            <p className="mt-2 text-[15px] text-[#d5e2d0]">
              Já sugerimos pelo seu pedido. Cada pessoa ganha o próprio cronograma, com as doses da idade.
            </p>

            <ul className="mt-5 space-y-3">
              {linhas.map((l, i) => (
                <li key={l.id} className="glass-dark rounded-card p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={OPCOES.find((o) => o.valor === l.opcao)!.img}
                      alt=""
                      className="size-12 shrink-0 rounded-xl bg-white/10 object-contain"
                    />
                    <label className="sr-only" htmlFor={`nome-${l.id}`}>
                      Nome da pessoa {i + 1}
                    </label>
                    <input
                      id={`nome-${l.id}`}
                      value={l.nome}
                      maxLength={40}
                      onChange={(e) => atualizar(l.id, { nome: e.target.value })}
                      placeholder={l.opcao === "adulto" ? "Nome do adulto" : "Nome da criança"}
                      className="min-h-11 w-full min-w-0 rounded-full bg-white/10 px-4 text-[15px] text-white placeholder:text-white/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    />
                    {linhas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setLinhas((ls) => ls.filter((x) => x.id !== l.id))}
                        className="grid size-11 shrink-0 place-items-center rounded-full text-white/70 hover:bg-white/10"
                        aria-label={`Remover ${l.nome || `pessoa ${i + 1}`}`}
                      >
                        <Trash2 className="size-5" aria-hidden />
                      </button>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Protocolo">
                    {OPCOES.map((o) => (
                      <button
                        key={o.valor}
                        type="button"
                        role="radio"
                        aria-checked={l.opcao === o.valor}
                        onClick={() => atualizar(l.id, { opcao: o.valor })}
                        className={cn(
                          "min-h-11 rounded-full px-2 text-[13px] font-semibold transition-colors",
                          l.opcao === o.valor ? "bg-accent text-accent-foreground" : "bg-white/8 text-white/80",
                        )}
                      >
                        {o.rotulo}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>

            {linhas.length < 10 && (
              <button
                type="button"
                onClick={() => setLinhas((ls) => [...ls, nova("adulto")])}
                className="mt-3 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-dashed border-white/30 text-sm font-semibold text-white"
              >
                <Plus className="size-5" aria-hidden /> Adicionar pessoa
              </button>
            )}

            <div className="mt-auto pt-8 pb-2">
              <LiquidButton tone="lime" size="xl" className="w-full" disabled={!perfisOk} onClick={() => setPasso(1)}>
                Continuar <ArrowRight aria-hidden />
              </LiquidButton>
              {!perfisOk && <p className="mt-2 text-center text-xs text-[#d5e2d0]">Preencha o nome de cada pessoa.</p>}
            </div>
          </section>
        )}

        {passo === 1 && (
          <section className="mt-6 flex flex-1 animate-subir flex-col" aria-labelledby="t-lua">
            <p className="eyebrow text-accent">Passo 2 · Quando começar</p>
            <h1 id="t-lua" className="mt-2 text-[2.1rem] text-white">
              Em qual lua nova você começa?
            </h1>
            <p className="mt-2 text-[15px] text-[#d5e2d0]">
              {temAdulto
                ? "No adulto, o preparo do fígado começa 15 dias antes da lua nova. "
                : ""}
              {temKids ? "O Kids começa direto na lua nova. " : ""}
              Escolha uma data que dê tempo do kit chegar.
            </p>

            <div className="mt-5 space-y-3" role="radiogroup" aria-label="Lua nova">
              {(jaComecei ? passadas : sugeridas).map((l, i) => {
                const sel = luaEscolhida === l
                return (
                  <button
                    key={l}
                    type="button"
                    role="radio"
                    aria-checked={sel}
                    onClick={() => setLua(l)}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-card p-4 text-left transition-colors",
                      sel ? "bg-accent text-accent-foreground" : "glass-dark text-white",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-12 shrink-0 place-items-center rounded-full",
                        sel ? "bg-primary text-accent" : "bg-white/10 text-accent",
                      )}
                    >
                      <Moon className="size-6" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[17px] font-bold">{formatWeekday(l)}</span>
                        {!jaComecei && i === 0 && (
                          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", sel ? "bg-primary text-white" : "bg-accent text-accent-foreground")}>
                            Recomendada
                          </span>
                        )}
                      </span>
                      <span className={cn("mt-0.5 block text-[13px]", sel ? "text-accent-foreground/80" : "text-[#d5e2d0]")}>
                        {temAdulto && `Preparo do adulto a partir de ${formatShort(addDays(l, -15))}`}
                        {temAdulto && temKids && " · "}
                        {temKids && `Kids começa em ${formatShort(l)}`}
                      </span>
                    </span>
                    {sel && <Check className="size-6 shrink-0" aria-hidden />}
                  </button>
                )
              })}
            </div>

            {passadas.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setJaComecei((v) => !v)
                  setLua(null)
                }}
                className="mt-4 min-h-11 text-sm font-semibold text-accent underline underline-offset-4"
              >
                {jaComecei ? "Ver as próximas luas" : "Já comecei em uma lua anterior"}
              </button>
            )}

            <div className="mt-auto pt-8 pb-2">
              <LiquidButton tone="lime" size="xl" className="w-full" disabled={!luaEscolhida} onClick={() => setPasso(2)}>
                Continuar <ArrowRight aria-hidden />
              </LiquidButton>
            </div>
          </section>
        )}

        {passo === 2 && (
          <section className="mt-6 flex flex-1 animate-subir flex-col" aria-labelledby="t-seg">
            <p className="eyebrow text-accent">Passo 3 · Antes de começar</p>
            <h1 id="t-seg" className="mt-2 text-[2.1rem] text-white">
              Leia com atenção
            </h1>

            <div className="mt-5 space-y-3">
              {temAdulto && <Aviso titulo="Protocolo Adulto" itens={CONTRAINDICACOES.adulto} />}
              {temKids && <Aviso titulo="VermeFree Kids" itens={CONTRAINDICACOES.kids} />}
              <Aviso titulo="Para todos" itens={[...CUIDADOS_GERAIS, REACOES_LEVES]} />
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-card bg-white/10 p-4 text-[15px] text-white">
              <input
                type="checkbox"
                checked={aceite}
                onChange={(e) => setAceite(e.target.checked)}
                className="mt-0.5 size-6 shrink-0 accent-[#c0de96]"
              />
              Li as orientações e confirmo que ninguém aqui tem contraindicação, ou que já conversou com o médico ou pediatra.
            </label>

            {erro && (
              <p role="alert" className="mt-3 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white">
                {erro}
              </p>
            )}

            <div className="mt-auto pt-8 pb-2">
              <LiquidButton tone="lime" size="xl" className="w-full" disabled={!aceite || salvando} onClick={concluir}>
                {salvando ? <Loader2 className="animate-spin" aria-hidden /> : <ShieldCheck aria-hidden />}
                {salvando ? "Montando seu cronograma" : "Montar meu cronograma"}
              </LiquidButton>
            </div>
          </section>
        )}
      </main>
    </GlowBackground>
  )
}

function Aviso({ titulo, itens }: { titulo: string; itens: string[] }) {
  return (
    <div className="glass-dark rounded-card p-4">
      <h2 className="font-sans text-[15px] font-bold tracking-normal text-accent">{titulo}</h2>
      <ul className="mt-2 space-y-1.5 text-[14px] leading-snug text-[#e6efe3]">
        {itens.map((t) => (
          <li key={t} className="flex gap-2">
            <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  )
}

