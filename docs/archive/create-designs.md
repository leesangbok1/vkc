# Viet K-Connect 디자인 테마 시스템

## 현재 구현된 베이스 테마
**베트남 국기 테마** (현재 적용)
- Primary: #EA4335 (베트남 빨강)
- Secondary: #FFCD00 (베트남 노랑)
- Success: #10B981 (신뢰 그린)
- Expert: #F59E0B (전문가 골드)

---

## 1. 미니멀 테마 (Minimal Theme)
*깔끔하고 단순한 인터페이스 중심*

### 색상 팔레트
```css
--minimal-primary: #2563EB;      /* 차분한 블루 */
--minimal-secondary: #64748B;    /* 그레이 */
--minimal-accent: #0EA5E9;       /* 라이트 블루 */
--minimal-text: #1E293B;         /* 다크 그레이 */
--minimal-bg: #F8FAFC;           /* 오프 화이트 */
--minimal-border: #E2E8F0;       /* 라이트 그레이 */
```

### 디자인 특징
- **여백 강조**: 넉넉한 패딩과 마진
- **타이포그래피**: Inter 폰트, 깔끔한 계층구조
- **그림자**: 최소한의 subtle shadow
- **버튼**: 플랫 디자인, 명확한 호버 상태
- **카드**: 얇은 보더, 최소 그림자

### UI 요소 변경점
- 뱃지: 단색 배경, 텍스트만
- 아이콘: Lucide React (선형 아이콘)
- 버튼: border-radius: 6px
- 카드: border-radius: 8px

---

## 2. 럭셔리 테마 (Luxury Theme)
*프리미엄하고 우아한 느낌*

### 색상 팔레트
```css
--luxury-primary: #7C3AED;       /* 로얄 퍼플 */
--luxury-secondary: #D97706;     /* 골드 오렌지 */
--luxury-accent: #EC4899;        /* 로즈 핑크 */
--luxury-text: #1F2937;          /* 차콜 */
--luxury-bg: #FAFAFA;            /* 크림 화이트 */
--luxury-gold: #F59E0B;          /* 골드 액센트 */
```

### 디자인 특징
- **그라데이션**: 부드러운 그라데이션 배경
- **타이포그래피**: Playfair Display (헤딩), Noto Sans KR (본문)
- **그림자**: 깊고 부드러운 그림자 효과
- **버튼**: 그라데이션 배경, 골드 테두리
- **카드**: 부드러운 곡선, 프리미엄 그림자

### UI 요소 변경점
- 뱃지: 그라데이션 배경, 골드 테두리
- 아이콘: 일부 filled 아이콘 사용
- 버튼: border-radius: 12px
- 카드: border-radius: 16px
- 헤더: 그라데이션 배경

---

## 3. 네이쳐 테마 (Nature Theme)
*자연스럽고 친환경적인 느낌*

### 색상 팔레트
```css
--nature-primary: #059669;       /* 포레스트 그린 */
--nature-secondary: #92400E;     /* 어스 브라운 */
--nature-accent: #0891B2;        /* 스카이 블루 */
--nature-text: #1F2937;          /* 다크 차콜 */
--nature-bg: #F0FDF4;            /* 라이트 그린 */
--nature-warm: #FED7AA;          /* 웜 피치 */
```

### 디자인 특징
- **자연 색상**: 녹색, 갈색, 하늘색 기반
- **타이포그래피**: Nunito (친근한 라운드 폰트)
- **텍스처**: 미묘한 패턴 배경
- **버튼**: 둥근 모서리, 자연스러운 그림자
- **카드**: 유기적 형태, 따뜻한 그림자

### UI 요소 변경점
- 뱃지: 자연 색상, 둥근 형태
- 아이콘: 자연 관련 아이콘 추가 (잎사귀, 나무 등)
- 버튼: border-radius: 20px
- 카드: border-radius: 20px
- 배경: 미묘한 텍스처 패턴

---

## 4. 직관형 테마 (Intuitive Theme)
*사용성과 접근성 최우선*

### 색상 팔레트
```css
--intuitive-primary: #2563EB;    /* 명확한 블루 */
--intuitive-success: #16A34A;    /* 명확한 그린 */
--intuitive-warning: #EA580C;    /* 명확한 오렌지 */
--intuitive-error: #DC2626;      /* 명확한 레드 */
--intuitive-text: #111827;       /* 높은 대비 검정 */
--intuitive-bg: #FFFFFF;         /* 순백 */
```

### 디자인 특징
- **고대비**: WCAG AAA 준수 색상 대비
- **큰 터치 영역**: 최소 48px 터치 타겟
- **명확한 피드백**: 호버, 포커스, 활성 상태 명확
- **일관성**: 예측 가능한 인터랙션 패턴
- **접근성**: 스크린 리더 최적화

### UI 요소 변경점
- 버튼: 큰 크기, 명확한 라벨
- 아이콘: 의미가 명확한 아이콘만 사용
- 텍스트: 충분한 크기 (최소 16px)
- 색상: 의미와 직결되는 색상 사용
- 피드백: 즉각적이고 명확한 상태 변화

---

## 테마 적용 방법

### 1. CSS 변수 교체
```css
/* globals.css에서 루트 변수 변경 */
:root {
  /* 현재: 베트남 테마 */
  --vietnam-red: #EA4335;
  --vietnam-yellow: #FFCD00;

  /* 변경: 선택한 테마 변수로 교체 */
  --primary: var(--minimal-primary);
  --secondary: var(--minimal-secondary);
}
```

### 2. 컴포넌트 스타일 조정
```typescript
// 각 테마별 className 조건부 적용
const themeClasses = {
  minimal: 'rounded-lg shadow-sm',
  luxury: 'rounded-2xl shadow-xl bg-gradient-to-r',
  nature: 'rounded-3xl shadow-lg',
  intuitive: 'rounded-md shadow-md border-2'
}
```

### 3. 테마 전환 시스템
```typescript
// 테마 상태 관리
const [currentTheme, setCurrentTheme] = useState('vietnam')

// 테마 전환 함수
const switchTheme = (themeName: string) => {
  document.documentElement.setAttribute('data-theme', themeName)
  setCurrentTheme(themeName)
  localStorage.setItem('theme', themeName)
}
```

---

## 구현 우선순위

1. **미니멀 테마** - 가장 구현하기 쉬움
2. **직관형 테마** - 접근성 개선 효과
3. **네이쳐 테마** - 베트남 커뮤니티에 어울림
4. **럭셔리 테마** - 가장 복잡한 구현

---

## 현재 프로젝트 적용 방안

### 즉시 적용 가능
- CSS 변수 기반이므로 `globals.css` 수정만으로 테마 변경 가능
- 기존 shadcn/ui 컴포넌트와 호환

### 추가 개발 필요
- 테마 선택 UI (Header에 추가)
- 테마별 조건부 스타일링
- localStorage 기반 테마 저장

---

*베이스 프로젝트: Viet K-Connect Next.js UI*
*위치: `/Users/bk/Desktop/viet-kconnect/`*
*현재 실행: http://localhost:3000*