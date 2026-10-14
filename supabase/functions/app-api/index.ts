// app-api — backend do app VermeFree (clientes).
// Reaproveita as tabelas app_customers, app_profiles, app_protocol_runs,
// app_daily_checks e app_quiz_responses. Todas têm RLS sem políticas: só esta
// função (service role) lê e escreve. A cliente se identifica pelo access_token
// devolvido no login por e-mail.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type Supabase = ReturnType<typeof createClient>;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ITEM_KEY_RE = /^[a-z0-9_]{1,40}$/;
const FAIXAS = new Set(["2-4", "5-9"]);
const TRANSFORMACOES = new Set(["muita", "moderada", "leve", "nenhuma"]);

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayBrasil(): string {
  // Brasília: UTC-3, sem horário de verão desde 2019.
  return new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10);
}

// Datas do ciclo. Adulto: preparo com silimarina nos 15 dias antes da lua nova
// e protocolo nos 15 dias a partir dela. Kids: 30 dias a partir da lua nova.
function runDates(tipo: string, moonDate: string) {
  if (tipo === "adulto") {
    return {
      moon_date: moonDate,
      silimarina_start_date: addDays(moonDate, -15),
      start_date: moonDate,
      end_date: addDays(moonDate, 14),
    };
  }
  return {
    moon_date: moonDate,
    silimarina_start_date: null,
    start_date: moonDate,
    end_date: addDays(moonDate, 29),
  };
}

// --- Produtos comprados ---------------------------------------------------
type Produtos = { adulto: number; kids_2_4: number; kids_5_9: number; familia: number; oleo_alho: number };

function emptyProdutos(): Produtos {
  return { adulto: 0, kids_2_4: 0, kids_5_9: 0, familia: 0, oleo_alho: 0 };
}

// Lê nomes da Shopify ("... | VermeFree Adulto (x2)") e da Guru ("1 Kit VermeFree Adulto").
function somarProdutos(acc: Produtos, produtoStr: string) {
  for (const raw of (produtoStr || "").split(/,\s+/)) {
    const item = raw.trim();
    if (!item) continue;
    const qtyX = item.match(/\(x(\d+)\)/i);
    const qtyLead = item.match(/^(\d+)\s/);
    const qty = qtyX ? parseInt(qtyX[1], 10) : qtyLead ? parseInt(qtyLead[1], 10) : 1;
    if (/fam[ií]lia/i.test(item)) acc.familia += qty;
    else if (/kids|infantil|crian/i.test(item) && /2\s*a\s*4/i.test(item)) acc.kids_2_4 += qty;
    else if (/kids|infantil|crian/i.test(item) && /5\s*a\s*9/i.test(item)) acc.kids_5_9 += qty;
    else if (/[oó]leo de alho/i.test(item)) acc.oleo_alho += qty;
    else if (/adulto/i.test(item)) acc.adulto += qty;
  }
  return acc;
}

function escapeLike(s: string) {
  return s.replace(/[\\%_]/g, (c) => "\\" + c);
}

async function findPurchases(supabase: Supabase, email: string) {
  // ilike só para ignorar maiúsculas; a comparação final é exata.
  const { data, error } = await supabase
    .from("compra_aprovada")
    .select("id_compra, email, nome, produto, data")
    .ilike("email", escapeLike(email))
    .order("data", { ascending: false })
    .limit(50);
  if (error) throw error;
  const compras = (data || []).filter((c) => String(c.email || "").trim().toLowerCase() === email);
  if (compras.length) return { compras, fonte: "compra_aprovada" as const };

  // Plano B: pedido pago na Shopify que ainda não caiu em compra_aprovada.
  const { data: pedidos, error: pedErr } = await supabase
    .from("shopify_orders")
    .select("shopify_order_id, customer_email, financial_status")
    .ilike("customer_email", escapeLike(email))
    .limit(20);
  if (pedErr) throw pedErr;
  const pagos = (pedidos || []).filter(
    (p) =>
      String(p.customer_email || "").trim().toLowerCase() === email &&
      ["paid", "partially_refunded"].includes(String(p.financial_status || "").toLowerCase()),
  );
  return { compras: [], pedidosShopify: pagos, fonte: pagos.length ? ("shopify_orders" as const) : null };
}

async function getCustomerByToken(supabase: Supabase, accessToken: unknown) {
  const token = String(accessToken || "");
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  const { data, error } = await supabase.from("app_customers").select("*").eq("access_token", token).maybeSingle();
  if (error) throw error;
  return data;
}

