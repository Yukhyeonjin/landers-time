# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SSG 랜더스 팬을 위한 경기 일정 + 티켓 예매 안내 사이트 "랜더스타임(LandersTime)".
핵심 기능: 2026 정규시즌 경기 일정(홈/원정), ticket.ssg.com 서버 시각 실시간 밀리초 시계, 예매 사이트 빠른 이동.

## Commands

```bash
pnpm dev          # 개발 서버
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버
pnpm lint         # ESLint
```

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript** + **React 19**
- **Tailwind CSS v4** — `@theme` 디렉티브로 디자인 토큰 정의 (`src/app/globals.css`)
- **Pretendard** 웹폰트 (CDN), **lucide-react** 아이콘
- shadcn/ui 미사용 — 모든 컴포넌트 직접 구현 (Tailwind utility class 기반)

## Architecture

### 디자인 토큰

`src/app/globals.css`에서 Tailwind v4 `@theme`으로 커스텀 색상/폰트 정의. 현재 라이트 테마.
주요 토큰: `landers-red`, `landers-gold`, `bg`, `bg-soft`, `surface`, `surface2`, `border`, `text`, `text-dim`, `text-muted`

### API Routes

- `GET /api/server-time` — ticket.ssg.com HEAD 요청으로 서버 시각 가져오기 (CORS 우회 프록시). 네트워크 레이턴시 편도 보정 포함.
- `GET /api/holidays?solYear=YYYY` — 공공데이터포털 공휴일 API 프록시. `HOLIDAY_API_KEY` 환경변수 필요.

### Client-Side 서버 시각 동기화

`src/lib/serverTime.ts`의 `ServerClock` 싱글턴 객체가 offset 기반으로 서버 시각 추적.
`ServerClockWidget`에서 50ms 간격 화면 갱신, 30초 간격 재동기화.

### 경기 데이터

`src/data/schedule2026.ts` — 정적 배열. `Game` 타입: date, day, time, opponent, home, stadium.
홈/원정 모두 포함. 3월~9월 정규시즌.

## Environment Variables

- `HOLIDAY_API_KEY` — 공공데이터포털 특일정보 API 서비스키 (없으면 holidays API 500 반환, 클라이언트는 폴백 데이터 사용)
