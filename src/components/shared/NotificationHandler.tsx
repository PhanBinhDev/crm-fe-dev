import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { useEffect, useRef } from 'react';

export const NotificationHandler = () => {
  const { user, isLoading } = useAuth();
  const { requestPermission } = useNotification();
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    if (user?.id && !hasRequestedRef.current && !isLoading) {
      hasRequestedRef.current = true;
      requestPermission();
    }
  }, [user?.id, requestPermission, isLoading]);

  return null;
};
