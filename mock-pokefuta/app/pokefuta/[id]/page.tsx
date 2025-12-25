// app/pokefuta/[id]/page.tsx

import { pool } from "@/app/lib/db";
import DetailClient from "./DetailClient";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function PokefutaDetailPage({
  params,
}: PageProps) {
  const id = Number(params.id);

  if (Number.isNaN(id)) {
    return <div className="p-4">不正なIDです</div>;
  }

  // ✅ Server Componentなので await OK
  const res = await pool.query(
    `
    SELECT
      id,
      address,
      difficulty
    FROM pokefuta
    WHERE id = $1
    `,
    [id]
  );

  if (res.rows.length === 0) {
    return (
      <main className="p-4">
        <p>該当するポケふたが見つかりません。</p>
      </main>
    );
  }

  const pokefuta = res.rows[0];

  return <DetailClient pokefuta={pokefuta} />;
}