# DidYouKnow - 지식 공유 플랫폼

## 📖 프로젝트 개요

DidYouKnow는 사용자들이 흥미로운 지식과 퀴즈를 공유하고 소통할 수 있는 소셜 플랫폼입니다. 지식 공유 게시글과 퀴즈 게시글을 통해 학습과 재미를 동시에 경험할 수 있습니다.

## 🏗️ 기술 스택

### Backend
- **Framework**: Spring Boot 3.4.5
- **Language**: Java 17
- **Database**: PostgreSQL
- **Authentication**: JWT + Google OAuth
- **Build Tool**: Gradle
- **Deployment**: AWS EC2

### Frontend
- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: React Hooks + AsyncStorage
- **UI Components**: Custom Components + Ionicons

## 🚀 주요 기능

### 1. 사용자 관리
- **Google OAuth 로그인**: 구글 계정으로 간편 로그인
- **프로필 관리**: 닉네임, 프로필 이미지, 자기소개 설정
- **배지 시스템**: 활동에 따른 배지 획득

### 2. 지식 공유 게시글
- **다양한 형식**: 텍스트, 이미지, 링크 첨부 가능
- **카테고리 분류**: 주제별 분류 및 태그 시스템
- **상호작용**: 좋아요, 댓글, 북마크, 공유 기능

### 3. 퀴즈 게시글
- **다중 선택형 퀴즈**: 4개 선택지 중 정답 선택
- **즉시 피드백**: 정답/오답 시 색상 피드백 제공
- **학습 효과**: 틀린 문제 재도전 가능

### 4. 소셜 기능
- **팔로우/팔로잉**: 사용자 간 관계 형성
- **댓글 시스템**: 게시글에 대한 의견 공유
- **좋아요**: 관심 표현 및 상호작용
- **북마크**: 나중에 볼 게시글 저장

### 5. 피드 시스템
- **개인화된 피드**: 팔로우하는 사용자의 게시글 표시
- **실시간 업데이트**: 새 게시글 자동 로딩
- **무한 스크롤**: 부드러운 스크롤 경험

## 📱 화면 구성

### 인증 화면
- `LoginScreen.tsx`: 구글 로그인 화면
- `SignupFlow.tsx`: 회원가입 플로우
- `ProfileSetup.tsx`: 프로필 설정
- `AlarmSetup.tsx`: 알림 설정

### 메인 화면
- `index.tsx`: 홈 피드 화면
- `explore.tsx`: 탐색 화면
- `create.tsx`: 게시글 작성 화면
- `bookmarks.tsx`: 북마크 목록
- `profile.tsx`: 내 프로필

### 상호작용 화면
- `followers.tsx`: 팔로워 목록
- `following.tsx`: 팔로잉 목록
- `post-detail.tsx`: 게시글 상세보기
- `user-profile.tsx`: 다른 사용자 프로필

## 🗄️ 데이터베이스 구조

### 핵심 엔티티
- **User**: 사용자 정보 (id, email, nickname, profileImageUrl 등)
- **KnowledgePost**: 지식 공유 게시글 (id, title, content, authorId 등)
- **QuizPost**: 퀴즈 게시글 (id, question, options, correctAnswer 등)
- **Comment**: 댓글 (id, content, authorId, postId 등)
- **Like**: 좋아요 (id, userId, postId, postType 등)
- **Bookmark**: 북마크 (id, userId, postId, postType 등)
- **Follow**: 팔로우 관계 (id, followerId, followingId 등)
- **Badge**: 배지 (id, name, description 등)

## 🔧 개발 환경 설정

### Backend 설정
```bash
cd Didyouknow-backend/didyouknow
./gradlew bootRun --args='--spring.profiles.active=dev'
```

### Frontend 설정
```bash
cd Didyouknow-frontend
npm install
npx expo start --web
```

### 환경 변수
- **로컬 환경**: `http://localhost:8080`
- **AWS 환경**: `http://13.125.111.127:8080`
- **프로필**: `application-dev.properties` / `application-prod.properties`

