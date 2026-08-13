"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2, ExternalLink, Pencil } from "lucide-react";
import { AppMode, RegionRecord, Spot, SpotCategory } from "@/types/travel";
import { travelLogRepository } from "@/lib/repository/travelLogRepository";
import SpotForm from "./SpotForm";

const TABS: { key: SpotCategory; label: string }[] = [
  { key: "food", label: "食事" },
  { key: "sightseeing", label: "観光" },
  { key: "shopping", label: "買い物" },
  { key: "lodging", label: "宿泊" },
];

const PRICE_LABELS: Record<string, string> = {
  under1000: "1,000円以下",
  under5000: "5,000円以下",
  under10000: "10,000円以下",
  over10000: "10,000円以上",
  under10: "~$10",
  under50: "~$50",
  under100: "~$100",
  over100: "$100+",
};

export default function RegionModal({
  mode,
  regionCode,
  regionName,
  onClose,
  onChanged,
}: {
  mode: AppMode;
  regionCode: string;
  regionName: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [record, setRecord] = useState<RegionRecord | null>(null);
  const [newDate, setNewDate] = useState("");
  const [activeTab, setActiveTab] = useState<SpotCategory>("food");
  const [showSpotForm, setShowSpotForm] = useState(false);
  const [editingSpot, setEditingSpot] = useState<Spot | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    travelLogRepository.getRegion(mode, regionCode).then((r) => {
      setRecord(
        r ?? {
          regionCode,
          regionName,
          mode,
          visitDates: [],
          spots: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
    });
  }, [regionCode, regionName, mode]);

  const save = async (updated: RegionRecord) => {
    updated.updatedAt = new Date().toISOString();
    await travelLogRepository.upsertRegion(updated);
    setRecord(updated);
    onChanged();
  };

  const addVisitDate = () => {
    if (!record || !newDate) return;
    if (record.visitDates.includes(newDate)) return;
    save({ ...record, visitDates: [...record.visitDates, newDate].sort() });
    setNewDate("");
  };

  const removeVisitDate = (date: string) => {
    if (!record) return;
    save({ ...record, visitDates: record.visitDates.filter((d) => d !== date) });
  };

  const removeSpot = (spotId: string) => {
    if (!record) return;
    save({ ...record, spots: record.spots.filter((s) => s.id !== spotId) });
    setConfirmDeleteId(null);
  };

  // スポットの追加・編集を1つの経路にまとめる。
  // スポットの訪問日が地域側にまだ登録されていない場合は自動的に追加し、
  // 「地域の訪問日」と「スポットの訪問日」の不整合を防ぐ。
  const saveSpot = (spot: Spot) => {
    if (!record) return;
    const exists = record.spots.some((s) => s.id === spot.id);
    const spots = exists
      ? record.spots.map((s) => (s.id === spot.id ? spot : s))
      : [...record.spots, spot];

    const visitDates = record.visitDates.includes(spot.visitDate)
      ? record.visitDates
      : [...record.visitDates, spot.visitDate].sort();

    save({ ...record, spots, visitDates });
    setShowSpotForm(false);
    setEditingSpot(null);
  };

  const openAddForm = () => {
    setEditingSpot(null);
    setShowSpotForm(true);
  };

  const openEditForm = (spot: Spot) => {
    setEditingSpot(spot);
    setShowSpotForm(true);
  };

  if (!record) return null;

  const spotsInTab = record.spots.filter((s) => s.category === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="flex h-[85vh] w-full max-w-2xl flex-col rounded-t-2xl bg-white sm:h-[80vh] sm:rounded-2xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">{regionName}</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* 訪問日管理 */}
          <section className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">訪問日</h3>
            <div className="mb-2 flex flex-wrap gap-2">
              {record.visitDates.map((d) => (
                <span
                  key={d}
                  className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-700"
                >
                  {d}
                  <button onClick={() => removeVisitDate(d)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              {record.visitDates.length === 0 && (
                <span className="text-xs text-slate-400">まだ訪問日がありません</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="rounded-lg border px-3 py-1.5 text-sm"
              />
              <button
                onClick={addVisitDate}
                className="flex items-center gap-1 rounded-lg bg-orange-500 px-3 py-1.5 text-sm text-white"
              >
                <Plus size={14} /> 追加
              </button>
            </div>
          </section>

          {/* ジャンルタブ */}
          <section>
            <div className="mb-3 flex gap-1 border-b">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`px-3 py-2 text-sm font-medium ${
                    activeTab === t.key
                      ? "border-b-2 border-orange-500 text-orange-600"
                      : "text-slate-500"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {spotsInTab.map((spot) => (
                <div key={spot.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{spot.name}</p>
                      <p className="text-xs text-slate-500">{spot.visitDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(spot)}
                        className="text-slate-400 hover:text-orange-500"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(spot.id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {confirmDeleteId === spot.id && (
                    <div className="mt-2 flex items-center justify-between rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                      <span>このスポットを削除しますか？</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-md border border-red-200 px-2 py-1"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={() => removeSpot(spot.id)}
                          className="rounded-md bg-red-500 px-2 py-1 text-white"
                        >
                          削除する
                        </button>
                      </div>
                    </div>
                  )}

                  {spot.memo && <p className="mt-2 text-sm text-slate-600">{spot.memo}</p>}
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    {spot.googleMapUrl && (
                      <a
                        href={spot.googleMapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600"
                      >
                        <ExternalLink size={12} /> Googleマップ
                      </a>
                    )}
                    {spot.priceRange && (
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">
                        {PRICE_LABELS[spot.priceRange] ?? spot.priceRange}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <button
                onClick={openAddForm}
                className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed py-2 text-sm text-slate-500 hover:border-orange-400 hover:text-orange-500"
              >
                <Plus size={14} /> スポットを追加
              </button>
            </div>
          </section>
        </div>

        {showSpotForm && (
          <SpotForm
            mode={mode}
            category={activeTab}
            existingVisitDates={record.visitDates}
            initialSpot={editingSpot ?? undefined}
            onCancel={() => {
              setShowSpotForm(false);
              setEditingSpot(null);
            }}
            onSubmit={saveSpot}
          />
        )}
      </div>
    </div>
  );
}
