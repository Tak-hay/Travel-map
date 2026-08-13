"use client";

import { useEffect, useState } from "react";

// 指定したGeoJSON/TopoJSONの地域（feature）数を取得する。
// 総地域数を固定値にせず、実際に読み込んでいる地図データを基準にするために使う。
export function useGeoFeatureCount(url: string): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setCount(null);

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;

        if (Array.isArray(data?.features)) {
          // GeoJSON (FeatureCollection)
          setCount(data.features.length);
          return;
        }

        if (data?.objects) {
          // TopoJSON: objects直下の最初のオブジェクトのgeometries数を数える
          const firstKey = Object.keys(data.objects)[0];
          const geometries = data.objects[firstKey]?.geometries ?? [];
          setCount(geometries.length);
          return;
        }

        setCount(0);
      })
      .catch(() => {
        if (!cancelled) setCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return count;
}
