import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'sonner'
import { PriceProvider } from './context/PriceContext.tsx'
import { ThemeProvider } from './lib/ThemeProvider.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux';
import { store } from './store/store.ts';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <>
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <PriceProvider>
            <App />
            <Toaster />
          </PriceProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Provider>
  </>
)
