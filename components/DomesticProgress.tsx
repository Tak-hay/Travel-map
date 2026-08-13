"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ChihouStat } from "@/lib/domesticStats";

export default function DomesticProgress({
  visited,
  total,
  chihouStats,
}: {
  visited: number;
  total: number;
  chihouStats: ChihouStat[];
}) {
  const [expanded, setExpanded] = useState(false);
  const rate = total > 0 ? Math.round((visited / total) * 1000) / 10 : 0;
  const remaining = total - visited;

  return (
    <div className="border-b bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-600">
            🗾 国内旅行{"  "}
            <span className="font-semibold text-slate-900">
              {visited} / {total}
            </span>
            {"  "}
            <span className="font-semibold text-orange-600">{rate}%</span>
          </p>
          {remaining > 0 && (
            <p className="mt-0.5 text-xs text-slate-500">あと{remaining}県</p>
          )}
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex shrink-0 items-center gap-1 text-xs text-slate-500 hover:text-orange-600"
        >
          地方別達成度
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-orange-500 transition-all duration-500"
          style={{ width: `${rate}%` }}
        />
      </div>

      {expanded && (
        <div className="mt-3 space-y-2.5">
          {chihouStats.map((s) => (
            <div key={s.chihou.key}>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  {s.chihou.name}
                  {s.isComplete && (
                    <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-600">
                      制覇
                    </span>
                  )}
                  {!s.isComplete && s.remaining > 0 && s.remaining <= 1 && s.visited > 0 && (
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                      あと{s.remaining}県
                    </span>
                  )}
                </span>
                <span>
                  {s.visited} / {s.total}　{s.rate}%
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    s.isComplete ? "bg-orange-500" : "bg-orange-300"
                  }`}
                  style={{ width: `${s.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
