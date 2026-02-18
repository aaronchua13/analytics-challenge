"use client";

import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Post } from "@/lib/api";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  ExternalLink, 
  Calendar,
  BarChart2,
  Eye,
  LucideIcon
} from "lucide-react";

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
} as any;

export default function PostDetailModal({ post, isOpen, onClose }: PostDetailModalProps) {
  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] h-[85vh] p-0 gap-0 overflow-hidden border-none shadow-2xl bg-background/95 backdrop-blur-xl flex flex-col">
        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {/* Header Image Area */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-[400px] bg-black/90 relative flex items-center justify-center group overflow-hidden shrink-0"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 z-10 pointer-events-none" />
            
            {post.thumbnail_url ? (
              <motion.img
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                src={post.thumbnail_url}
                alt="Post content"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-white/50 gap-3">
                <div className="p-4 rounded-full bg-white/5 backdrop-blur-sm">
                  <Eye className="h-8 w-8" />
                </div>
                <span className="text-sm font-medium tracking-wide">No Preview</span>
              </div>
            )}

            {/* Platform Badge Overlay */}
            <div className="absolute top-4 left-4 z-20">
              <Badge variant="secondary" className="backdrop-blur-md bg-white/10 text-white border-white/20 px-3 py-1 text-xs font-medium uppercase tracking-wider shadow-lg">
                {post.platform}
              </Badge>
            </div>

            {/* Close Button Overlay (Optional if Dialog has one, but good for UX) */}
          </motion.div>

          {/* Content Details */}
          <div className="p-6 md:p-8 space-y-8">
            {/* Header Info */}
            <div className="flex items-start justify-between gap-4 border-b border-border/40 pb-6">
              <div className="space-y-1.5">
                <DialogTitle className="text-2xl font-bold tracking-tight">Post Analysis</DialogTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <time>{new Date(post.posted_at).toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</time>
                </div>
              </div>
              <Badge variant={getEngagementVariant(post.engagement_rate)} className="font-mono text-sm px-3 py-1 h-8">
                {post.engagement_rate}% Engagement
              </Badge>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Main Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard 
                  icon={Heart} 
                  value={post.likes} 
                  label="Likes" 
                  color="text-rose-500" 
                  bg="bg-rose-500/10" 
                  delay={0}
                />
                <StatCard 
                  icon={MessageCircle} 
                  value={post.comments} 
                  label="Comments" 
                  color="text-blue-500" 
                  bg="bg-blue-500/10"
                  delay={0.1}
                />
                <StatCard 
                  icon={Share2} 
                  value={post.shares} 
                  label="Shares" 
                  color="text-emerald-500" 
                  bg="bg-emerald-500/10"
                  delay={0.2}
                />
                <StatCard 
                  icon={Bookmark} 
                  value={post.saves} 
                  label="Saves" 
                  color="text-amber-500" 
                  bg="bg-amber-500/10"
                  delay={0.3}
                />
              </div>

              {/* Caption */}
              <motion.div variants={itemVariants} className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary rounded-full"/>
                  Caption
                </h3>
                <div className="p-5 rounded-xl bg-muted/30 border border-border/40 text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {post.caption || <span className="text-muted-foreground italic">No caption provided.</span>}
                </div>
              </motion.div>

              {/* Deep Metrics */}
              <motion.div variants={itemVariants} className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary rounded-full"/>
                  Impact
                </h3>
                <div className="bg-card rounded-xl border border-border/40 overflow-hidden">
                  <div className="p-5 grid grid-cols-2 gap-8 divide-x divide-border/40">
                    <div className="space-y-1 pr-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-2">
                        <Eye className="h-4 w-4" /> Reach
                      </div>
                      <div className="text-2xl font-bold font-mono">{post.reach.toLocaleString()}</div>
                    </div>
                    <div className="space-y-1 pl-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-2">
                        <BarChart2 className="h-4 w-4" /> Impressions
                      </div>
                      <div className="text-2xl font-bold font-mono">{post.impressions.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="p-6 border-t border-border/40 bg-background/95 backdrop-blur sticky bottom-0 z-20 shrink-0">
          {post.permalink ? (
            <Button className="w-full h-12 text-base font-medium shadow-lg hover:shadow-primary/25 transition-all duration-300" asChild>
              <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                Open on {post.platform}
                <ExternalLink className="h-4 w-4 ml-1 opacity-70" />
              </a>
            </Button>
          ) : (
            <Button disabled variant="secondary" className="w-full h-12 opacity-50">
              Link not available
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface StatCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  color: string;
  bg: string;
  delay: number;
}

function StatCard({ icon: Icon, value, label, color, bg, delay }: StatCardProps) {
  return (
    <motion.div 
      variants={itemVariants}
      custom={delay}
      whileHover={{ scale: 1.02, y: -2 }}
      className="flex flex-col p-3.5 rounded-xl border border-border/40 bg-card hover:border-border/80 transition-colors relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
        <Icon className="h-12 w-12" />
      </div>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${bg} ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="space-y-0.5 z-10">
        <span className="text-xs font-medium text-muted-foreground block">{label}</span>
        <span className="text-lg font-bold tracking-tight font-mono">{value.toLocaleString()}</span>
      </div>
    </motion.div>
  );
}

function getEngagementVariant(rate: number): "default" | "secondary" | "destructive" | "outline" {
  if (rate >= 5) return "default";
  if (rate >= 2) return "secondary";
  return "outline";
}
