import React, { useState, useEffect } from 'react'
import { X, User, Phone, Calendar, MapPin, Edit3, Save, Camera } from 'lucide-react'
import { UserProfile, ProfileFormData } from '../../types'
import { useUserProfile } from '../../hooks/useUserProfile'
import { useAuth } from '../../hooks/useAuth'

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
  const { updateProfile } = useUserProfile(user?.id)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    display_name: '',
    phone_number: '',
    date_of_birth: '',
    profile_image: 'avatar1',
    bio: '',
    location: ''
  })

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
    }
  }, [profile])

  if (!isOpen) return null

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const result = await updateProfile(formData)
      if (result && !result.error) {
        setIsEditing(false)
        // Trigger a callback to refresh profile data in parent components
        if (onProfileUpdate) {
          onProfileUpdate()
        }
        // Show success feedback
        console.log('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
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
    </div>
  )
}