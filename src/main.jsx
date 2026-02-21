import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ComplaintProvider } from './context/ComplaintContext.jsx';

// initialize firebase once at startup (uses firebaseConfig from src/firebase.js)
import { initializeApp } from 'firebase/app';
import firebaseConfig from './firebase';

const firebaseApp = initializeApp(firebaseConfig);
// optionally export firebaseApp if needed elsewhere
export { firebaseApp };

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ComplaintProvider>
        <App />
      </ComplaintProvider>
    </AuthProvider>
  </StrictMode>
);
