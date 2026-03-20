export const dynamic = "force-dynamic";

export async function GET() {
  const localBefore = Date.now();

  try {
    const res = await fetch("https://ticket.ssg.com/ticket", {
      method: "HEAD",
      cache: "no-store",
    });

    const localAfter = Date.now();
    const networkLatency = localAfter - localBefore;

    const serverDate = res.headers.get("date");
    const serverMs = serverDate
      ? new Date(serverDate).getTime() + Math.round(networkLatency / 2)
      : null;

    return Response.json({
      serverMs,
      localMs: localBefore,
      latencyMs: networkLatency,
      source: serverDate ? "ssg" : "local",
    });
  } catch {
    return Response.json({
      serverMs: null,
      localMs: localBefore,
      latencyMs: 0,
      source: "local",
    });
  }
}
