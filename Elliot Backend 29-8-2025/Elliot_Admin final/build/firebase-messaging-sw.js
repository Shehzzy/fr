importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyDnaAcFVixVp6x6otfHqa7XrKyuOobs_ho",
    authDomain: "sam-b-4a665.firebaseapp.com",
    projectId: "sam-b-4a665",
    storageBucket: "sam-b-4a665.firebasestorage.app",
    messagingSenderId: "1062056021004",
    appId: "1:1062056021004:web:add07fcdf1f210eeccb229",
    measurementId: "G-CHZ0H9YD4N"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = { body: payload.notification.body, icon: payload.notification.image};
    self.registration.showNotification(notificationTitle, notificationOptions);
});