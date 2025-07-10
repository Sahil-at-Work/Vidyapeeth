import React, { useState } from 'react'
import { ChevronDown, ChevronRight, BookOpen, FileText, List, Dot } from 'lucide-react'

interface SyllabusSection {
  title: string
  topics: {
    title: string
    description?: string
    subtopics?: string[]
  }[]
}

interface SyllabusDisplayProps {
  subjectName: string
  subjectCode: string
  syllabusContent: string
}

export function SyllabusDisplay({ subjectName, subjectCode, syllabusContent }: SyllabusDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())

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

  // Parse markdown-style syllabus content into structured data
  const parseSyllabusContent = (content: string): SyllabusSection[] => {
    const sections: SyllabusSection[] = []
    const lines = content.split('\n').filter(line => line.trim())
    
    let currentSection: SyllabusSection | null = null
    let currentTopic: any = null
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // Section headers (## or ###)
      if (trimmedLine.match(/^#{2,3}\s+(.+)/)) {
        const title = trimmedLine.replace(/^#{2,3}\s+/, '').replace(/\*\*/g, '')
        if (title.toLowerCase().includes('unit') || title.toLowerCase().includes('section')) {
          if (currentSection) {
            sections.push(currentSection)
          }
          currentSection = { title, topics: [] }
          currentTopic = null
        }
      }
      // Topic headers (- ** or **)
      else if (trimmedLine.match(/^\*\*(.+)\*\*/) || trimmedLine.match(/^-\s*\*\*(.+)\*\*/)) {
        if (currentSection) {
          const title = trimmedLine.replace(/^-?\s*\*\*(.+)\*\*.*/, '$1')
          currentTopic = { title, subtopics: [] }
          currentSection.topics.push(currentTopic)
        }
      }
      // Subtopic items (- or *)
      else if (trimmedLine.match(/^[-*]\s+(.+)/) && currentTopic) {
        const subtopic = trimmedLine.replace(/^[-*]\s+/, '').replace(/\*\*/g, '')
        if (subtopic && !subtopic.toLowerCase().includes('unit') && !subtopic.toLowerCase().includes('section')) {
          currentTopic.subtopics.push(subtopic)
        }
      }
      // Description lines (italic text)
      else if (trimmedLine.match(/^\s*\*(.+)\*/) && currentTopic && currentSection) {
        const description = trimmedLine.replace(/^\s*\*(.+)\*/, '$1').trim()
        if (!currentTopic.description) {
          currentTopic.description = description
        }
      }
      // Regular content lines
      else if (trimmedLine && currentTopic && !trimmedLine.match(/^#{1,6}/)) {
        const cleanLine = trimmedLine.replace(/\*\*/g, '').replace(/^\s*-\s*/, '')
        if (cleanLine && cleanLine.length > 3) {
          currentTopic.subtopics.push(cleanLine)
        }
      }
    }
    
    if (currentSection) {
      sections.push(currentSection)
    }
    
    return sections
  }

  const sections = parseSyllabusContent(syllabusContent)

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6">
        <div className="flex items-center">
          <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{subjectName}</h2>
            <div className="flex items-center">
              <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-medium">
                {subjectCode}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {sections.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No structured syllabus content available.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(sectionIndex)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 transition-all duration-200 flex items-center justify-between text-left border-b border-gray-200"
                >
                  <div className="flex items-center">
                    <div className="bg-indigo-100 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-indigo-600 font-bold text-sm">{sectionIndex + 1}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full text-xs font-medium mr-3">
                      {section.topics.length} topics
                    </span>
                    {expandedSections.has(sectionIndex) ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
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
                            <div className="bg-purple-100 w-6 h-6 rounded-md flex items-center justify-center mr-3 flex-shrink-0">
                              <List className="h-3 w-3 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{topic.title}</h4>
                              {topic.description && (
                                <p className="text-sm text-gray-600 italic">{topic.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center ml-4">
                            {topic.subtopics && topic.subtopics.length > 0 && (
                              <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs font-medium mr-2">
                                {topic.subtopics.length} items
                              </span>
                            )}
                            {expandedTopics.has(`${sectionIndex}-${topicIndex}`) ? (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </button>

                        {/* Topic Content */}
                        {expandedTopics.has(`${sectionIndex}-${topicIndex}`) && topic.subtopics && topic.subtopics.length > 0 && (
                          <div className="px-6 pb-4 ml-9">
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border-l-4 border-purple-300">
                              <ul className="space-y-2">
                                {topic.subtopics.map((subtopic, subtopicIndex) => (
                                  <li key={subtopicIndex} className="flex items-start">
                                    <Dot className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700 text-sm leading-relaxed">{subtopic}</span>
                                  </li>
                                ))}
                              </ul>
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
        )}

        {/* Expand/Collapse All Controls */}
        {sections.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setExpandedSections(new Set(sections.map((_, i) => i)))}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
              >
                Expand All Sections
              </button>
              <button
                onClick={() => {
                  setExpandedSections(new Set())
                  setExpandedTopics(new Set())
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Collapse All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}