import * as React from "react"
import { ArrowLeft, ArrowRight, Check, Copy, Download, EllipsisVertical, Info, Share, SquarePlus, X } from "lucide-react"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { Button } from "@/components/ui/button"
import {
  aoMudarInstalacao,
  instalarDireto,
  iosForaDoSafari,
  marcarTutorialVisto,
  navegadorEmbutido,
  plataforma,
  podeInstalarDireto,
  type Plataforma,
} from "@/lib/instalar"
import { cn } from "@/lib/utils"

type Passo = { titulo: string; texto: React.ReactNode; ilustracao: React.ReactNode }

/* ---------- Ilustrações: pedacinhos da tela do celular, com o toque destacado ---------- */

function Tela({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div aria-hidden className={cn("relative mx-auto w-full max-w-[300px] overflow-hidden rounded-[22px] border border-[#d9ded6] bg-[#f2f3f0] p-3 text-[#1c1c1e]", className)}>
      {children}
    </div>
  )
}

/** Anel pulsante em volta do que a pessoa precisa tocar. */
function Toque({ children, className, raio = "rounded-full" }: { children: React.ReactNode; className?: string; raio?: string }) {
  return (
    <span className={cn("relative inline-flex", className)}>
      <span className={cn("absolute -inset-1.5 animate-ping bg-[#9fd16a]/50 motion-reduce:hidden", raio)} />
      <span className={cn("relative inline-flex w-full ring-[3px] ring-[#7cc242]", raio)}>{children}</span>
    </span>
  )
}

function IconeApp({ redondo, tamanho = 56 }: { redondo?: boolean; tamanho?: number }) {
  return (
    <img
      src={redondo ? "/icons/icon-maskable-512.png" : "/icons/apple-touch-icon.png"}
      alt=""
      width={tamanho}
      height={tamanho}
      className={redondo ? "rounded-full" : "rounded-[22%]"}
      style={{ width: tamanho, height: tamanho }}
    />
  )
}

function Linha({ icone, texto, destaque }: { icone?: React.ReactNode; texto: string; destaque?: boolean }) {
  const conteudo = (
    <span className={cn("flex w-full items-center justify-between gap-3 rounded-xl bg-white px-3.5 py-2.5 text-[13.5px]", destaque && "font-semibold")}>
      {texto}
      {icone}
    </span>
  )
  return destaque ? (
    <Toque className="w-full" raio="rounded-xl">
      {conteudo}
    </Toque>
  ) : (
    conteudo
  )
}

function TelaInicial({ redondo }: { redondo?: boolean }) {
  const vizinhos = ["#f4b860", "#7aa7e8", "#e87a7a", "#9a8be0", "#6cc3b5", "#f08fc0", "#b0b8c4"]
  return (
    <Tela className="bg-gradient-to-br from-[#5f8c7a] to-[#2f5848] px-5 py-5">
      <div className="grid grid-cols-4 gap-x-3 gap-y-4">
        {vizinhos.map((c, i) => (
          <span key={c} className={cn("mx-auto block size-12", redondo ? "rounded-full" : "rounded-[22%]")} style={{ background: c, opacity: 0.55 + (i % 3) * 0.1 }} />
        ))}
        <span className="flex flex-col items-center gap-1">
          <Toque raio={redondo ? "rounded-full" : "rounded-[24%]"}>
            <IconeApp redondo={redondo} tamanho={48} />
          </Toque>
          <span className="text-[10.5px] font-medium text-white">VermeFree</span>
        </span>
      </div>
    </Tela>
  )
}

/* ---------- Passos ---------- */

function passosIos(foraDoSafari: boolean): Passo[] {
  return [
    {
      titulo: "Toque em Compartilhar",
      texto: (
        <>
          É o quadradinho com a seta para cima <Share className="inline size-4 align-[-2px]" aria-label="" />, na barra do {foraDoSafari ? "navegador, ao lado do endereço" : "Safari"}. Não
          está vendo? Toque antes em <b>•••</b>.
        </>
      ),
      ilustracao: (
        <Tela className="pt-10">
          <div className="flex items-center gap-2 rounded-full bg-white px-2 py-1.5 shadow-sm">
            <span className="grid size-8 place-items-center text-[#007aff]">
              <ArrowLeft className="size-5" />
            </span>
            <span className="min-w-0 flex-1 truncate rounded-full bg-[#eef0ec] px-3 py-1.5 text-center text-[12px] text-[#3c3c43]">app.vermefree.com.br</span>
            <Toque>
              <span className="grid size-8 place-items-center rounded-full bg-white text-[#007aff]">
                <Share className="size-[18px]" />
              </span>
            </Toque>
            <span className="grid size-8 place-items-center text-[18px] font-bold leading-none text-[#007aff]">•••</span>
          </div>
        </Tela>
      ),
    },
    {
      titulo: "Toque em “Adicionar à Tela de Início”",
      texto: "Se não aparecer de cara, role a lista um pouco para baixo.",
      ilustracao: (
        <Tela>
          <div className="space-y-1.5">
            <Linha texto="Copiar" icone={<Copy className="size-4 text-[#3c3c43]" />} />
            <Linha texto="Adicionar aos Favoritos" icone={<span className="text-[15px] text-[#3c3c43]">☆</span>} />
            <Linha texto="Adicionar à Tela de Início" icone={<SquarePlus className="size-4" />} destaque />
          </div>
        </Tela>
      ),
    },
    {
      titulo: "Toque em “Adicionar”",
      texto: (
        <>
          Fica no canto de cima, à direita. Se aparecer a opção <b>Abrir como App Web</b>, deixe ligada.
        </>
      ),
      ilustracao: (
        <Tela>
          <div className="flex items-center justify-between px-1 text-[13px]">
            <span className="text-[#007aff]">Cancelar</span>
            <Toque>
              <span className="rounded-full bg-white px-3 py-1 font-semibold text-[#007aff]">Adicionar</span>
            </Toque>
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-white p-3">
            <IconeApp tamanho={44} />
            <span className="text-[14px] font-medium">VermeFree</span>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-xl bg-white px-3 py-2.5 text-[13px]">
            Abrir como App Web
            <span className="flex h-5 w-9 items-center justify-end rounded-full bg-[#34c759] p-0.5">
              <span className="size-4 rounded-full bg-white" />
            </span>
          </div>
        </Tela>
      ),
    },
  ]
}

