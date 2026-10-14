// Gera public/guia-de-alimentos-vermefree.pdf a partir de src/content/guia.ts.
// Roda antes do vite build (npm run build), então o PDF sempre acompanha o texto do app.
/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { createRequire } from "node:module"
import { mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import {
  Document,
  Font,
  Image,
  Link,
  Page,
  Path,
  RadialGradient,
  Rect,
  Defs,
  Stop,
  StyleSheet,
  Svg,
  Text,
  View,
  renderToFile,
} from "@react-pdf/renderer"
import { GUIA, GUIA_PDF, GUIA_RODAPE, GUIA_SUBTITULO, separarRotulo, type Bloco, type Secao } from "../src/content/guia"

const require = createRequire(import.meta.url)
const raiz = join(dirname(fileURLToPath(import.meta.url)), "..")
const fonte = (pkg: string, arquivo: string) => join(dirname(require.resolve(`${pkg}/package.json`)), "files", arquivo)

Font.register({ family: "Caprasimo", src: fonte("@fontsource/caprasimo", "caprasimo-latin-400-normal.woff") })
Font.register({
  family: "Inter",
  fonts: [
    { src: fonte("@fontsource/inter", "inter-latin-400-normal.woff"), fontWeight: 400 },
    { src: fonte("@fontsource/inter", "inter-latin-600-normal.woff"), fontWeight: 600 },
    { src: fonte("@fontsource/inter", "inter-latin-700-normal.woff"), fontWeight: 700 },
    { src: fonte("@fontsource/inter", "inter-latin-800-normal.woff"), fontWeight: 800 },
  ],
})
// Português: sem hifenização automática (o padrão quebra palavras como se fossem inglês).
Font.registerHyphenationCallback((palavra) => [palavra])

const C = {
  forest: "#153c2c",
  deep: "#102e23",
  lime: "#c0de96",
  paper: "#fbfaf5",
  ink: "#193b2c",
  muted: "#53675b",
  line: "#dce3d7",
  leaf: "#5e8c43",
  selected: "#edf5e2",
  sand: "#f7f0dd",
  sandDark: "#e9d9b0",
  sandInk: "#5b4410",
  white: "#ffffff",
}

const FOTO_CAPA =
  "https://cdn.shopify.com/s/files/1/0827/3267/9387/files/produto-card-4-kit-familia-crop.png?v=1778699873"
const ATENDIMENTO = "https://l.vermefree.com.br/atendimento"

const s = StyleSheet.create({
  page: { backgroundColor: C.paper, paddingTop: 54, paddingBottom: 64, paddingHorizontal: 48, fontFamily: "Inter", fontSize: 10.5, color: C.ink, lineHeight: 1.5 },
  topo: { position: "absolute", top: 22, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  topoMarca: { flexDirection: "row", alignItems: "center", gap: 4 },
  topoTexto: { fontFamily: "Caprasimo", fontSize: 10, color: C.forest },
  topoSecao: { fontSize: 7.5, fontWeight: 700, letterSpacing: 1.2, color: C.leaf, textTransform: "uppercase" },
  rodape: { position: "absolute", bottom: 26, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: C.line, paddingTop: 8 },
  rodapeTexto: { fontSize: 7.5, color: C.muted },
  secaoTopo: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  numero: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.selected, alignItems: "center", justifyContent: "center" },
  numeroTexto: { fontFamily: "Caprasimo", fontSize: 13, color: C.forest },
  eyebrow: { fontSize: 7.5, fontWeight: 700, letterSpacing: 1.4, color: C.leaf, textTransform: "uppercase", marginBottom: 2 },
  titulo: { fontFamily: "Caprasimo", fontSize: 24, color: C.forest, lineHeight: 1.1 },
  subtituloSecao: { fontSize: 11, color: C.muted, marginTop: 2 },
  p: { marginBottom: 8 },
  h3: { fontFamily: "Caprasimo", fontSize: 14, color: C.forest, marginTop: 6, marginBottom: 8 },
  destaque: { backgroundColor: C.selected, borderRadius: 12, padding: 12, marginVertical: 6, color: C.forest },
  dica: { backgroundColor: "#e3efcf", borderRadius: 12, padding: 12, marginVertical: 6, color: C.forest },
  bold: { fontWeight: 700, color: C.forest },
  itemLinha: { flexDirection: "row", gap: 8, marginBottom: 6 },
  ponto: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.leaf, marginTop: 5 },
  card: { borderWidth: 1, borderColor: C.line, backgroundColor: C.white, borderRadius: 12, padding: 10 },
  grade: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  meia: { width: "48.8%" },
  cardNome: { fontWeight: 700, color: C.forest, fontSize: 10.5, marginBottom: 2 },
  cardTexto: { fontSize: 9.5, lineHeight: 1.45 },
  cardMuted: { fontSize: 9, color: C.muted, marginTop: 3 },
})

