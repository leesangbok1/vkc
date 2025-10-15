'use client'

import { useState } from 'react'

interface TopicSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: (selectedTopics: string[]) => void
}

export default function TopicSelectionModal({ isOpen, onClose, onConfirm }: TopicSelectionModalProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])

  // MVP용 핵심 카테고리만
  const categories = {
    '생활정보': ['비자', '주거', '교통', '은행', '통신', '보험'],
    '취업·경력': ['구직', '이력서', '면접', '회사생활', '노동법', '창업'],
    '한국어·교육': ['한국어학습', 'TOPIK', '유학', '장학금', '학교생활', '자격증'],
    '문화·여가': ['음식', '여행', '문화체험', '친구만들기', '데이트', '취미']
  }

  function toggleTopic(topic: string) {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    )
  }

  function handleReset() {
    setSelectedTopics([])
  }

  function handleConfirm() {
    if (onConfirm) {
      onConfirm(selectedTopics)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content topic-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>누구나 토픽 전체</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="topic-categories">
          {Object.entries(categories).map(([category, topics]) => (
            <div key={category} className="topic-category">
              <h3>{category}</h3>
              <div className="topic-chips">
                {topics.map(topic => (
                  <button
                    key={topic}
                    className={`topic-chip ${selectedTopics.includes(topic) ? 'selected' : ''}`}
                    onClick={() => toggleTopic(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleReset}>
            선택 해제
          </button>
          <button className="btn-primary" onClick={handleConfirm}>
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
