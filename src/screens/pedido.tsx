import * as React from "react"
import { Link } from "react-router-dom"
import { AlertTriangle, ArrowLeft, Check, Copy, ExternalLink, Loader2, MessageCircle, Package, PackageCheck, RefreshCw, Truck } from "lucide-react"
import { PageHeader } from "@/components/layout"
import { GlowBackground } from "@/components/ui/glow-background"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/app-state"
import { chaveDoPedido, envioPrincipal, etapasDoPedido, nomeCurto, quandoBR, TEXTO_SITUACAO, type Chave } from "@/lib/pedido"
import { cn } from "@/lib/utils"
import { LINKS } from "@/content/protocolo"
import type { Pedido } from "@/lib/api"

const ICONE: Record<Chave, typeof Truck> = {
  preparando: Package,
  enviado: Truck,
  transito: Truck,
  saiu: Truck,
  entregue: PackageCheck,
  problema: AlertTriangle,
}

export function PedidoScreen() {
  const { pedidos, carregarPedidos } = useApp()
  const [atualizando, setAtualizando] = React.useState(false)

  React.useEffect(() => {
    carregarPedidos()
  }, [carregarPedidos])

  async function atualizar() {
    setAtualizando(true)
    await carregarPedidos(true)
    setAtualizando(false)
  }

  return (
    <>
      <PageHeader
        eyebrow="Acompanhe a entrega"
        titulo="Meu pedido"
        acao={
          <Link to="/hoje" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-muted-foreground">
            <ArrowLeft className="size-4" aria-hidden /> Hoje
          </Link>
        }
      />

      {pedidos === null ? (
        <div className="grid place-items-center rounded-panel border border-border bg-card p-10" role="status">
          <Loader2 className="size-6 animate-spin text-leaf" aria-hidden />
          <p className="mt-2 text-sm text-muted-foreground">Buscando seu pedido…</p>
        </div>
      ) : pedidos === "erro" ? (
        <Aviso
          titulo="Não deu para buscar o pedido agora"
          texto="Confira a internet e tente de novo. Se continuar, fale com a gente."
          acao={
            <Button variant="dark" size="sm" onClick={atualizar} disabled={atualizando}>
              {atualizando ? <Loader2 className="animate-spin" aria-hidden /> : <RefreshCw aria-hidden />} Tentar de novo
            </Button>
          }
        />
      ) : pedidos.length === 0 ? (
        <Aviso
          titulo="Não encontramos um pedido da loja com este e-mail"
          texto="Se você comprou por outro canal, o acompanhamento da entrega chega pelo e-mail da compra. Qualquer dúvida, fale com a gente."
        />
      ) : (
        <div className="space-y-4">
          {[...pedidos]
            .sort((a, b) => (a.criado_em < b.criado_em ? 1 : -1))
            .slice(0, 3)
            .map((p) => (
              <CartaoPedido key={p.numero} pedido={p} />
            ))}
          <div className="text-center">
            <button
              type="button"
              onClick={atualizar}
              disabled={atualizando}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-leaf"
            >
              <RefreshCw className={cn("size-4", atualizando && "animate-spin")} aria-hidden /> Atualizar rastreio
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function Aviso({ titulo, texto, acao }: { titulo: string; texto: string; acao?: React.ReactNode }) {
  return (
    <section className="rounded-panel border border-border bg-card p-5 animate-subir">
      <h2 className="text-[1.3rem] text-primary">{titulo}</h2>
      <p className="mt-2 text-[14.5px] text-muted-foreground">{texto}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {acao}
        <Button asChild variant="outline" size="sm">
          <a href={LINKS.atendimento} target="_blank" rel="noreferrer">
            <MessageCircle aria-hidden /> Falar com o atendimento
          </a>
        </Button>
      </div>
    </section>
  )
}

function CartaoPedido({ pedido }: { pedido: Pedido }) {
  const chave = chaveDoPedido(pedido)
  const envio = envioPrincipal(pedido)
  const rastreio = envio?.rastreio[0]
  const etapas = etapasDoPedido(pedido)
  const Icone = ICONE[chave]
  const [copiado, setCopiado] = React.useState(false)

  async function copiar() {
    if (!rastreio) return
    try {
      await navigator.clipboard.writeText(rastreio.codigo)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      /* sem área de transferência: o código continua visível */
    }
  }

  return (
    <section className="overflow-hidden rounded-panel border border-border bg-card animate-subir">
      <GlowBackground tone="forest" className="min-h-0">
        <div className="flex items-start gap-3 p-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
            <Icone className="size-6" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] text-[#d5e2d0]">
              Pedido {pedido.numero} · {quandoBR(pedido.criado_em).split(",")[0]}
            </p>
            <h2 className="mt-0.5 text-[1.6rem] text-white">{TEXTO_SITUACAO[chave].titulo}</h2>
            <p className="mt-1 text-[14px] text-[#d5e2d0]">{TEXTO_SITUACAO[chave].texto}</p>
          </div>
        </div>
      </GlowBackground>

      <div className="space-y-5 p-5">
        {rastreio && (
          <div className="rounded-card bg-background p-4">
            <p className="text-[12.5px] font-semibold text-muted-foreground">Código de rastreio{rastreio.empresa ? ` · ${rastreio.empresa}` : ""}</p>
            <p className="mt-1 font-mono text-[1.15rem] font-bold tracking-wider text-primary">{rastreio.codigo}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="dark" size="sm" onClick={copiar}>
                {copiado ? <Check aria-hidden /> : <Copy aria-hidden />} {copiado ? "Copiado" : "Copiar código"}
              </Button>
              {rastreio.url && (
                <Button asChild variant="outline" size="sm">
                  <a href={rastreio.url} target="_blank" rel="noreferrer">
                    <ExternalLink aria-hidden /> Abrir rastreio
                  </a>
                </Button>
              )}
            </div>
            {rastreio.url && <p className="mt-2 text-[12.5px] text-muted-foreground">No site, cole o código no campo de busca.</p>}
          </div>
        )}

        <ol className="relative space-y-4 pl-8" aria-label="Etapas da entrega">
          <span aria-hidden className="absolute bottom-2 left-[11px] top-2 w-0.5 bg-border" />
          {etapas.map((e) => (
            <li key={e.rotulo} className="relative">
              <span
                aria-hidden
                className={cn(
                  "absolute -left-8 top-0.5 grid size-6 place-items-center rounded-full border-2",
                  e.feito ? "border-primary bg-primary text-accent" : "border-[#b9c6b3] bg-white",
                )}
              >
                {e.feito && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <p className={cn("text-[15px] font-semibold", e.feito ? "text-primary" : "text-muted-foreground")}>{e.rotulo}</p>
              {e.quando && e.feito && <p className="text-[12.5px] text-muted-foreground">{quandoBR(e.quando)}</p>}
            </li>
          ))}
        </ol>

        {pedido.itens.length > 0 && (
          <div>
            <h3 className="eyebrow mb-2 font-sans text-muted-foreground">No pedido</h3>
            <ul className="space-y-1 text-[14px] text-foreground">
              {pedido.itens.map((i) => (
                <li key={i.titulo} className="flex justify-between gap-3">
                  <span>{nomeCurto(i.titulo)}</span>
                  <span className="shrink-0 text-muted-foreground">× {i.quantidade}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {chave === "problema" && (
          <Button asChild variant="dark" className="w-full">
            <a href={LINKS.atendimento} target="_blank" rel="noreferrer">
              <MessageCircle aria-hidden /> Falar com o atendimento
            </a>
          </Button>
        )}
      </div>
    </section>
  )
}
