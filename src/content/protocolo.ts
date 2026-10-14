// Conteúdo do protocolo exibido no app.
// Fonte: "Documento de Produtos VermeFree" (v1, 29/09/2026, validação técnica: Pedro Lage)
// e páginas de produto da Shopify. Não incluir nada que não esteja nessas fontes.

export type Tipo = "adulto" | "kids"
export type Faixa = "2-4" | "5-9"
export type Fase = "aguardando" | "preparo" | "protocolo" | "manutencao"
export type Momento = "manha" | "almoco" | "noite" | "dia"

export type Item = {
  key: string
  momento: Momento
  titulo: string
  dose: string
  quando: string
}

/**
 * Doses em ml do cartão de posologia que vai dentro do kit.
 * Enquanto estiverem vazias, o app orienta a seguir o cartão do kit.
 * Preencher com o texto exato do cartão, por exemplo "3 ml".
 */
export const DOSES_CARTAO: { tinturaAdulto: string; kids: Record<Faixa, string> } = {
  tinturaAdulto: "",
  kids: { "2-4": "", "5-9": "" },
}

export const MOMENTOS: Record<Momento, string> = {
  manha: "Manhã",
  almoco: "Almoço",
  noite: "Noite",
  dia: "Ao longo do dia",
}

const REFEICOES: { id: "cafe" | "almoco" | "jantar"; momento: Momento; nome: string }[] = [
  { id: "cafe", momento: "manha", nome: "café da manhã" },
  { id: "almoco", momento: "almoco", nome: "almoço" },
  { id: "jantar", momento: "noite", nome: "jantar" },
]

function doseTinturaAdulto() {
  return DOSES_CARTAO.tinturaAdulto
    ? `${DOSES_CARTAO.tinturaAdulto}, diluída em um pouco de água`
    : "Dose do cartão do kit, diluída em um pouco de água"
}

function doseKids(faixa: Faixa) {
  const d = DOSES_CARTAO.kids[faixa]
  return d ? `${d} (faixa de ${faixa.replace("-", " a ")} anos)` : `Dose da faixa de ${faixa.replace("-", " a ")} anos, do cartão do kit`
}

const ADULTO_PREPARO: Item[] = [
  { key: "silimarina_manha", momento: "manha", titulo: "Silimarina 200 mg", dose: "1 cápsula", quando: "Depois do café da manhã" },
  { key: "silimarina_noite", momento: "noite", titulo: "Silimarina 200 mg", dose: "1 cápsula", quando: "Depois do jantar" },
]

function adultoProtocolo(): Item[] {
  const itens: Item[] = []
  for (const r of REFEICOES) {
    itens.push({
      key: `tintura_${r.id}`,
      momento: r.momento,
      titulo: "Tintura Antiparasitária",
      dose: doseTinturaAdulto(),
      quando: `Antes do ${r.nome}`,
    })
    itens.push({
      key: `oregano_${r.id}`,
      momento: r.momento,
      titulo: "Óleo de Orégano",
      dose: "1 cápsula",
      quando: `Antes do ${r.nome}, junto com a tintura`,
    })
  }
  itens.push({
    key: "ornitina_noite",
    momento: "noite",
    titulo: "Ornitina 550 mg",
    dose: "1 cápsula",
    quando: "Meia hora antes de deitar",
  })
  return itens
}

function kidsProtocolo(faixa: Faixa): Item[] {
  const itens: Item[] = []
  for (const r of REFEICOES) {
    itens.push({
      key: `potencializadora_${r.id}`,
      momento: r.momento,
      titulo: "Fórmula Potencializadora",
      dose: doseKids(faixa),
      quando: `Antes do ${r.nome}, diluída em água ou suco`,
    })
    itens.push({
      key: `desparasitacao_${r.id}`,
      momento: r.momento,
      titulo: "Tintura de Desparasitação",
      dose: doseKids(faixa),
      quando: "15 minutos depois da Potencializadora (se a rotina não deixar esperar, pode ser junto)",
    })
  }
  return itens
}

const MANUTENCAO_ADULTO: Item[] = [
  { key: "oleo_alho", momento: "dia", titulo: "Óleo de Alho 500 mg", dose: "1 cápsula", quando: "Uma vez por dia, sem horário fixo" },
]

export function itensDoDia(tipo: Tipo, faixa: Faixa | null, fase: Fase): Item[] {
  if (tipo === "adulto") {
    if (fase === "preparo") return ADULTO_PREPARO
    if (fase === "protocolo") return adultoProtocolo()
    if (fase === "manutencao") return MANUTENCAO_ADULTO
    return []
  }
  if (fase === "protocolo") return kidsProtocolo(faixa ?? "5-9")
  return []
}

