'use client'

import BaseModal from './BaseModal'
import RankSummaryCards from '@/components/rank/RankSummaryCards'
import RankLeaderboard from '@/components/rank/RankLeaderboard'
import RankTierGrid from '@/components/rank/RankTierGrid'
import RankMissionList from '@/components/rank/RankMissionList'
import {
  LEADERBOARD_ENTRIES,
  RANK_SUMMARY_CARDS,
  RANK_TIERS,
  WEEKLY_MISSIONS,
  UPCOMING_PLANS,
} from '@/lib/data/mockRank'

type UserRankModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function UserRankModal({ isOpen, onClose }: UserRankModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      width="900px"
      fullScreenOnMobile={true}
      showBackButton={false}
      showCloseButton={true}
      title="User Rank & 미션 현황"
    >
      <div
        style={{
          display: 'grid',
          gap: '1.5rem',
          padding: '0 0 1rem',
          maxHeight: '75vh',
          overflowY: 'auto',
        }}
      >
        <section style={{ display: 'grid', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--foreground)' }}>
            현재 활동 요약
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            게시글과 답변 활동을 점수화하여 커뮤니티 기여도를 시각화하고 있습니다. 인증 배지와 미션 보상은 곧
            실제 데이터와 연동될 예정입니다.
          </p>
          <RankSummaryCards items={RANK_SUMMARY_CARDS} />
        </section>

        <section style={{ display: 'grid', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>이번 주 리더보드</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
              Supabase 연동 이후 실시간 데이터로 전환됩니다.
            </span>
          </div>
          <RankLeaderboard entries={LEADERBOARD_ENTRIES} />
        </section>

        <section style={{ display: 'grid', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>랭크 티어 가이드</h3>
          <RankTierGrid tiers={RANK_TIERS} />
        </section>

        <section style={{ display: 'grid', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>이번 주 미션</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
              미션 진행도는 Supabase `missions` 테이블로 이관될 예정입니다.
            </span>
          </div>
          <RankMissionList missions={WEEKLY_MISSIONS} />
        </section>

        <section style={{ display: 'grid', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>예정된 기능</h3>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {UPCOMING_PLANS.map((plan) => (
              <li key={plan}>{plan}</li>
            ))}
          </ul>
        </section>
      </div>
    </BaseModal>
  )
}
