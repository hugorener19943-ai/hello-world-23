import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url, method } = await req.json().catch(() => ({ url: null, method: "GET" }));
    const targetUrl = url || "http://116.203.112.103/webhook/lovable-test";
    const targetMethod = method || "GET";

    console.log(`Proxying ${targetMethod} to ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: targetMethod,
      headers: { "Accept": "application/json" },
    });

    const text = await response.text();
    console.log(`Response status: ${response.status}, body: ${text}`);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return new Response(
      JSON.stringify({
        status: response.status,
        ok: response.ok,
        data,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
