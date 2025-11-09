import React, { useState, useRef, useEffect } from 'react'
import { X, Plus, Tag } from 'lucide-react'

interface SearchableTagsDropdownProps {
  selectedTags: string[]
  onChange: (tags: string[]) => void
  availableTags?: string[]
}

const DEFAULT_TAGS = [
  'Remote',
  'On-Site',
  'Hybrid',
  'Full-Time',
  'Part-Time',
  'Contract',
  'Product-Based',
  'Service-Based',
  'Startup',
  'MNC',
  'AI/ML',
  'Web Development',
  'Mobile Development',
  'Cloud Computing',
  'DevOps',
  'Data Science',
  'Cybersecurity',
  'Backend',
  'Frontend',
  'Full-Stack',
  'Urgent',
  'High Package',
  'No Bond',
  'Work from Home',
  'Flexible Hours'
]

export function SearchableTagsDropdown({ selectedTags, onChange, availableTags = DEFAULT_TAGS }: SearchableTagsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [customTag, setCustomTag] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const allTags = [...new Set([...availableTags, ...selectedTags])]
  const filteredTags = allTags.filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTags.includes(tag)
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
        setCustomTag('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const addTag = (tag: string) => {
    if (tag.trim() && !selectedTags.includes(tag.trim())) {
      onChange([...selectedTags, tag.trim()])
      setSearchTerm('')
      setCustomTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredTags.length > 0) {
        addTag(filteredTags[0])
      } else if (searchTerm.trim()) {
        addTag(searchTerm)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchTerm('')
    }
  }

  const handleAddCustomTag = () => {
    if (customTag.trim()) {
      addTag(customTag)
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tags
      </label>

      <div
        className="w-full min-h-[48px] px-4 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent cursor-text bg-white"
        onClick={() => {
          setIsOpen(true)
          inputRef.current?.focus()
        }}
      >
        <div className="flex flex-wrap gap-2 items-center">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeTag(tag)
                }}
                className="ml-2 hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setIsOpen(true)
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-[120px] outline-none text-sm"
            placeholder={selectedTags.length === 0 ? "Search or add tags..." : "Add more..."}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {filteredTags.length > 0 ? (
            <div className="py-2">
              {filteredTags.slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-indigo-50 transition-colors flex items-center"
                >
                  <Tag className="h-4 w-4 mr-2 text-gray-400" />
                  {tag}
                </button>
              ))}
            </div>
          ) : searchTerm.trim() ? (
            <div className="py-4 px-4">
              <button
                type="button"
                onClick={() => addTag(searchTerm)}
                className="w-full px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add "{searchTerm}"
              </button>
            </div>
          ) : (
            <div className="py-4 px-4 text-center text-sm text-gray-500">
              Type to search or add custom tags
            </div>
          )}

          {searchTerm.trim() === '' && filteredTags.length === 0 && (
            <div className="py-4 px-4 text-center text-sm text-gray-500">
              All available tags are selected
            </div>
          )}
        </div>
      )}
    </div>
  )
}
