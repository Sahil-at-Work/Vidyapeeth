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
      console.log('Fetching profile for user:', userId)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
        throw error
      } else {
        console.log('Profile fetched successfully:', data)
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async (profileData: Partial<UserProfile>, retryCount = 0) => {
    if (!userId) {
      console.error('No user ID provided for profile creation')
      return { data: null, error: { message: 'No user ID provided' } }
    }

    try {
      console.log('Creating/updating profile for user:', userId, profileData, `(attempt ${retryCount + 1})`)
      
      // Add initial delay for new user profile creation to ensure user ID is propagated
      if (retryCount === 0 && profileData.profile_completed === true) {
        console.log('Adding initial delay for new user profile creation...')
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      const updateData = {
        id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(updateData, {
          onConflict: 'id'
        })
        .select()
        .single()

      if (error) {
        // Check if it's a foreign key constraint violation (error code 23503)
        if (error.code === '23503' && retryCount < 7) {
          // Exponential backoff delays: 1s, 2s, 4s, 8s, 16s, 32s, 64s
          const delays = [1000, 2000, 4000, 8000, 16000, 32000, 64000]
          const delay = delays[retryCount] || 64000
          
          console.log(`Foreign key constraint violation, retrying in ${delay/1000} seconds... (attempt ${retryCount + 1}/7)`)
          await new Promise(resolve => setTimeout(resolve, delay))
          return createProfile(profileData, retryCount + 1)
        }
        
        console.error('Error creating/updating profile:', error)
        return { data: null, error }
      }

      console.log('Profile created/updated successfully:', data)
      setProfile(data)
      return { data, error: null }
    } catch (error) {
      console.error('Exception in createProfile:', error)
      return { data: null, error: error as any }
    }
  }

  const updateProfile = async (updates: Partial<UserProfile> | ProfileFormData) => {
    if (!userId) {
      console.error('No user ID provided for profile update')
      return { data: null, error: { message: 'No user ID provided' } }
    }

    try {
      console.log('Updating profile for user:', userId, updates)
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        return { data: null, error }
      }

      console.log('Profile updated successfully:', data)
      setProfile(data)
      return { data, error: null }
    } catch (error) {
      console.error('Exception in updateProfile:', error)
      return { data: null, error: error as any }
    }
  }

  const validatePrivateKey = async (key: string) => {
    if (!userId) return { data: false, error: { message: 'No user ID provided' } }

    try {
      const { data, error } = await supabase.rpc('validate_user_private_key', {
        p_user_id: userId,
        p_key: key
      })

      if (error) {
        console.error('Error validating private key:', error)
        return { data: false, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Exception in validatePrivateKey:', error)
      return { data: false, error: error as any }
    }
  }

  return {
    profile,
    loading,
    createProfile,
    updateProfile,
    validatePrivateKey,
    refetch: fetchProfile,
  }
}