async function loadState(supabase: Supabase, customer: Record<string, unknown>) {
  const { data: profiles, error: profErr } = await supabase
    .from("app_profiles")
    .select("id, tipo, nome, faixa_etaria, created_at")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: true });
  if (profErr) throw profErr;

  const profileIds = (profiles || []).map((p) => p.id);
  const { data: runs, error: runsErr } = profileIds.length
    ? await supabase
        .from("app_protocol_runs")
        .select("id, profile_id, moon_date, silimarina_start_date, start_date, end_date, status, created_at, completed_at")
        .in("profile_id", profileIds)
        .order("moon_date", { ascending: false })
    : { data: [], error: null };
  if (runsErr) throw runsErr;

  const runIds = (runs || []).map((r) => r.id);
  const { data: checks, error: checksErr } = runIds.length
    ? await supabase.from("app_daily_checks").select("run_id, check_date, item_key, done").in("run_id", runIds).eq("done", true)
    : { data: [], error: null };
  if (checksErr) throw checksErr;

  const { data: quiz, error: quizErr } = runIds.length
    ? await supabase.from("app_quiz_responses").select("run_id, transformacao, recomendacao, cupom_oferecido").in("run_id", runIds)
    : { data: [], error: null };
  if (quizErr) throw quizErr;

  return {
    customer: { nome: customer.nome, email: customer.email, produtos: customer.produtos },
    profiles: profiles || [],
    runs: runs || [],
    checks: checks || [],
    quiz: quiz || [],
    hoje: todayBrasil(),
  };
}

async function assertRunOwner(supabase: Supabase, runId: string, customerId: string) {
  const { data, error } = await supabase
    .from("app_protocol_runs")
    .select("id, profile_id, app_profiles!inner(customer_id)")
    .eq("id", runId)
    .maybeSingle();
  if (error) throw error;
  const owner = (data as unknown as { app_profiles?: { customer_id: string } } | null)?.app_profiles?.customer_id;
  return Boolean(data && owner === customerId);
}

async function assertProfileOwner(supabase: Supabase, profileId: string, customerId: string) {
  const { data, error } = await supabase
    .from("app_profiles")
    .select("id, tipo, customer_id")
    .eq("id", profileId)
    .maybeSingle();
  if (error) throw error;
  return data && data.customer_id === customerId ? data : null;
}

