import { supabase } from "@/lib/supabase";

export type Post = {
  id: string;
  user_id: string;
  platform: 'instagram' | 'tiktok';
  caption: string;
  thumbnail_url: string;
  media_type: 'image' | 'video' | 'carousel';
  posted_at: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  permalink: string;
  created_at: string;
};

export type DailyMetric = {
  date: string;
  engagement: number;
  reach: number;
};

export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('posted_at', { ascending: false });

  if (error) throw error;
  return data as Post[];
}

export type SummaryStats = {
  totalPosts: number;
  totalEngagement: number;
  totalReach: number;
  avgEngagementRate: string | number;
  topPost: Post | null;
  trends: {
    engagement: number;
    reach: number;
    rate: number;
  };
};

export async function getSummaryStats() {
  // Use API route for aggregation
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) throw new Error("Not authenticated");

  const response = await fetch('/api/analytics/summary', {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch summary');
  }

  return response.json() as Promise<SummaryStats>;
}

export async function getDailyMetrics() {
  // Use Edge Function/API route
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) throw new Error("Not authenticated");

  const response = await fetch('/api/metrics/daily', {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch metrics');
  }

  return response.json() as Promise<DailyMetric[]>;
}
