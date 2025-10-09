importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAVXATR_Q3AdyFjBpSLFsJMOfQrlq2E0Kg',
  authDomain: 'crm-dev-fcf69.firebaseapp.com',
  projectId: 'crm-dev-fcf69',
  storageBucket: 'crm-dev-fcf69.firebasestorage.app',
  messagingSenderId: '153587099861',
  appId: '1:153587099861:web:1c35fa2d5486969bf19a5c',
  measurementId: 'G-T1E8K07KDR',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
  console.log('[Service Worker] Notification click received.');

  event.notification.close();

  const clickAction =
    event.notification?.data?.uri || event.notification?.data?.fcmOptions?.link || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === clickAction && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(clickAction);
      }
    }),
  );
});
