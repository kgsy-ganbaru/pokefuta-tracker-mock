import Link from "next/link";
import { registerAction } from "../../actions/auth";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <main className="max-w-md mx-auto p-6">
      <h2 className="text-lg font-semibold mb-4">新規登録</h2>

      <RegisterForm action={registerAction} />

      <Link
        href="/account"
        className="block w-full mt-2 py-2 rounded border text-center hover:bg-gray-50"
      >
        ログインに戻る
      </Link>
    </main>
  );
}
