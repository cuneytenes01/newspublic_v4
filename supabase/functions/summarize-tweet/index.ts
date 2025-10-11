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
        model: "qwen/qwen3-max",
        messages: [
          {
            role: "system",
            content: "Sen bir profesyonel tweet analiz uzmanısın. Her tweet için yapılandırılmış, detaylı ve okunabilir analizler üretiyorsun. Analizin aşağıdaki bölümleri içermeli:\n\n📌 ANA FİKİR\n(1-2 cümle ile net ve kısa özet)\n\n🔍 DETAYLI AÇIKLAMA\n(3-4 cümle, günlük hayattan somut örneklerle. Teknik terimleri basit dille açıkla)\n\n💡 ÖNEMLİ NOKTALAR\n• İlk önemli nokta\n• İkinci önemli nokta\n• Üçüncü önemli nokta\n(Her madde kısa ve öz olsun)\n\n🎯 ETKİ & SONUÇ\n(Bu bilgi neden önemli, kimleri ilgilendirir, ne gibi değişiklikler yaratabilir - 2-3 cümle)\n\nDikkat: Emoji kullan, net başlıklar koy, paragrafları ayır, okuması kolay olsun.",
          },
          {
            role: "user",
            content: `Bu tweet hakkında yukarıdaki formatta detaylı bir analiz yap:\n\n\"${text}\"`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
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