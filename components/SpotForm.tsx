"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AppMode, PriceRange, Spot, SpotCategory } from "@/types/travel";

const PRICE_OPTIONS: Record<AppMode, { value: PriceRange; label: string }[]> = {
  domestic: [
    { value: "under1000", label: "1,000円以下" },
    { value: "under5000", label: "5,000円以下" },
    { value: "under10000", label: "10,000円以下" },
    { value: "over10000", label: "10,000円以上" },
  ],
  overseas: [
    { value: "under10", label: "~$10" },
    { value: "under50", label: "~$50" },
    { value: "under100", label: "~$100" },
    { value: "over100", label: "$100+" },
  ],
};

export default function SpotForm({
  mode,
  category,
  existingVisitDates,
  initialSpot,
  onCancel,
  onSubmit,
}: {
  mode: AppMode;
  category: SpotCategory;
  // 地域にすでに登録されている訪問日。クイック選択チップとして表示する
  existingVisitDates: string[];
  // 指定時は編集モード（初期値をフォームに読み込み、同じIDで更新する）
  initialSpot?: Spot;
  onCancel: () => void;
  onSubmit: (spot: Spot) => void;
}) {
  const isEditing = !!initialSpot;

  const [name, setName] = useState(initialSpot?.name ?? "");
  const [visitDate, setVisitDate] = useState(initialSpot?.visitDate ?? "");
  const [googleMapUrl, setGoogleMapUrl] = useState(initialSpot?.googleMapUrl ?? "");
  const [memo, setMemo] = useState(initialSpot?.memo ?? "");
  const [priceRange, setPriceRange] = useState<PriceRange | "">(initialSpot?.priceRange ?? "");

  const handleSubmit = () => {
    if (!name || !visitDate) return;
    const now = new Date().toISOString();
    onSubmit({
      id: initialSpot?.id ?? crypto.randomUUID(),
      category,
      visitDate,
      name,
      googleMapUrl: googleMapUrl || undefined,
      memo: memo || undefined,
      priceRange: priceRange || undefined,
      createdAt: initialSpot?.createdAt ?? now,
      updatedAt: now,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold">{isEditing ? "スポットを編集" : "スポットを追加"}</h3>
          <button onClick={onCancel}>
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
            {existingVisitDates.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {existingVisitDates.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setVisitDate(d)}
                    className={`rounded-full px-2.5 py-0.5 text-xs ${
                      visitDate === d
                        ? "bg-orange-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="スポット名 / 店名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
          <input
            type="url"
            placeholder="GoogleマップURL"
            value={googleMapUrl}
            onChange={(e) => setGoogleMapUrl(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
          <textarea
            placeholder="感想・メモ"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />

          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value as PriceRange)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">価格感を選択</option>
            {PRICE_OPTIONS[mode].map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-lg border py-2 text-sm">
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name || !visitDate}
            className="flex-1 rounded-lg bg-orange-500 py-2 text-sm text-white disabled:opacity-40"
          >
            {isEditing ? "更新" : "追加"}
          </button>
        </div>
      </div>
    </div>
  );
}
