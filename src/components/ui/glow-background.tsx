import * as React from "react"
import { cn } from "@/lib/utils"

// Adaptado do componente de fundo com brilho radial:
// cores da marca no lugar do amarelo/verde-neon, duas versões (paper e forest)
// e brilho sempre atrás do conteúdo para não prejudicar a leitura.
type Tone = "paper" | "forest"

const fundos: Record<Tone, { base: string; brilho: string }> = {
  paper: {
    base: "bg-background",
    brilho:
      "radial-gradient(60% 45% at 50% 0%, rgba(192,222,150,0.55) 0%, transparent 70%), radial-gradient(45% 35% at 100% 100%, rgba(192,222,150,0.35) 0%, transparent 70%)",
  },
  forest: {
    base: "bg-primary",
    brilho:
      "radial-gradient(70% 50% at 50% 10%, rgba(94,140,67,0.55) 0%, transparent 70%), radial-gradient(60% 40% at 50% 100%, rgba(27,94,32,0.6) 0%, transparent 75%)",
  },
}

export function GlowBackground({
  tone = "paper",
  className,
  children,
}: {
  tone?: Tone
  className?: string
  children?: React.ReactNode
}) {
  const f = fundos[tone]
  return (
    <div className={cn("relative isolate min-h-dvh w-full", f.base, className)}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundImage: f.brilho }} />
      {children}
    </div>
  )
}
