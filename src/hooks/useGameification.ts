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

  const triggerCelebration = () => {
    // Create celebration animation with confetti
    const celebration = document.createElement('div')
    celebration.className = 'fixed inset-0 pointer-events-none z-50'
    celebration.innerHTML = `
      <div class="celebration-container">
        <style>
          .celebration-container {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          
          .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            background: #f39c12;
            animation: confetti-fall 3s linear forwards;
          }
          
          .confetti:nth-child(odd) {
            background: #e74c3c;
            width: 8px;
            height: 8px;
            animation-duration: 3.5s;
          }
          
          .confetti:nth-child(3n) {
            background: #3498db;
            width: 6px;
            height: 6px;
            animation-duration: 2.5s;
          }
          
          .confetti:nth-child(4n) {
            background: #2ecc71;
            width: 12px;
            height: 12px;
            animation-duration: 4s;
          }
          
          .confetti:nth-child(5n) {
            background: #9b59b6;
            width: 8px;
            height: 8px;
            animation-duration: 3.2s;
          }
          
          @keyframes confetti-fall {
            0% {
              transform: translateY(-100vh) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
          
          .celebration-message {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem 3rem;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            text-align: center;
            animation: celebration-bounce 0.6s ease-out;
            z-index: 100;
          }
          
          @keyframes celebration-bounce {
            0% {
              transform: translate(-50%, -50%) scale(0.3);
              opacity: 0;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.1);
            }
            100% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
          }
          
          .celebration-title {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #FFD700, #FFA500);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .celebration-subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
          }
        </style>
        
        <div class="celebration-message">
          <div class="celebration-title">🎉 CONGRATULATIONS! 🎉</div>
          <div class="celebration-subtitle">Subject Completed Successfully!</div>
          <div style="margin-top: 1rem; font-size: 1rem;">
            🏆 You've mastered this subject! 🏆
          </div>
        </div>
      </div>
    `
    
    // Add confetti particles
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div')
      confetti.className = 'confetti'
      confetti.style.left = Math.random() * 100 + '%'
      confetti.style.animationDelay = Math.random() * 3 + 's'
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's'
      celebration.querySelector('.celebration-container')?.appendChild(confetti)
    }
    
    document.body.appendChild(celebration)
    
    // Remove celebration after animation
    setTimeout(() => {
      document.body.removeChild(celebration)
    }, 5000)
  }

  const updateSubjectProgress = async (
    subjectId: string, 
    status: 'not_started' | 'in_progress' | 'completed',
    completionPercentage?: number,
    gateQuestionsCompleted?: boolean
  ) => {
    if (!userId) return

    try {
      // Get current progress to check last activity date
      const currentProgress = userProgress.find(p => p.subject_id === subjectId)
      
      // If this is a manual completion (status = 'completed' and completionPercentage = 100)
      if (status === 'completed' && completionPercentage === 100) {
        // Force completion regardless of GATE questions
        const { data, error } = await supabase
          .from('user_progress')
          .upsert({
            user_id: userId,
            subject_id: subjectId,
            status: 'completed',
            completion_percentage: 100,
            xp_points: Math.max(100, currentProgress?.xp_points || 0), // Ensure XP is at least 100
            study_streak: currentProgress?.study_streak || 0,
            gate_questions_completed: gateQuestionsCompleted || true, // Mark GATE as completed
            last_activity: new Date().toISOString()
          }, {
            onConflict: 'user_id,subject_id'
          })
          .select()

        if (error) throw error

        // Show completion message and trigger celebration
        showToast("🎉 Subject completed! Congratulations! 🎉")
        setTimeout(() => triggerCelebration(), 500)

        // Refresh data to get the latest changes
        await fetchGameificationData()
        return { data, error: null }
      }

      // Regular progress update logic
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
        const sameDayMessages = [
          "📚 Enjoy learning... +1 XP",
          "🤓 Keep going, you're doing great! +1 XP",
          "💡 Every bit of learning counts! +1 XP", 
          "🎓 Small steps, big progress! +1 XP",
          "✨ Learning never stops! +1 XP",
          "🌱 Growing your knowledge! +1 XP",
          "🔍 Curious minds learn more! +1 XP",
          "📖 Another page in your journey! +1 XP"
        ]
        toastMessage = sameDayMessages[Math.floor(Math.random() * sameDayMessages.length)]
      }

      // Calculate new total XP
      const currentXP = currentProgress?.xp_points || 0
      const newXP = currentXP + xpGain

      // Set completion percentage based on provided value or XP
      let newCompletionPercentage: number
      
      if (completionPercentage !== undefined) {
        // Use provided completion percentage
        newCompletionPercentage = Math.min(100, completionPercentage)
      } else {
        // Default behavior: cap at 99% unless GATE questions are completed
        if (gateQuestionsCompleted && newXP >= 99) {
          newCompletionPercentage = Math.min(100, newXP)
        } else {
          newCompletionPercentage = Math.min(99, newXP)
        }
      }

      // Determine status based on completion percentage and GATE questions
      let newStatus = status
      if (newCompletionPercentage >= 100 && (gateQuestionsCompleted || status === 'completed')) {
        newStatus = 'completed'
        // Trigger celebration animation for 100% completion
        setTimeout(() => triggerCelebration(), 500)
      } else if (newCompletionPercentage > 0) {
        newStatus = 'in_progress'
      } else {
        newStatus = 'not_started'
      }

      // Update progress in database
      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          subject_id: subjectId,
          status: newStatus,
          completion_percentage: newCompletionPercentage,
          xp_points: newXP,
          study_streak: newStreak,
          gate_questions_completed: gateQuestionsCompleted || currentProgress?.gate_questions_completed || false,
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