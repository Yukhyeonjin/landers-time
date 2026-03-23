export const ServerClock = {
  offset: 0,
  rttMs: 0,
  lastSyncAt: null as number | null,
  source: "local" as "ssg" | "local",

  async sync(): Promise<void> {
    try {
      const clientBefore = Date.now();
      const res = await fetch("/api/server-time");
      const data = await res.json();
      const clientAfter = Date.now();
      const totalRtt = clientAfter - clientBefore;

      if (data.serverMs) {
        // NTP 스타일: 서버 시각이 전체 RTT의 중간 시점에 생성되었다고 가정
        this.offset = data.serverMs - (clientBefore + clientAfter) / 2;
        this.source = data.source;
      }
      this.rttMs = totalRtt;
      this.lastSyncAt = Date.now();
    } catch {
      this.source = "local";
    }
  },

  now(): number {
    return Date.now() + this.offset;
  },
};
