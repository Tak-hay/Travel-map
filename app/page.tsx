"use client";

import { useEffect, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Globe2, MapPin } from "lucide-react";
import { AppMode, TravelLogStore, RegionStats } from "@/types/travel";
import { travelLogRepository } from "@/lib/repository/travelLogRepository";
import RegionModal from "@/components/RegionModal";

const GEO_URLS: Record<AppMode, string> = {
  domestic: "/geo/japan-prefectures.json",
  overseas: "/geo/world-countries.json",
};

const MAP_PROJECTION_CONFIG: Record<AppMode, { center: [number, number]; scale: number }> = {
  domestic: { center: [137, 38], scale: 1600 },
  overseas: { center: [0, 20], scale: 150 },
};

export default function HomePage() {
  const [mode, setMode] = useState<AppMode>("domestic");
  const [store, setStore] = useState<TravelLogStore>({ version: 1, regions: {} });
  const [selectedRegionCode, setSelectedRegionCode] = useState<string | null>(null);
  const [selectedRegionName, setSelectedRegionName] = useState<string>("");

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

  const stats: RegionStats = useMemo(() => {
    const totalRegions = mode === "domestic" ? 47 : 195; // 概算値
    const visitedRegions = visitedCodes.size;
    return {
      totalRegions,
      visitedRegions,
      visitRate: Math.round((visitedRegions / totalRegions) * 1000) / 10,
    };
  }, [visitedCodes, mode]);

  const handleRegionClick = (code: string, name: string) => {
    setSelectedRegionCode(code);
    setSelectedRegionName(name);
  };

  const refreshStore = () => travelLogRepository.getAll().then(setStore);

  return (
    <main className="flex h-screen flex-col bg-slate-50">
      {/* ヘッダー：モード切替 & ステータス */}
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

        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>
            訪問数: <strong className="text-slate-900">{stats.visitedRegions}</strong> /{" "}
            {stats.totalRegions}
          </span>
          <span>
            訪問率: <strong className="text-orange-600">{stats.visitRate}%</strong>
          </span>
        </div>
      </header>

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
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleRegionClick(code, name)}
                      style={{
                        default: {
                          fill: isVisited ? "#f97316" : "#ffffff",
                          stroke: "#94a3b8",
                          strokeWidth: 0.5,
                          outline: "none",
                          cursor: "pointer",
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
    </main>
  );
}
