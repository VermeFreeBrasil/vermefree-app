import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { PageHeader } from "@/components/layout"
import { cn } from "@/lib/utils"
import { GUIA, GUIA_RODAPE, type Bloco } from "@/content/guia"

const COMPRAS_KEY = "vf_guia_compras"

function useCompras() {
  const [marcados, setMarcados] = React.useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(COMPRAS_KEY) || "[]"))
    } catch {
      return new Set()
    }
  })
  const alternar = (item: string) =>
    setMarcados((atual) => {
      const novo = new Set(atual)
      if (novo.has(item)) novo.delete(item)
      else novo.add(item)
      try {
        localStorage.setItem(COMPRAS_KEY, JSON.stringify([...novo]))
      } catch {
        /* lista vale só nesta sessão */
      }
      return novo
    })
  return [marcados, alternar] as const
}

export function GuiaScreen() {
  const [aberta, setAberta] = React.useState<string | null>(GUIA[0].id)
  return (
    <>
      <PageHeader eyebrow="Lançamento · adultos e crianças" titulo="Guia de Alimentos Antiparasitários">
        <p className="mt-2 text-[15px] text-muted-foreground">
          O que colocar no prato antes, durante e depois do seu protocolo VermeFree.
        </p>
      </PageHeader>

      <div className="space-y-3">
        {GUIA.map((secao, i) => {
          const isOpen = aberta === secao.id
          return (
            <section key={secao.id} className="animate-subir overflow-hidden rounded-panel border border-border bg-card" style={{ animationDelay: `${i * 30}ms` }}>
              <h2 className="font-sans text-base tracking-normal">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`sec-${secao.id}`}
                  onClick={() => setAberta(isOpen ? null : secao.id)}
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
                <div id={`sec-${secao.id}`} className="space-y-3 px-5 pb-5">
                  {secao.blocos.map((b, j) => (
                    <BlocoView key={j} bloco={b} />
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>
      <p className="mt-6 px-1 text-[12.5px] text-muted-foreground">VermeFree · Guia de Alimentos Antiparasitários · {GUIA_RODAPE}</p>
    </>
  )
}

function BlocoView({ bloco }: { bloco: Bloco }) {
  const [compras, alternar] = useCompras()
  switch (bloco.tipo) {
    case "p":
      return <p className="text-[15px] text-foreground">{bloco.texto}</p>
    case "destaque":
      return <p className="rounded-card bg-selected p-4 text-[14.5px] text-primary">{bloco.texto}</p>
    case "lista":
      return (
        <ul className="space-y-2 text-[15px] text-foreground">
          {bloco.itens.map((t) => (
            <li key={t} className="flex gap-2.5">
              <span aria-hidden className="mt-[10px] size-1.5 shrink-0 rounded-full bg-leaf" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      )
    case "tabela":
      // No celular, cada linha vira um card: mais legível do que uma tabela larga.
      return (
        <ul className="space-y-2">
          {bloco.linhas.map((linha) => (
            <li key={linha[0]} className="rounded-card border border-border bg-background p-3.5">
              <p className="font-bold text-primary">{linha[0]}</p>
              {linha.slice(1).map((cel, k) => (
                <p key={k} className="mt-1 text-[14px] text-foreground">
                  {bloco.colunas.length > 2 && <span className="font-semibold text-muted-foreground">{bloco.colunas[k + 1]}: </span>}
                  {cel}
                </p>
              ))}
            </li>
          ))}
        </ul>
      )
    case "compras":
      return (
        <div className="space-y-4">
          {bloco.grupos.map((g) => (
            <div key={g.nome}>
              <h3 className="eyebrow mb-2 font-sans text-muted-foreground">{g.nome}</h3>
              <div className="flex flex-wrap gap-2">
                {g.itens.map((item) => {
                  const ok = compras.has(item)
                  return (
                    <button
                      key={item}
                      type="button"
                      role="checkbox"
                      aria-checked={ok}
                      onClick={() => alternar(item)}
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
        </div>
      )
  }
}
