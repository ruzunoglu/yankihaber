import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Buraya Firebase Console'dan alacağın yapılandırma ayarlarını yapıştıracaksın.
const firebaseConfig = {
  apiKey: "AIzaSyDD5mOSBO4PNQuIewYcmqJeImCw1AYLglA",
  authDomain: "yankihabersitesi.firebaseapp.com",
  projectId: "yankihabersitesi",
  storageBucket: "yankihabersitesi.firebasestorage.app",
  messagingSenderId: "14018553080",
  appId: "1:14018553080:web:5569f838de919321cb070d"
};

// Uygulamayı başlat
let app;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error) {
    console.warn("Firebase başlatılamadı. Geçerli bir config girilene kadar özel haberler çekilmeyecek.", error);
  }
} else {
  app = getApps()[0];
}

export const db = app ? getFirestore(app) : null;
