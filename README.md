# 旅行ログ・白地図塗りつぶし

旅行で訪れた場所を、インタラクティブな白地図（日本：都道府県単位 / 世界：国単位）の
塗りつぶしとともに記録・管理できる Web アプリケーションです。

## 主な機能

- 国内（日本地図）／海外（世界地図）のワンタップ切り替え
- マウスホイール／ピンチによるズーム・ドラッグでのパン操作
- 訪問日が1件以上ある都道府県・国を自動で色分け表示
- 訪問数・訪問率のステータス表示
- 地域ごとの訪問日管理（複数追加・削除）
- 【食事】【観光】【買い物】【宿泊】の4ジャンルタブでスポットを記録
  - 訪問日 / スポット名 / Google マップ URL / 感想メモ / 価格感

## 技術スタック

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- lucide-react（アイコン）
- react-simple-maps（地図描画・ズーム/パン）
- localStorage（将来 Supabase / Firebase 等へ移行しやすい Repository パターンで抽象化）

## セットアップ

```bash
npm install
npm run dev
```

`http://localhost:3000` で起動します。

## 地図データの準備

`public/geo/` に以下の GeoJSON を配置してください（詳細は `public/geo/README.md` 参照）。

- `public/geo/japan-prefectures.json`
- `public/geo/world-countries.json`

## ディレクトリ構成

```
app/                 Next.js App Router（画面）
  layout.tsx
  page.tsx           メイン画面（地図＋モード切替）
  globals.css
components/
  RegionModal.tsx     地域詳細モーダル（訪問日・スポット一覧）
  SpotForm.tsx        スポット追加フォーム
lib/
  repository/
    travelLogRepository.ts  データ永続化（localStorage実装）
types/
  travel.ts           型定義
public/geo/           地図GeoJSONデータ配置場所
```

## データの永続化について

現状は `localStorage` で完結する実装ですが、`ITravelLogRepository` インターフェースを
実装したクラスに差し替えるだけで Supabase / Firebase 等へ移行できる構造にしています。

## 今後の拡張候補

- IndexedDB への移行（データ量増加時）
- Supabase 等バックエンドとの連携（複数端末同期）
- 訪問地域の年別・月別フィルタリング
- CSVエクスポート機能

## ライセンス

MIT
