import React, { useState, useEffect } from 'react'
import { University, Department, Semester, Subject, UserSelection } from '../../types'
import { supabase } from '../../lib/supabase'
import { useUserProfile } from '../../hooks/useUserProfile'
import { UniversityStep } from './UniversityStep'
import { DepartmentStep } from './DepartmentStep'
import { SemesterStep } from './SemesterStep'
import { SubjectsStep } from './SubjectsStep'
import { ProgressIndicator } from './ProgressIndicator'

interface QuestionnaireFlowProps {
  userId: string
  onComplete: () => void
}

export function QuestionnaireFlow({ userId, onComplete }: QuestionnaireFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selection, setSelection] = useState<UserSelection>({
    university: null,
    department: null,
    semester: null,
    subjects: []
  })

  const [universities, setUniversities] = useState<University[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)

  const { createProfile } = useUserProfile(userId)

  useEffect(() => {
    fetchUniversities()
  }, [])

  const fetchUniversities = async () => {
    try {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .order('name')

      if (error) throw error
      setUniversities(data || [])
    } catch (error) {
      console.error('Error fetching universities:', error)
    }
  }

  const fetchDepartments = async (universityId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('university_id', universityId)
        .order('name')

      if (error) throw error
      setDepartments(data || [])
    } catch (error) {
      console.error('Error fetching departments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSemesters = async (departmentId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('semesters')
        .select('*')
        .eq('department_id', departmentId)
        .order('number')

      if (error) throw error
      setSemesters(data || [])
    } catch (error) {
      console.error('Error fetching semesters:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async (semesterId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('semester_id', semesterId)
        .order('name')

      if (error) throw error
      setSubjects(data || [])
      setSelection(prev => ({ ...prev, subjects: data || [] }))
    } catch (error) {
      console.error('Error fetching subjects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUniversitySelect = (university: University) => {
    setSelection(prev => ({
      ...prev,
      university,
      department: null,
      semester: null,
      subjects: []
    }))
    fetchDepartments(university.id)
    setCurrentStep(2)
  }

  const handleDepartmentSelect = (department: Department) => {
    setSelection(prev => ({
      ...prev,
      department,
      semester: null,
      subjects: []
    }))
    fetchSemesters(department.id)
    setCurrentStep(3)
  }

  const handleSemesterSelect = (semester: Semester) => {
    setSelection(prev => ({ ...prev, semester }))
    fetchSubjects(semester.id)
    setCurrentStep(4)
  }

  const handleComplete = async () => {
    if (!selection.university || !selection.department || !selection.semester) return

    setLoading(true)
    try {
      await createProfile({
        university_id: selection.university.id,
        department_id: selection.department.id,
        semester_id: selection.semester.id,
        profile_completed: true
      })
      
      onComplete()
    } catch (error) {
      console.error('Error completing profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome to Vidyapeeth</h1>
            <p className="text-blue-100">Let's set up your academic profile</p>
            <ProgressIndicator currentStep={currentStep} totalSteps={4} />
          </div>

          <div className="p-8">
            {currentStep === 1 && (
              <UniversityStep
                universities={universities}
                selectedUniversity={selection.university}
                onSelect={handleUniversitySelect}
                loading={loading}
              />
            )}

            {currentStep === 2 && (
              <DepartmentStep
                departments={departments}
                selectedDepartment={selection.department}
                selectedUniversity={selection.university}
                onSelect={handleDepartmentSelect}
                onBack={handleBack}
                loading={loading}
              />
            )}

            {currentStep === 3 && (
              <SemesterStep
                semesters={semesters}
                selectedSemester={selection.semester}
                selectedDepartment={selection.department}
                onSelect={handleSemesterSelect}
                onBack={handleBack}
                loading={loading}
              />
            )}

            {currentStep === 4 && (
              <SubjectsStep
                subjects={subjects}
                selection={selection}
                onComplete={handleComplete}
                onBack={handleBack}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600">
            © 2025 Sadguru Solutions. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}