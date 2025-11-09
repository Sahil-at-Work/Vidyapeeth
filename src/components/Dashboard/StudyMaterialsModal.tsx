import React, { useState } from 'react'
import { X, BookOpen, ExternalLink, FileText, Play, Download, Lightbulb, Video, CheckCircle, AlertCircle, Crown, Shield, FolderOpen, File, Lock, Unlock, Eye, EyeOff, Sparkles } from 'lucide-react'
import { Subject, SubjectMaterial, UserProfile } from '../../types'
import { EnhancedSyllabusDisplay } from './EnhancedSyllabusDisplay'
import { useSyllabusProgress } from '../../hooks/useSyllabusProgress'

interface StudyMaterialsModalProps {
  isOpen: boolean
  onClose: () => void
  subject: Subject
  materials?: SubjectMaterial
  profile: UserProfile | null
  onUpdateProgress?: (
    subjectId: string, 
    status: 'in_progress' | 'completed', 
    percentage: number, 
    gateCompleted?: boolean
  ) => void
}

export function StudyMaterialsModal({ 
  isOpen, 
  onClose, 
  subject, 
  materials, 
  profile,
  onUpdateProgress 
}: StudyMaterialsModalProps) {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'dpp' | 'videos' | 'posts' | 'tests' | 'resources' | 'premium'>('syllabus')
  
  // Practice test states
  const [selectedTest, setSelectedTest] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [showResults, setShowResults] = useState(false)
  const [testStarted, setTestStarted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  
  // Premium resources state
  const [resourcesUnlocked, setResourcesUnlocked] = useState(false)
  const [showPrivateKeyDialog, setShowPrivateKeyDialog] = useState(false)
  const [privateKey, setPrivateKey] = useState('')
  const [privateKeyError, setPrivateKeyError] = useState('')
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [premiumUnlocked, setPremiumUnlocked] = useState(false)
  
  const { 
    progress, 
    updateProgress, 
    getCompletionStatus 
  } = useSyllabusProgress(profile?.id, subject.id)

  // Timer effect for practice tests
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (testStarted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitTest()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [testStarted, timeRemaining])

  // Auto-dismiss private key error after 3 seconds
  React.useEffect(() => {
    if (privateKeyError) {
      const timer = setTimeout(() => {
        setPrivateKeyError('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [privateKeyError])

  if (!isOpen) return null

  const handleTabClick = (tab: 'syllabus' | 'dpp' | 'videos' | 'posts' | 'tests' | 'resources' | 'premium') => {
    // Only update progress for syllabus and dpp tabs
    if (tab === 'syllabus' || tab === 'dpp') {
      setActiveTab(tab)
      // Update progress when accessing materials
      if (onUpdateProgress) {
        onUpdateProgress(subject.id, 'in_progress', 0)
      }
    } else {
      // For other tabs, just set the active tab without progress updates
      setActiveTab(tab)
    }
  }

  const handleTestTabClick = () => {
    setActiveTab('tests')
    // Don't trigger progress updates for test tab
    
    // Update progress when accessing materials
    if (onUpdateProgress) {
      onUpdateProgress(subject.id, 'in_progress', 0)
    }
  }

  const handlePremiumResourcesClick = () => {
    if (resourcesUnlocked) {
      setActiveTab('resources')
    } else {
      setShowPrivateKeyDialog(true)
      setPrivateKey('')
      setPrivateKeyError('')
    }
  }

  const handlePrivateKeySubmit = () => {
    // Simple validation - in production, this should be more secure
    const validKeys = ['VIDYAPEETH_PREMIUM_2025', 'GOLD_MEMBER_2025', 'PREMIUM_ACCESS_2025']
    
    if (validKeys.includes(privateKey.trim())) {
      setResourcesUnlocked(true)
      setShowPrivateKeyDialog(false)
      setActiveTab('resources')
      setPrivateKeyError('')
      setPrivateKey('')
    } else {
      setPrivateKeyError('Invalid Private Key')
      setPrivateKey('')
    }
  }

  const startTest = (test: any) => {
    setSelectedTest(test)
    setCurrentQuestion(0)
    setAnswers({})
    setShowResults(false)
    setTestStarted(true)
    const durationMinutes = parseInt(test.duration.split(' ')[0])
    setTimeRemaining(durationMinutes * 60)
  }

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }))
  }

  const handleSubmitTest = () => {
    setTestStarted(false)
    setShowResults(true)
    // Ensure we stay on the tests tab to show results
    setActiveTab('tests')
    
    // Update progress when completing a test
    if (onUpdateProgress) {
      onUpdateProgress(subject.id, 'in_progress', 0)
    }
  }

  const calculateResults = () => {
    if (!selectedTest) return { correct: 0, wrong: 0, unattempted: 0, percentage: 0 }
    
    let correct = 0
    let wrong = 0
    let unattempted = 0
    
    selectedTest.questions.forEach((question: any, index: number) => {
      const userAnswer = answers[index]
      if (userAnswer === undefined) {
        unattempted++
      } else if (userAnswer === question.correct_answer) {
        correct++
      } else {
        wrong++
      }
    })
    
    const percentage = Math.round((correct / selectedTest.questions.length) * 100)
    return { correct, wrong, unattempted, percentage }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const resetTest = () => {
    setSelectedTest(null)
    setCurrentQuestion(0)
    setAnswers({})
    setShowResults(false)
    setTestStarted(false)
    setTimeRemaining(0)
    // Ensure we stay on the tests tab
    setActiveTab('tests')
  }

  const handleSyllabusProgressUpdate = async (
    sectionIndex: number,
    topicIndex?: number,
    subtopicIndex?: number,
    completed?: boolean
  ) => {
    await updateProgress(sectionIndex, topicIndex, subtopicIndex, completed)
    
    // Calculate overall completion percentage based on progress
    const totalItems = materials?.syllabus_json?.sections?.reduce((total: number, section: any) => {
      return total + section.topics.reduce((topicTotal: number, topic: any) => {
        return topicTotal + (topic.subtopics?.length || 0)
      }, 0)
    }, 0) || 0
    
    const completedItems = progress.filter(p => p.completed).length
    const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
    
    // Update subject progress
    if (onUpdateProgress) {
      const status = completionPercentage >= 100 ? 'completed' : 'in_progress'
      onUpdateProgress(subject.id, status, completionPercentage)
    }
  }

  const getCompletionStatusForSyllabus = () => {
    const statusMap: { [key: string]: boolean } = {}
    progress.forEach(item => {
      const key = `${item.section_index}-${item.topic_index || 'null'}-${item.subtopic_index || 'null'}`
      statusMap[key] = item.completed
    })
    return statusMap
  }

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-white" />
      case 'doc':
      case 'docx':
        return <FileText className="h-6 w-6 text-white" />
      case 'ppt':
      case 'pptx':
        return <FileText className="h-6 w-6 text-white" />
      default:
        return <File className="h-6 w-6 text-white" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'notes':
        return 'bg-blue-100 text-blue-800'
      case 'assignments':
        return 'bg-green-100 text-green-800'
      case 'reference':
        return 'bg-purple-100 text-purple-800'
      case 'practice':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[99998]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 relative">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{subject.name}</h2>
              <p className="text-indigo-100">Code: {subject.code} • {subject.credits} credits</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
{/* Navigation Tabs */}
        <div className="bg-gray-50 px-6 py-3 border-b">
          <div className="flex space-x-1">
            <button
              onClick={() => handleTabClick('syllabus')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'syllabus'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <BookOpen className="h-4 w-4 inline mr-2" />
              Syllabus
            </button>
            
            {materials?.dpp_materials && materials.dpp_materials.length > 0 && (
              <button
                onClick={() => handleTabClick('dpp')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'dpp'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                DPP Materials
              </button>
            )}
            
            {materials?.video_resources && materials.video_resources.length > 0 && (
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'videos'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Play className="h-4 w-4 mr-2" />
                Video Resources
              </button>
            )} {/* <--- This closing brace was missing! */}

            {/* Premium Resources Tab */}
            <button
              onClick={handlePremiumResourcesClick}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'resources' && resourcesUnlocked
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
              }`}
            >
              {resourcesUnlocked ? (
                <Crown className="h-4 w-4 mr-2" />
              ) : (
                <Lock className="h-4 w-4 mr-2" />
              )}
              Premium Resources
            </button>
            
            {materials?.related_posts && materials.related_posts.length > 0 && (
              <button
                onClick={() => setActiveTab('posts')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'posts'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Lightbulb className="h-4 w-4 inline mr-2" />
                Related Posts
              </button>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] relative z-10 bg-white">
          {/* Enhanced Syllabus Display */}
          {activeTab === 'syllabus' && (
            <EnhancedSyllabusDisplay
              syllabusData={materials?.syllabus_json}
              fallbackContent={materials?.syllabus}
              subjectId={subject.id}
              completionStatus={getCompletionStatusForSyllabus()}
              onUpdateProgress={handleSyllabusProgressUpdate}
            />
          )}

          {/* DPP Materials */}
          {activeTab === 'dpp' && materials?.dpp_materials && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Daily Practice Problems</h3>
                <p className="text-gray-600">Practice problems organized by chapters</p>
              </div>

              {materials.dpp_materials.map((chapter, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                    <h4 className="text-xl font-bold text-white">{chapter.chapter}</h4>
                    <p className="text-green-100">{chapter.dpps.length} practice sets available</p>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-3">
                      {chapter.dpps.map((dpp, dppIndex) => (
                        <a
                          key={dppIndex}
                          href={dpp.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-gray-50 hover:bg-green-50 rounded-lg transition-colors group"
                        >
                          <div className="flex items-center">
                            <div className="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors">
                              <FileText className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900 group-hover:text-green-900">
                                {dpp.title}
                              </h5>
                              <p className="text-sm text-gray-600">Practice Problem Set</p>
                            </div>
                          </div>
                          <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Video Resources */}
          {activeTab === 'videos' && materials?.video_resources && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Video Resources</h3>
                <p className="text-gray-600">Educational videos organized by chapters</p>
              </div>

              {materials.video_resources.map((chapter, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-4">
                    <h4 className="text-xl font-bold text-white">{chapter.chapter}</h4>
                    <p className="text-red-100">{chapter.description}</p>
                    <p className="text-red-100 text-sm mt-1">{chapter.topics.length} video topics</p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {chapter.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                          {/* Video Thumbnail */}
                          <div className="relative overflow-hidden">
                            <img
                              src={topic.thumbnail}
                              alt={topic.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
                              }}
                            />
                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                              <div className="bg-red-600 text-white w-16 h-16 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
                                <Play className="h-6 w-6 ml-1" />
                              </div>
                            </div>
                            {/* Duration Badge */}
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                              {topic.duration}
                            </div>
                          </div>
                          
                          {/* Video Info */}
                          <div className="p-4">
                            <h5 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                              {topic.title}
                            </h5>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                              {topic.description}
                            </p>
                            
                            {/* Video Meta */}
                            <div className="flex items-center justify-between">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                topic.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                                topic.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {topic.difficulty.charAt(0).toUpperCase() + topic.difficulty.slice(1)}
                              </span>
                              
                              <a
                                href={topic.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center text-sm font-medium shadow-md hover:shadow-lg"
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Watch
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Related Posts */}
          {activeTab === 'posts' && materials?.related_posts && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Related Posts</h3>
                <p className="text-gray-600">Additional learning resources and insights</p>
              </div>

              <div className="grid gap-6">
                {materials.related_posts.map((post, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
                      <h4 className="text-xl font-bold text-white mb-1">{post.title}</h4>
                      <p className="text-purple-100 text-sm">{post.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-white text-xs font-medium">
                          {post.category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          post.difficulty === 'beginner' ? 'bg-green-500/20 text-green-100' :
                          post.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-100' :
                          'bg-red-500/20 text-red-100'
                        }`}>
                          {post.difficulty}
                        </span>
                        <span className="text-purple-100 text-xs">
                          Est. time: {post.estimated_time}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {post.slides.map((slide, slideIndex) => (
                          <div key={slideIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <img
                                  src={slide.image}
                                  alt={slide.title}
                                  className="w-24 h-16 object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop'
                                  }}
                                />
                              </div>
                              <div className="flex-1 p-4">
                                <h5 className="font-semibold text-gray-900 mb-2">{slide.title}</h5>
                                <p className="text-sm text-gray-600 mb-2">{slide.description}</p>
                                <div className="space-y-1">
                                  {slide.key_points.slice(0, 2).map((point, pointIndex) => (
                                    <div key={pointIndex} className="flex items-start">
                                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                      <span className="text-xs text-gray-600">{point}</span>
                                    </div>
                                  ))}
                                  {slide.key_points.length > 2 && (
                                    <p className="text-xs text-gray-500 ml-3.5">
                                      +{slide.key_points.length - 2} more points
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Practice Tests */}
          {activeTab === 'tests' && materials?.practice_tests && (
            <div className="space-y-6">
              {!selectedTest ? (
                <>
                  <div className="text-center mb-8">
                    <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Practice Tests</h3>
                    <p className="text-gray-600">Test your knowledge with image-based questions</p>
                  </div>

                  <div className="grid gap-6">
                    {materials.practice_tests.map((test, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4">
                          <h4 className="text-xl font-bold text-white mb-1">{test.title}</h4>
                          <p className="text-orange-100 text-sm">{test.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-white text-xs font-medium">
                              {test.questions.length} Questions
                            </span>
                            <span className="bg-white/20 px-3 py-1 rounded-full text-white text-xs font-medium">
                              Duration: {test.duration}
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-gray-600 mb-2">
                                Ready to test your knowledge? This practice test contains {test.questions.length} image-based questions.
                              </p>
                              <p className="text-sm text-gray-500">
                                Time limit: {test.duration}
                              </p>
                            </div>
                            <button
                              onClick={() => startTest(test)}
                              className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 font-medium flex items-center"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Test
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : showResults ? (
                // Test Results
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">Test Completed!</h3>
                    <p className="text-gray-600">{selectedTest.title}</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {calculateResults().percentage}%
                      </div>
                      <p className="text-gray-600">Overall Score</p>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mb-6">
                      <div className="text-center">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-green-600">{calculateResults().correct}</div>
                        <p className="text-sm text-gray-600">Correct</p>
                      </div>
                      <div className="text-center">
                        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                          <X className="h-8 w-8 text-red-600" />
                        </div>
                        <div className="text-2xl font-bold text-red-600">{calculateResults().wrong}</div>
                        <p className="text-sm text-gray-600">Wrong</p>
                      </div>
                      <div className="text-center">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                          <AlertCircle className="h-8 w-8 text-gray-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-600">{calculateResults().unattempted}</div>
                        <p className="text-sm text-gray-600">Unattempted</p>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={resetTest}
                        className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        Back to Tests
                      </button>
                      <button
                        onClick={() => startTest(selectedTest)}
                        className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 font-medium"
                      >
                        Retake Test
                      </button>
                    </div>
                  </div>

                  {/* Detailed Results */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Question Review</h4>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {selectedTest.questions.map((question: any, index: number) => {
                        const userAnswer = answers[index]
                        const isCorrect = userAnswer === question.correct_answer
                        const isUnattempted = userAnswer === undefined
                        
                        return (
                          <div key={index} className={`p-4 rounded-lg border-2 ${
                            isUnattempted ? 'border-gray-300 bg-gray-50' :
                            isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                          }`}>
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-medium text-gray-900">Question {index + 1}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isUnattempted ? 'bg-gray-200 text-gray-700' :
                                isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                              }`}>
                                {isUnattempted ? 'Unattempted' : isCorrect ? 'Correct' : 'Wrong'}
                              </span>
                            </div>
                            <img
                              src={question.question_image}
                              alt={`Question ${index + 1}`}
                              className="w-full max-w-md mx-auto mb-3 rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
                              }}
                            />
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              {question.options.map((option: string, optionIndex: number) => (
                                <div key={optionIndex} className={`p-2 rounded text-sm ${
                                  optionIndex === question.correct_answer ? 'bg-green-100 text-green-800 font-medium' :
                                  optionIndex === userAnswer && userAnswer !== question.correct_answer ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {String.fromCharCode(65 + optionIndex)}. {option}
                                </div>
                              ))}
                            </div>
                            {question.explanation && (
                              <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                                <strong>Explanation:</strong> {question.explanation}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                // Test Interface
                <div className="max-w-4xl mx-auto">
                  {/* Test Header */}
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-t-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">{selectedTest.title}</h3>
                        <p className="text-orange-100">Question {currentQuestion + 1} of {selectedTest.questions.length}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{formatTime(timeRemaining)}</div>
                        <p className="text-orange-100 text-sm">Time Remaining</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-white px-6 py-2 border-x">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestion + 1) / selectedTest.questions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="bg-white p-6 border-x">
                    <div className="text-center mb-6">
                      <img
                        src={selectedTest.questions[currentQuestion].question_image}
                        alt={`Question ${currentQuestion + 1}`}
                        className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {selectedTest.questions[currentQuestion].options.map((option: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(currentQuestion, index)}
                          className={`p-4 text-left border-2 rounded-lg transition-all ${
                            answers[currentQuestion] === index
                              ? 'border-orange-500 bg-orange-50 text-orange-900'
                              : 'border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                          }`}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="bg-white p-6 rounded-b-xl border">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                        disabled={currentQuestion === 0}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentQuestion(Math.min(selectedTest.questions.length - 1, currentQuestion + 1))}
                          disabled={currentQuestion === selectedTest.questions.length - 1}
                          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {currentQuestion === selectedTest.questions.length - 1 ? 'Last Question' : 'Next'}
                        </button>
                        <button
                          onClick={handleSubmitTest}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                        >
                          Submit Test
                        </button>
                      </div>
                    </div>

                    {/* Question Navigation */}
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">Jump to question:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTest.questions.map((_: any, index: number) => (
                          <button
                            key={index}
                            onClick={() => setCurrentQuestion(index)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                              index === currentQuestion
                                ? 'bg-orange-600 text-white'
                                : answers[index] !== undefined
                                  ? 'bg-green-100 text-green-800 border border-green-300'
                                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Premium Resources */}
          {activeTab === 'resources' && resourcesUnlocked && materials?.premium_resources && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Resources</h3>
                <p className="text-gray-600">Exclusive study materials for premium members</p>
                {materials.premium_resources.access_note && (
                  <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 max-w-2xl mx-auto">
                    <div className="flex items-center justify-center mb-2">
                      <Shield className="h-5 w-5 text-amber-600 mr-2" />
                      <span className="font-semibold text-amber-800">Access Note</span>
                    </div>
                    <p className="text-amber-700 text-sm">{materials.premium_resources.access_note}</p>
                  </div>
                )}
              </div>

              {/* Google Drive Links */}
              {materials.premium_resources.drive_links && materials.premium_resources.drive_links.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-500 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                      <FolderOpen className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Google Drive Resources</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materials.premium_resources.drive_links.map((resource, index) => (
                      <div key={index} className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                          <div className="flex items-center justify-between">
                            <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center">
                              {getFileTypeIcon(resource.file_type)}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(resource.category)}`}>
                              {resource.category}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <h5 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {resource.title}
                          </h5>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                            {resource.description}
                          </p>
                          
                          <a
                            href={resource.drive_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center font-medium shadow-md hover:shadow-lg"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open in Drive
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PDF Files */}
              {materials.premium_resources.pdf_files && materials.premium_resources.pdf_files.length > 0 && (
                <div>
                  <div className="flex items-center mb-6">
                    <div className="bg-red-500 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">PDF Documents</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materials.premium_resources.pdf_files.map((resource, index) => (
                      <div key={index} className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="bg-gradient-to-r from-red-500 to-pink-600 p-4">
                          <div className="flex items-center justify-between">
                            <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center">
                              <FileText className="h-6 w-6 text-white" />
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(resource.category)}`}>
                              {resource.category}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <h5 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                            {resource.title}
                          </h5>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-3 leading-relaxed">
                            {resource.description}
                          </p>
                          
                          {/* File Info */}
                          <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                            {resource.file_size && (
                              <span className="flex items-center">
                                <File className="h-3 w-3 mr-1" />
                                {resource.file_size}
                              </span>
                            )}
                            {resource.pages && (
                              <span className="flex items-center">
                                <FileText className="h-3 w-3 mr-1" />
                                {resource.pages} pages
                              </span>
                            )}
                          </div>
                          
                          <a
                            href={resource.pdf_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center font-medium shadow-md hover:shadow-lg"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Last Updated Info */}
              {materials.premium_resources.last_updated && (
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(materials.premium_resources.last_updated).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Locked Premium Resources */}
          {activeTab === 'resources' && !resourcesUnlocked && (
            <div className="text-center py-16">
              <div className="bg-gradient-to-r from-gray-400 to-gray-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
                <Lock className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-500 mb-4">Premium Resources Locked</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Please enter your private key above to access exclusive study materials, drive links, and premium content.
              </p>
            </div>
          )}

          {/* About Vidyapeeth */}
          <div className="mt-8 p-8 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl border border-blue-200 shadow-sm relative z-20">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-900 mb-3">About Vidyapeeth</h4>
                <p className="text-gray-700 leading-relaxed text-base">
                  Vidyapeeth is a comprehensive educational platform designed to empower students with organized, accessible, and high-quality study resources. Our mission is to simplify the learning journey by providing structured syllabi, daily practice problems, curated notes, and interactive progress tracking. Whether you're preparing for exams or exploring new subjects, Vidyapeeth offers a personalized learning experience tailored to your academic needs. With features like gamification, leaderboards, and doubt resolution, we create an engaging environment that motivates students to achieve their full potential. Join thousands of learners who are transforming their education with Vidyapeeth.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Private Key Dialog */}
        {showPrivateKeyDialog && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Access Required</h3>
                <p className="text-gray-600 text-sm">Enter your private key to unlock premium resources</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={showPrivateKey ? 'text' : 'password'}
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="Enter your private key"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-12"
                    onKeyPress={(e) => e.key === 'Enter' && handlePrivateKeySubmit()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPrivateKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {privateKeyError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-red-700 text-sm">{privateKeyError}</span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPrivateKeyDialog(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePrivateKeySubmit}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-medium flex items-center justify-center"
                  >
                    <Unlock className="h-4 w-4 mr-2" />
                    Unlock
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Don't have a private key? Contact your instructor or administrator for access.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
