import PasswordResetForm from "../PasswordResetForm";

export default function ResetPasswordPage() {
  return <main className="mx-auto max-w-md space-y-5 p-6"><header><h1 className="text-xl font-semibold text-gray-800">新しいパスワード</h1><p className="mt-2 text-sm leading-6 text-gray-600">8文字以上の新しいパスワードを設定してください。</p></header><PasswordResetForm /></main>;
}

