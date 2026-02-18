import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Activity, BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { SummaryStats } from "@/lib/api";

export default function SummaryCards({ stats }: { stats: SummaryStats }) {
  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-3 w-3 text-green-500 mr-1" />;
    if (value < 0) return <TrendingDown className="h-3 w-3 text-red-500 mr-1" />;
    return <Minus className="h-3 w-3 text-muted-foreground mr-1" />;
  };

  const getTrendClass = (value: number) => {
    if (value > 0) return "text-green-500";
    if (value < 0) return "text-red-500";
    return "text-muted-foreground";
  };

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
            {getTrendIcon(stats.trends.engagement)}
            <span className={getTrendClass(stats.trends.engagement)}>
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
            {getTrendIcon(stats.trends.rate)}
            <span className={getTrendClass(stats.trends.rate)}>
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
            {getTrendIcon(stats.trends.reach)}
            <span className={getTrendClass(stats.trends.reach)}>
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
              <div className="text-sm font-medium truncate" title={stats.topPost.caption || "No caption"}>
                {stats.topPost.caption || "No caption"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.topPost.engagement_rate}% engagement
              </p>
            </>
          ) : (
            <div className="text-sm text-muted-foreground flex items-center">
              <Minus className="h-3 w-3 mr-2" />
              No posts yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
