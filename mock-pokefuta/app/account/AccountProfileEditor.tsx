"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
import type { AuthProfile } from "../lib/supabase/auth";
import {
  updateProfileAction,
  type UpdateProfileState,
} from "../actions/auth";

type AccountProfileEditorProps = {
  user: AuthProfile;
};

const initialState: UpdateProfileState = {
  error: undefined,
  success: false,
  nickname: undefined,
  comment: undefined,
};

export default function AccountProfileEditor({
  user,
}: AccountProfileEditorProps) {
  const router = useRouter();
  const [nickname, setNickname] = useState(user.nickname);
  const [comment, setComment] = useState(user.comment ?? "");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [baseNickname, setBaseNickname] = useState(user.nickname);
  const [baseComment, setBaseComment] = useState(user.comment ?? "");

  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState
  );

  useEffect(() => {
    setNickname(user.nickname);
    setComment(user.comment ?? "");
    setBaseNickname(user.nickname);
    setBaseComment(user.comment ?? "");
  }, [user.comment, user.nickname]);

  useEffect(() => {
    if (state.success) {
      const nextNickname = state.nickname ?? nickname;
      const nextComment = state.comment ?? comment;
      setNickname(nextNickname);
      setComment(nextComment);
      setBaseNickname(nextNickname);
      setBaseComment(nextComment);
      setIsEditingNickname(false);
      router.refresh();
    }
  }, [
    comment,
    nickname,
    router,
    state.comment,
    state.nickname,
    state.success,
  ]);

  const isDirty = useMemo(() => {
    return nickname !== baseNickname || comment !== baseComment;
  }, [baseComment, baseNickname, comment, nickname]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <p className="text-sm text-gray-500">ニックネーム</p>
        {isEditingNickname ? (
          <input
            type="text"
            name="nickname"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="nickname"
          />
        ) : (
          <>
            <p className="mt-1 text-base font-medium text-gray-900">
              {nickname}
            </p>
            <input type="hidden" name="nickname" value={nickname} />
          </>
        )}
        <div className="mt-3">
          <p className="text-sm text-gray-500">ユーザID</p>
          <p className="mt-1 text-base font-medium text-gray-900">
            {user.user_id}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsEditingNickname((prev) => !prev)}
        className="w-full rounded border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        {isEditingNickname ? "ニックネーム変更をやめる" : "ニックネーム変更する"}
      </button>

      <div>
        <label className="text-sm font-medium text-gray-700">
          コメント
          <textarea
            name="comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={200}
            className="mt-2 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </label>
        <p className="mt-1 text-right text-xs text-gray-500">
          {comment.length}/200
        </p>
      </div>

      {state.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-green-600">更新しました。</p>
      ) : null}

      {isDirty ? (
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          更新
        </button>
      ) : null}
    </form>
  );
}
