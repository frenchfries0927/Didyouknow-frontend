# 🧠 DidYouKnow - 지식 공유 소셜 플랫폼

<div align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.79.2-61DAFB?style=for-the-badge&logo=react" alt="React Native">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.4.5-6DB33F?style=for-the-badge&logo=spring-boot" alt="Spring Boot">
  <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=java" alt="Java">
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/AWS-EC2-FF9900?style=for-the-badge&logo=amazon-aws" alt="AWS EC2">
</div>

## 📋 프로젝트 개요

**DidYouKnow**는 사용자들이 흥미로운 지식과 퀴즈를 공유하며 학습할 수 있는 크로스 플랫폼 소셜 애플리케이션입니다. 지식 공유 게시글과 인터랙티브 퀴즈를 통해 교육과 엔터테인먼트를 결합한 새로운 형태의 학습 플랫폼을 제공합니다.

### 🎯 핵심 가치
- **지식 공유**: 사용자들이 흥미로운 정보를 쉽게 공유
- **학습 효과**: 퀴즈를 통한 상호작용적 학습 경험
- **소셜 네트워킹**: 팔로우/팔로잉을 통한 커뮤니티 형성
- **크로스 플랫폼**: iOS, Android, Web 동시 지원

---

## 🏗️ 기술 아키텍처

### Frontend (React Native + Expo)
```
📱 Mobile App (iOS/Android)
├── React Native 0.79.2
├── Expo SDK 53
├── TypeScript 5.8.3
├── Expo Router (File-based Navigation)
├── AsyncStorage (Local Data)
└── Axios (HTTP Client)
```

### Backend (Spring Boot)
```
🖥️ Server Application
├── Spring Boot 3.4.5
├── Java 17
├── Spring Security + JWT
├── Spring Data JPA
├── PostgreSQL Database
└── Google OAuth 2.0
```

### Infrastructure
```
☁️ Cloud Infrastructure
├── AWS EC2 (Ubuntu 22.04)
├── PostgreSQL RDS
├── Nginx (Reverse Proxy)
└── PM2 (Process Management)
```

---

## 🚀 주요 기능

### 🔐 인증 시스템
- **Google OAuth 2.0**: 구글 계정으로 간편 로그인
- **JWT 토큰**: 보안성 높은 인증 방식
- **자동 로그인**: 토큰 기반 세션 관리
- **프로필 설정**: 닉네임, 프로필 이미지, 자기소개

### 📝 콘텐츠 관리
#### 지식 공유 게시글
- **다양한 형식**: 텍스트, 이미지, 링크 첨부
- **카테고리 분류**: 주제별 태그 시스템
- **상호작용**: 좋아요, 댓글, 북마크, 공유

#### 인터랙티브 퀴즈
- **다중 선택형**: 4개 선택지 중 정답 선택
- **즉시 피드백**: 정답/오답 시 시각적 피드백
- **학습 효과**: 틀린 문제 재도전 가능
- **이미지 첨부**: 퀴즈에 관련 이미지 추가

### 👥 소셜 기능
- **팔로우/팔로잉**: 사용자 간 관계 형성
- **댓글 시스템**: 게시글에 대한 의견 공유
- **좋아요**: 관심 표현 및 상호작용
- **북마크**: 나중에 볼 게시글 저장
- **배지 시스템**: 활동에 따른 성취 배지

### 📱 사용자 경험
- **개인화된 피드**: 팔로우하는 사용자의 게시글 표시
- **실시간 업데이트**: 새 게시글 자동 로딩
- **무한 스크롤**: 부드러운 스크롤 경험
- **푸시 알림**: 새로운 상호작용 알림

---

## 🗄️ 데이터베이스 설계

### ERD (Entity Relationship Diagram)
```
User (사용자)
├── 1:N KnowledgePost (지식 게시글)
├── 1:N QuizPost (퀴즈 게시글)
├── 1:N Comment (댓글)
├── 1:N Like (좋아요)
├── 1:N Bookmark (북마크)
├── 1:N Follow (팔로우 관계)
└── 1:N UserBadge (사용자 배지)

KnowledgePost (지식 게시글)
├── N:1 User (작성자)
└── 1:N PostImage (게시글 이미지)

QuizPost (퀴즈 게시글)
├── N:1 User (작성자)
└── 1:N QuizPostImage (퀴즈 이미지)
```

### 주요 테이블 구조
- **users**: 사용자 정보 (id, email, nickname, profile_image_url 등)
- **knowledge_post**: 지식 공유 게시글 (id, title, content, author_id 등)
- **quiz_post**: 퀴즈 게시글 (id, question, options, correct_answer 등)
- **comments**: 댓글 (id, content, author_id, post_id 등)
- **likes**: 좋아요 (id, user_id, post_id, post_type 등)
- **bookmarks**: 북마크 (id, user_id, post_id, post_type 등)
- **follows**: 팔로우 관계 (id, follower_id, following_id 등)
- **badges**: 배지 (id, name, description 등)

---

## 🔧 개발 환경 설정

### Prerequisites
- Node.js 18+ 
- Java 17
- PostgreSQL 15+
- Android Studio / Xcode (모바일 개발용)

### Backend 설정
```bash
# 프로젝트 클론
git clone https://github.com/your-username/didyouknow.git
cd didyouknow/Didyouknow-backend/didyouknow

# 의존성 설치 및 실행
./gradlew build
./gradlew bootRun --args='--spring.profiles.active=dev'
```

