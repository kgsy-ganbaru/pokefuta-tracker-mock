import { Suspense } from "react";
import EditClient from "./EditClient";

export default function EditPage() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>読み込み中...</div>}>
      <EditClient />
    </Suspense>
  );
}