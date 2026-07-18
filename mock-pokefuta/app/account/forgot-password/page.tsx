import PageBackLink from "../../components/PageBackLink";
import { requestPasswordResetAction } from "../../actions/auth";
import AuthEmailForm from "../AuthEmailForm";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto max-w-md space-y-5 p-6">
      <PageBackLink href="/account" label="ログインに戻る" />
      <header><h1 className="text-xl font-semibold text-gray-800">パスワード再設定</h1><p className="mt-2 text-sm leading-6 text-gray-600">登録したメールアドレスへ再設定用のリンクを送ります。</p></header>
      <AuthEmailForm action={requestPasswordResetAction} label="再設定メールを送る" pendingLabel="送信中…" />
    </main>
  );
}