function passosAndroid(): Passo[] {
  return [
    {
      titulo: "Toque nos três pontinhos",
      texto: (
        <>
          Ficam no canto de cima do Chrome, à direita do endereço. No navegador da Samsung, é o menu <b>≡</b> embaixo.
        </>
      ),
      ilustracao: (
        <Tela className="pb-10">
          <div className="flex items-center gap-2 rounded-full bg-white px-2 py-1.5 shadow-sm">
            <span className="min-w-0 flex-1 truncate rounded-full bg-[#eef0ec] px-3 py-1.5 text-[12px] text-[#3c3c43]">app.vermefree.com.br</span>
            <span className="grid size-7 place-items-center rounded-md border border-[#9aa0a6] text-[11px] font-semibold text-[#3c3c43]">2</span>
            <Toque>
              <span className="grid size-8 place-items-center rounded-full bg-white text-[#3c3c43]">
                <EllipsisVertical className="size-5" />
              </span>
            </Toque>
          </div>
        </Tela>
      ),
    },
    {
      titulo: "Toque em “Adicionar à tela inicial”",
      texto: (
        <>
          Em alguns celulares aparece como <b>Instalar app</b>. No navegador da Samsung: <b>Adicionar página a › Tela inicial</b>.
        </>
      ),
      ilustracao: (
        <Tela>
          <div className="space-y-1.5">
            <Linha texto="Nova guia" />
            <Linha texto="Histórico" />
            <Linha texto="Adicionar à tela inicial" icone={<SquarePlus className="size-4" />} destaque />
          </div>
        </Tela>
      ),
    },
    {
      titulo: "Toque em “Instalar”",
      texto: "Se perguntar, confirme em “Adicionar” ou “Adicionar automaticamente”.",
      ilustracao: (
        <Tela>
          <div className="rounded-2xl bg-white p-4">
            <p className="text-[14px] font-semibold">Instalar app</p>
            <div className="mt-3 flex items-center gap-3">
              <IconeApp redondo tamanho={40} />
              <span className="text-[13.5px]">VermeFree</span>
            </div>
            <div className="mt-4 flex justify-end gap-4 text-[13px] font-semibold text-[#1a73e8]">
              <span className="py-1">Cancelar</span>
              <Toque>
                <span className="rounded-full bg-white px-3 py-1">Instalar</span>
              </Toque>
            </div>
          </div>
        </Tela>
      ),
    },
  ]
}

function passoFinal(p: Plataforma): Passo {
  return {
    titulo: "Pronto! Esse é o ícone",
    texto: "A ondinha verde da VermeFree aparece junto com os seus apps. Abra sempre por ele: seu login fica salvo e as doses do dia já aparecem.",
    ilustracao: <TelaInicial redondo={p === "android"} />,
  }
}

/* ---------- Pop-up ---------- */

