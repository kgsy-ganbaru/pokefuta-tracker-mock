"use client";

export default function SignupButton() {
  return (
    <button
      type="button"
      onClick={() => alert("新規登録は次に実装")}
      className="w-full mt-2 py-2 rounded border hover:bg-gray-50"
    >
      新規登録
    </button>
  );
}