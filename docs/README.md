# 🇻🇳 Viet K-Connect

베트남인 한국 거주자를 위한 Q&A 플랫폼

## 📋 프로젝트 개요

**Viet K-Connect**는 한국에 거주하는 베트남인들이 일상생활에서 겪는 다양한 문제들을 해결할 수 있도록 돕는 커뮤니티 기반 Q&A 플랫폼입니다.

### 🎯 주요 목적
- 비자, 취업, 생활, 문화 등 한국 생활 관련 질문과 답변 공유
- 베트남인 커뮤니티 간 정보 교환 및 상호 지원
- AI 기반 자동 분류 및 번역 서비스 제공

## 🏗️ 기술 스택

### Frontend
- **Framework**: Next.js 15 (React 18, TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context + Zustand

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (OAuth 2.0)
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage

### AI Services
- **OpenAI**: GPT-3.5 for question classification and translation

### Deployment
- **Platform**: Vercel
- **Domain**: Ready for production

## 🚀 시작하기

### 환경 설정

1. **저장소 클론**
   ```bash
   git clone https://github.com/your-username/viet-kconnect.git
   cd viet-kconnect
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   ```bash
   cp .env.example .env.local
   ```

   필요한 환경 변수:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

### 배포

```bash
npm run build
npm run deploy
```

## 🔧 주요 기능

### 사용자 기능
- 🔐 소셜 로그인 (Google, Facebook, Kakao)
- ❓ 질문 작성 및 카테고리 분류
- 💬 답변 작성 및 베스트 답변 선택
- 🔍 질문 검색 및 필터링
- 📊 사용자 활동 통계

### AI 기능
- 🤖 질문 자동 분류
- 🌏 한국어-베트남어 번역
- 💡 유사 질문 추천
- ✨ 답변 품질 향상 제안

### 관리 기능
- 📈 실시간 대시보드
- 👥 사용자 관리
- 📝 콘텐츠 모더레이션

## 📊 프로젝트 상태

- **개발 단계**: 베타 (Beta)
- **마지막 업데이트**: 2025년 9월
- **브랜치**: feature/issue-41-supabase

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 연락처

- **프로젝트 링크**: [https://github.com/your-username/viet-kconnect](https://github.com/your-username/viet-kconnect)
- **이슈 리포트**: [GitHub Issues](https://github.com/your-username/viet-kconnect/issues)

---

*"한국에서 생활하는 베트남인들을 위한 따뜻한 커뮤니티 플랫폼"*