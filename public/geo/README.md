# 地図データについて

このディレクトリには以下の GeoJSON を配置してください。

- `japan-prefectures.json` … 日本の都道府県境界データ
  - 各 feature の `properties` に以下を含めること
    - `code`: 都道府県コード（例: JIS X0401 の "13" や "JP-13"）
    - `name`: 都道府県名（例: "東京都"）
- `world-countries.json` … 世界の国境界データ（Natural Earth 由来など）
  - 各 feature の `properties` に以下を含めること
    - `code`: ISO 3166-1 alpha-2 または alpha-3 コード（例: "JP", "US"）
    - `name`: 国名（例: "日本", "アメリカ合衆国"）

無料で配布されている GeoJSON（例: `dataofjapan/land`, `topojson/world-atlas` 等）を
取得し、`code` / `name` のプロパティ名に正規化してから配置してください。

ライセンスは元データの利用条件に従ってください。
