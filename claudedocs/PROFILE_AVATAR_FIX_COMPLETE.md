# 프로필 아바타 기본 이미지 수정 완료

**작성일**: 2025-10-15
**작업**: 프로필 아바타에 텍스트 제거, 기본 아이콘만 표시
**상태**: ✅ 완료

---

## 📋 문제점

### Before
- ❌ 아바타에 작성자 이름 첫 글자 표시 (예: "T", "N", "익")
- ❌ CSS `::before` 아이콘과 HTML 텍스트가 중복 표시

### After
- ✅ 기본 프로필 아이콘(👤)만 표시
- ✅ CSS `::before`로 정의된 아이콘 사용
- ✅ 향후 프로필 사진 업로드 시 교체 가능한 구조

---

## 🎨 CSS 구조 (이미 정의되어 있음)

### `/app/globals.css` (라인 6427, 10084)

```css
.author-avatar-small {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e4e6eb;  /* Facebook 기본 회색 배경 */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #65676b;  /* Facebook 아이콘 회색 */
  font-weight: 400;
  font-size: 18px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s ease;
  overflow: hidden;
  position: relative;
}

.author-avatar-small::before {
  content: '👤';  /* Unicode 사람 아이콘 - 기본 프로필 */
  display: block;
}

.author-avatar-small:hover {
  background: #d8dadf;  /* Facebook 호버 색상 */
}
```

**특징**:
- Facebook 스타일 기본 회색 배경 (#e4e6eb)
- 기본 프로필 아이콘 👤 (::before pseudo-element)
- 호버 시 배경색 변경 (#d8dadf)
- 36px 원형 아바타

---

## 🔧 수정된 파일

### 1. `/app/page.tsx` - 메인 페이지

#### Before
```tsx
<div className="author-avatar-small">
  {item.author.name?.[0] || '익'}
</div>
```

#### After
```tsx
<div className="author-avatar-small"></div>
```

---

### 2. `/app/questions/page.tsx` - 질문 목록

#### Before
```tsx
<div className="author-avatar-small">
  {author.name?.[0] || '익'}
</div>
```

#### After
```tsx
<div className="author-avatar-small"></div>
```

---

### 3. `/app/questions/[id]/page.tsx` - 질문 상세

#### Before (질문 카드)
```tsx
<div className="author-avatar-small">
  {question.author?.name?.[0] || '익'}
</div>
```

#### After (질문 카드)
```tsx
<div className="author-avatar-small"></div>
```

#### Before (답변 카드)
```tsx
<div className="author-avatar-small">
  {answer.author.name[0]}
</div>
```

#### After (답변 카드)
```tsx
<div className="author-avatar-small"></div>
```

---

## 📊 아바타 표시 방식

### 현재 (기본 아이콘)
```
┌─────────┐
│   👤    │  ← CSS ::before로 표시
└─────────┘
```

### 향후 (프로필 사진 업로드 시)
```tsx
// 프로필 사진이 있는 경우
<div
  className="author-avatar-small"
  style={{
    backgroundImage: `url(${user.profileImage})`,
    backgroundSize: 'cover'
  }}
></div>
```

**구현 방법**:
1. `backgroundImage`로 사진 설정 시 `::before` 아이콘이 가려짐
2. 사진이 없으면 기본 아이콘(👤) 표시
3. CSS 수정 불필요

---

## ✅ 수정 완료 체크리스트

### 모든 페이지
- [x] 메인 페이지 (`/`) - 아바타 텍스트 제거
- [x] 질문 목록 (`/questions`) - 아바타 텍스트 제거
- [x] 질문 상세 - 질문 카드 - 아바타 텍스트 제거
- [x] 질문 상세 - 답변 카드 - 아바타 텍스트 제거

### CSS 스타일
- [x] 기본 프로필 아이콘(👤) ::before로 정의
- [x] Facebook 스타일 회색 배경 (#e4e6eb)
- [x] 호버 효과 적용 (#d8dadf)

### 향후 확장성
- [x] 프로필 사진 업로드 준비 완료
- [x] backgroundImage로 교체 가능한 구조

---

## 🎯 결과

### 현재 표시
- **모든 사용자**: 기본 프로필 아이콘 👤 표시
- **배경**: Facebook 스타일 회색 (#e4e6eb)
- **크기**: 36px × 36px (모바일: 32px)

### 일관성 확보
- **Before**: 페이지마다 다른 아바타 표시 (텍스트 vs 아이콘)
- **After**: 모든 페이지에서 동일한 기본 아이콘 표시 ✅

### 향후 개선
- 프로필 사진 업로드 기능 추가 시
- `backgroundImage`로 간단히 교체 가능
- CSS 수정 불필요

---

**작성자**: Claude Code
**완료 시간**: 2025-10-15
**다음**: 프로필 사진 업로드 기능 구현 대기
