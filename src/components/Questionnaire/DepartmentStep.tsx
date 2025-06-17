import React from 'react'
import { BookOpen, ArrowLeft } from 'lucide-react'
import { Department, University } from '../../types'

interface DepartmentStepProps {
  departments: Department[]
  selectedDepartment: Department | null
  selectedUniversity: University | null
  onSelect: (department: Department) => void
  onBack: () => void
  loading: boolean
}

export function DepartmentStep({ 
  departments, 
  selectedDepartment, 
  selectedUniversity,
  onSelect, 
  onBack,
  loading 
}: DepartmentStepProps) {
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
          <h2 className="text-2xl font-bold text-gray-900">Select Your Department</h2>
          <p className="text-gray-600">
            Choose your department at {selectedUniversity?.name}
          </p>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-8 w-8 text-green-600" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading departments...</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {departments.map((department) => (
            <button
              key={department.id}
              onClick={() => onSelect(department)}
              className={`
                p-4 text-left border-2 rounded-xl transition-all hover:shadow-md
                ${selectedDepartment?.id === department.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{department.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">Code: {department.code}</p>
                </div>
                <div className={`
                  w-4 h-4 rounded-full border-2 transition-colors
                  ${selectedDepartment?.id === department.id
                    ? 'border-green-500 bg-green-500'
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