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

/** Uma linha do checklist: o item do protocolo e, na visão da família, de quem é. */
export type Linha = { id: string; item: Item; pessoa?: string }

export function Checklist({
  linhas,
  feito,
  onToggle,
}: {
  linhas: Linha[]
  feito: (linha: Linha) => boolean
  onToggle: (linha: Linha, done: boolean) => void
}) {
  const grupos = React.useMemo(() => {
    const ordem: Momento[] = ["manha", "almoco", "noite", "dia"]
    return ordem
      .map((m) => ({ momento: m, linhas: linhas.filter((l) => l.item.momento === m) }))
      .filter((g) => g.linhas.length)
  }, [linhas])

  return (
    <div className="space-y-4">
      {grupos.map((g) => (
        <div key={g.momento}>
          <h3 className="eyebrow mb-2 font-sans text-muted-foreground">{MOMENTOS[g.momento]}</h3>
          <ul className="space-y-2">
            {g.linhas.map((linha) => {
              const ok = feito(linha)
              const { item } = linha
              return (
                <li key={linha.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={ok}
                    onClick={() => onToggle(linha, !ok)}
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
                    <span className="min-w-0 flex-1">
                      {linha.pessoa && (
                        <span className="mb-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-[11.5px] font-bold text-primary">
                          {linha.pessoa}
                        </span>
                      )}
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

/** Inicial do nome num círculo, para identificar cada pessoa sem depender de foto. */
export function Avatar({ nome, tom = "claro", className }: { nome: string; tom?: "claro" | "escuro"; className?: string }) {
  const inicial = (nome.trim()[0] || "?").toUpperCase()
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-full font-display text-[1.15rem] leading-none",
        tom === "escuro" ? "bg-accent text-accent-foreground" : "bg-selected text-primary",
        className,
      )}
    >
      {inicial}
    </span>
  )
}

export const TODOS = "todos"

export function PerfilChips({
  perfis,
  atual,
  onChange,
  comTodos = false,
}: {
  perfis: Profile[]
  atual: string
  onChange: (id: string) => void
  comTodos?: boolean
}) {
  if (perfis.length < 2) return null
  const opcoes = [...(comTodos ? [{ id: TODOS, nome: "Todos" }] : []), ...perfis.map((p) => ({ id: p.id, nome: p.nome }))]
  return (
    <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none]" role="tablist" aria-label="Pessoa">
      {opcoes.map((p) => (
        <button
          key={p.id}
          type="button"
          role="tab"
          aria-selected={p.id === atual}
          onClick={() => onChange(p.id)}
          className={cn(
            "min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors",
            p.id === atual ? "border-primary bg-primary text-white" : "border-border bg-card text-primary",
          )}
        >
          {p.nome}
        </button>
      ))}
    </div>
  )
}

/**
 * Pessoa selecionada nas abas Hoje e Cronograma (lembrada entre as abas).
 * Com `comTodos`, a família começa vendo todo mundo junto.
 */
export function usePerfilAtual(perfis: Profile[], comTodos = false) {
  const [id, setId] = React.useState<string>(() => {
    try {
      return sessionStorage.getItem("vf_perfil") || ""
    } catch {
      return ""
    }
  })
  const todos = comTodos && perfis.length > 1 && (id === TODOS || !id)
  const perfil = perfis.find((p) => p.id === id) ?? perfis[0]
  const trocar = (novo: string) => {
    setId(novo)
    try {
      sessionStorage.setItem("vf_perfil", novo)
    } catch {
      /* sem armazenamento: segue só na memória */
    }
  }
  return { selecionado: todos ? TODOS : perfil.id, perfil: todos ? null : perfil, trocar }
}
