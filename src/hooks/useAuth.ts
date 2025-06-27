import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      console.log('Signing up user:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            full_name: displayName
          }
        }
      })

      if (error) {
        console.error('Signup error:', error)
        return { data, error }
      }

      console.log('Signup successful:', data.user?.id)
      return { data, error }
    } catch (error) {
      console.error('Signup exception:', error)
      return { data: null, error: error as any }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in user:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Signin error:', error)
        return { data, error }
      }

      console.log('Signin successful:', data.user?.id)
      return { data, error }
    } catch (error) {
      console.error('Signin exception:', error)
      return { data: null, error: error as any }
    }
  }

  const signOut = async () => {
    try {
      console.log('Signing out user')
      const { error } = await supabase.auth.signOut()
      
      // If the error indicates the session is already missing or invalid,
      // treat it as a successful logout to improve user experience
      if (error) {
        const isSessionMissingError = 
          error.message?.includes('Auth session missing') ||
          error.message?.includes('Session from session_id claim in JWT does not exist') ||
          (error as any)?.code === 'session_not_found'
        
        if (isSessionMissingError) {
          console.log('Session already invalid, treating as successful logout')
          return { error: null }
        }
        
        console.error('Signout error:', error)
        return { error }
      }
      
      return { error }
    } catch (error) {
      console.error('Signout exception:', error)
      return { error: error as any }
    }
  }

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  }
}