function validMoonDate(v: unknown): string | null {
  const s = String(v || "");
  if (!DATE_RE.test(s)) return null;
  const hoje = todayBrasil();
  // Aceita luas de até 60 dias atrás (quem já começou) e até 1 ano à frente.
  if (s < addDays(hoje, -60) || s > addDays(hoje, 366)) return null;
  return s;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const action = String(body.action || "");

  try {
    if (action === "login") {
      const email = String(body.email || "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
        return json({ error: "invalid_email" }, 400);
      }

      const found = await findPurchases(supabase, email);
      let produtos = emptyProdutos();
      for (const c of found.compras) somarProdutos(produtos, String(c.produto || ""));
      const ultima = found.compras[0];
      let nomeEquipe: string | null = null;

      if (!found.fonte) {
        // Equipe e testes: entram sem compra, com os produtos cadastrados na tabela.
        const { data: equipe, error: eqErr } = await supabase
          .from("app_acesso_equipe")
          .select("nome, produtos")
          .eq("email", email)
          .maybeSingle();
        if (eqErr) throw eqErr;
        if (!equipe) return json({ error: "not_found" }, 404);
        produtos = { ...emptyProdutos(), ...(equipe.produtos as Produtos) };
        nomeEquipe = equipe.nome;
      }

      const { data: existing } = await supabase.from("app_customers").select("*").eq("email", email).maybeSingle();
      const payload = {
        email,
        nome: (ultima?.nome as string) || nomeEquipe || existing?.nome || null,
        id_compra: ultima?.id_compra ?? existing?.id_compra ?? null,
        produtos,
      };
      const { data: customer, error: upsertErr } = await supabase
        .from("app_customers")
        .upsert(payload, { onConflict: "email" })
        .select("*")
        .single();
      if (upsertErr) throw upsertErr;

      return json({ access_token: customer.access_token, state: await loadState(supabase, customer) });
    }

    const customer = await getCustomerByToken(supabase, body.access_token);
    if (!customer) return json({ error: "invalid_token" }, 401);

    if (action === "get-state") {
      return json({ state: await loadState(supabase, customer) });
    }

    if (action === "save-profiles") {
      const moonDate = validMoonDate(body.moon_date);
      if (!moonDate) return json({ error: "invalid_moon_date" }, 400);
      const perfis = Array.isArray(body.profiles) ? body.profiles : [];
      if (!perfis.length || perfis.length > 10) return json({ error: "invalid_profiles" }, 400);

      const limpos = [];
      for (const p of perfis as Array<Record<string, unknown>>) {
        const tipo = p.tipo === "kids" ? "kids" : p.tipo === "adulto" ? "adulto" : null;
        const nome = String(p.nome || "").trim().slice(0, 40);
        const faixa = tipo === "kids" ? String(p.faixa_etaria || "") : null;
        if (!tipo || !nome || (tipo === "kids" && !FAIXAS.has(faixa!))) return json({ error: "invalid_profiles" }, 400);
        limpos.push({ tipo, nome, faixa_etaria: faixa });
      }

      for (const perfil of limpos) {
        const { data: profile, error: profErr } = await supabase
          .from("app_profiles")
          .insert({ customer_id: customer.id, ...perfil })
          .select("id, tipo")
          .single();
        if (profErr) throw profErr;
        const { error: runErr } = await supabase
          .from("app_protocol_runs")
          .insert({ profile_id: profile.id, status: "agendado", ...runDates(profile.tipo, moonDate) });
        if (runErr) throw runErr;
      }
      return json({ state: await loadState(supabase, customer) });
    }

    if (action === "new-run") {
      const moonDate = validMoonDate(body.moon_date);
      if (!moonDate) return json({ error: "invalid_moon_date" }, 400);
      const profile = await assertProfileOwner(supabase, String(body.profile_id || ""), customer.id);
      if (!profile) return json({ error: "forbidden" }, 403);
      const { error: runErr } = await supabase
        .from("app_protocol_runs")
        .insert({ profile_id: profile.id, status: "agendado", ...runDates(profile.tipo, moonDate) });
      if (runErr) throw runErr;
      return json({ state: await loadState(supabase, customer) });
    }

    if (action === "remove-profile") {
      const profile = await assertProfileOwner(supabase, String(body.profile_id || ""), customer.id);
      if (!profile) return json({ error: "forbidden" }, 403);
      const { error } = await supabase.from("app_profiles").delete().eq("id", profile.id);
      if (error) throw error;
      return json({ state: await loadState(supabase, customer) });
    }

    if (action === "toggle-check") {
      const runId = String(body.run_id || "");
      const checkDate = String(body.check_date || "");
      const itemKey = String(body.item_key || "");
      if (!DATE_RE.test(checkDate) || !ITEM_KEY_RE.test(itemKey)) return json({ error: "invalid_check" }, 400);
      if (!(await assertRunOwner(supabase, runId, customer.id))) return json({ error: "forbidden" }, 403);

      const done = Boolean(body.done);
      const { error } = await supabase
        .from("app_daily_checks")
        .upsert(
          { run_id: runId, check_date: checkDate, item_key: itemKey, done, done_at: done ? new Date().toISOString() : null },
          { onConflict: "run_id,check_date,item_key" },
        );
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === "complete-run") {
      const runId = String(body.run_id || "");
      const transformacao = String(body.transformacao || "");
      if (!TRANSFORMACOES.has(transformacao)) return json({ error: "invalid_answer" }, 400);
      if (!(await assertRunOwner(supabase, runId, customer.id))) return json({ error: "forbidden" }, 403);

      const relato = body.relato ? String(body.relato).slice(0, 2000) : null;
      const precisaReforco = transformacao === "leve" || transformacao === "nenhuma";
      const recomendacao = precisaReforco ? "repetir_proximo_ciclo" : "manutencao_normal";
      const cupomOferecido = precisaReforco ? "5OFF" : null;

      const { error: quizErr } = await supabase
        .from("app_quiz_responses")
        .insert({ run_id: runId, transformacao, relato, recomendacao, cupom_oferecido: cupomOferecido });
      if (quizErr) throw quizErr;
      const { error: updErr } = await supabase
        .from("app_protocol_runs")
        .update({ status: "concluido", completed_at: new Date().toISOString() })
        .eq("id", runId);
      if (updErr) throw updErr;
      return json({ state: await loadState(supabase, customer) });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (err) {
    console.error(err);
    return json({ error: "internal_error" }, 500);
  }
});
