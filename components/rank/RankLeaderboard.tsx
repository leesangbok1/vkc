'use client'

import type { LeaderboardEntry } from '@/lib/data/mockRank'

type RankLeaderboardProps = {
  entries: LeaderboardEntry[]
}

export default function RankLeaderboard({ entries }: RankLeaderboardProps) {
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {entries.map((entry) => (
        <div
          key={entry.rank}
          className="card"
          style={{
            padding: '1rem 1.25rem',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: entry.rank <= 3 ? 'var(--vk-primary)' : 'var(--text-secondary)'
            }}
          >
            #{entry.rank}
          </div>
          <div style={{ display: 'grid', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <strong style={{ fontSize: '1rem' }}>{entry.name}</strong>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '9999px',
                  background: roleBackground(entry.role),
                  color: roleColor(entry.role),
                  fontWeight: 600
                }}
              >
                {roleLabel(entry.role)}
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
              주간 답변 {entry.answered}건 · 연속 {entry.streak}일 활동
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              {entry.score.toLocaleString()} pts
            </strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>평균 120 pts/답변</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function roleLabel(role: LeaderboardEntry['role']) {
  if (role === 'verified') return 'Certified'
  if (role === 'admin') return 'Admin'
  if (role === 'user') return 'Member'
  return 'Guest'
}

function roleBackground(role: LeaderboardEntry['role']) {
  if (role === 'verified') return 'rgba(16, 185, 129, 0.12)'
  if (role === 'admin') return 'rgba(245, 158, 11, 0.12)'
  return 'rgba(59, 130, 246, 0.12)'
}

function roleColor(role: LeaderboardEntry['role']) {
  if (role === 'verified') return '#047857'
  if (role === 'admin') return '#b45309'
  return '#2563eb'
}
