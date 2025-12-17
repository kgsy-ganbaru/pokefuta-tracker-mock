export type RecentGet = {
  id: number;
  pokemonNames: string[];
  address: string;
  gotAt?: string; // あってもなくてもOK
};

export const recentGets: RecentGet[] = [
  {
    id: 1,
    pokemonNames: ["ピカチュウ", "イーブイ"],
    address: "北海道〇〇市〇〇町1-2-3",
    gotAt: "2025-12-01",
  },
  {
    id: 2,
    pokemonNames: ["ヤドン"],
    address: "青森県〇〇市〇〇町4-5-6",
    gotAt: "2025-11-28",
  },
];
