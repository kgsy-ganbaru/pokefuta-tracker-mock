// app/pokefuta/[id]/page.tsx
import { pool } from "@/app/lib/db";
import DetailClient from "./DetailClient";

type PokefutaDetail = {
  id: number;
  address: string;
  difficulty_code: string;
  image_url: string | null;
  pokemon_names: string[];
};

type OwnerRow = {
  nickname: string;
  count: number;
};

export default async function PokefutaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ★ ここが重要
  const { id } = await params;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return <p className="p-4">不正なIDです</p>;
  }

  /* =====================
     ポケふた + ポケモン名
  ===================== */
  const pokefutaRes = await pool.query<PokefutaDetail>(
    `
    SELECT
      p.id,
      p.address,
      p.difficulty_code,
      p.image_url,
      COALESCE(
        array_agg(pp.pokemon_name ORDER BY pp.pokemon_name)
        FILTER (WHERE pp.pokemon_name IS NOT NULL),
        '{}'
      ) AS pokemon_names
    FROM pokefuta p
    LEFT JOIN pokefuta_pokemon pp
      ON pp.pokefuta_id = p.id
    WHERE p.id = $1
    GROUP BY p.id
    `,
    [numericId]
  );

  if (pokefutaRes.rowCount === 0) {
    return <p className="p-4">該当するポケふたが見つかりません</p>;
  }

  /* =====================
     所持ユーザ一覧
  ===================== */
  const ownersRes = await pool.query<OwnerRow>(
    `
    SELECT
      u.nickname,
      o.count
    FROM ownership o
    JOIN users u ON u.id = o.user_id
    WHERE o.pokefuta_id = $1
    ORDER BY o.count DESC
    `,
    [numericId]
  );

  return (
    <DetailClient
      pokefuta={pokefutaRes.rows[0]}
      owners={ownersRes.rows}
    />
  );
}
