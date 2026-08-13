import { TravelLogStore, RegionRecord } from "@/types/travel";

const STORAGE_KEY = "travel-log-store-v1";

export interface ITravelLogRepository {
  getAll(): Promise<TravelLogStore>;
  upsertRegion(record: RegionRecord): Promise<void>;
  getRegion(code: string): Promise<RegionRecord | undefined>;
}

// ローカル実装。将来的に SupabaseTravelLogRepository 等へ差し替え可能
export class LocalStorageTravelLogRepository implements ITravelLogRepository {
  async getAll(): Promise<TravelLogStore> {
    if (typeof window === "undefined") return { version: 1, regions: {} };
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TravelLogStore) : { version: 1, regions: {} };
  }

  async upsertRegion(record: RegionRecord): Promise<void> {
    const store = await this.getAll();
    store.regions[record.regionCode] = record;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  async getRegion(code: string): Promise<RegionRecord | undefined> {
    const store = await this.getAll();
    return store.regions[code];
  }
}

export const travelLogRepository: ITravelLogRepository =
  new LocalStorageTravelLogRepository();
