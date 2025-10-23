import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initDB } from './lib/db/client'

// Initialize the database on app startup
initDB().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}).catch((error) => {
  console.error('Failed to initialize database:', error)
  document.getElementById('root')!.innerHTML = `
    <div style="display: flex; align-items: center; justify-center; height: 100vh; font-family: system-ui;">
      <div style="text-align: center;">
        <h1>Failed to initialize database</h1>
        <p>Please refresh the page to try again.</p>
        <pre style="margin-top: 20px; padding: 10px; background: #f5f5f5; border-radius: 5px;">${error.message}</pre>
      </div>
    </div>
  `
})
