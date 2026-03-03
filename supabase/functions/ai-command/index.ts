import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PERMISSIONS: Record<string, string[]> = {
  dono: ["*"],
  financeiro: ["registrar_pagamento", "gerar_relatorio", "consultar", "buscar_empresas"],
  vendas: ["criar_lead", "criar_projeto", "consultar", "buscar_empresas"],
  operacao: ["atualizar_status", "enviar_mensagem", "consultar", "buscar_empresas"],
};

function checkPermission(roles: string[], action: string): boolean {
  return roles.some((r) => {
    const allowed = PERMISSIONS[r];
    return allowed && (allowed.includes("*") || allowed.includes(action) || allowed.includes("consultar"));
  });
}

function ok(body: unknown) {
  return new Response(JSON.stringify(body), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function err(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Auth
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return err("Não autorizado", 401);
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return err("Não autorizado", 401);

    // Input
    const { message } = await req.json();
    if (!message || typeof message !== "string" || message.length > 2000) return err("Mensagem inválida", 400);

    // Roles
    const { data: rolesData } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const userRoles = rolesData?.map((r: any) => r.role) ?? [];

    // AI analysis
    const aiResult = await callAI(LOVABLE_API_KEY, message, userRoles);

    // Permission check
    if (!checkPermission(userRoles.length ? userRoles : ["consultar"], aiResult.actionType)) {
      return ok({ reply: `⚠️ Sem permissão para "${aiResult.actionType}". Roles: ${userRoles.join(", ") || "nenhuma"}.` });
    }

    // Create task
    const { data: task, error: taskErr } = await supabase
      .from("ai_tasks")
      .insert({
        user_id: user.id,
        command: message,
        plan: aiResult.plan,
        status: aiResult.requiresConfirmation ? "aguardando_confirmacao" : "pendente",
        requires_confirmation: aiResult.requiresConfirmation,
        action_type: aiResult.actionType,
        action_payload: aiResult.payload,
      })
      .select("id")
      .single();
    if (taskErr) throw taskErr;

    // Execute search if needed
    let places: any[] = [];
    let searchQuery = "";
    let searchCity = "";

    if (aiResult.actionType === "buscar_empresas") {
      const result = await executeSearch(aiResult.payload, task.id, supabase);
      places = result.places;
      searchQuery = aiResult.payload.query || "";
      searchCity = aiResult.payload.near || "";

      if (places.length > 0) {
        const text = formatPlaces(places, searchQuery, searchCity);
        aiResult.reply = text;
        await supabase.from("ai_tasks").update({ status: "concluida", result: { places, searchQuery, searchCity } }).eq("id", task.id);
      } else if (result.error) {
        aiResult.reply = `⚠️ ${result.error}`;
        await supabase.from("ai_tasks").update({ status: "falhou", error_message: result.error }).eq("id", task.id);
      }
    } else if (!aiResult.requiresConfirmation) {
      await supabase.from("ai_tasks").update({ status: "concluida" }).eq("id", task.id);
    }

    // Save messages
    await supabase.from("chat_messages").insert([
      { user_id: user.id, task_id: task.id, role: "user", content: message },
      { user_id: user.id, task_id: task.id, role: "assistant", content: aiResult.reply },
    ]);

    return ok({
      reply: aiResult.reply,
      plan: aiResult.plan,
      taskId: task.id,
      requiresConfirmation: aiResult.requiresConfirmation,
      actionType: aiResult.actionType,
      places: places.length > 0 ? places : undefined,
      searchQuery: searchQuery || undefined,
      searchCity: searchCity || undefined,
    });
  } catch (error: any) {
    console.error("ai-command error:", error);
    return err(error.message || "Erro interno");
  }
});

// ─── AI Call ──────────────────────────────────────────────

interface AIResult {
  reply: string;
  actionType: string;
  requiresConfirmation: boolean;
  plan: string;
  payload: Record<string, any>;
}

