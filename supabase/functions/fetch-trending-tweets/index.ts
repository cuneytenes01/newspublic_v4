import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TrendingTweet {
  id: string;
  text: string;
  author_username: string;
  author_name: string;
  author_profile_image: string;
  created_at: string;
  like_count: number;
  retweet_count: number;
  reply_count: number;
  view_count: number;
  media_urls?: string[];
  media_types?: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { category, minEngagement, country } = await req.json();

    const twitterApiKey = Deno.env.get("TWITTERAPI_IO_KEY");

    if (!twitterApiKey) {
      return new Response(
        JSON.stringify({ error: "Twitter API key not configured in Supabase" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const searchQuery = category && category !== 'all'
      ? getCategoryQuery(category, country)
      : country === 'turkey' ? 'Turkey OR Türkiye lang:tr' : 'trending';

    const url = `https://api.twitterapi.io/v1/search/tweets?query=${encodeURIComponent(searchQuery)}&count=50&result_type=popular`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': twitterApiKey
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.statuses || !Array.isArray(data.statuses)) {
      return new Response(
        JSON.stringify({ tweets: [], count: 0 }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const tweets: TrendingTweet[] = data.statuses
      .filter((item: any) => {
        const engagement = (item.favorite_count || 0) + (item.retweet_count || 0) + (item.reply_count || 0);
        return engagement >= (minEngagement || 1000);
      })
      .slice(0, 50)
      .map((item: any) => {
        const mediaUrls: string[] = [];
        const mediaTypes: string[] = [];

        if (item.entities?.media) {
          item.entities.media.forEach((media: any) => {
            mediaUrls.push(media.media_url_https || media.media_url);
            mediaTypes.push(media.type || 'photo');
          });
        }

        return {
          id: item.id_str || String(item.id),
          text: item.full_text || item.text || '',
          author_username: item.user?.screen_name || 'unknown',
          author_name: item.user?.name || 'Unknown',
          author_profile_image: item.user?.profile_image_url_https || item.user?.profile_image_url || '',
          created_at: item.created_at || new Date().toISOString(),
          like_count: item.favorite_count || 0,
          retweet_count: item.retweet_count || 0,
          reply_count: item.reply_count || 0,
          view_count: 0,
          media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
          media_types: mediaTypes.length > 0 ? mediaTypes : undefined
        };
      });

    return new Response(
      JSON.stringify({ tweets, count: tweets.length }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching trending tweets:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to fetch trending tweets",
        tweets: [],
        count: 0
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function getCategoryQuery(category: string, country: string): string {
  const turkishQueries: { [key: string]: string } = {
    technology: 'teknoloji OR yapay zeka OR AI OR tech lang:tr',
    politics: 'siyaset OR seçim OR politika lang:tr',
    sports: 'spor OR futbol OR basketbol lang:tr',
    entertainment: 'eğlence OR müzik OR film lang:tr',
    business: 'ekonomi OR iş dünyası OR borsa lang:tr'
  };

  const globalQueries: { [key: string]: string } = {
    technology: 'technology OR AI OR artificial intelligence',
    politics: 'politics OR election OR government',
    sports: 'sports OR football OR basketball',
    entertainment: 'entertainment OR music OR movie',
    business: 'business OR economy OR stock market'
  };

  if (country === 'turkey') {
    return turkishQueries[category] || 'lang:tr';
  }

  return globalQueries[category] || '';
}
