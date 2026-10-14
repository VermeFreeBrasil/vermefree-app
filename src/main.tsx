import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "@/App"
import "@/index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* sem service worker o app funciona normalmente, só não abre offline */
    })
  })
}
