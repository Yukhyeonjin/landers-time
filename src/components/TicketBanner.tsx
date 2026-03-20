"use client";

const APP_STORE_URL = "https://apps.apple.com/kr/app/ssg-landers/id972556231";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.skt.ilbs.skwyverns.app&hl=ko";
const ANDROID_INTENT = "intent://main#Intent;scheme=ssglanders;package=com.skt.ilbs.skwyverns.app;S.browser_fallback_url=" + encodeURIComponent(PLAY_STORE_URL) + ";end";

function openApp() {
  const ua = navigator.userAgent;
  const isAndroid = /android/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua);

  if (isAndroid) {
    window.location.href = ANDROID_INTENT;
  } else if (isIOS) {
    // iOS: App Store 페이지로 바로 이동 (앱 설치 시 자동으로 "열기" 표시)
    window.location.href = APP_STORE_URL;
  } else {
    window.open(PLAY_STORE_URL, "_blank");
  }
}

export default function TicketBanner() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* 티켓 예매 */}
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏟</span>
          <span className="text-base font-semibold text-text">정규 입장권 예매</span>
        </div>
        <p className="text-sm text-text-dim">
          ticket.ssg.com
        </p>
        <a
          href="https://ticket.ssg.com/ticket"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex w-fit items-center gap-1 rounded-lg bg-landers-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-landers-gold hover:text-text"
        >
          예매 사이트 열기 →
        </a>
      </div>

      {/* SSG 랜더스 앱 */}
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📱</span>
          <span className="text-base font-semibold text-text">SSG 랜더스 앱</span>
        </div>
        <p className="text-sm text-text-dim">
          멤버십 가입 &amp; 선예매
        </p>
        <button
          onClick={openApp}
          className="mt-auto inline-flex w-fit items-center gap-1 rounded-lg bg-landers-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-landers-gold hover:text-text cursor-pointer"
        >
          앱 열기 →
        </button>
      </div>

      {/* 좌석 보기 */}
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💺</span>
          <span className="text-base font-semibold text-text">좌석 보기</span>
        </div>
        <p className="text-sm text-text-dim">
          SSG랜더스필드 좌석 시야 확인
        </p>
        <a
          href="https://myseatcheck.com/%EC%9D%B8%EC%B2%9C-ssg-%EB%9E%9C%EB%8D%94%EC%8A%A4%ED%95%84%EB%93%9C/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex w-fit items-center gap-1 rounded-lg bg-landers-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-landers-gold hover:text-text"
        >
          좌석 시야 확인 →
        </a>
      </div>
    </div>
  );
}
