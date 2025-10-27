import { Metadata } from 'next'
import { RealtimeDashboard } from '@/components/monitoring/RealtimeDashboard'

export const metadata: Metadata = {
  title: '실시간 모니터링 | Viet K-Connect',
  description: '시스템 상태 및 성능 메트릭 실시간 모니터링',
}

export default function MonitoringPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <RealtimeDashboard />
    </div>
  )
}