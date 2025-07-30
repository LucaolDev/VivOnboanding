// main.jsx ou main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client'; // Esse é o correto!
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
