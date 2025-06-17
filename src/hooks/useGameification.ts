import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { UserProgress, LeaderboardCompetitor, UserAchievement } from '../types'

export function useGameification(userId: string | undefined) {
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardCompetitor[]>([])
  const [achievements, setAchievements] = useState<UserAchievement[]>([])
  const [totalXP, setTotalXP] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchGameificationData()
    }
  }, [userId])

  const fetchGameificationData = async () => {
    if (!userId) return

    try {
      setLoading(true)

      // Fetch user progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select(`
          *,
          subjects:subject_id (
            id,
            name,
            code,
            credits
          )
        `)
        .eq('user_id', userId)

      setUserProgress(progressData || [])

      // Calculate total XP
      const total = (progressData || []).reduce((sum, progress) => sum + progress.xp_points, 0)
      setTotalXP(total)

      // Fetch leaderboard (AI competitors + user)
      const { data: competitorsData } = await supabase
        .from('leaderboard_competitors')
        .select('*')
        .order('total_xp', { ascending: false })

      // Add current user to leaderboard
      const userLeaderboardEntry: LeaderboardCompetitor = {
        id: userId,
        name: 'You',
        avatar_url: null,
        total_xp: total,
        current_streak: Math.max(...(progressData || []).map(p => p.study_streak), 0),
        is_ai: false,
        personality_type: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const allCompetitors = [...(competitorsData || []), userLeaderboardEntry]
        .sort((a, b) => b.total_xp - a.total_xp)

      setLeaderboard(allCompetitors)

      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })

      setAchievements(achievementsData || [])

    } catch (error) {
      console.error('Error fetching gamification data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSubjectProgress = async (
    subjectId: string, 
    status: 'not_started' | 'in_progress' | 'completed',
    completionPercentage: number = 0,
    xpPoints?: number,
    studyStreak?: number
  ) => {
    if (!userId) return

    try {
      // Get current progress to calculate incremental values
      const currentProgress = userProgress.find(p => p.subject_id === subjectId)
      
      // Calculate XP points based on progress increase
      const currentXP = currentProgress?.xp_points || 0
      const calculatedXP = xpPoints !== undefined ? xpPoints : 
        (completionPercentage > (currentProgress?.completion_percentage || 0) ? 
          currentXP + (completionPercentage - (currentProgress?.completion_percentage || 0)) : currentXP)

      // Calculate study streak
      const calculatedStreak = studyStreak !== undefined ? studyStreak :
        (status === 'in_progress' || status === 'completed' ? 
          (currentProgress?.study_streak || 0) + 1 : currentProgress?.study_streak || 0)

      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          subject_id: subjectId,
          status,
          completion_percentage: completionPercentage,
          xp_points: calculatedXP,
          study_streak: calculatedStreak,
          last_activity: new Date().toISOString()
        }, {
          onConflict: 'user_id,subject_id'
        })
        .select()

      if (error) throw error

      // Refresh data
      await fetchGameificationData()

      return { data, error: null }
    } catch (error) {
      console.error('Error updating progress:', error)
      return { data: null, error }
    }
  }

  const incrementStreak = async (subjectId: string) => {
    if (!userId) return

    try {
      const currentProgress = userProgress.find(p => p.subject_id === subjectId)
      if (!currentProgress) return

      const { error } = await supabase
        .from('user_progress')
        .update({
          study_streak: currentProgress.study_streak + 1,
          last_activity: new Date().toISOString()
        })
        .eq('id', currentProgress.id)

      if (error) throw error

      await fetchGameificationData()
    } catch (error) {
      console.error('Error incrementing streak:', error)
    }
  }

  return {
    userProgress,
    leaderboard,
    achievements,
    totalXP,
    loading,
    updateSubjectProgress,
    incrementStreak,
    refetch: fetchGameificationData
  }
}