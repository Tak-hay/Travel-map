import { Chihou, JAPAN_CHIHOU } from "@/lib/japanRegions";

export interface ChihouStat {
  chihou: Chihou;
  visited: number;
  total: number;
  rate: number; // 0-100
  isComplete: boolean;
  remaining: number;
}

export function calcChihouStats(visitedCodes: Set<string>): ChihouStat[] {
  return JAPAN_CHIHOU.map((chihou) => {
    const total = chihou.prefectures.length;
    const visited = chihou.prefectures.filter((p) => visitedCodes.has(p.code)).length;
    const rate = total > 0 ? Math.round((visited / total) * 1000) / 10 : 0;
    return {
      chihou,
      visited,
      total,
      rate,
      isComplete: total > 0 && visited === total,
      remaining: total - visited,
    };
  });
}
