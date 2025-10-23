'use client'

import type { RankTier } from '@/lib/data/mockRank'

type RankTierGridProps = {
  tiers: RankTier[]
}

export default function RankTierGrid({ tiers }: RankTierGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
      }}
    >
      {tiers.map((tier) => (
        <div
          key={tier.label}
          className="card"
          style={{
            padding: '1.25rem',
            display: 'grid',
            gap: '0.5rem'
          }}
        >
          <strong style={{ fontSize: '1.1rem', color: tier.color }}>{tier.label}</strong>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{tier.scoreRange}</span>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>{tier.highlight}</p>
        </div>
      ))}
    </div>
  )
}
