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
    const { text, tweetId } = await req.json();

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
      throw new Error("Sentiment analysis service not configured");
    }

    console.log('Calling OpenRouter API for sentiment analysis...');
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
            content: "You are a sentiment analysis expert. Analyze the sentiment of the given text and respond with ONLY a JSON object in this exact format: {\"sentiment\": \"positive\" or \"negative\" or \"neutral\", \"score\": 0.85, \"reason\": \"brief explanation in Turkish\"}. The score should be between 0 and 1 indicating confidence.",
          },
          {
            role: "user",
            content: `Analyze the sentiment of this tweet:\n\n${text}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error("Sentiment analysis service unavailable");
    }

    const data = await response.json();
    let result;
    
    try {
      const content = data.choices[0].message.content.trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid JSON response");
      }
    } catch (parseError) {
      console.error('Failed to parse sentiment response:', parseError);
      result = {
        sentiment: "neutral",
        score: 0.5,
        reason: "Analiz tamamlanamadı"
      };
    }

    console.log('Sentiment analysis successful:', result);

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Sentiment analysis failed",
        sentiment: "neutral",
        score: 0.5,
        reason: "Hata oluştu"
      }),
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
