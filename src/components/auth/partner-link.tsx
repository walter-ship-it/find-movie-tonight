import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

type PartnerState =
  | { status: 'loading' }
  | { status: 'linked'; partnerName: string; partnerId: string }
  | { status: 'unlinked-available'; partnerName: string; partnerId: string }
  | { status: 'unlinked-none' }
  | { status: 'error'; message: string }

export function PartnerLink() {
  const { user } = useAuth()
  const [state, setState] = useState<PartnerState>({ status: 'loading' })
  const [actionLoading, setActionLoading] = useState(false)

  const fetchPartnerState = useCallback(async () => {
    if (!user) return

    setState({ status: 'loading' })

    try {
      // 1. Query own profile for partner_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('partner_id')
        .eq('id', user.id)
        .single()

      if (profileError) {
        setState({ status: 'error', message: profileError.message })
        return
      }

      // 2. If linked, fetch partner display name
      if (profile.partner_id) {
        const { data: partner, error: partnerError } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', profile.partner_id)
          .single()

        if (partnerError) {
          setState({ status: 'error', message: partnerError.message })
          return
        }

        setState({
          status: 'linked',
          partnerName: partner.display_name || 'Partner',
          partnerId: profile.partner_id,
        })
        return
      }

      // 3. If unlinked, check for available partners
      const { data: available, error: availableError } = await supabase
        .rpc('get_available_partners')

      if (availableError) {
        setState({ status: 'error', message: availableError.message })
        return
      }

      if (available && available.length > 0) {
        setState({
          status: 'unlinked-available',
          partnerName: available[0].display_name || 'User',
          partnerId: available[0].id,
        })
      } else {
        setState({ status: 'unlinked-none' })
      }
    } catch {
      setState({ status: 'error', message: 'Failed to fetch partner status' })
    }
  }, [user])

  useEffect(() => {
    fetchPartnerState()
  }, [fetchPartnerState])

  const handleLink = async (targetUserId: string) => {
    setActionLoading(true)
    try {
      const { error } = await supabase.rpc('link_partner', {
        target_user_id: targetUserId,
      })

      if (error) {
        setState({ status: 'error', message: error.message })
        return
      }

      await fetchPartnerState()
    } catch {
      setState({ status: 'error', message: 'Failed to link partner' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnlink = async () => {
    setActionLoading(true)
    try {
      const { error } = await supabase.rpc('unlink_partner')

      if (error) {
        setState({ status: 'error', message: error.message })
        return
      }

      await fetchPartnerState()
    } catch {
      setState({ status: 'error', message: 'Failed to unlink partner' })
    } finally {
      setActionLoading(false)
    }
  }

  if (state.status === 'loading') {
    return (
      <div className="text-xs text-muted-foreground/70">
        Loading partner status...
      </div>
    )
  }

  if (state.status === 'error') {
    const isSchemaCache = state.message.includes('schema cache')
    return (
      <div className="text-xs text-destructive">
        {isSchemaCache
          ? 'Profiles table not found — reload schema cache in Supabase Dashboard (Settings > API)'
          : state.message}
      </div>
    )
  }

  if (state.status === 'linked') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          Linked with <span className="text-primary font-medium">{state.partnerName}</span>
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
          onClick={handleUnlink}
          disabled={actionLoading}
        >
          {actionLoading ? 'Unlinking...' : 'Unlink'}
        </Button>
      </div>
    )
  }

  if (state.status === 'unlinked-available') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {state.partnerName} is available
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-primary hover:text-primary"
          onClick={() => handleLink(state.partnerId)}
          disabled={actionLoading}
        >
          {actionLoading ? 'Linking...' : 'Link'}
        </Button>
      </div>
    )
  }

  // unlinked-none
  return (
    <div className="text-xs text-muted-foreground/70">
      Your partner hasn't signed up yet
    </div>
  )
}
