import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

type PartnerState =
  | { status: 'loading' }
  | { status: 'linked'; partnerName: string }
  | { status: 'has-invite'; inviteCode: string; expiresAt: string }
  | { status: 'no-invite' }
  | { status: 'error'; message: string }

export function PartnerLink() {
  const { user } = useAuth()
  const [state, setState] = useState<PartnerState>({ status: 'loading' })
  const [actionLoading, setActionLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchPartnerState = useCallback(async () => {
    if (!user) return

    setState({ status: 'loading' })

    try {
      // 1. Check if linked
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('partner_id')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        setState({ status: 'error', message: profileError.message })
        return
      }

      if (!profile) {
        setState({ status: 'error', message: 'No profile found. Sign out and create a fresh account.' })
        return
      }

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
        })
        return
      }

      // 2. Check for existing invite
      const { data: invite, error: inviteError } = await supabase.rpc('get_my_active_invite')

      if (inviteError) {
        setState({ status: 'error', message: inviteError.message })
        return
      }

      if (invite) {
        setState({
          status: 'has-invite',
          inviteCode: invite.invite_code,
          expiresAt: invite.expires_at,
        })
      } else {
        setState({ status: 'no-invite' })
      }
    } catch {
      setState({ status: 'error', message: 'Failed to fetch partner status' })
    }
  }, [user])

  useEffect(() => {
    fetchPartnerState()
  }, [fetchPartnerState])

  const handleGenerateInvite = async () => {
    setActionLoading(true)
    try {
      const { data, error } = await supabase.rpc('create_partner_invite')
      if (error) {
        setState({ status: 'error', message: error.message })
        return
      }
      setState({
        status: 'has-invite',
        inviteCode: data.invite_code,
        expiresAt: data.expires_at,
      })
    } catch {
      setState({ status: 'error', message: 'Failed to generate invite' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCopyLink = async (code: string) => {
    const url = `${window.location.origin}${window.location.pathname}?invite=${code}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCancelInvite = async () => {
    setActionLoading(true)
    try {
      const { error } = await supabase.rpc('cancel_partner_invite')
      if (error) {
        setState({ status: 'error', message: error.message })
        return
      }
      setState({ status: 'no-invite' })
    } catch {
      setState({ status: 'error', message: 'Failed to cancel invite' })
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

  if (state.status === 'has-invite') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-primary">{state.inviteCode}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-primary hover:text-primary"
          onClick={() => handleCopyLink(state.inviteCode)}
          disabled={actionLoading}
        >
          {copied ? 'Copied!' : 'Copy link'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
          onClick={handleCancelInvite}
          disabled={actionLoading}
        >
          Cancel
        </Button>
      </div>
    )
  }

  // no-invite
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
      onClick={handleGenerateInvite}
      disabled={actionLoading}
    >
      {actionLoading ? 'Generating...' : 'Invite partner'}
    </Button>
  )
}
