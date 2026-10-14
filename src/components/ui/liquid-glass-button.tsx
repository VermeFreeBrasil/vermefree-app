import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Adaptado do componente LiquidButton original:
// - formato cápsula em todas as camadas (design system: botão 999px);
// - variante "onDark" para fundos forest e "onLight" para fundos paper;
// - vidro fosco via backdrop-filter (funciona no Safari do iPhone) e, no
//   Chrome/Android, a distorção do filtro SVG #container-glass por cima;
// - o filtro SVG é renderizado uma única vez (<GlassFilter /> na raiz do app);
// - <span> no lugar de <div> dentro do botão, para HTML válido.
const liquidbuttonVariants = cva(
  "group relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold outline-none transition-[transform,color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] disabled:pointer-events-none focus-visible:ring-[3px] focus-visible:ring-accent [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 [@media(hover:hover)]:hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:scale-100",
  {
    variants: {
      tone: {
        onLight: "text-primary disabled:text-primary/40",
        onDark: "text-white disabled:text-white/45",
        lime: "text-accent-foreground disabled:text-white/55",
      },
      size: {
        default: "min-h-12 px-6 text-[15px]",
        lg: "min-h-[54px] px-8 text-base",
        xl: "min-h-14 px-10 text-base",
        icon: "size-12",
      },
    },
    defaultVariants: { tone: "onLight", size: "lg" },
  },
)

const sombraClara =
  "shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)]"
const sombraEscura =
  "shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)]"

// Desativado: vira vidro neutro, para ler como "falta preencher" e não como botão quebrado.
const fundoVidro: Record<NonNullable<VariantProps<typeof liquidbuttonVariants>["tone"]>, string> = {
  onLight: "bg-white/35 group-disabled:bg-white/20",
  onDark: "bg-white/10 group-disabled:bg-white/5",
  lime: "bg-accent/85 group-disabled:bg-white/10",
}

function LiquidButton({
  className,
  tone = "onLight",
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof liquidbuttonVariants> & {
    asChild?: boolean
  }) {
  const t = tone ?? "onLight"
  const classes = cn(liquidbuttonVariants({ tone: t, size, className }))

  const camadas = (
    <>
      <span
        aria-hidden
        className={cn("absolute inset-0 z-0 rounded-full transition-all group-disabled:opacity-50", t === "onLight" ? sombraClara : sombraEscura)}
      />
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 isolate -z-10 overflow-hidden rounded-full backdrop-blur-md backdrop-saturate-150",
          fundoVidro[t],
        )}
        style={{ backdropFilter: 'url("#container-glass")' }}
      />
    </>
  )
  const conteudo = (c: React.ReactNode) => (
    <span className="pointer-events-none relative z-10 inline-flex items-center gap-2">{c}</span>
  )

  // Com asChild (ex.: <a> ou <Link>), as camadas de vidro entram dentro do elemento filho:
  // o Slot do Radix aceita um único filho.
  if (asChild && React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return (
      <Slot data-slot="button" className={classes} {...props}>
        {React.cloneElement(children, undefined, camadas, conteudo(children.props.children))}
      </Slot>
    )
  }

  return (
    <button data-slot="button" className={classes} {...props}>
      {camadas}
      {conteudo(children)}
    </button>
  )
}

/** Filtro SVG da distorção do vidro. Renderizar uma vez, na raiz do app. */
function GlassFilter() {
  return (
    <svg className="absolute size-0" aria-hidden focusable="false">
      <defs>
        <filter id="container-glass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves={1} seed={1} result="turbulence" />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="70"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  )
}

export { LiquidButton, GlassFilter, liquidbuttonVariants }
