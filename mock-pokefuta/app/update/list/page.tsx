import { Suspense } from "react";
import ListClient from "./ListClient";

export default function ListPage() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>読み込み中...</div>}>
      <ListClient />
    </Suspense>
  );
}
