# 밝은내일 웹 - HTML 랜딩페이지

브랜드를 닮은 커스터마이징 웹사이트 제작 서비스의 랜딩페이지입니다.

## 🚀 주요 기능

- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 기기에서 최적화
- **접근성**: WCAG 2.1 AA 준수, 키보드 네비게이션, 스크린 리더 지원
- **성능 최적화**: Lighthouse 85+ 점수 목표, 이미지 지연 로딩
- **SEO 최적화**: 메타 태그, Open Graph, JSON-LD 스키마, 사이트맵
- **다단계 폼**: 4단계 견적 요청 폼 (목적/패키지 → 페이지/기능 → 일정/참고 → 연락처)
- **GA4 추적**: 페이지뷰, 패키지 조회, 선택, 폼 제출 이벤트 추적
- **인터랙티브 요소**: 포트폴리오 슬라이더, FAQ 아코디언, 모바일 메뉴

## 🛠 기술 스택

- **HTML5**: 시맨틱 마크업, 접근성 고려
- **CSS3**: Flexbox, Grid, 반응형 디자인, 애니메이션
- **JavaScript (ES6+)**: 모듈화된 클래스 기반 구조
- **Google Analytics 4**: 이벤트 추적 및 전환 분석
- **Google Fonts**: Inter 폰트 패밀리

## 📁 파일 구조

```
밝은내일/
├── index.html              # 메인 HTML 파일
├── styles.css              # 스타일시트
├── script.js               # JavaScript 기능
├── generate-images.html    # 이미지 생성 도구
├── images/                 # 이미지 파일들
│   ├── hero-laptop.png     # 히어로 노트북 이미지
│   ├── hero-mobile.png     # 히어로 모바일 이미지
│   ├── before1.jpg         # 포트폴리오 Before 이미지들
│   ├── after1.jpg          # 포트폴리오 After 이미지들
│   ├── sheets-screenshot.png # 구글시트 스크린샷
│   ├── ga4-screenshot.png  # GA4 스크린샷
│   └── og-image.png        # Open Graph 이미지
├── content/                # 콘텐츠 데이터
│   └── site.ts             # 사이트 콘텐츠 (참고용)
├── public/                 # 정적 파일들
│   ├── sitemap.xml         # 사이트맵
│   └── robots.txt          # 로봇 설정
└── README.md               # 프로젝트 문서
```

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: `#3b82f6` (파란색)
- **Secondary**: `#1d4ed8` (진한 파란색)
- **Text**: `#1a1a1a` (진한 회색)
- **Background**: `#ffffff` (흰색)
- **Gray**: `#f8fafc`, `#e2e8f0`, `#6b7280` (회색 계열)

### 타이포그래피
- **Primary Font**: Inter (Google Fonts)
- **Fallback**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto

### 반응형 브레이크포인트
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 📱 섹션 구성

1. **Header**: 로고, 네비게이션, 모바일 메뉴
2. **Hero**: 메인 헤드라인, CTA 버튼, 디바이스 미리보기
3. **Problem/Solution**: 문제점과 해결책 제시
4. **Packages**: 3가지 패키지 (스파크/빌더/맥스)
5. **Portfolio**: Before/After 슬라이더
6. **Process**: 8단계 제작 프로세스 타임라인
7. **Light Admin**: 구글시트/GA4 관리 시스템
8. **Options**: 추가 옵션 가격표
9. **Policy**: 수정/보증 정책
10. **FAQ**: 아코디언 형태의 자주 묻는 질문
11. **Contact**: 4단계 견적 요청 폼
12. **Footer**: 회사 정보, 링크

## 🚀 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone [repository-url]
cd 밝은내일
```

### 2. 로컬 서버 실행
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server

# PHP
php -S localhost:8000
```

### 3. 브라우저에서 확인
```
http://localhost:8000
```

## 📊 Google Analytics 설정

1. `script.js` 파일에서 GA4 ID 수정:
```javascript
gtag('config', 'G-XXXXXXXXXX'); // 실제 GA4 ID로 변경
```

2. 추적되는 이벤트:
- `page_view`: 페이지 조회
- `view_item_list`: 패키지 목록 조회
- `select_item`: 패키지 선택
- `begin_checkout`: 폼 시작
- `generate_lead`: 폼 제출

## 📝 폼 연동 옵션

### 1. Google Apps Script
```javascript
// script.js의 submitForm 함수에서 주석 해제
const response = await fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec', {
    method: 'POST',
    body: JSON.stringify(this.formData)
});
```

### 2. Netlify Forms
```html
<!-- index.html의 form 태그에 추가 -->
<form name="contact" netlify>
```

### 3. 이메일 서비스 (SendGrid, Mailgun 등)
```javascript
const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(this.formData)
});
```

## 🖼 이미지 생성

`generate-images.html` 파일을 브라우저에서 열어 필요한 이미지들을 생성할 수 있습니다:

1. 브라우저에서 `generate-images.html` 열기
2. 각 이미지 생성 버튼 클릭
3. 다운로드 링크로 이미지 저장
4. `images/` 폴더에 저장

## 📈 성능 최적화

- **이미지 최적화**: WebP 포맷 사용 권장, 적절한 크기로 리사이징
- **폰트 최적화**: `font-display: swap` 적용
- **CSS 최적화**: Critical CSS 인라인, 나머지는 지연 로딩
- **JavaScript 최적화**: 모듈화, 지연 로딩, 번들 최소화

## 🔧 커스터마이징

### 색상 변경
`styles.css`에서 CSS 변수 수정:
```css
:root {
    --primary-color: #3b82f6;
    --secondary-color: #1d4ed8;
    --text-color: #1a1a1a;
}
```

### 콘텐츠 수정
`index.html`에서 직접 텍스트 수정하거나, `content/site.ts`를 참고하여 구조화된 데이터로 관리

### 폼 필드 추가
`index.html`의 폼 섹션에서 필드 추가 후 `script.js`의 유효성 검사 로직 수정

## 🌐 배포

### Vercel
1. GitHub 저장소 연결
2. 빌드 설정 없음 (정적 파일)
3. 자동 배포

### Netlify
1. 저장소 연결 또는 파일 업로드
2. 빌드 명령 없음
3. 배포 URL 제공

### GitHub Pages
1. 저장소 설정에서 Pages 활성화
2. Source를 main 브랜치로 설정
3. `https://username.github.io/repository-name` 접속

## 📱 접근성

- **키보드 네비게이션**: 모든 인터랙티브 요소에 키보드 접근 가능
- **스크린 리더**: ARIA 라벨, 시맨틱 HTML 사용
- **색상 대비**: WCAG AA 기준 충족
- **포커스 표시**: 명확한 포커스 인디케이터
- **스킵 링크**: 메인 콘텐츠로 바로 이동

## 🔒 보안

- **CSP 헤더**: Content Security Policy 설정 권장
- **HTTPS**: 프로덕션 환경에서 HTTPS 필수
- **폼 검증**: 클라이언트/서버 양쪽 검증
- **XSS 방지**: 사용자 입력 데이터 이스케이프

## 📞 지원

- **이슈 리포트**: GitHub Issues 사용
- **문의**: 프로젝트 내 폼 또는 이메일
- **문서**: 이 README 파일 참조

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**밝은내일 웹** - 브랜드를 닮은 커스터마이징, 빠르게 시작합니다.
