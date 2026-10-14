import type { Faixa, Tipo } from "@/content/protocolo"

const API_URL =
  import.meta.env.VITE_APP_API_URL || "https://xwusvksjnwydliicjveu.supabase.co/functions/v1/app-api"

export type Produtos = { adulto: number; kids_2_4: number; kids_5_9: number; familia: number; oleo_alho: number }

export type Profile = { id: string; tipo: Tipo; nome: string; faixa_etaria: Faixa | null; created_at: string }

export type Run = {
  id: string
  profile_id: string
  moon_date: string
  silimarina_start_date: string | null
  start_date: string
  end_date: string
  status: "agendado" | "em_andamento" | "concluido" | "abandonado"
  created_at: string
  completed_at: string | null
}

export type Check = { run_id: string; check_date: string; item_key: string; done: boolean }

export type Quiz = {
  run_id: string
  transformacao: string
  recomendacao: "repetir_proximo_ciclo" | "manutencao_normal"
  cupom_oferecido: string | null
}

export type AppState = {
  customer: { nome: string | null; email: string; produtos: Produtos | null }
  profiles: Profile[]
  runs: Run[]
  checks: Check[]
  quiz: Quiz[]
  hoje: string
}

export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
  ) {
    super(code)
  }
}

export async function api<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload }),
    })
  } catch {
    throw new ApiError("network", 0)
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data?.error || "unknown", res.status)
  return data as T
}

const TOKEN_KEY = "vf_app_token"

export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      /* armazenamento indisponível: a sessão vale só enquanto a aba estiver aberta */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* nada a fazer */
    }
  },
}
