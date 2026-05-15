import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';
import { useAppDispatch } from '@/stores';
import { logoutSession } from '@/stores/auth/actions';
import { ROUTES } from '@/lib/routes';

export function useLogout() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const handleLogout = useCallback(() => {
    logoutSession(dispatch);
    queryClient.clear();
    signOut({ callbackUrl: ROUTES.LOGIN });
  }, [dispatch, queryClient]);

  return { handleLogout };
}
