importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

// @ts-nocheck
firebase.initializeApp({{FIREBASE_CONFIG}});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'New notification';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: payload.notification?.image,
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
        try {
          if (client.url === clickAction && 'focus' in client) {
            return client.focus();
          }
        } catch (e) {
          // ignore cross-origin access issues
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(clickAction);
      }
    }),
  );
});
