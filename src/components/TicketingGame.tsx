"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Phase = "idle" | "captcha" | "grid" | "done";
type Difficulty = 5 | 10;

function generateCaptcha(len = 5): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < len; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function drawCaptcha(canvas: HTMLCanvasElement, text: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;

  // 배경
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, w, h);

  // 노이즈 선
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 150}, ${Math.random() * 150}, ${Math.random() * 150}, 0.5)`;
    ctx.lineWidth = 1 + Math.random();
    ctx.beginPath();
    ctx.moveTo(Math.random() * w, Math.random() * h);
    ctx.bezierCurveTo(
      Math.random() * w, Math.random() * h,
      Math.random() * w, Math.random() * h,
      Math.random() * w, Math.random() * h
    );
    ctx.stroke();
  }

  // 노이즈 점
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 200}, ${Math.random() * 200}, ${Math.random() * 200}, 0.6)`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
  }

  // 글자
  const fontSize = 32;
  const spacing = w / (text.length + 1);
  for (let i = 0; i < text.length; i++) {
    ctx.save();
    const x = spacing * (i + 0.7);
    const y = h / 2 + (Math.random() - 0.5) * 10;
    const angle = (Math.random() - 0.5) * 0.4;
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.font = `bold ${fontSize + Math.floor(Math.random() * 6 - 3)}px monospace`;
    ctx.fillStyle = `rgb(${Math.floor(Math.random() * 80)}, ${Math.floor(Math.random() * 80)}, ${Math.floor(Math.random() * 80)})`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }
}

function generateGrid(size: Difficulty): { numbers: number[]; highlighted: Set<number> } {
  const total = size * size;
  const numbers = Array.from({ length: total }, (_, i) => i + 1);
  // 셔플
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  // 4개 랜덤 선택 (인덱스 기준)
  const indices: number[] = [];
  while (indices.length < 4) {
    const idx = Math.floor(Math.random() * total);
    if (!indices.includes(idx)) indices.push(idx);
  }
  return { numbers, highlighted: new Set(indices) };
}

function formatTime(ms: number): string {
  const sec = Math.floor(ms / 1000);
  const millis = ms % 1000;
  if (sec < 60) return `${sec}.${String(millis).padStart(3, "0")}초`;
  const min = Math.floor(sec / 60);
  const remSec = sec % 60;
  return `${min}분 ${remSec}.${String(millis).padStart(3, "0")}초`;
}

