import { Activity, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPostsAction } from '@/app/actions/posts';
import { getSummaryStatsAction, getDailyMetricsAction } from '@/app/actions/analytics';
import SummaryCards from '@/components/dashboard/summary-cards';
import EngagementChart from '@/components/dashboard/engagement-chart';
import PostsTable from '@/components/dashboard/posts-table';
import DashboardClientWrapper from '@/components/dashboard/dashboard-client-wrapper';
import SignOutButton from '@/components/dashboard/sign-out-button';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function DashboardPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Parse search params
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 100;
  const search = (searchParams.search as string) || '';
  const sortBy = (searchParams.sortBy as string) || 'posted_at';
  const sortOrder = (searchParams.sortOrder as 'asc' | 'desc') || 'asc';
  const platform = (searchParams.platform as string) || 'all';

  // Fetch data in parallel
  const [postsData, summaryStats, dailyMetrics] = await Promise.all([
    getPostsAction({ page, limit, search, sortBy, sortOrder, platform }),
    getSummaryStatsAction(),
    getDailyMetricsAction('monthly'), // Fixed to monthly
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b px-4 md:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <Activity className="h-6 w-6" />
          <span>Analytics Challenge</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline-block">
            {user.email}
          </span>
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <UserIcon className="h-5 w-5" />
            </Button>
          </Link>
          <SignOutButton />
        </div>
      </header>
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        <SummaryCards stats={summaryStats} />

        <div className="grid gap-4 grid-cols-1">
          <EngagementChart data={dailyMetrics} />
          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <PostsTable
                data={postsData.data}
                page={postsData.page}
                limit={postsData.limit}
                totalPages={postsData.totalPages}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      <DashboardClientWrapper />
    </div>
  );
}
