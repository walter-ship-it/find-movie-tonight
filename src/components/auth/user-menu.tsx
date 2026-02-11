import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { PartnerLink } from '@/components/auth/partner-link'

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
    <div className="flex flex-col items-end gap-1">
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
      <PartnerLink />
    </div>
  )
}
