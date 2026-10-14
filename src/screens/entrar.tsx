import * as React from "react"
import { ArrowRight, Loader2, MessageCircle } from "lucide-react"
import { GlowBackground } from "@/components/ui/glow-background"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { Logo } from "@/components/layout"
import { useApp } from "@/lib/app-state"
import { ApiError } from "@/lib/api"
import { LINKS, PRODUTOS_IMG } from "@/content/protocolo"

const ERROS: Record<string, string> = {
  invalid_email: "Confira o e-mail digitado.",
  not_found: "Não encontramos uma compra com este e-mail. Use o mesmo e-mail do pedido ou fale com a gente.",
  network: "Sem conexão. Confira a internet e tente de novo.",
}

export function EntrarScreen() {
  const { login } = useApp()
  const [email, setEmail] = React.useState("")
  const [enviando, setEnviando] = React.useState(false)
  const [erro, setErro] = React.useState<string | null>(null)

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await login(email)
    } catch (err) {
      const code = err instanceof ApiError ? err.code : "unknown"
      setErro(ERROS[code] ?? "Não foi possível entrar agora. Tente de novo em instantes.")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <GlowBackground tone="forest">
      <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-5 pb-safe pt-safe">
        <div className="pt-4">
          <Logo tone="light" />
        </div>

        <div className="my-auto py-6">
        <div className="relative mx-auto w-full max-w-[320px] animate-subir">
          <div aria-hidden className="absolute -inset-4 rounded-[40px] bg-accent/20 blur-3xl" />
          <img
            src={PRODUTOS_IMG.familia}
            alt="Linha VermeFree: protocolo adulto e kids"
            className="relative aspect-[4/3] w-full rounded-[28px] object-cover shadow-[0_24px_50px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/15"
            width={640}
            height={480}
          />
        </div>

        <div className="mt-6 animate-subir [animation-delay:80ms]">
          <p className="eyebrow text-accent">App VermeFree</p>
          <h1 className="mt-2 text-[2.5rem] text-white">
            Seu protocolo, <span className="text-accent">um dia de cada vez.</span>
          </h1>
          <p className="mt-3 text-[15px] text-[#d5e2d0]">
            Cronograma na lua nova, o que tomar em cada momento do dia e o Guia de Alimentos, tudo no seu celular.
          </p>
        </div>

        <form onSubmit={enviar} className="mt-7 animate-subir space-y-3 [animation-delay:160ms]" noValidate>
          <label htmlFor="email" className="block text-sm font-semibold text-white">
            E-mail usado na compra
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
            aria-invalid={Boolean(erro)}
            aria-describedby={erro ? "erro-login" : undefined}
            className="glass-dark min-h-[54px] w-full rounded-full px-5 text-base text-white placeholder:text-white/50 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-accent"
          />
          {erro && (
            <p id="erro-login" role="alert" className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white">
              {erro}
            </p>
          )}
          <LiquidButton type="submit" tone="lime" size="xl" className="w-full" disabled={enviando || !email}>
            {enviando ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {enviando ? "Entrando" : "Entrar"}
            {!enviando && <ArrowRight aria-hidden />}
          </LiquidButton>
        </form>
        </div>

        <div className="pb-2 text-center">
          <a
            href={LINKS.atendimento}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#d5e2d0] underline-offset-4 hover:underline"
          >
            <MessageCircle className="size-4" aria-hidden />
            Precisa de ajuda? Fale com a gente
          </a>
        </div>
      </main>
    </GlowBackground>
  )
}
