# VietKConnect Prototype Upgrade Plan
## Based on Reference Screenshots Analysis

### 🎯 Design System Enhancements

#### 1. **Topic Selection System** (from Screenshot 1)
- **Implementation**: Modal/page for interest topic selection
- **Features**:
  - Grid layout with emoji icons for each category
  - Multi-select capability (14+ topics shown)
  - Categories: 법률, 세금·세무, 고용·노동, 의료상담, 건강관리, 약영양제, 심리상담, 법적동물, 육아, 경제, 보험, 제품수리, 학문, 자격증, etc.
  - Step indicator (1/2)
  - "나중에 하기" (Later) and "최대 10개 선택" (Select up to 10) buttons

#### 2. **Enhanced Navigation** (from Screenshots 2, 3, 6)
- **Quora-style Header**:
  - Logo + Home/Answer/Spaces navigation icons
  - Centered large search bar
  - Notification bell with badge count
  - Profile avatar dropdown
  - "Try Quora+" and "Add question" buttons
  - Language/globe icon

#### 3. **Search Page Enhancement** (Screenshot 3)
- **Main Search Interface**:
  - Large, prominent search input
  - Recent search history
  - Trending topics sidebar:
    - "인기 검색어" section
    - Pill-style topic tags
    - Quick access to popular categories
  - Search suggestions panel

#### 4. **News/Feed Page** (Screenshot 4)
- **Latest News Section**:
  - "최근 기사/소식" header with timestamp
  - Card-based news items
  - Warning/info icons (⚠️)
  - Category badges
  - Action buttons on cards

#### 5. **Profile Page Enhancement** (Screenshot 5)
- **Profile Header**:
  - Large avatar with name
  - "Add profile credential" section
  - Follower/following counts
  - Bio/description area
  - Edit button
- **Credentials & Highlights**:
  - Add employment credential
  - Add education credential
  - Add location credential
  - Language knowledge badges
  - Join date
- **Activity Tabs**:
  - Profile, Answers, Questions, Posts, Followers, Following, Edits, Activity
  - Content search within profile
- **Knowledge Areas**:
  - Listed topics/expertise (e.g., "Korean (language)")

#### 6. **Category/Topic Pages** (Screenshot 6)
- **Topic Header**:
  - Navigation: 인기 (Popular), 관심 (Interest), 답변 (Answer)
  - Tab navigation for different views
- **Content Filtering**:
  - "전문가 답변" filter
  - "누구나" dropdown selector
  - "최신순" sorting option
- **Event Banners**:
  - Colorful promotional cards
  - Mission/event tracking
- **Answer Cards**:
  - User avatar and credentials
  - Upvote count display
  - Action buttons (like, comment, share)

#### 7. **Question Detail Enhancement** (Screenshot 7)
- **Question Card**:
  - Rich formatting support
  - Category tag display
  - View count and engagement metrics
  - Vote buttons
  - Answer count badge
  - Community interaction (comment, share)

---

### 📋 Implementation Tasks

#### Phase 1: Core Design System
- [ ] Upgrade `common.css` with new color palette
- [ ] Add emoji icon library for categories
- [ ] Create reusable card components
- [ ] Implement modal system for topic selection

#### Phase 2: Navigation & Header
- [ ] Rebuild header with Quora-style layout
- [ ] Add notification dropdown with real content
- [ ] Implement search autocomplete
- [ ] Add profile dropdown menu

#### Phase 3: Page Enhancements
- [ ] **p.1.html** (Home): Enhanced feed with mixed content types
- [ ] **p.3.html** (Onboarding): Topic selection interface
- [ ] **p.7.html** (Search): Full search page with trending topics
- [ ] **p.8.html** (Profile): Credentials and activity tabs
- [ ] **p.9.html** (Categories): Topic-based filtering
- [ ] **p.12.html** (Settings): Topic preference manager

#### Phase 4: Interactive Features
- [ ] Topic selection modal
- [ ] Advanced search with filters
- [ ] News feed integration
- [ ] Expert ranking system
- [ ] Voting and engagement system

#### Phase 5: Responsive & Polish
- [ ] Mobile optimization
- [ ] Animation and transitions
- [ ] Loading states and skeletons
- [ ] Error handling UI
- [ ] Accessibility improvements

---

### 🎨 Visual Design Tokens

#### Color Palette (from screenshots)
```css
--aha-primary: #5682ef;        /* Main blue */
--aha-red: #f04452;            /* Accent red */
--aha-green: #10b981;          /* Success green */
--aha-yellow: #f59e0b;         /* Warning yellow */
--aha-gray-50: #f9fafb;        /* Lightest gray */
--aha-gray-100: #f3f4f6;       /* Light background */
--aha-gray-600: #4b5563;       /* Text secondary */
--aha-gray-800: #1f2937;       /* Text primary */
```

#### Typography
- **Headers**: -apple-system, Pretendard, sans-serif
- **Body**: 14-16px base size
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

#### Spacing
- Consistent 8px grid system
- Card padding: 20-24px
- Gap between elements: 12-16px

#### Border Radius
- Cards: 12px
- Buttons: 8px
- Pills/Tags: 20px (full rounded)
- Avatars: 50% (circle)

---

### 🔄 Page-by-Page Upgrade Checklist

#### p.1.html (Homepage)
- ✅ Already has basic structure
- ⬜ Add topic-based content filtering
- ⬜ Implement news banner section
- ⬜ Add "Create Space" sidebar widget
- ⬜ Enhanced question cards with voting

#### p.2.html (Login)
- ✅ Basic Google login implemented
- ⬜ Add social proof (user testimonials)
- ⬜ Feature highlights carousel

#### p.3.html (Onboarding)
- ⬜ Multi-step topic selection
- ⬜ Category grid with emoji icons
- ⬜ Progress indicator
- ⬜ Skip option

#### p.4.html (Ask Question)
- ✅ Form structure complete
- ⬜ Add topic suggestion based on content
- ⬜ Similar question detection
- ⬜ Rich text editor toolbar

#### p.7.html (Search)
- ⬜ Create full search page
- ⬜ Recent searches section
- ⬜ Trending topics sidebar
- ⬜ Search filters (by topic, date, type)

#### p.8.html (Profile)
- ⬜ Credentials section
- ⬜ Activity tabs
- ⬜ Knowledge areas
- ⬜ Answer history

#### p.9.html (Categories/Topics)
- ⬜ Topic header with description
- ⬜ Content type tabs
- ⬜ Filter controls
- ⬜ Following button

#### p.12.html (Topic Settings)
- ⬜ Topic preference manager
- ⬜ Add/remove topics
- ⬜ Topic recommendations

---

### 🚀 Priority Order

**High Priority** (Immediate Impact):
1. Topic selection system (p.3.html + p.12.html)
2. Enhanced navigation header
3. Search page (p.7.html)
4. Homepage feed improvements

**Medium Priority** (Enhanced Experience):
5. Profile page enhancements
6. Category pages
7. Notification center
8. Expert ranking display

**Low Priority** (Nice to Have):
9. Advanced filters
10. Rich text editor
11. Similar question detection
12. Analytics dashboard

---

### 📊 Success Metrics

- **User Engagement**: Topic selection completion rate
- **Navigation**: Reduced clicks to find content
- **Search**: Improved search usage and success rate
- **Community**: Increased answer rate on questions
- **Retention**: Return visit frequency

---

**Next Steps**: Begin with Phase 1 (Core Design System) and implement topic selection as the flagship feature.