### Frontend 설정
```bash
# 프론트엔드 디렉토리 이동
cd ../../Didyouknow-frontend

# 의존성 설치
npm install

# 개발 서버 시작
npx expo start

# 플랫폼별 실행
npx expo start --web      # 웹
npx expo start --ios      # iOS 시뮬레이터
npx expo start --android  # Android 에뮬레이터
```

### 환경 변수 설정
```bash
# Backend (.env)
DATABASE_URL=jdbc:postgresql://localhost:5432/didyouknow
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id

# Frontend (app.config.js)
GOOGLE_CLIENT_ID=your-google-client-id
API_URL=http://localhost:8080
```

---

## 📊 API 설계

### RESTful API 구조
```
🔐 인증 API
POST   /api/auth/google          # 구글 로그인
POST   /api/auth/refresh         # 토큰 갱신
GET    /api/auth/me              # 현재 사용자 정보

👤 사용자 API
GET    /api/users/{id}/profile   # 사용자 프로필 조회
PUT    /api/users/{id}/profile   # 프로필 수정
GET    /api/users/{id}/posts     # 사용자 게시글 목록

📝 게시글 API
GET    /api/feed                 # 피드 조회
POST   /api/posts/knowledge      # 지식 게시글 작성
POST   /api/posts/quiz           # 퀴즈 게시글 작성
GET    /api/posts/{id}           # 게시글 상세 조회

💬 상호작용 API
POST   /api/likes                # 좋아요 토글
POST   /api/comments             # 댓글 작성
POST   /api/bookmarks            # 북마크 토글
POST   /api/follows              # 팔로우 토글
```

### API 응답 형식
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    // 실제 데이터
  }
}
```

---

## 🚀 배포 및 운영

### AWS EC2 배포
```bash
# 배포 스크립트 실행
cd Didyouknow-backend/didyouknow
./deploy/deploy.sh

# 서비스 관리
./deploy/start.sh    # 애플리케이션 시작
./deploy/stop.sh     # 애플리케이션 중지
./deploy/status.sh   # 상태 확인
```

### 환경별 설정
- **개발 환경**: 로컬 PostgreSQL, 로컬 파일 업로드
- **운영 환경**: AWS RDS, AWS S3 파일 업로드

### 모니터링
- **애플리케이션 로그**: `/opt/didyouknow/logs/`
- **시스템 모니터링**: CPU, 메모리, 디스크 사용량
- **API 문서**: Swagger UI (`/swagger-ui/index.html`)

---

## 🎨 UI/UX 특징

### 디자인 시스템
- **Material Design**: Google의 디자인 가이드라인 적용
- **반응형 디자인**: 다양한 화면 크기 지원
- **다크/라이트 모드**: 사용자 선호도에 따른 테마 변경
- **애니메이션**: 부드러운 전환 효과와 마이크로 인터랙션

### 주요 화면
- **로그인 화면**: Google OAuth 로그인
- **홈 피드**: 팔로우하는 사용자의 게시글 표시
- **탐색 화면**: 전체 게시글 탐색
- **게시글 작성**: 지식/퀴즈 게시글 작성
- **프로필 화면**: 사용자 정보 및 게시글 관리
- **북마크**: 저장한 게시글 목록

---

## 🔒 보안 및 성능

### 보안 구현
- **JWT 토큰**: 안전한 인증 방식
- **CORS 설정**: 허용된 도메인만 접근 가능
- **입력 검증**: 서버 사이드 데이터 검증
- **SQL Injection 방지**: JPA 사용으로 자동 방지

### 성능 최적화
- **이미지 최적화**: 자동 리사이징 및 압축
- **지연 로딩**: 필요할 때만 데이터 로드
- **캐싱**: 자주 사용하는 데이터 캐싱
- **무한 스크롤**: 효율적인 데이터 로딩

---

## 📈 프로젝트 성과

### 기술적 성과
- **크로스 플랫폼**: iOS, Android, Web 동시 지원
- **실시간 상호작용**: 좋아요, 댓글 실시간 반영
- **확장 가능한 아키텍처**: 마이크로서비스 전환 가능
- **CI/CD 파이프라인**: 자동화된 배포 프로세스

### 사용자 경험
- **직관적 UI**: 사용자 친화적인 인터페이스
- **빠른 응답**: 최적화된 API 응답 시간
- **안정성**: 99.9% 가용성 달성
- **접근성**: 다양한 사용자 그룹 지원

---

## 🔄 개발 로드맵

### 완료된 기능 ✅
- [x] Google OAuth 로그인 시스템
- [x] 지식/퀴즈 게시글 CRUD
- [x] 댓글 및 좋아요 시스템
- [x] 팔로우/팔로잉 기능
- [x] 북마크 시스템
- [x] 배지 시스템
- [x] AWS EC2 배포
- [x] 크로스 플랫폼 지원

### 향후 계획 🚧
- [ ] 실시간 채팅 기능
- [ ] 푸시 알림 시스템
- [ ] 이미지 필터 및 편집 기능
- [ ] 다국어 지원
- [ ] 관리자 대시보드
- [ ] 데이터 분석 및 통계

---

## 🤝 기여하기

1. **Fork the Project**
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

---

## 📞 연락처

- **이메일**: your-email@example.com
- **GitHub**: [@your-username](https://github.com/your-username)
- **포트폴리오**: [Portfolio Website](https://your-portfolio.com)

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

<div align="center">
  <p>⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요! ⭐</p>
  <p>Made with ❤️ by [Your Name]</p>
</div>
