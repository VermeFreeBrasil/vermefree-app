import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ArrowRight, ChevronDown, Loader2, Plus, ShieldCheck, Trash2 } from "lucide-react"
import { GlowBackground } from "@/components/ui/glow-background"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { Logo } from "@/components/layout"
import { Avatar } from "@/components/protocolo"
import { EscolhaLua } from "@/components/escolha-lua"
import { useApp } from "@/lib/app-state"
import { chaveDoPedido, pedidoRecente } from "@/lib/pedido"
import { firstName } from "@/lib/dates"
import type { Produtos } from "@/lib/api"
import { cn } from "@/lib/utils"
import { CONTRAINDICACOES, CUIDADOS_GERAIS, REACOES_LEVES, type Faixa, type Tipo } from "@/content/protocolo"

export type Opcao = "adulto" | Faixa
export type Linha = { id: number; nome: string; opcao: Opcao }

export const OPCOES: { valor: Opcao; rotulo: string }[] = [
  { valor: "adulto", rotulo: "Adulto" },
  { valor: "2-4", rotulo: "Kids 2 a 4" },
  { valor: "5-9", rotulo: "Kids 5 a 9" },
]

let seq = 0
export const novaLinha = (opcao: Opcao, nome = ""): Linha => ({ id: ++seq, nome, opcao })

export function paraPerfil(l: Linha) {
  return {
    tipo: (l.opcao === "adulto" ? "adulto" : "kids") as Tipo,
    nome: l.nome.trim(),
    faixa_etaria: l.opcao === "adulto" ? null : l.opcao,
  }
}

function sugerirPerfis(produtos: Produtos | null, nomeCliente: string): Linha[] {
  const p = produtos ?? { adulto: 0, kids_2_4: 0, kids_5_9: 0, familia: 0, oleo_alho: 0 }
  const linhas: Linha[] = []
  for (let i = 0; i < p.adulto + 2 * p.familia; i++) linhas.push(novaLinha("adulto"))
  for (let i = 0; i < p.kids_2_4 + p.familia; i++) linhas.push(novaLinha("2-4"))
  for (let i = 0; i < p.kids_5_9 + p.familia; i++) linhas.push(novaLinha("5-9"))
  if (!linhas.length) linhas.push(novaLinha("adulto"))
  linhas[0].nome = nomeCliente
  return linhas.slice(0, 10)
}

