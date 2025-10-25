// This file must be in the public directory

// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfgR5B1I35psnn8_SLcPoBpm7FPcBu8lU",
  authDomain: "edenflow-v2-08661726-3d147.firebaseapp.com",
  projectId: "edenflow-v2-08661726-3d147",
  storageBucket: "edenflow-v2-08661726-3d147.appspot.com",
  messagingSenderId: "1074368157477",
  appId: "1:1074368157477:web:65fd136f1bc6c8ec01eccc",
};


// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png' 
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
