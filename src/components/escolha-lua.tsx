import * as React from "react"
import { Check, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { addDays, formatShort, formatWeekday } from "@/lib/dates"
import { newMoonsBefore } from "@/lib/moon"
import { opcoesDeLua } from "@/lib/schedule"
import { DIAS_PARA_O_KIT_CHEGAR } from "@/content/protocolo"

type Tom = "escuro" | "claro"

/**
 * Escolha da lua nova do ciclo. Pergunta se o kit já chegou para recomendar uma data
 * que dê tempo da entrega, e explica o porquê da recomendação.
 */
export function EscolhaLua({
  temAdulto,
  temKids,
  hoje,
  valor,
  onChange,
  tom = "escuro",
  permitirPassadas = true,
  kitEntregue = false,
}: {
  temAdulto: boolean
  temKids: boolean
  hoje: string
  valor: string | null
  onChange: (lua: string | null) => void
  tom?: Tom
  permitirPassadas?: boolean
  /** Entrega confirmada pelos Correios: já começa em "Já chegou". */
  kitEntregue?: boolean
}) {
  const [kitChegou, setKitChegou] = React.useState(kitEntregue)
  React.useEffect(() => {
    if (kitEntregue) setKitChegou(true)
  }, [kitEntregue])
  const [jaComecei, setJaComecei] = React.useState(false)
  const { luas, recomendada } = React.useMemo(() => opcoesDeLua(temAdulto, hoje, kitChegou), [temAdulto, hoje, kitChegou])
  const passadas = React.useMemo(
    () => newMoonsBefore(addDays(hoje, 1), 2).filter((l) => l >= addDays(hoje, -60)),
    [hoje],
  )
  const lista = jaComecei ? passadas : luas
  const escuro = tom === "escuro"

  // Se a lista mudou e a lua escolhida saiu dela, limpa a escolha.
  React.useEffect(() => {
    if (valor && !lista.includes(valor)) onChange(null)
  }, [lista, valor, onChange])

  const motivo = kitChegou
    ? temAdulto
      ? "é a primeira lua nova que ainda dá tempo de fazer os 15 dias de preparo."
      : "é a próxima lua nova."
    : `dá tempo do kit chegar (cerca de ${DIAS_PARA_O_KIT_CHEGAR} dias) antes do primeiro dia.`

  return (
    <div>
      {!jaComecei && (
        <fieldset>
          <legend className={cn("mb-2 text-sm font-semibold", escuro ? "text-white" : "text-primary")}>Seu kit já chegou?</legend>
          <div className={cn("inline-flex rounded-full p-1", escuro ? "bg-white/10" : "bg-secondary")} role="radiogroup">
            {[
              { v: false, r: "Ainda não" },
              { v: true, r: "Já chegou" },
            ].map((o) => (
              <button
                key={o.r}
                type="button"
                role="radio"
                aria-checked={kitChegou === o.v}
                onClick={() => setKitChegou(o.v)}
                className={cn(
                  "min-h-10 rounded-full px-5 text-sm font-semibold transition-colors",
                  kitChegou === o.v
                    ? escuro
                      ? "bg-accent text-accent-foreground"
                      : "bg-primary text-white"
                    : escuro
                      ? "text-white/75"
                      : "text-muted-foreground",
                )}
              >
                {o.r}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-4 space-y-3" role="radiogroup" aria-label="Lua nova">
        {lista.map((l) => {
          const sel = valor === l
          const ehRecomendada = !jaComecei && l === recomendada
          return (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={sel}
              onClick={() => onChange(l)}
              className={cn(
                "flex w-full items-center gap-4 rounded-card p-4 text-left transition-colors",
                sel
                  ? escuro
                    ? "bg-accent text-accent-foreground"
                    : "border border-primary bg-selected text-primary"
                  : escuro
                    ? "glass-dark text-white"
                    : "border border-border bg-card text-primary",
              )}
            >
              <span
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-full",
                  sel ? (escuro ? "bg-primary text-accent" : "bg-primary text-accent") : escuro ? "bg-white/10 text-accent" : "bg-selected text-leaf",
                )}
              >
                <Moon className="size-6" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-[17px] font-bold">Lua nova · {formatWeekday(l)}</span>
                  {ehRecomendada && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-bold",
                        sel ? "bg-primary text-white" : escuro ? "bg-accent text-accent-foreground" : "bg-primary text-white",
                      )}
                    >
                      Recomendada
                    </span>
                  )}
                </span>
                <span className={cn("mt-1 block text-[13px] leading-snug", sel ? "opacity-80" : escuro ? "text-[#d5e2d0]" : "text-muted-foreground")}>
                  {temAdulto && <span className="block">Adulto: preparo a partir de {formatShort(addDays(l, -15))}, até {formatShort(addDays(l, 14))}</span>}
                  {temKids && <span className="block">Kids: de {formatShort(l)} a {formatShort(addDays(l, 29))}</span>}
                </span>
              </span>
              {sel && <Check className="size-6 shrink-0" aria-hidden />}
            </button>
          )
        })}
      </div>

      {!jaComecei && <p className={cn("mt-3 text-[13px]", escuro ? "text-[#d5e2d0]" : "text-muted-foreground")}>Por que a recomendada: {motivo}</p>}

      {permitirPassadas && passadas.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setJaComecei((v) => !v)
            onChange(null)
          }}
          className={cn("mt-3 min-h-11 text-sm font-semibold underline underline-offset-4", escuro ? "text-accent" : "text-leaf")}
        >
          {jaComecei ? "Ver as próximas luas" : "Já comecei em uma lua anterior"}
        </button>
      )}
    </div>
  )
}
