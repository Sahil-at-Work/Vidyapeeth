import React from 'react'
import { BookOpen, ArrowLeft, CheckCircle } from 'lucide-react'
import { Subject, UserSelection } from '../../types'

interface SubjectsStepProps {
  subjects: Subject[]
  selection: UserSelection
  onComplete: () => void
  onBack: () => void
  loading: boolean
}

export function SubjectsStep({ 
  subjects, 
  selection,
  onComplete, 
  onBack,
  loading 
}: SubjectsStepProps) {
  const totalCredits = subjects.reduce((sum, subject) => sum + (subject.credits || 0), 0)

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Subjects</h2>
          <p className="text-gray-600">
            Here are your subjects for {selection.semester?.number}
            {selection.semester?.number === 1 ? 'st' : 
             selection.semester?.number === 2 ? 'nd' : 
             selection.semester?.number === 3 ? 'rd' : 'th'} semester
          </p>
        </div>
      </div>

      <div className="text-center mb-6">
        <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-8 w-8 text-indigo-600" />
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl mb-6">
        <h3 className="text-lg font-semibold mb-2">Academic Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="opacity-90">University</p>
            <p className="font-medium">{selection.university?.short_name}</p>
          </div>
          <div>
            <p className="opacity-90">Department</p>
            <p className="font-medium">{selection.department?.code}</p>
          </div>
          <div>
            <p className="opacity-90">Semester</p>
            <p className="font-medium">{selection.semester?.number}</p>
          </div>
          <div>
            <p className="opacity-90">Total Credits</p>
            <p className="font-medium">{totalCredits}</p>
          </div>
        </div>
      </div>

      {/* Subjects List */}
      <div className="space-y-3 mb-8">
        {subjects.map((subject, index) => (
          <div
            key={subject.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{subject.name}</h4>
                <p className="text-sm text-gray-600 mt-1">Code: {subject.code}</p>
              </div>
              <div className="text-right">
                <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                  {subject.credits} credits
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Complete Button */}
      <button
        onClick={onComplete}
        disabled={loading}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Setting up your profile...
          </>
        ) : (
          <>
            <CheckCircle className="h-5 w-5 mr-2" />
            Complete Setup
          </>
        )}
      </button>
    </div>
  )
}