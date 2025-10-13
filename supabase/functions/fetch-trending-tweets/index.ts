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

    const rapidApiKey = Deno.env.get("RAPIDAPI_KEY");
    if (!rapidApiKey) {
      return new Response(
        JSON.stringify({ error: "RapidAPI key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const searchQuery = category && category !== 'all'
      ? getCategoryQuery(category, country)
      : country === 'turkey' ? 'Turkey OR Türkiye lang:tr' : '';

    const url = `https://twitter-api45.p.rapidapi.com/search.php?query=${encodeURIComponent(searchQuery)}&search_type=Top`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'twitter-api45.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.timeline) {
      return new Response(
        JSON.stringify({ tweets: [], count: 0 }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const tweets: TrendingTweet[] = data.timeline
      .filter((item: any) => {
        const engagement = (item.favorites || 0) + (item.retweets || 0) + (item.replies || 0);
        return engagement >= (minEngagement || 1000);
      })
      .slice(0, 50)
      .map((item: any) => ({
        id: item.tweet_id,
        text: item.text || '',
        author_username: item.author?.screen_name || 'unknown',
        author_name: item.author?.name || 'Unknown',
        author_profile_image: item.author?.avatar || '',
        created_at: item.created_at || new Date().toISOString(),
        like_count: item.favorites || 0,
        retweet_count: item.retweets || 0,
        reply_count: item.replies || 0,
        view_count: item.views || 0,
        media_urls: item.media_url ? [item.media_url] : [],
        media_types: item.media_url ? ['photo'] : []
      }));

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
