import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { UserProfile, ProfileFormData } from '../types'

export function useUserProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    fetchProfile()
  }, [userId])

  const fetchProfile = async () => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .limit(1)

      if (error) {
        console.error('Error fetching profile:', error)
      } else {
        setProfile(data && data.length > 0 ? data[0] : null)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async (profileData: Partial<UserProfile>) => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          ...profileData,
        })
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      return { data, error: null }
    } catch (error) {
      console.error('Error creating profile:', error)
      return { data: null, error }
    }
  }

  const updateProfile = async (updates: Partial<UserProfile> | ProfileFormData) => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      // Immediately update the local state with the new data
      setProfile(data)
      return { data, error: null }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { data: null, error }
    }
  }

  return {
    profile,
    loading,
    createProfile,
    updateProfile,
    refetch: fetchProfile,
  }
}