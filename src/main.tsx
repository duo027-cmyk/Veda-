import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-red-500/30 p-8 rounded-2xl">
        <h2 className="text-2xl font-bold text-red-500 mb-4 font-mono">FATAL_SYSTEM_ERROR</h2>
        <pre className="bg-black/50 p-4 rounded-lg text-xs text-red-400 mb-6 overflow-auto max-h-40 font-mono">
          {error.message}
        </pre>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all font-mono"
        >
          REBOOT_OS
        </button>
      </div>
    </div>
  );
}

import { I18nProvider } from './i18n';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={<ErrorFallback error={new Error("Unknown Error")} />}>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ErrorBoundary>
  </StrictMode>,
);
