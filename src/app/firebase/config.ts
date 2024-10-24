import { getApp, getApps, initializeApp } from "firebase/app";
import { firebaseLinks } from "@/utils/constants";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: firebaseLinks.apiKey,
  authDomain: firebaseLinks.authDomain,
  projectId: firebaseLinks.projectID,
  storageBucket: firebaseLinks.storageBucket,
  messagingSenderId: firebaseLinks.messageSenderId,
  appId: firebaseLinks.appId,
  measurementId: firebaseLinks.measurementId
};

const app = !getApps().length? initializeApp(firebaseConfig): getApp();

const auth = getAuth(app);

export {app, auth};

