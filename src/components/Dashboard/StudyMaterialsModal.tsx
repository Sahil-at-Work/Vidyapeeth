import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { X, FileText, ExternalLink, Brain, ChevronRight, CheckCircle, Trophy, Sparkles, BookOpen, Lock, Settings, Crown, Star, Unlock, ChevronDown, ChevronUp, Eye, EyeOff, ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import { EnhancedSyllabusDisplay } from './EnhancedSyllabusDisplay'
import { Subject, SubjectMaterial, GateQuestion, UserProfile, DPPChapter, RelatedPost, VideoChapter, VideoTopic } from '../../types'
import { supabase } from '../../lib/supabase'

interface StudyMaterialsModalProps {
  isOpen: boolean
  onClose: () => void
  subject: Subject
  materials?: SubjectMaterial
  profile?: UserProfile | null
  onUpdateProgress: (subjectId: string, status: 'in_progress' | 'completed', percentage: number, gateCompleted?: boolean) => void
}

export function StudyMaterialsModal({ 
  isOpen, 
  onClose, 
  subject, 
  materials,
  profile,
  onUpdateProgress 
}: StudyMaterialsModalProps) {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'materials' | 'questions' | 'dpp'>('syllabus')
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null)
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({})
  const [showResults, setShowResults] = useState(false)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [showGoldKeyDialog, setShowGoldKeyDialog] = useState(false)
  const [goldKey, setGoldKey] = useState('')
  const [goldKeyError, setGoldKeyError] = useState('')
  const [hasGoldAccess, setHasGoldAccess] = useState(false)
  const [validatingKey, setValidatingKey] = useState(false)
  const [showGoldKeyPassword, setShowGoldKeyPassword] = useState(false)
  const [expandedChapters, setExpandedChapters] = useState<{ [key: number]: boolean }>({})
  const [showGoldKey, setShowGoldKey] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Private key storage utilities
  const STORAGE_KEY = 'vidyapeeth_gold_key'
  const STORAGE_EXPIRY_DAYS = 4

  const savePrivateKeyToStorage = (key: string) => {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + STORAGE_EXPIRY_DAYS)
    
    const storageData = {
      key: key,
      expiry: expiryDate.getTime()
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData))
  }

  const getPrivateKeyFromStorage = () => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY)
      if (!storedData) return null
      
      const parsedData = JSON.parse(storedData)
      const now = new Date().getTime()
      
      // Check if key has expired
      if (now > parsedData.expiry) {
        localStorage.removeItem(STORAGE_KEY)
        return null
      }
      
      return parsedData.key
    } catch (error) {
      console.error('Error reading private key from storage:', error)
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
  }

  const clearPrivateKeyFromStorage = () => {
    localStorage.removeItem(STORAGE_KEY)
  }

  // Check for stored private key on component mount
  useEffect(() => {
    const storedKey = getPrivateKeyFromStorage()
    if (storedKey && profile?.id) {
      // Validate the stored key
      validateStoredKey(storedKey)
    }
  }, [profile?.id])

  const validateStoredKey = async (storedKey: string) => {
    if (!profile?.id) return
    
    try {
      const { data, error } = await supabase.rpc('validate_user_private_key', {
        p_user_id: profile.id,
        p_key: storedKey
      })

      if (error) {
        console.error('Error validating stored key:', error)
        clearPrivateKeyFromStorage()
        return
      }

      if (data === true) {
        setHasGoldAccess(true)
      } else {
        // Key is invalid, remove from storage
        clearPrivateKeyFromStorage()
      }
    } catch (error) {
      console.error('Exception validating stored key:', error)
      clearPrivateKeyFromStorage()
    }
  }
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [videoResources, setVideoResources] = useState<VideoChapter[]>([])
  const [expandedVideoChapters, setExpandedVideoChapters] = useState<Set<number>>(new Set())

  // Auto-dismiss error message after 2 seconds
  React.useEffect(() => {
    if (goldKeyError) {
      const timer = setTimeout(() => {
        setGoldKeyError('')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [goldKeyError])

  const handleQuestionAnswer = (questionIndex: number, answerIndex: number) => {
    setUserAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }))
  }

  const handleSubmitQuiz = () => {
    setShowResults(true)
    const correctAnswers = materials?.gate_questions?.filter((q, index) => 
      userAnswers[index] === q.correct_answer
    ).length || 0
    
    const totalQuestions = materials?.gate_questions?.length || 0
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
    
    // Check if all questions are answered correctly
    const allQuestionsCompleted = totalQuestions > 0 && correctAnswers === totalQuestions
    
    if (allQuestionsCompleted) {
      // Show completion confirmation dialog
      setShowCompletionDialog(true)
    } else {
      // Update progress but cap at 99% since GATE questions not fully completed
      onUpdateProgress(subject.id, 'in_progress', percentage, false)
    }
  }

  const handleConfirmCompletion = (confirm: boolean) => {
    setShowCompletionDialog(false)
    
    if (confirm) {
      // Mark as 100% completed
      onUpdateProgress(subject.id, 'completed', 100, true)
      onClose() // Close modal after completion
    } else {
      // Keep at 99% and allow more XP accumulation
      onUpdateProgress(subject.id, 'in_progress', 99, false)
    }
  }

  const handleDPPClick = (link: string) => {
    // Update progress when accessing DPP materials
    onUpdateProgress(subject.id, 'in_progress', 15)
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  const handleGoldKeySubmit = async () => {
    if (!goldKey.trim()) {
      setGoldKeyError('Please enter your GOLD membership private key')
      return
    }

    if (!profile?.id) {
      setGoldKeyError('User profile not found')
      return
    }

    setValidatingKey(true)
    setGoldKeyError('')

    try {
      // Call the Supabase function to validate the private key
      const { data, error } = await supabase.rpc('validate_user_private_key', {
        p_user_id: profile.id,
        p_key: goldKey.trim()
      })

      if (error) {
        console.error('Error validating private key:', error)
        setGoldKeyError('Error validating private key. Please try again.')
        return
      }

      if (data === true) {
        setHasGoldAccess(true)
        setShowGoldKeyDialog(false)
        setGoldKeyError('')
        
        // Save the key to local storage for 4 days
        savePrivateKeyToStorage(goldKey.trim())
        
        setGoldKey('')
      } else {
        setGoldKeyError('Invalid Private Key. Please check and try again.')
        setGoldKey('')
      }
    } catch (error) {
      console.error('Exception validating private key:', error)
      setGoldKeyError('Error validating private key. Please try again.')
    } finally {
      setValidatingKey(false)
    }
  }

  const handleKeyDialogClose = () => {
    setShowGoldKeyDialog(false)
    setGoldKey('')
    setGoldKeyError('')
    setValidatingKey(false)
  }

  const handleTopicClick = (topicIndex: number) => {
    setSelectedTopic(topicIndex)
    setCurrentSlide(0)
  }

  const handleSlideNavigation = (direction: 'prev' | 'next') => {
    if (selectedTopic === null) return
    
    const totalSlides = relatedPosts[selectedTopic].slides.length
    if (direction === 'prev') {
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
    } else {
      setCurrentSlide((prev) => (prev + 1) % totalSlides)
    }
  }

  const handleVaidnyanikClick = () => {
    window.open('https://sadguru-post.vercel.app', '_blank', 'noopener,noreferrer')
  }

  // Load related posts from materials
  useEffect(() => {
    if (materials?.related_posts) {
      setRelatedPosts(materials.related_posts)
    }
    if (materials?.video_resources) {
      setVideoResources(materials.video_resources)
    }
  }, [materials])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleVideoChapter = (chapterIndex: number) => {
    const newExpanded = new Set(expandedVideoChapters)
    if (newExpanded.has(chapterIndex)) {
      newExpanded.delete(chapterIndex)
    } else {
      newExpanded.add(chapterIndex)
    }
    setExpandedVideoChapters(newExpanded)
  }

  const handleVideoClick = (videoUrl: string) => {
    window.open(videoUrl, '_blank', 'noopener,noreferrer')
  }

  const getDifficultyGradient = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'from-green-400 to-emerald-500'
      case 'intermediate':
        return 'from-yellow-400 to-orange-500'
      case 'advanced':
        return 'from-red-400 to-pink-500'
      default:
        return 'from-gray-400 to-gray-500'
    }
  }

  const toggleChapter = (chapterIndex: number) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterIndex]: !prev[chapterIndex]
    }))
  }

  // Check if personal profile is completed (Name, Phone, DOB, Location, Bio)
  const isPersonalProfileCompleted = () => {
    if (!profile) return false
    
    const hasDisplayName = profile.display_name && profile.display_name.trim() !== ''
    const hasPhoneNumber = profile.phone_number && profile.phone_number.trim() !== ''
    const hasDateOfBirth = profile.date_of_birth && profile.date_of_birth.trim() !== ''
    const hasLocation = profile.location && profile.location.trim() !== ''
    const hasBio = profile.bio && profile.bio.trim() !== ''
    
    return hasDisplayName && hasPhoneNumber && hasDateOfBirth && hasLocation && hasBio
  }

  const getMissingFields = () => {
    if (!profile) return ['Name', 'Phone Number', 'Date of Birth', 'Location', 'Bio']
    
    const missing = []
    if (!profile.display_name || profile.display_name.trim() === '') missing.push('Name')
    if (!profile.phone_number || profile.phone_number.trim() === '') missing.push('Phone Number')
    if (!profile.date_of_birth || profile.date_of_birth.trim() === '') missing.push('Date of Birth')
    if (!profile.location || profile.location.trim() === '') missing.push('Location')
    if (!profile.bio || profile.bio.trim() === '') missing.push('Bio')
    
    return missing
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const allQuestionsAnsweredCorrectly = () => {
    const totalQuestions = materials?.gate_questions?.length || 0
    const correctAnswers = materials?.gate_questions?.filter((q, index) => 
      userAnswers[index] === q.correct_answer
    ).length || 0
    
    return totalQuestions > 0 && correctAnswers === totalQuestions
  }

  const isProfileCompleted = isPersonalProfileCompleted()
  const missingFields = getMissingFields()

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{subject.name}</h2>
                <p className="text-indigo-100 text-sm">Code: {subject.code} • {subject.credits} Credits</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <button
                onClick={() => setActiveTab('syllabus')}
                className={`px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'syllabus'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
                Syllabus
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'materials'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
                Study Materials
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'questions'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Brain className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
                GATE Questions ({materials?.gate_questions?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('dpp')}
                className={`px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap flex-shrink-0 relative ${
                  activeTab === 'dpp'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
                DPP Materials ({materials?.dpp_materials?.reduce((total, chapter) => total + chapter.dpps.length, 0) || 0})
                {!isProfileCompleted && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {activeTab === 'syllabus' && (
              <div className="space-y-6">
                <EnhancedSyllabusDisplay
                  syllabusData={materials?.syllabus_json ? JSON.parse(JSON.stringify(materials.syllabus_json)) : null}
                  fallbackContent={materials?.syllabus}
                />
              </div>
            )}

            {activeTab === 'materials' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Materials</h3>
                
                {/* Google Drive Resources */}
                {materials?.drive_link ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-blue-900 mb-2">Google Drive Resources</h4>
                        <p className="text-blue-700 text-sm">
                          Access comprehensive study materials, notes, and resources for {subject.name}.
                        </p>
                      </div>
                      <a
                        href={materials.drive_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        onClick={() => onUpdateProgress(subject.id, 'in_progress', 25)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Drive
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ExternalLink className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Study materials not available for this subject.</p>
                  </div>
                )}

                {/* Related Videos Section */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 w-6 h-6 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM5 8a1 1 0 011-1h1a1 1 0 010 2H6a1 1 0 01-1-1zm6 1a1 1 0 100 2h3a1 1 0 100-2H11z" />
                      </svg>
                    </div>
                    Related Videos
                  </h4>
                  
                  {videoResources.length === 0 ? (
                    <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM5 8a1 1 0 011-1h1a1 1 0 010 2H6a1 1 0 01-1-1zm6 1a1 1 0 100 2h3a1 1 0 100-2H11z" />
                        </svg>
                      </div>
                      <p className="text-gray-600">No video resources available for this subject.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {videoResources.map((chapter, chapterIndex) => (
                        <div key={chapterIndex} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                          {/* Chapter Header */}
                          <button
                            onClick={() => toggleVideoChapter(chapterIndex)}
                            className="w-full px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 flex items-center justify-between text-left border-b border-gray-100"
                          >
                            <div className="flex items-center">
                              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-10 h-10 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                <span className="text-white font-bold text-sm">{chapterIndex + 1}</span>
                              </div>
                              <div>
                                <h5 className="text-lg font-bold text-gray-900 mb-1">{chapter.chapter}</h5>
                                <p className="text-sm text-gray-600">{chapter.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                                {chapter.topics.length} videos
                              </div>
                              {expandedVideoChapters.has(chapterIndex) ? (
                                <ChevronUp className="h-5 w-5 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                              )}
                            </div>
                          </button>

                          {/* Chapter Content */}
                          {expandedVideoChapters.has(chapterIndex) && (
                            <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {chapter.topics.map((video, videoIndex) => (
                                  <div
                                    key={videoIndex}
                                    onClick={() => handleVideoClick(video.video_url)}
                                    className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
                                    style={{
                                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.boxShadow = `0 20px 25px -5px rgba(99, 102, 241, 0.3), 0 10px 10px -5px rgba(99, 102, 241, 0.1)`
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                    }}
                                  >
                                    {/* Video Thumbnail */}
                                    <div className="relative overflow-hidden">
                                      <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                                      />
                                      
                                      {/* Play Button Overlay */}
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                        <div className="bg-red-600 w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
                                          <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                          </svg>
                                        </div>
                                      </div>
                                      
                                      {/* Duration Badge */}
                                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                                        {video.duration}
                                      </div>
                                    </div>

                                    {/* Video Info */}
                                    <div className="p-4">
                                      <h6 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight">
                                        {video.title}
                                      </h6>
                                      <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                                        {video.description}
                                      </p>
                                      
                                      {/* Video Metadata */}
                                      <div className="flex items-center justify-between">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getDifficultyGradient(video.difficulty)} shadow-sm`}>
                                          {video.difficulty}
                                        </span>
                                        <div className="flex items-center text-xs text-gray-500">
                                          <Clock className="h-3 w-3 mr-1" />
                                          {video.duration}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Related Posts Section */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Related Posts</h4>
                  
                  {relatedPosts.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No related posts available for this subject.</p>
                    </div>
                  ) : selectedTopic === null ? (
                    /* Topic Selection View */
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {relatedPosts.map((topic, index) => (
                          <div
                            key={index}
                            onClick={() => handleTopicClick(index)}
                            className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 cursor-pointer hover:shadow-lg hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h5 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
                                {topic.title}
                              </h5>
                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                            </div>
                            <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors mb-4 leading-relaxed">
                              {topic.description}
                            </p>
                            
                            {/* Category and Difficulty Badges */}
                            <div className="flex items-center justify-between mb-3">
                              <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-medium">
                                {topic.category}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(topic.difficulty)}`}>
                                {topic.difficulty}
                              </span>
                            </div>
                            
                            {/* Stats */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center">
                                <Sparkles className="h-3 w-3 mr-1" />
                                {topic.slides.length} slides
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {topic.estimated_time}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Vaidnyanik Button */}
                      <div className="flex justify-center mt-6">
                        <button
                          onClick={handleVaidnyanikClick}
                          className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
                        >
                          <Sparkles className="h-5 w-5 mr-2" />
                          Vaidnyanik
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Slide View */
                    <div className="space-y-4">
                      {/* Back Button */}
                      <button
                        onClick={() => setSelectedTopic(null)}
                        className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Topics
                      </button>
                      
                      {/* Current Topic Title */}
                      <div className="text-center mb-6">
                        <h5 className="text-xl font-bold text-gray-900 mb-2">
                          {relatedPosts[selectedTopic].title}
                        </h5>
                        <p className="text-gray-600 mb-3">
                          {relatedPosts[selectedTopic].description}
                        </p>
                        <div className="flex items-center justify-center space-x-4">
                          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                            {relatedPosts[selectedTopic].category}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(relatedPosts[selectedTopic].difficulty)}`}>
                            {relatedPosts[selectedTopic].difficulty}
                          </span>
                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                            {relatedPosts[selectedTopic].estimated_time}
                          </span>
                        </div>
                      </div>
                      
                      {/* Slide Display */}
                      <div className="relative bg-white rounded-xl shadow-lg overflow-hidden border">
                        <div className="relative">
                          <img
                            src={relatedPosts[selectedTopic].slides[currentSlide].image}
                            alt={relatedPosts[selectedTopic].slides[currentSlide].title}
                            className="w-full h-80 object-cover"
                          />
                          
                          {/* Navigation Arrows */}
                          <button
                            onClick={() => handleSlideNavigation('prev')}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleSlideNavigation('next')}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                          
                          {/* Slide Counter */}
                          <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                            {currentSlide + 1} / {relatedPosts[selectedTopic].slides.length}
                          </div>
                        </div>
                        
                        {/* Slide Content */}
                        <div className="p-6">
                          <h6 className="text-lg font-semibold text-gray-900 mb-2">
                            {relatedPosts[selectedTopic].slides[currentSlide].title}
                          </h6>
                          <p className="text-gray-600">
                            {relatedPosts[selectedTopic].slides[currentSlide].description}
                          </p>
                          
                          {/* Key Points */}
                          {relatedPosts[selectedTopic].slides[currentSlide].key_points && (
                            <div className="mt-4">
                              <h6 className="text-sm font-semibold text-gray-700 mb-2">Key Points:</h6>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {relatedPosts[selectedTopic].slides[currentSlide].key_points.map((point, index) => (
                                  <div key={index} className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2 flex-shrink-0"></div>
                                    {point}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Slide Indicators */}
                      <div className="flex justify-center space-x-2 mt-4">
                        {relatedPosts[selectedTopic].slides.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                              index === currentSlide
                                ? 'bg-indigo-600'
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                      
                      {/* Vaidnyanik Button in Slide View */}
                      <div className="flex justify-center mt-6">
                        <button
                          onClick={handleVaidnyanikClick}
                          className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Vaidnyanik
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'questions' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">GATE Practice Questions</h3>
                  {materials?.gate_questions && materials.gate_questions.length > 0 && !showResults && (
                    <button
                      onClick={handleSubmitQuiz}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Submit Quiz
                    </button>
                  )}
                </div>

                {showResults && materials?.gate_questions && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Quiz Results</h4>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        Score: <span className={`font-bold ${getScoreColor(
                          Math.round((Object.values(userAnswers).filter((answer, index) => 
                            answer === materials.gate_questions[index]?.correct_answer
                          ).length / materials.gate_questions.length) * 100)
                        )}`}>
                          {Math.round((Object.values(userAnswers).filter((answer, index) => 
                            answer === materials.gate_questions[index]?.correct_answer
                          ).length / materials.gate_questions.length) * 100)}%
                        </span>
                      </span>
                      <span className="text-sm text-gray-600">
                        ({Object.values(userAnswers).filter((answer, index) => 
                          answer === materials.gate_questions[index]?.correct_answer
                        ).length}/{materials.gate_questions.length} correct)
                      </span>
                      {allQuestionsAnsweredCorrectly() && (
                        <div className="flex items-center text-green-600">
                          <Trophy className="h-4 w-4 mr-1" />
                          <span className="text-sm font-semibold">Perfect Score!</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {materials?.gate_questions && materials.gate_questions.length > 0 ? (
                  <div className="space-y-6">
                    {materials.gate_questions.map((question, questionIndex) => (
                      <div key={questionIndex} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-gray-900 flex-1">
                            {questionIndex + 1}. {question.question}
                          </h4>
                          <div className="flex items-center space-x-2 ml-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                              question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {question.difficulty}
                            </span>
                            <span className="text-xs text-gray-500">GATE {question.year}</span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          {question.options.map((option, optionIndex) => {
                            const isSelected = userAnswers[questionIndex] === optionIndex
                            const isCorrect = optionIndex === question.correct_answer
                            const showAnswer = showResults

                            return (
                              <button
                                key={optionIndex}
                                onClick={() => !showResults && handleQuestionAnswer(questionIndex, optionIndex)}
                                disabled={showResults}
                                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                  showAnswer
                                    ? isCorrect
                                      ? 'bg-green-50 border-green-200 text-green-800'
                                      : isSelected
                                        ? 'bg-red-50 border-red-200 text-red-800'
                                        : 'bg-gray-50 border-gray-200'
                                    : isSelected
                                      ? 'bg-blue-50 border-blue-300'
                                      : 'border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{String.fromCharCode(65 + optionIndex)}. {option}</span>
                                  {showAnswer && isCorrect && (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  )}
                                </div>
                              </button>
                            )
                          })}
                        </div>

                        {showResults && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-800">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>GATE questions not available for this subject.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'dpp' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Daily Practice Problems (DPP)</h3>
                  {(!isProfileCompleted || !hasGoldAccess) && (
                    <div className="flex items-center text-amber-600">
                      <Crown className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">GOLD Membership Required</span>
                    </div>
                  )}
                </div>

                {!isProfileCompleted ? (
                  <div className="text-center py-12">
                    <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Lock className="h-10 w-10 text-orange-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Complete Your Profile</h4>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Complete your personal profile to unlock access to Daily Practice Problems and enhance your Vidyapeeth Journey.
                    </p>
                    
                    {/* Missing Fields */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto mb-6">
                      <div className="flex items-center justify-center mb-2">
                        <Settings className="h-5 w-5 text-red-600 mr-2" />
                        <span className="text-sm font-semibold text-red-800">Missing Information:</span>
                      </div>
                      <ul className="text-sm text-red-700 space-y-1">
                        {missingFields.map((field, index) => (
                          <li key={index}>• {field}</li>
                        ))}
                      </ul>
                      <div className="mt-3">
                        <button
                          onClick={onClose}
                          className="text-sm text-red-600 hover:text-red-700 font-medium underline"
                        >
                          Go to Profile Settings to complete
                        </button>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 max-w-md mx-auto">
                      <div className="flex items-center justify-center mb-2">
                        <Sparkles className="h-5 w-5 text-orange-600 mr-2" />
                        <span className="text-sm font-semibold text-orange-800">What you'll unlock:</span>
                      </div>
                      <ul className="text-sm text-orange-700 space-y-1">
                        <li>• Daily Practice Problems for each subject</li>
                        <li>• Topic-wise problem sets</li>
                        <li>• Previous year question patterns</li>
                        <li>• Difficulty-graded problems</li>
                        <li>• Enhanced learning experience</li>
                      </ul>
                    </div>
                  </div>
                ) : !hasGoldAccess ? (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-r from-amber-100 to-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Crown className="h-10 w-10 text-amber-600" />
                    </div>
                    <h4 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
                      Upgrade to GOLD Membership
                    </h4>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Access exclusive Daily Practice Problems and premium features with GOLD membership.
                    </p>

                    {/* GOLD Membership Features */}
                    <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-2 border-gradient-to-r from-amber-200 to-orange-200 rounded-xl p-6 max-w-lg mx-auto mb-6">
                      <div className="flex items-center justify-center mb-4">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 w-10 h-10 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                          <Crown className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h5 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            GOLD Membership Features
                          </h5>
                          <p className="text-sm text-amber-700">Only ₹19 INR</p>
                        </div>
                        <span className="ml-auto bg-gradient-to-r from-amber-600 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          ₹19 INR
                        </span>
                      </div>
                      <ul className="space-y-3 text-sm text-amber-800">
                        <li className="flex items-center">
                          <Star className="h-4 w-4 text-amber-600 mr-3 flex-shrink-0" />
                          <span><strong>Exclusive Community</strong> - Connect with fellow students using the app</span>
                        </li>
                        <li className="flex items-center">
                          <Star className="h-4 w-4 text-amber-600 mr-3 flex-shrink-0" />
                          <span><strong>PRO Drive Access</strong> - Premium study materials, varied syllabuses & tests</span>
                        </li>
                        <li className="flex items-center">
                          <Star className="h-4 w-4 text-amber-600 mr-3 flex-shrink-0" />
                          <span><strong>Daily Practice Problems</strong> - Topic-wise DPPs for all subjects</span>
                        </li>
                        <li className="flex items-center">
                          <Star className="h-4 w-4 text-amber-600 mr-3 flex-shrink-0" />
                          <span><strong>Personalized Support</strong> - One-on-one guidance and assistance</span>
                        </li>
                        <li className="flex items-center">
                          <Star className="h-4 w-4 text-amber-600 mr-3 flex-shrink-0" />
                          <span><strong>Exclusive Goodies</strong> - Special rewards, badges & achievements</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={() => setShowGoldKeyDialog(true)}
                        className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white px-8 py-3 rounded-xl hover:from-amber-600 hover:via-orange-600 hover:to-yellow-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center mx-auto"
                      >
                        <Crown className="h-5 w-5 mr-2" />
                        Enter Private Key & Verify
                      </button>

                      <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
                        <div className="flex items-center mb-2">
                          <Crown className="h-4 w-4 text-amber-600 mr-2" />
                          <span className="text-sm font-semibold text-amber-800">How to Get GOLD Membership?</span>
                        </div>
                        <p className="text-amber-800 text-sm">
                          Contact our support team to upgrade to GOLD membership for just ₹19 INR and receive your private key instantly!
                        </p>
                      </div>
                    </div>
                  </div>
                ) : materials?.dpp_materials && materials.dpp_materials.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center">
                        <Crown className="h-5 w-5 text-amber-600 mr-2" />
                        <span className="text-sm font-semibold text-green-800">GOLD Membership Active! DPP Access Unlocked</span>
                      </div>
                    </div>
                    
                    {materials.dpp_materials.map((chapter, chapterIndex) => (
                      <div key={chapterIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Chapter Header */}
                        <button
                          onClick={() => toggleChapter(chapterIndex)}
                          className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4 flex items-center justify-between hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                        >
                          <div className="flex items-center">
                            <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                              <BookOpen className="h-4 w-4 text-white" />
                            </div>
                            <div className="text-left">
                              <h4 className="font-semibold text-gray-900">{chapter.chapter}</h4>
                              <p className="text-sm text-gray-600">{chapter.dpps.length} DPP{chapter.dpps.length !== 1 ? 's' : ''} available</p>
                            </div>
                          </div>
                          <div className="flex items-center text-blue-600">
                            {expandedChapters[chapterIndex] ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </div>
                        </button>

                        {/* Chapter DPPs */}
                        {expandedChapters[chapterIndex] && (
                          <div className="p-4 space-y-3 bg-white">
                            {chapter.dpps.map((dpp, dppIndex) => (
                              <div
                                key={dppIndex}
                                className="group bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200 cursor-pointer hover:from-blue-50 hover:to-indigo-50"
                                onClick={() => handleDPPClick(dpp.link)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="bg-indigo-600 w-6 h-6 rounded flex items-center justify-center mr-3 group-hover:bg-indigo-700 transition-colors">
                                      <span className="text-white text-xs font-bold">{dppIndex + 1}</span>
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-gray-900 group-hover:text-indigo-900 transition-colors">
                                        {dpp.title}
                                      </h5>
                                      <p className="text-xs text-gray-600">Click to access practice problems</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center text-indigo-600 group-hover:text-indigo-700 transition-colors">
                                    <ExternalLink className="h-4 w-4" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>DPP materials not available for this subject.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Confirmation Dialog */}
      {showCompletionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="mb-6">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">🎉 Excellent Work! 🎉</h3>
              <p className="text-gray-600 leading-relaxed">
                You've successfully completed all GATE questions for <strong>{subject.name}</strong>! 
                Would you like to mark this subject as <strong>100% COMPLETED</strong>?
              </p>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm font-semibold text-yellow-800">Completion Rewards</span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>✨ Subject marked as mastered</li>
                <li>🏆 Achievement unlocked</li>
                <li>🎊 Celebration animation</li>
                <li>📈 Progress boost on leaderboard</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleConfirmCompletion(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Not Yet
              </button>
              <button
                onClick={() => handleConfirmCompletion(true)}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-medium flex items-center justify-center"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Complete Subject!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GOLD Private Key Dialog - Higher z-index to appear on top */}
      {showGoldKeyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[80]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Enter Private Key & Verify
              </h3>
              <p className="text-gray-600 text-sm">
                Enter your GOLD membership private key to access Daily Practice Problems
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="goldKeyInput" className="block text-sm font-medium text-amber-700 mb-2">
                  Private Key (will be saved for 4 days)
                </label>
                <div className="relative">
                  <input
                    id="goldKeyInput"
                    type={showGoldKeyPassword ? 'text' : 'password'}
                    value={goldKey}
                    onChange={(e) => setGoldKey(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-center text-lg tracking-wider bg-gradient-to-r from-amber-50 to-orange-50 placeholder-amber-400"
                    placeholder="Enter your private key"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !validatingKey && goldKey.trim()) {
                        handleGoldKeySubmit()
                      }
                    }}
                    autoFocus
                    disabled={validatingKey}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    onClick={() => setShowGoldKeyPassword(!showGoldKeyPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-700 transition-colors p-1"
                    disabled={validatingKey}
                  >
                    {showGoldKeyPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {goldKeyError && (
                  <p className="text-red-600 text-sm mt-2 text-center font-medium">
                    {goldKeyError}
                  </p>
                )}
              </div>

              <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Crown className="h-4 w-4 text-amber-600 mr-2" />
                  <span className="text-sm font-semibold text-amber-800">GOLD Membership Benefits</span>
                </div>
                <p className="text-amber-800 text-sm mb-2">
                  Your private key will be securely saved in your browser for 4 days after successful verification.
                </p>
                <p className="text-amber-700 text-xs">
                  Contact support to upgrade to GOLD membership (₹19 INR) and receive your private key!
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleKeyDialogClose}
                  disabled={validatingKey}
                  className="flex-1 px-4 py-3 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGoldKeySubmit}
                  disabled={validatingKey || !goldKey.trim()}
                  className="flex-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white px-4 py-3 rounded-lg hover:from-amber-600 hover:via-orange-600 hover:to-yellow-600 transition-all duration-200 font-medium flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {validatingKey ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Verify & Continue
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}