## 🔐 인증 시스템

### JWT 기반 인증
- **토큰 발급**: 로그인 시 JWT 토큰 생성
- **토큰 검증**: API 요청 시 자동 검증
- **토큰 갱신**: 만료 시 자동 갱신

### Google OAuth
- **OAuth 2.0**: 구글 계정 연동
- **사용자 정보**: 이메일, 이름, 프로필 이미지 자동 수집
- **자동 로그인**: 토큰 기반 자동 로그인

## 📊 API 구조

### 인증 API
- `POST /api/auth/google`: 구글 로그인
- `POST /api/auth/refresh`: 토큰 갱신
- `GET /api/auth/me`: 현재 사용자 정보

### 사용자 API
- `GET /api/users/{id}/profile`: 사용자 프로필 조회
- `PUT /api/users/{id}/profile`: 프로필 수정
- `GET /api/users/{id}/posts`: 사용자 게시글 목록

### 게시글 API
- `GET /api/feed`: 피드 조회
- `POST /api/posts/knowledge`: 지식 게시글 작성
- `POST /api/posts/quiz`: 퀴즈 게시글 작성
- `GET /api/posts/{id}`: 게시글 상세 조회

### 상호작용 API
- `POST /api/likes`: 좋아요 토글
- `POST /api/comments`: 댓글 작성
- `POST /api/bookmarks`: 북마크 토글
- `POST /api/follows`: 팔로우 토글

## 🚀 배포

### AWS 배포
- **EC2 인스턴스**: Ubuntu 20.04
- **데이터베이스**: PostgreSQL
- **배포 스크립트**: `deploy/deploy.sh`
- **서비스 관리**: `deploy/start.sh`, `deploy/stop.sh`

### 환경별 설정
- **개발 환경**: 로컬 PostgreSQL, 로컬 파일 업로드
- **운영 환경**: AWS RDS, AWS S3 파일 업로드

## 🎯 주요 특징

### 1. 크로스 플랫폼
- **React Native**: iOS, Android 동시 지원
- **Expo**: 빠른 개발 및 배포
- **웹 지원**: 브라우저에서도 사용 가능

### 2. 실시간 상호작용
- **즉시 피드백**: 좋아요, 댓글 실시간 반영
- **푸시 알림**: 새로운 상호작용 알림
- **실시간 업데이트**: 피드 자동 새로고침

### 3. 사용자 경험
- **직관적 UI**: 깔끔하고 모던한 디자인
- **부드러운 애니메이션**: 자연스러운 전환 효과
- **반응형 디자인**: 다양한 화면 크기 지원

### 4. 성능 최적화
- **이미지 최적화**: 자동 리사이징 및 압축
- **지연 로딩**: 필요할 때만 데이터 로드
- **캐싱**: 자주 사용하는 데이터 캐싱

## 🔄 최근 업데이트

### v1.2.0 (현재)
- ✅ JWT 인증에서 userId 파라미터 방식으로 변경
- ✅ 퀴즈 게시글 정답 노출 문제 해결
- ✅ 팔로워/팔로잉 기능 개선
- ✅ AsyncStorage 기반 사용자 정보 관리
- ✅ CORS 설정 개선

### v1.1.0
- ✅ Google OAuth 로그인 구현
- ✅ 지식/퀴즈 게시글 작성 기능
- ✅ 댓글 및 좋아요 시스템
- ✅ 팔로우/팔로잉 기능

### v1.0.0
- ✅ 기본 CRUD 기능 구현
- ✅ 사용자 인증 시스템
- ✅ 기본 UI/UX 구현

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 동영상

https://www.youtube.com/watch?v=doOcnzYrbcc

## 📞 연락처

프로젝트에 대한 문의사항이 있으시면 언제든지 연락주세요.

---

**DidYouKnow** - 지식을 나누고, 함께 성장하세요! 🚀
