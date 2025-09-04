import { firebaseConfig } from '@/utils/constants';
import firebase from 'firebase/compat/app';
import 'firebase/compat/messaging';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized, use that one
}

let messaging: firebase.messaging.Messaging;

if (typeof window !== 'undefined') {
  if (firebase.messaging.isSupported()) {
    messaging = firebase.messaging();
  }
}

export const requestForToken = async (): Promise<string | null> => {
  try {
    const currentToken = await messaging.getToken({
      vapidKey: 'YOUR_VAPID_KEY',
    });

    if (currentToken) {
      console.log('FCM Token:', currentToken);
      return currentToken;
    } else {
      console.log('Không tìm thấy token. User chưa cho phép notification.');
      return null;
    }
  } catch (err) {
    console.error('Lỗi khi lấy token:', err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise(resolve => {
    messaging.onMessage((payload: any) => {
      resolve(payload);
    });
  });
