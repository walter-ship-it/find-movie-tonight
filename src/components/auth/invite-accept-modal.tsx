import { useState } from 'react'
import { useInvite } from '@/contexts/invite-context'
import { Button } from '@/components/ui/button'

export function InviteAcceptModal() {
  const { pendingInvite, acceptInvite, rejectInvite, clearPendingInvite } = useInvite()
  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!pendingInvite) return null

  const handleAccept = async () => {
    setLoading('accept')
    setError(null)
    try {
      await acceptInvite()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to accept invite')
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async () => {
    setLoading('reject')
    setError(null)
    try {
      await rejectInvite()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to decline invite')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) clearPendingInvite()
      }}
    >
      <div className="glass-card rounded-xl p-6 w-full max-w-sm mx-4 relative">
        <button
          onClick={clearPendingInvite}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 className="text-lg font-semibold text-foreground mb-2">
          Partner invite
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          <span className="text-primary font-medium">{pendingInvite.inviter_name}</span>{' '}
          wants to link with you as movie night partners.
        </p>

        {error && (
          <p className="text-xs text-destructive mb-4">{error}</p>
        )}

        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={handleAccept}
            disabled={loading !== null}
          >
            {loading === 'accept' ? 'Accepting...' : 'Accept'}
          </Button>
          <Button
            variant="ghost"
            className="flex-1"
            onClick={handleReject}
            disabled={loading !== null}
          >
            {loading === 'reject' ? 'Declining...' : 'Decline'}
          </Button>
        </div>
      </div>
    </div>
  )
}
