import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-6xl text-landers-red">404</h1>
        <p className="mt-4 text-text-dim">페이지를 찾을 수 없습니다.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-landers-red px-6 py-2 text-sm font-bold text-white hover:bg-landers-gold hover:text-text transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
