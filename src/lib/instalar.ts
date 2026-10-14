// Tudo sobre colocar o app na tela inicial: plataforma, navegador e o convite nativo do Android.

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

let promptGuardado: BeforeInstallPromptEvent | null = null
const ouvintes = new Set<() => void>()

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault()
    promptGuardado = e as BeforeInstallPromptEvent
    ouvintes.forEach((f) => f())
  })
  window.addEventListener("appinstalled", () => {
    promptGuardado = null
    ouvintes.forEach((f) => f())
  })
}

export function estaInstalado() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export type Plataforma = "ios" | "android"

export function plataforma(): Plataforma | "outro" {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios"
  if (/Android/i.test(ua)) return "android"
  return "outro"
}

/** Navegador embutido de app (Instagram, Facebook, TikTok…): ali não dá para instalar. */
export function navegadorEmbutido(): string | null {
  const ua = navigator.userAgent
  if (/Instagram/i.test(ua)) return "Instagram"
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "Facebook"
  if (/TikTok|musical_ly|BytedanceWebview/i.test(ua)) return "TikTok"
  if (/Line\//i.test(ua)) return "Line"
  return null
}

/** No iPhone, só o Safari (e o Chrome a partir do iOS 16.4) adicionam à Tela de Início. */
export function iosForaDoSafari() {
  const ua = navigator.userAgent
  return plataforma() === "ios" && /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua)
}

export function podeInstalarDireto() {
  return promptGuardado !== null
}

export function aoMudarInstalacao(f: () => void) {
  ouvintes.add(f)
  return () => {
    ouvintes.delete(f)
  }
}

/** Abre o convite nativo do Chrome no Android. Devolve true se a pessoa aceitou. */
export async function instalarDireto() {
  if (!promptGuardado) return false
  const p = promptGuardado
  await p.prompt()
  const escolha = await p.userChoice.catch(() => null)
  promptGuardado = null
  ouvintes.forEach((f) => f())
  return escolha?.outcome === "accepted"
}

const VISTO = "vf_tutorial_instalar"

export function tutorialJaVisto() {
  try {
    return localStorage.getItem(VISTO) === "1"
  } catch {
    return false
  }
}

export function marcarTutorialVisto() {
  try {
    localStorage.setItem(VISTO, "1")
  } catch {
    /* sem armazenamento: o convite volta na próxima visita */
  }
}
