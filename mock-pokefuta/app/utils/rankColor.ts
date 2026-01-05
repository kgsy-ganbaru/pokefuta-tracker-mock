export function getRankClass(rank: string) {
  switch (rank) {
    case "S":
      return "pft-rank-s";
    case "A":
      return "pft-rank-a";
    case "B":
      return "pft-rank-b";
    case "C":
      return "pft-rank-c";
    case "I":
      return "pft-rank-i";
    default:
      return "pft-rank-default";
  }
}
