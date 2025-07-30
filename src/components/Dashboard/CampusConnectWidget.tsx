import React, { useState, useEffect } from 'react'
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  DollarSign,
  Building2,
  Clock,
  Eye,
  MessageCircle,
  Star,
  AlertCircle,
  Send,
  X,
  ExternalLink,
  Users,
  Award,
  Target,
  TrendingUp,
  CheckCircle,
  User
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useUserProfile } from '../../hooks/useUserProfile'

interface PlacementRecord {
  id: string
  company_name: string
  job_title: string
  job_description: string
  job_type: 'internship' | 'placement' | 'both'
  posting_date: string
  deadline: string
  salary_range: string | null
  location: string | null
  requirements: string | null
  application_link: string | null
  contact_email: string | null
  is_official: boolean
  posted_by: string
  views: number
  applications_count: number
  is_active: boolean
  created_at: string
  poster_name?: string
  poster_university?: string
  comments_count?: number
}

interface PlacementComment {
  id: string
  placement_id: string
  user_id: string
  content: string
  created_at: string
  user_name?: string
  user_university?: string
}

export function CampusConnectWidget() {
  const { user } = useAuth()
  const { profile } = useUserProfile(user?.id)
  const [placements, setPlacements] = useState<PlacementRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddPlacement, setShowAddPlacement] = useState(false)
  const [showPlacementDetail, setShowPlacementDetail] = useState(false)
  const [selectedPlacement, setSelectedPlacement] = useState<PlacementRecord | null>(null)
  const [comments, setComments] = useState<PlacementComment[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'internship' | 'placement' | 'official'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'deadline' | 'popular'>('recent')

  // Form states
  const [placementForm, setPlacementForm] = useState({
    company_name: '',
    job_title: '',
    job_description: '',
    job_type: 'placement' as 'internship' | 'placement' | 'both',
    deadline: '',
    salary_range: '',
    location: '',
    requirements: '',
    application_link: '',
    contact_email: '',
    is_official: true
  })
  const [commentContent, setCommentContent] = useState('')

  useEffect(() => {
    fetchPlacements()
  }, [filterBy, sortBy])

  const fetchPlacements = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('placement_records')
        .select(`
          *,
          users:posted_by (
            user_profiles (
              display_name,
              universities:university_id (name)
            )
          )
        `)
        .eq('is_active', true)

      // Apply filters
      if (filterBy === 'internship') {
        query = query.in('job_type', ['internship', 'both'])
      } else if (filterBy === 'placement') {
        query = query.in('job_type', ['placement', 'both'])
      } else if (filterBy === 'official') {
        query = query.eq('is_official', true)
      }

      // Apply sorting
      if (sortBy === 'recent') {
        query = query.order('posting_date', { ascending: false })
      } else if (sortBy === 'deadline') {
        query = query.order('deadline', { ascending: true })
      } else if (sortBy === 'popular') {
        query = query.order('views', { ascending: false })
      }

      const { data, error } = await query.limit(20)

      if (error) throw error
      
      // Transform data
      const transformedPlacements = (data || []).map(item => ({
        ...item,
        poster_name: item.users?.user_profiles?.display_name || 'Anonymous',
        poster_university: item.users?.user_profiles?.universities?.name || 'Unknown University'
      }))

      setPlacements(transformedPlacements)
    } catch (error) {
      console.error('Error fetching placements:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (placementId: string) => {
    try {
      const { data, error } = await supabase
        .from('placement_comments')
        .select(`
          *,
          users:user_id (
            user_profiles (
              display_name,
              universities:university_id (name)
            )
          )
        `)
        .eq('placement_id', placementId)
        .order('created_at', { ascending: true })

      if (error) throw error

      const transformedComments = (data || []).map(item => ({
        ...item,
        user_name: item.users?.user_profiles?.display_name || 'Anonymous',
        user_university: item.users?.user_profiles?.universities?.name || 'Unknown University'
      }))

      setComments(transformedComments)
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleAddPlacement = async () => {
    if (!user || !placementForm.company_name.trim() || !placementForm.job_title.trim() || !placementForm.deadline) {
      return
    }

    try {
      const { error } = await supabase
        .from('placement_records')
        .insert({
          ...placementForm,
          posted_by: user.id,
          deadline: new Date(placementForm.deadline).toISOString()
        })

      if (error) throw error

      setPlacementForm({
        company_name: '',
        job_title: '',
        job_description: '',
        job_type: 'placement',
        deadline: '',
        salary_range: '',
        location: '',
        requirements: '',
        application_link: '',
        contact_email: '',
        is_official: true
      })
      setShowAddPlacement(false)
      fetchPlacements()
    } catch (error) {
      console.error('Error posting placement:', error)
    }
  }

  const handleComment = async () => {
    if (!user || !selectedPlacement || !commentContent.trim()) return

    try {
      const { error } = await supabase
        .from('placement_comments')
        .insert({
          placement_id: selectedPlacement.id,
          user_id: user.id,
          content: commentContent.trim()
        })

      if (error) throw error

      setCommentContent('')
      fetchComments(selectedPlacement.id)
    } catch (error) {
      console.error('Error posting comment:', error)
    }
  }

  const openPlacementDetail = async (placement: PlacementRecord) => {
    setSelectedPlacement(placement)
    setShowPlacementDetail(true)
    await fetchComments(placement.id)
    
    // Increment view count
    try {
      await supabase.rpc('increment_placement_views', { placement_id: placement.id })
    } catch (error) {
      console.error('Error incrementing views:', error)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks}w ago`
  }

  const formatDeadline = (dateString: string) => {
    const deadline = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays < 0) return 'Expired'
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Tomorrow'
    if (diffInDays <= 7) return `${diffInDays} days left`
    
    return deadline.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: deadline.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const getJobTypeColor = (jobType: string) => {
    switch (jobType) {
      case 'internship':
        return 'bg-blue-100 text-blue-800'
      case 'placement':
        return 'bg-green-100 text-green-800'
      case 'both':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDeadlineColor = (dateString: string) => {
    const deadline = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays < 0) return 'text-red-600'
    if (diffInDays <= 3) return 'text-orange-600'
    if (diffInDays <= 7) return 'text-yellow-600'
    return 'text-green-600'
  }

  const filteredPlacements = placements.filter(placement =>
    placement.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    placement.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    placement.job_description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Briefcase className="h-6 w-6 text-white mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-white">Campus Connect</h3>
              <p className="text-indigo-100 text-sm">Placement & Internship Records</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddPlacement(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies, positions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="all">All Records</option>
              <option value="internship">Internships</option>
              <option value="placement">Placements</option>
              <option value="official">Official Only</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="recent">Recent</option>
              <option value="deadline">By Deadline</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading placement records...</p>
          </div>
        ) : filteredPlacements.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No placement records found. Be the first to add one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
            {filteredPlacements.map((placement) => (
              <div
                key={placement.id}
                onClick={() => openPlacementDetail(placement)}
                className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-indigo-300 hover:bg-gradient-to-br hover:from-indigo-50/50 hover:to-purple-50/50"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-indigo-900 transition-colors text-sm">
                          {placement.company_name}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-1">{placement.job_title}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {placement.is_official && (
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Official
                      </div>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(placement.job_type)}`}>
                      {placement.job_type.charAt(0).toUpperCase() + placement.job_type.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 text-xs line-clamp-2 mb-3">
                  {placement.job_description}
                </p>

                {/* Details */}
                <div className="space-y-2 mb-3">
                  {placement.location && (
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="line-clamp-1">{placement.location}</span>
                    </div>
                  )}
                  {placement.salary_range && (
                    <div className="flex items-center text-xs text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="line-clamp-1">{placement.salary_range}</span>
                    </div>
                  )}
                  <div className="flex items-center text-xs text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Posted {formatTimeAgo(placement.posting_date)}</span>
                  </div>
                  <div className={`flex items-center text-xs font-medium ${getDeadlineColor(placement.deadline)}`}>
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{formatDeadline(placement.deadline)}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center text-xs text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      <span>{placement.views}</span>
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      <span>{placement.comments_count || 0}</span>
                    </div>
                    <div className="flex items-center line-clamp-1">
                      <User className="h-3 w-3 mr-1" />
                      <span className="truncate">{placement.poster_name}</span>
                    </div>
                  </div>
                  {placement.application_link && (
                    <div className="flex items-center text-indigo-600 text-xs font-medium ml-2">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      <span>Apply Now</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Placement Modal */}
      {showAddPlacement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Add Placement Record</h3>
                <button
                  onClick={() => setShowAddPlacement(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={placementForm.company_name}
                    onChange={(e) => setPlacementForm(prev => ({ ...prev, company_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Google, Microsoft"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={placementForm.job_title}
                    onChange={(e) => setPlacementForm(prev => ({ ...prev, job_title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Software Engineer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  value={placementForm.job_description}
                  onChange={(e) => setPlacementForm(prev => ({ ...prev, job_description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Describe the role, responsibilities, and requirements..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type
                  </label>
                  <select
                    value={placementForm.job_type}
                    onChange={(e) => setPlacementForm(prev => ({ ...prev, job_type: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="placement">Placement</option>
                    <option value="internship">Internship</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    value={placementForm.deadline}
                    onChange={(e) => setPlacementForm(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    value={placementForm.salary_range}
                    onChange={(e) => setPlacementForm(prev => ({ ...prev, salary_range: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., ₹8-12 LPA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={placementForm.location}
                    onChange={(e) => setPlacementForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Bangalore, Remote"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Link
                </label>
                <input
                  type="url"
                  value={placementForm.application_link}
                  onChange={(e) => setPlacementForm(prev => ({ ...prev, application_link: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="https://company.com/careers/apply"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={placementForm.contact_email}
                  onChange={(e) => setPlacementForm(prev => ({ ...prev, contact_email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="hr@company.com"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_official"
                  checked={placementForm.is_official}
                  onChange={(e) => setPlacementForm(prev => ({ ...prev, is_official: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                />
                <label htmlFor="is_official" className="ml-2 text-sm text-gray-700">
                  Mark as official placement record
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAddPlacement(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPlacement}
                  disabled={!placementForm.company_name.trim() || !placementForm.job_title.trim() || !placementForm.deadline}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Post Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Placement Detail Modal */}
      {showPlacementDetail && selectedPlacement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedPlacement.company_name}</h3>
                  <p className="text-indigo-100 text-sm">{selectedPlacement.job_title}</p>
                </div>
                <button
                  onClick={() => setShowPlacementDetail(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {/* Placement Details */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Job Description</h4>
                      <p className="text-gray-700">{selectedPlacement.job_description}</p>
                    </div>
                    
                    {selectedPlacement.requirements && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                        <p className="text-gray-700">{selectedPlacement.requirements}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Details</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            Deadline: <span className={`font-medium ${getDeadlineColor(selectedPlacement.deadline)}`}>
                              {formatDeadline(selectedPlacement.deadline)}
                            </span>
                          </span>
                        </div>
                        
                        {selectedPlacement.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">Location: {selectedPlacement.location}</span>
                          </div>
                        )}
                        
                        {selectedPlacement.salary_range && (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">Salary: {selectedPlacement.salary_range}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">{selectedPlacement.views} views</span>
                        </div>
                      </div>
                    </div>

                    {(selectedPlacement.application_link || selectedPlacement.contact_email) && (
                      <div className="bg-indigo-50 rounded-lg p-4">
                        <h4 className="font-semibold text-indigo-900 mb-3">Apply Now</h4>
                        <div className="space-y-2">
                          {selectedPlacement.application_link && (
                            <a
                              href={selectedPlacement.application_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              <span className="text-sm font-medium">Application Link</span>
                            </a>
                          )}
                          
                          {selectedPlacement.contact_email && (
                            <a
                              href={`mailto:${selectedPlacement.contact_email}`}
                              className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              <span className="text-sm font-medium">{selectedPlacement.contact_email}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Comments ({comments.length})
                </h4>

                <div className="space-y-4 mb-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="bg-indigo-100 w-8 h-8 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-medium text-sm">
                              {comment.user_name?.charAt(0) || 'A'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{comment.user_name}</p>
                            <p className="text-xs text-gray-500">{comment.user_university}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{formatTimeAgo(comment.created_at)}</span>
                      </div>
                      
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>

                {/* Comment Form */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="Share your thoughts or ask questions..."
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleComment}
                      disabled={!commentContent.trim()}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}