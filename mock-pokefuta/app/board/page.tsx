const threads = [
  {
    id: "thread-1",
    offer: {
      image: "/status-any-owned-pokeball.svg",
      city: "札幌",
    },
    want: "GO産色ダークライの提案を募集しています。",
    updatedAt: "2026/01/11 02:02",
    replies: 21,
  },
  {
    id: "thread-2",
    offer: {
      image: "/status-any-owned-pokeball.svg",
      city: "仙台",
    },
    want: "未移動ゼラオラ他、色伝の提案を希望します。",
    updatedAt: "2026/01/11 02:02",
    replies: 127,
  },
  {
    id: "thread-3",
    offer: {
      image: "/status-any-owned-pokeball.svg",
      city: "横浜",
    },
    want: "ホゲータ or クワッスと交換希望です。",
    updatedAt: "2026/01/11 02:01",
    replies: 1,
  },
  {
    id: "thread-4",
    offer: {
      image: "/status-any-owned-pokeball.svg",
      city: "金沢",
    },
    want: "提案内容をコメントでお願いします。",
    updatedAt: "2026/01/11 02:01",
    replies: 6,
  },
  {
    id: "thread-5",
    offer: {
      image: "/status-any-owned-pokeball.svg",
      city: "熊本",
    },
    want: "親名指定可能色ダダリン希望の提案募集。",
    updatedAt: "2026/01/11 02:00",
    replies: 17,
  },
];

export default function BoardPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="space-y-3">
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
          掲示板で交換希望のスレッドを作成・閲覧できます。
        </p>
      </header>

      <section className="rounded-xl border bg-white p-4 space-y-4 shadow-sm">
        <button
          type="button"
          className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          スレッドを作成する
        </button>

        <ul className="divide-y divide-gray-200">
          {threads.map((thread) => (
            <li key={thread.id} className="py-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-16 shrink-0 rounded-lg border border-emerald-100 bg-emerald-50 p-2 text-center">
                  <img
                    src={thread.offer.image}
                    alt=""
                    aria-hidden="true"
                    className="mx-auto h-8 w-8"
                  />
                  <p className="mt-2 text-xs font-semibold text-emerald-700">
                    {thread.offer.city}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-800">モトム</p>
                  <p className="text-sm text-gray-600">{thread.want}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>最終投稿日: {thread.updatedAt}</span>
                <span className="flex items-center gap-1">
                  <span aria-hidden="true">💬</span>
                  {thread.replies}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
