import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './lib/AuthContext';
import { MapProvider } from './components/MapPicker';
import { registerSW } from 'virtual:pwa-register';
import { cognitiveSyncPlugin } from './plugins/CognitiveSyncPlugin';
import './index.css';

// Initialize the cognitive sync plugin to handle universal live updates
cognitiveSyncPlugin.init();

// Register PWA service worker
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MapProvider>
          <App />
        </MapProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
