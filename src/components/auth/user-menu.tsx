import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'

export function UserMenu() {
  const { user, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email ||
    'User'

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground truncate max-w-[150px]">
        {displayName}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        disabled={signingOut}
      >
        {signingOut ? 'Signing out...' : 'Sign out'}
      </Button>
    </div>
  )
}
