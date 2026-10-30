"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "prepChecklist";

const ITEMS = [
  { id: "login", text: "SSG닷컴 회원가입 + 로그인 상태 유지" },
  { id: "pay", text: "결제수단(카드·SSGPAY) 미리 등록" },
  { id: "app", text: "SSG 랜더스 앱 최신 버전 업데이트" },
  { id: "member", text: "멤버십 가입 — 인기 경기는 배티 이상 권장 (3월 말 마감)" },
  { id: "seat", text: "원하는 좌석 1·2·3순위 정해두기" },
  { id: "clock", text: "이 페이지 서버 시각 + 🔔 알림 켜두기" },
  { id: "reaction", text: "⚡ 반응속도 측정해서 알림 보정하기" },
  { id: "practice", text: "🎮 티켓팅 연습 한 판 하고 손 풀기" },
  { id: "cancel", text: "실패하면 자정 0시 10분 취소표 재도전 (앱+PC 동시 접속)" },
];

export default function PrepChecklist() {
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      setDone(new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")));
    } catch { /* ignore */ }
  }, []);

  const toggle = (id: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch { /* ignore */ }
      return next;
    });

  const count = ITEMS.filter((i) => done.has(i.id)).length;
  const all = count === ITEMS.length;

  return (
    <div className="mt-10 rounded-2xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-semibold text-text">✅ 예매 준비 체크리스트</h3>
        <span className="text-xs tabular-nums text-text-dim">
          {count}/{ITEMS.length}
        </span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-surface2">
        <div
          className="h-full rounded-full bg-landers-red transition-all"
          style={{ width: `${(count / ITEMS.length) * 100}%` }}
        />
      </div>
      <ul className="space-y-2">
        {ITEMS.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer items-start gap-2 text-sm text-text">
              <input
                type="checkbox"
                checked={done.has(item.id)}
                onChange={() => toggle(item.id)}
                className="mt-0.5 h-4 w-4 flex-shrink-0 accent-landers-red"
              />
              <span className={done.has(item.id) ? "text-text-muted line-through" : ""}>
                {item.text}
              </span>
            </label>
          </li>
        ))}
      </ul>
      {all && (
        <p className="mt-4 rounded-xl bg-landers-gold/20 px-3 py-2 text-center text-sm font-semibold text-text">
          🎉 준비 완료! 이제 11시 정각만 기다리면 돼요
        </p>
      )}
    </div>
  );
}
