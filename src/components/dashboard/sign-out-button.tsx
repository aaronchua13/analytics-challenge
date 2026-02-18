'use client';

import { Button } from '@/components/ui/button';
import { signOutAction } from '@/app/actions/auth';

export default function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button variant="outline" type="submit">
        Sign Out
      </Button>
    </form>
  );
}
