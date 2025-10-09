import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyAVXATR_Q3AdyFjBpSLFsJMOfQrlq2E0Kg',
  authDomain: 'crm-dev-fcf69.firebaseapp.com',
  projectId: 'crm-dev-fcf69',
  storageBucket: 'crm-dev-fcf69.firebasestorage.app',
  messagingSenderId: '153587099861',
  appId: '1:153587099861:web:1c35fa2d5486969bf19a5c',
  measurementId: 'G-T1E8K07KDR',
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

  console.log('Getting token...');

  const token = await getToken(messaging, {
    vapidKey: import.meta.env.REACT_APP_FIREBASE_VAPID_KEY,
  });

  console.log('Token:', token);
};

export { generateToken, messaging };
