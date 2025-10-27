'use client'

import type { WeeklyMission } from '@/lib/data/mockRank'

type RankMissionListProps = {
  missions: WeeklyMission[]
}

export default function RankMissionList({ missions }: RankMissionListProps) {
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {missions.map((mission) => {
        const ratio = Math.min(mission.progress / mission.target, 1)
        const remaining = Math.max(mission.target - mission.progress, 0)

        return (
          <div key={mission.title} className="card" style={{ padding: '1.25rem', display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem' }}>
              <div>
                <strong style={{ fontSize: '1rem' }}>{mission.title}</strong>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {mission.description}
                </p>
              </div>
              <span style={{ fontSize: '0.8rem', color: mission.due === 'D-1' ? '#ef4444' : 'var(--text-tertiary)' }}>
                {mission.due}
              </span>
            </div>
            <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${ratio * 100}%`,
                  background: 'linear-gradient(90deg, #2563eb 0%, #38bdf8 100%)',
                  height: '100%'
                }}
              />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              {mission.progress}/{mission.target} 완료 · {remaining}회 남음
            </div>
          </div>
        )
      })}
    </div>
  )
}
