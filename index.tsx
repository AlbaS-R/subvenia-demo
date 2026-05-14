
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.mjs';
// Expose pdfjsLib to window so components can access it
(window as any).pdfjsLib = pdfjsLib;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  // <React.StrictMode>  // <-- Comenta o elimina esta línea
    <ThemeProvider>
      <LanguageProvider>
          <App />
      </LanguageProvider>
    </ThemeProvider>
  // </React.StrictMode> // <-- Y esta otra
);
