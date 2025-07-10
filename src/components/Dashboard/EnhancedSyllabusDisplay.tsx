import React, { useState } from 'react'
import { 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  Clock, 
  Star, 
  Target, 
  Award, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Zap,
  Brain,
  Lightbulb,
  FileText,
  BarChart3,
  Timer,
  Trophy,
  Sparkles
} from 'lucide-react'

interface SyllabusSection {
  section_number: number
  title: string
  description: string
  duration: string
  importance: 'high' | 'medium' | 'low'
  topics: {
    title: string
    description: string
    importance_level: 'high' | 'medium' | 'low'
    subtopics: string[]
  }[]
}

interface SyllabusData {
  subject_info: {
    name: string
    code: string
    level: string
    board: string
    total_duration: string
    exam_pattern: string
  }
  sections: SyllabusSection[]
  practical_work?: string[]
  assessment_pattern?: {
    theory_exam: {
      duration: string
      total_marks: number
      question_types: string[]
    }
    practical_exam: {
      duration: string
      total_marks: number
      components: string[]
    }
  }
}

interface EnhancedSyllabusDisplayProps {
  syllabusData: SyllabusData | null
  fallbackContent?: string
}

export function EnhancedSyllabusDisplay({ syllabusData, fallbackContent }: EnhancedSyllabusDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [showAssessment, setShowAssessment] = useState(false)
  const [showPractical, setShowPractical] = useState(false)

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedSections(newExpanded)
  }

  const toggleTopic = (sectionIndex: number, topicIndex: number) => {
    const topicKey = `${sectionIndex}-${topicIndex}`
    const newExpanded = new Set(expandedTopics)
    if (newExpanded.has(topicKey)) {
      newExpanded.delete(topicKey)
    } else {
      newExpanded.add(topicKey)
    }
    setExpandedTopics(newExpanded)
  }

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'high':
        return <Star className="h-4 w-4 text-red-500" />
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'from-red-500 to-pink-500'
      case 'medium':
        return 'from-yellow-500 to-orange-500'
      case 'low':
        return 'from-green-500 to-emerald-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getSectionGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-indigo-500 to-purple-600',
      'from-teal-500 to-cyan-600'
    ]
    return gradients[index % gradients.length]
  }

  if (!syllabusData || !syllabusData.subject_info) {
    return (
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-6">
          <div className="flex items-center">
            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Syllabus</h2>
              <p className="text-white/80">
                {!syllabusData ? 'Content not available in structured format' : 'Subject information is incomplete'}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {!syllabusData ? 'Syllabus data is not available in JSON format.' : 'Subject information is missing or incomplete.'}
            </p>
            {fallbackContent && (
              <div className="mt-4 text-left bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{fallbackContent}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const { subject_info, sections, practical_work, assessment_pattern } = syllabusData

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{subject_info.name}</h1>
                <div className="flex items-center space-x-4">
                  <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium">
                    {subject_info.code}
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium">
                    {subject_info.level}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center text-white mb-2">
                  <Clock className="h-5 w-5 mr-2" />
                  <span className="font-semibold">{subject_info.total_duration}</span>
                </div>
                <p className="text-white/80 text-sm">{subject_info.board}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 opacity-20">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <div className="absolute bottom-4 left-4 opacity-20">
          <Brain className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center">
            <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sections</p>
              <p className="font-bold text-gray-900">{sections.length}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Topics</p>
              <p className="font-bold text-gray-900">{sections.reduce((sum, section) => sum + section.topics.length, 0)}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
              <Trophy className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="font-bold text-gray-900">
                {sections.filter(s => s.importance === 'high').length} sections
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="bg-orange-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
              <Timer className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-bold text-gray-900">{subject_info.total_duration}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setExpandedSections(new Set(sections.map((_, i) => i)))}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Expand All
          </button>
          <button
            onClick={() => {
              setExpandedSections(new Set())
              setExpandedTopics(new Set())
            }}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Collapse All
          </button>
          {practical_work && (
            <button
              onClick={() => setShowPractical(!showPractical)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Practical Work
            </button>
          )}
          {assessment_pattern && (
            <button
              onClick={() => setShowAssessment(!showAssessment)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200"
            >
              <Award className="h-4 w-4 mr-2" />
              Assessment
            </button>
          )}
        </div>

        {/* Practical Work Section */}
        {showPractical && practical_work && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center mb-4">
              <div className="bg-green-500 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-green-800">Practical Work</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {practical_work.map((work, index) => (
                <div key={index} className="flex items-center bg-white rounded-lg p-3 shadow-sm">
                  <Zap className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{work}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assessment Pattern Section */}
        {showAssessment && assessment_pattern && (
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center mb-4">
              <div className="bg-purple-500 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                <Award className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-800">Assessment Pattern</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                  Theory Exam
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Duration:</span> {assessment_pattern.theory_exam.duration}</p>
                  <p><span className="font-medium">Total Marks:</span> {assessment_pattern.theory_exam.total_marks}</p>
                  <div>
                    <span className="font-medium">Question Types:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {assessment_pattern.theory_exam.question_types.map((type, index) => (
                        <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2 text-green-500" />
                  Practical Exam
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Duration:</span> {assessment_pattern.practical_exam.duration}</p>
                  <p><span className="font-medium">Total Marks:</span> {assessment_pattern.practical_exam.total_marks}</p>
                  <div>
                    <span className="font-medium">Components:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {assessment_pattern.practical_exam.components.map((component, index) => (
                        <span key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                          {component}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(sectionIndex)}
                className={`w-full px-6 py-5 bg-gradient-to-r ${getSectionGradient(sectionIndex)} hover:opacity-90 transition-all duration-200 flex items-center justify-between text-left`}
              >
                <div className="flex items-center">
                  <div className="bg-white/20 backdrop-blur-sm w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <span className="text-white font-bold text-lg">{section.section_number}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{section.title}</h3>
                    <p className="text-white/80 text-sm">{section.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-sm font-medium">{section.duration}</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center">
                    {getImportanceIcon(section.importance)}
                    <span className="text-white text-sm font-medium ml-1 capitalize">{section.importance}</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-sm font-medium">{section.topics.length} topics</span>
                  </div>
                  {expandedSections.has(sectionIndex) ? (
                    <ChevronDown className="h-6 w-6 text-white" />
                  ) : (
                    <ChevronRight className="h-6 w-6 text-white" />
                  )}
                </div>
              </button>

              {/* Section Content */}
              {expandedSections.has(sectionIndex) && (
                <div className="bg-white">
                  {section.topics.map((topic, topicIndex) => (
                    <div key={topicIndex} className="border-b border-gray-100 last:border-b-0">
                      {/* Topic Header */}
                      <button
                        onClick={() => toggleTopic(sectionIndex, topicIndex)}
                        className="w-full px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between text-left"
                      >
                        <div className="flex items-center flex-1">
                          <div className={`bg-gradient-to-r ${getImportanceColor(topic.importance_level)} w-8 h-8 rounded-lg flex items-center justify-center mr-4 shadow-sm`}>
                            <Brain className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1 text-lg">{topic.title}</h4>
                            <p className="text-gray-600 text-sm italic">{topic.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center ml-4 space-x-2">
                          <div className={`bg-gradient-to-r ${getImportanceColor(topic.importance_level)} px-3 py-1 rounded-full flex items-center`}>
                            {getImportanceIcon(topic.importance_level)}
                            <span className="text-white text-xs font-medium ml-1 capitalize">{topic.importance_level}</span>
                          </div>
                          <div className="bg-gray-100 px-3 py-1 rounded-full">
                            <span className="text-gray-600 text-xs font-medium">{topic.subtopics.length} items</span>
                          </div>
                          {expandedTopics.has(`${sectionIndex}-${topicIndex}`) ? (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Topic Content */}
                      {expandedTopics.has(`${sectionIndex}-${topicIndex}`) && (
                        <div className="px-6 pb-6 ml-12">
                          <div className={`bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border-l-4 border-gradient-to-b ${getImportanceColor(topic.importance_level)}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {topic.subtopics.map((subtopic, subtopicIndex) => (
                                <div key={subtopicIndex} className="flex items-start bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                  <div className={`bg-gradient-to-r ${getImportanceColor(topic.importance_level)} w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0`}></div>
                                  <span className="text-gray-700 text-sm leading-relaxed font-medium">{subtopic}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Exam Pattern Info */}
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-500 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-indigo-800">Exam Pattern</h3>
          </div>
          <p className="text-indigo-700 font-medium">{subject_info.exam_pattern}</p>
        </div>
      </div>
    </div>
  )
}