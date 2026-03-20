"use client";

import { useEffect, useRef } from "react";

interface AdSlotProps {
  slotId?: string;
  className?: string;
}

export default function AdSlot({ slotId, className }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  const isPlaceholder = !slotId || slotId.includes("XXXX");

  useEffect(() => {
    if (isPlaceholder || pushed.current) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet
    }
  }, [isPlaceholder]);

  // placeholder ID면 렌더링하지 않음
  if (isPlaceholder) return null;

  return (
    <div className={`flex justify-center ${className ?? ""}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slotId}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </div>
  );
}
