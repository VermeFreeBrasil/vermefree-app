import * as React from "react"
import { useSearchParams } from "react-router-dom"
import { Check, ChevronDown, FileDown, Lightbulb, MessageCircle, RotateCcw, ShoppingBasket } from "lucide-react"
import { PageHeader } from "@/components/layout"
import { IconeBolha } from "@/components/icones"
import { cn } from "@/lib/utils"
import { GUIA, GUIA_PDF, GUIA_SUBTITULO, GUIA_TITULO, separarRotulo, type Bloco } from "@/content/guia"
import { LINKS } from "@/content/protocolo"

const COMPRAS_KEY = "vf_guia_compras"

function useCompras() {
  const [marcados, setMarcados] = React.useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(COMPRAS_KEY) || "[]"))
    } catch {
      return new Set()
    }
  })
  const salvar = (novo: Set<string>) => {
    try {
      localStorage.setItem(COMPRAS_KEY, JSON.stringify([...novo]))
    } catch {
      /* lista vale só nesta sessão */
    }
    return novo
  }
  const alternar = (item: string) =>
    setMarcados((atual) => {
      const novo = new Set(atual)
      if (novo.has(item)) novo.delete(item)
      else novo.add(item)
      return salvar(novo)
    })
  const limpar = () => setMarcados(salvar(new Set()))
  return { marcados, alternar, limpar }
}

type Compras = ReturnType<typeof useCompras>

const TOTAL_COMPRAS = GUIA.flatMap((s) => s.blocos)
  .flatMap((b) => (b.tipo === "compras" ? b.grupos.flatMap((g) => g.itens) : []))
  .length

