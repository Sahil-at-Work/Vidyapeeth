import React from 'react'
import { BookOpen, ExternalLink, FileText, Trophy, Zap } from 'lucide-react'
import { Subject, UserProgress, SubjectMaterial } from '../../types'

interface SubjectCardProps {
  subject: Subject
  progress?: UserProgress
  materials?: SubjectMaterial
  onStartStudy: (subjectId: string) => void
  onViewMaterials: (subject: Subject, materials?: SubjectMaterial) => void
}

export function SubjectCard({ 
  subject, 
  progress, 
  materials, 
  onStartStudy, 
  onViewMaterials 
}: SubjectCardProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      default:
        return 'Not Started'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{subject.name}</h3>
            <p className="text-sm text-gray-600">Code: {subject.code}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(progress?.status)}`}>
              {getStatusText(progress?.status)}
            </div>
            <div className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
              {subject.credits} credits
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {progress && progress.status !== 'not_started' && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium text-gray-900">
                {progress.completion_percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.completion_percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* XP and Streak */}
        {progress && (
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center">
              <Zap className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium text-gray-900">{progress.xp_points} XP</span>
            </div>
            {progress.study_streak > 0 && (
              <div className="flex items-center">
                <Trophy className="h-4 w-4 text-orange-500 mr-1" />
                <span className="text-sm font-medium text-gray-900">{progress.study_streak} day streak</span>
              </div>
            )}
          </div>
        )}

        {/* Materials Preview */}
        {materials && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700">Study materials available</span>
              </div>
              <div className="flex items-center space-x-2">
                {materials.syllabus && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" title="Syllabus available" />
                )}
                {materials.drive_link && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" title="Drive link available" />
                )}
                {materials.gate_questions && materials.gate_questions.length > 0 && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full" title="GATE questions available" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => onStartStudy(subject.id)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium text-sm"
          >
            {progress?.status === 'completed' ? 'Review' : progress?.status === 'in_progress' ? 'Continue' : 'Start Study'}
          </button>
          <button
            onClick={() => onViewMaterials(subject, materials)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Materials
          </button>
        </div>
      </div>
    </div>
  )
}