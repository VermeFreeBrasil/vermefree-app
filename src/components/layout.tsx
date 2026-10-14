import { NavLink, Outlet } from "react-router-dom"
import { BookOpen, CalendarDays, CircleHelp, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlowBackground } from "@/components/ui/glow-background"
import { MARCA_CAIXA, MARCA_PATH } from "@/content/marca"

/** Símbolo da marca (a onda verde da VermeFree), o mesmo do ícone na tela inicial. */
export function Simbolo({ className }: { className?: string }) {
  const { x, y, largura, altura } = MARCA_CAIXA
  return (
    <svg viewBox={`${x} ${y} ${largura} ${altura}`} className={className} aria-hidden fill="currentColor">
      <path d={MARCA_PATH} />
    </svg>
  )
}

export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-display text-[22px] leading-none",
        tone === "light" ? "text-white" : "text-primary",
        className,
      )}
    >
      <Simbolo className={cn("h-[11px] w-auto", tone === "light" ? "text-accent" : "text-leaf")} />
      VermeFree
    </span>
  )
}

const ABAS = [
  { to: "/hoje", label: "Hoje", icon: Sun },
  { to: "/cronograma", label: "Cronograma", icon: CalendarDays },
  { to: "/guia", label: "Guia", icon: BookOpen },
  { to: "/ajuda", label: "Ajuda", icon: CircleHelp },
]

function BottomNav() {
  return (
    <nav aria-label="Navegação principal" className="pointer-events-none fixed inset-x-0 bottom-0 z-40 pb-safe">
      <div className="pointer-events-auto glass mx-auto flex w-[min(440px,calc(100%-24px))] items-center justify-between rounded-full p-1.5">
        {ABAS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-semibold transition-colors duration-200",
                isActive ? "bg-primary text-white" : "text-muted-foreground",
              )
            }
          >
            <Icon className="size-5" aria-hidden />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export function AppLayout() {
  return (
    <GlowBackground tone="paper">
      <div className="mx-auto w-full max-w-[560px] px-4 pb-32 pt-safe">
        <Outlet />
      </div>
      <BottomNav />
    </GlowBackground>
  )
}

export function PageHeader({
  eyebrow,
  titulo,
  acao,
  children,
}: {
  eyebrow?: string
  titulo: string
  /** Botão pequeno no canto direito, na linha do logo. */
  acao?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <header className="animate-subir pb-5 pt-4">
      <div className="mb-5 flex min-h-11 items-center justify-between gap-3">
        <Logo />
        {acao}
      </div>
      {eyebrow && <p className="eyebrow mb-1.5 text-leaf">{eyebrow}</p>}
      <h1 className="text-[2.1rem] text-primary">{titulo}</h1>
      {children}
    </header>
  )
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-panel border border-border bg-card p-5", className)}>{children}</section>
}
