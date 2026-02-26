import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Permission map: role -> allowed action types
const PERMISSIONS: Record<string, string[]> = {
  dono: ["*"],
  financeiro: ["registrar_pagamento", "gerar_relatorio", "consultar", "buscar_empresas"],
  vendas: ["criar_lead", "criar_projeto", "consultar", "buscar_empresas"],
  operacao: ["atualizar_status", "enviar_mensagem", "consultar", "buscar_empresas"],
};

function hasPermission(roles: string[], actionType: string): boolean {
  return roles.some((role) => {
    const allowed = PERMISSIONS[role];
    if (!allowed) return false;
    return allowed.includes("*") || allowed.includes(actionType) || allowed.includes("consultar");
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autorizado");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Não autorizado");

    const { message } = await req.json();
    if (!message || typeof message !== "string" || message.length > 2000) {
      throw new Error("Mensagem inválida");
    }

    // Get user roles
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const userRoles = rolesData?.map((r: any) => r.role) ?? [];

    // Call AI to analyze the command
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Você é um assistente de automação empresarial. Analise o comando do usuário e determine qual ferramenta usar.

Se o usuário pedir para buscar empresas, locais, restaurantes, lojas ou qualquer tipo de estabelecimento em uma cidade, use a ferramenta "buscar_empresas".
Para outros comandos, use "process_command".

Roles do usuário: ${userRoles.join(", ") || "nenhuma"}`,
          },
          { role: "user", content: message },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "process_command",
              description: "Process a general user command and return structured action",
              parameters: {
                type: "object",
                properties: {
                  reply: { type: "string", description: "Resposta amigável ao usuário" },
                  actionType: { type: "string", description: "Tipo da ação: criar_projeto, criar_lead, registrar_pagamento, gerar_relatorio, atualizar_status, enviar_mensagem, enviar_whatsapp, consultar, outro" },
                  actionPayload: { type: "object", description: "Dados extraídos do comando" },
                  requiresConfirmation: { type: "boolean", description: "true se modifica dados" },
                  plan: { type: "string", description: "Breve descrição do que será feito" },
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
              description: "Busca empresas, restaurantes, lojas ou estabelecimentos por cidade e termo usando Foursquare API",
              parameters: {
                type: "object",
                properties: {
                  cidade: { type: "string", description: "Cidade e estado (ex: São Paulo, SP)" },
                  termo: { type: "string", description: "Tipo de empresa a buscar (ex: restaurantes, cafeterias, academias)" },
                  limite: { type: "number", description: "Quantidade máxima de resultados (padrão: 5)" },
                },
                required: ["cidade", "termo"],
                additionalProperties: false,
              },
            },
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido, tente novamente." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let parsed: any;
    let isFoursquareSearch = false;

    if (toolCall?.function?.name === "buscar_empresas" && toolCall?.function?.arguments) {
      // Foursquare search tool was called
      const args = JSON.parse(toolCall.function.arguments);
      isFoursquareSearch = true;
      parsed = {
        reply: `🔍 Buscando ${args.termo} em ${args.cidade}...`,
        actionType: "buscar_empresas",
        requiresConfirmation: false,
        plan: `Buscar ${args.termo} em ${args.cidade} via Foursquare`,
        actionPayload: { query: args.termo, near: args.cidade, limit: args.limite || 5 },
      };
    } else if (toolCall?.function?.arguments) {
      parsed = JSON.parse(toolCall.function.arguments);
    } else {
      parsed = {
        reply: aiData.choices?.[0]?.message?.content || "Não entendi o comando.",
        actionType: "consultar",
        requiresConfirmation: false,
        plan: "Consulta geral",
      };
    }

    // Check permission
    if (!hasPermission(userRoles.length > 0 ? userRoles : ["consultar"], parsed.actionType)) {
      return new Response(
        JSON.stringify({
          reply: `⚠️ Você não tem permissão para executar ações do tipo "${parsed.actionType}". Suas roles: ${userRoles.join(", ") || "nenhuma"}.`,
          requiresConfirmation: false,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create task
    const { data: task, error: taskError } = await supabase
      .from("ai_tasks")
      .insert({
        user_id: user.id,
        command: message,
        plan: parsed.plan,
        status: parsed.requiresConfirmation ? "aguardando_confirmacao" : "pendente",
        requires_confirmation: parsed.requiresConfirmation ?? false,
        action_type: parsed.actionType,
        action_payload: parsed.actionPayload ?? {},
      })
      .select("id")
      .single();

    if (taskError) throw taskError;

    // If Foursquare search, execute it now
    if (isFoursquareSearch) {
      try {
        const FOURSQUARE_API_KEY = Deno.env.get("FOURSQUARE_API_KEY");
        if (!FOURSQUARE_API_KEY) throw new Error("FOURSQUARE_API_KEY not configured");

        const params = new URLSearchParams();
        params.set("query", parsed.actionPayload.query);
        params.set("near", parsed.actionPayload.near);
        params.set("limit", String(parsed.actionPayload.limit));

        const fsqResponse = await fetch(
          `https://api.foursquare.com/v3/places/search?${params.toString()}`,
          { headers: { Accept: "application/json", Authorization: FOURSQUARE_API_KEY } }
        );

        if (fsqResponse.ok) {
          const fsqData = await fsqResponse.json();
          const places = fsqData.results?.map((p: any) => ({
            name: p.name,
            address: p.location?.formatted_address || p.location?.address,
            categories: p.categories?.map((c: any) => c.name).join(", "),
            distance: p.distance,
          })) || [];

          const placesText = places.length > 0
            ? places.map((p: any, i: number) =>
                `${i + 1}. **${p.name}**\n   📍 ${p.address || "Endereço não disponível"}\n   🏷️ ${p.categories || "Sem categoria"}${p.distance ? `\n   📏 ${p.distance}m de distância` : ""}`
              ).join("\n\n")
            : "Nenhum lugar encontrado para essa busca.";

          parsed.reply = `📍 **Resultados para "${parsed.actionPayload.query}" em ${parsed.actionPayload.near}:**\n\n${placesText}`;

          await supabase.from("ai_tasks").update({ status: "concluida", result: { places } }).eq("id", task.id);
        } else {
          const errText = await fsqResponse.text();
          console.error("Foursquare API error:", errText);
          parsed.reply = `⚠️ Erro ao buscar no Foursquare (${fsqResponse.status}). Verifique a API key.`;
          await supabase.from("ai_tasks").update({ status: "falhou", error_message: errText }).eq("id", task.id);
        }
      } catch (fsqErr: any) {
        console.error("Foursquare error:", fsqErr);
        parsed.reply = `❌ Erro ao buscar empresas: ${fsqErr.message}`;
        await supabase.from("ai_tasks").update({ status: "falhou", error_message: fsqErr.message }).eq("id", task.id);
      }
    } else if (!parsed.requiresConfirmation) {
      await supabase.from("ai_tasks").update({ status: "concluida" }).eq("id", task.id);
    }

    // Save chat messages
    await supabase.from("chat_messages").insert([
      { user_id: user.id, task_id: task.id, role: "user", content: message },
      { user_id: user.id, task_id: task.id, role: "assistant", content: parsed.reply },
    ]);

    return new Response(
      JSON.stringify({
        reply: parsed.reply,
        plan: parsed.plan,
        taskId: task.id,
        requiresConfirmation: parsed.requiresConfirmation,
        actionType: parsed.actionType,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("ai-command error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
