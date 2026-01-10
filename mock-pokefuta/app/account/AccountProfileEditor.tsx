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
  friendCode: undefined,
};

export default function AccountProfileEditor({
  user,
}: AccountProfileEditorProps) {
  const router = useRouter();
  const [nickname, setNickname] = useState(user.nickname);
  const [comment, setComment] = useState(user.comment ?? "");
  const [friendCode, setFriendCode] = useState(
    user.friend_code ?? ""
  );
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [baseNickname, setBaseNickname] = useState(user.nickname);
  const [baseComment, setBaseComment] = useState(user.comment ?? "");
  const [baseFriendCode, setBaseFriendCode] = useState(
    user.friend_code ?? ""
  );

  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState
  );

  useEffect(() => {
    setNickname(user.nickname);
    setComment(user.comment ?? "");
    setFriendCode(user.friend_code ?? "");
    setBaseNickname(user.nickname);
    setBaseComment(user.comment ?? "");
    setBaseFriendCode(user.friend_code ?? "");
  }, [user.comment, user.friend_code, user.nickname]);

  useEffect(() => {
    if (state.success) {
      const nextNickname = state.nickname ?? nickname;
      const nextComment = state.comment ?? comment;
      const nextFriendCode = state.friendCode ?? friendCode;
      setNickname(nextNickname);
      setComment(nextComment);
      setFriendCode(nextFriendCode);
      setBaseNickname(nextNickname);
      setBaseComment(nextComment);
      setBaseFriendCode(nextFriendCode);
      setIsEditingNickname(false);
      router.refresh();
    }
  }, [
    comment,
    friendCode,
    nickname,
    router,
    state.comment,
    state.friendCode,
    state.nickname,
    state.success,
  ]);

  const isDirty = useMemo(() => {
    return (
      nickname !== baseNickname ||
      comment !== baseComment ||
      friendCode !== baseFriendCode
    );
  }, [
    baseComment,
    baseFriendCode,
    baseNickname,
    comment,
    friendCode,
    nickname,
  ]);

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

      <div>
        <label className="text-sm font-medium text-gray-700">
          フレンドコード
          <input
            type="text"
            name="friendCode"
            value={friendCode}
            onChange={(event) => setFriendCode(event.target.value)}
            maxLength={12}
            placeholder="例: ZETMBEMUBRKW"
            className="mt-2 w-full rounded border px-3 py-2 text-sm uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
            inputMode="text"
            autoComplete="off"
          />
        </label>
        <p className="mt-1 text-right text-xs text-gray-500">
          {friendCode.replace(/\s+/g, "").length}/12
        </p>
      </div>

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

      <button
        type="button"
        onClick={() => setIsEditingNickname((prev) => !prev)}
        className="w-full py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-70"
      >
        {isEditingNickname ? "ニックネーム変更をやめる" : "ニックネーム変更する"}
      </button>
    </form>
  );
}
