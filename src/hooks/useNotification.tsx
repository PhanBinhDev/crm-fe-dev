import { messaging } from '@/firebase/config';
import { useCreate, useInvalidate } from '@refinedev/core';
import { IconBell } from '@tabler/icons-react';
import { getToken, onMessage } from 'firebase/messaging';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useModal } from './useModal';

export const useNotification = () => {
  const invalidate = useInvalidate();
  const navigate = useNavigate();
  const { mutate } = useCreate({
    resource: 'device-tokens',
    mutationOptions: {
      retry: false,
    },
  });

  const { openModal } = useModal();

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        });

        mutate({
          values: {
            tokens: [token],
            deviceInfo: 'web',
          },
        });
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
  };

  const handleNotificationClick = (data: any) => {
    console.log('Navigating to:', data.uri);

    navigate(data.uri);
    openModal('ModalEditActivity', {
      activity: data.open,
    });
  };

  useEffect(() => {
    const unsubscribe = onMessage(messaging, payload => {
      const title = payload.notification?.title || 'Thông báo mới';
      const body = payload.notification?.body || '';
      const uri = payload.data?.uri || payload.fcmOptions?.link || '/';

      console.log('Message received. ', payload);

      toast(title, {
        duration: 8000,
        icon: <IconBell size={14} color="#1677ff" />,
        position: 'top-right',
        id: `notification-${Date.now()}`,
        action: {
          label: 'Xem',
          onClick: () => handleNotificationClick(uri),
        },
        onDismiss: () => console.log('Dismissed notification'),
        style: {
          backgroundColor: '#fff',
        },
        className: 'notification-toast',
        description: body,
      });

      console.log('invalidate');
      invalidate({
        resource: 'notifications',
        invalidates: ['list'],
      });
    });

    return () => unsubscribe();
  }, []);

  return { requestPermission };
};
