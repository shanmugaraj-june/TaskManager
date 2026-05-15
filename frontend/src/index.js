import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#222228',
              color: '#e8e8f0',
              border: '1px solid #2e2e38',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#3ecf8e', secondary: '#0f4a30' } },
            error: { iconTheme: { primary: '#f75f5f', secondary: '#4a1515' } },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
