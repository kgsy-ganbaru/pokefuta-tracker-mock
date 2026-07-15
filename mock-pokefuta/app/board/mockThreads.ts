export type BoardItem = {
  id: string;
  city: string;
  pokemon: string;
  image: string;
  count: number;
};

export type BoardThread = {
  id: string;
  user: { id: string; nickname: string };
  status: "募集中" | "交渉中";
  offers: BoardItem[];
  wants: BoardItem[];
  comment: string;
  updatedAt: string;
  replies: number;
};

const images = [
  "/status-owned.svg",
  "/status-any-owned.svg",
  "/status-any-owned-pokeball.svg",
];

export const boardThreads: BoardThread[] = [
  {
    id: "thread-1",
    user: { id: "seiya", nickname: "セイヤ" },
    status: "募集中",
    offers: [
      { id: "sapporo", city: "札幌", pokemon: "アローラロコン", image: images[0], count: 3 },
      { id: "otaru", city: "小樽", pokemon: "ロコン", image: images[1], count: 2 },
      { id: "yokohama", city: "横浜", pokemon: "ピカチュウ", image: images[2], count: 1 },
      { id: "kanazawa", city: "金沢", pokemon: "ミロカロス", image: images[0], count: 2 },
      { id: "kobe", city: "神戸", pokemon: "ベイリーフ", image: images[1], count: 1 },
    ],
    wants: [
      { id: "sendai", city: "仙台", pokemon: "ラプラス", image: images[2], count: 2 },
      { id: "morioka", city: "盛岡", pokemon: "イシツブテ", image: images[0], count: 1 },
      { id: "kagoshima", city: "指宿", pokemon: "イーブイ", image: images[1], count: 3 },
    ],
    comment: "現地交換を希望しています。日程や交換場所はコメントで相談させてください。複数枚まとめて交換できる方を優先します。",
    updatedAt: "2026/07/15 01:25",
    replies: 6,
  },
  {
    id: "thread-2",
    user: { id: "satoshi", nickname: "サトシ" },
    status: "交渉中",
    offers: [
      { id: "sendai", city: "仙台", pokemon: "ラプラス", image: images[2], count: 4 },
      { id: "fukushima", city: "福島", pokemon: "ラッキー", image: images[0], count: 2 },
    ],
    wants: [
      { id: "sapporo", city: "札幌", pokemon: "アローラロコン", image: images[0], count: 1 },
      { id: "otaru", city: "小樽", pokemon: "ロコン", image: images[1], count: 1 },
      { id: "yokohama", city: "横浜", pokemon: "ピカチュウ", image: images[2], count: 2 },
      { id: "kanazawa", city: "金沢", pokemon: "ミロカロス", image: images[0], count: 1 },
      { id: "kumamoto", city: "熊本", pokemon: "ダダリン", image: images[1], count: 1 },
      { id: "nara", city: "斑鳩", pokemon: "エンテイ", image: images[2], count: 1 },
    ],
    comment: "郵送交換を希望します。状態を確認してから交換内容を決めたいです。",
    updatedAt: "2026/07/14 22:40",
    replies: 12,
  },
  {
    id: "thread-3",
    user: { id: "kasumi", nickname: "カスミ" },
    status: "募集中",
    offers: [
      { id: "yokohama", city: "横浜", pokemon: "ピカチュウ", image: images[2], count: 5 },
    ],
    wants: [
      { id: "kobe", city: "神戸", pokemon: "ベイリーフ", image: images[1], count: 2 },
      { id: "sendai", city: "仙台", pokemon: "ラプラス", image: images[2], count: 1 },
    ],
    comment: "横浜周辺での手渡し、または郵送で交換できます。お気軽にコメントください。",
    updatedAt: "2026/07/14 18:10",
    replies: 2,
  },
];

export const totalSheets = (items: BoardItem[]) =>
  items.reduce((sum, item) => sum + item.count, 0);
