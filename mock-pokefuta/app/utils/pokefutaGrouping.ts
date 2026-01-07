import { PokefutaRow } from "../lib/pokefuta/listData";

export const REGION_LABELS: Record<number, string> = {
  1: "北海道・東北",
  2: "関東",
  3: "中部",
  4: "近畿",
  5: "中国・四国",
  6: "九州・沖縄",
};

export const REGION_ORDER = Object.keys(REGION_LABELS).map(Number);

export const PREFECTURE_LABELS: Record<number, string> = {
  1: "北海道",
  2: "青森県",
  3: "岩手県",
  4: "宮城県",
  5: "秋田県",
  6: "山形県",
  7: "福島県",
  8: "茨城県",
  9: "栃木県",
  10: "埼玉県",
  11: "千葉県",
  12: "東京都",
  13: "神奈川県",
  14: "群馬県",
  15: "新潟県",
  16: "富山県",
  17: "石川県",
  18: "福井県",
  19: "岐阜県",
  20: "静岡県",
  21: "愛知県",
  22: "山梨県",
  23: "長野県",
  24: "三重県",
  25: "滋賀県",
  26: "京都府",
  27: "大阪府",
  28: "兵庫県",
  29: "奈良県",
  30: "和歌山県",
  31: "鳥取県",
  32: "島根県",
  33: "岡山県",
  34: "山口県",
  35: "徳島県",
  36: "香川県",
  37: "愛媛県",
  38: "高知県",
  39: "広島県",
  40: "福岡県",
  41: "佐賀県",
  42: "長崎県",
  43: "宮崎県",
  44: "鹿児島県",
  45: "沖縄県",
  46: "熊本県",
  47: "大分県",
};

export const PREFECTURE_IDS_BY_REGION_ID: Record<number, number[]> = {
  1: [1, 2, 3, 4, 5, 6, 7],
  2: [8, 9, 10, 11, 12, 13, 14],
  3: [15, 16, 17, 18, 19, 20, 21, 22, 23],
  4: [24, 25, 26, 27, 28, 29, 30],
  5: [31, 32, 33, 34, 35, 36, 37, 38, 39],
  6: [40, 41, 42, 43, 44, 45, 46, 47],
};

export function getPrefectureName(prefectureId: number | null) {
  if (!prefectureId) return "未設定";
  return PREFECTURE_LABELS[prefectureId] ?? `都道府県${prefectureId}`;
}

type RegionSection = {
  regionId: number;
  rows: PokefutaRow[];
  rowsByPrefectureId: Map<number, PokefutaRow[]>;
  prefectureIdsToRender: number[];
};

export function buildRegionSections(
  pokefutaRows: PokefutaRow[]
): RegionSection[] {
  return REGION_ORDER.map((regionId) => {
    const rows = pokefutaRows.filter(
      (row) => row.region_id === regionId
    );
    const rowsByPrefectureId = rows.reduce(
      (acc, row) => {
        const prefectureId = row.prefecture_id ?? 0;
        if (!acc.has(prefectureId)) {
          acc.set(prefectureId, []);
        }
        acc.get(prefectureId)?.push(row);
        return acc;
      },
      new Map<number, PokefutaRow[]>()
    );
    rowsByPrefectureId.forEach((prefectureRows) => {
      prefectureRows.sort(
        (a, b) =>
          (a.prefecture_order ?? Number.MAX_SAFE_INTEGER) -
          (b.prefecture_order ?? Number.MAX_SAFE_INTEGER)
      );
    });
    const orderedPrefectureIds =
      PREFECTURE_IDS_BY_REGION_ID[regionId] ?? [];
    const extraPrefectureIds = Array.from(
      rowsByPrefectureId.keys()
    )
      .filter((id) => !orderedPrefectureIds.includes(id))
      .sort((a, b) => a - b);
    const prefectureIdsToRender = [
      ...orderedPrefectureIds,
      ...extraPrefectureIds,
    ].filter((id) => rowsByPrefectureId.has(id));

    return {
      regionId,
      rows,
      rowsByPrefectureId,
      prefectureIdsToRender,
    };
  });
}
