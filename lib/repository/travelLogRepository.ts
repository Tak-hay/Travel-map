import {
  AppMode,
  CURRENT_STORE_VERSION,
  RegionRecord,
  Spot,
  SpotCategory,
  TravelLogStore,
} from "@/types/travel";
import { regionKey } from "@/lib/regionKey";

const STORAGE_KEY = "travel-log-store-v1"; // localStorageのキー自体は既存互換のため変更しない

export interface SpotSearchFilter {
  mode?: AppMode;
  category?: SpotCategory;
  regionCode?: string;
  keyword?: string;
}

export interface SpotSearchResult {
  spot: Spot;
  region: RegionRecord;
}

export interface ImportResult {
  success: boolean;
  error?: string;
}

export interface ITravelLogRepository {
  getAll(): Promise<TravelLogStore>;
  upsertRegion(record: RegionRecord): Promise<void>;
  getRegion(mode: AppMode, regionCode: string): Promise<RegionRecord | undefined>;
  searchSpots(filter: SpotSearchFilter): Promise<SpotSearchResult[]>;
  exportJson(): Promise<string>;
  importJson(json: string, options?: { overwrite?: boolean }): Promise<ImportResult>;
}

/**
 * v1 -> v2 マイグレーション:
 * 旧形式ではストアのキーが `regionCode` そのものだったため、国内／海外で
 * 同じコードの地域が存在すると衝突する可能性があった。
 * v2 では `${mode}:${regionCode}` を内部キーとして使用する。
 */
function migrate(raw: unknown): TravelLogStore {
  if (!raw || typeof raw !== "object") {
    return { version: CURRENT_STORE_VERSION, regions: {} };
  }

  const rawStore = raw as Partial<TravelLogStore>;
  const rawRegions = (rawStore.regions ?? {}) as Record<string, RegionRecord>;
  const version = rawStore.version ?? 1;

  if (version >= CURRENT_STORE_VERSION) {
    return { version: CURRENT_STORE_VERSION, regions: rawRegions };
  }

  const migratedRegions: Record<string, RegionRecord> = {};
  for (const key of Object.keys(rawRegions)) {
    const region = rawRegions[key];
    if (!region || !region.mode || !region.regionCode) continue;
    migratedRegions[regionKey(region.mode, region.regionCode)] = region;
  }

  return { version: CURRENT_STORE_VERSION, regions: migratedRegions };
}

function isValidRegionRecord(region: unknown): region is RegionRecord {
  if (!region || typeof region !== "object") return false;
  const r = region as Partial<RegionRecord>;
  return (
    typeof r.regionCode === "string" &&
    typeof r.regionName === "string" &&
    (r.mode === "domestic" || r.mode === "overseas") &&
    Array.isArray(r.visitDates) &&
    Array.isArray(r.spots)
  );
}

export class LocalStorageTravelLogRepository implements ITravelLogRepository {
  async getAll(): Promise<TravelLogStore> {
    if (typeof window === "undefined") {
      return { version: CURRENT_STORE_VERSION, regions: {} };
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: CURRENT_STORE_VERSION, regions: {} };

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // 壊れたデータの場合は既存データを消さず、空のストアとして扱う
      return { version: CURRENT_STORE_VERSION, regions: {} };
    }

    const migrated = migrate(parsed);

    // マイグレーションが発生した場合は保存し直しておく
    const originalVersion = (parsed as Partial<TravelLogStore>)?.version ?? 1;
    if (originalVersion < CURRENT_STORE_VERSION) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    }

    return migrated;
  }

  async upsertRegion(record: RegionRecord): Promise<void> {
    const store = await this.getAll();
    store.regions[regionKey(record.mode, record.regionCode)] = record;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  async getRegion(mode: AppMode, regionCode: string): Promise<RegionRecord | undefined> {
    const store = await this.getAll();
    return store.regions[regionKey(mode, regionCode)];
  }

  async searchSpots(filter: SpotSearchFilter): Promise<SpotSearchResult[]> {
    const store = await this.getAll();
    const results: SpotSearchResult[] = [];
    const keyword = filter.keyword?.trim().toLowerCase();

    for (const region of Object.values(store.regions)) {
      if (filter.mode && region.mode !== filter.mode) continue;
      if (filter.regionCode && region.regionCode !== filter.regionCode) continue;

      for (const spot of region.spots) {
        if (filter.category && spot.category !== filter.category) continue;

        if (keyword) {
          const haystack = `${spot.name} ${spot.memo ?? ""} ${region.regionName}`.toLowerCase();
          if (!haystack.includes(keyword)) continue;
        }

        results.push({ spot, region });
      }
    }

    // 新しい訪問日が上に来るようにソート
    results.sort((a, b) => (a.spot.visitDate < b.spot.visitDate ? 1 : -1));
    return results;
  }

  async exportJson(): Promise<string> {
    const store = await this.getAll();
    return JSON.stringify(store, null, 2);
  }

  async importJson(json: string, options?: { overwrite?: boolean }): Promise<ImportResult> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      return {
        success: false,
        error: "ファイルの形式が正しくありません（JSONとして読み込めませんでした）。",
      };
    }

    if (typeof parsed !== "object" || parsed === null) {
      return { success: false, error: "ファイルの中身がオブジェクト形式ではありません。" };
    }

    const candidate = parsed as Partial<TravelLogStore>;

    if (candidate.version === undefined || candidate.version === null) {
      return {
        success: false,
        error:
          "バージョン情報（version）が見つかりません。旅行ログのエクスポートファイルではない可能性があります。",
      };
    }

    if (!candidate.regions || typeof candidate.regions !== "object") {
      return { success: false, error: "地域データ（regions）が見つかりません。" };
    }

    for (const key of Object.keys(candidate.regions)) {
      if (!isValidRegionRecord(candidate.regions[key])) {
        return {
          success: false,
          error: `地域データの形式が不正です（${key}）。ファイルが壊れているか、対応していない形式です。`,
        };
      }
    }

    const migrated = migrate(candidate);

    if (options?.overwrite) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return { success: true };
    }

    // 既存データとマージ（同じ地域キーはインポート側で上書き）
    const current = await this.getAll();
    const merged: TravelLogStore = {
      version: CURRENT_STORE_VERSION,
      regions: { ...current.regions, ...migrated.regions },
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return { success: true };
  }
}

export const travelLogRepository: ITravelLogRepository =
  new LocalStorageTravelLogRepository();
