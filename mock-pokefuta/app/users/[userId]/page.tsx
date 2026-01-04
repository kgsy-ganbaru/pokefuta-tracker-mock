import Link from "next/link";

type UserDetailPageProps = {
  params: { userId: string };
};

export default function UserDetailPage({ params }: UserDetailPageProps) {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <header className="mb-6">
        <p className="text-sm text-gray-500">ユーザーID：{params.userId}</p>
        <h2 className="text-xl font-semibold text-gray-800">
          ユーザーのポケフタ状況
        </h2>
        <p className="text-sm text-gray-500">
          現在は準備中です。今後、所持しているポケフタの状況を表示します。
        </p>
      </header>

      <section className="rounded-lg border bg-white p-4">
        <p className="text-sm text-gray-700">今後機能追加予定です。</p>
      </section>

      <Link
        href="/users"
        className="inline-flex items-center mt-6 text-sm text-blue-600 hover:underline"
      >
        ユーザー一覧に戻る
      </Link>
    </main>
  );
}
