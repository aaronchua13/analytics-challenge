import { create } from 'zustand';
import { Post } from '@/lib/api';

interface DashboardState {
  selectedPost: Post | null;
  setSelectedPost: (post: Post | null) => void;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  platformFilter: 'all' | 'instagram' | 'tiktok';
  setPlatformFilter: (filter: 'all' | 'instagram' | 'tiktok') => void;
  chartViewType: 'area' | 'line';
  setChartViewType: (type: 'area' | 'line') => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedPost: null,
  setSelectedPost: (post) => set({ selectedPost: post }),
  isModalOpen: false,
  setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  platformFilter: 'all',
  setPlatformFilter: (filter) => set({ platformFilter: filter }),
  chartViewType: 'area',
  setChartViewType: (type) => set({ chartViewType: type }),
}));
