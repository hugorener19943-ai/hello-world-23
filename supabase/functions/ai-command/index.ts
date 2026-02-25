import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Permission map: role -> allowed action types
const PERMISSIONS: Record<string, string[]> = {
  dono: ["*"],
  financeiro: ["registrar_pagamento", "gerar_relatorio", "consultar"],
  vendas: ["criar_lead", "criar_projeto", "consultar"],
  operacao: ["atualizar_status", "enviar_mensagem", "consultar"],
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
            content: `Você é um assistente de automação empresarial. Analise o comando do usuário e retorne um JSON com:
- "reply": resposta amigável ao usuário
- "actionType": tipo da ação (criar_projeto, criar_lead, registrar_pagamento, gerar_relatorio, atualizar_status, enviar_mensagem, enviar_whatsapp, consultar, outro)
- "actionPayload": dados extraídos do comando (objeto JSON)
- "requiresConfirmation": true se a ação modifica dados, false se é apenas consulta
- "plan": breve descrição do que será feito

Responda APENAS com o JSON, sem markdown.
Roles do usuário: ${userRoles.join(", ") || "nenhuma"}`,
          },
          { role: "user", content: message },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "process_command",
              description: "Process a user command and return structured action",
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
        ],
        tool_choice: { type: "function", function: { name: "process_command" } },
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

    if (toolCall?.function?.arguments) {
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

    // Save chat messages
    await supabase.from("chat_messages").insert([
      { user_id: user.id, task_id: task.id, role: "user", content: message },
      { user_id: user.id, task_id: task.id, role: "assistant", content: parsed.reply },
    ]);

    // Auto-execute if no confirmation needed
    if (!parsed.requiresConfirmation) {
      await supabase
        .from("ai_tasks")
        .update({ status: "concluida" })
        .eq("id", task.id);
    }

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
