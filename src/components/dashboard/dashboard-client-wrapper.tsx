'use client';

import { useDashboardStore } from '@/store/dashboard-store';
import PostDetailModal from './post-detail-modal';

export default function DashboardClientWrapper() {
  const { selectedPost, isModalOpen, setIsModalOpen } = useDashboardStore();

  return (
    <PostDetailModal
      post={selectedPost}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    />
  );
}
