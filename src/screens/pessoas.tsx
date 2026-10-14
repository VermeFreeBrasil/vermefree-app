import * as React from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, CalendarClock, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/layout"
import { Avatar, rotuloPerfil } from "@/components/protocolo"
import { EscolhaLua } from "@/components/escolha-lua"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/app-state"
import { formatLong, formatShort } from "@/lib/dates"
import { cicloAtual, inicioDoCiclo, podeMudarLua, situacao } from "@/lib/schedule"
import { cn } from "@/lib/utils"
import { Cuidados, EditorPessoa, novaLinha, paraPerfil, type Linha } from "@/screens/cadastro"
import { FASE_INFO, type Faixa } from "@/content/protocolo"
import type { Profile } from "@/lib/api"

type Modo = null | "editar" | "data" | "remover"

const ERRO_PADRAO = "Não deu para salvar agora. Confira a internet e tente de novo."

export function PessoasScreen() {
  const { state } = useApp()
  const s = state!
  const [adicionando, setAdicionando] = React.useState(false)

  return (
    <>
      <PageHeader
        eyebrow="Sua família"
        titulo="Pessoas e datas"
        acao={
          <Link to="/hoje" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-muted-foreground">
            <ArrowLeft className="size-4" aria-hidden /> Hoje
          </Link>
        }
      >
        <p className="mt-2 text-[15px] text-muted-foreground">
          Ajuste nomes e idades, mude a lua nova se o kit atrasar ou inclua mais alguém da casa.
        </p>
      </PageHeader>

      <ul className="space-y-3">
        {s.profiles.map((p) => (
          <li key={p.id}>
            <CartaoPessoa perfil={p} podeRemover={s.profiles.length > 1} />
          </li>
        ))}
      </ul>

      {adicionando ? (
        <NovaPessoa onFechar={() => setAdicionando(false)} />
      ) : (
        s.profiles.length < 10 && (
          <button
            type="button"
            onClick={() => setAdicionando(true)}
            className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-panel border border-dashed border-[#b9c6b3] text-[15px] font-semibold text-primary"
          >
            <Plus className="size-5" aria-hidden /> Adicionar pessoa
          </button>
        )
      )}
    </>
  )
}

function CartaoPessoa({ perfil, podeRemover }: { perfil: Profile; podeRemover: boolean }) {
  const { state, editarPerfil, mudarLua, removerPerfil } = useApp()
  const s = state!
  const run = cicloAtual(perfil, s.runs)
  const [modo, setModo] = React.useState<Modo>(null)
  const [nome, setNome] = React.useState(perfil.nome)
  const [faixa, setFaixa] = React.useState<Faixa | null>(perfil.faixa_etaria)
  const [lua, setLua] = React.useState<string | null>(null)
  const [salvando, setSalvando] = React.useState(false)
  const [erro, setErro] = React.useState<string | null>(null)

  const sit = run ? situacao(perfil, run, s.hoje) : null
  const mudaData = run && podeMudarLua(run, s.checks) && s.hoje <= run.end_date

  async function executar(acao: () => Promise<void>) {
    setSalvando(true)
    setErro(null)
    try {
      await acao()
      setModo(null)
    } catch {
      setErro(ERRO_PADRAO)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <section className="rounded-panel border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <Avatar nome={perfil.nome} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-bold text-primary">{perfil.nome}</p>
          <p className="text-[13px] text-muted-foreground">{rotuloPerfil(perfil)}</p>
        </div>
        {sit && <span className="rounded-full bg-secondary px-2.5 py-1 text-[12px] font-bold text-primary">{FASE_INFO[sit.fase].nome}</span>}
      </div>

      {run && (
        <p className="mt-3 text-[14px] text-foreground">
          Lua nova em <span className="font-semibold">{formatLong(run.moon_date)}</span>. Ciclo de {formatShort(inicioDoCiclo(run))} a {formatShort(run.end_date)}.
        </p>
      )}

      {modo === null && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setModo("editar")}>
            <Pencil aria-hidden /> Editar
          </Button>
          {mudaData && (
            <Button variant="outline" size="sm" onClick={() => setModo("data")}>
              <CalendarClock aria-hidden /> Mudar data
            </Button>
          )}
          {podeRemover && (
            <Button variant="ghost" size="sm" onClick={() => setModo("remover")}>
              <Trash2 aria-hidden /> Remover
            </Button>
          )}
        </div>
      )}

      {modo === "editar" && (
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-semibold text-primary" htmlFor={`edit-${perfil.id}`}>
            Nome
          </label>
          <input
            id={`edit-${perfil.id}`}
            value={nome}
            maxLength={40}
            onChange={(e) => setNome(e.target.value)}
            className="min-h-11 w-full rounded-full bg-background px-4 text-[15px] text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
          />
          {perfil.tipo === "kids" && (
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Faixa de idade">
              {(["2-4", "5-9"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  role="radio"
                  aria-checked={faixa === f}
                  onClick={() => setFaixa(f)}
                  className={cn("min-h-11 rounded-full text-sm font-semibold", faixa === f ? "bg-primary text-white" : "bg-secondary text-primary")}
                >
                  Kids {f.replace("-", " a ")} anos
                </button>
              ))}
            </div>
          )}
          <Acoes
            salvando={salvando}
            desativado={!nome.trim()}
            rotulo="Salvar"
            onCancelar={() => {
              setNome(perfil.nome)
              setFaixa(perfil.faixa_etaria)
              setModo(null)
            }}
            onConfirmar={() =>
              executar(() =>
                editarPerfil(perfil.id, {
                  ...(nome.trim() !== perfil.nome ? { nome: nome.trim() } : {}),
                  ...(perfil.tipo === "kids" && faixa && faixa !== perfil.faixa_etaria ? { faixa_etaria: faixa } : {}),
                }),
              )
            }
          />
        </div>
      )}

      {modo === "data" && run && (
        <div className="mt-4">
          <EscolhaLua
            temAdulto={perfil.tipo === "adulto"}
            temKids={perfil.tipo === "kids"}
            hoje={s.hoje}
            valor={lua}
            onChange={setLua}
            tom="claro"
          />
          <Acoes
            salvando={salvando}
            desativado={!lua || lua === run.moon_date}
            rotulo="Mudar para esta lua"
            onCancelar={() => setModo(null)}
            onConfirmar={() => executar(() => mudarLua(run.id, lua!))}
          />
        </div>
      )}

      {modo === "remover" && (
        <div className="mt-4 rounded-card bg-[#f6e3dd] p-4">
          <p className="text-[14.5px] text-[#7a2e1f]">
            Remover {perfil.nome}? O cronograma e as doses marcadas desta pessoa saem do app.
          </p>
          <Acoes salvando={salvando} rotulo="Remover" perigo onCancelar={() => setModo(null)} onConfirmar={() => executar(() => removerPerfil(perfil.id))} />
        </div>
      )}

      {erro && (
        <p role="alert" className="mt-3 rounded-2xl bg-[#f6e3dd] px-4 py-3 text-sm text-destructive">
          {erro}
        </p>
      )}
    </section>
  )
}

