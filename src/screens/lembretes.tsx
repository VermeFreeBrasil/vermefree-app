import * as React from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, BellRing, CalendarCheck2 } from "lucide-react"
import { PageHeader } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/app-state"
import { formatShort } from "@/lib/dates"
import { baixarIcs, eventosDosLembretes, gerarIcs, HORARIOS_PADRAO, type Horarios } from "@/lib/ics"
import { marcarPreparacao } from "@/screens/hoje"

const HORARIOS_KEY = "vf_horarios"

function lerHorarios(): Horarios {
  try {
    return { ...HORARIOS_PADRAO, ...JSON.parse(localStorage.getItem(HORARIOS_KEY) || "{}") }
  } catch {
    return HORARIOS_PADRAO
  }
}

export function LembretesScreen() {
  const { state } = useApp()
  const s = state!
  const [h, setH] = React.useState<Horarios>(lerHorarios)
  const [pronto, setPronto] = React.useState(false)
  const temAdulto = s.profiles.some((p) => p.tipo === "adulto")
  const eventos = React.useMemo(() => eventosDosLembretes(s.profiles, s.runs, s.hoje, h), [s.profiles, s.runs, s.hoje, h])

  const campos: { id: keyof Horarios; rotulo: string }[] = [
    { id: "cafe", rotulo: "Café da manhã" },
    { id: "almoco", rotulo: "Almoço" },
    { id: "jantar", rotulo: "Jantar" },
    ...(temAdulto ? [{ id: "deitar" as const, rotulo: "Hora de deitar (Ornitina)" }] : []),
  ]

  function mudar(id: keyof Horarios, valor: string) {
    const novo = { ...h, [id]: valor || HORARIOS_PADRAO[id] }
    setH(novo)
    setPronto(false)
    try {
      localStorage.setItem(HORARIOS_KEY, JSON.stringify(novo))
    } catch {
      /* segue com os horários só nesta tela */
    }
  }

  function baixar() {
    baixarIcs(gerarIcs(eventos))
    marcarPreparacao(s.customer.email, "lembretes")
    setPronto(true)
  }

  return (
    <>
      <PageHeader
        eyebrow="Para não esquecer"
        titulo="Lembretes das doses"
        acao={
          <Link to="/hoje" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-muted-foreground">
            <ArrowLeft className="size-4" aria-hidden /> Hoje
          </Link>
        }
      >
        <p className="mt-2 text-[15px] text-muted-foreground">
          Coloque o horário das refeições da sua casa. O app monta os avisos de cada dose, de cada pessoa, e você adiciona na agenda do celular.
        </p>
      </PageHeader>

      <section className="rounded-panel border border-border bg-card p-5 animate-subir">
        <h2 className="text-[1.3rem] text-primary">Horários da casa</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {campos.map((c) => (
            <label key={c.id} className="block">
              <span className="text-[13px] font-semibold text-muted-foreground">{c.rotulo}</span>
              <input
                type="time"
                value={h[c.id]}
                onChange={(e) => mudar(c.id, e.target.value)}
                className="mt-1 min-h-12 w-full rounded-2xl border border-border bg-background px-3 text-[16px] font-semibold text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
              />
            </label>
          ))}
        </div>
        <p className="mt-3 text-[13px] text-muted-foreground">
          As doses “antes” e “depois” da refeição avisam no horário da refeição. Quem tem Ornitina recebe o aviso na hora de deitar.
        </p>
      </section>

      <section className="mt-4 rounded-panel border border-border bg-card p-5">
        <h2 className="text-[1.3rem] text-primary">O que vai para a agenda</h2>
        {eventos.length === 0 ? (
          <p className="mt-2 text-[14.5px] text-muted-foreground">Não há ciclo em andamento ou agendado agora.</p>
        ) : (
          <div className="mt-3 space-y-4">
            {[...new Set(eventos.map((e) => e.pessoa))].map((pessoa) => (
              <div key={pessoa}>
                <h3 className="flex items-center gap-2 font-sans text-[15px] font-bold tracking-normal text-primary">
                  <BellRing className="size-4 text-leaf" aria-hidden /> {pessoa}
                </h3>
                <ul className="mt-1.5 divide-y divide-border rounded-card bg-background">
                  {eventos
                    .filter((e) => e.pessoa === pessoa)
                    .map((e) => (
                      <li key={e.uid} className="flex gap-3 px-3 py-2.5 text-[13.5px]">
                        <span className="w-12 shrink-0 font-bold text-primary">{e.hora}</span>
                        <span className="min-w-0">
                          <span className="block text-foreground first-letter:uppercase">{e.oque}</span>
                          <span className="block text-[12.5px] text-muted-foreground">
                            {formatShort(e.inicio)} a {formatShort(e.fim)}
                          </span>
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {eventos.length > 0 && (
        <div className="mt-4 space-y-3">
          <Button variant="dark" className="w-full" onClick={baixar}>
            <CalendarCheck2 aria-hidden /> Adicionar à agenda
          </Button>
          {pronto && (
            <p role="status" className="rounded-2xl bg-selected px-4 py-3 text-[14px] text-primary">
              Arquivo pronto. No iPhone, toque em “Adicionar todos”. No Android, abra com o app de agenda. Se mudar a data do ciclo, gere os lembretes de novo.
            </p>
          )}
        </div>
      )}
    </>
  )
}
