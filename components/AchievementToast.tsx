"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

export default function AchievementToast({
  message,
  onDone,
}: {
  message: string;
  onDone: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2800);
    return () => clearTimeout(timer);
  }, [message, onDone]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[80] flex justify-center px-4">
      <div className="flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-sm text-white shadow-lg">
        <CheckCircle2 size={16} className="text-orange-400" />
        {message}
      </div>
    </div>
  );
}
