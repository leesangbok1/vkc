'use client'

import type { RankSummary } from '@/lib/data/mockRank'

type RankSummaryCardsProps = {
  items: RankSummary[]
}

export default function RankSummaryCards({ items }: RankSummaryCardsProps) {
  return (
    <div
      className="rank-summary-grid"
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="card"
          style={{
            padding: '1.25rem',
            display: 'grid',
            gap: '0.5rem'
          }}
        >
          <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>{item.label}</span>
          <strong
            style={{
              fontSize: '2rem',
              lineHeight: 1,
              color: item.accent ?? 'var(--text-primary)'
            }}
          >
            {item.value}
          </strong>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{item.caption}</span>
        </div>
      ))}
    </div>
  )
}
