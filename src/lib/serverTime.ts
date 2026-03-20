export const ServerClock = {
  offset: 0,
  latencyMs: 0,
  lastSyncAt: null as number | null,
  source: "local" as "ssg" | "local",

  async sync(): Promise<void> {
    try {
      const res = await fetch("/api/server-time");
      const data = await res.json();
      if (data.serverMs) {
        this.offset = data.serverMs - Date.now();
        this.source = data.source;
      }
      this.latencyMs = data.latencyMs ?? 0;
      this.lastSyncAt = Date.now();
    } catch {
      this.source = "local";
    }
  },

  now(): number {
    return Date.now() + this.offset;
  },
};
