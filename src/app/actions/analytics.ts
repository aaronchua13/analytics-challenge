'use server';

import { createClient } from '@/lib/supabase-server';
import { SummaryStats, DailyMetric } from '@/lib/api';

export async function getSummaryStatsAction(): Promise<SummaryStats> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase.rpc('get_dashboard_summary', { p_user_id: user.id });

  if (error) {
    console.error('RPC Error:', error);
    throw new Error('Failed to fetch summary');
  }

  return data as SummaryStats;
}

export async function getDailyMetricsAction(timeRange: 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<DailyMetric[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // p_time_range is still required by the RPC, so we keep the parameter for now but it defaults to 'monthly'
  const { data, error } = await supabase.rpc('get_engagement_metrics', { p_user_id: user.id, p_time_range: timeRange });

  if (error) {
    console.error('RPC Error:', error);
    throw new Error('Failed to fetch metrics');
  }

  return data as DailyMetric[];
}
