import React, { useState, useEffect } from 'react'
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Filter, 
  ThumbsUp, 
  MessageSquare, 
  Clock, 
  User,
  GraduationCap,
  BookOpen,
  Calendar,
  Send,
  X,
  CheckCircle,
  Star,
  Award,
  TrendingUp,
  Users,
  Eye,
  Heart,
  Reply,
  Zap,
  Trophy,
  Target,
  Crown,
  Sparkles,
  TrendingDown
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useUserProfile } from '../../hooks/useUserProfile'
import { Subject } from '../../types'

interface Doubt {
  id: string
  title: string
  description: string
  subject_name: string
  subject_code: string
  student_name: string
  university_name: string
  department_name: string
  semester_number: number
  created_at: string
  upvotes: number
  replies_count: number
  is_resolved: boolean
  tags: string[]
  user_id: string
  views: number
}

interface Reply {
  id: string
  doubt_id: string
  content: string
  student_name: string
  university_name: string
  department_name: string
  semester_number: number
  created_at: string
  upvotes: number
  is_best_answer: boolean
  user_id: string
}

interface DoubtsWidgetProps {
  subjects?: Subject[]
}

interface DoubtScore {
  id: string
  user_id: string
  total_score: number
  doubts_asked: number
  doubts_answered: number
  upvotes_received: number
  best_answers: number
  streak_days: number
  last_activity_date: string
  created_at: string
  updated_at: string
  user_name?: string
  user_university?: string
}

