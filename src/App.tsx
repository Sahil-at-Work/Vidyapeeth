import React from 'react'
import { useAuth } from './hooks/useAuth'
import { useUserProfile } from './hooks/useUserProfile'
import { AuthForm } from './components/Auth/AuthForm'
import { QuestionnaireFlow } from './components/Questionnaire/QuestionnaireFlow'
import { Dashboard } from './components/Dashboard/Dashboard'

function App() {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useUserProfile(user?.id)

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - show auth form
  if (!user) {
    return <AuthForm onSuccess={() => {}} />
  }

  // Authenticated but profile not completed - show questionnaire
  if (!profile?.profile_completed) {
    return (
      <QuestionnaireFlow
        userId={user.id}
        onComplete={() => window.location.reload()}
      />
    )
  }

  // Authenticated with completed profile - show dashboard
  return <Dashboard />
}

export default App