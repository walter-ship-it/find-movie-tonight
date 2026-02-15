import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'

const INVITE_STORAGE_KEY = 'netflix-imdb-invite-code'

interface PendingInvite {
  invite_code: string
  inviter_name: string
  inviter_id: string
  expires_at: string
}

interface InviteContextType {
  pendingInvite: PendingInvite | null
  acceptInvite: () => Promise<void>
  rejectInvite: () => Promise<void>
  clearPendingInvite: () => void
}

const InviteContext = createContext<InviteContextType | undefined>(undefined)

export function InviteProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [pendingInvite, setPendingInvite] = useState<PendingInvite | null>(null)

  // On mount: check URL for ?invite=CODE and persist to localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('invite')
    if (code) {
      localStorage.setItem(INVITE_STORAGE_KEY, code)
      // Clean the URL without reload
      const url = new URL(window.location.href)
      url.searchParams.delete('invite')
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  // When user logs in, check for stored invite code
  useEffect(() => {
    if (!user) return

    const code = localStorage.getItem(INVITE_STORAGE_KEY)
    if (!code) return

    supabase.rpc('get_invite_by_code', { code }).then(({ data, error }) => {
      if (error || !data?.valid) {
        // Invalid or expired — clean up
        localStorage.removeItem(INVITE_STORAGE_KEY)
        return
      }

      // Don't show modal if user is the inviter
      if (data.inviter_id === user.id) {
        localStorage.removeItem(INVITE_STORAGE_KEY)
        return
      }

      setPendingInvite({
        invite_code: data.invite_code,
        inviter_name: data.inviter_name,
        inviter_id: data.inviter_id,
        expires_at: data.expires_at,
      })
    })
  }, [user])

  const acceptInvite = useCallback(async () => {
    if (!pendingInvite) return

    const { error } = await supabase.rpc('accept_partner_invite', {
      code: pendingInvite.invite_code,
    })

    if (error) throw error

    localStorage.removeItem(INVITE_STORAGE_KEY)
    setPendingInvite(null)
  }, [pendingInvite])

  const rejectInvite = useCallback(async () => {
    if (!pendingInvite) return

    const { error } = await supabase.rpc('reject_partner_invite', {
      code: pendingInvite.invite_code,
    })

    if (error) throw error

    localStorage.removeItem(INVITE_STORAGE_KEY)
    setPendingInvite(null)
  }, [pendingInvite])

  const clearPendingInvite = useCallback(() => {
    localStorage.removeItem(INVITE_STORAGE_KEY)
    setPendingInvite(null)
  }, [])

  return (
    <InviteContext.Provider value={{ pendingInvite, acceptInvite, rejectInvite, clearPendingInvite }}>
      {children}
    </InviteContext.Provider>
  )
}

export function useInvite() {
  const context = useContext(InviteContext)
  if (!context) {
    throw new Error('useInvite must be used within InviteProvider')
  }
  return context
}