export function GuiaScreen() {
  const [params] = useSearchParams()
  const pedida = params.get("secao")
  const [aberta, setAberta] = React.useState<string | null>(() =>
    pedida && GUIA.some((s) => s.id === pedida) ? pedida : GUIA[0].id,
  )
  const compras = useCompras()

  const abrir = React.useCallback((id: string) => {
    setAberta(id)
    requestAnimationFrame(() => document.getElementById(`secao-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }))
  }, [])

  // Vindo de um atalho do Hoje (?secao=fases), abre e rola até a seção.
  React.useEffect(() => {
    if (pedida && GUIA.some((s) => s.id === pedida)) abrir(pedida)
  }, [pedida, abrir])

  return (
    <>
      <PageHeader eyebrow="Seu guia" titulo={GUIA_TITULO}>
        <p className="mt-2 text-[15px] text-muted-foreground">{GUIA_SUBTITULO}.</p>
      </PageHeader>

      <div className="mb-4 grid grid-cols-2 gap-2 animate-subir">
        <button
          type="button"
          onClick={() => abrir("compras")}
          className="flex min-h-[72px] items-center gap-3 rounded-card bg-primary p-3.5 text-left text-white"
        >
          <ShoppingBasket className="size-6 shrink-0 text-accent" aria-hidden />
          <span className="min-w-0">
            <span className="block text-[14.5px] font-bold leading-tight">Lista de compras</span>
            <span className="block text-[12.5px] text-[#d5e2d0]">
              {compras.marcados.size ? `${compras.marcados.size} de ${TOTAL_COMPRAS} na cozinha` : `${TOTAL_COMPRAS} itens`}
            </span>
          </span>
        </button>
        <a
          href={GUIA_PDF}
          download="Guia de Alimentos VermeFree.pdf"
          className="flex min-h-[72px] items-center gap-3 rounded-card border border-border bg-card p-3.5 text-left text-primary"
        >
          <FileDown className="size-6 shrink-0 text-leaf" aria-hidden />
          <span className="min-w-0">
            <span className="block text-[14.5px] font-bold leading-tight">Baixar em PDF</span>
            <span className="block text-[12.5px] text-muted-foreground">Para salvar ou imprimir</span>
          </span>
        </a>
      </div>

      <div className="space-y-3">
        {GUIA.map((secao, i) => {
          const isOpen = aberta === secao.id
          return (
            <section
              key={secao.id}
              id={`secao-${secao.id}`}
              className="animate-subir scroll-mt-4 overflow-hidden rounded-panel border border-border bg-card"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <h2 className="font-sans text-base tracking-normal">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`sec-${secao.id}`}
                  onClick={() => (isOpen ? setAberta(null) : abrir(secao.id))}
                  className="flex w-full items-center gap-3 p-5 text-left"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-selected font-display text-[15px] text-primary">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[1.25rem] leading-tight text-primary">{secao.titulo}</span>
                    <span className="mt-0.5 block text-[13px] font-normal text-muted-foreground">{secao.subtitulo}</span>
                  </span>
                  <ChevronDown
                    className={cn("size-5 shrink-0 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")}
                    aria-hidden
                  />
                </button>
              </h2>
              {isOpen && (
                <div id={`sec-${secao.id}`} className="space-y-4 px-5 pb-5">
                  {secao.blocos.map((b, j) => (
                    <BlocoView key={j} bloco={b} secao={secao.id} compras={compras} />
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>

      <section className="mt-4 flex items-center gap-3 rounded-panel bg-selected p-5">
        <MessageCircle className="size-6 shrink-0 text-leaf" aria-hidden />
        <p className="flex-1 text-[14.5px] text-primary">
          <span className="font-bold">Ficou com dúvida?</span> Tem pessoa de verdade respondendo do outro lado.
        </p>
        <a
          href={LINKS.atendimento}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-primary px-4 text-sm font-semibold text-white"
        >
          WhatsApp
        </a>
      </section>
    </>
  )
}

function ItemLista({ texto, children }: { texto: string; children: React.ReactNode }) {
  const [rotulo, resto] = separarRotulo(texto)
  return (
    <li className="flex items-start gap-3">
      {children}
      <span className="min-w-0 pt-0.5 text-[15px] text-foreground">
        {rotulo && <span className="font-bold text-primary">{rotulo}: </span>}
        {resto}
      </span>
    </li>
  )
}

function BlocoView({ bloco, secao, compras }: { bloco: Bloco; secao: string; compras: Compras }) {
  switch (bloco.tipo) {
    case "p":
      return <p className="text-[15px] text-foreground">{bloco.texto}</p>
    case "subtitulo":
      return <h3 className="pt-1 text-[1.15rem] text-primary">{bloco.texto}</h3>
    case "destaque":
      return <p className="rounded-card bg-selected p-4 text-[14.5px] text-primary">{bloco.texto}</p>
    case "dica":
      return (
        <div className="flex gap-3 rounded-card bg-accent/45 p-4">
          <Lightbulb className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <p className="text-[14.5px] text-primary">
            <span className="font-bold">{bloco.titulo}: </span>
            {bloco.texto}
          </p>
        </div>
      )
    case "lista":
      return (
        <ul className="space-y-3">
          {bloco.itens.map((t, k) => (
            <ItemLista key={t} texto={t}>
              {bloco.icones?.[k] ? (
                <IconeBolha icone={bloco.icones[k]} tom={secao === "reduzir" ? "areia" : "verde"} className="size-9" />
              ) : (
                <span aria-hidden className="mt-[10px] size-1.5 shrink-0 rounded-full bg-leaf" />
              )}
            </ItemLista>
          ))}
        </ul>
      )
    case "momentos":
      return (
        <ol className="grid grid-cols-3 gap-2">
          {bloco.itens.map((m, k) => (
            <li key={m.rotulo} className="rounded-card bg-background p-3">
              <span className="eyebrow block text-leaf">{k + 1}. {m.rotulo}</span>
              <span className="mt-1 block text-[13px] leading-snug text-foreground">{m.texto}</span>
            </li>
          ))}
        </ol>
      )
    case "alimentos":
      return (
        <ul className="grid gap-2 sm:grid-cols-2">
          {bloco.itens.map((a) => (
            <li key={a.nome} className="flex gap-3 rounded-card border border-border bg-background p-3.5">
              <IconeBolha icone={a.icone} />
              <span className="min-w-0">
                <span className="block font-bold leading-tight text-primary">{a.nome}</span>
                <span className="mt-1 block text-[13.5px] leading-snug text-foreground">{a.texto}</span>
              </span>
            </li>
          ))}
        </ul>
      )
    case "grupos":
      return (
        <ul className="space-y-2">
          {bloco.itens.map((g) => (
            <li key={g.nome} className="flex gap-3 rounded-card border border-border bg-background p-3.5">
              <IconeBolha icone={g.icone} />
              <span className="min-w-0">
                <span className="block font-bold leading-tight text-primary">{g.nome}</span>
                <span className="mt-1 block text-[13.5px] leading-snug text-foreground">{g.exemplos}</span>
                <span className="mt-1 block text-[13px] leading-snug text-muted-foreground">{g.porque}</span>
              </span>
            </li>
          ))}
        </ul>
      )
    case "fases":
      return (
        <div className="space-y-3">
          {bloco.fases.map((f, k) => (
            <div key={f.rotulo} className={cn("rounded-card p-4", k === 0 ? "bg-[#f7f0dd]" : "bg-selected")}>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-bold", k === 0 ? "bg-[#e9d9b0] text-[#5b4410]" : "bg-accent text-accent-foreground")}>
                  {f.rotulo}
                </span>
                <span className="text-[12.5px] font-semibold text-muted-foreground">{f.quando}</span>
              </div>
              <h4 className="mt-2 font-display text-[1.2rem] leading-tight text-primary">{f.titulo}</h4>
              <p className="mt-1.5 text-[14px] text-foreground">{f.intro}</p>
              <ul className="mt-2 space-y-1.5">
                {f.itens.map((t) => (
                  <li key={t} className="flex gap-2 text-[14px] text-foreground">
                    <Check className="mt-1 size-4 shrink-0 text-leaf" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )
    case "cardapio":
      return <Cardapio refeicoes={bloco.refeicoes} />
    case "compras":
      return (
        <div className="space-y-4">
          {bloco.grupos.map((g) => (
            <div key={g.nome}>
              <h3 className="eyebrow mb-2 font-sans text-muted-foreground">{g.nome}</h3>
              <div className="flex flex-wrap gap-2">
                {g.itens.map((item) => {
                  const ok = compras.marcados.has(item)
                  return (
                    <button
                      key={item}
                      type="button"
                      role="checkbox"
                      aria-checked={ok}
                      onClick={() => compras.alternar(item)}
                      className={cn(
                        "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-[14px] font-semibold transition-colors",
                        ok ? "border-primary bg-primary text-white" : "border-border bg-background text-primary",
                      )}
                    >
                      {ok && <Check className="size-4" aria-hidden />}
                      {item}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          {compras.marcados.size > 0 && (
            <button
              type="button"
              onClick={compras.limpar}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground"
            >
              <RotateCcw className="size-4" aria-hidden /> Começar a lista de novo
            </button>
          )}
        </div>
      )
  }
}

function Cardapio({ refeicoes }: { refeicoes: { nome: string; adulto: string; crianca: string }[] }) {
  const [quem, setQuem] = React.useState<"adulto" | "crianca">("adulto")
  return (
    <div>
      <div role="tablist" aria-label="Cardápio para" className="mb-3 inline-flex rounded-full bg-background p-1">
        {(["adulto", "crianca"] as const).map((q) => (
          <button
            key={q}
            type="button"
            role="tab"
            aria-selected={quem === q}
            onClick={() => setQuem(q)}
            className={cn(
              "min-h-10 rounded-full px-5 text-sm font-semibold transition-colors",
              quem === q ? "bg-primary text-white" : "text-muted-foreground",
            )}
          >
            {q === "adulto" ? "Adulto" : "Criança"}
          </button>
        ))}
      </div>
      <ol className="relative space-y-3 border-l-2 border-selected pl-4">
        {refeicoes.map((r) => (
          <li key={r.nome} className="relative">
            <span aria-hidden className="absolute -left-[23px] top-1.5 size-3 rounded-full border-2 border-white bg-leaf" />
            <span className="eyebrow block text-leaf">{r.nome}</span>
            <span className="mt-0.5 block text-[14.5px] text-foreground">{quem === "adulto" ? r.adulto : r.crianca}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
