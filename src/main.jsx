import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SuplevitDataProvider } from './context/SuplevitDataContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SuplevitDataProvider>
      <App />
    </SuplevitDataProvider>
  </StrictMode>,
)
