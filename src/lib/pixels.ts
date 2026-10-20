// Pixels de marketing: Meta (2 pixels) e Google (Ads + Analytics), os mesmos da loja.
// Carregam só no app publicado. O app é de uma página só, então a troca de tela
// é enviada à mão como visualização de página (paginaVista).
// Nunca enviar e-mail, nome ou dados de saúde da cliente.

const META_PIXELS = ["867430254699991", "2239781696850189"]
const GOOGLE_TAGS = ["AW-18193701893", "G-W0NZM1LHSN"]

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue: unknown[]; loaded: boolean; version: string; push: unknown }
type Janela = Window & { fbq?: Fbq; _fbq?: Fbq; dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }

const w = window as Janela
const ativo = import.meta.env.PROD && typeof window !== "undefined"

function script(src: string) {
  const s = document.createElement("script")
  s.async = true
  s.src = src
  document.head.appendChild(s)
}

export function iniciarPixels() {
  if (!ativo || w.fbq || w.gtag) return

  // Meta Pixel (código padrão do Meta, sem o PageView inicial: ele sai em paginaVista)
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args)
    else fbq.queue.push(args)
  } as Fbq
  fbq.push = fbq
  fbq.loaded = true
  fbq.version = "2.0"
  fbq.queue = []
  w.fbq = fbq
  w._fbq = fbq
  script("https://connect.facebook.net/en_US/fbevents.js")
  for (const id of META_PIXELS) fbq("init", id)

  // Google tag (gtag.js) com Ads e Analytics
  w.dataLayer = w.dataLayer || []
  w.gtag = function () {
    // gtag precisa receber o objeto arguments, não um array
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments)
  }
  script(`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAGS[1]}`)
  w.gtag("js", new Date())
  for (const id of GOOGLE_TAGS) w.gtag("config", id, { send_page_view: false })
}

export function paginaVista(caminho: string) {
  if (!ativo) return
  w.fbq?.("track", "PageView")
  w.gtag?.("event", "page_view", { page_path: caminho, page_location: window.location.origin + caminho, page_title: document.title })
}

/** Cliente entrou no app com o e-mail da compra. */
export function eventoLogin() {
  if (!ativo) return
  w.fbq?.("trackCustom", "LoginApp")
  w.gtag?.("event", "login", { method: "email" })
}

/** Cliente montou o cronograma (cadastro concluído). */
export function eventoCadastro(pessoas: number) {
  if (!ativo) return
  w.fbq?.("track", "CompleteRegistration", { content_name: "Cronograma VermeFree", value: 0, currency: "BRL", num_items: pessoas })
  w.gtag?.("event", "sign_up", { method: "cronograma", pessoas })
}
