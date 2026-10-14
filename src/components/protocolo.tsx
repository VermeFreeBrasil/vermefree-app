import * as React from "react"
import { Check, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { FASE_INFO, MOMENTOS, type Fase, type Item, type Momento } from "@/content/protocolo"
import type { Profile } from "@/lib/api"

export function rotuloPerfil(p: Profile) {
  return p.tipo === "adulto" ? "Adulto" : `Kids ${p.faixa_etaria === "2-4" ? "2 a 4" : "5 a 9"} anos`
}

const CORES_FASE: Record<Fase, string> = {
  aguardando: "bg-white/15 text-white",
  preparo: "bg-[#e9d9b0] text-[#5b4410]",
  protocolo: "bg-accent text-accent-foreground",
  manutencao: "bg-white/15 text-white",
}

export function FaseBadge({ fase }: { fase: Fase }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-bold", CORES_FASE[fase])}>
      {fase === "aguardando" && <Moon className="size-3.5" aria-hidden />}
      {FASE_INFO[fase].nome}
    </span>
  )
}

export function Progresso({ valor, total, claro = false }: { valor: number; total: number; claro?: boolean }) {
  const pct = total ? Math.round((valor / total) * 100) : 0
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={valor}
      className={cn("h-2 w-full overflow-hidden rounded-full", claro ? "bg-white/15" : "bg-border")}
    >
      <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Checklist({
  itens,
  feito,
  onToggle,
}: {
  itens: Item[]
  feito: (item: Item) => boolean
  onToggle: (item: Item, done: boolean) => void
}) {
  const grupos = React.useMemo(() => {
    const ordem: Momento[] = ["manha", "almoco", "noite", "dia"]
    return ordem
      .map((m) => ({ momento: m, itens: itens.filter((i) => i.momento === m) }))
      .filter((g) => g.itens.length)
  }, [itens])

  return (
    <div className="space-y-4">
      {grupos.map((g) => (
        <div key={g.momento}>
          <h3 className="eyebrow mb-2 font-sans text-muted-foreground">{MOMENTOS[g.momento]}</h3>
          <ul className="space-y-2">
            {g.itens.map((item) => {
              const ok = feito(item)
              return (
                <li key={item.key}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={ok}
                    onClick={() => onToggle(item, !ok)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-card border p-3.5 text-left transition-colors duration-200",
                      ok ? "border-selected-border/30 bg-selected" : "border-border bg-card",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border-2 transition-colors",
                        ok ? "border-primary bg-primary text-accent" : "border-[#b9c6b3] bg-white",
                      )}
                    >
                      {ok && <Check className="size-4" strokeWidth={3} aria-hidden />}
                    </span>
                    <span className="min-w-0">
                      <span className={cn("block text-[15px] font-bold leading-tight", ok ? "text-primary/70 line-through decoration-primary/30" : "text-primary")}>
                        {item.titulo}
                      </span>
                      <span className="mt-1 block text-[13.5px] leading-snug text-foreground">{item.dose}</span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">{item.quando}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

export function PerfilChips({
  perfis,
  atual,
  onChange,
}: {
  perfis: Profile[]
  atual: string
  onChange: (id: string) => void
}) {
  if (perfis.length < 2) return null
  return (
    <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" role="tablist" aria-label="Pessoa">
      {perfis.map((p) => (
        <button
          key={p.id}
          type="button"
          role="tab"
          aria-selected={p.id === atual}
          onClick={() => onChange(p.id)}
          className={cn(
            "min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors",
            p.id === atual ? "bg-primary text-white" : "glass text-primary",
          )}
        >
          {p.nome}
        </button>
      ))}
    </div>
  )
}

/** Pessoa selecionada nas abas Hoje e Cronograma (lembrada entre as abas). */
export function usePerfilAtual(perfis: Profile[]) {
  const [id, setId] = React.useState<string>(() => {
    try {
      return sessionStorage.getItem("vf_perfil") || ""
    } catch {
      return ""
    }
  })
  const atual = perfis.find((p) => p.id === id) ?? perfis[0]
  const trocar = (novo: string) => {
    setId(novo)
    try {
      sessionStorage.setItem("vf_perfil", novo)
    } catch {
      /* sem armazenamento: segue só na memória */
    }
  }
  return [atual, trocar] as const
}
