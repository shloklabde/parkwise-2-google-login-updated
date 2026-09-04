import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAG_8AkzgmGsB4q_eI9gupGukmDH2cBqrY',
  authDomain: 'parkwise-c2b26.firebaseapp.com',
  projectId: 'parkwise-c2b26',
  storageBucket: 'parkwise-c2b26.firebasestorage.app',
  messagingSenderId: '970697767721',
  appId: '1:970697767721:web:d934ea6f893a69f04c1538',
  measurementId: 'G-Y9EBRG6698',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);

export const analyticsReady =
  typeof window !== 'undefined'
    ? isSupported()
        .then((supported) => (supported ? getAnalytics(firebaseApp) : null))
        .catch(() => null)
    : Promise.resolve(null);
