'use client'

import PageLayout from '@/components/layout/PageLayout'
import RankSummaryCards from '@/components/rank/RankSummaryCards'
import RankLeaderboard from '@/components/rank/RankLeaderboard'
import RankTierGrid from '@/components/rank/RankTierGrid'
import RankMissionList from '@/components/rank/RankMissionList'
import {
  LEADERBOARD_ENTRIES,
  RANK_SUMMARY_CARDS,
  RANK_TIERS,
  WEEKLY_MISSIONS,
  UPCOMING_PLANS
} from '@/lib/data/mockRank'

export default function UserRankPage() {
  return (
    <PageLayout variant="centered">
      <div className="section" style={{ display: 'grid', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h1 className="section-title" style={{ marginBottom: 0 }}>User Rank &amp; Missions</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            게시글과 답변 활동을 점수화하여 커뮤니티 기여도를 시각화합니다. 인증 배지와 미션 보상은 곧 Supabase 실데이터와 연결될 예정입니다.
          </p>
        </div>

        <RankSummaryCards items={RANK_SUMMARY_CARDS} />
      </div>

      <div className="section" style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <h2 className="section-title" style={{ fontSize: '1.25rem', marginBottom: 0 }}>이번 주 리더보드</h2>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Supabase 연동 후 실데이터로 자동 갱신됩니다.</span>
        </div>
        <RankLeaderboard entries={LEADERBOARD_ENTRIES} />
      </div>

      <div className="section" style={{ display: 'grid', gap: '1rem' }}>
        <h2 className="section-title" style={{ fontSize: '1.25rem', marginBottom: 0 }}>랭크 티어 가이드</h2>
        <RankTierGrid tiers={RANK_TIERS} />
      </div>

      <div className="section" style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <h2 className="section-title" style={{ fontSize: '1.25rem', marginBottom: 0 }}>이번 주 미션</h2>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>미션 진행도는 곧 Supabase `missions` 테이블로 이관됩니다.</span>
        </div>
        <RankMissionList missions={WEEKLY_MISSIONS} />
      </div>

      <div className="section" style={{ display: 'grid', gap: '0.75rem' }}>
        <h2 className="section-title" style={{ fontSize: '1.1rem', marginBottom: 0 }}>예정된 기능 안내</h2>
        <ul style={{ paddingLeft: '1.25rem', display: 'grid', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {UPCOMING_PLANS.map((plan) => (
            <li key={plan}>{plan}</li>
          ))}
        </ul>
      </div>
    </PageLayout>
  )
}
