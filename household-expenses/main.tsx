import React from 'react';
import ReactDOM from 'react-dom/client';
import './app/globals.css';
import { AppProvider } from './providers/AppProvider';
import { AppShell } from './features/AppShell';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <AppShell />
    </AppProvider>
  </React.StrictMode>,
);
