export type AppMode = "domestic" | "overseas";

export type SpotCategory = "food" | "sightseeing" | "shopping" | "lodging";

export type PriceRangeDomestic =
  | "under1000"
  | "under5000"
  | "under10000"
  | "over10000";
export type PriceRangeOverseas = "under10" | "under50" | "under100" | "over100";
export type PriceRange = PriceRangeDomestic | PriceRangeOverseas;

export interface Spot {
  id: string;
  category: SpotCategory;
  visitDate: string; // ISO "YYYY-MM-DD"
  name: string;
  googleMapUrl?: string;
  memo?: string;
  priceRange?: PriceRange;
  createdAt: string;
  updatedAt: string;
}

// 都道府県 / 国 1つ分の記録
export interface RegionRecord {
  regionCode: string; // 例: "JP-13"（東京）, "US"（アメリカ）
  regionName: string;
  mode: AppMode;
  visitDates: string[]; // ISO date[] 1件以上で塗りつぶし対象
  spots: Spot[];
  createdAt: string;
  updatedAt: string;
}

// アプリ全体で保持するストア
export interface TravelLogStore {
  version: number; // マイグレーション用
  regions: Record<string, RegionRecord>; // key = regionCode
}

// 地図表示用の集計データ
export interface RegionStats {
  totalRegions: number;
  visitedRegions: number;
  visitRate: number; // 0-100
}
