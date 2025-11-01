import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'sonner'
import { PriceProvider } from './context/PriceContext.tsx'
import { ThemeProvider } from './lib/ThemeProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <PriceProvider>
        <App />
        <Toaster />
      </PriceProvider>
    </ThemeProvider>
  </>
)