/** "Kit Família e 1 Kids 5 a 9" — o que veio no pedido, para explicar a sugestão. */
function descreverPedido(produtos: Produtos | null) {
  if (!produtos) return null
  const partes: string[] = []
  const n = (q: number, um: string, varios: string) => (q === 1 ? `1 ${um}` : `${q} ${varios}`)
  if (produtos.familia) partes.push(n(produtos.familia, "Kit Família", "Kits Família"))
  if (produtos.adulto) partes.push(n(produtos.adulto, "Adulto", "Adultos"))
  if (produtos.kids_2_4) partes.push(n(produtos.kids_2_4, "Kids 2 a 4", "Kids 2 a 4"))
  if (produtos.kids_5_9) partes.push(n(produtos.kids_5_9, "Kids 5 a 9", "Kids 5 a 9"))
  if (!partes.length) return null
  return partes.length === 1 ? partes[0] : `${partes.slice(0, -1).join(", ")} e ${partes[partes.length - 1]}`
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

/** Editor de uma pessoa: nome + tipo de protocolo. Usado no cadastro e em Pessoas e datas. */
export function EditorPessoa({
  linha,
  indice,
  podeRemover,
  mostrarErro,
  onChange,
  onRemover,
  tom = "escuro",
}: {
  linha: Linha
  indice: number
  podeRemover: boolean
  mostrarErro: boolean
  onChange: (patch: Partial<Linha>) => void
  onRemover: () => void
  tom?: "escuro" | "claro"
}) {
  const escuro = tom === "escuro"
  const semNome = mostrarErro && !linha.nome.trim()
  return (
    <div className={cn("rounded-card p-4", escuro ? "glass-dark" : "border border-border bg-card")}>
      <div className="flex items-center gap-3">
        <Avatar nome={linha.nome || (linha.opcao === "adulto" ? "A" : "K")} tom={escuro ? "escuro" : "claro"} />
        <label className="sr-only" htmlFor={`nome-${linha.id}`}>
          Nome da pessoa {indice + 1}
        </label>
        <input
          id={`nome-${linha.id}`}
          value={linha.nome}
          maxLength={40}
          onChange={(e) => onChange({ nome: e.target.value })}
          placeholder={linha.opcao === "adulto" ? "Nome do adulto" : "Nome da criança"}
          aria-invalid={semNome}
          aria-describedby={semNome ? `erro-${linha.id}` : undefined}
          className={cn(
            "min-h-11 w-full min-w-0 rounded-full px-4 text-[15px] focus:outline-none focus-visible:ring-2",
            escuro
              ? "bg-white/10 text-white placeholder:text-white/45 focus-visible:ring-accent"
              : "bg-background text-primary placeholder:text-muted-foreground focus-visible:ring-leaf",
            semNome && "ring-2 ring-[#f0a58f]",
          )}
        />
        {podeRemover && (
          <button
            type="button"
            onClick={onRemover}
            className={cn("grid size-11 shrink-0 place-items-center rounded-full", escuro ? "text-white/70 hover:bg-white/10" : "text-muted-foreground hover:bg-secondary")}
            aria-label={`Remover ${linha.nome || `pessoa ${indice + 1}`}`}
          >
            <Trash2 className="size-5" aria-hidden />
          </button>
        )}
      </div>
      {semNome && (
        <p id={`erro-${linha.id}`} className={cn("mt-2 pl-14 text-[13px] font-semibold", escuro ? "text-[#f6c4b5]" : "text-destructive")}>
          Falta o nome
        </p>
      )}
      <div className="mt-3 grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Protocolo">
        {OPCOES.map((o) => (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={linha.opcao === o.valor}
            onClick={() => onChange({ opcao: o.valor })}
            className={cn(
              "min-h-11 rounded-full px-2 text-[13px] font-semibold transition-colors",
              linha.opcao === o.valor
                ? escuro
                  ? "bg-accent text-accent-foreground"
                  : "bg-primary text-white"
                : escuro
                  ? "bg-white/8 text-white/80"
                  : "bg-secondary text-primary",
            )}
          >
            {o.rotulo}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Cuidados antes de começar: o essencial à vista e o resto num "ver todos". */
export function Cuidados({ temAdulto, temKids, tom = "escuro" }: { temAdulto: boolean; temKids: boolean; tom?: "escuro" | "claro" }) {
  const [todos, setTodos] = React.useState(false)
  const escuro = tom === "escuro"
  const essenciais = [
    ...(temAdulto ? [CONTRAINDICACOES.adulto[0]] : []),
    ...(temKids ? [CONTRAINDICACOES.kids[0]] : []),
    temAdulto ? CONTRAINDICACOES.adulto[1] : CONTRAINDICACOES.kids[1],
    ...(temAdulto ? [CONTRAINDICACOES.adulto[3]] : [CONTRAINDICACOES.kids[2]]),
  ]
  const grupos = [
    ...(temAdulto ? [{ titulo: "Protocolo Adulto", itens: CONTRAINDICACOES.adulto }] : []),
    ...(temKids ? [{ titulo: "VermeFree Kids", itens: CONTRAINDICACOES.kids }] : []),
    { titulo: "Para todos", itens: [...CUIDADOS_GERAIS, REACOES_LEVES] },
  ]
  const item = (t: string) => (
    <li key={t} className="flex gap-2">
      <span aria-hidden className={cn("mt-[7px] size-1.5 shrink-0 rounded-full", escuro ? "bg-accent" : "bg-leaf")} />
      {t}
    </li>
  )
  return (
    <div className={cn("rounded-card p-4", escuro ? "glass-dark" : "border border-border bg-card")}>
      {!todos ? (
        <ul className={cn("space-y-2 text-[14.5px] leading-snug", escuro ? "text-[#e6efe3]" : "text-foreground")}>{essenciais.map(item)}</ul>
      ) : (
        <div className="space-y-4">
          {grupos.map((g) => (
            <div key={g.titulo}>
              <h2 className={cn("font-sans text-[14px] font-bold tracking-normal", escuro ? "text-accent" : "text-primary")}>{g.titulo}</h2>
              <ul className={cn("mt-1.5 space-y-1.5 text-[14px] leading-snug", escuro ? "text-[#e6efe3]" : "text-foreground")}>{g.itens.map(item)}</ul>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        aria-expanded={todos}
        onClick={() => setTodos((v) => !v)}
        className={cn("mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold", escuro ? "text-accent" : "text-leaf")}
      >
        {todos ? "Ver só o essencial" : "Ver todos os cuidados"}
        <ChevronDown className={cn("size-4 transition-transform", todos && "rotate-180")} aria-hidden />
      </button>
    </div>
  )
}

export function CadastroScreen() {
  const { state, salvarPerfis, pedidos, carregarPedidos } = useApp()
  const navigate = useNavigate()
  React.useEffect(() => {
    carregarPedidos()
  }, [carregarPedidos])
  const recente = pedidoRecente(pedidos)
  const kitEntregue = recente ? chaveDoPedido(recente) === "entregue" : false
  const hoje = state!.hoje
  const [passo, setPasso] = React.useState(0)
  const [linhas, setLinhas] = React.useState<Linha[]>(() => sugerirPerfis(state!.customer.produtos, firstName(state!.customer.nome)))
  const [tentou, setTentou] = React.useState(false)
  const [lua, setLua] = React.useState<string | null>(null)
  const [aceite, setAceite] = React.useState(false)
  const [salvando, setSalvando] = React.useState(false)
  const [erro, setErro] = React.useState<string | null>(null)

  const temAdulto = linhas.some((l) => l.opcao === "adulto")
  const temKids = linhas.some((l) => l.opcao !== "adulto")
  const perfisOk = linhas.length > 0 && linhas.every((l) => l.nome.trim())
  const pedido = descreverPedido(state!.customer.produtos)

  function atualizar(id: number, patch: Partial<Linha>) {
    setLinhas((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  function continuarPessoas() {
    if (perfisOk) return setPasso(1)
    setTentou(true)
    const vazio = linhas.find((l) => !l.nome.trim())
    if (vazio) document.getElementById(`nome-${vazio.id}`)?.focus()
  }

  async function concluir() {
    if (!lua) return
    setSalvando(true)
    setErro(null)
    try {
      await salvarPerfis(linhas.map(paraPerfil), lua)
      navigate("/instalar", { replace: true })
    } catch {
      setErro("Não foi possível salvar agora. Confira a internet e tente de novo.")
      setSalvando(false)
    }
  }

  return (
    <GlowBackground tone="forest">
      <main className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col px-5 pt-safe">
        <div className="flex min-h-11 items-center justify-between pt-4">
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
              {pedido ? (
                <>
                  Pelo seu pedido (<span className="font-semibold text-white">{pedido}</span>), já deixamos as pessoas abaixo. Ajuste os nomes e as idades.
                </>
              ) : (
                "Cada pessoa ganha o próprio cronograma, com as doses da idade."
              )}
            </p>

            <ul className="mt-5 space-y-3">
              {linhas.map((l, i) => (
                <li key={l.id}>
                  <EditorPessoa
                    linha={l}
                    indice={i}
                    podeRemover={linhas.length > 1}
                    mostrarErro={tentou}
                    onChange={(patch) => atualizar(l.id, patch)}
                    onRemover={() => setLinhas((ls) => ls.filter((x) => x.id !== l.id))}
                  />
                </li>
              ))}
            </ul>

            {linhas.length < 10 && (
              <button
                type="button"
                onClick={() => setLinhas((ls) => [...ls, novaLinha("adulto")])}
                className="mt-3 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-dashed border-white/30 text-sm font-semibold text-white"
              >
                <Plus className="size-5" aria-hidden /> Adicionar pessoa
              </button>
            )}

            <Rodape>
              <LiquidButton tone="lime" size="xl" className="w-full" onClick={continuarPessoas}>
                Continuar <ArrowRight aria-hidden />
              </LiquidButton>
            </Rodape>
          </section>
        )}

        {passo === 1 && (
          <section className="mt-6 flex flex-1 animate-subir flex-col" aria-labelledby="t-lua">
            <p className="eyebrow text-accent">Passo 2 · Quando começar</p>
            <h1 id="t-lua" className="mt-2 text-[2.1rem] text-white">
              Em qual lua nova você começa?
            </h1>
            <p className="mt-2 text-[15px] text-[#d5e2d0]">
              O protocolo começa sempre na lua nova.
              {temAdulto ? " No adulto, o preparo do fígado vem antes: 15 dias de Silimarina." : ""}
            </p>

            <div className="mt-5">
              <EscolhaLua temAdulto={temAdulto} temKids={temKids} hoje={hoje} valor={lua} onChange={setLua} kitEntregue={kitEntregue} />
            </div>

            <Rodape>
              <LiquidButton tone="lime" size="xl" className="w-full" disabled={!lua} onClick={() => setPasso(2)}>
                Continuar <ArrowRight aria-hidden />
              </LiquidButton>
              {!lua && <p className="mt-2 text-center text-xs text-[#d5e2d0]">Escolha uma lua nova para continuar.</p>}
            </Rodape>
          </section>
        )}

        {passo === 2 && (
          <section className="mt-6 flex flex-1 animate-subir flex-col" aria-labelledby="t-seg">
            <p className="eyebrow text-accent">Passo 3 · Antes de começar</p>
            <h1 id="t-seg" className="mt-2 text-[2.1rem] text-white">
              Leia com atenção
            </h1>
            <p className="mt-2 text-[15px] text-[#d5e2d0]">O protocolo não é indicado nestes casos:</p>

            <div className="mt-4">
              <Cuidados temAdulto={temAdulto} temKids={temKids} />
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-card bg-white/10 p-4 text-[15px] text-white">
              <input
                type="checkbox"
                checked={aceite}
                onChange={(e) => setAceite(e.target.checked)}
                className="mt-0.5 size-6 shrink-0 accent-[#c0de96]"
              />
              Li os cuidados. Ninguém aqui tem contraindicação, ou já falamos com o médico ou pediatra.
            </label>

            {erro && (
              <p role="alert" className="mt-3 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white">
                {erro}
              </p>
            )}

            <Rodape>
              <LiquidButton tone="lime" size="xl" className="w-full" disabled={!aceite || salvando} onClick={concluir}>
                {salvando ? <Loader2 className="animate-spin" aria-hidden /> : <ShieldCheck aria-hidden />}
                {salvando ? "Montando seu cronograma" : "Montar meu cronograma"}
              </LiquidButton>
            </Rodape>
          </section>
        )}
      </main>
    </GlowBackground>
  )
}

/** Botão principal sempre à vista no pé da tela, com o verde da marca por trás. */
function Rodape({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 -mx-5 mt-auto bg-gradient-to-t from-[#173f2c] from-60% to-transparent px-5 pb-safe pt-8">{children}</div>
  )
}
