// Guia de Alimentos Antiparasitários (texto final para diagramação, VermeFree).
// Mantido fiel ao texto original, que já passou pelo checklist ANVISA do guia.
// Ajustes para o app perpétuo: sem selo de lançamento, sem "presente do pedido" e
// sem referência a número de página. A mesma fonte gera a tela do app e o PDF.

/** Ícones de alimento e de rotina (mapeados para lucide-react no app; no PDF viram um marcador). */
export type Icone =
  | "alho"
  | "cebola"
  | "folha"
  | "cravo"
  | "semente"
  | "gengibre"
  | "curcuma"
  | "fruta"
  | "abacaxi"
  | "coco"
  | "fibra"
  | "fermentado"
  | "legume"
  | "agua"
  | "maos"
  | "crianca"
  | "pet"
  | "cama"
  | "carne"
  | "acucar"
  | "farinha"
  | "pacote"
  | "fritura"
  | "alcool"

export type Bloco =
  | { tipo: "p"; texto: string }
  | { tipo: "subtitulo"; texto: string }
  /** Itens no formato "Rótulo: texto" ganham o rótulo em negrito. */
  | { tipo: "lista"; itens: string[]; icones?: Icone[] }
  | { tipo: "destaque"; texto: string }
  | { tipo: "dica"; titulo: string; texto: string }
  | { tipo: "alimentos"; itens: { nome: string; icone: Icone; texto: string }[] }
  | { tipo: "grupos"; itens: { nome: string; icone: Icone; exemplos: string; porque: string }[] }
  | { tipo: "fases"; fases: { rotulo: string; titulo: string; quando: string; intro: string; itens: string[] }[] }
  | { tipo: "momentos"; itens: { rotulo: string; texto: string }[] }
  | { tipo: "cardapio"; refeicoes: { nome: string; adulto: string; crianca: string }[] }
  | { tipo: "compras"; grupos: { nome: string; itens: string[] }[] }

export type Secao = { id: string; titulo: string; subtitulo: string; blocos: Bloco[] }

export const GUIA_TITULO = "Guia de Alimentos Antiparasitários"
export const GUIA_SUBTITULO = "O que colocar no prato antes, durante e depois do seu protocolo VermeFree"
export const GUIA_RODAPE = "Material educativo. Não substitui orientação profissional."
export const GUIA_PDF = "/guia-de-alimentos-vermefree.pdf"

