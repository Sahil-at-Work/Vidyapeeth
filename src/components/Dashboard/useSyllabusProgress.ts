import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface SyllabusProgressItem {
  id: string
  user_id: string
  subject_id: string
  section_index: number
  topic_index: number | null
  subtopic_index: number | null
  completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export function useSyllabusProgress(userId: string | undefined, subjectId: string | undefined) {
  const [progress, setProgress] = useState<SyllabusProgressItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId && subjectId) {
      fetchProgress()
    }
  }, [userId, subjectId])

  const fetchProgress = async () => {
    if (!userId || !subjectId) return

    try {
      const { data, error } = await supabase
        .from('syllabus_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('subject_id', subjectId)

      if (error) throw error
      setProgress(data || [])
    } catch (error) {
      console.error('Error fetching syllabus progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async (
    sectionIndex: number,
    topicIndex?: number,
    subtopicIndex?: number,
    completed?: boolean
  ) => {
    if (!userId || !subjectId) return

    try {
      const { error } = await supabase
        .from('syllabus_progress')
        .upsert({
          user_id: userId,
          subject_id: subjectId,
          section_index: sectionIndex,
          topic_index: topicIndex || null,
          subtopic_index: subtopicIndex || null,
          completed: completed || false,
          completed_at: completed ? new Date().toISOString() : null
        }, {
          onConflict: 'user_id,subject_id,section_index,topic_index,subtopic_index'
        })

      if (error) throw error
      await fetchProgress() // Refresh the progress data
    } catch (error) {
      console.error('Error updating syllabus progress:', error)
    }
  }

  const getCompletionStatus = (sectionIndex: number, topicIndex?: number, subtopicIndex?: number) => {
    return progress.find(item => 
      item.section_index === sectionIndex &&
      item.topic_index === (topicIndex || null) &&
      item.subtopic_index === (subtopicIndex || null)
    )?.completed || false
  }

  return {
    progress,
    loading,
    updateProgress,
    getCompletionStatus,
    refetch: fetchProgress
  }
}