function Folha({ size = 12, cor = C.leaf }: { size?: number; cor?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"
        stroke={cor}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" stroke={cor} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  )
}

function Bolha({ cor = C.selected }: { cor?: string }) {
  return (
    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: cor, alignItems: "center", justifyContent: "center" }}>
      <Folha size={11} />
    </View>
  )
}

function TextoComRotulo({ texto, flex = true }: { texto: string; flex?: boolean }) {
  const [rotulo, resto] = separarRotulo(texto)
  return (
    <Text style={flex ? { flex: 1 } : {}}>
      {rotulo ? <Text style={s.bold}>{rotulo}: </Text> : null}
      {resto}
    </Text>
  )
}

function Caixa({ marcada = false }: { marcada?: boolean }) {
  return <View style={{ width: 10, height: 10, borderWidth: 1.2, borderColor: C.leaf, borderRadius: 2, backgroundColor: marcada ? C.leaf : C.white }} />
}

function BlocoPdf({ bloco, secao }: { bloco: Bloco; secao: Secao }) {
  switch (bloco.tipo) {
    case "p":
      return <Text style={s.p}>{bloco.texto}</Text>
    case "subtitulo":
      return <Text style={s.h3} minPresenceAhead={60}>{bloco.texto}</Text>
    case "destaque":
      return (
        <View style={s.destaque} wrap={false}>
          <TextoComRotulo texto={bloco.texto} flex={false} />
        </View>
      )
    case "dica":
      return (
        <View style={s.dica} wrap={false}>
          <Text>
            <Text style={s.bold}>{bloco.titulo}: </Text>
            {bloco.texto}
          </Text>
        </View>
      )
    case "lista":
      return (
        <View style={{ marginVertical: 4 }}>
          {bloco.itens.map((t) => (
            <View key={t} style={s.itemLinha} wrap={false}>
              {bloco.icones ? <Bolha cor={secao.id === "reduzir" ? C.sand : C.selected} /> : <View style={s.ponto} />}
              <TextoComRotulo texto={t} />
            </View>
          ))}
        </View>
      )
    case "momentos":
      return (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
          {bloco.itens.map((m, k) => (
            <View key={m.rotulo} style={[s.card, { flex: 1, backgroundColor: k === 0 ? C.sand : C.selected, borderWidth: 0 }]}>
              <Text style={s.eyebrow}>
                {k + 1}. {m.rotulo}
              </Text>
              <Text style={s.cardTexto}>{m.texto}</Text>
            </View>
          ))}
        </View>
      )
    case "alimentos":
      return (
        <View style={[s.grade, { marginVertical: 6 }]}>
          {bloco.itens.map((a) => (
            <View key={a.nome} style={[s.card, s.meia, { flexDirection: "row", gap: 8 }]} wrap={false}>
              <Bolha />
              <View style={{ flex: 1 }}>
                <Text style={s.cardNome}>{a.nome}</Text>
                <Text style={s.cardTexto}>{a.texto}</Text>
              </View>
            </View>
          ))}
        </View>
      )
    case "grupos":
      return (
        <View style={{ gap: 6, marginVertical: 4 }}>
          {bloco.itens.map((g) => (
            <View key={g.nome} style={[s.card, { flexDirection: "row", gap: 8 }]} wrap={false}>
              <Bolha />
              <View style={{ flex: 1 }}>
                <Text style={s.cardNome}>{g.nome}</Text>
                <Text style={s.cardTexto}>{g.exemplos}</Text>
                <Text style={s.cardMuted}>{g.porque}</Text>
              </View>
            </View>
          ))}
        </View>
      )
    case "fases":
      return (
        <View style={{ gap: 8, marginVertical: 4 }}>
          {bloco.fases.map((f, k) => (
            <View key={f.rotulo} style={{ backgroundColor: k === 0 ? C.sand : C.selected, borderRadius: 12, padding: 12 }} wrap={false}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text
                  style={{
                    backgroundColor: k === 0 ? C.sandDark : C.lime,
                    color: k === 0 ? C.sandInk : C.deep,
                    fontSize: 8,
                    fontWeight: 700,
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                    borderRadius: 8,
                  }}
                >
                  {f.rotulo}
                </Text>
                <Text style={{ fontSize: 8.5, color: C.muted, fontWeight: 600 }}>{f.quando}</Text>
              </View>
              <Text style={{ fontFamily: "Caprasimo", fontSize: 15, color: C.forest, marginTop: 6 }}>{f.titulo}</Text>
              <Text style={{ marginTop: 4, marginBottom: 4 }}>{f.intro}</Text>
              {f.itens.map((t) => (
                <View key={t} style={s.itemLinha}>
                  <View style={s.ponto} />
                  <Text style={{ flex: 1 }}>{t}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )
    case "cardapio":
      return (
        <View style={{ borderWidth: 1, borderColor: C.line, borderRadius: 12, overflow: "hidden", marginVertical: 6 }}>
          <View style={{ flexDirection: "row", backgroundColor: C.forest }}>
            {["Refeição", "Adulto", "Criança"].map((h, k) => (
              <Text key={h} style={{ width: k === 0 ? "22%" : "39%", padding: 8, color: C.white, fontWeight: 700, fontSize: 9 }}>
                {h}
              </Text>
            ))}
          </View>
          {bloco.refeicoes.map((r, k) => (
            <View key={r.nome} style={{ flexDirection: "row", backgroundColor: k % 2 ? C.paper : C.white, borderTopWidth: k ? 1 : 0, borderTopColor: C.line }} wrap={false}>
              <Text style={{ width: "22%", padding: 8, fontWeight: 700, color: C.forest, fontSize: 9.5 }}>{r.nome}</Text>
              <Text style={{ width: "39%", padding: 8, fontSize: 9.5 }}>{r.adulto}</Text>
              <Text style={{ width: "39%", padding: 8, fontSize: 9.5 }}>{r.crianca}</Text>
            </View>
          ))}
        </View>
      )
    case "compras":
      return (
        <View style={[s.grade, { marginVertical: 4 }]}>
          {bloco.grupos.map((g) => (
            <View key={g.nome} style={[s.card, { width: "31.9%" }]} wrap={false}>
              <Text style={[s.eyebrow, { marginBottom: 6 }]}>{g.nome}</Text>
              {g.itens.map((item) => (
                <View key={item} style={{ flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 4 }}>
                  <Caixa />
                  <Text style={{ fontSize: 10 }}>{item}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )
  }
}

function Topo({ secao }: { secao: string }) {
  return (
    <View style={s.topo} fixed>
      <View style={s.topoMarca}>
        <Folha size={10} />
        <Text style={s.topoTexto}>VermeFree</Text>
      </View>
      <Text style={s.topoSecao}>{secao}</Text>
    </View>
  )
}

function Rodape() {
  return (
    <View style={s.rodape} fixed>
      <Text style={s.rodapeTexto}>VermeFree · Guia de Alimentos Antiparasitários · {GUIA_RODAPE}</Text>
      <Text style={s.rodapeTexto} render={({ pageNumber }) => String(pageNumber)} />
    </View>
  )
}

function Capa({ foto }: { foto: Buffer | null }) {
  return (
    <Page size="A4" style={{ backgroundColor: C.forest, fontFamily: "Inter", color: C.white }}>
      <Svg style={{ position: "absolute", top: 0, left: 0 }} width={595} height={840}>
        <Defs>
          <RadialGradient id="brilhoTopo" cx="50%" cy="8%" r="60%">
            <Stop offset="0%" stopColor="#5e8c43" stopOpacity={0.75} />
            <Stop offset="100%" stopColor="#153c2c" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="brilhoBase" cx="50%" cy="100%" r="55%">
            <Stop offset="0%" stopColor="#1b5e20" stopOpacity={0.8} />
            <Stop offset="100%" stopColor="#153c2c" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={595.28} height={841.89} fill="url(#brilhoTopo)" />
        <Rect x={0} y={0} width={595.28} height={841.89} fill="url(#brilhoBase)" />
      </Svg>
      <View style={{ paddingHorizontal: 56, paddingTop: 56, flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Folha size={18} cor={C.lime} />
          <Text style={{ fontFamily: "Caprasimo", fontSize: 18 }}>VermeFree</Text>
        </View>

        {foto ? (
          <View style={{ marginTop: 40, alignItems: "center" }}>
            <Image src={foto} style={{ width: 300, height: 300, borderRadius: 28, objectFit: "cover" }} />
          </View>
        ) : (
          <View style={{ height: 120 }} />
        )}

        <View style={{ marginTop: 40 }}>
          <Text style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.8, color: C.lime, textTransform: "uppercase" }}>
            Para adultos e crianças
          </Text>
          <Text style={{ fontFamily: "Caprasimo", fontSize: 44, lineHeight: 1.05, marginTop: 10 }}>Guia de Alimentos</Text>
          <Text style={{ fontFamily: "Caprasimo", fontSize: 44, lineHeight: 1.05, color: C.lime }}>Antiparasitários</Text>
          <Text style={{ fontSize: 13, color: "#d5e2d0", marginTop: 14, maxWidth: 400 }}>{GUIA_SUBTITULO}.</Text>
        </View>
      </View>
      <Text style={{ position: "absolute", bottom: 32, left: 56, right: 56, fontSize: 8, color: "#d5e2d0" }}>{GUIA_RODAPE}</Text>
    </Page>
  )
}

function Fechamento() {
  return (
    <View style={{ marginTop: 4, backgroundColor: C.forest, borderRadius: 16, padding: 18 }} wrap={false}>
      <Text style={{ fontFamily: "Caprasimo", fontSize: 18, color: C.white }}>Ficou com dúvida?</Text>
      <Text style={{ color: "#d5e2d0", marginTop: 4 }}>Fale com a gente pelo WhatsApp. Tem pessoa de verdade respondendo do outro lado.</Text>
      <Link src={ATENDIMENTO} style={{ marginTop: 10, color: C.lime, fontWeight: 700, textDecoration: "none" }}>
        l.vermefree.com.br/atendimento
      </Link>
    </View>
  )
}

/** Seções que abrem página nova; as outras seguem logo abaixo da anterior. */
const PAGINA_NOVA = new Set(["comeco", "fases", "depois", "cardapio", "compras"])

function GuiaPdf({ foto }: { foto: Buffer | null }) {
  return (
    <Document title="Guia de Alimentos Antiparasitários · VermeFree" author="VermeFree" language="pt-BR">
      <Capa foto={foto} />
      <Page size="A4" style={s.page}>
        <Topo secao="Guia de Alimentos Antiparasitários" />
        {GUIA.map((secao, i) => (
          <View key={secao.id} style={{ marginBottom: 14 }} break={i > 0 && PAGINA_NOVA.has(secao.id)}>
            <View style={s.secaoTopo} wrap={false} minPresenceAhead={80}>
              <View style={s.numero}>
                <Text style={s.numeroTexto}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.eyebrow}>{secao.subtitulo}</Text>
                <Text style={s.titulo}>{secao.titulo}</Text>
              </View>
            </View>
            {secao.blocos.map((b, k) => (
              <BlocoPdf key={k} bloco={b} secao={secao} />
            ))}
          </View>
        ))}
        <Fechamento />
        <Rodape />
      </Page>
    </Document>
  )
}

async function baixarFoto(): Promise<Buffer | null> {
  try {
    const r = await fetch(FOTO_CAPA, { signal: AbortSignal.timeout(15000) })
    if (!r.ok) return null
    return Buffer.from(await r.arrayBuffer())
  } catch {
    // Sem internet no build: a capa sai sem a foto, o resto do PDF não muda.
    return null
  }
}

const destino = join(raiz, "public", GUIA_PDF.replace(/^\//, ""))
mkdirSync(dirname(destino), { recursive: true })
const foto = await baixarFoto()
await renderToFile(<GuiaPdf foto={foto} />, destino)
console.log(`PDF do guia gerado em ${destino}${foto ? "" : " (sem foto na capa)"}`)
