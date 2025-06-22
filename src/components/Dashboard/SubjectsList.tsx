import React, { useState, useEffect } from 'react'
import { BookOpen } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Subject, SubjectMaterial } from '../../types'
import { useGameification } from '../../hooks/useGameification'
import { useSubjectMaterials } from '../../hooks/useSubjectMaterials'
import { useAuth } from '../../hooks/useAuth'
import { SubjectCard } from './SubjectCard'
import { StudyMaterialsModal } from './StudyMaterialsModal'
import { LeaderboardWidget } from './LeaderboardWidget'
import { NewsWidget } from './NewsWidget'

interface SubjectsListProps {
  semesterId: string | null | undefined
}

export function SubjectsList({ semesterId }: SubjectsListProps) {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedMaterials, setSelectedMaterials] = useState<SubjectMaterial | undefined>()
  const [showMaterialsModal, setShowMaterialsModal] = useState(false)

  const { 
    userProgress, 
    leaderboard, 
    totalXP, 
    updateSubjectProgress,
    loading: gamificationLoading 
  } = useGameification(user?.id)

  useEffect(() => {
    if (semesterId) {
      fetchSubjects()
    }
  }, [semesterId])

  const fetchSubjects = async () => {
    if (!semesterId) return

    try {
      const { data, error } = await supabase
        .from('subjects')
        .select(`
          *,
          subject_materials (*)
        `)
        .eq('semester_id', semesterId)
        .order('name')

      if (error) throw error
      setSubjects(data || [])
    } catch (error) {
      console.error('Error fetching subjects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartStudy = async (subjectId: string) => {
    const currentProgress = userProgress.find(p => p.subject_id === subjectId)
    
    if (!currentProgress || currentProgress.status === 'not_started') {
      // Starting a new subject - give initial XP and set progress to 10%
      await updateSubjectProgress(subjectId, 'in_progress', 10, 10, 1)
    } else if (currentProgress.status === 'in_progress') {
      // Increment progress by 10%
      const newPercentage = Math.min(100, currentProgress.completion_percentage + 10)
      const newStatus = newPercentage === 100 ? 'completed' : 'in_progress'
      const xpGain = newPercentage - currentProgress.completion_percentage
      const newXP = currentProgress.xp_points + xpGain
      const newStreak = currentProgress.study_streak + 1
      
      await updateSubjectProgress(subjectId, newStatus, newPercentage, newXP, newStreak)
    }
  }

  const handleViewMaterials = (subject: Subject, materials?: SubjectMaterial) => {
    setSelectedSubject(subject)
    setSelectedMaterials(materials)
    setShowMaterialsModal(true)
  }

  const handleUpdateProgress = async (subjectId: string, status: 'in_progress' | 'completed', percentage: number) => {
    const currentProgress = userProgress.find(p => p.subject_id === subjectId)
    
    if (currentProgress) {
      // Calculate XP gain based on progress increase
      const progressIncrease = Math.max(0, percentage - currentProgress.completion_percentage)
      const xpGain = progressIncrease
      const newXP = currentProgress.xp_points + xpGain
      const newStreak = status === 'completed' ? currentProgress.study_streak + 1 : currentProgress.study_streak
      
      await updateSubjectProgress(subjectId, status, percentage, newXP, newStreak)
    } else {
      // New progress entry
      await updateSubjectProgress(subjectId, status, percentage, percentage, 1)
    }
  }

  if (loading || gamificationLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading subjects...</p>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading leaderboard...</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading news...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Subjects Grid */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BookOpen className="h-6 w-6 text-white mr-3" />
                <h3 className="text-lg font-semibold text-white">Your Subjects</h3>
              </div>
              <div className="text-white text-sm">
                {subjects.length} subjects • {subjects.reduce((sum, s) => sum + (s.credits || 0), 0)} total credits
              </div>
            </div>
          </div>

          <div className="p-6">
            {subjects.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No subjects found for this semester.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {subjects.map((subject) => {
                  const progress = userProgress.find(p => p.subject_id === subject.id)
                  const materials = subject.subject_materials?.[0]

                  return (
                    <SubjectCard
                      key={subject.id}
                      subject={subject}
                      progress={progress}
                      materials={materials}
                      onStartStudy={handleStartStudy}
                      onViewMaterials={handleViewMaterials}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Leaderboard */}
        <LeaderboardWidget leaderboard={leaderboard} userTotalXP={totalXP} />
        
        {/* News Widget */}
        <NewsWidget />
      </div>

      {/* Study Materials Modal */}
      <StudyMaterialsModal
        isOpen={showMaterialsModal}
        onClose={() => setShowMaterialsModal(false)}
        subject={selectedSubject!}
        materials={selectedMaterials}
        onUpdateProgress={handleUpdateProgress}
      />
    </div>
  )
}