import { registerAction } from "../../actions/auth";
import RegisterForm from "./RegisterForm";
import PageBackLink from "../../components/PageBackLink";

export default function RegisterPage() {
  return (
    <main className="max-w-md mx-auto p-6">
      <PageBackLink href="/account" label="ログインに戻る" />
      <h2 className="mb-4 mt-3 text-lg font-semibold">新規登録</h2>

      <RegisterForm action={registerAction} />

    </main>
  );
}
