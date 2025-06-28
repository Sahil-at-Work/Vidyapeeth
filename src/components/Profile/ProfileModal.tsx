import React, { useState, useEffect } from 'react'
import { X, User, Phone, Calendar, MapPin, Edit3, Save, Camera, GraduationCap, Lock, Unlock } from 'lucide-react'
import { UserProfile, ProfileFormData, University, Department, Semester } from '../../types'
import { useUserProfile } from '../../hooks/useUserProfile'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: UserProfile | null
  onProfileUpdate?: () => void
}

const AVATAR_OPTIONS = [
  {
    id: 'avatar1',
    name: 'Professional',
    url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: 'avatar2',
    name: 'Friendly',
    url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: 'avatar3',
    name: 'Creative',
    url: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: 'avatar4',
    name: 'Academic',
    url: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: 'avatar5',
    name: 'Modern',
    url: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  }
]

export function ProfileModal({ isOpen, onClose, profile, onProfileUpdate }: ProfileModalProps) {
  const { user, signOut } = useAuth()
  const { updateProfile, validatePrivateKey } = useUserProfile(user?.id)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSecretKeyDialog, setShowSecretKeyDialog] = useState(false)
  const [showAcademicUpdate, setShowAcademicUpdate] = useState(false)
  const [secretKey, setSecretKey] = useState('')
  const [secretKeyError, setSecretKeyError] = useState('')
  
  // Academic data
  const [universities, setUniversities] = useState<University[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [selectedUniversity, setSelectedUniversity] = useState<string>('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')
  const [selectedSemester, setSelectedSemester] = useState<string>('')
  
  const [formData, setFormData] = useState<ProfileFormData>({
    display_name: '',
    phone_number: '',
    date_of_birth: '',
    profile_image: 'avatar1',
    bio: '',
    location: ''
  })

  // Define functions before useEffect hooks
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
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('university_id', universityId)
        .order('name')

      if (error) throw error
      setDepartments(data || [])
      setSelectedDepartment('') // Reset department selection
      setSemesters([]) // Reset semesters
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const fetchSemesters = async (departmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('semesters')
        .select('*')
        .eq('department_id', departmentId)
        .order('number')

      if (error) throw error
      setSemesters(data || [])
      setSelectedSemester('') // Reset semester selection
    } catch (error) {
      console.error('Error fetching semesters:', error)
    }
  }

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        phone_number: profile.phone_number || '',
        date_of_birth: profile.date_of_birth || '',
        profile_image: profile.profile_image || 'avatar1',
        bio: profile.bio || '',
        location: profile.location || ''
      })
      
      // Set current academic selections
      setSelectedUniversity(profile.university_id || '')
      setSelectedDepartment(profile.department_id || '')
      setSelectedSemester(profile.semester_id || '')
    }
  }, [profile])

  useEffect(() => {
    if (showAcademicUpdate) {
      fetchUniversities()
    }
  }, [showAcademicUpdate])

  useEffect(() => {
    if (selectedUniversity) {
      fetchDepartments(selectedUniversity)
    }
  }, [selectedUniversity])

  useEffect(() => {
    if (selectedDepartment) {
      fetchSemesters(selectedDepartment)
    }
  }, [selectedDepartment])

  // Auto-dismiss error message after 2 seconds
  useEffect(() => {
    if (secretKeyError) {
      const timer = setTimeout(() => {
        setSecretKeyError('')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [secretKeyError])

  if (!isOpen) return null

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleUpdateAcademicClick = () => {
    setShowSecretKeyDialog(true)
    setSecretKey('')
    setSecretKeyError('')
  }

  const handleSecretKeySubmit = async () => {
    const result = await validatePrivateKey(secretKey)
    
    if (result.data === true) {
      setShowSecretKeyDialog(false)
      setShowAcademicUpdate(true)
      setSecretKeyError('')
      setSecretKey('')
    } else {
      setSecretKeyError('Invalid Private Key')
      setSecretKey('')
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const result = await updateProfile(formData)
      if (result && !result.error) {
        setIsEditing(false)
        if (onProfileUpdate) {
          onProfileUpdate()
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcademicUpdate = async () => {
    if (!selectedUniversity || !selectedDepartment || !selectedSemester) {
      alert('Please select University, Department, and Semester')
      return
    }

    setLoading(true)
    try {
      const result = await updateProfile({
        university_id: selectedUniversity,
        department_id: selectedDepartment,
        semester_id: selectedSemester
      })
      
      if (result && !result.error) {
        setShowAcademicUpdate(false)
        if (onProfileUpdate) {
          onProfileUpdate()
        }
        alert('Academic profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating academic profile:', error)
      alert('Failed to update academic profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    onClose()
  }

  const getSelectedAvatar = () => {
    return AVATAR_OPTIONS.find(avatar => avatar.id === formData.profile_image) || AVATAR_OPTIONS[0]
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getSemesterLabel = (number: number) => {
    const suffixes = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th']
    return `${number}${suffixes[number - 1]} Semester`
  }

  const getCurrentUniversityName = () => {
    const university = universities.find(u => u.id === profile?.university_id)
    return university?.name || 'Not set'
  }

  const getCurrentDepartmentName = () => {
    const department = departments.find(d => d.id === profile?.department_id)
    return department?.name || 'Not set'
  }

  const getCurrentSemesterName = () => {
    const semester = semesters.find(s => s.id === profile?.semester_id)
    return semester ? getSemesterLabel(semester.number) : 'Not set'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-6 w-6 text-white mr-3" />
              <h2 className="text-xl font-bold text-white">Profile Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Profile Image Section */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <img
                src={getSelectedAvatar().url}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mt-4">
              {formData.display_name || 'Your Name'}
            </h3>
            <p className="text-gray-600">Student</p>
          </div>

          {/* Academic Information Section */}
          <div className="mb-8 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <GraduationCap className="h-5 w-5 text-indigo-600 mr-2" />
                <h4 className="text-lg font-semibold text-gray-900">Academic Information</h4>
              </div>
              {!showAcademicUpdate && (
                <button
                  onClick={handleUpdateAcademicClick}
                  className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Update Academic Info
                </button>
              )}
            </div>

            {!showAcademicUpdate ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">University</p>
                  <p className="text-gray-900">{getCurrentUniversityName()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Department</p>
                  <p className="text-gray-900">{getCurrentDepartmentName()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Semester</p>
                  <p className="text-gray-900">{getCurrentSemesterName()}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Academic Update Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      University
                    </label>
                    <select
                      value={selectedUniversity}
                      onChange={(e) => setSelectedUniversity(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select University</option>
                      {universities.map((university) => (
                        <option key={university.id} value={university.id}>
                          {university.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      disabled={!selectedUniversity}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">Select Department</option>
                      {departments.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name} ({department.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Semester
                    </label>
                    <select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      disabled={!selectedDepartment}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">Select Semester</option>
                      {semesters.map((semester) => (
                        <option key={semester.id} value={semester.id}>
                          {getSemesterLabel(semester.number)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowAcademicUpdate(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAcademicUpdate}
                      disabled={loading || !selectedUniversity || !selectedDepartment || !selectedSemester}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Updating...' : 'Update Academic Info'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Avatar Selection (only in edit mode) */}
          {isEditing && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Profile Picture
              </label>
              <div className="grid grid-cols-5 gap-3">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => handleInputChange('profile_image', avatar.id)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                      formData.profile_image === avatar.id
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={avatar.url}
                      alt={avatar.name}
                      className="w-full h-16 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your display name"
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{formData.display_name || 'Not set'}</span>
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{formData.phone_number || 'Not set'}</span>
                </div>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{formatDate(formData.date_of_birth)}</span>
                </div>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your location"
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{formData.location || 'Not set'}</span>
                </div>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">{formData.bio || 'No bio added yet'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-200">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Secret Key Dialog */}
      {showSecretKeyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Your Private Key</h3>
              <p className="text-gray-600 text-sm">
                Please enter your personal private key to update your academic information. Contact support if you don't have your key.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-lg tracking-wider"
                  placeholder="Enter your private key"
                  onKeyPress={(e) => e.key === 'Enter' && handleSecretKeySubmit()}
                  autoFocus
                />
                {secretKeyError && (
                  <p className="text-red-600 text-sm mt-2 text-center font-medium">
                    {secretKeyError}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> Your private key is provided by the administrator. If you don't have it, please contact support.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowSecretKeyDialog(false)
                    setSecretKey('')
                    setSecretKeyError('')
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSecretKeySubmit}
                  className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center"
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}