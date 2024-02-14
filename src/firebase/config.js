import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { ref, uploadBytes, getStorage, getDownloadURL, uploadString } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

//const firebaseConfig = {
//  apiKey: "AIzaSyBTkAH17TBRq5xDrLk-dyM69LJe1RSD8jw",
//  authDomain: "talma-d7c8a.firebaseapp.com",
//  projectId: "talma-d7c8a",
//  storageBucket: "talma-d7c8a.appspot.com",
//  messagingSenderId: "1031241800457",
//  appId: "1:1031241800457:web:fcafd2eb52abfd0da411d8",
//  measurementId: "G-NHK79TQDH6",
//};

const firebaseConfig = {
  apiKey: "AIzaSyDy6hbZFv-pzWHwDoAA3yQMe3GmAaevRWM",
  authDomain: "talma-a8629.firebaseapp.com",
  projectId: "talma-a8629",
  storageBucket: "talma-a8629.appspot.com",
  messagingSenderId: "602672539835",
  appId: "1:602672539835:web:735828dc0f6ece0da4a19e",
  measurementId: "G-V3B66YFR1Q"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


const db = getFirestore();
const storage = getStorage(app);

export async function uploadFile(file) {
  console.log(file);
  const { v4: uuidv4 } = require("uuid");
  const nuevoUUID = uuidv4();
  const metadata = {
    contentType: "text/csv",
  };
  const storageRef = ref(storage, nuevoUUID);
  await uploadBytes(storageRef, file, metadata);
  const url = await getDownloadURL(storageRef);
  return url;
}

export { db, storage };
