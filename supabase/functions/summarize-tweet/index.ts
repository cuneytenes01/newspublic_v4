import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY") || "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";

    if (!OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY not found in environment');
      throw new Error("Summarization service not configured");
    }

    console.log('Calling OpenRouter API for summarization...');
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://twitter-monitoring.app",
        "X-Title": "Twitter Monitoring App",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          {
            role: "system",
            content: "Sen bir eğitim uzmanısın. Tweet'i çok basit ve anlaşılır Türkçe ile açıkla. Teknik terimleri sade dille anlat, mutlaka günlük hayattan örnekler ver. Hedef kitle teknik bilgisi olmayan okuyucular. 2-3 cümle ile özetle ve bir basit örnek ekle ki okuyucu daha iyi anlasın.",
          },
          {
            role: "user",
            content: `Bu tweet'i basit Türkçe ile açıkla ve mutlaka günlük hayattan örnekler ver:\n\n${text}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error("Summarization service unavailable");
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;
    console.log('Summarization successful');

    return new Response(
      JSON.stringify({ summary }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Summarization error:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Summarization failed" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});