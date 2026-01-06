export default function BoardPage() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <img
            src="/status-any-owned-pokeball.svg"
            alt=""
            aria-hidden="true"
            className="w-5 h-5"
          />
          <span>掲示板</span>
          <img
            src="/status-any-owned-pokeball.svg"
            alt=""
            aria-hidden="true"
            className="w-5 h-5"
          />
        </h2>
        <p className="text-sm text-gray-500">
          現在は準備中です。今後、掲示板機能を追加予定です。
        </p>
      </header>

      <section className="rounded-lg border bg-white p-4">
        <p className="text-sm text-gray-700">今後機能追加予定です。</p>
      </section>
    </main>
  );
}
