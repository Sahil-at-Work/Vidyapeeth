import React from 'react'
import { GraduationCap, MapPin } from 'lucide-react'
import { University } from '../../types'

interface UniversityStepProps {
  universities: University[]
  selectedUniversity: University | null
  onSelect: (university: University) => void
  loading: boolean
}

export function UniversityStep({ 
  universities, 
  selectedUniversity, 
  onSelect, 
  loading 
}: UniversityStepProps) {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your University</h2>
        <p className="text-gray-600">Choose the university where you are currently studying</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading universities...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {universities.map((university) => (
            <button
              key={university.id}
              onClick={() => onSelect(university)}
              className={`
                w-full p-4 text-left border-2 rounded-xl transition-all hover:shadow-md
                ${selectedUniversity?.id === university.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{university.name}</h3>
                  {university.short_name && (
                    <p className="text-sm text-gray-600 mt-1">({university.short_name})</p>
                  )}
                  {university.location && (
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {university.location}
                    </div>
                  )}
                </div>
                <div className={`
                  w-4 h-4 rounded-full border-2 transition-colors
                  ${selectedUniversity?.id === university.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                  }
                `} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}