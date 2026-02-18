'use client';

import { Button } from '@/components/ui/button';
import { signOutAction } from '@/app/actions/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useDashboardStore } from '@/store/dashboard-store';

export default function SignOutButton() {
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    // Clear React Query cache
    queryClient.clear();
    queryClient.removeQueries();
    
    // Reset Zustand store
    useDashboardStore.setState({
      selectedPost: null,
      isModalOpen: false,
      platformFilter: 'all',
      chartViewType: 'area',
    });

    // Perform sign out
    await signOutAction();
  };

  return (
    <form action={handleSignOut}>
      <Button variant="outline" type="submit">
        Sign Out
      </Button>
    </form>
  );
}