export function TutorialInstalar({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const detectada = plataforma()
  const [aba, setAba] = React.useState<Plataforma>(detectada === "android" ? "android" : "ios")
  const [i, setI] = React.useState(0)
  const [direto, setDireto] = React.useState(podeInstalarDireto())
  const [copiado, setCopiado] = React.useState(false)
  const caixa = React.useRef<HTMLDivElement>(null)
  const embutido = navegadorEmbutido()

  const passos = React.useMemo(
    () => [...(aba === "ios" ? passosIos(iosForaDoSafari()) : passosAndroid()), passoFinal(aba)],
    [aba],
  )
  const passo = passos[i]
  const ultimo = i === passos.length - 1

  React.useEffect(() => aoMudarInstalacao(() => setDireto(podeInstalarDireto())), [])

  const fechar = React.useCallback(() => {
    marcarTutorialVisto()
    onFechar()
  }, [onFechar])

  React.useEffect(() => {
    if (!aberto) return
    setI(0)
    const antes = document.body.style.overflow
    document.body.style.overflow = "hidden"
    caixa.current?.focus()
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar()
    }
    window.addEventListener("keydown", tecla)
    return () => {
      document.body.style.overflow = antes
      window.removeEventListener("keydown", tecla)
    }
  }, [aberto, fechar])

  if (!aberto) return null

  async function instalar() {
    const aceitou = await instalarDireto()
    if (aceitou) fechar()
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(window.location.origin)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      /* o endereço continua visível no texto */
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="presentation">
      <button type="button" aria-label="Fechar" className="absolute inset-0 bg-[#0b1f17]/55 backdrop-blur-[2px]" onClick={fechar} />
      <div
        ref={caixa}
        role="dialog"
        aria-modal="true"
        aria-labelledby="t-tutorial"
        tabIndex={-1}
        className="relative max-h-[92dvh] w-full max-w-[480px] overflow-y-auto rounded-t-[28px] bg-card px-5 pt-4 pb-safe shadow-2xl outline-none animate-subir sm:rounded-[28px] sm:pb-5"
      >
        <span aria-hidden className="mx-auto mb-3 block h-1.5 w-10 rounded-full bg-border sm:hidden" />
        <div className="flex items-start gap-3">
          <IconeApp tamanho={52} />
          <div className="min-w-0 flex-1">
            <h2 id="t-tutorial" className="text-[1.35rem] leading-tight text-primary">
              Coloque o app na tela inicial
            </h2>
            <p className="mt-0.5 text-[13.5px] text-muted-foreground">Abre com um toque, como um aplicativo. Leva 20 segundos.</p>
          </div>
          <button type="button" onClick={fechar} aria-label="Fechar" className="-mr-2 -mt-1 grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground">
            <X className="size-5" />
          </button>
        </div>

        {embutido && (
          <div className="mt-4 flex gap-2.5 rounded-card bg-[#fff6e5] p-3.5 text-[13.5px] text-[#6b4a0f]">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              Você abriu pelo {embutido}, e por aqui não dá para instalar. Toque em <b>•••</b> e escolha <b>Abrir no navegador</b>
              {aba === "ios" ? " (Safari)" : " (Chrome)"}. Ou copie o link e cole lá.
              <button type="button" onClick={copiarLink} className="mt-2 flex min-h-9 items-center gap-1.5 font-semibold underline underline-offset-2">
                {copiado ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />} {copiado ? "Link copiado" : "Copiar link"}
              </button>
            </p>
          </div>
        )}

        {direto && aba === "android" && (
          <div className="mt-4 rounded-card bg-selected p-4">
            <p className="text-[14px] font-semibold text-primary">Seu celular deixa instalar direto:</p>
            <LiquidButton tone="lime" size="lg" className="mt-3 w-full" onClick={instalar}>
              <Download aria-hidden /> Instalar com 1 toque
            </LiquidButton>
            <p className="mt-2 text-center text-[12.5px] text-muted-foreground">Ou siga o passo a passo abaixo.</p>
          </div>
        )}

        <div role="tablist" aria-label="Tipo de celular" className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-background p-1">
          {(["ios", "android"] as const).map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={aba === p}
              onClick={() => {
                setAba(p)
                setI(0)
              }}
              className={cn(
                "min-h-11 rounded-full text-[14px] font-semibold transition-colors",
                aba === p ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {p === "ios" ? "iPhone" : "Android"}
            </button>
          ))}
        </div>

        <div className="mt-4" aria-live="polite">
          <div key={`${aba}-${i}`} className="animate-subir">
            {passo.ilustracao}
            <p className="mt-4 text-[12.5px] font-bold uppercase tracking-[0.14em] text-leaf">
              {ultimo ? "Tudo certo" : `Passo ${i + 1} de ${passos.length - 1}`}
            </p>
            <h3 className="mt-1 text-[1.2rem] leading-snug text-primary">{passo.titulo}</h3>
            <p className="mt-1 min-h-[3.75rem] text-[14.5px] leading-relaxed text-foreground">{passo.texto}</p>
          </div>
        </div>

        <div className="mt-2 flex justify-center gap-1.5" aria-hidden>
          {passos.map((_, n) => (
            <span key={n} className={cn("h-1.5 rounded-full transition-all", n === i ? "w-5 bg-primary" : "w-1.5 bg-border")} />
          ))}
        </div>

        <div className="mt-4 flex gap-2 pb-1">
          {i > 0 && (
            <Button variant="outline" className="shrink-0 px-5" onClick={() => setI(i - 1)} aria-label="Passo anterior">
              <ArrowLeft aria-hidden />
            </Button>
          )}
          {ultimo ? (
            <Button className="flex-1" onClick={fechar}>
              <Check aria-hidden /> Entendi
            </Button>
          ) : (
            <Button className="flex-1" onClick={() => setI(i + 1)}>
              Próximo <ArrowRight aria-hidden />
            </Button>
          )}
        </div>
        {i === 0 && (
          <button type="button" onClick={fechar} className="mx-auto mt-1 flex min-h-11 items-center px-4 text-[13.5px] font-semibold text-muted-foreground">
            Agora não
          </button>
        )}
      </div>
    </div>
  )
}
