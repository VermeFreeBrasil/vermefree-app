import * as React from "react"
import { Link } from "react-router-dom"
import { ChevronDown, LogOut, MessageCircle, ShoppingBag, SquarePlus } from "lucide-react"
import { PageHeader } from "@/components/layout"
import { GlowBackground } from "@/components/ui/glow-background"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/app-state"
import { cn } from "@/lib/utils"
import { FAQ } from "@/content/faq"
import { LINKS, PRODUTOS_IMG } from "@/content/protocolo"
import { estaInstalado } from "@/screens/instalar"

export function AjudaScreen() {
  const { state, logout } = useApp()
  const [aberta, setAberta] = React.useState<number | null>(null)

  return (
    <>
      <PageHeader eyebrow="Estamos aqui" titulo="Ajuda" />

      <div className="space-y-4">
        <GlowBackground tone="forest" className="min-h-0 overflow-hidden rounded-panel animate-subir">
          <div className="p-5">
            <h2 className="text-[1.5rem] text-white">Ficou com dúvida?</h2>
            <p className="mt-1 text-[14.5px] text-[#d5e2d0]">Fale com a gente pelo WhatsApp. Tem pessoa de verdade respondendo do outro lado.</p>
            <LiquidButton asChild tone="lime" size="lg" className="mt-4 w-full">
              <a href={LINKS.atendimento} target="_blank" rel="noreferrer">
                <MessageCircle aria-hidden /> Falar com o atendimento
              </a>
            </LiquidButton>
          </div>
        </GlowBackground>

        <section className="rounded-panel border border-border bg-card p-2" aria-labelledby="t-faq">
          <h2 id="t-faq" className="px-3 pt-3 text-[1.4rem] text-primary">
            Perguntas frequentes
          </h2>
          <ul className="mt-1">
            {FAQ.map((f, i) => {
              const isOpen = aberta === i
              return (
                <li key={f.pergunta} className="border-b border-border last:border-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setAberta(isOpen ? null : i)}
                    className="flex min-h-14 w-full items-center gap-3 px-3 py-3 text-left text-[15px] font-semibold text-primary"
                  >
                    <span className="flex-1">{f.pergunta}</span>
                    <ChevronDown className={cn("size-5 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} aria-hidden />
                  </button>
                  {isOpen && <p className="px-3 pb-4 text-[14.5px] text-foreground">{f.resposta}</p>}
                </li>
              )
            })}
          </ul>
        </section>

        <section className="rounded-panel border border-border bg-card p-5">
          <h2 className="text-[1.4rem] text-primary">Comprar de novo</h2>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[PRODUTOS_IMG.adulto, PRODUTOS_IMG.kids24, PRODUTOS_IMG.kids59, PRODUTOS_IMG.oleoAlho].map((src) => (
              <img key={src} src={src} alt="" className="aspect-square w-full rounded-2xl bg-background object-contain" loading="lazy" />
            ))}
          </div>
          <Button asChild variant="dark" className="mt-4 w-full">
            <a href={LINKS.site} target="_blank" rel="noreferrer">
              <ShoppingBag aria-hidden /> Ir para a loja
            </a>
          </Button>
        </section>

        {!estaInstalado() && (
          <Button asChild variant="outline" className="w-full">
            <Link to="/instalar">
              <SquarePlus aria-hidden /> Colocar o app na tela inicial
            </Link>
          </Button>
        )}

        <div className="pt-2 text-center">
          <p className="text-[13px] text-muted-foreground">Conectado como {state?.customer.email}</p>
          <Button variant="ghost" size="sm" className="mt-1" onClick={logout}>
            <LogOut aria-hidden /> Sair
          </Button>
        </div>
      </div>
    </>
  )
}
