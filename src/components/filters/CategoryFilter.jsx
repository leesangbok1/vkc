import React from 'react'

const CategoryFilter = ({
  selectedCategory = 'all',
  onCategoryChange,
  showAll = true,
  layout = 'horizontal' // 'horizontal' | 'vertical'
}) => {
  const categories = [
    {
      id: 'all',
      name: '전체',
      icon: 'fa-solid fa-grid-2',
      color: '#6c757d',
      count: 1234
    },
    {
      id: '비자',
      name: '비자',
      icon: 'fa-solid fa-passport',
      color: '#007bff',
      count: 234
    },
    {
      id: '생활정보',
      name: '생활정보',
      icon: 'fa-solid fa-house',
      color: '#28a745',
      count: 567
    },
    {
      id: '취업',
      name: '취업',
      icon: 'fa-solid fa-briefcase',
      color: '#fd7e14',
      count: 189
    },
    {
      id: '교육',
      name: '교육',
      icon: 'fa-solid fa-graduation-cap',
      color: '#6f42c1',
      count: 156
    },
    {
      id: '의료',
      name: '의료',
      icon: 'fa-solid fa-hospital',
      color: '#dc3545',
      count: 89
    },
    {
      id: '법률',
      name: '법률',
      icon: 'fa-solid fa-scale-balanced',
      color: '#20c997',
      count: 67
    },
    {
      id: '문화',
      name: '문화',
      icon: 'fa-solid fa-masks-theater',
      color: '#e83e8c',
      count: 45
    }
  ]

  const displayCategories = showAll ? categories : categories.filter(cat => cat.id !== 'all')

  const handleCategoryClick = (categoryId) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId)
    }
  }

  return (
    <div className={`category-filter ${layout}`}>
      <div className="filter-header">
        <h3 className="filter-title">
          <i className="fa-solid fa-filter"></i>
          카테고리
        </h3>
        {selectedCategory !== 'all' && (
          <button
            className="clear-filter"
            onClick={() => handleCategoryClick('all')}
            title="필터 초기화"
          >
            <i className="fa-solid fa-times"></i>
            초기화
          </button>
        )}
      </div>

      <div className="categories-container">
        {displayCategories.map((category) => (
          <button
            key={category.id}
            className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category.id)}
            style={{ '--category-color': category.color }}
          >
            <div className="category-icon">
              <i className={category.icon}></i>
            </div>
            <div className="category-info">
              <span className="category-name">{category.name}</span>
              <span className="category-count">{category.count.toLocaleString()}</span>
            </div>
            {selectedCategory === category.id && (
              <div className="active-indicator">
                <i className="fa-solid fa-check"></i>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* 카테고리 요약 */}
      <div className="filter-summary">
        <div className="summary-text">
          {selectedCategory === 'all' ? (
            <span>모든 카테고리 표시 중</span>
          ) : (
            <span>
              <strong>{categories.find(cat => cat.id === selectedCategory)?.name}</strong> 카테고리
            </span>
          )}
        </div>
        <div className="total-count">
          총 {categories.find(cat => cat.id === selectedCategory)?.count || 0}개
        </div>
      </div>
    </div>
  )
}

// CSS Styles
const styles = `
/* Category Filter Styles */
.category-filter {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e0e0e0;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-title {
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.clear-filter {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.clear-filter:hover {
  background: #e9ecef;
  color: #495057;
}

/* Categories Container */
.categories-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-filter.horizontal .categories-container {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
}

/* Category Item */
.category-item {
  background: none;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.category-filter.horizontal .category-item {
  width: auto;
  min-width: 120px;
  flex-shrink: 0;
}

.category-item:hover {
  border-color: var(--category-color);
  background: rgba(var(--category-color-rgb), 0.05);
  transform: translateY(-1px);
}

.category-item.active {
  border-color: var(--category-color);
  background: var(--category-color);
  color: white;
  box-shadow: 0 4px 12px rgba(var(--category-color-rgb), 0.3);
}

.category-item.active:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(var(--category-color-rgb), 0.4);
}

/* Category Icon */
.category-icon {
  width: 32px;
  height: 32px;
  background: var(--category-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.category-item.active .category-icon {
  background: rgba(255, 255, 255, 0.2);
}

.category-filter.horizontal .category-icon {
  width: 28px;
  height: 28px;
  font-size: 12px;
}

/* Category Info */
.category-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.category-name {
  font-weight: 500;
  font-size: 14px;
  color: #333;
  transition: color 0.2s ease;
}

.category-item.active .category-name {
  color: white;
}

.category-count {
  font-size: 12px;
  color: #666;
  transition: color 0.2s ease;
}

.category-item.active .category-count {
  color: rgba(255, 255, 255, 0.9);
}

.category-filter.horizontal .category-info {
  display: none;
}

.category-filter.horizontal .category-item {
  flex-direction: column;
  gap: 6px;
  padding: 8px 12px;
  text-align: center;
}

.category-filter.horizontal .category-name {
  font-size: 12px;
  white-space: nowrap;
}

/* Active Indicator */
.active-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 16px;
  height: 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--category-color);
}

.category-filter.horizontal .active-indicator {
  display: none;
}

/* Filter Summary */
.filter-summary {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-text {
  font-size: 13px;
  color: #666;
}

.summary-text strong {
  color: #333;
}

.total-count {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .category-filter {
    padding: 16px;
  }

  .category-filter.horizontal .categories-container {
    justify-content: center;
  }

  .category-filter.horizontal .category-item {
    min-width: 80px;
    padding: 6px 8px;
  }

  .category-filter.horizontal .category-icon {
    width: 24px;
    height: 24px;
    font-size: 11px;
  }

  .category-filter.horizontal .category-name {
    font-size: 11px;
  }

  .filter-summary {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .category-filter.horizontal .categories-container {
    gap: 6px;
  }

  .category-filter.horizontal .category-item {
    min-width: 70px;
    padding: 4px 6px;
  }

  .category-filter.horizontal .category-icon {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }

  .category-filter.horizontal .category-name {
    font-size: 10px;
  }
}

/* Dark mode support */
[data-theme="dark"] .category-filter {
  background: #2d2d2d;
  border-color: #555;
}

[data-theme="dark"] .filter-title {
  color: #ffffff;
}

[data-theme="dark"] .category-item {
  border-color: #555;
  color: #ffffff;
}

[data-theme="dark"] .category-name {
  color: #ffffff;
}

[data-theme="dark"] .category-count {
  color: #cccccc;
}

[data-theme="dark"] .clear-filter {
  background: #404040;
  border-color: #555;
  color: #cccccc;
}

[data-theme="dark"] .clear-filter:hover {
  background: #4a4a4a;
  color: #ffffff;
}

[data-theme="dark"] .filter-summary {
  border-top-color: #555;
}

[data-theme="dark"] .summary-text {
  color: #cccccc;
}

[data-theme="dark"] .summary-text strong {
  color: #ffffff;
}

[data-theme="dark"] .total-count {
  color: #999;
}

/* CSS Custom Properties for colors */
.category-item[style*="--category-color: #007bff"] {
  --category-color-rgb: 0, 123, 255;
}

.category-item[style*="--category-color: #28a745"] {
  --category-color-rgb: 40, 167, 69;
}

.category-item[style*="--category-color: #fd7e14"] {
  --category-color-rgb: 253, 126, 20;
}

.category-item[style*="--category-color: #6f42c1"] {
  --category-color-rgb: 111, 66, 193;
}

.category-item[style*="--category-color: #dc3545"] {
  --category-color-rgb: 220, 53, 69;
}

.category-item[style*="--category-color: #20c997"] {
  --category-color-rgb: 32, 201, 151;
}

.category-item[style*="--category-color: #e83e8c"] {
  --category-color-rgb: 232, 62, 140;
}

.category-item[style*="--category-color: #6c757d"] {
  --category-color-rgb: 108, 117, 125;
}
`

// 스타일을 헤드에 추가
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

export default CategoryFilter