"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Globe2, MapPin, Search } from "lucide-react";
import { AppMode, TravelLogStore, CURRENT_STORE_VERSION } from "@/types/travel";
import { travelLogRepository } from "@/lib/repository/travelLogRepository";
import { useGeoFeatureCount } from "@/lib/useGeoFeatureCount";
import { calcChihouStats } from "@/lib/domesticStats";
import RegionModal from "@/components/RegionModal";
import DomesticProgress from "@/components/DomesticProgress";
import SpotSearchPanel from "@/components/SpotSearchPanel";
import DataManagement from "@/components/DataManagement";
import AchievementToast from "@/components/AchievementToast";

const GEO_URLS: Record<AppMode, string> = {
  domestic: "/geo/japan-prefectures.json",
  overseas: "/geo/world-countries.json",
};

const MAP_PROJECTION_CONFIG: Record<AppMode, { center: [number, number]; scale: number }> = {
  domestic: { center: [137, 38], scale: 1600 },
  overseas: { center: [0, 20], scale: 150 },
};

// GeoJSONの読み込みが完了するまでの暫定値（読み込み後は実際の地域数に置き換わる）
const FALLBACK_TOTAL: Record<AppMode, number> = {
  domestic: 47,
  overseas: 195,
};

export default function HomePage() {
  const [mode, setMode] = useState<AppMode>("domestic");
  const [store, setStore] = useState<TravelLogStore>({
    version: CURRENT_STORE_VERSION,
    regions: {},
  });
  const [selectedRegionCode, setSelectedRegionCode] = useState<string | null>(null);
  const [selectedRegionName, setSelectedRegionName] = useState<string>("");
  const [showSearch, setShowSearch] = useState(false);
  const [poppingCodes, setPoppingCodes] = useState<Set<string>>(new Set());
  const [celebration, setCelebration] = useState<string | null>(null);

  const geoFeatureCount = useGeoFeatureCount(GEO_URLS[mode]);

  // 「新しく訪問済みになった地域」だけを判定するための前回値
  const prevVisitedRef = useRef<Set<string> | null>(null);
  // 「新しく制覇した地方」だけを判定するための前回値
  const prevCompletedChihouRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    travelLogRepository.getAll().then(setStore);
  }, []);

  const visitedCodes = useMemo(
    () =>
      new Set(
        Object.values(store.regions)
          .filter((r) => r.mode === mode && r.visitDates.length > 0)
          .map((r) => r.regionCode)
      ),
    [store, mode]
  );

  const totalRegions = geoFeatureCount ?? FALLBACK_TOTAL[mode];
  const visitedRegions = visitedCodes.size;
  const visitRate =
    totalRegions > 0 ? Math.round((visitedRegions / totalRegions) * 1000) / 10 : 0;

  const chihouStats = useMemo(
    () => (mode === "domestic" ? calcChihouStats(visitedCodes) : []),
    [mode, visitedCodes]
  );

  // 新しく訪問済みになった地域にだけ、控えめなポップアニメーションを付与する
  useEffect(() => {
    if (prevVisitedRef.current === null) {
      // 初回読み込み時（既存の訪問済み地域）はアニメーションさせない
      prevVisitedRef.current = new Set(visitedCodes);
      return;
    }

    const prev = prevVisitedRef.current;
    const newlyAdded = [...visitedCodes].filter((c) => !prev.has(c));
    prevVisitedRef.current = new Set(visitedCodes);

    if (newlyAdded.length === 0) return;

    setPoppingCodes(new Set(newlyAdded));
    const timer = setTimeout(() => setPoppingCodes(new Set()), 500);
    return () => clearTimeout(timer);
  }, [visitedCodes]);

  // 地方が新たに制覇状態になったタイミングだけ、控えめな達成演出を表示する
  useEffect(() => {
    if (mode !== "domestic") return;

    const completedNow = new Set(
      chihouStats.filter((s) => s.isComplete).map((s) => s.chihou.key)
    );

    if (prevCompletedChihouRef.current === null) {
      prevCompletedChihouRef.current = completedNow;
      return;
    }

    const prev = prevCompletedChihouRef.current;
    const newlyCompletedKey = [...completedNow].find((k) => !prev.has(k));
    prevCompletedChihouRef.current = completedNow;

    if (newlyCompletedKey) {
      const chihou = chihouStats.find((s) => s.chihou.key === newlyCompletedKey)?.chihou;
      if (chihou) setCelebration(`${chihou.name}制覇！`);
    }
  }, [chihouStats, mode]);

  const handleRegionClick = (code: string, name: string) => {
    setSelectedRegionCode(code);
    setSelectedRegionName(name);
  };

  const refreshStore = () => travelLogRepository.getAll().then(setStore);

  const handleSelectFromSearch = (searchMode: AppMode, code: string, name: string) => {
    setMode(searchMode);
    setSelectedRegionCode(code);
    setSelectedRegionName(name);
  };

  return (
    <main className="flex h-screen flex-col bg-slate-50">
      {/* ヘッダー：モード切替 & ステータス & 検索 & データ管理 */}
      <header className="flex flex-col gap-3 border-b bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("domestic")}
            className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === "domestic" ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            <MapPin size={16} /> 国内
          </button>
          <button
            onClick={() => setMode("overseas")}
            className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === "overseas" ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            <Globe2 size={16} /> 海外
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* 国内モードの達成率は下の DomesticProgress に集約するため、
              ここでは海外モードのときだけシンプルな数値を表示する */}
          {mode === "overseas" && (
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>
                訪問数: <strong className="text-slate-900">{visitedRegions}</strong> /{" "}
                {totalRegions}
              </span>
              <span>
                訪問率: <strong className="text-orange-600">{visitRate}%</strong>
              </span>
            </div>
          )}

          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2 text-xs text-slate-600 hover:bg-slate-200"
          >
            <Search size={14} /> 検索
          </button>

          <DataManagement onImported={refreshStore} />
        </div>
      </header>

      {mode === "domestic" && (
        <DomesticProgress visited={visitedRegions} total={totalRegions} chihouStats={chihouStats} />
      )}

      {/* 地図本体 */}
      <div className="relative flex-1 overflow-hidden">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={MAP_PROJECTION_CONFIG[mode]}
          className="h-full w-full"
        >
          <ZoomableGroup zoom={1} minZoom={1} maxZoom={8}>
            <Geographies geography={GEO_URLS[mode]}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const code = geo.properties.code as string; // GeoJSON側でコードを持たせておく
                  const name = geo.properties.name as string;
                  const isVisited = visitedCodes.has(code);
                  const isPopping = poppingCodes.has(code);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleRegionClick(code, name)}
                      className={isPopping ? "region-pop" : undefined}
                      style={{
                        default: {
                          fill: isVisited ? "#f97316" : "#ffffff",
                          stroke: "#94a3b8",
                          strokeWidth: 0.5,
                          outline: "none",
                          cursor: "pointer",
                          transition: "fill 0.3s ease",
                        },
                        hover: {
                          fill: isVisited ? "#ea580c" : "#fde68a",
                          outline: "none",
                        },
                        pressed: {
                          fill: "#c2410c",
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {selectedRegionCode && (
        <RegionModal
          mode={mode}
          regionCode={selectedRegionCode}
          regionName={selectedRegionName}
          onClose={() => setSelectedRegionCode(null)}
          onChanged={refreshStore}
        />
      )}

      {showSearch && (
        <SpotSearchPanel onClose={() => setShowSearch(false)} onSelectRegion={handleSelectFromSearch} />
      )}

      {celebration && (
        <AchievementToast message={celebration} onDone={() => setCelebration(null)} />
      )}
    </main>
  );
}
