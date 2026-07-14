"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const TITLE_MAX_LENGTH = 50;
const BODY_MAX_LENGTH = 500;

export default function NewBoardThreadPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-2">
        <Link
          href="/board"
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 transition hover:text-emerald-800"
        >
          <span aria-hidden="true">←</span>
          掲示板に戻る
        </Link>
        <h2 className="text-xl font-semibold text-gray-800">
          新しいスレッドを作成
        </h2>
        <p className="text-sm text-gray-500">
          交換したいポケふたや条件を入力してください。
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-white p-5 shadow-sm"
      >
        <div className="space-y-2">
          <label htmlFor="thread-title" className="text-sm font-semibold text-gray-800">
            タイトル <span className="text-red-600">必須</span>
          </label>
          <input
            id="thread-title"
            name="title"
            type="text"
            required
            maxLength={TITLE_MAX_LENGTH}
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setSubmitted(false);
            }}
            placeholder="例：札幌のポケふたと交換希望"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <p className="text-right text-xs text-gray-500">
            {title.length} / {TITLE_MAX_LENGTH}
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="offer" className="text-sm font-semibold text-gray-800">
            提供できるポケふた
          </label>
          <input
            id="offer"
            name="offer"
            type="text"
            placeholder="例：横浜・ピカチュウ"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <p className="text-xs text-gray-500">
            複数ある場合は、投稿内容に詳しく記入してください。
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="wanted" className="text-sm font-semibold text-gray-800">
            求めているポケふた
          </label>
          <input
            id="wanted"
            name="wanted"
            type="text"
            placeholder="例：札幌・アローラロコン"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="thread-body" className="text-sm font-semibold text-gray-800">
            投稿内容 <span className="text-red-600">必須</span>
          </label>
          <textarea
            id="thread-body"
            name="body"
            required
            rows={8}
            maxLength={BODY_MAX_LENGTH}
            value={body}
            onChange={(event) => {
              setBody(event.target.value);
              setSubmitted(false);
            }}
            placeholder="交換条件や受け渡し方法などを入力してください。"
            className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <p className="text-right text-xs text-gray-500">
            {body.length} / {BODY_MAX_LENGTH}
          </p>
        </div>

        {submitted && (
          <div
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            入力内容を受け付けました。現在はモックのため、投稿は保存されません。
          </div>
        )}

        <div className="rounded-lg bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-500">
          個人情報や交換に不要な連絡先は投稿しないでください。
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/board"
            className="rounded-lg border border-gray-300 px-5 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            className="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
          >
            投稿内容を確認する
          </button>
        </div>
      </form>
    </main>
  );
}