function Acoes({
  salvando,
  desativado = false,
  rotulo,
  perigo = false,
  onCancelar,
  onConfirmar,
}: {
  salvando: boolean
  desativado?: boolean
  rotulo: string
  perigo?: boolean
  onCancelar: () => void
  onConfirmar: () => void
}) {
  return (
    <div className="mt-4 flex gap-2">
      <Button variant="ghost" className="flex-1" onClick={onCancelar} disabled={salvando}>
        Cancelar
      </Button>
      <Button variant="dark" className={cn("flex-1", perigo && "bg-destructive hover:bg-destructive/90")} onClick={onConfirmar} disabled={desativado || salvando}>
        {salvando && <Loader2 className="animate-spin" aria-hidden />}
        {rotulo}
      </Button>
    </div>
  )
}

function NovaPessoa({ onFechar }: { onFechar: () => void }) {
  const { state, salvarPerfis } = useApp()
  const s = state!
  const [linha, setLinha] = React.useState<Linha>(() => novaLinha("adulto"))
  const [tentou, setTentou] = React.useState(false)
  const [lua, setLua] = React.useState<string | null>(null)
  const [aceite, setAceite] = React.useState(false)
  const [salvando, setSalvando] = React.useState(false)
  const [erro, setErro] = React.useState<string | null>(null)
  const adulto = linha.opcao === "adulto"

  async function salvar() {
    if (!linha.nome.trim()) return setTentou(true)
    if (!lua || !aceite) return
    setSalvando(true)
    setErro(null)
    try {
      await salvarPerfis([paraPerfil(linha)], lua)
      onFechar()
    } catch {
      setErro(ERRO_PADRAO)
      setSalvando(false)
    }
  }

  return (
    <section className="mt-3 space-y-4 rounded-panel border border-border bg-card p-5 animate-subir" aria-labelledby="t-nova">
      <h2 id="t-nova" className="text-[1.4rem] text-primary">
        Nova pessoa
      </h2>
      <EditorPessoa
        linha={linha}
        indice={0}
        podeRemover={false}
        mostrarErro={tentou}
        tom="claro"
        onChange={(patch) => setLinha((l) => ({ ...l, ...patch }))}
        onRemover={() => undefined}
      />
      <EscolhaLua temAdulto={adulto} temKids={!adulto} hoje={s.hoje} valor={lua} onChange={setLua} tom="claro" />
      <Cuidados temAdulto={adulto} temKids={!adulto} tom="claro" />
      <label className="flex cursor-pointer items-start gap-3 rounded-card bg-selected p-4 text-[14.5px] text-primary">
        <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} className="mt-0.5 size-6 shrink-0 accent-[#153c2c]" />
        Li os cuidados. Esta pessoa não tem contraindicação, ou já falamos com o médico ou pediatra.
      </label>
      {erro && (
        <p role="alert" className="rounded-2xl bg-[#f6e3dd] px-4 py-3 text-sm text-destructive">
          {erro}
        </p>
      )}
      <Acoes salvando={salvando} desativado={!lua || !aceite} rotulo="Adicionar" onCancelar={onFechar} onConfirmar={salvar} />
    </section>
  )
}