export const FASE_INFO: Record<Fase, { nome: string; resumo: Record<Tipo, string> }> = {
  aguardando: {
    nome: "Aguardando a lua",
    resumo: {
      adulto: "O preparo do fígado começa 15 dias antes da lua nova.",
      kids: "O VermeFree Kids começa direto na lua nova.",
    },
  },
  preparo: {
    nome: "Preparo do fígado",
    resumo: {
      adulto: "Fase 1: 15 dias de Silimarina antes da lua nova.",
      kids: "",
    },
  },
  protocolo: {
    nome: "Protocolo",
    resumo: {
      adulto: "Fase 2: Tintura, Óleo de Orégano e Ornitina por 15 dias a partir da lua nova.",
      kids: "As duas tinturas, 3 vezes ao dia, por 30 dias a partir da lua nova.",
    },
  },
  manutencao: {
    nome: "Manutenção",
    resumo: {
      adulto: "Entre um ciclo e outro: Óleo de Alho, 1 cápsula por dia.",
      kids: "Ciclo concluído. Óleo de Alho para crianças só com orientação do pediatra.",
    },
  },
}

export const DICAS: Record<Tipo, Partial<Record<Fase, string[]>>> = {
  adulto: {
    preparo: [
      "Mais água, legumes, folhas e frutas.",
      "Menos frituras e açúcar, e nada de bebida alcoólica.",
      "Comece a colocar alho, cebola e orégano nos temperos.",
    ],
    protocolo: [
      "Cerca de 2 litros de água por dia.",
      "Capriche nas fibras: aveia, linhaça, feijão e frutas com casca.",
      "Refeições leves e em horários regulares ajudam a não esquecer as doses.",
      "Se você usa outro remédio, espace 2 horas entre ele e o protocolo.",
    ],
    manutencao: [
      "Mantenha a higiene dos alimentos: é a principal proteção do dia a dia.",
      "O protocolo pode ser repetido até 4 vezes por ano, com no mínimo 3 meses entre um ciclo e outro.",
    ],
  },
  kids: {
    protocolo: [
      "Dilua em água ou suco, o que a criança aceitar melhor.",
      "Nunca passe da dose da idade.",
      "Mãos lavadas antes de comer e depois de brincar, e unhas curtas.",
    ],
    manutencao: [
      "O protocolo pode ser repetido até 4 vezes por ano, com no mínimo 3 meses entre um ciclo e outro.",
    ],
  },
}

export const REACOES_LEVES =
  "Algumas pessoas podem ter reações leves nos primeiros dias, como enjoo ou intestino mais solto, que costumam passar rápido. Se persistir ou incomodar, fale com a gente ou com o médico/pediatra."

export const CONTRAINDICACOES: Record<Tipo, string[]> = {
  adulto: [
    "Não usar na gestação nem na amamentação.",
    "Não usar com sensibilidade ao álcool: a tintura é à base de álcool.",
    "Indicado a partir de 10 anos.",
    "Quem usa remédio contínuo fala com o médico antes e espaça 2 horas entre o protocolo e outros remédios.",
    "Diabetes: a Silimarina pode baixar a glicemia, fale com o médico antes.",
  ],
  kids: [
    "Não usar em menores de 2 anos.",
    "Não usar com sensibilidade ao álcool: as tinturas são à base de álcool.",
    "Criança que toma remédio ou tem alguma condição de saúde: fale com o pediatra antes.",
    "Nunca passar da dose da idade.",
  ],
}

export const CUIDADOS_GERAIS = [
  "Alergia a margarida, crisântemo ou ambrósia, ou a hortelã, manjericão ou lavanda: fale com o médico antes.",
  "Doença pré-existente (fígado, rim, diabetes), idosos ou alergia a plantas: converse com o médico antes de começar.",
]

export const TOTAL_DIAS: Record<Tipo, Partial<Record<Fase, number>>> = {
  adulto: { preparo: 15, protocolo: 15 },
  kids: { protocolo: 30 },
}

export const PRODUTOS_IMG = {
  adulto: "https://cdn.shopify.com/s/files/1/0827/3267/9387/files/produto-card-1-adulto_901f4e4f-5bf9-4919-aa54-382006a76276.png?v=1779135064",
  kids24: "https://cdn.shopify.com/s/files/1/0827/3267/9387/files/produto-card-2-kids-2a4.png?v=1778684781",
  kids59: "https://cdn.shopify.com/s/files/1/0827/3267/9387/files/produto-card-3-kids-5a9.png?v=1778685564",
  familia: "https://cdn.shopify.com/s/files/1/0827/3267/9387/files/produto-card-4-kit-familia-crop.png?v=1778699873",
  oleoAlho: "https://cdn.shopify.com/s/files/1/0827/3267/9387/files/01-PRINCIPAL-oleo-alho.png?v=1783873147",
}

export const LINKS = {
  site: "https://vermefree.com.br/?utm_source=app&utm_medium=app&utm_campaign=app_vermefree",
  oleoAlho: "https://vermefree.com.br/products/oleo-de-alho-desodorizado-500mg?utm_source=app&utm_medium=app&utm_campaign=app_vermefree",
  atendimento: "https://l.vermefree.com.br/atendimento",
}
