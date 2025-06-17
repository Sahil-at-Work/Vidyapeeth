import React, { useState, useEffect } from 'react'
import { BookOpen, GraduationCap, Calendar, MapPin } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { UserProfile, University, Department, Semester } from '../../types'

interface DashboardStatsProps {
  profile: UserProfile | null
}

export function DashboardStats({ profile }: DashboardStatsProps) {
  const [university, setUniversity] = useState<University | null>(null)
  const [department, setDepartment] = useState<Department | null>(null)
  const [semester, setSemester] = useState<Semester | null>(null)
  const [subjectCount, setSubjectCount] = useState(0)

  useEffect(() => {
    if (profile) {
      fetchProfileDetails()
    }
  }, [profile])

  const fetchProfileDetails = async () => {
    if (!profile) return

    try {
      // Fetch university
      if (profile.university_id) {
        const { data: universityData } = await supabase
          .from('universities')
          .select('*')
          .eq('id', profile.university_id)
          .single()
        setUniversity(universityData)
      }

      // Fetch department
      if (profile.department_id) {
        const { data: departmentData } = await supabase
          .from('departments')
          .select('*')
          .eq('id', profile.department_id)
          .single()
        setDepartment(departmentData)
      }

      // Fetch semester
      if (profile.semester_id) {
        const { data: semesterData } = await supabase
          .from('semesters')
          .select('*')
          .eq('id', profile.semester_id)
          .single()
        setSemester(semesterData)

        // Fetch subject count
        const { data: subjects, count } = await supabase
          .from('subjects')
          .select('*', { count: 'exact' })
          .eq('semester_id', profile.semester_id)
        setSubjectCount(count || 0)
      }
    } catch (error) {
      console.error('Error fetching profile details:', error)
    }
  }

  const getSemesterLabel = (number: number) => {
    const suffixes = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th']
    return `${number}${suffixes[number - 1]} Semester`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* University Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center">
          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
            <GraduationCap className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">University</p>
            <p className="text-lg font-semibold text-gray-900">
              {university?.short_name || 'N/A'}
            </p>
            {university?.location && (
              <div className="flex items-center mt-1">
                <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                <span className="text-xs text-gray-500">{university.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Department Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center">
          <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
            <BookOpen className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Department</p>
            <p className="text-lg font-semibold text-gray-900">
              {department?.code || 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {department?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Semester Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center">
          <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
            <Calendar className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Current Semester</p>
            <p className="text-lg font-semibold text-gray-900">
              {semester ? getSemesterLabel(semester.number) : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Subjects Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center">
          <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
            <BookOpen className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Subjects</p>
            <p className="text-lg font-semibold text-gray-900">{subjectCount}</p>
          </div>
        </div>
      </div>
    </div>
  )
}