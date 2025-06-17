import React from 'react'
import { Trophy, Zap, Target, Crown } from 'lucide-react'
import { LeaderboardCompetitor } from '../../types'

interface LeaderboardWidgetProps {
  leaderboard: LeaderboardCompetitor[]
  userTotalXP: number
}

export function LeaderboardWidget({ leaderboard, userTotalXP }: LeaderboardWidgetProps) {
  const userRank = leaderboard.findIndex(competitor => !competitor.is_ai) + 1

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className="h-6 w-6 text-white mr-3" />
            <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
          </div>
          <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
            <Crown className="h-4 w-4 text-white mr-1" />
            <span className="text-white text-sm font-medium">Rank #{userRank}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {leaderboard.slice(0, 5).map((competitor, index) => {
            const isUser = !competitor.is_ai
            const rankColors = [
              'text-yellow-600 bg-yellow-100', // 1st
              'text-gray-600 bg-gray-100',     // 2nd
              'text-orange-600 bg-orange-100', // 3rd
              'text-blue-600 bg-blue-100',     // 4th+
              'text-purple-600 bg-purple-100'  // 5th+
            ]

            return (
              <div
                key={competitor.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isUser ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    rankColors[Math.min(index, 4)]
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="ml-3 flex items-center">
                    {competitor.avatar_url ? (
                      <img
                        src={competitor.avatar_url}
                        alt={competitor.name}
                        className="w-8 h-8 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-medium">
                          {competitor.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    
                    <div>
                      <p className={`font-medium ${isUser ? 'text-blue-900' : 'text-gray-900'}`}>
                        {competitor.name}
                        {isUser && <span className="ml-2 text-blue-600 text-sm">(You)</span>}
                      </p>
                      {competitor.current_streak > 0 && (
                        <div className="flex items-center mt-1">
                          <Target className="h-3 w-3 text-orange-500 mr-1" />
                          <span className="text-xs text-gray-600">{competitor.current_streak} day streak</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <Zap className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className={`font-semibold ${isUser ? 'text-blue-900' : 'text-gray-900'}`}>
                    {competitor.total_xp.toLocaleString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {userRank > 5 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                  {userRank}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-blue-900">You</p>
                </div>
              </div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="font-semibold text-blue-900">{userTotalXP.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}