export const GUIA: Secao[] = [
  {
    id: "comeco",
    titulo: "Antes de começar",
    subtitulo: "Para que serve este guia",
    blocos: [
      { tipo: "p", texto: "O protocolo VermeFree faz a parte dele em 30 dias. A sua rotina, principalmente o que vai para o prato, ajuda a manter o intestino em ordem durante o protocolo e depois que ele termina." },
      { tipo: "p", texto: "Este guia reúne o que a gente mais responde no atendimento: o que comer, o que vale reduzir, como cuidar da higiene dos alimentos e como seguir depois do último dia." },
      { tipo: "p", texto: "Não é dieta e não é regra rígida. É um apoio para a constância, que é o que mais faz diferença." },
      { tipo: "destaque", texto: "Importante: este material é educativo. Ele não substitui a orientação do seu médico, nutricionista ou pediatra, principalmente se você tem alguma condição de saúde, faz uso de medicação contínua ou tem restrição alimentar." },
    ],
  },
  {
    id: "intestino",
    titulo: "Por que a alimentação importa",
    subtitulo: "O intestino é onde tudo acontece",
    blocos: [
      { tipo: "p", texto: "É no intestino que o corpo absorve o que você come. Quando ele está sobrecarregado, aparecem sinais que muita gente acha que são normais: inchaço depois das refeições, gases, intestino irregular, cansaço sem motivo." },
      { tipo: "p", texto: "A alimentação influencia esse ambiente todos os dias. Fibras, água e alimentos frescos ajudam o intestino a funcionar no ritmo certo. Excesso de açúcar e de ultraprocessados faz o caminho contrário." },
      { tipo: "p", texto: "Por isso a gente olha para a alimentação em três momentos:" },
      {
        tipo: "momentos",
        itens: [
          { rotulo: "Antes", texto: "Preparar o corpo, com atenção especial ao fígado." },
          { rotulo: "Durante", texto: "Dar ao intestino o que ele precisa enquanto o protocolo age." },
          { rotulo: "Depois", texto: "Manter a rotina, para o cuidado não acabar no último dia." },
        ],
      },
    ],
  },
  {
    id: "higiene",
    titulo: "A primeira proteção está na cozinha",
    subtitulo: "Higiene dos alimentos e da casa",
    blocos: [
      { tipo: "p", texto: "Boa parte da contaminação por parasitas intestinais vem de alimento mal higienizado, água sem tratamento e mãos sujas. Esses cuidados valem para a casa toda, o ano inteiro:" },
      {
        tipo: "lista",
        icones: ["folha", "agua", "carne", "maos", "crianca", "pet", "cama"],
        itens: [
          "Folhas, frutas e legumes crus: lave em água corrente, folha por folha. Depois deixe de molho por 15 minutos em 1 litro de água com 1 colher de sopa de água sanitária própria para alimentos (veja no rótulo). Enxágue bem em água filtrada.",
          "Água: para beber e para cozinhar, use água filtrada ou fervida.",
          "Carnes e peixes: prefira bem cozidos ou bem passados. Evite carne crua ou malpassada e peixe cru de procedência desconhecida.",
          "Mãos: lave com água e sabão antes de cozinhar, antes de comer e depois de ir ao banheiro.",
          "Crianças: unhas curtas e limpas, mãos lavadas depois de brincar na terra, na areia ou com animais.",
          "Animais de estimação: mantenha a vermifugação deles em dia com o veterinário.",
          "Roupas de cama e toalhas: durante o protocolo, troque com mais frequência e lave em água quente quando der.",
        ],
      },
    ],
  },
  {
    id: "incluir",
    titulo: "Alimentos para incluir",
    subtitulo: "Temperos e alimentos que a tradição popular usa há gerações",
    blocos: [
      { tipo: "p", texto: "Muitos dos ingredientes abaixo são usados há séculos na cozinha e na tradição popular de cuidado com o intestino. Eles não substituem o protocolo: entram como parte de uma alimentação variada." },
      {
        tipo: "alimentos",
        itens: [
          { nome: "Alho", icone: "alho", texto: "Cru ou levemente refogado, no tempero do arroz, do feijão, das saladas e dos legumes. Amassar e esperar alguns minutos antes de usar preserva melhor os compostos naturais do alho." },
          { nome: "Cebola", icone: "cebola", texto: "Crua na salada ou refogada como base de tempero." },
          { nome: "Orégano", icone: "folha", texto: "No tempero de saladas, molhos, ovos e legumes. É da mesma planta que dá origem ao óleo de orégano do protocolo adulto, mas como tempero a concentração é muito menor." },
          { nome: "Cravo-da-índia", icone: "cravo", texto: "Em chás, frutas assadas, doces caseiros sem açúcar e no feijão." },
          { nome: "Sementes de abóbora", icone: "semente", texto: "Torradas sem sal, como lanche, ou trituradas na salada e no iogurte. Uma das mais citadas na tradição popular." },
          { nome: "Gengibre", icone: "gengibre", texto: "Ralado no suco, no chá ou no refogado. Apoia a digestão." },
          { nome: "Cúrcuma (açafrão-da-terra)", icone: "curcuma", texto: "No arroz, nos ovos, nas sopas. Combina com uma pitada de pimenta-do-reino." },
          { nome: "Mamão", icone: "fruta", texto: "Fruta ótima para o intestino. Pode entrar no café da manhã ou no lanche." },
          { nome: "Abacaxi", icone: "abacaxi", texto: "Depois das refeições, ajuda na sensação de digestão mais leve." },
          { nome: "Coco", icone: "coco", texto: "Água de coco para hidratar, coco ralado no lanche." },
        ],
      },
      { tipo: "subtitulo", texto: "Fibras, fermentados e folhas: o que o intestino agradece" },
      {
        tipo: "grupos",
        itens: [
          { nome: "Fibras", icone: "fibra", exemplos: "Aveia, linhaça, chia, feijão, lentilha, grão-de-bico, frutas com casca, legumes", porque: "Ajudam o intestino a funcionar no ritmo certo." },
          { nome: "Fermentados naturais", icone: "fermentado", exemplos: "Iogurte natural sem açúcar, kefir, coalhada", porque: "Fontes de bactérias boas para a flora intestinal." },
          { nome: "Folhas verdes e amargas", icone: "folha", exemplos: "Rúcula, agrião, couve, almeirão", porque: "Fonte de fibras e de nutrientes. As amargas apoiam a digestão." },
          { nome: "Legumes coloridos", icone: "legume", exemplos: "Cenoura, beterraba, abóbora, brócolis", porque: "Variedade de vitaminas e minerais no prato." },
          { nome: "Água", icone: "agua", exemplos: "Cerca de 2 litros por dia para adultos, mais se fizer calor ou atividade física", porque: "Sem água, as fibras não fazem o seu trabalho." },
        ],
      },
      { tipo: "dica", titulo: "Dica", texto: "Não precisa mudar tudo de uma vez. Escolha dois ou três itens desta lista e coloque na rotina desta semana." },
    ],
  },
  {
    id: "reduzir",
    titulo: "O que vale reduzir",
    subtitulo: "Sem proibição, com bom senso",
    blocos: [
      { tipo: "p", texto: "Nenhum alimento é proibido. Mas alguns pesam mais para o intestino e para o fígado, e vale reduzir, principalmente durante os 30 dias do protocolo:" },
      {
        tipo: "lista",
        icones: ["acucar", "farinha", "pacote", "fritura", "alcool", "carne"],
        itens: [
          "Açúcar e doces: refrigerante, suco de caixinha, bolacha recheada, doces em geral.",
          "Farinha branca em excesso: pão branco, massas e salgados todos os dias.",
          "Ultraprocessados: embutidos, salgadinhos de pacote, comida pronta congelada.",
          "Frituras: pesam na digestão e dão mais trabalho para o fígado.",
          "Bebida alcoólica: durante o protocolo, o ideal é evitar. O fígado já está sendo cuidado, e o álcool vai na direção contrária.",
          "Carne crua ou malpassada e peixe cru sem procedência: pela higiene, como vimos em “A primeira proteção está na cozinha”.",
        ],
      },
      { tipo: "dica", titulo: "Troca simples", texto: "No lugar do doce depois do almoço, uma fatia de abacaxi ou de mamão. No lugar do refrigerante, água com limão, hortelã ou gengibre." },
    ],
  },
  {
    id: "fases",
    titulo: "Fase a fase no protocolo adulto",
    subtitulo: "Como a alimentação acompanha os 30 dias",
    blocos: [
      { tipo: "p", texto: "O protocolo adulto tem duas fases de 15 dias e começa sempre na lua nova. O seu cronograma completo, com as datas de cada fase, está no app." },
      {
        tipo: "fases",
        fases: [
          {
            rotulo: "Fase 1",
            titulo: "Preparação hepática",
            quando: "15 dias antes da lua nova",
            intro: "É quando você toma a Silimarina, que cuida do fígado antes da fase seguinte. Na alimentação, a ideia é deixar o fígado mais leve:",
            itens: ["Mais água, legumes, folhas e frutas.", "Menos frituras, menos açúcar e nada de bebida alcoólica.", "Comece a colocar alho, cebola e orégano nos temperos."],
          },
          {
            rotulo: "Fase 2",
            titulo: "Desparasitação",
            quando: "15 dias, a partir da lua nova",
            intro: "Entram a Tintura, o Óleo de Orégano e a Ornitina. Na alimentação:",
            itens: [
              "Mantenha a hidratação: cerca de 2 litros de água por dia.",
              "Capriche nas fibras (aveia, linhaça, feijão, frutas com casca) para o intestino funcionar no ritmo.",
              "Inclua sementes de abóbora, cravo e gengibre na rotina.",
              "Prefira refeições leves e em horários regulares. A Tintura e o Óleo de Orégano são tomados antes do café, do almoço e do jantar, então manter os horários ajuda a não esquecer.",
            ],
          },
        ],
      },
      { tipo: "destaque", texto: "Se aparecer algum desconforto: sintomas leves como enjoo ou intestino mais solto podem acontecer e costumam passar rápido. Prefira comidas leves, beba bastante água e, se persistir ou incomodar, fale com a gente ou com o seu médico." },
    ],
  },
  {
    id: "depois",
    titulo: "E depois do protocolo?",
    subtitulo: "O cuidado não termina no último dia",
    blocos: [
      { tipo: "p", texto: "Essa é a pergunta que mais chega no atendimento. A resposta é constância:" },
      {
        tipo: "lista",
        itens: [
          "Mantenha a higiene dos alimentos: ela é a principal proteção do dia a dia.",
          "Continue com as fibras, a água e os fermentados: o intestino que você cuidou durante 30 dias continua precisando disso.",
          "Óleo de Alho: pensado para a manutenção mensal, com uma cápsula por dia ao longo do mês. Siga a orientação do rótulo.",
          "Repita o protocolo com intervalo: o protocolo pode ser feito de 1 a 4 vezes por ano, sempre na lua nova e com intervalo mínimo de 3 meses entre um ciclo e outro.",
          "A família junto: quando mais de uma pessoa da casa faz o protocolo na mesma lua nova, o cuidado com a casa fica mais simples.",
        ],
      },
    ],
  },
  {
    id: "criancas",
    titulo: "Para as crianças",
    subtitulo: "Comida de criança, do jeito que criança come",
    blocos: [
      { tipo: "p", texto: "O VermeFree Kids começa direto na lua nova e dura 30 dias, com as duas tinturas 3 vezes ao dia. As tinturas podem ser diluídas em água ou suco, o que ajuda muito na aceitação." },
      { tipo: "subtitulo", texto: "No prato da criança" },
      {
        tipo: "lista",
        icones: ["fruta", "semente", "fermentado", "legume", "agua"],
        itens: [
          "Frutas picadinhas no lanche: mamão, banana, maçã com casca, abacaxi.",
          "Sementes de abóbora torradas sem sal, trituradas na fruta ou no iogurte (para crianças pequenas, sempre trituradas).",
          "Iogurte natural com fruta no lugar do iogurte açucarado.",
          "Feijão, legumes e arroz com tempero caseiro: alho, cebola e orégano.",
          "Água à vontade ao longo do dia.",
        ],
      },
      { tipo: "subtitulo", texto: "O que vale reduzir" },
      { tipo: "lista", icones: ["acucar", "pacote"], itens: ["Doces, balas, biscoito recheado e suco de caixinha.", "Salgadinho de pacote e embutidos."] },
      { tipo: "subtitulo", texto: "Na rotina" },
      {
        tipo: "lista",
        icones: ["maos", "crianca", "crianca"],
        itens: ["Lavar as mãos antes de comer e depois de brincar.", "Unhas curtas e limpas.", "Não andar descalço em terra ou areia sem necessidade."],
      },
      { tipo: "destaque", texto: "Em caso de dúvida sobre a alimentação do seu filho, converse com o pediatra." },
    ],
  },
  {
    id: "cardapio",
    titulo: "Um dia de exemplo",
    subtitulo: "Cardápio de inspiração para os dias do protocolo",
    blocos: [
      {
        tipo: "cardapio",
        refeicoes: [
          { nome: "Café da manhã", adulto: "Mamão com aveia e linhaça, ovo mexido com cúrcuma, café ou chá sem açúcar", crianca: "Iogurte natural com banana e semente de abóbora triturada" },
          { nome: "Lanche da manhã", adulto: "Um punhado de sementes de abóbora e uma fruta", crianca: "Maçã picadinha" },
          { nome: "Almoço", adulto: "Salada de folhas com cebola e orégano, arroz, feijão com alho, frango bem cozido, legumes. Abacaxi de sobremesa", crianca: "Arroz, feijão, frango desfiado e cenoura cozida" },
          { nome: "Lanche da tarde", adulto: "Água de coco e kefir ou iogurte natural", crianca: "Fruta com coco ralado" },
          { nome: "Jantar", adulto: "Sopa de abóbora com gengibre ou omelete com legumes", crianca: "Sopa de legumes ou omelete" },
          { nome: "Ao longo do dia", adulto: "Cerca de 2 litros de água. Chá de cravo ou gengibre, se gostar", crianca: "Água à vontade" },
        ],
      },
      { tipo: "p", texto: "Adapte às suas preferências, às suas restrições e à rotina da sua casa." },
    ],
  },
  {
    id: "compras",
    titulo: "Lista de compras",
    subtitulo: "Marque o que já está na sua cozinha",
    blocos: [
      {
        tipo: "compras",
        grupos: [
          { nome: "Temperos", itens: ["Alho", "Cebola", "Orégano", "Cravo-da-índia", "Gengibre", "Cúrcuma"] },
          { nome: "Sementes e grãos", itens: ["Sementes de abóbora", "Aveia", "Linhaça", "Chia", "Feijão", "Lentilha"] },
          { nome: "Frutas", itens: ["Mamão", "Abacaxi", "Banana", "Maçã", "Limão", "Coco"] },
          { nome: "Folhas e legumes", itens: ["Rúcula", "Agrião", "Couve", "Cenoura", "Abóbora", "Brócolis"] },
          { nome: "Fermentados", itens: ["Iogurte natural sem açúcar", "Kefir"] },
          { nome: "Para a higienização", itens: ["Água sanitária própria para alimentos"] },
        ],
      },
    ],
  },
  {
    id: "avisos",
    titulo: "Avisos importantes",
    subtitulo: "Leia antes de começar",
    blocos: [
      {
        tipo: "lista",
        itens: [
          "Este guia é um material educativo e não substitui orientação médica, nutricional ou pediátrica.",
          "O protocolo VermeFree é contraindicado para gestantes, lactantes e pessoas com sensibilidade ao álcool.",
          "Se você usa medicação contínua, converse com o seu médico antes de começar o protocolo.",
          "Em caso de alergia ou intolerância a algum alimento citado, não use esse alimento.",
        ],
      },
    ],
  },
]

/** Seção do guia mais útil para cada momento do protocolo (usada pelo Hoje). */
export function secaoDaFase(tipo: "adulto" | "kids", fase: string): { id: string; rotulo: string } {
  if (fase === "manutencao") return { id: "depois", rotulo: "E depois do protocolo?" }
  if (tipo === "kids") return { id: "criancas", rotulo: "Alimentação das crianças" }
  return { id: "fases", rotulo: "O que comer em cada fase" }
}

/** Separa "Rótulo: texto" para destacar o rótulo. */
export function separarRotulo(item: string): [string | null, string] {
  const i = item.indexOf(": ")
  if (i > 0 && i < 60) return [item.slice(0, i), item.slice(i + 2)]
  return [null, item]
}
