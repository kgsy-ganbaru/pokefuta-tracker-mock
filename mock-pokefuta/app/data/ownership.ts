export type Ownership = {
  user: string;
  count: number;
};
export const ownershipMap: Record<number, Ownership[]> = {
  1: [
    { user: "seiya", count: 3 },
    { user: "satoshi", count: 2 },
  ],
  2: [
    { user: "seiya", count: 1 },
    { user: "satoshi", count: 2 },
  ],
};
