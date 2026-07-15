import { SupabaseClient } from "@supabase/supabase-js";
import { formatPokemonNames } from "../lib/pokefuta/listData";
import { BoardComment, BoardItem, BoardThread } from "./mockThreads";

type PostRow = { id: string; user_id: string; comment: string | null; expires_at: string; closed_at: string | null; updated_at: string };
type UserRow = { id: string; user_id: string; nickname: string; friend_code: string | null };
type SelectionRow = { post_id: string; pokefuta_id: number };
type PokefutaRecord = { id: number; city_name: string; image_url: string | null; pokefuta_pokemon: { pokemon_name: string; display_order: number | null }[] | null };
type CommentRow = { id: string; post_id: string; user_id: string; body: string; created_at: string };

const displayDate = (value: string) => new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));

export async function fetchBoardThreads(supabase: SupabaseClient, currentUserId: string | null, options: { includeClosed?: boolean; ownerOnly?: boolean; threadId?: string } = {}): Promise<BoardThread[]> {
  let postsQuery = supabase.from("board_posts").select("id, user_id, comment, expires_at, closed_at, updated_at").order("updated_at", { ascending: false });
  if (!options.includeClosed) postsQuery = postsQuery.is("closed_at", null).gt("expires_at", new Date().toISOString());
  if (options.ownerOnly && currentUserId) postsQuery = postsQuery.eq("user_id", currentUserId);
  if (options.threadId) postsQuery = postsQuery.eq("id", options.threadId);
  const { data: postData, error } = await postsQuery;
  if (error) throw error;
  const posts = (postData ?? []) as PostRow[];
  if (!posts.length) return [];
  const postIds = posts.map((row) => row.id);

  const [offerResult, wantResult, commentResult] = await Promise.all([
    supabase.from("board_post_offers").select("post_id, pokefuta_id").in("post_id", postIds),
    supabase.from("board_post_wants").select("post_id, pokefuta_id").in("post_id", postIds),
    supabase.from("board_comments").select("id, post_id, user_id, body, created_at").in("post_id", postIds).order("created_at", { ascending: true }),
  ]);
  if (offerResult.error) throw offerResult.error;
  if (wantResult.error) throw wantResult.error;
  if (commentResult.error) throw commentResult.error;
  const offers = (offerResult.data ?? []) as SelectionRow[];
  const wants = (wantResult.data ?? []) as SelectionRow[];
  const comments = (commentResult.data ?? []) as CommentRow[];
  const userIds = [...new Set([...posts.map((row) => row.user_id), ...comments.map((row) => row.user_id)])];
  const pokefutaIds = [...new Set([...offers, ...wants].map((row) => row.pokefuta_id))];
  const userResult = await supabase.from("users").select("id, user_id, nickname, friend_code").in("id", userIds);
  if (userResult.error) throw userResult.error;
  const pokefutaResult = pokefutaIds.length
    ? await supabase.from("pokefuta").select("id, city_name, image_url, pokefuta_pokemon (pokemon_name, display_order)").in("id", pokefutaIds)
    : { data: [] as PokefutaRecord[], error: null };
  if (pokefutaResult.error) throw pokefutaResult.error;
  const users = new Map(((userResult.data ?? []) as UserRow[]).map((row) => [row.id, row]));
  const pokefuta = new Map(((pokefutaResult.data ?? []) as PokefutaRecord[]).map((row) => [Number(row.id), row]));
  const toItem = (selection: SelectionRow): BoardItem | null => {
    const row = pokefuta.get(Number(selection.pokefuta_id));
    return row ? { id: String(row.id), city: row.city_name, pokemon: formatPokemonNames(row.pokefuta_pokemon), image: row.image_url || "/no-image.png" } : null;
  };
  const itemsFor = (rows: SelectionRow[], postId: string) => rows.filter((row) => row.post_id === postId).map(toItem).filter((item): item is BoardItem => item !== null);
  const commentsFor = (postId: string): BoardComment[] => comments.filter((row) => row.post_id === postId).map((row) => { const user = users.get(row.user_id); return { id: row.id, user: { id: user?.user_id ?? row.user_id, nickname: user?.nickname ?? "ユーザー" }, body: row.body, postedAt: displayDate(row.created_at), isMine: currentUserId === row.user_id }; });

  return posts.map((post) => {
    const user = users.get(post.user_id);
    return { id: post.id, user: { id: user?.user_id ?? post.user_id, nickname: user?.nickname ?? "ユーザー", friendCode: user?.friend_code ?? null }, offers: itemsFor(offers, post.id), wants: itemsFor(wants, post.id), comment: post.comment ?? "", updatedAt: displayDate(post.updated_at), expiresAt: post.expires_at, closedAt: post.closed_at, comments: commentsFor(post.id), isMine: currentUserId === post.user_id };
  });
}
