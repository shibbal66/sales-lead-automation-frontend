// Import Firebase scripts from CDN
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

// These values are required for background messaging.
firebase.initializeApp({
  apiKey: "AIzaSyDBX9IptBZwkn_odCVralPglmi9V8FIW_w",
  authDomain: "rapidai-dea00.firebaseapp.com",
  projectId: "rapidai-dea00",
  storageBucket: "rapidai-dea00.firebasestorage.app",
  messagingSenderId: "238287673959",
  appId: "1:238287673959:web:96f184faddc752d80912c2"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || "Rapid AI";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification.",
    icon: "/favicon.ico",
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
