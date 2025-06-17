import React from 'react'
import { Calendar, ArrowLeft } from 'lucide-react'
import { Semester, Department } from '../../types'

interface SemesterStepProps {
  semesters: Semester[]
  selectedSemester: Semester | null
  selectedDepartment: Department | null
  onSelect: (semester: Semester) => void
  onBack: () => void
  loading: boolean
}

export function SemesterStep({ 
  semesters, 
  selectedSemester, 
  selectedDepartment,
  onSelect, 
  onBack,
  loading 
}: SemesterStepProps) {
  const getSemesterLabel = (number: number) => {
    const suffixes = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th']
    return `${number}${suffixes[number - 1]} Semester`
  }

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
          <h2 className="text-2xl font-bold text-gray-900">Select Your Semester</h2>
          <p className="text-gray-600">
            Choose your current semester in {selectedDepartment?.name}
          </p>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8 text-purple-600" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading semesters...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {semesters.map((semester) => (
            <button
              key={semester.id}
              onClick={() => onSelect(semester)}
              className={`
                p-4 text-center border-2 rounded-xl transition-all hover:shadow-md
                ${selectedSemester?.id === semester.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
                }
              `}
            >
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {semester.number}
              </div>
              <div className="text-sm text-gray-600">
                {getSemesterLabel(semester.number)}
              </div>
              
              {selectedSemester?.id === semester.id && (
                <div className="w-4 h-4 rounded-full bg-purple-500 mx-auto mt-2" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}