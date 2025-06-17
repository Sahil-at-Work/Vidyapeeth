import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { X, FileText, ExternalLink, Brain, ChevronRight, CheckCircle } from 'lucide-react'
import { Subject, SubjectMaterial, GateQuestion } from '../../types'

interface StudyMaterialsModalProps {
  isOpen: boolean
  onClose: () => void
  subject: Subject
  materials?: SubjectMaterial
  onUpdateProgress: (subjectId: string, status: 'in_progress' | 'completed', percentage: number) => void
}

export function StudyMaterialsModal({ 
  isOpen, 
  onClose, 
  subject, 
  materials,
  onUpdateProgress 
}: StudyMaterialsModalProps) {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'materials' | 'questions'>('syllabus')
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null)
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({})
  const [showResults, setShowResults] = useState(false)

  if (!isOpen) return null

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
    
    // Update progress based on quiz performance
    if (percentage >= 80) {
      onUpdateProgress(subject.id, 'completed', 100)
    } else if (percentage >= 50) {
      onUpdateProgress(subject.id, 'in_progress', percentage)
    } else {
      onUpdateProgress(subject.id, 'in_progress', Math.max(25, percentage))
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
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
          <div className="flex">
            <button
              onClick={() => setActiveTab('syllabus')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'syllabus'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Syllabus
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'materials'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ExternalLink className="h-4 w-4 inline mr-2" />
              Study Materials
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'questions'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Brain className="h-4 w-4 inline mr-2" />
              GATE Questions ({materials?.gate_questions?.length || 0})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'syllabus' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Syllabus</h3>
              <div className="prose prose-slate max-w-none prose-headings:text-gray-900 prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4 prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-3 prose-h2:text-indigo-600 prose-h3:text-lg prose-h3:font-medium prose-h3:mb-2 prose-h3:text-gray-800 prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-strong:font-semibold prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:italic prose-ul:list-disc prose-ol:list-decimal prose-li:mb-1 prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-td:border prose-td:border-gray-300 prose-td:px-3 prose-td:py-2 prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {materials?.syllabus || 'Syllabus not available for this subject.'}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Materials</h3>
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
        </div>
      </div>
    </div>
  )
}