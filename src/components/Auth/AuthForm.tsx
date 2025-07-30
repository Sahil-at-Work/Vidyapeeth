import React, { useState } from 'react'
import { useEffect } from 'react'
import { User, Mail, Lock, Eye, EyeOff, UserCheck } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface AuthFormProps {
  onSuccess: () => void
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false)

  const { signIn, signUp } = useAuth()

  // Auto-login storage utilities
  const STORAGE_KEY = 'vidyapeeth_user_credentials'
  const STORAGE_EXPIRY_DAYS = 30 // Store for 30 days

  const saveCredentialsToStorage = (email: string, password: string) => {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + STORAGE_EXPIRY_DAYS)
    
    const storageData = {
      email: email,
      password: btoa(password), // Basic encoding (not encryption, but obfuscation)
      expiry: expiryDate.getTime()
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData))
  }

  const getCredentialsFromStorage = () => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY)
      if (!storedData) return null
      
      const parsedData = JSON.parse(storedData)
      const now = new Date().getTime()
      
      // Check if credentials have expired
      if (now > parsedData.expiry) {
        localStorage.removeItem(STORAGE_KEY)
        return null
      }
      
      return {
        email: parsedData.email,
        password: atob(parsedData.password) // Decode the password
      }
    } catch (error) {
      console.error('Error reading credentials from storage:', error)
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
  }

  const clearCredentialsFromStorage = () => {
    localStorage.removeItem(STORAGE_KEY)
  }

  // Auto-login on component mount
  useEffect(() => {
    const attemptAutoLogin = async () => {
      if (autoLoginAttempted) return
      
      const storedCredentials = getCredentialsFromStorage()
      if (storedCredentials) {
        setAutoLoginAttempted(true)
        setLoading(true)
        
        try {
          console.log('Attempting auto-login with stored credentials')
          const { error } = await signIn(storedCredentials.email, storedCredentials.password)
          
          if (error) {
            console.error('Auto-login failed:', error)
            // Clear invalid credentials
            clearCredentialsFromStorage()
            setError('Previous session expired. Please sign in again.')
          } else {
            console.log('Auto-login successful')
            onSuccess()
          }
        } catch (err) {
          console.error('Auto-login exception:', err)
          clearCredentialsFromStorage()
        } finally {
          setLoading(false)
        }
      } else {
        setAutoLoginAttempted(true)
      }
    }

    attemptAutoLogin()
  }, [signIn, onSuccess, autoLoginAttempted])

  // Pre-fill form with stored credentials
  useEffect(() => {
    if (autoLoginAttempted && !loading) {
      const storedCredentials = getCredentialsFromStorage()
      if (storedCredentials) {
        setEmail(storedCredentials.email)
        setPassword(storedCredentials.password)
      }
    }
  }, [autoLoginAttempted, loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('Form submitted:', { isLogin, email, name })
      
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password, name)

      if (error) {
        console.error('Auth error:', error)
        setError(error.message)
        // Clear credentials if login fails
        if (isLogin) {
          clearCredentialsFromStorage()
        }
      } else {
        console.log('Auth successful')
        // Save credentials to storage for future auto-login
        saveCredentialsToStorage(email, password)
        onSuccess()
      }
    } catch (err) {
      console.error('Auth exception:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        {/* Auto-login loading overlay */}
        {loading && !autoLoginAttempted && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Checking previous session...</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Vidyapeeth
            </h1>
            <p className="text-gray-600 mt-2">
              {isLogin ? 'Welcome back! Your credentials are saved for convenience.' : 'Create your account to get started'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
                <button
                  onClick={() => {
                    setError(null)
                    clearCredentialsFromStorage()
                    setEmail('')
                    setPassword('')
                  }}
                  className="text-red-500 hover:text-red-700 text-xs underline mt-1"
                >
                  Clear saved credentials
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setName('')
                setError(null)
                // Don't clear email/password when switching modes if they're from storage
              }}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
            
            {/* Clear credentials option */}
            <div className="mt-4">
              <button
                onClick={() => {
                  clearCredentialsFromStorage()
                  setEmail('')
                  setPassword('')
                  setError(null)
                }}
                className="text-gray-500 hover:text-gray-700 text-sm underline"
              >
                Use different credentials
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600">
            © 2025 Sadguru Solutions. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}