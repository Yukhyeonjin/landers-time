# 랜더스타임

SSG 랜더스 팬을 위한 티켓팅 헬퍼 웹사이트입니다.

ticket.ssg.com 서버 시각을 실시간으로 동기화하여 선예매 오픈 순간을 정확히 노릴 수 있도록 도와줍니다.

## 주요 기능

### 서버 시각 실시간 표시
- ticket.ssg.com 서버와 시간 동기화 (30초 간격 자동 갱신)
- 밀리초 단위까지 표시
- 네트워크 지연 보정

### 나의 멤버십
- 멤버십 등급별(랜디/배티/푸리/일반) 선예매 오픈 일정 확인
- 다가오는 홈경기 3개를 카드 형태로 표시
- D-day 카운트 및 선예매 오픈 상태 표시

### 경기 일정
- 2026 정규시즌 전체 일정 (홈 + 원정)
- 목록 뷰 / 달력 뷰 전환
- 홈 / 원정 / 전체 필터
- 공휴일 및 요일별 색상 구분
- 원정 경기는 상대 팀 고유 색상으로 표시

### 예매 빠른 이동
- ticket.ssg.com 바로가기
- SSG 랜더스 앱 딥링크 (모바일에서 앱 자동 실행, 미설치 시 스토어 이동)
- SSG랜더스필드 좌석 시야 확인

## 기술 스택

- **Framework**: Next.js 15 + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Font**: Pretendard Variable

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

http://localhost:3000 에서 확인할 수 있습니다.

## 환경 변수

`.env.local` 파일에 다음 값을 설정하세요:

```
HOLIDAY_API_KEY=공공데이터포털_API_키
```

공휴일 API 키는 [공공데이터포털](https://www.data.go.kr/)에서 발급받을 수 있습니다.

## 데이터 출처

- 경기 일정: [SSG 랜더스 공식 사이트](https://www.ssglanders.com/game/schedule)
- 공휴일: [공공데이터포털 특일 정보 API](https://www.data.go.kr/)
- 서버 시각: ticket.ssg.com HEAD 요청

## 참고

본 사이트는 SSG 랜더스 공식 사이트가 아닙니다. 정확한 예매 일정은 구단 공식 채널을 확인하세요.
