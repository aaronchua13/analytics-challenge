"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Post } from "@/lib/api";
import { Heart, MessageCircle, Share2, Eye, Bookmark, ExternalLink } from "lucide-react";

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PostDetailModal({ post, isOpen, onClose }: PostDetailModalProps) {
  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[85vh] p-0 flex flex-col gap-0 overflow-hidden sm:rounded-xl">
        {/* Header - Fixed */}
        <DialogHeader className="p-6 border-b bg-background z-10 shrink-0">
          <div className="flex items-center justify-between pr-8">
            <div className="space-y-1">
              <DialogTitle className="text-xl">Post Details</DialogTitle>
              <DialogDescription>
                Posted on {new Date(post.posted_at).toLocaleDateString()} via <span className="capitalize font-medium text-foreground">{post.platform}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        {/* Content - Scrollable/Grid */}
        <div className="flex-1 grid md:grid-cols-2 overflow-hidden bg-muted/10">
          {/* Left Column: Image Area */}
          <div className="bg-black/5 flex items-center justify-center p-4 md:p-8 h-full overflow-hidden border-r">
            <div className="relative w-full h-full flex items-center justify-center">
               {post.thumbnail_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={post.thumbnail_url}
                  alt="Post thumbnail"
                  className="max-w-full max-h-full object-contain rounded-md shadow-sm"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <Eye className="h-12 w-12 opacity-20" />
                  <span className="text-sm opacity-60">No Preview Available</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details Area */}
          <div className="flex flex-col h-full bg-background overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Caption Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Caption</h4>
                <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                    {post.caption || <span className="text-muted-foreground italic">No caption provided.</span>}
                  </p>
                </div>
              </div>

              {/* Engagement Stats */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Engagement</h4>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard 
                    icon={Heart} 
                    value={post.likes} 
                    label="Likes" 
                    className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30" 
                  />
                  <StatCard 
                    icon={MessageCircle} 
                    value={post.comments} 
                    label="Comments" 
                    className="bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30" 
                  />
                  <StatCard 
                    icon={Share2} 
                    value={post.shares} 
                    label="Shares" 
                    className="bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30" 
                  />
                  <StatCard 
                    icon={Bookmark} 
                    value={post.saves} 
                    label="Saves" 
                    className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30" 
                  />
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Performance</h4>
                <div className="bg-card border rounded-lg divide-y">
                  <div className="flex justify-between items-center p-3 px-4">
                    <span className="text-sm text-muted-foreground">Reach</span>
                    <span className="font-mono font-medium">{post.reach.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 px-4">
                    <span className="text-sm text-muted-foreground">Impressions</span>
                    <span className="font-mono font-medium">{post.impressions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 px-4 bg-muted/20">
                    <span className="text-sm font-medium">Engagement Rate</span>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${getEngagementColor(post.engagement_rate)}`}>
                      {post.engagement_rate}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions - Sticky */}
            <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-10">
              {post.permalink ? (
                <Button className="w-full gap-2 shadow-sm" size="lg" asChild>
                  <a href={post.permalink} target="_blank" rel="noopener noreferrer">
                    View on {post.platform} <ExternalLink className="h-4 w-4 opacity-50" />
                  </a>
                </Button>
              ) : (
                <Button disabled variant="secondary" className="w-full">Link not available</Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ icon: Icon, value, label, className }: any) {
  return (
    <div className={`flex flex-col p-3 border rounded-lg transition-colors ${className}`}>
      <div className="flex items-center gap-2 mb-1 opacity-90">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="text-xl font-bold tracking-tight">{value.toLocaleString()}</span>
    </div>
  );
}

function getEngagementColor(rate: number) {
  if (rate >= 5) return "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40";
  if (rate >= 2) return "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40";
  return "text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800";
}
