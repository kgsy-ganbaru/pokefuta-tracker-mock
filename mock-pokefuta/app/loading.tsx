export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 text-gray-900 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <span
          aria-hidden="true"
          className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
        />
        <p className="text-sm font-medium">画面を読み込み中…</p>
      </div>
    </div>
  );
}
