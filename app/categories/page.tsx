'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES, TOPICS, HOT_TOPICS } from '@/lib/data/categories-mock';

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'following'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (categorySlug: string) => {
    setExpandedCategory(expandedCategory === categorySlug ? null : categorySlug);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">토픽</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
          {/* Main Content */}
          <main>
            {/* Search Bar */}
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
              <div className="relative">
                <input
                  type="text"
                  placeholder="토픽을 검색해보세요"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 py-4 px-6 font-medium text-center border-b-2 transition-colors ${
                    activeTab === 'all'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Certified User 답변
                </button>
                <button
                  onClick={() => setActiveTab('following')}
                  className={`flex-1 py-4 px-6 font-medium text-center border-b-2 transition-colors ${
                    activeTab === 'following'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  누구나 답변
                </button>
              </div>

              {/* Categories Grid */}
              <div className="p-6">
                {/* First 2 rows (8 categories each) */}
                <div className="space-y-6">
                  {/* Row 1 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {CATEGORIES.slice(0, 4).map((category) => (
                      <button
                        key={category.id}
                        onClick={() => toggleCategory(category.slug)}
                        className={`flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors ${
                          expandedCategory === category.slug ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <div className="text-4xl mb-2">{category.icon}</div>
                        <div className="text-sm font-medium text-gray-900 text-center">{category.name}</div>
                        <svg
                          className={`w-4 h-4 mt-1 text-gray-400 transition-transform ${
                            expandedCategory === category.slug ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    ))}
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {CATEGORIES.slice(4, 8).map((category) => (
                      <button
                        key={category.id}
                        onClick={() => toggleCategory(category.slug)}
                        className={`flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors ${
                          expandedCategory === category.slug ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <div className="text-4xl mb-2">{category.icon}</div>
                        <div className="text-sm font-medium text-gray-900 text-center">{category.name}</div>
                        <svg
                          className={`w-4 h-4 mt-1 text-gray-400 transition-transform ${
                            expandedCategory === category.slug ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    ))}
                  </div>

                  {/* Row 3 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {CATEGORIES.slice(8, 12).map((category) => (
                      <button
                        key={category.id}
                        onClick={() => toggleCategory(category.slug)}
                        className={`flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors ${
                          expandedCategory === category.slug ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <div className="text-4xl mb-2">{category.icon}</div>
                        <div className="text-sm font-medium text-gray-900 text-center">{category.name}</div>
                        <svg
                          className={`w-4 h-4 mt-1 text-gray-400 transition-transform ${
                            expandedCategory === category.slug ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    ))}
                  </div>

                  {/* Row 4 */}
                  {CATEGORIES.length > 12 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {CATEGORIES.slice(12).map((category) => (
                        <button
                          key={category.id}
                          onClick={() => toggleCategory(category.slug)}
                          className={`flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors ${
                            expandedCategory === category.slug ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                          }`}
                        >
                          <div className="text-4xl mb-2">{category.icon}</div>
                          <div className="text-sm font-medium text-gray-900 text-center">{category.name}</div>
                          <svg
                            className={`w-4 h-4 mt-1 text-gray-400 transition-transform ${
                              expandedCategory === category.slug ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expanded Category Topics */}
                {expandedCategory && TOPICS[expandedCategory] && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {TOPICS[expandedCategory].map((topic) => (
                        <Link
                          key={topic.id}
                          href={`/topics/${topic.slug}`}
                          className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-all hover:scale-[1.02]"
                        >
                          <span className="text-sm font-medium text-gray-900">{topic.name}</span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Interest Settings Card */}
            <div className="bg-gradient-to-br from-yellow-50 to-pink-50 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-center mb-4">
                <div className="text-6xl">🦆</div>
                <div className="text-6xl">🎨</div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
                관심 토픽 설정하고
                <br />
                맞춤형 콘텐츠
                <br />
                만나보기
              </h3>
              <p className="text-sm text-gray-600 mb-4 text-center">나를 위한 콘텐츠를 만나보세요!</p>
              <Link
                href="/settings/interests"
                className="block w-full py-3 px-4 bg-blue-600 text-white text-center font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                설정하기
              </Link>
            </div>

            {/* Hot Topics */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🔥</span>
                <h3 className="text-lg font-bold text-gray-900">요즘 뜨는 토픽</h3>
                <span className="text-xs font-bold text-red-500 ml-auto">HOT</span>
              </div>
              <div className="space-y-3">
                {HOT_TOPICS.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/topics/${topic.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-900 mb-1">{topic.name}</div>
                    <div className="text-xs text-gray-500">{topic.category}</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-3">개인정보처리방침</h3>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>• 이용약관</li>
                <li>• 개인정보처리방침</li>
                <li>• 광고 문의</li>
                <li>• 커뮤니티 보상 시스템 소개</li>
                <li>• 무단 크롤링 금지</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
