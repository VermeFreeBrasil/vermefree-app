import * as React from "react"
import { Link } from "react-router-dom"
import { BellRing, ChevronDown, ChevronRight, ExternalLink, FileDown, LogOut, MessageCircle, SquarePlus, Truck, Users } from "lucide-react"
import { PageHeader } from "@/components/layout"
import { GlowBackground } from "@/components/ui/glow-background"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/app-state"
import { cn } from "@/lib/utils"
import { FAQ } from "@/content/faq"
import { GUIA_PDF } from "@/content/guia"
import { LINKS, PRODUTOS } from "@/content/protocolo"
import { estaInstalado } from "@/lib/instalar"
import { TutorialInstalar } from "@/components/tutorial-instalar"

export function AjudaScreen() {
  const { state, logout } = useApp()
  const [aberta, setAberta] = React.useState<number | null>(null)
  const [tutorial, setTutorial] = React.useState(false)

  const atalhos = [
    { to: "/pedido", icone: Truck, titulo: "Meu pedido", texto: "Rastreio da entrega" },
    { to: "/lembretes", icone: BellRing, titulo: "Lembretes das doses", texto: "Avisos na agenda do celular" },
    { to: "/pessoas", icone: Users, titulo: "Pessoas e datas", texto: "Nomes, idades e a lua do ciclo" },
  ]

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

        <nav aria-label="Atalhos" className="overflow-hidden rounded-panel border border-border bg-card">
          {atalhos.map(({ to, icone: Icone, titulo, texto }) => (
            <Link key={to} to={to} className="flex min-h-16 items-center gap-3 border-b border-border px-4 py-3 last:border-0">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-selected text-leaf">
                <Icone className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-primary">{titulo}</span>
                <span className="block text-[13px] text-muted-foreground">{texto}</span>
              </span>
              <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
            </Link>
          ))}
          <a href={GUIA_PDF} download="Guia de Alimentos VermeFree.pdf" className="flex min-h-16 items-center gap-3 px-4 py-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-selected text-leaf">
              <FileDown className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold text-primary">Guia de Alimentos em PDF</span>
              <span className="block text-[13px] text-muted-foreground">Para salvar ou imprimir</span>
            </span>
            <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
          </a>
        </nav>

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

        <section className="rounded-panel border border-border bg-card p-5" aria-labelledby="t-loja">
          <h2 id="t-loja" className="text-[1.4rem] text-primary">
            Comprar de novo
          </h2>
          <ul className="mt-3 space-y-2">
            {PRODUTOS.map((p) => (
              <li key={p.nome}>
                <a href={p.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-card bg-background p-2.5 pr-3">
                  <img src={p.img} alt="" className="size-16 shrink-0 rounded-2xl bg-white object-cover" loading="lazy" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-primary">{p.nome}</span>
                    <span className="block text-[13px] leading-snug text-muted-foreground">{p.descricao}</span>
                  </span>
                  <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-label="Abre no site" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        {!estaInstalado() && (
          <Button variant="outline" className="w-full" onClick={() => setTutorial(true)}>
            <SquarePlus aria-hidden /> Colocar o app na tela inicial
          </Button>
        )}

        <div className="pt-2 text-center">
          <p className="text-[13px] text-muted-foreground">Conectado como {state?.customer.email}</p>
          <Button variant="ghost" size="sm" className="mt-1" onClick={logout}>
            <LogOut aria-hidden /> Sair
          </Button>
        </div>
      </div>
      <TutorialInstalar aberto={tutorial} onFechar={() => setTutorial(false)} />
    </>
  )
}
