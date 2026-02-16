import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'

interface ShortlistContextType {
  shortlistedIds: Set<string>
  toggleShortlist: (movieId: string) => Promise<void>
  isShortlisted: (movieId: string) => boolean
  loading: boolean
}

const ShortlistContext = createContext<ShortlistContextType | undefined>(undefined)

export function ShortlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setShortlistedIds(new Set())
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchShortlist() {
      try {
        const { data, error } = await supabase
          .from('shortlist')
          .select('movie_id')
          .eq('user_id', user!.id)

        if (cancelled) return

        if (error) {
          console.error('Error fetching shortlist:', error)
          setShortlistedIds(new Set())
        } else {
          setShortlistedIds(new Set(data.map((row) => row.movie_id)))
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching shortlist:', err)
          setShortlistedIds(new Set())
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    setLoading(true)
    fetchShortlist()

    return () => {
      cancelled = true
    }
  }, [user])

  const isShortlisted = useCallback(
    (movieId: string) => shortlistedIds.has(movieId),
    [shortlistedIds]
  )

  const toggleShortlist = useCallback(
    async (movieId: string) => {
      if (!user) return

      const wasShortlisted = shortlistedIds.has(movieId)

      // Optimistic update
      setShortlistedIds((prev) => {
        const next = new Set(prev)
        if (wasShortlisted) {
          next.delete(movieId)
        } else {
          next.add(movieId)
        }
        return next
      })

      try {
        if (wasShortlisted) {
          const { error } = await supabase
            .from('shortlist')
            .delete()
            .eq('user_id', user.id)
            .eq('movie_id', movieId)

          if (error) throw error
        } else {
          const { error } = await supabase
            .from('shortlist')
            .insert({ user_id: user.id, movie_id: movieId })

          if (error) throw error
        }
      } catch (err) {
        // Revert optimistic update on error
        console.error('Error toggling shortlist:', err)
        setShortlistedIds((prev) => {
          const reverted = new Set(prev)
          if (wasShortlisted) {
            reverted.add(movieId)
          } else {
            reverted.delete(movieId)
          }
          return reverted
        })
      }
    },
    [user, shortlistedIds]
  )

  return (
    <ShortlistContext.Provider value={{ shortlistedIds, toggleShortlist, isShortlisted, loading }}>
      {children}
    </ShortlistContext.Provider>
  )
}

export function useShortlist() {
  const context = useContext(ShortlistContext)
  if (!context) {
    throw new Error('useShortlist must be used within ShortlistProvider')
  }
  return context
}
