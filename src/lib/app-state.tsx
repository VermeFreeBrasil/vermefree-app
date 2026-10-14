import * as React from "react"
import { api, ApiError, tokenStore, type AppState } from "@/lib/api"
import type { Faixa, Tipo } from "@/content/protocolo"

type NovoPerfil = { tipo: Tipo; nome: string; faixa_etaria: Faixa | null }

type Ctx = {
  state: AppState | null
  carregando: boolean
  login: (email: string) => Promise<void>
  logout: () => void
  salvarPerfis: (perfis: NovoPerfil[], moonDate: string) => Promise<void>
  novoCiclo: (profileId: string, moonDate: string) => Promise<void>
  removerPerfil: (profileId: string) => Promise<void>
  marcar: (runId: string, date: string, itemKey: string, done: boolean) => Promise<void>
  fecharCiclo: (runId: string, transformacao: string, relato: string) => Promise<void>
}

const AppContext = React.createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<string | null>(() => tokenStore.get())
  const [state, setState] = React.useState<AppState | null>(null)
  const [carregando, setCarregando] = React.useState<boolean>(() => Boolean(tokenStore.get()))

  const logout = React.useCallback(() => {
    tokenStore.clear()
    setToken(null)
    setState(null)
  }, [])

  // Sessão salva: recarrega o estado ao abrir o app.
  React.useEffect(() => {
    if (!token || state) return
    let ativo = true
    api<{ state: AppState }>("get-state", { access_token: token })
      .then((r) => ativo && setState(r.state))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) logout()
      })
      .finally(() => ativo && setCarregando(false))
    return () => {
      ativo = false
    }
  }, [token, state, logout])

  const comToken = React.useCallback(
    async (action: string, payload: Record<string, unknown>) => {
      try {
        const r = await api<{ state: AppState }>(action, { access_token: token, ...payload })
        setState(r.state)
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) logout()
        throw e
      }
    },
    [token, logout],
  )

  const value: Ctx = {
    state,
    carregando,
    logout,
    async login(email) {
      const r = await api<{ access_token: string; state: AppState }>("login", { email })
      tokenStore.set(r.access_token)
      setToken(r.access_token)
      setState(r.state)
    },
    salvarPerfis: (perfis, moonDate) => comToken("save-profiles", { profiles: perfis, moon_date: moonDate }),
    novoCiclo: (profileId, moonDate) => comToken("new-run", { profile_id: profileId, moon_date: moonDate }),
    removerPerfil: (profileId) => comToken("remove-profile", { profile_id: profileId }),
    fecharCiclo: (runId, transformacao, relato) =>
      comToken("complete-run", { run_id: runId, transformacao, relato: relato || undefined }),
    async marcar(runId, date, itemKey, done) {
      // Atualiza na hora e desfaz se o servidor recusar.
      const aplicar = (valor: boolean) =>
        setState((s) => {
          if (!s) return s
          const outros = s.checks.filter(
            (c) => !(c.run_id === runId && c.check_date === date && c.item_key === itemKey),
          )
          return {
            ...s,
            checks: valor ? [...outros, { run_id: runId, check_date: date, item_key: itemKey, done: true }] : outros,
          }
        })
      aplicar(done)
      try {
        await api("toggle-check", { access_token: token, run_id: runId, check_date: date, item_key: itemKey, done })
      } catch (e) {
        aplicar(!done)
        if (e instanceof ApiError && e.status === 401) logout()
        throw e
      }
    },
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = React.useContext(AppContext)
  if (!ctx) throw new Error("useApp fora do AppProvider")
  return ctx
}
