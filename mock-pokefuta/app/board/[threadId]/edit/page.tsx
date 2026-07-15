import { notFound } from "next/navigation";
import { PokefutaRow } from "../../../lib/pokefuta/listData";
import { BoardItem, boardThreads } from "../../mockThreads";
import BoardPostEditClient from "./BoardPostEditClient";

export default async function BoardPostEditPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  const thread = boardThreads.find((item) => item.id === threadId);
  if (!thread?.isMine) notFound();

  const allItems = new Map<string, BoardItem>();
  boardThreads.flatMap((item) => [...item.offers, ...item.wants]).forEach((item) => allItems.set(item.id, item));
  const offerKeys = new Set(thread.offers.map((item) => item.id));
  const entries = [...allItems.entries()];
  const idByKey = new Map(entries.map(([key], index) => [key, index + 1]));
  const rows: PokefutaRow[] = entries.map(([key, item], index) => ({
    id: index + 1,
    region_id: (index % 7) + 1,
    prefecture_id: index + 1,
    prefecture_order: 1,
    city_name: item.city,
    difficulty_code: "B",
    image_url: item.image,
    pokemon_names: item.pokemon,
    owned_count: offerKeys.has(key) || index % 3 !== 0 ? 1 : 0,
    any_owned_count: 1,
  }));

  const selectedIds = (items: BoardItem[]) => items.flatMap((item) => {
    const id = idByKey.get(item.id);
    return id ? [id] : [];
  });
  return <BoardPostEditClient threadId={thread.id} rows={rows} initialOffers={selectedIds(thread.offers)} initialWants={selectedIds(thread.wants)} />;
}
