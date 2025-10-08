import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TWITTER_API_KEY = "new1_13618b06d97d4deda6cff32e44889603";
const TWITTER_API_BASE_URL = "https://api.twitterapi.io";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { username, twitterUserId } = await req.json();

    if (!username || !twitterUserId) {
      return new Response(
        JSON.stringify({ error: "Username and twitterUserId are required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const url = `${TWITTER_API_BASE_URL}/twitter/user/last_tweets?userName=${username}`;
    console.log('Calling Twitter API:', url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-Key": TWITTER_API_KEY,
      },
    });

    console.log('Twitter API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twitter API error:', response.status, errorText);
      throw new Error(`Twitter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('=== FULL TWITTER API RESPONSE ===');
    console.log(JSON.stringify(data, null, 2));
    console.log('=== END RESPONSE ===');

    console.log('Response keys:', Object.keys(data));
    console.log('Twitter API Response status:', data.status);

    if (data.status === 'error') {
      throw new Error(`Twitter API error: ${data.msg || data.message}`);
    }

    const tweetsArray = data.data?.tweets || data.tweets || [];

    if (!Array.isArray(tweetsArray)) {
      console.error('No tweets array in response. Response structure:', Object.keys(data));
      return new Response(
        JSON.stringify({ success: true, count: 0, message: 'No tweets found for this user' }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const tweets = tweetsArray;
    console.log('Number of tweets received:', tweets.length);

    if (tweets.length === 0) {
      console.log('Empty tweets array received');
      return new Response(
        JSON.stringify({ success: true, count: 0, message: 'No tweets found for this user' }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log('First tweet sample:', JSON.stringify(tweets[0], null, 2));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const tweetsToInsert = tweets.map((tweet: any) => {
      console.log('Processing tweet:', { id: tweet.id, text: tweet.text?.substring(0, 50) });

      let mediaType = 'none';
      let mediaUrl = '';
      let mediaThumbnailUrl = '';
      const mediaUrls: string[] = [];
      const mediaTypes: string[] = [];

      if (tweet.extendedEntities?.media && tweet.extendedEntities.media.length > 0) {
        const allMedia = tweet.extendedEntities.media;

        for (const media of allMedia) {
          const currentMediaType = media.type || 'photo';
          mediaTypes.push(currentMediaType);

          if (currentMediaType === 'video' || currentMediaType === 'animated_gif') {
            if (media.video_info?.variants) {
              const mp4Variants = media.video_info.variants.filter((v: any) => v.content_type === 'video/mp4');
              if (mp4Variants.length > 0) {
                const bestQuality = mp4Variants.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))[0];
                mediaUrls.push(bestQuality.url || '');
              }
            }
          } else if (currentMediaType === 'photo') {
            mediaUrls.push(media.media_url_https || '');
          }
        }

        const firstMedia = allMedia[0];
        mediaType = firstMedia.type || 'photo';

        if (mediaType === 'video' || mediaType === 'animated_gif') {
          mediaThumbnailUrl = firstMedia.media_url_https || '';

          if (firstMedia.video_info?.variants) {
            const mp4Variants = firstMedia.video_info.variants.filter((v: any) => v.content_type === 'video/mp4');
            if (mp4Variants.length > 0) {
              const bestQuality = mp4Variants.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))[0];
              mediaUrl = bestQuality.url || '';
            }
          }
        } else if (mediaType === 'photo') {
          mediaUrl = firstMedia.media_url_https || '';
        }
      }

      return {
        tweet_id: tweet.id,
        twitter_user_id: twitterUserId,
        content: tweet.text || "",
        created_at: tweet.createdAt,
        like_count: tweet.likeCount || 0,
        retweet_count: tweet.retweetCount || 0,
        reply_count: tweet.replyCount || 0,
        view_count: tweet.viewCount || 0,
        media_type: mediaType,
        media_url: mediaUrl,
        media_thumbnail_url: mediaThumbnailUrl,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        media_types: mediaTypes.length > 0 ? mediaTypes : null,
      };
    });

    for (const tweet of tweetsToInsert) {
      const { error } = await supabase
        .from("tweets")
        .upsert(tweet, { onConflict: "tweet_id" });

      if (error) {
        console.error("Error inserting tweet:", JSON.stringify(error));
      } else {
        console.log('Tweet inserted successfully:', tweet.tweet_id);
      }
    }

    await supabase
      .from("twitter_users")
      .update({ last_fetched_at: new Date().toISOString() })
      .eq("id", twitterUserId);

    return new Response(
      JSON.stringify({ success: true, count: tweetsToInsert.length }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch tweets" }),
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