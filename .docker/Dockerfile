# Viet K-Connect Production Dockerfile
FROM node:20-alpine

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm ci --only=production

# 빌드된 파일 복사
COPY dist/ ./dist/
COPY admin.html ./

# 정적 파일 서버 설치
RUN npm install -g serve

# 포트 노출
EXPOSE 3000

# 프로덕션 서버 실행
CMD ["serve", "-s", "dist", "-l", "3000"]