# Layout Consistency Update - Session Summary

## ✅ Completed Updates

### 1. /questions Page (완료)

**Changes Made**:
- ✅ Separated filter buttons ("전체/최신") from category tabs
- ✅ Removed all Follow buttons from question cards
- ✅ Added ActionBar component (도움됨/북마크/공유)
- ✅ Implemented "My Topic" functionality with subscribed topics
- ✅ Filter state expanded: `'all' | 'latest' | 'myTopics'`

**Layout Structure**:
```
main-layout
├── mobile-category-grid
└── container
    ├── main-content
    │   ├── desktop-hero / desktop-hero-compact
    │   ├── event-banner (if logged in)
    │   ├── category-tabs (Popular | My Topic | Following)
    │   ├── filter-buttons (전체 | 최신)
    │   └── feed-container
    │       └── question-card[]
    │           └── ActionBar
    └── Sidebar
```

### 2. Certification Modal System (완료)

**New Component**: `CertificationModal.tsx`
- Full-screen overlay modal
- URL parameter support: `/?modal=certification`
- Custom event system: `openCertificationModal`
- Replaces `/experts/apply` page navigation

**Integration Points**:
- Main page (`app/page.tsx`)
- CertificationRequestBanner
- Sidebar (via event dispatch)

### 3. /following Page (완료)

**Changes Made**:
- ✅ Converted from CSS-in-JS to global CSS classes
- ✅ Added mobile-category-grid
- ✅ Added category-tabs
- ✅ Changed feed-item-card → question-card structure
- ✅ Added ActionBar component to all cards
- ✅ Added Sidebar component
- ✅ Implemented proper container + main-content layout

**Layout Structure**:
```
main-layout
├── mobile-category-grid
└── container
    ├── main-content
    │   ├── section (Page Header)
    │   ├── category-tabs (Popular | Topic | Following)
    │   └── feed-container
    │       ├── feed-empty (if no content)
    │       └── question-card[]
    │           └── ActionBar
    └── Sidebar
```

## 📋 Remaining Pages to Update

### Priority 1 - Core Navigation Pages
1. **app/topics/page.tsx** (⏳ Pending)
   - Already uses main structure
   - Needs verification for ActionBar
   - Check BannerCarousel usage

### Priority 2 - Category Pages
2. **app/categories/[slug]/page.tsx** (⏳ Pending)
   - Update to question-card structure
   - Add ActionBar
   - Ensure consistent layout

### Priority 3 - Detail Pages
3. **app/posts/[id]/page.tsx** (⏳ Pending)
   - Verify layout consistency
   - Add ActionBar to comments/answers

4. **app/questions/[id]/page.tsx** (⏳ Pending)
   - Verify layout consistency
   - Add ActionBar to answers

## 🎨 Global CSS Classes Used

### Layout Structure
- `.main-layout` - Root layout container
- `.mobile-category-grid` - Mobile-only category quick access
- `.container` - Main content wrapper (with Sidebar)
- `.main-content` - Primary content area
- `.section` - Content sections

### Navigation
- `.category-tabs` - Tab navigation container
- `.category-tab` - Individual tab
- `.category-tab.active` - Active tab state
- `.filter-buttons` - Filter button group
- `.filter-btn` - Filter button
- `.filter-btn.active` - Active filter button

### Feed Components
- `.feed-container` - Feed wrapper
- `.feed-empty` - Empty state display
- `.feed-empty-icon` - Empty state icon
- `.feed-loading` - Loading indicator

### Question Cards
- `.question-card` - Card container
- `.question-header` - Card header with author
- `.question-meta` - Author metadata
- `.question-author-row` - Author name & avatar
- `.author-avatar-small` - Avatar circle
- `.question-author-info` - Author details
- `.question-author` - Author name line
- `.author-verification-box` - Certification badge
- `.question-time-row` - Timestamp row
- `.question-time` - Time display
- `.question-more-btn` - Detail button
- `.question-title` - Card title
- `.question-content` - Card excerpt
- `.question-stats` - Stats section
- `.question-stats-comments` - Comment/answer count
- `.answer-expert-icon` - Expert indicator icon

### ActionBar
- `.action-bar` - ActionBar container
- `.action-btn` - Action button
- `.action-btn.active` - Active action button

## 🔄 Pattern Consistency

### Common Structure Pattern
All feed-based pages should follow:

