import React, { useState } from 'react'
import { User, BookOpen, GraduationCap, Calendar, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useUserProfile } from '../../hooks/useUserProfile'
import { DashboardStats } from './DashboardStats'
import { SubjectsList } from './SubjectsList'
import { ProfileModal } from '../Profile/ProfileModal'

const AVATAR_OPTIONS = [
  {
    id: 'avatar1',
    url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: 'avatar2',
    url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: 'avatar3',
    url: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: 'avatar4',
    url: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: 'avatar5',
    url: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  }
]

export function Dashboard() {
  const { user, signOut } = useAuth()
  const { profile, refetch } = useUserProfile(user?.id)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  const handleProfileUpdate = () => {
    // Refresh profile data to get the latest changes
    refetch()
  }

  const getProfileImage = () => {
    const selectedAvatar = AVATAR_OPTIONS.find(avatar => avatar.id === profile?.profile_image)
    return selectedAvatar?.url || AVATAR_OPTIONS[0].url
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Vidyapeeth
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img
                  src={getProfileImage()}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                />
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {profile?.display_name || 'Loading...'}
                  </p>
                  <p className="text-xs text-gray-500">Student</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Profile Settings"
                >
                  <Settings className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center">
            <img
              src={getProfileImage()}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border-4 border-white/20 mr-6"
            />
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {profile?.display_name?.split(' ')[0] || 'Student'}!
              </h2>
              <p className="text-blue-100">
                Ready to continue your academic journey? Here's your dashboard overview.
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats profile={profile} />

        {/* Subjects Section */}
        <div className="mt-8">
          <SubjectsList semesterId={profile?.semester_id} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600">
            © 2025 Sadguru Solutions. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={profile}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  )
}