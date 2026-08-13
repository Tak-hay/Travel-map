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
  onCancel,
  onSubmit,
}: {
  mode: AppMode;
  category: SpotCategory;
  onCancel: () => void;
  onSubmit: (spot: Spot) => void;
}) {
  const [name, setName] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [googleMapUrl, setGoogleMapUrl] = useState("");
  const [memo, setMemo] = useState("");
  const [priceRange, setPriceRange] = useState<PriceRange | "">("");

  const handleSubmit = () => {
    if (!name || !visitDate) return;
    const now = new Date().toISOString();
    onSubmit({
      id: crypto.randomUUID(),
      category,
      visitDate,
      name,
      googleMapUrl: googleMapUrl || undefined,
      memo: memo || undefined,
      priceRange: priceRange || undefined,
      createdAt: now,
      updatedAt: now,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold">スポットを追加</h3>
          <button onClick={onCancel}>
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
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
            追加
          </button>
        </div>
      </div>
    </div>
  );
}
