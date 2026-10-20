import * as React from "react"
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { AppProvider, useApp } from "@/lib/app-state"
import { GlassFilter } from "@/components/ui/liquid-glass-button"
import { GlowBackground } from "@/components/ui/glow-background"
import { AppLayout, Logo } from "@/components/layout"
import { EntrarScreen } from "@/screens/entrar"
import { CadastroScreen } from "@/screens/cadastro"
import { HojeScreen } from "@/screens/hoje"
import { CronogramaScreen } from "@/screens/cronograma"
import { GuiaScreen } from "@/screens/guia"
import { AjudaScreen } from "@/screens/ajuda"
import { FimCicloScreen } from "@/screens/fim-ciclo"
import { PessoasScreen } from "@/screens/pessoas"
import { LembretesScreen } from "@/screens/lembretes"
import { PedidoScreen } from "@/screens/pedido"
import { paginaVista } from "@/lib/pixels"

/**
 * Cada troca de tela conta como visualização de página nos pixels. Espera um instante
 * para contar só a tela onde a pessoa parou, não os redirecionamentos (/ → /hoje → /entrar).
 */
function PaginaVista() {
  const { pathname } = useLocation()
  React.useEffect(() => {
    const t = setTimeout(() => paginaVista(pathname), 400)
    return () => clearTimeout(t)
  }, [pathname])
  return null
}

function Carregando() {
  return (
    <GlowBackground tone="forest" className="grid place-items-center">
      <div className="flex flex-col items-center gap-4">
        <Logo tone="light" className="text-[28px]" />
        <Loader2 className="size-6 animate-spin text-accent" aria-label="Carregando" />
      </div>
    </GlowBackground>
  )
}

/** Sem sessão → Entrar. Sem pessoas cadastradas → Cadastro. */
function Guardas({ precisaPerfis }: { precisaPerfis: boolean }) {
  const { state, carregando } = useApp()
  if (carregando) return <Carregando />
  if (!state) return <Navigate to="/entrar" replace />
  if (precisaPerfis && state.profiles.length === 0) return <Navigate to="/cadastro" replace />
  return <Outlet />
}

function SoDeslogado() {
  const { state, carregando } = useApp()
  if (carregando) return <Carregando />
  if (state) return <Navigate to={state.profiles.length ? "/hoje" : "/cadastro"} replace />
  return <EntrarScreen />
}

function SoSemPerfis() {
  const { state } = useApp()
  if (state && state.profiles.length) return <Navigate to="/hoje" replace />
  return <CadastroScreen />
}

export default function App() {
  return (
    <AppProvider>
      <GlassFilter />
      <BrowserRouter>
        <PaginaVista />
        <Routes>
          <Route path="/entrar" element={<SoDeslogado />} />
          <Route element={<Guardas precisaPerfis={false} />}>
            <Route path="/cadastro" element={<SoSemPerfis />} />
          </Route>
          <Route element={<Guardas precisaPerfis />}>
            <Route path="/instalar" element={<Navigate to="/hoje?instalar=1" replace />} />
            <Route path="/fim/:runId" element={<FimCicloScreen />} />
            <Route element={<AppLayout />}>
              <Route path="/hoje" element={<HojeScreen />} />
              <Route path="/cronograma" element={<CronogramaScreen />} />
              <Route path="/guia" element={<GuiaScreen />} />
              <Route path="/ajuda" element={<AjudaScreen />} />
              <Route path="/pessoas" element={<PessoasScreen />} />
              <Route path="/lembretes" element={<LembretesScreen />} />
              <Route path="/pedido" element={<PedidoScreen />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/hoje" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
