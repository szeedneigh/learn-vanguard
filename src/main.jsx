import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './Globals.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
