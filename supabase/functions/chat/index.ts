import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Only send user and assistant messages with content
    const cleanMessages = (messages || [])
      .filter((m: { role: string; content: string }) => m.content && m.content.trim().length > 0)
      .map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      }));

    console.log("Sending messages count:", cleanMessages.length);

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
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
              content:
                "You are Ellumigen, an AI research assistant specializing in computational biology, bioinformatics, and genomic data analysis. You help researchers analyze datasets, interpret results, and plan experiments. Be concise, scientific, and helpful. Use markdown formatting for clarity. If the user asks something unrelated to biology, still answer helpfully but stay in character as a knowledgeable research assistant.",
            },
            ...cleanMessages,
          ],
          stream: false,
        }),
      }
    );

    const responseText = await response.text();
    console.log("Gateway status:", response.status);

    if (!response.ok) {
      console.error("AI gateway error:", response.status, responseText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "AI service error", details: responseText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response:", responseText.substring(0, 500));
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const content = data.choices?.[0]?.message?.content;
    console.log("Response content length:", content?.length || 0);

    if (!content) {
      console.error("No content in response. Full response:", JSON.stringify(data).substring(0, 1000));
      return new Response(
        JSON.stringify({ content: "I'm sorry, I couldn't generate a response right now. Could you try rephrasing your question?" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
