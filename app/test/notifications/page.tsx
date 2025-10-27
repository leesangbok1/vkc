import NotificationTest from '@/components/notifications/NotificationTest'

export default function NotificationTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">알림 시스템 테스트</h1>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">테스트 안내</h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 이 페이지에서 알림 시스템의 동작을 테스트할 수 있습니다.</li>
              <li>• 각 테스트를 실행하여 API 연동과 실시간 기능을 확인하세요.</li>
              <li>• 브라우저 개발자 도구의 네트워크 탭에서 API 호출을 확인할 수 있습니다.</li>
              <li>• 우측 상단 알림 벨을 확인하여 실시간 업데이트를 확인하세요.</li>
            </ul>
          </div>

          <NotificationTest />

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">실시간 연결 상태 확인</h2>
            <p className="text-sm text-gray-700">
              실시간 알림을 확인하려면 브라우저의 개발자 도구를 열고 Console 탭에서
              "Subscribed to notifications" 메시지를 확인하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: '알림 시스템 테스트',
  description: '알림 시스템의 실시간 기능과 API 연동을 테스트합니다.'
}