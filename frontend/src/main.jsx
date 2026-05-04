import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn("Missing Publishable Key: Install your Clerk keys in .env.local before continuing.")
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY || "pk_test_placeholder"}>
       <App />
    </ClerkProvider>
  </React.StrictMode>,
)

