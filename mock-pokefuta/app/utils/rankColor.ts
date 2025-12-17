export function getRankClass(rank: string) {
  switch (rank) {
    case "S":
      return "bg-purple-600 text-white";
    case "A":
      return "bg-orange-500 text-white";
    case "B":
      return "bg-blue-500 text-white";
    case "C":
      return "bg-gray-400 text-white";
    case "I":
      return "bg-green-500 text-white";
    default:
      return "bg-gray-300 text-gray-800";
  }
}
