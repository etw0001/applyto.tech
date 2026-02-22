import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check for OAuth callback in URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const hasAccessToken = hashParams.get('access_token')
        const hasError = hashParams.get('error')

        if (hasAccessToken || hasError) {
            console.log('OAuth callback detected in URL hash', { hasAccessToken, hasError })

            // Wait for Supabase to process the hash, then get session
            // The onAuthStateChange should fire, but let's also explicitly get the session
            const checkSession = async () => {
                // Try multiple times as Supabase processes the hash
                for (let i = 0; i < 5; i++) {
                    await new Promise(resolve => setTimeout(resolve, 200))
                    const { data: { session }, error } = await supabase.auth.getSession()
                    console.log(`Session check ${i + 1}:`, session?.user?.email || 'no user', error?.message)

                    if (session?.user) {
                        setSession(session)
                        setUser(session.user)
                        setLoading(false)
                        // Clean up URL
                        window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
                        return
                    }
                }

                // If still no session after retries, there might be an error
                if (hasError) {
                    console.error('OAuth error:', hashParams.get('error_description') || hasError)
                }
                setLoading(false)
            }

            checkSession()
        } else {
            // Normal page load - get initial session
            supabase.auth.getSession().then(({ data: { session } }) => {
                console.log('Initial session:', session?.user?.email || 'no user')
                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false)
            })
        }

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email || 'no user')

            // Handle OAuth callback - clean up URL hash after successful sign in
            if (event === 'SIGNED_IN' && window.location.hash) {
                setTimeout(() => {
                    window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
                }, 100)
            }

            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    useEffect(() => {
        if (!user?.id) return

        const channel = supabase
            .channel(`profile-deletions-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${user.id}`
                },
                async () => {
                    console.log('User profile deleted remotely. Signing out...')
                    await supabase.auth.signOut()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user?.id])

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}${window.location.pathname}`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        })
        if (error) throw error
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    }

    return {
        user,
        session,
        loading,
        signInWithGoogle,
        signOut,
    }
}
