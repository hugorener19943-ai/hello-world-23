import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// n8n webhook URLs - configure these as secrets or update here
const N8N_WEBHOOKS: Record<string, string> = {
  criar_projeto: "/webhook/create_project",
  criar_lead: "/webhook/create_lead",
  registrar_pagamento: "/webhook/register_payment",
  gerar_relatorio: "/webhook/generate_report",
  atualizar_status: "/webhook/update_status",
  enviar_mensagem: "/webhook/send_message",
  enviar_whatsapp: "/webhook/send_whatsapp",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autorizado");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Não autorizado");

    const { taskId } = await req.json();
    if (!taskId) throw new Error("taskId é obrigatório");

    // Get task
    const { data: task, error: taskError } = await supabase
      .from("ai_tasks")
      .select("*")
      .eq("id", taskId)
      .eq("user_id", user.id)
      .single();

    if (taskError || !task) throw new Error("Tarefa não encontrada");
    if (task.status === "concluida") {
      return new Response(
        JSON.stringify({ message: "Tarefa já foi concluída." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update status to executing
    await supabase
      .from("ai_tasks")
      .update({ status: "em_execucao", confirmed: true })
      .eq("id", taskId);

    // Try to call n8n webhook
    const n8nBaseUrl = Deno.env.get("N8N_BASE_URL");
    const webhookPath = N8N_WEBHOOKS[task.action_type ?? ""];

    let result: any = { executed: true };

    if (n8nBaseUrl && webhookPath) {
      try {
        const n8nResponse = await fetch(`${n8nBaseUrl}${webhookPath}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: task.id,
            userId: user.id,
            actionType: task.action_type,
            payload: task.action_payload,
          }),
        });

        if (!n8nResponse.ok) {
          throw new Error(`n8n webhook failed: ${n8nResponse.status}`);
        }

        result = await n8nResponse.json().catch(() => ({ success: true }));
      } catch (n8nError: any) {
        console.error("n8n webhook error:", n8nError);
        // Mark as failed
        await supabase
          .from("ai_tasks")
          .update({
            status: "falhou",
            error_message: `Erro no webhook: ${n8nError.message}`,
            result: { error: n8nError.message },
          })
          .eq("id", taskId);

        return new Response(
          JSON.stringify({ message: "Erro ao executar via n8n", error: n8nError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // No n8n configured, mark as completed with note
      result = { note: "n8n não configurado. Tarefa marcada como concluída sem execução externa." };
    }

    // Mark as completed
    await supabase
      .from("ai_tasks")
      .update({ status: "concluida", result })
      .eq("id", taskId);

    return new Response(
      JSON.stringify({ message: "Tarefa executada com sucesso!", result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("ai-execute error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
