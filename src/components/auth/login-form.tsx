import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface LoginFormProps {
  onToggle: () => void
  onSuccess?: () => void
}

export function LoginForm({ onToggle, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loadingAction, setLoadingAction] = useState<'password' | 'magic' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoadingAction('password')

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      onSuccess?.()
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoadingAction(null)
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }

    setError(null)
    setLoadingAction('magic')

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}`,
          shouldCreateUser: false,
        },
      })

      if (otpError) {
        setError(otpError.message)
        return
      }

      setMagicLinkSent(true)
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoadingAction(null)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="text-center py-4">
        <p className="text-primary font-medium">Check your email for a sign-in link</p>
        <p className="text-sm text-muted-foreground mt-1">
          We sent a magic link to <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>
    )
  }

  const isLoading = loadingAction !== null

  return (
    <form onSubmit={handlePasswordSignIn} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="login-email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <Input
          id="login-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="login-password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <Input
          id="login-password"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {loadingAction === 'password' ? 'Signing in...' : 'Sign in'}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleMagicLink}
        disabled={isLoading}
      >
        {loadingAction === 'magic' ? 'Sending link...' : 'Send magic link'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "text-primary hover:underline font-medium",
            "transition-colors duration-200"
          )}
        >
          Sign up
        </button>
      </p>
    </form>
  )
}