export function DoubtsWidget({ subjects = [] }: DoubtsWidgetProps) {
  const { user } = useAuth()
  const { profile } = useUserProfile(user?.id)
  const [doubts, setDoubts] = useState<Doubt[]>([])
  const [loading, setLoading] = useState(true)
  const [showAskDoubt, setShowAskDoubt] = useState(false)
  const [showDoubtDetail, setShowDoubtDetail] = useState(false)
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'resolved' | 'unresolved' | 'my-doubts'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent')
  const [showScoreboard, setShowScoreboard] = useState(false)
  const [topScorers, setTopScorers] = useState<DoubtScore[]>([])
  const [userScore, setUserScore] = useState<DoubtScore | null>(null)

  // Form states
  const [doubtForm, setDoubtForm] = useState({
    title: '',
    description: '',
    subject_id: '',
    tags: ''
  })
  const [replyContent, setReplyContent] = useState('')

  useEffect(() => {
    fetchDoubts()
    fetchScoreboardData()
  }, [filterBy, sortBy])

  const fetchDoubts = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('student_doubts')
        .select(`
          *,
          subjects:subject_id (name, code),
          user_profiles:user_id (
            display_name,
            universities(name),
            departments(name),
            semesters(number)
          )
        `)

      // Apply filters
      if (filterBy === 'resolved') {
        query = query.eq('is_resolved', true)
      } else if (filterBy === 'unresolved') {
        query = query.eq('is_resolved', false)
      } else if (filterBy === 'my-doubts' && user) {
        query = query.eq('user_id', user.id)
      }

      // Apply sorting
      if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false })
      } else if (sortBy === 'popular') {
        query = query.order('upvotes', { ascending: false })
      } else if (sortBy === 'trending') {
        query = query.order('views', { ascending: false })
      }

      const { data, error } = await query.limit(20)

      if (error) throw error
      
      // Transform data to match our interface
      const transformedDoubts = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        subject_name: item.subjects?.name || 'Unknown Subject',
        subject_code: item.subjects?.code || 'N/A',
        student_name: item.user_profiles?.display_name || 'Anonymous',
        university_name: item.user_profiles?.universities?.name || 'Unknown University',
        department_name: item.user_profiles?.departments?.name || 'Unknown Department',
        semester_number: item.user_profiles?.semesters?.number || 0,
        created_at: item.created_at,
        upvotes: item.upvotes || 0,
        replies_count: item.replies_count || 0,
        is_resolved: item.is_resolved || false,
        tags: item.tags || [],
        user_id: item.user_id,
        views: item.views || 0
      }))

      setDoubts(transformedDoubts)
    } catch (error) {
      console.error('Error fetching doubts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchScoreboardData = async () => {
    try {
      // Fetch top scorers
      const { data: topScorersData, error: topScorersError } = await supabase
        .from('doubt_scores')
        .select(`
          *,
          users:user_id (
            user_profiles (
              display_name,
              universities:university_id (name)
            )
          )
        `)
        .order('total_score', { ascending: false })
        .limit(10)

      if (topScorersError) throw topScorersError

      const transformedTopScorers = (topScorersData || []).map(item => ({
        ...item,
        user_name: item.users?.user_profiles?.display_name || 'Anonymous',
        user_university: item.users?.user_profiles?.universities?.name || 'Unknown University'
      }))

      setTopScorers(transformedTopScorers)

      // Fetch current user's score
      if (user) {
        const { data: userScoreData, error: userScoreError } = await supabase
          .from('doubt_scores')
          .select(`
            *,
            users:user_id (
              user_profiles (
                display_name,
                universities:university_id (name)
              )
            )
          `)
          .eq('user_id', user.id)
          .single()

        if (!userScoreError && userScoreData) {
          const transformedUserScore = {
            ...userScoreData,
            user_name: userScoreData.users?.user_profiles?.display_name || 'You',
            user_university: userScoreData.users?.user_profiles?.universities?.name || 'Unknown University'
          }
          setUserScore(transformedUserScore)
        }
      }
    } catch (error) {
      console.error('Error fetching scoreboard data:', error)
    }
  }

  const fetchReplies = async (doubtId: string) => {
    try {
      const { data, error } = await supabase
        .from('doubt_replies')
        .select(`
          *,
          user_profiles:user_id (
            display_name,
            universities(name),
            departments(name),
            semesters(number)
          )
        `)
        .eq('doubt_id', doubtId)
        .order('created_at', { ascending: true })

      if (error) throw error

      const transformedReplies = (data || []).map(item => ({
        id: item.id,
        doubt_id: item.doubt_id,
        content: item.content,
        student_name: item.user_profiles?.display_name || 'Anonymous',
        university_name: item.user_profiles?.universities?.name || 'Unknown University',
        department_name: item.user_profiles?.departments?.name || 'Unknown Department',
        semester_number: item.user_profiles?.semesters?.number || 0,
        created_at: item.created_at,
        upvotes: item.upvotes || 0,
        is_best_answer: item.is_best_answer || false,
        user_id: item.user_id
      }))

      setReplies(transformedReplies)
    } catch (error) {
      console.error('Error fetching replies:', error)
    }
  }

  const handleAskDoubt = async () => {
    if (!user || !profile || !doubtForm.title.trim() || !doubtForm.description.trim() || !doubtForm.subject_id) {
      console.error('Missing required fields:', {
        user: !!user,
        profile: !!profile,
        title: doubtForm.title.trim(),
        description: doubtForm.description.trim(),
        subject_id: doubtForm.subject_id
      })
      return
    }

    try {
      console.log('Inserting doubt with subject_id:', doubtForm.subject_id)
      const { error } = await supabase
        .from('student_doubts')
        .insert({
          user_id: user.id,
          subject_id: doubtForm.subject_id,
          title: doubtForm.title.trim(),
          description: doubtForm.description.trim(),
          tags: doubtForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        })

      if (error) throw error

      setDoubtForm({ title: '', description: '', subject_id: '', tags: '' })
      setShowAskDoubt(false)
      fetchDoubts()
      fetchScoreboardData() // Refresh scores after asking a doubt
    } catch (error) {
      console.error('Error posting doubt:', error)
    }
  }

  const handleReply = async () => {
    if (!user || !selectedDoubt || !replyContent.trim()) return

    try {
      const { error } = await supabase
        .from('doubt_replies')
        .insert({
          doubt_id: selectedDoubt.id,
          user_id: user.id,
          content: replyContent.trim()
        })

      if (error) throw error

      setReplyContent('')
      fetchReplies(selectedDoubt.id)
      fetchDoubts() // Refresh to update reply count
      fetchScoreboardData() // Refresh scores after replying
    } catch (error) {
      console.error('Error posting reply:', error)
    }
  }

  const handleUpvote = async (doubtId: string, type: 'doubt' | 'reply', replyId?: string) => {
    if (!user) return

    try {
      if (type === 'doubt') {
        await supabase.rpc('upvote_doubt', { doubt_id: doubtId, user_id: user.id })
      } else if (replyId) {
        await supabase.rpc('upvote_reply', { reply_id: replyId, user_id: user.id })
      }
      
      if (type === 'doubt') {
        fetchDoubts()
      } else {
        fetchReplies(doubtId)
      }
      fetchScoreboardData() // Refresh scores after upvoting
    } catch (error) {
      console.error('Error upvoting:', error)
    }
  }

  const openDoubtDetail = async (doubt: Doubt) => {
    setSelectedDoubt(doubt)
    setShowDoubtDetail(true)
    await fetchReplies(doubt.id)
    
    // Increment view count
    try {
      await supabase.rpc('increment_doubt_views', { doubt_id: doubt.id })
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

  const getSemesterLabel = (number: number) => {
    const suffixes = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th']
    return `${number}${suffixes[number - 1]} Sem`
  }

  const filteredDoubts = doubts.filter(doubt =>
    doubt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doubt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doubt.subject_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageCircle className="h-6 w-6 text-white mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-white">Student Doubts</h3>
              <p className="text-emerald-100 text-sm">Ask questions, help peers learn</p>
            </div>
          </div>
          <button
            onClick={() => setShowAskDoubt(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ask Doubt
          </button>
          <button
            onClick={() => setShowScoreboard(!showScoreboard)}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Scoreboard
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
              placeholder="Search doubts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            >
              <option value="all">All Doubts</option>
              <option value="unresolved">Unresolved</option>
              <option value="resolved">Resolved</option>
              <option value="my-doubts">My Doubts</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            >
              <option value="recent">Recent</option>
              <option value="popular">Popular</option>
              <option value="trending">Trending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Scoreboard Section */}
        {showScoreboard && (
          <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-yellow-500 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-yellow-800">Doubts Scoreboard</h4>
                  <p className="text-yellow-700 text-sm">Top contributors in the community</p>
                </div>
              </div>
              <button
                onClick={() => setShowScoreboard(false)}
                className="text-yellow-600 hover:text-yellow-800 p-2 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User's Score Card */}
            {userScore && (
              <div className="mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h5 className="font-bold text-lg">Your Score</h5>
                      <p className="text-blue-100 text-sm">{userScore.user_university}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{userScore.total_score}</div>
                    <p className="text-blue-100 text-sm">Total Points</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/20">
                  <div className="text-center">
                    <div className="text-xl font-bold">{userScore.doubts_asked}</div>
                    <p className="text-blue-100 text-xs">Asked</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{userScore.doubts_answered}</div>
                    <p className="text-blue-100 text-xs">Answered</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{userScore.upvotes_received}</div>
                    <p className="text-blue-100 text-xs">Upvotes</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{userScore.best_answers}</div>
                    <p className="text-blue-100 text-xs">Best Answers</p>
                  </div>
                </div>
              </div>
            )}

            {/* Top Scorers List */}
            <div className="space-y-3">
              <h5 className="font-semibold text-yellow-800 mb-3">🏆 Top Contributors</h5>
              {topScorers.slice(0, 5).map((scorer, index) => {
                const isCurrentUser = user && scorer.user_id === user.id
                const rankColors = [
                  'from-yellow-400 to-yellow-600', // 1st - Gold
                  'from-gray-400 to-gray-600',     // 2nd - Silver
                  'from-orange-400 to-orange-600', // 3rd - Bronze
                  'from-blue-400 to-blue-600',     // 4th+
                  'from-purple-400 to-purple-600'  // 5th+
                ]
                const rankIcons = [
                  <Crown className="h-4 w-4" />,
                  <Award className="h-4 w-4" />,
                  <Star className="h-4 w-4" />,
                  <Target className="h-4 w-4" />,
                  <Sparkles className="h-4 w-4" />
                ]

                return (
                  <div
                    key={scorer.id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                      isCurrentUser 
                        ? 'bg-blue-100 border-2 border-blue-300 shadow-md' 
                        : 'bg-white border border-yellow-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${rankColors[Math.min(index, 4)]} flex items-center justify-center text-white font-bold mr-3 shadow-lg`}>
                        {index < 3 ? rankIcons[index] : index + 1}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className={`font-semibold ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                            {scorer.user_name}
                            {isCurrentUser && <span className="ml-2 text-blue-600 text-sm">(You)</span>}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{scorer.user_university}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-500 flex items-center">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {scorer.doubts_asked} asked
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Reply className="h-3 w-3 mr-1" />
                            {scorer.doubts_answered} answered
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Star className="h-3 w-3 mr-1" />
                            {scorer.best_answers} best
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${isCurrentUser ? 'text-blue-900' : 'text-yellow-700'}`}>
                        {scorer.total_score}
                      </div>
                      <p className="text-xs text-gray-600">points</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Scoring Guide */}
            <div className="mt-6 pt-6 border-t border-yellow-200">
              <h5 className="font-semibold text-yellow-800 mb-3">💡 How to Earn Points</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 border border-yellow-200">
                  <div className="flex items-center mb-2">
                    <Plus className="h-4 w-4 text-green-600 mr-2" />
                    <span className="font-medium text-green-700">+5</span>
                  </div>
                  <p className="text-xs text-gray-600">Ask a doubt</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-yellow-200">
                  <div className="flex items-center mb-2">
                    <Reply className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-700">+10</span>
                  </div>
                  <p className="text-xs text-gray-600">Answer a doubt</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-yellow-200">
                  <div className="flex items-center mb-2">
                    <ThumbsUp className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="font-medium text-purple-700">+2/+3</span>
                  </div>
                  <p className="text-xs text-gray-600">Get upvoted</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-yellow-200">
                  <div className="flex items-center mb-2">
                    <Star className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="font-medium text-yellow-700">+15</span>
                  </div>
                  <p className="text-xs text-gray-600">Best answer</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-yellow-200">
                  <div className="flex items-center mb-2">
                    <Sparkles className="h-4 w-4 text-indigo-600 mr-2" />
                    <span className="font-medium text-indigo-700">+5</span>
                  </div>
                  <p className="text-xs text-gray-600">Quality bonus</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-yellow-200">
                  <div className="flex items-center mb-2">
                    <Zap className="h-4 w-4 text-orange-600 mr-2" />
                    <span className="font-medium text-orange-700">Bonus</span>
                  </div>
                  <p className="text-xs text-gray-600">Daily streak</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading doubts...</p>
          </div>
        ) : filteredDoubts.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No doubts found. Be the first to ask a question!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
            {filteredDoubts.map((doubt) => (
              <div
                key={doubt.id}
                onClick={() => openDoubtDetail(doubt)}
                className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-emerald-300 hover:bg-gradient-to-br hover:from-emerald-50/50 hover:to-teal-50/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 group-hover:text-emerald-900 transition-colors line-clamp-1 text-sm">
                        {doubt.title}
                      </h4>
                      {doubt.is_resolved && (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-gray-600 text-xs line-clamp-2 mb-3">
                      {doubt.description}
                    </p>
                  </div>
                </div>

                {/* Student Info */}
                <div className="text-xs text-gray-500 mb-3">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      <span className="font-medium truncate">{doubt.student_name}</span>
                    </div>
                    <div className="flex items-center">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      <span className="truncate">{doubt.university_name}</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-3 w-3 mr-1" />
                      <span className="truncate">{doubt.department_name}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{getSemesterLabel(doubt.semester_number)}</span>
                    </div>
                  </div>
                </div>

                {/* Subject and Tags */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium truncate">
                    {doubt.subject_name}
                  </span>
                  {doubt.tags.slice(0, 1).map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                  {doubt.tags.length > 1 && (
                    <span className="text-gray-400 text-xs">+{doubt.tags.length - 1}</span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      <span>{doubt.upvotes}</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      <span>{doubt.replies_count}</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      <span>{doubt.views}</span>
                    </div>
                    <div className="flex items-center">
                      <Zap className="h-3 w-3 mr-1 text-yellow-500" />
                      <span className="text-yellow-600 font-medium">+5 pts</span>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{formatTimeAgo(doubt.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ask Doubt Modal */}
      {showAskDoubt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Ask a Doubt</h3>
                <button
                  onClick={() => setShowAskDoubt(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Title
                </label>
                <input
                  type="text"
                  value={doubtForm.title}
                  onChange={(e) => setDoubtForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="What's your question about?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description
                </label>
                <textarea
                  value={doubtForm.description}
                  onChange={(e) => setDoubtForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="Provide more details about your question..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={doubtForm.subject_id}
                  onChange={(e) => setDoubtForm(prev => ({ ...prev, subject_id: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a subject...</option>
                  {subjects && subjects.length > 0 ? subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  )) : (
                    <option disabled>No subjects available</option>
                  )}
                </select>
                {(!subjects || subjects.length === 0) && (
                  <p className="text-sm text-red-600 mt-1">
                    No subjects found. Please complete your profile setup first.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={doubtForm.tags}
                  onChange={(e) => setDoubtForm(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., algorithms, data structures, programming"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAskDoubt(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAskDoubt}
                  disabled={!doubtForm.title.trim() || !doubtForm.description.trim() || !doubtForm.subject_id}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Post Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doubt Detail Modal */}
      {showDoubtDetail && selectedDoubt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedDoubt.title}</h3>
                  <p className="text-emerald-100 text-sm">
                    by {selectedDoubt.student_name} • {selectedDoubt.university_name} • {selectedDoubt.department_name}
                  </p>
                </div>
                <button
                  onClick={() => setShowDoubtDetail(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {/* Question Details */}
              <div className="mb-6">
                <p className="text-gray-700 mb-4">{selectedDoubt.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleUpvote(selectedDoubt.id, 'doubt')}
                      className="flex items-center space-x-1 text-gray-600 hover:text-emerald-600 transition-colors"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>{selectedDoubt.upvotes}</span>
                    </button>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Eye className="h-4 w-4" />
                      <span>{selectedDoubt.views}</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{formatTimeAgo(selectedDoubt.created_at)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                    {selectedDoubt.subject_name}
                  </span>
                  {selectedDoubt.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Replies */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Replies ({replies.length})
                </h4>

                <div className="space-y-4 mb-6">
                  {replies.map((reply) => (
                    <div key={reply.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="bg-emerald-100 w-8 h-8 rounded-full flex items-center justify-center">
                            <span className="text-emerald-600 font-medium text-sm">
                              {reply.student_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{reply.student_name}</p>
                            <p className="text-xs text-gray-500">
                              {reply.university_name} • {reply.department_name} • {getSemesterLabel(reply.semester_number)}
                            </p>
                          </div>
                          {reply.is_best_answer && (
                            <Star className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{formatTimeAgo(reply.created_at)}</span>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{reply.content}</p>
                      
                      <button
                        onClick={() => handleUpvote(selectedDoubt.id, 'reply', reply.id)}
                        className="flex items-center space-x-1 text-gray-600 hover:text-emerald-600 transition-colors"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span className="text-sm">{reply.upvotes}</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    placeholder="Write your answer..."
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleReply}
                      disabled={!replyContent.trim()}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Post Reply
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