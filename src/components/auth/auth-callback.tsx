import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function AuthCallback() {
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tokenHash = params.get('token_hash')
    const type = params.get('type')

    if (!tokenHash || !type) return

    setVerifying(true)

    supabase.auth
      .verifyOtp({ token_hash: tokenHash, type: type as 'email' })
      .then(({ error: verifyError }) => {
        if (verifyError) {
          setError(verifyError.message)
        } else {
          // Clean URL after successful verification
          window.history.replaceState({}, '', window.location.pathname)
        }
      })
      .finally(() => setVerifying(false))
  }, [])

  if (verifying) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="glass-card rounded-xl p-6 text-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Verifying your sign-in link...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="glass-card rounded-xl p-6 text-center max-w-sm">
          <p className="text-destructive font-medium mb-2">Verification failed</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Dismiss
          </button>
        </div>
      </div>
    )
  }

  return null
}
