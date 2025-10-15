'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/data/categories-mock';

export default function InterestSettingsPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSave = () => {
    // TODO: Save to backend
    alert(`${selectedCategories.length}개의 관심 토픽이 저장되었습니다!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/categories" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">관심 토픽 설정</h1>
          </div>
          <span className="text-sm text-blue-600 font-medium">
            {selectedCategories.length}/{CATEGORIES.length}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Description */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">관심 있는 주제를 선택해 주세요</h2>
          <p className="text-sm text-gray-600">
            관심 있는 주제를 선택하면, 맞춤형 질문을 추천해 드려요.
          </p>
        </div>

        {/* Category Selection Grid */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-4">Certified User 답변</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  selectedCategories.includes(category.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="text-xs font-medium text-center text-gray-900 leading-tight">
                  {category.name}
                </div>
                {selectedCategories.includes(category.id) && (
                  <div className="mt-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State or Selection Info */}
        {selectedCategories.length === 0 ? (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🧩</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">관심 토픽을 선택해 주세요</h3>
            <p className="text-sm text-gray-600">
              1개 이상의 토픽을 선택하면<br />
              맞춤형 콘텐츠를 만나볼 수 있어요!
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-3">
              선택한 관심 토픽 ({selectedCategories.length}개)
            </h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategories.map(id => {
                const category = CATEGORIES.find(c => c.id === id);
                return category ? (
                  <div
                    key={id}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-full"
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    <button
                      onClick={() => toggleCategory(id)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Link
            href="/categories"
            className="flex-1 py-3 px-6 bg-white border border-gray-300 text-gray-700 text-center font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            나중에 하기
          </Link>
          <button
            onClick={handleSave}
            disabled={selectedCategories.length === 0}
            className={`flex-1 py-3 px-6 text-white text-center font-medium rounded-lg transition-colors ${
              selectedCategories.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {selectedCategories.length === 0 ? '토픽을 선택해주세요' : '설정 완료'}
          </button>
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
      `}</style>
    </div>
  );
}
