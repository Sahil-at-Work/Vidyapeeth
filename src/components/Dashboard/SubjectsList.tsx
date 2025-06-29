import React, { useState, useEffect } from 'react'
import { BookOpen, Trophy, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Subject, SubjectMaterial } from '../../types'
import { useGameification } from '../../hooks/useGameification'
import { useSubjectMaterials } from '../../hooks/useSubjectMaterials'
import { useAuth } from '../../hooks/useAuth'
import { useUserProfile } from '../../hooks/useUserProfile'
import { SubjectCard } from './SubjectCard'
import { StudyMaterialsModal } from './StudyMaterialsModal'
import { LeaderboardWidget } from './LeaderboardWidget'
import { NewsWidget } from './NewsWidget'

interface SubjectsListProps {
  semesterId: string | null | undefined
}

export function SubjectsList({ semesterId }: SubjectsListProps) {
  const { user } = useAuth()
  const { profile } = useUserProfile(user?.id)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedMaterials, setSelectedMaterials] = useState<SubjectMaterial | undefined>()
  const [showMaterialsModal, setShowMaterialsModal] = useState(false)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [completionSubjectId, setCompletionSubjectId] = useState<string | null>(null)

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
    // Simply call updateSubjectProgress - it will handle XP and percentage automatically
    await updateSubjectProgress(subjectId, 'in_progress')
  }

  const handleViewMaterials = (subject: Subject, materials?: SubjectMaterial) => {
    setSelectedSubject(subject)
    setSelectedMaterials(materials)
    setShowMaterialsModal(true)
  }

  const handleShowCompletionDialog = (subjectId: string) => {
    setCompletionSubjectId(subjectId)
    setShowCompletionDialog(true)
  }

  const handleConfirmCompletion = async (confirm: boolean) => {
    setShowCompletionDialog(false)
    
    if (confirm && completionSubjectId) {
      // Mark as 100% completed - this will force completion
      await updateSubjectProgress(completionSubjectId, 'completed', 100, true)
    }
    
    setCompletionSubjectId(null)
  }

  const handleUpdateProgress = async (
    subjectId: string, 
    status: 'in_progress' | 'completed', 
    percentage: number, 
    gateCompleted?: boolean
  ) => {
    // Use the smart XP system for material interactions
    await updateSubjectProgress(subjectId, status, percentage, gateCompleted)
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
    <>
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
                        onShowCompletionDialog={handleShowCompletionDialog}
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
      </div>

      {/* Study Materials Modal - Only render when we have a valid subject */}
      {showMaterialsModal && selectedSubject && (
        <StudyMaterialsModal
          isOpen={showMaterialsModal}
          onClose={() => setShowMaterialsModal(false)}
          subject={selectedSubject}
          materials={selectedMaterials}
          profile={profile}
          onUpdateProgress={handleUpdateProgress}
        />
      )}

      {/* Subject Completion Confirmation Dialog */}
      {showCompletionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="mb-6">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">🎉 Ready to Complete! 🎉</h3>
              <p className="text-gray-600 leading-relaxed">
                You've reached 99% progress! Would you like to mark this subject as <strong>100% COMPLETED</strong>?
              </p>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm font-semibold text-yellow-800">Completion Rewards</span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>✨ Subject marked as mastered</li>
                <li>🏆 Achievement unlocked</li>
                <li>🎊 Celebration animation</li>
                <li>📈 Progress boost on leaderboard</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleConfirmCompletion(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Not Yet
              </button>
              <button
                onClick={() => handleConfirmCompletion(true)}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-medium flex items-center justify-center"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Complete Subject!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}