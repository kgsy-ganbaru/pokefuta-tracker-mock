import { registerAction } from "../../actions/auth";
import RegisterForm from "./RegisterForm";
import PageBackLink from "../../components/PageBackLink";

export default function RegisterPage() {
  return (
    <main className="max-w-md mx-auto p-6">
      <PageBackLink href="/account" label="ログインに戻る" />
      <h2 className="mb-4 mt-3 text-lg font-semibold">新規登録</h2>

      <p className="mb-4 text-sm leading-6 text-gray-600">管理者から共有された招待コードを入力して登録してください。</p>

      <RegisterForm action={registerAction} />

    </main>
  );
}
