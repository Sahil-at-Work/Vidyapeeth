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

  const showToast = (message: string) => {
    // Create a simple toast notification
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out'
    toast.style.transform = 'translateX(100%)'
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <span>${message}</span>
      </div>
    `
    
    document.body.appendChild(toast)
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)'
    }, 100)
    
    // Animate out and remove
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)'
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 300)
    }, 3000)
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
      // Get current progress to check last activity date
      const currentProgress = userProgress.find(p => p.subject_id === subjectId)
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0]
      const lastActivityDate = currentProgress?.last_activity 
        ? new Date(currentProgress.last_activity).toISOString().split('T')[0]
        : null

      // Determine if this is a new day or same day study session
      const isNewDay = !lastActivityDate || lastActivityDate !== today
      
      // Calculate XP and streak based on day
      let xpGain: number
      let newStreak: number
      let toastMessage: string

      if (isNewDay) {
        // New day - award 10 XP and increment streak
        xpGain = 10
        newStreak = (currentProgress?.study_streak || 0) + 1
        
        // Random welcome back messages
        const welcomeMessages = [
          "🌟 Welcome back, learner! +10 XP",
          "🎯 Great to see you again! +10 XP", 
          "🚀 Ready for another day of learning? +10 XP",
          "💪 Welcome back, champion! +10 XP",
          "🔥 Your learning streak continues! +10 XP",
          "⭐ Another day, another step forward! +10 XP",
          "🎉 Welcome back to your learning journey! +10 XP"
        ]
        toastMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
      } else {
        // Same day - award 1 XP, keep same streak
        xpGain = 1
        newStreak = currentProgress?.study_streak || 0
        
        // Random same-day messages
        const sameeDayMessages = [
          "📚 Enjoy learning... +1 XP",
          "🤓 Keep going, you're doing great! +1 XP",
          "💡 Every bit of learning counts! +1 XP", 
          "🎓 Small steps, big progress! +1 XP",
          "✨ Learning never stops! +1 XP",
          "🌱 Growing your knowledge! +1 XP",
          "🔍 Curious minds learn more! +1 XP",
          "📖 Another page in your journey! +1 XP"
        ]
        toastMessage = sameeDayMessages[Math.floor(Math.random() * sameeDayMessages.length)]
      }

      // Calculate new total XP
      const currentXP = currentProgress?.xp_points || 0
      const newXP = currentXP + xpGain

      // Update progress in database
      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          subject_id: subjectId,
          status,
          completion_percentage: Math.max(completionPercentage, currentProgress?.completion_percentage || 0),
          xp_points: newXP,
          study_streak: newStreak,
          last_activity: new Date().toISOString()
        }, {
          onConflict: 'user_id,subject_id'
        })
        .select()

      if (error) throw error

      // Show toast message
      showToast(toastMessage)

      // Refresh data to get the latest changes
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
