export type BoardItem = { id: string; city: string; pokemon: string; image: string };
export type BoardComment = { id: string; user: { id: string; nickname: string }; body: string; postedAt: string; isMine?: boolean };

export type BoardThread = {
  id: string;
  user: { id: string; nickname: string; friendCode: string | null };
  offers: BoardItem[];
  wants: BoardItem[];
  comment: string;
  updatedAt: string;
  expiresAt: string;
  closedAt: string | null;
  comments: BoardComment[];
  isMine: boolean;
};

const images = ["/status-owned.svg", "/status-any-owned.svg", "/status-any-owned-pokeball.svg"];
const future = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

export const boardThreads: BoardThread[] = [
  {
    id: "thread-1", user: { id: "demo-user", nickname: "デモユーザー", friendCode: "SW-1234-5678-9012" },
    offers: [
      { id: "sapporo", city: "札幌", pokemon: "アローラロコン", image: images[0] },
      { id: "otaru", city: "小樽", pokemon: "ロコン", image: images[1] },
      { id: "yokohama", city: "横浜", pokemon: "ピカチュウ", image: images[2] },
      { id: "kanazawa", city: "金沢", pokemon: "ミロカロス", image: images[0] },
      { id: "kobe", city: "神戸", pokemon: "ベイリーフ", image: images[1] },
    ],
    wants: [
      { id: "sendai", city: "仙台", pokemon: "ラプラス", image: images[2] },
      { id: "morioka", city: "盛岡", pokemon: "イシツブテ", image: images[0] },
      { id: "kagoshima", city: "指宿", pokemon: "イーブイ", image: images[1] },
    ],
    comment: "郵送交換を希望しています。交換条件はコメントで相談させてください。",
    updatedAt: "2026/07/15 01:25", expiresAt: future(5), closedAt: null, isMine: true,
    comments: [
      { id: "comment-1", user: { id: "satoshi", nickname: "サトシ" }, body: "仙台のラプラスを持っています。札幌との交換は可能ですか？", postedAt: "2026/07/15 09:20" },
      { id: "comment-2", user: { id: "demo-user", nickname: "デモユーザー" }, body: "ありがとうございます。ぜひ交換をお願いします！", postedAt: "2026/07/15 09:35" },
    ],
  },
  {
    id: "thread-2", user: { id: "satoshi", nickname: "サトシ", friendCode: "SW-9876-5432-1098" },
    offers: [
      { id: "sendai", city: "仙台", pokemon: "ラプラス", image: images[2] },
      { id: "fukushima", city: "福島", pokemon: "ラッキー", image: images[0] },
    ],
    wants: [
      { id: "sapporo", city: "札幌", pokemon: "アローラロコン", image: images[0] },
      { id: "otaru", city: "小樽", pokemon: "ロコン", image: images[1] },
      { id: "yokohama", city: "横浜", pokemon: "ピカチュウ", image: images[2] },
      { id: "kanazawa", city: "金沢", pokemon: "ミロカロス", image: images[0] },
      { id: "kumamoto", city: "熊本", pokemon: "ダダリン", image: images[1] },
      { id: "nara", city: "斑鳩", pokemon: "エンテイ", image: images[2] },
    ],
    comment: "状態を確認してから交換内容を決めたいです。お気軽にコメントください。",
    updatedAt: "2026/07/14 22:40", expiresAt: future(1), closedAt: null, isMine: false,
    comments: [{ id: "comment-3", user: { id: "kasumi", nickname: "カスミ" }, body: "小樽のロコンを希望しています。", postedAt: "2026/07/15 08:10" }],
  },
  {
    id: "thread-3", user: { id: "demo-user", nickname: "デモユーザー", friendCode: "SW-1234-5678-9012" },
    offers: [{ id: "yokohama", city: "横浜", pokemon: "ピカチュウ", image: images[2] }],
    wants: [
      { id: "kobe", city: "神戸", pokemon: "ベイリーフ", image: images[1] },
      { id: "sendai", city: "仙台", pokemon: "ラプラス", image: images[2] },
    ],
    comment: "交換相手が見つかったため募集を終了しました。",
    updatedAt: "2026/07/10 18:10", expiresAt: future(-1), closedAt: "2026/07/12 10:00", isMine: true,
    comments: [],
  },
];

export const isThreadActive = (thread: BoardThread) => !thread.closedAt && new Date(thread.expiresAt).getTime() > Date.now();
export const remainingDays = (thread: BoardThread) => Math.max(0, Math.ceil((new Date(thread.expiresAt).getTime() - Date.now()) / 86_400_000));
