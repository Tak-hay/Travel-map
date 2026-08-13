"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { travelLogRepository } from "@/lib/repository/travelLogRepository";

export default function DataManagement({ onImported }: { onImported: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = async () => {
    const json = await travelLogRepository.exportJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const today = new Date().toISOString().slice(0, 10);
    const a = document.createElement("a");
    a.href = url;
    a.download = `travel-log-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    setImportError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const text = await file.text();

    const confirmed = window.confirm(
      "データをインポートします。ファイル内に既存と同じ地域のデータがある場合、既存のデータは上書きされます。よろしいですか？"
    );
    if (!confirmed) return;

    const result = await travelLogRepository.importJson(text, { overwrite: false });

    if (!result.success) {
      setImportError(result.error ?? "インポートに失敗しました。");
      return;
    }

    setImportError(null);
    onImported();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExport}
        className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2 text-xs text-slate-600 hover:bg-slate-200"
        title="データをエクスポート"
      >
        <Download size={14} /> エクスポート
      </button>
      <button
        onClick={handleImportClick}
        className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2 text-xs text-slate-600 hover:bg-slate-200"
        title="データをインポート"
      >
        <Upload size={14} /> インポート
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleFileChange}
      />
      {importError && <span className="max-w-[10rem] text-xs text-red-500">{importError}</span>}
    </div>
  );
}
