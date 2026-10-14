import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Download, MoreVertical, Share, SquarePlus } from "lucide-react"
import { GlowBackground } from "@/components/ui/glow-background"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { Logo } from "@/components/layout"

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

let promptGuardado: BeforeInstallPromptEvent | null = null
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault()
    promptGuardado = e as BeforeInstallPromptEvent
  })
}

export function estaInstalado() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function plataforma(): "ios" | "android" | "outro" {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios"
  if (/Android/i.test(ua)) return "android"
  return "outro"
}

function Passo({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="glass-dark flex items-center gap-4 rounded-card p-4 text-[15px] text-white">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent font-bold text-accent-foreground">{n}</span>
      <span className="leading-snug">{children}</span>
    </li>
  )
}

export function InstalarScreen() {
  const navigate = useNavigate()
  const [podeInstalar, setPodeInstalar] = React.useState(Boolean(promptGuardado))
  const p = plataforma()

  React.useEffect(() => {
    if (estaInstalado()) navigate("/hoje", { replace: true })
    const h = () => setPodeInstalar(true)
    window.addEventListener("beforeinstallprompt", h)
    return () => window.removeEventListener("beforeinstallprompt", h)
  }, [navigate])

  async function instalar() {
    if (!promptGuardado) return
    await promptGuardado.prompt()
    await promptGuardado.userChoice.catch(() => null)
    promptGuardado = null
    navigate("/hoje", { replace: true })
  }

  return (
    <GlowBackground tone="forest">
      <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-5 pb-safe pt-safe">
        <div className="pt-4">
          <Logo tone="light" />
        </div>
        <section className="mt-8 flex flex-1 animate-subir flex-col">
          <div className="glass-dark mx-auto grid size-20 place-items-center rounded-[26px]">
            <SquarePlus className="size-9 text-accent" aria-hidden />
          </div>
          <p className="eyebrow mt-6 text-center text-accent">Cronograma pronto</p>
          <h1 className="mt-2 text-center text-[2.1rem] text-white">Coloque o app na sua tela inicial</h1>
          <p className="mt-2 text-center text-[15px] text-[#d5e2d0]">
            Assim ele abre com um toque, como qualquer aplicativo, e você não perde o horário das doses.
          </p>

          <ol className="mt-6 space-y-3">
            {p === "ios" ? (
              <>
                <Passo n={1}>
                  Toque em <Share className="inline size-5 align-text-bottom text-accent" aria-label="Compartilhar" /> no Safari
                </Passo>
                <Passo n={2}>Escolha “Adicionar à Tela de Início”</Passo>
                <Passo n={3}>Toque em “Adicionar”</Passo>
              </>
            ) : (
              <>
                <Passo n={1}>
                  Toque no menu <MoreVertical className="inline size-5 align-text-bottom text-accent" aria-label="do navegador" /> do Chrome
                </Passo>
                <Passo n={2}>Escolha “Instalar app” ou “Adicionar à tela inicial”</Passo>
                <Passo n={3}>Confirme</Passo>
              </>
            )}
          </ol>

          <div className="mt-auto space-y-2 pt-8 pb-2">
            {podeInstalar && (
              <LiquidButton tone="lime" size="xl" className="w-full" onClick={instalar}>
                <Download aria-hidden /> Instalar agora
              </LiquidButton>
            )}
            <LiquidButton
              tone={podeInstalar ? "onDark" : "lime"}
              size="xl"
              className="w-full"
              onClick={() => navigate("/hoje", { replace: true })}
            >
              {podeInstalar ? "Agora não" : "Pronto, ir para o app"} <ArrowRight aria-hidden />
            </LiquidButton>
          </div>
        </section>
      </main>
    </GlowBackground>
  )
}
