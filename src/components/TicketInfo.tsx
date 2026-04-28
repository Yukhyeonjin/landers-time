"use client";

import { useState } from "react";

type Tab = "ticket" | "membership";

const TICKET_PRICES: { seat: string; weekday: string; weekend: string }[] = [
  { seat: "4층 SKY뷰석 일반", weekday: "13,000원", weekend: "15,000원" },
  { seat: "4층 SKY뷰석 청소년", weekday: "9,000원", weekend: "10,500원" },
  { seat: "4층 SKY뷰석 우대", weekday: "6,500원", weekend: "7,500원" },
  { seat: "외야 필드석 일반", weekday: "15,000원", weekend: "18,000원" },
  { seat: "외야 필드석 청소년", weekday: "10,500원", weekend: "12,500원" },
  { seat: "외야 필드석 우대", weekday: "7,500원", weekend: "9,000원" },
  { seat: "내야 필드석 일반", weekday: "16,000원", weekend: "19,000원" },
  { seat: "내야 필드석 청소년", weekday: "11,000원", weekend: "13,000원" },
  { seat: "내야 필드석 우대", weekday: "8,000원", weekend: "9,500원" },
  { seat: "몰리스 그린존 일반", weekday: "20,000원", weekend: "28,000원" },
  { seat: "몰리스 그린존 청소년", weekday: "14,000원", weekend: "19,500원" },
  { seat: "몰리스 그린존 어린이", weekday: "10,000원", weekend: "14,000원" },
  { seat: "최정 400홈런 기념존", weekday: "400원", weekend: "400원" },
  { seat: "휠체어 장애인석", weekday: "5,000원", weekend: "5,000원" },
  { seat: "으쓱이존", weekday: "19,000원", weekend: "22,000원" },
  { seat: "원정응원석", weekday: "19,000원", weekend: "22,000원" },
  { seat: "덕아웃 상단석", weekday: "21,000원", weekend: "25,000원" },
  { seat: "초가정자", weekday: "23,000원", weekend: "31,000원" },
  { seat: "로케트배터리 외야파티덱", weekday: "25,000원", weekend: "31,000원" },
  { seat: "SKY탁자석", weekday: "26,000원", weekend: "36,000원" },
  { seat: "외야패밀리존", weekday: "27,000원", weekend: "37,000원" },
  { seat: "홈런커플존", weekday: "32,000원", weekend: "41,000원" },
  { seat: "이마트 프렌들리존", weekday: "34,000원", weekend: "41,000원" },
  { seat: "이마트 바비큐존/도드람한돈 바비큐존", weekday: "37,000원", weekend: "48,000원" },
  { seat: "요기요 내야패밀리존", weekday: "40,000원", weekend: "53,000원" },
  { seat: "노브랜드 테이블석(2층)", weekday: "47,000원", weekend: "55,000원" },
  { seat: "피코크 테이블석(1층)", weekday: "53,000원", weekend: "64,000원" },
  { seat: "랜더스 라이브존", weekday: "60,000원", weekend: "75,000원" },
  { seat: "미니스카이박스", weekday: "67,000원", weekend: "86,000원" },
  { seat: "스카이박스", weekday: "83,000원", weekend: "91,000원" },
];

export default function TicketInfo() {
  const [tab, setTab] = useState<Tab>("ticket");

  return (
    <div>
      {/* 공식 예매 링크 */}
      <div className="mb-4 rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-text-dim">공식 티켓 예매</p>
        <a
          href="https://ticket.ssg.com/ticket"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block text-lg font-semibold text-landers-red hover:underline"
        >
          ticket.ssg.com/ticket
        </a>
        <p className="mt-1 text-sm text-text-dim">
          문의 전화: 1577-3419
        </p>
      </div>

      {/* 탭 버튼 */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab("ticket")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            tab === "ticket"
              ? "bg-landers-red text-white shadow-sm"
              : "bg-surface2 text-text-dim hover:text-text hover:bg-border"
          }`}
        >
          티켓 가격
        </button>
        <button
          onClick={() => setTab("membership")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            tab === "membership"
              ? "bg-landers-red text-white shadow-sm"
              : "bg-surface2 text-text-dim hover:text-text hover:bg-border"
          }`}
        >
          멤버십 선예매
        </button>
      </div>

      {/* 티켓 가격 안내 */}
      {tab === "ticket" && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-3 bg-surface2">
            <h3 className="font-semibold text-text">2026 티켓 가격 안내</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-dim">
                  <th className="px-4 py-3 text-left font-medium">좌석</th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">주중(월~목)</th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">주말(금~일/공휴일)</th>
                </tr>
              </thead>
              <tbody>
                {TICKET_PRICES.map((row) => (
                  <tr
                    key={row.seat}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-2.5 font-medium text-text">{row.seat}</td>
                    <td className="px-4 py-2.5 text-right text-text-dim tabular-nums">{row.weekday}</td>
                    <td className="px-4 py-2.5 text-right text-text-dim tabular-nums">{row.weekend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 text-xs text-text-muted border-t border-border bg-surface2 space-y-0.5">
            <p>※ 우대: 어린이/경로/중증장애인/국가유공자/군인</p>
            <p>※ 36개월 미만 영아는 무료 입장 가능하나, 별도 좌석 미제공</p>
            <p>※ 할인 제도는 중복 적용 불가하며, 구단 사정으로 변경/취소될 수 있습니다</p>
          </div>
        </div>
      )}

      {/* 멤버십 선예매 안내 */}
      {tab === "membership" && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-3 bg-surface2">
            <h3 className="font-semibold text-text">멤버십 등급별 선예매 안내</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-dim">
                  <th className="px-6 py-3 text-left font-medium">등급</th>
                  <th className="px-6 py-3 text-left font-medium">가격</th>
                  <th className="px-6 py-3 text-left font-medium">선예매</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["시즌권", "좌석별 상이", "경기 7일 전 11:00"],
                  ["랜디", "199,000원", "경기 7일 전 11:00"],
                  ["배티", "99,000원", "경기 7일 전 11:00"],
                  ["푸리", "50,000원", "경기 6일 전 11:00"],
                  ["일반", "무료", "일반 예매와 동일"],
                ].map(([grade, price, open]) => (
                  <tr
                    key={grade}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-6 py-3 font-semibold text-text">{grade}</td>
                    <td className="px-6 py-3 text-text-dim">{price}</td>
                    <td className="px-6 py-3 text-text-dim">{open}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 text-xs text-text-muted border-t border-border bg-surface2">
            ※ 랜디·배티 등급은 3월 말까지만 한정 판매 (이후 가입 불가)
            <br />
            ※ 유료 멤버십 공통: 일반 입장 1시간 전 선입장 + 예매 수수료 면제
            <br />
            ※ 멤버십 선예매는 현재 앱에서만 가능합니다
            <br />
            ※ 정확한 일정은 구단 공식 공지 확인 필수
          </div>
        </div>
      )}
    </div>
  );
}
