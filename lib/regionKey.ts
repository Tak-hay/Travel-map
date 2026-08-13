import { AppMode } from "@/types/travel";

// Repository内部でのみ使用する地域の一意キー。
// 例: domestic:JP-13 / overseas:US
// RegionRecord自体の regionCode は変更せず、内部キーだけを分離することで
// 国内／海外モードで同じ地域コードが存在しても混同しないようにする。
export function regionKey(mode: AppMode, regionCode: string): string {
  return `${mode}:${regionCode}`;
}
