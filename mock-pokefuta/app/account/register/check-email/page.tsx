import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <section className="rounded-2xl border border-emerald-100 bg-white p-6 text-center shadow-sm">
        <div className="text-4xl" aria-hidden="true">✉️</div>
        <h1 className="mt-4 text-xl font-semibold text-gray-800">確認メールを送りました</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">メール内のリンクを開くと登録が完了します。届かない場合は迷惑メールフォルダも確認してください。</p>
        <Link href="/account" className="pft-primary-button mt-5 inline-flex rounded-lg px-5 py-3 font-semibold">ログイン画面へ</Link>
      </section>
    </main>
  );
}

