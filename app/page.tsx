
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-gray-900">VietKConnect</h2>
            </div>
            <nav className="flex items-center space-x-4">
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                질문하기
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                로그인
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="bg-white rounded-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            무엇이든 물어보세요! 🙋‍♂️
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            한국 생활의 모든 궁금증을 베트남 커뮤니티에서 해결하세요
          </p>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded"
            placeholder="질문이나 키워드를 검색하세요..."
          />
        </section>

        {/* Vietnamese Community Features */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div data-testid="category-card" className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">🛂 비자</h3>
            <p className="text-gray-600 text-sm">비자 신청, 연장, 변경에 대한 모든 정보</p>
          </div>
          <div data-testid="category-card" className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">💼 취업</h3>
            <p className="text-gray-600 text-sm">구직, 이직, 워킹비자 관련 정보</p>
          </div>
          <div data-testid="category-card" className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">⚖️ 법률</h3>
            <p className="text-gray-600 text-sm">한국 생활 관련 법률 상담</p>
          </div>
        </section>
      </main>
    </div>
  )
}