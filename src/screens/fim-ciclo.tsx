import * as React from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { ArrowLeft, Copy, Loader2, ShoppingBag } from "lucide-react"
import { GlowBackground } from "@/components/ui/glow-background"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { Logo } from "@/components/layout"
import { useApp } from "@/lib/app-state"
import { formatLong } from "@/lib/dates"
import { proximaLuaPermitida, quizDoCiclo } from "@/lib/schedule"
import { cn } from "@/lib/utils"
import { LINKS } from "@/content/protocolo"

const RESPOSTAS = [
  { valor: "muita", rotulo: "Senti muita diferença" },
  { valor: "moderada", rotulo: "Senti alguma diferença" },
  { valor: "leve", rotulo: "Senti pouca diferença" },
  { valor: "nenhuma", rotulo: "Não senti diferença" },
]

export function FimCicloScreen() {
  const { runId } = useParams()
  const { state, fecharCiclo } = useApp()
  const s = state!
  const run = s.runs.find((r) => r.id === runId)
  const perfil = run && s.profiles.find((p) => p.id === run.profile_id)
  const [resposta, setResposta] = React.useState<string | null>(null)
  const [relato, setRelato] = React.useState("")
  const [enviando, setEnviando] = React.useState(false)
  const [erro, setErro] = React.useState<string | null>(null)
  const [copiado, setCopiado] = React.useState(false)

  if (!run || !perfil) return <Navigate to="/hoje" replace />
  const quiz = quizDoCiclo(run, s.quiz)

  async function enviar() {
    if (!resposta) return
    setEnviando(true)
    setErro(null)
    try {
      await fecharCiclo(run!.id, resposta, relato)
    } catch {
      setErro("Não foi possível enviar agora. Tente de novo em instantes.")
    } finally {
      setEnviando(false)
    }
  }

  async function copiar(codigo: string) {
    try {
      await navigator.clipboard.writeText(codigo)
      setCopiado(true)
    } catch {
      /* sem acesso à área de transferência: o código continua visível */
    }
  }

  return (
    <GlowBackground tone="forest">
      <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-5 pb-safe pt-safe">
        <div className="flex items-center justify-between pt-4">
          <Logo tone="light" />
          <Link to="/hoje" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[#d5e2d0]">
            <ArrowLeft className="size-4" aria-hidden /> Voltar
          </Link>
        </div>

        {!quiz ? (
          <section className="mt-8 flex flex-1 animate-subir flex-col">
            <p className="eyebrow text-accent">Fim do ciclo · {perfil.nome}</p>
            <h1 className="mt-2 text-[2.1rem] text-white">Como {perfil.tipo === "kids" ? "a criança se sentiu" : "você se sentiu"} neste ciclo?</h1>
            <div className="mt-5 space-y-2.5" role="radiogroup" aria-label="Como foi">
              {RESPOSTAS.map((r) => (
                <button
                  key={r.valor}
                  type="button"
                  role="radio"
                  aria-checked={resposta === r.valor}
                  onClick={() => setResposta(r.valor)}
                  className={cn(
                    "flex min-h-14 w-full items-center rounded-card px-5 text-left text-[15.5px] font-semibold transition-colors",
                    resposta === r.valor ? "bg-accent text-accent-foreground" : "glass-dark text-white",
                  )}
                >
                  {r.rotulo}
                </button>
              ))}
            </div>
            <label htmlFor="relato" className="mt-5 block text-sm font-semibold text-white">
              Quer contar mais? (opcional)
            </label>
            <textarea
              id="relato"
              value={relato}
              onChange={(e) => setRelato(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="O que mudou na sua rotina, como foi tomar, alguma dúvida…"
              className="glass-dark mt-2 w-full rounded-card p-4 text-[15px] text-white placeholder:text-white/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            {erro && (
              <p role="alert" className="mt-3 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white">
                {erro}
              </p>
            )}
            <div className="mt-auto pt-8 pb-2">
              <LiquidButton tone="lime" size="xl" className="w-full" disabled={!resposta || enviando} onClick={enviar}>
                {enviando && <Loader2 className="animate-spin" aria-hidden />}
                Enviar
              </LiquidButton>
            </div>
          </section>
        ) : (
          <section className="mt-8 flex flex-1 animate-subir flex-col">
            <p className="eyebrow text-accent">Obrigado por contar</p>
            <h1 className="mt-2 text-[2.1rem] text-white">
              {quiz.recomendacao === "repetir_proximo_ciclo" ? "Vale fazer mais um ciclo" : "Agora é manutenção"}
            </h1>
            <p className="mt-3 text-[15px] text-[#d5e2d0]">
              {quiz.recomendacao === "repetir_proximo_ciclo"
                ? `O protocolo pode ser repetido com no mínimo 3 meses de intervalo. A próxima lua nova possível é em ${formatLong(proximaLuaPermitida(run, s.hoje))}.`
                : "Entre um ciclo e outro, mantenha a higiene dos alimentos e a rotina do Guia. No adulto, o Óleo de Alho (1 cápsula por dia) mantém a rotina."}
            </p>

            {quiz.cupom_oferecido && (
              <div className="glass-dark mt-6 rounded-panel p-5 text-center">
                <p className="text-sm font-semibold text-[#d5e2d0]">Um presente para o próximo ciclo</p>
                <p className="mt-2 font-sans text-[2.4rem] font-extrabold leading-none tracking-[0.12em] text-accent">{quiz.cupom_oferecido}</p>
                <button
                  type="button"
                  onClick={() => copiar(quiz.cupom_oferecido!)}
                  className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold text-white"
                >
                  <Copy className="size-4" aria-hidden /> {copiado ? "Copiado" : "Copiar cupom"}
                </button>
                <p className="mt-2 text-[12.5px] text-[#d5e2d0]">Use no checkout do site.</p>
              </div>
            )}

            <div className="mt-auto space-y-2 pt-8 pb-2">
              <LiquidButton asChild tone="lime" size="xl" className="w-full">
                <a href={LINKS.site} target="_blank" rel="noreferrer">
                  <ShoppingBag aria-hidden /> Ir para a loja
                </a>
              </LiquidButton>
              <LiquidButton asChild tone="onDark" size="xl" className="w-full">
                <Link to="/hoje">Voltar para Hoje</Link>
              </LiquidButton>
            </div>
          </section>
        )}
      </main>
    </GlowBackground>
  )
}