async function callAI(apiKey: string, message: string, roles: string[]): Promise<AIResult> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content: `Você é um agente de prospecção B2B. Ferramentas disponíveis: buscar_empresas (Foursquare API integrada), process_command.
Regras: nunca invente dados. Quando pedirem buscar empresas/locais, use buscar_empresas. Nunca peça API keys.
Roles do usuário: ${roles.join(", ") || "nenhuma"}`,
        },
        { role: "user", content: message },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "process_command",
            description: "Processa um comando geral do usuário",
            parameters: {
              type: "object",
              properties: {
                reply: { type: "string" },
                actionType: { type: "string" },
                actionPayload: { type: "object" },
                requiresConfirmation: { type: "boolean" },
                plan: { type: "string" },
              },
              required: ["reply", "actionType", "requiresConfirmation", "plan"],
              additionalProperties: false,
            },
          },
        },
        {
          type: "function",
          function: {
            name: "buscar_empresas",
            description: "Busca empresas por cidade e termo via Foursquare",
            parameters: {
              type: "object",
              properties: {
                cidade: { type: "string" },
                termo: { type: "string" },
                limite: { type: "number" },
              },
              required: ["cidade", "termo"],
              additionalProperties: false,
            },
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("Rate limit excedido, tente novamente.");
    if (res.status === 402) throw new Error("Créditos insuficientes.");
    throw new Error(`AI gateway error: ${res.status}`);
  }

  const data = await res.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

  if (toolCall?.function?.name === "buscar_empresas") {
    const args = JSON.parse(toolCall.function.arguments);
    return {
      reply: `🔍 Buscando ${args.termo} em ${args.cidade}...`,
      actionType: "buscar_empresas",
      requiresConfirmation: false,
      plan: `Buscar ${args.termo} em ${args.cidade}`,
      payload: { query: args.termo, near: args.cidade, limit: args.limite || 50 },
    };
  }

  if (toolCall?.function?.arguments) {
    const parsed = JSON.parse(toolCall.function.arguments);
    return {
      reply: parsed.reply,
      actionType: parsed.actionType,
      requiresConfirmation: parsed.requiresConfirmation ?? false,
      plan: parsed.plan,
      payload: parsed.actionPayload ?? {},
    };
  }

  return {
    reply: data.choices?.[0]?.message?.content || "Não entendi o comando.",
    actionType: "consultar",
    requiresConfirmation: false,
    plan: "Consulta geral",
    payload: {},
  };
}

// ─── n8n Search ──────────────────────────────────────────

async function executeSearch(payload: Record<string, any>, taskId: string, supabase: any) {
  try {
    const n8nUrl = "http://116.203.112.103:5678/webhook/buscar-empresas";
    const res = await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: payload.query, cidade: payload.near, limit: payload.limit || 50 }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("n8n error:", res.status, errText);
      return { places: [], error: `Erro n8n (${res.status})` };
    }

    const text = await res.text();
    const contentType = res.headers.get("content-type") || "";

    if (!contentType.includes("application/json") && (text.trim().startsWith("<!") || text.includes("<html"))) {
      return { places: [], error: "Webhook retornou HTML em vez de JSON. Verifique o workflow." };
    }

    let raw: any[];
    try {
      const parsed = text ? JSON.parse(text) : [];
      raw = Array.isArray(parsed) ? parsed : (parsed.empresas || parsed.results || parsed.data || []);
    } catch {
      console.error("JSON parse error, raw:", text.substring(0, 300));
      raw = [];
    }

    if (raw.length === 0 && text.length === 0) {
      return { places: [], error: "Webhook retornou resposta vazia." };
    }

    // Map n8n fields directly — these match the n8n workflow output
    const places = raw.map((p: any) => ({
      nome: p.nome || p.name || "",
      whatsapp: p.whatsapp || p.phone || "",
      email: p.email || "",
      website: p.website || p.site || "",
      endereco: p.endereco || p.address || "",
      cidade: p.cidade || p.city || payload.near || "",
      nicho: p.nicho || p.categories || "",
      score: typeof p.score === "number" ? p.score : 50,
      whatsapp_link: p.whatsapp_link || "",
      site_status: p.site_status || "N/A",
      weak_reasons: Array.isArray(p.weak_reasons) ? p.weak_reasons : [],
      pitch_angle: p.pitch_angle || "",
      whatsapp_message: p.whatsapp_message || "",
      ranking: p.site_status === "FRACO" ? "🟢 Alta" : (p.score >= 60 ? "🟡 Média" : "🔴 Baixa"),
    }));

    places.sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
    return { places, error: null };
  } catch (e: any) {
    console.error("n8n fetch error:", e);
    return { places: [], error: `Erro ao buscar: ${e.message}` };
  }
}

// ─── Format ──────────────────────────────────────────────

function formatPlaces(places: any[], query: string, city: string): string {
  const lines = places.map((p: any, i: number) => {
    let entry = `${i + 1}. **${p.nome}** ${p.ranking} (Score: ${p.score})\n   📍 ${p.endereco || "—"} — ${p.cidade}\n   🏷️ ${p.nicho || "—"}`;
    if (p.whatsapp) entry += `\n   📞 ${p.whatsapp}`;
    if (p.email) entry += `\n   📧 ${p.email}`;
    if (p.website) entry += `\n   🌐 ${p.website}`;
    if (p.whatsapp_link) entry += `\n   💬 [WhatsApp](${p.whatsapp_link})`;
    entry += `\n   🔎 Site: **${p.site_status}**`;
    if (p.weak_reasons.length) entry += `\n   ⚠️ ${p.weak_reasons.join(" | ")}`;
    if (p.pitch_angle) entry += `\n   💡 *${p.pitch_angle}*`;
    return entry;
  });

  return `📊 **Prospecção: "${query}" em ${city}** (${places.length} resultados)\n\n${lines.join("\n\n")}\n\n💡 *Use o botão abaixo para baixar em CSV.*`;
}
