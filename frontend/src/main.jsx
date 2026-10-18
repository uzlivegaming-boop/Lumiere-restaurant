
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider, useAuth } from '@clerk/react';

import App from './App';
import { setTokenProvider } from './api/client';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error(
    'VITE_CLERK_PUBLISHABLE_KEY topilmadi. frontend/.env.local faylini tekshiring.'
  );
}

function AuthTokenBridge() {
  const { getToken, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    setTokenProvider(() => getToken());

    return () => {
      setTokenProvider(null);
    };
  }, [getToken, isLoaded]);

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <AuthTokenBridge />
    </ClerkProvider>
  </React.StrictMode>
);
