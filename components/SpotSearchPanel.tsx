"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { AppMode, SpotCategory } from "@/types/travel";
import { SpotSearchResult, travelLogRepository } from "@/lib/repository/travelLogRepository";

const CATEGORY_LABELS: Record<SpotCategory, string> = {
  food: "食事",
  sightseeing: "観光",
  shopping: "買い物",
  lodging: "宿泊",
};

export default function SpotSearchPanel({
  onClose,
  onSelectRegion,
}: {
  onClose: () => void;
  onSelectRegion: (mode: AppMode, regionCode: string, regionName: string) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [modeFilter, setModeFilter] = useState<AppMode | "">("");
  const [categoryFilter, setCategoryFilter] = useState<SpotCategory | "">("");
  const [results, setResults] = useState<SpotSearchResult[]>([]);

  useEffect(() => {
    travelLogRepository
      .searchSpots({
        keyword: keyword || undefined,
        mode: modeFilter || undefined,
        category: categoryFilter || undefined,
      })
      .then(setResults);
  }, [keyword, modeFilter, categoryFilter]);

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/40 p-4 sm:items-center">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="flex items-center gap-2 text-base font-bold">
            <Search size={18} /> スポット検索
          </h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 border-b px-4 py-3">
          <input
            type="text"
            placeholder="スポット名・メモ・地域名で検索"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value as AppMode | "")}
              className="flex-1 rounded-lg border px-2 py-1.5 text-sm"
            >
              <option value="">国内／海外すべて</option>
              <option value="domestic">国内</option>
              <option value="overseas">海外</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as SpotCategory | "")}
              className="flex-1 rounded-lg border px-2 py-1.5 text-sm"
            >
              <option value="">カテゴリーすべて</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {results.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">該当するスポットがありません</p>
          ) : (
            <ul className="space-y-2">
              {results.map(({ spot, region }) => (
                <li key={spot.id}>
                  <button
                    onClick={() => {
                      onSelectRegion(region.mode, region.regionCode, region.regionName);
                      onClose();
                    }}
                    className="w-full rounded-lg border p-3 text-left hover:border-orange-400"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">{spot.name}</span>
                      <span className="text-xs text-slate-400">
                        {CATEGORY_LABELS[spot.category]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {region.regionName} ・ {spot.visitDate}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
