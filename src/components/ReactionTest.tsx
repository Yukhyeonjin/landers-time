"use client";

import { useEffect, useRef, useState } from "react";

const TRIALS = 3;

export function reactionTitle(ms: number): string {
  if (ms < 200) return "⚡ 광클의 신";
  if (ms < 260) return "🐆 치타 예매러";
  if (ms < 330) return "🐰 토끼 예매러";
  return "🐢 거북이 예매러";
}

type Phase = "idle" | "wait" | "go" | "early";

export default function ReactionTest({ onResult }: { onResult: (ms: number) => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [results, setResults] = useState<number[]>([]);
  const goAt = useRef(0);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const arm = () => {
    setPhase("wait");
    timer.current = window.setTimeout(() => {
      goAt.current = performance.now();
      setPhase("go");
    }, 1200 + Math.random() * 2300);
  };

  const onPress = () => {
    if (phase === "idle" || phase === "early") {
      if (results.length >= TRIALS) setResults([]);
      arm();
    } else if (phase === "wait") {
      if (timer.current) window.clearTimeout(timer.current);
      setPhase("early");
    } else {
      const ms = Math.round(performance.now() - goAt.current);
      const next = [...results, ms];
      setResults(next);
      if (next.length >= TRIALS) {
        onResult(Math.round(next.reduce((a, b) => a + b, 0) / next.length));
        setPhase("idle");
      } else arm();
    }
  };

  const avg = results.length >= TRIALS
    ? Math.round(results.reduce((a, b) => a + b, 0) / results.length)
    : null;

  return (
    <div>
      <button
        onPointerDown={onPress}
        className={`flex h-20 w-full select-none items-center justify-center rounded-lg text-sm font-semibold touch-manipulation transition-colors ${
          phase === "go"
            ? "bg-landers-red text-white"
            : phase === "wait"
            ? "bg-surface2 text-text-dim"
            : phase === "early"
            ? "bg-landers-gold/30 text-text"
            : "border border-dashed border-border text-text-dim"
        }`}
      >
        {phase === "go"
          ? "지금!"
          : phase === "wait"
          ? `빨개지면 누르세요… (${results.length + 1}/${TRIALS})`
          : phase === "early"
          ? "앗, 너무 빨라요! 다시 누르기"
          : avg !== null
          ? `${avg}ms · ${reactionTitle(avg)} (다시 측정)`
          : "⚡ 반응속도 측정 시작"}
      </button>
    </div>
  );
}
