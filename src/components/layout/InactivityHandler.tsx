"use client";
import { useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";

// Inactivity timeout from env (default 30 mins) — passed as prop from server
interface Props {
  timeoutMs: number;
}

export default function InactivityHandler({ timeoutMs }: Props) {
  const { data: session } = useSession();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      signOut({ callbackUrl: "/login" });
    }, timeoutMs);
  };

  useEffect(() => {
    if (!session) return;

    // Listen for user activity
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer(); // start timer immediately

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [session, timeoutMs]);

  return null;
}
