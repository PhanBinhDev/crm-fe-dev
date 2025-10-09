import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const generateToken = async () => {
  const perrmission = await Notification.requestPermission();

  console.log('perrmission', perrmission);

  if (perrmission !== 'granted') {
    console.log('No permission for notification');
    return;
  }

  const token = await getToken(messaging, {
    vapidKey: import.meta.env.REACT_APP_FIREBASE_VAPID_KEY,
  });

  console.log('Token:', token);
};

export { generateToken, messaging };
