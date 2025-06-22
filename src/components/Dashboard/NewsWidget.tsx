import React, { useState, useEffect } from 'react'
import { Newspaper, ExternalLink, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { News } from '../../types'

export function NewsWidget() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setNews(data || [])
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const publishedDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks}w ago`
  }

  const handleNewsClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <div className="flex items-center">
            <Newspaper className="h-6 w-6 text-white mr-3" />
            <h3 className="text-lg font-semibold text-white">Latest News</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading news...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Newspaper className="h-6 w-6 text-white mr-3" />
            <h3 className="text-lg font-semibold text-white">Latest News</h3>
          </div>
          <div className="text-white text-sm">
            {news.length} articles
          </div>
        </div>
      </div>

      {/* News Content */}
      <div className="p-6">
        {news.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p>No news articles available.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {news.map((article) => (
              <div
                key={article.id}
                onClick={() => handleNewsClick(article.url)}
                className="group relative bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-blue-300/50 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/50"
              >
                {/* Glass effect overlay */}
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 flex space-x-4">
                  {/* Image */}
                  {article.image_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-20 h-16 object-cover rounded-lg border border-gray-200 group-hover:border-blue-300 transition-colors duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-900 transition-colors duration-300 line-clamp-2 leading-tight">
                        {article.title}
                      </h4>
                      <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-300 flex-shrink-0 ml-2" />
                    </div>
                    
                    <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors duration-300 mt-1 line-clamp-2 leading-relaxed">
                      {article.description}
                    </p>
                    
                    <div className="flex items-center mt-2">
                      <Clock className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                        {formatTimeAgo(article.published_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}