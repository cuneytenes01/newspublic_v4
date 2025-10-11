import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function detectLanguage(text: string): string {
  const turkishChars = /[ğüşıöçĞÜŞİÖÇ]/;
  const turkishWords = ['bir', 've', 'bu', 'için', 'ile', 'var', 'olan', 'gibi', 'daha', 'çok'];

  if (turkishChars.test(text)) {
    return 'turkish';
  }

  const lowerText = text.toLowerCase();
  const foundTurkishWords = turkishWords.filter(word => lowerText.includes(word)).length;

  if (foundTurkishWords >= 2) {
    return 'turkish';
  }

  return 'other';
}

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

    const detectedLang = detectLanguage(text);
    console.log('Detected language:', detectedLang);

    let systemPrompt = "";
    if (detectedLang === 'turkish') {
      systemPrompt = "You are a translator. Translate the given Turkish text to English. Only provide the translation, nothing else. Do not add any explanations or notes.";
    } else {
      systemPrompt = "You are a translator. Translate the given text to Turkish. Only provide the translation, nothing else. Do not add any explanations or notes.";
    }

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY") || "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";

    if (!OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY not found in environment');
      throw new Error("Translation service not configured");
    }

    console.log('Calling OpenRouter API...');
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
            content: systemPrompt,
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error("Translation service unavailable");
    }

    const data = await response.json();
    const translation = data.choices[0].message.content;
    console.log('Translation successful');

    return new Response(
      JSON.stringify({ translation }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Translation failed" }),
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