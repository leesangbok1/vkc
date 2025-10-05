'use client'

import React, { useState, useEffect } from 'react'

interface Profile {
  id: string
  name: string
  avatar_url: string | null
}

interface VoteButtonsProps {
  targetId: string
  targetType: 'question' | 'answer'
  initialVoteScore: number
  currentUser: Profile | null
  disabled?: boolean
  onVoteUpdate?: (newVoteScore: number) => void
}

export default function VoteButtons({
  targetId,
  targetType,
  initialVoteScore,
  currentUser,
  disabled = false,
  onVoteUpdate
}: VoteButtonsProps) {
  const [voteScore, setVoteScore] = useState(initialVoteScore)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch current user vote status
  useEffect(() => {
    const fetchUserVote = async () => {
      if (!currentUser) return

      try {
        const response = await fetch(`/api/${targetType}s/${targetId}/vote/status`)
        if (response.ok) {
          const result = await response.json()
          setUserVote(result.data?.user_vote || null)
        }
      } catch (err) {
        console.error('Error fetching vote status:', err)
      }
    }

    fetchUserVote()
  }, [targetId, targetType, currentUser])

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!currentUser) {
      setError('로그인이 필요합니다')
      return
    }

    if (disabled) {
      setError('본인의 게시물에는 투표할 수 없습니다')
      return
    }

    if (isVoting) return

    setIsVoting(true)
    setError(null)

    try {
      // Determine the actual vote action
      let actualVoteType = voteType
      if (userVote === voteType) {
        // Same vote type - cancel the vote
        actualVoteType = 'cancel' as any
      }

      const response = await fetch(`/api/${targetType}s/${targetId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vote_type: actualVoteType
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to vote')
      }

      // Update local state
      setVoteScore(result.data.vote_score)
      setUserVote(result.data.user_vote)

      // Notify parent component
      if (onVoteUpdate) {
        onVoteUpdate(result.data.vote_score)
      }

    } catch (err) {
      console.error('Error voting:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsVoting(false)
    }
  }

  const getVoteButtonClass = (type: 'up' | 'down') => {
    const isActive = userVote === type
    const baseClass = "flex flex-col items-center p-2 rounded-lg transition-colors duration-200 min-w-[60px]"

    if (disabled) {
      return `${baseClass} text-gray-400 cursor-not-allowed`
    }

    if (isActive) {
      return type === 'up'
        ? `${baseClass} text-green-600 bg-green-50 hover:bg-green-100`
        : `${baseClass} text-red-600 bg-red-50 hover:bg-red-100`
    }

    return `${baseClass} text-gray-600 hover:text-gray-800 hover:bg-gray-100`
  }

  const formatVoteScore = (score: number) => {
    if (score === 0) return '0'
    if (score > 0) return `+${score}`
    return score.toString()
  }

  const getScoreColor = () => {
    if (voteScore > 0) return 'text-green-600'
    if (voteScore < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="flex flex-col items-center space-y-1">
      {/* Upvote Button */}
      <button
        onClick={() => handleVote('up')}
        disabled={disabled || isVoting || !currentUser}
        className={getVoteButtonClass('up')}
        title={
          disabled
            ? "본인의 게시물에는 투표할 수 없습니다"
            : !currentUser
            ? "로그인이 필요합니다"
            : userVote === 'up'
            ? "추천 취소"
            : "추천"
        }
      >
        <i className={`fas fa-chevron-up text-xl ${userVote === 'up' ? 'animate-pulse' : ''}`}></i>
        <span className="text-xs mt-1">추천</span>
      </button>

      {/* Vote Score */}
      <div className={`py-2 px-3 rounded-lg font-bold text-lg ${getScoreColor()}`}>
        {formatVoteScore(voteScore)}
      </div>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote('down')}
        disabled={disabled || isVoting || !currentUser}
        className={getVoteButtonClass('down')}
        title={
          disabled
            ? "본인의 게시물에는 투표할 수 없습니다"
            : !currentUser
            ? "로그인이 필요합니다"
            : userVote === 'down'
            ? "비추천 취소"
            : "비추천"
        }
      >
        <i className={`fas fa-chevron-down text-xl ${userVote === 'down' ? 'animate-pulse' : ''}`}></i>
        <span className="text-xs mt-1">비추천</span>
      </button>

      {/* Loading Indicator */}
      {isVoting && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm whitespace-nowrap z-10">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Authentication Required Message */}
      {!currentUser && !disabled && (
        <div className="text-center mt-2">
          <p className="text-xs text-gray-500">로그인하여</p>
          <p className="text-xs text-gray-500">투표하세요</p>
        </div>
      )}

      {/* Disabled Message */}
      {disabled && (
        <div className="text-center mt-2">
          <p className="text-xs text-gray-400">본인 게시물</p>
        </div>
      )}
    </div>
  )
}