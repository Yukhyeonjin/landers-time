"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const SEAT_MAP_URL = "https://www.ssglanders.com/img/game/seat_2026.png";
const MYSEATCHECK_URL =
  "https://myseatcheck.com/%EC%9D%B8%EC%B2%9C-ssg-%EB%9E%9C%EB%8D%94%EC%8A%A4%ED%95%84%EB%93%9C/";

export default function SeatGuide() {
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const clampPos = useCallback((x: number, y: number, s: number) => {
    if (s <= 1) return { x: 0, y: 0 };
    const el = containerRef.current;
    if (!el) return { x, y };
    const w = el.clientWidth;
    const h = el.clientHeight;
    const maxX = ((s - 1) * w) / 2;
    const maxY = ((s - 1) * h) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, []);

  const zoom = useCallback(
    (dir: 1 | -1) => {
      setScale((prev) => {
        const next = Math.max(1, Math.min(4, prev + dir * 0.5));
        if (next <= 1) setPos({ x: 0, y: 0 });
        else setPos((p) => clampPos(p.x, p.y, next));
        return next;
      });
    },
    [clampPos],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (scale <= 1) return;
      e.preventDefault();
      setDragging(true);
      setStartDrag({ x: e.clientX, y: e.clientY });
      setStartPos({ ...pos });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [scale, pos],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startDrag.x;
      const dy = e.clientY - startDrag.y;
      setPos(clampPos(startPos.x + dx, startPos.y + dy, scale));
    },
    [dragging, startDrag, startPos, scale, clampPos],
  );

  const onPointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const lastDist = useRef(0);
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastDist.current = Math.hypot(dx, dy);
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (lastDist.current > 0) {
        const delta = (dist - lastDist.current) * 0.01;
        setScale((prev) => {
          const next = Math.max(1, Math.min(4, prev + delta));
          if (next <= 1) setPos({ x: 0, y: 0 });
          return next;
        });
      }
      lastDist.current = dist;
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    lastDist.current = 0;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const dir = e.deltaY < 0 ? 1 : -1;
      setScale((prev) => {
        const next = Math.max(1, Math.min(4, prev + dir * 0.3));
        if (next <= 1) setPos({ x: 0, y: 0 });
        return next;
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="border-b border-border px-5 py-3 bg-surface2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">좌석 배치도</h3>
        <div className="flex items-center gap-2">
          <a
            href={MYSEATCHECK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-landers-red hover:underline hidden sm:inline"
          >
            구역별 시야 사진 →
          </a>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface px-1">
            <button
              onClick={() => zoom(-1)}
              disabled={scale <= 1}
              className="p-1.5 text-text-dim hover:text-text disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              aria-label="축소"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M5 12h14" />
              </svg>
            </button>
            <span className="text-xs text-text-muted tabular-nums w-8 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => zoom(1)}
              disabled={scale >= 4}
              className="p-1.5 text-text-dim hover:text-text disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              aria-label="확대"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden bg-bg-soft select-none"
        style={{
          cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "default",
          touchAction: "pan-x pan-y",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SEAT_MAP_URL}
          alt="인천 SSG 랜더스필드 2026 좌석 배치도"
          className="w-full h-auto pointer-events-none"
          style={{
            transform: `scale(${scale}) translate(${pos.x / scale}px, ${pos.y / scale}px)`,
            transformOrigin: "center center",
            transition: dragging ? "none" : "transform 0.15s ease-out",
          }}
          draggable={false}
        />
      </div>

      <div className="px-4 py-2 flex items-center justify-between border-t border-border bg-surface2">
        <p className="text-xs text-text-muted">
          확대: 스크롤 / 핀치 | 이동: 드래그
        </p>
        <a
          href={MYSEATCHECK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-landers-red hover:underline sm:hidden"
        >
          구역별 시야 사진 →
        </a>
      </div>
    </div>
  );
}
