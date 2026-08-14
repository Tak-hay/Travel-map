# 旅行ログ・白地図塗りつぶし

旅行で訪れた場所を、インタラクティブな白地図（日本：都道府県単位 / 世界：国単位）の
塗りつぶしとともに記録・管理できる Web アプリケーションです。

## 主な機能

- 国内（日本地図）／海外（世界地図）のワンタップ切り替え
- マウスホイール／ピンチによるズーム・ドラッグでのパン操作
- 訪問日が1件以上ある都道府県・国を自動で色分け表示（新規訪問地域には控えめなアニメーション）
- 国内モード：全国達成率 ＋ 8地方別の達成率（折りたたみ式）、「あと○県」表示、地方制覇時の達成演出
- 地域ごとの訪問日管理（複数追加・削除）
- 【食事】【観光】【買い物】【宿泊】の4ジャンルタブでスポットを記録・編集・削除（削除は確認ダイアログあり）
- スポット追加時に地域の既存訪問日をワンタップ選択可能（新しい日付は地域側にも自動反映）
- アプリ全体からのスポット検索（国内／海外・カテゴリー・キーワードで絞り込み）
- 旅行データのJSONエクスポート／インポート

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

### 重要：地方別達成率について

国内モードの「地方別達成度」機能は、都道府県コードが **`JP-01` 〜 `JP-47`**
（JIS X0401の2桁コードに `JP-` を付与した形式）であることを前提にしています。

`public/geo/japan-prefectures.json` の各 feature の `properties.code` は、
必ずこの形式に合わせてください（例：東京都なら `JP-13`）。異なるコード体系の
GeoJSONを使う場合は `lib/japanRegions.ts` の `code` を実際のデータに合わせて
修正してください。合わない場合、地図の色分け自体は正常に動作しますが、地方別の
達成率は正しく集計されません。

## ディレクトリ構成

```
app/                        Next.js App Router（画面）
  layout.tsx
  page.tsx                  メイン画面（地図＋モード切替＋達成率＋検索＋データ管理）
  globals.css                アニメーション定義を含むグローバルCSS
components/
  RegionModal.tsx            地域詳細モーダル（訪問日・スポット一覧・編集・削除確認）
  SpotForm.tsx                スポット追加/編集フォーム（既存訪問日のクイック選択つき）
  DomesticProgress.tsx        全国達成率＋地方別達成度（折りたたみ式）
  SpotSearchPanel.tsx         アプリ全体のスポット検索パネル
  DataManagement.tsx          JSONエクスポート／インポートUI
  AchievementToast.tsx        地方制覇などの控えめな達成通知
lib/
  repository/
    travelLogRepository.ts    データ永続化（localStorage実装・検索・Export/Import・マイグレーション）
  regionKey.ts                 国内／海外の地域コード衝突を防ぐ内部キー生成
  japanRegions.ts              日本の8地方区分マスタデータ（固定仕様）
  domesticStats.ts             地方別達成率の計算ロジック
  useGeoFeatureCount.ts        GeoJSONの実際の地域数を取得するフック
types/
  travel.ts                    型定義
public/geo/                    地図GeoJSONデータ配置場所
```

## データの永続化について

`ITravelLogRepository` インターフェースを実装したクラスに差し替えるだけで
Supabase / Firebase 等へ移行できる構造を維持しています。検索・エクスポート・
インポートも含め、コンポーネントは必ず Repository 経由でデータを読み書きします。

### 内部キーとマイグレーション

Repository内部では、国内／海外で地域コードが衝突しないよう `${mode}:${regionCode}`
（例：`domestic:JP-13`）を地域データのキーとして保存しています。旧バージョン
（`regionCode` のみをキーにしていた形式）のデータが検出された場合は、アプリ起動時に
自動的に新しい形式へマイグレーションされ、既存の訪問日・スポット情報は失われません。

## 今後の拡張候補

- IndexedDB への移行（データ量増加時）
- Supabase 等バックエンドとの連携（複数端末同期）
- 訪問地域の年別・月別フィルタリング
- CSV / GPXエクスポート機能

## ライセンス

## データ出典

- 日本地図データ: 地球地図日本 (国土地理院) / [dataofjapan/land](https://github.com/dataofjapan/land) を加工して使用
- 世界地図データ: Natural Earth (Public Domain)

MIT
