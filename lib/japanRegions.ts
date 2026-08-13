// 日本の8地方区分マスタデータ（ユーザーによる変更は不可・固定仕様）
//
// 注意: ここでの都道府県コードは "JP-01" 〜 "JP-47"（JIS X0401の2桁コードに
// "JP-" を付与した形式）を前提にしている。地図データ（public/geo/japan-prefectures.json）
// の properties.code もこの形式に合わせておくこと。異なる形式（ISOコード等）を
// 使う場合は、このファイルの code を実際のGeoJSONに合わせて修正してください。

export interface Prefecture {
  code: string;
  name: string;
}

export interface Chihou {
  key: string;
  name: string;
  prefectures: Prefecture[];
}

function pref(twoDigitCode: string, name: string): Prefecture {
  return { code: `JP-${twoDigitCode}`, name };
}

export const JAPAN_CHIHOU: Chihou[] = [
  {
    key: "hokkaido",
    name: "北海道",
    prefectures: [pref("01", "北海道")],
  },
  {
    key: "tohoku",
    name: "東北",
    prefectures: [
      pref("02", "青森県"),
      pref("03", "岩手県"),
      pref("04", "宮城県"),
      pref("05", "秋田県"),
      pref("06", "山形県"),
      pref("07", "福島県"),
    ],
  },
  {
    key: "kanto",
    name: "関東",
    prefectures: [
      pref("08", "茨城県"),
      pref("09", "栃木県"),
      pref("10", "群馬県"),
      pref("11", "埼玉県"),
      pref("12", "千葉県"),
      pref("13", "東京都"),
      pref("14", "神奈川県"),
    ],
  },
  {
    key: "chubu",
    name: "中部",
    prefectures: [
      pref("15", "新潟県"),
      pref("16", "富山県"),
      pref("17", "石川県"),
      pref("18", "福井県"),
      pref("19", "山梨県"),
      pref("20", "長野県"),
      pref("21", "岐阜県"),
      pref("22", "静岡県"),
      pref("23", "愛知県"),
    ],
  },
  {
    key: "kinki",
    name: "近畿",
    prefectures: [
      pref("24", "三重県"),
      pref("25", "滋賀県"),
      pref("26", "京都府"),
      pref("27", "大阪府"),
      pref("28", "兵庫県"),
      pref("29", "奈良県"),
      pref("30", "和歌山県"),
    ],
  },
  {
    key: "chugoku",
    name: "中国",
    prefectures: [
      pref("31", "鳥取県"),
      pref("32", "島根県"),
      pref("33", "岡山県"),
      pref("34", "広島県"),
      pref("35", "山口県"),
    ],
  },
  {
    key: "shikoku",
    name: "四国",
    prefectures: [
      pref("36", "徳島県"),
      pref("37", "香川県"),
      pref("38", "愛媛県"),
      pref("39", "高知県"),
    ],
  },
  {
    key: "kyushu_okinawa",
    name: "九州・沖縄",
    prefectures: [
      pref("40", "福岡県"),
      pref("41", "佐賀県"),
      pref("42", "長崎県"),
      pref("43", "熊本県"),
      pref("44", "大分県"),
      pref("45", "宮崎県"),
      pref("46", "鹿児島県"),
      pref("47", "沖縄県"),
    ],
  },
];

export const JAPAN_TOTAL_PREFECTURES = JAPAN_CHIHOU.reduce(
  (sum, c) => sum + c.prefectures.length,
  0
); // 47

export function findChihouByPrefectureCode(code: string): Chihou | undefined {
  return JAPAN_CHIHOU.find((c) => c.prefectures.some((p) => p.code === code));
}
