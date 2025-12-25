// app/page.tsx（Server Component）
import HomeClient from "./components/HomeClient";
import { pool } from "./lib/db";

export default async function Page() {
  /* =====================
     最近ゲット（ownership 起点）
  ===================== */
  const recentRes = await pool.query(`
SELECT
  p.id AS pokefuta_id,
  p.address,
  p.image_url,
  STRING_AGG(DISTINCT pp.pokemon_name, ' / ' ORDER BY pp.pokemon_name) AS pokemon_names,
  STRING_AGG(DISTINCT u.username, ', ' ORDER BY u.username) AS user_names,
  MAX(o.updated_at) AS last_get_at
FROM ownership o
JOIN pokefuta p
  ON p.id = o.pokefuta_id
JOIN pokefuta_pokemon pp
  ON pp.pokefuta_id = p.id
JOIN users u
  ON u.id = o.user_id
GROUP BY
  p.id,
  p.address
ORDER BY
  last_get_at DESC
LIMIT 5;


  `);

  /* =====================
     一覧用ポケふた
     （今は北海道のみでもOK）
  ===================== */
  const pokefutaRes = await pool.query(`
SELECT
  p.id,
  p.region_id,
  p.prefecture_order,
  p.address,
  p.difficulty_code,
  p.image_url,
  COALESCE(
    STRING_AGG(pp.pokemon_name, ' / ' ORDER BY pp.display_order),
    ''
  ) AS pokemon_names,
  COALESCE(o.owned_count, 0) AS owned_count
FROM pokefuta p
LEFT JOIN pokefuta_pokemon pp
  ON pp.pokefuta_id = p.id
LEFT JOIN (
  SELECT
    pokefuta_id,
    SUM(count) AS owned_count
  FROM ownership
  WHERE user_id = 1
  GROUP BY pokefuta_id
) o
  ON o.pokefuta_id = p.id
GROUP BY
  p.id,
  p.region_id,
  p.prefecture_order,
  p.address,
  p.difficulty_code,
  o.owned_count
ORDER BY
  p.region_id,
  p.prefecture_order;


  `);

  return (
    <HomeClient
      recentRows={recentRes.rows}
      pokefutaRows={pokefutaRes.rows}
    />
  );
}