export default function TicketingGame() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [difficulty, setDifficulty] = useState<Difficulty>(5);
  const [captchaText, setCaptchaText] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState(false);
  const [grid, setGrid] = useState<{ numbers: number[]; highlighted: Set<number> }>({ numbers: [], highlighted: new Set() });
  const [clicked, setClicked] = useState<Set<number>>(new Set());
  const [wrongClick, setWrongClick] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [bestRecord, setBestRecord] = useState<Record<Difficulty, number | null>>({ 5: null, 10: null });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 최고 기록 로드
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ticketingBest") || "{}");
      setBestRecord({
        5: saved["5"] ?? null,
        10: saved["10"] ?? null,
      });
    } catch { /* ignore */ }
  }, []);

  // 타이머
  useEffect(() => {
    if (phase !== "idle" && phase !== "done" && startTime > 0) {
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 10);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, startTime]);

  // 캡차 캔버스 그리기
  useEffect(() => {
    if (phase === "captcha" && canvasRef.current && captchaText) {
      drawCaptcha(canvasRef.current, captchaText);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [phase, captchaText]);

  const startGame = useCallback(() => {
    const text = generateCaptcha(5);
    setCaptchaText(text);
    setCaptchaInput("");
    setCaptchaError(false);
    setClicked(new Set());
    setWrongClick(null);
    setElapsed(0);
    setPhase("captcha");
    setStartTime(Date.now());
  }, []);

  const handleCaptchaSubmit = useCallback(() => {
    if (captchaInput.toUpperCase() === captchaText) {
      const g = generateGrid(difficulty);
      setGrid(g);
      setClicked(new Set());
      setWrongClick(null);
      setPhase("grid");
    } else {
      setCaptchaError(true);
      setCaptchaInput("");
      // 새 캡차 생성
      const text = generateCaptcha(5);
      setCaptchaText(text);
    }
  }, [captchaInput, captchaText, difficulty]);

  const handleGridClick = useCallback((idx: number) => {
    if (clicked.has(idx)) return;
    if (grid.highlighted.has(idx)) {
      const next = new Set(clicked);
      next.add(idx);
      setClicked(next);
      setWrongClick(null);
    } else {
      setWrongClick(idx);
      setTimeout(() => setWrongClick(null), 400);
    }
  }, [clicked, grid.highlighted]);

  const handleBook = useCallback(() => {
    const finalTime = Date.now() - startTime;
    setElapsed(finalTime);
    setPhase("done");
    if (timerRef.current) clearInterval(timerRef.current);

    // 최고 기록 갱신
    const key = String(difficulty) as "5" | "10";
    const prev = bestRecord[difficulty];
    if (prev === null || finalTime < prev) {
      const next = { ...bestRecord, [difficulty]: finalTime };
      setBestRecord(next);
      localStorage.setItem("ticketingBest", JSON.stringify({ "5": next[5], "10": next[10] }));
    }
  }, [startTime, difficulty, bestRecord]);

  const closeModal = useCallback(() => {
    setOpen(false);
    setPhase("idle");
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const allFound = clicked.size === 4;

  return (
    <>
      {/* 트리거 버튼 */}
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-landers-gold/20 px-3 py-1.5 text-xs font-semibold text-landers-red hover:bg-landers-gold/40 transition-colors cursor-pointer"
      >
        🎮 티켓팅 연습
      </button>

      {/* 모달 */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl text-text">🎮 티켓팅 연습</h3>
              <button onClick={closeModal} className="text-text-muted hover:text-text text-xl leading-none cursor-pointer">✕</button>
            </div>

            {/* 타이머 */}
            {phase !== "idle" && (
              <div className="mb-4 text-center">
                <span className="font-mono text-2xl font-bold text-landers-red tabular-nums">
                  {formatTime(elapsed)}
                </span>
              </div>
            )}

            {/* IDLE: 시작 화면 */}
            {phase === "idle" && (
              <div className="text-center space-y-4">
                <p className="text-sm text-text-dim">
                  실제 티켓팅처럼 보안문자 입력 → 좌석 선택 → 예매를 최대한 빠르게!
                </p>

                {/* 난이도 선택 */}
                <div className="flex justify-center gap-3">
                  {([5, 10] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                        difficulty === d
                          ? "bg-landers-red text-white shadow-sm"
                          : "bg-surface2 text-text-dim hover:text-text hover:bg-border"
                      }`}
                    >
                      {d}x{d} {d === 5 ? "(쉬움)" : "(어려움)"}
                    </button>
                  ))}
                </div>

                {/* 최고 기록 */}
                <div className="flex justify-center gap-4 text-xs text-text-dim">
                  <span>5x5 최고: {bestRecord[5] ? formatTime(bestRecord[5]) : "-"}</span>
                  <span>10x10 최고: {bestRecord[10] ? formatTime(bestRecord[10]) : "-"}</span>
                </div>

                <button
                  onClick={startGame}
                  className="rounded-xl bg-landers-red px-8 py-3 text-base font-bold text-white hover:bg-landers-gold hover:text-text transition-colors cursor-pointer"
                >
                  게임 시작
                </button>
              </div>
            )}

            {/* CAPTCHA: 보안 문자 */}
            {phase === "captcha" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-white p-4">
                  <p className="text-sm font-semibold text-text mb-1">보안 인증</p>
                  <p className="text-xs text-text-dim mb-3">
                    부정예매를 방지하기 위해<br />
                    화면의 보안문자를 입력해 주세요.
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <canvas
                      ref={canvasRef}
                      width={220}
                      height={60}
                      className="rounded border border-border"
                    />
                    <button
                      onClick={() => {
                        const text = generateCaptcha(5);
                        setCaptchaText(text);
                        setCaptchaInput("");
                        setCaptchaError(false);
                      }}
                      className="text-text-muted hover:text-text text-lg cursor-pointer"
                      title="새로고침"
                    >
                      🔄
                    </button>
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={captchaInput}
                    onChange={(e) => {
                      setCaptchaInput(e.target.value.toUpperCase());
                      setCaptchaError(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCaptchaSubmit();
                    }}
                    placeholder="보안문자 입력"
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-black outline-none ${
                      captchaError ? "border-red-400 bg-red-50" : "border-border bg-white"
                    } focus:ring-2 focus:ring-landers-red/30`}
                    autoComplete="off"
                  />
                  {captchaError && (
                    <p className="mt-1 text-xs text-red-500">보안문자가 일치하지 않습니다. 다시 입력해 주세요.</p>
                  )}
                </div>
                <button
                  onClick={handleCaptchaSubmit}
                  className="w-full rounded-xl bg-landers-red py-2.5 text-sm font-bold text-white hover:bg-landers-gold hover:text-text transition-colors cursor-pointer"
                >
                  확인
                </button>
              </div>
            )}

            {/* GRID: 좌석 선택 */}
            {phase === "grid" && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-text-dim mb-1">
                    강조된 <span className="font-bold text-landers-red">4개의 좌석</span>을 클릭하세요
                  </p>
                  <p className="text-xs text-text-muted">
                    선택: {clicked.size}/4
                  </p>
                </div>

                <div
                  className="mx-auto grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${difficulty}, 1fr)`,
                    maxWidth: difficulty === 5 ? "280px" : "400px",
                  }}
                >
                  {grid.numbers.map((num, idx) => {
                    const isHighlighted = grid.highlighted.has(idx);
                    const isClicked = clicked.has(idx);
                    const isWrong = wrongClick === idx;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleGridClick(idx)}
                        disabled={isClicked}
                        className={`aspect-square rounded-md text-xs font-bold transition-all cursor-pointer ${
                          isClicked
                            ? "bg-landers-red text-white scale-95"
                            : isWrong
                            ? "bg-red-200 text-red-700 animate-pulse"
                            : isHighlighted
                            ? "bg-landers-gold text-text ring-2 ring-landers-gold/50"
                            : "bg-surface2 text-text-dim hover:bg-border"
                        } ${difficulty === 10 ? "text-[10px]" : "text-sm"}`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>

                {/* 예매 버튼 */}
                <button
                  onClick={handleBook}
                  disabled={!allFound}
                  className={`w-full rounded-xl py-3 text-base font-bold transition-colors ${
                    allFound
                      ? "bg-landers-red text-white hover:bg-landers-gold hover:text-text cursor-pointer animate-pulse"
                      : "bg-border text-text-muted cursor-not-allowed"
                  }`}
                >
                  {allFound ? "예매하기 →" : "좌석을 모두 선택해주세요"}
                </button>
              </div>
            )}

            {/* DONE: 결과 */}
            {phase === "done" && (
              <div className="text-center space-y-4">
                <div className="rounded-2xl bg-landers-red-light border border-landers-red/20 p-6">
                  <p className="text-sm text-text-dim mb-1">예매 완료!</p>
                  <p className="font-mono text-3xl font-bold text-landers-red tabular-nums">
                    {formatTime(elapsed)}
                  </p>
                  {bestRecord[difficulty] !== null && elapsed <= bestRecord[difficulty]! && (
                    <p className="mt-2 text-sm font-semibold text-landers-gold">🏆 새 기록!</p>
                  )}
                </div>

                <div className="text-xs text-text-dim">
                  {difficulty}x{difficulty} 최고 기록: {bestRecord[difficulty] ? formatTime(bestRecord[difficulty]!) : "-"}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={startGame}
                    className="flex-1 rounded-xl bg-landers-red py-2.5 text-sm font-bold text-white hover:bg-landers-gold hover:text-text transition-colors cursor-pointer"
                  >
                    다시 도전
                  </button>
                  <button
                    onClick={() => setPhase("idle")}
                    className="flex-1 rounded-xl bg-surface2 py-2.5 text-sm font-semibold text-text-dim hover:bg-border transition-colors cursor-pointer"
                  >
                    난이도 변경
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
