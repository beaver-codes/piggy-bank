import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { AuthProvider, FirebaseAppProvider, FirestoreProvider, useFirebaseApp } from 'reactfire';
import { firebaseConfig } from './utils/firebaseConfig';
import { PrivateRoute } from './components/PrivateRoute';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import config from './utils/config';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { ToastContainer } from 'react-toastify';

import './styles/App.scss';
import "bootstrap-icons/font/bootstrap-icons.css"
import 'react-toastify/dist/ReactToastify.css';
import { AccountSettingsPage } from './pages/AccountSettingsPage';
import AccountPage from './pages/AccountPage';
import { PATHS } from './utils/shared/constants';

const router = createBrowserRouter([
  {
    path: "/",
    element: <PrivateRoute><AccountPage /></PrivateRoute>,
  },
  {
    path: PATHS.accountSettings + "/:accountId?",
    element: <PrivateRoute><AccountSettingsPage /></PrivateRoute>,
  }
]);

function FirebaseApp() {

  const auth = getAuth(useFirebaseApp());
  const firestore = getFirestore(useFirebaseApp());

  if (config.useEmulators) {
    connectFirestoreEmulator(firestore, 'localhost', 8080);
    connectAuthEmulator(auth, "http://localhost:9099")
  }

  return <AuthProvider sdk={auth}>
    <FirestoreProvider sdk={firestore}>

      <RouterProvider router={router} />
      <ToastContainer />
    </FirestoreProvider>
  </AuthProvider >
}

function App() {
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <FirebaseApp />
    </FirebaseAppProvider>
  );
}

export default App;
