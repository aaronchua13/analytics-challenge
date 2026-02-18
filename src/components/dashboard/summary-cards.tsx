import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Activity, BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { SummaryStats } from "@/lib/api";

export default function SummaryCards({ stats }: { stats: SummaryStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEngagement.toLocaleString()}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            {stats.trends.engagement > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={stats.trends.engagement > 0 ? "text-green-500" : "text-red-500"}>
              {Math.abs(stats.trends.engagement)}%
            </span>
            <span className="ml-1">from last month</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Engagement Rate</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgEngagementRate}%</div>
          <div className="flex items-center text-xs text-muted-foreground">
             {stats.trends.rate > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={stats.trends.rate > 0 ? "text-green-500" : "text-red-500"}>
              {Math.abs(stats.trends.rate)}%
            </span>
            <span className="ml-1">from last month</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalReach.toLocaleString()}</div>
          <div className="flex items-center text-xs text-muted-foreground">
             {stats.trends.reach > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={stats.trends.reach > 0 ? "text-green-500" : "text-red-500"}>
              {Math.abs(stats.trends.reach)}%
            </span>
            <span className="ml-1">from last month</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Post</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {stats.topPost ? (
            <>
              <div className="text-sm font-medium truncate">{stats.topPost.caption}</div>
              <p className="text-xs text-muted-foreground">
                {stats.topPost.engagement_rate}% engagement
              </p>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">No posts yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
