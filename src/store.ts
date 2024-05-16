import { initializeApp } from 'firebase/app';
import { getFirestore, collection } from 'firebase/firestore';
// ... other firebase imports

export const firebaseApp = initializeApp({
  apiKey: 'AIzaSyCMB-y7CXBwhRgO59PlYI8Y6FdkRL7NGiM',
  authDomain: 'livefollowr-93d2b.firebaseapp.com',
  projectId: 'livefollowr-93d2b',
  storageBucket: 'livefollowr-93d2b.appspot.com',
  messagingSenderId: '404303554351',
  appId: '1:404303554351:web:7a9bf3a5327bd28d92a3da',
});

// used for the firestore refs
export const db = getFirestore(firebaseApp);

// here we can export reusable database references
export const featuredCollection = collection(db, 'featured');