```tsx
<main className="main-layout">
  {/* Mobile Category Grid */}
  <div className="mobile-category-grid">...</div>

  <div className="container">
    <div className="main-content">
      {/* Hero Section (optional - logged in dependent) */}
      {isLoggedIn ? (
        <div className="desktop-hero-compact">...</div>
      ) : (
        <div className="desktop-hero">...</div>
      )}

      {/* Banner (optional - logged in only) */}
      {isLoggedIn && <BannerCarousel />}

      {/* Category Tabs */}
      <div className="category-tabs">...</div>

      {/* Filter Buttons (optional) */}
      <div className="filter-buttons">...</div>

      {/* Feed */}
      <div className="feed-container">
        {items.map(item => (
          <div className="question-card">
            <div className="question-header">...</div>
            <h3 className="question-title">...</h3>
            <p className="question-content">...</p>
            <div className="question-stats">...</div>
            <ActionBar {...} />
          </div>
        ))}
      </div>
    </div>

    <Sidebar />
  </div>
</main>
```

### Question Card Pattern
```tsx
<div className="question-card" onClick={handleClick}>
  <div className="question-header">
    <div className="question-meta">
      <div className="question-author-row">
        <div className="author-avatar-small"></div>
        <div className="question-author-info">
          <div className="question-author">
            <span className="question-author-link">{author.name}</span>
            {hasVerification && (
              <span className="author-verification-box verified">
                <span className="verification-text">{verification}</span>
              </span>
            )}
          </div>
          <div className="question-time-row">
            <div className="question-time">{formatDate(date)}</div>
          </div>
        </div>
      </div>
    </div>
    <button className="question-more-btn">자세히</button>
  </div>

  <h3 className="question-title">{title}</h3>
  <p className="question-content">{content.substring(0, 200)}...</p>

  <div className="question-stats">
    <div className="question-stats-comments">
      <span className="answer-expert-icon">🎓</span>
      <span>{answerText}</span>
    </div>
  </div>

  <div onClick={(e) => e.stopPropagation()}>
    <ActionBar {...} />
  </div>
</div>
```

## 🔧 Implementation Guidelines

### 1. Import Requirements
```tsx
import Sidebar from '@/components/layout/Sidebar'
import ActionBar from '@/components/common/ActionBar'
import { MOCK_QUESTIONS, MOCK_POSTS } from '@/lib/data/mockData'
```

### 2. State Management
```tsx
const [isLoggedIn, setIsLoggedIn] = useState(false)
const [loading, setLoading] = useState(true)

useEffect(() => {
  const mockSession = localStorage.getItem('mock_session')
  setIsLoggedIn(mockSession === 'true')
}, [])
```

### 3. ActionBar Integration
```tsx
<ActionBar
  targetId={item.id}
  targetType="question" // or "post"
  title={item.title}
  content={item.content}
  url={`/questions/${item.id}`}
  initialHelpfulCount={item.votes}
  compact={true}
  requireLogin={!isLoggedIn}
  onLoginRequired={() => router.push('/auth/login?redirectTo=/current')}
/>
```

### 4. Date Formatting
```tsx
function formatDate(dateString: string) {
  if (!dateString) return '방금 전'
  const date = new Date(dateString)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  const days = Math.floor(diff / 86400)
  if (days === 1) return '1일 전'
  if (days < 7) return `${days}일 전`
  return date.toLocaleDateString('ko-KR')
}
```

## ✅ Testing Checklist for Each Page

- [ ] Page renders with container + main-content + Sidebar layout
- [ ] mobile-category-grid appears on mobile
- [ ] category-tabs are present and functional
- [ ] Question cards use proper question-card class
- [ ] ActionBar appears on all cards
- [ ] ActionBar "도움됨" button toggles correctly
- [ ] Login requirement check works
- [ ] Date formatting displays correctly
- [ ] Empty states display properly
- [ ] Loading states work
- [ ] Mobile responsive design
- [ ] Sidebar is visible on desktop

## 🚀 Build Status

**Current Status**: ⚠️ Build has pre-existing errors in admin pages
- admin/page.tsx: @ts-ignore should be @ts-expect-error
- admin/certifications/page.tsx: React Hook dependency warnings

**Our Changes**: ✅ All new changes compile successfully
- /questions page: ✅ Updated
- /following page: ✅ Updated
- CertificationModal: ✅ Created
- Main page integration: ✅ Complete

## 📝 Next Steps

1. **Update /topics page**
   - Verify layout matches main page
   - Ensure ActionBar is present
   - Check BannerCarousel usage

2. **Update /categories/[slug] page**
   - Convert to question-card structure
   - Add ActionBar
   - Ensure consistent layout

3. **Fix admin page lint errors** (Optional - pre-existing)
   - Replace @ts-ignore with @ts-expect-error
   - Fix React Hook dependencies

4. **Add filter buttons CSS** (if needed)
   - Verify `.filter-buttons` styles match screenshots
   - Test active state colors

5. **Test all pages end-to-end**
   - Verify navigation flow
   - Test login/logout state changes
   - Confirm mobile responsiveness

---

**Date**: 2025-10-15
**Status**: 🟢 In Progress (3/6 core pages completed)
**Next Session**: Continue with /topics and /categories pages
