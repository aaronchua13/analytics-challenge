'use server';

import { createClient } from '@/lib/supabase-server';
import { Post } from '@/lib/api';

export type GetPostsParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  platform?: string;
};

export type GetPostsResponse = {
  data: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function getPostsAction({
  page = 1,
  limit = 100,
  search = '',
  sortBy = 'posted_at',
  sortOrder = 'asc', // "Recent posts should be at the bottom" -> Oldest first -> ASC
  platform = 'all',
}: GetPostsParams): Promise<GetPostsResponse> {
  const supabase = await createClient();

  // Calculate range for pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('posts')
    .select('*', { count: 'exact' });

  // Apply search filter
  if (search) {
    query = query.ilike('caption', `%${search}%`);
  }

  // Apply platform filter
  if (platform && platform !== 'all') {
    query = query.eq('platform', platform);
  }

  // Apply sorting
  // Default is 'posted_at' ascending (oldest first) so recent is at the bottom
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    throw new Error('Failed to fetch posts');
  }

  return {
    data: (data as Post[]) || [],
    total: count || 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  };
}
