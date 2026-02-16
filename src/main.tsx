import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from '@/contexts/auth-context'
import { ShortlistProvider } from '@/contexts/shortlist-context'
import { InviteProvider } from '@/contexts/invite-context'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ShortlistProvider>
        <InviteProvider>
          <App />
        </InviteProvider>
      </ShortlistProvider>
    </AuthProvider>
  </React.StrictMode>,
)
